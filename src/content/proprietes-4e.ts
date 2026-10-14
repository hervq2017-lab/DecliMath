// Propriétés du manuel CIAM 4ème (reformulées, avec la page du manuel). Voir proprietes-ciam.ts.
import { nid } from "../curriculum";
import type { LivreCiam, ProprieteCiam } from "./proprietes-ciam";

const m4 = (title: string) => nid("maths", "4e", title);
const P = (titre: string, enonce: string, page: string): ProprieteCiam => ({ titre, enonce, page });

export const LIVRE_4E: LivreCiam = {
  livre: "CIAM 4ème",
  chapitres: [
    { numero: 2, chapitre: "Symétries", notionId: m4("Symétries et translations"), items: [
      P("Symétrie centrale", "Des points alignés ont pour images des points alignés ; une droite a pour image une droite qui lui est parallèle ; un segment a pour image un segment de même longueur ; le milieu d'un segment a pour image le milieu de l'image du segment.", "20"),
      P("Symétrie orthogonale", "Même conservation des alignements, des longueurs et des milieux ; deux droites parallèles ont pour images deux droites parallèles ; une droite perpendiculaire à l'axe est sa propre image.", "20"),
      P("Cercles et angles", "Un cercle a pour image un cercle de même rayon ; un angle a pour image un angle de même mesure ; deux droites perpendiculaires ont pour images deux droites perpendiculaires.", "20"),
      P("Point sur deux lignes", "Si un point appartient à deux lignes, alors son image appartient aux images de ces deux lignes.", "20"),
    ] },
    { numero: 3, chapitre: "Distances", notionId: m4("Distances"), items: [
      P("Axe médian de deux parallèles", "Une droite perpendiculaire à deux droites parallèles (D₁) et (D₂) les coupe en A et B. La médiatrice de [AB] est l'axe médian des deux droites ; c'est l'axe de symétrie de la figure.", "36"),
      P("Points de l'axe médian", "Si un point appartient à l'axe médian de deux droites parallèles, alors il est équidistant de ces deux droites, et réciproquement.", "36"),
      P("Bissectrice et équidistance", "Si un point appartient à la bissectrice d'un angle, alors il est équidistant des supports des côtés de cet angle.", "37"),
      P("Axes de symétrie de deux sécantes", "Deux droites sécantes non perpendiculaires ont deux axes de symétrie perpendiculaires : les bissectrices des angles qu'elles forment. Un point équidistant des deux droites appartient à l'un de ces axes.", "37-38"),
      P("Deux cercles, rayons r et r′ (r′ < r)", "Si OO′ < r − r′ ou OO′ > r + r′ : aucun point commun. Si OO′ = r − r′ ou OO′ = r + r′ : un seul point commun (tangents). Si r − r′ < OO′ < r + r′ : deux points communs (sécants).", "39"),
      P("Droite et cercle", "(D) est une droite, H le pied de la perpendiculaire à (D) passant par O. Si OH < r : deux points communs ; si OH = r : un seul point commun (tangente) ; si OH > r : aucun point commun.", "40"),
      P("Tangente", "La tangente en H au cercle est la droite perpendiculaire au rayon [OH] en H ; H est le point de contact.", "40"),
    ] },
    { numero: 4, chapitre: "Triangle", notionId: m4("Droite des milieux"), items: [
      P("Droite des milieux", "Dans un triangle, la droite qui passe par les milieux de deux côtés est parallèle au support du troisième côté, et le segment joignant ces milieux mesure la moitié du troisième côté.", "46"),
      P("Réciproque (milieu)", "Dans un triangle, si une droite passe par le milieu d'un côté et est parallèle au support d'un autre côté, alors elle passe par le milieu du troisième côté.", "47"),
      P("Hauteurs et orthocentre", "Les trois hauteurs d'un triangle sont concourantes ; leur point commun est l'orthocentre.", "48"),
      P("Bissectrices et cercle inscrit", "Les trois bissectrices des angles d'un triangle sont concourantes ; leur point commun est le centre du cercle inscrit, cercle intérieur au triangle et tangent aux supports de ses côtés.", "49"),
      P("Médiane", "La médiane d'un triangle est la droite qui passe par un sommet et par le milieu du côté opposé ; elle partage le triangle en deux triangles de même aire.", "50"),
      P("Centre de gravité", "Les trois médianes d'un triangle sont concourantes ; leur point commun est le centre de gravité, situé aux 2/3 de chaque médiane à partir du sommet : AG = (2/3) AA′.", "51"),
      P("Triangle isocèle", "L'axe de symétrie d'un triangle isocèle est à la fois la médiatrice de sa base, la bissectrice, la hauteur et la médiane passant par son sommet principal.", "52"),
      P("Triangle équilatéral", "Dans un triangle équilatéral, le centre de gravité est aussi l'orthocentre, le centre du cercle circonscrit et le centre du cercle inscrit.", "52"),
      P("Reconnaître un triangle isocèle", "Dans un triangle, si une droite est à la fois bissectrice et hauteur, ou bissectrice et médiane, ou hauteur et médiane, alors le triangle est isocèle.", "53"),
      P("Théorème de Pythagore", "Si un triangle est rectangle, alors le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés : a² = b² + c².", "54"),
      P("Réciproque de Pythagore", "Si, dans un triangle, le carré d'un côté est égal à la somme des carrés des deux autres côtés, alors ce triangle est rectangle.", "55"),
      P("Hauteur du triangle rectangle", "Dans un triangle rectangle, le produit des côtés de l'angle droit est égal au produit de l'hypoténuse et de la hauteur issue de l'angle droit : a × h = b × c.", "57"),
    ] },
    { numero: 5, chapitre: "Translations et vecteurs", notionId: m4("Vecteurs"), items: [
      P("Égalité de vecteurs", "AB = DC (vecteurs) équivaut à : les segments [AC] et [BD] ont le même milieu.", "70"),
      P("Milieu d'un segment", "I est le milieu de [AB] équivaut à AI = IB (vecteurs), et aussi à IA + IB = 0 (vecteur nul).", "70-74"),
      P("Relation de Chasles", "Pour tous points A, B, C du plan : AB + BC = AC. La somme des vecteurs AB et BC est le vecteur AC.", "71"),
      P("Somme de plusieurs vecteurs", "Pour calculer une somme de plusieurs vecteurs, on peut déplacer et regrouper certains vecteurs.", "73"),
      P("Opposé d'un vecteur", "AB + BA = 0 (vecteur nul) ; BA est l'opposé de AB et on note BA = −AB. Deux vecteurs opposés ont même direction, même longueur et des sens contraires.", "73"),
      P("Translation", "L'image de M par la translation de vecteur AB est M′ équivaut à MM′ = AB (vecteurs).", "74"),
      P("Propriétés des translations", "Une translation conserve les alignements, les milieux, les longueurs, les angles, le parallélisme et l'orthogonalité ; une droite a pour image une droite de même direction ; un cercle a pour image un cercle de même rayon.", "75"),
    ] },
    { numero: 6, chapitre: "Projection et repérage", notionId: m4("Projection et repérage"), items: [
      P("Coordonnées", "Dans un repère (O, I, J), un point M a pour coordonnées (x ; y) : x est son abscisse (sur l'axe (OI)) et y son ordonnée (sur l'axe (OJ)).", "85"),
      P("Repère orthogonal et orthonormé", "Le repère (O, I, J) est orthogonal si (OI) ⊥ (OJ), et orthonormé si, de plus, OI = OJ.", "86"),
    ] },
    { numero: 7, chapitre: "Angle au centre, polygones réguliers", notionId: m4("Angle au centre et polygones réguliers"), items: [
      P("Corde, arc", "Dans un cercle, la corde [AB] sous-tend les deux arcs d'extrémités A et B ; la longueur d'un arc est proportionnelle à la mesure de l'angle au centre qui l'intercepte.", "93-94"),
      P("Arcs et cordes de même longueur", "Dans un cercle, si deux arcs ont la même longueur alors les cordes qui les sous-tendent ont la même longueur, et réciproquement.", "95"),
      P("Angles au centre adjacents", "La somme des mesures d'angles au centre adjacents qui font le tour du centre est 360°.", "95"),
      P("Polygone régulier", "Un polygone régulier est un polygone inscriptible dans un cercle et ayant ses côtés de même longueur ; son angle au centre mesure 360° divisé par le nombre de côtés.", "96"),
    ] },
    { numero: 8, chapitre: "Solides de l'espace", notionId: m4("Solides de l'espace"), items: [
      P("Prisme et cylindre", "Volume : V = B × h (B aire d'une base, h hauteur). Aire latérale : A = P × h (P périmètre d'une base).", "109"),
      P("Sphère et boule", "Aire de la sphère : A = 4 π r². Volume de la boule : V = 4 π r³ ÷ 3.", "109"),
      P("Pyramide, cône", "Les faces latérales d'une pyramide sont des triangles ayant un sommet commun ; la face qui ne contient pas ce sommet est la base. Un cône a un sommet, une surface latérale et une base circulaire.", "100-108"),
    ] },
    { numero: 9, chapitre: "Droites et plans de l'espace", notionId: m4("Droites et plans de l'espace"), items: [
      P("Droite déterminée", "Dans l'espace, deux points distincts déterminent une droite.", "114"),
      P("Plan déterminé", "Un plan est déterminé par trois points non alignés, ou deux droites parallèles, ou deux droites sécantes, ou une droite et un point extérieur à cette droite.", "114-115"),
      P("Droite dans un plan", "La droite qui passe par deux points d'un plan est contenue dans ce plan. On peut trouver autant de plans que l'on veut contenant une droite donnée.", "114-115"),
      P("Droite et plan sécants", "Une droite et un plan sont sécants lorsqu'ils ont un seul point commun.", "117"),
      P("Droite perpendiculaire à un plan", "Une droite est perpendiculaire à un plan lorsqu'elle est perpendiculaire à deux droites sécantes de ce plan.", "117"),
    ] },
    { numero: 10, chapitre: "Calcul littéral", notionId: m4("Calcul littéral"), items: [
      P("Règles de priorité", "En l'absence de parenthèses, la multiplication est prioritaire sur l'addition et la soustraction, et le calcul d'une puissance est prioritaire sur la multiplication.", "137"),
      P("Supprimer des parenthèses", "a + (b − c) = a + b − c ; a − (b + c) = a − b − c ; a − (b − c) = a − b + c.", "132"),
      P("Distributivité", "a (x + y) = a x + a y ; a (x − y) = a x − a y ; (a + b)(x + y) = a x + a y + b x + b y.", "134-135"),
      P("Puissances", "aⁿ est le produit de n facteurs égaux à a. (a b)ⁿ = aⁿ bⁿ ; aᵐ × aⁿ = aᵐ⁺ⁿ ; (aᵐ)ⁿ = aᵐⁿ ; si n est pair (−a)ⁿ = aⁿ, si n est impair (−a)ⁿ = −aⁿ ; aᵐ ÷ aⁿ = aᵐ⁻ⁿ pour m > n (a ≠ 0). a¹ = a et a⁰ = 1 (a ≠ 0).", "136-137"),
      P("Produits remarquables", "(a + b)² = a² + 2ab + b² ; (a − b)² = a² − 2ab + b² ; (a + b)(a − b) = a² − b².", "138"),
    ] },
    { numero: 11, chapitre: "Nombres rationnels", notionId: m4("Nombres rationnels"), items: [
      P("PGCD et PPCM", "Le PGCD de deux nombres est le produit des facteurs premiers communs avec le plus petit exposant ; leur PPCM est le produit de tous les facteurs avec le plus grand exposant.", "147"),
      P("Nombre rationnel", "Un nombre rationnel est un nombre égal à une fraction ou à l'opposé d'une fraction ; l'ensemble des rationnels est noté ℚ. Tout nombre décimal relatif est un rationnel (D ⊂ ℚ).", "148-149"),
      P("Signes", "−a/b = a/(−b) = −(a/b) = (−a)/b.", "149"),
      P("Somme et différence", "On réduit au même dénominateur positif, puis on calcule la somme (ou la différence) des numérateurs.", "150"),
      P("Produit", "(a/b) × (c/d) = (a × c)/(b × d).", "151"),
      P("Inverse", "Si a et b sont non nuls, (a/b) × (b/a) = 1 : a/b et b/a sont inverses l'un de l'autre.", "152"),
      P("Quotient", "Le quotient de r par s (s ≠ 0) est q tel que r = s q ; r ÷ s = r × (1/s).", "153"),
    ] },
    { numero: 12, chapitre: "Équations, inéquations", notionId: m4("Équations et inéquations dans ℚ"), items: [
      P("Équation a x = b", "Pour résoudre a x = b (a ≠ 0), on multiplie chaque membre par 1/a : la solution est b/a.", "165"),
      P("Équation a x + b = c x + d", "On se ramène successivement à a x + b = c, puis à a x = b, puis à x = u ; toutes ces équations ont la même solution.", "167"),
      P("Inégalités et opérations", "Ajouter un même nombre aux deux membres d'une inégalité conserve le sens. Multiplier par un nombre positif conserve le sens ; multiplier par un nombre négatif change le sens.", "168"),
      P("Transformer une inéquation", "On obtient une inéquation qui a les mêmes solutions en ajoutant un même nombre aux deux membres, en multipliant par un nombre positif non nul, ou en multipliant par un nombre négatif non nul en changeant le sens.", "169"),
      P("Solutions de x < u", "Les solutions de l'inéquation x < u sont les nombres strictement plus petits que u.", "170"),
    ] },
    { numero: 13, chapitre: "Approximations décimales d'un nombre", notionId: m4("Approximations décimales d'un nombre"), items: [
      P("Produit en notation scientifique", "(a × 10ᵖ) × (b × 10ᵠ) = (a × b) × 10ᵖ⁺ᵠ.", "181"),
      P("Nombre décimal d'ordre n", "Un nombre décimal d'ordre n est un nombre décimal qui peut s'écrire comme un produit d'un entier relatif par 10⁻ⁿ ; il s'écrit avec n chiffres après la virgule.", "184"),
      P("Troncature", "La troncature à n décimales de x est le nombre décimal d'ordre n obtenu en ne conservant que les n premiers chiffres après la virgule.", "185"),
      P("Approximations par défaut et par excès", "Pour a/b : q est l'approximation décimale d'ordre n par défaut du quotient de a par b (n chiffres après la virgule) ; le nombre décimal d'ordre n qui suit q est l'approximation par excès.", "186-187"),
      P("Arrondi d'ordre n", "On calcule le quotient avec n + 1 chiffres après la virgule : si le dernier chiffre est 0, 1, 2, 3 ou 4, l'arrondi est l'approximation par défaut ; s'il est 5, 6, 7, 8 ou 9, c'est l'approximation par excès.", "188"),
    ] },
    { numero: 15, chapitre: "Statistiques", notionId: m4("Statistique"), items: [
      P("Fréquence", "La fréquence d'une modalité est le quotient de l'effectif de la modalité par l'effectif total ; la somme des fréquences vaut 1 (ou 100 %).", "213"),
      P("Moyenne", "Moyenne = somme des produits (modalité × effectif) divisée par l'effectif total.", "214"),
      P("Diagramme semi-circulaire", "Chaque secteur a un angle au centre proportionnel à l'effectif de la modalité ; le demi-disque (180°) représente l'effectif total.", "216"),
    ] },
  ],
};
