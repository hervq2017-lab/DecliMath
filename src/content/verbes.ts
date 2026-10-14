// Verbes anglais : irréguliers (infinitif, prétérit, participe passé) et réguliers (prétérit en -ed).
// Niveau 1 = les plus courants (6ème) … niveau 4 = le reste (3ème et au-delà).
// Les verbes à double forme acceptée (learnt/learned, burnt/burned…) sont volontairement exclus.

export interface Verbe {
  inf: string;
  past: string;
  pp: string;
  fr: string;
  tier: 1 | 2 | 3 | 4;
  irregular: boolean;
  /** Réguliers : prononciation du -ed (/t/, /d/ ou /ɪd/). */
  snd?: "t" | "d" | "id";
}

const irr = (tier: Verbe["tier"], rows: string): Verbe[] =>
  rows.trim().split("\n").map((l) => {
    const [inf, past, pp, fr] = l.split("|").map((x) => x.trim());
    return { inf, past, pp, fr, tier, irregular: true };
  });

export const IRREGULIERS: Verbe[] = [
  ...irr(1, `
be|was / were|been|être
have|had|had|avoir
do|did|done|faire
go|went|gone|aller
come|came|come|venir
see|saw|seen|voir
eat|ate|eaten|manger
drink|drank|drunk|boire
take|took|taken|prendre
make|made|made|fabriquer
get|got|got|obtenir
give|gave|given|donner
know|knew|known|savoir, connaître
write|wrote|written|écrire
read|read|read|lire
buy|bought|bought|acheter
sell|sold|sold|vendre
say|said|said|dire
tell|told|told|raconter
speak|spoke|spoken|parler
run|ran|run|courir
sit|sat|sat|s'asseoir
stand|stood|stood|se tenir debout
sleep|slept|slept|dormir
find|found|found|trouver
put|put|put|mettre
bring|brought|brought|apporter
think|thought|thought|penser
leave|left|left|partir, quitter
lose|lost|lost|perdre
meet|met|met|rencontrer
pay|paid|paid|payer
begin|began|begun|commencer
`),
  ...irr(2, `
break|broke|broken|casser
choose|chose|chosen|choisir
draw|drew|drawn|dessiner
drive|drove|driven|conduire
fall|fell|fallen|tomber
feel|felt|felt|ressentir
fly|flew|flown|voler (en l'air)
forget|forgot|forgotten|oublier
hear|heard|heard|entendre
hold|held|held|tenir
keep|kept|kept|garder
lend|lent|lent|prêter
let|let|let|laisser, permettre
mean|meant|meant|signifier
send|sent|sent|envoyer
spend|spent|spent|dépenser, passer (du temps)
swim|swam|swum|nager
teach|taught|taught|enseigner
wear|wore|worn|porter (un vêtement)
win|won|won|gagner
build|built|built|construire
catch|caught|caught|attraper
cut|cut|cut|couper
hit|hit|hit|frapper
hurt|hurt|hurt|blesser
shut|shut|shut|fermer
sing|sang|sung|chanter
ring|rang|rung|sonner
rise|rose|risen|se lever (soleil)
shake|shook|shaken|secouer
throw|threw|thrown|jeter, lancer
grow|grew|grown|grandir, cultiver
understand|understood|understood|comprendre
wake|woke|woken|se réveiller
`),
  ...irr(3, `
bend|bent|bent|plier
bite|bit|bitten|mordre
blow|blew|blown|souffler
cost|cost|cost|coûter
deal|dealt|dealt|traiter, distribuer
dig|dug|dug|creuser
feed|fed|fed|nourrir
fight|fought|fought|se battre
forgive|forgave|forgiven|pardonner
freeze|froze|frozen|geler
hide|hid|hidden|cacher
lay|laid|laid|poser, pondre
lead|led|led|mener
lie|lay|lain|être allongé
ride|rode|ridden|monter (vélo, cheval)
seek|sought|sought|chercher
set|set|set|fixer, régler
shine|shone|shone|briller
shoot|shot|shot|tirer (arme)
sink|sank|sunk|couler
slide|slid|slid|glisser
spin|spun|spun|tourner
split|split|split|fendre
spread|spread|spread|répandre
steal|stole|stolen|voler (dérober)
stick|stuck|stuck|coller
sweep|swept|swept|balayer
swear|swore|sworn|jurer
tear|tore|torn|déchirer
withdraw|withdrew|withdrawn|retirer
`),
  ...irr(4, `
arise|arose|arisen|survenir
awake|awoke|awoken|s'éveiller
bear|bore|borne|supporter, porter
beat|beat|beaten|battre
become|became|become|devenir
bet|bet|bet|parier
bind|bound|bound|lier
bleed|bled|bled|saigner
breed|bred|bred|élever (animaux)
broadcast|broadcast|broadcast|diffuser
cast|cast|cast|jeter, distribuer (rôles)
cling|clung|clung|s'accrocher
creep|crept|crept|ramper
flee|fled|fled|fuir
fling|flung|flung|lancer avec force
forbid|forbade|forbidden|interdire
foresee|foresaw|foreseen|prévoir
foretell|foretold|foretold|prédire
grind|ground|ground|moudre
mistake|mistook|mistaken|se tromper
misunderstand|misunderstood|misunderstood|mal comprendre
overcome|overcame|overcome|surmonter
overtake|overtook|overtaken|dépasser
quit|quit|quit|quitter, arrêter
rebuild|rebuilt|rebuilt|reconstruire
redo|redid|redone|refaire
repay|repaid|repaid|rembourser
rewrite|rewrote|rewritten|réécrire
rid|rid|rid|débarrasser
shed|shed|shed|perdre (feuilles), verser
speed|sped|sped|aller vite
strike|struck|struck|frapper, heurter
strive|strove|striven|s'efforcer
thrust|thrust|thrust|enfoncer
tread|trod|trodden|marcher sur
undergo|underwent|undergone|subir
undertake|undertook|undertaken|entreprendre
undo|undid|undone|défaire
uphold|upheld|upheld|maintenir, défendre
upset|upset|upset|contrarier
weave|wove|woven|tisser
weep|wept|wept|pleurer
wring|wrung|wrung|essorer, tordre
spit|spat|spat|cracher
`),
];

const reg = (tier: Verbe["tier"], rows: string): Verbe[] =>
  rows.trim().split("\n").map((l) => {
    const [inf, past, fr, snd] = l.split("|").map((x) => x.trim());
    return { inf, past, pp: past, fr, tier, irregular: false, snd: snd as Verbe["snd"] };
  });

export const REGULIERS: Verbe[] = [
  ...reg(1, `
play|played|jouer|d
work|worked|travailler|t
walk|walked|marcher|t
talk|talked|parler, discuter|t
watch|watched|regarder|t
help|helped|aider|t
want|wanted|vouloir|id
need|needed|avoir besoin de|id
like|liked|aimer|t
live|lived|habiter, vivre|d
use|used|utiliser|d
open|opened|ouvrir|d
start|started|commencer|id
wait|waited|attendre|id
ask|asked|demander|t
answer|answered|répondre|d
clean|cleaned|nettoyer|d
cook|cooked|cuisiner|t
call|called|appeler|d
visit|visited|visiter|id
`),
  ...reg(2, `
love|loved|aimer (beaucoup)|d
close|closed|fermer|d
arrive|arrived|arriver|d
decide|decided|décider|id
change|changed|changer|d
smile|smiled|sourire|d
stay|stayed|rester|d
enjoy|enjoyed|apprécier|d
listen|listened|écouter|d
look|looked|regarder, avoir l'air|t
jump|jumped|sauter|t
dance|danced|danser|t
finish|finished|finir|t
wash|washed|laver|t
push|pushed|pousser|t
pass|passed|passer, réussir|t
paint|painted|peindre|id
rain|rained|pleuvoir|d
count|counted|compter|id
move|moved|déménager, bouger|d
`),
  ...reg(3, `
study|studied|étudier|d
try|tried|essayer|d
cry|cried|pleurer|d
carry|carried|porter|d
copy|copied|copier|d
worry|worried|s'inquiéter|d
marry|married|épouser|d
stop|stopped|arrêter|t
plan|planned|planifier|d
drop|dropped|laisser tomber|t
shop|shopped|faire des courses|t
admit|admitted|admettre|id
prefer|preferred|préférer|d
travel|travelled|voyager|d
believe|believed|croire|d
receive|received|recevoir|d
hope|hoped|espérer|t
die|died|mourir|d
fix|fixed|réparer|t
mix|mixed|mélanger|t
`),
  ...reg(4, `
fry|fried|frire|d
reply|replied|répondre|d
apply|applied|postuler, appliquer|d
dry|dried|sécher|d
occur|occurred|se produire|d
refer|referred|faire référence à|d
regret|regretted|regretter|id
control|controlled|contrôler|d
permit|permitted|permettre|id
equip|equipped|équiper|t
achieve|achieved|réaliser, atteindre|d
improve|improved|améliorer|d
discover|discovered|découvrir|d
invent|invented|inventer|id
protect|protected|protéger|id
`),
];

/** Verbes d'un niveau : cumul des paliers jusqu'à celui de la classe. */
export const TIER_OF_LEVEL: Record<string, Verbe["tier"]> = { "6e": 1, "5e": 2, "4e": 3, "3e": 4, "2nde": 4, "1ere": 4, tle: 4 };
export const irregularsUpTo = (tier: number) => IRREGULIERS.filter((v) => v.tier <= tier);
export const regularsUpTo = (tier: number) => REGULIERS.filter((v) => v.tier <= tier);
