// Propriétés du manuel CIAM Terminale Littéraire (séries A1/A2), reformulées, avec la page du manuel.
// Ce fichier exporte seulement les chapitres : ils sont à ajouter au livre de Terminale dans proprietes-ciam.ts.
import { nid } from "../curriculum";
import type { ChapitreCiam, ProprieteCiam } from "./proprietes-ciam";

const n = (t: string) => nid("maths", "tle", `${t} — série A1`);
const P = (titre: string, enonce: string, page: string): ProprieteCiam => ({ titre, enonce, page });

export const CHAPITRES_TLE_L: ChapitreCiam[] = [
  { numero: 103, chapitre: "(Littéraire) Fonctions polynômes, fonctions rationnelles", notionId: n("Étude de fonctions polynômes et de fonctions rationnelles"), items: [
    P("Position relative de deux courbes", "Pour étudier la position relative de (𝒞f) et (𝒞g), on étudie le signe de f(x) − g(x) : si f(x) − g(x) < 0, (𝒞f) est au-dessous de (𝒞g) ; si = 0, elles se coupent ; si > 0, (𝒞f) est au-dessus.", "37"),
    P("Asymptote horizontale ou verticale", "Si f a une limite finie ℓ en +∞ ou −∞, la droite y = ℓ est asymptote à la courbe ; si f a une limite infinie à droite ou à gauche en x₀, la droite x = x₀ est asymptote.", "41"),
    P("Asymptote oblique", "S'il existe une fonction affine x ↦ ax + b telle que f(x) − (ax + b) a pour limite 0 en +∞ ou en −∞, la droite y = ax + b est asymptote oblique à la courbe.", "42"),
    P("Méthode d'étude d'une fonction rationnelle", "Ensemble de définition, limites aux bornes, dérivée et sens de variation, asymptotes, position relative de la courbe et de l'asymptote, intersection avec les axes, centre ou axe de symétrie.", "42-44"),
  ] },
  { numero: 104, chapitre: "(Littéraire) Fonctions logarithme et exponentielle", notionId: n("Fonction logarithme népérien"), items: [
    P("Propriété fondamentale de ln", "Pour tous réels a et b strictement positifs, ln(a × b) = ln a + ln b.", "59"),
    P("Conséquences", "Pour a, b > 0 et n entier relatif : ln(1/a) = −ln a ; ln(a/b) = ln a − ln b ; ln(aⁿ) = n ln a ; ln(√a) = ½ ln a.", "59"),
    P("Limites de ln", "lim ln x = −∞ quand x → 0 par valeurs positives ; lim ln x = +∞ quand x → +∞ ; lim x ln x = 0 en 0 ; lim (ln x)/x = 0 en +∞.", "60"),
    P("Dérivée et variations", "ln est dérivable sur ]0 ; +∞[ et sa dérivée est x ↦ 1/x ; ln est strictement croissante sur ]0 ; +∞[ et s'annule en 1.", "60"),
    P("Équations et inéquations", "ln a = ln b ⇔ a = b ; ln a < ln b ⇔ a < b (a, b > 0) ; ln a < 0 ⇔ 0 < a < 1 ; ln a > 0 ⇔ a > 1. Pour résoudre une équation avec ln, on détermine d'abord l'ensemble de définition et on ne retient que les solutions qui lui appartiennent.", "61-62"),
    P("Le nombre e", "e est l'unique réel tel que ln e = 1 ; e ≈ 2,718 281 828 456 ; il est irrationnel ; pour r rationnel, ln eʳ = r.", "61"),
    P("Dérivée de ln(ax + b)", "La fonction x ↦ ln(ax + b) (a ≠ 0) est dérivable sur son ensemble de définition et sa dérivée est x ↦ a/(ax + b).", "68"),
    P("Fonction exponentielle", "exp est la fonction réciproque de ln : b = exp(a) ⇔ a = ln b ; exp(x) = eˣ ; eˣ > 0 ; ln(eᵃ) = a ; e^(ln a) = a (a > 0).", "64-65"),
    P("Propriété fondamentale de exp", "Pour tous réels a et b, eᵃ⁺ᵇ = eᵃ × eᵇ ; e⁻ᵃ = 1/eᵃ ; eᵃ⁻ᵇ = eᵃ/eᵇ ; (eᵃ)ʳ = eʳᵃ.", "65-66"),
    P("Limites et dérivée de exp", "lim eˣ = 0 en −∞ ; lim eˣ = +∞ en +∞ ; lim x eˣ = 0 en −∞ ; lim eˣ/x = +∞ en +∞ ; exp est dérivable sur ℝ, égale à sa dérivée, strictement croissante.", "66"),
  ] },
  { numero: 105, chapitre: "(Littéraire) Équations, inéquations, systèmes", notionId: n("Systèmes linéaires dans ℝ × ℝ (couples)"), items: [
    P("Équation du second degré à une inconnue", "On résout ax² + bx + c = 0 par le discriminant Δ ; une équation bicarrée se résout en posant X = x².", "80"),
    P("Équations avec ln et exp", "Pour une équation avec ln : on détermine l'ensemble de définition D, on se ramène à ln a = ln b, on utilise a = b et on ne retient que les solutions dans D. Pour une équation avec exp, on pose X = eˣ (X > 0).", "62 et 86-87"),
    P("Système d'inéquations", "L'ensemble des solutions d'un système d'inéquations à deux inconnues est l'intersection de demi-plans ; l'intérieur d'un triangle se caractérise par un tel système.", "84"),
    P("Programmation linéaire", "Pour maximiser un bénéfice b = px + qy sous des contraintes linéaires, on trace la région des solutions et la droite de niveau ; le maximum est atteint en un sommet de la région.", "84-85"),
  ] },
  { numero: 106, chapitre: "(Littéraire) Suites numériques", notionId: n("Suites numériques"), items: [
    P("Résultats essentiels", "Suite arithmétique : uₙ₊₁ = uₙ + r, uₙ = u₀ + nr = uₚ + (n − p)r, somme = (nombre de termes) × (moyenne des termes extrêmes). Suite géométrique : uₙ₊₁ = q uₙ, uₙ = u₀ qⁿ, somme = (1er terme) × (1 − qⁿ)/(1 − q) si q ≠ 1.", "94"),
    P("Intérêts simples et composés", "Capital placé à intérêts simples au taux i : Cₙ = C₀(1 + ni). À intérêts composés : Cₙ = C₀(1 + i)ⁿ.", "94"),
    P("Sens de variation", "Une suite arithmétique de raison r ≠ 0 est croissante si r > 0 et décroissante si r < 0. Une suite géométrique à termes positifs de raison q ≠ 1 est croissante si q > 1 et décroissante si q < 1.", "97"),
    P("Convergence", "Une suite est convergente si elle a une limite finie, divergente sinon ; si une suite a une limite, cette limite est unique.", "99"),
  ] },
  { numero: 107, chapitre: "(Littéraire) Statistique", notionId: n("Statistique à deux variables"), items: [
    P("Variance et écart type", "La variance V est la moyenne des carrés des écarts à la moyenne ; l'écart type σ = √V sert à mesurer la régularité.", "114"),
    P("Série à deux caractères", "À chaque couple (x, y) on associe son effectif ; le nuage de points représente chaque modalité (x, y) par un disque d'aire proportionnelle à l'effectif.", "116"),
    P("Point moyen", "Le point moyen G du nuage a pour coordonnées les moyennes des deux séries marginales.", "117"),
    P("Méthode de Mayer", "On partage le nuage en deux sous-nuages disjoints de même effectif (dans l'ordre des points), on détermine leurs points moyens G₁ et G₂ ; la droite (G₁G₂) est la droite de Mayer qui ajuste le nuage.", "117"),
  ] },
  { numero: 108, chapitre: "(Littéraire) Probabilités", notionId: n("Probabilités"), items: [
    P("Vocabulaire", "Une expérience aléatoire a un résultat imprévisible ; l'ensemble des éventualités est l'univers Ω ; un événement est un sous-ensemble de Ω ; deux événements sont incompatibles si A ∩ B = ∅ et contraires si B est le complémentaire de A.", "127-128"),
    P("Équiprobabilité", "Quand les événements élémentaires ont la même probabilité, chacun a pour probabilité 1/n (n éventualités).", "128"),
    P("Propriétés", "0 ≤ P(A) ≤ 1 ; P(Ω) = 1 ; P(∅) = 0 ; la probabilité d'un événement est la somme des probabilités des événements élémentaires qui le composent.", "130"),
    P("Formule de Laplace", "En situation d'équiprobabilité, P(A) = (nombre de cas favorables à A)/(nombre de cas possibles).", "130"),
    P("Événements contraires, réunion", "P(A) + P(Ā) = 1 ; P(A ∪ B) = P(A) + P(B) − P(A ∩ B) ; si A et B sont incompatibles, P(A ∪ B) = P(A) + P(B).", "131-133"),
    P("Approche expérimentale", "La probabilité d'un événement peut être estimée par sa fréquence d'apparition observée sur un grand nombre d'expériences.", "129"),
  ] },
];
