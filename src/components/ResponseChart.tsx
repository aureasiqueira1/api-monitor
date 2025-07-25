'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ResponseRecord } from '../types/api';

interface ResponseChartProps {
  data: ResponseRecord[];
  className?: string;
}

export function ResponseChart({ data, className = '' }: ResponseChartProps) {
  const chartData = useMemo(() => {
    return data.slice(-20).map((record, index) => ({
      index,
      responseTime: record.responseTime,
      status: record.status,
      timestamp: record.timestamp,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-morphism p-3 rounded-lg border">
          <p className="text-white text-sm">Tempo: {data.responseTime}ms</p>
          <p className="text-gray-400 text-xs">
            {formatDistanceToNow(new Date(data.timestamp), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className={`h-24 flex items-center justify-center text-gray-500 ${className}`}>
        Sem dados históricos
      </div>
    );
  }

  return (
    <div className={`h-24 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="responseTime"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
