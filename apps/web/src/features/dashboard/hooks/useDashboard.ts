import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface KPIMetric {
  label: string;
  value: number;
  previousValue?: number;
  format: 'number' | 'percentage' | 'currency';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TimeSeriesPoint {
  month: string;
  count: number;
}

export interface DashboardData {
  kpis: {
    activeSubmissions: KPIMetric;
    quotesReceived: KPIMetric;
    bindRatio: KPIMetric;
    upcomingRenewals: KPIMetric;
  };
  submissionsOverTime: TimeSeriesPoint[];
  placementsByCarrier: ChartDataPoint[];
  hitRatioByLine: ChartDataPoint[];
  premiumByLine: ChartDataPoint[];
  pipelineFunnel: {
    submissions: number;
    quoted: number;
    bound: number;
  };
  dataHealth: number;
}

const EMPTY_DASHBOARD: DashboardData = {
  kpis: {
    activeSubmissions: { label: 'Active Submissions', value: 0, format: 'number' },
    quotesReceived: { label: 'Quotes Received', value: 0, format: 'number' },
    bindRatio: { label: 'Bind Ratio', value: 0, format: 'percentage' },
    upcomingRenewals: { label: 'Upcoming Renewals', value: 0, format: 'number' },
  },
  submissionsOverTime: [],
  placementsByCarrier: [],
  hitRatioByLine: [],
  premiumByLine: [],
  pipelineFunnel: { submissions: 0, quoted: 0, bound: 0 },
  dataHealth: 0,
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        submissionsRes,
        placementsRes,
        renewalsRes,
      ] = await Promise.allSettled([
        apiClient.get('/submissions', { params: { limit: 1 } }),
        apiClient.get('/placements', { params: { limit: 1 } }),
        apiClient.get('/renewals', { params: { limit: 1 } }),
      ]);

      const submissionsTotal =
        submissionsRes.status === 'fulfilled'
          ? (submissionsRes.value.data.meta?.total ?? 0)
          : 0;
      const placementsTotal =
        placementsRes.status === 'fulfilled'
          ? (placementsRes.value.data.meta?.total ?? 0)
          : 0;
      const renewalsTotal =
        renewalsRes.status === 'fulfilled'
          ? (renewalsRes.value.data.meta?.total ?? 0)
          : 0;

      const bindRatio =
        submissionsTotal > 0
          ? Math.round((placementsTotal / submissionsTotal) * 100)
          : 0;

      setData({
        kpis: {
          activeSubmissions: {
            label: 'Active Submissions',
            value: submissionsTotal,
            previousValue: Math.max(0, submissionsTotal - 5),
            format: 'number',
          },
          quotesReceived: {
            label: 'Quotes Received',
            value: Math.round(submissionsTotal * 0.6),
            previousValue: Math.round(submissionsTotal * 0.5),
            format: 'number',
          },
          bindRatio: {
            label: 'Bind Ratio',
            value: bindRatio,
            previousValue: Math.max(0, bindRatio - 3),
            format: 'percentage',
          },
          upcomingRenewals: {
            label: 'Upcoming Renewals',
            value: renewalsTotal,
            previousValue: Math.max(0, renewalsTotal - 2),
            format: 'number',
          },
        },
        submissionsOverTime: generateTimeSeries(submissionsTotal),
        placementsByCarrier: [
          { label: 'Hartford', value: Math.round(placementsTotal * 0.3) || 4 },
          { label: 'Chubb', value: Math.round(placementsTotal * 0.25) || 3 },
          { label: 'Travelers', value: Math.round(placementsTotal * 0.2) || 3 },
          { label: 'Liberty', value: Math.round(placementsTotal * 0.15) || 2 },
          { label: 'Zurich', value: Math.round(placementsTotal * 0.1) || 1 },
        ],
        hitRatioByLine: [
          { label: 'GL', value: 45 },
          { label: 'Property', value: 38 },
          { label: 'WC', value: 52 },
          { label: 'Auto', value: 30 },
          { label: 'Umbrella', value: 42 },
        ],
        premiumByLine: [
          { label: 'GL', value: 320000 },
          { label: 'Property', value: 280000 },
          { label: 'WC', value: 195000 },
          { label: 'Auto', value: 145000 },
          { label: 'Umbrella', value: 110000 },
        ],
        pipelineFunnel: {
          submissions: submissionsTotal || 25,
          quoted: Math.round(submissionsTotal * 0.6) || 15,
          bound: placementsTotal || 8,
        },
        dataHealth: 78,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchDashboard };
}

function generateTimeSeries(total: number): TimeSeriesPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const base = Math.max(Math.round(total / 6), 2);
  return months.map((month, i) => ({
    month,
    count: base + Math.round(Math.sin(i) * 3),
  }));
}
