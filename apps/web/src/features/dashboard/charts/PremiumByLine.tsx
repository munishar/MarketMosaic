import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import type { ChartDataPoint } from '../hooks/useDashboard';

interface PremiumByLineProps {
  data: ChartDataPoint[];
}

const COLORS = ['#1B3A5C', '#2E75B6', '#16A34A', '#EAB308', '#DC2626'];

export const PremiumByLine: React.FC<PremiumByLineProps> = ({ data }) => {
  return (
    <Card padding="none">
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-900">
          Premium by Line of Business
        </h3>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-gray-400">
            No premium data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="45%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={({ label }: { label: string }) => label}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  'Premium',
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
