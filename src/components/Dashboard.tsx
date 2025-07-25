'use client';

import { useApiMonitor } from '@/hooks/useApiMonitor';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ApiCard } from './ApiCard';
import { ApiForm } from './ApiForm';
import { GlobalStats } from './GobalStats';

export function Dashboard() {
  const {
    apis,
    statuses,
    isMonitoring,
    interval,
    addAPI,
    removeAPI,
    toggleMonitoring,
    setInterval,
    checkAllAPIs,
  } = useApiMonitor();

  const handleAddAPI = (apiData: Parameters<typeof addAPI>[0]) => {
    addAPI(apiData);
    toast.success('API adicionada com sucesso!');
  };

  const handleRemoveAPI = (id: string) => {
    removeAPI(id);
    toast.success('API removida com sucesso!');
  };

  const handleRefresh = async () => {
    toast.info('Verificando todas as APIs...');
    await checkAllAPIs();
    toast.success('Verificação concluída!');
  };

  // Calculate global stats
  const globalStats = {
    totalAPIs: apis.length,
    onlineAPIs: Array.from(statuses.values()).filter(
      s => s.status === 'online' || s.status === 'slow'
    ).length,
    offlineAPIs: Array.from(statuses.values()).filter(s => s.status === 'offline').length,
    averageResponseTime:
      apis.length > 0
        ? Math.round(
            Array.from(statuses.values()).reduce((sum, s) => sum + s.responseTime, 0) / apis.length
          )
        : 0,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-gradient mb-4"
          >
            🚀 Monitor de APIs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Monitore a saúde e performance das suas APIs em tempo real
          </motion.p>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMonitoring}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isMonitoring
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isMonitoring ? 'Pausar' : 'Iniciar'}
              </button>

              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Verificar Agora
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Settings className="w-4 h-4" />
                <span>Intervalo:</span>
                <select
                  value={interval}
                  onChange={e => setInterval(parseInt(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
                >
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1min</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Stats */}
        {apis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlobalStats stats={globalStats} />
          </motion.div>
        )}

        {/* Add API Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <ApiForm onAdd={handleAddAPI} />
        </motion.div>

        {/* API Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {apis.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full glass-morphism rounded-2xl p-12 text-center"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-semibold text-white mb-2">Nenhuma API monitorada</h3>
                <p className="text-gray-400">
                  Adicione sua primeira API para começar o monitoramento
                </p>
              </motion.div>
            ) : (
              apis.map(api => (
                <ApiCard
                  key={api.id}
                  api={api}
                  status={statuses.get(api.id)}
                  onRemove={handleRemoveAPI}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
