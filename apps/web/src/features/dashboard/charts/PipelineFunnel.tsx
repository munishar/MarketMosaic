import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface PipelineFunnelProps {
  data: {
    submissions: number;
    quoted: number;
    bound: number;
  };
}

export const PipelineFunnel: React.FC<PipelineFunnelProps> = ({ data }) => {
  const chartData = [
    { stage: 'Submissions', value: data.submissions, fill: '#1B3A5C' },
    { stage: 'Quoted', value: data.quoted, fill: '#2E75B6' },
    { stage: 'Bound', value: data.bound, fill: '#16A34A' },
  ];

  const total = data.submissions || 1;

  return (
    <Card padding="none">
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-900">
          Pipeline Funnel
        </h3>
      </CardHeader>
      <CardContent>
        {data.submissions === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-gray-400">
            No pipeline data available
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                  }}
                />
                <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Conversion rates */}
            <div className="flex justify-around text-center text-xs text-gray-500">
              <div>
                <p className="font-medium text-gray-700">
                  {Math.round((data.quoted / total) * 100)}%
                </p>
                <p>Quote Rate</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {Math.round((data.bound / total) * 100)}%
                </p>
                <p>Bind Rate</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {data.quoted > 0
                    ? Math.round((data.bound / data.quoted) * 100)
                    : 0}
                  %
                </p>
                <p>Quote→Bind</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
