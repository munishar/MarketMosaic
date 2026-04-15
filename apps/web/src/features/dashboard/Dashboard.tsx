import React, { useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { KPICards } from './KPICards';
import { SubmissionsOverTime } from './charts/SubmissionsOverTime';
import { PlacementsByCarrier } from './charts/PlacementsByCarrier';
import { HitRatioByLine } from './charts/HitRatioByLine';
import { PremiumByLine } from './charts/PremiumByLine';
import { PipelineFunnel } from './charts/PipelineFunnel';
import { DataHealthGauge } from './charts/DataHealthGauge';
import { useDashboard } from './hooks/useDashboard';

const Dashboard: React.FC = () => {
  const { data, isLoading, error, fetchDashboard } = useDashboard();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return <LoadingState type="page" />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your brokerage operations."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-6">
        <KPICards kpis={data.kpis} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SubmissionsOverTime data={data.submissionsOverTime} />
        <PlacementsByCarrier data={data.placementsByCarrier} />
        <HitRatioByLine data={data.hitRatioByLine} />
        <PremiumByLine data={data.premiumByLine} />
        <PipelineFunnel data={data.pipelineFunnel} />
        <DataHealthGauge percentage={data.dataHealth} />
      </div>
    </div>
  );
};

export default Dashboard;
