import { ChevronRight, Clock, Star, Target, TrendingUp, Trophy } from "lucide-react";
import { useState } from "react";
import { KnowledgePanel } from "../components/KnowledgePanel";
import { ChapterIcon, ProgressBar, ReadLink, toneOf } from "../components/ui";
import { notionById, notionsOf, SUBJECT_LABEL, subjectsAt } from "../curriculum";
import { hasContent } from "../engine";
import { attemptsOf, effortLevel, history, notionTitle, pointsOf, pointsSeries, Range, rangeTotal, relativeDay, timeLabel } from "../lib/stats";
import { currentUser, masteryFor, useStore } from "../store";

const RANGES: { id: Range; label: string }[] = [{ id: "7", label: "7 jours" }, { id: "30", label: "30 jours" }, { id: "90", label: "3 mois" }];

function dateLabel(ts: number) {
  const rel = relativeDay(ts);
  if (rel === "Aujourd'hui" || rel === "Hier") return `${rel} • ${timeLabel(ts)}`;
  const d = new Date(ts).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  return `${d.replace(/^./, (c) => c.toUpperCase())} • ${timeLabel(ts)}`;
}

/** Courbe lissée des points d'effort (SVG, s'adapte à la largeur). */
function Curve({ data, label }: { data: { label: string; value: number; future: boolean }[]; label: string }) {
  const W = 640, H = 220, L = 40, R = 16, T = 14, B = 30;
  const shown = data.filter((d) => !d.future);
  const top = Math.max(50, Math.ceil(Math.max(...data.map((d) => d.value)) / 50) * 50);
  const x = (i: number) => L + (data.length === 1 ? 0 : (i / (data.length - 1)) * (W - L - R));
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const pts = shown.map((d, i) => [x(i), y(d.value)] as const);
  let line = "";
  pts.forEach(([px, py], i) => {
    if (i === 0) { line = `M${px},${py}`; return; }
    const [qx, qy] = pts[i - 1], mx = (qx + px) / 2;
    line += ` C${mx},${qy} ${mx},${py} ${px},${py}`;
  });
  const area = pts.length ? `${line} L${pts[pts.length - 1][0]},${y(0)} L${pts[0][0]},${y(0)} Z` : "";
  const ticks = [0, 1, 2, 3].map((i) => Math.round((top / 3) * i));
  return (
    <svg className="curve" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} preserveAspectRatio="none">
      <defs>
        <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".35" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="tick">{t}</text>
        </g>
      ))}
      {area && <path d={area} fill="url(#curve-fill)" />}
      {line && <path d={line} className="line" fill="none" />}
      {data.length <= 13 && pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="4" className="dot" />)}
      {data.map((d, i) => d.label && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="tick">{d.label}</text>)}
    </svg>
  );
}

export default function Progress({ studentId }: { studentId?: string }) {
  const state = useStore();
  const readOnly = !!studentId;
  const me = (studentId ? state.users.find((u) => u.id === studentId) : currentUser(state))!;
  const level = me.level ?? "tle";
  const mine = attemptsOf(state, me.id);
  const [range, setRange] = useState<Range>("7");
  const [all, setAll] = useState(false);

  const series = pointsSeries(mine, range);
  const total = rangeTotal(mine, range);
  const allPts = mine.reduce((s, a) => s + pointsOf(a), 0);
  const eff = effortLevel(allPts);

  const notions = subjectsAt(level).flatMap((s) => notionsOf(s, level)).filter((n) => hasContent(n.id));
  const rated = notions.map((n) => ({ n, m: masteryFor(state, me.id, n.id) })).filter((x) => x.m.count > 0);
  const strong = rated.filter((x) => x.m.rate >= 0.7).sort((a, b) => b.m.rate - a.m.rate).slice(0, 2);
  const weak = rated.filter((x) => x.m.status === "fragile" || x.m.rate < 0.5).sort((a, b) => a.m.rate - b.m.rate).slice(0, 2);
  const mastered = notions.filter((n) => ["mastered", "expert"].includes(masteryFor(state, me.id, n.id).status)).length;
  const masteryPct = notions.length ? Math.round((mastered / notions.length) * 100) : 0;
  const hist = history(mine);
  const rows = all ? hist : hist.slice(0, 5);

  return (
    <main className="shell stack">
      <h1 className="row" style={{ flexWrap: "nowrap" }}><TrendingUp size={32} className="h1-ic" aria-hidden="true" /> {readOnly ? `Progrès de ${me.name}` : "Tes progrès"}</h1>

      <div className="dash">
        <section className="card" aria-labelledby="effort">
          <div className="row between" style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
            <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
              <span className="icon-tile sm" aria-hidden="true"><Target size={22} /></span>
              <div>
                <h2 id="effort" style={{ fontSize: "1.05rem" }}>Points d'effort • {RANGES.find((r) => r.id === range)!.label}</h2>
                <p className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
                  <span className="big-num">{total.cur}</span><span className="muted small">pts au total</span>
                  {total.pct !== null && <span className="trend"><TrendingUp size={14} aria-hidden="true" style={{ verticalAlign: "-2px" }} /> {total.pct > 0 ? "+" : ""}{total.pct} %</span>}
                </p>
              </div>
            </div>
            <div className="seg" role="group" aria-label="Période">
              {RANGES.map((r) => <button key={r.id} type="button" className={range === r.id ? "on" : ""} aria-pressed={range === r.id} onClick={() => setRange(r.id)}>{r.label}</button>)}
            </div>
          </div>
          <Curve data={series} label={`Points d'effort : ${series.filter((d) => !d.future).map((d) => `${d.label || "jour"} ${d.value}`).join(", ")}`} />
        </section>

        <section className="card stack level-card" aria-labelledby="niveau">
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <span className="icon-tile yellow" aria-hidden="true"><Trophy size={26} /></span>
            <div><p className="muted small">Niveau actuel</p><h2 id="niveau" style={{ fontSize: "1.5rem" }}>{eff.name}</h2></div>
          </div>
          <ProgressBar value={eff.pct} tone="yellow" label="Progression vers le niveau suivant" />
          <p className="small" style={{ textAlign: "right", color: "var(--yellow-ink)", fontWeight: 700 }}>{eff.next ? `${allPts} / ${eff.ceil} pts` : `${allPts} pts`}</p>
          <p className="callout row" style={{ flexWrap: "nowrap" }}>
            <Star size={20} aria-hidden="true" style={{ flex: "none", color: "var(--yellow)" }} />
            <span>{eff.next ? (eff.pct >= 60 ? `Le niveau ${eff.next} approche, continue !` : `Prochain niveau : ${eff.next}. Chaque exercice compte.`) : "Niveau maximum atteint, bravo !"}</span>
          </p>
        </section>
      </div>

      <div className="fm-row">
        <ReadLink readOnly={!strong.length || readOnly} to={strong[0] ? `/notion/${encodeURIComponent(strong[0].n.id)}` : "#"} className="fm good wide">
          <span className="icon-tile green sm" aria-hidden="true"><TrendingUp size={22} /></span>
          <span className="grow"><span className="k">Forces</span><h3>{strong.length ? strong.map((x) => x.n.title).join(", ") : "À construire"}</h3></span>
          {!readOnly && strong.length > 0 && <ChevronRight size={22} aria-hidden="true" />}
        </ReadLink>
        <ReadLink readOnly={!weak.length || readOnly} to={weak[0] ? `/notion/${encodeURIComponent(weak[0].n.id)}` : "#"} className="fm todo wide">
          <span className="icon-tile yellow sm" aria-hidden="true"><Target size={22} /></span>
          <span className="grow"><span className="k">À muscler</span><h3>{weak.length ? weak.map((x) => x.n.title).join(", ") : "Rien d'urgent"}</h3></span>
          {!readOnly && weak.length > 0 && <ChevronRight size={22} aria-hidden="true" />}
        </ReadLink>
      </div>

      <KnowledgePanel state={state} studentId={me.id} level={level} readOnly={readOnly} />

      <div className="row between">
        <h2 className="row" style={{ flexWrap: "nowrap" }}><Clock size={26} aria-hidden="true" /> Historique</h2>
        {hist.length > 5 && <button type="button" className="btn ghost small-btn" aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Voir moins" : "Voir tout"}</button>}
      </div>
      {hist.length === 0 && <p className="muted">{readOnly ? "L'historique" : "Ton historique"} apparaîtra après la première série.</p>}
      <div className="stack-sm hist">
        {rows.map((h) => {
          const n = notionById(h.notionId);
          const tone = n ? toneOf(n.chapter) : "green";
          return (
            <ReadLink readOnly={readOnly} key={h.notionId + h.day} to={`/notion/${encodeURIComponent(h.notionId)}`} className="list-card hist-row">
              <span className={`icon-tile sm ${tone === "indigo" ? "" : tone}`} aria-hidden="true">{n ? <ChapterIcon chapter={n.chapter} size={22} /> : <Clock size={22} />}</span>
              <div className="grow"><h3>{notionTitle(h.notionId)} • {h.count} exo{h.count > 1 ? "s" : ""}</h3><p className="muted small">{n ? `${n.chapter} • ${SUBJECT_LABEL[n.subject]}` : ""}</p></div>
              <span className="pts-badge">+{h.points} pts</span>
              <span className="muted small hist-date">{dateLabel(h.ts)}</span>
              {!readOnly && <ChevronRight size={20} aria-hidden="true" />}
            </ReadLink>
          );
        })}
      </div>

      <section className="card stack-sm">
        <h3>{readOnly ? "Maîtrise de sa classe" : "Maîtrise de ma classe"}</h3>
        <ProgressBar value={masteryPct} label="Maîtrise" />
        <p className="muted" style={{ fontWeight: 600 }}>{mastered}/{notions.length} notions maîtrisées</p>
      </section>
    </main>
  );
}
