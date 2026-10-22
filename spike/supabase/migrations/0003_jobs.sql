-- Week-1 spike (test project only). Throwaway (D-32).
-- Needs pg_cron, pg_net, supabase_vault, and pgcrypto enabled first (dashboard), and the Vault secrets
-- tick_url, job_route_secret, and sentry_checkin_url created by hand. No secret is written here.

create table app.job_runs (
  id bigint generated always as identity primary key,
  job text not null,
  source text not null,
  started_at timestamptz not null default clock_timestamp(),
  note text
);
alter table app.job_runs owner to app_owner;

create function app.spike_log_job(p_job text, p_source text, p_note text) returns void
language sql security definer set search_path = '' as $$
  insert into app.job_runs (job, source, note) values (p_job, p_source, p_note);
$$;
alter function app.spike_log_job(text, text, text) owner to app_owner;
revoke execute on function app.spike_log_job(text, text, text) from public;
grant execute on function app.spike_log_job(text, text, text) to app_rw;
grant select on app.job_runs to app_backup;

-- Times are UTC. W1-4a-ontime reads these rows.
select cron.schedule('spike_every_minute', '* * * * *',
  $$insert into app.job_runs (job, source) values ('every_minute', 'pg_cron')$$);

-- The tick through pg_net, with the bearer from Vault; the request id is kept for the response log.
select cron.schedule('spike_tick', '* * * * *', $$
  insert into app.job_runs (job, source, note)
  select 'tick_request', 'pg_cron', net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'tick_url') || '?source=pg_cron',
    headers := jsonb_build_object('Authorization', 'Bearer ' ||
               (select decrypted_secret from vault.decrypted_secrets where name = 'job_route_secret')),
    timeout_milliseconds := 30000)::text
$$);

-- Heartbeat: a Sentry check-in only while the every-minute job is fresh (architecture §7.4).
select cron.schedule('spike_heartbeat', '*/5 * * * *', $$
  insert into app.job_runs (job, source, note)
  select 'heartbeat', 'pg_cron', net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'sentry_checkin_url'),
    timeout_milliseconds := 10000)::text
  where exists (select 1 from app.job_runs
                where job = 'every_minute' and started_at > now() - interval '3 minutes')
$$);

-- Keep-alive, daily at 00:30 Manila.
select cron.schedule('spike_keepalive', '30 16 * * *',
  $$insert into app.job_runs (job, source) values ('keepalive', 'pg_cron')$$);
