p = r'C:\Users\LENOVO\DeclickMath\src\content\ciam-3e-geo.ts'
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)
def block(start, end, new):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + s[j:]

block('  mk("thales-reciproque"', '  mk("thales-quatrieme"', '''  mk("thales-reciproque", "Propriétés de Thalès dans un triangle", 3, { skill: "Réciproque de Thalès : les droites sont-elles parallèles ?", ref: `${BOOK}, chap. 1 §1.2, ex. 1.b (p. 9-10) et ex. 2-3 (p. 17)`, kw: ["réciproque de thalès", "parallèles", "égalité des rapports", "même position"] }, (_c, r) => {
    const [p, q] = pick(r, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]]);
    const m = int(r, 1, 4), n = int(r, 1, 4);
    const AB = q * m, AM = p * m, AC = q * n;
    const par = int(r, 0, 1) === 0;
    const AN = par ? p * n : p * n + int(r, 1, 2);
    return { statement: `Dans le triangle ABC, M ∈ [AB] et N ∈ [AC] avec AB = ${AB}, AM = ${AM}, AC = ${AC}, AN = ${AN}. Les droites (MN) et (BC) sont-elles parallèles ?`, answer: choice(r, ["Oui", "Non"], par ? 0 : 1), hints: H("On compare les rapports AM/AB et AN/AC.", "Si les rapports sont égaux (et M, N placés dans le même ordre), les droites sont parallèles.", `AM × AC = ${AM * AC} et AN × AB = ${AN * AB}.`, "Compare."), solution: `AM × AC = ${AM * AC} ; AN × AB = ${AN * AB} : ${par ? "égaux, donc AM/AB = AN/AC et (MN) ∥ (BC)" : "différents, donc (MN) n'est pas parallèle à (BC)"}.` };
  }, QCM),
''')
rep("    const a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9);\n    const x = round((b * c) / a, 4);", "    let a = int(r, 2, 9), b = int(r, 2, 9);\n    const c = int(r, 2, 9);\n    if (a === b) b = a + 1;\n    const x = round((b * c) / a, 4);")
rep("    const t = int(r, 0, 1);\n    if (t === 0) return { statement: `Trois droites parallèles coupent deux sécantes.", "    const t = c === \"situation\" ? 1 : 0;\n    if (t === 0) return { statement: `Trois droites parallèles coupent deux sécantes.")
rep("}, (_c, r) => {\n    const k = pick(r, [2, 3, 5]), AB = int(r, 2, 8)", "}, (c, r) => {\n    const k = pick(r, [2, 3, 5]), AB = int(r, 2, 8)")
rep("`${x} × ${par(yp)} − ${par(xp)} × ${par(y)} = ${det} ${det === 0 ? \"= 0 : colinéaires\" : \"≠ 0 : non colinéaires\"}.`", "`${x} × ${par(yp)} − ${par(xp)} × ${par(y)} = ${det}${det === 0 ? \" : colinéaires\" : \" ≠ 0 : non colinéaires\"}.`")
rep("`${x} × ${par(xp)} + ${y} × ${par(yp)} = ${dot} ${dot === 0 ? \"= 0 : orthogonaux\" : \"≠ 0 : non orthogonaux\"}.`", "`${x} × ${par(xp)} + ${y} × ${par(yp)} = ${dot}${dot === 0 ? \" : orthogonaux\" : \" ≠ 0 : non orthogonaux\"}.`")
rep("`${p}×${par(x)} + ${par(q)}×${par(y)} + ${par(rr)} = ${v} ${v === 0 ? \"= 0 : oui\" : \"≠ 0 : non\"}.`", "`${p} × ${par(x)} + ${par(q)} × ${par(y)} + ${par(rr)} = ${v}${v === 0 ? \" : oui\" : \" ≠ 0 : non\"}.`")
# contextes FR
rep("Calcule." + "" if False else "solution: `Rapport ${k} ; ${[\"EF = \"", "solution: `Rapport ${k} ; ${[\"EF = \"")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
