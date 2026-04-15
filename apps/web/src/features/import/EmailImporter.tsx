import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Loader2,
  Mail,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useEmailImport } from './hooks/useEmailImport';
import { cn } from '@/lib/utils';
import type { EmailImportJob } from '@brokerflow/shared';

const STEPS = ['Connect Provider', 'Scan & Preview', 'Import', 'Report'];

interface EmailImporterProps {
  onComplete: () => void;
  onCancel: () => void;
}

/* ─── Progress Bar ─── */
const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                i < currentStep
                  ? 'bg-[#16A34A] text-white'
                  : i === currentStep
                    ? 'bg-[#2E75B6] text-white'
                    : 'bg-gray-200 text-gray-500',
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="mt-1 max-w-[80px] text-center text-xs text-gray-600">
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'mx-2 h-0.5 w-12 sm:w-20',
                i < currentStep ? 'bg-[#16A34A]' : 'bg-gray-200',
              )}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Step 1: Connect Provider ─── */
const ConnectProviderStep: React.FC<{
  onConnect: (provider: string) => void;
  isLoading: boolean;
}> = ({ onConnect, isLoading }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">
      Connect Your Email Provider
    </h3>
    <p className="text-sm text-gray-500">
      Connect your email account to import conversations with your contacts and
      underwriters.
    </p>
    <div className="grid gap-4 sm:grid-cols-2">
      <Card hoverable onClick={() => onConnect('import_gmail')}>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Mail className="h-7 w-7 text-red-500" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Gmail</span>
            <p className="text-center text-xs text-gray-500">
              Connect via Google OAuth
            </p>
            <Button
              variant="outline"
              size="sm"
              isLoading={isLoading}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onConnect('import_gmail');
              }}
            >
              Connect Gmail
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card hoverable onClick={() => onConnect('import_outlook')}>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Mail className="h-7 w-7 text-[#2E75B6]" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Outlook
            </span>
            <p className="text-center text-xs text-gray-500">
              Connect via Microsoft OAuth
            </p>
            <Button
              variant="outline"
              size="sm"
              isLoading={isLoading}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onConnect('import_outlook');
              }}
            >
              Connect Outlook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

/* ─── Step 2: Scan Preview ─── */
interface MatchedContact {
  id: string;
  name: string;
  email: string;
  carrier_name: string;
  matched_email_count: number;
}

const matchedColumns: Column<MatchedContact>[] = [
  { key: 'name', header: 'Contact Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'carrier_name', header: 'Carrier' },
  {
    key: 'matched_email_count',
    header: 'Matched Emails',
    render: (value) => (
      <Badge variant="primary">{value as number}</Badge>
    ),
  },
];

const ScanPreviewStep: React.FC<{
  job: EmailImportJob | null;
  matchedContacts: MatchedContact[];
}> = ({ job, matchedContacts }) => {
  const isScanning =
    job?.status === 'scanning' || job?.status === 'connecting';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {isScanning ? 'Scanning Your Emails...' : 'Scan Complete'}
      </h3>

      {isScanning ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E75B6]" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Scanned {job?.total_emails_scanned ?? 0} emails...
            </p>
            <p className="text-xs text-gray-400">
              Found {job?.matched_emails ?? 0} matching emails so far
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card padding="sm">
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1B3A5C]">
                    {job?.total_emails_scanned ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Emails Scanned</p>
                </div>
              </CardContent>
            </Card>
            <Card padding="sm">
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#2E75B6]">
                    {job?.matched_emails ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Matched Emails</p>
                </div>
              </CardContent>
            </Card>
            <Card padding="sm">
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#16A34A]">
                    {job?.matched_contacts ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Matched Contacts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {matchedContacts.length > 0 && (
            <DataTable<MatchedContact>
              columns={matchedColumns}
              data={matchedContacts}
              emptyMessage="No matching contacts found."
              rowKey={(row) => row.id}
            />
          )}
        </>
      )}
    </div>
  );
};

/* ─── Step 3: Import Progress ─── */
const ImportProgressStep: React.FC<{
  job: EmailImportJob | null;
}> = ({ job }) => {
  const percent = job?.progress_percent ?? 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Importing Emails...
      </h3>
      <p className="text-sm text-gray-500">
        Importing matched emails and enriching data. This may take a few
        minutes.
      </p>

      <div className="py-8">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-gray-700">
            {job?.imported_emails ?? 0} of {job?.matched_emails ?? 0} emails
          </span>
          <span className="text-gray-500">{percent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#2E75B6] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>
            {job?.status === 'enriching'
              ? 'Enriching imported data...'
              : 'Importing emails...'}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Step 4: Import Report ─── */
interface ImportReportData {
  total_imported: number;
  total_skipped: number;
  contacts: Array<{
    contact_name: string;
    email_count: number;
  }>;
}

const ImportReportStep: React.FC<{
  job: EmailImportJob | null;
  report: ImportReportData | null;
}> = ({ job, report }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A]/10">
        <Check className="h-5 w-5 text-[#16A34A]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Import Complete!
        </h3>
        <p className="text-sm text-gray-500">
          Successfully imported {job?.imported_emails ?? report?.total_imported ?? 0} emails.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Card padding="sm">
        <CardContent>
          <div className="flex items-center gap-3">
            <CloudDownload className="h-5 w-5 text-[#2E75B6]" />
            <div>
              <p className="text-xl font-bold text-gray-900">
                {report?.total_imported ?? job?.imported_emails ?? 0}
              </p>
              <p className="text-xs text-gray-500">Emails Imported</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card padding="sm">
        <CardContent>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#16A34A]" />
            <div>
              <p className="text-xl font-bold text-gray-900">
                {report?.contacts?.length ?? job?.matched_contacts ?? 0}
              </p>
              <p className="text-xs text-gray-500">Contacts Matched</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {report?.contacts && report.contacts.length > 0 && (
      <Card>
        <CardHeader>
          <h4 className="text-sm font-semibold text-gray-900">
            Emails per Contact
          </h4>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {report.contacts.map((c) => (
              <div
                key={c.contact_name}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-700">{c.contact_name}</span>
                <Badge variant="primary">{c.email_count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

/* ─── Main Wizard ─── */
export const EmailImporter: React.FC<EmailImporterProps> = ({
  onComplete,
  onCancel,
}) => {
  const {
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
  } = useEmailImport();

  const [step, setStep] = useState(0);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleConnect = useCallback(
    async (provider: string) => {
      try {
        const importJob = await startImport(provider);
        setStep(1);

        // Start polling for scan progress
        pollProgress(importJob.id, (updatedJob: EmailImportJob) => {
          if (
            updatedJob.status === 'previewing' ||
            updatedJob.status === 'importing'
          ) {
            void fetchMatchedContacts(updatedJob.id);
          }
        });
      } catch {
        // Error is set in the hook
      }
    },
    [startImport, pollProgress, fetchMatchedContacts],
  );

  const handleStartImport = useCallback(() => {
    if (!job) return;
    setStep(2);

    // Continue polling for import progress
    pollProgress(job.id, (updatedJob: EmailImportJob) => {
      if (updatedJob.status === 'complete') {
        void fetchReport(updatedJob.id);
        setStep(3);
      }
      if (updatedJob.status === 'failed') {
        // Stay on current step and show error
      }
    });
  }, [job, pollProgress, fetchReport]);

  const canNext = (): boolean => {
    switch (step) {
      case 0:
        return false; // Handled by provider buttons
      case 1:
        return (
          job !== null &&
          job.status !== 'scanning' &&
          job.status !== 'connecting'
        );
      case 2:
        return job?.status === 'complete';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = useCallback(() => {
    if (step === 1) {
      handleStartImport();
    } else if (step === 3) {
      stopPolling();
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, handleStartImport, stopPolling, onComplete]);

  const handleBack = useCallback(() => {
    if (step === 0) {
      onCancel();
    } else {
      setStep((s) => s - 1);
    }
  }, [step, onCancel]);

  return (
    <div>
      <ProgressBar currentStep={step} />

      <div className="min-h-[300px]">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 0 && (
          <ConnectProviderStep onConnect={(p) => void handleConnect(p)} isLoading={isLoading} />
        )}
        {step === 1 && (
          <ScanPreviewStep job={job} matchedContacts={matchedContacts} />
        )}
        {step === 2 && <ImportProgressStep job={job} />}
        {step === 3 && <ImportReportStep job={job} report={report} />}
      </div>

      <div className="flex justify-between border-t border-gray-200 pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={
            step > 0 ? <ChevronLeft className="h-4 w-4" /> : undefined
          }
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step > 0 && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canNext()}
            rightIcon={
              step < STEPS.length - 1 ? (
                <ChevronRight className="h-4 w-4" />
              ) : undefined
            }
          >
            {step === 3 ? 'Done' : step === 1 ? 'Start Import' : 'Next'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmailImporter;
