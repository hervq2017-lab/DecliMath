import { useSyncExternalStore } from "react";
import { LevelId, Subject, subjectsAt } from "./curriculum";
import type { Notion } from "./curriculum";
import type { ExamItem } from "./engine";
import type { PaperSpec } from "./paper";
import { supabase } from "./lib/supabase";

export type Role = "student" | "parent" | "admin";
export type SolutionMode = "free" | "deferred" | "blocked";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string; // prototype uniquement : à remplacer par une vraie authentification
  country: string;
  level?: LevelId; // élève
  serie?: string; // lycée : A, A1, A2, C, D
  inviteCode?: string; // parent
  familyCode?: string; // parent : code commun des comptes enfants (leur mot de passe)
  parentId?: string; // élève
  goal?: string; // objectif choisi à l'accueil
  placed?: boolean; // test de positionnement fait
  prefs?: Prefs;
  suspended?: boolean; // compte suspendu par un administrateur
  paidUntil?: number; // abonnement actif jusqu'à cette date (ms)
  createdAt?: number;
  lastLogin?: number; // début de la session en cours (ms)
  notifSeen?: number; // notifications vues jusqu'à cette date (ms)
}

export type ThemeId = "nuit" | "ocean" | "clair" | "soleil";
export const THEMES: { id: ThemeId; label: string; dark: boolean; swatch: [string, string, string] }[] = [
  { id: "nuit", label: "Nuit", dark: true, swatch: ["#050b25", "#713cff", "#ffc63d"] },
  { id: "ocean", label: "Océan", dark: true, swatch: ["#04161f", "#12b5cb", "#ffd166"] },
  { id: "clair", label: "Clair", dark: false, swatch: ["#f6f4ff", "#5a3fd8", "#ffc63d"] },
  { id: "soleil", label: "Soleil", dark: false, swatch: ["#fff7ec", "#e8590c", "#2f9e44"] },
];
/** Thème choisi ; à défaut, l'ancien réglage « mode sombre » (sombre par défaut, comme la maquette). */
export const themeOf = (p?: { theme?: ThemeId; dark?: boolean }): ThemeId => p?.theme ?? (p?.dark === false ? "clair" : "nuit");

export interface Prefs {
  dailyGoal: 10 | 15 | 25;
  theme?: ThemeId;
  dark?: boolean; // ancien réglage, gardé pour compatibilité
  dyslexia: boolean;
  reduceMotion: boolean;
  sounds?: boolean; // sons doux au retour de réponse
  reminder?: boolean; // rappel de 18h00 dans la cloche
  notebook?: boolean; // méthode du cahier : démarche écrite sur papier avant de valider (actif sauf si false)
}
export const DEFAULT_PREFS: Prefs = { dailyGoal: 15, dyslexia: false, reduceMotion: false };

export interface Attempt {
  id: string;
  studentId: string;
  templateId: string;
  notionId: string;
  ctx: string;
  seed: number;
  correct: boolean;
  helpLevel: number;
  solutionViewed: boolean;
  solutionViewedBeforeAttempt: boolean;
  kind: "practice" | "check" | "placement";
  near?: boolean; // « Presque ! » : réponse proche, points d'effort
  given?: string; // réponse saisie (sert à diagnostiquer l'erreur)
  errTag?: string; // type d'erreur reconnu (voir lib/knowledge.ts)
  ts: number;
}

/** Trace d'une activité qui n'est pas un exercice classique (carte, rappel, jeu, bilan, simulation, tuteur). */
export type EvidenceSource = "carte" | "rappel" | "jeu" | "bilan" | "simulation" | "tuteur" | "etapes";
export interface Evidence {
  id: string;
  studentId: string;
  notionId: string;
  source: EvidenceSource;
  /** 0 = raté, 1 = réussi du premier coup et sans aide, entre les deux = réussi avec aide. */
  score: number;
  ts: number;
  errTag?: string;
  /** Exercice d'origine (ex. « et:et-developper ») : sert à proposer des exercices ciblés. */
  ref?: string;
}

/** Planning de révision espacée d'un élément (carte ou compétence). */
export interface MemItem {
  key: string; // carte : « c:… » ; compétence : « s:templateId »
  studentId: string;
  notionId: string;
  due: number; // prochaine révision (ms)
  interval: number; // jours
  ease: number;
  reps: number;
  lapses: number;
  last: number;
}

export interface BilanRun {
  id: string;
  studentId: string;
  ts: number;
  items: { notionId: string; correct: boolean; fresh: boolean }[];
}

export interface CheckResult {
  id: string;
  studentId: string;
  notionId: string;
  passed: boolean;
  ts: number;
}

export interface ExamRun {
  id: string;
  studentId: string;
  subject: Subject;
  level: LevelId;
  kind: "level" | "exit";
  label: string;
  startedAt: number;
  durationMin: number;
  outOf: number;
  items: ExamItem[];
  answers: Record<number, string>;
  status: "running" | "done";
  finishedAt?: number;
  results?: boolean[];
  score?: number;
}

/** Sujet imprimé par l'élève : le parent le retrouve (même graine) pour consulter le corrigé. */
export interface PaperRecord {
  id: string;
  studentId: string;
  spec: PaperSpec;
  ts: number;
}

/** Sujet imprimé par l'élève : le parent le retrouve (même graine) pour consulter le corrigé. */
export interface PaperRecord {
  id: string;
  studentId: string;
  spec: PaperSpec;
  ts: number;
}

export type PaymentStatus = "pending" | "approved" | "rejected";
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: "XOF" | "XAF" | "EUR";
  method: string;
  reference: string;
  months: number;
  status: PaymentStatus;
  ts: number;
  decidedAt?: number;
  note?: string;
}
export interface AuditEntry {
  id: string;
  ts: number;
  adminId: string;
  action: string;
  target: string;
}

export interface State {
  users: User[];
  sessionId: string | null;
  attempts: Attempt[];
  checks: CheckResult[];
  exams: ExamRun[];
  papers: PaperRecord[];
  /** Traces des méthodes d'apprentissage (cartes, rappel, jeux, bilans, simulations, tuteur). */
  evidence: Evidence[];
  /** Révisions espacées : « élève|clé » → planning. */
  memory: Record<string, MemItem>;
  bilans: BilanRun[];
  /** Cours validés à la main par un administrateur (notionId → date). */
  validated: Record<string, number>;
  solutionMode: Record<string, SolutionMode>;
  goals: Record<string, string>;
  payments: Payment[];
  audit: AuditEntry[];
  /** Aperçu administrateur : copie de l'état réel, restaurée à la sortie (rien n'est enregistré pendant l'aperçu). */
  previewBackup?: string;
}

const KEY = "reussite-terminale-v2";
const empty: State = { users: [], sessionId: null, attempts: [], checks: [], exams: [], papers: [], evidence: [], memory: {}, bilans: [], validated: {}, solutionMode: {}, goals: {}, payments: [], audit: [] };

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty, ...JSON.parse(raw) };
  } catch {
    /* stockage indisponible */
  }
  return empty;
}

let state = load();
const listeners = new Set<() => void>();

export function resetAllData() {
  update(() => ({ ...empty }));
}

export function update(fn: (s: State) => State) {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Lecture directe de l'état et abonnement aux changements (pour la synchronisation Supabase, hors composants React). */
export const getState = () => state;
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

// ---------- Accès par classe ----------
// Prototype : les e-mails listés dans VITE_ADMIN_EMAILS (séparés par des virgules) deviennent administrateurs.
// Une vraie protection exige un backend (rôles côté serveur).
const ADMIN_EMAILS = String(import.meta.env?.VITE_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAdmin = (u: User | null | undefined) => u?.role === "admin";
/** L'élève ne voit que les cours de sa classe ; l'administrateur voit tout. */
export const canAccessNotion = (u: User | null | undefined, n: Notion) => isAdmin(u) || (u?.role === "student" && n.level === (u.level ?? "tle"));

export function setSerie(id: string, serie: string | undefined) {
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, serie } : u)) }));
}

export function setLessonValidated(notionId: string, ok: boolean) {
  update((s) => {
    const validated = { ...s.validated };
    if (ok) validated[notionId] = Date.now(); else delete validated[notionId];
    return { ...s, validated };
  });
}

export const uid = () => Math.random().toString(36).slice(2, 10);
export const currentUser = (s: State) => { const u = s.users.find((x) => x.id === s.sessionId); return u && !u.suspended ? u : null; };

// ---------- Authentification (prototype) ----------

export function signUp(input: {
  role: Role; name: string; email: string; password: string; country: string; level?: LevelId; inviteCode?: string; goal?: string;
}): string | null {
  const email = input.email.trim().toLowerCase();
  if (state.users.some((u) => u.email === email)) return "Un compte existe déjà avec cet e-mail.";
  if (input.password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
  let parentId: string | undefined;
  let country = input.country;
  if (input.role === "student" && input.inviteCode?.trim()) {
    const parent = state.users.find((u) => u.inviteCode === input.inviteCode!.trim().toUpperCase());
    if (!parent) return "Code d'invitation inconnu.";
    parentId = parent.id;
    country = parent.country;
  }
  const user: User = {
    id: uid(), role: ADMIN_EMAILS.includes(email) ? "admin" : input.role, name: input.name.trim(), email, password: input.password, country, createdAt: Date.now(),
    level: input.role === "student" && !ADMIN_EMAILS.includes(email) ? input.level ?? "tle" : undefined,
    parentId,
    goal: input.goal,
    inviteCode: input.role === "parent" ? Math.random().toString(36).slice(2, 8).toUpperCase() : undefined,
    lastLogin: Date.now(),
  };
  update((s) => ({
    ...s,
    users: [...s.users, user],
    sessionId: user.id,
    solutionMode: parentId ? { ...s.solutionMode, [user.id]: "deferred" } : s.solutionMode,
  }));
  return null;
}

// ---------- Comptes enfants créés par le parent ----------

export interface ChildInput { name: string; level: LevelId; serie?: string }

const PWD_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sans caractères ambigus (0/O, 1/l/I)
export function newPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => PWD_CHARS[b % PWD_CHARS.length]).join("");
}
function newLogin(name: string, taken: Set<string>): string {
  const base = name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "eleve";
  let login: string;
  do login = `${base}.${Math.floor(1000 + Math.random() * 9000)}`; while (taken.has(login));
  return login;
}

/** Crée les comptes élèves (identifiant + mot de passe générés) rattachés au parent. */
function buildChildren(parent: User, kids: ChildInput[], existing: User[]): User[] {
  const password = parent.familyCode ?? newPassword();
  const taken = new Set(existing.map((u) => u.email));
  return kids.map((k) => {
    const login = newLogin(k.name, taken);
    taken.add(login);
    return {
      id: uid(), role: "student" as const, name: k.name.trim(), email: login, password, country: parent.country,
      level: k.level, serie: k.serie || undefined, parentId: parent.id, createdAt: Date.now(),
    };
  });
}

/** Inscription d'un parent avec ses enfants : un accès par enfant est créé dès l'inscription. */
export function signUpParent(input: { name: string; email: string; password: string; country: string; children: ChildInput[] }): string | null {
  const kids = input.children.filter((k) => k.name.trim());
  if (kids.length === 0) return "Ajoutez au moins un enfant.";
  const err = signUp({ role: "parent", name: input.name, email: input.email, password: input.password, country: input.country });
  if (err) return err;
  const parent = state.users.find((u) => u.id === state.sessionId)!;
  addChildren(parent.id, kids);
  return null;
}

/** Ajoute des enfants à un parent existant ; leurs accès sont lisibles ensuite via accessOf. */
export function addChildren(parentId: string, kids: ChildInput[]) {
  update((s) => {
    const parent = s.users.find((u) => u.id === parentId);
    if (!parent) return s;
    const created = buildChildren(parent, kids.filter((k) => k.name.trim()), s.users);
    const mode = { ...s.solutionMode };
    created.forEach((c) => { mode[c.id] = "deferred"; });
    return { ...s, users: [...s.users, ...created], solutionMode: mode };
  });
}

/** Code famille du parent (créé au besoin) : c'est le mot de passe de tous ses enfants. `renew` en génère un nouveau. */
export function ensureFamilyCode(parentId: string, renew = false): void {
  const parent = state.users.find((u) => u.id === parentId && u.role === "parent");
  if (!parent || (parent.familyCode && !renew)) return;
  const code = newPassword();
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === parentId ? { ...u, familyCode: code } : u.parentId === parentId ? { ...u, password: code } : u)) }));
}

/** Enfants d'une famille à partir de son code (écran de connexion). */
export function familyChildren(code: string): { name: string; login: string }[] {
  const parent = state.users.find((u) => u.role === "parent" && u.familyCode && u.familyCode === code.trim());
  return parent ? studentsOf(state, parent.id).filter((c) => !c.suspended).map((c) => ({ name: c.name, login: c.email })) : [];
}

/** Génère un nouveau mot de passe pour l'enfant (l'ancien cesse de fonctionner). Illimité. */
export function regenerateAccess(parentId: string, childId: string): string | null {
  if (!state.users.some((u) => u.id === childId && u.parentId === parentId)) return null;
  const password = newPassword();
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === childId ? { ...u, password } : u)) }));
  return password;
}

/** Nouvel identifiant + nouveau mot de passe (si l'identifiant a fuité). */
export function regenerateLogin(parentId: string, childId: string) {
  update((s) => {
    const child = s.users.find((u) => u.id === childId && u.parentId === parentId);
    if (!child) return s;
    const email = newLogin(child.name, new Set(s.users.map((u) => u.email)));
    return { ...s, users: s.users.map((u) => (u.id === childId ? { ...u, email } : u)) };
  });
}

export function logIn(email: string, password: string): string | null {
  const u = state.users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
  if (!u) return "E-mail ou mot de passe incorrect.";
  if (u.suspended) return "Ce compte est suspendu. Contactez le support.";
  const promote = ADMIN_EMAILS.includes(u.email) && u.role !== "admin";
  update((s) => ({ ...s, sessionId: u.id, users: s.users.map((x) => (x.id === u.id ? { ...x, lastLogin: Date.now(), ...(promote ? { role: "admin" as const } : {}) } : x)) }));
  return null;
}
/** Si un aperçu administrateur est en cours, on restaure d'abord l'état réel. */
export const logOut = () => {
  void supabase?.auth.signOut();
  update((s) => ({ ...(s.previewBackup ? (JSON.parse(s.previewBackup) as State) : s), previewBackup: undefined, sessionId: null }));
};

export const markNotificationsSeen = (id: string) => update((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, notifSeen: Date.now() } : u)) }));

export function updateUser(id: string, patch: Partial<User>) {
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
}
export function setPrefs(id: string, patch: Partial<Prefs>) {
  update((s) => ({
    ...s,
    users: s.users.map((u) => (u.id === id ? { ...u, prefs: { ...DEFAULT_PREFS, ...u.prefs, ...patch } } : u)),
  }));
}

export function setLevel(studentId: string, level: LevelId) {
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === studentId ? { ...u, level } : u)) }));
}

export function linkStudent(studentId: string, code: string): string | null {
  const parent = state.users.find((u) => u.inviteCode === code.trim().toUpperCase());
  if (!parent) return "Code d'invitation inconnu.";
  update((s) => ({
    ...s,
    users: s.users.map((u) => (u.id === studentId ? { ...u, parentId: parent.id } : u)),
    solutionMode: { ...s.solutionMode, [studentId]: s.solutionMode[studentId] ?? "deferred" },
  }));
  return null;
}

// ---------- Règles de corrigé ----------

export function modeFor(s: State, studentId: string): SolutionMode {
  const student = s.users.find((u) => u.id === studentId);
  if (!student?.parentId) return "free"; // sans parent lié : élève autonome
  return s.solutionMode[studentId] ?? "deferred";
}
export function canViewSolution(mode: SolutionMode, hasAttempted: boolean) {
  if (mode === "blocked") return false;
  if (mode === "deferred") return hasAttempted;
  return true;
}

// ---------- Maîtrise par notion ----------

export type Mastery = "none" | "started" | "fragile" | "progress" | "mastered" | "expert";

export const MASTERY_LABEL: Record<Mastery, string> = {
  none: "Non commencé",
  started: "En cours",
  fragile: "Fragile",
  progress: "En progression",
  mastered: "Maîtrisé",
  expert: "Expert",
};

/**
 * Maîtrisé = au moins 3 réussites sans corrigé, dans au moins 2 contextes différents
 * (comprendre ≠ reconnaître un énoncé). Expert = maîtrisé + contrôle de compréhension réussi.
 */
export function masteryFor(s: State, studentId: string, notionId: string) {
  const list = s.attempts.filter((a) => a.studentId === studentId && a.notionId === notionId);
  const count = list.length;
  if (count === 0) return { status: "none" as Mastery, rate: 0, count };
  const rate = list.filter((a) => a.correct).length / count;
  const clean = list.filter((a) => a.correct && !a.solutionViewed);
  const mastered = clean.length >= 3 && new Set(clean.map((a) => a.ctx)).size >= 2;
  const checked = s.checks.some((c) => c.studentId === studentId && c.notionId === notionId && c.passed);
  if (mastered && checked && rate > 0.8) return { status: "expert" as Mastery, rate, count };
  if (mastered) return { status: "mastered" as Mastery, rate, count };
  if (count < 3) return { status: "started" as Mastery, rate, count };
  const dependence = list.filter((a) => a.solutionViewed).length / count;
  if (rate < 0.5 || dependence > 0.5) return { status: "fragile" as Mastery, rate, count };
  return { status: "progress" as Mastery, rate, count };
}

export function recommendation(status: Mastery): string {
  switch (status) {
    case "none": return "Lis le cours, puis fais un premier exercice.";
    case "started": return "Continue : change de contexte pour vérifier que tu as compris.";
    case "fragile": return "Reviens au cours, puis refais un exercice sans corrigé.";
    case "progress": return "Réussis encore un exercice dans un autre contexte pour valider la notion.";
    case "mastered": return "Passe le contrôle de compréhension pour devenir expert.";
    case "expert": return "Excellent ! Passe à une autre notion ou fais une épreuve.";
  }
}

export const studentsOf = (s: State, parentId: string) => s.users.filter((u) => u.parentId === parentId);
export { subjectsAt };
