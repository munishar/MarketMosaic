import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Mail,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { EmailThread } from './EmailThread';
import { EmailComposer } from './EmailComposer';
import { EmailParserReview } from './EmailParserReview';
import { useEmails } from './hooks/useEmails';
import {
  EmailDirection,
  EmailParseStatus,
  type Email,
} from '@brokerflow/shared';

const directionOptions = Object.values(EmailDirection).map((d) => ({
  value: d,
  label: d.replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const parseStatusOptions = Object.values(EmailParseStatus).map((s) => ({
  value: s,
  label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const FILTERS: FilterDef[] = [
  { key: 'direction', label: 'Direction', options: directionOptions },
  { key: 'parse_status', label: 'Parse Status', options: parseStatusOptions },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const EmailInbox: React.FC = () => {
  const { items, isLoading, meta, fetchEmails } = useEmails();

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState('sent_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [showComposer, setShowComposer] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showParser, setShowParser] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [replyTo, setReplyTo] = useState<string[]>([]);
  const [replySubject, setReplySubject] = useState('');

  const fetchParams = useMemo(
    () => ({
      page,
      limit: 25,
      sort: sortField,
      order: sortOrder,
      search: search || undefined,
      ...Object.fromEntries(
        Object.entries(filterValues).filter(([, v]) => v !== ''),
      ),
    }),
    [page, sortField, sortOrder, search, filterValues],
  );

  useEffect(() => {
    void fetchEmails(fetchParams);
  }, [fetchEmails, fetchParams]);

  const handleSort = useCallback(
    (field: string) => {
      if (field === sortField) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('asc');
      }
    },
    [sortField],
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleFilterClear = useCallback(() => {
    setFilterValues({});
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((row: Email) => {
    setSelectedEmail(row);
    setShowThread(true);
  }, []);

  const handleCompose = useCallback(() => {
    setReplyTo([]);
    setReplySubject('');
    setShowComposer(true);
  }, []);

  const handleReply = useCallback((email: Email) => {
    setReplyTo([email.from_address]);
    setReplySubject(`Re: ${email.subject}`);
    setShowThread(false);
    setShowComposer(true);
  }, []);

  const handleReviewParsed = useCallback(
    (e: React.MouseEvent, email: Email) => {
      e.stopPropagation();
      setSelectedEmail(email);
      setShowParser(true);
    },
    [],
  );

  const handleEmailSent = useCallback(() => {
    setShowComposer(false);
    void fetchEmails(fetchParams);
  }, [fetchEmails, fetchParams]);

  const handleParserDone = useCallback(() => {
    setShowParser(false);
    setSelectedEmail(null);
    void fetchEmails(fetchParams);
  }, [fetchEmails, fetchParams]);

  const columns: Column<Email>[] = useMemo(
    () => [
      {
        key: 'direction',
        header: '',
        className: 'w-8',
        render: (value) =>
          value === EmailDirection.inbound ? (
            <ArrowDownLeft className="h-4 w-4 text-[#2E75B6]" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-[#16A34A]" />
          ),
      },
      {
        key: 'from_address',
        header: 'From / To',
        sortable: true,
        render: (_value, row) => (
          <div className="truncate">
            <span className="text-sm font-medium text-gray-900">
              {row.direction === EmailDirection.inbound
                ? row.from_address
                : row.to_addresses[0] ?? '—'}
            </span>
          </div>
        ),
      },
      {
        key: 'subject',
        header: 'Subject',
        sortable: true,
        render: (value) => (
          <span className="truncate text-sm text-gray-700">{value as string}</span>
        ),
      },
      {
        key: 'sent_at',
        header: 'Date',
        sortable: true,
        className: 'w-28',
        render: (value) => (
          <span className="text-xs text-gray-500">{formatDate(value as string)}</span>
        ),
      },
      {
        key: 'direction_badge',
        header: 'Direction',
        className: 'w-28',
        render: (_value, row) => (
          <Badge variant={row.direction === EmailDirection.inbound ? 'primary' : 'success'}>
            {row.direction}
          </Badge>
        ),
      },
      {
        key: 'parse_status',
        header: 'Parse Status',
        className: 'w-36',
        render: (value, row) => (
          <div className="flex items-center gap-1">
            <StatusBadge status={value as string} />
            {(value === EmailParseStatus.parsed ||
              value === EmailParseStatus.review_needed) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e: React.MouseEvent) => handleReviewParsed(e, row)}
                leftIcon={<Sparkles className="h-3 w-3" />}
              >
                Review
              </Button>
            )}
          </div>
        ),
      },
    ],
    [handleReviewParsed],
  );

  return (
    <div>
      <PageHeader
        title="Email"
        description="Manage email communications with contacts and underwriters."
        action={{
          label: 'Compose',
          onClick: handleCompose,
          icon: <Pencil className="h-4 w-4" />,
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search emails..."
          />
        </div>
        <FilterBar
          filters={FILTERS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      </div>

      <DataTable<Email>
        columns={columns}
        data={items as Email[]}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        page={meta.page}
        totalPages={meta.total_pages}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No emails found. Compose an email or import from your provider."
        rowKey={(row) => row.id}
      />

      {/* Thread Dialog */}
      <Dialog
        open={showThread}
        onClose={() => setShowThread(false)}
        title="Email Thread"
        size="lg"
      >
        {selectedEmail && (
          <EmailThread
            email={selectedEmail}
            onReply={handleReply}
            onClose={() => setShowThread(false)}
          />
        )}
      </Dialog>

      {/* Compose Dialog */}
      <Dialog
        open={showComposer}
        onClose={() => setShowComposer(false)}
        title="Compose Email"
        size="lg"
      >
        <EmailComposer
          onSent={handleEmailSent}
          onCancel={() => setShowComposer(false)}
          initialTo={replyTo}
          initialSubject={replySubject}
        />
      </Dialog>

      {/* Parser Review Dialog */}
      <Dialog
        open={showParser}
        onClose={() => setShowParser(false)}
        title="Review Parsed Data"
        size="xl"
      >
        {selectedEmail && (
          <EmailParserReview
            email={selectedEmail}
            onConfirmed={handleParserDone}
            onRejected={handleParserDone}
          />
        )}
      </Dialog>
    </div>
  );
};

export default EmailInbox;
