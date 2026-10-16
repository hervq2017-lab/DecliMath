-- ═══════════════════════════════════════════════════════════════
-- MIGRATIONS COMBINÉES À EXÉCUTER DANS LE SUPABASE SQL EDITOR
-- Allez sur : https://supabase.com/dashboard/project/wwhzajijfaujwzepucby/sql/new
-- Collez ce fichier et cliquez sur « Run »
-- ═══════════════════════════════════════════════════════════════

-- ═══ 1. family_code ═══
alter table public.profiles add column if not exists family_code text unique;

-- ═══ 2. handle_new_user (élèves créés uniquement par le serveur) ═══
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
    new.id, 'parent',
    left(coalesce(meta->>'name', ''), 80),
    coalesce(left(meta->>'country', 4), 'CI'),
    upper(substr(md5(random()::text || new.id::text), 1, 6))
  );
  return new;
end $$;

-- ═══ 3. Colonnes must_change_password / password_customized ═══
alter table public.profiles
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_customized boolean not null default false;

-- ═══ 4. Table student_qr_tokens ═══
create table if not exists public.student_qr_tokens (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles(id) on delete cascade,
  token_hash   text not null unique,
  purpose      text not null check (purpose in ('activation', 'quick_login')),
  expires_at   timestamptz not null,
  used_at      timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now(),
  created_by   uuid references public.profiles(id) on delete set null
);

create index if not exists qr_tokens_student_idx on public.student_qr_tokens(student_id);
create index if not exists qr_tokens_hash_idx on public.student_qr_tokens(token_hash);

-- ═══ 5. RLS sur student_qr_tokens ═══
alter table public.student_qr_tokens enable row level security;

-- Politiques : ne pas échouer si elles existent déjà
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can read tokens of their children' AND tablename = 'student_qr_tokens') THEN
    CREATE POLICY "Parents can read tokens of their children"
      ON public.student_qr_tokens FOR SELECT
      USING (public.is_parent_of(student_id) OR public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can create tokens for their children' AND tablename = 'student_qr_tokens') THEN
    CREATE POLICY "Parents can create tokens for their children"
      ON public.student_qr_tokens FOR INSERT
      WITH CHECK (public.is_parent_of(student_id) OR public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Parents can update tokens of their children' AND tablename = 'student_qr_tokens') THEN
    CREATE POLICY "Parents can update tokens of their children"
      ON public.student_qr_tokens FOR UPDATE
      USING (public.is_parent_of(student_id) OR public.is_admin());
  END IF;
END $$;

-- ═══ 6. Fonction de nettoyage des jetons expirés ═══
create or replace function public.cleanup_expired_qr_tokens() returns integer
language plpgsql security definer set search_path = public as $$
declare
  deleted_count integer;
begin
  delete from public.student_qr_tokens
  where expires_at < now() - interval '7 days'
     or (used_at is not null and used_at < now() - interval '1 day')
     or (revoked_at is not null and revoked_at < now() - interval '1 day');
  get diagnostics deleted_count = row_count;
  return deleted_count;
end $$;

-- ═══ 7. Vérification finale ═══
SELECT 'profiles' as tbl, count(*) as n FROM profiles
UNION ALL
SELECT 'student_qr_tokens', count(*) FROM student_qr_tokens;
