-- An invitation is not a parent-child data-sharing relationship until the student accepts it.
alter table public.profiles
  add column if not exists parent_linked_at timestamptz;

-- Existing activated relationships predate the explicit acceptance marker.
update public.profiles
set parent_linked_at = coalesce(created_at, now())
where parent_id is not null
  and parent_linked_at is null
  and (password_customized is true or must_change_password is not true);

create or replace function public.is_active_user() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('student', 'parent', 'admin')
      and not suspended
  );
$$;

create or replace function public.is_parent_of(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = student
      and role = 'student'
      and parent_id = auth.uid()
      and parent_linked_at is not null
  ) and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'parent' and not suspended
  );
$$;

create or replace function public.can_read(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select (student = auth.uid() and public.is_active_user())
    or public.is_parent_of(student)
    or public.is_admin();
$$;

-- Suspension blocks already-issued sessions at the database boundary, not only at next login.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or (parent_id = auth.uid() and public.is_active_user()) or public.is_admin());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid() and public.is_active_user()) with check (id = auth.uid() and public.is_active_user());
drop policy if exists profiles_update_parent on public.profiles;
create policy profiles_update_parent on public.profiles for update to authenticated
  using (parent_id = auth.uid() and public.is_active_user())
  with check (parent_id = auth.uid() and public.is_active_user());

do $$
declare t text;
begin
  foreach t in array array['attempts', 'evidence', 'checks', 'bilans', 'papers'] loop
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (student_id = auth.uid() and public.is_active_user())',
      t || '_insert', t
    );
  end loop;
end $$;

drop policy if exists mem_items_insert on public.mem_items;
create policy mem_items_insert on public.mem_items for insert to authenticated
  with check (student_id = auth.uid() and public.is_active_user());
drop policy if exists mem_items_update on public.mem_items;
create policy mem_items_update on public.mem_items for update to authenticated
  using (student_id = auth.uid() and public.is_active_user())
  with check (student_id = auth.uid() and public.is_active_user());

drop policy if exists exams_insert on public.exams;
create policy exams_insert on public.exams for insert to authenticated
  with check (student_id = auth.uid() and public.is_active_user());
drop policy if exists exams_update on public.exams;
create policy exams_update on public.exams for update to authenticated
  using (student_id = auth.uid() and status = 'running' and public.is_active_user())
  with check (student_id = auth.uid() and public.is_active_user());

-- New family links must be accepted through a parent-issued QR invitation.
create or replace function public.link_student(code text) returns void
language plpgsql security definer set search_path = public as $$
begin
  raise exception 'Demande à ton parent de t''envoyer un QR code d''invitation.';
end $$;
