import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FieldDefinition {
  key: string;
  display_name: string;
  type: string;
  required: boolean;
}

interface EntityDefinition {
  key: string;
  display_name: string;
  description: string;
  fields: FieldDefinition[];
}

interface EntityBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Record<string, unknown> | null;
}

const fieldTypeOptions = ['string', 'number', 'boolean', 'date', 'email', 'url', 'text', 'select', 'json'];

function parseEntityDefinition(data: Record<string, unknown> | null | undefined): EntityDefinition {
  if (!data) {
    return { key: '', display_name: '', description: '', fields: [] };
  }
  return {
    key: String(data.key ?? ''),
    display_name: String(data.display_name ?? ''),
    description: String(data.description ?? ''),
    fields: Array.isArray(data.fields)
      ? (data.fields as Record<string, unknown>[]).map((f) => ({
          key: String(f.key ?? ''),
          display_name: String(f.display_name ?? ''),
          type: String(f.type ?? 'string'),
          required: Boolean(f.required),
        }))
      : [],
  };
}

export const EntityBuilder: React.FC<EntityBuilderProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [entity, setEntity] = useState<EntityDefinition>(() =>
    parseEntityDefinition(initialData),
  );
  const [isSaving, setIsSaving] = useState(false);

  const addField = () => {
    setEntity((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { key: '', display_name: '', type: 'string', required: false },
      ],
    }));
  };

  const removeField = (index: number) => {
    setEntity((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    setEntity((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        key: entity.key,
        display_name: entity.display_name,
        description: entity.description,
        fields: entity.fields,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Entity Definition Editor" size="xl">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Entity Key"
            value={entity.key}
            onChange={(e) => setEntity((p) => ({ ...p, key: e.target.value }))}
            placeholder="e.g. client"
          />
          <Input
            label="Display Name"
            value={entity.display_name}
            onChange={(e) => setEntity((p) => ({ ...p, display_name: e.target.value }))}
            placeholder="e.g. Client"
          />
        </div>

        <Input
          label="Description"
          value={entity.description}
          onChange={(e) => setEntity((p) => ({ ...p, description: e.target.value }))}
          placeholder="Describe this entity…"
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Fields</h3>
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3 w-3" />} onClick={addField}>
              Add Field
            </Button>
          </div>

          {entity.fields.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center border rounded-md">
              No fields defined. Click "Add Field" to start.
            </p>
          ) : (
            <div className="space-y-3">
              {entity.fields.map((field, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-md border border-gray-200 p-3">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Field key"
                      value={field.key}
                      onChange={(e) => updateField(idx, { key: e.target.value })}
                    />
                    <Input
                      placeholder="Display name"
                      value={field.display_name}
                      onChange={(e) => updateField(idx, { display_name: e.target.value })}
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(idx, { type: e.target.value })}
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      {fieldTypeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap pt-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeField(idx)}
                    className="mt-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} isLoading={isSaving}>Save Entity</Button>
      </div>
    </Dialog>
  );
};
