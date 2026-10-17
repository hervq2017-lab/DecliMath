import { CheckCircle2, CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { subscriptionPlan, SubscriptionPlanId } from "../lib/subscriptionPlans";
import { supabase } from "../lib/supabase";
import { currentUser, update, useStore } from "../store";

type Status = "checking" | "pending" | "approved" | "error";

export default function PaymentReturn() {
  const user = currentUser(useStore());
  const [params] = useSearchParams();
  const reference = params.get("reference") ?? "";
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [paidUntil, setPaidUntil] = useState<string | null>(null);

  const verify = useCallback(async () => {
    if (!reference) {
      setStatus("error");
      setMessage("La référence de paiement est absente de cette adresse.");
      return;
    }
    if (user?.role !== "parent") {
      setStatus("error");
      setMessage("Connectez-vous à votre espace parent pour vérifier ce paiement.");
      return;
    }
    if (!supabase) {
      setStatus("error");
      setMessage("La connexion sécurisée au serveur de paiement n'est pas disponible.");
      return;
    }

    setStatus("checking");
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Votre session a expiré. Reconnectez-vous puis relancez la vérification.");
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "verify-checkout", reference }),
      });
      const result = await response.json().catch(() => ({})) as {
        status?: "approved" | "pending" | "failed";
        plan?: string;
        paidUntil?: string | null;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "La vérification du paiement a échoué.");
      if (result.status === "approved" && result.plan) {
        const until = result.paidUntil ? Date.parse(result.paidUntil) : undefined;
        update((state) => ({
          ...state,
          users: state.users.map((account) => account.id === user.id
            ? { ...account, subscriptionPlan: result.plan as SubscriptionPlanId, paidUntil: until }
            : account),
        }));
        setPlanName(subscriptionPlan(result.plan).name);
        setPaidUntil(until ? new Date(until).toLocaleDateString("fr-FR") : null);
        setStatus("approved");
      } else if (result.status === "failed") {
        setStatus("error");
        setMessage("Cette tentative de paiement n'a pas été validée.");
      } else {
        setStatus("pending");
        setMessage("SasPay n'a pas encore confirmé la transaction. Si vous venez de payer, patientez un instant puis vérifiez à nouveau.");
      }
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Une erreur a empêché la vérification du paiement.");
    }
  }, [reference, user?.id, user?.role]);

  useEffect(() => { void verify(); }, [verify]);

  return (
    <div className="navy">
      <main className="shell no-nav stack center" style={{ paddingTop: 48 }}>
        {status === "checking" && <LoaderCircle className="dm-payment-spinner" size={54} aria-label="Vérification du paiement" />}
        {status === "approved" && <CheckCircle2 size={54} color="#20a466" aria-hidden="true" />}
        {(status === "pending" || status === "error") && <CircleAlert size={54} color="#e6a700" aria-hidden="true" />}
        <h1>{status === "checking" ? "Vérification du paiement…" : status === "approved" ? "Paiement confirmé" : status === "pending" ? "Paiement en cours" : "Vérification impossible"}</h1>
        {status === "approved"
          ? <p className="lead">Votre offre {planName} est activée{paidUntil ? ` jusqu'au ${paidUntil}` : ""}.</p>
          : message && <p className="lead">{message}</p>}
        {status === "pending" && <button className="btn primary" type="button" onClick={() => void verify()}><RefreshCw size={18} aria-hidden="true" /> Vérifier à nouveau</button>}
        {status === "error" && user?.role === "parent" && <button className="btn primary" type="button" onClick={() => void verify()}><RefreshCw size={18} aria-hidden="true" /> Réessayer</button>}
        {user?.role === "parent"
          ? <Link className="btn ghost" to="/">Retour à mon espace parent</Link>
          : <Link className="btn ghost" to={`/commencer?c=login&r=parent&next=${encodeURIComponent(`/paiement/retour?reference=${encodeURIComponent(reference)}`)}`}>Me connecter à mon espace parent</Link>}
        <p className="muted small">L'abonnement n'est activé que lorsque le statut réel du paiement a été vérifié auprès de SasPay.</p>
      </main>
    </div>
  );
}
