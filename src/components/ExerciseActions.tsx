import { Download, MessageCircle } from "lucide-react";

export function ExerciseActions({ title, url, message }: { title: string; url: string; message?: string }) {
  const link = new URL(url, window.location.origin).toString();
  const text = `${message ?? `Voici un exercice à faire sur DeclickMath : ${title}`}\n${link}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <div className="exercise-actions no-print" aria-label="Partager ou télécharger l'exercice">
      <a className="btn exercise-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle size={18} aria-hidden="true" /> Envoyer par WhatsApp
      </a>
      <button type="button" className="btn ghost" onClick={() => window.print()}>
        <Download size={18} aria-hidden="true" /> Télécharger en PDF
      </button>
      <p className="muted small">Le téléchargement ouvre la fenêtre d’impression : choisissez « Enregistrer au format PDF ».</p>
    </div>
  );
}
