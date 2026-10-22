-- Week-1 spike (test project only). Throwaway (D-32).
-- pg_dump reads each sequence's last value, so app_backup needs SELECT on sequences too (data-model §2.3).
grant select on all sequences in schema app, admin_auth to app_backup;
