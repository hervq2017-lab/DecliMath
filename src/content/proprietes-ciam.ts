// Rubrique « Propriétés » rédigée classe par classe d'après le contenu des manuels CIAM.
// Chaque propriété est une reformulation (pas une copie) d'un énoncé du chapitre indiqué ; `page` donne la page du manuel
// où elle figure, pour que l'enseignant puisse la vérifier. Une classe n'apparaît ici qu'une fois son manuel relu en entier.
import { LevelId, nid } from "../curriculum";
import { LIVRE_5E } from "./proprietes-5e";
import { LIVRE_4E } from "./proprietes-4e";
import { LIVRE_3E } from "./proprietes-3e";
import { LIVRE_2NDE } from "./proprietes-2nde";
import { LIVRE_1ERE } from "./proprietes-1ere";
import { LIVRE_TLE } from "./proprietes-tle";

export interface ProprieteCiam {
  titre: string;
  enonce: string;
  /** Page du manuel (numérotation imprimée). */
  page: string;
}
export interface ChapitreCiam {
  numero: number;
  chapitre: string;
  /** Notion de l'application correspondant au chapitre (pour y renvoyer l'élève). */
  notionId?: string;
  items: ProprieteCiam[];
}
export interface LivreCiam {
  livre: string;
  chapitres: ChapitreCiam[];
}

const m6 = (title: string) => nid("maths", "6e", title);
const P = (titre: string, enonce: string, page: string): ProprieteCiam => ({ titre, enonce, page });

export const PROPRIETES_CIAM: Partial<Record<LevelId, LivreCiam>> = {
  "2nde": LIVRE_2NDE,
  "1ere": LIVRE_1ERE,
  tle: LIVRE_TLE,
  "3e": LIVRE_3E,
  "4e": LIVRE_4E,
  "5e": LIVRE_5E,
  "6e": {
    livre: "CIAM 6ème",
    chapitres: [
      { numero: 1, chapitre: "Droites", notionId: m6("Droites et points"), items: [
        P("Droites sécantes", "Deux droites sécantes ont un seul point commun.", "13"),
        P("Perpendiculaire par un point", "Par un point donné, on ne peut tracer qu'une seule droite perpendiculaire à une droite donnée.", "15"),
        P("Deux perpendiculaires à une même droite", "Deux droites perpendiculaires à une même droite sont parallèles.", "16"),
        P("Parallèle à une parallèle", "Si deux droites sont parallèles, toute droite parallèle à l'une est parallèle à l'autre.", "19"),
        P("Perpendiculaire à une parallèle", "Si deux droites sont parallèles, toute droite perpendiculaire à l'une est perpendiculaire à l'autre.", "19"),
        P("Sécante à une parallèle", "Si deux droites sont parallèles, toute droite sécante à l'une est sécante à l'autre.", "19"),
        P("Demi-droites opposées", "Un point d'une droite la partage en deux demi-droites ; elles sont dites opposées.", "20"),
        P("Hauteur d'un triangle", "Une hauteur est la droite qui passe par un sommet et qui est perpendiculaire au support du côté opposé. Un triangle a trois hauteurs.", "22"),
        P("Triangle rectangle", "Un triangle rectangle a deux côtés dont les supports sont perpendiculaires ; le côté opposé à l'angle droit est l'hypoténuse.", "22"),
        P("Quadrilatère", "Un quadrilatère a quatre côtés ; ses diagonales joignent deux sommets opposés.", "23"),
      ] },
      { numero: 2, chapitre: "Mesures de segments", notionId: m6("Segments"), items: [
        P("Notations", "(AB) désigne une droite, [AB] un segment et AB la distance (un nombre). Une mesure n'a de sens qu'avec son unité.", "34"),
        P("Unités de longueur", "Chaque unité vaut 10 fois la suivante : km, hm, dam, m, dm, cm, mm. Ainsi 1 dam = 10 m et 1 mm = 0,001 m.", "35"),
        P("Milieu d'un segment", "I est le milieu de [AB] signifie que I appartient à [AB] et que AI = IB.", "35"),
        P("Médiatrice d'un segment", "La médiatrice d'un segment est la droite qui passe par son milieu et qui est perpendiculaire à son support.", "36"),
      ] },
      { numero: 3, chapitre: "Cercles", notionId: m6("Cercles et disques"), items: [
        P("Cercle", "Le cercle de centre A et de rayon r est l'ensemble des points du plan situés à la distance r de A.", "44"),
        P("Rayon, corde, diamètre", "Un rayon joint le centre à un point du cercle ; une corde joint deux points du cercle ; un diamètre est une corde qui passe par le centre.", "44"),
        P("Triangles superposables", "Deux triangles dont les trois côtés sont respectivement de même longueur sont superposables.", "46"),
        P("Triangle isocèle", "Un triangle isocèle a deux côtés de même longueur ; le sommet principal est opposé à la base.", "47"),
        P("Triangle équilatéral", "Un triangle équilatéral a ses trois côtés de même longueur.", "48"),
        P("Périmètre d'un cercle", "P = 2 × π × r. On utilise une valeur approchée de π, par exemple π ≈ 3,14 (3,14 n'est pas la valeur exacte de π).", "49-50"),
        P("Aire d'un disque", "A = r × r × π.", "49"),
      ] },
      { numero: 4, chapitre: "Angles", notionId: m6("Angles"), items: [
        P("Écriture d'un angle", "Dans BAC, la lettre du milieu désigne le sommet : A est le sommet de l'angle BAC.", "54"),
        P("Angles particuliers", "Angle droit : 90°. Angle plat : 180°. Angle nul : 0°. La mesure d'un angle est comprise entre 0° et 180°.", "55"),
        P("Aigu et obtus", "Un angle aigu mesure entre 0° et 90° ; un angle obtus mesure entre 90° et 180°.", "56"),
        P("Angles adjacents", "Deux angles adjacents ont le même sommet, un côté commun et sont de part et d'autre de ce côté. La mesure de l'angle total est la somme des mesures.", "56"),
        P("Bissectrice d'un angle", "La bissectrice d'un angle est la droite qui passe par son sommet et le partage en deux angles de même mesure.", "60"),
      ] },
      { numero: 5, chapitre: "Figures symétriques par rapport à un point", notionId: m6("Figures symétriques par rapport à un point"), items: [
        P("Points symétriques", "M et P sont symétriques par rapport à O signifie que O est le milieu de [MP]. O est son propre symétrique.", "66"),
        P("Segments symétriques", "Deux segments symétriques par rapport à un point ont la même longueur.", "69"),
        P("Angles symétriques", "Deux angles symétriques par rapport à un point ont la même mesure.", "70"),
        P("Centre de symétrie", "O est un centre de symétrie d'une figure si chaque point de la figure a pour symétrique par rapport à O un point de la figure. Le centre d'un cercle est son centre de symétrie.", "71"),
      ] },
      { numero: 6, chapitre: "Parallélogrammes", notionId: m6("Parallélogrammes"), items: [
        P("Diagonales d'un parallélogramme", "Les diagonales d'un parallélogramme se coupent en leur milieu ; ce point est le centre du parallélogramme.", "79"),
        P("Réciproque", "Un quadrilatère dont les diagonales se coupent en leur milieu est un parallélogramme.", "79"),
        P("Côtés opposés", "Les côtés opposés d'un parallélogramme ont la même longueur.", "80"),
        P("Réciproque des côtés", "Un quadrilatère dont les côtés opposés ont la même longueur est un parallélogramme.", "80"),
        P("Rectangle", "Un rectangle est un quadrilatère qui a ses angles droits. Un quadrilatère qui a trois angles droits en a quatre. Un rectangle est un parallélogramme.", "81"),
        P("Carré", "Un carré est un rectangle dont les côtés ont la même longueur.", "82"),
        P("Périmètres", "Rectangle : 2 × (L + l). Carré : 4 × c. Parallélogramme : 2 × (a + b). Triangle : a + b + c.", "82"),
        P("Aires", "Rectangle : L × l. Carré : c × c. Parallélogramme : base × hauteur. Triangle : (base × hauteur) ÷ 2.", "82"),
      ] },
      { numero: 7, chapitre: "Figures symétriques par rapport à une droite", notionId: m6("Figures symétriques par rapport à une droite"), items: [
        P("Points symétriques", "E et F sont symétriques par rapport à (D) signifie que (D) est la médiatrice de [EF]. Tout point de (D) est son propre symétrique.", "91"),
        P("Points alignés", "Les symétriques de points alignés par rapport à une droite sont alignés.", "93"),
        P("Segments symétriques", "Deux segments symétriques par rapport à une droite ont la même longueur.", "94"),
        P("Angles symétriques", "Deux angles symétriques par rapport à une droite ont la même mesure.", "96"),
        P("Axe de symétrie", "(D) est un axe de symétrie d'une figure si chaque point de la figure a pour symétrique par rapport à (D) un point de la figure.", "97"),
        P("Losange", "Un losange est un quadrilatère dont les diagonales se coupent en leur milieu et ont des supports perpendiculaires ; les supports des diagonales sont ses axes de symétrie. C'est un parallélogramme dont les quatre côtés ont la même longueur.", "98-99"),
        P("Aire du losange", "A = (1/2) × a × b, où a et b sont les longueurs des diagonales.", "99"),
      ] },
      { numero: 8, chapitre: "Pavés et cylindres droits", notionId: m6("Pavés droits et cylindres droits"), items: [
        P("Cube", "Un cube est un pavé droit dont toutes les arêtes ont la même longueur.", "110"),
        P("Volume d'un pavé droit", "V = a × b × c (les trois arêtes dans la même unité).", "111"),
        P("Cylindre droit", "Un cylindre droit a deux bases qui sont des disques superposables ; sa surface latérale se déplie en rectangle.", "112"),
        P("Volume d'un cylindre", "V = (aire de la base) × hauteur.", "113"),
        P("Capacités", "1 dm³ = 1 litre.", "114"),
      ] },
      { numero: 9, chapitre: "Multiples et diviseurs d'un nombre entier naturel", notionId: m6("Multiples et diviseurs"), items: [
        P("Multiples de 1 et de lui-même", "Chaque nombre entier naturel est multiple de lui-même et de 1. 0 est multiple de tout nombre entier naturel.", "124-125"),
        P("Nombres pairs", "Les multiples de 2 sont les nombres pairs ; les autres nombres entiers naturels sont impairs.", "125"),
        P("Divisible par 10, 100, 1 000", "Un nombre est divisible par 10 (100, 1 000…) s'il se termine par 0 (00, 000…).", "126"),
        P("Divisible par 2", "Un nombre est divisible par 2 s'il se termine par 0, 2, 4, 6 ou 8.", "127"),
        P("Divisible par 5", "Un nombre est divisible par 5 s'il se termine par 0 ou 5.", "127"),
        P("Divisible par 3", "Un nombre est divisible par 3 si la somme de ses chiffres est un multiple de 3.", "127"),
        P("Divisible par 9", "Un nombre est divisible par 9 si la somme de ses chiffres est un multiple de 9.", "127"),
        P("Diviseurs", "Si a = b × c, alors a est un multiple de b et b est un diviseur de a. Le plus petit diviseur d'un nombre non nul est 1, le plus grand est ce nombre lui-même.", "128-129"),
      ] },
      { numero: 10, chapitre: "Comparaison des nombres décimaux", notionId: m6("Nombres décimaux"), items: [
        P("Partie entière, partie décimale", "Un nombre décimal est la somme de sa partie entière et de sa partie décimale : 312,68 = 312 + 0,68.", "136"),
        P("Zéros inutiles", "On ne change pas un nombre décimal en ajoutant ou en supprimant des zéros à la fin de sa partie décimale : 12,7 = 12,70. Tout nombre entier naturel est un nombre décimal.", "136"),
        P("Rang des chiffres", "Après la virgule : dixièmes, centièmes, millièmes. Avant : unités, dizaines, centaines… On écrit les nombres en séparant les chiffres par tranches de trois.", "137"),
        P("Comparer : parties entières différentes", "Si les parties entières sont différentes, le plus grand nombre est celui qui a la plus grande partie entière.", "138"),
        P("Comparer : même partie entière", "Si les parties entières sont égales, on compare les chiffres de même rang, de gauche à droite, jusqu'au premier rang où ils diffèrent.", "138"),
        P("Ranger", "Ranger dans l'ordre croissant, c'est écrire du plus petit au plus grand ; dans l'ordre décroissant, du plus grand au plus petit.", "139"),
        P("Encadrement", "Encadrer 2,6 par deux entiers consécutifs, c'est écrire 2 < 2,6 < 3.", "141"),
      ] },
      { numero: 11, chapitre: "Addition, soustraction, multiplication des nombres décimaux", notionId: m6("Décimaux et opérations"), items: [
        P("Additionner, soustraire", "On aligne les virgules les unes sous les autres avant d'additionner ou de soustraire.", "148-149"),
        P("Contrôler une soustraction", "On contrôle une soustraction par une addition : (a − b) + b = a.", "150"),
        P("Multiplier des décimaux", "On multiplie comme avec des entiers ; le produit a autant de chiffres après la virgule que les deux facteurs ensemble.", "151-153"),
        P("Contrôles d'une multiplication", "Estimer le produit, vérifier le dernier chiffre, ou faire la preuve par 9 : ces contrôles détectent certaines erreurs mais ne prouvent pas qu'un résultat est juste.", "152-154"),
        P("Regrouper", "On peut déplacer et regrouper les termes d'une somme ou les facteurs d'un produit pour calculer plus vite.", "154-155"),
        P("Priorités", "Une opération entre parenthèses est prioritaire. En l'absence de parenthèses, la multiplication est prioritaire sur l'addition et la soustraction.", "156-157"),
        P("Distributivité", "Pour multiplier une somme (ou une différence) par un nombre, on multiplie chaque terme par ce nombre puis on additionne (ou on soustrait) les produits.", "158"),
      ] },
      { numero: 12, chapitre: "Division", notionId: m6("Division"), items: [
        P("Dividende, diviseur, quotient, reste", "Dividende = diviseur × quotient + reste, avec un reste toujours plus petit que le diviseur.", "170"),
        P("Quotient par défaut et par excès", "Si le reste n'est pas nul, le quotient entier par défaut est le quotient de la division ; le quotient par excès est ce quotient augmenté de 1.", "169"),
        P("Multiplier ou diviser par 10, 100, 1 000", "On décale la virgule de 1, 2, 3 rangs vers la droite pour multiplier, vers la gauche pour diviser.", "173"),
        P("Multiplier ou diviser par 0,1 ; 0,01 ; 0,001", "Multiplier par 0,1 ; 0,01 ; 0,001 revient à diviser par 10 ; 100 ; 1 000. Diviser par 0,1 ; 0,01 ; 0,001 revient à multiplier par 10 ; 100 ; 1 000.", "173"),
        P("Quotient inchangé (1)", "Le quotient ne change pas si l'on multiplie le dividende et le diviseur par un même nombre non nul.", "175"),
        P("Quotient inchangé (2)", "Le quotient ne change pas si l'on divise le dividende et le diviseur par un même nombre non nul.", "175"),
      ] },
      { numero: 13, chapitre: "Fractions", notionId: m6("Fractions"), items: [
        P("Fraction", "Le quotient de a par b (b ≠ 0) se note a/b ; a est le numérateur, b le dénominateur. Le dénominateur n'est jamais nul.", "183"),
        P("Fractions égales", "On obtient une fraction égale en multipliant (ou en divisant) le numérateur et le dénominateur par un même nombre non nul.", "184"),
        P("Simplifier", "Simplifier une fraction, c'est diviser ses deux termes par un diviseur commun.", "184"),
        P("Fraction décimale", "Une fraction décimale a pour dénominateur 1, 10, 100, 1 000… Tout nombre décimal s'écrit sous cette forme.", "185-186"),
        P("Somme", "Même dénominateur : a/d + b/d = (a + b)/d.", "187"),
        P("Différence", "Même dénominateur : a/d − b/d = (a − b)/d, si a ≥ b.", "188"),
        P("Entier fois fraction", "a × (b/d) = (a × b)/d.", "188"),
        P("Fraction d'une quantité", "Prendre a/b d'une quantité, c'est multiplier cette quantité par a et diviser par b.", "189"),
      ] },
      { numero: 14, chapitre: "Proportionnalité", notionId: m6("Proportionnalité"), items: [
        P("Tableau de proportionnalité", "Dans un tableau de proportionnalité, on passe d'une ligne à l'autre en multipliant par un même nombre : le coefficient de proportionnalité.", "197"),
        P("Prix unitaire", "Quand le tableau relie une quantité à son prix, le coefficient est le prix d'une unité.", "197-198"),
        P("Multiplier ou diviser une colonne", "Dans un tableau de proportionnalité, si l'on multiplie (ou si l'on divise) par un même nombre non nul les deux nombres d'une colonne, on obtient une autre colonne du tableau.", "202"),
        P("Somme de colonnes", "Dans un tableau de proportionnalité, la colonne obtenue en additionnant deux colonnes est aussi une colonne du tableau.", "201-202"),
        P("Pourcentage", "Prendre p % d'une quantité, c'est multiplier cette quantité par p et diviser par 100.", "199"),
        P("Échelle", "Sur un plan à l'échelle 1/n, 1 cm sur le plan représente n cm sur le terrain. Il faut employer la même unité des deux côtés.", "204"),
      ] },
      { numero: 15, chapitre: "Nombres décimaux relatifs", notionId: m6("Nombres décimaux relatifs"), items: [
        P("Entiers et décimaux relatifs", "ℤ désigne l'ensemble des entiers relatifs et D l'ensemble des décimaux relatifs. Tout entier naturel est un entier relatif, tout entier relatif est un décimal relatif. 0 est le seul nombre à la fois positif et négatif.", "212-213"),
        P("Opposé", "Deux nombres sont opposés quand ce sont les abscisses de deux points symétriques par rapport à l'origine d'une droite graduée. L'opposé de 0 est 0.", "214"),
        P("Somme de deux opposés", "La somme de deux nombres entiers relatifs opposés est égale à 0.", "218"),
      ] },
    ],
  },
};
