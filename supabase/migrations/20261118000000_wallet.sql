-- ============================================================
-- ServisIn — Wallet & WalletTransaction Schema
-- ============================================================

-- 1. Table: Wallet (Customer & Mechanic balance & security PIN)
create table if not exists public."Wallet" (
  id             text primary key default gen_random_uuid()::text,
  "userId"       text not null unique references public."User"(id) on delete cascade,
  balance        double precision not null default 650000,
  pin            text not null default '123456',
  "createdAt"    timestamptz not null default now(),
  "updatedAt"    timestamptz not null default now()
);

-- Trigger for updatedAt
drop trigger if exists "Wallet_set_updated_at" on public."Wallet";
create trigger "Wallet_set_updated_at"
  before update on public."Wallet"
  for each row execute function public.set_updated_at();

-- 2. Table: WalletTransaction (Audit trail for topup, payment, refund)
create table if not exists public."WalletTransaction" (
  id             text primary key default gen_random_uuid()::text,
  "userId"       text not null references public."User"(id) on delete cascade,
  type           text not null, -- 'TOPUP' | 'PAYMENT' | 'TRANSFER'
  amount         double precision not null,
  description    text not null,
  method         text,
  "orderId"      text references public."ServiceOrder"(id) on delete set null,
  "createdAt"    timestamptz not null default now()
);

create index if not exists "WalletTransaction_userId_idx" on public."WalletTransaction" ("userId", "createdAt" desc);

-- 3. Privileges & RLS (Anon & Authenticated demo access)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public."Wallet", public."WalletTransaction" to anon, authenticated;

alter table public."Wallet"            enable row level security;
alter table public."WalletTransaction" enable row level security;

drop policy if exists "demo_wallet_access" on public."Wallet";
create policy "demo_wallet_access" on public."Wallet"
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "demo_wallet_tx_access" on public."WalletTransaction";
create policy "demo_wallet_tx_access" on public."WalletTransaction"
  for all to anon, authenticated using (true) with check (true);

-- 4. Initial Seed Data
insert into public."Wallet" (id, "userId", balance, pin)
values ('wal-cst-001', 'usr-cst-001', 650000, '123456')
on conflict ("userId") do nothing;

insert into public."WalletTransaction" (id, "userId", type, amount, description, method)
values ('wal-tx-init-001', 'usr-cst-001', 'TOPUP', 650000, 'Saldo Awal ServisIn Wallet', 'BCA Virtual Account')
on conflict (id) do nothing;
