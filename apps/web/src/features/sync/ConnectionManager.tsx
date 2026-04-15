import React, { useState } from 'react';
import { Plus, TestTube, Settings, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import type { AMSConnection } from '@brokerflow/shared';
import { AMSConnectionStatus } from '@brokerflow/shared';

const connectionIcon: Record<string, React.ReactNode> = {
  [AMSConnectionStatus.connected]: <Wifi className="h-5 w-5 text-green-500" />,
  [AMSConnectionStatus.disconnected]: <WifiOff className="h-5 w-5 text-gray-400" />,
  [AMSConnectionStatus.error]: <AlertCircle className="h-5 w-5 text-red-500" />,
  [AMSConnectionStatus.testing]: <TestTube className="h-5 w-5 text-blue-500" />,
};

interface ConnectionManagerProps {
  connections: AMSConnection[];
  onTest: (id: string) => Promise<void>;
  onEdit?: (connection: AMSConnection) => void;
  onAdd?: () => void;
  isLoading?: boolean;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  connections,
  onTest,
  onEdit,
  onAdd,
  isLoading,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await onTest(id);
    } finally {
      setTestingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent>
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAdd}>
          Add Connection
        </Button>
      </div>

      {connections.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <WifiOff className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No AMS connections configured</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((conn) => (
            <Card key={conn.id} className="flex flex-col">
              <CardContent className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {connectionIcon[conn.status] || <Wifi className="h-5 w-5 text-gray-400" />}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {conn.connection_name}
                      </h3>
                      <Badge variant="default" className="mt-1">
                        {conn.provider.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                  <StatusBadge status={conn.status} />
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Direction</span>
                    <span className="font-medium text-gray-700">
                      {conn.sync_direction.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Sync</span>
                    <span className="font-medium text-gray-700">
                      {formatDateTime(conn.last_sync_at)}
                    </span>
                  </div>
                  {conn.api_endpoint && (
                    <div className="flex justify-between">
                      <span>Endpoint</span>
                      <span className="truncate max-w-[160px] font-medium text-gray-700">
                        {conn.api_endpoint}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<TestTube className="h-3 w-3" />}
                    onClick={() => handleTest(conn.id)}
                    isLoading={testingId === conn.id}
                  >
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Settings className="h-3 w-3" />}
                    onClick={() => onEdit?.(conn)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
