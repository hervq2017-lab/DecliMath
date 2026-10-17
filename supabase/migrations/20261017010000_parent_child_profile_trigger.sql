-- Auth fires this trigger before it has saved app_metadata, so student accounts
-- must be left for api/children.ts to provision after Auth creates the user.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  if meta->>'role' is distinct from 'parent' then
    return new;
  end if;

  insert into public.profiles (id, role, name, country, invite_code)
  values (
    new.id,
    'parent',
    left(coalesce(meta->>'name', ''), 80),
    coalesce(left(meta->>'country', 4), 'CI'),
    upper(substr(md5(random()::text || new.id::text), 1, 6))
  );
  return new;
end $$;
