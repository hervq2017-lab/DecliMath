import { Camera, Check, Copy, FileUp, Loader2, RotateCcw, RotateCw, ScanLine, Trash2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as RPointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/ui";
import { subjectsAt, SUBJECT_LABEL } from "../curriculum";
import type { Subject } from "../curriculum";
import { recognize } from "../lib/ocrApi";
import type { OcrFail } from "../lib/ocrApi";
import {
  ACCEPTED, clampCrop, cropCanvas, DEFAULT_EDIT, ENHANCE_LABEL, exportJpeg, FULL, isPdf, loadImageFile, openPdf, prettyMath, renderRotated, rotateBy, validateFile,
} from "../lib/scan";
import type { CropRect, Edit, Enhance, PdfDoc } from "../lib/scan";
import { currentUser, useStore } from "../store";
import "../methodes.css";

type Phase = "choose" | "edit" | "reading" | "review" | "done";
const ENHANCES: Enhance[] = ["document", "nb", "original"];

/** Cadre de recadrage : on tire les coins ou on déplace le cadre (souris, doigt ou clavier). */
function CropView({ canvas, crop, onChange }: { canvas: HTMLCanvasElement; crop: CropRect; onChange: (c: CropRect) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: string; start: CropRect; x: number; y: number } | null>(null);

  useEffect(() => {
    const c = ref.current!;
    c.width = canvas.width; c.height = canvas.height;
    c.getContext("2d")!.drawImage(canvas, 0, 0);
  }, [canvas]);

  const begin = (kind: string) => (e: RPointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { kind, start: crop, x: e.clientX, y: e.clientY };
  };
  const move = (e: RPointerEvent) => {
    const d = drag.current, r = stage.current?.getBoundingClientRect();
    if (!d || !r) return;
    const dx = (e.clientX - d.x) / r.width, dy = (e.clientY - d.y) / r.height, s = d.start;
    let n: CropRect;
    if (d.kind === "move") n = { ...s, x: s.x + dx, y: s.y + dy };
    else {
      const left = d.kind.includes("l"), top = d.kind.includes("t");
      const x0 = left ? s.x + dx : s.x, x1 = left ? s.x + s.w : s.x + s.w + dx;
      const y0 = top ? s.y + dy : s.y, y1 = top ? s.y + s.h : s.y + s.h + dy;
      const a = Math.max(0, Math.min(x0, x1 - 0.08)), b = Math.min(1, Math.max(x1, x0 + 0.08));
      const c = Math.max(0, Math.min(y0, y1 - 0.08)), d2 = Math.min(1, Math.max(y1, y0 + 0.08));
      n = { x: a, y: c, w: b - a, h: d2 - c };
    }
    onChange(clampCrop(n));
  };
  const end = () => { drag.current = null; };
  const key = (kind: string) => (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.05 : 0.01;
    const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0, dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    const s = crop;
    if (kind === "move") onChange(clampCrop({ ...s, x: s.x + dx, y: s.y + dy }));
    else onChange(clampCrop({ x: kind.includes("l") ? s.x + dx : s.x, y: kind.includes("t") ? s.y + dy : s.y, w: kind.includes("l") ? s.w - dx : s.w + dx, h: kind.includes("t") ? s.h - dy : s.h + dy }));
  };
  const pos = (k: string) => ({ left: `${(k.includes("l") ? crop.x : crop.x + crop.w) * 100}%`, top: `${(k.includes("t") ? crop.y : crop.y + crop.h) * 100}%` });
  const NAMES: Record<string, string> = { tl: "haut gauche", tr: "haut droit", bl: "bas gauche", br: "bas droit" };

  return (
    <div className="sc-stage" ref={stage} style={{ aspectRatio: `${canvas.width} / ${canvas.height}` }} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <canvas ref={ref} aria-label="Aperçu du document" />
      <div className="sc-shade" style={{ left: 0, top: 0, right: 0, height: `${crop.y * 100}%` }} />
      <div className="sc-shade" style={{ left: 0, bottom: 0, right: 0, height: `${(1 - crop.y - crop.h) * 100}%` }} />
      <div className="sc-shade" style={{ left: 0, top: `${crop.y * 100}%`, width: `${crop.x * 100}%`, height: `${crop.h * 100}%` }} />
      <div className="sc-shade" style={{ right: 0, top: `${crop.y * 100}%`, width: `${(1 - crop.x - crop.w) * 100}%`, height: `${crop.h * 100}%` }} />
      <div className="sc-frame" tabIndex={0} role="group" aria-label="Cadre de recadrage : flèches pour le déplacer" style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }} onPointerDown={begin("move")} onKeyDown={key("move")} />
      {["tl", "tr", "bl", "br"].map((k) => (
        <span key={k} className="sc-handle" tabIndex={0} role="slider" aria-label={`Coin ${NAMES[k]} du cadre`} aria-valuenow={0} style={pos(k)} onPointerDown={begin(k)} onKeyDown={key(k)} />
      ))}
    </div>
  );
}

/** Scanner un exercice : photo ou import → retouche → lecture (OCR) → texte vérifié par l'élève → tuteur. */
export default function Scanner() {
  const me = currentUser(useStore())!;
  const nav = useNavigate();
  const subjects = subjectsAt(me.level ?? "tle");
  const [subject, setSubject] = useState<Subject>(subjects[0]);
  const [phase, setPhase] = useState<Phase>("choose");
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [pdf, setPdf] = useState<PdfDoc | null>(null);
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Edit>(DEFAULT_EDIT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thumb, setThumb] = useState("");
  const [text, setText] = useState("");
  const [uncertain, setUncertain] = useState<string[]>([]);
  const [manual, setManual] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

  const rotated = useMemo(() => (source ? renderRotated(source, edit.rotation, edit.enhance, 1400) : null), [source, edit.rotation, edit.enhance]);

  async function load(file: File | undefined | null) {
    if (!file) return;
    const bad = validateFile(file);
    if (bad) { setError(bad); return; }
    setError(""); setBusy(true);
    try {
      if (isPdf(file)) {
        const doc = await openPdf(file);
        setPdf(doc); setPage(1);
        setSource(await doc.render(1));
      } else {
        setPdf(null);
        setSource(await loadImageFile(file));
      }
      setEdit(DEFAULT_EDIT); setPhase("edit");
    } catch {
      setError(isPdf(file) ? "Ce PDF n'a pas pu être ouvert (protégé par mot de passe ou abîmé ?). Essaie avec une photo." : "Cette image n'a pas pu être lue. Essaie avec une autre photo.");
    } finally { setBusy(false); }
  }

  async function goPage(n: number) {
    if (!pdf || n < 1 || n > pdf.pages) return;
    setBusy(true);
    try { setSource(await pdf.render(n)); setPage(n); setEdit((e) => ({ ...e, crop: FULL })); } catch { setError("Cette page n'a pas pu être affichée."); } finally { setBusy(false); }
  }

  function reset() {
    abort.current?.abort();
    setSource(null); setPdf(null); setEdit(DEFAULT_EDIT); setThumb(""); setText(""); setUncertain([]); setManual(false); setError(""); setPhase("choose");
  }

  async function validate() {
    if (!source) return;
    setError("");
    const full = renderRotated(source, edit.rotation, edit.enhance);
    const url = exportJpeg(cropCanvas(full, edit.crop));
    setThumb(url);
    setPhase("reading");
    abort.current = new AbortController();
    const res = await recognize(url, SUBJECT_LABEL[subject], abort.current.signal); // première (et seule) utilisation du réseau pour ce document
    if (res.kind === "ok") { setText(res.text); setUncertain(res.uncertain); setManual(false); setPhase("review"); return; }
    const fail = res as OcrFail;
    if (fail.kind === "cancelled") { setPhase("edit"); return; }
    if (fail.kind === "unconfigured") { setText(""); setManual(true); setError(fail.message); setPhase("review"); return; }
    setError(fail.message);
    setPhase("edit");
  }

  async function copy() {
    const t = text.trim();
    try { await navigator.clipboard.writeText(t); } catch {
      const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch { /* ignoré */ } ta.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const toTutor = () => nav("/tuteur", { state: { scan: { text: text.trim(), subject } } });

  const Head = ({ title }: { title: string }) => (
    <div className="row" style={{ flexWrap: "nowrap" }}><BackButton to="/methodes" /><h1 className="row" style={{ flexWrap: "nowrap", fontSize: "1.4rem" }}><ScanLine size={26} aria-hidden="true" /> {title}</h1></div>
  );
  const err = error && <div className="mt-err" role="alert">{error}</div>;
  const inputs = (
    <>
      <input ref={fileRef} type="file" accept={ACCEPTED} hidden onChange={(e) => { void load(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void load(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={replaceRef} type="file" accept={ACCEPTED} hidden onChange={(e) => { void load(e.target.files?.[0]); e.target.value = ""; }} />
    </>
  );

  // ---------- 1. Choisir ----------
  if (phase === "choose") {
    return (
      <main className="shell wide no-nav stack">
        <Head title="Scanner un exercice" />
        <p className="muted">Photographie ou importe un exercice : il sera numérisé, lu, puis tu pourras le vérifier et demander de l'aide au tuteur.</p>
        <div className="mt-quick" role="group" aria-label="Matière de l'exercice">
          <span className="muted" style={{ alignSelf: "center", fontWeight: 700 }}>Matière :</span>
          {subjects.map((su) => (
            <button key={su} type="button" aria-pressed={su === subject} style={su === subject ? { background: "var(--primary)", color: "var(--on-primary)" } : undefined} onClick={() => setSubject(su)}>{SUBJECT_LABEL[su]}</button>
          ))}
        </div>
        {inputs}
        <div className={`sc-drop${drag ? " over" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); void load(e.dataTransfer.files?.[0]); }}>
          {busy ? <p role="status"><Loader2 className="spin" size={22} aria-hidden="true" /> Ouverture du document…</p> : (
            <>
              <button className="btn primary block" type="button" onClick={() => camRef.current?.click()}><Camera size={22} aria-hidden="true" /> Prendre une photo</button>
              <button className="btn ghost block" type="button" onClick={() => fileRef.current?.click()}><FileUp size={22} aria-hidden="true" /> Importer une image ou un PDF</button>
              <p className="muted small center">ou glisse un fichier ici • JPEG, PNG, WebP ou PDF • 20 Mo maximum</p>
            </>
          )}
        </div>
        {err}
        <p className="mt-note">Ton document reste sur ton appareil jusqu'à ce que tu cliques sur « Lire l'exercice ». À ce moment-là, l'image est envoyée à un service de lecture pour en extraire le texte ; l'application ne la conserve pas. Ne photographie ni visage ni information personnelle.</p>
        <p className="mt-note"><b>Pour une bonne lecture :</b> document à plat, bien éclairé, sans reflet, texte net et droit, un seul exercice à la fois.</p>
      </main>
    );
  }

  // ---------- 2. Retoucher ----------
  if (phase === "edit" && source && rotated) {
    return (
      <main className="shell wide no-nav stack">
        <Head title="Retoucher le document" />
        {inputs}
        {err}
        <CropView canvas={rotated} crop={edit.crop} onChange={(crop) => setEdit((e) => ({ ...e, crop }))} />
        <div className="mt-attach" role="toolbar" aria-label="Retouches">
          <button type="button" onClick={() => setEdit((e) => ({ ...e, rotation: rotateBy(e.rotation, -90), crop: FULL }))}><RotateCcw size={18} aria-hidden="true" /> Pivoter à gauche</button>
          <button type="button" onClick={() => setEdit((e) => ({ ...e, rotation: rotateBy(e.rotation, 90), crop: FULL }))}><RotateCw size={18} aria-hidden="true" /> Pivoter à droite</button>
          <button type="button" onClick={() => setEdit((e) => ({ ...e, crop: FULL }))}>Tout le document</button>
        </div>
        <div className="mt-quick" role="group" aria-label="Lisibilité">
          <span className="muted" style={{ alignSelf: "center", fontWeight: 700 }}><Wand2 size={16} aria-hidden="true" /> Lisibilité :</span>
          {ENHANCES.map((m) => <button key={m} type="button" aria-pressed={edit.enhance === m} style={edit.enhance === m ? { background: "var(--primary)", color: "var(--on-primary)" } : undefined} onClick={() => setEdit((e) => ({ ...e, enhance: m }))}>{ENHANCE_LABEL[m]}</button>)}
        </div>
        {pdf && pdf.pages > 1 && (
          <div className="row between" role="group" aria-label="Pages du PDF">
            <button className="btn ghost small-btn" disabled={page <= 1 || busy} onClick={() => void goPage(page - 1)}>Page précédente</button>
            <span>Page {page} / {pdf.pages}</span>
            <button className="btn ghost small-btn" disabled={page >= pdf.pages || busy} onClick={() => void goPage(page + 1)}>Page suivante</button>
          </div>
        )}
        <div className="actions">
          <button className="btn ghost" type="button" onClick={() => replaceRef.current?.click()}>Remplacer</button>
          <button className="btn ghost" type="button" onClick={reset}><Trash2 size={18} aria-hidden="true" /> Supprimer</button>
        </div>
        <button className="btn primary block" type="button" onClick={() => void validate()} disabled={busy}><ScanLine size={20} aria-hidden="true" /> Lire l'exercice</button>
        <p className="mt-note">La lecture ne démarre que quand tu cliques sur ce bouton. Recadre sur l'exercice pour de meilleurs résultats.</p>
      </main>
    );
  }

  // ---------- 3. Lecture ----------
  if (phase === "reading") {
    return (
      <main className="shell wide no-nav stack center" style={{ paddingTop: 48 }}>
        <Loader2 className="spin" size={44} aria-hidden="true" style={{ margin: "0 auto" }} />
        <h1 role="status">Lecture de ton exercice…</h1>
        <p className="muted">Cela prend quelques secondes. Les fractions, puissances et racines sont reconnues, mais il faudra tout vérifier.</p>
        {thumb && <img className="sc-thumb" src={thumb} alt="Document envoyé à la lecture" />}
        <button className="btn link" type="button" onClick={() => abort.current?.abort()}>Annuler</button>
      </main>
    );
  }

  // ---------- 4. Vérifier le texte ----------
  if (phase === "review") {
    return (
      <main className="shell wide no-nav stack">
        <Head title="Vérifie le texte" />
        {err}
        <div className="callout" role="note">
          {manual
            ? "Recopie l'énoncé dans la zone de texte."
            : <><b>Ce texte a été lu automatiquement : il peut contenir des erreurs.</b> Compare-le avec ton document et corrige-le avant de continuer.</>}
        </div>
        {uncertain.length > 0 && <div className="mt-err" role="note"><strong>Passages douteux</strong>{uncertain.map((u) => <span key={u} style={{ display: "block" }}>• {u}</span>)}</div>}
        <div className="sc-cols">
          {thumb && <img className="sc-thumb" src={thumb} alt="Ton document numérisé" />}
          <label className="stack-sm" style={{ flex: 1 }}>
            <b>Énoncé (modifiable)</b>
            <textarea className="sc-text" value={text} onChange={(e) => setText(e.target.value)} rows={12} spellCheck={false} placeholder="Écris ou corrige l'énoncé ici…" />
            <span className="mt-note">Les formules sont écrites entre $ … $ (par exemple $\frac{"{a}{b}"}$ pour une fraction, $x^{"{2}"}$ pour une puissance).</span>
          </label>
        </div>
        <button className="btn primary block" type="button" disabled={!text.trim()} onClick={() => setPhase("done")}><Check size={20} aria-hidden="true" /> C'est correct : valider le texte</button>
        <div className="actions">
          <button className="btn ghost" type="button" onClick={() => void copy()} disabled={!text.trim()}><Copy size={18} aria-hidden="true" /> {copied ? "Copié !" : "Copier"}</button>
          <button className="btn ghost" type="button" onClick={reset}>Reprendre la photo</button>
        </div>
      </main>
    );
  }

  // ---------- 5. Exercice prêt ----------
  return (
    <main className="shell wide no-nav stack">
      <Head title="Exercice numérisé" />
      <section className="fb ok" role="status"><header><span className="ic"><Check size={26} aria-hidden="true" /></span><div><h2>Exercice prêt</h2><p>{SUBJECT_LABEL[subject]} • texte vérifié par toi</p></div></header></section>
      <div className="sc-cols">
        {thumb && <img className="sc-thumb" src={thumb} alt="Ton document numérisé" />}
        <section className="card" style={{ flex: 1 }}><p className="statement" style={{ whiteSpace: "pre-wrap" }}>{prettyMath(text)}</p></section>
      </div>
      <button className="btn primary block" type="button" onClick={toTutor}>Demander de l'aide au tuteur</button>
      <div className="actions">
        <button className="btn ghost" type="button" onClick={() => void copy()}><Copy size={18} aria-hidden="true" /> {copied ? "Copié !" : "Copier l'énoncé"}</button>
        <button className="btn ghost" type="button" onClick={() => setPhase("review")}>Modifier le texte</button>
      </div>
      <button className="btn link" type="button" onClick={reset}>Recommencer la numérisation</button>
    </main>
  );
}
