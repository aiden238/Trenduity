'use client';

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartData {
  name: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartData[];
  title?: string;
  description?: string;
  color?: string;
  gradient?: [string, string];
  height?: number;
  isDark?: boolean;
  strokeWidth?: number;
  curveType?: 'linear' | 'monotone' | 'step';
}

/**
 * 영역 차트 컴포넌트
 * 누적 포인트, 일일 진척도 등 시계열 데이터 표시
 */
export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  title,
  description,
  color = '#3B82F6',
  gradient,
  height = 300,
  isDark = false,
  strokeWidth = 2,
  curveType = 'monotone',
}) => {
  // 다크 모드 색상
  const textColor = isDark ? '#CBD5E1' : '#64748B';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
  const tooltipBorder = isDark ? '#475569' : '#E2E8F0';

  // 그라디언트 ID
  const gradientId = `areaGradient-${Math.random().toString(36).substr(2, 9)}`;

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
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={gradient?.[0] || color}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={gradient?.[1] || color}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            tick={{ fill: textColor, fontSize: 12 }}
            stroke={gridColor}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 12 }}
            stroke={gridColor}
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
          />
          <Area
            type={curveType}
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            animationDuration={800}
            animationEasing="ease-out"
            className="hover:opacity-90 transition-opacity"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
