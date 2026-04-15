export const testUsers = {
  admin: {
    email: 'admin@brokerflow.test',
    password: 'TestAdmin123!',
    role: 'admin' as const,
    first_name: 'Admin',
    last_name: 'User',
  },
  servicer: {
    email: 'servicer@brokerflow.test',
    password: 'TestServicer123!',
    role: 'servicer' as const,
    first_name: 'Service',
    last_name: 'Rep',
  },
  viewer: {
    email: 'viewer@brokerflow.test',
    password: 'TestViewer123!',
    role: 'viewer' as const,
    first_name: 'View',
    last_name: 'Only',
  },
};

export const testClient = {
  company_name: 'E2E Test Corp',
  industry: 'Technology',
  status: 'prospect' as const,
  revenue: 5_000_000,
  employee_count: 250,
  website: 'https://e2etest.example.com',
  primary_contact_name: 'Jane Test',
  primary_contact_email: 'jane@e2etest.example.com',
  primary_contact_phone: '555-0100',
  address: {
    street: '123 Test Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
  },
};

export const testSubmission = {
  effective_date: '2025-01-01',
  expiration_date: '2026-01-01',
  priority: 'normal' as const,
  notes: 'E2E test submission',
  lines_of_business: ['General Liability', 'Property'],
};

export const testCarrier = {
  name: 'E2E Test Insurance Co',
  type: 'admitted' as const,
  am_best_rating: 'A+',
  website: 'https://e2ecarrier.example.com',
  status: 'active',
};

export const testUnderwriter = {
  first_name: 'John',
  last_name: 'Underwriter',
  email: 'john@e2ecarrier.example.com',
  phone: '555-0200',
  contact_type: 'underwriter' as const,
  preferred_contact_method: 'email' as const,
};

export const testCapacity = {
  line_of_business: 'General Liability',
  form_paper: 'Occurrence',
  min_premium: 10_000,
  max_premium: 500_000,
  appetite_notes: 'Technology sector preferred',
};

export const API_URL = process.env.API_URL || 'http://localhost:3001';
export const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
