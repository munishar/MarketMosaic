-- 001: Seed teams and admin user

INSERT INTO teams (id, name, region, description)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Northeast Team', 'Northeast', 'Covers NE states'),
  ('a0000000-0000-0000-0000-000000000002', 'Southeast Team', 'Southeast', 'Covers SE states'),
  ('a0000000-0000-0000-0000-000000000003', 'West Team', 'West', 'Covers Western states')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, first_name, last_name, role, team_id)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'admin@marketmosaic.com', '$2a$10$rQEY0tn5pFqKmDVmSEHPOODnEWwRVdLsFnAafBSwhtne0QLsZbMGy', 'Admin', 'User', 'admin', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

UPDATE teams SET manager_id = 'b0000000-0000-0000-0000-000000000001' WHERE id = 'a0000000-0000-0000-0000-000000000001';
