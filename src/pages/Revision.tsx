import { Brain, Check, Layers, Repeat } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { BackButton, ProgressBar } from "../components/ui";
import { notionById } from "../curriculum";
import { CARD_KIND_LABEL, cardsForLevel, recallOverlap } from "../lib/cards";
import type { Card } from "../lib/cards";
import { dueLabel, nextReview, Rating, RATING_LABEL, reviewCard } from "../lib/knowledge";
import { dueSkills } from "../lib/parcours";
import { attemptsOf } from "../lib/stats";
import { currentUser, useStore } from "../store";
import type { State, User } from "../store";
import "../methodes.css";

type Mode = "cartes" | "rappel" | "revision";
const TITLE: Record<Mode, string> = { cartes: "Cartes mémoire", rappel: "Rappel actif", revision: "Révisions du jour" };
const RATING_Q: Record<Rating, number> = { 1: 1, 2: 3, 3: 4, 4: 5 };

/** Cartes à étudier : d'abord celles dont la révision est due, puis des cartes jamais vues (notions déjà pratiquées en premier). */
function buildQueue(state: State, me: User, mode: Mode, notion: string | null): Card[] {
  const now = Date.now();
  const all = cardsForLevel(me.level ?? "tle").filter((c) => !notion || c.notionId === notion);
  const slot = (c: Card) => state.memory[`${me.id}|${c.id}`];
  const due = all.filter((c) => slot(c) && slot(c).due <= now).sort((a, b) => slot(a).due - slot(b).due);
  const limit = mode === "revision" ? 25 : mode === "rappel" ? 8 : 12;
  if (mode === "revision") return due.slice(0, limit);
  const practised = new Set(attemptsOf(state, me.id).map((a) => a.notionId));
  const textual = (c: Card) => (mode === "rappel" && c.kind === "verbe" ? 1 : 0); // le rappel écrit convient mieux aux énoncés qu'aux verbes
  const fresh = all.filter((c) => !slot(c)).sort((a, b) => Number(!practised.has(a.notionId)) - Number(!practised.has(b.notionId)) || textual(a) - textual(b));
  return [...due.slice(0, limit), ...fresh.slice(0, Math.max(0, limit - due.length))];
}

export default function Revision({ mode }: { mode: Mode }) {
  const loc = useLocation();
  return <RevisionInner key={loc.pathname + loc.search} mode={mode} />;
}

function RevisionInner({ mode }: { mode: Mode }) {
  const state = useStore();
  const me = currentUser(state)!;
  const [params] = useSearchParams();
  const notion = params.get("notion");
  const queue = useMemo(() => buildQueue(state, me, mode, notion), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [text, setText] = useState("");
  const [log, setLog] = useState<Rating[]>([]);
  const busy = useRef(false);
  const skills = dueSkills(state, me.id);
  const back = notion ? `/notion/${encodeURIComponent(notion)}` : "/methodes";

  const header = (
    <div className="row" style={{ flexWrap: "nowrap" }}>
      <BackButton to={back} />
      <h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}>{mode === "rappel" ? <Brain size={26} aria-hidden="true" /> : mode === "cartes" ? <Layers size={26} aria-hidden="true" /> : <Repeat size={26} aria-hidden="true" />} {TITLE[mode]}</h1>
    </div>
  );

  const skillList = skills.length > 0 && (
    <section className="card stack-sm" aria-labelledby="sk">
      <h2 id="sk" style={{ fontSize: "1.1rem" }}>Compétences à réviser en exercices</h2>
      <p className="muted small">3 exercices par compétence suffisent pour entretenir le souvenir.</p>
      {skills.slice(0, 6).map(({ item, templateId, notion: n }) => (
        <Link key={item.key} className="btn ghost" style={{ justifyContent: "flex-start", textAlign: "left" }} to={`/serie/${encodeURIComponent(n!.id)}?t=${encodeURIComponent(templateId)}&drill=1&n=3&rev=1`}>
          {n!.title}
        </Link>
      ))}
    </section>
  );

  // ---------- Rien à étudier ----------
  if (queue.length === 0) {
    return (
      <main className="shell wide no-nav stack">
        {header}
        <section className="card stack">
          <h2>{mode === "revision" ? "Rien à réviser aujourd'hui" : "Pas de carte pour le moment"}</h2>
          <p className="muted">
            {mode === "revision"
              ? "Tes prochaines révisions apparaîtront ici quand elles seront dues. Les notions que tu maîtrises reviennent de moins en moins souvent."
              : cardsForLevel(me.level ?? "tle").length === 0
                ? "Les cartes de ta classe ne sont pas encore prêtes."
                : "Tu as tout vu pour l'instant. Reviens demain : les cartes à revoir reviendront au bon moment."}
          </p>
          <Link className="btn primary" to="/methodes">Retour aux méthodes</Link>
        </section>
        {skillList}
      </main>
    );
  }

  // ---------- Fin de la séance ----------
  if (i >= queue.length) {
    const count = (r: Rating) => log.filter((x) => x === r).length;
    return (
      <main className="shell wide no-nav stack">
        {header}
        <section className="card stack center" role="status">
          <h2>Séance terminée !</h2>
          <p className="lead">{log.length} carte{log.length > 1 ? "s" : ""} revue{log.length > 1 ? "s" : ""}.</p>
          <div className="stats3">
            <div><b>{count(4) + count(3)}</b><span>Bien ou facile</span></div>
            <div><b>{count(2)}</b><span>Difficiles</span></div>
            <div><b>{count(1)}</b><span>À revoir</span></div>
          </div>
          <p className="muted">Les cartes « à revoir » reviennent demain ; celles que tu connais bien reviendront dans quelques jours, puis quelques semaines.</p>
          <Link className="btn primary" to={mode === "rappel" ? "/rappel" : "/cartes"} reloadDocument>Continuer avec d'autres cartes</Link>
          <Link className="btn link" to="/methodes">Retour aux méthodes</Link>
        </section>
        {skillList}
      </main>
    );
  }

  const card = queue[i];
  const n = notionById(card.notionId);
  const mem = state.memory[`${me.id}|${card.id}`];
  const overlap = mode === "rappel" && shown ? recallOverlap(text, card.back) : null;
  const suggested: Rating | null = overlap ? (overlap.ratio >= 0.85 ? 4 : overlap.ratio >= 0.6 ? 3 : overlap.ratio >= 0.3 ? 2 : 1) : null;

  function rate(r: Rating) {
    if (busy.current) return;
    busy.current = true;
    reviewCard(me.id, card, r, mode === "rappel" ? "rappel" : "carte");
    setLog((l) => [...l, r]);
    setShown(false); setText(""); setI((k) => k + 1);
    busy.current = false;
  }

  return (
    <main className="shell wide no-nav stack">
      {header}
      <ProgressBar value={(i / queue.length) * 100} label="Avancement de la séance" />
      <p className="muted small">Carte {i + 1} sur {queue.length}{n ? ` • ${n.title}` : ""}</p>

      <section className="mt-flash" aria-live="polite">
        <span className="kind">{CARD_KIND_LABEL[card.kind]}{mem ? ` • revue ${mem.reps + mem.lapses} fois` : " • nouvelle"}</span>
        <p className="front">{card.front}</p>
        {shown && <p className="back">{card.back}</p>}
      </section>

      {!shown && mode === "rappel" && (
        <div className="mt-recall stack-sm">
          <label htmlFor="recall"><b>Sans regarder le cours</b>, écris ce dont tu te souviens :</label>
          <textarea id="recall" value={text} onChange={(e) => setText(e.target.value)} placeholder="Écris avec tes mots, même si ce n'est pas parfait…" />
          <button className="btn primary block" onClick={() => setShown(true)}>{text.trim() ? "Vérifier ma réponse" : "Je ne sais pas : voir la réponse"}</button>
        </div>
      )}
      {!shown && mode !== "rappel" && (
        <>
          <p className="muted center">Réponds dans ta tête (ou à voix haute), puis retourne la carte.</p>
          <button className="btn primary block" onClick={() => setShown(true)}>Retourner la carte</button>
        </>
      )}

      {shown && (
        <>
          {overlap && text.trim() && (
            <section className="card stack-sm" role="status">
              <p><b>{overlap.found.length} idée{overlap.found.length > 1 ? "s" : ""} retrouvée{overlap.found.length > 1 ? "s" : ""} sur {overlap.found.length + overlap.missing.length}.</b> C'est une aide : c'est toi qui juges.</p>
              <div className="mt-kw">
                {overlap.found.map((w) => <span key={w} className="ok"><Check size={12} aria-hidden="true" /> {w}</span>)}
                {overlap.missing.map((w) => <span key={w} className="ko">à retenir : {w}</span>)}
              </div>
            </section>
          )}
          <p className="center"><b>Comment c'était ?</b></p>
          <div className="mt-rate" role="group" aria-label="Comment c'était ?">
            {([1, 2, 3, 4] as Rating[]).map((r) => (
              <button key={r} type="button" className={suggested === r ? "suggest" : ""} onClick={() => rate(r)}>
                {RATING_LABEL[r]}
                <small>{dueLabel(nextReview(mem, RATING_Q[r], Date.now(), { key: card.id, studentId: me.id, notionId: card.notionId }).due)}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
