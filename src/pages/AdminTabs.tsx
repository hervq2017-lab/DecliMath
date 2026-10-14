import { Banknote, Eye, KeyRound, Search, ShieldAlert, Trash2, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { ProgressBar } from "../components/ui";
import { LEVELS } from "../curriculum";
import { coverage } from "../engine";
import { addPayment, decidePayment, deleteAccount, hasActivePlan, resetPassword, revokeAccess, setSuspended, startPreview } from "../adminActions";
import { currentUser, Payment, PaymentStatus, useStore, User } from "../store";

const lvlLabel = (id?: string) => LEVELS.find((l) => l.id === id)?.label ?? id ?? "";
const fmtDate = (t?: number) => (t ? new Date(t).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const ROLE_LABEL = { student: "Élève", parent: "Parent", admin: "Admin" } as const;
const STATUS_LABEL: Record<PaymentStatus, string> = { pending: "En attente", approved: "Validé", rejected: "Refusé" };

function useFlash() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const show = (error: string | null, success: string) => setMsg(error ? { ok: false, text: error } : { ok: true, text: success });
  const node = msg && <p role="status" className={`ad-flash ${msg.ok ? "good" : "bad"}`}>{msg.text}</p>;
  return { show, node };
}

/* ------------------------------------------------------------------ Contenu */
export function ContentTab() {
  const cov = useMemo(() => coverage(), []);
  const [lvl, setLvl] = useState("all");
  const [q, setQ] = useState("");
  const rows = LEVELS.map((l) => {
    const r = cov.rows.filter((x) => x.n.level === l.id && x.n.subject === "maths");
    return { l, total: r.length, covered: r.filter((x) => x.templates > 0).length, templates: r.reduce((s, x) => s + x.templates, 0) };
  }).filter((x) => x.total > 0);
  const missing = cov.rows.filter((x) => x.templates === 0 && x.n.subject === "maths" && (lvl === "all" || x.n.level === lvl) && (!q.trim() || `${x.n.title} ${x.n.chapter}`.toLowerCase().includes(q.trim().toLowerCase())));
  const totalT = rows.reduce((s, r) => s + r.templates, 0), totalN = rows.reduce((s, r) => s + r.total, 0), totalC = rows.reduce((s, r) => s + r.covered, 0);
  return (
    <>
      <section className="card ad-panel stack-sm" aria-labelledby="ct-h">
        <h2 id="ct-h" className="ad-h">Contenu de maths par classe <span className="ad-count">{totalT} gabarits</span></h2>
        <ProgressBar value={totalN ? Math.round((totalC / totalN) * 100) : 0} tone="green" label="Notions couvertes" />
        <div className="ad-table" role="table" aria-label="Couverture par classe">
          <div className="ad-tr ad-th" role="row"><span role="columnheader">Classe</span><span role="columnheader">Notions couvertes</span><span role="columnheader">Gabarits</span></div>
          {rows.map(({ l, total, covered, templates }) => (
            <div className="ad-tr" role="row" key={l.id}>
              <span role="cell"><b>{l.label}</b></span>
              <span role="cell">{covered}/{total} <i className="ad-bar"><b style={{ width: `${Math.round((covered / total) * 100)}%` }} /></i></span>
              <span role="cell">{templates}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="card ad-panel stack-sm" aria-labelledby="mi-h">
        <h2 id="mi-h" className="ad-h">Notions sans gabarit <span className="ad-count">{missing.length}</span></h2>
        <div className="ad-tools">
          <label className="ad-search"><Search size={18} aria-hidden="true" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une notion" aria-label="Rechercher une notion" /></label>
          <div className="chips scroll" role="group" aria-label="Filtrer par classe">
            <button type="button" className={`chip small${lvl === "all" ? " active" : ""}`} onClick={() => setLvl("all")}>Toutes</button>
            {rows.filter((r) => r.covered < r.total).map(({ l }) => <button key={l.id} type="button" className={`chip small${lvl === l.id ? " active" : ""}`} onClick={() => setLvl(l.id)}>{l.label}</button>)}
          </div>
        </div>
        <div className="ad-list">
          {missing.slice(0, 60).map((x) => (
            <div className="ad-item" key={x.n.id} style={{ ["--i" as string]: 0 }}>
              <span className="grow"><b>{x.n.title}</b><span className="muted small">{lvlLabel(x.n.level)} · {x.n.chapter}</span></span>
            </div>
          ))}
          {missing.length === 0 && <p className="muted center ad-empty">Toutes les notions de cette sélection ont des gabarits.</p>}
          {missing.length > 60 && <p className="muted small center">{missing.length - 60} autres : affinez le filtre.</p>}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Comptes */
export function AccountsTab() {
  const state = useStore();
  const admin = currentUser(state)!;
  const { show, node } = useFlash();
  const [role, setRole] = useState<"all" | "student" | "parent">("all");
  const [q, setQ] = useState("");
  const [temp, setTemp] = useState<{ id: string; pwd: string } | null>(null);
  const list = state.users.filter((u) => u.role !== "admin" && (role === "all" || u.role === role) && (!q.trim() || `${u.name} ${u.email}`.toLowerCase().includes(q.trim().toLowerCase())));
  const parentOf = (u: User) => state.users.find((p) => p.id === u.parentId);
  return (
    <section className="card ad-panel stack-sm" aria-labelledby="ac-h">
      <div className="row between">
        <h2 id="ac-h" className="ad-h">Comptes <span className="ad-count">{list.length}</span></h2>
        <div className="ad-seg" role="group" aria-label="Type de compte">
          {([["all", "Tous"], ["student", "Élèves"], ["parent", "Parents"]] as const).map(([v, t]) => <button key={v} type="button" aria-pressed={role === v} onClick={() => setRole(v)}>{t}</button>)}
        </div>
      </div>
      <label className="ad-search"><Search size={18} aria-hidden="true" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou e-mail" aria-label="Rechercher un compte" /></label>
      {node}
      {temp && <p className="ad-flash good" role="status">Mot de passe provisoire : <b className="ad-code">{temp.pwd}</b> — communiquez-le à la personne, il ne sera plus affiché.</p>}
      <div className="ad-list">
        {list.map((u) => (
          <div className={`ad-acc${u.suspended ? " off" : ""}`} key={u.id}>
            <span className="grow">
              <b>{u.name} <span className="ad-role">{ROLE_LABEL[u.role]}</span> {u.suspended && <span className="ad-st off">Suspendu</span>} {hasActivePlan(u) && <span className="ad-st on">Abonné</span>}</b>
              <span className="muted small">{u.email} · {u.role === "student" ? `${lvlLabel(u.level)}${u.serie ? ` ${u.serie}` : ""}` : "Parent"} · {u.country} · inscrit le {fmtDate(u.createdAt)}</span>
              {u.role === "student" && <span className="muted small">{parentOf(u) ? `Parent : ${parentOf(u)!.name}` : "Sans parent lié"}</span>}
            </span>
            <span className="ad-acts">
              <button type="button" className="btn primary small-btn" onClick={() => { const e = startPreview(admin.id, u.id); if (e) show(e, ""); }}><Eye size={16} aria-hidden="true" /> Voir comme {u.role === "parent" ? "ce parent" : "cet élève"}</button>
              <button type="button" className="btn ghost small-btn" onClick={() => show(setSuspended(admin.id, u.id, !u.suspended), u.suspended ? "Compte réactivé." : "Compte suspendu.")}><ShieldAlert size={16} aria-hidden="true" /> {u.suspended ? "Réactiver" : "Suspendre"}</button>
              <button type="button" className="btn ghost small-btn" onClick={() => { const r = resetPassword(admin.id, u.id); if (r.error) show(r.error, ""); else { setTemp({ id: u.id, pwd: r.password! }); show(null, `Mot de passe de ${u.name} réinitialisé.`); } }}><KeyRound size={16} aria-hidden="true" /> Mot de passe</button>
              <button type="button" className="btn ghost small-btn ad-danger" onClick={() => { if (window.confirm(`Supprimer définitivement le compte de ${u.name} et ses données ?`)) { setTemp(null); show(deleteAccount(admin.id, u.id), "Compte supprimé."); } }}><Trash2 size={16} aria-hidden="true" /> Supprimer</button>
            </span>
          </div>
        ))}
        {list.length === 0 && <p className="muted center ad-empty">Aucun compte ne correspond.</p>}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Paiements */
const CURRENCIES = ["XOF", "XAF", "EUR"] as const;
export function PaymentsTab() {
  const state = useStore();
  const admin = currentUser(state)!;
  const { show, node } = useFlash();
  const [filter, setFilter] = useState<PaymentStatus | "all">("pending");
  const payers = state.users.filter((u) => u.role !== "admin");
  const [f, setF] = useState({ userId: "", amount: "", currency: "XOF" as Payment["currency"], method: "Virement", reference: "", months: "1" });
  const all = state.payments ?? [];
  const list = all.filter((p) => filter === "all" || p.status === filter);
  const nameOf = (id: string) => state.users.find((u) => u.id === id)?.name ?? "Compte supprimé";
  const approved = all.filter((p) => p.status === "approved");
  const revenue = (cur: string) => approved.filter((p) => p.currency === cur).reduce((s, p) => s + p.amount, 0);
  const subscribers = state.users.filter((u) => hasActivePlan(u));
  return (
    <>
      <section className="ad-kpis" aria-label="Chiffres paiements">
        <div className="ad-kpi ad-yellow"><span className="ad-kpi-ic"><Banknote size={22} aria-hidden="true" /></span><b>{all.filter((p) => p.status === "pending").length}</b><span>À valider</span></div>
        <div className="ad-kpi ad-green"><span className="ad-kpi-ic"><UserCheck size={22} aria-hidden="true" /></span><b>{subscribers.length}</b><span>Abonnés actifs</span></div>
        {CURRENCIES.filter((c) => revenue(c) > 0).map((c) => <div key={c} className="ad-kpi ad-blue"><span className="ad-kpi-ic"><Banknote size={22} aria-hidden="true" /></span><b>{revenue(c).toLocaleString("fr-FR")}</b><span>{c} encaissés</span></div>)}
      </section>

      <section className="card ad-panel stack-sm" aria-labelledby="np-h">
        <h2 id="np-h" className="ad-h">Enregistrer un paiement</h2>
        <form className="ad-form" onSubmit={(e) => { e.preventDefault(); const err = addPayment(admin.id, { userId: f.userId, amount: Number(f.amount), currency: f.currency, method: f.method, reference: f.reference, months: Number(f.months) }); show(err, "Paiement enregistré, en attente de validation."); if (!err) setF({ ...f, amount: "", reference: "" }); }}>
          <label>Compte<select value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })}><option value="">Choisir…</option>{payers.map((u) => <option key={u.id} value={u.id}>{u.name} ({ROLE_LABEL[u.role]}) — {u.email}</option>)}</select></label>
          <label>Montant<input type="number" min="1" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></label>
          <label>Devise<select value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as Payment["currency"] })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Moyen<select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{["Virement", "Mobile money", "Espèces", "Autre"].map((m) => <option key={m}>{m}</option>)}</select></label>
          <label>Référence de la preuve<input value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} placeholder="N° de transaction" /></label>
          <label>Durée (mois)<input type="number" min="1" max="24" value={f.months} onChange={(e) => setF({ ...f, months: e.target.value })} /></label>
          <button className="btn primary" type="submit">Enregistrer</button>
        </form>
        {node}
      </section>

      <section className="card ad-panel stack-sm" aria-labelledby="lp-h">
        <div className="row between">
          <h2 id="lp-h" className="ad-h">Paiements <span className="ad-count">{list.length}</span></h2>
          <div className="ad-seg" role="group" aria-label="Statut">
            {([["pending", "À valider"], ["approved", "Validés"], ["rejected", "Refusés"], ["all", "Tous"]] as const).map(([v, t]) => <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}>{t}</button>)}
          </div>
        </div>
        <div className="ad-list">
          {list.map((p) => (
            <div className="ad-acc" key={p.id}>
              <span className="grow"><b>{nameOf(p.userId)} · {p.amount.toLocaleString("fr-FR")} {p.currency} <span className={`ad-st ${p.status === "approved" ? "on" : "off"}`}>{STATUS_LABEL[p.status]}</span></b>
                <span className="muted small">{p.method} · réf. {p.reference} · {p.months} mois · saisi le {fmtDate(p.ts)}{p.decidedAt ? ` · traité le ${fmtDate(p.decidedAt)}` : ""}{p.note ? ` · ${p.note}` : ""}</span></span>
              {p.status === "pending" && <span className="ad-acts">
                <button type="button" className="btn primary small-btn" onClick={() => show(decidePayment(admin.id, p.id, true), "Paiement validé, accès activé.")}>Valider</button>
                <button type="button" className="btn ghost small-btn ad-danger" onClick={() => show(decidePayment(admin.id, p.id, false, window.prompt("Motif du refus (facultatif)") ?? undefined), "Paiement refusé.")}>Refuser</button>
              </span>}
            </div>
          ))}
          {list.length === 0 && <p className="muted center ad-empty">Aucun paiement dans cette catégorie.</p>}
        </div>
      </section>

      <section className="card ad-panel stack-sm" aria-labelledby="sb-h">
        <h2 id="sb-h" className="ad-h">Abonnements actifs <span className="ad-count">{subscribers.length}</span></h2>
        <div className="ad-list">
          {subscribers.map((u) => (
            <div className="ad-acc" key={u.id}>
              <span className="grow"><b>{u.name}</b><span className="muted small">{u.email} · actif jusqu'au {fmtDate(u.paidUntil)}</span></span>
              <button type="button" className="btn ghost small-btn ad-danger" onClick={() => { if (window.confirm(`Retirer l'accès de ${u.name} ?`)) show(revokeAccess(admin.id, u.id), "Accès retiré."); }}>Retirer l'accès</button>
            </div>
          ))}
          {subscribers.length === 0 && <p className="muted center ad-empty">Aucun abonnement actif.</p>}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Journal */
export function JournalTab() {
  const state = useStore();
  const audit = state.audit ?? [];
  return (
    <section className="card ad-panel stack-sm" aria-labelledby="jr-h">
      <h2 id="jr-h" className="ad-h">Journal des actions <span className="ad-count">{audit.length}</span></h2>
      <div className="ad-list">
        {audit.slice(0, 100).map((a) => (
          <div className="ad-item" key={a.id} style={{ ["--i" as string]: 0 }}>
            <span className="grow"><b>{a.action}</b><span className="muted small">{a.target} · par {state.users.find((u) => u.id === a.adminId)?.name ?? "admin"} · {new Date(a.ts).toLocaleString("fr-FR")}</span></span>
          </div>
        ))}
        {audit.length === 0 && <p className="muted center ad-empty">Aucune action pour le moment.</p>}
      </div>
    </section>
  );
}
