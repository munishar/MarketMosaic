import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { UserRole, EntityType } from '@brokerflow/shared';

interface PermissionCell {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

type PermissionMatrix = Record<string, Record<string, PermissionCell>>;

interface PermissionManagerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Record<string, unknown> | null;
}

const roles = Object.values(UserRole);
const entities = Object.values(EntityType);
const crudOps: (keyof PermissionCell)[] = ['create', 'read', 'update', 'delete'];

function parseMatrix(data: Record<string, unknown> | null | undefined): PermissionMatrix {
  const matrix: PermissionMatrix = {};
  for (const role of roles) {
    matrix[role] = {};
    for (const entity of entities) {
      const existing =
        data &&
        typeof data[role] === 'object' &&
        data[role] !== null &&
        typeof (data[role] as Record<string, unknown>)[entity] === 'object'
          ? ((data[role] as Record<string, unknown>)[entity] as Partial<PermissionCell>)
          : {};
      matrix[role][entity] = {
        create: Boolean(existing?.create),
        read: Boolean(existing?.read),
        update: Boolean(existing?.update),
        delete: Boolean(existing?.delete),
      };
    }
  }
  return matrix;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => parseMatrix(initialData));
  const [isSaving, setIsSaving] = useState(false);

  const togglePermission = (role: string, entity: string, op: keyof PermissionCell) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [entity]: {
          ...prev[role][entity],
          [op]: !prev[role][entity][op],
        },
      },
    }));
  };

  const toggleAllForRole = (role: string, entity: string) => {
    const current = matrix[role][entity];
    const allChecked = crudOps.every((op) => current[op]);
    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [entity]: {
          create: !allChecked,
          read: !allChecked,
          update: !allChecked,
          delete: !allChecked,
        },
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(matrix as unknown as Record<string, unknown>);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Formatted entity headers
  const entityLabels = useMemo(
    () =>
      entities.map((e) => ({
        key: e,
        label: e.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    [],
  );

  return (
    <Dialog open={open} onClose={onClose} title="Permission Matrix" size="xl">
      <div className="max-h-[60vh] overflow-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              {entityLabels.map((e) => (
                <th
                  key={e.key}
                  className="px-2 py-2 text-center font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  colSpan={4}
                >
                  {e.label}
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-3 py-1" />
              {entities.map((entity) =>
                crudOps.map((op) => (
                  <th
                    key={`${entity}-${op}`}
                    className="px-1 py-1 text-center font-normal text-gray-400 uppercase"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {op.charAt(0).toUpperCase()}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-3 py-2 font-medium text-gray-900 capitalize whitespace-nowrap">
                  {role}
                </td>
                {entities.map((entity) =>
                  crudOps.map((op) => (
                    <td key={`${entity}-${op}`} className="px-1 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={matrix[role]?.[entity]?.[op] ?? false}
                        onChange={() => togglePermission(role, entity, op)}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                    </td>
                  )),
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Quick toggle rows */}
        <div className="mt-4 border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500 mb-2">Quick toggle — click to grant/revoke all CRUD:</p>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <div key={role} className="flex items-center gap-1">
                <span className="text-xs font-medium capitalize">{role}:</span>
                {entityLabels.map((e) => (
                  <button
                    key={e.key}
                    onClick={() => toggleAllForRole(role, e.key)}
                    className={`text-xs px-1.5 py-0.5 rounded border ${
                      crudOps.every((op) => matrix[role]?.[e.key]?.[op])
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} isLoading={isSaving}>Save Permissions</Button>
      </div>
    </Dialog>
  );
};
