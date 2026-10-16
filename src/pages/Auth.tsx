import {
  ArrowRight, BarChart3, ChevronDown, Zap, Eye, EyeOff, GraduationCap, Globe, Lock, LogIn, Mail,
  ShieldCheck, Target, User, UserPlus, Users,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Chip, Logo } from "../components/ui";
import "./auth.css";
import { COUNTRIES, LEVELS, LevelId, seriesAt } from "../curriculum";
import { ChildInput, logIn, Role, signUp, signUpParent } from "../store";
import { remoteForgotPassword, remoteLogIn, remoteSignUp } from "../lib/authRemote";
import { supabaseReady } from "../lib/supabase";

/** Toque de diplômé (illustration de l'en-tête). */
function GradCap() {
  return (
    <svg className="auth-cap" viewBox="0 0 120 110" aria-hidden="true">
      <defs>
        <linearGradient id="capg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#35b6ff" /><stop offset="1" stopColor="#8a4dff" /></linearGradient>
      </defs>
      <g stroke="#ffc63d" strokeWidth="3" strokeLinecap="round"><path d="M22 28l8 8" /><path d="M46 12v10" /></g>
      <path d="M10 56l-8-4M16 74l-8 6" stroke="#35b6ff" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 62v22c0 8 16 14 30 14s26-6 26-14V62L80 74z" fill="url(#capg)" opacity=".85" />
      <path d="M80 30L38 50l42 22 42-22z" fill="url(#capg)" stroke="#9fd8ff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M100 52v24" stroke="#ffc63d" strokeWidth="3" strokeLinecap="round" /><circle cx="100" cy="80" r="4" fill="#ffc63d" />
    </svg>
  );
}

/** Mot de passe oublié (parent) : envoie un lien de réinitialisation par e-mail. */
function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setError(null); setInfo(null); setBusy(true);
    const res = await remoteForgotPassword(email);
    setBusy(false);
    setError(res.error); setInfo(res.info ?? null);
  }

  return (
    <form onSubmit={send} className="auth-card">
      <p className="auth-note">Indique l'e-mail de ton espace parent : nous t'envoyons un lien pour choisir un nouveau mot de passe.</p>
      <label className="auth-label">
        <span className="auth-lbl"><Mail size={26} aria-hidden="true" /> E-mail<span className="req" aria-hidden="true">*</span></span>
        <span className="auth-input">
          <Mail size={22} aria-hidden="true" />
          <input name="email" type="email" required autoComplete="email" autoCapitalize="none" placeholder="votre@email.com" />
        </span>
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {info && <p className="auth-error" role="status" style={{ color: "var(--green, #2e9e5b)" }}>{info}</p>}
      <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
        <Mail size={22} aria-hidden="true" /> Envoyer le lien <ArrowRight size={22} aria-hidden="true" />
      </button>
      <p className="auth-switch"><button type="button" onClick={onBack}>Retour à la connexion</button></p>
      <p className="auth-note" style={{ textAlign: "center" }}>Élève ? Demande à ton parent un nouveau mot de passe depuis son espace.</p>
    </form>
  );
}

const GOALS = ["Rattraper mon retard", "Préparer un contrôle", "Préparer l'examen", "Prendre de l'avance"];

export default function Auth({ defaultWho }: { defaultWho?: "parent" | "student" } = {}) {
  const [params] = useSearchParams();
  const urlUser = params.get("u") || params.get("login") || "";
  const isStudentParam = params.get("r") === "student" || !!urlUser;

  const [step, setStep] = useState<"welcome" | "signup" | "login">(
    defaultWho || params.get("c") === "login" || isStudentParam ? "login" : params.get("r") === "parent" ? "signup" : "welcome"
  );
  /** À la connexion : qui se connecte. L'élève entre avec l'identifiant et le mot de passe donnés par son parent, le parent par e-mail. */
  const [who, setWho] = useState<"parent" | "student">(defaultWho ?? (isStudentParam ? "student" : "parent"));
  const [emailInput, setEmailInput] = useState(urlUser);
  const [forgot, setForgot] = useState(false);
  const [role, setRole] = useState<Role>("parent");
  const [level, setLevel] = useState<LevelId>("3e");
  const [goal, setGoal] = useState(GOALS[0]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState("");
  const [kids, setKids] = useState<ChildInput[]>([{ name: "", level: "3e" }]);
  const setKid = (i: number, patch: Partial<ChildInput>) => setKids((k) => k.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const resize = (n: number) => setKids((k) => Array.from({ length: n }, (_, i) => k[i] ?? { name: "", level: "3e" as LevelId }));
  const strength = [pwd.length >= 8, /[A-Za-z]/.test(pwd) && /\d/.test(pwd), pwd.length >= 12 || /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;

  // Les anciens liens de connexion contenaient le mot de passe dans l'URL.
  useEffect(() => {
    const legacyCredentialLink = params.has("pass") || (
      params.has("auto") && params.has("u") && params.has("p")
    );
    if (!legacyCredentialLink) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("pass");
    if (params.has("auto") && params.has("u")) url.searchParams.delete("p");
    url.searchParams.delete("auto");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const rawEmail = String(f.get("email") ?? emailInput).trim();
    const rawPassword = String(f.get("password") ?? pwd).trim();
    const country = String(f.get("country") ?? "CI"), name = [f.get("name"), f.get("lastname")].map((v) => String(v ?? "").trim()).filter(Boolean).join(" ");
    setInfo(null);

    // Détection intelligente : si l'identifiant ne ressemble pas à un email, on gère comme un compte élève
    const isStudentFormat = !rawEmail.includes("@") || rawEmail.toLowerCase().includes("declickmath.invalid");
    const targetWho = who === "student" || (step === "login" && isStudentFormat) ? "student" : "parent";

    if (supabaseReady) {
      if (role === "parent" && step !== "login" && !kids.some((k) => k.name.trim())) { setError("Ajoutez au moins un enfant."); return; }
      setBusy(true);
      const res = step === "login"
        ? await remoteLogIn(rawEmail, rawPassword)
        : await remoteSignUp(role === "parent"
          ? { role, name, email: rawEmail, password: rawPassword, country, children: kids }
          : { role, name, email: rawEmail, password: rawPassword, country, level, goal });
      setBusy(false);
      // Message clair et aidant pour l'élève en cas d'erreur
      setError(step === "login" && targetWho === "student" && res.error === "E-mail ou mot de passe incorrect."
        ? "Identifiant ou mot de passe incorrect. L'identifiant complet ressemble à « prenom.1234 ». Demande à ton parent de vérifier dans son espace."
        : res.error);
      if (res.info) { setInfo(res.info); setStep("login"); }
      return;
    }
    const err = step === "login"
      ? logIn(rawEmail, rawPassword)
      : role === "parent"
        ? signUpParent({ name, email: rawEmail, password: rawPassword, country, children: kids })
        : signUp({
          role, name, email: rawEmail, password: rawPassword, country,
          level: role === "student" ? level : undefined, goal: role === "student" ? goal : undefined,
        });
    setError(err);
  }

  if (step === "welcome") {
    return (
      <div className="navy">
        <main className="shell no-nav stack" style={{ gap: 28 }}>
          <div className="center stack" style={{ alignItems: "center" }}>
            <div className="hero-mark">
              <img src="/logo-full.png" alt="DeclickMath : comprendre, s'entraîner, réussir" width="260" height="161" />
              <span className="hero-bubble">Salut !</span>
            </div>
            <h1>Le déclic en maths, enfin.</h1>
            <p className="lead">Un coach bienveillant qui explique, jamais un prof sévère.</p>
          </div>
          <section className="card stack" style={{ background: "#fff", color: "#3d3868", borderColor: "#fff" }}>
            <h2 style={{ fontSize: "1.1rem", color: "#1c1545" }}>Je suis parent</h2>
            <p className="small" style={{ color: "#5f5a85" }}>Suivez les progrès de vos enfants et gérez leurs accès.</p>
            <button className="btn primary block" onClick={() => { setWho("parent"); setStep("login"); }}>Me connecter</button>
            <button className="btn link" onClick={() => setStep("signup")}>Créer mon espace parent</button>
          </section>
          <section className="card stack" style={{ background: "#fff", color: "#3d3868", borderColor: "#fff" }}>
            <h2 style={{ fontSize: "1.1rem", color: "#1c1545" }}>Je suis élève</h2>
            <p className="small" style={{ color: "#5f5a85" }}>Entre avec l'identifiant et le mot de passe que ton parent t'a donnés.</p>
            <button className="btn primary block" onClick={() => { setWho("student"); setStep("login"); }}>Me connecter</button>
          </section>
        </main>
      </div>
    );
  }

  const isLogin = step === "login";
  const isParent = role === "parent";

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <div className="auth-brand">
          <span className="auth-brand-mark"><img src="/logo-icon.png" alt="" width="78" height="50" draggable={false} /></span>
          <div>
            <p className="auth-brand-name">Declick<span>Math</span></p>
            <p className="auth-brand-tag">Apprendre aujourd'hui, réussir demain</p>
          </div>
        </div>

        <header className="auth-head">
          <div>
            <h1>{isLogin ? <>Content de te <span className="grad">revoir</span></> : isParent ? "Créer mon espace parent" : "Crée ton compte"}</h1>
            <p>
              {isLogin
                ? "Connecte-toi pour retrouver ta progression et accéder à tes cours."
                : isParent
                  ? "Rejoignez la communauté DeclickMath et suivez les progrès de votre enfant en toute simplicité."
                  : "Rejoins DeclickMath et progresse à ton rythme, sans pression."}
            </p>
          </div>
          <GradCap />
        </header>

        {isLogin && (
          <div className="auth-who" role="tablist" aria-label="Je me connecte en tant que">
            {([["parent", "Parent", Users], ["student", "Élève", GraduationCap]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" role="tab" aria-selected={who === id} className={who === id ? "on" : ""}
                onClick={() => { setError(null); setInfo(null); setWho(id); setForgot(false); }}>
                <Icon size={20} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        )}

        {isLogin && who === "parent" && forgot ? <ForgotPassword onBack={() => setForgot(false)} /> : (
        <form onSubmit={submit} className="auth-card">
          {!isLogin && (
            <>
              <label className="auth-label">
                <span>Nom<span className="req" aria-hidden="true">*</span></span>
                <span className="auth-input">
                  <User size={22} aria-hidden="true" />
                  <input name="lastname" required autoComplete="family-name" placeholder="Votre nom" />
                </span>
              </label>
              <label className="auth-label">
                <span>Prénom<span className="req" aria-hidden="true">*</span></span>
                <span className="auth-input">
                  <User size={22} aria-hidden="true" />
                  <input name="name" required autoComplete="given-name" placeholder="Votre prénom" />
                </span>
              </label>
              <label className="auth-label">
                <span>Pays (zone XOF / XAF)<span className="req" aria-hidden="true">*</span></span>
                <span className="auth-input">
                  <Globe size={22} aria-hidden="true" />
                  <select name="country" defaultValue={COUNTRIES.some((c) => c.code === params.get("p")) ? params.get("p")! : "CI"}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.zone})</option>)}
                  </select>
                  <ChevronDown className="chev" size={20} aria-hidden="true" />
                </span>
              </label>
            </>
          )}
          {isLogin && who === "student" && urlUser && (
            <div style={{ background: "rgba(113, 60, 255, 0.12)", border: "1px solid rgba(113, 60, 255, 0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <p style={{ margin: 0, fontWeight: 700, color: "#ffc63d", fontSize: "0.92rem" }}>
                ✨ Identifiant prérempli : {urlUser}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#c4d1f7" }}>
                Saisis ton mot de passe pour te connecter.
              </p>
            </div>
          )}
          <label className="auth-label">
            <span className="auth-lbl">
              {isLogin && who === "student" ? <GraduationCap size={26} aria-hidden="true" /> : <Mail size={26} aria-hidden="true" />}
              {isLogin ? (who === "parent" ? "E-mail ou identifiant" : "Identifiant élève") : "E-mail"}
              <span className="req" aria-hidden="true">*</span>
            </span>
            <span className="auth-input">
              {isLogin && who === "student" ? <User size={22} aria-hidden="true" /> : <Mail size={22} aria-hidden="true" />}
              <input
                name="email"
                type="text"
                required
                autoComplete={isLogin ? "username" : "email"}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={isLogin && who === "student" ? "Ex. bola.7892 ou ton prénom" : "votre@email.com"}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </span>
            {isLogin && who === "student" && (
              <span className="auth-note" style={{ color: "#a8b5e0", fontSize: "0.82rem" }}>
                💡 Reçu de ton parent (ex. <b>lucas.4821</b>). Ton prénom seul peut marcher.
              </span>
            )}
          </label>
          <div className="auth-label">
            <label htmlFor="auth-password" className="auth-lbl">
              <Lock size={26} aria-hidden="true" /> Mot de passe<span className="req" aria-hidden="true">*</span>
            </label>
            <span className="auth-input">
              <Lock size={22} aria-hidden="true" />
              <input
                id="auth-password"
                name="password"
                type={showPwd ? "text" : "password"}
                required
                minLength={isLogin ? (who === "student" ? 4 : 6) : 8}
                pattern={isLogin ? undefined : "(?=.*[A-Za-z])(?=.*\\d).{8,}"}
                title={isLogin ? undefined : "Minimum 8 caractères, avec au moins une lettre et un chiffre."}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={isLogin ? (who === "student" ? "Ton mot de passe" : "Votre mot de passe") : "Choisissez un mot de passe"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
              <button type="button" className="auth-eye" aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPwd} onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
              </button>
            </span>
          </div>
          {isLogin && who === "student" && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", marginTop: 2 }}>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#a8b5e0", lineHeight: 1.4 }}>
                🔒 <b>Un problème pour te connecter ?</b> Demande à ton parent : il peut vérifier ton identifiant ou te donner un nouveau mot de passe en 1 clic dans son espace parent.
              </p>
            </div>
          )}
          {isLogin && who === "parent" && (
            <p className="auth-forgot"><button type="button" onClick={() => { setError(null); setInfo(null); setForgot(true); }}>Mot de passe oublié ?</button></p>
          )}
          {!isLogin && (
            <>
              <div className="auth-meter" data-level={pwd ? strength : 0} aria-hidden="true"><i /><i /><i /></div>
              <p className="auth-hint" aria-live="polite">
                <ShieldCheck size={18} aria-hidden="true" />
                {pwd ? ["Trop court", "Encore un effort", "Bien", "Excellent"][strength] + " — " : ""}Minimum 8 caractères, avec au moins une lettre et un chiffre.
              </p>
            </>
          )}
          {!isLogin && isParent && (
            <fieldset className="auth-label" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend><b>Vos enfants</b> — un accès est créé pour chacun</legend>
              <label className="auth-label">
                Nombre d'enfants
                <span className="auth-input">
                  <Users size={22} aria-hidden="true" />
                  <select value={kids.length} onChange={(e) => resize(Number(e.target.value))}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown className="chev" size={20} aria-hidden="true" />
                </span>
              </label>
              {kids.map((k, i) => (
                <div key={i} className="auth-label" style={{ borderTop: "1px solid #ffffff22", paddingTop: 10 }}>
                  <span>Enfant {i + 1}</span>
                  <span className="auth-input"><User size={22} aria-hidden="true" />
                    <input required aria-label={`Prénom de l'enfant ${i + 1}`} placeholder="Prénom" value={k.name} onChange={(e) => setKid(i, { name: e.target.value })} />
                  </span>
                  <span className="auth-input"><GraduationCap size={22} aria-hidden="true" />
                    <select aria-label={`Classe de l'enfant ${i + 1}`} value={k.level} onChange={(e) => setKid(i, { level: e.target.value as LevelId, serie: undefined })}>
                      {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                    <ChevronDown className="chev" size={20} aria-hidden="true" />
                  </span>
                  {seriesAt(k.level).length > 0 && (
                    <span className="auth-input"><Target size={22} aria-hidden="true" />
                      <select aria-label={`Série de l'enfant ${i + 1}`} value={k.serie ?? ""} onChange={(e) => setKid(i, { serie: e.target.value || undefined })}>
                        <option value="">Toutes les séries</option>
                        {seriesAt(k.level).map((x) => <option key={x} value={x}>Série {x}</option>)}
                      </select>
                      <ChevronDown className="chev" size={20} aria-hidden="true" />
                    </span>
                  )}
                </div>
              ))}
            </fieldset>
          )}
          {!isLogin && !isParent && (
            <p className="auth-note">Pour que ton parent suive tes progrès, demande-lui de créer ton profil et de t'envoyer ton invitation QR personnelle.</p>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {info && <p className="auth-error" role="status" style={{ color: "var(--green, #2e9e5b)", whiteSpace: "pre-line" }}>{info}</p>}
          <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
            {isLogin ? <LogIn size={22} aria-hidden="true" /> : <UserPlus size={22} aria-hidden="true" />}
            {isLogin ? "Se connecter" : "Créer mon compte"}
            <ArrowRight size={22} aria-hidden="true" />
          </button>
          <p className="auth-switch">
            {isLogin ? (who === "parent" ? "Parent sans compte ?" : "Ton parent n'a pas de compte ?") : "Déjà un compte ?"}{" "}
            <button type="button" onClick={() => { setError(null); setWho("parent"); setStep(isLogin ? "signup" : "login"); }}>
              {isLogin ? "Créer un espace parent" : "Se connecter"}
            </button>
            <ArrowRight size={18} aria-hidden="true" />
          </p>
          <ul className="auth-trust">
            <li><span><ShieldCheck size={26} aria-hidden="true" /></span><p><b>Connexion sécurisée</b>Vos données sont protégées</p></li>
            <li><span><Zap size={26} aria-hidden="true" /></span><p><b>Accès immédiat</b>Reprenez où vous en étiez</p></li>
            <li><span><BarChart3 size={26} aria-hidden="true" /></span><p><b>Progression continue</b>Vers vos objectifs</p></li>
          </ul>
        </form>
        )}
        <p className="auth-proto">Prototype : les données restent dans ce navigateur.</p>
      </main>
    </div>
  );
}
