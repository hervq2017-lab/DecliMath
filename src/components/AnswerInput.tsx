import { Calculator } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Answer } from "../content/core";

/** QCM (boutons radio) ou champ de réponse libre : clavier physique ou natif de l'appareil. */
export function AnswerInput({
  answer, value, onChange, name, disabled, onSubmit,
}: {
  answer: Answer; value: string; onChange: (v: string) => void; name: string; disabled?: boolean; onSubmit?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  // Sur ordinateur (souris), le curseur est déjà dans le champ : on tape directement. Pas de focus forcé sur tactile.
  useEffect(() => {
    if (answer.kind === "number" && !disabled && window.matchMedia?.("(pointer: fine)").matches) ref.current?.focus();
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  if (answer.kind === "choice") {
    return (
      <div className="choices" role="radiogroup" aria-label="Choisis une réponse">
        {answer.options.map((o, i) => (
          <label key={o} className={value === String(i) ? "choice selected" : "choice"}>
            <input type="radio" name={name} disabled={disabled} checked={value === String(i)} onChange={() => onChange(String(i))} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }

  // On ne garde que ce qu'un nombre peut contenir : chiffres, virgule/point, signe moins, barre de fraction, espaces.
  const clean = (v: string) => v.replace(/[^0-9.,/\s\-−]/g, "");
  const enter = (key: string) => onChange(clean(value + key));
  const removeLast = () => onChange(value.slice(0, -1));

  return (
    <div className="answer">
      <label className="answer-field">
        <span className="answer-label">Ta réponse{answer.unit ? ` (${answer.unit})` : ""}</span>
        <input
          ref={ref}
          className="answer-input"
          name={name}
          value={value}
          disabled={disabled}
          type="text"
          inputMode="text" // le clavier « décimal » des téléphones n'a ni le signe − ni la barre de fraction
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Écris ta réponse"
          onChange={(e) => onChange(clean(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.repeat && !e.nativeEvent.isComposing) { e.preventDefault(); onSubmit?.(); }
          }}
        />
      </label>
      <div className="answer-calculator">
        <button
          type="button"
          className="btn ghost small-btn answer-calculator-toggle"
          aria-expanded={calculatorOpen}
          aria-controls={`${name}-calculator`}
          disabled={disabled}
          onClick={() => setCalculatorOpen((open) => !open)}
        >
          <Calculator size={18} aria-hidden="true" />
          {calculatorOpen ? "Masquer le clavier" : "Calculatrice"}
        </button>
        {calculatorOpen && (
          <div id={`${name}-calculator`} className="answer-keypad" role="group" aria-label="Clavier de saisie de la réponse">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "0", ",", "/"].map((key) => (
              <button key={key} type="button" className="answer-key" disabled={disabled} onClick={() => enter(key)} aria-label={key === "/" ? "Barre de fraction" : key === "−" ? "Moins" : key === "," ? "Virgule" : key}>
                {key}
              </button>
            ))}
            <button type="button" className="answer-key answer-key-action" disabled={disabled || !value} onClick={removeLast} aria-label="Effacer le dernier caractère">⌫</button>
            <button type="button" className="answer-key answer-key-clear" disabled={disabled || !value} onClick={() => onChange("")}>Effacer</button>
          </div>
        )}
      </div>
    </div>
  );
}
