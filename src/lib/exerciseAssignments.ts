import { ExerciseAssignment, getState, update, uid } from "../store";
import { supabase } from "./supabase";

type AssignmentRow = {
  id: string;
  parent_id: string;
  student_id: string;
  notion_id: string;
  template_id: string;
  title: string;
  created_at: string;
  completed_at: string | null;
};

const fromRow = (row: AssignmentRow): ExerciseAssignment => ({
  id: row.id,
  parentId: row.parent_id,
  studentId: row.student_id,
  notionId: row.notion_id,
  templateId: row.template_id,
  title: row.title,
  createdAt: Date.parse(row.created_at),
  completedAt: row.completed_at ? Date.parse(row.completed_at) : undefined,
});

export async function refreshExerciseAssignments(userId: string, role: "parent" | "student"): Promise<string | null> {
  if (!supabase) return null;
  const column = role === "parent" ? "parent_id" : "student_id";
  const { data, error } = await supabase
    .from("exercise_assignments")
    .select("id,parent_id,student_id,notion_id,template_id,title,created_at,completed_at")
    .eq(column, userId)
    .order("created_at", { ascending: false });
  if (error) return `Les exercices assignés n'ont pas pu être chargés : ${error.message}`;

  const rows = (data ?? []).map((row) => fromRow(row as AssignmentRow));
  update((state) => ({
    ...state,
    exerciseAssignments: [
      ...state.exerciseAssignments.filter((item) => role === "parent" ? item.parentId !== userId : item.studentId !== userId),
      ...rows,
    ],
  }));
  return null;
}

export async function createExerciseAssignment(input: Omit<ExerciseAssignment, "id" | "createdAt" | "completedAt">): Promise<string | null> {
  const assignment: ExerciseAssignment = { ...input, id: uid(), createdAt: Date.now() };
  if (supabase) {
    const { data, error } = await supabase
      .from("exercise_assignments")
      .insert({
        id: assignment.id,
        parent_id: assignment.parentId,
        student_id: assignment.studentId,
        notion_id: assignment.notionId,
        template_id: assignment.templateId,
        title: assignment.title,
      })
      .select("id,parent_id,student_id,notion_id,template_id,title,created_at,completed_at")
      .single();
    if (error) return `L'exercice n'a pas pu être assigné : ${error.message}`;
    Object.assign(assignment, fromRow(data as AssignmentRow));
  }
  update((state) => ({ ...state, exerciseAssignments: [assignment, ...state.exerciseAssignments] }));
  return null;
}

export async function completeExerciseAssignment(id: string, studentId: string): Promise<string | null> {
  const assignment = getState().exerciseAssignments.find((item) => item.id === id && item.studentId === studentId);
  if (!assignment) return "Cet exercice assigné est introuvable pour ce compte.";
  if (assignment.completedAt) return null;

  const completedAt = Date.now();
  if (supabase) {
    const { data, error } = await supabase
      .from("exercise_assignments")
      .update({ completed_at: new Date(completedAt).toISOString() })
      .eq("id", id)
      .eq("student_id", studentId)
      .select("completed_at")
      .single();
    if (error) return `La série est terminée, mais son statut n'a pas pu être synchronisé : ${error.message}`;
    const timestamp = Date.parse(data.completed_at as string);
    update((state) => ({
      ...state,
      exerciseAssignments: state.exerciseAssignments.map((item) => item.id === id ? { ...item, completedAt: timestamp } : item),
    }));
    return null;
  }

  update((state) => ({
    ...state,
    exerciseAssignments: state.exerciseAssignments.map((item) => item.id === id ? { ...item, completedAt } : item),
  }));
  return null;
}
