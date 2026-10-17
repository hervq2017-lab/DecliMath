import { Check, Heart, Lightbulb, Medal, RotateCw, Sparkles, Target, Trophy, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { ExerciseActions } from "../components/ExerciseActions";
import { NotebookGate, useNotebook, WrittenCheck } from "../components/Notebook";
import { ProgressBar, StreakChip } from "../components/ui";
import { Answer, checkAnswer, parseNumeric } from "../content/core";
import { diagnose } from "../content/erreurs";
import { lessonFor } from "../content/lessons";
import { levelById, notionById, serieOfNotion } from "../curriculum";
import { buildChallenge, buildDrill, buildSession, Task, taskOf } from "../engine";
import { dueLabel, recordAttempt } from "../lib/knowledge";
import { completeExerciseAssignment, refreshExerciseAssignments } from "../lib/exerciseAssignments";
import { playFeedback } from "../lib/sound";
import { attemptsOf, notionTitle, SKILL_GOAL, SKILL_ROUND, skillProgress, streak } from "../lib/stats";
import { canAccessNotion, canViewSolution, currentUser, modeFor, uid, update, useStore } from "../store";

type Phase = "answer" | "feedback" | "correction" | "done";
type Kind = "ok" | "near" | "bad";
interface Result { ok: boolean; pts: number; retried: boolean }

/** « Presque » : réponse numérique à moins de 15 % de la bonne, ou au signe près. */
function isNear(a: Answer, input: string) {
  if (a.kind !== "number" || a.value === 0) return false;
  const n = parseNumeric(input);
  if (!Number.isFinite(n)) return false;
  return Math.abs(n + a.value) < 1e-9 || Math.abs(n - a.value) / Math.abs(a.value) <= 0.15;
}

/** Une nouvelle série (autre compétence ou « 10 de plus ») repart de zéro : on recrée l'écran quand l'adresse change. */
export default function Session() {
  const loc = useLocation();
  return <SessionInner key={loc.pathname + loc.search} />;
}

function SessionInner() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const state = useStore();
  const me = currentUser(state)!;
  const nav = useNavigate();
  const isChallenge = id === "defi";
  const notion = isChallenge ? null : notionById(id);
  const drillId = params.has("assignment") ? params.get("t") : params.get("drill") ? params.get("t") : null; // série de 10 sur une seule compétence

  const tasks: Task[] = useMemo(() => {
    const mine = attemptsOf(state, me.id);
    if (isChallenge) return buildChallenge(mine, "maths", me.level ?? "tle");
    if (drillId) return buildDrill(drillId, params.has("assignment") ? SKILL_ROUND : Number(params.get("n")) || SKILL_ROUND);
    const t = params.get("t"), c = params.get("c");
    return buildSession(mine, id, t && c ? { templateId: t, ctx: c } : undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [input, setInput] = useState("");
  const [hints, setHints] = useState(0);
  const [tries, setTries] = useState(0);
  const [kind, setKind] = useState<Kind>("ok");
  const [results, setResults] = useState<Result[]>([]);
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);
  const [written, setWritten] = useState(false);
  const [assignmentSyncError, setAssignmentSyncError] = useState<string | null>(null);
  const completionStarted = useRef(false);
  const busy = useRef(false); // évite la double soumission (Entrée répétée, double clic)
  const nb = useNotebook();
  const assignmentId = params.get("assignment");

  useEffect(() => {
    if (assignmentId) void refreshExerciseAssignments(me.id, "student").then(setAssignmentSyncError);
  }, [assignmentId, me.id]);
  useEffect(() => {
    if (phase !== "done" || !assignmentId || completionStarted.current) return;
    if (!state.exerciseAssignments.some((assignment) =>
      assignment.id === assignmentId
      && assignment.studentId === me.id
      && assignment.templateId === drillId
      && assignment.notionId === id
    )) return;
    completionStarted.current = true;
    void completeExerciseAssignment(assignmentId, me.id).then(setAssignmentSyncError);
  }, [assignmentId, me.id, phase, state.exerciseAssignments]);

  if (!tasks.length || (!isChallenge && (!notion || !canAccessNotion(me, notion)))) return <Navigate to="/exercices" replace />;
  if (!nb.ready) return <NotebookGate onReady={nb.confirm} back={() => nav(-1)} />;

  const mode = modeFor(state, me.id);
  const t = tasks[i];
  const { tpl, inst } = taskOf(t);
  const tNotion = notionById(tpl.notionId)!;
  const back = isChallenge ? "/" : `/notion/${encodeURIComponent(id)}`;
  const mineNow = attemptsOf(state, me.id);


  function validate() {
    if (!input.trim() || phase !== "answer" || busy.current || (nb.need && !written)) return;
    busy.current = true;
    const ok = checkAnswer(inst.answer, input);
    const near = !ok && isNear(inst.answer, input);
    const aid = uid();
    recordAttempt({
      id: aid, studentId: me.id, templateId: tpl.id, notionId: tpl.notionId, ctx: t.ctx, seed: t.seed, correct: ok, near,
      helpLevel: hints, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice",
      given: input, errTag: ok ? undefined : diagnose(inst.answer, input, inst.statement) ?? undefined,
    });
    setLastAttempt(aid);
    setTries((n) => n + 1);
    setKind(ok ? "ok" : near ? "near" : "bad");
    playFeedback(ok ? "ok" : near ? "near" : "bad", me.prefs?.sounds);
    setPhase("feedback");
  }

  function finishTask(ok: boolean, viewed: boolean) {
    const pts = ok ? (viewed ? 10 : 20) : kind === "near" ? 10 : 0;
    const next = [...results, { ok, pts, retried: tries > 1 }];
    setResults(next);
    busy.current = false;
    setInput(""); setHints(0); setTries(0); setLastAttempt(null); setWritten(false);
    if (i + 1 >= tasks.length) setPhase("done");
    else { setI(i + 1); setPhase("answer"); }
  }

  function showCorrection() {
    if (!canViewSolution(mode, true)) return;
    update((s) => ({ ...s, attempts: s.attempts.map((a) => (a.id === lastAttempt ? { ...a, solutionViewed: true } : a)) }));
    setPhase("correction");
  }

  function retry() {
    busy.current = false;
    setInput("");
    setHints((h) => Math.min(4, Math.max(h, 0) + 1));
    setPhase("answer");
  }

  // ---------- Fin d'une révision espacée (3 exercices) ----------
  if (phase === "done" && params.get("rev")) {
    const good = results.filter((r) => r.ok).length;
    const next = state.memory[`${me.id}|s:${drillId}`];
    return (
      <div className="navy">
        <main className="shell no-nav stack center" style={{ paddingTop: 48 }}>
          <h1>Révision terminée</h1>
          <p className="lead">{good} réussi{good > 1 ? "s" : ""} sur {results.length}</p>
          <section className="card stack" style={{ background: "#fff", borderColor: "#fff", textAlign: "left" }}>
            <p>{next ? `Prochaine révision de cette compétence : ${dueLabel(next.due)}.` : "Ta révision est enregistrée."} {good < results.length ? "Elle reviendra plus vite pour que tu la consolides." : "Plus tu la réussis, plus elle s'espace : c'est le signe que tu la retiens."}</p>
            <Link className="btn primary block" to="/revision">Retour aux révisions</Link>
          </section>
        </main>
      </div>
    );
  }

  // ---------- Fin de série ----------
  if (phase === "done") {
    const good = results.filter((r) => r.ok).length;
    const pts = results.reduce((s, r) => s + r.pts, 0);
    const rebound = results.some((r) => r.ok && r.retried);
    const badge = good === results.length ? { n: "Sans faute", d: "Toute la série réussie du premier coup." }
      : rebound ? { n: "Rebond", d: "Tu as réessayé jusqu'à trouver." } : { n: "Courage", d: "Tu es allé(e) au bout de la série." };
    const weak = results.map((r, k) => ({ r, k })).find((x) => !x.r.ok);
    const strong = results.map((r, k) => ({ r, k })).find((x) => x.r.ok);
    const msg = weak && strong
      ? `Tu as progressé sur « ${notionTitle(taskOf(tasks[strong.k]).tpl.notionId)} ». « ${notionTitle(taskOf(tasks[weak.k]).tpl.notionId)} » t'attend quand tu veux.`
      : "Belle série ! Change de contexte pour vérifier que tu as vraiment compris.";
    const sk = drillId ? skillProgress(mineNow, drillId) : null;
    const skillName = drillId ? taskOf(tasks[0]).tpl.skill ?? tNotion.title : "";
    return (
      <div className="navy">
        <main className="shell no-nav stack center" style={{ paddingTop: 48 }}>
          <div className="hero-mark" style={{ margin: "0 auto" }}>{sk?.mastered ? <Target size={64} aria-hidden="true" /> : <Trophy size={64} aria-hidden="true" />}</div>
          <h1>{sk?.mastered ? "Compétence maîtrisée !" : "Série terminée !"}</h1>
          {assignmentId && <p className="lead">{assignmentSyncError ?? "Exercice assigné terminé."}</p>}
          <ExerciseActions
            title={`${tpl.skill ?? tNotion.title} — série de ${tasks.length} exercices`}
            url={`/serie/${encodeURIComponent(id)}?t=${encodeURIComponent(tpl.id)}&drill=1&n=${tasks.length}${assignmentId ? `&assignment=${encodeURIComponent(assignmentId)}` : ""}`}
          />
          <p className="lead">{good} bonne{good > 1 ? "s" : ""} réponse{good > 1 ? "s" : ""} • +{pts} pts d'effort</p>
          <section className="card stack" style={{ background: "#fff", borderColor: "#fff", textAlign: "left" }}>
            <div className="stats3">
              <div><b>+{pts}</b><span>Points</span></div>
              <div><b>{good}/{results.length}</b><span>Réussite</span></div>
              <div><b>{streak(mineNow)}</b><span>Série</span></div>
            </div>
            <div className="badge-card"><span className="icon-tile yellow sm"><Medal size={24} aria-hidden="true" /></span><div><h3>Badge : {badge.n}</h3><p>{badge.d}</p></div></div>
            {sk && (
              <div className="callout" role="status">
                <strong>{skillName}</strong>
                <div className="skill-dots" aria-label={`${sk.ok} réussis sur ${sk.results.length}`} style={{ display: "flex", gap: 6, margin: "8px 0" }}>
                  {sk.results.map((ok, k) => <span key={k} className={ok ? "dot ok" : "dot ko"} style={{ width: 14, height: 14, borderRadius: 7, background: ok ? "var(--green, #2e9e5b)" : "var(--red, #d6455d)", display: "inline-block" }} />)}
                </div>
                {sk.mastered
                  ? <p>Bravo : {sk.ok} sur {sk.results.length} réussis du premier coup, sans indice. Cette compétence est maîtrisée.</p>
                  : <p>{sk.ok} sur {Math.min(sk.results.length, SKILL_ROUND)} réussis du premier coup et sans indice. Il en faut {SKILL_GOAL} sur {SKILL_ROUND} pour maîtriser la compétence : refais une série de {SKILL_ROUND} nouveaux exercices.</p>}
              </div>
            )}
            <div className="deck"><span className="icon-tile sm"><Lightbulb size={22} aria-hidden="true" /></span><p>Déclic te dit : « {msg} »</p></div>
            <button className="btn primary block" onClick={() => nav(0)}>{sk ? (sk.mastered ? `${SKILL_ROUND} exercices de plus pour consolider` : `Refaire ${SKILL_ROUND} nouveaux exercices`) : "Continuer ma série"}</button>
            <Link className="btn link" to={back}>{sk ? "Retour aux compétences" : "Revoir mes erreurs sans pression"}</Link>
          </section>
        </main>
      </div>
    );
  }

  // ---------- Correction pas à pas ----------
  if (phase === "correction") {
    const lesson = lessonFor(tpl.notionId);
    const steps = [
      { t: "Ce qu'on cherche", d: inst.hints[0] },
      { t: "La méthode", d: inst.hints[2] },
      { t: "Le calcul", d: inst.solution },
    ];
    return (
      <main className="shell no-nav stack session">
        <div className="topline">
          <button className="icon-btn" aria-label="Retour au résultat" onClick={() => setPhase("feedback")}><X size={22} aria-hidden="true" /></button>
          <h1 style={{ fontSize: "1.5rem" }}>Correction pas à pas</h1>
        </div>
        <section className="card"><p className="statement">{inst.statement}</p></section>
        <ol className="stack-sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {steps.map((s, k) => (
            <li key={k} className="corr-step"><span className="n">{k + 1}</span><div><h3>{s.t}</h3><p style={{ whiteSpace: "pre-line" }}>{s.d}</p></div></li>
          ))}
        </ol>
        <section className="why"><span className="icon-tile yellow sm"><Lightbulb size={22} aria-hidden="true" /></span><div><h3>Pourquoi ça marche ?</h3><p>{lesson?.intro ?? inst.hints[1]}</p></div></section>
        <button className="btn primary block" onClick={() => finishTask(false, true)}>J'ai compris, exercice suivant</button>
      </main>
    );
  }

  // ---------- Question + retour ----------
  const answered = phase === "feedback";
  return (
    <main className="shell no-nav stack session">
      <div className="topline">
        <button className="icon-btn" aria-label="Quitter la série" onClick={() => nav(back)}><X size={22} aria-hidden="true" /></button>
        <ProgressBar value={((i + (answered && kind === "ok" ? 1 : 0)) / tasks.length) * 100} label="Avancement de la série" />
        <StreakChip n={streak(mineNow)} />
      </div>

      <section className="card stack">
        <p className="eyebrow">{subjectLabel(tNotion.subject)} · {levelById(tNotion.level).label}{serieOfNotion(tNotion) ?? (tNotion.level === me.level ? me.serie : undefined) ? ` · série ${serieOfNotion(tNotion) ?? me.serie}` : ""}</p>
        <p className="eyebrow">Exercice {i + 1} sur {tasks.length} — {drillId ? (tpl.skill ?? tNotion.title) : tNotion.title}</p>
        <p className="statement">{inst.statement}</p>
        <div className="exercise-print-answer" aria-hidden="true" />
        <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="pill">{tpl.contexts.find((c) => c.id === t.ctx)?.label}</span>
          {t.ctx === "pur" && <span className="pill yellow">Application directe</span>}
        </div>
      </section>
      <ExerciseActions
        title={`${tpl.skill ?? tNotion.title} — exercice ${i + 1}`}
        url={`/serie/${encodeURIComponent(id)}?t=${encodeURIComponent(tpl.id)}&drill=1&n=${SKILL_ROUND}${assignmentId ? `&assignment=${encodeURIComponent(assignmentId)}` : ""}`}
      />
      {assignmentSyncError && <p className="auth-error" role="alert">{assignmentSyncError}</p>}

      {!answered && (
        <>
          {nb.need && <WrittenCheck checked={written} onChange={setWritten} />}
          <AnswerInput answer={inst.answer} value={input} onChange={setInput} name={`s${i}`} onSubmit={validate} />
          {hints > 0 && (
            <div className="stack-sm">
              {inst.hints.slice(0, hints).map((h, k) => (
                <div key={k} className="tip" role="note"><Lightbulb size={22} aria-hidden="true" /><span>Astuce Déclic : {h}</span></div>
              ))}
            </div>
          )}
          <div className="actions">
            <button className="btn ghost" onClick={() => setHints((h) => Math.min(4, h + 1))} disabled={hints >= 4}><Lightbulb size={20} aria-hidden="true" /> Indice</button>
            <button className="btn primary" onClick={validate} disabled={!input.trim() || (nb.need && !written)}>Vérifier ma réponse</button>
          </div>
          <p className="muted small center">Une erreur est un indice, jamais une sanction.</p>
          <p className="center small" style={{ margin: 0 }}>
            <Link className="btn link" to={`/tuteur?t=${encodeURIComponent(tpl.id)}&c=${encodeURIComponent(t.ctx)}&s=${t.seed}`}>Je bloque : demander au tuteur</Link>
          </p>
        </>
      )}

      {answered && !drillId && !isChallenge && (
        <p className="center small" style={{ margin: 0 }}>
          <Link className="btn link" to={`/serie/${encodeURIComponent(tpl.notionId)}?t=${encodeURIComponent(tpl.id)}&drill=1`}><RotateCw size={16} aria-hidden="true" /> {SKILL_ROUND} exercices comme celui-ci, jusqu'à maîtriser</Link>
        </p>
      )}
      {answered && kind === "ok" && (
        <section className="fb ok" role="status">
          <header><span className="ic"><Check size={28} aria-hidden="true" /></span><div><h2>Bravo, déclic !</h2><p>Bonne réponse. L'ampoule s'allume.</p></div></header>
          <div className="recap"><span>Ta réponse : {answerText(inst.answer, input)}</span><small>+{hints > 0 ? 20 : 20} pts • Série : {streak(mineNow)} jour{streak(mineNow) > 1 ? "s" : ""}</small></div>
          <button className="btn green block" onClick={() => finishTask(true, false)}>Continuer</button>
        </section>
      )}
      {answered && kind === "near" && (
        <section className="fb near" role="status">
          <header><span className="ic"><Sparkles size={28} aria-hidden="true" /></span><div><h2>Presque !</h2><p>Tu y es presque : vérifie ton calcul ou ton signe.</p></div></header>
          <div className="recap"><span>Ta réponse : {answerText(inst.answer, input)}</span><small>+10 pts d'effort • Indice ciblé</small></div>
          {canViewSolution(mode, true) && <button className="btn yellow block" onClick={showCorrection}>Voir la correction</button>}
          <button className="btn ghost block" onClick={retry}>Réessayer avec un indice</button>
        </section>
      )}
      {answered && kind === "bad" && (
        <section className="fb bad" role="status">
          <header><span className="ic"><Heart size={26} aria-hidden="true" /></span><div><h2>Pas grave, on reprend.</h2><p>Erreur = indice. Relis l'énoncé et essaie avec un indice.</p></div></header>
          <div className="recap"><span>Ta réponse : {answerText(inst.answer, input)}</span><small>Zéro point perdu • On réessaie</small></div>
          <button className="btn primary block" onClick={retry}>Réessayer avec un indice</button>
          {tries >= 2 && canViewSolution(mode, true) && <button className="btn yellow block" onClick={showCorrection}>Voir la correction</button>}
          {tries >= 2 && !canViewSolution(mode, true) && <p className="small muted">Les corrigés sont bloqués par ton parent : utilise les indices ou passe à la suite.</p>}
          <button className="btn link" onClick={() => finishTask(false, false)}>Passer à l'exercice suivant</button>
          <Link className="btn link" to={`/tuteur?t=${encodeURIComponent(tpl.id)}&c=${encodeURIComponent(t.ctx)}&s=${t.seed}`}>Je bloque : demander au tuteur</Link>
        </section>
      )}
    </main>
  );
}

function subjectLabel(s: string) {
  return s === "maths" ? "Mathématiques" : s === "physique" ? "Physique-chimie" : s === "anglais" ? "Anglais" : s;
}

function answerText(a: Answer, v: string) {
  return a.kind === "choice" ? a.options[Number(v)] ?? "—" : v;
}
