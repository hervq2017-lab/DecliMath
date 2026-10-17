import { BookOpen, CheckCircle2, Lightbulb, Printer, Scale } from "lucide-react";
import { useState } from "react";
import { BackButton } from "../components/ui";
import {
  PHILOSOPHIE_CITATIONS,
  PHILOSOPHIE_EXERCISE_TYPES,
  PHILOSOPHIE_LEVELS,
  PhilosophieExerciseType,
  PhilosophieLevel,
} from "../content/philosophie";
import { currentUser, useStore } from "../store";

type Answers = Record<string, string>;

const LEVEL_EXPECTATIONS: Record<PhilosophieLevel, Record<PhilosophieExerciseType, string>> = {
  "2nde": {
    comprendre: "En Seconde : définis les mots importants, puis donne une reformulation et un exemple simple.",
    analyser: "En Seconde : indique la thèse et souligne l’expression qui t’aide à la repérer.",
    discuter: "En Seconde : présente une raison pour et une raison contre, avec un exemple.",
    dissertation: "En Seconde : transforme la question en problème et propose deux grandes étapes.",
  },
  "1ere": {
    comprendre: "En Première : définis les notions, distingue-les d’une idée proche et justifie ta reformulation.",
    analyser: "En Première : distingue thèse, argument et présupposé, puis explique leur enchaînement.",
    discuter: "En Première : formule une objection solide, réponds-y et appuie chaque idée par un exemple expliqué.",
    dissertation: "En Première : formule une tension, une problématique et un plan progressif avec des arguments.",
  },
  tle: {
    comprendre: "En Terminale : explicite les notions, leurs enjeux et les limites possibles de la thèse.",
    analyser: "En Terminale : reconstruis le raisonnement, ses présupposés et une conséquence philosophique.",
    discuter: "En Terminale : confronte des arguments, anticipe une objection et nuance ta conclusion.",
    dissertation: "En Terminale : construis une problématique précise et un plan dialectique argumenté, avec transitions.",
  },
};

export default function Philosophie() {
  const state = useStore();
  const me = currentUser(state);
  const [level, setLevel] = useState<PhilosophieLevel>(
    PHILOSOPHIE_LEVELS.some((item) => item.id === me?.level) ? me!.level as PhilosophieLevel : "2nde",
  );
  const [exerciseType, setExerciseType] = useState<PhilosophieExerciseType | "all">("all");
  const [includeGuide, setIncludeGuide] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const selectedType = PHILOSOPHIE_EXERCISE_TYPES.find((item) => item.id === exerciseType);
  const citations = PHILOSOPHIE_CITATIONS;

  const answerKey = (citationId: string, type: PhilosophieExerciseType) => `${citationId}:${type}`;
  const setAnswer = (key: string, value: string) => setAnswers((previous) => ({ ...previous, [key]: value }));

  return (
    <main className="shell wide stack philosophy-page">
      <div className="no-print row" style={{ gap: 12 }}>
        <BackButton to="/exercices" label="Retour aux exercices" />
        <div>
          <p className="eyebrow"><BookOpen size={16} aria-hidden="true" /> Parcours de philosophie</p>
          <h1>Penser les citations, construire sa réflexion</h1>
        </div>
      </div>

      <section className="card philosophy-intro stack-sm">
        <p>
          Des citations courtes, leurs auteurs et leurs œuvres, puis des exercices guidés pour apprendre à
          expliquer, analyser, discuter et préparer une dissertation.
        </p>
        <p className="muted small">
          Les références accompagnent chaque citation. Les traductions de textes anciens peuvent varier selon les éditions.
          Ce parcours est un support de travail : vérifie toujours les consignes de ton professeur et le programme de ta classe.
        </p>
        <div className="philosophy-controls no-print">
          <label>Classe
            <select value={level} onChange={(event) => setLevel(event.target.value as PhilosophieLevel)}>
              {PHILOSOPHIE_LEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label>Type d’exercice
            <select value={exerciseType} onChange={(event) => setExerciseType(event.target.value as PhilosophieExerciseType | "all")}>
              <option value="all">Tous les types</option>
              {PHILOSOPHIE_EXERCISE_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="philosophy-check">
            <input type="checkbox" checked={includeGuide} onChange={(event) => setIncludeGuide(event.target.checked)} />
            Ajouter les pistes de correction à l’impression
          </label>
          <button type="button" className="btn primary" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> Imprimer {exerciseType === "all" ? "le dossier complet" : "les exercices"}
          </button>
        </div>
      </section>

      <div className="philosophy-print-heading">
        <span>DeclickMath · Philosophie</span>
        <h1>Citations et exercices — {PHILOSOPHIE_LEVELS.find((item) => item.id === level)?.label}</h1>
        <p>Nom : ____________________________________   Date : ____________________</p>
        <p>{selectedType ? selectedType.label : "Dossier complet : compréhension, analyse, discussion et dissertation"}</p>
      </div>

      <section className="philosophy-instructions card">
        <h2><CheckCircle2 size={20} aria-hidden="true" /> Méthode à suivre</h2>
        <ol>
          <li>Reformule l’idée avec tes propres mots et définis les notions importantes.</li>
          <li>Repère la thèse et explique les raisons qui la soutiennent.</li>
          <li>Pour discuter, construis une objection, réponds-y et donne un exemple précis.</li>
          <li>Pour une dissertation, transforme la question en problème et organise une progression logique.</li>
        </ol>
      </section>

      <div className="philosophy-list">
        {citations.map((item, index) => {
          const types = exerciseType === "all"
            ? PHILOSOPHIE_EXERCISE_TYPES
            : PHILOSOPHIE_EXERCISE_TYPES.filter((type) => type.id === exerciseType);
          return (
            <article className="philosophy-card card" key={item.id}>
              <header className="philosophy-card-head">
                <span className="philosophy-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="philosophy-theme"><Scale size={16} aria-hidden="true" /> {item.theme}</span>
              </header>
              <blockquote>{item.citation}</blockquote>
              <p className="philosophy-attribution"><b>{item.author}</b> — <i>{item.work}</i>, {item.reference}</p>
              {item.note && <p className="muted small">{item.note}</p>}
              {types.map((type) => {
                const key = answerKey(item.id, type.id);
                return (
                  <section className="philosophy-exercise" key={type.id}>
                    <h3>{type.label}</h3>
                    {type.id === "comprendre" && <p className="muted small">Précise le sens des mots et reformule sans paraphraser.</p>}
                    {type.id === "analyser" && <p className="muted small">Distingue la thèse, ses raisons et ce qu’elle suppose.</p>}
                    {type.id === "discuter" && <p className="muted small">Construis une objection, une réponse et un exemple concret.</p>}
                    {type.id === "dissertation" && <p className="muted small">Fais apparaître une difficulté réelle, puis ordonne les étapes de ta réflexion.</p>}
                    <p className="philosophy-prompt">{item.exercises[type.id][0]}</p>
                    <p className="philosophy-level-target">{LEVEL_EXPECTATIONS[level][type.id]}</p>
                    <label className="no-print philosophy-answer-label" htmlFor={key}>Ta réponse</label>
                    <textarea
                      className="no-print philosophy-answer"
                      id={key}
                      value={answers[key] ?? ""}
                      onChange={(event) => setAnswer(key, event.target.value)}
                      placeholder="Écris ici pour préparer ta réponse. Elle sera visible sur la fiche imprimée."
                      rows={4}
                    />
                    <div className="philosophy-answer-print" aria-hidden="true">
                      {answers[key] ? <p>{answers[key]}</p> : <span />}
                    </div>
                  </section>
                );
              })}
              {includeGuide && (
                <aside className="philosophy-guide">
                  <h3><Lightbulb size={17} aria-hidden="true" /> Piste de correction (à garder pour l’enseignant)</h3>
                  <p>{item.correction}</p>
                </aside>
              )}
            </article>
          );
        })}
      </div>

      <p className="philosophy-source-note">
        Repères : citations brèves issues d’œuvres philosophiques anciennes ou du domaine public. Les traductions et
        numérotations de fragments peuvent différer selon l’édition utilisée en classe.
      </p>
    </main>
  );
}
