import { Check, Footprints, Lightbulb } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { AnswerInput } from "../components/AnswerInput";
import { NotebookGate, useNotebook, WrittenCheck } from "../components/Notebook";
import { BackButton, ChevronRight, ProgressBar } from "../components/ui";
import { ExerciseActions } from "../components/ExerciseActions";
import { Answer } from "../content/core";
import { errInfo } from "../content/erreurs";
import { checkStep, ETAPES, etapeById, instancierEtape } from "../content/etapes";
import { levelById, notionById } from "../curriculum";
import { recordAttempt, recordEvidence } from "../lib/knowledge";
import { attemptsOf } from "../lib/stats";
import { canAccessNotion, canViewSolution, currentUser, modeFor, uid, useStore } from "../store";
import "../methodes.css";

const fmt = (a: Answer) => (a.kind === "choice" ? a.options[a.index] : String(a.value).replace(".", ",").replace("-", "−"));

/** Liste des exercices pas à pas de la classe de l'élève. */
export function EtapesList() {
  const state = useStore();
  const me = currentUser(state)!;
  const mine = attemptsOf(state, me.id);
  const level = me.level ?? "tle";
  const list = ETAPES.filter((e) => e.level === level);
  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><Footprints size={26} aria-hidden="true" /> Pas à pas</h1></div>
      <p className="muted">Ici, on ne te demande pas seulement le résultat : tu écris chaque étape de ton raisonnement. Chaque étape est vérifiée, et si tu te trompes, on t'explique pourquoi.</p>
      {list.length === 0 && <p className="card">Il n'y a pas encore d'exercice pas à pas pour {levelById(level).label}. Les autres méthodes (cartes, tuteur, jeux) restent disponibles.</p>}
      {list.map((e) => {
        const done = mine.filter((a) => a.templateId === `et:${e.id}` && a.correct).length;
        return (
          <Link key={e.id} to={`/etapes/${e.id}`} className="list-card">
            <span className="icon-tile sm" aria-hidden="true"><Footprints size={22} /></span>
            <div className="grow"><h3>{e.title}</h3><p className="muted small">{notionById(e.notionId)?.title} • {"●".repeat(e.difficulty)}{"○".repeat(3 - e.difficulty)}{done ? ` • réussi ${done} fois` : ""}</p></div>
            <ChevronRight size={22} aria-hidden="true" />
          </Link>
        );
      })}
    </main>
  );
}

/** Une nouvelle variante repart de zéro : l'écran est recréé quand l'adresse change. */
export default function Etapes() {
  const loc = useLocation();
  return <EtapesInner key={loc.pathname + loc.search} />;
}

interface Done { text: string; why: string; prompt: string; revealed: boolean }

function EtapesInner() {
  const { id = "" } = useParams();
  const state = useStore();
  const me = currentUser(state)!;
  const e = etapeById(id);
  const notion = e ? notionById(e.notionId) : undefined;
  const seed = useMemo(() => Number(new URLSearchParams(window.location.search).get("seed")) || 1 + Math.floor(Math.random() * 1e6), []);
  const inst = useMemo(() => (e ? instancierEtape(e, seed) : null), [e, seed]);

  const [k, setK] = useState(0);
  const [input, setInput] = useState("");
  const [done, setDone] = useState<Done[]>([]);
  const [hint, setHint] = useState(false);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<{ title: string; text: string } | null>(null);
  const [hints, setHints] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [written, setWritten] = useState(false);
  const nb = useNotebook();
  const busy = useRef(false);

  if (!e || !inst || !notion || !canAccessNotion(me, notion)) return <Navigate to="/etapes" replace />;

  if (!nb.ready) return <NotebookGate onReady={nb.confirm} back={() => history.back()} />;
  const mode = modeFor(state, me.id);
  const step = inst.steps[k];
  const total = inst.steps.length;

  function finish(all: Done[], wrongTags: string[], helped: number) {
    const revealed = all.some((d) => d.revealed);
    recordAttempt({
      id: uid(), studentId: me.id, templateId: `et:${e!.id}`, notionId: e!.notionId, ctx: "etapes", seed,
      correct: !revealed, helpLevel: Math.min(4, helped + wrongTags.length), solutionViewed: revealed, solutionViewedBeforeAttempt: false, kind: "practice",
    });
    setFinished(true);
  }

  function next(text: string, revealed: boolean, helped = hints, wrongTags = wrong) {
    const all = [...done, { text, why: step.why, prompt: step.prompt, revealed }];
    setDone(all); setInput(""); setHint(false); setTries(0); setMsg(null);
    busy.current = false;
    if (k + 1 >= total) finish(all, wrongTags, helped); else setK(k + 1);
  }

  function check() {
    if (!input.trim() || busy.current || (nb.need && !written)) return;
    busy.current = true;
    const v = checkStep(step, input);
    if (v.ok) { next(step.answer.kind === "choice" ? step.answer.options[step.answer.index] : input.trim(), false); return; }
    const tag = v.tag ?? "calcul";
    recordEvidence({ studentId: me.id, notionId: e!.notionId, source: "etapes", score: 0, errTag: tag, ref: `et:${e!.id}` });
    setWrong((w) => [...w, tag]);
    setTries((t) => t + 1);
    setMsg({ title: errInfo(tag).label, text: v.message ?? errInfo(tag).advice });
    busy.current = false;
  }

  const back = "/etapes";

  // ---------- Fin ----------
  if (finished) {
    const tags = [...new Set(wrong)];
    return (
      <main className="shell wide no-nav stack">
        <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to={back} /><h1 style={{ fontSize: "1.4rem" }}>{e.title}</h1></div>
        <ExerciseActions title={e.title} url={`/etapes/${encodeURIComponent(e.id)}?seed=${seed}`} />
        <section className="fb ok" role="status">
          <header><span className="ic"><Check size={28} aria-hidden="true" /></span><div><h2>Exercice terminé</h2><p>{inst.conclusion}</p></div></header>
        </section>
        <ol className="mt-steps">
          {done.map((d, i) => (
            <li key={i} className="mt-step done"><span className="n">{i + 1}</span><div><p>{d.prompt}</p><p><b>{d.text}</b>{d.revealed ? " (réponse montrée)" : ""}</p><p className="mt-why">{d.why}</p></div></li>
          ))}
        </ol>
        {tags.length > 0 ? (
          <section className="card stack-sm">
            <h2 style={{ fontSize: "1.1rem" }}>Ce qui t'a fait trébucher</h2>
            {tags.map((t) => <p key={t}><b>{errInfo(t).label}.</b> {errInfo(t).advice}</p>)}
            <p className="muted small">Ces erreurs sont gardées dans « Mes erreurs » : si elles reviennent, on te proposera des exercices ciblés.</p>
          </section>
        ) : (
          <p className="callout">Aucune erreur sur cet exercice : chaque étape était juste.</p>
        )}
        <Link className="btn primary block" to={`/etapes/${e.id}?r=${Math.floor(Math.random() * 1e6)}`}>Un autre exercice du même type</Link>
        <Link className="btn ghost block" to="/etapes">Choisir un autre exercice</Link>
      </main>
    );
  }

  // ---------- Étape en cours ----------
  return (
    <main className="shell wide no-nav stack">
      <div className="topline"><BackButton to={back} label="Quitter" /><ProgressBar value={(done.length / total) * 100} label="Étapes réussies" /></div>
      <p className="eyebrow">{e.title} • étape {k + 1} sur {total}</p>
      <ExerciseActions title={e.title} url={`/etapes/${encodeURIComponent(e.id)}?seed=${seed}`} />
      <section className="card"><p className="statement">{inst.statement}</p></section>

      {done.length > 0 && (
        <ol className="mt-steps" aria-label="Étapes déjà réussies">
          {done.map((d, i) => <li key={i} className="mt-step done"><span className="n">{i + 1}</span><div><p>{d.prompt}</p><p><b>{d.text}</b></p></div></li>)}
        </ol>
      )}

      <section className="mt-step now" aria-live="polite">
        <span className="n">{k + 1}</span>
        <div className="stack-sm" style={{ flex: 1 }}>
          <p><b>{step.prompt}</b></p>
          {nb.need && <WrittenCheck checked={written} onChange={setWritten} />}
          <AnswerInput answer={step.answer} value={input} onChange={setInput} name={`e${k}`} onSubmit={check} />
          {hint && <div className="tip" role="note"><Lightbulb size={22} aria-hidden="true" /><span>{step.hint}</span></div>}
        </div>
      </section>

      {msg && (
        <div className="mt-err" role="alert">
          <strong>{msg.title}</strong>
          {msg.text}
        </div>
      )}

      <div className="actions">
        <button className="btn ghost" disabled={hint} onClick={() => { setHint(true); setHints((h) => h + 1); }}><Lightbulb size={20} aria-hidden="true" /> Indice</button>
        <button className="btn primary" disabled={!input.trim() || (nb.need && !written)} onClick={check}>Vérifier cette étape</button>
      </div>
      {tries >= 2 && canViewSolution(mode, true) && (
        <button className="btn link" onClick={() => next(fmt(step.answer), true)}>Voir la réponse de cette étape et continuer</button>
      )}
      {tries >= 2 && !canViewSolution(mode, true) && <p className="small muted">Les corrigés sont bloqués par ton parent : utilise l'indice ou demande de l'aide au tuteur.</p>}
      <p className="center small" style={{ margin: 0 }}>
        <Link className="btn link" to={`/tuteur?notion=${encodeURIComponent(e.notionId)}`}>Besoin d'aide du tuteur ?</Link>
      </p>
    </main>
  );
}
