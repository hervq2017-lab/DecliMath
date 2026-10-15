// Test hors ligne de la synchronisation de la progression : conversions état local <-> base, fusion, identifiants UUID.
const mem = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };

const { uid } = await import("../src/store");
const P = await import("../src/lib/progressSync");

let fails = 0;
const ok = (c: boolean, m: string) => { console.log((c ? "OK   " : "ECHEC ") + m); if (!c) fails++; };
const canon = (v: unknown): unknown => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v as object).filter(([, x]) => x !== undefined).sort(([k], [l]) => k.localeCompare(l)).map(([k, x]) => [k, canon(x)])) : v;
const same = (a: unknown, b: unknown) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

ok(Array.from({ length: 200 }, uid).every((x) => UUID.test(x)), "uid() renvoie des UUID v4");
ok(new Set(Array.from({ length: 1000 }, uid)).size === 1000, "uid() sans doublon sur 1000 tirages");

const s = uid(), now = 1_760_000_000_000;
const a = { id: uid(), studentId: s, templateId: "t1", notionId: "n1", ctx: "ctx0", seed: 12345, correct: true, helpLevel: 2, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice" as const, near: true, given: "42", errTag: "signe", ts: now };
ok(same(P.attemptFrom(P.attemptRow(a) as any), a), "tentative : aller-retour identique");
const a2 = { ...a, id: uid(), near: undefined, given: undefined, errTag: undefined };
ok(same(P.attemptFrom(P.attemptRow(a2) as any), a2), "tentative sans champs facultatifs : aller-retour identique");
ok(P.attemptRow({ ...a, seed: 12.9 }).seed === 12, "graine décimale arrondie (colonne bigint)");

const e = { id: uid(), studentId: s, notionId: "n1", source: "carte" as const, score: 0.85, ts: now, errTag: "x", ref: "et:y" };
ok(same(P.evidenceFrom(P.evidenceRow(e) as any), e), "preuve : aller-retour identique");
ok(P.evidenceRow({ ...e, score: 1.4 }).score === 1 && P.evidenceRow({ ...e, score: -2 }).score === 0, "score borné entre 0 et 1 (contrainte de la base)");

const c = { id: uid(), studentId: s, notionId: "n1", passed: false, ts: now };
ok(same(P.checkFrom(P.checkRow(c) as any), c), "contrôle : aller-retour identique");
const b = { id: uid(), studentId: s, ts: now, items: [{ notionId: "n1", correct: true, fresh: false }] };
ok(same(P.bilanFrom(P.bilanRow(b) as any), b), "bilan : aller-retour identique");
const p = { id: uid(), studentId: s, ts: now, spec: { kind: "interro" as const, country: "BJ", level: "3e" as const, subject: "maths" as const, seed: 7 } };
ok(same(P.paperFrom(P.paperRow(p) as any), p), "sujet imprimé : aller-retour identique");

const x = { id: uid(), studentId: s, subject: "maths" as const, level: "3e" as const, kind: "level" as const, label: "Épreuve", startedAt: now, durationMin: 84, outOf: 20, items: [{ notionId: "n1", points: 2 }] as any, answers: { 0: "a", 3: "b" }, status: "done" as const, finishedAt: now + 5000, results: [true, false], score: 11.5 };
const xr = P.examFrom(P.examRow(x) as any);
ok(xr.status === "done" && xr.score === 11.5 && same(xr.results, [true, false]) && xr.answers[3] === "b" && xr.finishedAt === x.finishedAt, "épreuve terminée : aller-retour fidèle");
const run = { ...x, id: uid(), status: "running" as const, finishedAt: undefined, results: undefined, score: undefined };
const rr = P.examFrom(P.examRow(run) as any);
ok(rr.status === "running" && rr.finishedAt === undefined && rr.results === undefined && rr.score === undefined, "épreuve en cours : champs vides conservés");

const m = { key: "s:t1", studentId: s, notionId: "n1", due: now + 864e5, interval: 2.5, ease: 2.3, reps: 3, lapses: 1, last: now };
ok(same(P.memFrom(P.memRow(m) as any), m), "révision espacée : aller-retour identique");

// Fusion : le serveur fait foi, le local non envoyé est conservé, les autres élèves sont intouchés.
const other = uid();
const l1 = { id: "L1", studentId: s }, l2 = { id: "L2", studentId: s }, lo = { id: "LO", studentId: other };
const merged = P.mergeRows([l1, l2, lo], [{ id: "L1", studentId: s }, { id: "S9", studentId: s }], [s]);
ok(merged.map((r) => r.id).sort().join() === "L1,L2,LO,S9", "fusion : local non envoyé gardé, ligne serveur ajoutée, pas de doublon");
ok(P.mergeRows([lo], [], [s]).length === 1, "fusion : les données d'un autre compte ne sont pas touchées");

console.log(fails ? `\n${fails} échec(s)` : "\n0 échec(s)");
process.exit(fails ? 1 : 0);
