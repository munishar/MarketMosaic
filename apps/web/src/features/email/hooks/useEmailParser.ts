import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Email } from '@brokerflow/shared';

interface ParsedField {
  key: string;
  value: string;
  confidence: number;
}

export function useEmailParser() {
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParsedData = useCallback(async (emailId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/emails/${emailId}/parsed`);
      const data = response.data.data as Record<string, { value: string; confidence: number }>;
      const fields: ParsedField[] = Object.entries(data).map(([key, field]) => ({
        key,
        value: String(field.value ?? ''),
        confidence: field.confidence ?? 0,
      }));
      setParsedFields(fields);
      return fields;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parsed data');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmParsedData = useCallback(
    async (emailId: string, editedFields: Record<string, string>): Promise<Email> => {
      const response = await apiClient.post(`/emails/${emailId}/parsed/confirm`, {
        fields: editedFields,
      });
      return response.data.data;
    },
    [],
  );

  const rejectParsedData = useCallback(
    async (emailId: string, reason?: string): Promise<Email> => {
      const response = await apiClient.post(`/emails/${emailId}/parsed/reject`, {
        reason,
      });
      return response.data.data;
    },
    [],
  );

  const requestParse = useCallback(async (emailId: string): Promise<void> => {
    await apiClient.post(`/emails/${emailId}/parse`);
  }, []);

  return {
    parsedFields,
    setParsedFields,
    isLoading,
    error,
    fetchParsedData,
    confirmParsedData,
    rejectParsedData,
    requestParse,
  };
}
