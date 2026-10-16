import {
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  MessageCircle,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { levelById, LEVELS, LevelId, seriesAt } from "../curriculum";
import { remoteCreateChildren, remoteDeleteChild, remoteResetChild, remoteResetChildPassword } from "../lib/authRemote";
import { supabaseReady } from "../lib/supabase";
import {
  addChildren,
  quickSwitchToChild,
  regenerateLogin,
  removeChild,
  resetChildPassword,
  setChildPassword,
  studentsOf,
  useStore,
} from "../store";

/** Accès des enfants : chaque enfant a son propre identifiant et son propre mot de passe, que le parent lui transmet. */
export default function ChildAccess({ parentId }: { parentId: string }) {
  const state = useStore();
  const children = studentsOf(state, parentId);
  const [copied, setCopied] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LevelId>("3e");
  const [serie, setSerie] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const [customPwdChild, setCustomPwdChild] = useState<string | null>(null);
  const [customPwdValue, setCustomPwdValue] = useState("");
  const [qrModalChild, setQrModalChild] = useState<{ id: string; name: string; url: string; qrDataUrl: string } | null>(null);

  /** Sur le serveur, les accès se créent côté serveur ; en mode local, directement dans le navigateur. */
  async function run(job: () => Promise<string | null>) {
    setBusy(true);
    setError(null);
    const err = await job();
    setError(err);
    setBusy(false);
  }

  /** Copie dans le presse-papiers */
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
      try { document.execCommand("copy"); } catch { /* ignoré */ }
      ta.remove();
    }
    setCopied(key);
    window.setTimeout(() => setCopied((k) => (k === key ? null : k)), 2500);
  };

  const getDirectLoginUrl = (login: string, pass: string) => {
    const origin = window.location.origin;
    return `${origin}/commencer?c=login&r=student&u=${encodeURIComponent(login)}&p=${encodeURIComponent(pass)}&auto=1`;
  };

  const shareViaWhatsApp = (childName: string, login: string, pass: string) => {
    const link = getDirectLoginUrl(login, pass);
    const msg = `Bonjour ${childName} ! 🎓\nVoici tes accès pour faire tes maths et t'entraîner sur DeclickMath :\n\n👉 Lien de connexion directe (1 clic) :\n${link}\n\n👤 Identifiant : ${login}\n🔑 Mot de passe : ${pass || "(à demander au parent)"}\n\nBonne séance ! ✨`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const openQrCodeModal = async (id: string, childName: string, login: string, pass: string) => {
    const url = getDirectLoginUrl(login, pass);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: "#1c1545", light: "#ffffff" },
      });
      setQrModalChild({ id, name: childName, url, qrDataUrl });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetCustomPassword = async (childId: string) => {
    const trimmed = customPwdValue.trim();
    if (trimmed.length < 4) {
      setError("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }
    if (supabaseReady) {
      await run(async () => {
        return await remoteResetChildPassword(childId, trimmed);
      });
    } else {
      const err = setChildPassword(parentId, childId, trimmed);
      if (err) setError(err);
    }
    setCustomPwdChild(null);
    setCustomPwdValue("");
  };

  const removeAccess = (id: string, childName: string) => {
    if (!window.confirm(`Supprimer l'accès de ${childName} ? Son compte et toute sa progression seront effacés définitivement.`)) return;
    if (supabaseReady) void run(() => remoteDeleteChild(id));
    else removeChild(parentId, id);
  };

  const handleGenerateNewPassword = (id: string, childName: string) => {
    if (!window.confirm(`Générer un nouveau mot de passe pour ${childName} ? L'ancien cessera de fonctionner.`)) return;
    setCopied(null);
    if (supabaseReady) void run(() => remoteResetChildPassword(id));
    else resetChildPassword(parentId, id);
  };

  return (
    <section className="card stack" aria-labelledby="acces" style={{ position: "relative" }}>
      <div className="row between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 id="acces" style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8, margin: "0 0 4px 0" }}>
            <KeyRound size={20} aria-hidden="true" style={{ color: "#713cff" }} />
            Accès de connexion de mes enfants
          </h2>
          <p className="muted small" style={{ margin: 0, maxWidth: 640 }}>
            Chaque enfant a son propre identifiant et mot de passe. Transmettez-les-lui par <b>WhatsApp</b>, via le <b>Lien direct 1-clic</b> ou en lui faisant scanner le <b>QR Code</b>.
          </p>
        </div>

        <div className="pill" style={{ background: "rgba(113, 60, 255, 0.1)", color: "#713cff", fontWeight: 700, fontSize: "0.85rem" }}>
          {children.length} enfant{children.length > 1 ? "s" : ""}
        </div>
      </div>

      {!supabaseReady && (
        <div role="alert" className="small" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid #f59e0b", borderRadius: 10, padding: "10px 14px", color: "#b45309" }}>
          <b>Mode local actif :</b> les comptes sont enregistrés dans ce navigateur. Vous pouvez transmettre les accès à votre enfant sur cet appareil ou utiliser le bouton <b>« Tester l'espace élève »</b> pour vérifier le fonctionnement.
        </div>
      )}

      {children.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px dashed var(--line, #8883)" }}>
          <p className="muted" style={{ margin: "0 0 12px 0" }}>Aucun enfant n'est enregistré pour l'instant.</p>
          <p className="small">Renseignez le prénom et la classe ci-dessous pour créer le premier accès en 1 clic.</p>
        </div>
      )}

      <div className="stack" style={{ gap: 16 }}>
        {children.map((c) => {
          const directUrl = getDirectLoginUrl(c.email, c.password || "");
          const isPwdVisible = !!showPwd[c.id];
          const isEditingCustomPwd = customPwdChild === c.id;

          return (
            <div
              key={c.id}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--line, rgba(255,255,255,0.12))",
                borderRadius: 14,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div className="row between" style={{ flexWrap: "wrap", gap: 8 }}>
                <div className="row" style={{ alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #713cff, #35b6ff)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    {c.name[0]?.toUpperCase()}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{c.name}</h3>
                    <span className="muted small">
                      {levelById(c.level ?? "tle").label}
                      {c.serie ? ` • Série ${c.serie}` : ""}
                    </span>
                  </div>
                </div>

                <div className="row" style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="btn primary sm"
                    onClick={() => quickSwitchToChild(parentId, c.id)}
                    title="Basculer instantanément sur le profil de cet élève pour tester"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.86rem" }}
                  >
                    <Play size={14} /> Tester l'espace élève
                  </button>
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={() => shareViaWhatsApp(c.name, c.email, c.password)}
                    title="Envoyer les accès pré-rédigés par WhatsApp"
                    style={{ color: "#25D366", borderColor: "#25D366", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={() => openQrCodeModal(c.id, c.name, c.email, c.password)}
                    title="Afficher le QR code pour connexion instantanée sur smartphone ou tablette"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <QrCode size={15} /> QR Code
                  </button>
                </div>
              </div>

              {/* Bloc Identifiants */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                  background: "rgba(0, 0, 0, 0.2)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Identifiant */}
                <div>
                  <span className="muted small" style={{ display: "block", marginBottom: 4 }}>
                    Identifiant élève :
                  </span>
                  <div className="row" style={{ alignItems: "center", gap: 8 }}>
                    <code
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#35b6ff",
                        background: "rgba(53, 182, 255, 0.1)",
                        padding: "4px 8px",
                        borderRadius: 6,
                        userSelect: "all",
                      }}
                    >
                      {c.email}
                    </code>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => copyText(`${c.id}-login`, c.email)}
                      aria-label="Copier l'identifiant"
                    >
                      {copied === `${c.id}-login` ? <Check size={14} style={{ color: "#2e9e5b" }} /> : <Copy size={14} />}
                      <span style={{ fontSize: "0.8rem" }}>{copied === `${c.id}-login` ? "Copié" : "Copier"}</span>
                    </button>
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <span className="muted small" style={{ display: "block", marginBottom: 4 }}>
                    Mot de passe élève :
                  </span>
                  <div className="row" style={{ alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {c.password ? (
                      <code
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          letterSpacing: isPwdVisible ? ".05em" : ".2em",
                          color: "#ffc63d",
                          background: "rgba(255, 198, 61, 0.1)",
                          padding: "4px 8px",
                          borderRadius: 6,
                          userSelect: "all",
                        }}
                      >
                        {isPwdVisible ? c.password : "••••••••"}
                      </code>
                    ) : (
                      <span className="muted small">Non renseigné sur cet appareil</span>
                    )}

                    {c.password && (
                      <button
                        type="button"
                        className="btn ghost sm"
                        onClick={() => setShowPwd((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                        title={isPwdVisible ? "Masquer" : "Afficher"}
                      >
                        {isPwdVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}

                    {c.password && (
                      <button
                        type="button"
                        className="btn ghost sm"
                        onClick={() => copyText(`${c.id}-pass`, c.password)}
                        aria-label="Copier le mot de passe"
                      >
                        {copied === `${c.id}-pass` ? <Check size={14} style={{ color: "#2e9e5b" }} /> : <Copy size={14} />}
                        <span style={{ fontSize: "0.8rem" }}>{copied === `${c.id}-pass` ? "Copié" : "Copier"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn link sm"
                      onClick={() => {
                        setCustomPwdChild(isEditingCustomPwd ? null : c.id);
                        setCustomPwdValue("");
                      }}
                      style={{ fontSize: "0.82rem", padding: "2px 6px" }}
                    >
                      <Edit3 size={13} style={{ marginRight: 3 }} />
                      {isEditingCustomPwd ? "Annuler" : "Modifier"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulaire de modification personnalisée du mot de passe */}
              {isEditingCustomPwd && (
                <div
                  style={{
                    background: "rgba(113, 60, 255, 0.08)",
                    border: "1px solid rgba(113, 60, 255, 0.25)",
                    borderRadius: 10,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <b style={{ fontSize: "0.92rem", color: "#c4d1f7" }}>
                    Définir un mot de passe facile à retenir pour {c.name}
                  </b>
                  <p className="small muted" style={{ margin: 0 }}>
                    Exemple : un mot simple (ex: <code>soleil</code>, <code>maths12</code>) ou un code à 4 chiffres (ex: <code>1234</code>).
                  </p>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <input
                      type="text"
                      className="field"
                      style={{ maxWidth: 220, fontSize: "0.95rem" }}
                      placeholder="Nouveau mot de passe"
                      value={customPwdValue}
                      onChange={(e) => setCustomPwdValue(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn primary sm"
                      disabled={busy || customPwdValue.trim().length < 4}
                      onClick={() => handleSetCustomPassword(c.id)}
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      className="btn ghost sm"
                      disabled={busy}
                      onClick={() => handleGenerateNewPassword(c.id, c.name)}
                    >
                      <RefreshCw size={13} style={{ marginRight: 4 }} />
                      Générer au hasard
                    </button>
                  </div>
                </div>
              )}

              {/* Actions de partage et gestion */}
              <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={() => copyText(`${c.id}-link`, directUrl)}
                    title="Copie le lien direct qui connecte l'élève automatiquement"
                  >
                    {copied === `${c.id}-link` ? <Check size={14} style={{ color: "#2e9e5b" }} /> : <ExternalLink size={14} />}
                    {copied === `${c.id}-link` ? "Lien direct copié !" : "Copier le lien direct (1 clic)"}
                  </button>

                  <button
                    type="button"
                    className="btn link sm"
                    disabled={busy}
                    onClick={() => {
                      if (supabaseReady) void run(() => remoteResetChild(c.id));
                      else regenerateLogin(parentId, c.id);
                    }}
                    style={{ fontSize: "0.82rem" }}
                  >
                    Nouvel identifiant
                  </button>
                </div>

                <button
                  type="button"
                  className="btn link sm"
                  disabled={busy}
                  style={{ color: "var(--danger, #ff6b6b)", fontSize: "0.82rem" }}
                  onClick={() => removeAccess(c.id, c.name)}
                >
                  <Trash2 size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulaire d'ajout d'un nouvel enfant */}
      <form
        className="stack-sm"
        style={{
          marginTop: 12,
          padding: "16px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          border: "1px dashed var(--line, rgba(255,255,255,0.15))",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          const kid = { name, level, serie: serie || undefined };
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
        <b style={{ fontSize: "0.98rem", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} style={{ color: "#713cff" }} /> Ajouter un autre enfant
        </b>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <input
            className="field"
            required
            placeholder="Prénom de l'enfant"
            aria-label="Prénom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ minWidth: 160 }}
          />
          <select
            className="field"
            aria-label="Classe"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value as LevelId);
              setSerie("");
            }}
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          {seriesAt(level).length > 0 && (
            <select className="field" aria-label="Série" value={serie} onChange={(e) => setSerie(e.target.value)}>
              <option value="">Toutes les séries</option>
              {seriesAt(level).map((x) => (
                <option key={x} value={x}>
                  Série {x}
                </option>
              ))}
            </select>
          )}
          <button className="btn primary" type="submit" disabled={busy}>
            <Plus size={16} aria-hidden="true" /> Créer l'accès
          </button>
        </div>
        {error && <p className="auth-error" role="alert" style={{ marginTop: 8 }}>{error}</p>}
      </form>

      {/* Modal QR Code de connexion directe */}
      {qrModalChild && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 6, 32, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setQrModalChild(null)}
        >
          <div
            className="card stack"
            style={{
              maxWidth: 400,
              width: "100%",
              background: "#1c1545",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: 24,
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row between" style={{ alignItems: "center" }}>
              <h3 id="qr-title" style={{ margin: 0, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8 }}>
                <QrCode size={20} style={{ color: "#ffc63d" }} />
                Connexion élève : {qrModalChild.name}
              </h3>
              <button
                type="button"
                className="btn ghost sm"
                onClick={() => setQrModalChild(null)}
                aria-label="Fermer"
                style={{ padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <p className="small muted" style={{ margin: "4px 0 16px 0" }}>
              Votre enfant peut scanner ce QR Code avec l'appareil photo de son téléphone ou de sa tablette pour se connecter directement.
            </p>

            <div
              style={{
                background: "#ffffff",
                padding: 16,
                borderRadius: 16,
                display: "inline-block",
                margin: "0 auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={qrModalChild.qrDataUrl}
                alt={`QR code de connexion pour ${qrModalChild.name}`}
                width={240}
                height={240}
                style={{ display: "block" }}
              />
            </div>

            <p style={{ fontSize: "0.85rem", color: "#ffc63d", fontWeight: 700, margin: "14px 0 0 0" }}>
              ✨ Connexion automatique en 1 seconde sans taper de mot de passe !
            </p>

            <div className="row" style={{ gap: 8, marginTop: 16, justifyContent: "center" }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => copyText("qr-link", qrModalChild.url)}
              >
                {copied === "qr-link" ? <Check size={16} /> : <Copy size={16} />}
                {copied === "qr-link" ? "Lien copié !" : "Copier le lien direct"}
              </button>
              <button type="button" className="btn primary" onClick={() => setQrModalChild(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
