import { Languages, Search } from "lucide-react";
import { useState } from "react";
import { BackButton } from "../components/ui";
import { IRREGULIERS, REGULIERS, Verbe } from "../content/verbes";

type Tab = "irr" | "reg";

/** Tableau complet des verbes anglais : irréguliers (3 formes) et réguliers (-ed), avec le sens en français. */
export default function Verbes() {
  const [tab, setTab] = useState<Tab>("irr");
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list: Verbe[] = (tab === "irr" ? IRREGULIERS : REGULIERS).filter((v) => !term || `${v.inf} ${v.past} ${v.pp} ${v.fr}`.toLowerCase().includes(term));
  const sorted = [...list].sort((a, b) => a.inf.localeCompare(b.inf));

  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <BackButton to="/exercices" />
        <h1 className="row" style={{ flexWrap: "nowrap" }}><Languages size={28} className="h1-ic" aria-hidden="true" /> Verbes anglais</h1>
      </div>
      <p className="muted">{IRREGULIERS.length} verbes irréguliers et {REGULIERS.length} verbes réguliers. Apprends les trois formes par cœur : infinitif, prétérit (past simple), participe passé.</p>
      <div className="chips" role="group" aria-label="Type de verbes">
        <button type="button" className={tab === "irr" ? "chip active" : "chip"} aria-pressed={tab === "irr"} onClick={() => setTab("irr")}>Irréguliers ({IRREGULIERS.length})</button>
        <button type="button" className={tab === "reg" ? "chip active" : "chip"} aria-pressed={tab === "reg"} onClick={() => setTab("reg")}>Réguliers ({REGULIERS.length})</button>
      </div>
      {tab === "reg" && <p className="callout">Verbe régulier : prétérit et participe passé prennent -ed (-d après un -e ; consonne + y → -ied ; consonne finale doublée après une voyelle brève). Prononciation du -ed : /t/, /d/ ou /ɪd/.</p>}
      <label className="search">
        <Search size={20} aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher : go, aller, bought…" type="search" aria-label="Chercher un verbe" />
      </label>
      <div className="card verbs-wrap">
        <table className="verbs">
          <thead><tr><th>Infinitif</th><th>Past simple</th><th>{tab === "irr" ? "Participe passé" : "Prononciation"}</th><th>Français</th></tr></thead>
          <tbody>
            {sorted.map((v) => (
              <tr key={v.inf}>
                <th scope="row">{v.inf}</th>
                <td>{v.past}</td>
                <td>{tab === "irr" ? v.pp : `-ed = /${v.snd === "id" ? "ɪd" : v.snd}/`}</td>
                <td>{v.fr}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="muted">Aucun verbe trouvé.</p>}
      </div>
    </main>
  );
}
