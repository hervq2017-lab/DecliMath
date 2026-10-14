import { ClipboardCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { NotebookGate, useNotebook } from "../components/Notebook";
import { BackButton } from "../components/ui";
import { checkAnswer, templatesFor } from "../content/core";
import { diagnose } from "../content/erreurs";
import { LevelId, notionById, notionsOf, SUBJECT_LABEL, subjectsAt } from "../curriculum";
import { hasContent, Task, taskOf } from "../engine";
import { knowledgeMap, knowledgeOf, recordAttempt } from "../lib/knowledge";
import { relativeDay } from "../lib/stats";
import { currentUser, uid, update, useStore } from "../store";
import type { State } from "../store";
import "../methodes.css";

interface Q { task: Task; notionId: string; fresh: boolean }

/**
 * Bilan : mélange d'anciennes notions (les plus anciennes et les plus fragiles d'abord) et de nouvelles,
 * pour mesurer ce qui est retenu ET ce qui vient d'être appris.
 */
export function buildBilan(s: State, studentId: string, level: LevelId, n = 12): Q[] {
  const all = subjectsAt(level).flatMap((su) => notionsOf(su, level)).filter((x) => hasContent(x.id));
  if (!all.length) return [];
  const map = knowledgeMap(s, studentId);
  const seen = all.filter((x) => knowledgeOf(map, x.id).n > 0).sort((a, b) => knowledgeOf(map, a.id).strength - knowledgeOf(map, b.id).strength || knowledgeOf(map, a.id).lastTs - knowledgeOf(map, b.id).lastTs);
  const fresh = all.filter((x) => knowledgeOf(map, x.id).n === 0).sort(() => Math.random() - 0.5);
  const wantOld = Math.min(seen.length, Math.ceil(n * 0.6));
  const picked = [...seen.slice(0, wantOld).map((x) => ({ x, fresh: false })), ...fresh.slice(0, n - wantOld).map((x) => ({ x, fresh: true }))];
  for (const x of seen.slice(wantOld)) if (picked.length < n) picked.push({ x, fresh: false });
  for (let k = 0; picked.length < n && k < n * 3; k++) picked.push({ ...picked[k % Math.max(1, picked.length)] }); // peu de notions : on varie les gabarits
  return picked.slice(0, n).map(({ x, fresh: f }, k) => {
    const tpls = templatesFor(x.id);
    const tpl = tpls[(k + Math.floor(Math.random() * tpls.length)) % tpls.length];
    return { notionId: x.id, fresh: f, task: { templateId: tpl.id, ctx: tpl.contexts[Math.floor(Math.random() * tpl.contexts.length)].id, seed: 1 + Math.floor(Math.random() * 1e6) } };
  });
}

interface Res { q: Q; ok: boolean }

export default function Bilan() {
  const state = useStore();
  const me = currentUser(state)!;
  const level = me.level ?? "tle";
  const nav = useNavigate();
  const [qs, setQs] = useState<Q[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [res, setRes] = useState<Res[] | null>(null);
  const [finishedAt, setFinishedAt] = useState(0);
  const nb = useNotebook();
  const prepared = useMemo(() => (qs ?? []).map((q) => taskOf(q.task)), [qs]);
  const past = state.bilans.filter((b) => b.studentId === me.id).sort((a, b) => b.ts - a.ts);

  function finish() {
    const out: Res[] = prepared.map((p, i) => ({ q: qs![i], ok: checkAnswer(p.inst.answer, answers[i] ?? "") }));
    out.forEach((r, i) => {
      const given = answers[i] ?? "";
      recordAttempt({
        id: uid(), studentId: me.id, templateId: r.q.task.templateId, notionId: r.q.notionId, ctx: r.q.task.ctx, seed: r.q.task.seed, correct: r.ok,
        helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "check", given, errTag: r.ok ? undefined : diagnose(prepared[i].inst.answer, given, prepared[i].inst.statement) ?? undefined,
      });
    });
    update((s) => ({ ...s, bilans: [...s.bilans, { id: uid(), studentId: me.id, ts: Date.now(), items: out.map((r) => ({ notionId: r.q.notionId, correct: r.ok, fresh: r.q.fresh })) }] }));
    setFinishedAt(Date.now());
    setRes(out);
  }

  if (qs && !nb.ready) return <NotebookGate onReady={nb.confirm} back={() => setQs(null)} />;

  // ---------- Résultats ----------
  if (res) {
    const pct = (list: Res[]) => (list.length ? Math.round((list.filter((r) => r.ok).length / list.length) * 100) : null);
    const by = <K extends string>(key: (r: Res) => K) => {
      const m = new Map<K, Res[]>();
      for (const r of res) { const k = key(r); m.set(k, [...(m.get(k) ?? []), r]); }
      return [...m.entries()];
    };
    const prev = past.find((b) => b.ts < finishedAt - 1000);
    const prevPct = prev ? Math.round((prev.items.filter((i) => i.correct).length / Math.max(1, prev.items.length)) * 100) : null;
    const total = pct(res)!;
    const weak = by((r) => r.q.notionId).filter(([, l]) => l.some((r) => !r.ok)).map(([id]) => id);
    const old = res.filter((r) => !r.q.fresh), fresh = res.filter((r) => r.q.fresh);
    const Bar = ({ label, value, extra }: { label: string; value: number | null; extra?: string }) => (
      <div className="mt-bar-row">
        <span className="lbl">{label}</span>
        <div className={`mt-bar ${value !== null && value < 50 ? "weak" : value !== null && value >= 80 ? "good" : ""}`} role="img" aria-label={`${value ?? 0} %`}><i style={{ width: `${value ?? 0}%` }} /></div>
        <span className="small">{value ?? "–"} %{extra ? ` ${extra}` : ""}</span>
      </div>
    );
    return (
      <main className="shell wide no-nav stack">
        <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 style={{ fontSize: "1.4rem" }}>Résultat du bilan</h1></div>
        <section className="card stack center" role="status">
          <p className="big-num">{res.filter((r) => r.ok).length} / {res.length}</p>
          <p className="muted">{total >= 80 ? "Très solide : tu maîtrises l'essentiel." : total >= 50 ? "Une bonne base : quelques notions à consolider." : "Ce bilan montre où travailler : c'est exactement son rôle."}{prevPct !== null ? ` Bilan précédent : ${prevPct} %.` : ""}</p>
        </section>

        <section className="card stack-sm"><h2 style={{ fontSize: "1.1rem" }}>Anciennes et nouvelles leçons</h2>
          {old.length > 0 && <Bar label="Anciennes leçons (ce que tu retiens)" value={pct(old)} />}
          {fresh.length > 0 && <Bar label="Nouvelles leçons (ce que tu découvres)" value={pct(fresh)} />}
        </section>
        <section className="card stack-sm"><h2 style={{ fontSize: "1.1rem" }}>Par matière</h2>
          {by((r) => SUBJECT_LABEL[notionById(r.q.notionId)!.subject]).map(([k, l]) => <Bar key={k} label={k} value={pct(l)} />)}
        </section>
        <section className="card stack-sm"><h2 style={{ fontSize: "1.1rem" }}>Par chapitre</h2>
          {by((r) => notionById(r.q.notionId)!.chapter).map(([k, l]) => <Bar key={k} label={k} value={pct(l)} />)}
        </section>
        <section className="card stack-sm"><h2 style={{ fontSize: "1.1rem" }}>Par notion</h2>
          {by((r) => notionById(r.q.notionId)!.title).map(([k, l]) => <Bar key={k} label={k} value={pct(l)} extra={`(${l.filter((r) => r.ok).length}/${l.length})`} />)}
        </section>

        <section className="card stack-sm">
          <h2 style={{ fontSize: "1.1rem" }}>Ce que je te propose maintenant</h2>
          {weak.length === 0 && <p>Aucune notion à reprendre en urgence. Continue avec les révisions espacées pour que ça dure.</p>}
          {weak.slice(0, 4).map((id) => <Link key={id} className="btn ghost" style={{ justifyContent: "flex-start" }} to={`/notion/${encodeURIComponent(id)}`}>Reprendre « {notionById(id)!.title} »</Link>)}
          <p className="muted small">Les questions ratées sont automatiquement ajoutées à tes révisions de demain.</p>
          <Link className="btn primary" to="/revision">Voir mes révisions</Link>
        </section>
        <button className="btn link" onClick={() => nav(0)}>Faire un autre bilan</button>
      </main>
    );
  }

  // ---------- Questions ----------
  if (qs) {
    return (
      <main className="shell wide no-nav stack">
        <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 style={{ fontSize: "1.4rem" }}>Bilan</h1></div>
        <p className="muted">{qs.length} questions sans aide, sans note affichée avant la fin. Réponds à ce que tu sais, laisse le reste vide.</p>
        {prepared.map((p, i) => (
          <section key={i} className="card stack">
            <p className="eyebrow">Question {i + 1} • {notionById(qs[i].notionId)?.title}</p>
            <p className="statement">{p.inst.statement}</p>
            <AnswerInput answer={p.inst.answer} value={answers[i] ?? ""} name={`b${i}`} onChange={(v) => setAnswers((a) => { const n = [...a]; n[i] = v; return n; })} />
          </section>
        ))}
        <button className="btn primary block" onClick={finish}>Terminer le bilan</button>
      </main>
    );
  }

  // ---------- Accueil ----------
  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><ClipboardCheck size={26} aria-hidden="true" /> Bilan</h1></div>
      <p className="muted">Un test de 12 questions qui mélange des leçons anciennes (pour voir ce que tu retiens) et des leçons nouvelles. À la fin, tu vois ta progression par matière, par chapitre et par notion, et on te dit quoi travailler ensuite.</p>
      <button className="btn primary block" onClick={() => setQs(buildBilan(state, me.id, level))}>Commencer le bilan</button>
      {past.length > 0 && (
        <section className="card stack-sm">
          <h2 style={{ fontSize: "1.1rem" }}>Mes bilans précédents</h2>
          {past.slice(0, 6).map((b) => {
            const ok = b.items.filter((i) => i.correct).length;
            return <p key={b.id}><b>{ok}/{b.items.length}</b> • {relativeDay(b.ts)}</p>;
          })}
        </section>
      )}
    </main>
  );
}
