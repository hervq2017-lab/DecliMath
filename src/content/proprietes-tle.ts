// Livre de Terminale : propriétés CIAM des trois manuels (SM = série C, Littéraire = séries A ; SE = série D à ajouter ici).
import type { LivreCiam } from "./proprietes-ciam";
import { CHAPITRES_TLE_SM_A } from "./proprietes-tle-sm-a";
import { CHAPITRES_TLE_SM_B } from "./proprietes-tle-sm-b";
import { CHAPITRES_TLE_L } from "./proprietes-tle-l";

export const LIVRE_TLE: LivreCiam = {
  livre: "CIAM Terminale (SM, Littéraire)",
  chapitres: [...CHAPITRES_TLE_SM_A, ...CHAPITRES_TLE_SM_B, ...CHAPITRES_TLE_L],
};
