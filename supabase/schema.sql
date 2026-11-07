-- =====================================================================
-- Schéma de la base : à exécuter une seule fois dans Supabase > SQL Editor
-- =====================================================================

create table if not exists admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from admin_profiles where user_id = auth.uid());
$$;

-- Réglages du site : une seule ligne (id = 1), version brouillon et version publiée
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  draft jsonb not null default '{}'::jsonb,
  published jsonb not null default '{"siteName":"Votre appartement"}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into site_settings (id, draft) values (1, '{"siteName":"Votre appartement"}') on conflict do nothing;

-- Pages : les sections sont stockées en JSON dans draft / published
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]*$'),
  title text not null,
  seo jsonb not null default '{}'::jsonb,
  position int not null default 0,
  is_published boolean not null default false,
  draft jsonb not null default '[]'::jsonb,
  published jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  label text not null, url text not null, position int not null default 0, visible boolean not null default true
);

create table if not exists apartment (
  id int primary key default 1 check (id = 1),
  description text, bedrooms int, beds int, bathrooms int, surface_m2 numeric,
  amenities jsonb not null default '[]'::jsonb, rules text, practical_info text,
  check_in_time text, check_out_time text, max_guests int default 2
);
insert into apartment (id) values (1) on conflict do nothing;

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null, caption text, room text,
  position int not null default 0, is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists pricing_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('base','season','weekend','holiday','promo')),
  price_per_night numeric check (price_per_night >= 0),
  discount_percent numeric check (discount_percent between 0 and 100),
  start_date date, end_date date, min_stay int not null default 1 check (min_stay >= 1),
  active boolean not null default true
);

create table if not exists extra_fees (
  id uuid primary key default gen_random_uuid(),
  label text not null, amount numeric not null check (amount >= 0),
  per text not null default 'stay' check (per in ('stay','night','guest')),
  active boolean not null default true
);

create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  start_date date not null, end_date date not null, reason text,
  check (end_date >= start_date)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  check_in date not null, check_out date not null,
  guests int not null check (guests between 1 and 30),
  guest_name text not null check (char_length(guest_name) between 2 and 120),
  guest_email text not null check (guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  guest_phone text check (char_length(guest_phone) <= 40),
  message text check (char_length(message) <= 2000),
  total_price numeric,
  status text not null default 'pending' check (status in ('pending','accepted','refused','cancelled')),
  created_at timestamptz not null default now(),
  check (check_out > check_in)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null, rating int not null check (rating between 1 and 5),
  body text not null, stay_date text, visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- Dates indisponibles (réservations acceptées + blocages), sans données personnelles
create or replace function get_unavailable_ranges()
returns table (start_date date, end_date date)
language sql security definer set search_path = public stable as $$
  select check_in, check_out from bookings where status = 'accepted' and check_out >= current_date
  union all
  select b.start_date, b.end_date from blocked_dates b where b.end_date >= current_date;
$$;
grant execute on function get_unavailable_ranges() to anon, authenticated;
grant execute on function is_admin() to anon, authenticated;

-- ============================ SÉCURITÉ (RLS) ============================
alter table admin_profiles enable row level security;
alter table site_settings  enable row level security;
alter table pages          enable row level security;
alter table menus          enable row level security;
alter table apartment      enable row level security;
alter table photos         enable row level security;
alter table pricing_rules  enable row level security;
alter table extra_fees     enable row level security;
alter table blocked_dates  enable row level security;
alter table bookings       enable row level security;
alter table reviews        enable row level security;

-- Administrateurs : accès complet (admin_profiles se gère uniquement depuis le SQL Editor)
do $$ declare t text; begin
  foreach t in array array['site_settings','pages','menus','apartment','photos','pricing_rules','extra_fees','blocked_dates','bookings','reviews'] loop
    execute format('create policy "admin_all_%1$s" on %1$I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
create policy "admin_lit_admins" on admin_profiles for select to authenticated using (user_id = auth.uid());

-- Public : lecture seule du contenu publié
create policy "public_lit_reglages" on site_settings for select to anon, authenticated using (true);
create policy "public_lit_pages"    on pages         for select to anon, authenticated using (is_published);
create policy "public_lit_menus"    on menus         for select to anon, authenticated using (visible);
create policy "public_lit_logement" on apartment     for select to anon, authenticated using (true);
create policy "public_lit_photos"   on photos        for select to anon, authenticated using (true);
create policy "public_lit_tarifs"   on pricing_rules for select to anon, authenticated using (active);
create policy "public_lit_frais"    on extra_fees    for select to anon, authenticated using (active);
create policy "public_lit_avis"     on reviews       for select to anon, authenticated using (visible);

-- Public : peut seulement déposer une demande "en attente" (jamais la lire ni la modifier)
create policy "public_demande_reservation" on bookings for insert to anon, authenticated
  with check (status = 'pending' and check_in >= current_date and total_price is null);

-- Le brouillon ne doit jamais être lisible par le public
revoke select on site_settings from anon;
grant select (id, published, updated_at) on site_settings to anon;
revoke select on pages from anon;
grant select (id, slug, title, seo, position, is_published, published, updated_at) on pages to anon;

-- ============================ STOCKAGE IMAGES ============================
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict do nothing;
create policy "public_lit_images"  on storage.objects for select using (bucket_id = 'photos');
create policy "admin_ecrit_images" on storage.objects for all to authenticated
  using (bucket_id = 'photos' and is_admin()) with check (bucket_id = 'photos' and is_admin());
