import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { cancelRecovery, remoteSetPassword } from "../lib/authRemote";
import "./auth.css";

/** Écran affiché quand le parent arrive depuis le lien « mot de passe oublié » reçu par e-mail. */
export default function ResetPassword() {
  const [pwd, setPwd] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const strength = [pwd.length >= 8, /[A-Za-z]/.test(pwd) && /\d/.test(pwd), pwd.length >= 12 || /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pwd !== again) { setError("Les deux mots de passe ne sont pas identiques."); return; }
    setError(null); setBusy(true);
    const err = await remoteSetPassword(pwd);
    setBusy(false);
    setError(err); // en cas de succès, l'application bascule seule vers l'espace du parent
  }

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <div className="auth-brand">
          <span className="auth-brand-mark"><img src="/logo-icon.png" alt="" width="78" height="50" draggable={false} /></span>
          <div><p className="auth-brand-name">Declick<span>Math</span></p></div>
        </div>
        <header className="auth-head">
          <div>
            <h1>Nouveau <span className="grad">mot de passe</span></h1>
            <p>Choisis un mot de passe que tu n'utilises nulle part ailleurs.</p>
          </div>
        </header>
        <form onSubmit={submit} className="auth-card">
          <div className="auth-label">
            <label htmlFor="rp-new" className="auth-lbl"><Lock size={26} aria-hidden="true" /> Nouveau mot de passe<span className="req" aria-hidden="true">*</span></label>
            <span className="auth-input">
              <Lock size={22} aria-hidden="true" />
              <input id="rp-new" type={show ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="Au moins 8 caractères"
                pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="Minimum 8 caractères, avec au moins une lettre et un chiffre." value={pwd} onChange={(e) => setPwd(e.target.value)} />
              <button type="button" className="auth-eye" aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show} onClick={() => setShow((v) => !v)}>
                {show ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
              </button>
            </span>
          </div>
          <div className="auth-meter" data-level={pwd ? strength : 0} aria-hidden="true"><i /><i /><i /></div>
          <p className="auth-hint" aria-live="polite">
            <ShieldCheck size={18} aria-hidden="true" />
            {pwd ? ["Trop court", "Encore un effort", "Bien", "Excellent"][strength] + " — " : ""}Minimum 8 caractères, avec au moins une lettre et un chiffre.
          </p>
          <div className="auth-label">
            <label htmlFor="rp-again" className="auth-lbl"><Lock size={26} aria-hidden="true" /> Confirme le mot de passe<span className="req" aria-hidden="true">*</span></label>
            <span className="auth-input">
              <Lock size={22} aria-hidden="true" />
              <input id="rp-again" type={show ? "text" : "password"} required autoComplete="new-password" placeholder="Retape le mot de passe" value={again} onChange={(e) => setAgain(e.target.value)} />
            </span>
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
            Enregistrer et me connecter <ArrowRight size={22} aria-hidden="true" />
          </button>
          <p className="auth-switch"><button type="button" onClick={() => void cancelRecovery()}>Annuler</button></p>
        </form>
      </main>
    </div>
  );
}
