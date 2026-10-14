import { Copy, KeyRound, Plus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { levelById, LEVELS, LevelId, seriesAt } from "../curriculum";
import { addChildren, regenerateAccess, regenerateLogin, studentsOf, useStore } from "../store";

/** Accès de connexion des enfants : visibles, copiables et régénérables à volonté par le parent. */
export default function ChildAccess({ parentId }: { parentId: string }) {
  const state = useStore();
  const children = studentsOf(state, parentId);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LevelId>("3e");
  const [serie, setSerie] = useState("");

  const copy = (login: string, password: string) => {
    navigator.clipboard?.writeText(`Identifiant : ${login}\nMot de passe : ${password}`).catch(() => {});
    setFlash(login);
  };

  return (
    <section className="card stack" aria-labelledby="acces">
      <h2 id="acces" style={{ fontSize: "1.05rem" }}><KeyRound size={18} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Accès de connexion de mes enfants</h2>
      <p className="muted small">Chaque enfant se connecte avec son identifiant et son mot de passe. Générez-en un nouveau autant de fois que nécessaire : l'ancien cesse alors de fonctionner.</p>
      {children.map((c) => {
        const open = !!shown[c.id];
        return (
          <article key={c.id} className="stack-sm" style={{ borderTop: "1px solid var(--line, #8883)", paddingTop: 10 }}>
            <p><b>{c.name}</b> <span className="muted small">• {levelById(c.level ?? "tle").label}{c.serie ? ` ${c.serie}` : ""}</span></p>
            <p>Identifiant : <code>{c.email}</code></p>
            <p>Mot de passe : <code>{open ? c.password : "••••••••"}</code>{" "}
              <button type="button" className="btn link" aria-label={open ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShown({ ...shown, [c.id]: !open })}>
                {open ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </p>
            <div className="row">
              <button type="button" className="btn ghost" onClick={() => copy(c.email, c.password)}><Copy size={16} aria-hidden="true" /> {flash === c.email ? "Copié" : "Copier"}</button>
              <button type="button" className="btn ghost" onClick={() => { regenerateAccess(parentId, c.id); setShown({ ...shown, [c.id]: true }); setFlash(null); }}><RefreshCw size={16} aria-hidden="true" /> Nouveau mot de passe</button>
              <button type="button" className="btn ghost" onClick={() => { regenerateLogin(parentId, c.id); setShown({ ...shown, [c.id]: true }); setFlash(null); }}>Nouvel identifiant</button>
            </div>
          </article>
        );
      })}
      <form
        className="stack-sm"
        style={{ borderTop: "1px solid var(--line, #8883)", paddingTop: 10 }}
        onSubmit={(e) => { e.preventDefault(); addChildren(parentId, [{ name, level, serie: serie || undefined }]); setName(""); setSerie(""); }}
      >
        <b>Ajouter un enfant</b>
        <div className="row">
          <input className="field" required placeholder="Prénom" aria-label="Prénom" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="field" aria-label="Classe" value={level} onChange={(e) => { setLevel(e.target.value as LevelId); setSerie(""); }}>
            {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          {seriesAt(level).length > 0 && (
            <select className="field" aria-label="Série" value={serie} onChange={(e) => setSerie(e.target.value)}>
              <option value="">Toutes les séries</option>
              {seriesAt(level).map((x) => <option key={x} value={x}>Série {x}</option>)}
            </select>
          )}
          <button className="btn primary" type="submit"><Plus size={16} aria-hidden="true" /> Créer l'accès</button>
        </div>
      </form>
    </section>
  );
}
