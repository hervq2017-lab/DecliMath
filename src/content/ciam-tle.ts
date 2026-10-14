// CIAM Terminale : assemblage des gabarits (SM = série C ; SE = série D ; Littéraire = séries A).
import { register, Template } from "./core";
import { TC_ARITH } from "./ciam-tle-c-arith";
import { TC_VEC } from "./ciam-tle-c-vec";
import { TC_CPLX } from "./ciam-tle-c-cplx";
import { TC_ISO } from "./ciam-tle-c-iso";
import { TC_SIMIL } from "./ciam-tle-c-simil";
import { TC_ESP } from "./ciam-tle-c-esp";
import { TC_CONIQ } from "./ciam-tle-c-coniq";
import { TC_PROBA } from "./ciam-tle-c-proba";
import { TC_LIM } from "./ciam-tle-c-lim";
import { TC_DER } from "./ciam-tle-c-der";
import { TC_PRIM } from "./ciam-tle-c-prim";
import { TC_LN } from "./ciam-tle-c-ln";
import { TC_EXP } from "./ciam-tle-c-exp";
import { TC_SUITES } from "./ciam-tle-c-suites";
import { TC_INTEG } from "./ciam-tle-c-integ";
import { TC_DIFF } from "./ciam-tle-c-diff";

const C: Template[] = [...TC_ARITH, ...TC_VEC, ...TC_CPLX, ...TC_ISO, ...TC_SIMIL, ...TC_ESP, ...TC_CONIQ, ...TC_PROBA, ...TC_LIM, ...TC_DER, ...TC_PRIM, ...TC_LN, ...TC_EXP, ...TC_SUITES, ...TC_INTEG, ...TC_DIFF];

register(...C);
import "./ciam-tle-l";
import "./ciam-tle-d";
