import {
  ArrowLeft, Atom, Crown, FileText, LogOut, Bell, ChevronDown, CircleHelp, BookOpen, Calculator, ChevronRight, Dices, Flame, FlaskConical, Gauge, Hash, Home, Languages,
  Lightbulb, LucideIcon, Pencil, Ruler, Sigma, Sun, Triangle, TrendingUp, User, Waves, X, Zap, BarChart3,
  Bot, Brain, Variable, Box, FlipHorizontal2, Binary, Cog, SpellCheck, Repeat, School, Clock, Briefcase, Shirt, Utensils, HeartPulse, GraduationCap, Users, Plane, Building2, Scale, Droplets, Laptop, Globe,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Banknote, ListChecks, Target, Trophy, TriangleAlert, UserPlus } from "lucide-react";
import { currentUser, DEFAULT_PREFS, logOut, markNotificationsSeen, setPrefs, THEMES, themeOf, useStore } from "../store";
import { countryByCode, levelIndex, LEVELS, LevelId } from "../curriculum";
import { hasActivePlan, startDemoPreview } from "../adminActions";
import { Notif, NotifKind, notificationsFor, unreadCount } from "../lib/notifications";
import { Link, LinkProps, NavLink, useNavigate } from "react-router-dom";

export { ChevronRight, Lightbulb };

const CHAPTER_ICONS: Record<string, LucideIcon> = {
  // Mathématiques
  Nombres: Hash, Calcul: Calculator, Algèbre: Variable, "Algèbre et géométrie": Triangle, Géométrie: Triangle, Grandeurs: Ruler,
  Données: BarChart3, Fonctions: TrendingUp, "Fonctions numériques": TrendingUp, Analyse: Sigma, Probabilités: Dices,
  "Calculs algébriques": Variable, "Organisation et traitement des données": BarChart3, "Géométrie du plan": Triangle, "Géométrie de l'espace": Box,
  "Transformations du plan": FlipHorizontal2, Arithmétique: Binary, "Modélisation de phénomènes aléatoires": Dices, "Modélisation d'un phénomène aléatoire": Dices,
  // Physique-chimie
  Matière: FlaskConical, Électricité: Zap, Mouvement: Gauge, Mécanique: Cog, Ondes: Waves, Énergie: Flame, Lumière: Sun, Optique: Sun, "Physique nucléaire": Atom,
  // Anglais
  Vocabulaire: Languages, Grammaire: SpellCheck, Expression: BookOpen, Verbes: Repeat, "At school": School, "At home": Home, "Time and date": Clock,
  "Jobs and occupations": Briefcase, "Clothes and colours": Shirt, "Food and drinks": Utensils, "Health and environment": HeartPulse, "Sports and games": Trophy,
  "Life at school": GraduationCap, "Women at work": Users, Travelling: Plane, Fashion: Shirt, "City or village?": Building2, "Human rights": Scale,
  "Hygiene and health": Droplets, "Information and communication technologies": Laptop, "Thèmes de Terminale": Globe,
};
/** Le nom de série (« Série C · ») ne change pas le sujet du chapitre : on l'enlève pour trouver l'icône. */
const baseChapter = (c: string) => c.replace(/^Série [A-Z0-9]+ · /, "");
export const TONES = ["indigo", "blue", "green", "yellow"] as const;
export const toneOf = (chapter: string) => TONES[[...baseChapter(chapter)].reduce((h, c) => h + c.charCodeAt(0), 0) % TONES.length];

export function ChapterIcon({ chapter, size = 24 }: { chapter: string; size?: number }) {
  const I = CHAPTER_ICONS[baseChapter(chapter)] ?? BookOpen;
  return <I size={size} strokeWidth={2} aria-hidden="true" />;
}

export function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark"><Lightbulb size={22} aria-hidden="true" /></span>
      <span>Declick<b>Math</b></span>
    </div>
  );
}

export function BackButton({ to, label = "Retour" }: { to?: string | number; label?: string }) {
  const nav = useNavigate();
  return (
    <button className="icon-btn" aria-label={label} onClick={() => (typeof to === "string" ? nav(to) : nav(-1))}>
      <ArrowLeft size={22} aria-hidden="true" />
    </button>
  );
}

export function ProgressBar({ value, tone = "primary", label }: { value: number; tone?: string; label?: string }) {
  return (
    <div className={`bar bar-${tone}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function StreakChip({ n }: { n: number }) {
  return (
    <span className="streak" aria-label={`Série de ${n} jours`}>
      <Flame size={20} aria-hidden="true" /> {n}
    </span>
  );
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className={active ? "chip active" : "chip"} aria-pressed={!!active} onClick={onClick}>
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={checked ? "toggle on" : "toggle"} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

/** Lien normal, ou simple bloc non cliquable quand le parent regarde (lecture seule). */
export function ReadLink({ readOnly, to, children, ...rest }: LinkProps & { readOnly?: boolean }) {
  if (readOnly) {
    const { className, style } = rest;
    return <div className={className} style={style}>{children}</div>;
  }
  return <Link to={to} {...rest}>{children}</Link>;
}

interface RailItem { to: string; label: string; Icon: LucideIcon; end?: boolean }

/** Barre d'onglets en bas (mobile) qui devient un rail latéral sur PC : même navigation partout. */
function Rail({ label, items, foot }: { label: string; items: RailItem[]; foot?: ReactNode }) {
  return (
    <nav className="bottom-nav" aria-label={label}>
      <div className="side-brand">
        <span className="logo-mark" aria-hidden="true"><Lightbulb size={22} /></span>
        <span className="side-id"><span className="side-name">Declick<b>Math</b></span><small className="side-tag">Apprendre • S'entraîner • Réussir</small></span>
      </div>
      {items.map(({ to, label: text, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <span className="nav-pill"><Icon size={24} aria-hidden="true" /></span>
          <span>{text}</span>
        </NavLink>
      ))}
      {foot && <div className="side-foot">{foot}</div>}
      <div className="help-foot"><CircleHelp size={26} aria-hidden="true" /><span><b>Besoin d'aide ?</b>Contacte-nous</span></div>
    </nav>
  );
}

export function ParentChildNav({ id }: { id: string }) {
  const base = `/enfant/${id}`;
  return (
    <Rail
      label="Navigation espace parent"
      items={[
        { to: "/", label: "Résumé", Icon: Home, end: true },
        { to: base, label: "Accueil", Icon: BookOpen, end: true },
        { to: `${base}/exercices`, label: "Exercices", Icon: Pencil },
        { to: `${base}/progres`, label: "Progrès", Icon: BarChart3 },
        { to: `${base}/reponses`, label: "Réponses", Icon: ListChecks },
        { to: `${base}/sujets`, label: "Sujets", Icon: FileText },
        { to: `${base}/profil`, label: "Profil", Icon: User },
      ]}
      foot={<><b>Que des efforts</b><span>Jamais de notes affichées : seulement les progrès.</span></>}
    />
  );
}

/** Sélecteur « Voir comme » : l'administrateur voit l'écran d'un élève ou d'un parent de démonstration. */
function DemoPreview() {
  const me = currentUser(useStore());
  const [level, setLevel] = useState<LevelId>("tle");
  const [err, setErr] = useState<string | null>(null);
  if (!me) return null;
  const go = (role: "student" | "parent") => setErr(startDemoPreview(me.id, role, level));
  return (
    <div className="demo-preview">
      <b>Voir comme…</b>
      <select aria-label="Classe de l'élève de démonstration" value={level} onChange={(e) => setLevel(e.target.value as LevelId)}>
        {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
      </select>
      <div>
        <button type="button" className="btn ghost small-btn" onClick={() => go("student")}>Élève</button>
        <button type="button" className="btn ghost small-btn" onClick={() => go("parent")}>Parent</button>
      </div>
      {err && <span role="alert">{err}</span>}
    </div>
  );
}

export function AdminNav() {
  return (
    <Rail
      label="Navigation administrateur"
      items={[
        { to: "/", label: "Tableau", Icon: Home, end: true },
        { to: "/exercices", label: "Tous les cours", Icon: Pencil },
      ]}
      foot={<><b>Administrateur</b><span>Vous voyez toutes les classes.</span><DemoPreview /></>}
    />
  );
}

export function BottomNav() {
  const me = currentUser(useStore());
  const verbes = !!me?.level && levelIndex(me.level) >= levelIndex("6e");
  return (
    <Rail
      label="Navigation principale"
      items={[
        { to: "/", label: "Accueil", Icon: Home, end: true },
        { to: "/exercices", label: "Exercices", Icon: Pencil },
        { to: "/tuteur", label: "Tuteur", Icon: Bot },
        { to: "/methodes", label: "Méthodes", Icon: Brain },
        { to: "/proprietes", label: "Propriétés", Icon: Cog },
        ...(verbes ? [{ to: "/verbes", label: "Verbes anglais", Icon: Languages }] : []),
        { to: "/progres", label: "Progrès", Icon: BarChart3 },
        { to: "/profil", label: "Profil", Icon: User },
      ]}
      foot={<><b className="foot-h"><Crown size={22} aria-hidden="true" /> Continue comme ça !</b><span>Tu progresses de jour en jour.</span><Link className="btn ghost small-btn" to="/profil">Voir mes objectifs →</Link></>}
    />
  );
}

/** Bandeau du haut (PC) : salutation + profil, identique sur toutes les pages. */
export function TopBar({ name, sub, profileTo }: { name: string; sub: string; profileTo?: string }) {
  return (
    <div className="topbar">
      <span className="wave" aria-hidden="true">👋</span>
      <div className="grow">
        <p className="topbar-h">Bonjour !</p>
        <p className="muted small">{sub}</p>
      </div>
      <NotificationBell />
      <UserMenu name={name} profileTo={profileTo} />
    </div>
  );
}

const NOTIF_ICON: Record<NotifKind, typeof Bell> = { goal: Target, streak: Flame, trophy: Trophy, exam: FileText, alert: TriangleAlert, money: Banknote, book: BookOpen, user: UserPlus };

/** Cloche : liste de notifications calculées sur l'activité réelle ; le point rouge disparaît une fois ouverte. */
export function NotificationBell() {
  const state = useStore();
  const user = currentUser(state);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  if (!user) return null;
  const list = notificationsFor(state, user);
  const unread = unreadCount(list, user.notifSeen);
  const toggle = () => { const next = !open; setOpen(next); if (next && unread > 0) window.setTimeout(() => markNotificationsSeen(user.id), 1200); };
  const go = (n: Notif) => { setOpen(false); if (n.to) navigate(n.to); };
  return (
    <div className="bell-wrap" ref={ref}>
      <button type="button" className={`bell${unread ? " has-new" : ""}`} aria-label={unread ? `Notifications, ${unread} nouvelle${unread > 1 ? "s" : ""}` : "Notifications"} aria-expanded={open} aria-haspopup="true" onClick={toggle}>
        <Bell size={20} aria-hidden="true" />
        {unread > 0 && <span className="bell-count" aria-hidden="true">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="notif-pop" role="region" aria-label="Notifications">
          <p className="notif-head">Notifications</p>
          {list.length === 0 && <p className="notif-empty">Rien de nouveau pour le moment.</p>}
          <ul className="notif-list">
            {list.map((n) => {
              const Icon = NOTIF_ICON[n.kind];
              const isNew = n.ts > (user.notifSeen ?? 0);
              return (
                <li key={n.id}>
                  <button type="button" className={`notif-item${isNew ? " new" : ""}`} onClick={() => go(n)} disabled={!n.to}>
                    <span className={`notif-ic k-${n.kind}`}><Icon size={18} aria-hidden="true" /></span>
                    <span className="notif-txt"><b>{n.title}</b><span>{n.text}</span><em>{n.ts ? relTime(n.ts) : ""}</em></span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function relTime(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return "à l'instant";
  if (d < 3600000) return `il y a ${Math.floor(d / 60000)} min`;
  if (d < 86400000) return `il y a ${Math.floor(d / 3600000)} h`;
  const j = Math.floor(d / 86400000);
  return j === 1 ? "hier" : `il y a ${j} jours`;
}

const ROLE_LABEL = { student: "Élève", parent: "Parent", admin: "Administrateur" } as const;
const fmt = (t?: number) => (t ? new Date(t).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const fmtDay = (t: number) => new Date(t).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

/** Menu du compte : informations de connexion, choix du thème (4 variantes), profil, déconnexion. */
function UserMenu({ name, profileTo }: { name: string; profileTo?: string }) {
  const state = useStore();
  const user = currentUser(state);
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const away = (e: MouseEvent) => { if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false; };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape" && ref.current) ref.current.open = false; };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, []);
  const theme = themeOf({ ...DEFAULT_PREFS, ...user?.prefs });
  const level = user?.role === "student" ? LEVELS.find((l) => l.id === (user.level ?? "tle"))?.label : undefined;
  return (
    <details className="user-menu" ref={ref}>
      <summary className="user-chip" aria-label="Menu du compte"><span className="avatar" aria-hidden="true">{name[0]?.toUpperCase()}</span><span className="chip-name">{name}</span>{level && <span className="lvl-badge">{level}</span>}<ChevronDown size={14} aria-hidden="true" /></summary>
      <div className="user-menu-list um-wide">
        {user && (
          <div className="um-id">
            <span className="avatar um-av" aria-hidden="true">{user.name[0]?.toUpperCase()}</span>
            <div>
              <b>{user.name}</b>
              <span className="um-mail">{user.email}</span>
              <span className="um-tags">
                <i>{ROLE_LABEL[user.role]}</i>
                {level && <i>{level}{user.serie ? ` · série ${user.serie}` : ""}</i>}
                <i>{countryByCode(user.country).name}</i>
              </span>
            </div>
          </div>
        )}
        {user && (
          <dl className="um-info">
            <div><dt>Connecté depuis</dt><dd>{user.lastLogin ? fmt(user.lastLogin) : "cette session"}</dd></div>
            {user.createdAt && <div><dt>Inscrit le</dt><dd>{fmtDay(user.createdAt)}</dd></div>}
            {user.role !== "admin" && <div><dt>Abonnement</dt><dd>{hasActivePlan(user) ? `Actif jusqu'au ${fmtDay(user.paidUntil!)}` : "Compte gratuit"}</dd></div>}
          </dl>
        )}
        {user && (
          <div className="um-theme" role="group" aria-label="Thème de l'application">
            <p>Thème</p>
            <div className="um-swatches">
              {THEMES.map((t) => (
                <button key={t.id} type="button" className={`um-sw${theme === t.id ? " on" : ""}`} aria-pressed={theme === t.id} onClick={() => setPrefs(user.id, { theme: t.id, dark: t.dark })}>
                  <span className="um-chip" style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)`, boxShadow: `inset 0 0 0 3px ${t.swatch[0]}, 0 0 0 3px ${t.swatch[2]}` }} aria-hidden="true" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {profileTo && <Link to={profileTo}><User size={18} aria-hidden="true" /> Mon profil</Link>}
        <button type="button" onClick={logOut}><LogOut size={18} aria-hidden="true" /> Déconnexion</button>
      </div>
    </details>
  );
}
