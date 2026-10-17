import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { ExerciseActions } from "../components/ExerciseActions";
import { BackButton } from "../components/ui";
import { checkAnswer } from "../content/core";
import { examName, levelById, notionById, Subject, SUBJECT_LABEL } from "../curriculum";
import { buildExam, taskOf } from "../engine";
import { papersFor, profileFor } from "../content/exam-profiles";
import { currentUser, ExamRun, uid, update, useStore } from "../store";

/** Démarre (ou reprend) une épreuve : /epreuve/:subject/:kind */
export function ExamStart() {
  const { subject, kind } = useParams();
  const state = useStore();
  const me = currentUser(state)!;
  const nav = useNavigate();
  const level = me.level ?? "tle";
  const running = state.exams.find((e) => e.studentId === me.id && e.status === "running" && e.subject === subject && e.kind === kind && e.level === level);

  const spec = { subject: subject as Subject, level, kind: kind as "level" | "exit", seed: Date.now() % 1e6 };
  const built = useMemo(() => buildExam(spec), []); // eslint-disable-line react-hooks/exhaustive-deps
  const label = kind === "exit" ? `Examen blanc ${examName(me.country, level)} — ${SUBJECT_LABEL[spec.subject]}` : `Composition ${levelById(level).label} — ${SUBJECT_LABEL[spec.subject]}`;

  const cycle = levelById(level).cycle;
  const profile = kind === "exit" && (cycle === "primaire" || cycle === "college") ? profileFor(me.country, cycle) : undefined;
  const papers = profile ? papersFor(me.country, profile.name.split(" ")[0]) : [];

  if (running) return <Navigate to={`/epreuve/resultat/${running.id}`} replace />;
  if (!built.items.length) return <Navigate to="/" replace />;

  function start() {
    const run: ExamRun = {
      id: uid(), studentId: me.id, subject: spec.subject, level, kind: spec.kind, label,
      startedAt: Date.now(), durationMin: built.durationMin, outOf: built.outOf, items: built.items, answers: {}, status: "running",
    };
    update((s) => ({ ...s, exams: [...s.exams, run] }));
    nav(`/epreuve/resultat/${run.id}`, { replace: true });
  }

  return (
    <main className="shell no-nav stack">
      <BackButton to="/exercices" />
      <h1>{label}</h1>
      <ExerciseActions title={label} url={`/epreuve/${spec.subject}/${kind}`} />
      <section className="card stack">
        <p>{built.items.length} questions · {built.durationMin} minutes · notée sur {built.outOf}</p>
        <ul>
          <li>Pas d'aide ni de corrigé pendant l'épreuve.</li>
          <li>Le corrigé complet et le détail par notion sont donnés à la fin.</li>
          <li>Le chrono continue si tu quittes la page.</li>
        </ul>
        <button className="btn primary block" onClick={start}>Commencer l'épreuve</button>
        <Link className="btn ghost block" to={`/sujet/examen/${spec.subject}/${kind}`}>Imprimer l'épreuve complète (situation + problèmes)</Link>
      </section>
      {profile && (
        <section className="card stack-sm" aria-labelledby="profil-exam">
          <h2 id="profil-exam" style={{ fontSize: "1.1rem" }}>À quoi ressemble le vrai {profile.name} ?</h2>
          <p className="small">{profile.status}</p>
          {profile.threshold && <p><b>Admission :</b> {profile.threshold}</p>}
          {profile.structure && <p>{profile.structure}</p>}
          {profile.coefficients && <p><b>Coefficients :</b> {profile.coefficients}</p>}
          {papers.length > 0 && (
            <ul className="small">
              {papers.map((p) => <li key={p.exam + p.paper}>{p.paper}{p.weight ? ` — ${p.weight}` : ""}{p.duration ? ` · ${p.duration}` : ""}</li>)}
            </ul>
          )}
          <p className="muted small">
            {profile.confidence === "Élevée" ? "Source publique." : "Information à confirmer auprès de ton école."}{" "}
            <a href={profile.source} target="_blank" rel="noopener noreferrer">Source</a>
          </p>
        </section>
      )}
    </main>
  );
}

/** Épreuve en cours ou corrigée : /epreuve/resultat/:id */
export function ExamRunPage() {
  const { id } = useParams();
  const state = useStore();
  const exam = state.exams.find((e) => e.id === id);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const prepared = useMemo(() => exam?.items.map(taskOf), [exam?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const left = exam ? Math.max(0, exam.startedAt + exam.durationMin * 60000 - now) : 0;
  useEffect(() => {
    if (exam?.status === "running" && left === 0) finish();
  }); // eslint-disable-line react-hooks/exhaustive-deps

  if (!exam || !prepared) return <Navigate to="/" replace />;

  function finish() {
    if (!exam || exam.status !== "running") return;
    const results = exam.items.map((it, i) => checkAnswer(prepared![i].inst.answer, exam.answers[i] ?? ""));
    const score = Math.round(exam.items.reduce((s, it, i) => s + (results[i] ? it.points : 0), 0) * 100) / 100;
    update((s) => ({
      ...s,
      exams: s.exams.map((e) => (e.id === exam.id ? { ...e, status: "done", results, score, finishedAt: Date.now() } : e)),
      attempts: [...s.attempts, ...exam.items.map((it, i) => ({
        id: uid(), studentId: exam.studentId, templateId: it.templateId, notionId: it.notionId, ctx: it.ctx, seed: it.seed,
        correct: results[i], helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "check" as const, ts: Date.now(),
      }))],
    }));
  }

  if (exam.status === "done") {
    const byNotion = new Map<string, { ok: number; n: number }>();
    exam.items.forEach((it, i) => {
      const e = byNotion.get(it.notionId) ?? { ok: 0, n: 0 };
      e.n++; if (exam.results?.[i]) e.ok++;
      byNotion.set(it.notionId, e);
    });
    return (
      <main className="shell no-nav stack">
        <BackButton to="/exercices" />
        <h1>{exam.label}</h1>
        <ExerciseActions title={exam.label} url={`/epreuve/${exam.subject}/${exam.kind}`} />
        <section className="card center"><span className="big">{exam.score}/{exam.outOf}</span><p className="muted">Un point de repère, pas un jugement : regarde surtout les notions à revoir.</p></section>
        <section className="card stack">
          <h2>Par notion</h2>
          {[...byNotion].map(([nId, v]) => (
            <div key={nId} className="progress-row">
              <span>{notionById(nId)?.title}</span>
              <span className={`badge ${v.ok === v.n ? "mastered" : v.ok === 0 ? "fragile" : "progress"}`}>{v.ok}/{v.n}</span>
              <Link to={`/notion/${encodeURIComponent(nId)}`}>Revoir</Link>
            </div>
          ))}
        </section>
        {exam.items.map((it, i) => (
          <section key={i} className="card stack">
            <strong>Question {i + 1} — {exam.results?.[i] ? "juste" : "à revoir"} ({it.points} pt)</strong>
            <p className="statement">{prepared[i].inst.statement}</p>
            <p><strong>Ta réponse :</strong> {answerText(prepared[i].inst.answer, exam.answers[i])}</p>
            <p className="statement"><strong>Corrigé :</strong> {prepared[i].inst.solution}</p>
          </section>
        ))}
      </main>
    );
  }

  const mm = String(Math.floor(left / 60000)).padStart(2, "0"), ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return (
    <main className="shell no-nav stack">
      <div className="row between sticky">
        <h1>{exam.label}</h1>
        <span className="big" role="timer" aria-live="off">{mm}:{ss}</span>
      </div>
      <ExerciseActions title={exam.label} url={`/epreuve/${exam.subject}/${exam.kind}`} />
      {exam.items.map((it, i) => (
        <section key={i} className="card stack">
          <strong>Question {i + 1} ({it.points} pt)</strong>
          <p className="statement">{prepared[i].inst.statement}</p>
          <div className="exercise-print-answer" aria-hidden="true" />
          <AnswerInput
            answer={prepared[i].inst.answer} name={`q${i}`} value={exam.answers[i] ?? ""}
            onChange={(v) => update((s) => ({ ...s, exams: s.exams.map((e) => (e.id === exam.id ? { ...e, answers: { ...e.answers, [i]: v } } : e)) }))}
          />
        </section>
      ))}
      <button className="btn primary block" onClick={finish}>Rendre ma copie</button>
    </main>
  );
}

function answerText(a: ReturnType<typeof taskOf>["inst"]["answer"], v?: string) {
  if (v === undefined || v === "") return "(sans réponse)";
  return a.kind === "choice" ? a.options[Number(v)] : v;
}
