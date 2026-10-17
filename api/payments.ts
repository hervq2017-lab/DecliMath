import { createClient } from "@supabase/supabase-js";
import { isSubscriptionPlanId, SUBSCRIPTION_PLANS } from "../src/lib/subscriptionPlans";

interface Req {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
  setHeader(k: string, v: string): void;
}

const CURRENCY_BY_COUNTRY: Record<string, "XOF" | "XAF"> = {
  BF: "XOF", BJ: "XOF", CI: "XOF", GW: "XOF", ML: "XOF", NE: "XOF", SN: "XOF", TG: "XOF",
  CM: "XAF", CF: "XAF", TD: "XAF", CG: "XAF", GQ: "XAF", GA: "XAF",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const obj = body as { error?: unknown; message?: unknown };
  if (typeof obj.message === "string") return obj.message;
  if (typeof obj.error === "string") return obj.error;
  if (obj.error && typeof obj.error === "object" && "message" in obj.error && typeof obj.error.message === "string") return obj.error.message;
  return "";
}

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const saspayKey = process.env.SASPAY_API_KEY;
  if (!url || !serviceKey || !saspayKey) {
    return res.status(503).json({ error: "Le paiement en ligne n'est pas encore configuré sur le serveur." });
  }

  let body: { action?: unknown; plan?: unknown; reference?: unknown };
  try {
    body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}) as typeof body;
  } catch {
    return res.status(400).json({ error: "Requête invalide." });
  }

  const authorization = String(req.headers.authorization ?? "");
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) return res.status(401).json({ error: "Connexion requise." });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
  if (authError || !authData.user) return res.status(401).json({ error: "Session invalide. Reconnectez-vous." });
  const { data: parent, error: profileError } = await admin
    .from("profiles")
    .select("id,role,name,country,paid_until,subscription_plan,suspended")
    .eq("id", authData.user.id)
    .single();
  if (profileError || !parent) return res.status(404).json({ error: "Profil parent introuvable." });
  if (parent.role !== "parent" || parent.suspended) return res.status(403).json({ error: "Réservé aux comptes parent actifs." });

  if (body.action === "create-checkout") {
    if (!isSubscriptionPlanId(body.plan)) {
      return res.status(400).json({ error: "Choisissez une offre valide." });
    }
    if (typeof body.reference !== "string" || !UUID.test(body.reference)) {
      return res.status(400).json({ error: "Référence de paiement invalide. Réessayez." });
    }
    if (!authData.user.email) return res.status(400).json({ error: "Une adresse e-mail vérifiée est requise pour payer." });

    const plan = SUBSCRIPTION_PLANS[body.plan];
    const { count, error: countError } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", parent.id);
    if (countError) return res.status(500).json({ error: "Impossible de vérifier le nombre d'enfants du compte." });
    if ((count ?? 0) > plan.maxChildren) {
      return res.status(400).json({ error: `Cette offre permet jusqu'à ${plan.maxChildren} enfant${plan.maxChildren > 1 ? "s" : ""}. Supprimez les profils en trop avant de la choisir.` });
    }

    const currency = CURRENCY_BY_COUNTRY[parent.country as string];
    if (!currency) return res.status(400).json({ error: "Le paiement n'est pas disponible dans le pays du compte." });

    const origin = process.env.APP_URL;
    if (!origin) return res.status(503).json({ error: "Le domaine du site n'est pas configuré sur le serveur." });
    let providerResponse: Response;
    try {
      providerResponse = await fetch("https://api.saspay.me/api/v1/checkout-sessions/", {
        method: "POST",
        headers: { Authorization: `Bearer ${saspayKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: String(plan.amount),
          currency,
          country: parent.country,
          description: `Abonnement mensuel DeclickMath — ${plan.name}`,
          customer_email: authData.user.email,
          customer_name: parent.name,
          return_url: `${origin.replace(/\/$/, "")}/paiement/retour?reference=${encodeURIComponent(body.reference)}`,
          metadata: { application: "DeclickMath", plan: plan.id, reference: body.reference },
        }),
      });
    } catch (error) {
      console.error("Échec de connexion à SasPay :", error);
      return res.status(502).json({ error: "SasPay est momentanément indisponible. Réessayez." });
    }

    const providerBody = await providerResponse.json().catch(() => null) as
      | { success?: boolean; data?: { id?: string; checkout_url?: string }; id?: string; checkout_url?: string }
      | null;
    const session = providerBody?.data ?? providerBody;
    if (!providerResponse.ok || providerBody?.success === false || !session?.id || !session.checkout_url) {
      console.error("SasPay n'a pas créé la session de paiement :", providerBody);
      return res.status(502).json({ error: errorMessage(providerBody) || "SasPay n'a pas pu créer la session de paiement." });
    }

    const { error: insertError } = await admin.from("payment_checkouts").insert({
      reference: body.reference,
      user_id: parent.id,
      plan_code: plan.id,
      amount: plan.amount,
      currency,
      provider_session_id: session.id,
      checkout_url: session.checkout_url,
    });
    if (insertError) {
      console.error("Impossible d'enregistrer la session SasPay :", insertError);
      return res.status(500).json({ error: "La session a été créée mais n'a pas pu être enregistrée. Contactez le support avant de payer." });
    }
    return res.status(200).json({ checkoutUrl: session.checkout_url });
  }

  if (body.action === "verify-checkout") {
    if (typeof body.reference !== "string" || !UUID.test(body.reference)) {
      return res.status(400).json({ error: "Référence de paiement invalide." });
    }
    const { data: checkout, error: checkoutError } = await admin
      .from("payment_checkouts")
      .select("reference,user_id,plan_code,amount,currency,provider_session_id,status")
      .eq("reference", body.reference)
      .eq("user_id", parent.id)
      .maybeSingle();
    if (checkoutError) return res.status(500).json({ error: "Impossible de vérifier ce paiement." });
    if (!checkout) return res.status(404).json({ error: "Session de paiement introuvable pour ce compte." });
    if (checkout.status === "approved") {
      return res.status(200).json({ status: "approved", plan: checkout.plan_code, paidUntil: parent.paid_until });
    }
    if (checkout.status !== "pending") return res.status(200).json({ status: checkout.status });

    let statusResponse: Response;
    try {
      statusResponse = await fetch(`https://api.saspay.me/api/v1/checkout-sessions/${encodeURIComponent(checkout.provider_session_id)}/status/`, {
        headers: { Authorization: `Bearer ${saspayKey}` },
      });
    } catch (error) {
      console.error("Échec de vérification du statut SasPay :", error);
      return res.status(502).json({ error: "Impossible de joindre SasPay pour vérifier le paiement." });
    }
    const statusBody = await statusResponse.json().catch(() => null) as
      | { success?: boolean; data?: { status?: string; transaction_status?: string; transaction_id?: string }; status?: string; transaction_status?: string; transaction_id?: string }
      | null;
    const verified = statusBody?.data ?? statusBody;
    if (!statusResponse.ok || statusBody?.success === false || !verified) {
      console.error("SasPay a refusé la vérification du paiement :", statusBody);
      return res.status(502).json({ error: errorMessage(statusBody) || "SasPay n'a pas pu confirmer le paiement." });
    }
    if (verified.status !== "PAID" || verified.transaction_status !== "SUCCESS" || !verified.transaction_id) {
      return res.status(200).json({ status: "pending" });
    }

    const { error: confirmError } = await admin.rpc("confirm_saspay_subscription", {
      p_reference: checkout.reference,
      p_transaction_id: verified.transaction_id,
    });
    if (confirmError) {
      console.error("Impossible d'activer l'abonnement après confirmation SasPay :", confirmError);
      return res.status(500).json({ error: "Paiement confirmé par SasPay, mais l'abonnement n'a pas pu être activé. Contactez le support avec votre référence." });
    }
    const { data: refreshed, error: refreshError } = await admin.from("profiles").select("paid_until,subscription_plan").eq("id", parent.id).single();
    if (refreshError || !refreshed) return res.status(500).json({ error: "Abonnement activé, mais impossible de rafraîchir son statut." });
    return res.status(200).json({ status: "approved", plan: refreshed.subscription_plan, paidUntil: refreshed.paid_until });
  }

  return res.status(400).json({ error: "Action de paiement inconnue." });
}
