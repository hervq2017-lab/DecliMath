import { Target } from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton } from "../components/ui";
import { errInfo } from "../content/erreurs";
import { notionById } from "../curriculum";
import { ErrorGroup, errorGroups, recurring } from "../lib/knowledge";
import { relativeDay } from "../lib/stats";
import { currentUser, useStore } from "../store";
import "../methodes.css";

/** Où s'entraîner pour corriger cette erreur : l'exercice où elle s'est produite, sinon la notion. */
function practiceLink(g: ErrorGroup): string {
  if (g.templateId?.startsWith("et:")) return `/etapes/${g.templateId.slice(3)}`;
  if (g.templateId?.startsWith("pb:")) return `/probleme/${encodeURIComponent(g.templateId.split(":")[1])}`;
  if (g.templateId) return `/serie/${encodeURIComponent(g.notionId)}?t=${encodeURIComponent(g.templateId)}&drill=1`;
  return `/serie/${encodeURIComponent(g.notionId)}`;
}

/** Détection et correction des erreurs : les erreurs récurrentes, ce qu'elles signifient, et comment les corriger. */
export default function Erreurs() {
  const state = useStore();
  const me = currentUser(state)!;
  const groups = errorGroups(state, me.id).filter((g) => notionById(g.notionId));
  const open = groups.filter((g) => !g.resolved);
  const fixed = groups.filter((g) => g.resolved);

  return (
    <main className="shell wide no-nav stack">
      <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><Target size={26} aria-hidden="true" /> Mes erreurs</h1></div>
      <p className="muted">Une erreur qui revient n'est pas un manque d'intelligence : c'est une habitude à corriger. On repère ce qui revient, on comprend pourquoi, puis on s'entraîne exactement là-dessus.</p>

      {groups.length === 0 && <p className="card">Aucune erreur enregistrée pour le moment. Fais quelques exercices : si une même erreur revient, elle apparaîtra ici avec son explication.</p>}

      {open.map((g) => {
        const info = errInfo(g.tag);
        const n = notionById(g.notionId)!;
        return (
          <section key={g.tag + g.notionId} className="card stack-sm" aria-label={info.label}>
            <div className="row between" style={{ flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.1rem" }}>{info.label}</h2>
              <span className={recurring(g) ? "pill yellow" : "pill"}>{recurring(g) ? "Revient souvent" : "Vue une fois"}</span>
            </div>
            <p className="muted small">{n.title} • {g.count} fois • dernière fois : {relativeDay(g.last)}</p>
            <p>{info.advice}</p>
            <Link className="btn primary" to={practiceLink(g)}>S'entraîner sur cette erreur</Link>
            <p className="muted small">L'erreur sera marquée « corrigée » après deux réussites nettes sur cette notion.</p>
          </section>
        );
      })}

      {fixed.length > 0 && (
        <section className="card stack-sm">
          <h2 style={{ fontSize: "1.1rem" }}>Erreurs corrigées 🎉</h2>
          {fixed.map((g) => <p key={g.tag + g.notionId}><b>{errInfo(g.tag).label}</b> — {notionById(g.notionId)!.title}</p>)}
        </section>
      )}
    </main>
  );
}
