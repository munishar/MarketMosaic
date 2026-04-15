import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { SyncScheduleType, SyncFrequency } from '@brokerflow/shared';
import type { SyncSchedule } from '@brokerflow/shared';

const scheduleTypeOptions = Object.values(SyncScheduleType).map((v) => ({
  value: v,
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const frequencyOptions = Object.values(SyncFrequency).map((v) => ({
  value: v,
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

interface ScheduleBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  schedule?: SyncSchedule | null;
}

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({
  open,
  onClose,
  onSave,
  schedule,
}) => {
  const [scheduleType, setScheduleType] = useState(
    schedule?.schedule_type || SyncScheduleType.ams_sync,
  );
  const [frequency, setFrequency] = useState(
    schedule?.frequency || SyncFrequency.daily,
  );
  const [configJson, setConfigJson] = useState(
    schedule?.config ? JSON.stringify(schedule.config, null, 2) : '{}',
  );
  const [isActive, setIsActive] = useState(schedule?.is_active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleSave = async () => {
    let parsedConfig: Record<string, unknown>;
    try {
      parsedConfig = JSON.parse(configJson) as Record<string, unknown>;
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON configuration');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        schedule_type: scheduleType,
        frequency,
        config: parsedConfig,
        is_active: isActive,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={schedule ? 'Edit Schedule' : 'New Sync Schedule'}
      size="lg"
    >
      <div className="space-y-4">
        <Select
          label="Schedule Type"
          options={scheduleTypeOptions}
          value={scheduleType}
          onChange={(v) => setScheduleType(v as SyncScheduleType)}
        />

        <Select
          label="Frequency"
          options={frequencyOptions}
          value={frequency}
          onChange={(v) => setFrequency(v as SyncFrequency)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Configuration (JSON)
          </label>
          <textarea
            value={configJson}
            onChange={(e) => {
              setConfigJson(e.target.value);
              setJsonError(null);
            }}
            rows={6}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {jsonError && (
            <p className="mt-1 text-sm text-danger">{jsonError}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">Active</span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            {schedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
