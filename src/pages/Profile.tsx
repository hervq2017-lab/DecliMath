import { Bell, Moon, PenLine, Target, Type, Volume2, Zap } from "lucide-react";
import { StreakChip, Toggle } from "../components/ui";
import { countryByCode, LEVELS, LevelId, seriesAt } from "../curriculum";
import { playFeedback } from "../lib/sound";
import { attemptsOf, streak } from "../lib/stats";
import { currentUser, DEFAULT_PREFS, hasAcceptedParentLink, logOut, setLevel, setPrefs, setSerie, THEMES, themeOf, useStore } from "../store";

export default function Profile() {
  const state = useStore();
  const me = currentUser(state)!;
  const prefs = { ...DEFAULT_PREFS, ...me.prefs };
  const dark = THEMES.find((t) => t.id === themeOf(prefs))!.dark; // sombre par défaut, comme dans App.tsx
  const s = streak(attemptsOf(state, me.id));
  const level = me.level ?? "tle";

  const rows: { Icon: typeof Moon; t: string; d: string; v: boolean; set: (v: boolean) => void; off?: boolean }[] = [
    { Icon: Moon, t: "Mode sombre", d: "Repose les yeux le soir", v: dark, set: (v) => setPrefs(me.id, { dark: v, theme: v ? "nuit" : "clair" }) },
    { Icon: Type, t: "Police adaptée dyslexie", d: "Plus espacée, plus lisible", v: prefs.dyslexia, set: (v) => setPrefs(me.id, { dyslexia: v }) },
    { Icon: PenLine, t: "Cahier et stylo", d: "Écrire sa démarche sur papier avant de répondre", v: prefs.notebook !== false, set: (v) => setPrefs(me.id, { notebook: v }) },
    { Icon: Zap, t: "Animations réduites", d: "Moins de mouvement à l'écran", v: prefs.reduceMotion, set: (v) => setPrefs(me.id, { reduceMotion: v }) },
    { Icon: Volume2, t: "Sons doux", d: "Un petit son quand tu réponds", v: !!prefs.sounds, set: (v) => { setPrefs(me.id, { sounds: v }); playFeedback("ok", v); } },
  ];

  return (
    <main className="shell stack">
      <header className="card profile-hero">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <span className="avatar" aria-hidden="true">{me.name[0]?.toUpperCase()}</span>
          <div>
            <h1>{me.name} • {LEVELS.find((l) => l.id === level)?.label}</h1>
            <p className="muted" style={{ fontWeight: 600 }}>Objectif : {prefs.dailyGoal} min / jour</p>
          </div>
        </div>
        <StreakChip n={s} />
      </header>

      <div className="profile-grid">
        <section className="card stack" aria-labelledby="obj">
          <h2 id="obj" className="card-title"><Target size={22} className="ti" aria-hidden="true" /> Objectif quotidien</h2>
          <div className="goal-btns" role="group" aria-label="Objectif quotidien">
            {([10, 15, 25] as const).map((m) => <button key={m} type="button" className={prefs.dailyGoal === m ? "goal-btn on" : "goal-btn"} aria-pressed={prefs.dailyGoal === m} onClick={() => setPrefs(me.id, { dailyGoal: m })}>{m} min</button>)}
          </div>
          <div className="setting">
            <span className="ic"><Bell size={22} aria-hidden="true" /></span>
            <span className="grow"><b>Rappel à 18h00</b><span className="muted small">Une alerte dans la cloche si tu n'as rien fait</span></span>
            <Toggle checked={!!prefs.reminder} onChange={(v) => setPrefs(me.id, { reminder: v })} label="Rappel à 18h00" />
          </div>
        </section>

        <section className="card stack-sm setting-list" aria-labelledby="pref">
          <h2 id="pref" className="card-title">Préférences d'affichage</h2>
          {rows.map(({ Icon, t, d, v, set, off }) => (
            <div key={t} className="setting">
              <span className="ic"><Icon size={22} aria-hidden="true" /></span>
              <span className="grow"><b>{t}</b><span className="muted small">{d}</span></span>
              <Toggle checked={v} onChange={set} label={t} disabled={off} />
            </div>
          ))}
        </section>

        <section className="card stack full">
          <label className="lbl">
            Ma classe
            <select value={level} onChange={(e) => { setLevel(me.id, e.target.value as LevelId); setSerie(me.id, undefined); }}>
              {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </label>
          {seriesAt(level).length > 0 && (
            <label className="lbl">
              Ma série
              <select value={me.serie ?? ""} onChange={(e) => setSerie(me.id, e.target.value || undefined)}>
                <option value="">Toutes les séries</option>
                {seriesAt(level).map((x) => <option key={x} value={x}>Série {x}</option>)}
              </select>
            </label>
          )}
          <p className="muted small">{countryByCode(me.country).name} ({countryByCode(me.country).zone})</p>
        </section>

        {me.role === "student" && !hasAcceptedParentLink(me) && (
          <section className="card stack full">
            <h2 className="card-title"><Bell size={20} className="ti" aria-hidden="true" /> Invitation parentale</h2>
            <p className="muted small">
              {me.parentId
                ? "Ton parent t'a préparé un accès. Demande-lui son QR code, puis accepte l'invitation pour lui partager ta progression."
                : "Pour partager tes progrès avec un parent, demande-lui de créer ton profil et de t'envoyer une invitation QR personnelle."}
            </p>
          </section>
        )}
      </div>

      <p className="muted small center" role="status">Tes réglages sont enregistrés automatiquement.</p>
      <button className="btn ghost block" onClick={logOut}>Déconnexion</button>
    </main>
  );
}
