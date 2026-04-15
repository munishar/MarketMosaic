import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as templateService from '../template.service';

vi.mock('@brokerflow/db', () => ({ query: vi.fn() }));

import { query } from '@brokerflow/db';
const mockQuery = vi.mocked(query);

const makeTemplate = (overrides = {}) => ({
  id: 'tpl1',
  name: 'Welcome Email',
  type: 'email',
  content: 'Dear {{contact.first_name}}, welcome to {{client.company_name}}.',
  merge_fields: ['contact.first_name', 'client.company_name'],
  created_by: 'u1',
  is_shared: false,
  category: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const emptyResult = { rows: [], command: '', rowCount: 0, oid: 0, fields: [] };

describe('TemplateService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated template list', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [makeTemplate(), makeTemplate({ id: 'tpl2', name: 'Quote Letter' })],
          command: '', rowCount: 2, oid: 0, fields: [],
        });

      const result = await templateService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.total_pages).toBe(1);
    });

    it('filters by type', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeTemplate()], command: '', rowCount: 1, oid: 0, fields: [] });

      await templateService.list({ type: 'email' });
      expect(mockQuery.mock.calls[0][1]).toContain('email');
    });

    it('filters by is_shared', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeTemplate({ is_shared: true })], command: '', rowCount: 1, oid: 0, fields: [] });

      await templateService.list({ is_shared: true });
      expect(mockQuery.mock.calls[0][1]).toContain(true);
    });
  });

  describe('getById', () => {
    it('returns template when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTemplate()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await templateService.getById('tpl1');
      expect(result.name).toBe('Welcome Email');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult);
      await expect(templateService.getById('nope')).rejects.toThrow('Template not found');
    });
  });

  describe('create', () => {
    it('creates a template and auto-extracts merge fields', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTemplate()], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await templateService.create(
        {
          name: 'Welcome Email',
          type: 'email',
          content: 'Dear {{contact.first_name}}, welcome to {{client.company_name}}.',
        },
        'u1',
      );

      expect(result.name).toBe('Welcome Email');
      const insertValues = mockQuery.mock.calls[0][1] as unknown[];
      // merge_fields should be auto-extracted
      expect(insertValues).toContainEqual(
        expect.arrayContaining(['contact.first_name', 'client.company_name']),
      );
    });

    it('uses caller-supplied merge_fields when provided', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTemplate()], command: '', rowCount: 1, oid: 0, fields: [] });

      await templateService.create(
        {
          name: 'My Template',
          type: 'document',
          content: '{{client.company_name}}',
          merge_fields: ['client.company_name', 'client.state'],
        },
        'u1',
      );

      const insertValues = mockQuery.mock.calls[0][1] as unknown[];
      expect(insertValues).toContainEqual(['client.company_name', 'client.state']);
    });
  });

  describe('update', () => {
    it('updates a template', async () => {
      // getById call
      mockQuery.mockResolvedValueOnce({ rows: [makeTemplate()], command: '', rowCount: 1, oid: 0, fields: [] });
      // update call
      mockQuery.mockResolvedValueOnce({
        rows: [makeTemplate({ name: 'Updated Email' })],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await templateService.update('tpl1', { name: 'Updated Email' });
      expect(result.name).toBe('Updated Email');
    });

    it('re-extracts merge fields when content changes', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTemplate()], command: '', rowCount: 1, oid: 0, fields: [] });
      mockQuery.mockResolvedValueOnce({ rows: [makeTemplate({ content: '{{carrier.name}}' })], command: '', rowCount: 1, oid: 0, fields: [] });

      await templateService.update('tpl1', { content: 'Hello from {{carrier.name}}' });
      const updateValues = mockQuery.mock.calls[1][1] as unknown[];
      expect(updateValues).toContainEqual(['carrier.name']);
    });

    it('throws 404 when template not found', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult);
      await expect(templateService.update('nope', { name: 'X' })).rejects.toThrow('Template not found');
    });
  });

  describe('remove', () => {
    it('deactivates a template', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'tpl1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      await templateService.remove('tpl1');
      expect(mockQuery).toHaveBeenCalledOnce();
      const sql = mockQuery.mock.calls[0][0] as string;
      expect(sql).toContain('is_active = false');
    });

    it('throws 404 when template not found', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult);
      await expect(templateService.remove('nope')).rejects.toThrow('Template not found');
    });
  });

  describe('render', () => {
    it('renders a template with context', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTemplate()], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await templateService.render('tpl1', {
        context: {
          contact: { first_name: 'John' },
          client: { company_name: 'Acme Corp' },
        },
      });

      expect(result.rendered).toBe('Dear John, welcome to Acme Corp.');
      expect(result.merge_fields_used).toContain('contact.first_name');
      expect(result.merge_fields_used).toContain('client.company_name');
    });

    it('leaves unresolved placeholders by default', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTemplate({ content: 'Dear {{contact.first_name}}, ref: {{submission.reference}}' })],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await templateService.render('tpl1', {
        context: { contact: { first_name: 'Jane' } },
      });

      expect(result.rendered).toBe('Dear Jane, ref: {{submission.reference}}');
    });

    it('replaces unresolved placeholders with empty string when on_missing is "empty"', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTemplate({ content: 'Dear {{contact.first_name}}, ref: {{submission.reference}}' })],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await templateService.render('tpl1', {
        context: { contact: { first_name: 'Jane' } },
        on_missing: 'empty',
      });

      expect(result.rendered).toBe('Dear Jane, ref: ');
    });

    it('throws 404 when template not found', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult);
      await expect(
        templateService.render('nope', { context: {} }),
      ).rejects.toThrow('Template not found');
    });
  });
});
