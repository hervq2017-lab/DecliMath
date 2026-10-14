import { useState } from "react";
import { Lightbulb, SendHorizontal, Sparkles } from "lucide-react";
import { Logo } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { useStore, update, currentUser } from "../store";

const SUGGESTIONS = [
  "Je mélange les signes (+ -) dans les relatifs",
  "Je ne comprends pas Thalès",
  "J'ai du mal avec les fractions",
  "Je m'embrouille avec les puissances",
  "Je n'arrive pas à résoudre une équation",
  "J'ai oublié les règles de priorité",
  "Je confonds Pythagore et Thalès",
  "Je bloque sur les pourcentages",
];

export default function OnboardStudent() {
  const s = useStore();
  const me = currentUser(s);
  const nav = useNavigate();
  const [msg, setMsg] = useState("");
  const [thought, setThought] = useState(false);
  const [done, setDone] = useState(false);
  const [analysis, setAnalysis] = useState<{ summary: string; topNotions: string[]; firstTask: { notionId: string; title: string } | null }>({
    summary: "",
    topNotions: [],
    firstTask: null,
  });

  function handleSend(text?: string) {
    const t = (text ?? msg).trim();
    if (!t) return;
    setMsg("");
    setThought(true);
    setTimeout(() => {
      const lowered = t.toLowerCase();
      let topNotions: string[] = [];
      if (lowered.includes("thalès") || lowered.includes("thales")) topNotions.push("maths:4e:theoreme-de-thales");
      if (lowered.includes("pythagore")) topNotions.push("maths:4e:theoreme-de-pythagore");
      if (lowered.includes("fraction")) topNotions.push("maths:6e:fractions");
      if (lowered.includes("relatif") || lowered.includes("signe")) topNotions.push("maths:5e:nombres-relatifs");
      if (lowered.includes("puissance")) topNotions.push("maths:4e:puissances");
      if (lowered.includes("équation") || lowered.includes("equation")) topNotions.push("maths:4e:equations-du-premier-degre");
      if (lowered.includes("priorité") || lowered.includes("priorite")) topNotions.push("maths:6e:decimaux-et-operations");
      if (lowered.includes("pourcent")) topNotions.push("maths:5e:pourcentages");
      if (!topNotions.length) topNotions = ["maths:4e:equations-du-premier-degre"];

      setAnalysis({
        summary: `J'ai compris : tu as du mal avec « ${t} ». On va commencer directement par un exercice ultra-ciblé.`,
        topNotions,
        firstTask: { notionId: topNotions[0], title: topNotions[0].split(":").slice(2).join(" ").replace(/-/g, " ") },
      });
      setThought(false);
      setDone(true);
    }, 700);
  }

  function startNow() {
    if (!me) return;
    update((st) => ({ ...st, users: st.users.map((u) => u.id === me.id ? { ...u, placed: true } : u), goals: { ...st.goals, [me.id]: "guided:first" } }));
    nav("/serie/" + encodeURIComponent(analysis.firstTask?.notionId || ""));
  }

  function skipToClassic() {
    if (!me) return;
    update((st) => ({ ...st, users: st.users.map((u) => u.id === me.id ? { ...u, placed: true } : u) }));
    nav("/");
  }

  return (
    <div className="navy">
      <main className="shell no-nav stack" style={{ gap: 24 }}>
        <Logo />
        <div className="center stack" style={{ alignItems: "center" }}>
          <div className="hero-mark">
            <Lightbulb size={56} aria-hidden="true" />
            <span className="hero-bubble">Parlons-en</span>
          </div>
          <h1>Dis-moi ce qui te bloque</h1>
          <p className="lead">Pas besoin de répondre à 20 questions. Explique simplement la notion ou l'exercice qui te pose problème.</p>
        </div>

        {!done && (
          <section className="card stack" style={{ background: "#fff", color: "#3d3868", borderColor: "#fff" }}>
            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              {SUGGESTIONS.map((sug) => (
                <button key={sug} className="btn ghost" style={{ color: "#1c1545", borderColor: "#e7e5ff" }} onClick={() => handleSend(sug)}>
                  {sug}
                </button>
              ))}
            </div>
            <div className="auth-input" style={{ width: "100%" }}>
              <input
                placeholder="Ex. Je ne comprends pas comment appliquer Thalès quand les triangles sont imbriqués..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
              />
              <button className="auth-eye" aria-label="Envoyer" onClick={() => handleSend()} disabled={!msg.trim() || thought}>
                <SendHorizontal size={20} />
              </button>
            </div>
            {thought && (
              <div className="row" style={{ gap: 10, color: "#5f5a85" }}>
                <Sparkles size={18} /> J'analyse ton message pour te préparer le bon exercice...
              </div>
            )}
            <button className="btn link" style={{ color: "#5f5a85", alignSelf: "center" }} onClick={skipToClassic}>
              Passer à l'accueil classique
            </button>
          </section>
        )}

        {done && (
          <section className="card stack" style={{ background: "#fff", color: "#3d3868", borderColor: "#fff" }}>
            <h2 style={{ color: "#1c1545" }}>C'est parti</h2>
            <p>{analysis.summary}</p>
            <div className="stack" style={{ gap: 8 }}>
              <strong>On va viser :</strong>
              {analysis.firstTask && <span className="chip">{analysis.firstTask.title}</span>}
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn primary" onClick={startNow}>
                Commencer l'exercice ciblé
              </button>
              <button className="btn ghost" style={{ color: "#1c1545", borderColor: "#e7e5ff" }} onClick={skipToClassic}>
                Voir tout le programme
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
