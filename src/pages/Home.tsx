import { CalendarDays, Play, ScanLine, Sparkles, Target } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChapterIcon, ChevronRight, ProgressBar, ReadLink, StreakChip } from "../components/ui";
import { refreshExerciseAssignments } from "../lib/exerciseAssignments";
import { lessonFor } from "../content/lessons";
import { notionsOf, subjectsAt } from "../curriculum";
import { hasContent } from "../engine";
import { attemptsOf, notionPercent, streak, weekDays } from "../lib/stats";
import { nextActions } from "../lib/parcours";
import { currentUser, masteryFor, useStore } from "../store";

const RANK = { fragile: 0, none: 1, started: 2, progress: 3, mastered: 4, expert: 5 } as const;

export default function Home({ studentId }: { studentId?: string }) {
  const state = useStore();
  const readOnly = !!studentId;
  const me = (studentId ? state.users.find((u) => u.id === studentId) : currentUser(state))!;
  const viewer = currentUser(state);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  useEffect(() => {
    const owner = readOnly && viewer?.role === "parent" ? viewer : me;
    if (!owner || (owner.role !== "parent" && owner.role !== "student")) return;
    const role = owner.role;
    const refresh = () => { void refreshExerciseAssignments(owner.id, role).then(setAssignmentError); };
    refresh();
    const timer = readOnly && owner.role === "parent" ? window.setInterval(refresh, 15_000) : undefined;
    return () => { if (timer !== undefined) window.clearInterval(timer); };
  }, [me.id, readOnly, viewer?.id]);
  const level = me.level ?? "tle";
  const mine = attemptsOf(state, me.id);
  const days = weekDays(mine);
  const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const notions = subjectsAt(level).flatMap((s) => notionsOf(s, level)).filter((n) => hasContent(n.id));
  const sorted = [...notions].sort((a, b) => RANK[masteryFor(state, me.id, a.id).status] - RANK[masteryFor(state, me.id, b.id).status]);
  // on reprend la notion entamée la plus récente, sinon la plus utile
  const lastId = [...mine].reverse().find((a) => a.kind === "practice")?.notionId;
  const hero = (lastId && notions.find((n) => n.id === lastId)) || sorted[0];
  const withLesson = sorted.find((n) => lessonFor(n.id) && n.id !== hero?.id);
  const heroPct = hero ? notionPercent(mine, hero.id) : 0;
  const todo = nextActions(state, me.id, level, 3);
  const heroItems = hero ? Math.max(0, 6 - mine.filter((a) => a.notionId === hero.id && a.correct).length) : 0;
  const assignments = state.exerciseAssignments.filter((assignment) => assignment.studentId === me.id).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <main className="shell stack">
      <header className="row between">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <CalendarDays size={36} className="cal-ic" aria-hidden="true" />
          <div>
            <p className="muted" style={{ fontWeight: 600, textTransform: "capitalize" }}>{date}</p>
            <h1 style={{ fontSize: "1.4rem" }}>{readOnly ? `Écran de ${me.name}` : `Salut ${me.name} !`}</h1>
          </div>
        </div>
        <StreakChip n={streak(mine)} />
      </header>

      <div className="weekdots" role="list" aria-label="Activité de la semaine">
        {days.map((d, i) => (
          <div key={i} role="listitem" className={`day${d.active ? " on" : ""}${d.today ? " today" : ""}`} aria-label={`${["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][i]} : ${d.active ? "actif" : d.future ? "à venir" : "pas d'activité"}`}>
            <span>{d.label}</span><small>{d.date}</small><i />
          </div>
        ))}
      </div>

      {(assignments.length > 0 || assignmentError) && (
        <section className="card stack-sm" aria-labelledby="assigned-exercises">
          <h2 id="assigned-exercises" className="row" style={{ fontSize: "1.1rem" }}><Target size={20} aria-hidden="true" /> Exercices proposés</h2>
          {assignmentError && <p className="auth-error" role="alert">{assignmentError}</p>}
          {assignments.map((assignment) => {
            const to = `/serie/${encodeURIComponent(assignment.notionId)}?t=${encodeURIComponent(assignment.templateId)}&drill=1&n=10&assignment=${encodeURIComponent(assignment.id)}`;
            return (
              <Link key={assignment.id} to={to} className={`list-card${assignment.completedAt ? " assignment-done" : ""}`}>
                <span className={`icon-tile ${assignment.completedAt ? "green" : "yellow"} sm`}><Target size={22} aria-hidden="true" /></span>
                <div className="grow">
                  <h3>{assignment.title}</h3>
                  <p className="muted small">{assignment.completedAt ? "Série terminée" : "Série de 10 exercices à faire"} · {new Date(assignment.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <ChevronRight size={22} aria-hidden="true" />
              </Link>
            );
          })}
        </section>
      )}

      {hero && (
        <>
          <ReadLink readOnly={readOnly} to={`/serie/${encodeURIComponent(hero.id)}`} className="hero-card">
            <span className="icon-tile yellow" style={{ width: 80, height: 80, borderRadius: 24 }}><ChapterIcon chapter={hero.chapter} size={36} /></span>
            <div className="grow stack-sm">
              <p className="eyebrow">Continuer • {hero.chapter}</p>
              <h2>{hero.title}</h2>
              <ProgressBar value={heroPct} tone="onnavy" label="Progression" />
              <p style={{ color: "rgba(255, 255, 255, .95)", fontWeight: 600 }}>{heroPct} % • Encore {heroItems} exercices</p>
            </div>
            <ChevronRight size={26} aria-hidden="true" />
          </ReadLink>
          {!readOnly && <ReadLink to={`/serie/${encodeURIComponent(hero.id)}`} className="btn yellow block resume"><Play size={20} aria-hidden="true" /> Reprendre où je me suis arrêté <ArrowRight size={18} aria-hidden="true" /></ReadLink>}
        </>
      )}

      <h2 style={{ marginTop: 8 }}>{readOnly ? `Proposé à ${me.name}` : "Pour toi"}</h2>
      <div className="cols2">
      {withLesson && (
        <ReadLink readOnly={readOnly} to={`/notion/${encodeURIComponent(withLesson.id)}`} className="list-card">
          <span className="icon-tile blue sm" style={{ background: "var(--blue-soft)", color: "var(--blue-ink)" }}><Sparkles size={22} aria-hidden="true" /></span>
          <div className="grow"><h3>Mini-cours : {withLesson.title}</h3><p className="muted small" style={{ fontWeight: 600 }}>Quelques minutes • Recommandé pour toi</p></div>
          <ChevronRight size={22} aria-hidden="true" />
        </ReadLink>
      )}
      <ReadLink readOnly={readOnly} to="/scanner" className="list-card">
        <span className="icon-tile blue sm" style={{ background: "var(--blue-soft)", color: "var(--blue-ink)" }}><ScanLine size={22} aria-hidden="true" /></span>
        <div className="grow"><h3>Scanner un exercice</h3><p className="muted small" style={{ fontWeight: 600 }}>Photo ou PDF • toutes matières</p></div>
        <ChevronRight size={22} aria-hidden="true" />
      </ReadLink>
      {todo.map((a) => (
        <ReadLink key={a.id} readOnly={readOnly} to={a.to} className="list-card">
          <span className="icon-tile yellow sm" style={{ background: "var(--yellow-soft)", color: "var(--yellow-ink)" }}><Target size={22} aria-hidden="true" /></span>
          <div className="grow"><h3>{a.label}</h3><p className="muted small" style={{ fontWeight: 600 }}>{a.why}</p></div>
          <ChevronRight size={22} aria-hidden="true" />
        </ReadLink>
      ))}
      <ReadLink readOnly={readOnly} to="/serie/defi" className="list-card">
        <span className="icon-tile green sm" style={{ background: "var(--green-soft)", color: "var(--green-ink)" }}><Target size={22} aria-hidden="true" /></span>
        <div className="grow"><h3>Défi effort : 5 exos sans pression</h3><p className="muted small" style={{ fontWeight: 600 }}>+50 pts possibles • Série douce</p></div>
        <ChevronRight size={22} aria-hidden="true" />
      </ReadLink>
      </div>
      {!hero && <p className="muted">Pas encore de contenu pour ta classe : choisis une autre classe dans ton profil.</p>}
    </main>
  );
}
