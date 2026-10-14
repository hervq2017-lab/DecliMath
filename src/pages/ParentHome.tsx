import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ChildAccess from "./ChildAccess";
import { Chip, ParentChildNav, ProgressBar, StreakChip, TopBar } from "../components/ui";
import { countryByCode, levelById, notionsOf, SUBJECT_LABEL, subjectsAt } from "../curriculum";
import { hasContent } from "../engine";
import { attemptsOf, minutesSpent, pointsOf, relativeDay, streak, weekDays } from "../lib/stats";
import { currentUser, logOut, MASTERY_LABEL, masteryFor, SolutionMode, studentsOf, update, useStore } from "../store";

const MODES: { value: SolutionMode; label: string; help: string }[] = [
  { value: "free", label: "Autoriser", help: "Après une première réponse, le corrigé est toujours accessible." },
  { value: "deferred", label: "Différer", help: "Le corrigé se débloque après avoir essayé, avec des indices d'abord." },
  { value: "blocked", label: "Bloquer", help: "Aucun corrigé : l'élève avance avec les indices et la correction guidée de l'application." },
];
const DAY = 864e5;

export default function ParentHome() {
  const state = useStore();
  const me = currentUser(state)!;
  const children = studentsOf(state, me.id);
  const [sel, setSel] = useState<string | null>(null);
  const child = children.find((c) => c.id === sel) ?? children[0];
  const weekStart = new Date(Date.now() - ((new Date().getDay() + 6) % 7) * DAY).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <>
    {child && <ParentChildNav id={child.id} />}
    <TopBar name={me.name} sub={child ? `Voici le résumé de la semaine de ${child.name}.` : "Invitez votre enfant pour suivre ses progrès."} />
    <main className="shell wide stack">
      <header className="row between">
        <div className="row"><span className="pill">Espace parent</span><span className="muted" style={{ fontWeight: 600 }}>Semaine du {weekStart} • 10 secondes</span></div>
        <button className="btn link" onClick={logOut}>Déconnexion</button>
      </header>

      <ChildAccess parentId={me.id} />
      {children.length === 0 && (
        <section className="card stack">
          <h1>Bienvenue {me.name}</h1>
          <p>Invitez votre enfant avec ce code, à saisir à son inscription ou depuis son profil :</p>
          <p className="big" style={{ letterSpacing: ".15em" }}>{me.inviteCode}</p>
          <p className="muted small">{countryByCode(me.country).name} • Vous verrez ses efforts et ses progrès, jamais de notes.</p>
        </section>
      )}
      {children.length > 0 && (
        <section aria-labelledby="mes-enfants" className="stack-sm">
          <h2 id="mes-enfants" style={{ fontSize: "1.15rem" }}>{children.length > 1 ? "Mes enfants" : "Mon enfant"}</h2>
          <div className="kids">
            {children.map((c) => <Kid key={c.id} id={c.id} selected={c.id === child?.id} onSelect={() => setSel(c.id)} />)}
          </div>
        </section>
      )}
      {child && <Child key={child.id} id={child.id} code={me.inviteCode ?? ""} />}
    </main>
    </>
  );
}

function Kid({ id, selected, onSelect }: { id: string; selected: boolean; onSelect: () => void }) {
  const state = useStore();
  const c = state.users.find((u) => u.id === id)!;
  const level = c.level ?? "tle";
  const all = attemptsOf(state, id);
  const week = all.filter((a) => Date.now() - a.ts < 7 * DAY);
  const days = weekDays(all).filter((d) => d.active).length;
  const notions = subjectsAt(level).flatMap((s) => notionsOf(s, level)).filter((n) => hasContent(n.id));
  const mastered = notions.filter((n) => ["mastered", "expert"].includes(masteryFor(state, id, n.id).status)).length;
  const pct = notions.length ? Math.round((mastered / notions.length) * 100) : 0;
  const last = all.length ? Math.max(...all.map((a) => a.ts)) : 0;
  const country = countryByCode(c.country);
  return (
    <article className={`card kid${selected ? " sel" : ""}`} aria-label={`Résumé de ${c.name}`}>
      <div className="row between">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <span className="avatar" aria-hidden="true">{c.name[0]?.toUpperCase()}</span>
          <div>
            <h3>{c.name}</h3>
            <p className="muted small" style={{ fontWeight: 600 }}>{levelById(level).label} • {country.name}</p>
            <p className="muted small">{last ? `Dernière activité : ${relativeDay(last)}` : "Pas encore d'activité"}</p>
          </div>
        </div>
        <StreakChip n={streak(all)} />
      </div>
      <div className="meta">
        <div><b>{days}/7</b><span>Jours actifs</span></div>
        <div><b>{minutesSpent(week)} min</b><span>Cette semaine</span></div>
        <div><b>+{week.reduce((s, a) => s + pointsOf(a), 0)}</b><span>Pts d'effort</span></div>
      </div>
      <div className="stack-sm">
        <ProgressBar value={pct} tone="green" label={`Maîtrise de ${c.name}`} />
        <p className="muted small" style={{ fontWeight: 600 }}>{mastered}/{notions.length} notions maîtrisées</p>
      </div>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <button type="button" className={selected ? "btn primary grow" : "btn ghost grow"} aria-pressed={selected} onClick={onSelect}>{selected ? "Détail affiché" : "Voir le détail"}</button>
        <Link className="btn ghost grow" to={`/enfant/${id}`}>Son écran</Link>
      </div>
    </article>
  );
}

function Child({ id, code }: { id: string; code: string }) {
  const state = useStore();
  const child = state.users.find((u) => u.id === id)!;
  const level = child.level ?? "tle";
  const all = attemptsOf(state, id);
  const week = all.filter((a) => Date.now() - a.ts < 7 * DAY);
  const days = weekDays(all).filter((d) => d.active).length;
  const mins = minutesSpent(week), pts = week.reduce((s, a) => s + pointsOf(a), 0);
  const mode = state.solutionMode[id] ?? "deferred";
  const exams = state.exams.filter((e) => e.studentId === id && e.status === "done");
  const goal = state.goals[id] ?? "";
  const [plan, setPlan] = useState(false);

  const notions = subjectsAt(level).flatMap((s) => notionsOf(s, level)).filter((n) => hasContent(n.id));
  const rows = notions.map((n) => ({ n, m: masteryFor(state, id, n.id) }));
  const good = rows.filter((r) => r.m.count > 0 && r.m.rate >= 0.7).sort((a, b) => b.m.rate - a.m.rate)[0];
  const todo = rows.filter((r) => r.m.status === "fragile" || (r.m.count > 0 && r.m.rate < 0.5)).sort((a, b) => a.m.rate - b.m.rate)[0];
  const headline = days >= 4 ? `${child.name} a fait des efforts réguliers.` : days >= 1 ? `${child.name} a repris le rythme.` : `${child.name} n'a pas encore travaillé cette semaine.`;
  const sentence = days === 0
    ? "Pas d'activité ces 7 derniers jours. Un petit rendez-vous de 10 minutes peut relancer la machine."
    : `${child.name} s'entraîne ${days} jour${days > 1 ? "s" : ""} sur 7${good ? `, progresse en ${good.n.title.toLowerCase()}` : ""}${todo ? ` et doit encore muscler ${todo.n.title.toLowerCase()}` : ""}. Encouragez la régularité, pas la note.`;
  const say = days === 0
    ? `« Et si on faisait un exercice ensemble ce soir ? Dix minutes, sans pression. »`
    : `« J'ai vu ta série de ${days} jour${days > 1 ? "s" : ""}, bravo pour l'effort.${todo ? ` On revoit ${todo.n.title.toLowerCase()} ensemble ?` : ""} »`;
  const weakList = rows.filter((r) => r.m.status === "fragile" || r.m.status === "none" || r.m.status === "started").slice(0, 3);

  return (
    <div className="stack parent-detail">
      <h1 className="full">{headline}</h1>
      <p className="muted full" style={{ fontWeight: 600 }}>{levelById(level).label} • {SUBJECT_LABEL[subjectsAt(level)[0]]} et plus</p>
      <section className="grid3 full" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <div className="statcard"><b>{days}/7</b><span>Jours actifs</span></div>
        <div className="statcard"><b>{mins} min</b><span>Temps total</span></div>
        <div className="statcard"><b>+{pts}</b><span>Pts d'effort</span></div>
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: "1.05rem" }}>En une phrase</h2>
        <p style={{ fontSize: "1.1rem" }}>{sentence}</p>
        <div className="grid2">
          <div className="fm good"><p className="k">Ça roule</p><h3>{good?.n.title ?? "À venir"}</h3></div>
          <div className="fm todo"><p className="k">À soutenir</p><h3>{todo?.n.title ?? "Rien d'urgent"}</h3></div>
        </div>
      </section>

      <section className="card stack" aria-labelledby="voir">
        <h2 id="voir" style={{ fontSize: "1.05rem" }}>Voir ce que {child.name} voit</h2>
        <p className="muted small">Les mêmes écrans que {child.name}, en lecture seule.</p>
        <div className="child-links">
          {[["", "Accueil"], ["/exercices", "Exercices"], ["/reponses", "Réponses"], ["/progres", "Progrès"], ["/profil", "Profil"]].map(([p, l]) => (
            <Link key={l} className="btn ghost" to={`/enfant/${id}${p}`}>{l}</Link>
          ))}
        </div>
      </section>

      <section className="say"><span className="icon-tile yellow sm"><MessageCircle size={22} aria-hidden="true" /></span><p>Phrase à tester ce soir : {say}</p></section>

      <button className="btn primary block full" aria-expanded={plan} onClick={() => setPlan(!plan)}>Voir le plan de la semaine</button>
      {plan && (
        <section className="card stack full" aria-label="Plan de la semaine">
          <h2 style={{ fontSize: "1.05rem" }}>Plan de la semaine</h2>
          {weakList.length ? <ol>{weakList.map((r) => <li key={r.n.id}>{r.n.title} — {MASTERY_LABEL[r.m.status].toLowerCase()}</li>)}</ol> : <p className="muted">Tout est sous contrôle.</p>}
          <label className="lbl">Votre objectif pour la semaine<input className="field" value={goal} placeholder="ex. 3 séances de fractions" onChange={(e) => update((s) => ({ ...s, goals: { ...s.goals, [id]: e.target.value } }))} /></label>
        </section>
      )}

      <section className="card stack" aria-labelledby="corr">
        <h2 id="corr" style={{ fontSize: "1.05rem" }}>Contrôle des corrigés</h2>
        <div className="chips" role="group" aria-label="Règle des corrigés">
          {MODES.map((m) => <Chip key={m.value} active={mode === m.value} onClick={() => update((s) => ({ ...s, solutionMode: { ...s.solutionMode, [id]: m.value } }))}>{m.label}</Chip>)}
        </div>
        <p className="muted small">{MODES.find((m) => m.value === mode)?.help}</p>
      </section>

      <details className="card full">
        <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--ink)", minHeight: 44, display: "flex", alignItems: "center" }}>Détails pour les parents qui veulent (par notion, épreuves)</summary>
        <div className="stack" style={{ marginTop: 12 }}>
          {rows.map(({ n, m }) => (
            <div key={n.id} className="progress-row"><span>{n.title}</span><span className={`badge ${m.status}`}>{MASTERY_LABEL[m.status]}</span></div>
          ))}
          {exams.length > 0 && <h3>Épreuves passées</h3>}
          {[...exams].reverse().map((e) => <div key={e.id} className="progress-row"><span>{e.label}</span><strong>{e.score}/{e.outOf}</strong></div>)}
        </div>
      </details>

      <p className="muted small center full">Zéro note affichée dans le résumé • Que des efforts et des progrès.</p>
      <section className="card stack-sm full">
        <p className="muted small">Code d'invitation pour un autre enfant : <strong className="big" style={{ fontSize: "1.1rem", letterSpacing: ".1em" }}>{code}</strong></p>
      </section>
    </div>
  );
}
