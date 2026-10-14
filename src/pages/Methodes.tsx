import { Award, Bot, Brain, ClipboardCheck, ScanLine, Footprints, Gamepad2, Layers, Puzzle, Repeat, Target, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ChevronRight } from "../components/ui";
import { errorGroups, recurring } from "../lib/knowledge";
import { deckStats, dueSkills, nextActions } from "../lib/parcours";
import { currentUser, useStore } from "../store";
import "../methodes.css";

/** Point d'entrée des 10 méthodes d'apprentissage, avec ce qui est utile aujourd'hui. */
export default function Methodes() {
  const state = useStore();
  const me = currentUser(state)!;
  const level = me.level ?? "tle";
  const deck = deckStats(state, me.id, level);
  const skills = dueSkills(state, me.id).length;
  const dueCards = deck.due;
  const rec = errorGroups(state, me.id).filter(recurring).length;
  const todo = nextActions(state, me.id, level, 3);

  const M: { n: number; to: string; Icon: LucideIcon; title: string; text: string; stat?: string }[] = [
    { n: 1, to: "/rappel", Icon: Brain, title: "Rappel actif", text: "Retrouve de mémoire ce que dit le cours, avant de regarder la correction.", stat: deck.total ? `${deck.total} cartes à retrouver` : undefined },
    { n: 2, to: "/cartes", Icon: Layers, title: "Cartes mémoire", text: "Question au recto, réponse au verso : tu réponds d'abord, puis tu juges si c'était facile.", stat: deck.total ? `${deck.unseen} nouvelles • ${dueCards} à revoir` : undefined },
    { n: 3, to: "/revision", Icon: Repeat, title: "Révisions espacées", text: "Les notions difficiles reviennent vite, les maîtrisées plus tard. Tu ne révises que ce qui compte.", stat: dueCards + skills ? `${dueCards + skills} à réviser aujourd'hui` : "Rien à réviser aujourd'hui" },
    { n: 4, to: "/etapes", Icon: Footprints, title: "Pas à pas", text: "Écris chaque étape de ton raisonnement. Chaque étape est vérifiée et expliquée." },
    { n: 5, to: "/erreurs", Icon: Target, title: "Mes erreurs", text: "Repère les erreurs qui reviennent, comprends-les, et corrige-les avec des exercices ciblés.", stat: rec ? `${rec} erreur${rec > 1 ? "s" : ""} qui revien${rec > 1 ? "nent" : "t"}` : undefined },
    { n: 6, to: "/tuteur", Icon: Bot, title: "Tuteur", text: "Bloqué ? Il te pose des questions et te donne des indices, sans donner la réponse tout de suite." },
    { n: 7, to: "/jeux", Icon: Gamepad2, title: "Jeux et défis", text: "Associer, ranger, calculer vite. Le chrono est facultatif : tu choisis." },
    { n: 8, to: "/bilan", Icon: ClipboardCheck, title: "Bilan", text: "Un test mêlant anciennes et nouvelles leçons, pour savoir précisément où tu en es." },
    { n: 9, to: "/parcours", Icon: Award, title: "Parcours et récompenses", text: "Débutant, Intermédiaire, Avancé, Expert : chaque notion se mérite, révisions comprises." },
    { n: 10, to: "/situations", Icon: Puzzle, title: "Situations et simulations", text: "Des problèmes de la vie réelle, et des simulations où tu changes les valeurs pour voir ce qui se passe." },
  ];

  return (
    <main className="shell wide stack">
      <header className="stack-sm">
        <h1 className="row" style={{ flexWrap: "nowrap" }}><Brain size={30} className="h1-ic" aria-hidden="true" /> Apprendre autrement</h1>
        <p className="muted">Dix méthodes pour comprendre, raisonner et retenir longtemps. Elles partagent le même suivi : tout ce que tu fais ici fait avancer ta progression.</p>
      </header>

      <Link to="/scanner" className="mt-todo" style={{ background: "var(--primary-soft)", borderColor: "var(--primary)", color: "var(--primary-ink)" }}>
        <ScanLine size={26} aria-hidden="true" />
        <span style={{ flex: 1 }}>Scanner un exercice<small>Photographie ou importe un exercice (toutes matières) : il est numérisé, lu et transmis au tuteur.</small></span>
        <ChevronRight size={22} aria-hidden="true" />
      </Link>

      {todo.length > 0 && (
        <section className="stack-sm" aria-label="Pour toi maintenant">
          <h2 style={{ fontSize: "1.1rem" }}>Pour toi maintenant</h2>
          {todo.map((a) => (
            <Link key={a.id} to={a.to} className="mt-todo"><span style={{ flex: 1 }}>{a.label}<small>{a.why}</small></span><ChevronRight size={22} aria-hidden="true" /></Link>
          ))}
        </section>
      )}

      <div className="mt-grid">
        {M.map(({ n, to, Icon, title, text, stat }) => (
          <Link key={n} to={to} className="mt-card">
            <span className="mt-num" aria-hidden="true">{n}</span>
            <div className="grow">
              <h3 className="row" style={{ gap: 8, flexWrap: "nowrap" }}><Icon size={20} aria-hidden="true" /> {title}</h3>
              <p>{text}</p>
              {stat && <span className="mt-stat">{stat}</span>}
            </div>
            <ChevronRight size={22} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </main>
  );
}
