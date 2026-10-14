-- DeclickMath : schéma Supabase (phase 3 de docs/PLAN-LANCEMENT.md).
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
-- Reprend les types de src/store.ts. Les dates en millisecondes du prototype deviennent des timestamptz.
-- Principe : les mots de passe sont gérés par Supabase Auth (jamais dans ces tables) et chaque table est
-- protégée par des règles d'accès par ligne (RLS) : un élève ne voit que ses données, un parent celles de
-- ses enfants, un administrateur tout.

-- ---------------------------------------------------------------------------
-- 1. Profils (remplace User de store.ts, sans le mot de passe)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'student' check (role in ('student', 'parent', 'admin')),
  name         text not null default '',
  -- Pour un élève créé par un parent, « login » est son identifiant (ex. regis.4821) ; sinon null.
  login        text unique,
  country      text not null default 'CI',
  level        text,                       -- LevelId (élève)
  serie        text,                       -- lycée : A, A1, A2, C, D
  invite_code  text unique,                -- parent
  parent_id    uuid references public.profiles(id) on delete set null, -- élève
  goal         text,
  placed       boolean not null default false,
  prefs        jsonb not null default '{}'::jsonb,
  suspended    boolean not null default false,
  paid_until   timestamptz,
  consent_at      timestamptz,             -- consentement parental : date
  consent_version text,                    -- consentement parental : version des conditions
  notif_seen   timestamptz,
  last_login   timestamptz,
  created_at   timestamptz not null default now()
);
create index profiles_parent_idx on public.profiles(parent_id);

-- ---------------------------------------------------------------------------
-- 2. Fonctions d'aide aux règles d'accès (security definer : évitent la récursion des politiques)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and not suspended);
$$;

create or replace function public.is_parent_of(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = student and parent_id = auth.uid());
$$;

-- Lecture autorisée : soi-même, son enfant, ou administrateur.
create or replace function public.can_read(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select student = auth.uid() or public.is_parent_of(student) or public.is_admin();
$$;

-- ---------------------------------------------------------------------------
-- 3. Création automatique du profil à l'inscription
-- ---------------------------------------------------------------------------
-- raw_user_meta_data est fourni par le navigateur : on n'en tire que des champs sans pouvoir.
-- Le rôle « admin » ne peut JAMAIS venir de là (il se donne à la main, voir fin du fichier).
-- Le rattachement direct à un parent (comptes enfants créés par le parent) ne vient que de
-- raw_app_meta_data, que seul le serveur (clé service_role) peut écrire.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta   jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  app    jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  r      text  := case when meta->>'role' = 'parent' then 'parent' else 'student' end;
  pid    uuid;
  code   text  := upper(trim(coalesce(meta->>'invite_code', '')));
  pcountry text;
begin
  if app ? 'parent_id' then
    pid := (app->>'parent_id')::uuid;
  elsif code <> '' then
    select id, country into pid, pcountry from public.profiles where invite_code = code and role = 'parent';
    if pid is null then raise exception 'Code d''invitation inconnu.'; end if;
  end if;

  insert into public.profiles (id, role, name, login, country, level, serie, goal, parent_id, invite_code)
  values (
    new.id, r,
    left(coalesce(meta->>'name', ''), 80),
    nullif(app->>'login', ''),
    coalesce(pcountry, left(meta->>'country', 4), 'CI'),
    case when r = 'student' then coalesce(meta->>'level', 'tle') end,
    nullif(meta->>'serie', ''),
    nullif(meta->>'goal', ''),
    pid,
    case when r = 'parent' then upper(substr(md5(random()::text || new.id::text), 1, 6)) end
  );
  -- Élève rattaché à un parent : corrigé différé par défaut (comme modeFor dans store.ts).
  if pid is not null then
    insert into public.solution_modes (student_id, mode) values (new.id, 'deferred');
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Données de l'élève
-- ---------------------------------------------------------------------------
create table public.attempts (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles(id) on delete cascade,
  template_id   text not null,
  notion_id     text not null,
  ctx           text not null,
  seed          bigint not null,
  correct       boolean not null,
  help_level    smallint not null default 0 check (help_level >= 0),
  solution_viewed boolean not null default false,
  solution_viewed_before_attempt boolean not null default false,
  kind          text not null check (kind in ('practice', 'check', 'placement')),
  near          boolean,
  given         text,
  err_tag       text,
  ts            timestamptz not null default now()
);
create index attempts_student_idx on public.attempts(student_id, ts desc);
create index attempts_notion_idx on public.attempts(student_id, notion_id);

create table public.evidence (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  notion_id   text not null,
  source      text not null check (source in ('carte','rappel','jeu','bilan','simulation','tuteur','etapes')),
  score       real not null check (score between 0 and 1),
  err_tag     text,
  ref         text,
  ts          timestamptz not null default now()
);
create index evidence_student_idx on public.evidence(student_id, ts desc);

-- Révision espacée : une ligne par (élève, carte ou compétence).
create table public.mem_items (
  student_id  uuid not null references public.profiles(id) on delete cascade,
  key         text not null,               -- « c:… » carte ; « s:templateId » compétence
  notion_id   text not null,
  due         timestamptz not null,
  interval_days real not null default 0,
  ease        real not null default 2.5,
  reps        integer not null default 0,
  lapses      integer not null default 0,
  last        timestamptz not null default now(),
  primary key (student_id, key)
);

create table public.checks (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  notion_id   text not null,
  passed      boolean not null,
  ts          timestamptz not null default now()
);
create index checks_student_idx on public.checks(student_id, notion_id);

create table public.bilans (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  items       jsonb not null,              -- [{ notionId, correct, fresh }]
  ts          timestamptz not null default now()
);

create table public.exams (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles(id) on delete cascade,
  subject       text not null,
  level         text not null,
  kind          text not null check (kind in ('level', 'exit')),
  label         text not null,
  started_at    timestamptz not null default now(),
  duration_min  integer not null,
  out_of        integer not null,
  items         jsonb not null,
  answers       jsonb not null default '{}'::jsonb,
  status        text not null default 'running' check (status in ('running', 'done')),
  finished_at   timestamptz,
  results       jsonb,
  score         real
);
create index exams_student_idx on public.exams(student_id, started_at desc);

create table public.papers (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  spec        jsonb not null,
  ts          timestamptz not null default now()
);

-- Règle du corrigé choisie par le parent : free | deferred | blocked.
create table public.solution_modes (
  student_id  uuid primary key references public.profiles(id) on delete cascade,
  mode        text not null default 'deferred' check (mode in ('free', 'deferred', 'blocked'))
);

-- ---------------------------------------------------------------------------
-- 5. Contenu, paiements, journal
-- ---------------------------------------------------------------------------
create table public.validated_lessons (
  notion_id     text primary key,
  validated_at  timestamptz not null default now(),
  validated_by  uuid references public.profiles(id) on delete set null
);

create table public.payments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      integer not null check (amount > 0),
  currency    text not null check (currency in ('XOF', 'XAF', 'EUR')),
  method      text not null,
  reference   text not null,
  months      integer not null check (months between 1 and 24),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ts          timestamptz not null default now(),
  decided_at  timestamptz,
  note        text
);
create index payments_user_idx on public.payments(user_id, ts desc);

create table public.audit (
  id        uuid primary key default gen_random_uuid(),
  ts        timestamptz not null default now(),
  admin_id  uuid references public.profiles(id) on delete set null,
  action    text not null,
  target    text not null
);

-- Le trigger d'inscription dépend de solution_modes : on le crée après les tables.
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. Règles d'accès par ligne (RLS)
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.attempts          enable row level security;
alter table public.evidence          enable row level security;
alter table public.mem_items         enable row level security;
alter table public.checks            enable row level security;
alter table public.bilans            enable row level security;
alter table public.exams             enable row level security;
alter table public.papers            enable row level security;
alter table public.solution_modes    enable row level security;
alter table public.validated_lessons enable row level security;
alter table public.payments          enable row level security;
alter table public.audit             enable row level security;

-- Profils : lecture de soi, de ses enfants, ou tout pour l'admin. Pas d'insertion (faite par le trigger).
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or parent_id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy profiles_update_parent on public.profiles for update to authenticated
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Les politiques ci-dessus filtrent les LIGNES ; ce sont les droits ci-dessous qui filtrent les COLONNES.
-- Un utilisateur ne peut donc jamais modifier son propre rôle, son parent, sa suspension ni son abonnement.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (name, country, level, serie, goal, placed, prefs, notif_seen, last_login) on public.profiles to authenticated;
-- Les modifications sensibles passent par l'API serveur (clé service_role) ou par les fonctions ci-dessous.

-- Tables d'activité : l'élève écrit les siennes (ajout seulement), lecteurs = élève, parent, admin.
do $$
declare t text;
begin
  foreach t in array array['attempts', 'evidence', 'checks', 'bilans', 'papers'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.can_read(student_id))', t || '_read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (student_id = auth.uid())', t || '_insert', t);
    execute format('revoke update, delete on public.%I from authenticated', t);
  end loop;
end $$;

create policy mem_items_read on public.mem_items for select to authenticated using (public.can_read(student_id));
create policy mem_items_insert on public.mem_items for insert to authenticated with check (student_id = auth.uid());
create policy mem_items_update on public.mem_items for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Épreuves : l'élève crée puis termine la sienne (running -> done).
create policy exams_read on public.exams for select to authenticated using (public.can_read(student_id));
create policy exams_insert on public.exams for insert to authenticated with check (student_id = auth.uid());
create policy exams_update on public.exams for update to authenticated
  using (student_id = auth.uid() and status = 'running') with check (student_id = auth.uid());

-- Règle du corrigé : lue par l'élève, le parent, l'admin ; écrite par le parent (ou l'admin).
create policy solution_modes_read on public.solution_modes for select to authenticated using (public.can_read(student_id));
create policy solution_modes_write on public.solution_modes for all to authenticated
  using (public.is_parent_of(student_id) or public.is_admin())
  with check (public.is_parent_of(student_id) or public.is_admin());

-- Cours validés : lisibles par tous les connectés, écrits par l'admin.
create policy validated_read on public.validated_lessons for select to authenticated using (true);
create policy validated_write on public.validated_lessons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Paiements : l'utilisateur déclare le sien (toujours « pending »), l'admin décide.
create policy payments_read on public.payments for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy payments_insert on public.payments for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and decided_at is null);
create policy payments_decide on public.payments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Journal d'audit : admin seulement, ajout seulement.
create policy audit_read on public.audit for select to authenticated using (public.is_admin());
create policy audit_insert on public.audit for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());
revoke update, delete on public.audit from authenticated;

-- ---------------------------------------------------------------------------
-- 7. Fonctions appelables par l'application
-- ---------------------------------------------------------------------------
-- Rattacher un élève existant à un parent avec son code d'invitation (linkStudent de store.ts).
create or replace function public.link_student(code text) returns void
language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  select id into pid from public.profiles where invite_code = upper(trim(code)) and role = 'parent';
  if pid is null then raise exception 'Code d''invitation inconnu.'; end if;
  update public.profiles set parent_id = pid where id = auth.uid() and role = 'student';
  insert into public.solution_modes (student_id, mode) values (auth.uid(), 'deferred') on conflict do nothing;
end $$;

-- Enregistrer le consentement parental (date et version des conditions).
create or replace function public.record_consent(version text) returns void
language sql security definer set search_path = public as $$
  update public.profiles set consent_at = now(), consent_version = version
  where id = auth.uid() and role = 'parent';
$$;

-- Approuver un paiement et prolonger l'abonnement, en une seule opération atomique (admin).
create or replace function public.approve_payment(payment_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare p public.payments;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  select * into p from public.payments where id = payment_id and status = 'pending' for update;
  if not found then raise exception 'Paiement introuvable ou déjà traité.'; end if;
  update public.payments set status = 'approved', decided_at = now() where id = p.id;
  update public.profiles
     set paid_until = greatest(coalesce(paid_until, now()), now()) + make_interval(months => p.months)
   where id = p.user_id;
  insert into public.audit (admin_id, action, target) values (auth.uid(), 'payment.approve', p.id::text);
end $$;

revoke all on function public.link_student(text), public.record_consent(text), public.approve_payment(uuid) from public, anon;
grant execute on function public.link_student(text), public.record_consent(text), public.approve_payment(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Premier administrateur (à faire à la main, UNE fois, après ta première inscription)
-- ---------------------------------------------------------------------------
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'ton-email@exemple.com');
