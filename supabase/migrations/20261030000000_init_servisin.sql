-- ============================================================
-- ServisIn — Supabase schema
-- Mirrors prisma/schema.prisma (model + column names preserved)
-- Project ref: ylozhbazicyeazrzvbtx
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
do $$ begin
  create type public."Role" as enum ('CUSTOMER', 'MECHANIC', 'ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public."UserStatus" as enum ('ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public."SubscriptionTier" as enum ('REGULAR', 'VIP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public."OrderStatus" as enum (
    'PENDING', 'DISPATCHED', 'ACCEPTED', 'ARRIVED', 'DIAGNOSING',
    'IN_PROGRESS', 'COMPLETED', 'PAID', 'CANCELLED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public."DisputeStatus" as enum (
    'OPEN', 'UNDER_REVIEW', 'RESOLVED_REFUND', 'RESOLVED_REVISIT', 'REJECTED'
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- updatedAt trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- User
-- ------------------------------------------------------------
create table if not exists public."User" (
  id              text primary key default gen_random_uuid()::text,
  name            text not null,
  phone           text not null unique,
  email           text not null unique,
  "passwordHash"  text not null,
  role            public."Role" not null default 'CUSTOMER',
  status          public."UserStatus" not null default 'ACTIVE',
  tier            public."SubscriptionTier" not null default 'REGULAR',
  "avatarUrl"     text,
  rating          double precision not null default 4.9,
  "bnspCertified" boolean not null default false,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

create index if not exists "User_role_status_idx" on public."User" (role, status);

drop trigger if exists "User_set_updated_at" on public."User";
create trigger "User_set_updated_at"
  before update on public."User"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- MechanicProfile
-- ------------------------------------------------------------
create table if not exists public."MechanicProfile" (
  id              text primary key default gen_random_uuid()::text,
  "userId"        text not null unique references public."User"(id) on delete cascade,
  "ktpNumber"     text not null,
  "simNumber"     text,
  "bnspCertNumber" text not null,
  "workshopName"  text,
  "currentLat"    double precision,
  "currentLng"    double precision,
  "isOnline"      boolean not null default false,
  "walletBalance" double precision not null default 0,
  "escrowBalance" double precision not null default 0,
  "bankAccount"   text,
  "bankName"      text,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

drop trigger if exists "MechanicProfile_set_updated_at" on public."MechanicProfile";
create trigger "MechanicProfile_set_updated_at"
  before update on public."MechanicProfile"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Vehicle
-- ------------------------------------------------------------
create table if not exists public."Vehicle" (
  id                text primary key default gen_random_uuid()::text,
  "userId"          text not null references public."User"(id) on delete cascade,
  brand             text not null,
  model             text not null,
  year              integer not null,
  "licensePlate"    text not null unique,
  color             text,
  "isActive"        boolean not null default false,
  "odometerKm"      integer not null default 0,
  "healthPercent"   integer not null default 95,
  "imageUrl"        text,
  "lastServiceDate" timestamptz,
  "createdAt"       timestamptz not null default now(),
  "updatedAt"       timestamptz not null default now()
);

create index if not exists "Vehicle_userId_isActive_idx" on public."Vehicle" ("userId", "isActive");

drop trigger if exists "Vehicle_set_updated_at" on public."Vehicle";
create trigger "Vehicle_set_updated_at"
  before update on public."Vehicle"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- ServiceOrder
-- ------------------------------------------------------------
create table if not exists public."ServiceOrder" (
  id                text primary key,
  "orderNumber"     text not null unique,
  "customerId"      text not null references public."User"(id),
  "mechanicId"      text references public."User"(id),
  "vehicleId"       text not null references public."Vehicle"(id),
  "serviceType"     text not null,
  status            public."OrderStatus" not null default 'PENDING',
  "totalCost"       double precision not null,
  "isEmergency"     boolean not null default false,
  "isVIP"           boolean not null default false,
  "pickupLat"       double precision not null,
  "pickupLng"       double precision not null,
  "pickupAddress"   text not null,
  "accessNotes"     text,
  "itemsJson"       jsonb,
  "diagnosticNotes" text,
  "spidoPhotoUrl"   text,
  "createdAt"       timestamptz not null default now(),
  "updatedAt"       timestamptz not null default now()
);

create index if not exists "ServiceOrder_status_mechanicId_idx"
  on public."ServiceOrder" (status, "mechanicId");
create index if not exists "ServiceOrder_pickupLat_pickupLng_idx"
  on public."ServiceOrder" ("pickupLat", "pickupLng");

drop trigger if exists "ServiceOrder_set_updated_at" on public."ServiceOrder";
create trigger "ServiceOrder_set_updated_at"
  before update on public."ServiceOrder"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- PaymentTransaction
-- ------------------------------------------------------------
create table if not exists public."PaymentTransaction" (
  id                  text primary key default gen_random_uuid()::text,
  "orderId"           text not null unique references public."ServiceOrder"(id) on delete cascade,
  amount              double precision not null,
  method              text not null,
  "midtransSnapToken" text,
  "vaNumber"          text,
  "qrisUrl"           text,
  status              text not null,
  "settledAt"         timestamptz,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);

drop trigger if exists "PaymentTransaction_set_updated_at" on public."PaymentTransaction";
create trigger "PaymentTransaction_set_updated_at"
  before update on public."PaymentTransaction"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- PremiumSubscription
-- ------------------------------------------------------------
create table if not exists public."PremiumSubscription" (
  id             text primary key default gen_random_uuid()::text,
  "userId"       text not null unique references public."User"(id) on delete cascade,
  "planType"     text not null default 'ANNUAL',
  "warrantyDays" integer not null default 30,
  "startDate"    timestamptz not null default now(),
  "endDate"      timestamptz not null,
  "isActive"     boolean not null default true,
  "createdAt"    timestamptz not null default now(),
  "updatedAt"    timestamptz not null default now()
);

drop trigger if exists "PremiumSubscription_set_updated_at" on public."PremiumSubscription";
create trigger "PremiumSubscription_set_updated_at"
  before update on public."PremiumSubscription"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- AIChatbotQuery
-- ------------------------------------------------------------
create table if not exists public."AIChatbotQuery" (
  id              text primary key default gen_random_uuid()::text,
  "userId"        text not null references public."User"(id) on delete cascade,
  "queryText"     text not null,
  "responseText"  text not null,
  "accuracyScore" integer,
  "suggestedFault" text,
  "estimatedCost" text,
  "createdAt"     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- DisputeTicket
-- ------------------------------------------------------------
create table if not exists public."DisputeTicket" (
  id              text primary key,
  "orderId"       text not null unique references public."ServiceOrder"(id) on delete cascade,
  "customerId"    text not null references public."User"(id),
  "complaintText" text not null,
  status          public."DisputeStatus" not null default 'OPEN',
  "resolutionNote" text,
  "resolvedAt"    timestamptz,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

drop trigger if exists "DisputeTicket_set_updated_at" on public."DisputeTicket";
create trigger "DisputeTicket_set_updated_at"
  before update on public."DisputeTicket"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Privileges + RLS
-- Demo policies: the anon key can read/write every table.
-- Tighten these before going to production.
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;

alter table public."User"                enable row level security;
alter table public."MechanicProfile"     enable row level security;
alter table public."Vehicle"             enable row level security;
alter table public."ServiceOrder"        enable row level security;
alter table public."PaymentTransaction"  enable row level security;
alter table public."PremiumSubscription" enable row level security;
alter table public."AIChatbotQuery"      enable row level security;
alter table public."DisputeTicket"       enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'User', 'MechanicProfile', 'Vehicle', 'ServiceOrder',
    'PaymentTransaction', 'PremiumSubscription', 'AIChatbotQuery', 'DisputeTicket'
  ]
  loop
    execute format('drop policy if exists "demo_all_access" on public.%I', t);
    execute format(
      'create policy "demo_all_access" on public.%I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
