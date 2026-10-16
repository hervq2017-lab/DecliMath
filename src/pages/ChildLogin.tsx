import {
  AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap,
  KeyRound, Lock, LogIn, QrCode, Sparkles, User,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { remoteLogIn } from "../lib/authRemote";
import { supabaseReady } from "../lib/supabase";
import { logIn } from "../store";
import "./auth.css";

function KidIllustration() {
  return (
    <svg className="auth-cap" viewBox="0 0 120 110" aria-hidden="true" style={{ width: "clamp(80px, 20vw, 120px)" }}>
      <defs>
        <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#35b6ff" />
          <stop offset="1" stopColor="#9a56ff" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="20" r="3" fill="#ffc63d" opacity=".9" />
      <circle cx="100" cy="14" r="2.5" fill="#ff9ff3" opacity=".8" />
      <circle cx="108" cy="42" r="2" fill="#35b6ff" opacity=".7" />
      <circle cx="12" cy="55" r="1.8" fill="#7a8cff" opacity=".7" />
      <path d="M60 28L28 44l32 18 32-18z" fill="url(#kg)" stroke="#9fd8ff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 54v18c0 7 11 12 20 12s20-5 20-12V54L60 62z" fill="url(#kg)" opacity=".85" />
      <path d="M80 46v18" stroke="#ffc63d" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="80" cy="66" r="3.5" fill="#ffc63d" />
      <circle cx="60" cy="22" r="10" fill="#ffcf96" stroke="#ffc63d" strokeWidth="1.5" />
      <circle cx="56.5" cy="20.5" r="1.8" fill="#3d2c0a" />
      <circle cx="63.5" cy="20.5" r="1.8" fill="#3d2c0a" />
      <path d="M57 25 q3 2.5 6 0" stroke="#3d2c0a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function ChildLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setBusy(true);
    setError(null);

    if (supabaseReady) {
      const res = await remoteLogIn(identifier.trim(), password);
      setBusy(false);
      if (res.error) {
        setError(
          res.error === "E-mail ou mot de passe incorrect."
            ? "Identifiant ou mot de passe incorrect.\nTon identifiant ressemble à bola.7892 (prénom + point + chiffres).\nDemande à ton parent de le vérifier depuis son tableau de bord."
            : res.error
        );
      }
    } else {
      const err = logIn(identifier.trim(), password);
      setBusy(false);
      setError(err);
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <img src="/logo-icon.png" alt="" width="78" height="50" draggable={false} />
          </span>
          <div>
            <p className="auth-brand-name">Declick<span>Math</span></p>
            <p className="auth-brand-tag">Apprendre aujourd&apos;hui, reussir demain</p>
          </div>
        </div>

        <header className="auth-head">
          <div>
            <h1>Bonjour <span className="grad">l&apos;eleve</span> !</h1>
            <p>Entre ton identifiant et ton mot de passe pour continuer tes exercices.</p>
          </div>
          <KidIllustration />
        </header>

        <form onSubmit={submit} className="auth-card">
          <label className="auth-label">
            <span className="auth-lbl">
              <User size={26} aria-hidden="true" /> Identifiant élève<span className="req" aria-hidden="true">*</span>
            </span>
            <span className="auth-input">
              <User size={22} aria-hidden="true" />
              <input
                name="identifier"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ex. bola.7892"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </span>
            <span className="auth-note">
              Ton identifiant est écrit sur ta fiche de connexion (prénom + point + chiffres).
            </span>
          </label>

          <div className="auth-label">
            <label htmlFor="child-password" className="auth-lbl">
              <Lock size={26} aria-hidden="true" /> Mot de passe<span className="req" aria-hidden="true">*</span>
            </label>
            <span className="auth-input">
              <Lock size={22} aria-hidden="true" />
              <input
                id="child-password"
                name="password"
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Ton mot de passe secret"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-eye"
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={showPwd}
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
              </button>
            </span>
          </div>

          <div style={{ margin: "-4px 0 4px" }}>
            <button
              type="button"
              className="btn link"
              style={{ padding: "0 4px", fontSize: "0.88rem" }}
              onClick={() => setHelpOpen((v) => !v)}
            >
              <KeyRound size={14} style={{ verticalAlign: "-2px" }} /> Identifiant ou mot de passe oublié ?
            </button>
            {helpOpen && (
              <div
                role="note"
                style={{
                  marginTop: 10,
                  background: "rgba(53, 182, 255, 0.09)",
                  border: "1px solid rgba(53, 182, 255, 0.28)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  fontSize: "0.9rem",
                  color: "var(--a-text, #eaf0ff)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <AlertCircle size={18} style={{ color: "#35b6ff", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#eaf0ff" }}>Demande à ton parent !</p>
                    <p style={{ margin: "4px 0 0", color: "var(--a-muted, #9db0e6)", lineHeight: 1.5 }}>
                      Depuis son tableau de bord DeclickMath, ton parent peut voir ton identifiant, te donner un nouveau mot de passe ou générer un QR code pour te connecter directement.
                    </p>
                  </div>
                </div>
                <Link
                  to="/activation"
                  className="btn ghost block"
                  style={{ textAlign: "center", fontSize: "0.9rem" }}
                >
                  <QrCode size={16} aria-hidden="true" /> J&apos;ai un QR code — scanner ici
                </Link>
              </div>
            )}
          </div>

          {error && (
            <p className="auth-error" role="alert" style={{ whiteSpace: "pre-line" }}>
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
            {busy ? (
              <><Sparkles size={22} aria-hidden="true" /> Connexion en cours...</>
            ) : (
              <><LogIn size={22} aria-hidden="true" /> Me connecter <ArrowRight size={22} aria-hidden="true" /></>
            )}
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingTop: 12,
              borderTop: "1px solid rgba(60, 90, 200, 0.3)",
            }}
          >
            <p style={{ margin: 0, textAlign: "center", fontSize: "0.9rem", color: "var(--a-muted, #9db0e6)" }}>
              Ton parent a généré un QR code pour toi ?
            </p>
            <Link to="/activation" className="btn ghost block" style={{ textAlign: "center" }}>
              <QrCode size={18} aria-hidden="true" /> Scanner le QR code de connexion
            </Link>
          </div>
        </form>

        <ul className="auth-trust">
          <li>
            <span><GraduationCap size={26} aria-hidden="true" /></span>
            <p><b>Espace élève</b>Tes cours et exercices</p>
          </li>
          <li>
            <span><Lock size={26} aria-hidden="true" /></span>
            <p><b>Compte sécurisé</b>Créé par ton parent</p>
          </li>
          <li>
            <span><Sparkles size={26} aria-hidden="true" /></span>
            <p><b>Continue !</b>Reprends où tu en étais</p>
          </li>
        </ul>

        <p style={{ margin: 0, textAlign: "center", fontSize: "0.85rem", color: "var(--a-muted, #9db0e6)" }}>
          Tu es parent ?{" "}
          <Link to="/connexion-parent" style={{ color: "#35b6ff", fontWeight: 700 }}>
            Accéder à l&apos;espace parent
          </Link>
        </p>
      </main>
    </div>
  );
}
