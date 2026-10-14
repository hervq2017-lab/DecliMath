// Contrôle qualité des méthodes d'apprentissage : exercices pas à pas, cartes, suivi des connaissances, diagnostic d'erreurs.
// Chaque exercice pas à pas est recalculé par un vérificateur INDÉPENDANT (lecture de l'énoncé + calcul direct).
// Usage : npx esbuild scripts/check-methodes.ts --bundle --platform=node --format=esm --outfile=scripts/.mt.mjs && node scripts/.mt.mjs
import "../src/engine";
import { checkAnswer } from "../src/content/core";
import { diagnose } from "../src/content/erreurs";
import { checkStep, ETAPES, instancierEtape } from "../src/content/etapes";
import { notionById, LEVELS } from "../src/curriculum";
import { cardsForLevel, recallOverlap } from "../src/lib/cards";
import { attemptQuality, bktUpdate, BKT, DAY, nextReview, notionKnowledge, Obs } from "../src/lib/knowledge";

const SEEDS = 300;
let bad = 0, total = 0;
const fail = (id: string, seed: number | string, msg: string) => { bad++; if (bad <= 40) console.log("ÉCHEC", id, seed, "—", msg); };
const ok = (cond: boolean, id: string, seed: number | string, msg: string) => { total++; if (!cond) fail(id, seed, msg); };
const n = (t: string) => Number(t.replace("−", "-").replace(/[\s  ]/g, ""));
const val = (a: { kind: string; value?: number }) => (a.kind === "number" ? (a.value as number) : NaN);
const close = (x: number, y: number, tol = 1e-6) => Math.abs(x - y) <= tol;

// ---------- 1. Exercices pas à pas ----------
for (const e of ETAPES) {
  ok(!!notionById(e.notionId), e.id, "-", "notion inconnue " + e.notionId);
  for (let seed = 1; seed <= SEEDS; seed++) {
    const inst = instancierEtape(e, seed);
    const blob = JSON.stringify(inst);
    ok(!/NaN|undefined|\[object|Infinity|\+ -|− −|--/.test(blob), e.id, seed, "texte invalide : " + blob.match(/.{20}(NaN|undefined|\[object|Infinity|\+ -|− −|--).{20}/)?.[0]);
    ok(inst.steps.length >= 2, e.id, seed, "moins de 2 étapes");
    inst.steps.forEach((st, i) => {
      if (st.answer.kind === "number") ok(Number.isFinite(st.answer.value), e.id, seed, `étape ${i + 1} non finie`);
      // la bonne réponse doit être acceptée, chaque erreur typique refusée avec son message
      const good = st.answer.kind === "number" ? String(st.answer.value) : String(st.answer.index);
      ok(checkStep(st, good).ok, e.id, seed, `étape ${i + 1} : la bonne réponse est refusée`);
      for (const w of st.wrong ?? []) {
        if (st.answer.kind === "number" && close(w.value, st.answer.value, st.answer.tol + 1e-9)) continue; // coïncidence : la bonne réponse l'emporte
        const v = checkStep(st, String(w.value));
        ok(!v.ok && v.tag === w.tag, e.id, seed, `étape ${i + 1} : erreur typique mal reconnue (${w.value})`);
      }
      ok(st.hint.length > 3 && st.why.length > 10 && st.prompt.length > 10, e.id, seed, `étape ${i + 1} : texte pédagogique vide`);
    });
    // vérificateurs indépendants (lecture de l'énoncé)
    const S = inst.statement.replace(/−/g, "-");
    const step = (i: number) => val(inst.steps[i].answer);
    let m: RegExpMatchArray | null;
    switch (e.id) {
      case "et-equation-1":
        m = S.match(/(-?\d*)x ([+-]) (\d+) = (-?\d+)/);
        if (m) { const a = m[1] === "" ? 1 : n(m[1]), b = m[2] === "+" ? n(m[3]) : -n(m[3]), c = n(m[4]); ok(a * step(1) + b === c, e.id, seed, `x=${step(1)} ne vérifie pas l'équation`); } else fail(e.id, seed, "énoncé illisible");
        break;
      case "et-equation-2":
        m = S.match(/(\d*)x ([+-]) (\d+) = (\d*)x ([+-]) (\d+)/);
        if (m) { const a = m[1] === "" ? 1 : n(m[1]), b = (m[2] === "+" ? 1 : -1) * n(m[3]), c = m[4] === "" ? 1 : n(m[4]), d = (m[5] === "+" ? 1 : -1) * n(m[6]); const x = step(2); ok(a * x + b === c * x + d, e.id, seed, `x=${x} ne vérifie pas l'équation`); } else fail(e.id, seed, "énoncé illisible");
        break;
      case "et-systeme":
        m = S.match(/x \+ y = (\d+) et x - y = (-?\d+)/);
        if (m) { const x = step(1), y = step(2); ok(x + y === n(m[1]) && x - y === n(m[2]), e.id, seed, `(${x};${y}) ne vérifie pas le système`); } else fail(e.id, seed, "énoncé illisible");
        break;
      case "et-developper":
        m = S.match(/Développe \(?(-?\d+)\)?\((-?\d*)x ([+-]) (\d+)\).*x = (\d+)/);
        if (m) { const k = n(m[1]), a = m[2] === "" ? 1 : m[2] === "-" ? -1 : n(m[2]), b = (m[3] === "+" ? 1 : -1) * n(m[4]), x = n(m[5]); ok(step(2) === k * (a * x + b) && step(0) === k * a && step(1) === k * b, e.id, seed, "développement faux"); } else fail(e.id, seed, "énoncé illisible : " + S);
        break;
      case "et-pythagore-hyp":
        m = S.match(/AB = (\d+) cm et AC = (\d+) cm/);
        if (m) ok(close(Math.hypot(n(m[1]), n(m[2])), step(2)) && Number.isInteger(step(2)), e.id, seed, "hypoténuse fausse");
        break;
      case "et-pythagore-cote":
        m = S.match(/FG = (\d+) cm et EF = (\d+) cm/);
        if (m) ok(close(Math.sqrt(n(m[1]) ** 2 - n(m[2]) ** 2), step(2), 0.01), e.id, seed, "côté faux");
        break;
      case "et-fonction-affine":
        m = S.match(/f\((\d+)\) = (-?\d+) et f\((\d+)\) = (-?\d+)\. Calcule f\((\d+)\)/);
        if (m) { const [p, u, q, v, k] = m.slice(1).map(n); const a = (v - u) / (q - p), b = u - a * p; ok(close(step(3), a * k + b) && close(step(1), a) && close(step(2), b), e.id, seed, "fonction affine fausse"); } else fail(e.id, seed, "énoncé illisible");
        break;
      case "et-fractions-somme":
        m = S.match(/Calcule (\d+)\/(\d+) \+ (\d+)\/(\d+)/);
        if (m) ok(close(step(3), n(m[1]) / n(m[2]) + n(m[3]) / n(m[4])), e.id, seed, "somme de fractions fausse");
        break;
      case "et-remise":
        m = S.match(/coûte ([\d\s  ]+) FCFA.*fait (\d+) % de remise/);
        if (m) { const P = n(m[1]), p = n(m[2]); ok(close(step(1), P * (1 - p / 100)), e.id, seed, "prix final faux"); } else fail(e.id, seed, "énoncé illisible");
        break;
      case "et-rectangle":
        m = S.match(/mesure (\d+) m de long et (\d+) m de large/);
        if (m) { const L = n(m[1]), l = n(m[2]); ok(step(1) === 2 * (L + l) && step(2) === L * l, e.id, seed, "périmètre/aire faux"); } else fail(e.id, seed, "énoncé illisible");
        break;
      case "et-regle-de-trois":
        m = S.match(/(\d+) \S+( \S+)* coûtent ([\d\s  ]+) FCFA\. Combien coûtent (\d+)/);
        if (m) { const n1 = n(m[1]), T = n(m[3]), n2 = n(m[4]); ok(close(step(1), (T / n1) * n2), e.id, seed, "règle de trois fausse"); } else fail(e.id, seed, "énoncé illisible : " + S);
        break;
      case "et-second-degre": {
        m = inst.steps[0].prompt.replace(/−/g, "-").match(/a = (-?\d+), b = (-?\d+), c = (-?\d+)/);
        if (m) { const [a, b, c] = m.slice(1).map(n); for (const x of [step(2), step(3)]) ok(close(a * x * x + b * x + c, 0), e.id, seed, `x=${x} n'est pas solution`); ok(step(2) < step(3), e.id, seed, "racines mal ordonnées"); } else fail(e.id, seed, "énoncé illisible");
        break;
      }
      case "et-derivee-poly": {
        // f(x) = a x³ + b x² + c x + d ; on relit les coefficients dans l'énoncé
        const body = S.replace(/^Soit f\(x\) = /, "").replace(/\. Calcule.*$/, "");
        const terms = [...body.matchAll(/([+-]?)\s*(\d*)x?(³|²)?/g)].filter((t) => t[0].trim());
        let a = 0, b = 0, c = 0;
        for (const t of terms) {
          const sign = t[1] === "-" ? -1 : 1, mag = t[2] === "" ? 1 : n(t[2]);
          if (t[3] === "³") a = sign * mag; else if (t[3] === "²") b = sign * mag; else if (/x/.test(t[0])) c = sign * mag;
        }
        const k = Number(S.match(/f′\((\d+)\)/)?.[1] ?? S.match(/Calcule f′\((\d+)\)/)?.[1]);
        ok(step(0) === 3 * a && step(1) === 2 * b && step(2) === c && step(3) === 3 * a * k * k + 2 * b * k + c, e.id, seed, `dérivée fausse (a=${a} b=${b} c=${c} k=${k}) dans « ${S} »`);
        break;
      }
      case "et-inequation-negatif": {
        m = S.match(/-(\d+)x ([+-]) (\d+) ([<>]) (-?\d+)/);
        if (m) {
          const a = n(m[1]), b = (m[2] === "+" ? 1 : -1) * n(m[3]), sym = m[4], c = n(m[5]), x0 = step(1);
          const sol = inst.steps[2].answer;
          const side = sol.kind === "choice" ? sol.options[sol.index] : "";
          const holds = (x: number) => (sym === ">" ? -a * x + b > c : -a * x + b < c);
          const dir = side.startsWith("x <") ? -1 : 1;
          ok(close(x0, Number(side.replace(/^x [<>] /, "").replace("−", "-"))), e.id, seed, "borne incohérente");
          ok(holds(x0 + dir * 0.5) && !holds(x0 - dir * 0.5), e.id, seed, `sens faux : « ${S} » → « ${side} »`);
        } else fail(e.id, seed, "énoncé illisible : " + S);
        break;
      }
      case "et-derivee-produit":
        m = S.match(/\((-?\d*)x ([+-]) (\d+)\)·eˣ/);
        if (m) { const a = m[1] === "" ? 1 : m[1] === "-" ? -1 : n(m[1]), b = (m[2] === "+" ? 1 : -1) * n(m[3]); ok(step(2) === a + b, e.id, seed, "f′(0) faux"); } else fail(e.id, seed, "énoncé illisible : " + S);
        break;
    }
  }
}

// ---------- 2. Diagnostic d'erreurs ----------
const A = (v: number) => ({ kind: "number" as const, value: v, tol: 0 });
ok(diagnose(A(12), "12", "") === null, "diag", 1, "bonne réponse");
ok(diagnose(A(12), "-12", "") === "signe", "diag", 2, "signe");
ok(diagnose(A(12), "120", "") === "puissance-10", "diag", 3, "puissance 10");
ok(diagnose(A(12), "13", "") === "decalage-1", "diag", 4, "décalage");
ok(diagnose(A(4), "0,25", "") === "inverse", "diag", 5, "inverse");
ok(diagnose(A(12), "abc", "") === "illisible", "diag", 6, "illisible");
ok(diagnose(A(12), "37", "Il y a 37 élèves") === "operande", "diag", 7, "opérande");
ok(diagnose(A(100), "108", "") === "proche", "diag", 8, "proche");
ok(diagnose(A(100), "3", "") === "calcul", "diag", 9, "calcul");

// ---------- 3. Suivi bayésien et révisions espacées ----------
let p = BKT.init;
for (let i = 0; i < 6; i++) { const q = bktUpdate(p, 1); ok(q > p, "bkt", i, "une réussite doit faire monter P(connu)"); p = q; }
ok(p > 0.9, "bkt", "fin", `P(connu) après 6 réussites trop basse : ${p.toFixed(2)}`);
ok(bktUpdate(0.8, 0) < 0.8 + BKT.learn, "bkt", "echec", "un échec doit freiner");
ok(bktUpdate(0.5, 1) > bktUpdate(0.5, 0.55), "bkt", "aide", "une réussite sans aide doit peser plus qu'une réussite aidée");
let it = nextReview(undefined, 5, 0, { key: "k", studentId: "s", notionId: "n" });
const intervals = [it.interval];
let t = 0;
for (let i = 0; i < 4; i++) { t = it.due; it = nextReview(it, 5, t, { key: "k", studentId: "s", notionId: "n" }); intervals.push(it.interval); }
ok(intervals[0] === 1 && intervals[1] === 3 && intervals[2] >= 7 && intervals[3] > intervals[2] && intervals[4] > intervals[3], "sm2", "croissance", "intervalles 1, 3, puis croissants : " + intervals.join(","));
const lapse = nextReview(it, 1, it.due, { key: "k", studentId: "s", notionId: "n" });
ok(lapse.interval === 1 && lapse.reps === 0 && lapse.lapses === 1, "sm2", "lapse", "un échec ramène à demain");
const same = nextReview(it, 5, it.last + 1000, { key: "k", studentId: "s", notionId: "n" });
ok(same.interval === it.interval && same.reps === it.reps, "sm2", "meme-jour", "deux réussites le même jour ne comptent qu'une fois");
ok(attemptQuality({ correct: true, near: false, helpLevel: 0, solutionViewed: false }) === 5 && attemptQuality({ correct: false, near: true, helpLevel: 0, solutionViewed: false }) === 2, "sm2", "qualité", "qualité");

// niveaux de progression : il faut la durée, pas seulement le nombre d'essais
const mk = (ts: number, score: number, ctx = "pur"): Obs => ({ ts, notionId: "x", score, ctx, difficulty: 2 });
const day0 = Date.UTC(2026, 0, 1);
const quick = Array.from({ length: 8 }, (_, i) => mk(day0 + i * 60000, 1, i % 2 ? "pur" : "marche"));
ok(notionKnowledge(quick, "x", day0 + 1e6).level === 3, "niveaux", "rapide", "8 réussites le même jour = Avancé (pas Expert)");
const spaced = [...quick, mk(day0 + 2 * DAY, 1, "sport"), mk(day0 + 6 * DAY, 1, "pur"), mk(day0 + 15 * DAY, 1, "pur")];
ok(notionKnowledge(spaced, "x", day0 + 15 * DAY).level === 4, "niveaux", "espace", "des réussites espacées donnent Expert");
ok(notionKnowledge([mk(day0, 0)], "x", day0).level === 1, "niveaux", "debut", "un premier essai = Débutant");
ok(notionKnowledge(spaced, "x", day0 + 400 * DAY).strength < notionKnowledge(spaced, "x", day0 + 15 * DAY).strength, "oubli", "decroit", "le souvenir s'estompe avec le temps");

// ---------- 4. Cartes mémoire ----------
let cardsTotal = 0;
for (const lv of LEVELS) {
  const cards = cardsForLevel(lv.id);
  cardsTotal += cards.length;
  const ids = new Set(cards.map((c) => c.id));
  ok(ids.size === cards.length, "cartes", lv.id, "identifiants en double");
  for (const c of cards) {
    ok(!!notionById(c.notionId), "cartes", lv.id, "notion inconnue " + c.notionId);
    ok(c.front.length > 5 && c.back.length > 2, "cartes", c.id, "carte vide");
  }
  console.log(`  ${lv.label.padEnd(14)} ${String(cards.length).padStart(4)} cartes`);
}
ok(cardsTotal > 200, "cartes", "total", "trop peu de cartes : " + cardsTotal);
const r1 = recallOverlap("Deux droites sécantes ont un seul point commun", "Deux droites sécantes ont un seul point commun.");
ok(r1.ratio === 1, "rappel", 1, "chevauchement total");
ok(recallOverlap("je ne sais pas", "Deux droites sécantes ont un seul point commun.").ratio < 0.3, "rappel", 2, "rien retrouvé");

console.log(`\n${ETAPES.length} exercices pas à pas × ${SEEDS} variantes, ${total} contrôles, ${bad} échec(s).`);
if (bad) process.exit(1);
// vérifie aussi que checkAnswer reste exporté (sécurité d'import)
void checkAnswer;
