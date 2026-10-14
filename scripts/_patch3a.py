p = r'C:\Users\LENOVO\DeclickMath\src\content\skeleton-ci.ts'
s = open(p, encoding='utf-8').read()
old = '''  "3e": {
    "Calculs algébriques": ["Calcul littéral", "Racines carrées", "Calcul numérique", "Équations et inéquations dans ℝ", "Équations et inéquations dans ℝ × ℝ (couples)"],
    "Fonctions": ["Applications affines"],
    "Organisation et traitement des données": ["Statistique"],
    "Géométrie du plan": ["Triangle rectangle", "Propriétés de Thalès dans un triangle", "Angles inscrits", "Vecteurs", "Coordonnées d'un vecteur", "Équations de droites"],
    "Géométrie de l'espace": ["Pyramides et cônes"],'''
new = '''  "3e": {
    "Calculs algébriques": ["Calcul littéral", "Racines carrées", "Calcul numérique", "Équations et inéquations dans ℝ", "Équations et inéquations dans ℝ × ℝ (couples)"],
    "Fonctions": ["Applications affines"],
    "Organisation et traitement des données": ["Statistique"],
    "Géométrie du plan": ["Triangle rectangle", "Propriétés de Thalès dans un triangle", "Triangles semblables", "Angles inscrits", "Vecteurs", "Coordonnées d'un vecteur", "Équations de droites", "Symétries et translations", "Rotation et homothétie"],
    "Géométrie de l'espace": ["Pyramides et cônes"],'''
assert old in s
s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)

p = r'C:\Users\LENOVO\DeclickMath\src\engine.ts'
s = open(p, encoding='utf-8').read()
s = s.replace('import "./content/ciam-4e-geo";\n', 'import "./content/ciam-4e-geo";\nimport "./content/ciam-3e-num";\n', 1)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
