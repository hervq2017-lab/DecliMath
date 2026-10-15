// Synchronisation de la progression avec Supabase : tentatives, preuves, révisions, contrôles, bilans, épreuves, sujets imprimés, cours validés.
// Même principe que authRemote.ts : les écrans écrivent dans l'état local comme avant ; on envoie ce que le serveur ne connaît pas encore
// et on récupère ce qu'il a (autre appareil, enfants du parent). L'état local sert de cache et de file d'attente hors ligne.
import { getState, setBeforeLogout, subscribe, update } from "../store";
import type { Attempt, BilanRun, CheckResult, Evidence, ExamRun, MemItem, PaperRecord, State } from "../store";
import { supabase, supabaseReady } from "./supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const iso = (t: number) => new Date(t).toISOString();
const ms = (t: string | null | undefined) => (t ? Date.parse(t) : undefined);
const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

type Row = Record<string, unknown>;

// ---------- Correspondance état local <-> lignes de la base ----------
export const attemptRow = (a: Attempt): Row => ({
  id: a.id, student_id: a.studentId, template_id: a.templateId, notion_id: a.notionId, ctx: a.ctx, seed: Math.trunc(a.seed), correct: a.correct,
  help_level: Math.max(0, Math.trunc(a.helpLevel ?? 0)), solution_viewed: !!a.solutionViewed, solution_viewed_before_attempt: !!a.solutionViewedBeforeAttempt,
  kind: a.kind, near: a.near ?? null, given: a.given ?? null, err_tag: a.errTag ?? null, ts: iso(a.ts),
});
export const attemptFrom = (r: Row): Attempt => ({
  id: r.id as string, studentId: r.student_id as string, templateId: r.template_id as string, notionId: r.notion_id as string, ctx: r.ctx as string,
  seed: Number(r.seed), correct: !!r.correct, helpLevel: Number(r.help_level ?? 0), solutionViewed: !!r.solution_viewed,
  solutionViewedBeforeAttempt: !!r.solution_viewed_before_attempt, kind: r.kind as Attempt["kind"], near: (r.near as boolean | null) ?? undefined,
  given: (r.given as string | null) ?? undefined, errTag: (r.err_tag as string | null) ?? undefined, ts: ms(r.ts as string)!,
});

export const evidenceRow = (e: Evidence): Row => ({
  id: e.id, student_id: e.studentId, notion_id: e.notionId, source: e.source, score: clamp01(e.score), err_tag: e.errTag ?? null, ref: e.ref ?? null, ts: iso(e.ts),
});
export const evidenceFrom = (r: Row): Evidence => ({
  id: r.id as string, studentId: r.student_id as string, notionId: r.notion_id as string, source: r.source as Evidence["source"], score: Number(r.score),
  errTag: (r.err_tag as string | null) ?? undefined, ref: (r.ref as string | null) ?? undefined, ts: ms(r.ts as string)!,
});

export const checkRow = (c: CheckResult): Row => ({ id: c.id, student_id: c.studentId, notion_id: c.notionId, passed: c.passed, ts: iso(c.ts) });
export const checkFrom = (r: Row): CheckResult => ({ id: r.id as string, studentId: r.student_id as string, notionId: r.notion_id as string, passed: !!r.passed, ts: ms(r.ts as string)! });

export const bilanRow = (b: BilanRun): Row => ({ id: b.id, student_id: b.studentId, items: b.items, ts: iso(b.ts) });
export const bilanFrom = (r: Row): BilanRun => ({ id: r.id as string, studentId: r.student_id as string, items: r.items as BilanRun["items"], ts: ms(r.ts as string)! });

export const paperRow = (p: PaperRecord): Row => ({ id: p.id, student_id: p.studentId, spec: p.spec, ts: iso(p.ts) });
export const paperFrom = (r: Row): PaperRecord => ({ id: r.id as string, studentId: r.student_id as string, spec: r.spec as PaperRecord["spec"], ts: ms(r.ts as string)! });

export const examRow = (x: ExamRun): Row => ({
  id: x.id, student_id: x.studentId, subject: x.subject, level: x.level, kind: x.kind, label: x.label, started_at: iso(x.startedAt),
  duration_min: Math.round(x.durationMin), out_of: Math.round(x.outOf), items: x.items, answers: x.answers ?? {}, status: x.status,
  finished_at: x.finishedAt ? iso(x.finishedAt) : null, results: x.results ?? null, score: x.score ?? null,
});
export const examFrom = (r: Row): ExamRun => ({
  id: r.id as string, studentId: r.student_id as string, subject: r.subject as ExamRun["subject"], level: r.level as ExamRun["level"], kind: r.kind as ExamRun["kind"],
  label: r.label as string, startedAt: ms(r.started_at as string)!, durationMin: Number(r.duration_min), outOf: Number(r.out_of), items: r.items as ExamRun["items"],
  answers: (r.answers ?? {}) as ExamRun["answers"], status: r.status as ExamRun["status"], finishedAt: ms(r.finished_at as string | null),
  results: (r.results as boolean[] | null) ?? undefined, score: r.score == null ? undefined : Number(r.score),
});

export const memRow = (m: MemItem): Row => ({
  student_id: m.studentId, key: m.key, notion_id: m.notionId, due: iso(m.due), interval_days: m.interval, ease: m.ease, reps: m.reps, lapses: m.lapses, last: iso(m.last),
});
export const memFrom = (r: Row): MemItem => ({
  studentId: r.student_id as string, key: r.key as string, notionId: r.notion_id as string, due: ms(r.due as string)!, interval: Number(r.interval_days),
  ease: Number(r.ease), reps: Number(r.reps), lapses: Number(r.lapses), last: ms(r.last as string)!,
});

/** Tables « ajout seulement » : clé de l'état local, mappers. */
const APPEND_ONLY = [
  { table: "attempts", field: "attempts", toRow: attemptRow, fromRow: attemptFrom },
  { table: "evidence", field: "evidence", toRow: evidenceRow, fromRow: evidenceFrom },
  { table: "checks", field: "checks", toRow: checkRow, fromRow: checkFrom },
  { table: "bilans", field: "bilans", toRow: bilanRow, fromRow: bilanFrom },
  { table: "papers", field: "papers", toRow: paperRow, fromRow: paperFrom },
] as const;

/** Ajoute à la liste locale les lignes du serveur (le serveur fait foi) ; les lignes locales que le serveur ne connaît pas encore sont gardées. */
export function mergeRows<T extends { id: string; studentId: string }>(local: T[], server: T[], studentIds: string[]): T[] {
  const ids = new Set(studentIds);
  const onServer = new Set(server.map((r) => r.id));
  const keep = local.filter((r) => !ids.has(r.studentId) || !onServer.has(r.id));
  return [...keep, ...server];
}

// ---------- Suivi de ce que le serveur connaît déjà ----------
const known: Record<string, Set<string>> = {};
const knownSet = (table: string) => (known[table] ??= new Set());
const signatures = new Map<string, string>(); // « table|clé » -> dernière ligne envoyée ou reçue (épreuves, révisions)
let knownValidated = new Set<string>();

const memKey = (m: MemItem) => `${m.studentId}|${m.key}`;

/** Actualise le suivi après une réception : ces lignes sont chez le serveur, il ne faut pas les renvoyer. */
function markKnown(s: State, studentIds: string[]) {
  const ids = new Set(studentIds);
  for (const t of APPEND_ONLY) for (const r of s[t.field] as { id: string; studentId: string }[]) if (ids.has(r.studentId)) knownSet(t.table).add(r.id);
}

// ---------- Envoi ----------
let flushing: Promise<void> | null = null;
let flushAgain = false;

async function pushAppendOnly(s: State, uid: string): Promise<void> {
  if (!supabase) return;
  for (const t of APPEND_ONLY) {
    const seen = knownSet(t.table);
    const fresh = (s[t.field] as { id: string; studentId: string }[]).filter((r) => r.studentId === uid && UUID.test(r.id) && !seen.has(r.id));
    for (let i = 0; i < fresh.length; i += 200) {
      const chunk = fresh.slice(i, i + 200);
      // Ajout sans écraser : renvoyer une ligne déjà connue du serveur ne fait rien.
      const { error } = await supabase.from(t.table).upsert(chunk.map((r) => (t.toRow as (x: unknown) => Row)(r)), { onConflict: "id", ignoreDuplicates: true });
      if (error) { console.warn(`${t.table} non enregistré :`, error.message); break; } // on réessaiera plus tard
      chunk.forEach((r) => seen.add(r.id));
    }
  }
}

async function pushExams(s: State, uid: string): Promise<void> {
  if (!supabase) return;
  for (const x of s.exams) {
    if (x.studentId !== uid || !UUID.test(x.id)) continue;
    const row = examRow(x);
    const sig = JSON.stringify(row);
    if (signatures.get(`exams|${x.id}`) === sig) continue;
    const { error } = await supabase.from("exams").upsert(row, { onConflict: "id" });
    if (error) { console.warn("Épreuve non enregistrée :", error.message); continue; }
    signatures.set(`exams|${x.id}`, sig);
  }
}

async function pushMemory(s: State, uid: string): Promise<void> {
  if (!supabase) return;
  const fresh: { sig: string; id: string; row: Row }[] = [];
  for (const m of Object.values(s.memory ?? {})) {
    if (m.studentId !== uid) continue;
    const row = memRow(m);
    const sig = JSON.stringify(row);
    if (signatures.get(`mem|${memKey(m)}`) !== sig) fresh.push({ sig, id: memKey(m), row });
  }
  for (let i = 0; i < fresh.length; i += 200) {
    const chunk = fresh.slice(i, i + 200);
    const { error } = await supabase.from("mem_items").upsert(chunk.map((c) => c.row), { onConflict: "student_id,key" });
    if (error) { console.warn("Révisions non enregistrées :", error.message); break; }
    chunk.forEach((c) => signatures.set(`mem|${c.id}`, c.sig));
  }
}

/** Cours validés : écrits par l'administrateur seulement (règle de la base). */
async function pushValidated(s: State, uid: string): Promise<void> {
  if (!supabase) return;
  const now = Object.keys(s.validated ?? {});
  const add = now.filter((id) => !knownValidated.has(id));
  const del = [...knownValidated].filter((id) => !(s.validated ?? {})[id]);
  if (add.length) {
    const { error } = await supabase.from("validated_lessons").upsert(add.map((id) => ({ notion_id: id, validated_at: iso(s.validated[id]), validated_by: uid })), { onConflict: "notion_id" });
    if (error) console.warn("Cours validés non enregistrés :", error.message); else add.forEach((id) => knownValidated.add(id));
  }
  if (del.length) {
    const { error } = await supabase.from("validated_lessons").delete().in("notion_id", del);
    if (error) console.warn("Validation non retirée :", error.message); else del.forEach((id) => knownValidated.delete(id));
  }
}

/** Envoie ce que le serveur ne connaît pas encore. Sans effet pour un parent, ou pendant un aperçu administrateur. */
export function flushProgress(): Promise<void> {
  if (!supabase) return Promise.resolve();
  if (flushing) { flushAgain = true; return flushing; }
  const s = getState();
  const me = s.users.find((u) => u.id === s.sessionId);
  if (!me || s.previewBackup) return Promise.resolve();
  const run = async () => {
    try {
      if (me.role === "student") { await pushAppendOnly(s, me.id); await pushExams(s, me.id); await pushMemory(s, me.id); }
      if (me.role === "admin") await pushValidated(s, me.id);
    } finally {
      flushing = null;
      if (flushAgain) { flushAgain = false; void flushProgress(); }
    }
  };
  flushing = run();
  return flushing;
}

// ---------- Réception ----------
const PAGE = 1000;
const MAX_PAGES = 10;

async function fetchAll(table: string, studentIds: string[], order: string): Promise<Row[]> {
  if (!supabase) return [];
  const out: Row[] = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    const { data, error } = await supabase.from(table).select("*").in("student_id", studentIds).order(order, { ascending: false }).range(p * PAGE, p * PAGE + PAGE - 1);
    if (error) { console.warn(`${table} non chargé :`, error.message); return out; }
    out.push(...(data ?? []));
    if ((data ?? []).length < PAGE) break;
  }
  return out;
}

/** Charge la progression de l'élève connecté, ou celle des enfants du parent. À appeler après le chargement des profils. */
export async function pullProgress(): Promise<void> {
  if (!supabase) return;
  const s = getState();
  const me = s.users.find((u) => u.id === s.sessionId);
  if (!me || s.previewBackup) return;
  const { data: vl } = await supabase.from("validated_lessons").select("notion_id, validated_at");
  if (vl) {
    knownValidated = new Set(vl.map((v: Row) => v.notion_id as string));
    update((st) => ({ ...st, validated: Object.fromEntries(vl.map((v: Row) => [v.notion_id as string, ms(v.validated_at as string)!])) }));
  }
  if (me.role === "admin") return;
  const studentIds = me.role === "student" ? [me.id] : s.users.filter((u) => u.parentId === me.id).map((u) => u.id);
  if (!studentIds.length) return;

  const [append, exams, mem] = await Promise.all([
    Promise.all(APPEND_ONLY.map((t) => fetchAll(t.table, studentIds, "ts"))),
    fetchAll("exams", studentIds, "started_at"),
    fetchAll("mem_items", studentIds, "last"),
  ]);

  update((st) => {
    const next: State = { ...st };
    APPEND_ONLY.forEach((t, i) => {
      const server = append[i].map((r) => (t.fromRow as (x: Row) => { id: string; studentId: string })(r));
      (next as unknown as Record<string, unknown>)[t.field] = mergeRows(st[t.field] as { id: string; studentId: string }[], server, studentIds);
    });
    const serverExams = exams.map(examFrom);
    next.exams = mergeRows(st.exams, serverExams, studentIds);
    serverExams.forEach((x) => signatures.set(`exams|${x.id}`, JSON.stringify(examRow(x))));
    const memory = { ...(st.memory ?? {}) };
    for (const r of mem) { const m = memFrom(r); memory[`${m.studentId}|${m.key}`] = m; signatures.set(`mem|${memKey(m)}`, JSON.stringify(memRow(m))); }
    next.memory = memory;
    markKnown(next, studentIds);
    return next;
  });
}

/** Oublie le suivi (déconnexion, changement de compte). */
export function resetProgressTracking() {
  for (const k of Object.keys(known)) delete known[k];
  signatures.clear();
  knownValidated = new Set();
}

// ---------- Déclencheurs ----------
let timer: ReturnType<typeof setTimeout> | undefined;
let started = false;

/** À appeler une fois au démarrage. */
export function startProgressSync() {
  if (!supabaseReady || started) return;
  started = true;
  setBeforeLogout(async () => { clearTimeout(timer); await flushProgress(); });
  subscribe(() => { clearTimeout(timer); timer = setTimeout(() => void flushProgress(), 800); });
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => void flushProgress());
  // Retour hors ligne et suivi côté parent : on renvoie ce qui attend, puis le parent recharge la progression de ses enfants.
  const tick = () => {
    if (document.visibilityState !== "visible") return;
    void flushProgress();
    const s = getState();
    if (s.users.find((u) => u.id === s.sessionId)?.role === "parent") void pullProgress();
  };
  setInterval(tick, 60_000);
  document.addEventListener("visibilitychange", tick);
}
