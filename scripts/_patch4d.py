p = r'C:\Users\LENOVO\DeclickMath\src\content\ciam-4e-geo.ts'
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)
rep("const L = round((2 * PI * R * ang) / 360, 4);", "const L = round((2 * PI * R * ang) / 360, 2);")
rep("Quelle est la longueur de l'arc intercepté par un angle au centre de ${ang}° (en cm, π ≈ 3,14) ?`", "Quelle est la longueur de l'arc intercepté par un angle au centre de ${ang}° (en cm, π ≈ 3,14, arrondie au centième) ?`")
rep("Quelle distance (en m) parcourt-on dans ce virage ? (π ≈ 3,14)`", "Quelle distance (en m) parcourt-on dans ce virage ? (π ≈ 3,14, arrondie au centième)`")
rep("arc = ${fr(round(2 * PI * R, 4))} × ${ang} ÷ 360 = ${fr(L)}.`", "arc = ${fr(round(2 * PI * R, 4))} × ${ang} ÷ 360 ≈ ${fr(L)}.`")
rep("Combien a-t-elle de ${what} ?`", "Combien a-t-elle ${what} ?`")
rep('const what = ["faces", "arêtes", "sommets"][q];\n    return { statement: `Une pyramide', 'const what = ["de faces", "d\'arêtes", "de sommets"][q];\n    return { statement: `Une pyramide')
# proj-calcul : k=1
a = s.index("    return { statement: `Un point A est à ${b} cm d'une droite (D).")
b = s.index("  }, CALC),", a)
s = s[:a] + "    const x = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9), y = (int(r, 0, 1) ? 1 : -1) * int(r, 1, 9);\n    const onI = int(r, 0, 1) === 0;\n    return { statement: `Dans un repère orthogonal (O, I, J), A a pour coordonnées (${x < 0 ? \"−\" : \"\"}${Math.abs(x)} ; ${y < 0 ? \"−\" : \"\"}${Math.abs(y)}). Quelle est ${onI ? \"l'abscisse\" : \"l'ordonnée\"} de son projeté orthogonal sur ${onI ? \"(OI)\" : \"(OJ)\"} ?`, answer: num(onI ? x : y), hints: H(\"Le projeté orthogonal de A sur un axe est le pied de la perpendiculaire à cet axe.\", onI ? \"Sur (OI), il garde l'abscisse de A.\" : \"Sur (OJ), il garde l'ordonnée de A.\", \"L'autre coordonnée est nulle sur l'axe.\", \"Recopie la bonne coordonnée.\"), solution: `Le projeté de A sur ${onI ? \"(OI)\" : \"(OJ)\"} a pour ${onI ? \"abscisse\" : \"ordonnée\"} ${onI ? x : y}.` };\n" + s[b:]
open(p, 'w', encoding='utf-8').write(s)

p = r'C:\Users\LENOVO\DeclickMath\src\content\proprietes-ciam.ts'
s = open(p, encoding='utf-8').read()
rep('import { LIVRE_5E } from "./proprietes-5e";', 'import { LIVRE_5E } from "./proprietes-5e";\nimport { LIVRE_4E } from "./proprietes-4e";')
rep('  "5e": LIVRE_5E,', '  "4e": LIVRE_4E,\n  "5e": LIVRE_5E,')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
