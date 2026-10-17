create table public.exercise_assignments (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  notion_id text not null,
  template_id text not null,
  title text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint exercise_assignments_completion_after_assignment
    check (completed_at is null or completed_at >= created_at)
);

create index exercise_assignments_parent_idx on public.exercise_assignments(parent_id, created_at desc);
create index exercise_assignments_student_idx on public.exercise_assignments(student_id, created_at desc);

alter table public.exercise_assignments enable row level security;

create policy exercise_assignments_read on public.exercise_assignments for select to authenticated
  using (student_id = auth.uid() or (parent_id = auth.uid() and public.is_parent_of(student_id)));

create policy exercise_assignments_create on public.exercise_assignments for insert to authenticated
  with check (parent_id = auth.uid() and public.is_parent_of(student_id) and completed_at is null);

create policy exercise_assignments_complete on public.exercise_assignments for update to authenticated
  using (student_id = auth.uid() and public.is_active_user())
  with check (student_id = auth.uid() and public.is_active_user());

create or replace function public.protect_exercise_assignment()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.id is distinct from old.id
    or new.parent_id is distinct from old.parent_id
    or new.student_id is distinct from old.student_id
    or new.notion_id is distinct from old.notion_id
    or new.template_id is distinct from old.template_id
    or new.title is distinct from old.title
    or new.created_at is distinct from old.created_at then
    raise exception 'Les détails d’un exercice assigné ne peuvent pas être modifiés.';
  end if;

  if old.completed_at is not null then
    new.completed_at := old.completed_at;
  elsif new.completed_at is not null then
    new.completed_at := now();
  end if;
  return new;
end $$;

create trigger exercise_assignments_immutable
before update on public.exercise_assignments
for each row execute function public.protect_exercise_assignment();
