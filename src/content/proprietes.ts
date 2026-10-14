// Rubrique « Propriétés » : l'essentiel à connaître par classe, de la 6ème à la Terminale.
// Rédigé pour DeclickMath (énoncés courts, notations usuelles). À faire relire par un enseignant du programme local.
import type { LevelId } from "../curriculum";

export interface Propriete {
  titre: string;
  enonce: string;
}
export interface ChapitreProprietes {
  chapitre: string;
  items: Propriete[];
}

const P = (titre: string, enonce: string): Propriete => ({ titre, enonce });

export const PROPRIETES: Partial<Record<LevelId, ChapitreProprietes[]>> = {
  "6e": [
    { chapitre: "Nombres et opérations", items: [
      P("Critères de divisibilité", "Un nombre est divisible par 2 s'il finit par 0, 2, 4, 6, 8 ; par 5 s'il finit par 0 ou 5 ; par 3 (ou 9) si la somme de ses chiffres l'est ; par 10 s'il finit par 0."),
      P("Priorités opérationnelles", "On calcule d'abord les parenthèses, puis les multiplications et divisions, puis les additions et soustractions, de gauche à droite."),
      P("Division euclidienne", "a = b × q + r avec 0 ≤ r < b."),
    ] },
    { chapitre: "Fractions et décimaux", items: [
      P("Fractions égales", "a/b = (a × k)/(b × k) pour k ≠ 0 : on ne change pas une fraction en multipliant ou divisant haut et bas par le même nombre."),
      P("Fraction d'une quantité", "Prendre a/b d'une quantité Q, c'est calculer Q ÷ b × a."),
      P("Multiplier par 10, 100, 1000", "On décale la virgule de 1, 2 ou 3 rangs vers la droite."),
    ] },
    { chapitre: "Géométrie", items: [
      P("Périmètre et aire", "Rectangle : P = 2(L + l), A = L × l. Carré : P = 4c, A = c². Triangle : A = (base × hauteur)/2. Disque : A = π × r², cercle : P = 2πr."),
      P("Médiatrice", "La médiatrice d'un segment est la droite perpendiculaire en son milieu ; tout point de la médiatrice est à égale distance des extrémités."),
      P("Somme des angles d'un triangle", "La somme des mesures des angles d'un triangle est égale à 180°."),
    ] },
    { chapitre: "Proportionnalité", items: [
      P("Tableau de proportionnalité", "Deux grandeurs sont proportionnelles si on passe de l'une à l'autre en multipliant par un même nombre (coefficient)."),
      P("Pourcentage", "Prendre p % d'une quantité Q, c'est calculer Q × p/100."),
    ] },
  ],
  "5e": [
    { chapitre: "Nombres relatifs", items: [
      P("Addition", "Même signe : on additionne les distances à zéro et on garde le signe. Signes contraires : on soustrait les distances et on garde le signe de la plus grande."),
      P("Soustraction", "Soustraire un nombre revient à ajouter son opposé : a − b = a + (−b)."),
      P("Multiplication", "Le produit de deux nombres de même signe est positif, de signes contraires négatif."),
    ] },
    { chapitre: "Calcul littéral", items: [
      P("Distributivité", "k × (a + b) = k × a + k × b."),
      P("Réduction", "On regroupe les termes de même nature : 3x + 5x = 8x."),
    ] },
    { chapitre: "Géométrie", items: [
      P("Symétrie centrale", "Elle conserve les longueurs, les angles, les aires, le parallélisme ; l'image d'une droite est une droite parallèle."),
      P("Inégalité triangulaire", "Dans un triangle, chaque côté est inférieur à la somme des deux autres."),
      P("Parallélogramme", "Côtés opposés parallèles et égaux, diagonales de même milieu. Un quadrilatère dont les diagonales ont même milieu est un parallélogramme."),
      P("Aires et volumes", "Parallélogramme : A = base × hauteur. Trapèze : A = (B + b) × h / 2. Prisme droit : V = aire de la base × hauteur."),
    ] },
  ],
  "4e": [
    { chapitre: "Théorème de Pythagore", items: [
      P("Énoncé direct", "Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés : BC² = AB² + AC² (angle droit en A)."),
      P("Réciproque", "Si BC² = AB² + AC², alors le triangle ABC est rectangle en A."),
    ] },
    { chapitre: "Théorème de Thalès (4ème)", items: [
      P("Droite des milieux", "Dans un triangle, la droite qui passe par les milieux de deux côtés est parallèle au troisième côté, et le segment mesure la moitié de ce côté."),
    ] },
    { chapitre: "Cosinus", items: [
      P("Cosinus d'un angle aigu", "Dans un triangle rectangle : cos(angle) = côté adjacent / hypoténuse."),
    ] },
    { chapitre: "Calcul littéral et équations", items: [
      P("Développement", "(a + b)(c + d) = ac + ad + bc + bd."),
      P("Équation du 1er degré", "On peut ajouter, retrancher, multiplier ou diviser (par un nombre non nul) les deux membres par un même nombre sans changer les solutions."),
    ] },
    { chapitre: "Puissances", items: [
      P("Règles", "aᵐ × aⁿ = aᵐ⁺ⁿ ; aᵐ / aⁿ = aᵐ⁻ⁿ ; (aᵐ)ⁿ = aᵐⁿ ; a⁻ⁿ = 1/aⁿ ; a⁰ = 1 (a ≠ 0)."),
    ] },
  ],
  "3e": [
    { chapitre: "Racines carrées", items: [
      P("Produit et quotient", "√(a × b) = √a × √b ; √(a/b) = √a / √b (a ≥ 0, b > 0)."),
      P("Carré d'une racine", "(√a)² = a et √(a²) = |a|."),
    ] },
    { chapitre: "Identités remarquables", items: [
      P("Les trois identités", "(a + b)² = a² + 2ab + b² ; (a − b)² = a² − 2ab + b² ; (a + b)(a − b) = a² − b²."),
      P("Factorisation", "Un produit est nul si et seulement si l'un de ses facteurs est nul : A × B = 0 ⇔ A = 0 ou B = 0."),
    ] },
    { chapitre: "Théorème de Thalès", items: [
      P("Énoncé direct", "Si (BC) // (MN) avec M sur (AB) et N sur (AC), alors AM/AB = AN/AC = MN/BC."),
      P("Réciproque", "Si les rapports AM/AB et AN/AC sont égaux et que les points sont alignés dans le même ordre, alors (MN) // (BC)."),
    ] },
    { chapitre: "Trigonométrie", items: [
      P("Rapports", "sin = opposé / hypoténuse ; cos = adjacent / hypoténuse ; tan = opposé / adjacent."),
      P("Relations", "cos²x + sin²x = 1 ; tan x = sin x / cos x."),
    ] },
    { chapitre: "Fonctions linéaires et affines", items: [
      P("Fonction linéaire", "f(x) = ax ; représentée par une droite qui passe par l'origine, de coefficient directeur a."),
      P("Fonction affine", "f(x) = ax + b ; a = (f(x₂) − f(x₁))/(x₂ − x₁) et b = f(0)."),
    ] },
    { chapitre: "Systèmes et statistiques", items: [
      P("Système 2×2", "On résout par substitution ou par combinaison linéaire : on élimine une inconnue puis on remplace dans l'autre équation."),
      P("Moyenne", "Moyenne = (somme des valeurs) / (effectif total) ; moyenne pondérée : Σ(effectif × valeur) / Σ effectifs."),
    ] },
  ],
  "2nde": [
    { chapitre: "Calcul algébrique", items: [
      P("Valeur absolue", "|x| = x si x ≥ 0, −x si x < 0 ; |x| = a (a > 0) ⇔ x = a ou x = −a ; |x| ≤ a ⇔ −a ≤ x ≤ a."),
      P("Inégalités", "On ne change pas le sens en ajoutant un même nombre ; on le change si on multiplie ou divise par un nombre négatif."),
    ] },
    { chapitre: "Fonctions", items: [
      P("Parité", "f paire : f(−x) = f(x) (courbe symétrique par rapport à l'axe des ordonnées). f impaire : f(−x) = −f(x) (symétrique par rapport à l'origine)."),
      P("Sens de variation", "f est croissante sur I si x₁ < x₂ entraîne f(x₁) ≤ f(x₂) ; décroissante si f(x₁) ≥ f(x₂)."),
      P("Fonction du second degré", "f(x) = ax² + bx + c : sommet d'abscisse −b/(2a), axe de symétrie x = −b/(2a)."),
    ] },
    { chapitre: "Second degré", items: [
      P("Discriminant", "Δ = b² − 4ac. Si Δ > 0 : deux racines (−b ± √Δ)/(2a). Si Δ = 0 : une racine −b/(2a). Si Δ < 0 : pas de racine réelle."),
      P("Somme et produit", "Si x₁ et x₂ sont les racines : x₁ + x₂ = −b/a et x₁ × x₂ = c/a."),
      P("Signe du trinôme", "Le trinôme a le signe de a à l'extérieur des racines, le signe contraire entre les racines."),
    ] },
    { chapitre: "Géométrie plane et vecteurs", items: [
      P("Relation de Chasles", "AB + BC = AC (en vecteurs)."),
      P("Coordonnées", "Vecteur AB (xB − xA ; yB − yA) ; milieu I de [AB] : ((xA + xB)/2 ; (yA + yB)/2) ; AB = √((xB − xA)² + (yB − yA)²)."),
      P("Colinéarité", "Deux vecteurs u(x ; y) et v(x' ; y') sont colinéaires ⇔ xy' − x'y = 0."),
    ] },
    { chapitre: "Statistiques et probabilités", items: [
      P("Probabilité", "Pour des issues équiprobables : p(A) = nombre de cas favorables / nombre de cas possibles ; p(non A) = 1 − p(A)."),
      P("Union", "p(A ∪ B) = p(A) + p(B) − p(A ∩ B)."),
    ] },
  ],
  "1ere": [
    { chapitre: "Suites", items: [
      P("Suite arithmétique", "uₙ₊₁ = uₙ + r ; uₙ = u₀ + n r ; somme S = (nombre de termes) × (premier + dernier) / 2."),
      P("Suite géométrique", "uₙ₊₁ = q × uₙ ; uₙ = u₀ × qⁿ ; somme de 1 à qⁿ : (1 − qⁿ⁺¹)/(1 − q) pour q ≠ 1."),
    ] },
    { chapitre: "Dérivation", items: [
      P("Dérivées usuelles", "(c)' = 0 ; (x)' = 1 ; (xⁿ)' = n xⁿ⁻¹ ; (1/x)' = −1/x² ; (√x)' = 1/(2√x)."),
      P("Opérations", "(u + v)' = u' + v' ; (uv)' = u'v + uv' ; (u/v)' = (u'v − uv')/v² ; (k u)' = k u'."),
      P("Tangente", "Équation en a : y = f'(a)(x − a) + f(a)."),
      P("Variations", "Si f' > 0 sur I, f est croissante ; si f' < 0, f est décroissante."),
    ] },
    { chapitre: "Trigonométrie", items: [
      P("Formules", "cos(a + b) = cos a cos b − sin a sin b ; sin(a + b) = sin a cos b + cos a sin b ; cos 2a = cos²a − sin²a ; sin 2a = 2 sin a cos a."),
      P("Valeurs remarquables", "cos 0 = 1, cos π/6 = √3/2, cos π/4 = √2/2, cos π/3 = 1/2, cos π/2 = 0 ; sin 0 = 0, sin π/6 = 1/2, sin π/4 = √2/2, sin π/3 = √3/2, sin π/2 = 1."),
    ] },
    { chapitre: "Produit scalaire et géométrie", items: [
      P("Produit scalaire", "u · v = x x' + y y' = ‖u‖ ‖v‖ cos(u, v) ; u ⊥ v ⇔ u · v = 0."),
      P("Cercle", "Cercle de centre Ω(a ; b) et de rayon R : (x − a)² + (y − b)² = R²."),
      P("Distance à une droite", "d(M, ax + by + c = 0) = |a x_M + b y_M + c| / √(a² + b²)."),
    ] },
    { chapitre: "Dénombrement et probabilités", items: [
      P("Arrangements, combinaisons", "Aₙᵖ = n!/(n − p)! ; Cₙᵖ = n!/(p!(n − p)!) ; Cₙᵖ = Cₙⁿ⁻ᵖ."),
      P("Probabilité conditionnelle", "p(A | B) = p(A ∩ B)/p(B) ; formule des probabilités totales : p(B) = p(B ∩ A) + p(B ∩ non A)."),
    ] },
  ],
  tle: [
    { chapitre: "Limites et continuité", items: [
      P("Limites usuelles", "lim xⁿ en +∞ = +∞ ; lim 1/x en +∞ = 0 ; lim eˣ en +∞ = +∞ et en −∞ = 0 ; lim ln x en +∞ = +∞ et en 0⁺ = −∞."),
      P("Croissances comparées", "lim eˣ/xⁿ = +∞ ; lim (ln x)/x = 0 en +∞ ; lim x ln x = 0 en 0⁺."),
      P("Théorème des valeurs intermédiaires", "Si f est continue sur [a ; b] et k est compris entre f(a) et f(b), alors f(x) = k admet au moins une solution dans [a ; b] (une seule si f est strictement monotone)."),
    ] },
    { chapitre: "Dérivées et primitives", items: [
      P("Composée", "(f∘u)' = u' × f'(u) : (eᵘ)' = u' eᵘ ; (ln u)' = u'/u ; (uⁿ)' = n u' uⁿ⁻¹."),
      P("Primitives usuelles", "∫ xⁿ dx = xⁿ⁺¹/(n + 1) ; ∫ 1/x dx = ln|x| ; ∫ eˣ dx = eˣ ; ∫ cos x dx = sin x ; ∫ sin x dx = −cos x."),
    ] },
    { chapitre: "Logarithme et exponentielle", items: [
      P("Propriétés de ln", "ln(ab) = ln a + ln b ; ln(a/b) = ln a − ln b ; ln(aⁿ) = n ln a ; ln e = 1 ; ln 1 = 0."),
      P("Propriétés de exp", "eᵃ⁺ᵇ = eᵃ × eᵇ ; e⁻ᵃ = 1/eᵃ ; (eᵃ)ⁿ = eⁿᵃ ; ln(eˣ) = x et e^(ln x) = x (x > 0)."),
    ] },
    { chapitre: "Calcul intégral", items: [
      P("Définition", "∫ de a à b de f(x) dx = F(b) − F(a), où F est une primitive de f."),
      P("Aire", "Si f ≥ 0 sur [a ; b], l'aire sous la courbe vaut ∫ de a à b de f(x) dx (en unités d'aire)."),
      P("Intégration par parties", "∫ u v' = [u v] − ∫ u' v."),
    ] },
    { chapitre: "Nombres complexes", items: [
      P("Forme algébrique", "z = a + ib, i² = −1 ; conjugué z̄ = a − ib ; |z|² = z z̄ = a² + b²."),
      P("Forme trigonométrique", "z = r(cos θ + i sin θ) avec r = |z| et θ = arg z ; z₁ z₂ : modules multipliés, arguments additionnés."),
      P("Formule de Moivre", "(cos θ + i sin θ)ⁿ = cos(nθ) + i sin(nθ) ; eⁱᶿ = cos θ + i sin θ."),
    ] },
    { chapitre: "Probabilités", items: [
      P("Loi binomiale", "P(X = k) = Cₙᵏ pᵏ (1 − p)ⁿ⁻ᵏ ; E(X) = np ; V(X) = np(1 − p)."),
      P("Espérance", "E(X) = Σ xᵢ pᵢ ; V(X) = E(X²) − (E(X))²."),
    ] },
    { chapitre: "Suites et récurrence", items: [
      P("Raisonnement par récurrence", "On montre l'initialisation P(n₀), puis l'hérédité : P(n) vraie ⇒ P(n + 1) vraie. Alors P(n) est vraie pour tout n ≥ n₀."),
      P("Convergence", "Une suite croissante et majorée converge ; une suite géométrique de raison |q| < 1 converge vers 0."),
    ] },
  ],
};

export const PROPRIETES_LEVELS: LevelId[] = ["6e", "5e", "4e", "3e", "2nde", "1ere", "tle"];
