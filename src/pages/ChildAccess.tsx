import { Copy, KeyRound, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { levelById, LEVELS, LevelId, seriesAt } from "../curriculum";
import { remoteCreateChildren, remoteFamilyCode, remoteResetChild } from "../lib/authRemote";
import { supabaseReady } from "../lib/supabase";
import { addChildren, ensureFamilyCode, regenerateLogin, studentsOf, useStore } from "../store";

/** Accès des enfants : un seul code famille pour tous ; chaque enfant choisit son prénom à la connexion. */
export default function ChildAccess({ parentId }: { parentId: string }) {
  const state = useStore();
  const children = studentsOf(state, parentId);
  const code = state.users.find((u) => u.id === parentId)?.familyCode;
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LevelId>("3e");
  const [serie, setSerie] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Sur le serveur, les accès se créent côté serveur ; en mode local, directement dans le navigateur. */
  async function run(job: () => Promise<string | null>) { setBusy(true); setError(null); setError(await job()); setBusy(false); }

  // Les parents créés avant le code famille en reçoivent un à leur prochaine visite.
  useEffect(() => {
    if (code) return;
    if (supabaseReady) void remoteFamilyCode().then(setError); else ensureFamilyCode(parentId);
  }, [code, parentId]);

  const copy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
  };
  const renew = () => {
    if (!window.confirm("Générer un nouveau code famille ? L'ancien cessera de fonctionner pour tous les enfants.")) return;
    setCopied(false);
    if (supabaseReady) void run(() => remoteFamilyCode(true)); else ensureFamilyCode(parentId, true);
  };

  return (
    <section className="card stack" aria-labelledby="acces">
      <h2 id="acces" style={{ fontSize: "1.05rem" }}><KeyRound size={18} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Accès de connexion de mes enfants</h2>
      <p className="muted small">Tous vos enfants entrent avec le même code famille : ils le saisissent sur l'écran de connexion (« Entrer avec le code famille »), puis choisissent leur prénom. Chacun garde son propre compte et sa progression.</p>
      <div className="stack-sm">
        <p>Code famille : <code style={{ fontSize: "1.15rem", letterSpacing: ".08em" }}>{code ?? "…"}</code></p>
        <div className="row">
          <button type="button" className="btn ghost" disabled={!code} onClick={copy}><Copy size={16} aria-hidden="true" /> {copied ? "Copié" : "Copier"}</button>
          <button type="button" className="btn ghost" disabled={busy || !code} onClick={renew}><RefreshCw size={16} aria-hidden="true" /> Nouveau code famille</button>
        </div>
      </div>
      <h3 style={{ fontSize: "1rem", borderTop: "1px solid var(--line, #8883)", paddingTop: 10 }}>Enfants enregistrés ({children.length})</h3>
      {children.length === 0 && <p className="muted small">Aucun enfant pour l'instant. Ajoutez-en un ci-dessous.</p>}
      <ul className="stack-sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {children.map((c) => (
          <li key={c.id} className="row" style={{ justifyContent: "space-between" }}>
            <span><b>{c.name}</b> <span className="muted small">• {levelById(c.level ?? "tle").label}{c.serie ? ` ${c.serie}` : ""} • identifiant <code>{c.email}</code></span></span>
            <button type="button" className="btn link" disabled={busy} onClick={() => { if (supabaseReady) void run(() => remoteResetChild(c.id)); else regenerateLogin(parentId, c.id); }}>Nouvel identifiant</button>
          </li>
        ))}
      </ul>
      <form
        className="stack-sm"
        style={{ borderTop: "1px solid var(--line, #8883)", paddingTop: 10 }}
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
