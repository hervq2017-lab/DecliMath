// CIAM Terminale SE (série D) : assemblage des gabarits écrits d'après le manuel SE.
import { register, Template } from "./core";
import { TDA } from "./ciam-tle-d-a";
import { TDB } from "./ciam-tle-d-b";
import { TDC } from "./ciam-tle-d-c";
import { TDD } from "./ciam-tle-d-d";

const D: Template[] = [...TDA, ...TDB, ...TDC, ...TDD];

register(...D);
