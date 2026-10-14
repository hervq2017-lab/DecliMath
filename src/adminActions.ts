// Actions réservées à l'administrateur : comptes, paiements, journal. Chaque action vérifie le rôle et s'inscrit au journal.
// Prototype : les données restent dans le navigateur ; la vraie protection viendra du backend (règles d'accès côté serveur).
import { LEVELS, LevelId, NOTIONS } from "./curriculum";
import { Attempt, CheckResult, Payment, State, uid, update, User } from "./store";

const MONTH = 30 * 864e5;

const isAdminState = (s: State, adminId: string) => s.users.some((u) => u.id === adminId && u.role === "admin");
const log = (s: State, adminId: string, action: string, target: string): State => ({ ...s, audit: [{ id: uid(), ts: Date.now(), adminId, action, target }, ...(s.audit ?? [])].slice(0, 500) });

/** Applique `fn` seulement si `adminId` est administrateur ; renvoie un message d'erreur sinon. */
function asAdmin(adminId: string, fn: (s: State) => State | string): string | null {
  let err: string | null = null;
  update((s) => {
    if (!isAdminState(s, adminId)) { err = "Action réservée aux administrateurs."; return s; }
    const r = fn(s);
    if (typeof r === "string") { err = r; return s; }
    return r;
  });
  return err;
}

export function setSuspended(adminId: string, userId: string, suspended: boolean): string | null {
  return asAdmin(adminId, (s) => {
    const u = s.users.find((x) => x.id === userId);
    if (!u) return "Compte introuvable.";
    if (u.role === "admin") return "Un compte administrateur ne peut pas être suspendu.";
    return log({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, suspended } : x)) }, adminId, suspended ? "Suspension" : "Réactivation", u.email);
  });
}

/** Génère un mot de passe provisoire (prototype) et le renvoie à l'administrateur pour qu'il le communique. */
export function resetPassword(adminId: string, userId: string): { error: string | null; password?: string } {
  const pwd = Math.random().toString(36).slice(2, 10);
  const error = asAdmin(adminId, (s) => {
    const u = s.users.find((x) => x.id === userId);
    if (!u) return "Compte introuvable.";
    if (u.role === "admin") return "Impossible de réinitialiser un administrateur ici.";
    return log({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, password: pwd } : x)) }, adminId, "Mot de passe réinitialisé", u.email);
  });
  return error ? { error } : { error: null, password: pwd };
}

export function deleteAccount(adminId: string, userId: string): string | null {
  return asAdmin(adminId, (s) => {
    const u = s.users.find((x) => x.id === userId);
    if (!u) return "Compte introuvable.";
    if (u.role === "admin") return "Un compte administrateur ne peut pas être supprimé.";
    const gone = new Set([userId]);
    const users = s.users.filter((x) => !gone.has(x.id)).map((x) => (x.parentId === userId ? { ...x, parentId: undefined } : x));
    const mine = <T extends { studentId: string }>(a: T[]) => a.filter((x) => !gone.has(x.studentId));
    return log({ ...s, users, attempts: mine(s.attempts), checks: mine(s.checks), exams: mine(s.exams), papers: mine(s.papers), payments: (s.payments ?? []).filter((p) => p.userId !== userId) }, adminId, "Suppression de compte", u.email);
  });
}

export function addPayment(adminId: string, input: Omit<Payment, "id" | "ts" | "status">): string | null {
  return asAdmin(adminId, (s) => {
    const u = s.users.find((x) => x.id === input.userId);
    if (!u) return "Choisissez un compte.";
    if (!(input.amount > 0)) return "Le montant doit être supérieur à 0.";
    if (!(input.months >= 1)) return "La durée doit être d'au moins 1 mois.";
    if (!input.reference.trim()) return "Indiquez la référence du paiement.";
    const p: Payment = { ...input, reference: input.reference.trim(), id: uid(), ts: Date.now(), status: "pending" };
    return log({ ...s, payments: [p, ...(s.payments ?? [])] }, adminId, "Paiement enregistré", `${u.email} · ${p.amount} ${p.currency}`);
  });
}

export function decidePayment(adminId: string, paymentId: string, approve: boolean, note?: string): string | null {
  return asAdmin(adminId, (s) => {
    const p = (s.payments ?? []).find((x) => x.id === paymentId);
    if (!p) return "Paiement introuvable.";
    if (p.status !== "pending") return "Ce paiement a déjà été traité.";
    const now = Date.now();
    const u = s.users.find((x) => x.id === p.userId);
    const users = approve ? s.users.map((x) => (x.id === p.userId ? { ...x, paidUntil: Math.max(now, x.paidUntil ?? 0) + p.months * MONTH } : x)) : s.users;
    const payments = s.payments.map((x) => (x.id === paymentId ? { ...x, status: approve ? ("approved" as const) : ("rejected" as const), decidedAt: now, note: note?.trim() || undefined } : x));
    return log({ ...s, users, payments }, adminId, approve ? "Paiement validé" : "Paiement refusé", `${u?.email ?? p.userId} · ${p.amount} ${p.currency}`);
  });
}

export function revokeAccess(adminId: string, userId: string): string | null {
  return asAdmin(adminId, (s) => {
    const u = s.users.find((x) => x.id === userId);
    if (!u) return "Compte introuvable.";
    return log({ ...s, users: s.users.map((x) => (x.id === userId ? { ...x, paidUntil: undefined } : x)) }, adminId, "Accès retiré", u.email);
  });
}

export const hasActivePlan = (u: { paidUntil?: number } | undefined, now = Date.now()) => !!u?.paidUntil && u.paidUntil > now;

/** L'administrateur voit l'application comme ce compte. L'état réel est sauvegardé puis restauré à la sortie : aucune donnée n'est modifiée. */
export function startPreview(adminId: string, userId: string): string | null {
  return asAdmin(adminId, (s) => {
    if (s.previewBackup) return "Un aperçu est déjà en cours.";
    const u = s.users.find((x) => x.id === userId);
    if (!u) return "Compte introuvable.";
    if (u.role === "admin") return "Choisissez un élève ou un parent.";
    if (u.suspended) return "Ce compte est suspendu : réactivez-le d'abord.";
    const logged = log(s, adminId, "Aperçu du compte", u.email);
    return { ...logged, previewBackup: JSON.stringify({ ...logged, previewBackup: undefined }), sessionId: userId };
  });
}

/** Activité fictive de l'élève de démo : profils variés (expert, maîtrisé, en cours, fragile, démarré) sur les dernières semaines. */
function demoActivity(studentId: string, level: LevelId, now: number): { attempts: Attempt[]; checks: CheckResult[] } {
  const notions = NOTIONS.filter((n) => n.level === level).slice(0, 12);
  // [bonnes réponses, mauvaises, solution vue, contextes, contrôle réussi]
  const profiles: [number, number, number, number, boolean][] = [
    [6, 0, 0, 3, true], [5, 1, 0, 2, false], [4, 1, 0, 2, false], [2, 3, 3, 2, false], [2, 1, 0, 1, false], [1, 0, 0, 1, false],
    [3, 4, 4, 2, false], [5, 0, 0, 3, true], [3, 1, 1, 2, false], [1, 2, 1, 1, false],
  ];
  const attempts: Attempt[] = [];
  const checks: CheckResult[] = [];
  notions.slice(0, profiles.length).forEach((n, i) => {
    const [good, bad, seen, ctxs, checked] = profiles[i];
    for (let k = 0; k < good + bad; k++) {
      const correct = k < good;
      const viewed = k >= good + bad - seen;
      attempts.push({
        id: uid(), studentId, templateId: `demo-${n.id}`, notionId: n.id, ctx: `ctx${k % ctxs}`, seed: 1000 + i * 37 + k, correct,
        helpLevel: viewed ? 2 : correct ? 0 : 1, solutionViewed: viewed, solutionViewedBeforeAttempt: false, kind: "practice",
        near: !correct && k % 2 === 0, ts: now - (i * 0.8 + (good + bad - k) * 0.3) * 864e5,
      });
    }
    if (checked) checks.push({ id: uid(), studentId, notionId: n.id, passed: true, ts: now - i * 0.8 * 864e5 });
  });
  return { attempts, checks };
}

/** Aperçu avec un compte de démonstration (élève ou parent), sans avoir besoin d'un vrai compte. Les comptes de démo n'existent que pendant l'aperçu. */
export function startDemoPreview(adminId: string, role: "student" | "parent", level: LevelId): string | null {
  return asAdmin(adminId, (s) => {
    if (s.previewBackup) return "Un aperçu est déjà en cours.";
    const admin = s.users.find((x) => x.id === adminId)!;
    const now = Date.now();
    const base = { password: uid(), country: admin.country, createdAt: now, lastLogin: now, paidUntil: now + MONTH };
    const parent: User = { ...base, id: "demo-parent", role: "parent", name: "Parent démo", email: "demo-parent@apercu.local", inviteCode: "DEMO00" };
    const student: User = { ...base, id: "demo-eleve", role: "student", name: "Élève démo", email: "demo-eleve@apercu.local", level, placed: true, ...(role === "parent" ? { parentId: parent.id } : {}) };
    const logged = log(s, adminId, role === "parent" ? "Aperçu parent (démo)" : "Aperçu élève (démo)", LEVELS.find((l) => l.id === level)?.label ?? level);
    const backup = JSON.stringify({ ...logged, previewBackup: undefined });
    const users = role === "parent" ? [...s.users, parent, student] : [...s.users, student];
    const act = demoActivity(student.id, level, now);
    return { ...logged, users, attempts: [...s.attempts, ...act.attempts], checks: [...s.checks, ...act.checks], previewBackup: backup, sessionId: role === "parent" ? parent.id : student.id };
  });
}

export function stopPreview() {
  update((s) => {
    if (!s.previewBackup) return s;
    const back = JSON.parse(s.previewBackup) as State;
    return { ...back, previewBackup: undefined };
  });
}
