'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Trash2, TrendingUp } from 'lucide-react';
import { APIEndpoint, APIStatus } from '../types/api';
import { ResponseChart } from './ResponseChart';
import { StatusBadge } from './StatusBadge';

interface ApiCardProps {
  api: APIEndpoint;
  status?: APIStatus;
  onRemove: (id: string) => void;
}

export function ApiCard({ api, status, onRemove }: ApiCardProps) {
  const handleRemove = () => {
    if (confirm('Tem certeza que deseja remover esta API?')) {
      onRemove(api.id);
    }
  };

  const uptime = status?.uptime ?? 100;
  const responseTime = status?.responseTime ?? 0;
  const lastCheck = status?.lastCheck;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="glass-morphism rounded-2xl p-6 transition-all duration-300 hover:glow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-white truncate mb-1">{api.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
              {api.method}
            </span>
            <a
              href={api.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{api.url}</span>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status?.status || 'checking'} />
          <button
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded-lg"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Resposta</span>
          </div>
          <div className="text-2xl font-bold text-white">{responseTime}ms</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Uptime</span>
          </div>
          <div className="text-2xl font-bold text-white">{uptime}%</div>
        </div>
      </div>

      {/* Response Chart */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Histórico de Resposta</div>
        <ResponseChart
          data={status?.responseHistory || []}
          className="bg-gray-800/50 rounded-lg p-2"
        />
      </div>

      {/* Last Check */}
      <div className="text-xs text-gray-500 text-center">
        {lastCheck ? (
          <>
            Última verificação: {formatDistanceToNow(lastCheck, { addSuffix: true, locale: ptBR })}
          </>
        ) : (
          'Aguardando primeira verificação...'
        )}
      </div>

      {/* Error Message */}
      {status?.errorMessage && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-xs text-red-400">Erro: {status.errorMessage}</div>
        </div>
      )}
    </motion.div>
  );
}
