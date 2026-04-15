import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RenewalCard } from './RenewalCard';
import { useRenewals } from './hooks/useRenewals';
import { SubmissionStatus, type Submission } from '@marketmosaic/shared';
import { cn } from '@/lib/utils';

interface MonthGroup {
  key: string;
  label: string;
  renewals: Submission[];
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...Object.values(SubmissionStatus).map((s) => ({
    value: s,
    label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })),
];

function groupByMonth(submissions: Submission[]): MonthGroup[] {
  const groups = new Map<string, Submission[]>();

  submissions.forEach((s) => {
    const date = new Date(s.expiration_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = groups.get(key) ?? [];
    existing.push(s);
    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, renewals]) => {
      const [yearStr, monthStr] = key.split('-');
      const date = new Date(Number(yearStr), Number(monthStr) - 1);
      return {
        key,
        label: date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        renewals,
      };
    });
}

const SummaryCards: React.FC<{ items: Submission[] }> = ({ items }) => {
  const counts = useMemo(() => {
    const now = new Date();
    let expiringSoon = 0;
    let inProgress = 0;
    let bound = 0;
    let notStarted = 0;

    items.forEach((s) => {
      const daysLeft = Math.ceil(
        (new Date(s.expiration_date).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (s.status === SubmissionStatus.bound) {
        bound++;
      } else if (
        s.status === SubmissionStatus.submitted ||
        s.status === SubmissionStatus.quoted
      ) {
        inProgress++;
      } else if (
        s.status === SubmissionStatus.draft ||
        s.status === SubmissionStatus.expired
      ) {
        notStarted++;
      }

      if (daysLeft <= 30 && daysLeft >= 0) {
        expiringSoon++;
      }
    });

    return { total: items.length, expiringSoon, inProgress, bound, notStarted };
  }, [items]);

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
      {[
        { label: 'Total Renewals', value: counts.total, color: 'text-gray-900' },
        {
          label: 'Expiring < 30d',
          value: counts.expiringSoon,
          color: 'text-[#DC2626]',
        },
        {
          label: 'In Progress',
          value: counts.inProgress,
          color: 'text-[#EAB308]',
        },
        { label: 'Bound', value: counts.bound, color: 'text-[#16A34A]' },
        {
          label: 'Not Started',
          value: counts.notStarted,
          color: 'text-gray-500',
        },
      ].map((item) => (
        <Card key={item.label} padding="sm">
          <p className="text-xs font-medium text-gray-500">{item.label}</p>
          <p className={cn('text-2xl font-bold', item.color)}>{item.value}</p>
        </Card>
      ))}
    </div>
  );
};

const RenewalCalendar: React.FC = () => {
  const { items, isLoading, fetchRenewals } = useRenewals();
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    void fetchRenewals();
  }, [fetchRenewals]);

  const filteredItems = useMemo(
    () =>
      statusFilter
        ? items.filter((s) => s.status === statusFilter)
        : items,
    [items, statusFilter],
  );

  const monthGroups = useMemo(
    () => groupByMonth(filteredItems),
    [filteredItems],
  );

  const handleRenewalClick = useCallback((_submission: Submission) => {
    // Could navigate to submission detail — placeholder for future routing
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Renewals"
          description="Track upcoming policy renewals."
        />
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2E75B6]" />
          <span className="ml-3 text-sm text-gray-500">
            Loading renewals...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Renewals"
        description="Track upcoming policy renewals by month."
        action={{
          label: showFilter ? 'Hide Filters' : 'Filter',
          onClick: () => setShowFilter((prev) => !prev),
          icon: <Filter className="h-4 w-4" />,
        }}
      />

      {showFilter && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#2E75B6] focus:outline-none"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {statusFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('')}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      <SummaryCards items={filteredItems} />

      {monthGroups.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center py-12">
            <CalendarDays className="h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No renewals found matching your filters.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {monthGroups.map((group) => (
            <Card key={group.key} padding="none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {group.label}
                  </h3>
                  <Badge variant="default">{group.renewals.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.renewals.map((renewal) => (
                    <RenewalCard
                      key={renewal.id}
                      submission={renewal}
                      onClick={handleRenewalClick}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RenewalCalendar;
