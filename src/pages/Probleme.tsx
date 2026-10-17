import { Check, Heart, Lightbulb, Trophy, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { NotebookGate, useNotebook, WrittenCheck } from "../components/Notebook";
import { ExerciseActions } from "../components/ExerciseActions";
import { ProgressBar } from "../components/ui";
import { Answer, checkAnswer, parseNumeric } from "../content/core";
import { instancierProbleme, problemeById, QuestionPb, Statut } from "../content/problemes-situes";
import { levelById, notionById } from "../curriculum";
import { playFeedback } from "../lib/sound";
import { attemptsOf, streak } from "../lib/stats";
import { canAccessNotion, canViewSolution, currentUser, modeFor, uid, update, useStore } from "../store";

type Phase = "answer" | "feedback" | "correction" | "done";
interface Result { ok: boolean; firstTry: boolean; viewed: boolean }

const STATUT: Record<Statut, string> = {
  brouillon: "Brouillon",
  "verifie-code": "Réponses vérifiées automatiquement · pas encore relu par un enseignant",
  "valide-enseignant": "Validé par un enseignant",
};

const answerText = (a: Answer, q: QuestionPb) =>
  a.kind === "choice" ? a.options[a.index] : `${String(a.value).replace(".", ",")}${q.answer.kind === "number" && q.answer.unit ? " " + q.answer.unit : ""}`;

/** Une nouvelle variante (autres valeurs) repart de zéro : l'écran est recréé quand l'adresse change. */
export default function ProblemePage() {
  const loc = useLocation();
  return <ProblemeInner key={loc.pathname + loc.search} />;
}

function ProblemeInner() {
  const { id = "" } = useParams();
  const state = useStore();
  const me = currentUser(state)!;
  const nav = useNavigate();
  const p = problemeById(id);
  const notion = p ? notionById(p.notionId) : undefined;
  // ?seed=… rejoue exactement la même variante (revue par un enseignant, signalement d'erreur) ; sinon variante aléatoire.
  const seed = useMemo(() => Number(new URLSearchParams(window.location.search).get("seed")) || 1 + Math.floor(Math.random() * 1e6), []);
  const inst = useMemo(() => (p ? instancierProbleme(p, seed) : null), [p, seed]);

  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [input, setInput] = useState("");
  const [hints, setHints] = useState(0);
  const [tries, setTries] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);
  const [okNow, setOkNow] = useState(false);
  const [written, setWritten] = useState(false);
  const nb = useNotebook();
  const busy = useRef(false); // une seule soumission par essai (Entrée répétée, double clic)

  if (!p || !inst || !notion || !canAccessNotion(me, notion)) return <Navigate to="/exercices" replace />;
  if (!nb.ready) return <NotebookGate onReady={nb.confirm} back={() => nav(-1)} />;

  const back = `/notion/${encodeURIComponent(p.notionId)}`;
  const q = inst.questions[qi];
  const mode = modeFor(state, me.id);
  const mine = attemptsOf(state, me.id);
  const totalPts = inst.questions.reduce((s, x) => s + x.points, 0);

  function validate() {
    if (!input.trim() || phase !== "answer" || busy.current || (nb.need && !written)) return;
    busy.current = true;
    const ok = checkAnswer(q.answer, input);
    const n = parseNumeric(input);
    const targeted = !ok && q.answer.kind === "number" && Number.isFinite(n)
      ? q.erreurs.find((e) => Math.abs(n - e.reponse) <= (q.answer.kind === "number" ? q.answer.tol : 0) + 1e-9)?.message ?? null
      : null;
    const aid = uid();
    update((s) => ({
      ...s,
      attempts: [...s.attempts, {
        id: aid, studentId: me.id, templateId: `pb:${p!.id}:q${qi + 1}`, notionId: p!.notionId, ctx: p!.contexte, seed: seed * 10 + qi,
        correct: ok, helpLevel: hints, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice", ts: Date.now(),
      }],
    }));
    setLastAttempt(aid);
    setTries((t) => t + 1);
    setMessage(ok ? null : targeted);
    setPhase("feedback");
    setOkNow(ok);
    playFeedback(ok ? "ok" : "bad", me.prefs?.sounds);
  }

  function next(ok: boolean, wasViewed: boolean) {
    const r: Result = { ok, firstTry: ok && tries === 1 && hints === 0 && !wasViewed, viewed: wasViewed };
    const all = [...results, r];
    setResults(all);
    busy.current = false;
    setInput(""); setHints(0); setTries(0); setMessage(null); setLastAttempt(null); setWritten(false);
    if (qi + 1 >= inst!.questions.length) setPhase("done");
    else { setQi(qi + 1); setPhase("answer"); }
  }
  function retry() {
    busy.current = false;
    setInput("");
    setHints((h) => Math.min(4, Math.max(h, 0) + 1));
    setPhase("answer");
  }
  function showCorrection() {
    if (!canViewSolution(mode, true)) return;
    update((s) => ({ ...s, attempts: s.attempts.map((a) => (a.id === lastAttempt ? { ...a, solutionViewed: true } : a)) }));
    setPhase("correction");
  }

  // ---------- Bilan ----------
  if (phase === "done") {
    const good = results.filter((r) => r.ok).length;
    const first = results.filter((r) => r.firstTry).length;
    const earned = results.reduce((s, r, k) => s + (r.firstTry ? inst.questions[k].points : 0), 0);
    return (
      <div className="navy">
        <main className="shell no-nav stack center session" style={{ paddingTop: 48 }}>
          <div className="hero-mark" style={{ margin: "0 auto" }}><Trophy size={64} aria-hidden="true" /></div>
          <h1>Problème terminé !</h1>
          <p className="lead">{good} question{good > 1 ? "s" : ""} réussie{good > 1 ? "s" : ""} sur {results.length} • {first} du premier coup, sans indice</p>
          <section className="card stack" style={{ background: "#fff", borderColor: "#fff", textAlign: "left" }}>
            <div className="stats3">
              <div><b>{earned}/{totalPts}</b><span>Points sans aide</span></div>
              <div><b>{good}/{results.length}</b><span>Réussite</span></div>
              <div><b>{streak(mine)}</b><span>Série</span></div>
            </div>
            <ol className="stack-sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {inst.questions.map((x, k) => (
                <li key={k} className="corr-step"><span className="n">{k + 1}</span><div><h3>{x.texte}</h3><p>Réponse : <strong>{answerText(x.answer, x)}</strong> — {results[k]?.firstTry ? "réussi du premier coup" : results[k]?.ok ? "réussi avec de l'aide" : "à revoir"}</p></div></li>
              ))}
            </ol>
            <div className="deck"><span className="icon-tile sm"><Lightbulb size={22} aria-hidden="true" /></span><p>Déclic te dit : « Refais ce problème : les valeurs changent, la méthode reste la même. Si tu la retrouves seul(e), tu l'as comprise. »</p></div>
            <button className="btn primary block" onClick={() => nav(`${loc_path(id)}?v=${Date.now()}`)}>Refaire avec de nouvelles valeurs</button>
            <Link className="btn link" to={back}>Retour à « {notion.title} »</Link>
          </section>
        </main>
      </div>
    );
  }

  // ---------- Correction ----------
  if (phase === "correction") {
    return (
      <main className="shell no-nav stack session">
        <div className="topline">
          <button className="icon-btn" aria-label="Retour au résultat" onClick={() => setPhase("feedback")}><X size={22} aria-hidden="true" /></button>
          <h1 style={{ fontSize: "1.5rem" }}>Correction pas à pas</h1>
        </div>
        <section className="card stack"><p className="statement">{q.texte}</p></section>
        <ol className="stack-sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li className="corr-step"><span className="n">1</span><div><h3>La méthode</h3><p>{q.methode}</p></div></li>
          {q.etapes.map((e, k) => (
            <li key={k} className="corr-step"><span className="n">{k + 2}</span><div><h3>{k === q.etapes.length - 1 ? "Le résultat" : "Le calcul"}</h3><p style={{ whiteSpace: "pre-line" }}>{e}</p></div></li>
          ))}
        </ol>
        <button className="btn primary block" onClick={() => next(false, true)}>J'ai compris, question suivante</button>
      </main>
    );
  }

  // ---------- Question + retour ----------
  const answered = phase === "feedback";
  return (
    <main className="shell no-nav stack session">
      <div className="topline">
        <button className="icon-btn" aria-label="Quitter le problème" onClick={() => nav(back)}><X size={22} aria-hidden="true" /></button>
        <ProgressBar value={((qi + (answered && okNow ? 1 : 0)) / inst.questions.length) * 100} label="Avancement du problème" />
      </div>
      <ExerciseActions title={p.titre} url={`/probleme/${encodeURIComponent(p.id)}?seed=${seed}`} />

      <section className="card stack">
        <p className="eyebrow">{p.titre} • {levelById(notion.level).label} • {notion.title}</p>
        <p className="statement">{inst.enonce}</p>
        <span className="pill" style={{ alignSelf: "flex-start" }}>{p.contexteLabel}</span>
        <details className="muted small">
          <summary>Fiche pédagogique</summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            <li><strong>Compétence :</strong> {p.competence}</li>
            <li><strong>Objectif :</strong> {p.objectif}</li>
            <li><strong>Prérequis :</strong> {p.prerequis.join(" ; ")}</li>
            <li><strong>Difficulté :</strong> {p.difficulte} / 3</li>
            <li><strong>Statut :</strong> {STATUT[p.statut]}</li>
            <li><strong>Programme officiel :</strong> {p.programme.verifie ? p.programme.reference : "rattachement non vérifié — " + p.programme.reference}</li>
          </ul>
        </details>
      </section>

      {results.length > 0 && (
        <section className="callout" aria-label="Résultats précédents">
          {inst.questions.slice(0, results.length).map((x, k) => <div key={k}><strong>Question {k + 1} :</strong> {answerText(x.answer, x)}</div>)}
        </section>
      )}

      <section className="card stack">
        <p className="eyebrow">Question {qi + 1} / {inst.questions.length} • {q.points} pt{q.points > 1 ? "s" : ""}</p>
        <p className="statement">{q.texte}</p>
        <div className="exercise-print-answer" aria-hidden="true" />
      </section>

      {!answered && (
        <>
          {nb.need && <WrittenCheck checked={written} onChange={setWritten} />}
          <AnswerInput answer={q.answer} value={input} onChange={setInput} name={`pq${qi}`} onSubmit={validate} />
          {hints > 0 && (
            <div className="stack-sm">
              {q.hints.slice(0, hints).map((h, k) => (
                <div key={k} className="tip" role="note"><Lightbulb size={22} aria-hidden="true" /><span>Astuce Déclic : {h}</span></div>
              ))}
            </div>
          )}
          <div className="actions">
            <button className="btn ghost" onClick={() => setHints((h) => Math.min(4, h + 1))} disabled={hints >= 4}><Lightbulb size={20} aria-hidden="true" /> Indice</button>
            <button className="btn primary" onClick={validate} disabled={!input.trim() || (nb.need && !written)}>Valider</button>
          </div>
          <p className="muted small center">Une erreur est un indice, jamais une sanction.</p>
        </>
      )}

      {answered && okNow && (
        <section className="fb ok" role="status">
          <header><span className="ic"><Check size={28} aria-hidden="true" /></span><div><h2>Bravo, déclic !</h2><p>Bonne réponse : {answerText(q.answer, q)}.</p></div></header>
          <button className="btn green block" onClick={() => next(true, false)}>{qi + 1 >= inst.questions.length ? "Voir mon bilan" : "Question suivante"}</button>
        </section>
      )}
      {answered && !okNow && (
        <section className="fb bad" role="status">
          <header><span className="ic"><Heart size={26} aria-hidden="true" /></span><div><h2>{message ? "Regarde de plus près." : "Pas grave, on reprend."}</h2><p>{message ?? "Erreur = indice. Relis l'énoncé et essaie avec un indice."}</p></div></header>
          <button className="btn primary block" onClick={retry}>Réessayer avec un indice</button>
          {tries >= 2 && canViewSolution(mode, true) && <button className="btn yellow block" onClick={showCorrection}>Voir la correction</button>}
          {tries >= 2 && !canViewSolution(mode, true) && <p className="small muted">Les corrigés sont bloqués par ton parent : utilise les indices ou passe à la suite.</p>}
        </section>
      )}
    </main>
  );
}

const loc_path = (id: string) => `/probleme/${encodeURIComponent(id)}`;
