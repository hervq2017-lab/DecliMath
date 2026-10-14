import { Link } from "react-router-dom";
import { notionsOf, subjectsAt } from "../curriculum";
import type { LevelId } from "../curriculum";
import { hasContent } from "../engine";
import { averageStrength, knowledgeMap, knowledgeOf, KLEVELS } from "../lib/knowledge";
import type { State } from "../store";
import "../methodes.css";

/** Vue d'ensemble des connaissances : solidité par chapitre (acquis × souvenir), et notions à rafraîchir. */
export function KnowledgePanel({ state, studentId, level, readOnly }: { state: State; studentId: string; level: LevelId; readOnly?: boolean }) {
  const map = knowledgeMap(state, studentId);
  const notions = subjectsAt(level).flatMap((su) => notionsOf(su, level)).filter((n) => hasContent(n.id));
  const chapters = [...new Set(notions.map((n) => n.chapter))];
  const touched = notions.filter((n) => knowledgeOf(map, n.id).n > 0);
  const refresh = notions.filter((n) => knowledgeOf(map, n.id).toRefresh).slice(0, 3);
  return (
    <section className="card stack-sm" aria-labelledby="kp">
      <h3 id="kp">Solidité des connaissances</h3>
      <p className="muted small">Combien de chaque chapitre est acquis <b>et encore frais en mémoire</b>. {touched.length}/{notions.length} notions travaillées.</p>
      {chapters.map((ch) => {
        const ids = notions.filter((n) => n.chapter === ch).map((n) => n.id);
        const v = Math.round(averageStrength(map, ids) * 100);
        const best = Math.max(...ids.map((id) => knowledgeOf(map, id).level));
        return (
          <div key={ch} className="mt-bar-row">
            <span className="lbl">{ch}</span>
            <div className={`mt-bar ${v >= 70 ? "good" : v < 30 && ids.some((id) => knowledgeOf(map, id).n > 0) ? "weak" : ""}`} role="img" aria-label={`${v} %, niveau ${KLEVELS[best]}`}><i style={{ width: `${v}%` }} /></div>
            <span className="small">{v} %</span>
          </div>
        );
      })}
      {refresh.length > 0 && (
        <p className="callout">À rafraîchir bientôt : {refresh.map((n, i) => (readOnly ? <span key={n.id}>{i ? ", " : ""}{n.title}</span> : <span key={n.id}>{i ? ", " : ""}<Link to={`/serie/${encodeURIComponent(n.id)}`}>{n.title}</Link></span>))}.</p>
      )}
      {!readOnly && <Link className="btn ghost" to="/parcours">Voir mon parcours et mes récompenses</Link>}
    </section>
  );
}
