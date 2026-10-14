import { Lightbulb } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { BackButton, ProgressBar } from "../components/ui";
import { checkAnswer } from "../content/core";
import { levelById, notionById } from "../curriculum";
import { buildPlacement, taskOf } from "../engine";
import { currentUser, uid, update, updateUser, useStore } from "../store";

/** Test de positionnement : 5 questions, sans note, sans correction affichée. */
export default function Placement() {
  const state = useStore();
  const me = currentUser(state)!;
  const nav = useNavigate();
  const level = me.level ?? "3e";
  const tasks = useMemo(() => buildPlacement(level), [level]);
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [hint, setHint] = useState(false);
  const [okCount, setOk] = useState(0);
  const [done, setDone] = useState(false);

  if (!tasks.length) return <Navigate to="/" replace />;

  const finish = () => {
    updateUser(me.id, { placed: true });
    nav("/", { replace: true });
  };

  if (done) {
    return (
      <main className="shell no-nav stack center" style={{ paddingTop: 48 }}>
        <h1>Voici ton point de départ</h1>
        <p className="muted">Pas de note : on s'en sert seulement pour te proposer les bons exercices.</p>
        <div className="card stack">
          <span className="big">{okCount}/{tasks.length}</span>
          <p>réponses justes. Ton plan est prêt, on commence par ce qui t'aidera le plus.</p>
        </div>
        <button className="btn primary block" onClick={finish}>Voir mon accueil</button>
      </main>
    );
  }

  const t = tasks[i];
  const { inst } = taskOf(t);
  const notion = notionById(t.notionId)!;

  const lastDone = useRef(-1); // une seule soumission par question

  function next() {
    if (!input.trim() || lastDone.current === i) return;
    lastDone.current = i;
    const ok = checkAnswer(inst.answer, input);
    update((s) => ({
      ...s,
      attempts: [...s.attempts, {
        id: uid(), studentId: me.id, templateId: t.templateId, notionId: t.notionId, ctx: t.ctx, seed: t.seed, correct: ok,
        helpLevel: hint ? 2 : 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "placement", ts: Date.now(),
      }],
    }));
    if (ok) setOk((n) => n + 1);
    setInput(""); setHint(false);
    if (i + 1 >= tasks.length) setDone(true);
    else setI(i + 1);
  }

  return (
    <main className="shell no-nav stack">
      <div className="topline">
        <BackButton label="Quitter le test" to="/" />
        <span className="grow center muted" style={{ fontWeight: 700 }}>Question {i + 1} / {tasks.length}</span>
        <span className="pill">Sans note</span>
      </div>
      <ProgressBar value={((i + 1) / tasks.length) * 100} label="Avancement du test" />
      <section className="card stack">
        <span className="pill">{notion.title} • {levelById(notion.level).label}</span>
        <p className="statement">{inst.statement}</p>
        <AnswerInput answer={inst.answer} value={input} onChange={setInput} name={`p${i}`} onSubmit={() => input.trim() && next()} />
      </section>
      {hint && (
        <div className="tip" role="note"><Lightbulb size={22} aria-hidden="true" /><span>Astuce Déclic : {inst.hints[1]}</span></div>
      )}
      <div className="actions">
        {!hint && <button className="btn ghost" onClick={() => setHint(true)}><Lightbulb size={20} aria-hidden="true" /> Indice</button>}
        <button className="btn primary" onClick={next} disabled={!input.trim()}>{i + 1 === tasks.length ? "Terminer" : "Valider ma réponse"}</button>
      </div>
      <button className="btn link" onClick={() => { setInput(""); setHint(false); i + 1 >= tasks.length ? setDone(true) : setI(i + 1); }}>Je ne sais pas, passer</button>
      <p className="muted small center">Une erreur est un indice, jamais une sanction.</p>
    </main>
  );
}
