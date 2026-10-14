import { Bot, Camera, ImagePlus, Monitor, ScanLine, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { BackButton } from "../components/ui";
import { checkAnswer, instantiate, parseNumeric, templateById } from "../content/core";
import { diagnose, errInfo } from "../content/erreurs";
import { lessonFor } from "../content/lessons";
import { levelById, levelIndex, notionById, SUBJECT_LABEL, subjectsAt } from "../curriculum";
import type { Subject } from "../curriculum";
import { cardsForLevel, recallOverlap } from "../lib/cards";
import { recordEvidence } from "../lib/knowledge";
import { searchAll } from "../lib/search";
import { Concept, CONCEPTS, findConcept, HELP_LADDER } from "../lib/tutor";
import { askTutor, canCaptureScreen, captureScreen, imageFromClipboard, toJpegDataUrl } from "../lib/tutorApi";
import type { ChatTurn } from "../lib/tutorApi";
import { currentUser, useStore } from "../store";
import "../methodes.css";

interface Msg { who: "tuteur" | "eleve"; text: string; img?: string }
type Await = "free" | "answer" | "restate" | "question";
interface Quick { label: string; run: () => void }

/**
 * Tuteur pédagogique : il accompagne l'élève qui bloque en posant des questions et en donnant des indices progressifs.
 * Deux usages : sur un exercice précis (?t=…&c=…&s=…) ou pour expliquer une notion / répondre à une question de cours.
 * Si le serveur de tutorat est connecté (api/tutor.ts), un modèle de langage répond aux questions libres et lit les captures d'écran ;
 * sinon le tuteur à règles prend le relais. Dans les deux cas : jamais la réponse de l'exercice.
 */
export default function Tuteur() {
  const [params] = useSearchParams();
  // exercice numérisé par le scanner (texte vérifié par l'élève) : point d'entrée « Demander de l'aide au tuteur »
  const scan = (useLocation().state as { scan?: { text: string; subject: Subject } } | null)?.scan;
  const scanText = scan?.text.slice(0, 1500) ?? "";
  const state = useStore();
  const me = currentUser(state)!;
  const tId = params.get("t"), ctx = params.get("c") ?? "", seed = Number(params.get("s") ?? 0);
  const tpl = tId ? templateById(tId) : undefined;
  const notionId = tpl?.notionId ?? params.get("notion") ?? "";
  const notion = notionId ? notionById(notionId) : undefined;
  const inst = useMemo(() => (tpl && seed ? instantiate(tpl, ctx, seed) : null), [tpl, ctx, seed]);
  const lesson = notionId ? lessonFor(notionId) : undefined;

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [await_, setAwait] = useState<Await>("free");
  const [text, setText] = useState("");
  const [stage, setStage] = useState(0); // échelon d'aide atteint (0 = aucun indice)
  const [wrongs, setWrongs] = useState(0);
  const [solved, setSolved] = useState(false);
  const subjects = subjectsAt(me.level ?? "tle");
  const [subject, setSubject] = useState<Subject>(notion?.subject ?? scan?.subject ?? subjects[0]);
  const locked = !!notion; // un exercice ou une notion impose sa matière
  const [image, setImage] = useState<string | null>(null);
  const [backend, setBackend] = useState<"unknown" | "on" | "off">("unknown");
  const [thinking, setThinking] = useState(false);
  const [imgErr, setImgErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [concept, setConcept] = useState<{ c: Concept; i: number } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const say = (text_: string, who: Msg["who"] = "tuteur", img?: string) => setMsgs((m) => [...m, { who, text: text_, img }]);

  // message d'accueil
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (scanText) {
      say(`Salut ${me.name.split(" ")[0]} ! J'ai bien reçu ton exercice :\n« ${scanText} »\n\nJe ne te donnerai pas la réponse : on va la trouver ensemble. Qu'as-tu déjà essayé sur ton cahier, et où est-ce que tu bloques ?`);
    } else if (inst) {
      say(`Salut ${me.name.split(" ")[0]} ! Je suis là pour t'aider à comprendre, pas pour te donner la réponse.\n\nVoici ton exercice :\n« ${inst.statement} »\n\n${HELP_LADDER[0]}`);
    } else if (notion) {
      say(`Tu veux de l'aide sur « ${notion.title} ». Je peux t'expliquer la notion, ou répondre à une question précise.`);
    } else {
      say("Salut ! Pose-moi une question de cours (par exemple : « pourquoi on change le sens de l'inégalité ? »), ou choisis un sujet ci-dessous. Je ne donne pas les réponses toutes faites : je t'aide à les trouver.");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView?.({ block: "end", behavior: "smooth" }); }, [msgs]);

  if (tId && (!tpl || !seed)) return <Navigate to="/tuteur" replace />;

  // ---------- Aide sur un exercice ----------
  function nextHelp() {
    if (!inst) return;
    const s = stage + 1;
    if (s === 1) say(`${HELP_LADDER[1]}\n${inst.hints[0]}\n${inst.hints[1]}`);
    else if (s === 2) say(`${HELP_LADDER[2]}\n${inst.hints[2]}`);
    else if (s === 3) say(`${HELP_LADDER[3]}\n${inst.hints[3]}\n\nÀ toi de continuer : quelle réponse trouves-tu ?`);
    else say("Tu as eu tous mes indices. Je ne te donne pas la réponse : écris ta démarche sur ton cahier, ligne par ligne, et dis-moi à quelle ligne tu bloques. Tu peux aussi m'envoyer une photo de ton cahier.");
    setStage(s);
    setAwait("answer");
  }

  function submitAnswer(v: string) {
    if (!inst || !tpl || !notion) return;
    if (checkAnswer(inst.answer, v)) {
      say(stage === 0 ? "Exact, et sans aucun indice ! Bravo." : `Exact ! Tu y es arrivé(e) avec ${stage} niveau${stage > 1 ? "x" : ""} d'aide. La prochaine fois, essaie de te passer du dernier.`);
      recordEvidence({ studentId: me.id, notionId: notion.id, source: "tuteur", score: Math.max(0.4, 1 - 0.2 * stage - 0.1 * wrongs) });
      setSolved(true);
      return;
    }
    const tag = diagnose(inst.answer, v, inst.statement) ?? "calcul";
    recordEvidence({ studentId: me.id, notionId: notion.id, source: "tuteur", score: 0, errTag: tag, ref: tpl.id });
    setWrongs((w) => w + 1);
    say(`Ce n'est pas tout à fait ça. ${errInfo(tag).label} : ${errInfo(tag).advice}\n\nEssaie encore, ou demande-moi un indice.`);
  }

  // ---------- Explication d'une notion ----------
  function explainNotion() {
    if (!lesson || !notion) { say("Je n'ai pas encore de cours rédigé pour cette notion. Regarde l'onglet « Exercices » ou essaie une autre question."); return; }
    say(`**${notion.title}**\n${lesson.intro}\n\n${lesson.steps.slice(0, 3).map((s, i) => `${i + 1}. ${s.title} : ${s.body}`).join("\n")}\n\nPiège à éviter : ${lesson.pitfalls}`);
    say("Pour vérifier que tu as compris : redis la règle avec tes mots, comme si tu l'expliquais à un camarade.");
    setAwait("restate");
  }

  function restate(v: string) {
    if (!lesson || !notion) return;
    const r = recallOverlap(v, `${lesson.intro} ${lesson.steps.map((s) => s.body).join(" ")}`);
    const score = r.ratio >= 0.5 ? 0.8 : r.ratio >= 0.25 ? 0.5 : 0.2;
    recordEvidence({ studentId: me.id, notionId: notion.id, source: "tuteur", score });
    if (r.ratio >= 0.5) say(`Très bien, tu as retrouvé l'essentiel (${r.found.slice(0, 5).join(", ")}).`);
    else say(`Tu en as une partie${r.found.length ? ` (${r.found.slice(0, 4).join(", ")})` : ""}. Il manque encore : ${r.missing.slice(0, 5).join(", ")}. Relis l'explication et réessaie avec ces mots.`);
    setAwait("free");
  }

  // ---------- Question de cours ----------
  function openConcept(c: Concept) {
    say(c.title, "eleve");
    say(c.explain[0]);
    setConcept({ c, i: 0 });
    setAwait("free");
  }
  function conceptNext() {
    if (!concept) return;
    const i = concept.i + 1;
    if (i < concept.c.explain.length) { say(concept.c.explain[i]); setConcept({ c: concept.c, i }); }
    else { say(`À toi maintenant : ${concept.c.check.q}`); setConcept({ c: concept.c, i }); setAwait("question"); }
  }
  function answerCheck(idx: number) {
    if (!concept) return;
    const c = concept.c;
    say(c.check.options[idx], "eleve");
    say(idx === c.check.index ? c.check.ok : c.check.ko);
    setConcept(null);
    setAwait("free");
  }

  function ask(question: string) {
    const c = subject === "maths" ? findConcept(question) : null;
    if (c) { openConcept(c); return; }
    const level = me.level ?? "tle";
    const hit = searchAll(question).notions.filter((n) => n.subject === subject && levelIndex(n.level) <= levelIndex(level))[0];
    if (hit && lessonFor(hit.id)) {
      say(`Je n'ai pas d'explication toute prête sur ça, mais le cours « ${hit.title} » devrait t'aider. Voici l'essentiel :\n${lessonFor(hit.id)!.intro}`);
      say(`/notion/${encodeURIComponent(hit.id)}`);
    } else {
      say("Je n'ai pas trouvé d'explication sur ce sujet. Essaie avec d'autres mots (« fraction », « équation », « Pythagore »…), ou choisis un sujet dans la liste.");
    }
  }

  // ---------- Propriétés et exemple (sans jamais donner la réponse) ----------
  const properties = (): string[] => {
    const lv = notion?.level ?? me.level ?? "tle";
    return cardsForLevel(lv).filter((c) => c.notionId === notionId && c.kind === "propriete").map((c) => `${/«\s*(.+?)\s*»/.exec(c.front)?.[1] ?? "Propriété"} : ${c.back}`);
  };
  function showProperties() {
    const list = properties().length ? properties() : (lesson?.steps.map((st) => `${st.title} : ${st.body}`) ?? []);
    if (!list.length) { say(notionId ? "Je n'ai pas de liste de propriétés pour cette notion. Ouvre le cours :" : "Dis-moi d'abord sur quelle notion tu travailles."); if (notionId) say(`/notion/${encodeURIComponent(notionId)}`); return; }
    say(`Voici les propriétés du cours qui peuvent t'aider :\n${list.slice(0, 5).map((p) => "• " + p).join("\n")}\n\nLaquelle s'applique à ton exercice ? Dis-moi pourquoi.`);
  }
  function showExample() {
    if (!lesson) { say("Je n'ai pas encore d'exemple rédigé pour cette notion."); return; }
    say(`Voici un exemple résolu, avec d'autres nombres que ton exercice :\n${lesson.example.problem}\n${lesson.example.solution}\n\nRegarde la démarche, puis applique la même à ton exercice sur ton cahier.`);
  }

  // ---------- Tuteur conversationnel (serveur) ----------
  /** Renvoie true si le tuteur conversationnel a répondu ; false s'il n'est pas disponible (on utilise alors les règles). */
  async function askAI(question: string, img: string | null): Promise<boolean> {
    if (backend === "off") return false;
    setThinking(true);
    const turns: ChatTurn[] = [...msgs.slice(-8).map((m): ChatTurn => ({ role: m.who === "eleve" ? "user" : "assistant", content: m.text })), { role: "user", content: question }];
    while (turns.length > 1 && turns[0].role === "assistant") turns.shift();
    const lv = notion?.level ?? me.level ?? "tle";
    const res = await askTutor(turns, img ?? undefined, { subject: SUBJECT_LABEL[subject], level: levelById(lv).label, notion: notion?.title, statement: inst?.statement ?? (scanText || undefined), properties: properties().slice(0, 8) }, inst?.answer);
    setThinking(false);
    if (res.kind === "unavailable") { setBackend("off"); return false; }
    setBackend("on");
    say(res.kind === "reply" ? res.reply : res.message);
    return true;
  }

  // ---------- Images ----------
  async function attach(blob: Blob | null | undefined) {
    if (!blob) return;
    setImgErr("");
    try { setImage(await toJpegDataUrl(blob)); } catch { setImgErr("Impossible de lire cette image."); }
  }
  async function grabScreen() {
    setImgErr("");
    try { setImage(await captureScreen()); } catch { setImgErr("Capture annulée ou non autorisée."); }
  }

  async function send() {
    const v = text.trim();
    const img = image;
    if ((!v && !img) || thinking) return;
    setText(""); setImage(null);
    say(v || "Voici une capture de mon exercice.", "eleve", img ?? undefined);
    if (!img && await_ === "answer" && inst && (inst.answer.kind === "choice" || Number.isFinite(parseNumeric(v)))) return submitAnswer(v);
    if (!img && await_ === "restate") return restate(v);
    if (await askAI(v || "Peux-tu m'expliquer cet exercice sans me donner la réponse ?", img)) return;
    if (img) { say("Je ne peux pas lire les images tant que le tuteur intelligent n'est pas activé sur cette version (il faut une clé d'API côté serveur). En attendant, recopie l'énoncé avec tes mots et je t'aide avec la notion et les propriétés utiles."); return; }
    if (inst && await_ === "free") {
      // l'élève a expliqué ce qu'il comprend : on le relance avec le premier indice
      say("Merci de me l'avoir dit. Voyons si on peut aller plus loin ensemble.");
      return nextHelp();
    }
    ask(v);
  }

  const quick: Quick[] = [];
  if (inst && !solved) {
    quick.push({ label: "J'ai une réponse", run: () => { say("J'ai une réponse.", "eleve"); say("Vas-y, écris-la ci-dessous."); setAwait("answer"); } });
    if (stage < 4) quick.push({ label: stage === 0 ? "Donne-moi un indice" : "Un autre indice", run: () => { say("J'ai besoin d'un indice.", "eleve"); nextHelp(); } });
    if (lesson) quick.push({ label: "Explique-moi la notion", run: () => { say("Je ne comprends pas la notion.", "eleve"); explainNotion(); } });
    quick.push({ label: "Propriétés utiles", run: () => { say("Quelles propriétés dois-je utiliser ?", "eleve"); showProperties(); } });
    if (lesson) quick.push({ label: "Un exemple semblable", run: () => { say("Montre-moi un exemple.", "eleve"); showExample(); } });
  } else if (!inst && notion && lesson && await_ === "free" && !concept) {
    quick.push({ label: "Explique-moi cette notion", run: () => { say("Explique-moi cette notion.", "eleve"); explainNotion(); } });
    quick.push({ label: "Propriétés utiles", run: () => { say("Quelles sont les propriétés ?", "eleve"); showProperties(); } });
    if (lesson) quick.push({ label: "Un exemple", run: () => { say("Montre-moi un exemple.", "eleve"); showExample(); } });
  }
  if (concept && concept.i < concept.c.explain.length) quick.push({ label: concept.i + 1 < concept.c.explain.length ? "Continue" : "Je veux vérifier", run: conceptNext });

  const back = tpl ? `/serie/${encodeURIComponent(tpl.notionId)}` : "/methodes";

  return (
    <main className="shell wide stack">
      <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to={back} /><h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><Bot size={26} aria-hidden="true" /> Tuteur</h1></div>
      <p className="muted small">
        {backend === "off"
          ? "Le tuteur intelligent n'est pas connecté sur cette version : il répond avec ses règles de base (indices, propriétés, exemples). Il ne peut pas lire les images."
          : "Écris ta question ou envoie une capture d'écran ou une photo de ton exercice. Le tuteur t'explique, te donne les propriétés et des astuces, mais jamais la réponse : c'est toi qui la trouves."}
      </p>

      <div className="mt-quick" role="group" aria-label="Matière du tuteur">
        <span className="muted" style={{ alignSelf: "center", fontWeight: 700 }}>Matière :</span>
        {subjects.map((su) => (
          <button key={su} type="button" disabled={locked && su !== subject} aria-pressed={su === subject}
            style={su === subject ? { background: "var(--primary)", color: "var(--on-primary)" } : undefined}
            onClick={() => { if (su !== subject) { setSubject(su); say(`D'accord, on travaille en ${SUBJECT_LABEL[su]}. Pose ta question ou envoie une capture de ton exercice.`); } }}>
            {SUBJECT_LABEL[su]}
          </button>
        ))}
      </div>

      <div className="mt-chat" role="log" aria-live="polite" aria-label="Conversation avec le tuteur">
        {msgs.map((m, i) => <div key={i} className={`mt-bubble ${m.who}`}>{m.img && <img src={m.img} alt="Capture envoyée au tuteur" />}{m.text.split("\n").map((l, k) => <span key={k}>{l.startsWith("**") ? <b>{l.replace(/\*\*/g, "")}</b> : l.startsWith("/notion/") ? <Link to={l}>Ouvrir le cours</Link> : l}<br /></span>)}</div>)}
        {thinking && <div className="mt-bubble tuteur" role="status">Déclic réfléchit…</div>}
        <div ref={end} />
      </div>

      {await_ === "question" && concept && (
        <div className="mt-quick" role="group" aria-label="Choisis ta réponse">
          {concept.c.check.options.map((o, i) => <button key={o} type="button" onClick={() => answerCheck(i)}>{o}</button>)}
        </div>
      )}
      {quick.length > 0 && <div className="mt-quick">{quick.map((q) => <button key={q.label} type="button" onClick={q.run}>{q.label}</button>)}</div>}


      {await_ !== "question" && (
        <form className="stack-sm" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <div className="mt-attach">
            <Link to="/scanner" className="mt-scanlink"><ScanLine size={18} aria-hidden="true" /> Scanner un exercice</Link>
            <button type="button" onClick={() => fileRef.current?.click()}><ImagePlus size={18} aria-hidden="true" /> Joindre une image</button>
            <button type="button" onClick={() => camRef.current?.click()}><Camera size={18} aria-hidden="true" /> Photo</button>
            {canCaptureScreen() && <button type="button" onClick={() => void grabScreen()}><Monitor size={18} aria-hidden="true" /> Capturer l'écran</button>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
            <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          {image && (
            <div className="stack-sm">
              <span className="mt-thumb"><img src={image} alt="Capture prête à être envoyée" /><button type="button" aria-label="Retirer l'image" onClick={() => setImage(null)}><X size={16} aria-hidden="true" /></button></span>
              <p className="mt-note">Cette image sera envoyée au service de tutorat pour t'aider. Ne montre ni visage ni information personnelle (nom, adresse, téléphone).</p>
            </div>
          )}
          {imgErr && <p className="mt-err" role="alert">{imgErr}</p>}
          <div className="mt-chat-in">
            <input
              value={text} onChange={(e) => setText(e.target.value)} aria-label="Ton message"
              onPaste={(e) => { const f = imageFromClipboard(e); if (f) { e.preventDefault(); void attach(f); } }}
              placeholder={await_ === "answer" ? "Ta réponse (ou ta question)…" : await_ === "restate" ? "Redis la règle avec tes mots…" : inst ? "Explique ce que tu as essayé… (tu peux coller une capture)" : "Pose ta question… (tu peux coller une capture)"}
            />
            <button className="btn primary" type="submit" aria-label="Envoyer" disabled={(!text.trim() && !image) || thinking}><Send size={20} aria-hidden="true" /></button>
          </div>
        </form>
      )}

      {solved && inst && tpl && (
        <Link className="btn ghost block" to={`/serie/${encodeURIComponent(tpl.notionId)}?t=${encodeURIComponent(tpl.id)}&drill=1`}>Refaire des exercices comme celui-ci</Link>
      )}
    </main>
  );
}
