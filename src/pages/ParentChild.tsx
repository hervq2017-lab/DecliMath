import { Eye, Moon, Type, Zap } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Chip, ParentChildNav, StreakChip, Toggle, TopBar } from "../components/ui";
import { countryByCode, LEVELS } from "../curriculum";
import { buildPaper } from "../paper";
import { answerView, sessionsOf } from "../lib/reponses";
import { attemptsOf, notionTitle, streak } from "../lib/stats";
import { acceptedStudentsOf, currentUser, DEFAULT_PREFS, useStore } from "../store";
import Catalogue from "./Catalogue";
import Home from "./Home";
import Progress from "./Progress";

type Tab = "accueil" | "exercices" | "progres" | "reponses" | "sujets" | "profil";

/** Le parent voit exactement les écrans de son enfant, en lecture seule. */
export default function ParentChild({ tab }: { tab: Tab }) {
  const state = useStore();
  const { id = "" } = useParams();
  const me = currentUser(state)!;
  const pool = me.role === "admin" ? state.users.filter((u) => u.role === "student") : acceptedStudentsOf(state, me.id);
  const child = pool.find((c) => c.id === id);
  if (!child) return <Navigate to="/" replace />;

  return (
    <>
      <div className="readonly-banner" role="status">
        <Eye size={18} aria-hidden="true" />
        <span>Vous voyez l'écran de <b>{child.name}</b> • lecture seule</span>
        <Link to="/" className="btn link" style={{ minHeight: 32, padding: "0 8px" }}>Retour</Link>
      </div>
      <TopBar name={me.name} sub={`Vous consultez l'espace de ${child.name}, en lecture seule.`} />
      {tab === "accueil" && <Home studentId={id} />}
      {tab === "exercices" && <Catalogue studentId={id} />}
      {tab === "progres" && <Progress studentId={id} />}
      {tab === "reponses" && <ChildAnswers id={id} />}
      {tab === "sujets" && <ChildPapers id={id} />}
      {tab === "profil" && <ChildProfile id={id} />}
      <ParentChildNav id={id} />
    </>
  );
}

const dayLabel = (t: number) => new Date(t).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const hourLabel = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Toutes les réponses données par l'enfant, séries les plus récentes d'abord, avec la bonne réponse. */
function ChildAnswers({ id }: { id: string }) {
  const state = useStore();
  const child = state.users.find((u) => u.id === id)!;
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const all = attemptsOf(state, id).filter((a) => a.kind !== "placement");
  const sessions = sessionsOf(all).reverse();
  const wrong = all.filter((a) => !a.correct).length;

  return (
    <main className="shell stack">
      <h1>Réponses de {child.name}</h1>
      <p className="muted">Chaque exercice fait par {child.name}, avec sa réponse et la bonne réponse. Vous seul voyez les corrections.</p>
      <div className="chips" role="group" aria-label="Filtre des réponses">
        <Chip active={!onlyWrong} onClick={() => setOnlyWrong(false)}>Toutes ({all.length})</Chip>
        <Chip active={onlyWrong} onClick={() => setOnlyWrong(true)}>À revoir ({wrong})</Chip>
      </div>
      {all.length === 0 && <p className="muted">{child.name} n'a pas encore fait d'exercice.</p>}
      {sessions.map((ses) => {
        const rows = (onlyWrong ? ses.filter((a) => !a.correct) : ses).slice().reverse();
        if (!rows.length) return null;
        const ok = ses.filter((a) => a.correct).length;
        const notions = [...new Set(ses.map((a) => notionTitle(a.notionId)))].join(", ");
        return (
          <section key={ses[0].id} className="card stack-sm" aria-label={`Série du ${dayLabel(ses[0].ts)}`}>
            <h2 style={{ fontSize: "1.05rem" }}>{dayLabel(ses[0].ts)} · {hourLabel(ses[0].ts)}</h2>
            <p className="muted small">{notions} — {ok}/{ses.length} réussis</p>
            {rows.map((a) => {
              const v = answerView(a);
              const isOpen = open === a.id;
              return (
                <div key={a.id} className="stack-sm" style={{ borderTop: "1px solid var(--line, #8883)", paddingTop: 8 }}>
                  <p>{a.correct ? "✅" : a.near ? "🟡" : "❌"} {v?.statement ?? "Exercice qui n'existe plus dans l'application."}</p>
                  {v && (
                    <p className="small">
                      <b>Réponse de {child.name} :</b> {v.given}
                      {!a.correct && <> · <b>Bonne réponse :</b> {v.expected}</>}
                    </p>
                  )}
                  <p className="muted small">
                    {notionTitle(a.notionId)}
                    {a.helpLevel > 0 ? ` · ${a.helpLevel} indice${a.helpLevel > 1 ? "s" : ""}` : ""}
                    {a.solutionViewed ? " · a regardé le corrigé" : ""}
                    {a.kind === "check" ? " · contrôle" : ""} · {hourLabel(a.ts)}
                  </p>
                  {v?.solution && (
                    <>
                      <button type="button" className="btn link" style={{ minHeight: 32, padding: 0, justifyContent: "flex-start" }} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}>{isOpen ? "Masquer la correction" : "Voir la correction"}</button>
                      {isOpen && <p className="small" style={{ whiteSpace: "pre-line" }}>{v.solution}</p>}
                    </>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </main>
  );
}

function ChildPapers({ id }: { id: string }) {
  const state = useStore();
  const child = state.users.find((u) => u.id === id)!;
  const list = state.papers.filter((p) => p.studentId === id).sort((a, b) => b.ts - a.ts);
  return (
    <main className="shell stack">
      <h1>Sujets de {child.name}</h1>
      <p className="muted">Les sujets que {child.name} a imprimés. Le corrigé type complet n'est visible que par vous.</p>
      {list.length === 0 && <p className="muted">Aucun sujet imprimé pour l'instant.</p>}
      <div className="stack-sm">
        {list.map((p) => {
          const paper = buildPaper(p.spec);
          return (
            <Link key={p.id} to={`/enfant/${id}/sujet/${encodeURIComponent(p.id)}`} className="list-card">
              <div className="grow"><h3>{paper.title}</h3><p className="muted small">{paper.levelLabel} · {new Date(p.ts).toLocaleDateString("fr-FR")} · voir le corrigé</p></div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

function ChildProfile({ id }: { id: string }) {
  const state = useStore();
  const c = state.users.find((u) => u.id === id)!;
  const prefs = { ...DEFAULT_PREFS, ...c.prefs };
  const level = c.level ?? "tle";
  const country = countryByCode(c.country);
  const rows = [
    { Icon: Moon, t: "Mode sombre", v: !!prefs.dark },
    { Icon: Type, t: "Police adaptée dyslexie", v: prefs.dyslexia },
    { Icon: Zap, t: "Animations réduites", v: prefs.reduceMotion },
  ];
  return (
    <main className="shell stack desk-grid">
      <header className="row between">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <span className="avatar" style={{ width: 72, height: 72, fontSize: "1.9rem" }} aria-hidden="true">{c.name[0]?.toUpperCase()}</span>
          <div>
            <h1>{c.name} • {LEVELS.find((l) => l.id === level)?.label}</h1>
            <p className="muted" style={{ fontWeight: 600 }}>Objectif : {prefs.dailyGoal} min / jour</p>
          </div>
        </div>
        <StreakChip n={streak(attemptsOf(state, id))} />
      </header>
      <section className="card stack">
        <h2 style={{ fontSize: "1.05rem" }}>Réglages de {c.name}</h2>
        {rows.map(({ Icon, t, v }) => (
          <div key={t} className="setting">
            <span className="ic"><Icon size={22} aria-hidden="true" /></span>
            <span className="grow"><b>{t}</b></span>
            <Toggle checked={v} onChange={() => {}} label={t} disabled />
          </div>
        ))}
      </section>
      <section className="card stack-sm">
        <p><b>Classe :</b> {LEVELS.find((l) => l.id === level)?.label}</p>
        <p className="muted small">{country.name} ({country.zone})</p>
      </section>
    </main>
  );
}
