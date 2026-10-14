// Recherche d'une notion : par titre, chapitre, compétence, mot-clé ou propriété (accents et majuscules ignorés).
import { levelById, Notion, NOTIONS, SUBJECT_LABEL } from "../curriculum";
import { templatesFor } from "../content/core";
import { PROPRIETES_CIAM } from "../content/proprietes-ciam";
import { PROPRIETES_CI } from "../content/cours-ci";

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export interface SkillHit {
  notion: Notion;
  templateId: string;
  label: string;
  ref?: string;
}
export interface PropHit {
  notion: Notion;
  titre: string;
  enonce: string;
  page?: string;
}
export interface SearchResult {
  /** Notions concernées, de la plus pertinente à la moins pertinente. */
  notions: Notion[];
  skills: SkillHit[];
  props: PropHit[];
}

interface Entry {
  notion: Notion;
  title: string;
  chapter: string;
  skills: { templateId: string; label: string; ref?: string; hay: string }[];
  props: { titre: string; enonce: string; page?: string; hay: string }[];
}

let INDEX: Entry[] | null = null;
function build(): Entry[] {
  const propsOf = (n: Notion) => {
    const ciam = (PROPRIETES_CIAM[n.level]?.chapitres ?? []).filter((c) => c.notionId === n.id).flatMap((c) => c.items);
    const rows = ciam.length
      ? ciam.map((p) => ({ titre: p.titre, enonce: p.enonce, page: p.page }))
      : Object.values(PROPRIETES_CI).flat().filter((c) => c.notionId === n.id).flatMap((c) => c.items.map((p) => ({ titre: p.titre, enonce: p.enonce, page: undefined as string | undefined })));
    return rows.map((p) => ({ ...p, hay: norm(`${p.titre} ${p.enonce}`) }));
  };
  return NOTIONS.map((notion) => ({
    notion,
    title: norm(notion.title),
    chapter: norm(`${notion.chapter} ${levelById(notion.level).label} ${SUBJECT_LABEL[notion.subject]}`),
    skills: templatesFor(notion.id).map((t) => ({
      templateId: t.id, label: t.skill ?? notion.title, ref: t.ref,
      hay: norm(`${t.skill ?? ""} ${(t.keywords ?? []).join(" ")}`),
    })),
    props: propsOf(notion),
  }));
}

/** Tous les mots de la requête doivent se retrouver (dans le titre, le chapitre, une compétence ou une propriété). */
export function searchAll(query: string): SearchResult {
  const tokens = norm(query).split(/\s+/).filter((t) => t.length >= 2);
  if (!tokens.length) return { notions: [], skills: [], props: [] };
  INDEX ??= build();
  const scored: { notion: Notion; score: number }[] = [];
  const skills: (SkillHit & { score: number })[] = [];
  const props: PropHit[] = [];

  for (const e of INDEX) {
    const skillsHay = e.skills.map((s) => s.hay).join(" ");
    const propsHay = e.props.map((p) => p.hay).join(" ");
    const all = `${e.title} ${e.chapter} ${skillsHay} ${propsHay}`;
    if (!tokens.every((t) => all.includes(t))) continue;
    let score = 0;
    for (const t of tokens) {
      if (e.title.includes(t)) score += 5;
      if (e.chapter.includes(t)) score += 2;
      if (skillsHay.includes(t)) score += 3;
      if (propsHay.includes(t)) score += 1;
    }
    scored.push({ notion: e.notion, score });

    for (const s of e.skills) {
      const h = `${s.hay} ${e.title}`;
      if (tokens.every((t) => h.includes(t))) skills.push({ notion: e.notion, templateId: s.templateId, label: s.label, ref: s.ref, score: tokens.filter((t) => s.hay.includes(t)).length });
    }
    for (const p of e.props) {
      if (tokens.every((t) => p.hay.includes(t) || e.title.includes(t))) props.push({ notion: e.notion, titre: p.titre, enonce: p.enonce, page: p.page });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  skills.sort((a, b) => b.score - a.score);
  return { notions: scored.map((x) => x.notion), skills: skills.map(({ score: _s, ...h }) => h), props };
}
