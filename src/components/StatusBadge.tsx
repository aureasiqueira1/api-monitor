'use client';

import { motion } from 'framer-motion';
import { APIStatus } from '../types/api';

interface StatusBadgeProps {
  status: APIStatus['status'];
  className?: string;
}

const statusConfig = {
  online: {
    label: 'Online',
    icon: '🟢',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  offline: {
    label: 'Offline',
    icon: '🔴',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  slow: {
    label: 'Slow',
    icon: '🟡',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  checking: {
    label: 'Checking',
    icon: '🟣',
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
        border backdrop-blur-sm transition-all duration-300
        ${config.className} ${className}
        ${status === 'checking' ? 'animate-pulse-slow' : ''}
      `}
    >
      <span className={status === 'checking' ? 'animate-bounce-slow' : ''}>{config.icon}</span>
      {config.label}
    </motion.div>
  );
}
