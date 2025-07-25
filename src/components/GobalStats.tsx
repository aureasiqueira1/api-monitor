'use client';

import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { GlobalStats as GlobalStatsType } from '../types/api';

interface GlobalStatsProps {
  stats: GlobalStatsType;
}

export function GlobalStats({ stats }: GlobalStatsProps) {
  const statItems = [
    {
      label: 'Total de APIs',
      value: stats.totalAPIs,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Online',
      value: stats.onlineAPIs,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'Offline',
      value: stats.offlineAPIs,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      label: 'Tempo Médio',
      value: `${stats.averageResponseTime}ms`,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <div className="glass-morphism rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-400" />
        Estatísticas Globais
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${item.bgColor} rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}
          >
            <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
            <div className="text-sm text-gray-400">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
