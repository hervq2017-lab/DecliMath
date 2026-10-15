-- Correctif : le serveur d'authentification (GoTrue) n'enregistre app_metadata qu'APRÈS l'insertion de l'utilisateur ;
-- le déclencheur ne voit donc jamais parent_id ni login au moment où il s'exécute, et refusait tout compte enfant
-- (« Database error creating new user »).
-- Désormais : le déclencheur ne gère que les PARENTS (inscription publique). Le profil d'un élève est créé par le serveur
-- (api/children.ts, clé service_role) juste après son compte, avec parent_id, identifiant et corrigé « différé ».
-- Une inscription « élève » faite directement avec la clé publique ne reçoit AUCUN profil : elle ne donne accès à rien.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  if meta->>'role' is distinct from 'parent' then
    return new; -- élève (profil créé par le serveur) ; tout autre rôle demandé (admin…) est ignoré
  end if;
  insert into public.profiles (id, role, name, country, invite_code)
  values (
    new.id, 'parent',
    left(coalesce(meta->>'name', ''), 80),
    coalesce(left(meta->>'country', 4), 'CI'),
    upper(substr(md5(random()::text || new.id::text), 1, 6))
  );
  return new;
end $$;
