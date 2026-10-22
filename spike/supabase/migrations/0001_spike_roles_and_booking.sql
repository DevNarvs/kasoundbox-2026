-- Week-1 spike (test project only). Throwaway (D-32).
-- Role passwords are NOT set here: after applying, run (as postgres) once per role:
--   alter role app_rw password '<from password manager>';
--   alter role app_backup password '<from password manager>';

create role app_owner nologin;
grant app_owner to postgres;
create role app_rw login;
create role app_backup login;

alter role app_rw set statement_timeout = '5s';
alter role app_rw set lock_timeout = '2s';
alter role app_rw set idle_in_transaction_session_timeout = '10s';
alter role app_backup set default_transaction_read_only = on;

create schema app authorization app_owner;
revoke all on schema app from public;

create table app.resources (
  id int primary key,
  kind text not null,
  active bool not null default true
);

create table app.resource_claims (
  id bigint generated always as identity primary key,
  resource_id int not null references app.resources,
  claim_date date not null,
  live bool not null default true
);
create unique index resource_claims_live_uniq on app.resource_claims (resource_id, claim_date) where live;

create table app.capacity_lock (id int primary key);
insert into app.capacity_lock values (1);
insert into app.resources (id, kind, active) values (1, 'delivery_set', true), (2, 'delivery_set', true);

alter table app.resources owner to app_owner;
alter table app.resource_claims owner to app_owner;
alter table app.capacity_lock owner to app_owner;

-- p_hold_ms keeps the lock a little longer (race.ts asks for 50 ms), so concurrent calls really contend for it.
create function app.spike_book(p_date date, p_hold_ms int default 0) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_resource int;
begin
  perform 1 from app.capacity_lock where id = 1 for update;
  if p_hold_ms > 0 then perform pg_sleep(least(p_hold_ms, 200) / 1000.0); end if;
  select r.id into v_resource from app.resources r
   where r.kind = 'delivery_set' and r.active
     and not exists (select 1 from app.resource_claims c
                     where c.resource_id = r.id and c.claim_date = p_date and c.live)
   order by r.id limit 1;
  if v_resource is null then return jsonb_build_object('code', 'sold_out'); end if;
  insert into app.resource_claims(resource_id, claim_date, live) values (v_resource, p_date, true);
  return jsonb_build_object('code', 'ok', 'resource_id', v_resource);
end $$;
alter function app.spike_book(date, int) owner to app_owner;

revoke execute on all functions in schema app from public;
grant usage on schema app to app_rw, app_backup;
grant execute on function app.spike_book(date, int) to app_rw;
-- Spike only: the calendar-shaped latency read.
grant select on app.resource_claims to app_rw;
grant select on all tables in schema app to app_backup;
