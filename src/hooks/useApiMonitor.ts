'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { APIEndpoint, APIStatus, ResponseRecord } from '@/types/api';
import { useLocalStorage } from './useLocalStorage';

export function useApiMonitor() {
  const [apis, setApis] = useLocalStorage<APIEndpoint[]>('api-endpoints', []);
  const [statuses, setStatuses] = useState<Map<string, APIStatus>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [interval, setInterval] = useState(10000);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // Função para fazer check de uma API individual
  const checkSingleAPI = useCallback(async (api: APIEndpoint): Promise<void> => {
    // Evitar múltiplas requests simultâneas para a mesma API
    if (activeRequestsRef.current.has(api.id)) {
      console.log(`⏭️ Pulando ${api.name} - já em verificação`);
      return;
    }

    activeRequestsRef.current.add(api.id);
    const startTime = performance.now();

    // Atualizar status para "checking"
    setStatuses(prev => {
      const newStatuses = new Map(prev);
      const current = newStatuses.get(api.id) || {
        id: api.id,
        status: 'checking' as const,
        responseTime: 0,
        lastCheck: new Date(),
        uptime: 100,
        successCount: 0,
        totalChecks: 0,
        responseHistory: [],
      };
      newStatuses.set(api.id, { ...current, status: 'checking' });
      return newStatuses;
    });

    try {
      console.log(`🔍 Verificando ${api.name}: ${api.url}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), api.timeout || 15000);

      const proxyPayload = {
        url: api.url,
        method: api.method || 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          ...(api.headers || {}),
        },
      };

      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const endTime = performance.now();
      const clientResponseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const result = await response.json();

      // Verificar se foi sucesso
      const expectedStatus = api.expectedStatus || 200;
      const actualStatus = result.status || 0;

      const isSuccess =
        result.success &&
        (actualStatus === expectedStatus ||
          (expectedStatus === 200 && actualStatus >= 200 && actualStatus < 300));

      // Usar o tempo de resposta do servidor ou do cliente
      const finalResponseTime = result.responseTime || clientResponseTime;

      // Atualizar status
      setStatuses(prev => {
        const newStatuses = new Map(prev);
        const current = newStatuses.get(api.id) || {
          id: api.id,
          status: 'offline' as const,
          responseTime: 0,
          lastCheck: new Date(),
          uptime: 100,
          successCount: 0,
          totalChecks: 0,
          responseHistory: [],
        };

        const newSuccessCount = isSuccess ? current.successCount + 1 : current.successCount;
        const newTotalChecks = current.totalChecks + 1;
        const newUptime = Math.round((newSuccessCount / newTotalChecks) * 100);

        let status: APIStatus['status'] = 'offline';
        if (isSuccess) {
          status = finalResponseTime > 2000 ? 'slow' : 'online';
        }

        const newRecord: ResponseRecord = {
          timestamp: Date.now(),
          responseTime: finalResponseTime,
          status: isSuccess ? 'success' : 'error',
          statusCode: actualStatus,
        };

        const newHistory = [...current.responseHistory, newRecord].slice(-50);

        newStatuses.set(api.id, {
          ...current,
          status,
          responseTime: finalResponseTime,
          lastCheck: new Date(),
          uptime: newUptime,
          successCount: newSuccessCount,
          totalChecks: newTotalChecks,
          responseHistory: newHistory,
          errorMessage: isSuccess ? undefined : result.error || `Status: ${actualStatus}`,
        });

        return newStatuses;
      });

      console.log(`✅ ${api.name}: ${actualStatus} em ${finalResponseTime}ms`);
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout';
        } else {
          errorMessage = error.message;
        }
      }

      console.error(`❌ ${api.name}: ${errorMessage}`);

      // Atualizar status de erro
      setStatuses(prev => {
        const newStatuses = new Map(prev);
        const current = newStatuses.get(api.id) || {
          id: api.id,
          status: 'offline' as const,
          responseTime: 0,
          lastCheck: new Date(),
          uptime: 100,
          successCount: 0,
          totalChecks: 0,
          responseHistory: [],
        };

        const newTotalChecks = current.totalChecks + 1;
        const newUptime = Math.round((current.successCount / newTotalChecks) * 100);

        const newRecord: ResponseRecord = {
          timestamp: Date.now(),
          responseTime,
          status: 'error',
        };

        const newHistory = [...current.responseHistory, newRecord].slice(-50);

        newStatuses.set(api.id, {
          ...current,
          status: 'offline',
          responseTime,
          lastCheck: new Date(),
          uptime: newUptime,
          totalChecks: newTotalChecks,
          responseHistory: newHistory,
          errorMessage,
        });

        return newStatuses;
      });
    } finally {
      activeRequestsRef.current.delete(api.id);
    }
  }, []);

  // Função para verificar todas as APIs
  const checkAllAPIs = useCallback(async () => {
    if (apis.length === 0) {
      console.log('📭 Nenhuma API para verificar');
      return;
    }

    console.log(`🚀 Verificando ${apis.length} APIs...`);

    // Executar checks em série para evitar sobrecarga
    for (const api of apis) {
      if (!activeRequestsRef.current.has(api.id)) {
        await checkSingleAPI(api);
        // Pequeno delay entre requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('✅ Verificação concluída');
  }, [apis, checkSingleAPI]);

  // Adicionar nova API
  const addAPI = useCallback(
    (apiData: Omit<APIEndpoint, 'id' | 'createdAt'>) => {
      const newAPI: APIEndpoint = {
        ...apiData,
        id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      setApis((prev: APIEndpoint[]) => [...prev, newAPI]);
      console.log(`➕ API adicionada: ${newAPI.name}`);

      // Fazer check inicial se monitoramento estiver ativo
      if (isMonitoring) {
        setTimeout(() => checkSingleAPI(newAPI), 1000);
      }
    },
    [setApis, isMonitoring, checkSingleAPI]
  );

  // Remover API
  const removeAPI = useCallback(
    (apiId: string) => {
      const api = apis.find(a => a.id === apiId);
      setApis((prev: APIEndpoint[]) => prev.filter(api => api.id !== apiId));
      setStatuses(prev => {
        const newStatuses = new Map(prev);
        newStatuses.delete(apiId);
        return newStatuses;
      });
      activeRequestsRef.current.delete(apiId);
      console.log(`🗑️ API removida: ${api?.name || apiId}`);
    },
    [apis, setApis]
  );

  // Toggle do monitoramento
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => {
      const newValue = !prev;
      console.log(`🔄 Monitoramento ${newValue ? 'INICIADO' : 'PAUSADO'}`);
      return newValue;
    });
  }, []);

  // Atualizar intervalo
  const updateInterval = useCallback((newInterval: number) => {
    console.log(`⏱️ Intervalo alterado: ${newInterval}ms`);
    setInterval(newInterval);
  }, []);

  // Check manual
  const manualCheck = useCallback(() => {
    console.log('🔧 Verificação manual iniciada');
    checkAllAPIs();
  }, [checkAllAPIs]);

  // Effect para gerenciar o monitoramento
  useEffect(() => {
    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Se monitoramento ativo e há APIs
    if (isMonitoring && apis.length > 0) {
      console.log(`🚀 Monitoramento iniciado (${interval}ms)`);

      // Check inicial
      checkAllAPIs();

      // Configurar intervalo
      intervalRef.current = setInterval(() => {
        checkAllAPIs();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isMonitoring, interval, apis.length, checkAllAPIs]);

  // Cleanup geral
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      activeRequestsRef.current.clear();
    };
  }, []);

  return {
    apis,
    statuses,
    isMonitoring,
    interval,
    addAPI,
    removeAPI,
    toggleMonitoring,
    setInterval: updateInterval,
    checkAllAPIs: manualCheck,
  };
}
