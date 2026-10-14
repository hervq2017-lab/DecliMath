// Propriétés du manuel CIAM 3ème (reformulées, avec la page du manuel). Voir proprietes-ciam.ts.
import { nid } from "../curriculum";
import type { LivreCiam, ProprieteCiam } from "./proprietes-ciam";

const m3 = (title: string) => nid("maths", "3e", title);
const P = (titre: string, enonce: string, page: string): ProprieteCiam => ({ titre, enonce, page });

export const LIVRE_3E: LivreCiam = {
  livre: "CIAM 3ème",
  chapitres: [
    { numero: 1, chapitre: "Propriété de Thalès", notionId: m3("Propriétés de Thalès dans un triangle"), items: [
      P("Propriété de Thalès", "ABC est un triangle, M ∈ (AB) et M′ ∈ (AC). Si (MM′) ∥ (BC), alors AM/AB = AM′/AC.", "9"),
      P("Réciproque", "Si AM/AB = AM′/AC et si M et M′ sont placés de la même façon par rapport à A (même position sur (AB) et (AC)), alors (MM′) ∥ (BC).", "9"),
      P("Conséquence", "Si (MM′) ∥ (BC), alors MM′/BC = AM/AB = AM′/AC.", "11"),
      P("Quatrième proportionnelle", "Construire la quatrième proportionnelle de a, b et c, c'est trouver MN tel que a/b = c/MN.", "11-12"),
      P("Triangles semblables", "Si deux triangles sont semblables, leurs côtés sont deux à deux proportionnels et leurs angles deux à deux de même mesure. Réciproquement, deux triangles qui ont leurs côtés deux à deux proportionnels, ou leurs angles deux à deux de même mesure, sont semblables.", "14-15"),
      P("Cas général", "Des droites parallèles découpent des segments de mesures proportionnelles sur deux droites qui leur sont sécantes : AB/A′B′ = BC/B′C′ = CD/C′D′.", "16"),
    ] },
    { numero: 2, chapitre: "Triangle rectangle, trigonométrie", notionId: m3("Triangle rectangle"), items: [
      P("Pythagore", "Si un triangle est rectangle, alors le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés. Réciproque : si, dans un triangle, le carré d'un côté est égal à la somme des carrés des deux autres, alors ce triangle est rectangle.", "22"),
      P("Cosinus et sinus", "Dans un triangle rectangle, le cosinus d'un angle aigu est le quotient du côté adjacent par l'hypoténuse ; son sinus est le quotient du côté opposé par l'hypoténuse.", "24"),
      P("Relations", "Pour tout angle aigu de mesure a° : 0 < cos a° < 1, 0 < sin a° < 1 et cos²a° + sin²a° = 1.", "25"),
      P("Angles complémentaires", "Lorsque deux angles sont complémentaires, le sinus de l'un est égal au cosinus de l'autre : cos(90 − a)° = sin a° et sin(90 − a)° = cos a°.", "26"),
      P("Valeurs remarquables", "sin 30° = 1/2, cos 30° = √3/2 ; sin 45° = cos 45° = √2/2 ; sin 60° = √3/2, cos 60° = 1/2.", "26"),
      P("Tangente", "La tangente d'un angle aigu est le quotient du côté opposé par le côté adjacent. tan a° = sin a° / cos a°.", "26-27"),
      P("Tangentes complémentaires", "Dans un triangle rectangle, les tangentes de deux angles complémentaires sont inverses l'une de l'autre : tan a° × tan(90 − a)° = 1.", "27"),
    ] },
    { numero: 3, chapitre: "Vecteurs", notionId: m3("Vecteurs"), items: [
      P("Même direction", "Les vecteurs AB et CD ont même direction équivaut à : on peut trouver un réel k non nul tel que AB = k CD.", "41"),
      P("Vecteurs colinéaires", "Des vecteurs sont colinéaires lorsqu'ils ont même direction, ou lorsque l'un d'eux est le vecteur nul.", "42"),
      P("Alignement", "M ∈ (AB) équivaut à : AM et AB sont colinéaires.", "42"),
      P("Vecteur directeur", "Un vecteur non nul AB est un vecteur directeur de la droite (D) lorsque (AB) ∥ (D). Deux vecteurs non nuls sont orthogonaux lorsqu'ils sont des vecteurs directeurs de deux droites perpendiculaires.", "42"),
      P("Langage vectoriel", "I est le milieu de [AB] équivaut à AB = 2 AI. (AB) ∥ (CD) équivaut à : on peut trouver un réel k non nul tel que CD = k AB.", "43"),
      P("Thalès en vecteurs", "(MN) ∥ (BC) équivaut à AM = k AB et AN = k AC.", "43"),
    ] },
    { numero: 4, chapitre: "Coordonnées d'un vecteur", notionId: m3("Coordonnées d'un vecteur"), items: [
      P("Égalité de couples", "Les couples (x ; y) et (x′ ; y′) sont égaux équivaut à x = x′ et y = y′.", "48"),
      P("Coordonnées d'un vecteur", "Le couple de coordonnées du vecteur AB est le couple (x ; y) tel que AB = x OI + y OJ.", "49"),
      P("Somme et produit", "Si AB (x ; y) et A′B′ (x′ ; y′), alors AB + A′B′ (x + x′ ; y + y′) et k AB (kx ; ky).", "50-51"),
      P("Vecteurs colinéaires", "AB (x ; y) et A′B′ (x′ ; y′) sont colinéaires équivaut à xy′ − x′y = 0.", "51-52"),
      P("Vecteurs orthogonaux", "Dans un repère orthonormé, AB (x ; y) et A′B′ (x′ ; y′) sont orthogonaux équivaut à xx′ + yy′ = 0.", "52"),
      P("Calcul des coordonnées", "Si A (x_A ; y_A) et B (x_B ; y_B), alors AB (x_B − x_A ; y_B − y_A).", "53"),
      P("Milieu", "Si K est le milieu de [AB], alors K ((x_A + x_B)/2 ; (y_A + y_B)/2).", "54"),
      P("Distance", "Dans un repère orthonormé, AB = √((x_B − x_A)² + (y_B − y_A)²).", "55"),
    ] },
    { numero: 5, chapitre: "Équations de droites", notionId: m3("Équations de droites"), items: [
      P("Équation d'une droite", "Dans un repère, toute droite a une équation de la forme px + qy + r = 0 (p et q non tous nuls) ; toute équation de cette forme est celle d'une droite.", "63"),
      P("Équation réduite", "Une droite non parallèle à l'axe des ordonnées a une équation y = ax + b ; a est son coefficient directeur et b son ordonnée à l'origine. Une droite parallèle à l'axe des ordonnées a une équation x = k.", "64-65"),
      P("Calcul du coefficient directeur", "Si A (x_A ; y_A) et B (x_B ; y_B) sont deux points de la droite avec x_A ≠ x_B : a = (y_B − y_A)/(x_B − x_A).", "65"),
      P("Parallèles", "Deux droites de coefficients directeurs a et a′ sont parallèles équivaut à a = a′.", "66"),
      P("Perpendiculaires", "Dans un repère orthonormé, deux droites de coefficients directeurs a et a′ sont perpendiculaires équivaut à a × a′ = −1.", "67"),
    ] },
    { numero: 6, chapitre: "Angles inscrits", notionId: m3("Angles inscrits"), items: [
      P("Angle inscrit aigu", "Un angle aigu inscrit dans un cercle a pour mesure la moitié de la mesure de l'angle au centre associé : mes AMB = ½ mes AOB.", "75"),
      P("Angle inscrit obtus", "mes AMB = ½ (mes AOE + mes EOB) = 180° − ½ mes AOB.", "75"),
      P("Même arc", "Dans un cercle, deux angles inscrits qui interceptent le même arc ont la même mesure ; deux angles inscrits qui interceptent deux arcs de même longueur ont la même mesure.", "76"),
      P("Quadrilatère inscriptible", "Si un quadrilatère est inscriptible dans un cercle, alors ses angles opposés sont supplémentaires.", "77"),
    ] },
    { numero: 7, chapitre: "Symétries et translations", notionId: m3("Symétries et translations"), items: [
      P("Conservation", "Par une symétrie orthogonale, une symétrie centrale ou une translation : des points alignés ont pour images des points alignés ; un segment a pour image un segment de même longueur ; le milieu d'un segment a pour image le milieu de l'image ; deux droites parallèles ont pour images deux droites parallèles ; un cercle a pour image un cercle de même rayon ; un angle a pour image un angle de même mesure ; deux droites perpendiculaires ont pour images deux droites perpendiculaires.", "83"),
      P("Droites invariantes", "Une droite perpendiculaire à l'axe est sa propre image par la symétrie orthogonale ; une droite passant par le centre I est sa propre image par la symétrie centrale de centre I ; une droite de vecteur directeur AB est sa propre image par la translation de vecteur AB.", "83"),
      P("Figures images", "Une figure a pour image une figure qui lui est superposable.", "83"),
    ] },
    { numero: 8, chapitre: "Rotation et homothétie", notionId: m3("Rotation et homothétie"), items: [
      P("Rotation", "OAA′ est un triangle isocèle en O. La rotation r de centre O qui applique A sur A′ associe à tout point M le point M′ tel que OM = OM′ et mes MOM′ = mes AOA′, avec le même sens de déplacement.", "95"),
      P("Image d'un segment", "L'image d'un segment par une rotation est un segment de même longueur.", "97"),
      P("Homothétie", "O est un point et k un réel non nul. L'homothétie de centre O et de rapport k associe à tout point M le point M′ tel que OM′ = k OM (vecteurs).", "97"),
      P("Propriétés de l'homothétie", "Par une homothétie de rapport k : une droite a pour image une droite qui lui est parallèle ; le segment [AB] a pour image le segment [A′B′] de longueur |k| × AB ; A′B′ = k AB (vecteurs).", "98"),
      P("Agrandissement et réduction", "Une homothétie de rapport k multiplie les longueurs par |k| et les aires par k².", "99"),
    ] },
    { numero: 9, chapitre: "Pyramides et cônes", notionId: m3("Pyramides et cônes"), items: [
      P("Hauteur", "La hauteur d'une pyramide (d'un cône) est la droite qui passe par son sommet et qui est perpendiculaire au plan de sa base.", "102"),
      P("Volume d'une pyramide", "V = B × h ÷ 3 (B aire de la base, h hauteur).", "103"),
      P("Pyramide régulière", "Une pyramide est régulière lorsque sa base est un polygone régulier et que ses faces latérales sont des triangles isocèles ; sa hauteur passe par le centre du cercle circonscrit à la base.", "103-104"),
      P("Cône de révolution", "La base d'un cône de révolution est un cercle ; son axe est la hauteur du cône. Volume : V = B × h ÷ 3 ; aire latérale : A = P × a ÷ 2 (P périmètre de la base, a génératrice).", "106-107"),
      P("Sphère et boule", "Aire de la sphère : 4πr² ; volume de la boule : 4πr³ ÷ 3.", "107"),
      P("Sections planes", "La section d'une pyramide par un plan parallèle à la base est un polygone de même nature que la base ; la section d'un cône de révolution par un plan parallèle à sa base est un cercle.", "108-109"),
      P("Réduction", "Si l'échelle de la réduction est k, les aires sont multipliées par k² et les volumes par k³.", "110"),
    ] },
    { numero: 10, chapitre: "Calcul littéral", notionId: m3("Calcul littéral"), items: [
      P("Exposant négatif", "Pour a ≠ 0 et n entier naturel non nul : a⁻ⁿ = 1/aⁿ ; a⁻ⁿ × aⁿ = 1.", "122"),
      P("Propriétés des puissances", "Pour a et b non nuls et m, n entiers relatifs : aⁿ × bⁿ = (a b)ⁿ ; aᵐ × aⁿ = aᵐ⁺ⁿ ; (aᵐ)ⁿ = aᵐⁿ ; aᵐ/aⁿ = aᵐ⁻ⁿ.", "122"),
      P("Développer, factoriser", "x (y + z) = xy + xz ; (a + b)² = a² + 2ab + b² ; (a − b)² = a² − 2ab + b² ; (a + b)(a − b) = a² − b².", "123"),
      P("Produit nul", "Un produit est égal à zéro lorsque l'un au moins de ses facteurs est égal à zéro : ab = 0 équivaut à a = 0 ou b = 0.", "125"),
      P("Nombres de même carré", "a² = b² équivaut à a = b ou a = −b. Si a et b sont positifs : a² = b² équivaut à a = b.", "125"),
      P("Fraction rationnelle", "La condition d'existence d'une valeur numérique d'une fraction rationnelle est que son dénominateur soit différent de 0.", "127"),
    ] },
    { numero: 11, chapitre: "Racines carrées", notionId: m3("Racines carrées"), items: [
      P("Somme", "Pour a et b positifs : √a + √b ≠ √(a + b) en général.", "134"),
      P("Produit et quotient", "Pour a et b positifs : √a × √b = √(ab) ; √(b/a) = √b/√a (a ≠ 0).", "134"),
      P("Racines et puissances", "a étant un réel positif et n un entier relatif : √(a²ⁿ) = aⁿ ; √(a²ⁿ⁺¹) = aⁿ × √a.", "135"),
      P("Expressions conjuguées", "√a + b et √a − b sont des expressions conjuguées : leur produit s'écrit sans radical (√a + b)(√a − b) = a − b².", "137"),
      P("Quotient sans radical au dénominateur", "On multiplie le numérateur et le dénominateur par l'expression conjuguée du dénominateur.", "137"),
    ] },
    { numero: 12, chapitre: "Calcul numérique", notionId: m3("Calcul numérique"), items: [
      P("Valeur absolue", "La valeur absolue d'un nombre est sa distance à zéro. √(a²) = |a|.", "142"),
      P("Distance de deux nombres", "La distance des nombres a et b est |a − b|.", "143"),
      P("Intervalles", "[a ; b] correspond à a ≤ x ≤ b ; ]a ; b[ à a < x < b ; les crochets ouverts excluent la borne. L'amplitude de l'intervalle est |a − b|.", "144"),
      P("Intersection et réunion", "x ∈ A ∩ B équivaut à x ∈ A et x ∈ B ; x ∈ A ∪ B équivaut à x ∈ A ou x ∈ B.", "145"),
      P("Comparer des nombres positifs", "Pour comparer deux nombres positifs, on peut comparer leurs carrés.", "147"),
      P("Comparer des inverses", "Deux nombres de même signe et différents de 0 sont rangés dans l'ordre contraire de leurs inverses.", "148"),
      P("Méthodes de comparaison", "Comparer leurs carrés, leurs inverses, étudier le signe de leur différence, ou les placer dans des intervalles disjoints.", "149"),
    ] },
    { numero: 13, chapitre: "Équations, inéquations dans ℝ", notionId: m3("Équations et inéquations dans ℝ"), items: [
      P("Transformer une équation", "On obtient une équation qui a les mêmes solutions en ajoutant un même nombre à chaque membre, ou en multipliant chaque membre par un même nombre non nul.", "160"),
      P("Équation |x − a| = b", "Les solutions de |x − a| = b (b > 0) sont les nombres dont la distance à a est b : x = a − b ou x = a + b.", "162"),
      P("Inéquation", "On résout ax + b < cx + d en se ramenant à x < u ou x > u ; multiplier ou diviser par un nombre négatif change le sens de l'inégalité.", "163"),
      P("Système d'inéquations", "Résoudre un système d'inéquations, c'est trouver l'ensemble des solutions communes aux inéquations.", "163-164"),
    ] },
    { numero: 14, chapitre: "Équations, inéquations dans ℝ × ℝ", notionId: m3("Équations et inéquations dans ℝ × ℝ (couples)"), items: [
      P("Équation du premier degré dans ℝ × ℝ", "Un couple (x ; y) est solution de l'équation si la phrase obtenue en remplaçant x et y est vraie ; une telle équation a une infinité de solutions.", "172"),
      P("Résolution d'un système", "On résout un système de deux équations du premier degré par substitution ou par combinaison (élimination d'une inconnue).", "173-174"),
      P("Demi-plans", "(D) est la droite d'équation ax + by + c = 0 ; elle partage le plan en deux demi-plans : les couples d'un demi-plan vérifient ax + by + c < 0, ceux de (D) vérifient ax + by + c = 0, ceux de l'autre demi-plan vérifient ax + by + c > 0.", "177"),
    ] },
    { numero: 15, chapitre: "Applications affines", notionId: m3("Applications affines"), items: [
      P("Application affine", "Une application affine de coefficient a et de terme constant b associe à tout réel x le réel f(x) = ax + b. Si a ≠ 0, c'est une bijection de ℝ dans ℝ.", "187"),
      P("Représentation graphique", "La représentation graphique de f(x) = ax + b est la droite d'équation y = ax + b.", "188"),
      P("Sens de variation", "f(x) = ax + b est croissante lorsque a > 0, constante lorsque a = 0, décroissante lorsque a < 0.", "189"),
      P("Application linéaire", "Une application linéaire est une application affine f(x) = ax ; sa représentation graphique est une droite qui passe par l'origine. f(u + v) = f(u) + f(v) et f(ku) = k f(u).", "190-191"),
    ] },
    { numero: 16, chapitre: "Statistiques", notionId: m3("Statistique"), items: [
      P("Mode", "Le mode d'une série statistique est toute modalité dont l'effectif est maximal ; une série peut avoir plusieurs modes.", "202"),
      P("Diagramme circulaire", "La mesure d'un secteur circulaire est proportionnelle à la fréquence (ou à l'effectif) de la modalité ; le disque entier mesure 360°.", "203-204"),
      P("Effectif et fréquence cumulés", "L'effectif cumulé de la modalité n est la somme des effectifs des modalités inférieures ou égales à n ; la fréquence cumulée est le quotient de l'effectif cumulé par l'effectif total.", "205"),
      P("Moyenne", "La moyenne est la somme des produits (modalité × effectif) divisée par l'effectif total.", "207"),
      P("Classes", "Les classes d'égale amplitude regroupent des modalités voisines ; la classe modale est la classe d'effectif maximal.", "208-209"),
    ] },
  ],
};
