export const SUBSCRIPTION_PLANS = {
  essential: {
    id: "essential",
    name: "Essentiel",
    amount: 10000,
    maxChildren: 1,
    features: [
      "1 enfant",
      "Exercices de mathématiques disponibles",
      "Corrections et explications",
      "Entraînement adapté au niveau scolaire",
      "Suivi des résultats dans la plateforme",
    ],
  },
  family: {
    id: "family",
    name: "Famille",
    amount: 15000,
    maxChildren: 2,
    popular: true,
    features: [
      "Jusqu'à 2 enfants",
      "Tous les avantages Essentiel",
      "Suivi individuel de chaque enfant",
      "Identification des notions à renforcer",
      "Révisions personnalisées",
    ],
  },
  family_plus: {
    id: "family_plus",
    name: "Famille Plus",
    amount: 20000,
    maxChildren: 4,
    features: [
      "Jusqu'à 4 enfants",
      "Tous les avantages Famille",
      "Suivi distinct de chaque enfant",
      "Entraînements ciblés sur les difficultés",
      "Bilans détaillés pour les parents",
    ],
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

export function isSubscriptionPlanId(value: unknown): value is SubscriptionPlanId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value);
}

export function subscriptionPlan(id: string | null | undefined) {
  return isSubscriptionPlanId(id)
    ? SUBSCRIPTION_PLANS[id]
    : SUBSCRIPTION_PLANS.essential;
}
