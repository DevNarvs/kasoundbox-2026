-- Week-1 spike (test project only). Throwaway (D-32).
-- Better Auth 1.7.12 tables (CLI output for drizzle/postgresql, plugins: twoFactor), placed in admin_auth.
-- Mirrors spike/lib/auth-schema.ts.

create schema admin_auth authorization app_owner;
revoke all on schema admin_auth from public;

create table admin_auth."user" (
  id text primary key,
  name text not null,
  email text not null unique,
  email_verified boolean not null default false,
  image text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  two_factor_enabled boolean default false
);

create table admin_auth.session (
  id text primary key,
  expires_at timestamp not null,
  token text not null unique,
  created_at timestamp not null default now(),
  updated_at timestamp not null,
  ip_address text,
  user_agent text,
  user_id text not null references admin_auth."user" (id) on delete cascade
);
create index "session_userId_idx" on admin_auth.session (user_id);

create table admin_auth.account (
  id text primary key,
  account_id text not null,
  provider_id text not null,
  user_id text not null references admin_auth."user" (id) on delete cascade,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp,
  refresh_token_expires_at timestamp,
  scope text,
  password text,
  created_at timestamp not null default now(),
  updated_at timestamp not null
);
create index "account_userId_idx" on admin_auth.account (user_id);

create table admin_auth.verification (
  id text primary key,
  identifier text not null,
  value text not null,
  expires_at timestamp not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
create index "verification_identifier_idx" on admin_auth.verification (identifier);

create table admin_auth.two_factor (
  id text primary key,
  secret text not null,
  backup_codes text not null,
  user_id text not null references admin_auth."user" (id) on delete cascade,
  verified boolean default true,
  failed_verification_count integer default 0,
  locked_until timestamp
);
create index "twoFactor_secret_idx" on admin_auth.two_factor (secret);
create index "twoFactor_userId_idx" on admin_auth.two_factor (user_id);

alter table admin_auth."user" owner to app_owner;
alter table admin_auth.session owner to app_owner;
alter table admin_auth.account owner to app_owner;
alter table admin_auth.verification owner to app_owner;
alter table admin_auth.two_factor owner to app_owner;

-- The adapter writes these tables directly (architecture §6.3).
grant usage on schema admin_auth to app_rw, app_backup;
grant select, insert, update, delete on all tables in schema admin_auth to app_rw;
grant select on all tables in schema admin_auth to app_backup;
