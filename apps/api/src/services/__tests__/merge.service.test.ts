import { describe, it, expect } from 'vitest';
import { merge, extractMergeFields } from '../merge.service';

describe('MergeService', () => {
  describe('merge', () => {
    it('replaces a single placeholder', () => {
      const result = merge('Hello {{client.company_name}}', {
        client: { company_name: 'Acme Corp' },
      });
      expect(result).toBe('Hello Acme Corp');
    });

    it('replaces multiple placeholders from the same entity', () => {
      const result = merge('{{client.company_name}} — {{client.state}}', {
        client: { company_name: 'Acme Corp', state: 'CA' },
      });
      expect(result).toBe('Acme Corp — CA');
    });

    it('replaces placeholders from different entities', () => {
      const result = merge(
        'Dear {{contact.first_name}}, re: {{client.company_name}} with {{carrier.name}}',
        {
          contact: { first_name: 'John' },
          client: { company_name: 'Acme Corp' },
          carrier: { name: 'Hartford' },
        },
      );
      expect(result).toBe('Dear John, re: Acme Corp with Hartford');
    });

    it('leaves unknown entity placeholder when onMissing is "leave" (default)', () => {
      const result = merge('Hello {{submission.reference_number}}', {
        client: { company_name: 'Acme' },
      });
      expect(result).toBe('Hello {{submission.reference_number}}');
    });

    it('replaces unknown entity placeholder with empty string when onMissing is "empty"', () => {
      const result = merge('Hello {{submission.reference_number}}', {}, { onMissing: 'empty' });
      expect(result).toBe('Hello ');
    });

    it('leaves missing field placeholder when onMissing is "leave" (default)', () => {
      const result = merge('Hello {{client.missing_field}}', {
        client: { company_name: 'Acme' },
      });
      expect(result).toBe('Hello {{client.missing_field}}');
    });

    it('replaces missing field with empty string when onMissing is "empty"', () => {
      const result = merge('Hello {{client.missing_field}}', {
        client: { company_name: 'Acme' },
      }, { onMissing: 'empty' });
      expect(result).toBe('Hello ');
    });

    it('replaces null field with empty string when onMissing is "empty"', () => {
      const result = merge('{{client.dba}}', {
        client: { dba: null },
      }, { onMissing: 'empty' });
      expect(result).toBe('');
    });

    it('coerces non-string values to string', () => {
      const result = merge('Limit: {{client.revenue}}', {
        client: { revenue: 5000000 },
      });
      expect(result).toBe('Limit: 5000000');
    });

    it('handles content with no placeholders', () => {
      const content = 'No placeholders here.';
      expect(merge(content, { client: { name: 'X' } })).toBe(content);
    });

    it('handles repeated placeholder', () => {
      const result = merge('{{client.name}} — {{client.name}}', {
        client: { name: 'Acme' },
      });
      expect(result).toBe('Acme — Acme');
    });
  });

  describe('extractMergeFields', () => {
    it('extracts a single field', () => {
      const fields = extractMergeFields('Hello {{client.company_name}}');
      expect(fields).toEqual(['client.company_name']);
    });

    it('extracts multiple unique fields', () => {
      const fields = extractMergeFields(
        'Dear {{contact.first_name}}, re: {{client.company_name}} with {{carrier.name}}',
      );
      expect(fields).toContain('contact.first_name');
      expect(fields).toContain('client.company_name');
      expect(fields).toContain('carrier.name');
      expect(fields).toHaveLength(3);
    });

    it('deduplicates repeated fields', () => {
      const fields = extractMergeFields('{{client.name}} — {{client.name}}');
      expect(fields).toEqual(['client.name']);
    });

    it('returns empty array for content with no placeholders', () => {
      expect(extractMergeFields('No placeholders here.')).toEqual([]);
    });
  });
});
