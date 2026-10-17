import { SUBSCRIPTION_PLANS, subscriptionPlan } from "../src/lib/subscriptionPlans";

let failures = 0;
function check(condition: boolean, label: string) {
  console.log(`${condition ? "OK   " : "ECHEC "} ${label}`);
  if (!condition) failures++;
}

check(SUBSCRIPTION_PLANS.essential.amount === 10000 && SUBSCRIPTION_PLANS.essential.maxChildren === 1, "Essentiel : 10 000 FCFA par mois, 1 enfant");
check(SUBSCRIPTION_PLANS.family.amount === 15000 && SUBSCRIPTION_PLANS.family.maxChildren === 2, "Famille : 15 000 FCFA par mois, 2 enfants");
check(SUBSCRIPTION_PLANS.family.popular, "Famille est signalée comme offre populaire");
check(SUBSCRIPTION_PLANS.family_plus.amount === 20000 && SUBSCRIPTION_PLANS.family_plus.maxChildren === 4, "Famille Plus : 20 000 FCFA par mois, 4 enfants");
check(subscriptionPlan("inconnu").id === "essential", "une offre inconnue revient à la limite Essentiel");
check(subscriptionPlan("toString").id === "essential", "un nom hérité de l'objet n'est pas pris pour une offre");
check(Object.values(SUBSCRIPTION_PLANS).every((plan) => plan.features.length > 0), "chaque offre affiche ses avantages");

if (failures) {
  console.error(`\n${failures} échec(s)`);
  process.exitCode = 1;
} else {
  console.log("\n0 échec(s)");
}
