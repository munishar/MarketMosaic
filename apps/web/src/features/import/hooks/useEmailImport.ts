import { useCallback, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { EmailImportJob } from '@marketmosaic/shared';

interface MatchedContact {
  id: string;
  name: string;
  email: string;
  carrier_name: string;
  matched_email_count: number;
}

interface ImportReport {
  total_imported: number;
  total_skipped: number;
  contacts: Array<{
    contact_name: string;
    email_count: number;
  }>;
}

export function useEmailImport() {
  const [job, setJob] = useState<EmailImportJob | null>(null);
  const [matchedContacts, setMatchedContacts] = useState<MatchedContact[]>([]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startImport = useCallback(
    async (provider: string): Promise<EmailImportJob> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post('/emails/import', { provider });
        const importJob = response.data.data as EmailImportJob;
        setJob(importJob);
        return importJob;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to start import';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const pollProgress = useCallback(
    (jobId: string, onUpdate: (job: EmailImportJob) => void) => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      pollingRef.current = setInterval(async () => {
        try {
          const response = await apiClient.get(`/emails/import/${jobId}`);
          const updatedJob = response.data.data as EmailImportJob;
          setJob(updatedJob);
          onUpdate(updatedJob);

          // Stop polling when complete or failed
          if (
            updatedJob.status === 'complete' ||
            updatedJob.status === 'failed' ||
            updatedJob.status === 'cancelled'
          ) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        } catch {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }, 2000);
    },
    [],
  );

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchMatchedContacts = useCallback(
    async (jobId: string): Promise<MatchedContact[]> => {
      try {
        const response = await apiClient.get(
          `/emails/import/${jobId}/matched-contacts`,
        );
        const contacts = (response.data.data ?? []) as MatchedContact[];
        setMatchedContacts(contacts);
        return contacts;
      } catch {
        return [];
      }
    },
    [],
  );

  const fetchReport = useCallback(
    async (jobId: string): Promise<ImportReport | null> => {
      try {
        const response = await apiClient.get(
          `/emails/import/${jobId}/report`,
        );
        const data = response.data.data as ImportReport;
        setReport(data);
        return data;
      } catch {
        return null;
      }
    },
    [],
  );

  const cancelImport = useCallback(
    async (jobId: string) => {
      stopPolling();
      await apiClient.post(`/emails/import/${jobId}/cancel`);
      setJob(null);
    },
    [stopPolling],
  );

  return {
    job,
    matchedContacts,
    report,
    isLoading,
    error,
    startImport,
    pollProgress,
    stopPolling,
    fetchMatchedContacts,
    fetchReport,
    cancelImport,
  };
}
