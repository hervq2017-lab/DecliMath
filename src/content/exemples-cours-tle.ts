// Exemples supplémentaires (résolus pas à pas) pour les cours de Terminale. Tous les résultats ont été recalculés.
// Clé = début de l'identifiant de notion ; l'exemple s'applique à `maths:tle:<clé>` et à `maths:tle:<clé>-serie-*`.
export interface Exemple { problem: string; solution: string }

export const EXEMPLES_TLE: Record<string, Exemple[]> = {
  "loi-binomiale": [
    { problem: "Un élève répond au hasard à 5 questions à 4 choix. Quelle est la probabilité d'avoir exactement 2 bonnes réponses ?", solution: "X suit B(5 ; 0,25). P(X = 2) = C(5,2) × 0,25² × 0,75³ = 10 × 0,0625 × 0,421875 ≈ 0,264." },
    { problem: "Un commerçant a 10 clients ; chacun achète avec la probabilité 0,3. Combien d'achats en moyenne ?", solution: "X suit B(10 ; 0,3), donc E(X) = n × p = 10 × 0,3 = 3 achats en moyenne." },
  ],
  "systemes-lineaires-dans-couples": [
    { problem: "Résoudre 2x + 3y = 13 et x + y = 5.", solution: "Substitution : x = 5 − y. Alors 2(5 − y) + 3y = 13, soit 10 + y = 13, donc y = 3 et x = 2. Vérification : 4 + 9 = 13." },
    { problem: "3 mangues et 2 ananas coûtent 1 700 FCFA ; 1 mangue et 2 ananas coûtent 1 100 FCFA. Prix de chaque fruit ?", solution: "On soustrait : 2 mangues = 600 FCFA, donc une mangue = 300 FCFA. Puis 2 ananas = 1 100 − 300 = 800, donc un ananas = 400 FCFA. Vérification : 900 + 800 = 1 700." },
  ],
  "etude-de-fonctions-polynomes-et-de-fonctions-rationnelles": [
    { problem: "Étudier f(x) = x² − 4x + 3.", solution: "f'(x) = 2x − 4 s'annule en x = 2 : f décroît sur ]−∞ ; 2] et croît sur [2 ; +∞[. Minimum f(2) = −1. Les racines sont 1 et 3." },
    { problem: "Étudier f(x) = x/(x − 1).", solution: "Domaine : ℝ privé de 1. f'(x) = ((x − 1) − x)/(x − 1)² = −1/(x − 1)² < 0 : f est décroissante sur chaque intervalle. Limites : f(x) → 1 en ±∞ (asymptote y = 1) et f(x) → ±∞ en 1 (asymptote x = 1)." },
  ],
  "primitives-et-calcul-integral": [
    { problem: "Calculer ∫₁³ (2x + 1) dx.", solution: "F(x) = x² + x. F(3) − F(1) = 12 − 2 = 10." },
    { problem: "Trouver la primitive F de f(x) = 6x² − 2x telle que F(1) = 3.", solution: "F(x) = 2x³ − x² + C. F(1) = 1 + C = 3, donc C = 2 et F(x) = 2x³ − x² + 2." },
  ],
  "fonction-logarithme-neperien": [
    { problem: "Simplifier ln 12 − ln 3.", solution: "ln 12 − ln 3 = ln(12/3) = ln 4 = 2 ln 2." },
    { problem: "Résoudre ln x + ln(x − 1) = ln 2.", solution: "Il faut x > 1. Alors ln(x(x − 1)) = ln 2, donc x² − x − 2 = 0, soit x = 2 ou x = −1. Seul x = 2 convient (x > 1)." },
  ],
  "fonction-exponentielle-neperienne": [
    { problem: "Résoudre e^(x + 1) = 4.", solution: "x + 1 = ln 4, donc x = ln 4 − 1 ≈ 0,39." },
    { problem: "Résoudre e^(−x) < 1/2.", solution: "−x < ln(1/2) = −ln 2 (exp est croissante, ln aussi). En changeant de signe : x > ln 2." },
  ],
  "suites-numeriques": [
    { problem: "On place 100 000 FCFA à 5 % par an (intérêts composés). Quelle somme après 3 ans ?", solution: "Suite géométrique de raison q = 1,05 : u₃ = 100 000 × 1,05³ = 100 000 × 1,157625 = 115 762,5 FCFA." },
    { problem: "Suite arithmétique de premier terme 2 et de raison 3. Calculer la somme des 20 premiers termes.", solution: "Dernier terme : 2 + 19 × 3 = 59. S = 20 × (2 + 59)/2 = 610." },
    { problem: "Limite de uₙ = 3 × (0,5)ⁿ ?", solution: "C'est une suite géométrique de raison 0,5 avec |0,5| < 1, donc (0,5)ⁿ → 0 et uₙ → 0." },
  ],
  "statistique-a-deux-variables": [
    { problem: "x : 1, 2, 3, 4, 5 et y : 2, 4, 5, 4, 5. Trouver la droite de régression de y en x, puis estimer y pour x = 6.", solution: "x̄ = 3, ȳ = 4. Σxy/5 = 66/5 = 13,2 donc cov = 13,2 − 3×4 = 1,2. V(x) = 55/5 − 9 = 2. a = 1,2/2 = 0,6 ; b = 4 − 0,6×3 = 2,2. Droite : y = 0,6x + 2,2. Pour x = 6 : y ≈ 5,8." },
  ],
  "statistiques-a-deux-variables": [
    { problem: "x : 1, 2, 3, 4, 5 et y : 2, 4, 5, 4, 5. Trouver la droite de régression de y en x, puis estimer y pour x = 6.", solution: "x̄ = 3, ȳ = 4. Σxy/5 = 66/5 = 13,2 donc cov = 13,2 − 3×4 = 1,2. V(x) = 55/5 − 9 = 2. a = 1,2/2 = 0,6 ; b = 4 − 0,6×3 = 2,2. Droite : y = 0,6x + 2,2. Pour x = 6 : y ≈ 5,8." },
  ],
  "probabilites": [
    { problem: "P(A) = 0,6 ; P(B | A) = 0,5 ; P(B | Ā) = 0,2. Calculer P(B).", solution: "Probabilité totale : P(B) = 0,6 × 0,5 + 0,4 × 0,2 = 0,30 + 0,08 = 0,38." },
    { problem: "Avec les données précédentes, calculer P(A | B).", solution: "P(A | B) = P(A ∩ B)/P(B) = 0,30/0,38 = 15/19 ≈ 0,79." },
  ],
  "nombres-complexes": [
    { problem: "z = 3 − 4i. Donner z̄, |z| et z × z̄.", solution: "z̄ = 3 + 4i ; |z| = √(9 + 16) = 5 ; z × z̄ = 9 + 16 = 25 = |z|²." },
    { problem: "Écrire 1 + i sous forme trigonométrique.", solution: "r = √(1 + 1) = √2 ; cos θ = sin θ = 1/√2, donc θ = π/4. 1 + i = √2 (cos π/4 + i sin π/4)." },
    { problem: "Écrire (1 + 2i)/(3 − i) sous la forme a + ib.", solution: "On multiplie par le conjugué : (1 + 2i)(3 + i)/10 = (3 + i + 6i + 2i²)/10 = (1 + 7i)/10 = 0,1 + 0,7i." },
  ],
  "limites-et-continuite": [
    { problem: "Calculer la limite de (x² − 1)/(x − 1) quand x → 1.", solution: "Forme 0/0. On factorise : x² − 1 = (x − 1)(x + 1), donc l'expression vaut x + 1 → 2." },
    { problem: "Calculer la limite de (x² + 1)/(2x² − 3) quand x → +∞.", solution: "On factorise x² : (1 + 1/x²)/(2 − 3/x²) → 1/2." },
  ],
  "derivabilite-et-etude-de-fonctions": [
    { problem: "Dériver f(x) = x²/(x + 1).", solution: "f'(x) = (2x(x + 1) − x²)/(x + 1)² = (x² + 2x)/(x + 1)²." },
    { problem: "Équation de la tangente à f(x) = x² au point d'abscisse 3 ?", solution: "f'(x) = 2x donc f'(3) = 6 et f(3) = 9. y = 6(x − 3) + 9 = 6x − 9." },
  ],
  "primitives": [
    { problem: "Primitive de f(x) = 2x/(x² + 1) ?", solution: "C'est de la forme u'/u avec u = x² + 1 > 0 : F(x) = ln(x² + 1) + C." },
    { problem: "Primitive de f(x) = e^(2x) ?", solution: "e^(2x) = (1/2) × 2e^(2x) = (1/2) u' e^u avec u = 2x : F(x) = (1/2) e^(2x) + C." },
  ],
  "fonctions-logarithmes": [
    { problem: "Dériver f(x) = ln(2x + 3) sur ]−3/2 ; +∞[.", solution: "f'(x) = u'/u = 2/(2x + 3)." },
    { problem: "Résoudre ln(2x − 4) ≤ 0.", solution: "Il faut 2x − 4 > 0, soit x > 2. Puis 2x − 4 ≤ e⁰ = 1, soit x ≤ 2,5. Solution : ]2 ; 2,5]." },
  ],
  "fonctions-exponentielles-et-fonctions-puissances": [
    { problem: "Dériver f(x) = 3ˣ.", solution: "3ˣ = e^(x ln 3), donc f'(x) = ln 3 × 3ˣ." },
    { problem: "Résoudre 2ˣ = 10.", solution: "x ln 2 = ln 10, donc x = ln 10/ln 2 ≈ 3,32." },
  ],
  "calcul-integral": [
    { problem: "Aire entre f(x) = x et g(x) = x² sur [0 ; 1] ?", solution: "Sur [0 ; 1], x ≥ x². Aire = ∫₀¹ (x − x²) dx = 1/2 − 1/3 = 1/6." },
    { problem: "Calculer ∫₀¹ x eˣ dx.", solution: "Intégration par parties avec u = x et v' = eˣ : [x eˣ]₀¹ − ∫₀¹ eˣ dx = e − (e − 1) = 1." },
    { problem: "Valeur moyenne de f(x) = x² sur [0 ; 3] ?", solution: "(1/3) ∫₀³ x² dx = (1/3) × 9 = 3." },
  ],
  "equations-differentielles": [
    { problem: "Résoudre y' = −3y avec y(0) = 2.", solution: "y = C e^(−3x) et y(0) = C = 2, donc y = 2e^(−3x)." },
    { problem: "Résoudre y' = 2y + 4 avec y(0) = 1.", solution: "Solution particulière constante : −b/a = −2. Donc y = C e^(2x) − 2. y(0) = C − 2 = 1, donc C = 3 et y = 3e^(2x) − 2." },
  ],
  "probabilite-conditionnelle-et-variable-aleatoire": [
    { problem: "X vaut 0, 1, 2 avec les probabilités 0,2 ; 0,5 ; 0,3. Calculer E(X) et V(X).", solution: "E(X) = 0,5 + 0,6 = 1,1. E(X²) = 0,5 + 1,2 = 1,7. V(X) = 1,7 − 1,1² = 1,7 − 1,21 = 0,49." },
    { problem: "P(A) = 0,3 et P(A ∩ B) = 0,12. Calculer P(B | A).", solution: "P(B | A) = P(A ∩ B)/P(A) = 0,12/0,3 = 0,4." },
  ],
  "barycentre-et-lignes-de-niveaux": [
    { problem: "G est le barycentre de (A, 2) et (B, 1). Où se trouve G ?", solution: "2 GA + GB = 0 donne AG = (1/3) AB : G est sur [AB], au tiers à partir de A (plus près du point le plus lourd)." },
    { problem: "Ensemble des points M tels que ‖2MA + MB‖ = 6.", solution: "2MA + MB = 3 MG avec G barycentre de (A, 2), (B, 1). Donc 3 MG = 6, MG = 2 : cercle de centre G et de rayon 2." },
  ],
  "coniques": [
    { problem: "Foyers de l'ellipse x²/25 + y²/9 = 1 ?", solution: "a = 5, b = 3, c = √(25 − 9) = 4. Foyers (±4 ; 0), excentricité e = c/a = 4/5 < 1." },
    { problem: "Foyers et asymptotes de x²/9 − y²/16 = 1 ?", solution: "c = √(9 + 16) = 5 : foyers (±5 ; 0). Asymptotes : y = ±(4/3)x." },
  ],
  "geometrie-analytique-dans-l-espace": [
    { problem: "Équation de la sphère de centre (1 ; 2 ; 3) et de rayon 2 ?", solution: "(x − 1)² + (y − 2)² + (z − 3)² = 4." },
    { problem: "Plan passant par A(1 ; 0 ; 2) de vecteur normal (1 ; 2 ; 3) ?", solution: "x + 2y + 3z + d = 0 avec A : 1 + 0 + 6 + d = 0, donc d = −7. Plan : x + 2y + 3z − 7 = 0." },
  ],
  "isometries-du-plan": [
    { problem: "On compose les symétries d'axes x = 1 puis x = 4. Quelle transformation obtient-on ?", solution: "Axes parallèles : c'est une translation de vecteur 2 × (distance entre axes) = 6, dans le sens perpendiculaire aux axes. Test : (0 ; 0) → (2 ; 0) → (6 ; 0)." },
    { problem: "Deux symétries d'axes sécants en O faisant un angle de 30°. Leur composée ?", solution: "C'est la rotation de centre O et d'angle 2 × 30° = 60°." },
  ],
  "similitudes-directes-du-plan": [
    { problem: "Nature de z' = (1 + i) z ?", solution: "a = 1 + i : |a| = √2, arg a = π/4. Le point fixe est O (b = 0). C'est la similitude de centre O, de rapport √2 et d'angle π/4." },
    { problem: "Nature de z' = 2z + 3 ?", solution: "a = 2 ≠ 1, centre ω = 3/(1 − 2) = −3. Vérification : 2(−3) + 3 = −3. C'est l'homothétie de centre −3 et de rapport 2." },
  ],
  "nombres-complexes-et-transformations-du-plan": [
    { problem: "Écriture complexe de la rotation de centre 1 et d'angle π/2. Image de z = 3 ?", solution: "z' − 1 = i(z − 1). Pour z = 3 : z' = 1 + 2i." },
    { problem: "Homothétie de centre i et de rapport 3 : image de 1 + i ?", solution: "z' − i = 3(z − i). Ici z − i = 1, donc z' = i + 3 = 3 + i." },
  ],
  "nombres-complexes-et-geometrie-du-plan": [
    { problem: "Écriture complexe de la rotation de centre 1 et d'angle π/2. Image de z = 3 ?", solution: "z' − 1 = i(z − 1). Pour z = 3 : z' = 1 + 2i." },
    { problem: "Homothétie de centre i et de rapport 3 : image de 1 + i ?", solution: "z' − i = 3(z − i). Ici z − i = 1, donc z' = i + 3 = 3 + i." },
  ],
  "divisibilite-dans": [
    { problem: "Dernier chiffre de 3¹⁰⁰ ?", solution: "3⁴ = 81 ≡ 1 [10]. Comme 100 = 4 × 25, 3¹⁰⁰ = (3⁴)²⁵ ≡ 1 [10]. Le dernier chiffre est 1." },
    { problem: "7 divise 3k. Que peut-on dire de k ?", solution: "7 est premier avec 3, donc d'après le théorème de Gauss, 7 divise k." },
  ],
  "ppcm-et-pgcd-de-deux-entiers-relatifs": [
    { problem: "PGCD et PPCM de 252 et 198 ?", solution: "252 = 198×1 + 54 ; 198 = 54×3 + 36 ; 54 = 36×1 + 18 ; 36 = 18×2 + 0. PGCD = 18. PPCM = 252 × 198/18 = 2 772." },
    { problem: "Deux bus partent ensemble à 6 h ; l'un toutes les 12 min, l'autre toutes les 18 min. Quand repartent-ils ensemble ?", solution: "Au bout du PPCM(12, 18) = 36 minutes, donc à 6 h 36." },
  ],
  "composees-de-transformations": [
    { problem: "f est la translation de vecteur (1 ; 0), g la symétrie centrale de centre O. Nature de g ∘ f ?", solution: "(x ; y) → (x + 1 ; y) → (−x − 1 ; −y). Point fixe : x = −1/2, y = 0. C'est la symétrie centrale de centre (−1/2 ; 0)." },
    { problem: "Avec les mêmes f et g, f ∘ g est-elle égale à g ∘ f ?", solution: "f ∘ g : (x ; y) → (−x ; −y) → (−x + 1 ; −y), symétrie de centre (1/2 ; 0). Différente de g ∘ f : l'ordre compte." },
  ],
};

export function exemplesTle(notionId: string): Exemple[] | undefined {
  const m = /^maths:tle:(.+)$/.exec(notionId);
  if (!m) return undefined;
  const slug = m[1];
  const key = Object.keys(EXEMPLES_TLE).find((k) => slug === k || slug.startsWith(`${k}-serie-`));
  return key ? EXEMPLES_TLE[key] : undefined;
}
