import { Award } from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton, ChevronRight } from "../components/ui";
import { notionsOf, subjectsAt, SUBJECT_LABEL } from "../curriculum";
import { hasContent } from "../engine";
import { knowledgeMap, knowledgeOf, KLEVELS } from "../lib/knowledge";
import { badgesFor, levelLabel, nextStepToward, weeklyObjectives } from "../lib/parcours";
import { currentUser, useStore } from "../store";
import "../methodes.css";

const Pips = ({ level }: { level: number }) => <span className="mt-lv" aria-hidden="true">{[1, 2, 3, 4].map((i) => <i key={i} className={i <= level ? "on" : ""} />)}</span>;

/** Parcours de progression : niveau de chaque notion, objectifs de la semaine et récompenses. */
export default function Parcours({ studentId }: { studentId?: string }) {
  const state = useStore();
  const me = (studentId ? state.users.find((u) => u.id === studentId) : currentUser(state))!;
  const level = me.level ?? "tle";
  const map = knowledgeMap(state, me.id);
  const badges = badgesFor(state, me.id, map);
  const objectives = weeklyObjectives(state, me.id);
  const notions = subjectsAt(level).flatMap((su) => notionsOf(su, level)).filter((n) => hasContent(n.id));
  const count = [0, 1, 2, 3, 4].map((l) => notions.filter((n) => knowledgeOf(map, n.id).level === l).length);
  const earned = badges.filter((b) => b.earned);

  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}>{!studentId && <BackButton to="/methodes" />}<h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><Award size={26} aria-hidden="true" /> {studentId ? `Parcours de ${me.name}` : "Mon parcours"}</h1></div>
      <p className="muted">Chaque notion a quatre niveaux. On monte en montrant qu'on maîtrise vraiment — et le dernier niveau demande de réussir encore plusieurs jours plus tard : c'est la preuve qu'on retient.</p>

      <section className="card stack-sm" aria-label="Résumé">
        <h2 style={{ fontSize: "1.1rem" }}>{notions.length} notions dans ta classe</h2>
        {KLEVELS.map((name, l) => (
          <div key={name} className="mt-bar-row">
            <span className="lbl row" style={{ gap: 8, flexWrap: "nowrap" }}><Pips level={l} /> {name}</span>
            <div className="mt-bar good"><i style={{ width: `${notions.length ? (count[l] / notions.length) * 100 : 0}%` }} /></div>
            <span className="small">{count[l]}</span>
          </div>
        ))}
      </section>

      <section className="card stack-sm" aria-label="Objectifs de la semaine">
        <h2 style={{ fontSize: "1.1rem" }}>Objectifs de la semaine</h2>
        {objectives.map((o) => (
          <div key={o.id} className="mt-bar-row">
            <span className="lbl">{o.label}</span>
            <div className={`mt-bar ${o.value >= o.goal ? "good" : ""}`} role="img" aria-label={`${o.value} sur ${o.goal}`}><i style={{ width: `${Math.min(100, (o.value / o.goal) * 100)}%` }} /></div>
            <span className="small">{Math.min(o.value, o.goal)}/{o.goal}{o.value >= o.goal ? " ✓" : ""}</span>
          </div>
        ))}
      </section>

      {subjectsAt(level).map((su) => {
        const list = notionsOf(su, level).filter((n) => hasContent(n.id));
        if (!list.length) return null;
        const chapters = [...new Set(list.map((n) => n.chapter))];
        return (
          <section key={su} className="stack-sm" aria-label={SUBJECT_LABEL[su]}>
            <h2 style={{ fontSize: "1.15rem" }}>{SUBJECT_LABEL[su]}</h2>
            {chapters.map((ch) => (
              <div key={ch} className="card stack-sm">
                <h3 style={{ fontSize: "1rem" }}>{ch}</h3>
                {list.filter((n) => n.chapter === ch).map((n) => {
                  const k = knowledgeOf(map, n.id);
                  const row = (
                    <>
                      <div className="grow">
                        <b>{n.title}</b> <span className="muted small">• {levelLabel(k)}</span>{k.toRefresh && <span className="pill yellow" style={{ marginLeft: 8 }}>À rafraîchir</span>}
                        <p className="muted small" style={{ margin: "2px 0 0" }}>{nextStepToward(k)}</p>
                      </div>
                      <Pips level={k.level} />
                      {!studentId && <ChevronRight size={18} aria-hidden="true" />}
                    </>
                  );
                  return studentId
                    ? <div key={n.id} className="row" style={{ flexWrap: "nowrap" }}>{row}</div>
                    : <Link key={n.id} to={`/notion/${encodeURIComponent(n.id)}`} className="row" style={{ flexWrap: "nowrap", color: "inherit", textDecoration: "none" }}>{row}</Link>;
                })}
              </div>
            ))}
          </section>
        );
      })}

      <section className="stack-sm" aria-label="Récompenses">
        <h2 style={{ fontSize: "1.15rem" }}>Récompenses ({earned.length}/{badges.length})</h2>
        <div className="mt-badges">
          {badges.map((b) => (
            <div key={b.id} className={`mt-badge ${b.earned ? "earned" : "locked"}`}>
              <h4>{b.earned ? "🏅 " : "🔒 "}{b.label}</h4>
              <p>{b.desc}</p>
              {!b.earned && <p><b>{b.value}/{b.goal}</b></p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
