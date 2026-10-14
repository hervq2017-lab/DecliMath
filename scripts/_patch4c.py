p = r'C:\Users\LENOVO\DeclickMath\src\content\ciam-4e-geo.ts'
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)
rep("Un arc de cercle mesure ${f(1)}/${d} du périmètre du cercle. Quelle est la mesure de l'angle au centre qui l'intercepte (en °) ?`.replace(\"1/\", \"1/\"),", "Un arc de cercle mesure 1/${d} du périmètre du cercle. Quelle est la mesure de l'angle au centre qui l'intercepte (en °) ?`,")
rep("[3, 6, 9, 12, 15, 21 / 2 * 2]", "[3, 6, 9, 12, 15, 21]")
rep("et les distances entre leurs centres vaut OO' = ${cs.d} cm.", "et la distance entre leurs centres est OO' = ${cs.d} cm.")
rep("import { ciam, f, H, Item, QCM, qcmOf, shuffle, sup } from \"./ciam-kit\";", "import { ciam, H, Item, QCM, qcmOf, shuffle, sup } from \"./ciam-kit\";")
open(p, 'w', encoding='utf-8').write(s)

p = r'C:\Users\LENOVO\DeclickMath\src\engine.ts'
s = open(p, encoding='utf-8').read()
rep('import "./content/ciam-4e-num";\n', 'import "./content/ciam-4e-num";\nimport "./content/ciam-4e-geo";\n')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
