import { Check, ChevronDown, ChevronUp, Play, Printer, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BackButton, ChapterIcon, ChevronRight, ProgressBar } from "../components/ui";
import { ExerciseActions } from "../components/ExerciseActions";
import { lessonFor } from "../content/lessons";
import { PROPRIETES_CI } from "../content/cours-ci";
import { PROPRIETES_CIAM } from "../content/proprietes-ciam";
import { levelById, notionById } from "../curriculum";
import { problemesFor } from "../content/problemes-situes";
import { buildDrill, hasContent, taskOf } from "../engine";
import { etapesFor } from "../content/etapes";
import { attemptsOf, itemsFor, notionPercent, SKILL_GOAL, SKILL_ROUND, skillProgress, skillsFor } from "../lib/stats";
import { canAccessNotion, currentUser, MASTERY_LABEL, masteryFor, recommendation, useStore } from "../store";
import { createExerciseAssignment } from "../lib/exerciseAssignments";

export default function NotionPage({ studentId }: { studentId?: string } = {}) {
  const { id = "", notionId } = useParams();
  const notionKey = notionId ?? id;
  const notion = notionById(notionKey);
  const state = useStore();
  const viewer = currentUser(state)!;
  const me = studentId ? state.users.find((u) => u.id === studentId) : viewer;
  const [open, setOpen] = useState(true);
  const [assignmentBusy, setAssignmentBusy] = useState<string | null>(null);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);
  const skills = skillsFor(notionKey);
  const sampleStatements = useMemo(
    () => new Map(skills.map((skill) => {
      const task = buildDrill(skill.templateId, 1)[0];
      return [skill.templateId, task ? taskOf(task).inst.statement : ""];
    })),
    [notionKey],
  );
  if (!me || !notion || !(hasContent(notionKey) || lessonFor(notionKey)) || !canAccessNotion(me, notion)) return <Navigate to="/exercices" replace />;

  const mine = attemptsOf(state, me.id);
  const m = masteryFor(state, me.id, notionKey);
  const lesson = lessonFor(notionKey);
  // Propriétés du manuel de la classe quand il est disponible ; sinon celles du programme.
  const ciam = (PROPRIETES_CIAM[notion.level]?.chapitres ?? []).filter((c) => c.notionId === notionKey);
  const proprietes: { titre: string; enonce: string; page?: string }[] = ciam.length
    ? ciam.flatMap((c) => c.items)
    : Object.values(PROPRIETES_CI).flat().filter((c) => c.notionId === notionKey).flatMap((c) => c.items);
  const items = itemsFor(notionKey);
  const pct = notionPercent(mine, notionKey);
  const canAssign = viewer.role === "parent" && !!studentId && me.parentId === viewer.id;
  const returnPath = studentId ? `/enfant/${studentId}/exercices` : "/exercices";
  const seriesUrl = (templateId: string, assignmentId?: string) =>
    `/serie/${encodeURIComponent(notionKey)}?t=${encodeURIComponent(templateId)}&drill=1&n=${SKILL_ROUND}${assignmentId ? `&assignment=${encodeURIComponent(assignmentId)}` : ""}`;
  const assignSkill = async (templateId: string, title: string) => {
    if (!canAssign || !studentId) return;
    setAssignmentBusy(templateId);
    setAssignmentMessage(null);
    const error = await createExerciseAssignment({ parentId: viewer.id, studentId, notionId: notionKey, templateId, title });
    setAssignmentMessage(error ?? `Série de ${SKILL_ROUND} exercices assignée à ${me.name}.`);
    setAssignmentBusy(null);
  };

  return (
    <main className="shell no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <BackButton to={returnPath} />
        <span className="muted" style={{ fontWeight: 700 }}>{levelById(notion.level).label} • {notion.chapter}</span>
      </div>

      <section className="hero-card" aria-labelledby="notion-title">
        <span className="icon-tile" style={{ background: "#fff", color: "var(--navy)", width: 72, height: 72 }}><ChapterIcon chapter={notion.chapter} size={32} /></span>
        <div className="grow stack-sm">
          <h1 id="notion-title" style={{ color: "#fff", fontSize: "1.5rem" }}>{notion.title}</h1>
          <p style={{ color: "rgba(255, 255, 255, .95)", fontWeight: 600 }}>{skills.length} compétence{skills.length > 1 ? "s" : ""} • {skills.filter((sk) => skillProgress(mine, sk.templateId).mastered).length} maîtrisée{skills.filter((sk) => skillProgress(mine, sk.templateId).mastered).length > 1 ? "s" : ""} • {MASTERY_LABEL[m.status]}</p>
          <ProgressBar value={pct} tone="onnavy" label="Progression" />
        </div>
      </section>
      {assignmentMessage && <p className={assignmentMessage.startsWith("Série") ? "callout" : "auth-error"} role={assignmentMessage.startsWith("Série") ? "status" : "alert"}>{assignmentMessage}</p>}
      <p className="muted" style={{ fontWeight: 600 }}>{recommendation(m.status)}</p>
      {items.length > 0 && !studentId && <Link to={`/sujet/notion/${encodeURIComponent(notionKey)}`} className="btn ghost block"><Printer size={20} aria-hidden="true" /> Imprimer une interrogation complète (situation + problèmes)</Link>}

      {!studentId && <nav className="row" aria-label="Aller plus loin" style={{ gap: 8 }}>
        <Link className="pill" to={`/cartes?notion=${encodeURIComponent(notionKey)}`}>Cartes mémoire</Link>
        <Link className="pill" to={`/rappel?notion=${encodeURIComponent(notionKey)}`}>Rappel actif</Link>
        <Link className="pill" to={`/tuteur?notion=${encodeURIComponent(notionKey)}`}>Tuteur</Link>
        {etapesFor(notionKey).map((e) => <Link key={e.id} className="pill yellow" to={`/etapes/${e.id}`}>Pas à pas : {e.title}</Link>)}
      </nav>}

      <section className="card lesson stack-sm">
        <h3 className="row" style={{ flexWrap: "nowrap" }}><Play size={20} aria-hidden="true" /> {lesson ? "Mini-cours" : "Cours"}</h3>
        {lesson ? (
          <>
            <p>{lesson.intro}</p>
            {open && (
              <>
                <ol>{lesson.steps.map((s) => <li key={s.title}><strong>{s.title}.</strong> {s.body}</li>)}</ol>
                <div className="callout"><strong>Exemple.</strong> {lesson.example.problem}<br />{lesson.example.solution}</div>
                {lesson.more?.map((e, k) => <div key={k} className="callout"><strong>Exemple {k + 2}.</strong> {e.problem}<br />{e.solution}</div>)}
                <p className="muted"><strong>Piège :</strong> {lesson.pitfalls}</p>
                {lesson.status === "draft" && !state.validated?.[notionKey] && <p className="draft-badge">Brouillon — en attente de validation par un enseignant</p>}
              </>
            )}
            <button className="btn link" style={{ justifyContent: "flex-start", padding: 0 }} aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <><ChevronUp size={18} aria-hidden="true" /> Réduire</> : <><ChevronDown size={18} aria-hidden="true" /> Voir le cours en entier</>}
            </button>
          </>
        ) : (
          <p className="muted">Le cours de cette notion est en cours de rédaction (brouillon IA, relu par un enseignant avant publication). Tu peux déjà t'entraîner.</p>
        )}
      </section>

      {proprietes.length > 0 && (
        <details className="card stack-sm" aria-labelledby="props" open>
          <summary id="props" style={{ cursor: "pointer", fontWeight: 800 }}>Propriétés et règles à retenir ({proprietes.length})</summary>
          {proprietes.map((p) => (
            <div key={p.titre} className="prop"><h3>{p.titre}</h3><p>{p.enonce}</p></div>
          ))}
        </details>
      )}

      {problemesFor(notionKey).length > 0 && (
        <section className="stack-sm" aria-labelledby="pb-title">
          <h2 id="pb-title">Problèmes de situation</h2>
          <p className="muted small" style={{ marginTop: -8 }}>Un énoncé complet, puis des questions qui s'enchaînent. Les valeurs changent à chaque essai.</p>
          {problemesFor(notionKey).map((pb) => (
            <div key={pb.id} className="card" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div className="grow"><strong>{pb.titre}</strong><div className="muted small">{pb.contexteLabel} • difficulté {pb.difficulte}/3</div></div>
              {canAssign
                ? <ExerciseActions title={pb.titre} url={`/probleme/${encodeURIComponent(pb.id)}?seed=1`} />
                : <Link className="btn primary" to={`/probleme/${encodeURIComponent(pb.id)}`}>Résoudre</Link>}
            </div>
          ))}
        </section>
      )}

      {items.length === 0 ? (
        <p className="callout">Les exercices de ce chapitre arrivent bientôt. Lis le cours et retiens les propriétés en attendant.</p>
      ) : <>
      <h2>Compétences à maîtriser</h2>
      <p className="muted small" style={{ marginTop: -8 }}>
        Chaque compétence se travaille par séries de {SKILL_ROUND} exercices (valeurs et situations différentes). Elle est maîtrisée quand tu réussis {SKILL_GOAL} exercices sur {SKILL_ROUND} du premier coup, sans indice.
      </p>
      <div className="stack-sm">
        {skills.map((sk) => {
          const pr = skillProgress(mine, sk.templateId);
          const sampleStatement = sampleStatements.get(sk.templateId) ?? "";
          return (
            <div key={sk.templateId} className="card" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`step-ic${pr.mastered ? " done" : ""}`}>{pr.mastered ? <Check size={22} aria-hidden="true" /> : <Target size={22} aria-hidden="true" />}</span>
              <div className="grow" style={{ minWidth: 200 }}>
                <h3>{sk.label}</h3>
                <p className="small exercise-sample"><b>Exemple d’exercice :</b> {sampleStatement}</p>
                <div className="exercise-print-answer" aria-hidden="true" />
                <div aria-hidden="true" style={{ display: "flex", gap: 4, margin: "6px 0" }}>
                  {Array.from({ length: SKILL_ROUND }, (_, k) => {
                    const r = pr.results[k];
                    return <span key={k} style={{ width: 12, height: 12, borderRadius: 6, background: r === undefined ? "var(--line, #c9ced8)" : r ? "var(--green, #2e9e5b)" : "var(--red, #d6455d)", display: "inline-block" }} />;
                  })}
                </div>
                <p className="muted small" style={{ fontWeight: 600 }}>
                  {pr.mastered ? "Maîtrisée" : pr.started ? `${pr.ok} réussi${pr.ok > 1 ? "s" : ""} sans aide sur ${Math.min(pr.results.length, SKILL_ROUND)} • objectif ${SKILL_GOAL}/${SKILL_ROUND}` : "Pas encore commencée"} • difficulté {sk.difficulty}/3
                </p>
                {sk.ref && <p className="muted small">Travaillé dans : {sk.ref}</p>}
              </div>
              {canAssign ? (
                <div className="exercise-skill-tools">
                  <button type="button" className="btn primary" disabled={assignmentBusy !== null} onClick={() => void assignSkill(sk.templateId, sk.label)}>
                    {assignmentBusy === sk.templateId ? "Envoi…" : `Assigner à ${me.name}`}
                  </button>
                  <ExerciseActions title={`${sk.label} — ${notion.title}`} url={seriesUrl(sk.templateId)} />
                </div>
              ) : (
                <div className="exercise-skill-tools">
                  <Link className="btn primary" to={seriesUrl(sk.templateId)}>{pr.started ? `${SKILL_ROUND} de plus` : `${SKILL_ROUND} exercices`}</Link>
                  <ExerciseActions title={`${sk.label} — ${notion.title}`} url={seriesUrl(sk.templateId)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!canAssign && <>
        <Link className="btn primary block" to={`/serie/${encodeURIComponent(notionKey)}`}>S'entraîner sur mes points faibles</Link>
        <Link className="btn ghost block" to={`/controle/${encodeURIComponent(notionKey)}`}>Ai-je vraiment compris ?</Link>
      </>}
      </>}
    </main>
  );
}
