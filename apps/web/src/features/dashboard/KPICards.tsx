import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  MessageSquare,
  Target,
  CalendarClock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { KPIMetric } from './hooks/useDashboard';

interface KPICardsProps {
  kpis: {
    activeSubmissions: KPIMetric;
    quotesReceived: KPIMetric;
    bindRatio: KPIMetric;
    upcomingRenewals: KPIMetric;
  };
}

interface KPIConfig {
  key: keyof KPICardsProps['kpis'];
  icon: React.ReactNode;
  color: string;
}

const KPI_CONFIG: KPIConfig[] = [
  {
    key: 'activeSubmissions',
    icon: <FileText className="h-5 w-5" />,
    color: 'text-primary bg-primary/10',
  },
  {
    key: 'quotesReceived',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'text-secondary bg-secondary/10',
  },
  {
    key: 'bindRatio',
    icon: <Target className="h-5 w-5" />,
    color: 'text-success bg-success/10',
  },
  {
    key: 'upcomingRenewals',
    icon: <CalendarClock className="h-5 w-5" />,
    color: 'text-warning-dark bg-warning/10',
  },
];

function formatValue(metric: KPIMetric): string {
  switch (metric.format) {
    case 'percentage':
      return `${metric.value}%`;
    case 'currency':
      return `$${metric.value.toLocaleString()}`;
    default:
      return metric.value.toLocaleString();
  }
}

function getTrend(metric: KPIMetric): { isUp: boolean; delta: number } | null {
  if (metric.previousValue === undefined) return null;
  const delta = metric.value - metric.previousValue;
  return { isUp: delta >= 0, delta: Math.abs(delta) };
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPI_CONFIG.map(({ key, icon, color }) => {
        const metric = kpis[key];
        const trend = getTrend(metric);

        return (
          <Card key={key} padding="md">
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  color,
                )}
              >
                {icon}
              </div>
              {trend && (
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    trend.isUp ? 'text-success' : 'text-danger',
                  )}
                >
                  {trend.isUp ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {trend.delta}
                  {metric.format === 'percentage' ? '%' : ''}
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold text-gray-900">
                {formatValue(metric)}
              </p>
              <p className="text-sm text-gray-500">{metric.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
