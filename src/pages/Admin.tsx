import { Activity, CheckCircle2, ChevronRight, GraduationCap, Search, ShieldCheck, Undo2, Users, UsersRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProgressBar, StreakChip } from "../components/ui";
import { countryByCode, LEVELS, notionById, notionsOf, subjectsAt } from "../curriculum";
import { hasContent } from "../engine";
import { attemptsOf, dayKey, relativeDay, streak } from "../lib/stats";
import { LESSONS } from "../content/lessons";
import { logOut, masteryFor, setLessonValidated, useStore } from "../store";
import { AccountsTab, ContentTab, JournalTab, PaymentsTab } from "./AdminTabs";
import "./admin.css";

const DAY = 864e5;
const lvlLabel = (id?: string) => LEVELS.find((l) => l.id === id)?.label ?? id ?? "";
const WEEK_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

/** Compteur animé (respecte « animations réduites »). */
function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce") { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.max(0, Math.min(1, (t - t0) / ms));
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Kpi({ Icon, value, label, tone, i }: { Icon: typeof Users; value: number; label: string; tone: string; i: number }) {
  const n = useCountUp(value);
  return (
    <div className={`ad-kpi ad-${tone}`} style={{ ["--i" as string]: i }}>
      <span className="ad-kpi-ic"><Icon size={22} aria-hidden="true" /></span>
      <b aria-label={`${value} ${label}`}>{n}</b>
      <span>{label}</span>
    </div>
  );
}

/** Anneau de progression SVG. */
function Ring({ pct, label }: { pct: number; label: string }) {
  const r = 52, c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(pct)); return () => cancelAnimationFrame(id); }, [pct]);
  return (
    <div className="ad-ring" role="img" aria-label={`${label} : ${pct} %`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs><linearGradient id="adg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#10c6ff" /><stop offset="1" stopColor="#9a56ff" /></linearGradient></defs>
        <circle cx="60" cy="60" r={r} className="ad-ring-bg" />
        <circle cx="60" cy="60" r={r} className="ad-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} />
      </svg>
      <span><b>{pct}</b><em>%</em></span>
    </div>
  );
}

/** Tableau de bord administrateur : tous les élèves, classe par classe. */
const TABS = [["pilotage", "Pilotage"], ["contenu", "Contenu"], ["comptes", "Comptes"], ["paiements", "Paiements"], ["journal", "Journal"]] as const;
type Tab = (typeof TABS)[number][0];

export default function Admin() {
  const [tab, setTab] = useState<Tab>("pilotage");
  const state = useStore();
  const students = state.users.filter((u) => u.role === "student");
  const parents = state.users.filter((u) => u.role === "parent");
  const now = Date.now();

  /* ---- activité des 7 derniers jours (tous élèves) ---- */
  const activity = useMemo(() => {
    const ids = new Set(students.map((s) => s.id));
    const mine = state.attempts.filter((a) => ids.has(a.studentId));
    const days = Array.from({ length: 7 }, (_, k) => {
      const t = now - (6 - k) * DAY;
      return { key: dayKey(t), label: WEEK_LABELS[(new Date(t).getDay() + 6) % 7], n: 0 };
    });
    mine.forEach((a) => { const d = days.find((x) => x.key === dayKey(a.ts)); if (d) d.n++; });
    const active = new Set(mine.filter((a) => now - a.ts < 7 * DAY).map((a) => a.studentId));
    return { days, max: Math.max(1, ...days.map((d) => d.n)), total: days.reduce((s, d) => s + d.n, 0), active };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempts, state.users]);

  /* ---- validation des cours ---- */
  const drafts = LESSONS.filter((l) => l.status === "draft");
  const validatedCount = drafts.filter((l) => state.validated?.[l.notionId]).length;
  const pending = drafts.length - validatedCount;
  const validPct = drafts.length ? Math.round((validatedCount / drafts.length) * 100) : 100;
  const [showAll, setShowAll] = useState(false);
  const [lvlFilter, setLvlFilter] = useState("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(12);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number>();

  const draftLevels = useMemo(() => Array.from(new Set(drafts.map((l) => notionById(l.notionId)?.level).filter(Boolean) as string[])), [drafts.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const filtered = drafts.filter((l) => {
    const n = notionById(l.notionId);
    const ok = !!state.validated?.[l.notionId];
    if (!showAll && ok) return false;
    if (lvlFilter !== "all" && n?.level !== lvlFilter) return false;
    if (q.trim() && !`${n?.title ?? l.notionId} ${n?.chapter ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });
  const rows = filtered.slice(0, limit);
  const toggle = (id: string, ok: boolean) => {
    setLessonValidated(id, !ok);
    setFlash(id);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 900);
  };
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  /* ---- élèves : filtres ---- */
  const [sq, setSq] = useState("");
  const [cls, setCls] = useState("all");
  const [act, setAct] = useState<"all" | "active" | "idle">("all");
  const classes = LEVELS.filter((l) => students.some((s) => (s.level ?? "tle") === l.id));
  const visible = students.filter((s) => {
    if (cls !== "all" && (s.level ?? "tle") !== cls) return false;
    if (act === "active" && !activity.active.has(s.id)) return false;
    if (act === "idle" && activity.active.has(s.id)) return false;
    if (sq.trim() && !s.name.toLowerCase().includes(sq.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <main className="shell wide stack ad">
      <header className="ad-hero">
        <div className="ad-hero-top">
          <span className="ad-badge"><ShieldCheck size={16} aria-hidden="true" /> Administrateur</span>
          <button className="btn link ad-out" onClick={logOut}>Déconnexion</button>
        </div>
        <div className="ad-hero-body">
          <div className="ad-hero-txt">
            <h1>Pilotage <span className="ad-grad">DeclickMath</span></h1>
            <p>{pending > 0 ? <><b>{pending}</b> cours attendent votre relecture.</> : "Tous les cours sont validés. Bravo !"} {activity.active.size > 0 && <>· <b>{activity.active.size}</b> élève{activity.active.size > 1 ? "s" : ""} actif{activity.active.size > 1 ? "s" : ""} cette semaine.</>}</p>
            <div className="ad-hero-cta">
              <a className="btn yellow small-btn" href="#valid">Relire les cours</a>
              <Link className="btn ghost small-btn" to="/exercices">Parcourir les cours</Link>
            </div>
          </div>
          <div className="ad-hero-ring"><Ring pct={validPct} label="Cours validés" /><small>cours validés</small></div>
        </div>
        <div className="ad-spark" role="img" aria-label={`${activity.total} exercices réalisés ces 7 derniers jours`}>
          {activity.days.map((d, k) => (
            <span key={k} className="ad-spark-col" title={`${d.n} exercice${d.n > 1 ? "s" : ""}`}>
              <i style={{ ["--h" as string]: `${Math.max(6, Math.round((d.n / activity.max) * 100))}%`, ["--i" as string]: k }} />
              <em>{d.label}</em>
            </span>
          ))}
          <span className="ad-spark-sum"><Activity size={16} aria-hidden="true" /> {activity.total} exercices / 7 j</span>
        </div>
      </header>

      <nav className="ad-tabs" aria-label="Sections de l'administration">
        {TABS.map(([id, label]) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{label}</button>)}
      </nav>
      {tab === "contenu" && <ContentTab />}
      {tab === "comptes" && <AccountsTab />}
      {tab === "paiements" && <PaymentsTab />}
      {tab === "journal" && <JournalTab />}
      {tab === "pilotage" && <>
      <section className="ad-kpis" aria-label="Chiffres clés">
        <Kpi Icon={GraduationCap} value={students.length} label="Élèves" tone="blue" i={0} />
        <Kpi Icon={UsersRound} value={parents.length} label="Parents" tone="violet" i={1} />
        <Kpi Icon={Users} value={new Set(students.map((s) => s.level)).size} label="Classes actives" tone="green" i={2} />
        <Kpi Icon={CheckCircle2} value={pending} label="Cours à valider" tone="yellow" i={3} />
      </section>

      <section id="valid" className="card ad-panel stack-sm" aria-labelledby="valid-h">
        <div className="row between">
          <h2 id="valid-h" className="ad-h">Cours à valider <span className="ad-count">{pending} / {drafts.length}</span></h2>
          <div className="ad-seg" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={!showAll} onClick={() => { setShowAll(false); setLimit(12); }}>En attente</button>
            <button type="button" aria-pressed={showAll} onClick={() => { setShowAll(true); setLimit(12); }}>Tous</button>
          </div>
        </div>
        <ProgressBar value={validPct} tone="green" label="Cours validés" />
        <p className="muted small">Ces cours ont été rédigés par IA. Un enseignant les relit puis les valide ici : rien n'est jamais validé automatiquement.</p>
        <div className="ad-tools">
          <label className="ad-search"><Search size={18} aria-hidden="true" /><input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(12); }} placeholder="Rechercher un cours ou un chapitre" aria-label="Rechercher un cours" /></label>
          <div className="chips scroll" role="group" aria-label="Filtrer par classe">
            <button type="button" className={`chip small${lvlFilter === "all" ? " active" : ""}`} onClick={() => { setLvlFilter("all"); setLimit(12); }}>Toutes</button>
            {draftLevels.map((lv) => <button key={lv} type="button" className={`chip small${lvlFilter === lv ? " active" : ""}`} onClick={() => { setLvlFilter(lv); setLimit(12); }}>{lvlLabel(lv)}</button>)}
          </div>
        </div>
        <div className="ad-list" aria-live="polite">
          {rows.map((l, i) => {
            const n = notionById(l.notionId);
            const ok = !!state.validated?.[l.notionId];
            return (
              <div key={l.notionId} className={`ad-item${ok ? " ok" : ""}${flash === l.notionId ? " flash" : ""}`} style={{ ["--i" as string]: Math.min(i, 8) }}>
                <span className="ad-dot" aria-hidden="true">{ok ? <CheckCircle2 size={18} /> : <i />}</span>
                <span className="grow"><b>{n?.title ?? l.notionId}</b><span className="muted small">{n ? `${lvlLabel(n.level)} · ${n.chapter}` : ""}</span></span>
                <button type="button" className={ok ? "btn ghost small-btn" : "btn primary small-btn"} onClick={() => toggle(l.notionId, ok)}>{ok ? <><Undo2 size={16} aria-hidden="true" /> Annuler</> : "Valider"}</button>
              </div>
            );
          })}
          {rows.length === 0 && <p className="muted center ad-empty">{showAll || q || lvlFilter !== "all" ? "Aucun cours ne correspond." : "🎉 Plus rien à valider."}</p>}
        </div>
        {filtered.length > rows.length && <button type="button" className="btn ghost small-btn ad-more" onClick={() => setLimit(limit + 20)}>Afficher plus ({filtered.length - rows.length} restants)</button>}
      </section>

      <section className="stack-sm" aria-labelledby="stu-h">
        <div className="row between">
          <h2 id="stu-h" className="ad-h">Élèves <span className="ad-count">{visible.length}</span></h2>
          <div className="ad-seg" role="group" aria-label="Activité">
            {([["all", "Tous"], ["active", "Actifs 7 j"], ["idle", "Inactifs"]] as const).map(([v, t]) => <button key={v} type="button" aria-pressed={act === v} onClick={() => setAct(v)}>{t}</button>)}
          </div>
        </div>
        <div className="ad-tools">
          <label className="ad-search"><Search size={18} aria-hidden="true" /><input type="search" value={sq} onChange={(e) => setSq(e.target.value)} placeholder="Rechercher un élève" aria-label="Rechercher un élève" /></label>
          <div className="chips scroll" role="group" aria-label="Filtrer par classe">
            <button type="button" className={`chip small${cls === "all" ? " active" : ""}`} onClick={() => setCls("all")}>Toutes</button>
            {classes.map((l) => <button key={l.id} type="button" className={`chip small${cls === l.id ? " active" : ""}`} onClick={() => setCls(l.id)}>{l.label}</button>)}
          </div>
        </div>

        {students.length === 0 && <p className="muted center ad-empty">Aucun élève inscrit pour le moment.</p>}
        {students.length > 0 && visible.length === 0 && <p className="muted center ad-empty">Aucun élève ne correspond à ces filtres.</p>}

        <div className="kids">
          {visible.map((s, i) => {
            const all = attemptsOf(state, s.id);
            const lvl = s.level ?? "tle";
            const notions = subjectsAt(lvl).flatMap((sj) => notionsOf(sj, lvl)).filter((n) => hasContent(n.id));
            const mastered = notions.filter((n) => ["mastered", "expert"].includes(masteryFor(state, s.id, n.id).status)).length;
            const pct = notions.length ? Math.round((mastered / notions.length) * 100) : 0;
            const last = all.length ? Math.max(...all.map((a) => a.ts)) : 0;
            const parent = state.users.find((u) => u.id === s.parentId);
            const isActive = activity.active.has(s.id);
            const week = Array.from({ length: 7 }, (_, k) => all.filter((a) => dayKey(a.ts) === dayKey(now - (6 - k) * DAY)).length);
            const wmax = Math.max(1, ...week);
            return (
              <Link key={s.id} to={`/enfant/${s.id}`} className="card kid ad-kid" style={{ ["--i" as string]: Math.min(i, 10) }} aria-label={`${s.name}, voir son écran`}>
                <div className="row between">
                  <div className="row" style={{ flexWrap: "nowrap" }}>
                    <span className={`avatar ad-av${isActive ? " on" : ""}`} aria-hidden="true">{s.name[0]?.toUpperCase()}</span>
                    <div>
                      <h3>{s.name} <span className={`ad-st ${isActive ? "on" : "off"}`}>{isActive ? "Actif" : "Inactif"}</span></h3>
                      <p className="muted small">{LEVELS.find((l) => l.id === lvl)?.label} • {countryByCode(s.country).name}</p>
                      <p className="muted small">{parent ? `Parent : ${parent.name}` : "Sans parent lié"} • {last ? relativeDay(last) : "Pas encore d'activité"}</p>
                    </div>
                  </div>
                  <StreakChip n={streak(all)} />
                </div>
                <div className="ad-mini" aria-hidden="true">{week.map((n, k) => <i key={k} style={{ height: `${Math.max(8, Math.round((n / wmax) * 100))}%`, opacity: n ? 1 : .3 }} />)}</div>
                <ProgressBar value={pct} tone="green" label={`Maîtrise de ${s.name}`} />
                <p className="ad-kid-foot"><span className="muted small" style={{ fontWeight: 600 }}>{mastered}/{notions.length} notions maîtrisées</span><span className="ad-go">Voir son écran <ChevronRight size={16} aria-hidden="true" /></span></p>
              </Link>
            );
          })}
        </div>
      </section>
      </>}
    </main>
  );
}
