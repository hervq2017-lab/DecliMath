p = r'C:\Users\LENOVO\DeclickMath\src\engine.ts'
s = open(p, encoding='utf-8').read()
s = s.replace('import "./content/ciam-3e-num";\n', 'import "./content/ciam-3e-num";\nimport "./content/ciam-3e-geo";\n', 1)
open(p, 'w', encoding='utf-8').write(s)

p = r'C:\Users\LENOVO\DeclickMath\src\content\ciam-3e-geo.ts'
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)
# trigo-calcul-cote: énoncé propre
a = s.index("    if (t === 0) return { statement: `ABC est rectangle en B avec BC")
b = s.index("    return { statement: `Dans un triangle rectangle d'hypoténuse ${hyp} cm, un angle aigu mesure ${ang}°. Quelle est la longueur du côté adjacent")
s = s[:a] + "    if (t === 0) return { statement: `Dans un triangle rectangle d'hypoténuse ${hyp} cm, un angle aigu mesure ${ang}°. Quelle est la longueur du côté opposé à cet angle (en cm, arrondie au centième) ?`, answer: num(round(hyp * cs[1], 2), 0.01), hints: H(\"Côté opposé et hypoténuse : on utilise le sinus.\", `sin ${ang}° = côté opposé / ${hyp}.`, `côté opposé = ${hyp} × sin ${ang}°.`, \"Calcule.\"), solution: `côté opposé = ${hyp} × sin ${ang}° ≈ ${fr(round(hyp * cs[1], 2))} cm.` };\n" + s[b:]
# angle-polygone-regulier : branche quadrilatère
a = s.index("    return { statement: `Dans un quadrilatère ABCD inscrit dans un cercle, mes Â")
b = s.index("  }, FR),", a)
s = s[:a] + "    const A0 = 60 + (5 * n) % 50;\n    return { statement: `Dans un quadrilatère ABCD inscrit dans un cercle, mes Â = ${A0}°. Quelle est la mesure de l'angle opposé Ĉ (en °) ?`, answer: num(180 - A0, 0.01, \"°\"), hints: H(\"Les angles opposés d'un quadrilatère inscrit sont supplémentaires.\", \"Â + Ĉ = 180°.\", `180 − ${A0}.`, \"Calcule.\"), solution: `Ĉ = 180° − ${A0}° = ${180 - A0}°.` };\n" + s[b:]
rep('solution: `V = ${a ** 3} ÷ 3 = ${fr(round(a ** 3 / 3, 2))}.${B ? "" : ""}` };', 'solution: `V = ${a ** 3} ÷ 3 = ${fr(round(a ** 3 / 3, 2))}.` };')
rep("    const B = int(r, 10, 60);\n    return { statement: `Un cube d'arête", "    return { statement: `Un cube d'arête")
rep("Une pyramide a pour base une face du cube et pour sommet un sommet opposé.", "Une pyramide a pour base une face du cube et pour sommet un sommet de la face opposée.")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
