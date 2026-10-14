import { Gamepad2, Puzzle, Timer, Trophy, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { BackButton, ChevronRight } from "../components/ui";
import { checkAnswer, rng, shuffle } from "../content/core";
import { levelIndex, nid, notionById } from "../curriculum";
import { buildChallenge, Task, taskOf } from "../engine";
import { cardsForLevel } from "../lib/cards";
import { recordAttempt, recordEvidence } from "../lib/knowledge";
import { attemptsOf } from "../lib/stats";
import { currentUser, uid, useStore } from "../store";
import "../methodes.css";

/** libre = pas de chrono ; doux = le temps s'affiche mais ne bloque jamais ; chrono = compte à rebours. */
type TimeMode = "libre" | "doux" | "chrono";
const MODES: { id: TimeMode; label: string; text: string }[] = [
  { id: "libre", label: "Sans chrono", text: "Prends tout ton temps pour réfléchir." },
  { id: "doux", label: "Chrono doux", text: "Le temps s'affiche, mais rien ne s'arrête : c'est juste pour te situer." },
  { id: "chrono", label: "Contre la montre", text: "Un temps limité. Pour ceux qui aiment le défi." },
];

function useTimer(mode: TimeMode, limit: number, running: boolean) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (mode === "libre" || !running) return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [mode, running]);
  return { sec, over: mode === "chrono" && sec >= limit, label: mode === "chrono" ? `${Math.max(0, limit - sec)} s` : `${sec} s` };
}

function ModePicker({ mode, onPick, limit }: { mode: TimeMode; onPick: (m: TimeMode) => void; limit: number }) {
  return (
    <fieldset className="stack-sm" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend><b>Comment veux-tu jouer ?</b></legend>
      {MODES.map((m) => (
        <label key={m.id} className={mode === m.id ? "choice selected" : "choice"} style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "10px 20px" }}>
          <input type="radio" name="mode" checked={mode === m.id} onChange={() => onPick(m.id)} />
          <span>{m.label}{m.id === "chrono" ? ` (${limit} s)` : ""}</span>
          <small className="muted" style={{ fontWeight: 600 }}>{m.text}</small>
        </label>
      ))}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------------------------

export function JeuxHub() {
  const GAMES = [
    { id: "associer", Icon: Puzzle, title: "Associer", text: "Relie chaque propriété à son énoncé." },
    { id: "defi", Icon: Zap, title: "Défi calcul", text: "Une série d'exercices variés, vérifiés tout de suite." },
    { id: "ranger", Icon: Trophy, title: "Ranger les nombres", text: "Classe des nombres du plus petit au plus grand." },
  ];
  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><Gamepad2 size={26} aria-hidden="true" /> Jeux et défis</h1></div>
      <p className="muted">Apprendre en jouant. Le chrono est toujours un choix : tu peux jouer sans, avec un chrono doux, ou contre la montre.</p>
      {GAMES.map(({ id, Icon, title, text }) => (
        <Link key={id} to={`/jeux/${id}`} className="list-card">
          <span className="icon-tile sm" aria-hidden="true"><Icon size={22} /></span>
          <div className="grow"><h3>{title}</h3><p className="muted small">{text}</p></div>
          <ChevronRight size={22} aria-hidden="true" />
        </Link>
      ))}
    </main>
  );
}

export default function Jeux() {
  const { game = "" } = useParams();
  if (game === "associer") return <Associer />;
  if (game === "defi") return <Defi />;
  if (game === "ranger") return <Ranger />;
  return <Navigate to="/jeux" replace />;
}

const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <main className="shell wide no-nav stack">
    <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/jeux" /><h1 style={{ fontSize: "1.4rem" }}>{title}</h1></div>
    {children}
  </main>
);

// ---------- 1. Associer ----------

const PAIRS = 6;
const titleOf = (front: string) => /«\s*(.+?)\s*»/.exec(front)?.[1] ?? front;

function Associer() {
  const state = useStore();
  const me = currentUser(state)!;
  const [mode, setMode] = useState<TimeMode>("libre");
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const limit = 120;

  // propriétés courtes (lisibles dans une tuile), à raison de 6 par manche
  const pool = useMemo(() => cardsForLevel(me.level ?? "tle").filter((c) => c.kind === "propriete" && c.back.length <= 95 && c.back.length >= 8), [me.level]);
  const deal = useMemo(() => shuffle(rng(Date.now() % 1e9 + round), pool).slice(0, PAIRS), [pool, round]);
  const rightOrder = useMemo(() => shuffle(rng((Date.now() % 1e9) + round + 7), deal.map((c) => c.id)), [deal, round]);

  const [left, setLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const done = matched.length === deal.length && deal.length > 0;
  const { sec, over, label } = useTimer(mode, limit, started && !done);
  const finished = done || over;

  if (pool.length < PAIRS) return <Shell title="Associer"><p className="card">Il n'y a pas assez de propriétés courtes pour ta classe pour jouer à ce jeu. Essaie « Défi calcul » ou « Ranger les nombres ».</p></Shell>;

  function pickRight(id: string) {
    if (!left || matched.includes(id)) return;
    if (left === id) {
      setMatched((m) => [...m, id]);
      const card = deal.find((c) => c.id === id)!;
      recordEvidence({ studentId: me.id, notionId: card.notionId, source: "jeu", score: missed.has(id) ? 0.4 : 1 });
      setLeft(null);
    } else {
      setMissed((s) => new Set(s).add(left));
      setBad(id);
      setTimeout(() => setBad(null), 600);
    }
  }

  if (!started) {
    return (
      <Shell title="Associer">
        <p className="muted">Relie chaque propriété (à gauche) à son énoncé (à droite) : clique sur une propriété, puis sur son énoncé.</p>
        <ModePicker mode={mode} onPick={setMode} limit={limit} />
        <button className="btn primary block" onClick={() => setStarted(true)}>Jouer</button>
      </Shell>
    );
  }
  return (
    <Shell title="Associer">
      <div className="row between">
        <span className="pill">{matched.length}/{deal.length} associées</span>
        {mode !== "libre" && <span className="mt-timer" aria-label="Temps"><Timer size={14} aria-hidden="true" /> {label}</span>}
      </div>
      <div className="mt-pairs" role="group" aria-label="Associer les propriétés">
        <div className="stack-sm">
          {deal.map((c) => (
            <button key={c.id} type="button" disabled={matched.includes(c.id) || finished} className={`mt-tile ${matched.includes(c.id) ? "ok" : left === c.id ? "sel" : ""}`} onClick={() => setLeft(c.id)}>{titleOf(c.front)}</button>
          ))}
        </div>
        <div className="stack-sm">
          {rightOrder.map((id) => {
            const c = deal.find((x) => x.id === id)!;
            return <button key={id} type="button" disabled={matched.includes(id) || finished} className={`mt-tile ${matched.includes(id) ? "ok" : bad === id ? "bad" : ""}`} onClick={() => pickRight(id)}>{c.back}</button>;
          })}
        </div>
      </div>
      {finished && (
        <section className="card stack center" role="status">
          <h2>{done ? "Toutes les paires sont trouvées !" : "Temps écoulé"}</h2>
          <p>{matched.length} paire{matched.length > 1 ? "s" : ""} trouvée{matched.length > 1 ? "s" : ""}{mode !== "libre" ? ` en ${sec} s` : ""}. {missed.size ? `${missed.size} paire${missed.size > 1 ? "s" : ""} demandé${missed.size > 1 ? "es" : "e"} un second essai : ce sont celles à revoir.` : done ? "Sans faute !" : ""}</p>
          <button className="btn primary" onClick={() => { setRound((r) => r + 1); setMatched([]); setLeft(null); setMissed(new Set()); }}>Une autre manche</button>
        </section>
      )}
    </Shell>
  );
}

// ---------- 2. Défi calcul ----------

function Defi() {
  const state = useStore();
  const me = currentUser(state)!;
  const level = me.level ?? "tle";
  const [mode, setMode] = useState<TimeMode>("libre");
  const [started, setStarted] = useState(false);
  const limit = 90;
  const tasks: Task[] = useMemo(() => buildChallenge(attemptsOf(state, me.id), "maths", level, 8), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [shown, setShown] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const busy = useRef(false);
  const finished0 = i >= tasks.length;
  const { sec, over, label } = useTimer(mode, limit, started && !finished0);
  const finished = finished0 || over;

  if (!tasks.length) return <Shell title="Défi calcul"><p className="card">Pas encore d'exercices pour ta classe.</p></Shell>;
  if (!started) {
    return (
      <Shell title="Défi calcul">
        <p className="muted">{tasks.length} exercices variés sur tes notions les plus fragiles. Tu vois tout de suite si c'est juste. Pas d'indice dans ce jeu.</p>
        <ModePicker mode={mode} onPick={setMode} limit={limit} />
        <button className="btn primary block" onClick={() => setStarted(true)}>Jouer</button>
      </Shell>
    );
  }
  if (finished) {
    return (
      <Shell title="Défi calcul">
        <section className="card stack center" role="status">
          <h2>{over ? "Temps écoulé" : "Défi terminé !"}</h2>
          <p className="lead">{score} réussi{score > 1 ? "s" : ""} sur {Math.min(i, tasks.length)}{mode !== "libre" ? ` • ${sec} s` : ""}</p>
          {mode === "doux" && sec <= 60 && score >= tasks.length - 1 && <p className="pill green">Rapide et précis !</p>}
          <button className="btn primary" onClick={() => window.location.reload()}>Un autre défi</button>
          <Link className="btn link" to="/jeux">Retour aux jeux</Link>
        </section>
      </Shell>
    );
  }

  const t = tasks[i];
  const { tpl, inst } = taskOf(t);
  function validate() {
    if (!input.trim() || shown !== null || busy.current) return;
    busy.current = true;
    const ok = checkAnswer(inst.answer, input);
    recordAttempt({ id: uid(), studentId: me.id, templateId: tpl.id, notionId: tpl.notionId, ctx: t.ctx, seed: t.seed, correct: ok, helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice", given: input });
    if (ok) setScore((s) => s + 1);
    setShown(ok);
  }
  function next() { busy.current = false; setInput(""); setShown(null); setI((k) => k + 1); }

  return (
    <Shell title="Défi calcul">
      <div className="row between">
        <span className="pill">Exercice {i + 1} / {tasks.length}</span>
        {mode !== "libre" && <span className="mt-timer" aria-label="Temps"><Timer size={14} aria-hidden="true" /> {label}</span>}
      </div>
      <section className="card stack"><p className="eyebrow">{notionById(tpl.notionId)?.title}</p><p className="statement">{inst.statement}</p></section>
      {shown === null && <>
        <AnswerInput answer={inst.answer} value={input} onChange={setInput} name={`d${i}`} onSubmit={validate} />
        <button className="btn primary block" disabled={!input.trim()} onClick={validate}>Valider</button>
      </>}
      {shown !== null && (
        <section className={`fb ${shown ? "ok" : "bad"}`} role="status">
          <h2>{shown ? "Juste !" : "Raté : on regarde la solution"}</h2>
          {!shown && <p style={{ whiteSpace: "pre-line" }}>{inst.solution}</p>}
          <button className="btn primary block" onClick={next}>{i + 1 >= tasks.length ? "Voir mon résultat" : "Suivant"}</button>
        </section>
      )}
    </Shell>
  );
}

// ---------- 3. Ranger les nombres ----------

const ROUNDS = 5;
const SIZE = 5;
interface Num { text: string; value: number }
function makeNumbers(level: string, r: () => number): Num[] {
  const idx = levelIndex(level as never);
  const set = new Map<number, Num>();
  let guard = 0;
  while (set.size < SIZE && guard++ < 200) {
    let v: number, text: string;
    if (idx < levelIndex("6e")) { v = Math.floor(r() * 99) + 1; text = String(v); }
    else if (idx === levelIndex("6e")) { v = Math.round(r() * 3000) / 100; text = v.toFixed(2).replace(/0$/, "").replace(".", ","); }
    else { v = Math.round((r() * 40 - 20) * 10) / 10; text = String(v).replace(".", ",").replace("-", "−"); }
    if (!set.has(v)) set.set(v, { text, value: v });
  }
  return [...set.values()];
}

function Ranger() {
  const state = useStore();
  const me = currentUser(state)!;
  const level = me.level ?? "tle";
  const [mode, setMode] = useState<TimeMode>("libre");
  const [started, setStarted] = useState(false);
  const limit = 90;
  const [round, setRound] = useState(0);
  const nums = useMemo(() => shuffle(rng(Date.now() % 1e9 + round * 31), makeNumbers(level, rng(Date.now() % 1e9 + round * 17))), [level, round]);
  const sorted = useMemo(() => [...nums].sort((a, b) => a.value - b.value), [nums]);
  const [chosen, setChosen] = useState<Num[]>([]);
  const [slips, setSlips] = useState(0);
  const [msg, setMsg] = useState("");
  const [wrongRounds, setWrongRounds] = useState(0);
  const allDone = round >= ROUNDS;
  const { sec, over, label } = useTimer(mode, limit, started && !allDone);
  const finished = allDone || over;
  const notionId = levelIndex(level) <= levelIndex("6e") ? nid("maths", "6e", "Décimaux et opérations") : nid("maths", "5e", "Nombres relatifs");

  function pick(n: Num) {
    if (finished) return;
    const want = sorted[chosen.length];
    if (n.value === want.value) {
      const c = [...chosen, n];
      setChosen(c); setMsg("");
      if (c.length === sorted.length) {
        if (notionById(notionId)) recordEvidence({ studentId: me.id, notionId, source: "jeu", score: slips === 0 ? 1 : 0.5 });
        setWrongRounds((w) => w + (slips ? 1 : 0));
        setRound((r) => r + 1); setChosen([]); setSlips(0);
      }
    } else {
      setSlips((s) => s + 1);
      setMsg("Pas celui-là : cherche le plus petit parmi ceux qui restent. Pense aux nombres négatifs et aux décimales.");
    }
  }

  if (!started) {
    return (
      <Shell title="Ranger les nombres">
        <p className="muted">Clique sur les nombres du <b>plus petit au plus grand</b>. {ROUNDS} manches.</p>
        <ModePicker mode={mode} onPick={setMode} limit={limit} />
        <button className="btn primary block" onClick={() => setStarted(true)}>Jouer</button>
      </Shell>
    );
  }
  if (finished) {
    return (
      <Shell title="Ranger les nombres">
        <section className="card stack center" role="status">
          <h2>{over ? "Temps écoulé" : "Bravo !"}</h2>
          <p className="lead">{round - wrongRounds} manche{round - wrongRounds > 1 ? "s" : ""} sans erreur sur {Math.min(round, ROUNDS)}{mode !== "libre" ? ` • ${sec} s` : ""}</p>
          <button className="btn primary" onClick={() => window.location.reload()}>Rejouer</button>
          <Link className="btn link" to="/jeux">Retour aux jeux</Link>
        </section>
      </Shell>
    );
  }
  return (
    <Shell title="Ranger les nombres">
      <div className="row between">
        <span className="pill">Manche {round + 1} / {ROUNDS}</span>
        {mode !== "libre" && <span className="mt-timer" aria-label="Temps"><Timer size={14} aria-hidden="true" /> {label}</span>}
      </div>
      <div className="mt-slots" aria-label="Ton classement">{sorted.map((_, i) => <span key={i} className={chosen[i] ? "full" : ""}>{chosen[i]?.text ?? i + 1}</span>)}</div>
      <div className="mt-order" role="group" aria-label="Nombres à ranger">
        {nums.map((n) => <button key={n.text} type="button" disabled={chosen.some((c) => c.value === n.value)} onClick={() => pick(n)}>{n.text}</button>)}
      </div>
      {msg && <div className="mt-err" role="alert">{msg}</div>}
    </Shell>
  );
}
