import {
  ArrowRight, BarChart3, ChevronDown, Zap, Eye, EyeOff, GraduationCap, Globe, KeyRound, Lock, LogIn, Mail,
  ShieldCheck, Target, User, UserPlus, Users,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Chip, Logo } from "../components/ui";
import "./auth.css";
import { COUNTRIES, LEVELS, LevelId, seriesAt } from "../curriculum";
import { ChildInput, familyChildren, logIn, Role, signUp, signUpParent } from "../store";
import { FamilyChild, remoteFamilyChildren, remoteLogIn, remoteSignUp } from "../lib/authRemote";
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

/** Connexion des enfants : code famille, puis choix du prénom. Le code famille est le mot de passe de chaque enfant. */
function FamilyLogin({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState("");
  const [kids, setKids] = useState<FamilyChild[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function find(e: FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    const c = code.trim();
    const res = supabaseReady ? await remoteFamilyChildren(c) : { children: familyChildren(c), error: undefined };
    setBusy(false);
    if (res.error) setError(res.error);
    else if (!res.children?.length) setError("Code famille inconnu.");
    else setKids(res.children);
  }

  async function enter(kid: FamilyChild) {
    setError(null); setBusy(true);
    const err = supabaseReady ? (await remoteLogIn(kid.login, code.trim())).error : logIn(kid.login, code.trim());
    setBusy(false);
    setError(err);
  }

  return (
    <form onSubmit={find} className="auth-card">
      <label className="auth-label">
        <span className="auth-lbl"><KeyRound size={26} aria-hidden="true" /> Code famille<span className="req" aria-hidden="true">*</span></span>
        <span className="auth-input">
          <KeyRound size={22} aria-hidden="true" />
          <input value={code} onChange={(e) => { setCode(e.target.value); setKids(null); }} required autoCapitalize="none" autoComplete="off" spellCheck={false} placeholder="Le code donné par ton parent" />
        </span>
      </label>
      {kids && (
        <div className="auth-label" role="group" aria-label="Qui es-tu ?">
          <span className="auth-lbl"><Users size={26} aria-hidden="true" /> Qui es-tu ?</span>
          {kids.map((k) => (
            <button key={k.login} type="button" className="auth-submit" disabled={busy} onClick={() => void enter(k)}>
              <User size={22} aria-hidden="true" /> {k.name}
            </button>
          ))}
        </div>
      )}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {!kids && (
        <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
          Voir mon prénom <ArrowRight size={22} aria-hidden="true" />
        </button>
      )}
      <p className="auth-switch"><button type="button" onClick={onBack}>Je me connecte autrement</button></p>
    </form>
  );
}

const GOALS = ["Rattraper mon retard", "Préparer un contrôle", "Préparer l'examen", "Prendre de l'avance"];

export default function Auth() {
  const [params] = useSearchParams();
  const [step, setStep] = useState<"welcome" | "signup" | "login">(params.get("c") === "login" ? "login" : params.get("r") === "parent" ? "signup" : "welcome");
  /** À la connexion : qui se connecte. L'élève entre par le code famille, le parent par e-mail. */
  const [who, setWho] = useState<"parent" | "student">(params.get("r") === "student" ? "student" : "parent");
  const [idForm, setIdForm] = useState(false);
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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")), password = String(f.get("password"));
    const country = String(f.get("country") ?? "CI"), name = [f.get("name"), f.get("lastname")].map((v) => String(v ?? "").trim()).filter(Boolean).join(" ");
    setInfo(null);
    if (supabaseReady) {
      if (role === "parent" && step !== "login" && !kids.some((k) => k.name.trim())) { setError("Ajoutez au moins un enfant."); return; }
      setBusy(true);
      const res = step === "login"
        ? await remoteLogIn(email, password)
        : await remoteSignUp(role === "parent"
          ? { role, name, email, password, country, children: kids }
          : { role, name, email, password, country, level, goal, inviteCode: String(f.get("code") ?? "") });
      setBusy(false);
      setError(res.error);
      if (res.info) { setInfo(res.info); setStep("login"); }
      return;
    }
    setError(
      step === "login"
        ? logIn(email, password)
        : role === "parent"
          ? signUpParent({ name, email, password, country, children: kids })
          : signUp({
            role, name, email, password, country,
            level: role === "student" ? level : undefined, goal: role === "student" ? goal : undefined, inviteCode: String(f.get("code") ?? ""),
          }),
    );
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
            <p className="small" style={{ color: "#5f5a85" }}>Entre avec le code famille donné par ton parent, puis choisis ton prénom.</p>
            <button className="btn primary block" onClick={() => { setWho("student"); setIdForm(false); setStep("login"); }}>Me connecter</button>
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
                onClick={() => { setError(null); setInfo(null); setWho(id); setIdForm(false); }}>
                <Icon size={20} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        )}

        {isLogin && who === "student" && !idForm ? <FamilyLogin onBack={() => setIdForm(true)} /> : (
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
          <label className="auth-label">
            <span className="auth-lbl"><Mail size={26} aria-hidden="true" /> {isLogin ? (who === "parent" ? "E-mail" : "Identifiant") : "E-mail"}<span className="req" aria-hidden="true">*</span></span>
            <span className="auth-input">
              <Mail size={22} aria-hidden="true" />
              <input name="email" type={isLogin && who === "student" ? "text" : "email"} required autoComplete={isLogin ? "username" : "email"} autoCapitalize="none" placeholder={isLogin && who === "student" ? "Identifiant de l'élève" : "votre@email.com"} />
            </span>
          </label>
          <div className="auth-label">
            <label htmlFor="auth-password" className="auth-lbl"><Lock size={26} aria-hidden="true" /> Mot de passe<span className="req" aria-hidden="true">*</span></label>
            <span className="auth-input">
              <Lock size={22} aria-hidden="true" />
              <input
                id="auth-password" name="password" type={showPwd ? "text" : "password"} required
                minLength={isLogin ? 6 : 8} pattern={isLogin ? undefined : "(?=.*[A-Za-z])(?=.*\\d).{8,}"}
                title={isLogin ? undefined : "Minimum 8 caractères, avec au moins une lettre et un chiffre."}
                autoComplete={isLogin ? "current-password" : "new-password"} placeholder={isLogin ? "Votre mot de passe" : "Choisissez un mot de passe"}
                value={pwd} onChange={(e) => setPwd(e.target.value)}
              />
              <button type="button" className="auth-eye" aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPwd} onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
              </button>
            </span>
          </div>
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
            <label className="auth-label">
              Code d'invitation de ton parent (facultatif)
              <span className="auth-input">
                <KeyRound size={22} aria-hidden="true" />
                <input name="code" placeholder="ex. A1B2C3" autoCapitalize="characters" />
              </span>
              <span className="auth-note">Avec un code, ton parent peut suivre tes efforts et régler les corrigés.</span>
            </label>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {info && <p className="auth-error" role="status" style={{ color: "var(--green, #2e9e5b)", whiteSpace: "pre-line" }}>{info}</p>}
          <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
            {isLogin ? <LogIn size={22} aria-hidden="true" /> : <UserPlus size={22} aria-hidden="true" />}
            {isLogin ? "Se connecter" : "Créer mon compte"}
            <ArrowRight size={22} aria-hidden="true" />
          </button>
          {isLogin && who === "student" && (
            <p className="auth-switch"><button type="button" onClick={() => { setError(null); setIdForm(false); }}>Entrer avec le code famille</button></p>
          )}
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
