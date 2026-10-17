import { Check, Lightbulb } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { BackButton } from "../components/ui";
import { ExerciseActions } from "../components/ExerciseActions";
import { defaults, sampleCurve, simulationById } from "../content/simulations";
import type { Point, Simulation } from "../content/simulations";
import { notionById } from "../curriculum";
import { recordEvidence } from "../lib/knowledge";
import { currentUser, useStore } from "../store";
import "../methodes.css";

const f = (x: number, d = 2) => x.toLocaleString("fr-FR", { maximumFractionDigits: d });

function Chart({ sim, pts, x, y }: { sim: Simulation; pts: Point[]; x: number; y: number }) {
  const W = 560, H = 260, L = 56, R = 16, T = 16, B = 40;
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(0, ...ys), y1 = Math.max(...ys) || 1;
  const sx = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R);
  const sy = (v: number) => T + (1 - (v - y0) / (y1 - y0 || 1)) * (H - T - B);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  return (
    <svg className="mt-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Courbe : ${sim.curve.yLabel} selon ${sim.curve.xLabel}. Point actuel : ${f(x)} → ${f(y)}.`}>
      <line className="axis" x1={L} y1={T} x2={L} y2={H - B} />
      <line className="axis" x1={L} y1={sy(0)} x2={W - R} y2={sy(0)} />
      <path className="curve" d={d} />
      <circle className="dot" cx={sx(x)} cy={sy(y)} r="7" />
      <text x={L} y={H - B + 16}>{f(x0)}</text>
      <text x={W - R} y={H - B + 16} textAnchor="end">{f(x1)}</text>
      <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle">{sim.curve.xLabel}</text>
      <text x={L - 6} y={sy(y1) + 4} textAnchor="end">{f(y1, 1)}</text>
      <text x={L - 6} y={sy(y0)} textAnchor="end">{f(y0, 1)}</text>
    </svg>
  );
}

/** Simulation guidée : prédire, manipuler, relever un défi. */
export default function SimulationPage() {
  const { id = "" } = useParams();
  const sim = simulationById(id);
  const me = currentUser(useStore())!;
  const [values, setValues] = useState<Record<string, number>>(() => (sim ? defaults(sim) : {}));
  const [guess, setGuess] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [hinted, setHinted] = useState(false);
  const logged = useRef({ pred: false, chal: false });
  const out = useMemo(() => (sim ? sim.compute(values) : {}), [sim, values]);
  const pts = useMemo(() => (sim ? sampleCurve(sim, values) : []), [sim, values]);
  if (!sim) return <Navigate to="/situations" replace />;
  const notion = notionById(sim.notionId);
  const p = sim.prediction;
  const right = p.answer(sim);

  function answer(i: number) {
    if (guess !== null) return;
    setGuess(i);
    if (!logged.current.pred && notion) { logged.current.pred = true; recordEvidence({ studentId: me.id, notionId: notion.id, source: "simulation", score: i === right ? 1 : 0.4 }); }
  }
  function tryChallenge() {
    const ok = sim!.challenge.ok(values);
    setWon(ok);
    if (ok && !logged.current.chal && notion) { logged.current.chal = true; recordEvidence({ studentId: me.id, notionId: notion.id, source: "simulation", score: hinted ? 0.7 : 1 }); }
  }
  const before = sim.compute(p.from)[p.watch], after = sim.compute(p.to)[p.watch];
  const watch = sim.outputs.find((o) => o.id === p.watch)!;
  const fmtOut = (o: Simulation["outputs"][number], v: number) => `${o.fmt ? o.fmt(v) : f(v)}${o.unit ? " " + o.unit : ""}`;

  return (
    <main className="shell wide no-nav stack mt-sim">
      <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/situations" /><h1 style={{ fontSize: "1.4rem" }}>{sim.title}</h1></div>
      <ExerciseActions title={sim.title} url={`/simulation/${encodeURIComponent(sim.id)}`} />
      <p className="callout">{sim.scene}</p>

      <section className="card stack-sm" aria-labelledby="s1">
        <h2 id="s1" style={{ fontSize: "1.1rem" }}>1. Prédis</h2>
        <p><b>{p.question}</b></p>
        <div className="mt-quick" role="group" aria-label="Ta prédiction">
          {p.options.map((o, i) => <button key={o} type="button" disabled={guess !== null} aria-pressed={guess === i} style={guess === i ? { background: "var(--primary-soft)" } : undefined} onClick={() => answer(i)}>{o}</button>)}
        </div>
        {guess !== null && (
          <div className={guess === right ? "fb ok" : "fb near"} role="status">
            <p><b>{guess === right ? "Bonne prédiction !" : `Ce n'était pas ça : la bonne réponse est « ${p.options[right]} ».`}</b></p>
            <p>{watch.label} : {fmtOut(watch, before)} → {fmtOut(watch, after)}</p>
            <p>{p.explain}</p>
          </div>
        )}
      </section>

      <section className="card stack" aria-labelledby="s2">
        <h2 id="s2" style={{ fontSize: "1.1rem" }}>2. Manipule</h2>
        {sim.params.map((q) => (
          <label key={q.id} className="mt-range">
            <span>{q.label} : <b>{f(values[q.id], 2)} {q.unit}</b></span>
            <input type="range" min={q.min} max={q.max} step={q.step} value={values[q.id]} onChange={(e) => { setValues((v) => ({ ...v, [q.id]: Number(e.target.value) })); setWon(false); }} />
          </label>
        ))}
        <div className="mt-out" aria-live="polite">{sim.outputs.map((o) => <div key={o.id}><b>{fmtOut(o, out[o.id])}</b><span>{o.label}</span></div>)}</div>
        <Chart sim={sim} pts={pts} x={values[sim.curve.x]} y={out[sim.curve.y]} />
        <p className="muted small">{sim.lesson}</p>
      </section>

      <section className="card stack-sm" aria-labelledby="s3">
        <h2 id="s3" style={{ fontSize: "1.1rem" }}>3. Relève le défi</h2>
        <p><b>{sim.challenge.text}</b></p>
        <div className="actions">
          <button className="btn ghost" onClick={() => setHinted(true)}><Lightbulb size={20} aria-hidden="true" /> Indice</button>
          <button className="btn primary" onClick={tryChallenge}>Vérifier ma configuration</button>
        </div>
        {hinted && <div className="tip" role="note"><Lightbulb size={22} aria-hidden="true" /><span>{sim.challenge.hint}</span></div>}
        {won && <div className="fb ok" role="status"><p><Check size={18} aria-hidden="true" /> <b>Réussi !</b> {sim.challenge.done}</p></div>}
      </section>
    </main>
  );
}
