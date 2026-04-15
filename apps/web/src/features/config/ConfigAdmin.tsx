import React, { useEffect, useState } from 'react';
import {
  Settings,
  FileText,
  Layers,
  GitBranch,
  Shield,
  Layout,
  Navigation,
  History,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { ManifestType } from '@brokerflow/shared';
import { useConfig } from './hooks/useConfig';
import { EntityBuilder } from './EntityBuilder';
import { WorkflowDesigner } from './WorkflowDesigner';
import { PermissionManager } from './PermissionManager';
import { ManifestHistory } from './ManifestHistory';

interface ManifestRow {
  id: string;
  manifest_type: string;
  key: string;
  version: number;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const tabConfig: { key: string; label: string; type: ManifestType; icon: React.ReactNode }[] = [
  { key: 'entity_definition', label: 'Entity Definitions', type: ManifestType.entity_definition, icon: <Layers className="h-4 w-4" /> },
  { key: 'field_schema', label: 'Field Schemas', type: ManifestType.field_schema, icon: <FileText className="h-4 w-4" /> },
  { key: 'workflow_definition', label: 'Workflow Definitions', type: ManifestType.workflow_definition, icon: <GitBranch className="h-4 w-4" /> },
  { key: 'permission_matrix', label: 'Permissions', type: ManifestType.permission_matrix, icon: <Shield className="h-4 w-4" /> },
  { key: 'ui_layout', label: 'UI Layouts', type: ManifestType.ui_layout, icon: <Layout className="h-4 w-4" /> },
  { key: 'navigation', label: 'Navigation', type: ManifestType.navigation, icon: <Navigation className="h-4 w-4" /> },
];

const ConfigAdmin: React.FC = () => {
  const { manifests, isLoading, fetchManifests, updateManifest } = useConfig();
  const [activeTab, setActiveTab] = useState(tabConfig[0].key);
  const [editingManifest, setEditingManifest] = useState<ManifestRow | null>(null);
  const [entityBuilderOpen, setEntityBuilderOpen] = useState(false);
  const [workflowDesignerOpen, setWorkflowDesignerOpen] = useState(false);
  const [permissionManagerOpen, setPermissionManagerOpen] = useState(false);
  const [historyManifestId, setHistoryManifestId] = useState<string | null>(null);

  useEffect(() => {
    fetchManifests();
  }, [fetchManifests]);

  const handleRowClick = (row: ManifestRow) => {
    setEditingManifest(row);
    const manifestType = row.manifest_type as ManifestType;
    if (manifestType === ManifestType.entity_definition) {
      setEntityBuilderOpen(true);
    } else if (manifestType === ManifestType.workflow_definition) {
      setWorkflowDesignerOpen(true);
    } else if (manifestType === ManifestType.permission_matrix) {
      setPermissionManagerOpen(true);
    } else {
      // Generic JSON editing can be added here; for now open entity builder as a generic editor
      setEntityBuilderOpen(true);
    }
  };

  const handleSave = async (data: Record<string, unknown>) => {
    if (editingManifest) {
      await updateManifest(editingManifest.id, { config: data });
    }
    setEditingManifest(null);
  };

  const columns: Column<ManifestRow>[] = [
    {
      key: 'key',
      header: 'Key',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{String(value)}</span>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      render: (value) => (
        <span className="font-mono text-sm text-primary">v{String(value)}</span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'default'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'updated_at',
      header: 'Last Updated',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'id',
      header: 'History',
      render: (_value, row) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<History className="h-3 w-3" />}
          onClick={(e) => {
            e.stopPropagation();
            setHistoryManifestId(row.id);
          }}
        >
          History
        </Button>
      ),
    },
  ];

  const tabItems: TabItem[] = tabConfig.map((tab) => {
    const filteredManifests = (manifests as unknown as ManifestRow[]).filter(
      (m) => m.manifest_type === tab.type,
    );

    return {
      key: tab.key,
      label: tab.label,
      icon: tab.icon,
      content: (
        <DataTable<ManifestRow>
          columns={columns}
          data={filteredManifests}
          isLoading={isLoading}
          rowKey={(row) => row.id}
          onRowClick={handleRowClick}
          emptyMessage={`No ${tab.label.toLowerCase()} configured`}
        />
      ),
    };
  });

  return (
    <div>
      <PageHeader
        title="Configuration Admin"
        description="Manage platform configuration manifests, entity definitions, workflows, and permissions."
        action={{
          label: 'Settings',
          onClick: () => fetchManifests(),
          icon: <Settings className="h-4 w-4" />,
        }}
      />

      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />

      <EntityBuilder
        open={entityBuilderOpen}
        onClose={() => {
          setEntityBuilderOpen(false);
          setEditingManifest(null);
        }}
        onSave={handleSave}
        initialData={editingManifest?.config}
      />

      <WorkflowDesigner
        open={workflowDesignerOpen}
        onClose={() => {
          setWorkflowDesignerOpen(false);
          setEditingManifest(null);
        }}
        onSave={handleSave}
        initialData={editingManifest?.config}
      />

      <PermissionManager
        open={permissionManagerOpen}
        onClose={() => {
          setPermissionManagerOpen(false);
          setEditingManifest(null);
        }}
        onSave={handleSave}
        initialData={editingManifest?.config}
      />

      {historyManifestId && (
        <ManifestHistory
          manifestId={historyManifestId}
          open={Boolean(historyManifestId)}
          onClose={() => setHistoryManifestId(null)}
        />
      )}
    </div>
  );
};

export default ConfigAdmin;
