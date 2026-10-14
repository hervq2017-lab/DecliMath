// Cartes mémoire : générées automatiquement à partir du contenu déjà présent dans l'application
// (propriétés des manuels, pièges et exemples des cours, verbes anglais). Aucune carte n'est écrite à la main.
import { PROPRIETES_CIAM } from "../content/proprietes-ciam";
import { PROPRIETES } from "../content/proprietes";
import { PROPRIETES_CI } from "../content/cours-ci";
import { LESSONS } from "../content/lessons";
import { irregularsUpTo, TIER_OF_LEVEL } from "../content/verbes";
import { LevelId, nid, notionById, NOTIONS, Subject } from "../curriculum";

export type CardKind = "propriete" | "piege" | "exemple" | "notion" | "verbe";
export interface Card {
  id: string;
  notionId: string;
  subject: Subject;
  level: LevelId;
  kind: CardKind;
  front: string;
  back: string;
}

export const CARD_KIND_LABEL: Record<CardKind, string> = {
  propriete: "Propriété", piege: "Piège à éviter", exemple: "Exemple résolu", notion: "Idée clé", verbe: "Verbe irrégulier",
};

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

const cache = new Map<LevelId, Card[]>();

/** Toutes les cartes d'une classe. Le résultat est mémorisé : les identifiants sont stables d'un affichage à l'autre. */
export function cardsForLevel(level: LevelId): Card[] {
  const hit = cache.get(level);
  if (hit) return hit;
  const out = new Map<string, Card>();
  const add = (c: Omit<Card, "id"> & { key: string }) => {
    const { key, ...rest } = c;
    const id = `c:${c.kind}:${c.notionId}:${slug(key)}`;
    if (!out.has(id) && rest.front.trim() && rest.back.trim()) out.set(id, { id, ...rest });
  };

  // 1. Propriétés : « Énonce la propriété … » → énoncé. On prend le manuel de la classe, sinon le programme.
  const ciam = PROPRIETES_CIAM[level]?.chapitres ?? [];
  if (ciam.length) {
    for (const ch of ciam) {
      const n = ch.notionId ? notionById(ch.notionId) : undefined;
      if (!n) continue;
      for (const p of ch.items) add({ key: p.titre, notionId: n.id, subject: n.subject, level, kind: "propriete", front: `Énonce la propriété : « ${p.titre} »`, back: p.enonce });
    }
  } else {
    const ci = Object.entries(PROPRIETES_CI).filter(([k]) => k === level || k.startsWith(`${level}-`)).flatMap(([, v]) => v);
    for (const ch of ci) {
      const n = notionById(ch.notionId);
      if (!n) continue;
      for (const p of ch.items) add({ key: p.titre, notionId: n.id, subject: n.subject, level, kind: "propriete", front: `Énonce la propriété : « ${p.titre} »`, back: p.enonce });
    }
    for (const ch of PROPRIETES[level] ?? []) {
      // sans identifiant de notion : on rattache au chapitre portant le même nom, sinon au premier chapitre de maths de la classe
      const n = NOTIONS.find((x) => x.level === level && x.subject === "maths" && (x.title === ch.chapitre || x.chapter === ch.chapitre))
        ?? NOTIONS.find((x) => x.level === level && x.subject === "maths");
      if (!n) continue;
      for (const p of ch.items) add({ key: p.titre, notionId: n.id, subject: n.subject, level, kind: "propriete", front: `Énonce la propriété : « ${p.titre} »`, back: p.enonce });
    }
  }

  // 2. Cours : idée clé, piège classique, exemple résolu (à refaire de tête avant de lire la solution).
  for (const l of LESSONS) {
    const n = notionById(l.notionId);
    if (!n || n.level !== level) continue;
    add({ key: "idee", notionId: n.id, subject: n.subject, level, kind: "notion", front: `Avec tes mots, que faut-il retenir sur « ${n.title} » ?`, back: l.intro });
    if (l.pitfalls.trim()) add({ key: "piege", notionId: n.id, subject: n.subject, level, kind: "piege", front: `Quelle erreur faut-il éviter avec « ${n.title} » ?`, back: l.pitfalls });
    add({ key: "exemple", notionId: n.id, subject: n.subject, level, kind: "exemple", front: l.example.problem, back: l.example.solution });
  }

  // 3. Anglais : verbes irréguliers de la classe (infinitif → prétérit + participe passé).
  const tier = TIER_OF_LEVEL[level];
  const verbNotion = tier ? nid("anglais", level, "Irregular verbs : forms") : "";
  const vn = verbNotion ? notionById(verbNotion) : undefined;
  if (vn && tier) {
    for (const v of irregularsUpTo(tier).filter((x) => x.tier === tier)) { // les verbes propres à la classe
      add({ key: v.inf, notionId: vn.id, subject: "anglais", level, kind: "verbe", front: `${v.inf} (${v.fr}) : past simple et participe passé ?`, back: `${v.past} — ${v.pp}` });
    }
  }

  const list = [...out.values()];
  cache.set(level, list);
  return list;
}

export const cardById = (id: string, level: LevelId) => cardsForLevel(level).find((c) => c.id === id);

// ---------- Rappel actif : comparer ce que l'élève a écrit à la réponse attendue ----------

const STOP = new Set(["dans", "avec", "pour", "sont", "elle", "elles", "leur", "leurs", "cette", "celui", "alors", "ainsi", "donc", "quand", "toute", "tous", "tout", "entre", "chaque", "mais", "comme", "plus", "moins", "faire", "sans"]);
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Mots-clés d'une réponse : mots de 4 lettres ou plus (hors mots outils), nombres et symboles de calcul. */
export function keywords(text: string): string[] {
  const words = norm(text).split(/[^a-z0-9²³√π+\-×÷=<>/]+/).filter(Boolean);
  const keep = words.filter((w) => (w.length >= 4 && !STOP.has(w)) || /\d|[²³√π=<>]/.test(w));
  return [...new Set(keep)];
}

/** Part des mots-clés de la réponse attendue que l'élève a retrouvés. */
export function recallOverlap(given: string, expected: string) {
  const want = keywords(expected);
  const g = norm(given);
  const found = want.filter((w) => g.includes(w));
  return { found, missing: want.filter((w) => !found.includes(w)), ratio: want.length ? found.length / want.length : 0 };
}
