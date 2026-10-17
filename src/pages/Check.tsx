import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { NotebookGate, useNotebook } from "../components/Notebook";
import { ExerciseActions } from "../components/ExerciseActions";
import { BackButton } from "../components/ui";
import { checkAnswer } from "../content/core";
import { notionById } from "../curriculum";
import { diagnose } from "../content/erreurs";
import { buildCheck, checkPassed, Task, taskOf } from "../engine";
import { recordAttempt } from "../lib/knowledge";
import { canAccessNotion, currentUser, uid, update, useStore } from "../store";

/** « Ai-je vraiment compris ? » : 4 questions sans aide dans 2 contextes différents. */
export default function Check() {
  const { id = "" } = useParams();
  const notion = notionById(id);
  const me = currentUser(useStore())!;
  const [tasks, setTasks] = useState<Task[]>(() => buildCheck(id, Date.now() % 1e6));
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState<{ ctx: string; correct: boolean }[] | null>(null);
  const nb = useNotebook();
  const prepared = useMemo(() => tasks.map(taskOf), [tasks]);
  if (!notion || !tasks.length || !canAccessNotion(me, notion)) return <Navigate to="/exercices" replace />;

  if (!nb.ready) return <NotebookGate onReady={nb.confirm} back={() => history.back()} />;

  function finish() {
    const res = prepared.map((p, i) => ({ ctx: tasks[i].ctx, correct: checkAnswer(p.inst.answer, answers[i] ?? "") }));
    const passed = checkPassed(res);
    res.forEach((x, i) => recordAttempt({
      id: uid(), studentId: me.id, templateId: tasks[i].templateId, notionId: id, ctx: x.ctx, seed: tasks[i].seed,
      correct: x.correct, helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "check",
      given: answers[i] ?? "", errTag: x.correct ? undefined : diagnose(prepared[i].inst.answer, answers[i] ?? "", prepared[i].inst.statement) ?? undefined,
    }));
    update((s) => ({ ...s, checks: [...s.checks, { id: uid(), studentId: me.id, notionId: id, passed, ts: Date.now() }] }));
    setDone(res);
  }

  const back = `/notion/${encodeURIComponent(id)}`;
  if (done) {
    const passed = checkPassed(done);
    const okCtx = new Set(done.filter((d) => d.correct).map((d) => d.ctx)).size, allCtx = new Set(done.map((d) => d.ctx)).size;
    return (
      <main className="shell no-nav stack">
        <BackButton to={back} />
        <section className={`fb ${passed ? "ok" : "near"}`} role="status">
          <h2>{passed ? "Tu as compris, bravo !" : "Pas encore tout à fait"}</h2>
          <p>{done.filter((d) => d.correct).length}/{done.length} réussies, dans {okCtx} contexte{okCtx > 1 ? "s" : ""} sur {allCtx}.</p>
          {!passed && <p>Relis le cours, puis réessaie : il faut réussir dans les deux situations pour être sûr(e) d'avoir compris.</p>}
          <button className="btn primary block" onClick={() => { setTasks(buildCheck(id, Date.now() % 1e6)); setAnswers([]); setDone(null); }}>Refaire un contrôle</button>
        </section>
      </main>
    );
  }
  return (
    <main className="shell no-nav stack">
      <div className="topline"><BackButton to={back} /><h1 style={{ fontSize: "1.4rem" }}>Ai-je compris ?</h1></div>
      <p className="muted">Fais tes calculs sur ton cahier. 4 questions sans aide, dans 2 situations différentes. Sans note, sans pression.</p>
      <ExerciseActions title={`Contrôle de compréhension — ${notion.title}`} url={`/controle/${encodeURIComponent(id)}`} />
      {prepared.map((p, i) => (
        <section key={i} className="card stack">
          <span className="pill" style={{ alignSelf: "flex-start" }}>{p.tpl.contexts.find((c) => c.id === tasks[i].ctx)?.label}</span>
          <p className="statement">{p.inst.statement}</p>
          <div className="exercise-print-answer" aria-hidden="true" />
          <AnswerInput answer={p.inst.answer} value={answers[i] ?? ""} name={`c${i}`} onChange={(v) => setAnswers((a) => { const n = [...a]; n[i] = v; return n; })} />
        </section>
      ))}
      <button className="btn primary block" onClick={finish}>Terminer le contrôle</button>
    </main>
  );
}
