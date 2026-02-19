-- Seed default tenants for local and production.
-- Run after migrations, e.g. psql $DATABASE_URL -f scripts/seed-tenants.sql
-- Domain is used to resolve the tenant from the request host (port is stripped).

INSERT INTO tenants (id, slug, name, domain, status, plan, created_at, updated_at)
SELECT gen_random_uuid(), 'glotutor-local', 'Glotutor (Local)', 'localhost', 'active', 'starter', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE domain = 'localhost');

INSERT INTO tenants (id, slug, name, domain, status, plan, created_at, updated_at)
SELECT gen_random_uuid(), 'glotutor-app', 'Glotutor', 'app.glotutor.com', 'active', 'starter', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE domain = 'app.glotutor.com');
