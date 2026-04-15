import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Calendar, Activity, Wifi, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { useSync } from './hooks/useSync';
import { ScheduleBuilder } from './ScheduleBuilder';
import { ConnectionManager } from './ConnectionManager';
import { FreshnessMonitor } from './FreshnessMonitor';
import { JobHistory } from './JobHistory';
import type { SyncSchedule } from '@brokerflow/shared';

const SyncDashboard: React.FC = () => {
  const {
    schedules,
    jobs,
    connections,
    freshnessScores,
    isLoading,
    meta,
    fetchSchedules,
    fetchJobs,
    fetchConnections,
    fetchFreshness,
    createSchedule,
    updateSchedule,
    testConnection,
    triggerManualSync,
    refreshEntity,
  } = useSync();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<SyncSchedule | null>(null);

  useEffect(() => {
    fetchSchedules();
    fetchJobs();
    fetchConnections();
    fetchFreshness();
  }, [fetchSchedules, fetchJobs, fetchConnections, fetchFreshness]);

  const handleCreateOrUpdate = async (data: Record<string, unknown>) => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, data);
    } else {
      await createSchedule(data);
    }
    setEditingSchedule(null);
  };

  const handleToggleActive = async (schedule: SyncSchedule) => {
    await updateSchedule(schedule.id, { is_active: !schedule.is_active });
  };

  const scheduleColumns: Column<SyncSchedule>[] = [
    {
      key: 'schedule_type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      sortable: true,
      render: (value) => (
        <span className="capitalize">
          {String(value).replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'next_run_at',
      header: 'Next Run',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'last_run_at',
      header: 'Last Run',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'is_active',
      header: 'Active',
      render: (value, row) => (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(row);
          }}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            value ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_value, row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="h-3 w-3" />}
            onClick={(e) => {
              e.stopPropagation();
              triggerManualSync(row.id);
            }}
          >
            Run Now
          </Button>
        </div>
      ),
    },
  ];

  const tabItems: TabItem[] = [
    {
      key: 'schedules',
      label: 'Schedules',
      icon: <Calendar className="h-4 w-4" />,
      content: (
        <DataTable<SyncSchedule>
          columns={scheduleColumns}
          data={schedules}
          isLoading={isLoading}
          rowKey={(row) => row.id}
          onRowClick={(row) => {
            setEditingSchedule(row);
            setScheduleDialogOpen(true);
          }}
          page={meta.page}
          totalPages={meta.total_pages}
          emptyMessage="No sync schedules configured"
        />
      ),
    },
    {
      key: 'jobs',
      label: 'Jobs',
      icon: <Activity className="h-4 w-4" />,
      content: (
        <JobHistory
          jobs={jobs}
          isLoading={isLoading}
          page={meta.page}
          totalPages={meta.total_pages}
        />
      ),
    },
    {
      key: 'connections',
      label: 'Connections',
      icon: <Wifi className="h-4 w-4" />,
      content: (
        <ConnectionManager
          connections={connections}
          onTest={async (id) => {
            await testConnection(id);
            await fetchConnections();
          }}
          isLoading={isLoading}
        />
      ),
    },
    {
      key: 'freshness',
      label: 'Freshness',
      icon: <BarChart3 className="h-4 w-4" />,
      content: (
        <FreshnessMonitor
          scores={freshnessScores}
          isLoading={isLoading}
          onRefresh={refreshEntity}
          page={meta.page}
          totalPages={meta.total_pages}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sync Administration"
        description="Manage data synchronization schedules, connections, and freshness."
        action={{
          label: 'New Schedule',
          onClick: () => {
            setEditingSchedule(null);
            setScheduleDialogOpen(true);
          },
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <Tabs items={tabItems} defaultActiveKey="schedules" />

      <ScheduleBuilder
        open={scheduleDialogOpen}
        onClose={() => {
          setScheduleDialogOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleCreateOrUpdate}
        schedule={editingSchedule}
      />
    </div>
  );
};

export default SyncDashboard;
