/** Sons doux générés avec Web Audio (aucun fichier à charger). Silencieux si le navigateur ne le permet pas. */
type Tone = { f: number; at: number; dur: number };

const PATTERNS = {
  ok: [{ f: 523.25, at: 0, dur: 0.14 }, { f: 783.99, at: 0.1, dur: 0.22 }], // do → sol, montant
  near: [{ f: 440, at: 0, dur: 0.16 }, { f: 440, at: 0.18, dur: 0.16 }],
  bad: [{ f: 330, at: 0, dur: 0.16 }, { f: 262, at: 0.12, dur: 0.24 }], // descendant, sans agressivité
} satisfies Record<string, Tone[]>;

let ctx: AudioContext | null = null;

export function playFeedback(kind: keyof typeof PATTERNS, enabled?: boolean) {
  if (!enabled) return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime;
    for (const { f, at, dur } of PATTERNS[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t0 + at);
      gain.gain.exponentialRampToValueAtTime(0.12, t0 + at + 0.02); // volume bas
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + at);
      osc.stop(t0 + at + dur + 0.02);
    }
  } catch { /* audio indisponible : on reste silencieux */ }
}
