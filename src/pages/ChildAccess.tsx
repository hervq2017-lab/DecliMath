import {
  Check, Copy, KeyRound, Plus, Printer, QrCode, ShieldAlert,
  ShieldCheck, Trash2, X
} from "lucide-react";
import { useState } from "react";
import { QrCodeView } from "../components/QrCodeView";
import { levelById, LEVELS, LevelId, seriesAt } from "../curriculum";
import {
  remoteCreateChildren, remoteCreateQr, remoteDeleteChild, remoteResetChild,
  remoteRevokeQr, remoteToggleSuspendChild
} from "../lib/authRemote";
import { supabaseReady } from "../lib/supabase";
import {
  addChildren, createQrToken, hasAcceptedParentLink, regenerateLogin, removeChild,
  revokeQrTokens, studentsOf, toggleSuspendChild, User, useStore
} from "../store";

export default function ChildAccess({ parentId }: { parentId: string }) {
  const state = useStore();
  const children = studentsOf(state, parentId);

  const [copied, setCopied] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LevelId>("3e");
  const [serie, setSerie] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [qrChild, setQrChild] = useState<User | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<number | null>(null);
  const [qrPurpose, setQrPurpose] = useState<"activation" | "quick_login">("activation");
  const [qrLoading, setQrLoading] = useState(false);

  const [printChild, setPrintChild] = useState<User | null>(null);
  const [printToken, setPrintToken] = useState<string | null>(null);


  async function run(job: () => Promise<string | null>) {
    setBusy(true);
    setError(null);
    const err = await job();
    setError(err);
    setBusy(false);
  }

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignoré */
      }
      ta.remove();
    }
    setCopied(key);
    window.setTimeout(() => setCopied((k) => (k === key ? null : k)), 2000);
  };

  const copyAll = () =>
    copyText(
      "all",
      children
        .map((c) => hasAcceptedParentLink(c)
          ? `${c.name}\nConnexion : ${window.location.origin}/connexion-eleve\nIdentifiant : ${c.email}`
          : `${c.name}\nInvitation en attente : créez ou renouvelez son QR code depuis cet écran.`)
        .join("\n\n")
    );

  const removeAccess = (id: string, childName: string) => {
    if (!window.confirm(`Supprimer l'accès de ${childName} ? Son compte et toute sa progression seront effacés définitivement.`)) return;
    if (supabaseReady) void run(() => remoteDeleteChild(id));
    else removeChild(parentId, id);
  };

  const handleToggleSuspend = async (c: User) => {
    const actionLabel = c.suspended ? "Réactiver" : "Suspendre";
    if (!window.confirm(`${actionLabel} l'accès de ${c.name} ? ${c.suspended ? "Il pourra de nouveau se connecter." : "Il ne pourra plus se connecter jusqu'à réactivation."}`)) return;
    if (supabaseReady) {
      void run(() => remoteToggleSuspendChild(c.id, !c.suspended));
    } else {
      toggleSuspendChild(parentId, c.id, !c.suspended);
    }
  };

  // Ouverture de la modale QR Code
  const openQrModal = async (c: User, purpose: "activation" | "quick_login" = "activation") => {
    setQrChild(c);
    setQrPurpose(purpose);
    setQrLoading(true);
    setError(null);

    if (supabaseReady) {
      const res = await remoteCreateQr(c.id, purpose);
      setQrLoading(false);
      if (res.error || !res.token) {
        setError(res.error ?? "Impossible de générer le QR code.");
        setQrChild(null);
      } else {
        setQrToken(res.token);
        setQrExpiresAt(res.expiresAt ?? Date.now() + 48 * 3600_000);
      }
    } else {
      const res = createQrToken(parentId, c.id, purpose);
      setQrLoading(false);
      if (!res) {
        setError("Impossible de générer le QR code.");
        setQrChild(null);
      } else {
        setQrToken(res.token);
        setQrExpiresAt(res.expiresAt);
      }
    }
  };

  // Révocation du QR Code actif
  const handleRevokeQr = async () => {
    if (!qrChild) return;
    if (!window.confirm(`Révoquer immédiatement le QR code de ${qrChild.name} ? L'accès par ce lien deviendra impossible.`)) return;
    let err: string | null = null;
    if (supabaseReady) {
      err = await remoteRevokeQr(qrChild.id);
    } else {
      revokeQrTokens(parentId, qrChild.id);
    }
    if (err) { setError(err); return; }
    setQrToken(null);
    setQrChild(null);
  };

  const handleRevokeInvitation = async (c: User) => {
    if (!window.confirm(`Révoquer toutes les invitations non utilisées de ${c.name} ? Il ne pourra plus les accepter.`)) return;
    if (supabaseReady) {
      await run(() => remoteRevokeQr(c.id));
    } else {
      revokeQrTokens(parentId, c.id);
    }
  };

  // Impression de la fiche élève
  const openPrintCard = async (c: User) => {
    // Créer un jeton à usage unique pour l'invitation ou la réinitialisation.
    let tok: string | null = null;
    if (supabaseReady) {
      const res = await remoteCreateQr(c.id, "activation");
      if (res.error) { setError(res.error); return; }
      tok = res.token ?? null;
    } else {
      const res = createQrToken(parentId, c.id, "activation");
      if (!res) { setError("Impossible de créer le QR code. Réessaie."); return; }
      tok = res?.token ?? null;
    }
    setPrintChild(c);
    setPrintToken(tok);
  };

  const getActivationUrl = (tok: string | null) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://decli-math.vercel.app";
    return `${origin}/activation?token=${encodeURIComponent(tok ?? "")}`;
  };

  return (
    <section className="card stack" aria-labelledby="acces">
      <h2 id="acces" style={{ fontSize: "1.1rem" }}>
        <KeyRound size={20} aria-hidden="true" style={{ verticalAlign: "-3px", color: "var(--primary)" }} /> Accès et connexions de mes enfants
      </h2>
      <p className="muted small">
        Créez le profil, puis envoyez à votre enfant son <b>invitation QR personnelle</b>. Il l'accepte et choisit son mot de passe ; son activité ne vous est partagée qu'après cette acceptation. Vous pouvez révoquer une invitation non utilisée ou suspendre un accès.
      </p>

      {!supabaseReady && (
        <p role="alert" className="small" style={{ border: "1px solid #f59e0b", borderRadius: 10, padding: "8px 12px", background: "rgba(245, 158, 11, 0.08)" }}>
          <b>Mode local :</b> ces comptes sont enregistrés dans ce navigateur. Pour connecter votre enfant sur un autre appareil, déployez sur votre domaine en ligne.
        </p>
      )}

      <div className="row between" style={{ borderTop: "1px solid var(--line, #8883)", paddingTop: 12 }}>
        <h3 style={{ fontSize: "1rem", margin: 0 }}>Enfants enregistrés ({children.length})</h3>
        {children.length > 1 && (
          <button type="button" className="btn ghost" onClick={copyAll}>
            <Copy size={16} aria-hidden="true" /> {copied === "all" ? "Copié !" : "Copier les identifiants disponibles"}
          </button>
        )}
      </div>

      {children.length === 0 && (
        <p className="muted small" style={{ padding: "12px 0" }}>
          Aucun enfant pour l'instant. Utilisez le formulaire ci-dessous pour ajouter votre premier enfant.
        </p>
      )}

      <ul className="stack-sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {children.map((c) => {
          const isSuspended = !!c.suspended;
          const isPending = !hasAcceptedParentLink(c);

          return (
            <li
              key={c.id}
              className={`child-access-card${isSuspended ? " is-suspended" : ""}`}
            >
              <div className="child-access-head">
                <div className="child-access-identity">
                  <span className="avatar child-access-avatar">
                    {c.name[0]?.toUpperCase()}
                  </span>
                  <div className="child-access-name">
                    <b>{c.name}</b>
                    <span className="muted small">
                      {levelById(c.level ?? "tle").label}{c.serie ? ` · Série ${c.serie}` : ""}
                    </span>
                  </div>
                </div>

                {/* Badge de statut */}
                {isSuspended ? (
                  <span className="child-access-status suspended">
                    <ShieldAlert size={15} aria-hidden="true" /> Suspendu
                  </span>
                ) : isPending ? (
                  <span className="child-access-status pending">Invitation à accepter</span>
                ) : (
                  <span className="child-access-status active">
                    <Check size={15} aria-hidden="true" /> Actif
                  </span>
                )}
              </div>

              {/* L'identifiant n'est communiqué qu'après acceptation de l'invitation. */}
              {!isPending && (
                <div className="child-access-login">
                  <span className="child-access-login-label">Identifiant élève</span>
                  <code>{c.email}</code>
                  <button
                    type="button"
                    className="btn link child-access-copy"
                    aria-label={`Copier l'identifiant de ${c.name}`}
                    onClick={() => copyText(`${c.id}-l`, c.email)}
                  >
                    {copied === `${c.id}-l` ? "Copié" : "Copier"}
                  </button>
                </div>
              )}

              {/* Actions rapides */}
              <div className="child-access-actions">
                <button
                  type="button"
                  className="btn primary"
                  disabled={isSuspended || busy}
                  onClick={() => openQrModal(c, "activation")}
                  title={isPending ? "Envoyer une invitation QR à l'enfant" : "Créer un QR code pour réinitialiser l'accès"}
                >
                  <QrCode size={16} aria-hidden="true" /> {isPending ? "Inviter par QR" : "Réinitialiser par QR"}
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  disabled={isSuspended || busy}
                  onClick={() => openPrintCard(c)}
                  title={isPending ? "Imprimer ou enregistrer l'invitation QR" : "Imprimer la fiche de récupération QR"}
                >
                  <Printer size={16} aria-hidden="true" /> Fiche élève
                </button>

                {isPending && <button
                  type="button"
                  className="btn child-access-danger"
                  disabled={busy}
                  onClick={() => void handleRevokeInvitation(c)}
                >
                  <ShieldAlert size={15} aria-hidden="true" /> Révoquer l'invitation
                </button>}

                <button
                  type="button"
                  className="btn ghost"
                  disabled={busy}
                  onClick={() => {
                    if (supabaseReady) void run(() => remoteResetChild(c.id));
                    else regenerateLogin(parentId, c.id);
                  }}
                  title="Changer l'identifiant si besoin"
                >
                  Nouvel identifiant
                </button>

                <button
                  type="button"
                  className={`btn ghost child-access-toggle${isSuspended ? " is-suspended" : ""}`}
                  disabled={busy}
                  onClick={() => handleToggleSuspend(c)}
                >
                  {isSuspended ? (
                    <><ShieldCheck size={15} aria-hidden="true" /> Réactiver</>
                  ) : (
                    <><ShieldAlert size={15} aria-hidden="true" /> Suspendre</>
                  )}
                </button>

                <button
                  type="button"
                  className="btn child-access-danger"
                  disabled={busy}
                  onClick={() => removeAccess(c.id, c.name)}
                >
                  <Trash2 size={15} aria-hidden="true" style={{ verticalAlign: "-2px" }} /> Supprimer
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Formulaire d'ajout d'un enfant */}
      <form
        className="stack-sm"
        style={{ paddingTop: 14, borderTop: "1px solid var(--line, #8883)" }}
        onSubmit={(e) => {
          e.preventDefault();
          const kid = {
            name: name.trim(),
            level,
            serie: serie || undefined,
          };
          if (!kid.name) return;
          if (supabaseReady) {
            void run(async () => {
              const err = await remoteCreateChildren([kid]);
              if (!err) {
                setName("");
                setSerie("");
              }
              return err;
            });
          } else {
            addChildren(parentId, [kid]);
            setName("");
            setSerie("");
          }
        }}
      >
        <b style={{ fontSize: "1rem" }}>Créer un profil enfant</b>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <input
            className="field"
            required
            placeholder="Prénom ou nom de l'enfant"
            aria-label="Prénom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: "1 1 180px" }}
          />
          <select
            className="field"
            aria-label="Classe"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value as LevelId);
              setSerie("");
            }}
            style={{ flex: "1 1 130px" }}
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          {seriesAt(level).length > 0 && (
            <select
              className="field"
              aria-label="Série"
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              style={{ flex: "1 1 120px" }}
            >
              <option value="">Toutes les séries</option>
              {seriesAt(level).map((x) => (
                <option key={x} value={x}>Série {x}</option>
              ))}
            </select>
          )}
          <button className="btn primary" type="submit" disabled={busy}>
            <Plus size={16} aria-hidden="true" /> Créer le profil
          </button>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
      </form>

      {/* ========================================================================= */}
      {/* MODALE QR CODE DE CONNEXION                                                */}
      {/* ========================================================================= */}
      {qrChild && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 35, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "max(8px, env(safe-area-inset-top)) 8px max(8px, env(safe-area-inset-bottom))",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          <div
            className="card stack"
            style={{
              background: "#fff",
              color: "#1c1545",
              maxWidth: 400,
              width: "100%",
              maxHeight: "calc(100dvh - 16px)",
              overflowY: "auto",
              padding: 16,
              gap: 10,
              borderRadius: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              position: "relative",
              margin: "auto",
            }}
          >
            <button
              type="button"
              className="btn ghost"
              onClick={() => { setQrChild(null); setQrToken(null); }}
              aria-label="Fermer"
              style={{ position: "absolute", top: 12, right: 12, padding: 6, minHeight: "auto" }}
            >
              <X size={20} />
            </button>

            <h3 id="qr-modal-title" style={{ fontSize: "1.2rem", margin: 0 }}>
              {hasAcceptedParentLink(qrChild) ? "Réinitialisation d'accès de" : "Invitation de"} {qrChild.name}
            </h3>

            {/* Sélecteur de mode de QR code */}
            <div className="chips" role="group" aria-label="Type de QR code" style={{ margin: "4px 0" }}>
              <button
                type="button"
                className={`btn ${qrPurpose === "activation" ? "primary" : "ghost"}`}
                onClick={() => openQrModal(qrChild, "activation")}
                style={{ flex: 1, minHeight: 36, fontSize: "0.85rem" }}
              >
                {hasAcceptedParentLink(qrChild) ? "Nouveau mot de passe (48h)" : "Invitation à accepter (48h)"}
              </button>
              {hasAcceptedParentLink(qrChild) && <button
                  type="button"
                  className={`btn ${qrPurpose === "quick_login" ? "primary" : "ghost"}`}
                  onClick={() => openQrModal(qrChild, "quick_login")}
                  style={{ flex: 1, minHeight: 36, fontSize: "0.85rem" }}
                >
                  Connexion rapide (15 min)
                </button>}
            </div>

            <div style={{ textAlign: "center", padding: "4px 0" }}>
              {qrLoading ? (
                <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p className="muted small">Génération du QR code sécurisé...</p>
                </div>
              ) : qrToken ? (
                <div className="stack" style={{ alignItems: "center" }}>
                  <QrCodeView value={getActivationUrl(qrToken)} size={160} alt={`QR Code pour ${qrChild.name}`} />
                  <p className="muted small" style={{ margin: "4px 0 0", maxWidth: 320 }}>
                    {qrPurpose === "activation"
                      ? hasAcceptedParentLink(qrChild)
                        ? "Après avoir scanné ce QR code, l'élève choisit un nouveau mot de passe secret."
                        : "L'élève scanne ce code, accepte l'invitation et choisit son mot de passe secret. Le suivi ne s'ouvre qu'après cette étape."
                      : "Connexion instantanée sécurisée. Valable 15 minutes, à usage unique."}
                  </p>
                  <p className="small" style={{ color: "#d97706", fontWeight: 600 }}>
                    Expire le {qrExpiresAt ? new Date(qrExpiresAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "dans 48h"}
                  </p>
                </div>
              ) : (
                <p className="auth-error">Impossible d'afficher le QR code.</p>
              )}
            </div>

            <div className="stack-sm">
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button
                type="button"
                className="btn ghost block"
                onClick={() => copyText("qr-link", getActivationUrl(qrToken))}
                disabled={!qrToken}
              >
                <Copy size={16} /> {copied === "qr-link" ? "Lien copié !" : "Copier le lien d'activation"}
              </button>

              <button
                type="button"
                className="btn primary block"
                onClick={() => {
                  setPrintChild(qrChild);
                  setPrintToken(qrToken);
                }}
              >
                <Printer size={16} /> Imprimer la fiche élève avec QR code
              </button>

              <button
                type="button"
                className="btn link block"
                style={{ color: "var(--danger, #ff6b6b)" }}
                onClick={handleRevokeQr}
              >
                <ShieldAlert size={16} /> Révoquer ce QR code maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE FICHE ÉLÈVE IMPRIMABLE                                              */}
      {/* ========================================================================= */}
      {printChild && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 35, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            className="stack"
            style={{
              background: "#fff",
              color: "#1c1545",
              maxWidth: 580,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <div className="row between print-hide" style={{ marginBottom: 12 }}>
              <span className="pill">{hasAcceptedParentLink(printChild) ? "Fiche de récupération d'accès" : "Invitation élève"}</span>
              <div className="row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => window.print()}
                >
                  <Printer size={16} /> Imprimer
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => { setPrintChild(null); setPrintToken(null); }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Document imprimable */}
            <div
              id="printable-card"
              style={{
                border: "2px solid #1c1545",
                borderRadius: 12,
                padding: "24px 20px",
                background: "#fafbff",
              }}
            >
              <div className="row between" style={{ alignItems: "center", borderBottom: "2px solid #35b6ff", paddingBottom: 14 }}>
                <div className="row" style={{ alignItems: "center", gap: 10 }}>
                  <img src="/logo-icon.png" alt="" width="48" height="32" />
                  <div>
                    <h2 style={{ fontSize: "1.3rem", margin: 0, color: "#1c1545" }}>DeclickMath</h2>
                    <p className="small muted" style={{ margin: 0 }}>Accès personnel sécurisé</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="badge" style={{ fontSize: "0.85rem", background: "#35b6ff", color: "#fff" }}>
                    {levelById(printChild.level ?? "tle").label}
                    {printChild.serie ? ` Série ${printChild.serie}` : ""}
                  </span>
                </div>
              </div>

              <div style={{ padding: "18px 0", textAlign: "center" }}>
                <h3 style={{ fontSize: "1.4rem", margin: 0, color: "#1c1545" }}>
                  Espace de <u>{printChild.name}</u>
                </h3>
                <p className="muted small" style={{ margin: "4px 0 0" }}>
                  {hasAcceptedParentLink(printChild)
                    ? "Scanne ce QR code pour choisir un nouveau mot de passe et ouvrir ton espace."
                    : "Scanne ce QR code pour ouvrir ton espace et accepter l'invitation de ton parent."}
                </p>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "center", padding: "12px 0", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                {printToken && (
                  <div style={{ textAlign: "center" }}>
                    <QrCodeView value={getActivationUrl(printToken)} size={160} alt={`QR Code ${printChild.name}`} />
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "4px 0 0" }}>Scanne avec ton téléphone ou ta tablette</p>
                  </div>
                )}

                <div className="stack-sm" style={{ flex: "1 1 220px", padding: "0 10px" }}>
                  {hasAcceptedParentLink(printChild) && <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Identifiant élève</span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>{printChild.email}</div>
                  </div>}

                  <div style={{ fontSize: "0.85rem", color: "#334155" }}>
                    <b>Site web :</b> https://decli-math.vercel.app
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, borderTop: "1px dashed #cbd5e1", paddingTop: 14 }}>
                <h4 style={{ fontSize: "0.95rem", margin: "0 0 8px", color: "#1e293b" }}>Comment te connecter ?</h4>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
                  <li>Scanne le QR code avec l'appareil photo de ton téléphone ou de ta tablette.</li>
                  {hasAcceptedParentLink(printChild)
                    ? <li>Confirme le nouveau mot de passe. Ton mot de passe reste secret.</li>
                    : <>
                      <li>Vérifie le nom de ton parent, accepte l'invitation et choisis ton mot de passe personnel.</li>
                      <li>Ton parent pourra suivre tes progrès après ton acceptation ; ton mot de passe reste secret.</li>
                    </>}
                  {hasAcceptedParentLink(printChild) && <li>Pour tes prochaines connexions, utilise ton identifiant affiché ci-dessus et le mot de passe que tu as choisi.</li>}
                </ol>
              </div>

              <p style={{ margin: "14px 0 0", fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>
                Document confidentiel • DeclickMath — Comprendre, s'entraîner, réussir
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
