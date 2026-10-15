import { Copy, KeyRound, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { levelById, LEVELS, LevelId, seriesAt } from "../curriculum";
import { remoteCreateChildren, remoteDeleteChild, remoteResetChild, remoteResetChildPassword } from "../lib/authRemote";
import { supabaseReady } from "../lib/supabase";
import { addChildren, regenerateLogin, removeChild, resetChildPassword, studentsOf, useStore } from "../store";

/** Accès des enfants : chaque enfant a son propre identifiant et son propre mot de passe, que le parent lui transmet. */
export default function ChildAccess({ parentId }: { parentId: string }) {
  const state = useStore();
  const children = studentsOf(state, parentId);
  const [copied, setCopied] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LevelId>("3e");
  const [serie, setSerie] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Sur le serveur, les accès se créent côté serveur ; en mode local, directement dans le navigateur. */
  async function run(job: () => Promise<string | null>) { setBusy(true); setError(null); setError(await job()); setBusy(false); }

  const copy = (id: string, login: string, password: string) => {
    navigator.clipboard?.writeText(`Identifiant : ${login}\nMot de passe : ${password}`).catch(() => {});
    setCopied(id);
  };
  const removeAccess = (id: string, childName: string) => {
    if (!window.confirm(`Supprimer l'accès de ${childName} ? Son compte et toute sa progression seront effacés définitivement.`)) return;
    if (supabaseReady) void run(() => remoteDeleteChild(id)); else removeChild(parentId, id);
  };
  const newPassword = (id: string, childName: string) => {
    if (!window.confirm(`Générer un nouveau mot de passe pour ${childName} ? L'ancien cessera de fonctionner.`)) return;
    setCopied(null);
    if (supabaseReady) void run(() => remoteResetChildPassword(id)); else resetChildPassword(parentId, id);
  };

  return (
    <section className="card stack" aria-labelledby="acces">
      <h2 id="acces" style={{ fontSize: "1.05rem" }}><KeyRound size={18} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Accès de connexion de mes enfants</h2>
      <p className="muted small">Chaque enfant a son propre identifiant et son propre mot de passe. Transmettez-les-lui : il les saisit sur l'écran de connexion, onglet « Élève ». Chacun garde son compte et sa progression.</p>
      <h3 style={{ fontSize: "1rem", borderTop: "1px solid var(--line, #8883)", paddingTop: 10 }}>Enfants enregistrés ({children.length})</h3>
      {children.length === 0 && <p className="muted small">Aucun enfant pour l'instant. Ajoutez-en un ci-dessous.</p>}
      <ul className="stack-sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {children.map((c) => (
          <li key={c.id} className="stack-sm" style={{ paddingBottom: 10, borderBottom: "1px solid var(--line, #8883)" }}>
            <span><b>{c.name}</b> <span className="muted small">• {levelById(c.level ?? "tle").label}{c.serie ? ` ${c.serie}` : ""}</span></span>
            <span>Identifiant : <code style={{ fontSize: "1.05rem" }}>{c.email}</code></span>
            <span>Mot de passe : {c.password
              ? <code style={{ fontSize: "1.05rem", letterSpacing: ".06em" }}>{c.password}</code>
              : <span className="muted small">non affiché sur cet appareil — générez-en un nouveau</span>}
            </span>
            <span className="row" style={{ flexWrap: "wrap" }}>
              <button type="button" className="btn ghost" disabled={!c.password} onClick={() => copy(c.id, c.email, c.password)}><Copy size={16} aria-hidden="true" /> {copied === c.id ? "Copié" : "Copier"}</button>
              <button type="button" className="btn ghost" disabled={busy} onClick={() => newPassword(c.id, c.name)}><RefreshCw size={16} aria-hidden="true" /> Nouveau mot de passe</button>
              <button type="button" className="btn link" disabled={busy} onClick={() => { if (supabaseReady) void run(() => remoteResetChild(c.id)); else regenerateLogin(parentId, c.id); }}>Nouvel identifiant</button>
              <button type="button" className="btn link" disabled={busy} style={{ color: "var(--danger, #ff6b6b)" }} onClick={() => removeAccess(c.id, c.name)}>
                <Trash2 size={15} aria-hidden="true" style={{ verticalAlign: "-2px" }} /> Supprimer
              </button>
            </span>
          </li>
        ))}
      </ul>
      <form
        className="stack-sm"
        style={{ paddingTop: 4 }}
        onSubmit={(e) => {
          e.preventDefault();
          const kid = { name, level, serie: serie || undefined };
          if (supabaseReady) void run(async () => { const err = await remoteCreateChildren([kid]); if (!err) { setName(""); setSerie(""); } return err; });
          else { addChildren(parentId, [kid]); setName(""); setSerie(""); }
        }}
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
          <button className="btn primary" type="submit" disabled={busy}><Plus size={16} aria-hidden="true" /> Créer l'accès</button>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
