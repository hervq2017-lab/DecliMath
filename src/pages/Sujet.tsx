import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { BackButton } from "../components/ui";
import { ExerciseActions } from "../components/ExerciseActions";
import { levelById, notionById, Subject } from "../curriculum";
import { hasContent } from "../engine";
import { buildPaper, Paper, PaperSpec } from "../paper";
import { acceptedStudentsOf, currentUser, update, useStore } from "../store";

const fmt = (n: number) => String(n).replace(".", ",");

function Lines({ n }: { n: number }) {
  return <div className="lines" aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i} />)}</div>;
}

export function Sheet({ paper, corrige }: { paper: Paper; corrige: boolean }) {
  const dur = paper.durationMin >= 60 ? `${Math.floor(paper.durationMin / 60)} h${paper.durationMin % 60 ? ` ${paper.durationMin % 60} min` : ""}` : `${paper.durationMin} min`;
  return (
    <article className="sheet" aria-label={corrige ? "Corrigé" : "Sujet"}>
      <header className="sheet-head">
        <p className="sheet-country">{paper.country}</p>
        <h1>{paper.title}{corrige ? " — CORRIGÉ" : ""}</h1>
        <p className="sheet-meta">{paper.subjectLabel} · {paper.levelLabel} · Durée : {dur} · Sur {paper.outOf}</p>
        {!corrige && <p className="sheet-id">Nom et prénoms : ………………………………………… Classe : ………… Date : …………………</p>}
      </header>

      <section className="sheet-box">
        <h2>Situation de départ</h2>
        <p><b>Contexte.</b> {paper.situation.contexte}</p>
        <p><b>Circonstance.</b> {paper.situation.circonstance}</p>
        <p><b>Tâche.</b> {paper.situation.tache}</p>
      </section>

      {paper.problems.map((p) => (
        <section key={p.title} className="sheet-problem">
          <h2>{p.title}{p.subtitle ? ` : ${p.subtitle}` : ""} <small>({fmt(p.questions.reduce((s, q) => s + q.points, 0))} pts)</small></h2>
          <p className="sheet-comp">{p.competence}</p>
          {p.enonce && <p className="sheet-enonce">{p.enonce}</p>}
          <p className="sheet-consigne"><b>Consigne.</b> {p.consigne}</p>
          {p.questions.map((q) => (
            <div key={q.n} className="sheet-q">
              <p><b>{q.n}</b> {q.text} <em>({fmt(q.points)} pt{q.points > 1 ? "s" : ""})</em></p>
              {q.choices && <ul className="sheet-choices">{q.choices.map((c, i) => <li key={i}>{String.fromCharCode(65 + i)}. {c}</li>)}</ul>}
              {corrige ? (
                <div className="sheet-corr"><p><b>Réponse :</b> {q.answer}</p><p>{q.solution}</p></div>
              ) : q.choices ? (
                <p className="sheet-ans">Réponse : …………</p>
              ) : (
                <><Lines n={4} /><p className="sheet-ans">Réponse : ………………………………{q.unit ? ` ${q.unit}` : ""}</p></>
              )}
            </div>
          ))}
        </section>
      ))}

      <section className="sheet-box">
        <h2>Présentation et rédaction <small>({paper.presentationPoints} pts)</small></h2>
        <p>Soin, clarté de la démarche, cohérence des réponses, unités et phrases de conclusion.</p>
        <p className="sheet-note">Barème proposé : {paper.outOf - paper.presentationPoints} points pour les problèmes, {paper.presentationPoints} points pour la présentation. À adapter selon les consignes de ton enseignant.</p>
      </section>
    </article>
  );
}

export const paperId = (studentId: string, spec: PaperSpec) => `${studentId}:${spec.kind}:${spec.notionId ?? `${spec.subject}-${spec.exam}`}:${spec.seed}`;

/** Élève : sujet à imprimer, jamais de corrigé. /sujet/notion/:id ou /sujet/examen/:subject/:kind */
export default function Sujet({ mode }: { mode: "notion" | "examen" }) {
  const { id = "", subject = "maths", kind = "level" } = useParams();
  const [qs, setQs] = useSearchParams();
  const state = useStore();
  const me = currentUser(state)!;
  const fallbackSeed = useMemo(() => 1 + Math.floor(Math.random() * 1e6), []);
  const seed = Number(qs.get("s")) || fallbackSeed;
  const level = me.level ?? "tle";
  const notion = mode === "notion" ? notionById(id) : undefined;

  const spec: PaperSpec | null = useMemo(() => {
    if (mode === "notion") return notion && hasContent(id) ? { kind: "interro", country: me.country, level: notion.level, subject: notion.subject, notionId: id, seed } : null;
    return { kind: "examen", country: me.country, level, subject: subject as Subject, exam: kind === "exit" ? "exit" : "level", seed };
  }, [mode, id, subject, kind, seed, me.country, level, notion]);
  const paper = useMemo(() => (spec ? buildPaper(spec) : null), [spec]);

  // on garde une trace du sujet pour que le parent retrouve le même corrigé
  useEffect(() => {
    if (!spec || !paper?.problems.length) return;
    const pid = paperId(me.id, spec);
    update((s) => (s.papers.some((p) => p.id === pid) ? s : { ...s, papers: [...s.papers, { id: pid, studentId: me.id, spec, ts: Date.now() }] }));
  }, [spec, paper, me.id]);

  if (!paper || !paper.problems.some((p) => p.questions.length)) return <Navigate to="/exercices" replace />;
  const back = mode === "notion" ? `/notion/${encodeURIComponent(id)}` : "/exercices";

  return (
    <main className="shell no-nav stack sujet-page">
      <div className="no-print stack">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <BackButton to={back} />
          <span className="muted" style={{ fontWeight: 700 }}>{levelById(level).label} · sujet à imprimer</span>
        </div>
        <section className="card stack-sm">
          <p>Imprime le sujet et compose-le sur feuille, comme en classe. Le corrigé complet est réservé à tes parents : montre-leur ta copie.</p>
          <div className="row">
            <button type="button" className="btn ghost" onClick={() => setQs({ s: String(1 + Math.floor(Math.random() * 1e6)) })}><RefreshCw size={18} aria-hidden="true" /> Autre sujet</button>
          </div>
          <ExerciseActions title={paper.title} url={`/sujet/${mode === "notion" ? `notion/${encodeURIComponent(id)}` : `examen/${subject}/${kind}`}?s=${seed}`} />
        </section>
      </div>
      <Sheet paper={paper} corrige={false} />
    </main>
  );
}

/** Parent : le même sujet avec le corrigé. /enfant/:id/sujet/:paperId */
export function SujetParent() {
  const { id = "", paperId: pid = "" } = useParams();
  const state = useStore();
  const me = currentUser(state)!;
  const rec = state.papers.find((p) => p.id === decodeURIComponent(pid) && p.studentId === id);
  const [corrige, setCorrige] = useState(true);
  const allowed = me.role === "admin" || acceptedStudentsOf(state, me.id).some((c) => c.id === id);
  const paper = useMemo(() => (rec ? buildPaper(rec.spec) : null), [rec]);
  if (!allowed || !rec || !paper) return <Navigate to={`/enfant/${id}/sujets`} replace />;
  return (
    <main className="shell no-nav stack sujet-page">
      <div className="no-print stack">
        <BackButton to={`/enfant/${id}/sujets`} />
        <section className="card stack-sm">
          <p>Corrigé type complet, avec toutes les réponses et les démarches. Réservé aux parents.</p>
          <div className="row">
            <button type="button" className="btn ghost" aria-pressed={corrige} onClick={() => setCorrige(!corrige)}>{corrige ? "Voir le sujet seul" : "Voir le corrigé"}</button>
          </div>
          <ExerciseActions title={paper.title} url={window.location.pathname} message={`Sujet à consulter sur DeclickMath : ${paper.title}`} />
        </section>
      </div>
      <Sheet paper={paper} corrige={corrige} />
    </main>
  );
}
