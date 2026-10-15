-- Les élèves ne s'inscrivent plus eux-mêmes : seul un parent leur crée un accès (api/children.ts, clé service_role,
-- qui pose app_metadata.parent_id). Toute inscription « élève » faite directement avec la clé publique est refusée.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta   jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  app    jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  r      text  := case when meta->>'role' = 'parent' then 'parent' else 'student' end;
  pid    uuid;
begin
  if app ? 'parent_id' then
    pid := (app->>'parent_id')::uuid;
  elsif r = 'student' then
    raise exception 'Un compte élève est créé par son parent.';
  end if;

  insert into public.profiles (id, role, name, login, country, level, serie, goal, parent_id, invite_code)
  values (
    new.id, r,
    left(coalesce(meta->>'name', ''), 80),
    nullif(app->>'login', ''),
    coalesce(left(meta->>'country', 4), 'CI'),
    case when r = 'student' then coalesce(meta->>'level', 'tle') end,
    nullif(meta->>'serie', ''),
    nullif(meta->>'goal', ''),
    pid,
    case when r = 'parent' then upper(substr(md5(random()::text || new.id::text), 1, 6)) end
  );
  if pid is not null then
    insert into public.solution_modes (student_id, mode) values (new.id, 'deferred');
  end if;
  return new;
end $$;
