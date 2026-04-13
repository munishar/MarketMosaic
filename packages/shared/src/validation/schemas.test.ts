import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  listQueryParamsSchema,
  createUserSchema,
  updateUserSchema,
  createTeamSchema,
  createClientSchema,
  updateClientSchema,
  createContactSchema,
  createCarrierSchema,
  createLineOfBusinessSchema,
  createFormPaperSchema,
  createCapacitySchema,
  createSubmissionSchema,
  updateSubmissionSchema,
  createSubmissionTargetSchema,
  updateSubmissionTargetSchema,
  sendEmailSchema,
  startEmailImportSchema,
  createAttachmentSchema,
  createActivitySchema,
  createTemplateSchema,
  createNotificationSchema,
  createNetworkRelationshipSchema,
  createSyncScheduleSchema,
  createSyncJobSchema,
  createAMSConnectionSchema,
  createManifestSchema,
  updateManifestSchema,
  createEmailRecordSchema,
} from './schemas';

// ─── Auth Schemas ────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'securepass',
      first_name: 'Jane',
      last_name: 'Doe',
    });
    expect(result.success).toBe(true);
  });

  it('accepts registration with role', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'securepass',
      first_name: 'Jane',
      last_name: 'Doe',
      role: 'admin',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing first_name', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'securepass',
      last_name: 'Doe',
    });
    expect(result.success).toBe(false);
  });
});

describe('refreshTokenSchema', () => {
  it('accepts valid token', () => {
    const result = refreshTokenSchema.safeParse({ refresh_token: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty token', () => {
    const result = refreshTokenSchema.safeParse({ refresh_token: '' });
    expect(result.success).toBe(false);
  });
});

// ─── List Query Params ───────────────────────────────

describe('listQueryParamsSchema', () => {
  it('accepts empty object (all optional)', () => {
    const result = listQueryParamsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('coerces string numbers', () => {
    const result = listQueryParamsSchema.safeParse({ page: '2', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('rejects limit over 100', () => {
    const result = listQueryParamsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid order', () => {
    const result = listQueryParamsSchema.safeParse({ order: 'invalid' });
    expect(result.success).toBe(false);
  });
});

// ─── User ────────────────────────────────────────────

describe('createUserSchema', () => {
  const validUser = {
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'servicer',
  };

  it('accepts valid user', () => {
    expect(createUserSchema.safeParse(validUser).success).toBe(true);
  });

  it('accepts user with all optional fields', () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      region: 'Northeast',
      team_id: '550e8400-e29b-41d4-a716-446655440000',
      specialties: ['GL', 'WC'],
      phone: '5551234567',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = createUserSchema.safeParse({ ...validUser, role: 'superadmin' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const { email, ...noEmail } = validUser;
    expect(createUserSchema.safeParse(noEmail).success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('accepts partial update', () => {
    const result = updateUserSchema.safeParse({ first_name: 'Jane' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });
});

// ─── Team ────────────────────────────────────────────

describe('createTeamSchema', () => {
  it('accepts valid team', () => {
    expect(createTeamSchema.safeParse({ name: 'Alpha Team' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(createTeamSchema.safeParse({ name: '' }).success).toBe(false);
  });
});

// ─── Client ──────────────────────────────────────────

describe('createClientSchema', () => {
  it('accepts minimal client', () => {
    const result = createClientSchema.safeParse({ company_name: 'Acme Corp' });
    expect(result.success).toBe(true);
  });

  it('accepts client with addresses', () => {
    const result = createClientSchema.safeParse({
      company_name: 'Acme Corp',
      addresses: [
        { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701', type: 'mailing' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = createClientSchema.safeParse({
      company_name: 'Acme Corp',
      primary_contact_email: 'not-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid website URL', () => {
    const result = createClientSchema.safeParse({
      company_name: 'Acme Corp',
      website: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateClientSchema', () => {
  it('accepts partial update', () => {
    const result = updateClientSchema.safeParse({ status: 'active' });
    expect(result.success).toBe(true);
  });
});

// ─── Contact ─────────────────────────────────────────

describe('createContactSchema', () => {
  const validContact = {
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@carrier.com',
    contact_type: 'underwriter',
  };

  it('accepts valid contact', () => {
    expect(createContactSchema.safeParse(validContact).success).toBe(true);
  });

  it('rejects invalid contact_type', () => {
    const result = createContactSchema.safeParse({
      ...validContact,
      contact_type: 'broker',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Carrier ─────────────────────────────────────────

describe('createCarrierSchema', () => {
  it('accepts valid carrier', () => {
    const result = createCarrierSchema.safeParse({
      name: 'Hartford',
      type: 'admitted',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    expect(createCarrierSchema.safeParse({ type: 'admitted' }).success).toBe(false);
  });
});

// ─── Line of Business ────────────────────────────────

describe('createLineOfBusinessSchema', () => {
  it('accepts valid LOB', () => {
    const result = createLineOfBusinessSchema.safeParse({
      name: 'General Liability',
      abbreviation: 'GL',
      category: 'casualty',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = createLineOfBusinessSchema.safeParse({
      name: 'GL',
      abbreviation: 'GL',
      category: 'invalid_category',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Form / Paper ────────────────────────────────────

describe('createFormPaperSchema', () => {
  it('accepts valid form paper', () => {
    const result = createFormPaperSchema.safeParse({
      name: 'CG 00 01',
      carrier_id: '550e8400-e29b-41d4-a716-446655440000',
      line_of_business_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'occurrence',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-uuid carrier_id', () => {
    const result = createFormPaperSchema.safeParse({
      name: 'CG 00 01',
      carrier_id: 'not-uuid',
      line_of_business_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'occurrence',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Capacity ────────────────────────────────────────

describe('createCapacitySchema', () => {
  it('accepts valid capacity', () => {
    const result = createCapacitySchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      carrier_id: '550e8400-e29b-41d4-a716-446655440001',
      line_of_business_id: '550e8400-e29b-41d4-a716-446655440002',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Submission ──────────────────────────────────────

describe('createSubmissionSchema', () => {
  const validSubmission = {
    client_id: '550e8400-e29b-41d4-a716-446655440000',
    effective_date: '2025-01-01',
    expiration_date: '2026-01-01',
    lines_requested: [
      {
        line_of_business_id: '550e8400-e29b-41d4-a716-446655440001',
        requested_limit: '1000000',
      },
    ],
  };

  it('accepts valid submission', () => {
    expect(createSubmissionSchema.safeParse(validSubmission).success).toBe(true);
  });

  it('rejects empty lines_requested', () => {
    const result = createSubmissionSchema.safeParse({
      ...validSubmission,
      lines_requested: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('updateSubmissionSchema', () => {
  it('accepts status update', () => {
    const result = updateSubmissionSchema.safeParse({ status: 'quoted' });
    expect(result.success).toBe(true);
  });
});

// ─── Submission Target ───────────────────────────────

describe('createSubmissionTargetSchema', () => {
  it('accepts valid target', () => {
    const result = createSubmissionTargetSchema.safeParse({
      submission_id: '550e8400-e29b-41d4-a716-446655440000',
      contact_id: '550e8400-e29b-41d4-a716-446655440001',
      carrier_id: '550e8400-e29b-41d4-a716-446655440002',
      line_of_business_id: '550e8400-e29b-41d4-a716-446655440003',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateSubmissionTargetSchema', () => {
  it('accepts quote update', () => {
    const result = updateSubmissionTargetSchema.safeParse({
      status: 'quoted',
      quoted_premium: 25000,
      quoted_limit: 1000000,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Email ───────────────────────────────────────────

describe('sendEmailSchema', () => {
  it('accepts valid email', () => {
    const result = sendEmailSchema.safeParse({
      to_addresses: ['underwriter@carrier.com'],
      subject: 'Submission for Acme Corp',
      body_text: 'Please find the attached submission.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty to_addresses', () => {
    const result = sendEmailSchema.safeParse({
      to_addresses: [],
      subject: 'Test',
      body_text: 'Test',
    });
    expect(result.success).toBe(false);
  });
});

describe('createEmailRecordSchema', () => {
  it('accepts valid inbound email', () => {
    const result = createEmailRecordSchema.safeParse({
      direction: 'inbound',
      from_address: 'uw@carrier.com',
      to_addresses: ['broker@agency.com'],
      subject: 'Quote response',
      body_text: 'Here is your quote.',
      sent_at: '2025-01-15T10:00:00Z',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Email Import ────────────────────────────────────

describe('startEmailImportSchema', () => {
  it('accepts valid import request', () => {
    const result = startEmailImportSchema.safeParse({
      provider: 'import_gmail',
      date_range_start: '2024-01-01',
      date_range_end: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Attachment ──────────────────────────────────────

describe('createAttachmentSchema', () => {
  it('accepts valid attachment', () => {
    const result = createAttachmentSchema.safeParse({
      filename: 'loss_run_2024.pdf',
      file_url: 'https://storage.example.com/files/loss_run.pdf',
      file_size: 204800,
      mime_type: 'application/pdf',
      type: 'loss_run',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative file_size', () => {
    const result = createAttachmentSchema.safeParse({
      filename: 'test.pdf',
      file_url: 'https://storage.example.com/test.pdf',
      file_size: -1,
      mime_type: 'application/pdf',
      type: 'other',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Activity ────────────────────────────────────────

describe('createActivitySchema', () => {
  it('accepts valid activity', () => {
    const result = createActivitySchema.safeParse({
      type: 'submission_created',
      entity_type: 'submission',
      entity_id: '550e8400-e29b-41d4-a716-446655440000',
      summary: 'Submission created for Acme Corp',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Template ────────────────────────────────────────

describe('createTemplateSchema', () => {
  it('accepts valid template', () => {
    const result = createTemplateSchema.safeParse({
      name: 'Submission Cover Letter',
      type: 'cover_letter',
      content: 'Dear {{contact_name}}, ...',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Notification ────────────────────────────────────

describe('createNotificationSchema', () => {
  it('accepts valid notification', () => {
    const result = createNotificationSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'renewal_upcoming',
      title: 'Renewal Alert',
      message: 'Client ABC renewal in 30 days',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Network Relationship ────────────────────────────

describe('createNetworkRelationshipSchema', () => {
  it('accepts valid relationship', () => {
    const result = createNetworkRelationshipSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts relationship with strength', () => {
    const result = createNetworkRelationshipSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      strength: 'strong',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Sync Schedule ───────────────────────────────────

describe('createSyncScheduleSchema', () => {
  it('accepts valid sync schedule', () => {
    const result = createSyncScheduleSchema.safeParse({
      schedule_type: 'capacity_inquiry',
      frequency: 'quarterly',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Sync Job ────────────────────────────────────────

describe('createSyncJobSchema', () => {
  it('accepts valid sync job', () => {
    const result = createSyncJobSchema.safeParse({
      job_type: 'manual_refresh',
    });
    expect(result.success).toBe(true);
  });
});

// ─── AMS Connection ──────────────────────────────────

describe('createAMSConnectionSchema', () => {
  it('accepts valid AMS connection', () => {
    const result = createAMSConnectionSchema.safeParse({
      provider: 'applied_epic',
      connection_name: 'Main AMS',
      sync_direction: 'bidirectional',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Manifest ────────────────────────────────────────

describe('createManifestSchema', () => {
  it('accepts valid manifest', () => {
    const result = createManifestSchema.safeParse({
      manifest_type: 'entity_definition',
      key: 'client',
      config: { fields: [] },
      effective_from: '2025-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing config', () => {
    const result = createManifestSchema.safeParse({
      manifest_type: 'entity_definition',
      key: 'client',
      effective_from: '2025-01-01',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateManifestSchema', () => {
  it('accepts partial update', () => {
    const result = updateManifestSchema.safeParse({
      is_active: false,
      change_notes: 'Deactivated',
    });
    expect(result.success).toBe(true);
  });
});
