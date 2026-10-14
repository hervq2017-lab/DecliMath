p = r'C:\Users\LENOVO\DeclickMath\src\content\ciam-4e-num.ts'
s = open(p, encoding='utf-8').read()

def rep(a, b):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, 1)

def block(start, end, new):
    global s
    a = s.index(start)
    b = s.index(end)
    s = s[:a] + new + s[b:]

block('  mk("lit-valeur"', '  mk("lit-somme-parentheses"', '''  mk("lit-valeur", "Calcul littéral", 1, { skill: "Calculer la valeur numérique d'une expression littérale", ref: `${BOOK}, chap. 10 §1, ex. 1.a-1.b (p. 131) et ex. 1-4 (p. 148)`, kw: ["valeur numérique", "expression littérale", "remplacer", "formule"] }, (c, r) => {
    const a = int(r, 2, 9), b = int(r, 1, 12);
    const x = c === "pur" ? rnd(r) * int(r, 1, 9) : int(r, 2, 9);
    const v = a * x + b;
    const X = x < 0 ? `(−${-x})` : String(x);
    return {
      statement: c === "pur" ? `Calcule la valeur de ${lin(a, b)} pour x = ${X}.` : `Un artisan facture ${b} F de déplacement plus ${a} F par heure de travail. Il travaille ${x} heures : quel est le prix à payer (valeur de ${lin(a, b)} pour x = ${x}), en F ?`,
      answer: num(v),
      hints: H("On remplace la lettre par sa valeur.", "Dans un produit, on écrit a x pour a × x.", `Remplace x par ${X}.`, `${a} × ${X} = ${a * x}.`),
      solution: `${a} × ${X} + ${b} = ${a * x} + ${b} = ${v}.`,
    };
  }, SIT),
''')

rep("const a = rnd(r) * int(r, 1, 8), b = int(r, 2, 9), c = rnd(r) * int(r, 1, 8), d = int(r, 2, 9);\n    const good = fz(a * c, b * d);",
    "let a = 1, b = 2, c = 1, d = 2;\n    do { a = rnd(r) * int(r, 1, 8); b = int(r, 2, 9); c = rnd(r) * int(r, 1, 8); d = int(r, 2, 9); } while (gcd(Math.abs(a), b) !== 1 || gcd(Math.abs(c), d) !== 1);\n    const good = fz(a * c, b * d);")
rep("const a = rnd(r) * int(r, 1, 7), b = int(r, 2, 9), c = rnd(r) * int(r, 1, 7), d = int(r, 2, 9);\n    const good = fz(a * d, b * c);",
    "let a = 1, b = 2, c = 1, d = 2;\n    do { a = rnd(r) * int(r, 1, 7); b = int(r, 2, 9); c = rnd(r) * int(r, 1, 7); d = int(r, 2, 9); } while (gcd(Math.abs(a), b) !== 1 || gcd(Math.abs(c), d) !== 1);\n    const good = fz(a * d, b * c);")

block('  mk("rat-inverse"', '  mk("rat-quotient"', '''  mk("rat-inverse", "Nombres rationnels", 2, { skill: "Inverse d'un nombre rationnel non nul", ref: `${BOOK}, chap. 11 §4.4, ex. 4.g (p. 152) et ex. 47-52 (p. 155)`, kw: ["inverse", "rationnel", "produit égal à 1"] }, (_c, r) => {
    let a = 0, b = 0;
    do { a = rnd(r) * int(r, 2, 13); b = int(r, 1, 11); } while (gcd(Math.abs(a), b) !== 1);
    const good = fz(b, a);
    return { statement: `Quel est l'inverse du nombre ${fz(a, b)} ?`, answer: choice(r, [good, ...withWrong(good, [fz(-b, a), fz(a, b), fz(-a, b), fz(b, b + Math.abs(a))])], 0), hints: H("Deux nombres inverses ont pour produit 1.", "L'inverse de a/b est b/a.", "Le signe est conservé.", `${fz(a, b)} × ${good} = 1.`), solution: `${fz(a, b)} × ${good} = 1 : l'inverse est ${good}.` };
  }, QCM),
''')

rep("const a = rnd(r) * int(r, 1, 5), b = int(r, 2, 6), n = int(r, 2, 3);\n    if (gcd(Math.abs(a), b) !== 1) return { statement: \"Calcule (−2/3)².\", answer: choice(r, [\"4/9\", \"−4/9\", \"−2/9\", \"4/3\"], 0), hints: H(\"Exposant pair : le résultat est positif.\", \"(a/b)ⁿ = aⁿ/bⁿ.\", \"(−2)² = 4.\", \"3² = 9.\"), solution: \"(−2/3)² = 4/9.\" };",
    "let a = 1, b = 2;\n    do { a = rnd(r) * int(r, 1, 5); b = int(r, 2, 6); } while (gcd(Math.abs(a), b) !== 1);\n    const n = int(r, 2, 3);")

block('  mk("rat-comparer"', '  mk("rat-somme"', '''  mk("rat-comparer", "Nombres rationnels", 2, { skill: "Comparer deux nombres rationnels", ref: `${BOOK}, chap. 11 §3.2, ex. 3.f (p. 150) et ex. 7-9, 26-30 (p. 154-155)`, kw: ["comparer", "rationnels", "fractions", "même dénominateur", "négatifs"] }, (_c, r) => {
    let a = 1, b = 1, d1 = 2, d2 = 2;
    do { d1 = int(r, 3, 9); d2 = int(r, 3, 9); a = rnd(r) * int(r, 1, d1 + 3); b = rnd(r) * int(r, 1, d2 + 3); } while (a * d2 === b * d1 || gcd(Math.abs(a), d1) !== 1 || gcd(Math.abs(b), d2) !== 1);
    const A = fz(a, d1), B = fz(b, d2);
    const rel = a * d2 < b * d1 ? "<" : ">";
    const L = d1 * d2;
    return { statement: `Compare ${A} et ${B}. Quelle écriture est correcte ?`, answer: choice(r, [`${A} < ${B}`, `${A} > ${B}`], rel === "<" ? 0 : 1), hints: H("On compare deux rationnels.", "Réduis-les au même dénominateur positif.", `${d1} × ${d2} = ${L} est un dénominateur commun.`, `${a} × ${d2} = ${a * d2} et ${b} × ${d1} = ${b * d1}.`), solution: `${A} = ${a * d2}/${L} et ${B} = ${b * d1}/${L} : ${A} ${rel} ${B}.` };
  }, QCM),
''')

rep("const a = rnd(r) * int(r, 1, d1 + 2), b = rnd(r) * int(r, 1, d2 + 2);\n    const L = lcm(d1, d2)",
    "let a = 1, b = 1;\n    do { a = rnd(r) * int(r, 1, d1 + 2); b = rnd(r) * int(r, 1, d2 + 2); } while (gcd(Math.abs(a), d1) !== 1 || gcd(Math.abs(b), d2) !== 1);\n    const L = lcm(d1, d2)")

block('  mk("eq-multiplicative"', '  mk("eq-deux-membres"', '''  mk("eq-multiplicative", "Équations et inéquations dans ℚ", 2, { skill: "Résoudre a x = b", ref: `${BOOK}, chap. 12 §1.5, ex. 1.c (p. 164-165) et ex. 19 (p. 174)`, kw: ["équation", "ax = b", "diviser", "inverse", "solution"] }, (c, r) => {
    const pos = c !== "pur";
    const a = (pos ? 1 : rnd(r)) * int(r, 2, 12), x = (pos ? 1 : rnd(r)) * int(r, 2, 12);
    const b = a * x;
    const A = a < 0 ? `(−${-a})` : String(a), B = b < 0 ? `(−${-b})` : String(b);
    return { statement: pos ? `${a} stylos identiques coûtent ${f(b)} F au total. En notant x le prix d'un stylo, on obtient ${a} x = ${f(b)}. Quel est le prix d'un stylo (en F) ?` : `Résous l'équation ${A} x = ${B}.`, answer: num(x), hints: H("On divise les deux membres par a.", "x = b ÷ a.", `${B} ÷ ${A}.`, "Règle des signes."), solution: `x = ${B} ÷ ${A} = ${x}.` };
  }, SIT),
  mk("eq-axb", "Équations et inéquations dans ℚ", 2, { skill: "Résoudre a x + b = c", ref: `${BOOK}, chap. 12 §1.6, ex. 1.d (p. 166) et ex. 20-22 (p. 174)`, kw: ["équation", "ax + b = c", "premier degré", "isoler x"] }, (c, r) => {
    const pos = c !== "pur";
    const a = int(r, 2, 9), x = (pos ? 1 : rnd(r)) * int(r, 1, 11), b = (pos ? 1 : rnd(r)) * int(r, 1, 20), cc = a * x + b;
    const B = b < 0 ? `(−${-b})` : String(b);
    return { statement: pos ? `Un taxi facture ${b} F de prise en charge et ${a} F par kilomètre. Le compteur affiche ${cc} F. En notant x le nombre de kilomètres, on a ${lin(a, b)} = ${cc}. Combien de kilomètres ont été parcourus ?` : `Résous l'équation ${lin(a, b)} = ${cc}.`, answer: num(x), hints: H("On isole x en deux étapes.", `Retire ${B} des deux membres.`, `${a}x = ${cc} − ${B} = ${cc - b}.`, `Divise par ${a}.`), solution: `${a}x = ${cc} − ${B} = ${cc - b} ; x = ${cc - b} ÷ ${a} = ${x}.` };
  }, SIT),
''')

rep("solution: `${lin(a, b)} = ${lin(c, d)} ⇒ ${a - c}x = ${d - b} ⇒ x = ${d - b} ÷ ${a - c} = ${x}.` };",
    "solution: `${lin(a, b)} = ${lin(c, d)} ⇒ ${lin(a - c, 0)} = ${d - b} ⇒ x = ${d - b} ÷ ${a - c < 0 ? `(−${c - a})` : a - c} = ${x}.` };")
rep("`${a - c}x ${b < 0 ? \"−\" : \"+\"} ${Math.abs(b)} = ${d}.`, `${a - c}x = ${d - b} ; divise par ${a - c}.`",
    "`${lin(a - c, b)} = ${d}.`, `${lin(a - c, 0)} = ${d - b} ; divise par ${a - c < 0 ? `(−${c - a})` : a - c}.`")

block('  mk("eq-mise-en-equation"', '  mk("ineq-regles"', '''  mk("eq-mise-en-equation", "Résolution de problèmes", 3, { skill: "Mettre un problème en équation puis le résoudre", ref: `${BOOK}, chap. 14 §3.1 (p. 201-202) et chap. 12, ex. 1-10 (p. 173)`, kw: ["problème", "mise en équation", "inconnue", "choisir l'inconnue"] }, (_c, r) => {
    const t = int(r, 0, 2);
    if (t === 0) { const x = int(r, 8, 40), d = int(r, 3, 20); return { statement: `Un cahier coûte x F. Trois cahiers et un stylo à ${d} F coûtent ensemble ${3 * x + d} F. L'équation est 3x + ${d} = ${3 * x + d}. Combien coûte un cahier (en F) ?`, answer: num(x), hints: H("L'inconnue x est le prix d'un cahier.", "Retire le prix du stylo.", `3x = ${3 * x + d} − ${d}.`, "Divise par 3."), solution: `3x + ${d} = ${3 * x + d} ⇒ 3x = ${3 * x} ⇒ x = ${x} F.` }; }
    if (t === 1) { const F = int(r, 5, 20), P = F * 3 + int(r, 0, 6); const y = P - 2 * F; return { statement: `Un père a ${P} ans et son fils ${F} ans. Dans y années, le père aura le double de l'âge de son fils : ${P} + y = 2(${F} + y). Résous cette équation : combien vaut y ?`, answer: num(y), hints: H("Dans y années, chacun a y ans de plus.", `Développe : 2(${F} + y) = ${2 * F} + 2y.`, `${P} + y = ${2 * F} + 2y.`, "Isole y."), solution: `${P} + y = ${2 * F} + 2y ⇒ y = ${P} − ${2 * F} = ${y}.` }; }
    const l = int(r, 3, 20), k = int(r, 2, 15), Pm = 2 * (2 * l + k);
    return { statement: `Un rectangle a pour largeur x cm et pour longueur (x + ${k}) cm. Son périmètre est ${Pm} cm : 2(x + x + ${k}) = ${Pm}. Combien vaut x ?`, answer: num(l), hints: H("On écrit le périmètre avec x.", `Divise par 2 : 2x + ${k} = ${Pm / 2}.`, `2x = ${Pm / 2} − ${k}.`, "Divise par 2."), solution: `2x + ${k} = ${Pm / 2} ⇒ 2x = ${2 * l} ⇒ x = ${l} cm.` };
  }, [{ id: "probleme", label: "Problème" }]),
''')

block('  mk("ineq-solutions"', '  mk("ineq-axb"', '''  mk("ineq-solutions", "Équations et inéquations dans ℚ", 2, { skill: "Inéquations x + a < b : trouver les solutions", ref: `${BOOK}, chap. 12 §2.4-2.5, ex. 2.b-2.d (p. 170) et ex. 25-30 (p. 175)`, kw: ["inéquation", "solutions", "x < u", "x + a > b", "ensemble des solutions"] }, (_c, r) => {
    const a = int(r, 2, 15), b = rnd(r) * int(r, 1, 20), lt = int(r, 0, 1) === 0;
    const u = b - a;
    const good = lt ? u - int(r, 1, 6) : u + int(r, 1, 6);
    const bads = [lt ? u + int(r, 1, 4) : u - int(r, 1, 4), u, lt ? u + int(r, 5, 9) : u - int(r, 5, 9)];
    const opts = [...new Set([good, ...bads])].map(n2);
    return { statement: `Parmi ces nombres, lequel est solution de l'inéquation x + ${a} ${lt ? "<" : ">"} ${n2(b)} ?`, answer: choice(r, opts, 0), hints: H("On transforme l'inéquation.", `Retire ${a} aux deux membres : x ${lt ? "<" : ">"} ${n2(u)}.`, `Les solutions sont les nombres strictement ${lt ? "plus petits" : "plus grands"} que ${n2(u)}.`, "Teste chaque nombre."), solution: `x + ${a} ${lt ? "<" : ">"} ${n2(b)} ⇔ x ${lt ? "<" : ">"} ${n2(u)}. ${n2(good)} convient ; ${n2(u)} ne convient pas (inégalité stricte).` };
  }, QCM),
''')

rep("const [p, q] = reduce(b, a);\n    const val = q === 1 ? String(p) : `${p}/${q}`;\n    const good = `x ${out} ${val.replace(\"-\", \"−\")}`;\n    const other = `x ${out === \"<\" ? \">\" : \"<\"} ${val.replace(\"-\", \"−\")}`;",
    "const val = fz(b, a);\n    const good = `x ${out} ${val}`;\n    const other = `x ${out === \"<\" ? \">\" : \"<\"} ${val}`;")
rep("solution: `${a} x ${sym} ${b} ⇔ x ${out} ${b}/${a} = ${val.replace(\"-\", \"−\")} ${flip ? \"(on divise par un négatif : le sens change)\" : \"\"}.` };",
    "solution: `${a < 0 ? `(−${-a})` : a} x ${sym} ${b < 0 ? `(−${-b})` : b} ⇔ x ${out} ${val}${flip ? \" (on divise par un nombre négatif : le sens change)\" : \"\"}.` };")

# approx puissances de 10
i0 = s.index('if (t === 0) { const p = int(r, 2, 9); return { statement: `Écris 0,')
i1 = s.index('if (t === 1) { const m = dec(r, 1, 9, 1), p = int(r, 2, 9);')
s = s[:i0] + 'if (t === 0) { const p = int(r, 2, 9); return { statement: `Écris 0,${"0".repeat(p - 1)}1 sous la forme 10^p. Quelle est la valeur de p ?`, answer: num(-p), hints: H("Compte les décimales.", "10⁻ⁿ = 1/10ⁿ = 0,00…1 avec n chiffres après la virgule.", `Il y a ${p} chiffres après la virgule.`, "L\'exposant est négatif."), solution: `0,${"0".repeat(p - 1)}1 = 10⁻${sup(p)} : p = ${-p}.` }; }\n    ' + s[i1:]
i0 = s.index('if (t === 2) { const m = dec(r, 1, 9, 1), p = int(r, 2, 8);')
i1 = s.index('const a = dec(r, 1, 9, 1), b = int(r, 2, 9), p = int(r, 2, 5), q = int(r, 2, 5);')
s = s[:i0] + 'if (t === 2) { const m = int(r, 1, 9), p = int(r, 2, 8); return { statement: `Écris ${m} × 10⁻${sup(p)} en écriture décimale. Combien de chiffres y a-t-il après la virgule ?`, answer: num(p), hints: H("Multiplier par 10⁻ᵖ décale la virgule de p rangs vers la gauche.", `${m} a la virgule juste après le chiffre ${m}.`, `On décale de ${p} rangs.`, `Le dernier chiffre est ${m}.`), solution: `${m} × 10⁻${sup(p)} = 0,${"0".repeat(p - 1)}${m} : ${p} chiffres après la virgule.` }; }\n    ' + s[i1:]

rep("const vals = [4, 5, 6, 7, 8].map((v) => v + int(r, 0, 3));",
    "const vals = [4, 5, 6, 7, 8].map((v, i) => v + i + int(r, 0, 1));")
open(p, 'w', encoding='utf-8').write(s)
print('4e ok')
