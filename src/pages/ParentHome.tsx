import { Check, CheckCircle2, History, MessageCircle, ShieldAlert, Sparkles, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ChildAccess from "./ChildAccess";
import { Chip, ParentChildNav, ProgressBar, StreakChip, TopBar } from "../components/ui";
import { countryByCode, levelById, notionsOf, SUBJECT_LABEL, subjectsAt } from "../curriculum";
import { hasContent } from "../engine";
import { attemptsOf, minutesSpent, pointsOf, relativeDay, streak, weekDays } from "../lib/stats";
import { currentUser, hasAcceptedParentLink, logOut, MASTERY_LABEL, masteryFor, SolutionMode, studentsOf, update, useStore } from "../store";

const MODES: { value: SolutionMode; label: string; help: string }[] = [
  { value: "free", label: "Autoriser", help: "Après une première réponse, le corrigé est toujours accessible." },
  { value: "deferred", label: "Différer", help: "Le corrigé se débloque après avoir essayé, avec des indices d'abord." },
  { value: "blocked", label: "Bloquer", help: "Aucun corrigé : l'élève avance avec les indices et la correction guidée de l'application." },
];
const DAY = 864e5;

export default function ParentHome() {
  const state = useStore();
  const me = currentUser(state)!;
  const children = studentsOf(state, me.id);
  const [sel, setSel] = useState<string | null>(null);
  const child = children.find((c) => c.id === sel) ?? children[0];
  const weekStart = new Date(Date.now() - ((new Date().getDay() + 6) % 7) * DAY).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <>
      {child && hasAcceptedParentLink(child) && <ParentChildNav id={child.id} />}
      <TopBar
        name={me.name}
        sub={child
          ? hasAcceptedParentLink(child) ? `Voici le résumé et le suivi de ${child.name}.` : `L'activité de ${child.name} restera privée jusqu'à son acceptation.`
          : "Gérez les accès de vos enfants et suivez leurs progrès."}
      />
      <main className="shell wide stack">
        <header className="row between">
          <div className="row">
            <span className="pill">Espace parent</span>
            <span className="muted" style={{ fontWeight: 600 }}>Semaine du {weekStart}</span>
          </div>
          <button className="btn link" onClick={logOut}>Déconnexion</button>
        </header>

        <ChildAccess parentId={me.id} />

        {children.length === 0 && (
          <section className="card stack">
            <h1>Bienvenue {me.name}</h1>
            <p>Ajoutez un enfant ci-dessus, puis envoyez-lui une invitation QR personnelle à accepter.</p>
            <p className="muted small">{countryByCode(me.country).name} • Vous verrez ses efforts et ses progrès en temps réel.</p>
          </section>
        )}

        {children.length > 0 && (
          <section aria-labelledby="mes-enfants" className="stack-sm">
            <div className="row between" style={{ alignItems: "center" }}>
              <h2 id="mes-enfants" style={{ fontSize: "1.2rem", margin: 0 }}>
                {children.length > 1 ? "Mes enfants" : "Mon enfant"} ({children.length})
              </h2>
              <span className="muted small">Les progrès se synchronisent automatiquement (environ toutes les 15 secondes).</span>
            </div>
            <div className="kids">
              {children.map((c) => (
                <Kid key={c.id} id={c.id} selected={c.id === child?.id} onSelect={() => setSel(c.id)} />
              ))}
            </div>
          </section>
        )}

        {child && <Child key={child.id} id={child.id} />}
      </main>
    </>
  );
}

function Kid({ id, selected, onSelect }: { id: string; selected: boolean; onSelect: () => void }) {
  const state = useStore();
  const c = state.users.find((u) => u.id === id)!;
  const level = c.level ?? "tle";
  const all = attemptsOf(state, id);
  const week = all.filter((a) => Date.now() - a.ts < 7 * DAY);
  const days = weekDays(all).filter((d) => d.active).length;
  const notions = subjectsAt(level).flatMap((s) => notionsOf(s, level)).filter((n) => hasContent(n.id));
  const mastered = notions.filter((n) => ["mastered", "expert"].includes(masteryFor(state, id, n.id).status)).length;
  const pct = notions.length ? Math.round((mastered / notions.length) * 100) : 0;
  const last = all.length ? Math.max(...all.map((a) => a.ts)) : 0;
  const country = countryByCode(c.country);

  const successCount = all.filter((a) => a.correct).length;
  const successRate = all.length ? Math.round((successCount / all.length) * 100) : null;
  const isSuspended = !!c.suspended;
  const isPending = !hasAcceptedParentLink(c);

  return (
    <article className={`card kid${selected ? " sel" : ""}`} aria-label={`Résumé de ${c.name}`}>
      <div className="row between">
        <div className="row" style={{ flexWrap: "nowrap", gap: 10 }}>
          <span className="avatar" aria-hidden="true">{c.name[0]?.toUpperCase()}</span>
          <div>
            <h3>{c.name}</h3>
            <p className="muted small" style={{ fontWeight: 600 }}>{levelById(level).label}{c.serie ? ` ${c.serie}` : ""} • {country.name}</p>
            <p className="muted small">{isPending ? "Activité privée jusqu'à l'acceptation" : last ? `Dernière activité : ${relativeDay(last)}` : "Pas encore d'activité"}</p>
          </div>
        </div>
        <div className="stack-sm" style={{ alignItems: "flex-end" }}>
          {isSuspended ? (
            <span className="badge" style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #f87171" }}>
              <ShieldAlert size={12} style={{ verticalAlign: "-2px" }} /> Suspendu
            </span>
          ) : isPending ? (
            <span className="badge" style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d" }}>
              En attente d'activation
            </span>
          ) : (
            <span className="badge" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>
              <Check size={12} style={{ verticalAlign: "-2px" }} /> Actif
            </span>
          )}
          {!isPending && <StreakChip n={streak(all)} />}
        </div>
      </div>

      {isPending ? (
        <p className="muted small" style={{ margin: 0, padding: "10px 12px", borderRadius: 10, background: "#fef3c7", color: "#92400e" }}>
          Le suivi restera privé jusqu'à ce que {c.name} accepte l'invitation et choisisse son mot de passe.
        </p>
      ) : (
        <>
      <div className="meta" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div>
          <b>{all.length}</b>
          <span>Exercices faits</span>
        </div>
        <div>
          <b>{successRate !== null ? `${successRate} %` : "—"}</b>
          <span>Réussite réelle</span>
        </div>
        <div>
          <b>{minutesSpent(week)} min</b>
          <span>Cette semaine</span>
        </div>
      </div>

      <div className="stack-sm">
        <ProgressBar value={pct} tone="green" label={`Maîtrise de ${c.name}`} />
        <p className="muted small" style={{ fontWeight: 600 }}>{mastered}/{notions.length} notions maîtrisées ({pct} %)</p>
      </div>

      <div className="row" style={{ flexWrap: "nowrap" }}>
        <button type="button" className={selected ? "btn primary grow" : "btn ghost grow"} aria-pressed={selected} onClick={onSelect}>
          {selected ? "Détail affiché" : "Voir le suivi"}
        </button>
        <Link className="btn ghost grow" to={`/enfant/${id}`}>Son écran</Link>
      </div>
        </>
      )}
    </article>
  );
}

function Child({ id }: { id: string }) {
  const state = useStore();
  const child = state.users.find((u) => u.id === id)!;
  const level = child.level ?? "tle";
  const all = attemptsOf(state, id);
  const week = all.filter((a) => Date.now() - a.ts < 7 * DAY);
  const days = weekDays(all).filter((d) => d.active).length;
  const mins = minutesSpent(week), pts = week.reduce((s, a) => s + pointsOf(a), 0);
  const mode = state.solutionMode[id] ?? "deferred";
  const exams = state.exams.filter((e) => e.studentId === id && e.status === "done");
  const goal = state.goals[id] ?? "";
  const [plan, setPlan] = useState(false);

  if (!hasAcceptedParentLink(child)) {
    return (
      <section className="card stack parent-detail">
        <h2 style={{ margin: 0 }}>Invitation en attente pour {child.name}</h2>
        <p className="muted">
          Son activité restera privée. Envoyez-lui le QR code depuis « Accès et connexions » ; il devra l'accepter et créer son mot de passe pour activer le suivi.
        </p>
      </section>
    );
  }

  const successCount = all.filter((a) => a.correct).length;
  const successRate = all.length ? Math.round((successCount / all.length) * 100) : null;

  const notions = subjectsAt(level).flatMap((s) => notionsOf(s, level)).filter((n) => hasContent(n.id));
  const rows = notions.map((n) => ({ n, m: masteryFor(state, id, n.id) }));
  const good = rows.filter((r) => r.m.count > 0 && r.m.rate >= 0.7).sort((a, b) => b.m.rate - a.m.rate)[0];
  const todo = rows.filter((r) => r.m.status === "fragile" || (r.m.count > 0 && r.m.rate < 0.5)).sort((a, b) => a.m.rate - b.m.rate)[0];

  const masteredNotions = rows.filter((r) => ["mastered", "expert"].includes(r.m.status));
  const fragileNotions = rows.filter((r) => r.m.status === "fragile" || (r.m.count > 0 && r.m.rate < 0.5));
  const weakList = rows.filter((r) => r.m.status === "fragile" || r.m.status === "none" || r.m.status === "started").slice(0, 3);

  const headline = days >= 4
    ? `${child.name} a fait des efforts réguliers cette semaine.`
    : days >= 1
      ? `${child.name} s'entraîne progressivement.`
      : all.length === 0
        ? `${child.name} n'a pas encore commencé d'exercice.`
        : `${child.name} n'a pas encore travaillé cette semaine.`;

  const sentence = all.length === 0
    ? "Aucune activité enregistrée pour le moment. Transmettez-lui son QR code ou son identifiant pour sa première séance !"
    : days === 0
      ? "Pas d'activité ces 7 derniers jours. Un rendez-vous de 10 minutes sans pression peut relancer le déclic."
      : `${child.name} s'entraîne ${days} jour${days > 1 ? "s" : ""} sur 7${good ? `, progresse en ${good.n.title.toLowerCase()}` : ""}${todo ? ` et peut consolider ${todo.n.title.toLowerCase()}` : ""}.`;

  const say = days === 0
    ? `« Et si on faisait 10 minutes d'exercices ensemble ce soir sur DeclickMath ? Sans pression. »`
    : `« J'ai vu tes efforts de cette semaine (${days} jours actifs), bravo !${todo ? ` On revoit ${todo.n.title.toLowerCase()} ensemble ?` : ""} »`;

  return (
    <div className="stack parent-detail">
      <div className="row between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="full" style={{ margin: "0 0 4px" }}>{headline}</h1>
          <p className="muted full" style={{ fontWeight: 600 }}>
            {levelById(level).label}{child.serie ? ` Série ${child.serie}` : ""} • {SUBJECT_LABEL[subjectsAt(level)[0]]} et plus
          </p>
        </div>
        <Link to={`/enfant/${id}/reponses`} className="btn ghost" style={{ alignSelf: "center" }}>
          <History size={16} /> Historique des activités ({all.length})
        </Link>
      </div>

      {/* Cartes de métriques réelles */}
      <section className="grid3 full" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
        <div className="statcard">
          <b>{all.length}</b>
          <span>Exercices faits</span>
        </div>
        <div className="statcard">
          <b>{successRate !== null ? `${successRate} %` : "—"}</b>
          <span>Taux de réussite</span>
        </div>
        <div className="statcard">
          <b>{days}/7</b>
          <span>Jours actifs</span>
        </div>
        <div className="statcard">
          <b>{mins} min</b>
          <span>Temps passé</span>
        </div>
        <div className="statcard">
          <b>+{pts}</b>
          <span>Points d'effort</span>
        </div>
      </section>

      {/* Synthèse pédagogique */}
      <section className="card stack">
        <h2 style={{ fontSize: "1.05rem" }}>En une phrase</h2>
        <p style={{ fontSize: "1.05rem", color: "var(--ink, #1c1545)" }}>{sentence}</p>
        <div className="grid2">
          <div className="fm good">
            <p className="k">Ça roule</p>
            <h3>{good ? `${good.n.title} (${Math.round(good.m.rate * 100)} %)` : all.length === 0 ? "Pas encore de données" : "À consolider"}</h3>
          </div>
          <div className="fm todo">
            <p className="k">À soutenir</p>
            <h3>{todo ? `${todo.n.title} (${Math.round(todo.m.rate * 100)} %)` : all.length === 0 ? "Pas encore de données" : "Rien d'urgent"}</h3>
          </div>
        </div>
      </section>

      {/* Progression par notions et compétences */}
      <section className="card stack">
        <h2 style={{ fontSize: "1.05rem" }}>Compétences et notions du programme</h2>
        <div className="grid2">
          <div>
            <h3 style={{ fontSize: "0.95rem", color: "var(--green, #2e9e5b)" }}>
              Notions maîtrisées ({masteredNotions.length})
            </h3>
            {masteredNotions.length === 0 ? (
              <p className="muted small">Aucune notion validée pour le moment. L'entraînement permet d'atteindre la maîtrise.</p>
            ) : (
              <ul className="stack-sm" style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
                {masteredNotions.map((r) => (
                  <li key={r.n.id} className="row between" style={{ fontSize: "0.9rem", padding: "4px 0", borderBottom: "1px dashed var(--line, #8882)" }}>
                    <span>{r.n.title}</span>
                    <span className="badge mastered" style={{ fontSize: "0.75rem" }}>{Math.round(r.m.rate * 100)} %</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: "0.95rem", color: "var(--amber, #d97706)" }}>
              Difficultés fréquentes ({fragileNotions.length})
            </h3>
            {fragileNotions.length === 0 ? (
              <p className="muted small">Aucune difficulté persistante détectée.</p>
            ) : (
              <ul className="stack-sm" style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
                {fragileNotions.map((r) => (
                  <li key={r.n.id} className="row between" style={{ fontSize: "0.9rem", padding: "4px 0", borderBottom: "1px dashed var(--line, #8882)" }}>
                    <span>{r.n.title}</span>
                    <span className="badge fragile" style={{ fontSize: "0.75rem" }}>{Math.round(r.m.rate * 100)} %</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Recommandations adaptées */}
      {weakList.length > 0 && (
        <section className="card stack" aria-labelledby="recommandations">
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <Sparkles size={20} style={{ color: "var(--primary)" }} />
            <h2 id="recommandations" style={{ fontSize: "1.05rem", margin: 0 }}>Recommandations d'exercices adaptées</h2>
          </div>
          <p className="muted small">Sélectionnez une notion pour voir ce que {child.name} verra lors de sa prochaine session :</p>
          <div className="chips" role="group">
            {weakList.map((r) => (
              <Link key={r.n.id} to={`/enfant/${id}/exercices`} className="btn ghost" style={{ fontSize: "0.9rem" }}>
                🎯 S'entraîner sur : {r.n.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Navigation miroir (Voir ce que l'enfant voit) */}
      <section className="card stack" aria-labelledby="voir">
        <h2 id="voir" style={{ fontSize: "1.05rem" }}>Voir ce que {child.name} voit</h2>
        <p className="muted small">Les mêmes écrans que {child.name}, en consultation seule.</p>
        <div className="child-links">
          {[
            ["", "Accueil"],
            ["/exercices", "Exercices"],
            ["/reponses", "Réponses & Corrections"],
            ["/progres", "Progrès"],
            ["/profil", "Profil"],
          ].map(([p, l]) => (
            <Link key={l} className="btn ghost" to={`/enfant/${id}${p}`}>{l}</Link>
          ))}
        </div>
      </section>

      <section className="say">
        <span className="icon-tile yellow sm"><MessageCircle size={22} aria-hidden="true" /></span>
        <p>Phrase d'encouragement à tester ce soir : {say}</p>
      </section>

      <button className="btn primary block full" aria-expanded={plan} onClick={() => setPlan(!plan)}>
        {plan ? "Masquer le plan de la semaine" : "Voir le plan de la semaine"}
      </button>

      {plan && (
        <section className="card stack full" aria-label="Plan de la semaine">
          <h2 style={{ fontSize: "1.05rem" }}>Plan de travail conseillé</h2>
          {weakList.length ? (
            <ol>
              {weakList.map((r) => (
                <li key={r.n.id}>{r.n.title} — statut : {MASTERY_LABEL[r.m.status].toLowerCase()}</li>
              ))}
            </ol>
          ) : (
            <p className="muted">Tout est sous contrôle pour {child.name}.</p>
          )}
          <label className="lbl">
            Votre objectif pour la semaine
            <input
              className="field"
              value={goal}
              placeholder="ex. 3 séances de 15 minutes"
              onChange={(e) => update((s) => ({ ...s, goals: { ...s.goals, [id]: e.target.value } }))}
            />
          </label>
        </section>
      )}

      <section className="card stack" aria-labelledby="corr">
        <h2 id="corr" style={{ fontSize: "1.05rem" }}>Contrôle des corrigés</h2>
        <div className="chips" role="group" aria-label="Règle des corrigés">
          {MODES.map((m) => (
            <Chip key={m.value} active={mode === m.value} onClick={() => update((s) => ({ ...s, solutionMode: { ...s.solutionMode, [id]: m.value } }))}>
              {m.label}
            </Chip>
          ))}
        </div>
        <p className="muted small">{MODES.find((m) => m.value === mode)?.help}</p>
      </section>

      <details className="card full">
        <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--ink)", minHeight: 44, display: "flex", alignItems: "center" }}>
          Détails complets par notion et épreuves passées
        </summary>
        <div className="stack" style={{ marginTop: 12 }}>
          {rows.map(({ n, m }) => (
            <div key={n.id} className="progress-row">
              <span>{n.title}</span>
              <span className={`badge ${m.status}`}>{MASTERY_LABEL[m.status]} ({Math.round(m.rate * 100)} %)</span>
            </div>
          ))}
          {exams.length > 0 && <h3>Épreuves passées</h3>}
          {[...exams].reverse().map((e) => (
            <div key={e.id} className="progress-row">
              <span>{e.label}</span>
              <strong>{e.score}/{e.outOf}</strong>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
