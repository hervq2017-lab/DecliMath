// Initiation à l'anglais au primaire (CI → CM2) : vocabulaire de base et premières phrases.
import { N, register } from "./core";
import { Item, qcm } from "./anglais";

const a = (level: Parameters<typeof N>[1], title: string) => N("anglais", level, title);
const it = (ctx: Item["ctx"], q: string, options: string[], why: string): Item => ({ ctx, q, options, i: 0, why });

register(
  // ---- CI ----
  qcm("a-ci-class", a("ci", "Classroom words"), 1, "Choose the right word.", [
    it("school", "You write with a…", ["pen", "chair", "door", "bag"], "We write with a pen."),
    it("school", "You sit on a…", ["chair", "pen", "book", "board"], "We sit on a chair."),
    it("market", "You carry your things in a…", ["bag", "pencil", "ruler", "desk"], "A bag carries your things."),
    it("market", "The teacher writes on the…", ["board", "bag", "shoe", "rice"], "The teacher writes on the board."),
    it("family", "You read a…", ["book", "chair", "door", "table"], "We read a book."),
    it("family", "You open the…", ["door", "pen", "pencil", "eraser"], "We open the door."),
  ]),
  qcm("a-ci-body", a("ci", "My body"), 1, "Choose the right word.", [
    it("school", "You see with your…", ["eyes", "hands", "feet", "ears"], "We see with our eyes."),
    it("school", "You write with your…", ["hand", "nose", "foot", "knee"], "We write with our hand."),
    it("market", "You smell the fish with your…", ["nose", "mouth", "ear", "leg"], "We smell with our nose."),
    it("market", "You walk with your…", ["legs", "eyes", "ears", "teeth"], "We walk with our legs."),
    it("family", "You listen with your…", ["ears", "feet", "nose", "arms"], "We listen with our ears."),
    it("family", "You eat with your…", ["mouth", "ear", "knee", "nose"], "We eat with our mouth."),
  ]),
  // ---- CP ----
  qcm("a-cp-num", a("cp", "Numbers 1 to 20"), 1, "How do you say it in English?", [
    it("school", "5 is…", ["five", "four", "nine", "fifteen"], "5 = five."),
    it("school", "12 is…", ["twelve", "two", "twenty", "eleven"], "12 = twelve."),
    it("market", "The seller has 8 mangoes. In English: ", ["eight", "eighteen", "three", "seven"], "8 = eight."),
    it("market", "You pay 20 francs. In English: ", ["twenty", "twelve", "two", "thirteen"], "20 = twenty."),
    it("family", "My little brother is 3. In English: ", ["three", "thirteen", "five", "thirty"], "3 = three."),
    it("family", "We have 15 chickens. In English: ", ["fifteen", "fifty", "five", "fourteen"], "15 = fifteen."),
  ]),
  qcm("a-cp-fruit", a("cp", "Fruits and vegetables"), 1, "Choose the right word.", [
    it("school", "A yellow fruit that monkeys like is a…", ["banana", "tomato", "onion", "carrot"], "A banana is yellow."),
    it("school", "A red vegetable for the sauce is a…", ["tomato", "banana", "orange", "mango"], "A tomato is red and used in sauce."),
    it("market", "At the market you buy an…", ["orange", "mango", "banana", "carrot"], "An orange is a fruit."),
    it("market", "A long orange vegetable is a…", ["carrot", "banana", "lemon", "apple"], "A carrot is long and orange."),
    it("family", "Mum cuts an… for the sauce.", ["onion", "banana", "pineapple", "orange"], "An onion goes in the sauce."),
    it("family", "A sweet tropical fruit is a…", ["mango", "onion", "potato", "pepper"], "A mango is sweet."),
  ]),
  // ---- CE1 ----
  qcm("a-ce1-cmd", a("ce1", "Classroom commands"), 1, "What does the teacher say?", [
    it("school", "You must stand up. The teacher says: ", ["Stand up, please.", "Sit down, please.", "Open the book.", "Close the door."], "« Stand up » = lève-toi."),
    it("school", "You must be quiet. The teacher says: ", ["Be quiet, please.", "Come here.", "Look at me.", "Write your name."], "« Be quiet » = fais silence."),
    it("market", "The seller says « Come here! ». It means: ", ["Viens ici !", "Va-t'en !", "Assieds-toi !", "Écoute !"], "« Come here » = viens ici."),
    it("market", "You want someone to listen. You say: ", ["Listen, please.", "Run, please.", "Jump, please.", "Sing, please."], "« Listen » = écoute."),
    it("family", "Dad says « Open the door ». You…", ["open the door", "close the window", "sit on the bed", "wash the plate"], "« Open » = ouvre."),
    it("family", "Mum says « Wash your hands ». You…", ["wash your hands", "eat your food", "close your eyes", "go to bed"], "« Wash your hands » = lave-toi les mains."),
  ]),
  qcm("a-ce1-weather", a("ce1", "Weather"), 1, "Choose the right word.", [
    it("school", "Water falls from the sky. It is…", ["rainy", "sunny", "windy", "hot day"], "Water from the sky = rainy."),
    it("school", "The sun shines. It is…", ["sunny", "rainy", "cold", "snowy"], "Sun = sunny."),
    it("market", "The sellers use umbrellas against the strong sun. It is…", ["sunny", "rainy", "snowy", "windy"], "Strong sun = sunny."),
    it("market", "The wind blows dust at the market. It is…", ["windy", "snowy", "icy", "rainy"], "Wind = windy."),
    it("family", "We wear a jumper because it is…", ["cold", "hot", "sunny", "dry"], "A jumper protects from the cold."),
    it("family", "We drink a lot of water because it is…", ["hot", "cold", "snowy", "foggy"], "Hot weather = we drink more."),
  ]),
  // ---- CE2 ----
  qcm("a-ce2-cloth", a("ce2", "Clothes"), 1, "Choose the right word.", [
    it("school", "At school you wear a…", ["uniform", "pillow", "spoon", "roof"], "Pupils wear a uniform."),
    it("school", "You wear on your feet…", ["shoes", "gloves", "a hat", "a scarf"], "Shoes go on your feet."),
    it("market", "The seller sells a… for your head.", ["hat", "shoe", "sock", "belt"], "A hat goes on the head."),
    it("market", "A… is worn around the waist.", ["belt", "cap", "sock", "scarf"], "A belt goes around the waist."),
    it("family", "My mother wears a long…", ["dress", "helmet", "glove", "boot"], "A dress is a long piece of clothing."),
    it("family", "In the cold I wear a…", ["jumper", "swimsuit", "sandal", "short"], "A jumper keeps you warm."),
  ]),
  qcm("a-ce2-house", a("ce2", "Rooms and furniture"), 1, "Choose the right word.", [
    it("school", "You cook in the…", ["kitchen", "bedroom", "garage", "garden"], "The kitchen is for cooking."),
    it("school", "You sleep in the…", ["bedroom", "kitchen", "bathroom", "yard"], "The bedroom is for sleeping."),
    it("market", "You sit on a… to rest.", ["chair", "pan", "bucket", "brush"], "A chair is for sitting."),
    it("market", "You put your plate on the…", ["table", "bed", "roof", "wall"], "A table holds the plate."),
    it("family", "You take a shower in the…", ["bathroom", "kitchen", "living room", "bedroom"], "The bathroom is for washing."),
    it("family", "The family watches TV in the…", ["living room", "bathroom", "garage", "kitchen"], "The living room is for relaxing."),
  ]),
  // ---- CM1 ----
  qcm("a-cm1-time", a("cm1", "Telling the time"), 2, "Choose the right answer.", [
    it("school", "School starts at 7:30. We say: ", ["half past seven", "seven past half", "half to seven", "seven thirty past"], "7:30 = half past seven."),
    it("school", "It is 3:15. We say: ", ["a quarter past three", "a quarter to three", "half past three", "three to fifteen"], "15 minutes after = a quarter past."),
    it("market", "The market closes at 6:45. We say: ", ["a quarter to seven", "a quarter past six", "half past six", "six past forty-five"], "45 min = a quarter to the next hour."),
    it("market", "It is 12:00 at midday. We say: ", ["twelve o'clock", "twelve past", "half twelve", "twelve to"], "Full hour = o'clock."),
    it("family", "Dinner is at 8:00 p.m. We say: ", ["eight o'clock in the evening", "eight in the morning", "half past eight", "a quarter to eight"], "8 p.m. = eight in the evening."),
    it("family", "I wake up at 5:30 a.m. We say: ", ["half past five", "a quarter past five", "five to half", "half to five"], "30 minutes after = half past."),
  ]),
  qcm("a-cm1-places", a("cm1", "Places in town"), 2, "Choose the right place.", [
    it("school", "You borrow books at the…", ["library", "bakery", "hospital", "bank"], "Books are in a library."),
    it("school", "You learn at the…", ["school", "market", "station", "church"], "A school is for learning."),
    it("market", "You buy bread at the…", ["bakery", "bank", "pharmacy", "library"], "A bakery sells bread."),
    it("market", "You take medicine from the…", ["pharmacy", "bakery", "school", "garage"], "A pharmacy sells medicine."),
    it("family", "A sick person goes to the…", ["hospital", "stadium", "post office", "restaurant"], "A hospital is for sick people."),
    it("family", "You take a bus at the…", ["bus station", "bakery", "library", "bank"], "Buses leave from a bus station."),
  ]),
  // ---- CM2 ----
  qcm("a-cm2-can", a("cm2", "Can and can't"), 2, "Choose the correct sentence.", [
    it("school", "Awa is very good at swimming. She ____ swim.", ["can", "can't", "cans", "is can"], "« can » + base verb says what someone is able to do."),
    it("school", "A fish ____ run.", ["can't", "can", "cans", "does can"], "A fish is unable to run: can't."),
    it("market", "The seller ____ count very fast.", ["can", "cans", "can to", "is can"], "Ability: can + verb."),
    it("market", "Small children ____ carry heavy sacks.", ["can't", "can", "cans", "don't can"], "They are unable: can't."),
    it("family", "My grandfather ____ tell wonderful stories.", ["can", "cans", "can to", "is can"], "can never takes -s."),
    it("family", "The baby ____ walk yet.", ["can't", "can", "cans", "doesn't can"], "Not able yet: can't."),
  ]),
  qcm("a-cm2-prep", a("cm2", "Prepositions of place"), 2, "Choose the right preposition.", [
    it("school", "The book is ____ the desk. (on the surface)", ["on", "in", "under", "between"], "On the surface = on."),
    it("school", "The pen is ____ the bag. (inside)", ["in", "on", "under", "behind"], "Inside = in."),
    it("market", "The cat sleeps ____ the table. (below it)", ["under", "on", "in", "next to"], "Below = under."),
    it("market", "The shop is ____ the bank and the school. (in the middle)", ["between", "under", "on", "in"], "In the middle of two = between."),
    it("family", "The ball is ____ the sofa. (at the back)", ["behind", "between", "on", "in"], "At the back = behind."),
    it("family", "My house is ____ the church. (beside it)", ["next to", "under", "inside", "on"], "Beside = next to."),
  ]),
  qcm("a-cm2-wh", a("cm2", "Asking questions (wh-)"), 2, "Choose the right question word.", [
    it("school", "____ is your name? — My name is Kofi.", ["What", "Where", "Who", "When"], "Name → What."),
    it("school", "____ is your teacher? — Mrs Adjovi.", ["Who", "What", "Where", "Why"], "A person → Who."),
    it("market", "____ is the market? — It is near the bridge.", ["Where", "When", "Who", "How many"], "A place → Where."),
    it("market", "____ mangoes do you want? — Five, please.", ["How many", "How much", "Where", "Who"], "A number of things → How many."),
    it("family", "____ do you wake up? — At six o'clock.", ["When", "Where", "Who", "What"], "A time → When."),
    it("family", "____ are you late? — Because of the rain.", ["Why", "Who", "Where", "How many"], "A reason → Why."),
  ]),
);
