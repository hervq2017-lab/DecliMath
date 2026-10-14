// Problèmes de synthèse (niveau « épreuve ») : une situation, puis des questions qui s'enchaînent.
// Textes originaux écrits pour DeclickMath ; chaque résultat a été recalculé à la main.
// À faire relire par un enseignant avant diffusion large.
import type { LevelId } from "../curriculum";

export interface ProblemeQ {
  text: string;
  /** Réponse finale attendue. */
  answer: string;
  /** Démarche complète (corrigé type, réservé aux parents). */
  solution: string;
  /** Poids relatif dans le barème du problème. */
  w: number;
}
export interface Probleme {
  id: string;
  level: LevelId;
  /** Chapitres du référentiel (Nombres, Géométrie, Algèbre, Fonctions, Analyse, Probabilités…). */
  chapters: string[];
  titre: string;
  enonce: string;
  questions: ProblemeQ[];
}

export const PROBLEMES: Probleme[] = [
  // ---------------- 6ème ----------------
  {
    id: "6e-mangues", level: "6e", chapters: ["Nombres", "Données"], titre: "Les mangues de Koffi",
    enonce: "Koffi, commerçant au marché, achète 240 mangues pour 7 200 FCFA. Il vend d'abord les 3/5 des mangues à 50 FCFA l'unité. Il solde ensuite les mangues restantes avec une remise de 20 % sur le prix de 50 FCFA.",
    questions: [
      { text: "Quel est le prix d'achat d'une mangue ?", answer: "30 FCFA", solution: "7 200 ÷ 240 = 30 FCFA.", w: 1 },
      { text: "Combien de mangues Koffi vend-il d'abord ? Quelle est la recette correspondante ?", answer: "144 mangues ; 7 200 FCFA", solution: "240 ÷ 5 = 48 ; 48 × 3 = 144 mangues. Recette : 144 × 50 = 7 200 FCFA.", w: 2 },
      { text: "Calcule le prix soldé d'une mangue, puis la recette du solde.", answer: "40 FCFA ; 3 840 FCFA", solution: "Remise : 50 × 20/100 = 10 FCFA, donc 50 − 10 = 40 FCFA. Mangues restantes : 240 − 144 = 96. Recette : 96 × 40 = 3 840 FCFA.", w: 2 },
      { text: "Quel est le bénéfice total de Koffi ? Exprime-le par une fraction irréductible du prix d'achat.", answer: "3 840 FCFA ; 8/15", solution: "Recette totale : 7 200 + 3 840 = 11 040 FCFA. Bénéfice : 11 040 − 7 200 = 3 840 FCFA. Fraction : 3 840/7 200 ; on divise par 480 : 8/15.", w: 2 },
    ],
  },
  {
    id: "6e-terrain", level: "6e", chapters: ["Géométrie"], titre: "Le terrain de la famille Adjovi",
    enonce: "La famille Adjovi possède un terrain rectangulaire de 48 m de long et de 30 m de large. Elle veut l'entourer d'un grillage, en laissant une ouverture de 3 m pour le portail.",
    questions: [
      { text: "Calcule le périmètre et l'aire du terrain.", answer: "156 m ; 1 440 m²", solution: "P = 2 × (48 + 30) = 156 m. A = 48 × 30 = 1 440 m².", w: 2 },
      { text: "Le mètre de grillage coûte 1 500 FCFA. Quel est le coût du grillage ?", answer: "229 500 FCFA", solution: "Longueur de grillage : 156 − 3 = 153 m. Coût : 153 × 1 500 = 229 500 FCFA.", w: 2 },
      { text: "Un terrain carré a le même périmètre. Calcule la longueur de son côté puis son aire.", answer: "39 m ; 1 521 m²", solution: "Côté : 156 ÷ 4 = 39 m. Aire : 39 × 39 = 1 521 m².", w: 2 },
      { text: "De combien de m² l'aire du terrain carré dépasse-t-elle celle du terrain rectangulaire ?", answer: "81 m²", solution: "1 521 − 1 440 = 81 m².", w: 1 },
    ],
  },
  // ---------------- 5ème ----------------
  {
    id: "5e-caisse", level: "5e", chapters: ["Nombres", "Algèbre"], titre: "La caisse de Mme Hounkpatin",
    enonce: "Mme Hounkpatin tient une boutique à Cotonou. Cette semaine, son solde a varié ainsi : lundi +12 500 FCFA, mardi −8 000 FCFA, mercredi −15 250 FCFA, jeudi +20 000 FCFA. Chaque jour elle paie en plus 500 FCFA de frais de transport.",
    questions: [
      { text: "Calcule la variation totale du solde de lundi à jeudi, sans tenir compte des frais.", answer: "+9 250 FCFA", solution: "12 500 − 8 000 − 15 250 + 20 000 = 9 250 FCFA.", w: 2 },
      { text: "En tenant compte des frais de 500 FCFA par jour pendant n jours, exprime la variation S en fonction de n.", answer: "S = 9 250 − 500 n", solution: "Les frais pendant n jours valent 500 × n, donc S = 9 250 − 500 n.", w: 2 },
      { text: "Calcule S pour n = 10.", answer: "4 250 FCFA", solution: "S = 9 250 − 500 × 10 = 9 250 − 5 000 = 4 250 FCFA.", w: 1 },
      { text: "À partir de quel nombre de jours S devient-il négatif ?", answer: "19 jours", solution: "S < 0 ⇔ 500 n > 9 250 ⇔ n > 18,5. Le plus petit entier est 19 (S = 9 250 − 9 500 = −250).", w: 2 },
    ],
  },
  {
    id: "5e-trapeze", level: "5e", chapters: ["Géométrie"], titre: "Le champ en trapèze",
    enonce: "Un champ a la forme d'un trapèze de grande base 40 m, de petite base 24 m et de hauteur 15 m. Un ouvrier le laboure à 200 FCFA le m². On veut aussi creuser un bassin dont la base est ce trapèze et la profondeur 2 m.",
    questions: [
      { text: "Calcule l'aire du champ.", answer: "480 m²", solution: "A = (40 + 24) × 15 ÷ 2 = 64 × 15 ÷ 2 = 480 m².", w: 2 },
      { text: "Quel est le coût du labour ?", answer: "96 000 FCFA", solution: "480 × 200 = 96 000 FCFA.", w: 1 },
      { text: "Calcule le volume du bassin en m³ puis en litres.", answer: "960 m³ ; 960 000 L", solution: "V = aire de la base × hauteur = 480 × 2 = 960 m³. Or 1 m³ = 1 000 L, donc 960 000 L.", w: 2 },
      { text: "Peut-on construire un triangle de côtés 7 cm, 9 cm et 17 cm ? Justifie.", answer: "Non", solution: "Inégalité triangulaire : 7 + 9 = 16 < 17. Le plus grand côté dépasse la somme des deux autres, donc le triangle est impossible.", w: 1 },
    ],
  },
  // ---------------- 4ème ----------------
  {
    id: "4e-echelle", level: "4e", chapters: ["Géométrie"], titre: "L'échelle du peintre",
    enonce: "Un peintre appuie une échelle de 6,5 m contre un mur vertical. Le pied de l'échelle est à 2,5 m du mur, sur un sol horizontal.",
    questions: [
      { text: "À quelle hauteur l'échelle touche-t-elle le mur ?", answer: "6 m", solution: "Le triangle est rectangle au pied du mur. Pythagore : h² = 6,5² − 2,5² = 42,25 − 6,25 = 36, donc h = 6 m.", w: 2 },
      { text: "Montre, avec la réciproque du théorème de Pythagore, que le mur et le sol sont bien perpendiculaires.", answer: "2,5² + 6² = 6,5²", solution: "2,5² + 6² = 6,25 + 36 = 42,25 et 6,5² = 42,25. L'égalité est vérifiée, donc le triangle est rectangle : le mur est perpendiculaire au sol.", w: 2 },
      { text: "Calcule le cosinus de l'angle entre l'échelle et le sol, puis donne cet angle à 0,1° près.", answer: "cos = 5/13 ; ≈ 67,4°", solution: "cos(angle) = côté adjacent / hypoténuse = 2,5/6,5 = 5/13 ≈ 0,3846. Avec la calculatrice : angle ≈ 67,4°.", w: 2 },
      { text: "Le sommet de l'échelle descend à 5,5 m du sol. De combien le pied s'est-il éloigné du mur ?", answer: "≈ 0,96 m", solution: "Nouvelle distance d : d² = 6,5² − 5,5² = 42,25 − 30,25 = 12, donc d = √12 ≈ 3,46 m. Éloignement : 3,46 − 2,5 ≈ 0,96 m.", w: 2 },
    ],
  },
  {
    id: "4e-offres", level: "4e", chapters: ["Algèbre"], titre: "Deux offres de connexion",
    enonce: "Une salle internet propose deux formules : l'offre A coûte 3 000 FCFA d'abonnement plus 100 FCFA par heure ; l'offre B n'a pas d'abonnement mais coûte 200 FCFA par heure.",
    questions: [
      { text: "Exprime en fonction du nombre d'heures x le coût de chaque offre.", answer: "A(x) = 3 000 + 100 x ; B(x) = 200 x", solution: "Offre A : 3 000 + 100 × x. Offre B : 200 × x.", w: 1 },
      { text: "Calcule le coût de chaque offre pour 20 heures.", answer: "A = 5 000 FCFA ; B = 4 000 FCFA", solution: "A(20) = 3 000 + 2 000 = 5 000. B(20) = 4 000.", w: 1 },
      { text: "Résous l'équation 3 000 + 100 x = 200 x.", answer: "x = 30", solution: "3 000 = 200 x − 100 x = 100 x, donc x = 3 000 ÷ 100 = 30.", w: 2 },
      { text: "Conclus : selon la durée, quelle offre est la plus avantageuse ?", answer: "B avant 30 h, A après 30 h", solution: "À 30 h les prix sont égaux (6 000 FCFA). Pour x < 30, 200 x < 3 000 + 100 x : B est moins chère. Pour x > 30, A est moins chère.", w: 2 },
    ],
  },
  // ---------------- 3ème ----------------
  {
    id: "3e-arbre", level: "3e", chapters: ["Géométrie"], titre: "La hauteur du fromager",
    enonce: "Pour mesurer un fromager, Awa plante un bâton vertical de 1,5 m. À la même heure, l'ombre du bâton mesure 2 m et celle de l'arbre 12 m. Les points sont alignés comme dans la configuration de Thalès.",
    questions: [
      { text: "Calcule la hauteur de l'arbre avec le théorème de Thalès.", answer: "9 m", solution: "Les triangles formés par le bâton et l'arbre avec leurs ombres ont des côtés proportionnels : h/1,5 = 12/2 = 6, donc h = 1,5 × 6 = 9 m.", w: 3 },
      { text: "Calcule la distance entre le sommet de l'arbre et l'extrémité de son ombre.", answer: "15 m", solution: "Triangle rectangle de côtés 9 et 12 : d² = 9² + 12² = 81 + 144 = 225, donc d = 15 m.", w: 2 },
      { text: "Calcule la tangente de l'angle que font les rayons du soleil avec le sol, puis cet angle à 0,1° près.", answer: "tan = 3/4 ; ≈ 36,9°", solution: "tan(angle) = côté opposé / côté adjacent = 9/12 = 0,75. Angle ≈ 36,9°.", w: 2 },
      { text: "À la même heure, un autre arbre a une ombre de 20 m. Quelle est sa hauteur ?", answer: "15 m", solution: "Le rapport hauteur / ombre est constant : 1,5/2 = 0,75. Hauteur = 20 × 0,75 = 15 m.", w: 1 },
    ],
  },
  {
    id: "3e-zem", level: "3e", chapters: ["Fonctions", "Algèbre"], titre: "Deux taxis-motos",
    enonce: "À Parakou, le zem A prend 500 FCFA de prise en charge plus 200 FCFA par kilomètre ; le zem B prend 1 000 FCFA de prise en charge plus 150 FCFA par kilomètre.",
    questions: [
      { text: "Donne les fonctions f (zem A) et g (zem B) qui expriment le prix en fonction de la distance x en km.", answer: "f(x) = 200 x + 500 ; g(x) = 150 x + 1 000", solution: "Prix = prise en charge + prix du km × nombre de km.", w: 1 },
      { text: "Calcule le prix de chaque zem pour 8 km.", answer: "f(8) = 2 100 ; g(8) = 2 200", solution: "f(8) = 1 600 + 500 = 2 100 FCFA. g(8) = 1 200 + 1 000 = 2 200 FCFA.", w: 1 },
      { text: "Résous f(x) = g(x). Que représente la solution ?", answer: "x = 10 km", solution: "200 x + 500 = 150 x + 1 000 ⇔ 50 x = 500 ⇔ x = 10. À 10 km les deux prix sont égaux : 2 500 FCFA.", w: 2 },
      { text: "Pour quelles distances le zem A est-il moins cher ? Donne les coordonnées du point d'intersection des deux droites représentatives.", answer: "x < 10 km ; point (10 ; 2 500)", solution: "f(x) < g(x) ⇔ 50 x < 500 ⇔ x < 10. Intersection : x = 10 et f(10) = 2 500, soit le point (10 ; 2 500).", w: 2 },
    ],
  },
  {
    id: "3e-carres", level: "3e", chapters: ["Algèbre", "Nombres"], titre: "Deux carrés et leurs racines",
    enonce: "Deux carrés ont pour côtés respectifs a = √5 + 2 et b = √5 − 2 (en mètres).",
    questions: [
      { text: "Calcule l'aire du premier carré sous la forme p + q√5.", answer: "9 + 4√5 m²", solution: "(√5 + 2)² = 5 + 4√5 + 4 = 9 + 4√5.", w: 2 },
      { text: "Donne une valeur approchée de cette aire au centième.", answer: "≈ 17,94 m²", solution: "√5 ≈ 2,2361, donc 4√5 ≈ 8,944 et 9 + 8,944 ≈ 17,94.", w: 1 },
      { text: "Calcule l'aire du second carré, puis le produit des deux aires.", answer: "9 − 4√5 ; produit = 1", solution: "(√5 − 2)² = 5 − 4√5 + 4 = 9 − 4√5. Produit : (9 + 4√5)(9 − 4√5) = 81 − 16 × 5 = 81 − 80 = 1.", w: 3 },
      { text: "Montre que a × b = 1. Que peut-on dire de a et b ?", answer: "a × b = 1 : inverses l'un de l'autre", solution: "(√5 + 2)(√5 − 2) = (√5)² − 2² = 5 − 4 = 1. Le produit vaut 1 : a et b sont inverses l'un de l'autre.", w: 2 },
    ],
  },
  // ---------------- Seconde ----------------
  {
    id: "2nde-enclos", level: "2nde", chapters: ["Algèbre", "Fonctions"], titre: "L'enclos de l'éleveur",
    enonce: "Un éleveur dispose de 40 m de grillage pour construire un enclos rectangulaire. On note x la longueur d'un côté (en m), avec 0 < x < 20.",
    questions: [
      { text: "Exprime l'autre côté puis l'aire A(x) de l'enclos.", answer: "autre côté : 20 − x ; A(x) = −x² + 20 x", solution: "Le demi-périmètre vaut 20 m, donc l'autre côté mesure 20 − x et A(x) = x(20 − x) = −x² + 20 x.", w: 2 },
      { text: "Montre que 100 − A(x) = (x − 10)². En déduis la valeur maximale de A.", answer: "A max = 100 m² pour x = 10", solution: "100 − A(x) = 100 − 20 x + x² = (x − 10)² ≥ 0, donc A(x) ≤ 100 avec égalité si x = 10. Le maximum est 100 m² (un carré de 10 m).", w: 3 },
      { text: "Pour quelles valeurs de x l'aire vaut-elle 75 m² ?", answer: "x = 5 ou x = 15", solution: "A(x) = 75 ⇔ x² − 20 x + 75 = 0. Δ = 400 − 300 = 100, x = (20 ± 10)/2, soit x = 15 ou x = 5. L'enclos mesure 15 m sur 5 m.", w: 3 },
      { text: "Dresse le tableau de variation de A sur [0 ; 20].", answer: "croissante sur [0 ; 10], décroissante sur [10 ; 20]", solution: "A est un trinôme de coefficient dominant −1 < 0 et de sommet d'abscisse −b/(2a) = 10. Elle croît de A(0) = 0 à A(10) = 100, puis décroît jusqu'à A(20) = 0.", w: 2 },
    ],
  },
  {
    id: "2nde-vecteurs", level: "2nde", chapters: ["Géométrie"], titre: "Un quadrilatère dans le repère",
    enonce: "Dans un repère orthonormé, on considère A(1 ; 2), B(5 ; 4) et C(3 ; 8).",
    questions: [
      { text: "Calcule les coordonnées des vecteurs AB, BC et AC.", answer: "AB(4 ; 2) ; BC(−2 ; 4) ; AC(2 ; 6)", solution: "AB(5 − 1 ; 4 − 2) = (4 ; 2). BC(3 − 5 ; 8 − 4) = (−2 ; 4). AC(3 − 1 ; 8 − 2) = (2 ; 6).", w: 2 },
      { text: "Calcule les longueurs AB, BC et AC.", answer: "AB = BC = 2√5 ; AC = 2√10", solution: "AB = √(16 + 4) = √20 = 2√5. BC = √(4 + 16) = 2√5. AC = √(4 + 36) = √40 = 2√10.", w: 2 },
      { text: "Quelle est la nature du triangle ABC ?", answer: "isocèle rectangle en B", solution: "AB = BC, donc isocèle en B. AB² + BC² = 20 + 20 = 40 = AC² : d'après la réciproque de Pythagore, il est rectangle en B.", w: 3 },
      { text: "Détermine D pour que ABCD soit un parallélogramme. Quelle est alors la nature de ABCD ?", answer: "D(−1 ; 6) ; carré", solution: "ABCD est un parallélogramme ⇔ AB = DC. D = A + C − B = (1 + 3 − 5 ; 2 + 8 − 4) = (−1 ; 6). Il a un angle droit en B et deux côtés consécutifs égaux : c'est un carré de côté 2√5, d'aire 20.", w: 3 },
    ],
  },
  // ---------------- Première ----------------
  {
    id: "1ere-derivee", level: "1ere", chapters: ["Analyse", "Fonctions"], titre: "Étude d'une fonction polynôme",
    enonce: "Soit f la fonction définie sur ℝ par f(x) = x³ − 6x² + 9x + 1.",
    questions: [
      { text: "Calcule f'(x) et factorise-la.", answer: "f'(x) = 3(x − 1)(x − 3)", solution: "f'(x) = 3x² − 12x + 9 = 3(x² − 4x + 3) = 3(x − 1)(x − 3).", w: 2 },
      { text: "Étudie le signe de f' et dresse le tableau de variation de f.", answer: "croissante sur ]−∞ ; 1], décroissante sur [1 ; 3], croissante sur [3 ; +∞[", solution: "f'(x) est du signe de 3(x − 1)(x − 3) : positive avant 1, négative entre 1 et 3, positive après 3.", w: 3 },
      { text: "Calcule les extremums locaux.", answer: "maximum f(1) = 5 ; minimum f(3) = 1", solution: "f(1) = 1 − 6 + 9 + 1 = 5. f(3) = 27 − 54 + 27 + 1 = 1.", w: 2 },
      { text: "Écris l'équation de la tangente à la courbe au point d'abscisse 0.", answer: "y = 9x + 1", solution: "f(0) = 1 et f'(0) = 9. Tangente : y = f'(0)(x − 0) + f(0) = 9x + 1.", w: 2 },
    ],
  },
  {
    id: "1ere-suite", level: "1ere", chapters: ["Analyse", "Algèbre"], titre: "La production de l'usine",
    enonce: "Une usine de Lomé produit 1 200 unités en 2024 (n = 0). Sa production augmente de 5 % chaque année. On note uₙ la production de l'année 2024 + n.",
    questions: [
      { text: "Montre que (uₙ) est une suite géométrique et donne uₙ en fonction de n.", answer: "raison 1,05 ; uₙ = 1 200 × 1,05ⁿ", solution: "Augmenter de 5 % revient à multiplier par 1,05 : uₙ₊₁ = 1,05 uₙ. Donc uₙ = 1 200 × 1,05ⁿ.", w: 2 },
      { text: "Calcule la production en 2027 (arrondie à l'unité).", answer: "≈ 1 389 unités", solution: "u₃ = 1 200 × 1,05³ = 1 200 × 1,157625 = 1 389,15 ≈ 1 389.", w: 2 },
      { text: "Calcule la production totale de 2024 à 2027 (arrondie à l'unité).", answer: "≈ 5 172 unités", solution: "S = u₀ + u₁ + u₂ + u₃ = 1 200 × (1,05⁴ − 1)/(1,05 − 1) = 1 200 × 0,21550625/0,05 ≈ 5 172,15.", w: 3 },
      { text: "À partir de quelle année la production dépasse-t-elle 2 000 unités ?", answer: "2035 (n = 11)", solution: "uₙ > 2 000 ⇔ 1,05ⁿ > 5/3 ⇔ n > ln(5/3)/ln(1,05) ≈ 10,47. Donc n = 11, soit l'année 2035 (1,05¹⁰ ≈ 1,629 donne 1 955 < 2 000 ; 1,05¹¹ ≈ 1,710 donne 2 052).", w: 3 },
    ],
  },
  // ---------------- Terminale ----------------
  {
    id: "tle-xexp", level: "tle", chapters: ["Analyse", "Fonctions"], titre: "Étude de x e⁻ˣ",
    enonce: "Soit f la fonction définie sur [0 ; +∞[ par f(x) = x e⁻ˣ.",
    questions: [
      { text: "Calcule f'(x) et étudie son signe.", answer: "f'(x) = (1 − x) e⁻ˣ", solution: "f'(x) = 1 × e⁻ˣ + x × (−e⁻ˣ) = (1 − x)e⁻ˣ. Comme e⁻ˣ > 0, f'(x) est du signe de 1 − x : positif sur [0 ; 1[, négatif sur ]1 ; +∞[.", w: 3 },
      { text: "Dresse le tableau de variation de f et donne son maximum.", answer: "maximum f(1) = 1/e ≈ 0,368", solution: "f croît de f(0) = 0 à f(1) = e⁻¹ = 1/e ≈ 0,368, puis décroît.", w: 2 },
      { text: "Calcule la limite de f en +∞. Interprète graphiquement.", answer: "0 ; asymptote y = 0", solution: "f(x) = x/eˣ. Par croissances comparées, eˣ/x → +∞, donc f(x) → 0. La courbe admet l'axe des abscisses comme asymptote en +∞.", w: 3 },
      { text: "Calcule l'intégrale de f entre 0 et 1.", answer: "1 − 2/e ≈ 0,264", solution: "Une primitive de x e⁻ˣ est F(x) = −(x + 1)e⁻ˣ (car F' = −e⁻ˣ + (x + 1)e⁻ˣ = x e⁻ˣ). Donc ∫₀¹ f = F(1) − F(0) = −2e⁻¹ + 1 = 1 − 2/e ≈ 0,264.", w: 3 },
    ],
  },
  {
    id: "tle-complexes", level: "tle", chapters: ["Algèbre", "Nombres"], titre: "Nombres complexes",
    enonce: "On considère le nombre complexe z = 1 + i.",
    questions: [
      { text: "Donne le module et un argument de z.", answer: "|z| = √2 ; arg z = π/4", solution: "|z| = √(1² + 1²) = √2. z = √2(cos π/4 + i sin π/4), donc arg z = π/4 [2π].", w: 2 },
      { text: "Calcule z².", answer: "2i", solution: "(1 + i)² = 1 + 2i + i² = 1 + 2i − 1 = 2i.", w: 1 },
      { text: "Calcule z⁸ avec la forme trigonométrique.", answer: "16", solution: "z⁸ = (√2)⁸ (cos 8π/4 + i sin 8π/4) = 16 (cos 2π + i sin 2π) = 16.", w: 3 },
      { text: "Résous dans ℂ l'équation z² + 2z + 2 = 0.", answer: "z = −1 + i ou z = −1 − i", solution: "Δ = 2² − 4 × 1 × 2 = −4 = (2i)². Les solutions sont z = (−2 ± 2i)/2 = −1 ± i.", w: 3 },
    ],
  },
  {
    id: "tle-qcm", level: "tle", chapters: ["Probabilités"], titre: "Le QCM au hasard",
    enonce: "Un examen comporte un QCM de 10 questions indépendantes, chacune avec 4 propositions dont une seule est exacte. Un candidat répond complètement au hasard. On note X le nombre de bonnes réponses.",
    questions: [
      { text: "Quelle est la loi de X ? Donne ses paramètres.", answer: "binomiale B(10 ; 0,25)", solution: "10 épreuves identiques et indépendantes, chacune avec deux issues (réussite avec p = 1/4 = 0,25) : X suit la loi binomiale B(10 ; 0,25).", w: 2 },
      { text: "Calcule P(X = 3) à 10⁻⁴ près.", answer: "≈ 0,2503", solution: "P(X = 3) = C(10, 3) × 0,25³ × 0,75⁷ = 120 × 0,015625 × 0,13348 ≈ 0,2503.", w: 3 },
      { text: "Calcule la probabilité d'avoir au moins une bonne réponse.", answer: "≈ 0,9437", solution: "P(X ≥ 1) = 1 − P(X = 0) = 1 − 0,75¹⁰ ≈ 1 − 0,0563 = 0,9437.", w: 2 },
      { text: "Calcule l'espérance et la variance de X.", answer: "E(X) = 2,5 ; V(X) = 1,875", solution: "E(X) = n p = 10 × 0,25 = 2,5. V(X) = n p (1 − p) = 10 × 0,25 × 0,75 = 1,875.", w: 2 },
    ],
  },
];
