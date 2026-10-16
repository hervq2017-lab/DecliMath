-- Migration DeclickMath : Système de connexion Parent-Élève, QR code sécurisé et gestion des accès
-- Compatible avec 20261014000000_init.sql et 20261015000200_student_profile_by_server.sql.

-- 1. Ajout des colonnes de gestion du premier accès / mot de passe sur les profils
alter table public.profiles
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_customized boolean not null default false;

-- 2. Table des jetons QR temporaires pour les élèves (activation & connexion rapide)
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

-- 3. Sécurité Row-Level Security (RLS)
alter table public.student_qr_tokens enable row level security;

-- Seul le parent de l'élève (ou un admin) peut lire les jetons créés pour ses enfants
create policy "Parents can read tokens of their children"
  on public.student_qr_tokens for select
  using (public.is_parent_of(student_id) or public.is_admin());

-- Seul le parent de l'élève (ou un admin) peut insérer des jetons pour ses enfants
create policy "Parents can create tokens for their children"
  on public.student_qr_tokens for insert
  with check (public.is_parent_of(student_id) or public.is_admin());

-- Seul le parent de l'élève (ou un admin) peut révoquer les jetons
create policy "Parents can update tokens of their children"
  on public.student_qr_tokens for update
  using (public.is_parent_of(student_id) or public.is_admin());

-- 4. Fonction utilitaire de nettoyage des jetons expirés (pour maintenance périodique)
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
