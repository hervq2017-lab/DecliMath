import { ContextDef, N, pick, register, Rng, shuffle, Template, Instance, Answer } from "./core";

export interface Item { ctx: string; q: string; options: string[]; i: number; why: string }

const CTX: ContextDef[] = [
  { id: "school", label: "School" },
  { id: "market", label: "Market" },
  { id: "family", label: "Family & home" },
];

/** QCM à partir d'un pool étiqueté par contexte ; options mélangées selon la graine. */
export function qcm(id: string, notionId: string, difficulty: 1 | 2 | 3, intro: string, pool: Item[]): Template {
  return {
    id, notionId, difficulty,
    contexts: CTX.filter((c) => pool.some((p) => p.ctx === c.id)),
    gen(ctx: string, r: Rng): Instance {
      const items = pool.filter((p) => p.ctx === ctx);
      const it = pick(r, items.length ? items : pool);
      const order = shuffle(r, it.options.map((_, k) => k));
      const answer: Answer = { kind: "choice", options: order.map((k) => it.options[k]), index: order.indexOf(it.i) };
      return {
        statement: `${intro}\n\n${it.q}`,
        answer,
        hints: [
          "Read the sentence again and spot the key word (time marker, subject, connector).",
          "Eliminate the options that cannot be grammatically correct.",
          "Name the rule that applies, then test it on each remaining option.",
          `First step: ${it.why.split(".")[0]}.`,
        ],
        solution: `Correct answer: « ${it.options[it.i]} ». ${it.why}`,
      };
    },
  };
}
const a = (level: Parameters<typeof N>[1], title: string) => N("anglais", level, title);

register(
  qcm("a-ci-greet", a("ci", "Greetings"), 1, "Choose the right word.", [
    { ctx: "school", q: "In the morning, the teacher says: « Good ____ , class! »", options: ["morning", "night", "bye", "sorry"], i: 0, why: "On the way to school in the morning, we say « Good morning »." },
    { ctx: "market", q: "You meet a seller at 9 a.m. You say: « ____ , madam! »", options: ["Good morning", "Good night", "Goodbye", "Thank you"], i: 0, why: "A greeting at 9 a.m. is « Good morning »." },
    { ctx: "family", q: "At bedtime you say to your mother: « Good ____ . »", options: ["night", "morning", "afternoon", "hello"], i: 0, why: "Before sleeping we say « Good night »." },
  ]),
  qcm("a-ci-col", a("ci", "Colours and numbers"), 1, "How do you say it in English?", [
    { ctx: "school", q: "« rouge » in English is…", options: ["red", "blue", "green", "black"], i: 0, why: "« Rouge » = red." },
    { ctx: "market", q: "The seller gives you « trois » mangoes. In English: ", options: ["three", "two", "five", "four"], i: 0, why: "« Trois » = three." },
    { ctx: "family", q: "My grandmother's scarf is « jaune ». In English: ", options: ["yellow", "white", "pink", "brown"], i: 0, why: "« Jaune » = yellow." },
  ]),
  qcm("a-cp-fam", a("cp", "Family and friends"), 1, "Choose the right word.", [
    { ctx: "family", q: "My mother's mother is my…", options: ["grandmother", "aunt", "sister", "cousin"], i: 0, why: "The mother of your mother is your grandmother." },
    { ctx: "school", q: "A boy in my class who plays with me is my…", options: ["friend", "uncle", "father", "teacher"], i: 0, why: "A classmate you play with is a friend." },
    { ctx: "market", q: "The man who sells fish and is my father's brother is my…", options: ["uncle", "cousin", "son", "brother"], i: 0, why: "Your father's brother is your uncle." },
  ]),
  qcm("a-cp-ani", a("cp", "Animals"), 1, "Choose the right word.", [
    { ctx: "family", q: "It says « miaou ». It is a…", options: ["cat", "dog", "cow", "hen"], i: 0, why: "A cat says « miaou »." },
    { ctx: "market", q: "At the market, you buy eggs from a…", options: ["hen", "lion", "fish", "goat"], i: 0, why: "Eggs come from a hen." },
    { ctx: "school", q: "The school's mascot is an animal with a long trunk. It is an…", options: ["elephant", "monkey", "snake", "bird"], i: 0, why: "A long trunk = elephant." },
  ]),
  qcm("a-ce2-be", a("ce2", "I am / you are"), 1, "Complete the sentence.", [
    { ctx: "school", q: "I ____ a student.", options: ["am", "is", "are", "be"], i: 0, why: "With « I », we use « am »." },
    { ctx: "market", q: "You ____ a good seller.", options: ["are", "am", "is", "be"], i: 0, why: "With « you », we use « are »." },
    { ctx: "family", q: "My sister ____ at home.", options: ["is", "are", "am", "be"], i: 0, why: "With « she/my sister », we use « is »." },
  ]),
  qcm("a-cm1-ps", a("cm1", "Present simple (routine)"), 2, "Choose the correct form.", [
    { ctx: "school", q: "She ____ to school every day.", options: ["goes", "go", "going", "gone"], i: 0, why: "Present simple, 3rd person singular: add -s/-es (goes)." },
    { ctx: "market", q: "My mother ____ vegetables on Saturdays.", options: ["buys", "buy", "buying", "bought"], i: 0, why: "3rd person singular needs -s: buys." },
    { ctx: "family", q: "We ____ dinner at 7 p.m.", options: ["have", "has", "having", "had"], i: 0, why: "With « we », no -s: have." },
  ]),
  qcm("a-cm2-pc", a("cm2", "Present continuous"), 2, "Choose the correct form.", [
    { ctx: "school", q: "Look! The teacher ____ on the board.", options: ["is writing", "writes", "wrote", "write"], i: 0, why: "« Look! » shows an action happening now: present continuous (is + -ing)." },
    { ctx: "market", q: "Listen! The sellers ____ loudly.", options: ["are shouting", "shout", "shouted", "is shouting"], i: 0, why: "« Listen! » = now: present continuous with « are »." },
    { ctx: "family", q: "I can't talk, I ____ dinner.", options: ["am cooking", "cook", "cooked", "cooks"], i: 0, why: "An action in progress at this moment: am + -ing." },
  ]),
  qcm("a-5e-past", a("5e", "Past simple"), 2, "Choose the correct past form.", [
    { ctx: "school", q: "Yesterday, we ____ a test.", options: ["had", "have", "has", "having"], i: 0, why: "« Yesterday » = past simple; have → had." },
    { ctx: "market", q: "Last Sunday my aunt ____ fruit at the market.", options: ["bought", "buyed", "buy", "buys"], i: 0, why: "Irregular verb: buy → bought." },
    { ctx: "family", q: "My brother ____ home late last night.", options: ["came", "comed", "come", "comes"], i: 0, why: "Irregular verb: come → came." },
  ]),
  qcm("a-5e-comp", a("5e", "Comparatives and superlatives"), 2, "Choose the correct form.", [
    { ctx: "school", q: "Awa is ____ than Moussa in maths.", options: ["better", "gooder", "more good", "best"], i: 0, why: "Irregular comparative: good → better." },
    { ctx: "market", q: "This mango is ____ of all.", options: ["the sweetest", "sweeter", "more sweet", "sweetest"], i: 0, why: "Superlative of a short adjective: the + -est." },
    { ctx: "family", q: "My house is ____ than yours.", options: ["bigger", "more big", "biggest", "big"], i: 0, why: "Short adjective comparative: -er (double the g)." },
  ]),
  qcm("a-3e-cond", a("3e", "First conditional"), 2, "Choose the correct form.", [
    { ctx: "school", q: "If you study hard, you ____ the exam.", options: ["will pass", "would pass", "passed", "pass"], i: 0, why: "First conditional: if + present simple, will + base verb." },
    { ctx: "market", q: "If it rains, the market ____ empty.", options: ["will be", "would be", "was", "is being"], i: 0, why: "if + present → will + infinitive." },
    { ctx: "family", q: "If I finish early, I ____ you.", options: ["will help", "helped", "would help", "help"], i: 0, why: "Real possibility in the future: will." },
  ]),
  qcm("a-tle-tenses", a("tle", "Temps verbaux (B2)"), 3, "Choose the correct form.", [
    { ctx: "school", q: "She ____ in London since 2019.", options: ["has lived", "lives", "lived", "is living"], i: 0, why: "« since 2019 » = situation continuing to now: present perfect." },
    { ctx: "market", q: "By the time we arrived, the stalls ____ .", options: ["had closed", "closed", "have closed", "were closing"], i: 0, why: "Action before a past moment: past perfect." },
    { ctx: "family", q: "If I ____ more time, I would visit my grandparents more often.", options: ["had", "have", "would have", "will have"], i: 0, why: "Second conditional: if + past simple, would + base." },
  ]),
  qcm("a-tle-conn", a("tle", "Connecteurs logiques"), 3, "Choose the best linking word.", [
    { ctx: "school", q: "____ the exam was difficult, most students passed.", options: ["Although", "Despite", "Therefore", "Because"], i: 0, why: "« Although » introduces a clause with subject + verb." },
    { ctx: "market", q: "Prices rose; ____ , fewer people bought rice.", options: ["consequently", "however", "although", "unless"], i: 0, why: "The second idea is a result: « consequently »." },
    { ctx: "family", q: "He was tired; ____ , he finished his homework.", options: ["nevertheless", "therefore", "so that", "because"], i: 0, why: "The two ideas contrast: « nevertheless »." },
  ]),
);
export type { Template };
