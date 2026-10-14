p = r'C:\Users\LENOVO\DeclickMath\src\content\ciam-3e-num.ts'
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, 1)
def block(start, end, new):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + s[j:]

# terme générique
rep("/** n = k²·m avec m sans facteur carré. */", '''/** Terme c·x^e écrit proprement (sans coefficient 1, avec signe). */
const term = (c: number, e: number, first = false) => {
  const body = e === 0 ? String(Math.abs(c)) : `${Math.abs(c) === 1 ? "" : Math.abs(c)}x${e === 1 ? "" : sup(e)}`;
  return first ? `${c < 0 ? "−" : ""}${body}` : ` ${c < 0 ? "−" : "+"} ${body}`;
};
/** n = k²·m avec m sans facteur carré. */''')

block('  mk("lit-polynome"', '  // ===== Chapitre 11', '''  mk("lit-polynome", "Calcul littéral", 2, { skill: "Polynômes : degré, coefficient, valeur numérique", ref: `${BOOK}, chap. 10 §3.1, ex. 3.a-3.b (p. 126) et ex. 11-13 (p. 129)`, kw: ["polynôme", "degré", "monôme", "coefficient", "valeur numérique"] }, (_c, r) => {
    const a = rnd(r) * int(r, 2, 9), b = rnd(r) * int(r, 2, 9), c = rnd(r) * int(r, 1, 9), x = rnd(r) * int(r, 1, 4);
    const t = int(r, 0, 1);
    if (t === 0) { const d = int(r, 3, 9); return { statement: `Quel est le degré du polynôme ${term(a, d, true)}${term(b, 1)}${term(c, 0)} ?`, answer: num(d), hints: H("Le degré est le plus grand exposant de x.", "On regarde chaque monôme.", `Le monôme de plus haut degré est ${term(a, d, true)}.`, "Lis l'exposant."), solution: `Le plus grand exposant de x est ${d} : degré ${d}.` }; }
    const v = a * x * x + b * x + c;
    return { statement: `Calcule la valeur numérique de ${term(a, 2, true)}${term(b, 1)}${term(c, 0)} pour x = ${par(x)}.`, answer: num(v), hints: H("On remplace x par sa valeur.", "Le carré est prioritaire.", `x² = ${x * x}.`, "Calcule chaque terme."), solution: `${a} × ${x * x} ${b * x < 0 ? "−" : "+"} ${Math.abs(b * x)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${v}.` };
  }, FR),

''')

rep('return { statement: `Réduis ${a}√${m} + ${b}√${m} − ${c}√${m}. Quel est le coefficient de √${m} dans le résultat ?`', 'return { statement: `Réduis ${rad(a, m)} + ${rad(b, m)} − ${rad(c, m)}. Quel est le coefficient de √${m} dans le résultat ?`')
rep('solution: `${a}√${m} + ${b}√${m} − ${c}√${m} = (${a} + ${b} − ${c})√${m} = ${s}√${m}.` };', 'solution: `${rad(a, m)} + ${rad(b, m)} − ${rad(c, m)} = (${a} + ${b} − ${c})√${m} = ${rad(s, m)}.` };')
rep("const a = int(r, 1, 6), b = int(r, 2, 6), c = int(r, 1, 6);\n    const s = a * 1 + b * 1 - c;", "const a = int(r, 2, 6), b = int(r, 2, 6), c = int(r, 2, 6);\n    const s = a + b - c;")

rep("const k1 = int(r, 2, 6), k2 = int(r, 2, 6);\n    const total = k1 + k2;", "let k1 = int(r, 2, 6), k2 = int(r, 2, 6);\n    if (k1 === k2) k2 = k1 + 1;\n    const total = k1 + k2;")

rep("const n = int(r, 1, 9), m = pick(r, [2, 3, 5, 7]);\n    const t = int(r, 0, 1);\n    if (t === 0) return { statement: `On écrit ${n}/√${m} sans radical au dénominateur sous la forme (k√${m})/${m}. Quelle est la valeur de k ?`", "const n = int(r, 2, 9), m = pick(r, [2, 3, 5, 7]);\n    const t = int(r, 0, 1);\n    if (t === 0) return { statement: `On écrit ${n}/√${m} sans radical au dénominateur sous la forme (k√${m})/${m}. Quelle est la valeur de k ?`")
rep("solution: `${n}/√${m} = ${n}√${m}/${m} : k = ${n}.` };", "solution: `${n}/√${m} = ${n}√${m}/${m} : k = ${n}.` };")

rep("Un carré a pour aire ${2 * a * a} cm². Sa diagonale mesure a√2... Quelle est la longueur de son côté ? Donne k tel que le côté vaut k√2 cm.", "Un carré a pour aire ${2 * a * a} cm². Son côté s'écrit k√2 cm. Quelle est la valeur de k ?")

# valeur absolue
block('  mk("eq-valeur-absolue"', '  mk("ineq-premier-degre"', '''  mk("eq-valeur-absolue", "Équations et inéquations dans ℝ", 3, { skill: "Équation |x − a| = b", ref: `${BOOK}, chap. 13 §1.3, ex. 1.c (p. 162) et ex. 3 (p. 167)`, kw: ["valeur absolue", "|x − a| = b", "distance", "deux solutions"] }, (_c, r) => {
    const a = rnd(r) * int(r, 1, 9), b = int(r, 1, 9);
    const wantBig = int(r, 0, 1) === 0;
    const form = a < 0 ? `|x + ${-a}|` : a === 0 ? "|x|" : `|x − ${a}|`;
    return { statement: `Résous l'équation ${form} = ${b}. Quelle est la ${wantBig ? "plus grande" : "plus petite"} solution ?`, answer: num(wantBig ? a + b : a - b), hints: H("|x − a| est la distance de x à a.", `On cherche les nombres dont la distance à ${n2(a)} est ${b}.`, `x = ${n2(a)} + ${b} ou x = ${n2(a)} − ${b}.`, "Choisis la bonne."), solution: `${form} = ${b} ⇔ x = ${n2(a + b)} ou x = ${n2(a - b)} : la ${wantBig ? "plus grande" : "plus petite"} est ${n2(wantBig ? a + b : a - b)}.` };
  }, FR),
''')

rep("const n = int(r, 3, 6);\n    return { statement: `Combien de nombres de deux chiffres distincts", "const n = int(r, 4, 8);\n    return { statement: `Combien de nombres de deux chiffres distincts")

# eq-premier-degre
rep("solution: `${lin(a, b)} = ${lin(c, d)} ⇒ ${lin(a - c, 0)} = ${d - b} ⇒ x = ${d - b} ÷ ${a - c < 0 ? `(−${c - a})` : a - c} = ${x}.` };\n  }, FR),\n  mk(\"eq-valeur-absolue\"", "solution: `${lin(a, b)} = ${lin(c, d)} ⇒ ${lin(a - c, 0)} = ${d - b}${Math.abs(a - c) === 1 ? \"\" : ` ⇒ x = ${d - b} ÷ ${a - c < 0 ? `(−${c - a})` : a - c}`} ⇒ x = ${n2(x)}.` };\n  }, FR),\n  mk(\"eq-valeur-absolue\"")
rep("solution: `${lin(a - c, 0)} ${lt ? \"<\" : \">\"} ${d - b} ⇔ x ${out} ${n2(x0)}${flip ? \" (division par un négatif : le sens change)\" : \"\"}.` };", "solution: `${lin(a - c, 0)} ${lt ? \"<\" : \">\"} ${d - b}${Math.abs(coef) === 1 && !flip ? \"\" : ` ⇔ x ${out} ${n2(x0)}${flip ? \" (division par un négatif : le sens change)\" : \"\"}`}.` };")

# sys
rep("`Résous le système  x + ${a === 1 ? \"\" : a}y = ${s} ;  ${c}x ${d < 0 ? \"−\" : \"+\"} ${Math.abs(d)}y = ${t}. Quelle est la valeur de ${askX ? \"x\" : \"y\"} ?`", "`Résous le système  x + ${a === 1 ? \"\" : a}y = ${s} ;  ${c}x + ${d}y = ${t}. Quelle est la valeur de ${askX ? \"x\" : \"y\"} ?`")
rep("Vérification : ${x} + ${a}×${par(y)} = ${s} ; ${c}×${par(x)} + ${d}×${par(y)} = ${t}.` };", "Vérification : ${n2(x)} + ${a === 1 ? \"\" : `${a} × `}${par(y)} = ${s} ; ${c} × ${par(x)} + ${d} × ${par(y)} = ${t}.` };")
rep("Vérification : ${a}×${par(x)} + ${b}×${par(y)} = ${s} ; ${c}×${par(x)} − ${d}×${par(y)} = ${t}.` };", "Vérification : ${a} × ${par(x)} + ${b} × ${par(y)} = ${s} ; ${c} × ${par(x)} − ${d} × ${par(y)} = ${t}.` };")

# aff-image
block('  mk("aff-image"', '  mk("aff-determiner"', '''  mk("aff-image", "Applications affines", 1, { skill: "Image et antécédent par une application affine", ref: `${BOOK}, chap. 15 §1.1, ex. 1.a (p. 187) et ex. 1-3 (p. 194)`, kw: ["application affine", "image", "antécédent", "f(x) = ax + b"] }, (c, r) => {
    if (c === "situation") {
      const a = int(r, 2, 9) * 100, b = int(r, 1, 9) * 1000, x = int(r, 2, 9);
      return { statement: `Une location coûte ${f(b)} F de forfait plus ${f(a)} F par jour. On note f(x) = ${f(a)}x + ${f(b)} le prix pour x jours. Combien coûtent ${x} jours (en F) ?`, answer: num(a * x + b), hints: H("L'image de x est f(x).", "On remplace x par le nombre de jours.", `${f(a)} × ${x} + ${f(b)}.`, "Calcule."), solution: `f(${x}) = ${f(a)} × ${x} + ${f(b)} = ${f(a * x + b)} F.` };
    }
    const a = rnd(r) * int(r, 2, 6), b = rnd(r) * int(r, 1, 10), x = rnd(r) * int(r, 1, 8);
    if (int(r, 0, 1) === 0) return { statement: `f est l'application affine f(x) = ${lin(a, b)}. Calcule f(${n2(x)}).`, answer: num(a * x + b), hints: H("L'image de x est f(x).", "On remplace x par sa valeur.", "Calcule a × x puis ajoute b.", "Fais attention aux signes."), solution: `f(${n2(x)}) = ${a} × ${par(x)} + ${par(b)} = ${a * x + b}.` };
    const y = a * x + b;
    return { statement: `f(x) = ${lin(a, b)}. Quel est le nombre qui a pour image ${n2(y)} par f ?`, answer: num(x), hints: H("On cherche l'antécédent de " + n2(y) + ".", `On résout f(x) = ${n2(y)}.`, `${lin(a, b)} = ${n2(y)}.`, "Isole x."), solution: `${lin(a, b)} = ${n2(y)} ⇒ ${lin(a, 0)} = ${y - b} ⇒ x = ${n2(x)}.` };
  }, SIT),
''')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
