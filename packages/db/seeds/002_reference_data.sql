-- 002: Reference data - Lines of Business and Carriers

-- Lines of Business (14 across all categories)
INSERT INTO lines_of_business (id, name, abbreviation, category, description, created_by)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'General Liability', 'GL', 'casualty', 'Commercial general liability coverage', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Workers Compensation', 'WC', 'casualty', 'Workers compensation and employers liability', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'Commercial Auto', 'CA', 'casualty', 'Commercial automobile liability and physical damage', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000004', 'Umbrella/Excess', 'UMB', 'casualty', 'Commercial umbrella and excess liability', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000005', 'Commercial Property', 'PROP', 'property', 'Building and business personal property coverage', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000006', 'Business Owners Policy', 'BOP', 'property', 'Packaged property and liability for small business', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000007', 'Inland Marine', 'IM', 'property', 'Coverage for goods in transit and mobile equipment', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000008', 'Builders Risk', 'BR', 'property', 'Coverage for buildings under construction', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000009', 'Professional Liability', 'PL', 'specialty', 'Errors and omissions coverage', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000010', 'Cyber Liability', 'CYBER', 'specialty', 'Data breach and cyber incident coverage', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000011', 'Environmental', 'ENV', 'specialty', 'Pollution and environmental liability', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000012', 'Directors & Officers', 'DO', 'financial_lines', 'D&O liability coverage', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000013', 'Employment Practices', 'EPLI', 'financial_lines', 'Employment practices liability insurance', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000014', 'Fiduciary Liability', 'FID', 'financial_lines', 'ERISA fiduciary liability coverage', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Carriers (12 major commercial carriers)
INSERT INTO carriers (id, name, am_best_rating, type, website, headquarters_state, appointed, appointment_date, notes, created_by, available_states)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Zurich North America', 'A+', 'admitted', 'https://www.zurichna.com', 'IL', true, '2020-01-15', 'Strong middle market appetite', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','MA','IL','CA','TX','FL','OH']),
  ('d0000000-0000-0000-0000-000000000002', 'Chubb', 'A++', 'admitted', 'https://www.chubb.com', 'NJ', true, '2019-06-01', 'Premier carrier for large accounts', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','MA','IL','CA','TX','FL','GA']),
  ('d0000000-0000-0000-0000-000000000003', 'The Hartford', 'A+', 'admitted', 'https://www.thehartford.com', 'CT', true, '2018-03-10', 'Small business specialist', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','MA','IL','CA','TX','FL','OH']),
  ('d0000000-0000-0000-0000-000000000004', 'Travelers', 'A++', 'admitted', 'https://www.travelers.com', 'CT', true, '2019-01-20', 'Broadest product line available', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','MA','IL','CA','TX','FL','WA']),
  ('d0000000-0000-0000-0000-000000000005', 'Liberty Mutual', 'A', 'admitted', 'https://www.libertymutual.com', 'MA', true, '2020-07-01', 'Strong WC and auto programs', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','MA','IL','CA','TX','FL','OH','MI']),
  ('d0000000-0000-0000-0000-000000000006', 'AIG', 'A', 'admitted', 'https://www.aig.com', 'NY', true, '2021-02-15', 'Global capabilities, specialty focus', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','IL','CA','TX','FL','GA','WA']),
  ('d0000000-0000-0000-0000-000000000007', 'CNA', 'A', 'admitted', 'https://www.cna.com', 'IL', true, '2020-09-01', 'Professional liability leader', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','IL','CA','TX','FL','OH','MI','WA']),
  ('d0000000-0000-0000-0000-000000000008', 'Nationwide', 'A+', 'admitted', 'https://www.nationwide.com', 'OH', true, '2019-11-01', 'Middle market and agribusiness', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','PA','OH','IL','TX','FL','GA','NC','VA','IN']),
  ('d0000000-0000-0000-0000-000000000009', 'Hanover Insurance', 'A', 'admitted', 'https://www.hanover.com', 'MA', true, '2021-04-15', 'Strong NE regional presence', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','MA','NH','ME','VT','RI','VA']),
  ('d0000000-0000-0000-0000-000000000010', 'Markel', 'A', 'surplus', 'https://www.markel.com', 'VA', true, '2020-05-01', 'E&S specialty markets', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','MA','IL','CA','TX','FL','GA']),
  ('d0000000-0000-0000-0000-000000000011', 'Berkshire Hathaway', 'A++', 'admitted', 'https://www.bhhc.com', 'NE', true, '2018-08-01', 'Large capacity, WC specialist', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','CT','MA','IL','CA','TX','FL','OH']),
  ('d0000000-0000-0000-0000-000000000012', 'Great American', 'A+', 'admitted', 'https://www.greatamericaninsurancegroup.com', 'OH', true, '2021-01-10', 'Specialty and niche markets', 'b0000000-0000-0000-0000-000000000001', ARRAY['NY','NJ','PA','OH','IL','CA','TX','FL','GA','NC'])
ON CONFLICT (id) DO NOTHING;
