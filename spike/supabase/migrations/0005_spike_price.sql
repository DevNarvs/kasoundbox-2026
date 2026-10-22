-- Week-1 spike (test project only). Throwaway (D-32).
-- One price for the cached catalog page (W1-9a).
create table app.spike_price (
  id int primary key check (id = 1),
  cents int not null check (cents >= 0)
);
insert into app.spike_price values (1, 100000);
alter table app.spike_price owner to app_owner;

create function app.spike_set_price(p_cents int) returns void
language sql security definer set search_path = '' as $$
  update app.spike_price set cents = p_cents where id = 1;
$$;
alter function app.spike_set_price(int) owner to app_owner;
revoke execute on function app.spike_set_price(int) from public;
grant execute on function app.spike_set_price(int) to app_rw;
grant select on app.spike_price to app_rw, app_backup;
