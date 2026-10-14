import { BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "../components/ui";
import { levelById, LevelId } from "../curriculum";
import { PROPRIETES, PROPRIETES_LEVELS } from "../content/proprietes";
import { PROPRIETES_CIAM } from "../content/proprietes-ciam";
import { norm } from "../lib/search";
import { currentUser, useStore } from "../store";

interface Row { titre: string; enonce: string; page?: string }
interface Bloc { key: string; level: LevelId; titre: string; notionId?: string; items: Row[] }

/** Propriétés d'une classe : le manuel CIAM quand il a été relu, sinon la liste générale de l'application. */
function blocsOf(level: LevelId): Bloc[] {
  const ciam = PROPRIETES_CIAM[level];
  if (ciam) return ciam.chapitres.map((c) => ({ key: `${level}-${c.numero}-${c.notionId ?? c.chapitre}`, level, titre: `${c.numero}. ${c.chapitre}`, notionId: c.notionId, items: c.items }));
  return (PROPRIETES[level] ?? []).map((c) => ({ key: `${level}-${c.chapitre}`, level, titre: c.chapitre, items: c.items }));
}

/** Rubrique « Propriétés » : l'essentiel à connaître, classe par classe, avec recherche dans toutes les classes. */
export default function Proprietes() {
  const me = currentUser(useStore())!;
  const mine = me.level && PROPRIETES_LEVELS.includes(me.level) ? me.level : "6e";
  const [level, setLevel] = useState<LevelId>(mine);
  const [q, setQ] = useState("");
  const tokens = norm(q).split(/\s+/).filter((t) => t.length >= 2);
  const searching = tokens.length > 0;

  const blocs: Bloc[] = (searching ? PROPRIETES_LEVELS : [level])
    .flatMap(blocsOf)
    .map((b) => ({ ...b, items: b.items.filter((p) => !searching || tokens.every((t) => norm(`${b.titre} ${p.titre} ${p.enonce}`).includes(t))) }))
    .filter((b) => b.items.length);
  const ciam = PROPRIETES_CIAM[level];

  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <BackButton to="/exercices" />
        <h1 className="row" style={{ flexWrap: "nowrap" }}><BookOpen size={28} className="h1-ic" aria-hidden="true" /> Propriétés</h1>
      </div>
      <p className="muted">Les propriétés à connaître par cœur, classe par classe. Cherche un mot (« médiatrice », « divisible », « pourcentage »…) : la recherche porte sur toutes les classes.</p>
      <label className="search">
        <Search size={20} aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher : médiatrice, Pythagore, dérivée…" type="search" aria-label="Chercher une propriété" />
      </label>
      {!searching && (
        <>
          <div className="chips scroll" role="group" aria-label="Classe">
            {PROPRIETES_LEVELS.map((l) => <button key={l} type="button" className={level === l ? "chip active" : "chip"} aria-pressed={level === l} onClick={() => setLevel(l)}>{levelById(l).label}{l === mine ? " ★" : ""}</button>)}
          </div>
        </>
      )}
      {blocs.length === 0 && <p className="muted">Aucune propriété trouvée.</p>}
      {blocs.map((c) => (
        <section key={c.key} className="card stack-sm" aria-labelledby={`p-${c.key}`}>
          <h2 id={`p-${c.key}`} style={{ fontSize: "1.1rem" }}>{searching ? `${levelById(c.level).label} • ` : ""}{c.titre}</h2>
          {c.items.map((p) => (
            <div key={p.titre} className="prop">
              <h3>{p.titre}</h3>
              <p>{p.enonce}</p>
            </div>
          ))}
          {c.notionId && (me.role === "admin" || c.level === me.level) && <Link className="btn ghost" to={`/notion/${encodeURIComponent(c.notionId)}`}>S'exercer sur ce chapitre</Link>}
        </section>
      ))}
    </main>
  );
}
