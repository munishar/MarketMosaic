import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface DataHealthGaugeProps {
  percentage: number;
}

function getHealthColor(pct: number): string {
  if (pct >= 80) return '#16A34A';
  if (pct >= 60) return '#EAB308';
  return '#DC2626';
}

function getHealthLabel(pct: number): string {
  if (pct >= 80) return 'Excellent';
  if (pct >= 60) return 'Good';
  if (pct >= 40) return 'Fair';
  return 'Poor';
}

export const DataHealthGauge: React.FC<DataHealthGaugeProps> = ({
  percentage,
}) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const color = getHealthColor(clampedPct);
  const label = getHealthLabel(clampedPct);

  // SVG arc parameters for a semicircle gauge
  const radius = 60;
  const circumference = Math.PI * radius;
  const offset = circumference - (clampedPct / 100) * circumference;

  return (
    <Card padding="none">
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-900">Data Health</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <svg width="160" height="100" viewBox="0 0 160 100">
            {/* Background arc */}
            <path
              d="M 20 90 A 60 60 0 0 1 140 90"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Foreground arc */}
            <path
              d="M 20 90 A 60 60 0 0 1 140 90"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
            {/* Center text */}
            <text
              x="80"
              y="78"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill={color}
            >
              {clampedPct}%
            </text>
          </svg>
          <p
            className={cn(
              'text-sm font-medium mt-1',
              clampedPct >= 80
                ? 'text-success'
                : clampedPct >= 60
                  ? 'text-warning-dark'
                  : 'text-danger',
            )}
          >
            {label}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Overall data freshness
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
