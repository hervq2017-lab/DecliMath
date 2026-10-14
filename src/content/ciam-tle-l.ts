// CIAM Terminale Littéraire : assemblage. Les gabarits « série A1 » sont dupliqués en série A2 (mêmes notions, sauf primitives).
import { register, Template } from "./core";
import { notionById, nid } from "../curriculum";
import { TLA } from "./ciam-tle-l-a";
import { TLB } from "./ciam-tle-l-b";

const ALL: Template[] = [...TLA, ...TLB];

const toA2 = (t: Template): Template | null => {
  const n = notionById(t.notionId);
  const m = n && /^(.*) — série A1$/.exec(n.title);
  if (!m) return null;
  const id = nid("maths", "tle", `${m[1]} — série A2`);
  return notionById(id) ? { ...t, id: `${t.id}-a2`, notionId: id } : null;
};

register(...ALL, ...ALL.map(toA2).filter((x): x is Template => x !== null));
