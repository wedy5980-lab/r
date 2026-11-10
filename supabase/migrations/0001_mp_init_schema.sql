-- =====================================================================
-- MUATH AL-DUHAIYAN REAL ESTATE PLATFORM — SCHEMA v1
-- Prefix mp_ isolates this platform inside a shared Supabase project.
-- No existing table is altered or dropped.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. TAXONOMY
-- ---------------------------------------------------------------------
create table if not exists public.mp_categories (
  main_category text not null check (main_category in ('sale','rent','management','auction')),
  key           text not null,
  name_ar       text not null,
  sort_order    int  not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  primary key (main_category, key)
);

-- ---------------------------------------------------------------------
-- 2. PROPERTIES
-- ---------------------------------------------------------------------
create table if not exists public.mp_properties (
  id                uuid primary key default gen_random_uuid(),
  reference_number  text unique not null,
  title             text not null check (char_length(title) between 3 and 200),
  main_category     text not null check (main_category in ('sale','rent','management','auction')),
  subcategory       text,
  description       text,
  city              text,
  neighborhood      text,
  address           text,
  latitude          numeric(9,6),
  longitude         numeric(9,6),
  area              numeric(10,2) check (area is null or area > 0),
  street_width      numeric(6,2)  check (street_width is null or street_width > 0),
  price             numeric(14,2) check (price is null or price >= 0),
  price_type        text not null default 'total'
                    check (price_type in ('total','per_year','per_month','per_day','negotiable')),
  rental_period     text,
  bedrooms          int check (bedrooms is null or bedrooms >= 0),
  bathrooms         int check (bathrooms is null or bathrooms >= 0),
  floors            int check (floors is null or floors >= 0),
  status            text not null default 'available'
                    check (status in ('available','sold','rented','unavailable','archived')),
  -- CONFIDENTIAL — never exposed through public views or public APIs
  owner_name        text,
  owner_phone       text,
  internal_notes    text,
  -- presentation
  is_featured       boolean not null default false,
  is_demo           boolean not null default false,
  views_count       int not null default 0,
  published_at      timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid
);

create index if not exists mp_properties_status_idx     on public.mp_properties (status);
create index if not exists mp_properties_cat_idx        on public.mp_properties (main_category, subcategory);
create index if not exists mp_properties_city_idx       on public.mp_properties (city, neighborhood);
create index if not exists mp_properties_price_idx      on public.mp_properties (price);
create index if not exists mp_properties_area_idx       on public.mp_properties (area);
create index if not exists mp_properties_created_idx    on public.mp_properties (created_at desc);
create index if not exists mp_properties_search_idx on public.mp_properties
  using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(neighborhood,'') || ' ' || coalesce(reference_number,'')));

-- ---------------------------------------------------------------------
-- 3. MEDIA
-- ---------------------------------------------------------------------
create table if not exists public.mp_property_media (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.mp_properties(id) on delete cascade,
  media_type    text not null default 'image' check (media_type in ('image','video')),
  media_url     text not null,
  thumbnail_url text,
  alt_ar        text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists mp_media_property_idx on public.mp_property_media (property_id, display_order);

-- ---------------------------------------------------------------------
-- 4. ADMINS & SESSIONS
-- ---------------------------------------------------------------------
create table if not exists public.mp_admins (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text unique not null,
  password_hash  text not null,
  role           text not null default 'editor'
                 check (role in ('super_admin','manager','editor','viewer')),
  is_active      boolean not null default true,
  last_login_at  timestamptz,
  created_at     timestamptz not null default now()
);

create table if not exists public.mp_admin_sessions (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references public.mp_admins(id) on delete cascade,
  token_hash  text not null unique,
  user_agent  text,
  ip_hash     text,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists mp_sessions_admin_idx on public.mp_admin_sessions (admin_id, expires_at desc);

create table if not exists public.mp_login_attempts (
  id          bigserial primary key,
  email_hash  text not null,
  ip_hash     text,
  success     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists mp_login_attempts_idx on public.mp_login_attempts (email_hash, created_at desc);

-- ---------------------------------------------------------------------
-- 5. INQUIRIES
-- ---------------------------------------------------------------------
create table if not exists public.mp_inquiries (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid references public.mp_properties(id) on delete set null,
  name         text not null check (char_length(name) between 2 and 100),
  phone        text not null check (char_length(phone) between 7 and 20),
  email        text,
  message      text check (message is null or char_length(message) <= 2000),
  status       text not null default 'new' check (status in ('new','contacted','closed','spam')),
  source       text not null default 'website',
  created_at   timestamptz not null default now(),
  handled_by   uuid references public.mp_admins(id) on delete set null,
  handled_at   timestamptz
);
create index if not exists mp_inquiries_status_idx on public.mp_inquiries (status, created_at desc);

-- ---------------------------------------------------------------------
-- 6. AUDIT LOG & SETTINGS
-- ---------------------------------------------------------------------
create table if not exists public.mp_audit_logs (
  id          bigserial primary key,
  admin_id    uuid,
  action      text not null,
  entity      text not null,
  entity_id   text,
  details     jsonb not null default '{}'::jsonb,
  ip_hash     text,
  created_at  timestamptz not null default now()
);
create index if not exists mp_audit_entity_idx on public.mp_audit_logs (entity, created_at desc);

create table if not exists public.mp_office_settings (
  id           int primary key default 1 check (id = 1),
  office_name  text not null default 'مكتب معاذ الضحيان للعقارات',
  tagline      text,
  about_text   text,
  phone        text,
  whatsapp     text,
  email        text,
  address      text,
  working_hours text,
  logo_url     text,
  brand_color  text default '#0f6b52',
  accent_color text default '#c9a227',
  social_links jsonb not null default '{}'::jsonb,
  show_owner_phone boolean not null default false,
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. TRIGGERS
-- ---------------------------------------------------------------------
create or replace function public.mp_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists mp_properties_updated on public.mp_properties;
create trigger mp_properties_updated before update on public.mp_properties
  for each row execute function public.mp_set_updated_at();

drop trigger if exists mp_settings_updated on public.mp_office_settings;
create trigger mp_settings_updated before update on public.mp_office_settings
  for each row execute function public.mp_set_updated_at();

-- ---------------------------------------------------------------------
-- 8. RLS — deny by default; the server (service_role) is the only writer
-- ---------------------------------------------------------------------
alter table public.mp_categories        enable row level security;
alter table public.mp_properties        enable row level security;
alter table public.mp_property_media    enable row level security;
alter table public.mp_admins            enable row level security;
alter table public.mp_admin_sessions    enable row level security;
alter table public.mp_login_attempts    enable row level security;
alter table public.mp_inquiries         enable row level security;
alter table public.mp_audit_logs        enable row level security;
alter table public.mp_office_settings   enable row level security;

revoke all on public.mp_admins, public.mp_admin_sessions, public.mp_login_attempts,
              public.mp_inquiries, public.mp_audit_logs
  from anon, authenticated;
