const storage = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value); },
};

const { getState, uid, update } = await import("../src/store");
const { completeExerciseAssignment, createExerciseAssignment } = await import("../src/lib/exerciseAssignments");
let failures = 0;
const check = (condition: boolean, label: string) => {
  console.log(`${condition ? "OK   " : "ECHEC "}${label}`);
  if (!condition) failures++;
};

const parentId = uid();
const studentId = uid();
update((state) => ({ ...state, exerciseAssignments: [] }));
const error = await createExerciseAssignment({
  parentId,
  studentId,
  notionId: "maths:3e:test",
  templateId: "test-template",
  title: "Test de compétence",
});
const created = getState().exerciseAssignments[0];
const assignmentId = created?.id ?? "";
check(!error && created?.parentId === parentId && created.studentId === studentId, "la série assignée est enregistrée pour le bon enfant");
check(created?.completedAt === undefined, "une nouvelle assignation est en attente");

const denied = await completeExerciseAssignment(assignmentId, uid());
check(!!denied && !getState().exerciseAssignments[0]?.completedAt, "un autre élève ne peut pas terminer l'assignation");

const completed = await completeExerciseAssignment(assignmentId, studentId);
check(!completed && !!getState().exerciseAssignments[0]?.completedAt, "la fin de série marque l'assignation comme terminée");
const completedAt = getState().exerciseAssignments[0].completedAt;
await completeExerciseAssignment(assignmentId, studentId);
check(getState().exerciseAssignments[0].completedAt === completedAt, "la fin de série est idempotente");

console.log(failures ? `\n${failures} échec(s)` : "\n0 échec(s)");
process.exit(failures ? 1 : 0);
