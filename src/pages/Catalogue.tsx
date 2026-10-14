import { BarChart3, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Clock, FileText, FlaskConical, Gem, GraduationCap, Languages, LucideIcon, Pi, Search, Settings, SlidersHorizontal, Star, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { examName, levelById, notionVisible } from "../curriculum";
import { isExitLevel } from "../engine";
import { ChapterIcon, Chip, ProgressBar, ReadLink, toneOf } from "../components/ui";
import { LEVELS, LevelId, levelIndex, NOTIONS, Subject, SUBJECT_LABEL, subjectsAt } from "../curriculum";
import { hasContent } from "../engine";
import { lessonFor } from "../content/lessons";
import { attemptsOf, itemsFor, notionPercent, SKILL_ROUND } from "../lib/stats";
import { norm as normSearch, searchAll } from "../lib/search";
import { currentUser, isAdmin, masteryFor, useStore } from "../store";

type StatusFilter = "all" | "new" | "going" | "done";
const SUBJECT_ICON: Record<Subject, LucideIcon> = { maths: Pi, physique: FlaskConical, anglais: Languages };
/** Sous-titre de carte (maquette) : famille de la notion. */
const SUBTITLE: Record<string, string> = {
  Nombres: "Nombres et calculs", Calcul: "Nombres et calculs", Algèbre: "Équations et inéquations", Fonctions: "Fonctions et proportionnalité",
  Géométrie: "Géométrie", Données: "Statistiques et probabilités", Probabilités: "Statistiques et probabilités", Grandeurs: "Grandeurs et mesures",
  Mécanique: "Grandeurs et mesures", Analyse: "Analyse",
};
const norm = normSearch;

export default function Catalogue({ studentId }: { studentId?: string }) {
  const state = useStore();
  const readOnly = !!studentId;
  const me = (studentId ? state.users.find((u) => u.id === studentId) : currentUser(state))!;
  const admin = !studentId && isAdmin(me); // seul l'administrateur voit toutes les classes
  const mine = attemptsOf(state, me.id);
  const level = me.level ?? "tle";
  const li = levelIndex(level);
  const [lv, setLv] = useState<LevelId | "all">(admin ? "all" : level);
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [open, setOpen] = useState(false);

  const subjects: Subject[] = admin && lv === "all" ? ["maths", "physique", "anglais"] : subjectsAt(admin ? (lv as LevelId) : level);
  const baseList = NOTIONS.filter((n) => (admin || notionVisible(n, me.serie)) && (admin ? lv === "all" || n.level === lv : n.level === level) && (subject === "all" || n.subject === subject));
  // Recherche : titre, chapitre, compétence, mot-clé ou propriété. Une seule lettre : simple filtre sur le titre.
  const found = useMemo(() => (q.trim().length >= 2 ? searchAll(q) : null), [q]);
  const rank = useMemo(() => new Map((found?.notions ?? []).map((n, i) => [n.id, i])), [found]);
  const list = baseList
    .filter((n) => !q.trim() || (found ? rank.has(n.id) : norm(n.title + n.chapter).includes(norm(q))))
    .sort((a, b) => (found ? (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0) : Number(hasContent(b.id)) * 2 + Number(!!lessonFor(b.id)) - (Number(hasContent(a.id)) * 2 + Number(!!lessonFor(a.id)))));
  const allowed = new Set(baseList.map((n) => n.id));
  const skillHits = (found?.skills ?? []).filter((h) => allowed.has(h.notion.id)).slice(0, 8);

  const STATUS: Record<StatusFilter, string> = { all: "Tous les statuts", new: "Nouveau", going: "En cours", done: "Maîtrisé" };
  const statusOf = (id: string): StatusFilter => {
    const m = masteryFor(state, me.id, id).status;
    const pct = notionPercent(mine, id);
    if (m === "mastered" || m === "expert") return "done";
    return m === "none" && pct === 0 ? "new" : "going";
  };
  const totalExercises = baseList.reduce((t, n) => t + (hasContent(n.id) ? itemsFor(n.id).length : 0), 0);
  const shown = list.filter((n) => status === "all" || (hasContent(n.id) && statusOf(n.id) === status));

  return (
    <main className="shell wide stack cat-page">
      <div className="cat-top">
        <section className="cat-hero" aria-label="Exercices">
          <div className="cat-hero-main">
            <span className="cat-hero-tile" aria-hidden="true"><GraduationCap size={44} /></span>
            <div>
              <h1>{admin ? "Tous les cours" : "Exercices"} <span className="dot">•</span> <span className="grad">{subject === "all" ? "Toutes les matières" : SUBJECT_LABEL[subject]}</span></h1>
              <p>{admin ? "Choisis une classe et une matière." : `Choisis une matière et révise à ton rythme. (${LEVELS[li].label})`}</p>
            </div>
          </div>
          <ul className="cat-hero-feats">
            <li><FileText size={18} aria-hidden="true" /> {totalExercises} exercices</li>
            <li><CheckCircle2 size={18} aria-hidden="true" /> Corrigés détaillés</li>
            <li><BarChart3 size={18} aria-hidden="true" /> Suivi de progression</li>
          </ul>
          <img className="cat-hero-img" src="/landing/hero-nuit-640.webp" alt="" aria-hidden="true" loading="lazy" />
          <span className="cat-hero-formula" aria-hidden="true">a² + b² = c²</span>
        </section>
        {!readOnly && !admin && (
          <aside className="cat-side" aria-label="Raccourcis">
            <div className="cat-who"><GraduationCap size={26} aria-hidden="true" /><b>{me.name}</b><ChevronDown size={18} aria-hidden="true" /></div>
            <div className="cat-side-btns">
              <Link to="/proprietes" className="cat-side-btn"><Settings size={18} aria-hidden="true" /> Propriétés</Link>
              {levelIndex(level) >= levelIndex("6e") && <Link to="/verbes" className="cat-side-btn"><Languages size={18} aria-hidden="true" /> Verbes anglais</Link>}
            </div>
          </aside>
        )}
      </div>

      <div className="cat-tools">
        <label className="search">
          <Search size={22} aria-hidden="true" />
          <span className="sr-only">Chercher un chapitre</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une notion, une compétence, une propriété…" type="search" />
        </label>
        <div className="filter-menu">
          <button type="button" className="filter-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
            <SlidersHorizontal size={20} aria-hidden="true" /> Filtres <ChevronDown size={16} aria-hidden="true" />
          </button>
          {open && (
            <div className="user-menu-list filter-list" role="listbox" aria-label="Filtrer par statut">
              {(Object.keys(STATUS) as StatusFilter[]).map((k) => (
                <button key={k} type="button" role="option" aria-selected={status === k} className={status === k ? "sel" : ""} onClick={() => { setStatus(k); setOpen(false); }}>{STATUS[k]}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {admin && (
        <div className="chips scroll" role="group" aria-label="Classe">
          <Chip active={lv === "all"} onClick={() => setLv("all")}>Toutes les classes</Chip>
          {LEVELS.map((l) => <Chip key={l.id} active={lv === l.id} onClick={() => setLv(l.id)}>{l.label}</Chip>)}
        </div>
      )}
      <div className="chips scroll subj-chips" role="group" aria-label="Matière">
        <Chip active={subject === "all"} onClick={() => setSubject("all")}><Gem size={18} aria-hidden="true" /> Toutes</Chip>
        {subjects.map((s) => {
          const I = SUBJECT_ICON[s];
          return <Chip key={s} active={subject === s} onClick={() => setSubject(s)}><I size={18} aria-hidden="true" /> {SUBJECT_LABEL[s]}</Chip>;
        })}
      </div>

      {found && skillHits.length > 0 && !readOnly && (
        <section className="card stack-sm" aria-labelledby="skills-found">
          <h2 id="skills-found" style={{ fontSize: "1.1rem" }}>Compétences trouvées</h2>
          <p className="muted small">Choisis une compétence pour t'exercer à fond : séries de {SKILL_ROUND} exercices jusqu'à la maîtrise.</p>
          {skillHits.map((h) => (
            <div key={h.templateId} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div className="grow" style={{ minWidth: 200 }}>
                <h3 style={{ fontSize: "1rem" }}>{h.label}</h3>
                <p className="muted small">{levelById(h.notion.level).label} • {h.notion.title}</p>
              </div>
              <Link className="btn ghost" to={`/notion/${encodeURIComponent(h.notion.id)}`}>Voir la notion</Link>
              <Link className="btn primary" to={`/serie/${encodeURIComponent(h.notion.id)}?t=${encodeURIComponent(h.templateId)}&drill=1`}>{SKILL_ROUND} exercices</Link>
            </div>
          ))}
        </section>
      )}
      {found && !readOnly && !admin && found.props.some((p) => allowed.has(p.notion.id)) && (
        <p className="muted small center">{found.props.filter((p) => allowed.has(p.notion.id)).length} propriété(s) correspondent aussi : <Link to="/proprietes" className="btn link">voir la rubrique Propriétés</Link></p>
      )}

      {shown.length === 0 ? (
        <p className="muted center">Aucun chapitre ne correspond.{q.trim() && found && found.notions.length > 0 ? " Cette notion existe dans une autre classe." : ""}</p>
      ) : (
        <div className="grid2 cat">
          {shown.map((n, i) => {
            const tone = toneOf(n.chapter);
            const ready = hasContent(n.id);
            const lessonOnly = !ready && !!lessonFor(n.id);
            const m = masteryFor(state, me.id, n.id);
            const pct = notionPercent(mine, n.id);
            const count = itemsFor(n.id).length;
            const st = statusOf(n.id);
            const barTone = n.subject === "physique" ? "primary" : n.subject === "anglais" ? "green" : tone === "indigo" ? "blue" : tone;
            const MetaIcon = st === "new" ? Star : st === "done" ? CheckCircle2 : pct > 0 ? BookOpen : Clock;
            const inner = (
              <>
                <span className="chap-deco" aria-hidden="true"><ChapterIcon chapter={n.chapter} size={84} /></span>
                <span className={`icon-tile sq ${tone === "indigo" ? "" : tone}`} style={{ opacity: ready ? 1 : .55 }}><ChapterIcon chapter={n.chapter} size={26} /></span>
                <div className="chap-head">
                  <h3>{n.title}</h3>
                  <p className="muted small">{SUBTITLE[n.chapter] ?? n.chapter}</p>
                </div>
                <div className="chap-bar">
                  <ProgressBar value={ready ? Math.max(pct, st === "going" && pct === 0 ? 4 : 0) : 0} tone={barTone} label={`Progression ${n.title}`} />
                  {ready && pct > 0 && <b className="pct">{pct} % maîtrisé</b>}
                </div>
                <div className="chap-foot">
                  <span className="meta"><MetaIcon size={18} aria-hidden="true" /> {lessonOnly ? "Cours disponible" : !ready ? "Bientôt" : pct > 0 && st === "going" ? `${count} exercices` : STATUS[st]}</span>
                  {ready && !(pct > 0 && st === "going") && <span className="meta count">{count} exercices</span>}
                  {(ready || lessonOnly) && <span className="go" aria-hidden="true"><ChevronRight size={18} /></span>}
                </div>
              </>
            );
            const cls = `chap rich${i === 0 && ready ? " glow" : ""}`;
            return ready || lessonOnly ? (
              <ReadLink key={n.id} readOnly={readOnly} to={`/notion/${encodeURIComponent(n.id)}`} className={cls}>{inner}</ReadLink>
            ) : (
              <div key={n.id} className={`${cls} disabled`} aria-disabled="true">{inner}</div>
            );
          })}
        </div>
      )}
      {!readOnly && !admin && <section className="card stack" aria-labelledby="epreuves">
        <h2 id="epreuves" className="row" style={{ flexWrap: "nowrap", fontSize: "1.15rem" }}><Trophy size={22} aria-hidden="true" /> Épreuves complètes</h2>
        <p className="muted small">Chronométrées, sans aide, corrigées à la fin. Pour s'entraîner aux examens.</p>
        {subjectsAt(level).filter((sj) => NOTIONS.some((n) => n.subject === sj && n.level === level && hasContent(n.id))).map((sj) => (
          <div key={sj} className="stack-sm">
            <Link className="btn ghost block" to={`/epreuve/${sj}/level`}>Composition de {LEVELS[li].label} : {SUBJECT_LABEL[sj]}</Link>
            {isExitLevel(level) && <Link className="btn primary block" to={`/epreuve/${sj}/exit`}>Examen blanc {examName(me.country, level)} : {SUBJECT_LABEL[sj]}</Link>}
          </div>
        ))}
      </section>}
    </main>
  );
}
