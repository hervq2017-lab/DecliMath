// Authentification et profils sur Supabase. Actif seulement si VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies ;
// sinon l'application garde son mode local (store.ts). Le serveur reste la source de vérité des comptes : le navigateur
// n'en garde qu'une copie dans l'état local (sans mot de passe) pour que les écrans existants continuent de fonctionner.
import type { LevelId } from "../curriculum";
import { ChildInput, DEFAULT_PREFS, getState, Prefs, removeChild, Role, SolutionMode, subscribe, update, User } from "../store";
import { supabase, supabaseReady } from "./supabase";
import { pullProgress, resetProgressTracking, startProgressSync } from "./progressSync";

/** Les comptes enfants n'ont pas d'e-mail : on leur en fabrique un interne à partir de leur identifiant (création côté serveur, étape 3). */
export const CHILD_DOMAIN = "eleves.declickmath.invalid";

interface ProfileRow {
  id: string; role: Role; name: string; login: string | null; country: string; level: string | null; serie: string | null;
  invite_code: string | null; parent_id: string | null; goal: string | null; placed: boolean; prefs: Partial<Prefs> | null;
  suspended: boolean; paid_until: string | null; notif_seen: string | null; last_login: string | null; created_at: string;
}

const ms = (t: string | null) => (t ? Date.parse(t) : undefined);
const iso = (t?: number) => (t ? new Date(t).toISOString() : null);

function toUser(r: ProfileRow, email: string): User {
  return {
    id: r.id, role: r.role, name: r.name, email: r.login ?? email, password: "", country: r.country,
    level: (r.level ?? undefined) as LevelId | undefined, serie: r.serie ?? undefined, inviteCode: r.invite_code ?? undefined,
    parentId: r.parent_id ?? undefined, goal: r.goal ?? undefined, placed: r.placed,
    prefs: r.prefs && Object.keys(r.prefs).length ? { ...DEFAULT_PREFS, ...r.prefs } : undefined,
    suspended: r.suspended || undefined, paidUntil: ms(r.paid_until), createdAt: ms(r.created_at), lastLogin: ms(r.last_login), notifSeen: ms(r.notif_seen),
  };
}

/** Colonnes que l'utilisateur a le droit de modifier (voir les « grant update » de la migration). */
const editable = (u: User) => ({
  name: u.name, country: u.country, level: u.level ?? null, serie: u.serie ?? null, goal: u.goal ?? null, placed: !!u.placed,
  prefs: u.prefs ?? {}, notif_seen: iso(u.notifSeen), last_login: iso(u.lastLogin),
});

/** Messages d'erreur de Supabase, traduits. */
function fr(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Confirme d'abord ton adresse : ouvre le message reçu par e-mail et clique sur le lien.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Un compte existe déjà avec cet e-mail.";
  if (m.includes("password") && (m.includes("least") || m.includes("weak") || m.includes("short"))) return "Le mot de passe est trop faible (6 caractères minimum).";
  if (m.includes("rate limit") || m.includes("too many")) return "Trop d'essais. Réessaie dans quelques minutes.";
  if (m.includes("database error saving new user")) return "Inscription impossible : vérifie le code d'invitation.";
  if (m.includes("valid email") || m.includes("invalid email")) return "Adresse e-mail invalide.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Pas de connexion au serveur. Vérifie ta connexion Internet.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}

// ---------- Synchronisation des modifications vers le serveur ----------
// Les écrans modifient l'état local comme avant ; on compare à la dernière version connue du serveur et on envoie la différence.
const pushedProfile = new Map<string, string>(); // id -> dernières colonnes éditables envoyées ou reçues
const pushedMode = new Map<string, SolutionMode>(); // id élève -> règle du corrigé connue du serveur
let creatingPending = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function flush() {
  if (!supabase) return;
  const s = getState();
  for (const u of s.users) {
    if (!pushedProfile.has(u.id)) continue;
    const body = JSON.stringify(editable(u));
    if (pushedProfile.get(u.id) === body) continue;
    pushedProfile.set(u.id, body);
    void supabase.from("profiles").update(JSON.parse(body)).eq("id", u.id).then(({ error }) => { if (error) console.warn("Profil non enregistré :", error.message); });
  }
  for (const [id, known] of pushedMode) {
    const mode = s.solutionMode[id];
    if (!mode || mode === known) continue;
    pushedMode.set(id, mode);
    void supabase.from("solution_modes").upsert({ student_id: id, mode }).then(({ error }) => { if (error) console.warn("Règle du corrigé non enregistrée :", error.message); });
  }
}
subscribe(() => {
  if (!supabaseReady) return;
  clearTimeout(timer);
  timer = setTimeout(flush, 400);
});

// ---------- Session ----------
/** Charge le profil connecté (et ses enfants) dans l'état local. Renvoie un message d'erreur, ou null. */
async function hydrate(freshLogin: boolean): Promise<string | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return "Session introuvable. Reconnecte-toi.";
  const uid = session.user.id;
  const [me, kids, modes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).single(),
    supabase.from("profiles").select("*").eq("parent_id", uid),
    supabase.from("solution_modes").select("student_id, mode"),
  ]);
  if (me.error || !me.data) return "Profil introuvable. Réessaie dans un instant.";
  const row = me.data as ProfileRow;
  if (row.suspended) {
    await supabase.auth.signOut();
    return "Ce compte est suspendu. Contactez le support.";
  }
  // Le serveur ne garde pas les mots de passe en clair : on conserve celui que le parent a vu à la création sur cet appareil.
  const known = new Map(getState().users.map((u) => [u.id, u.password]));
  const users = [toUser(row, session.user.email ?? ""), ...((kids.data ?? []) as ProfileRow[]).map((k) => ({ ...toUser(k, ""), password: known.get(k.id) ?? "" }))];
  const modeMap: Record<string, SolutionMode> = Object.fromEntries((modes.data ?? []).map((m: { student_id: string; mode: SolutionMode }) => [m.student_id, m.mode]));

  // Référence « connue du serveur » posée AVANT la mise à jour locale, pour que seule la différence (ex. dernière connexion) soit envoyée.
  pushedProfile.clear(); pushedMode.clear();
  users.forEach((u) => pushedProfile.set(u.id, JSON.stringify(editable(u))));
  if (row.role !== "student") Object.entries(modeMap).forEach(([id, m]) => pushedMode.set(id, m));

  if (freshLogin) users[0].lastLogin = Date.now();
  // Le serveur fait foi : les comptes qu'il ne connaît pas (restes du mode local, ou d'une autre session) sont retirés de l'appareil, avec leurs données.
  update((s) => {
    if (s.previewBackup) return { ...s, users: [...s.users.filter((u) => !users.some((x) => x.id === u.id)), ...users], solutionMode: { ...s.solutionMode, ...modeMap } };
    const mine = new Set(users.map((u) => u.id));
    const own = <T extends { studentId: string }>(rows: T[] | undefined) => (rows ?? []).filter((r) => mine.has(r.studentId));
    return {
      ...s, users, sessionId: uid,
      attempts: own(s.attempts), checks: own(s.checks), exams: own(s.exams), papers: own(s.papers), evidence: own(s.evidence), bilans: own(s.bilans),
      memory: Object.fromEntries(Object.entries(s.memory ?? {}).filter(([, m]) => mine.has(m.studentId))),
      solutionMode: modeMap,
    };
  });
  await pullProgress(); // progression de l'élève (ou de ses enfants) enregistrée sur le serveur
  // Enfants saisis à l'inscription du parent : créés par le serveur à sa première connexion confirmée.
  const pending = session.user.user_metadata?.pending_children as ChildInput[] | undefined;
  if (row.role === "parent" && pending?.length && !creatingPending) {
    creatingPending = true; // hydrate est rappelé par la création : on évite de la relancer en boucle
    const err = await remoteCreateChildren(pending);
    if (!err) await supabase.auth.updateUser({ data: { pending_children: [] } });
    creatingPending = false;
  }
  return null;
}

/** À appeler une fois au démarrage : reprend la session Supabase existante, ou déconnecte une ancienne session locale. */
export async function initRemoteSession(): Promise<void> {
  if (!supabase) return;
  startProgressSync();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) await hydrate(false);
  else update((s) => (s.previewBackup ? s : { ...s, sessionId: null }));
  supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") setRecovery(true);
    if (event !== "SIGNED_OUT") return;
    pushedProfile.clear(); pushedMode.clear(); resetProgressTracking();
    update((s) => (s.previewBackup ? s : { ...s, sessionId: null }));
  });
}

export interface AuthResult { error: string | null; info?: string }

// ---------- Mot de passe oublié ----------
// Le lien reçu par e-mail ramène sur le site avec « type=recovery » dans l'adresse : on le repère au chargement (avant que Supabase ne nettoie l'adresse).
let recovery = typeof window !== "undefined" && /[#&?]type=recovery/.test(window.location.hash + window.location.search);
const recoveryListeners = new Set<() => void>();
function setRecovery(v: boolean) { recovery = v; recoveryListeners.forEach((f) => f()); }
export const recoveryActive = () => recovery;
export function subscribeRecovery(cb: () => void) { recoveryListeners.add(cb); return () => { recoveryListeners.delete(cb); }; }

/** Envoie le lien de réinitialisation. La réponse est la même que l'adresse existe ou non (on ne révèle pas quels e-mails ont un compte). */
export async function remoteForgotPassword(email: string): Promise<AuthResult> {
  if (!supabase) return { error: "La réinitialisation n'est disponible qu'avec un compte en ligne." };
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/reinitialiser` });
  if (error && /rate limit|too many|failed to fetch|network|valid email|invalid email/i.test(error.message)) return { error: fr(error.message) };
  return { error: null, info: "Si un compte existe avec cette adresse, un e-mail vient de partir avec un lien pour choisir un nouveau mot de passe. Pense à regarder dans les courriers indésirables." };
}

/** Enregistre le nouveau mot de passe (session de récupération ouverte par le lien), puis connecte le parent. */
export async function remoteSetPassword(password: string): Promise<string | null> {
  if (!supabase) return "Serveur non configuré.";
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return "Ce lien a expiré ou a déjà servi. Demande un nouveau lien depuis la page de connexion.";
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.message.toLowerCase().includes("different from the old")) return "Choisis un mot de passe différent de l'ancien.";
    return fr(error.message);
  }
  window.history.replaceState(null, "", "/");
  const err = await hydrate(true);
  setRecovery(false);
  return err;
}

/** Abandon : on quitte la session de récupération sans changer le mot de passe. */
export async function cancelRecovery() {
  window.history.replaceState(null, "", "/");
  setRecovery(false);
  await supabase?.auth.signOut();
}

export async function remoteLogIn(identifier: string, password: string): Promise<AuthResult> {
  if (!supabase) return { error: "Serveur non configuré." };
  const id = identifier.trim().toLowerCase();
  const email = id.includes("@") ? id : `${id}@${CHILD_DOMAIN}`;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: fr(error.message) };
  return { error: await hydrate(true) };
}

export interface SignUpInput {
  role: Role; name: string; email: string; password: string; country: string;
  level?: LevelId; serie?: string; goal?: string; inviteCode?: string; children?: ChildInput[];
}

export async function remoteSignUp(i: SignUpInput): Promise<AuthResult> {
  if (!supabase) return { error: "Serveur non configuré." };
  if (i.password.length < 6) return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  const { data, error } = await supabase.auth.signUp({
    email: i.email.trim().toLowerCase(),
    password: i.password,
    options: {
      emailRedirectTo: window.location.origin,
      // Ces champs sont lus par le trigger handle_new_user (le rôle admin y est de toute façon refusé).
      // « pending_children » attend l'étape 3 : les comptes enfants seront créés par le serveur à la première connexion du parent.
      data: {
        role: i.role, name: i.name.trim(), country: i.country, level: i.level, serie: i.serie, goal: i.goal,
        invite_code: i.inviteCode?.trim() || undefined,
        pending_children: i.children?.filter((k) => k.name.trim()),
      },
    },
  });
  if (error) return { error: fr(error.message) };
  // Quand la confirmation par e-mail est active, une adresse déjà inscrite renvoie un utilisateur sans identité.
  if (data.user && data.user.identities?.length === 0) return { error: "Un compte existe déjà avec cet e-mail." };
  if (!data.session) {
    const base = "Compte créé. Ouvre le message que nous t'avons envoyé, clique sur le lien pour confirmer ton adresse, puis connecte-toi.";
    const kids = i.children?.filter((k) => k.name.trim());
    if (i.role !== "parent" || !kids?.length || !data.user) return { error: null, info: base };
    // Les enfants n'attendent pas la confirmation du parent : leurs accès sont créés maintenant et affichés ici.
    try {
      const r = await fetch("/api/children", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "provision", userId: data.user.id }) });
      const j = await r.json().catch(() => ({}));
      const made = (j.created ?? []) as (Access & { name: string })[];
      if (!r.ok || !made.length) return { error: null, info: base };
      update((s) => ({
        ...s,
        users: [...s.users.filter((u) => !made.some((m) => m.id === u.id)), ...made.map((m, n): User => ({
          id: m.id, role: "student", name: m.name, email: m.login ?? "", password: m.password, country: i.country, level: kids[n]?.level, serie: kids[n]?.serie, parentId: data.user!.id,
        }))],
      }));
      const lines = made.map((m) => `• ${m.name} : identifiant ${m.login}, mot de passe ${m.password}`).join("\n");
      return { error: null, info: `${base}\n\nTes enfants peuvent déjà se connecter ici avec leur identifiant et leur mot de passe. Note-les maintenant :\n${lines}` };
    } catch { return { error: null, info: base }; }
  }
  return { error: await hydrate(true) };
}

/** Rattache l'élève connecté à un parent grâce à son code (fonction link_student côté serveur). */
export async function remoteLinkStudent(code: string): Promise<string | null> {
  if (!supabase) return "Serveur non configuré.";
  const { error } = await supabase.rpc("link_student", { code });
  if (error) return error.message.includes("inconnu") ? "Code d'invitation inconnu." : fr(error.message);
  return hydrate(false);
}

// ---------- Comptes enfants (créés par le serveur : api/children.ts) ----------
interface Access { id: string; login: string | null; password: string }

async function callChildren(payload: object): Promise<{ error?: string; [k: string]: unknown }> {
  if (!supabase) return { error: "Serveur non configuré." };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Session expirée. Reconnecte-toi." };
  try {
    const r = await fetch("/api/children", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({}));
    return r.ok ? j : { error: j.error ?? "Le serveur n'a pas pu créer l'accès. Réessaie." };
  } catch { return { error: "Pas de connexion au serveur. Vérifie ta connexion Internet." }; }
}

/** Crée les comptes enfants ; renvoie un message d'erreur ou null. Identifiant et mot de passe sont ensuite lisibles dans la fiche de l'enfant. */
export async function remoteCreateChildren(kids: ChildInput[]): Promise<string | null> {
  const res = await callChildren({ action: "create", children: kids.filter((k) => k.name.trim()) });
  const made = (res.created ?? []) as (Access & { name: string })[];
  const err = made.length ? null : res.error ?? null;
  if (made.length) await hydrateAfter(made);
  return res.error && made.length < kids.filter((k) => k.name.trim()).length ? res.error : err;
}

/** Nouvel identifiant pour un enfant (son mot de passe ne change pas). */
export async function remoteResetChild(childId: string): Promise<string | null> {
  const res = (await callChildren({ action: "reset-login", childId })) as { error?: string; login?: string };
  if (res.error || !res.login) return res.error ?? "Changement impossible.";
  await hydrateAfter([{ id: childId, login: res.login, password: "" }]);
  return null;
}

/** Nouveau mot de passe pour un enfant (son identifiant ne change pas) ; le parent le lit ensuite dans sa fiche. */
export async function remoteResetChildPassword(childId: string): Promise<string | null> {
  const res = (await callChildren({ action: "reset-password", childId })) as { error?: string; password?: string };
  if (res.error || !res.password) return res.error ?? "Changement impossible.";
  await hydrateAfter([{ id: childId, login: null, password: res.password }]);
  return null;
}

/** Supprime l'accès d'un enfant (compte et progression) ; renvoie un message d'erreur ou null. */
export async function remoteDeleteChild(childId: string): Promise<string | null> {
  const res = (await callChildren({ action: "delete", childId })) as { error?: string; id?: string };
  if (!res.id) return res.error ?? "Suppression impossible.";
  removeChild(getState().sessionId ?? "", childId);
  return null;
}

async function hydrateAfter(access: Access[]) {
  update((s) => ({ ...s, users: s.users.map((u) => { const a = access.find((x) => x.id === u.id); return a ? { ...u, email: a.login ?? u.email, password: a.password || u.password } : u; }) }));
  await hydrate(false);
  // Le serveur ne garde pas les mots de passe : on conserve ceux qu'il vient de renvoyer pour que le parent puisse les lire.
  update((s) => ({ ...s, users: s.users.map((u) => { const a = access.find((x) => x.id === u.id); return a?.password ? { ...u, password: a.password } : u; }) }));
}
