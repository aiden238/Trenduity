'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  description?: string;
  color?: string;
  gradient?: [string, string];
  height?: number;
  isDark?: boolean;
}

/**
 * 막대 차트 컴포넌트
 * 월별 카드 완료 횟수 등 표시
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  description,
  color = '#3B82F6',
  gradient,
  height = 300,
  isDark = false,
}) => {
  // 다크 모드 색상
  const textColor = isDark ? '#CBD5E1' : '#64748B';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
  const tooltipBorder = isDark ? '#475569' : '#E2E8F0';

  return (
    <div className="w-full">
      {/* 헤더 */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {gradient && (
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradient[0]} stopOpacity={0.8} />
                <stop offset="100%" stopColor={gradient[1]} stopOpacity={0.6} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <YAxis
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: textColor, fontWeight: 600 }}
            itemStyle={{ color: textColor }}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          />
          <Bar
            dataKey="value"
            fill={gradient ? 'url(#barGradient)' : color}
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
