'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface PieChartData {
  name: string;
  value: number;
  color?: string;
  icon?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  description?: string;
  height?: number;
  isDark?: boolean;
  showPercentage?: boolean;
}

/**
 * 파이 차트 컴포넌트
 * 카테고리별 카드 분포 등 표시
 */
export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  description,
  height = 300,
  isDark = false,
  showPercentage = true,
}) => {
  // 다크 모드 색상
  const textColor = isDark ? '#CBD5E1' : '#64748B';
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
  const tooltipBorder = isDark ? '#475569' : '#E2E8F0';

  // 기본 색상 팔레트 (색상이 지정되지 않은 경우)
  const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // 전체 합계 계산
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // 커스텀 라벨 (백분율 표시)
  const renderCustomLabel = (entry: any) => {
    if (!showPercentage) return '';
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  // 커스텀 범례
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm" style={{ color: textColor }}>
              {entry.payload.icon && `${entry.payload.icon} `}
              {entry.value}: {entry.payload.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

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
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
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
          <Legend content={renderLegend} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
