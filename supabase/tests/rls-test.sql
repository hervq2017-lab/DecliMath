-- Test des règles d'accès (RLS) et des fonctions des migrations 20261014 à 20261015000200 (à lancer APRÈS les quatre).
-- À coller dans Supabase > SQL Editor > Run. Le script ne laisse AUCUNE trace : il finit toujours par une
-- erreur volontaire qui annule tout (comptes de test compris). Lis le message :
--   « TESTS OK : n vérifications »  -> tout est conforme ;
--   « ECHEC : ... »                 -> une règle ne fait pas ce qu'elle doit (le message dit laquelle).
do $$
declare
  p uuid := gen_random_uuid();   -- parent
  s uuid := gen_random_uuid();   -- élève rattaché à p
  o uuid := gen_random_uuid();   -- autre élève, rattaché à un autre parent (p2)
  p2 uuid := gen_random_uuid();  -- autre parent
  h uuid := gen_random_uuid();   -- « pirate » qui demande le rôle admin à l'inscription
  a uuid := gen_random_uuid();   -- administrateur
  code text; pay uuid; n int := 0; c int; r text; t timestamptz;
begin
  -- Comptes de test (le trigger crée les profils, comme à une vraie inscription).
  -- Un élève n'existe que créé par un parent : le serveur (api/children.ts) crée son profil et son corrigé différé juste après son compte.
  insert into auth.users (id, email, raw_user_meta_data) values (p, 'p@test.invalid', '{"role":"parent","name":"Parent","country":"CI"}');
  insert into auth.users (id, email, raw_user_meta_data) values (p2, 'p2@test.invalid', '{"role":"parent","name":"Autre parent","country":"CI"}');
  select invite_code into code from public.profiles where id = p;
  insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data) values (s, 's@test.invalid', '{"role":"student","name":"Eleve","level":"tle"}', jsonb_build_object('parent_id', p, 'login', 'eleve.1234'));
  insert into public.profiles (id, role, name, login, level, parent_id) values (s, 'student', 'Eleve', 'eleve.1234', 'tle', p);
  insert into public.solution_modes (student_id, mode) values (s, 'deferred');
  insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data) values (o, 'o@test.invalid', '{"role":"student","name":"Autre","level":"tle"}', jsonb_build_object('parent_id', p2, 'login', 'autre.5678'));
  insert into public.profiles (id, role, name, login, level, parent_id) values (o, 'student', 'Autre', 'autre.5678', 'tle', p2);
  insert into public.solution_modes (student_id, mode) values (o, 'deferred');
  insert into auth.users (id, email, raw_user_meta_data) values (a, 'a@test.invalid', '{"role":"parent","name":"Admin"}');
  update public.profiles set role = 'admin' where id = a;  -- fait par nous (postgres), comme la requête manuelle du schéma

  -- 1. Trigger d'inscription
  insert into auth.users (id, email, raw_user_meta_data) values (h, 'h@test.invalid', '{"role":"admin","name":"Pirate"}');
  if exists (select 1 from public.profiles where id = h) then raise exception 'ECHEC : une inscription directe demandant le rôle admin a reçu un profil' using errcode = 'ZZ001'; end if;
  n := n + 1;
  declare e uuid := gen_random_uuid(); begin
    insert into auth.users (id, email, raw_user_meta_data) values (e, 'e@test.invalid', '{"role":"student","name":"Seul","level":"tle"}');
    if exists (select 1 from public.profiles where id = e) then raise exception 'ECHEC : une inscription « élève » directe a reçu un profil' using errcode = 'ZZ001'; end if;
  end;
  n := n + 1;
  if code is null or length(code) <> 6 then raise exception 'ECHEC : le parent n''a pas de code d''invitation' using errcode = 'ZZ001'; end if; n := n + 1;
  if (select parent_id from public.profiles where id = s) is distinct from p then raise exception 'ECHEC : l''élève n''est pas rattaché à son parent' using errcode = 'ZZ001'; end if; n := n + 1;
  if (select mode from public.solution_modes where student_id = s) is distinct from 'deferred' then raise exception 'ECHEC : pas de corrigé différé par défaut' using errcode = 'ZZ001'; end if; n := n + 1;

  -- 2. L'élève S : écrit ses données, pas celles des autres, ne se promeut pas
  perform set_config('request.jwt.claims', json_build_object('sub', s, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  insert into public.attempts (student_id, template_id, notion_id, ctx, seed, correct, kind) values (s, 't', 'n', 'c', 1, true, 'practice'); n := n + 1;
  begin
    insert into public.attempts (student_id, template_id, notion_id, ctx, seed, correct, kind) values (o, 't', 'n', 'c', 1, true, 'practice');
    raise exception 'ECHEC : un élève a écrit une tentative au nom d''un autre' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  begin
    update public.profiles set role = 'admin' where id = s;
    raise exception 'ECHEC : un élève a pu changer son rôle' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  begin
    update public.profiles set parent_id = null where id = s;
    raise exception 'ECHEC : un élève a pu se détacher de son parent' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  begin
    update public.profiles set paid_until = now() + interval '5 years' where id = s;
    raise exception 'ECHEC : un élève a pu se donner un abonnement' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  update public.profiles set name = 'Eleve modifié', prefs = '{"dyslexia":true}' where id = s; n := n + 1;
  begin
    insert into public.payments (user_id, amount, currency, method, reference, months, status) values (s, 5000, 'XOF', 'moneco', 'REF1', 1, 'approved');
    raise exception 'ECHEC : un utilisateur a créé un paiement déjà approuvé' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  insert into public.payments (user_id, amount, currency, method, reference, months, status) values (s, 5000, 'XOF', 'moneco', 'REF1', 1, 'pending') returning id into pay; n := n + 1;
  begin
    perform public.approve_payment(pay);
    raise exception 'ECHEC : un élève a pu approuver un paiement' using errcode = 'ZZ001';
  exception when raise_exception then if sqlerrm like 'ECHEC%' then raise; end if; end; n := n + 1;
  begin
    insert into public.validated_lessons (notion_id) values ('x');
    raise exception 'ECHEC : un élève a validé un cours' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  begin
    update public.attempts set correct = false where student_id = s;
    get diagnostics c = row_count;
    raise exception 'ECHEC : une tentative est modifiable' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  select count(*) into c from public.profiles; if c <> 1 then raise exception 'ECHEC : l''élève voit % profils au lieu de 1', c using errcode = 'ZZ001'; end if; n := n + 1;

  -- 3. L'autre élève O ne voit rien de S et ne touche pas à son corrigé
  perform set_config('request.jwt.claims', json_build_object('sub', o, 'role', 'authenticated')::text, true);
  select count(*) into c from public.attempts; if c <> 0 then raise exception 'ECHEC : un élève voit % tentatives d''un autre', c using errcode = 'ZZ001'; end if; n := n + 1;
  select count(*) into c from public.payments; if c <> 0 then raise exception 'ECHEC : un élève voit les paiements d''un autre' using errcode = 'ZZ001'; end if; n := n + 1;
  update public.solution_modes set mode = 'free' where student_id = s; get diagnostics c = row_count;
  if c <> 0 then raise exception 'ECHEC : un élève a changé le corrigé d''un autre' using errcode = 'ZZ001'; end if; n := n + 1;

  -- 4. Le parent P : voit son enfant, pas les autres, règle le corrigé, n'écrit pas à la place de l'enfant
  perform set_config('request.jwt.claims', json_build_object('sub', p, 'role', 'authenticated')::text, true);
  select count(*) into c from public.attempts where student_id = s; if c <> 1 then raise exception 'ECHEC : le parent ne voit pas la tentative de son enfant' using errcode = 'ZZ001'; end if; n := n + 1;
  select count(*) into c from public.profiles where id = o; if c <> 0 then raise exception 'ECHEC : le parent voit le profil d''un enfant qui n''est pas le sien' using errcode = 'ZZ001'; end if; n := n + 1;
  begin
    insert into public.attempts (student_id, template_id, notion_id, ctx, seed, correct, kind) values (s, 't', 'n', 'c', 2, true, 'practice');
    raise exception 'ECHEC : un parent a écrit une tentative au nom de son enfant' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;
  update public.solution_modes set mode = 'blocked' where student_id = s; get diagnostics c = row_count;
  if c <> 1 then raise exception 'ECHEC : le parent ne peut pas régler le corrigé de son enfant' using errcode = 'ZZ001'; end if; n := n + 1;
  update public.solution_modes set mode = 'free' where student_id = o; get diagnostics c = row_count;
  if c <> 0 then raise exception 'ECHEC : le parent a changé le corrigé d''un autre enfant' using errcode = 'ZZ001'; end if; n := n + 1;

  -- 5. L'administrateur A : voit tout, approuve un paiement une seule fois
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select count(*) into c from public.profiles; if c < 5 then raise exception 'ECHEC : l''admin ne voit que % profils', c using errcode = 'ZZ001'; end if; n := n + 1;
  perform public.approve_payment(pay);
  select paid_until into t from public.profiles where id = s;
  if t is null or t < now() + interval '27 days' then raise exception 'ECHEC : abonnement non prolongé après approbation (%)', t using errcode = 'ZZ001'; end if; n := n + 1;
  begin
    perform public.approve_payment(pay);
    raise exception 'ECHEC : un paiement a été approuvé deux fois' using errcode = 'ZZ001';
  exception when raise_exception then if sqlerrm like 'ECHEC%' then raise; end if; end; n := n + 1;
  if (select count(*) from public.audit where action = 'payment.approve') <> 1 then raise exception 'ECHEC : approbation non tracée dans le journal' using errcode = 'ZZ001'; end if; n := n + 1;

  -- 6. Visiteur anonyme
  perform set_config('role', 'anon', true);
  select count(*) into c from public.profiles; if c <> 0 then raise exception 'ECHEC : un anonyme voit des profils' using errcode = 'ZZ001'; end if; n := n + 1;
  begin
    perform public.link_student('ABCDEF');
    raise exception 'ECHEC : un anonyme a appelé link_student' using errcode = 'ZZ001';
  exception when insufficient_privilege then null; end; n := n + 1;

  reset role;
  raise exception 'TESTS OK : % vérifications passées, tout a été annulé (aucune trace dans la base).', n;
end $$;
