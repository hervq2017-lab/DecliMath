alter table public.profiles
  add column subscription_plan text
  check (subscription_plan is null or subscription_plan in ('essential', 'family', 'family_plus'));

create table public.payment_checkouts (
  reference uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_code text not null check (plan_code in ('essential', 'family', 'family_plus')),
  amount integer not null check (amount in (10000, 15000, 20000)),
  currency text not null check (currency in ('XOF', 'XAF')),
  provider_session_id text not null unique,
  checkout_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'failed')),
  transaction_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index payment_checkouts_user_idx on public.payment_checkouts(user_id, created_at desc);

alter table public.payment_checkouts enable row level security;
create policy payment_checkouts_read on public.payment_checkouts
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
revoke insert, update, delete on public.payment_checkouts from anon, authenticated;
grant select on public.payment_checkouts to authenticated;

create or replace function public.confirm_saspay_subscription(p_reference uuid, p_transaction_id text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  checkout public.payment_checkouts;
begin
  if p_transaction_id is null or length(trim(p_transaction_id)) = 0 then
    raise exception 'Référence de transaction SasPay manquante.';
  end if;

  select * into checkout
    from public.payment_checkouts
   where reference = p_reference
   for update;
  if not found then raise exception 'Session de paiement introuvable.'; end if;
  if checkout.status = 'approved' then
    if checkout.transaction_id = p_transaction_id then return; end if;
    raise exception 'Cette session est déjà associée à une autre transaction.';
  end if;
  if checkout.status <> 'pending' then raise exception 'Session de paiement non payable.'; end if;

  update public.payment_checkouts
     set status = 'approved', transaction_id = p_transaction_id, paid_at = now()
   where reference = p_reference and status = 'pending';
  if not found then raise exception 'Session de paiement déjà traitée.'; end if;

  insert into public.payments (user_id, amount, currency, method, reference, months, status, decided_at)
  values (checkout.user_id, checkout.amount, checkout.currency, 'SasPay', p_transaction_id, 1, 'approved', now());

  update public.profiles
     set paid_until = greatest(coalesce(paid_until, now()), now()) + interval '1 month',
         subscription_plan = checkout.plan_code
   where id = checkout.user_id;

  insert into public.audit (action, target)
  values ('payment.saspay.approve', checkout.reference::text);
end $$;

revoke all on function public.confirm_saspay_subscription(uuid, text) from public, anon, authenticated;
grant execute on function public.confirm_saspay_subscription(uuid, text) to service_role;
