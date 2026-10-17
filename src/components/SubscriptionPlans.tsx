import { Check, Crown, LoaderCircle, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { currentUser, useStore } from "../store";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from "../lib/subscriptionPlans";
import { supabase } from "../lib/supabase";

const COUNTRY_NAMES: Record<string, string> = {
  BF: "Burkina Faso", BJ: "Bénin", CI: "Côte d'Ivoire", GW: "Guinée-Bissau", ML: "Mali", NE: "Niger", SN: "Sénégal", TG: "Togo",
  CM: "Cameroun", CF: "République centrafricaine", TD: "Tchad", CG: "Congo", GQ: "Guinée équatoriale", GA: "Gabon",
};
const currencyForCountry = (countryCode: string) => ["CM", "CF", "TD", "CG", "GQ", "GA"].includes(countryCode) ? "XAF" : "XOF";
const formatPrice = (amount: number) => new Intl.NumberFormat("fr-FR").format(amount);

export function SubscriptionPlans({ countryCode = "CI" }: { countryCode?: string }) {
  const user = currentUser(useStore());
  const [busy, setBusy] = useState<SubscriptionPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isParent = user?.role === "parent";

  async function choosePlan(plan: SubscriptionPlanId) {
    if (!isParent) return;
    if (!supabase) {
      setError("Le paiement en ligne nécessite un compte connecté sur le site.");
      return;
    }
    setBusy(plan);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Votre session a expiré. Reconnectez-vous avant de choisir une offre.");
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "create-checkout", plan, reference: crypto.randomUUID() }),
      });
      const result = await response.json().catch(() => ({})) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error ?? "Impossible de préparer le paiement.");
      window.location.assign(result.checkoutUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur a empêché la préparation du paiement.");
      setBusy(null);
    }
  }

  return (
    <div className="dm-plans">
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="dm-plans-grid">
        {(Object.values(SUBSCRIPTION_PLANS)).map((plan) => (
          <article key={plan.id} className={`dm-plan-card${"popular" in plan && plan.popular ? " dm-plan-popular" : ""}`}>
            {"popular" in plan && plan.popular && <span className="dm-plan-badge"><Crown size={14} aria-hidden="true" /> Le plus populaire</span>}
            <div className="dm-plan-head">
              <h3>{plan.name}</h3>
              <p><Users size={16} aria-hidden="true" /> {plan.maxChildren === 1 ? "1 enfant" : `Jusqu'à ${plan.maxChildren} enfants`}</p>
            </div>
            <p className="dm-plan-price">{formatPrice(plan.amount)} <span>FCFA <small>/ mois</small></span></p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}><Check size={16} aria-hidden="true" /> <span>{feature}</span></li>
              ))}
            </ul>
            {isParent ? (
              <button className="lx-btn yellow font-bold dm-plan-button" type="button" disabled={busy !== null} onClick={() => void choosePlan(plan.id)}>
                {busy === plan.id ? <LoaderCircle size={18} className="dm-plan-spinner" aria-hidden="true" /> : null}
                {busy === plan.id ? "Préparation du paiement…" : `Choisir ${plan.name}`}
              </button>
            ) : (
              <Link className="lx-btn yellow font-bold dm-plan-button" to={`/commencer?r=parent&p=${encodeURIComponent(countryCode)}&plan=${plan.id}`}>
                Choisir {plan.name}
              </Link>
            )}
          </article>
        ))}
      </div>
      {isParent && <p className="dm-plan-note">Le renouvellement est manuel : votre abonnement n'est prolongé qu'après confirmation du paiement par SasPay.</p>}
      {!isParent && <p className="dm-plan-note">{COUNTRY_NAMES[countryCode] ?? "Votre pays"} · Paiement sécurisé par SasPay après création et connexion à votre espace parent.</p>}
    </div>
  );
}
