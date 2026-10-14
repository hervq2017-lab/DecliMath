// Profils d'examens par pays (collecte du 2026-10-11, sources publiques).
// "Non trouvé" n'est jamais affiché comme une information : le champ est simplement absent.
// Confiance Moyenne / Faible = à faire valider par un enseignant local avant d'être présenté comme officiel.

export type Confidence = "Élevée" | "Moyenne" | "Faible";
export type ExamCycle = "primaire" | "college" | "entree";

export interface ExamProfile {
  country: string; // code COUNTRIES (+ GN, CD absents du référentiel pour l'instant)
  cycle: ExamCycle;
  name: string;
  status: string;
  /** Seuil d'admission, tel que publié. */
  threshold?: string;
  structure?: string;
  coefficients?: string;
  confidence: Confidence;
  source: string;
}

export interface ExamPaper {
  country: string;
  exam: string;
  paper: string;
  /** Coefficient ou barème, tel que publié (ex. « 3 », « /20 »). */
  weight?: string;
  duration?: string;
  note?: string;
  year: number;
  confidence: Confidence;
  source: string;
}

export interface ExamSession {
  country: string;
  exam: string;
  year: number;
  dates: string;
  candidates?: number;
  centers?: number;
  result?: string;
  confidence: Confidence;
  source: string;
}

const S = {
  bjCep: "https://www.gouv.bj/article/1780/examen-session-juin-2022-message-ministre-enseignements-maternel-primaire/",
  bjBepc: "https://www.gouv.bj/article/3113/examen-bepc-session-juin-2025-message-ministre-veronique-tognifode-candidats-parents-eleves/",
  tg26: "https://www.koaci.com/article/2026/06/09/togo/societe/togo-debut-de-lexamen-du-bepc-2026-pour-144-257-candidats_197401.html",
  tg24: "https://www.koaci.com/article/2024/06/11/togo/societe/togo-examen-du-bepc-2024-en-cours-epreuves-et-effectif-national_178596.html",
  ciCepe: "https://www.afrique-sur7.fr/cepe-en-cote-divoire",
  ciBepc: "https://www.fratmat.info/article/213142/societe/eacuteducation/education-nationale-changement-des-coefficients-au-premier-cycle-une-fausse-information-selon-le-ministere",
  snDecret: "https://www.vie-publique.sn/documents/11719/decret-2026-1112-creation-cfee-suppression-concours-sixieme-education-nationale",
  snBfem: "https://www.sencampus.com/dossiers/le-bfem-et-apres/le-bfem-comment-ca-marche",
  bfAuf: "https://apprendre.auf.org/wp-content/uploads/2021/08/ethique_et_deontologie_U4_Examens_concours_sco_primaire.pdf",
  bfSidwaya: "https://www.sidwaya.info/cep-et-bepc-session-2026-tout-est-pret-pour-le-debut-des-epreuves-ecrites-mardi-2-juin/",
  bfAnnales: "https://www.fasoeducation.bf/espace_eleves/annales/troisieme/annales_francais_3e.pdf",
  mlDef: "https://www.afrique-sur7.fr/def-et-bac-2025-au-mali-le-cnece-a-pied-doeuvre-pour-des-resultats-rapides",
  neBepc: "https://simoon-cv.com/niger/blog/resultats-bepc-niger-2026",
  gnBepc: "https://guineenews.org/2025/06/16/lancement-des-premieres-epreuves-du-bepc-a-kindia-entre-reserve-et-espoir-chez-les-candidats/",
  cmTribune: "https://cameroon-tribune.cm/article.html/77754/fr.html/details_2",
  cmInfos: "https://infospratiques.cm/?p=451",
  cdEnafep: "https://fr.allafrica.com/stories/202606050387.html",
  gaCep: "https://gabonmediatime.com/gabon-40-000-eleves-orientes-en-6eme-sur-40-627-admis-au-cep/",
  cgBepc: "https://fr.allafrica.com/stories/202407080483.html",
  tdCal: "https://tchadinfos.com/2025/04/28/education-revision-du-calendrier-des-examens-nationaux-2024-2025/",
  snCfee: "https://fr.allafrica.com/stories/202606170326.html",
};

export const EXAM_PROFILES: ExamProfile[] = [
  { country: "BJ", cycle: "primaire", name: "CEP", status: "Existe", structure: "4 jours d'épreuves (juin 2022).", confidence: "Moyenne", source: S.bjCep },
  { country: "BJ", cycle: "college", name: "BEPC", status: "Existe", structure: "Depuis 2024, tous les candidats composent en PCT (Physique-Chimie-Technologie) et en LV2 ; séries moderne long/court supprimées.", confidence: "Moyenne", source: S.bjBepc },
  { country: "TG", cycle: "primaire", name: "CEPD", status: "Existe", confidence: "Faible", source: S.tg26 },
  { country: "TG", cycle: "college", name: "BEPC", status: "Existe", structure: "3 jours d'écrits (2024). J1 : SVT, Français, ECM. J2 : Maths, Anglais, langue nationale au choix (Ewé, Kabyè, Arabe). J3 : Histoire-Géo, Sciences physiques, Agriculture, Musique, Dessin, Enseignement ménager.", confidence: "Moyenne", source: S.tg24 },
  { country: "CI", cycle: "primaire", name: "CEPE", status: "Existe", threshold: "85 points sur 170 (= 10/20)", structure: "Écrit en 1 jour (18 mai 2026), EPS séparée (20 avril 2026).", coefficients: "Barème en points (total 170).", confidence: "Moyenne", source: S.ciCepe },
  { country: "CI", cycle: "college", name: "BEPC", status: "Existe", structure: "Taux de réussite 2026 : 52,17 %.", coefficients: "Non vérifiés : une liste circulant en 2021 a été démentie par le ministère.", confidence: "Moyenne", source: S.ciBepc },
  { country: "CI", cycle: "entree", name: "Pas d'examen séparé", status: "Intégré au CEPE", structure: "Les points du CEPE servent à l'affectation en 6e (≈ 500 227 élèves affectés en 2026), via mendob-ci.org ou SMS « DOB » au 9991.", confidence: "Moyenne", source: S.ciCepe },
  { country: "SN", cycle: "primaire", name: "CFEE", status: "Créé par décret n°2026-1112 du 21 mai 2026", threshold: "Moyenne ≥ 5/10 sur l'ensemble des épreuves", structure: "« Diplôme unique » de fin de cycle élémentaire. Options Français (épreuve facultative en arabe) et Franco-arabe (épreuve facultative en français). Sessions normale et de remplacement.", confidence: "Élevée", source: S.snDecret },
  { country: "SN", cycle: "college", name: "BFEM", status: "Existe", threshold: "≥ 10/20 (9,5 par délibération spéciale) ; accès au 2e groupe dès 8/20", structure: "Option Français (Classique, Moderne, Technique) ou Franco-arabe. 1er groupe : 11 épreuves obligatoires. 2e groupe : 3 écrits (texte suivi de questions, maths, 1 épreuve au choix selon la section).", confidence: "Moyenne", source: S.snBfem },
  { country: "SN", cycle: "entree", name: "Concours d'entrée en 6e", status: "Supprimé (décret 2026-1112)", structure: "Remplacé par le CFEE comme diplôme unique. Modalités d'orientation vers la 6e non précisées.", confidence: "Élevée", source: S.snDecret },
  { country: "BF", cycle: "primaire", name: "CEP", status: "Existe", threshold: "Moyenne ≥ 10/20 ; zéro éliminatoire en opérations/problème et en histoire-géo", structure: "Écrit + pratique (dessin/travail manuel) + oral (récitation/chant, lecture) + sport (60 m, saut).", coefficients: "Notes par épreuve (pas de coefficients dans la source).", confidence: "Moyenne", source: S.bfAuf },
  { country: "BF", cycle: "college", name: "BEPC", status: "Existe", structure: "Éducation civique devenue matière à part entière (2026). Français 1er tour : dictée 20 pts + étude de texte 80 pts.", coefficients: "2026 : Français 3, Maths 3, autres matières 2. Les annales 2013-2019 indiquent Français 4 (1er tour) et 5 (2e tour) : la règle a évolué.", confidence: "Moyenne", source: S.bfSidwaya },
  { country: "BF", cycle: "entree", name: "Concours d'entrée en 6e", status: "Existe (organisé avec le CEP)", structure: "Mêmes épreuves que le CEP. Nombre de places fixé chaque année. Âge maximum : 15 ans au 31 décembre.", confidence: "Moyenne", source: S.bfAuf },
  { country: "ML", cycle: "college", name: "DEF (équivalence à confirmer)", status: "Existe", structure: "Épreuves du 2 au 4 juin 2025, gérées par le CNECE.", confidence: "Faible", source: S.mlDef },
  { country: "NE", cycle: "college", name: "BEPC", status: "Existe", structure: "Écrits le 25 juin 2026 dans les 8 régions, correction centralisée. Plus de session de rattrapage automatique depuis 2023 (site non officiel).", confidence: "Faible", source: S.neBepc },
  { country: "GN", cycle: "primaire", name: "CEE", status: "Existe", confidence: "Faible", source: S.gnBepc },
  { country: "GN", cycle: "college", name: "BEPC", status: "Existe", structure: "Début des épreuves le 16 juin 2025.", confidence: "Moyenne", source: S.gnBepc },
  { country: "CM", cycle: "primaire", name: "CEP (francophone) / FSLC (anglophone)", status: "Existe", structure: "Écrits 16-17 juin 2026. Français : dictée-questions 1 h + production d'écrits 1 h. Maths : calcul rapide 20 min + problèmes 1 h 30. Culture générale. EPS pratique 6-8 mai ; oral 17 juin.", confidence: "Moyenne", source: S.cmTribune },
  { country: "CM", cycle: "college", name: "BEPC et BEPC bilingue", status: "Existe", structure: "Écrits 1-4 juin 2026 ; facultatives et oraux de l'option bilingue le 5 juin.", confidence: "Moyenne", source: S.cmInfos },
  { country: "CM", cycle: "entree", name: "Common Entrance (anglophone)", status: "Existe (13 mai 2026)", structure: "Conditionne l'entrée au secondaire anglophone. Un concours d'entrée en 6e francophone est évoqué dans la presse (contenu non vérifié).", confidence: "Faible", source: S.cmInfos },
  { country: "CD", cycle: "primaire", name: "ENAFEP", status: "Existe", structure: "Fin du cycle primaire après 6 ans. Épreuves 4-5 juin 2026.", confidence: "Moyenne", source: S.cdEnafep },
  { country: "GA", cycle: "primaire", name: "CEP", status: "Existe", structure: "Après le CEP, une commission d'orientation et d'admission affecte les élèves en 6e selon les places disponibles.", confidence: "Moyenne", source: S.gaCep },
  { country: "GA", cycle: "entree", name: "Concours d'entrée en 6e", status: "Annulé (dénoncé par des parents en 2022)", structure: "Remplacé par l'orientation selon les places disponibles.", confidence: "Moyenne", source: S.gaCep },
  { country: "CG", cycle: "college", name: "BEPC", status: "Existe", structure: "4 jours d'écrits. Calculatrices programmables et téléphones interdits.", confidence: "Moyenne", source: S.cgBepc },
  { country: "TD", cycle: "primaire", name: "CEFEPD (supposé)", status: "Existe (supposé)", confidence: "Faible", source: S.tdCal },
  { country: "TD", cycle: "college", name: "BEF (Brevet de l'Enseignement Fondamental)", status: "Existe", structure: "Épreuves du 26 au 30 mai 2025.", confidence: "Moyenne", source: S.tdCal },
  { country: "TD", cycle: "entree", name: "Concours d'entrée dans l'enseignement technique et professionnel", status: "Existe", structure: "Samedi 31 mai 2025. Concours d'entrée en 6e cité sans date.", confidence: "Moyenne", source: S.tdCal },
];

const bfepc = (paper: string, weight: string, o: Partial<ExamPaper> = {}): ExamPaper =>
  ({ country: "BF", exam: "BEPC", paper, weight, year: 2026, confidence: "Moyenne", source: S.bfSidwaya, ...o });
const bfcep = (paper: string, weight: string, note?: string): ExamPaper =>
  ({ country: "BF", exam: "CEP", paper, weight, note, year: 2021, confidence: "Moyenne", source: S.bfAuf });
const sn = (exam: string, paper: string, weight?: string, note?: string): ExamPaper =>
  ({ country: "SN", exam, paper, weight, note, year: 2026, confidence: "Moyenne", source: S.snBfem });
const cm = (paper: string, duration?: string, note?: string): ExamPaper =>
  ({ country: "CM", exam: "CEP", paper, duration, note, year: 2026, confidence: "Moyenne", source: S.cmTribune });

export const EXAM_PAPERS: ExamPaper[] = [
  sn("BFEM 1er groupe", "Dictée", "1"), sn("BFEM 1er groupe", "Texte suivi de questions (TSQ)", "1"),
  sn("BFEM 1er groupe", "Composition française", "2"), sn("BFEM 1er groupe", "Mathématiques", "3"),
  sn("BFEM 1er groupe", "SVT", "2"), sn("BFEM 1er groupe", "Histoire et Géographie", "2"),
  sn("BFEM 1er groupe", "Éducation civique", "1"), sn("BFEM 1er groupe", "Anglais (LV1) écrit", "2"),
  sn("BFEM 1er groupe", "Anglais (LV1) oral", "1"), sn("BFEM 1er groupe", "Sciences physiques", "2"),
  sn("BFEM 1er groupe", "EPS", "2"),
  sn("BFEM 1er groupe", "Épreuve facultative (artistique, musicale, ESF, LV2…)", "Bonus : points au-dessus de 10/20", "Ne peut que relever la moyenne"),
  sn("BFEM 2e groupe", "Texte suivi de questions (français, ou arabe en Franco-arabe)", undefined, "3 écrits au total"),
  sn("BFEM 2e groupe", "Mathématiques"), sn("BFEM 2e groupe", "Épreuve au choix selon la section"),
  bfcep("Rédaction", "/10", "Écrit"), bfcep("Dictée", "/10", "Écrit"),
  bfcep("Étude de texte et présentation", "/20 (étude de texte) et /10 (présentation)", "Écrit"),
  bfcep("Opérations", "/20", "Zéro éliminatoire (avec problème)"), bfcep("Problème", "/20", "Zéro éliminatoire (avec opérations)"),
  bfcep("Histoire-Géographie", "/20", "Zéro éliminatoire"), bfcep("Sciences", "/20"),
  bfcep("Dessin ou travail manuel", "/10", "Pratique"), bfcep("Récitation ou chant", "/10", "Oral"),
  bfcep("Lecture", "/10", "Oral"), bfcep("Sport (60 m + saut)", "/10", "Dispense possible"),
  bfepc("Français", "Coef. 3", { duration: "1er tour 2 h (annales 2013-2019)", note: "Dictée /20 + étude de texte /80 (maniement de la langue /40, compréhension-expression /40). Annales 2013-2019 : coef. 4." }),
  bfepc("Mathématiques", "Coef. 3"),
  bfepc("Autres matières (dont Éducation civique)", "Coef. 2", { note: "Éducation civique matière à part entière en 2026." }),
  bfepc("Français 2e tour (étude de texte)", "Coef. 5 (annales 2013-2018)", { exam: "BEPC 2e tour", duration: "1 h 30", note: "Maniement de la langue /60 + compréhension-expression /40.", year: 2018, source: S.bfAnnales }),
  cm("Français : dictée-questions", "1 h", "Texte du programme (2026 : extrait d'un roman camerounais)"),
  cm("Français : production d'écrits", "1 h"), cm("Mathématiques : calcul rapide", "20 min"), cm("Mathématiques : problèmes", "1 h 30"),
  cm("Culture générale (histoire, géographie, éducation civique…)", undefined, "Liste incomplète dans la source"),
];

export const EXAM_SESSIONS: ExamSession[] = [
  { country: "BJ", exam: "CEP", year: 2022, dates: "7-10 juin", candidates: 226676, centers: 775, confidence: "Élevée", source: S.bjCep },
  { country: "BJ", exam: "BEPC", year: 2025, dates: "Début 10 juin", candidates: 128893, result: "+3,1 % d'inscrits vs 2024", confidence: "Élevée", source: S.bjBepc },
  { country: "TG", exam: "BEPC", year: 2024, dates: "10-12 juin", candidates: 137321, confidence: "Moyenne", source: S.tg24 },
  { country: "CI", exam: "CEPE", year: 2026, dates: "Écrit 18 mai ; EPS 20 avril", candidates: 597171, centers: 2763, result: "85,76 % d'admis (512 106)", confidence: "Moyenne", source: S.ciCepe },
  { country: "CI", exam: "BEPC", year: 2026, dates: "Début 2 juin", result: "52,17 % d'admis", confidence: "Moyenne", source: S.ciBepc },
  { country: "SN", exam: "CFEE", year: 2026, dates: "17-18 juin", candidates: 306485, centers: 2081, result: "Résultats annoncés en moins de 10 jours", confidence: "Moyenne", source: S.snCfee },
  { country: "SN", exam: "BFEM", year: 2026, dates: "Mi-juillet (1er groupe), +1 semaine (2e groupe)", candidates: 160180, result: "160 180 admis dont 57 237 via le 2e groupe", confidence: "Moyenne", source: S.snBfem },
  { country: "BF", exam: "CEP + concours d'entrée en 6e", year: 2026, dates: "Début 2 juin", candidates: 341732, confidence: "Élevée", source: S.bfSidwaya },
  { country: "BF", exam: "BEPC", year: 2026, dates: "Début 2 juin", candidates: 218049, confidence: "Élevée", source: S.bfSidwaya },
  { country: "ML", exam: "DEF", year: 2025, dates: "2-4 juin", confidence: "Moyenne", source: S.mlDef },
  { country: "NE", exam: "BEPC", year: 2025, dates: "—", candidates: 120033, result: "46,08 % d'admis (55 313) ; 37,56 % en 2024", confidence: "Faible", source: S.neBepc },
  { country: "GN", exam: "BEPC", year: 2025, dates: "Début 16 juin", candidates: 44895, centers: 121, result: "Chiffres de la région de Kindia seulement", confidence: "Moyenne", source: S.gnBepc },
  { country: "CM", exam: "BEPC", year: 2026, dates: "1-4 juin", result: "Résultats prévus le 10 juillet", confidence: "Moyenne", source: S.cmInfos },
  { country: "CM", exam: "CEP / FSLC", year: 2026, dates: "16-17 juin", result: "Résultats au plus tard le 10 juillet", confidence: "Moyenne", source: S.cmInfos },
  { country: "CD", exam: "ENAFEP", year: 2026, dates: "4-5 juin", candidates: 2353123, result: "48 % de filles", confidence: "Moyenne", source: S.cdEnafep },
  { country: "GA", exam: "CEP", year: 2022, dates: "—", candidates: 40627, result: "40 000 orientés en 6e", confidence: "Moyenne", source: S.gaCep },
  { country: "CG", exam: "BEPC", year: 2024, dates: "9-12 juillet", candidates: 119050, centers: 526, confidence: "Faible", source: S.cgBepc },
  { country: "TD", exam: "BEF", year: 2025, dates: "26-30 mai", confidence: "Moyenne", source: S.tdCal },
];

/** Ce qui reste à collecter (priorité : coefficients et durées pour des examens blancs réalistes). */
export const EXAM_GAPS: string[] = [
  "Coefficients et durées par épreuve (BEPC, CEP) : arrêtés ministériels, directions des examens (DEXCO, DECO, CNECE…).",
  "Programmes officiels par niveau : ministères, UNESCO-IBE, AUF.",
  "Annales corrigées officielles (hors Burkina Faso).",
  "Centrafrique : aucune source exploitable. Mali, Niger, Congo, Gabon, RDC : structure des examens à trouver.",
  "Concours d'entrée en 6e : statut à confirmer pays par pays (supprimé au Sénégal, annulé au Gabon, intégré au CEPE en Côte d'Ivoire).",
];

export const profileFor = (country: string, cycle: ExamCycle) => EXAM_PROFILES.find((p) => p.country === country && p.cycle === cycle);
export const papersFor = (country: string, exam: string) => EXAM_PAPERS.filter((p) => p.country === country && (p.exam === exam || p.exam.startsWith(exam + " ")));
