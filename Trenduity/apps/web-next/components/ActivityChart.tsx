'use client';

/**
 * ActivityChart 컴포넌트
 * recharts를 사용한 주간 활동 차트
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActivityChartProps {
  /** 차트 데이터 */
  data: Array<{
    date: string;
    completed: number;
    quizCorrect?: number;
  }>;
  /** 차트 높이 (px) */
  height?: number;
}

export function ActivityChart({ data, height = 300 }: ActivityChartProps) {
  // 날짜 포맷 (MM/DD)
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
  }));

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700"
      role="region"
      aria-label="주간 활동 차트"
    >
      <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-6">📊 주간 활동</h3>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="dateLabel" 
            stroke="#6B7280"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="#6B7280"
            style={{ fontSize: '14px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#111827', fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#3B82F6" 
            strokeWidth={3}
            name="완료 카드"
            dot={{ fill: '#3B82F6', r: 5 }}
            activeDot={{ r: 7 }}
          />
          {formattedData.some(d => d.quizCorrect !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="quizCorrect" 
              stroke="#10B981" 
              strokeWidth={2}
              name="퀴즈 정답"
              dot={{ fill: '#10B981', r: 4 }}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* 범례 설명 */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>완료 카드</span>
        </div>
        {formattedData.some(d => d.quizCorrect !== undefined) && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>퀴즈 정답</span>
          </div>
        )}
      </div>
    </div>
  );
}
