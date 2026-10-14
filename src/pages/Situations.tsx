import { FlaskConical, Puzzle } from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton, ChevronRight } from "../components/ui";
import { PROBLEMES_SITUES } from "../content/problemes-situes";
import { SIMULATIONS } from "../content/simulations";
import { levelById, levelIndex, notionById } from "../curriculum";
import { currentUser, useStore } from "../store";
import "../methodes.css";

/** Exercices contextualisés (problèmes de la vie réelle) et simulations interactives. */
export default function Situations() {
  const me = currentUser(useStore())!;
  const level = me.level ?? "tle";
  const problems = PROBLEMES_SITUES.filter((p) => p.niveau === level && (!p.series.length || !me.serie || p.series.includes(me.serie)));
  const sims = SIMULATIONS.filter((s) => levelIndex(s.level) <= levelIndex(level));
  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><Puzzle size={26} aria-hidden="true" /> Situations et simulations</h1></div>
      <p className="muted">Les maths et les sciences servent à comprendre des situations réelles. Ici, tu appliques ce que tu sais et tu changes les valeurs pour voir ce qui se passe.</p>

      <h2 style={{ fontSize: "1.15rem" }}>Simulations</h2>
      {sims.length === 0 && <p className="card">Pas encore de simulation pour ta classe.</p>}
      {sims.map((s) => (
        <Link key={s.id} to={`/simulation/${s.id}`} className="list-card">
          <span className="icon-tile sm" aria-hidden="true"><FlaskConical size={22} /></span>
          <div className="grow"><h3>{s.title}</h3><p className="muted small">{notionById(s.notionId)?.title} • {levelById(s.level).label}</p></div>
          <ChevronRight size={22} aria-hidden="true" />
        </Link>
      ))}

      <h2 style={{ fontSize: "1.15rem" }}>Problèmes de la vie réelle</h2>
      {problems.length === 0 && <p className="card">Pas encore de problème de situation pour {levelById(level).label}. Les problèmes sont ajoutés classe par classe, après vérification.</p>}
      {problems.map((p) => (
        <Link key={p.id} to={`/probleme/${p.id}`} className="list-card">
          <span className="icon-tile sm" aria-hidden="true"><Puzzle size={22} /></span>
          <div className="grow"><h3>{p.titre}</h3><p className="muted small">{p.contexteLabel} • {p.competence}{p.statut !== "valide-enseignant" ? " • pas encore relu par un enseignant" : ""}</p></div>
          <ChevronRight size={22} aria-hidden="true" />
        </Link>
      ))}
    </main>
  );
}
