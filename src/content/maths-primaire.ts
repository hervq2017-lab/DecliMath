import { ContextDef, fcfa, fr, GENERIC_CTX, int, N, num, pick, register, round, Rng, scene, Template, Instance } from "./core";

const m = (level: Parameters<typeof N>[1], title: string) => N("maths", level, title);
const mk = (
  id: string, notionId: string, difficulty: 1 | 2 | 3,
  gen: (ctx: string, r: Rng) => Instance, contexts: ContextDef[] = GENERIC_CTX,
): Template => ({ id, notionId, difficulty, contexts, gen });

register(
  // ---- CI ----
  mk("m-ci-compter", m("ci", "Compter jusqu'à 20"), 1, (c, r) => {
    const s = scene(c, r), a = int(r, 6, 19);
    return {
      statement: `${s.who} range ${a} ${s.things} ${s.place}. Combien de ${s.things} y a-t-il ?`,
      answer: num(a),
      hints: ["On te demande le nombre total d'objets.", "Compte-les un par un, en pointant chacun du doigt.", "Dis la suite des nombres en touchant chaque objet une seule fois.", `Commence : 1, 2, 3 ... jusqu'à ${a}.`],
      solution: `Il y a ${a} ${s.things}.`,
    };
  }),
  mk("m-ci-add", m("ci", "Addition simple"), 1, (c, r) => {
    const s = scene(c, r), a = int(r, 2, 9), b = int(r, 1, 10);
    return {
      statement: `${s.who} a ${a} ${s.things}. On lui en donne ${b} de plus. Combien de ${s.things} y a-t-il maintenant ?`,
      answer: num(a + b),
      hints: ["On ajoute des objets à ceux qu'on a déjà.", "Quand on ajoute, le nombre devient plus grand : c'est une addition.", `Calcule ${a} + ${b}.`, `Pars de ${a} et compte ${b} de plus.`],
      solution: `${a} + ${b} = ${a + b}.`,
    };
  }),
  mk("m-ci-sub", m("ci", "Soustraction simple"), 1, (c, r) => {
    const s = scene(c, r), a = int(r, 8, 20), b = int(r, 1, a - 2);
    return {
      statement: `${s.who} a ${a} ${s.things}. ${s.who2} en prend ${b}. Combien en reste-t-il ?`,
      answer: num(a - b),
      hints: ["Quelqu'un en prend : il en reste moins.", "Quand on enlève, c'est une soustraction.", `Calcule ${a} − ${b}.`, `Pars de ${a} et recule de ${b}.`],
      solution: `${a} − ${b} = ${a - b}.`,
    };
  }),

  // ---- CP ----
  mk("m-cp-addp", m("cp", "Addition posée"), 1, (c, r) => {
    const s = scene(c, r), a = int(r, 120, 480), b = int(r, 130, 490);
    return {
      statement: `${s.who} a ${a} ${s.things} et ${s.who2} en a ${b}. Combien en ont-ils ensemble ?`,
      answer: num(a + b),
      hints: ["On cherche le total des deux tas.", "Ensemble = on additionne.", "Pose l'addition : unités sous unités, dizaines sous dizaines, centaines sous centaines.", `Commence par les unités : ${a % 10} + ${b % 10}.`],
      solution: `${a} + ${b} = ${a + b}.`,
    };
  }),
  mk("m-cp-subp", m("cp", "Soustraction posée"), 1, (c, r) => {
    const s = scene(c, r), a = int(r, 400, 900), b = int(r, 100, 399);
    return {
      statement: `${s.who} avait ${a} ${s.things} ${s.place}. ${s.who} en a vendu ${b}. Combien lui en reste-t-il ?`,
      answer: num(a - b),
      hints: ["On cherche ce qui reste après la vente.", "Reste = soustraction.", "Pose la soustraction en colonnes, en commençant par les unités.", `Unités : ${a % 10} − ${b % 10} (emprunte une dizaine si besoin).`],
      solution: `${a} − ${b} = ${a - b}.`,
    };
  }),
  mk("m-cp-tables", m("cp", "Tables de multiplication"), 1, (c, r) => {
    const s = scene(c, r), a = int(r, 2, 5), b = int(r, 2, 9);
    return {
      statement: `${s.who} prépare ${a} paquets de ${b} ${s.things}. Combien de ${s.things} cela fait-il en tout ?`,
      answer: num(a * b),
      hints: ["Il y a plusieurs paquets identiques.", "Des groupes égaux : pense à la multiplication.", `${a} paquets de ${b} : calcule ${a} × ${b}.`, `Additionne ${b} un nombre ${a} fois : ${Array(a).fill(b).join(" + ")}.`],
      solution: `${a} × ${b} = ${a * b}.`,
    };
  }),
  mk("m-cp-fcfa", m("cp", "Monnaie : le FCFA"), 2, (c, r) => {
    const s = scene(c, r), p = pick(r, [25, 50, 75, 100]), n = int(r, 2, 6), paid = pick(r, [500, 1000]);
    const cost = p * n;
    return {
      statement: `${s.who} achète ${n} ${s.things} à ${fcfa(p)} chacun(e) ${s.place}. ${s.who} donne ${fcfa(paid)}. Combien de FCFA le vendeur doit-il lui rendre ?`,
      answer: num(paid - cost, 0, "FCFA"),
      hints: ["Il faut d'abord savoir combien coûtent tous les achats, puis ce qui reste du billet.", "Prix total = nombre × prix d'un ; monnaie = argent donné − prix total.", `Calcule d'abord ${n} × ${p}, puis ${paid} − ce résultat.`, `${n} × ${p} = ${cost} FCFA.`],
      solution: `Prix total : ${n} × ${p} = ${cost} FCFA. Monnaie : ${paid} − ${cost} = ${paid - cost} FCFA.`,
    };
  }),

  // ---- CE1 ----
  mk("m-ce1-mult", m("ce1", "Multiplication"), 1, (c, r) => {
    const s = scene(c, r), a = int(r, 3, 9), b = int(r, 6, 12);
    return {
      statement: `Un commerçant ${s.place} range ses ${s.things} dans ${a} caisses de ${b} ${s.things}. Combien de ${s.things} a-t-il ?`,
      answer: num(a * b),
      hints: ["Les caisses contiennent chacune le même nombre d'objets.", "Groupes égaux : multiplication.", `Calcule ${a} × ${b}.`, `${b} × ${a} = ${b} × ${a - 1} + ${b}.`],
      solution: `${a} × ${b} = ${a * b}.`,
    };
  }),
  mk("m-ce1-div", m("ce1", "Division : le partage"), 1, (c, r) => {
    const s = scene(c, r), k = int(r, 3, 6), q = int(r, 3, 9);
    return {
      statement: `${s.who} partage ${k * q} ${s.things} en parts égales entre ${k} enfants. Combien de ${s.things} chaque enfant reçoit-il ?`,
      answer: num(q),
      hints: ["On distribue tout, avec la même quantité à chacun.", "Partage équitable : division.", `Cherche le nombre qui, multiplié par ${k}, donne ${k * q}.`, `Essaie ${k} × 3, ${k} × 4, ... jusqu'à ${k * q}.`],
      solution: `${k * q} ÷ ${k} = ${q}, car ${k} × ${q} = ${k * q}.`,
    };
  }),
  mk("m-ce1-perim", m("ce1", "Périmètre"), 2, (c, r) => {
    const L = int(r, 5, 15), l = int(r, 2, L - 1);
    const ctx = c === "ecole" ? "la cour de l'école" : c === "ferme" ? "l'enclos des chèvres" : c === "sport" ? "le terrain d'entraînement" : c === "gare" ? "le parking" : "le stand du marché";
    return {
      statement: `${ctx[0].toUpperCase() + ctx.slice(1)} est un rectangle de ${L} m de long et ${l} m de large. On veut mettre une clôture tout autour. Quelle longueur de clôture (en m) faut-il ?`,
      answer: num(2 * (L + l), 0, "m"),
      hints: ["La clôture fait le tour complet de la figure.", "Le tour d'un rectangle s'appelle le périmètre.", "Périmètre = 2 × (longueur + largeur).", `Calcule d'abord ${L} + ${l}.`],
      solution: `2 × (${L} + ${l}) = 2 × ${L + l} = ${2 * (L + l)} m.`,
    };
  }),

  // ---- CE2 ----
  mk("m-ce2-multp", m("ce2", "Multiplication posée"), 2, (c, r) => {
    const s = scene(c, r), a = int(r, 12, 48), b = int(r, 12, 39);
    return {
      statement: `${s.who} commande ${a} lots de ${b} ${s.things}. Combien de ${s.things} cela fait-il ?`,
      answer: num(a * b),
      hints: ["Beaucoup de lots identiques.", "Groupes égaux : multiplication, avec des nombres à deux chiffres.", `Pose ${a} × ${b} en décomposant : ${a} × ${b % 10} puis ${a} × ${Math.floor(b / 10) * 10}.`, `${a} × ${b % 10} = ${a * (b % 10)}.`],
      solution: `${a} × ${b} = ${a * (b % 10)} + ${a * Math.floor(b / 10) * 10} = ${a * b}.`,
    };
  }),
  mk("m-ce2-divp", m("ce2", "Division posée"), 2, (c, r) => {
    const s = scene(c, r), d = int(r, 3, 9), q = int(r, 12, 60), rem = int(r, 0, d - 1);
    const total = d * q + rem;
    return {
      statement: `${s.who} répartit ${total} ${s.things} en ${d} tas égaux. Combien y a-t-il de ${s.things} dans chaque tas (quotient entier) ?`,
      answer: num(q),
      hints: ["Les tas doivent être égaux ; un petit reste est possible.", "Partage équitable : division euclidienne.", `Cherche le plus grand multiple de ${d} qui ne dépasse pas ${total}.`, `Essaie ${d} × ${Math.floor(q / 10) * 10}.`],
      solution: `${total} = ${d} × ${q} + ${rem}. Chaque tas contient ${q} ${s.things}${rem ? ` (reste ${rem})` : ""}.`,
    };
  }),
  mk("m-ce2-frac", m("ce2", "Fractions simples"), 2, (c, r) => {
    const s = scene(c, r), den = pick(r, [2, 4, 5]), k = int(r, 3, 12), total = den * k;
    const name = den === 2 ? "la moitié" : den === 4 ? "le quart" : "le cinquième";
    return {
      statement: `${s.who} a ${total} ${s.things}. ${s.who} en donne ${name} (1/${den}) à ${s.who2}. Combien en donne-t-il ?`,
      answer: num(k),
      hints: ["On prend une partie égale du total.", `1/${den} signifie qu'on partage en ${den} parts égales et qu'on en prend une.`, `Divise ${total} par ${den}.`, `${total} ÷ ${den}.`],
      solution: `1/${den} de ${total} = ${total} ÷ ${den} = ${k}.`,
    };
  }),

  // ---- CM1 ----
  mk("m-cm1-dec", m("cm1", "Nombres décimaux"), 2, (c, r) => {
    const a = round(int(r, 12, 90) / 10, 1), b = round(int(r, 11, 80) / 10, 1);
    const obj = pick(r, c === "ecole" ? ["de ruban", "de tissu"] : ["de ficelle", "de tissu"]);
    return {
      statement: `Une couturière coupe ${fr(a)} m ${obj}, puis ${fr(b)} m du même rouleau. Combien de mètres a-t-elle coupés en tout ?`,
      answer: num(round(a + b, 1), 0.001, "m"),
      hints: ["On additionne deux longueurs décimales.", "Aligne les virgules l'une sous l'autre.", `Calcule ${fr(a)} + ${fr(b)}.`, `Additionne d'abord les dixièmes : ${Math.round(a * 10) % 10} + ${Math.round(b * 10) % 10}.`],
      solution: `${fr(a)} + ${fr(b)} = ${fr(round(a + b, 1))} m.`,
    };
  }),
  mk("m-cm1-prop", m("cm1", "Proportionnalité"), 2, (c, r) => {
    const s = scene(c, r), p = pick(r, [150, 200, 250, 300, 500]), n = int(r, 3, 8), k = int(r, 9, 15);
    return {
      statement: `${n} ${s.things} coûtent ${fcfa(p * n)} ${s.place}. Combien coûtent ${k} ${s.things} au même prix ?`,
      answer: num(p * k, 0, "FCFA"),
      hints: ["Le prix est proportionnel au nombre d'articles.", "Cherche d'abord le prix d'un seul article.", `Prix d'un : ${p * n} ÷ ${n}. Puis multiplie par ${k}.`, `Un article coûte ${p} FCFA.`],
      solution: `Un article : ${p * n} ÷ ${n} = ${p} FCFA. ${k} articles : ${p} × ${k} = ${p * k} FCFA.`,
    };
  }),
  mk("m-cm1-aire", m("cm1", "Aire du rectangle"), 2, (c, r) => {
    const L = int(r, 8, 30), l = int(r, 4, 20);
    const what = pick(r, ["un champ", "une salle de classe", "un terrain de volley", "une parcelle de manioc"]);
    return {
      statement: `${what[0].toUpperCase() + what.slice(1)} est un rectangle de ${L} m sur ${l} m. Quelle est son aire en m² ?`,
      answer: num(L * l, 0, "m²"),
      hints: ["L'aire mesure la surface couverte.", "Pour un rectangle, on multiplie les deux dimensions.", "Aire = longueur × largeur.", `Calcule ${L} × ${l}.`],
      solution: `Aire = ${L} × ${l} = ${L * l} m².`,
    };
  }),

  // ---- CM2 ----
  mk("m-cm2-pct", m("cm2", "Pourcentages simples"), 2, (c, r) => {
    const s = scene(c, r), pc = pick(r, [10, 20, 25, 50]), price = int(r, 4, 40) * 100;
    return {
      statement: `Un article ${s.place} coûte ${fcfa(price)}. Le vendeur fait une remise de ${pc} %. Quel est le montant de la remise ?`,
      answer: num((price * pc) / 100, 0, "FCFA"),
      hints: ["La remise est une partie du prix.", `${pc} % veut dire « ${pc} pour 100 ».`, `Calcule ${price} × ${pc} ÷ 100.`, pc === 50 ? "50 % = la moitié." : pc === 25 ? "25 % = le quart." : `${pc} % de ${price}.`],
      solution: `${price} × ${pc} ÷ 100 = ${(price * pc) / 100} FCFA.`,
    };
  }),
  mk("m-cm2-trois", m("cm2", "Règle de trois"), 2, (c, r) => {
    const a = int(r, 2, 6), b = int(r, 12, 30), k = int(r, 2, 5) * a;
    return {
      statement: `${a} machines produisent ${a * b} pièces par heure. Combien de pièces ${k} machines identiques produisent-elles par heure ?`,
      answer: num(k * b),
      hints: ["Plus de machines, plus de pièces : proportionnalité.", "Cherche ce que produit une seule machine.", `Une machine : ${a * b} ÷ ${a}. Puis × ${k}.`, `Une machine produit ${b} pièces par heure.`],
      solution: `1 machine : ${a * b} ÷ ${a} = ${b}. ${k} machines : ${b} × ${k} = ${k * b}.`,
    };
  }),
  mk("m-cm2-moy", m("cm2", "Moyenne"), 2, (_c, r) => {
    const n = 4, xs = Array.from({ length: n }, () => int(r, 8, 18));
    const sum = xs.reduce((x, y) => x + y, 0), mean = sum / n;
    const adj = round(mean, 2);
    return {
      statement: `Les notes de ${pick(r, ["Awa", "Moussa", "Yao", "Fatou"])} en mathématiques sont : ${xs.join(", ")}. Quelle est sa moyenne ?`,
      answer: num(adj, 0.01),
      hints: ["La moyenne répartit le total de façon égale.", "Additionne toutes les notes puis divise par leur nombre.", `Moyenne = (somme des notes) ÷ ${n}.`, `Somme : ${xs.join(" + ")} = ${sum}.`],
      solution: `${sum} ÷ ${n} = ${fr(adj)}.`,
    };
  }),
  mk("m-cm2-vitesse", m("cm2", "Vitesse, distance, temps"), 2, (c, r) => {
    const v = pick(r, [40, 50, 60, 80]), t = int(r, 2, 5);
    const veh = pick(r, ["Un car", "Un taxi-brousse", "Une moto", "Un camion"]);
    return {
      statement: `${veh} roule à vitesse constante de ${v} km/h pendant ${t} heures. Quelle distance parcourt-il ?`,
      answer: num(v * t, 0, "km"),
      hints: ["On cherche la distance parcourue.", "Distance = vitesse × temps.", `Calcule ${v} × ${t}.`, `En 1 heure : ${v} km.`],
      solution: `d = v × t = ${v} × ${t} = ${v * t} km.`,
    };
  }),
);
