import { NotebookPen } from "lucide-react";
import { useState } from "react";
import { currentUser, useStore } from "../store";
import "../methodes.css";

const KEY = "dm-cahier-jour";
const today = () => new Date().toISOString().slice(0, 10);
const readReady = () => { try { return localStorage.getItem(KEY) === today(); } catch { return false; } };

/**
 * Méthode de travail : un exercice se résout sur papier. Le cahier est demandé une fois par jour, puis l'élève confirme
 * avoir écrit sa démarche avant de valider. Désactivable dans le profil (élève sans papier à disposition).
 */
export function useNotebook() {
  const me = currentUser(useStore());
  const need = me?.role === "student" && me.prefs?.notebook !== false;
  const [ready, setReady] = useState(readReady);
  return {
    need,
    ready: !need || ready,
    confirm: () => { try { localStorage.setItem(KEY, today()); } catch { /* ignoré */ } setReady(true); },
  };
}

const STEPS = [
  "Lis l'énoncé deux fois, puis écris les données et ce qu'on cherche.",
  "Écris la propriété ou la formule du cours que tu vas utiliser.",
  "Fais tes calculs, ligne par ligne, sur ton cahier.",
  "Vérifie ton résultat, puis seulement après, saisis ta réponse ici.",
];

export function NotebookGate({ onReady, back }: { onReady: () => void; back?: () => void }) {
  return (
    <main className="shell no-nav stack center" style={{ paddingTop: 40 }}>
      <span className="icon-tile yellow" style={{ margin: "0 auto", width: 80, height: 80, borderRadius: 24 }}><NotebookPen size={40} aria-hidden="true" /></span>
      <h1>Prends ton cahier et ton stylo</h1>
      <p className="lead">On apprend les maths en écrivant. L'écran sert à vérifier, pas à réfléchir à ta place.</p>
      <section className="card stack-sm" style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: "1.1rem" }}>La méthode du cahier</h2>
        <ol className="stack-sm" style={{ paddingLeft: 20, margin: 0 }}>{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
      </section>
      <button className="btn primary block" onClick={onReady}>J'ai mon cahier et mon stylo</button>
      {back && <button className="btn link" onClick={back}>Plus tard</button>}
    </main>
  );
}

/** Case à cocher avant de valider : l'élève confirme avoir écrit sa démarche. */
export function WrittenCheck({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-written">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><NotebookPen size={18} aria-hidden="true" /> J'ai écrit ma démarche sur mon cahier (données, propriété, calculs).</span>
    </label>
  );
}
