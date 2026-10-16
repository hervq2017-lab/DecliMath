import { Eye, EyeOff, GraduationCap, Lock, ShieldCheck, Sparkles, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { levelById } from "../curriculum";
import { remoteConsumeQr, remoteLogIn, remoteOpenQuickSession, remoteVerifyQr } from "../lib/authRemote";
import { supabaseReady } from "../lib/supabase";
import { consumeQrToken, useStore, verifyQrToken } from "../store";
import "./auth.css";

interface StudentInfo {
  id: string;
  name: string;
  login: string;
  level: string;
  serie?: string;
  mustChangePassword?: boolean;
  parentName?: string;
}

export default function StudentActivation() {
  const [params] = useSearchParams();
  const state = useStore();
  // Le jeton est gardé en mémoire puis retiré de la barre d'adresse : il ne reste ni dans l'historique ni dans un lien partagé.
  const [token] = useState(() => params.get("token")?.trim() || "");
  const navigate = useNavigate();
  useEffect(() => {
    if (token) window.history.replaceState(null, "", window.location.pathname);
  }, [token]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [purpose, setPurpose] = useState<"activation" | "quick_login">("activation");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Aucun jeton de connexion n'a été fourni. Scanne à nouveau le QR code fourni par ton parent.");
      setLoading(false);
      return;
    }

    async function check() {
      setLoading(true);
      setError(null);

      if (supabaseReady) {
        const res = await remoteVerifyQr(token);
        if (res.error || !res.student) {
          setError(res.error ?? "Ce QR code est invalide ou a expiré.");
        } else {
          setStudent(res.student);
          setPurpose(res.purpose ?? "activation");
        }
      } else {
        const res = verifyQrToken(token);
        if (!res.valid || !res.student) {
          setError(res.error ?? "Ce QR code est invalide ou a expiré.");
        } else {
          setStudent({
            id: res.student.id,
            name: res.student.name,
            login: res.student.email,
            level: res.student.level ?? "3e",
            serie: res.student.serie,
            parentName: state.users.find((u) => u.id === res.student?.parentId)?.name,
          });
          setPurpose(res.purpose ?? "activation");
        }
      }
      setLoading(false);
    }

    void check();
  }, [token]);

  const strength = [
    password.length >= 8,
    /[A-Za-z]/.test(password) && /\d/.test(password),
    password.length >= 10 || /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  async function handleActivation(e: FormEvent) {
    e.preventDefault();
    if (!token || !student) return;

    if (purpose === "activation") {
      if (!accepted) {
        setError("Coche la case pour accepter l'invitation et le partage de ta progression.");
        return;
      }
      if (password.length < 6) {
        setError("Le mot de passe doit comporter au moins 6 caractères.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
    }

    setBusy(true);
    setError(null);

    if (supabaseReady) {
      const consumeRes = await remoteConsumeQr(token, password);
      if (consumeRes.error) {
        setBusy(false);
        setError(consumeRes.error);
        return;
      }

      // Connexion immédiate : jeton de session à usage unique (connexion rapide) ou nouvel identifiant + mot de passe (activation)
      const loginRes = purpose === "quick_login"
        ? { error: await remoteOpenQuickSession(consumeRes.hashedToken ?? "") }
        : await remoteLogIn(consumeRes.login || student.login, password);
      setBusy(false);

      if (loginRes.error) {
        setError(`Mot de passe enregistré, mais erreur de connexion automatique : ${loginRes.error}. Tu peux te connecter depuis la page d'accueil.`);
        return;
      }

      setSuccess(purpose === "quick_login" ? "Connexion ouverte avec succès !" : "Invitation acceptée ! Ton parent pourra maintenant suivre tes progrès.");
      window.setTimeout(() => navigate("/", { replace: true }), 1200);
    } else {
      const consumeRes = consumeQrToken(token, password);
      setBusy(false);
      if (!consumeRes.success) {
        setError(consumeRes.error ?? "Activation impossible.");
        return;
      }

      setSuccess(purpose === "quick_login" ? "Connexion ouverte avec succès !" : "Invitation acceptée ! Ton parent pourra maintenant suivre tes progrès.");
      window.setTimeout(() => navigate("/", { replace: true }), 1000);
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-panel" style={{ maxWidth: 520 }}>
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <img src="/logo-icon.png" alt="" width="78" height="50" draggable={false} />
          </span>
          <div>
            <p className="auth-brand-name">Declick<span>Math</span></p>
            <p className="auth-brand-tag">Apprendre aujourd'hui, réussir demain</p>
          </div>
        </div>

        {loading && (
          <div className="auth-card stack" style={{ textAlign: "center", padding: "40px 20px" }}>
            <Sparkles size={36} className="h1-ic" style={{ margin: "0 auto", animation: "spin 2s linear infinite" }} />
            <h2>Vérification de ton QR code...</h2>
            <p className="muted small">Nous préparons ton espace d'apprentissage sécurisé.</p>
          </div>
        )}

        {!loading && error && (
          <div className="auth-card stack">
            <header className="row" style={{ gap: 12, alignItems: "center" }}>
              <span className="icon-tile sm" style={{ background: "#fee2e2", color: "#ef4444" }}>
                <AlertCircle size={24} aria-hidden="true" />
              </span>
              <div>
                <h1 style={{ fontSize: "1.25rem", margin: 0 }}>QR code non valide</h1>
                <p className="muted small" style={{ margin: 0 }}>Accès impossible avec ce lien</p>
              </div>
            </header>
            <p className="auth-error" role="alert" style={{ margin: "12px 0" }}>{error}</p>
            <p className="small muted">
              Ce lien temporaire a peut-être expiré, a déjà été utilisé pour activer le compte, ou a été régénéré par ton parent.
            </p>
            <div className="stack-sm" style={{ marginTop: 12 }}>
              <Link to="/connexion-eleve" className="btn primary block">
                Se connecter avec identifiant et mot de passe
              </Link>
              <Link to="/" className="btn ghost block">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && student && (
          <div className="auth-card stack">
            <header className="row" style={{ gap: 14, alignItems: "center" }}>
              <span className="avatar" style={{ width: 56, height: 56, fontSize: "1.5rem" }}>
                {student.name[0]?.toUpperCase()}
              </span>
              <div>
                <h1 style={{ fontSize: "1.35rem", margin: 0 }}>Bonjour {student.name} ! 👋</h1>
                <p className="muted small" style={{ margin: 0, fontWeight: 600 }}>
                  {levelById((student.level as any) || "3e").label}
                  {student.serie ? ` Série ${student.serie}` : ""} • Identifiant : <code style={{ userSelect: "all" }}>{student.login}</code>
                </p>
              </div>
            </header>

            {purpose === "activation" ? (
              <form onSubmit={handleActivation} className="stack-sm">
                <div style={{ background: "rgba(53, 182, 255, 0.08)", border: "1px solid rgba(53, 182, 255, 0.25)", borderRadius: 12, padding: 14 }}>
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink, #1c1545)" }}>
                    <Sparkles size={16} style={{ verticalAlign: "-2px", color: "var(--primary)" }} /> <b>Invitation de {student.parentName || "ton parent"}</b>
                  </p>
                  <p className="small muted" style={{ margin: "6px 0 0" }}>
                    Choisis ton <b>mot de passe secret personnel</b>. Ton parent pourra voir ton activité et tes progrès uniquement après ton acceptation.
                  </p>
                </div>

                <label className="auth-label">
                  <span className="auth-lbl"><Lock size={22} aria-hidden="true" /> Nouveau mot de passe personnel<span className="req">*</span></span>
                  <span className="auth-input">
                    <Lock size={20} aria-hidden="true" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Minimum 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="auth-eye" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Masquer" : "Afficher"}>
                      {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                    </button>
                  </span>
                </label>

                <label className="row small" style={{ alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line, #8883)" }}>
                  <input
                    type="checkbox"
                    required
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    J'accepte l'invitation de <b>{student.parentName || "mon parent"}</b> et je comprends que ma progression lui sera partagée.
                  </span>
                </label>

                <div className="auth-meter" data-level={password ? strength : 0} aria-hidden="true"><i /><i /><i /></div>
                <p className="auth-hint" aria-live="polite">
                  <ShieldCheck size={16} aria-hidden="true" />
                  {password ? ["Trop court", "Moyen", "Bien", "Sécurisé"][strength] + " — " : ""}Minimum 6 caractères.
                </p>

                <label className="auth-label">
                  <span className="auth-lbl"><Lock size={22} aria-hidden="true" /> Confirmer le mot de passe<span className="req">*</span></span>
                  <span className="auth-input">
                    <Lock size={20} aria-hidden="true" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Retape ton mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </span>
                </label>

                {success && (
                  <p className="auth-error" role="status" style={{ color: "var(--green, #2e9e5b)", display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={18} /> {success}
                  </p>
                )}

                <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
                  <GraduationCap size={22} aria-hidden="true" />
                  {busy ? "Acceptation en cours..." : "Accepter l'invitation et commencer"}
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </form>
            ) : (
              <div className="stack">
                <p className="small muted">
                  Ce QR code permet de te connecter directement sur cet appareil en toute sécurité.
                </p>
                {success && (
                  <p className="auth-error" role="status" style={{ color: "var(--green, #2e9e5b)" }}>
                    <CheckCircle2 size={18} /> {success}
                  </p>
                )}
                <button className="auth-submit" type="button" onClick={handleActivation} disabled={busy} aria-busy={busy}>
                  <User size={22} aria-hidden="true" />
                  {busy ? "Ouverture de la session..." : "Ouvrir ma session maintenant"}
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
