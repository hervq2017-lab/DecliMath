import { Download, MessageCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import { useState } from "react";

type ExerciseActionsProps = {
  title: string;
  url: string;
  message?: string;
  pdfContent?: string;
};

function pdfText(text: string) {
  return text
    .replace(/[×·]/g, " x ")
    .replace(/÷/g, " / ")
    .replace(/≤/g, " <= ")
    .replace(/≥/g, " >= ")
    .replace(/≠/g, " != ")
    .replace(/≈/g, " environ ")
    .replace(/π/g, "pi")
    .replace(/√/g, "racine de ")
    .replace(/∞/g, "infini")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/[→⇒]/g, " -> ")
    .replace(/[–—]/g, "-")
    .replace(/\u00a0/g, " ");
}

function pageContent() {
  const main = document.querySelector("main");
  if (!main) throw new Error("Le contenu de l'exercice est introuvable.");
  const clone = main.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".no-print, button, input, textarea, select, script, style").forEach((element) => element.remove());
  clone.querySelectorAll(".exercise-print-answer").forEach((element) => {
    element.textContent = "Réponse :\n____________________________________________________________\n____________________________________________________________\n____________________________________________________________";
  });
  return clone.innerText.trim();
}

function downloadPdf(title: string, content?: string) {
  const text = pdfText(content ?? pageContent()).trim();
  if (!text) throw new Error("Aucun contenu d'exercice à télécharger.");

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  let y = margin;
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(pdfText(title), width) as string[];
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 7 + 5;
  pdf.setFont("helvetica", "normal");

  for (const paragraph of text.split(/\r?\n/)) {
    const lines = pdf.splitTextToSize(paragraph || " ", width) as string[];
    const lineHeight = 5;
    for (const line of lines) {
      if (y + lineHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    }
    y += paragraph ? 2 : 1;
  }

  const filename = pdfText(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "exercice";
  pdf.save(`${filename}.pdf`);
}

export function ExerciseActions({ title, url, message, pdfContent }: ExerciseActionsProps) {
  const link = new URL(url, window.location.origin).toString();
  const text = `${message ?? `Voici un exercice à faire sur DeclickMath : ${title}`}\n${link}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function download() {
    try {
      setDownloadError(null);
      downloadPdf(title, pdfContent);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Le PDF n'a pas pu être généré.");
    }
  }

  return (
    <div className="exercise-actions no-print" aria-label="Partager ou télécharger l'exercice">
      <a className="btn exercise-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle size={18} aria-hidden="true" /> Envoyer par WhatsApp
      </a>
      <button type="button" className="btn ghost" onClick={download}>
        <Download size={18} aria-hidden="true" /> Télécharger en PDF
      </button>
      {downloadError && <p className="auth-error small" role="alert">{downloadError}</p>}
    </div>
  );
}
