import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserPlus, Filter } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { NetworkSearch } from './NetworkSearch';
import { RelationshipPanel } from './RelationshipPanel';
import { IntroductionRequest } from './IntroductionRequest';
import { useNetwork } from './hooks/useNetwork';
import type { NetworkEdge, NetworkNode } from './hooks/useNetwork';

const STRENGTH_COLORS: Record<string, string> = {
  strong: '#16A34A',
  moderate: '#2E75B6',
  weak: '#EAB308',
  new_contact: '#9CA3AF',
};

const NODE_RADIUS = 24;
const GRAPH_WIDTH = 900;
const GRAPH_HEIGHT = 500;

function getNodePositions(
  nodes: NetworkNode[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const users = nodes.filter((n) => n.type === 'user');
  const contacts = nodes.filter((n) => n.type === 'contact');

  const leftX = 120;
  const rightX = GRAPH_WIDTH - 120;

  users.forEach((node, idx) => {
    const y = 60 + (idx * (GRAPH_HEIGHT - 120)) / Math.max(users.length - 1, 1);
    positions.set(node.id, { x: leftX, y });
  });

  contacts.forEach((node, idx) => {
    const y =
      60 + (idx * (GRAPH_HEIGHT - 120)) / Math.max(contacts.length - 1, 1);
    positions.set(node.id, { x: rightX, y });
  });

  return positions;
}

const NetworkGraph: React.FC = () => {
  const {
    graphData,
    searchResults,
    isLoading,
    fetchGraph,
    searchContacts,
    findPath,
    updateRelationship,
    requestIntroduction,
  } = useNetwork();

  const [carrierFilter, setCarrierFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [selectedEdge, setSelectedEdge] = useState<NetworkEdge | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showIntroDialog, setShowIntroDialog] = useState(false);

  useEffect(() => {
    const params: Record<string, unknown> = {};
    if (carrierFilter) params.carrier = carrierFilter;
    if (regionFilter) params.region = regionFilter;
    fetchGraph(params);
  }, [fetchGraph, carrierFilter, regionFilter]);

  const carriers = useMemo(() => {
    const set = new Set<string>();
    graphData.nodes.forEach((n) => {
      if (n.carrier) set.add(n.carrier);
    });
    return Array.from(set).map((c) => ({ value: c, label: c }));
  }, [graphData.nodes]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    graphData.nodes.forEach((n) => {
      if (n.region) set.add(n.region);
    });
    return Array.from(set).map((r) => ({ value: r, label: r }));
  }, [graphData.nodes]);

  const nodePositions = useMemo(
    () => getNodePositions(graphData.nodes),
    [graphData.nodes],
  );

  const handleNodeClick = useCallback(
    (node: NetworkNode) => {
      setSelectedNodeId(node.id);
      // Find edge connected to this node for editing
      const edge = graphData.edges.find(
        (e) => e.source === node.id || e.target === node.id,
      );
      if (edge) setSelectedEdge(edge);
    },
    [graphData.edges],
  );

  const handleEdgeClick = useCallback((edge: NetworkEdge) => {
    setSelectedEdge(edge);
  }, []);

  const getNode = useCallback(
    (id: string) => graphData.nodes.find((n) => n.id === id) ?? null,
    [graphData.nodes],
  );

  const handleClosePanel = useCallback(() => {
    setSelectedEdge(null);
    setSelectedNodeId(null);
  }, []);

  return (
    <div>
      <PageHeader
        title="Network"
        description="Visualize and manage your relationship network."
        action={{
          label: 'Request Introduction',
          onClick: () => setShowIntroDialog(true),
          icon: <UserPlus className="h-4 w-4" />,
        }}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select
            options={[{ value: '', label: 'All Carriers' }, ...carriers]}
            value={carrierFilter}
            onChange={setCarrierFilter}
            placeholder="All Carriers"
            className="w-48"
          />
          <Select
            options={[{ value: '', label: 'All Regions' }, ...regions]}
            value={regionFilter}
            onChange={setRegionFilter}
            placeholder="All Regions"
            className="w-48"
          />
        </div>
      </PageHeader>

      {/* Search */}
      <div className="mb-4">
        <NetworkSearch
          onSearch={searchContacts}
          onFindPath={findPath}
          onNodeSelect={handleNodeClick}
          searchResults={searchResults}
        />
      </div>

      {/* Graph visualization */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px] text-sm text-gray-400">
            Loading network…
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-[500px] text-sm text-gray-400">
            No network data available. Add relationships to see the graph.
          </div>
        ) : (
          <div className="relative">
            {/* Legend */}
            <div className="absolute top-3 left-3 z-10 flex gap-3">
              <Badge variant="primary">Users</Badge>
              <Badge variant="secondary">Contacts</Badge>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                {Object.entries(STRENGTH_COLORS).map(([strength, color]) => (
                  <span key={strength} className="flex items-center gap-0.5">
                    <span
                      className="inline-block h-2 w-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <svg
              width="100%"
              height={GRAPH_HEIGHT}
              viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
              className="bg-gray-50"
            >
              {/* Edges */}
              {graphData.edges.map((edge) => {
                const src = nodePositions.get(edge.source);
                const tgt = nodePositions.get(edge.target);
                if (!src || !tgt) return null;
                const color =
                  STRENGTH_COLORS[edge.strength] ?? STRENGTH_COLORS.new_contact;
                return (
                  <line
                    key={edge.id}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={color}
                    strokeWidth={
                      edge.strength === 'strong'
                        ? 3
                        : edge.strength === 'moderate'
                          ? 2
                          : 1
                    }
                    strokeOpacity={0.6}
                    className="cursor-pointer hover:stroke-opacity-100"
                    onClick={() => handleEdgeClick(edge)}
                  />
                );
              })}

              {/* Nodes */}
              {graphData.nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const isUser = node.type === 'user';
                const isSelected = selectedNodeId === node.id;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_RADIUS}
                      fill={isUser ? '#1B3A5C' : '#2E75B6'}
                      fillOpacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#EAB308' : 'white'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {node.label.slice(0, 3).toUpperCase()}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + NODE_RADIUS + 14}
                      textAnchor="middle"
                      fill="#374151"
                      fontSize="11"
                    >
                      {node.label.length > 16
                        ? `${node.label.slice(0, 15)}…`
                        : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </Card>

      {/* Relationship edit panel */}
      {selectedEdge && (
        <RelationshipPanel
          edge={selectedEdge}
          sourceNode={getNode(selectedEdge.source)}
          targetNode={getNode(selectedEdge.target)}
          onSave={updateRelationship}
          onClose={handleClosePanel}
        />
      )}

      {/* Introduction dialog */}
      <Dialog
        open={showIntroDialog}
        onClose={() => setShowIntroDialog(false)}
        title="Request Introduction"
        size="md"
      >
        <IntroductionRequest
          onSubmit={async (cId, conId, msg) => {
            await requestIntroduction(cId, conId, msg);
            setShowIntroDialog(false);
          }}
        />
      </Dialog>
    </div>
  );
};

export default NetworkGraph;
