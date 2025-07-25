export interface APIEndpoint {
  name: string;
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  timeout?: number;
  headers?: Record<string, string>;
  expectedStatus?: number;
  body?: any;
  createdAt: Date;
}

export interface APIStatus {
  id: string;
  status: 'online' | 'offline' | 'slow' | 'checking';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
  successCount: number;
  totalChecks: number;
  responseHistory: ResponseRecord[];
  errorMessage?: string;
}

export interface ResponseRecord {
  timestamp: number;
  responseTime: number;
  status: 'success' | 'error' | 'timeout';
  statusCode?: number;
}

export interface GlobalStats {
  totalAPIs: number;
  onlineAPIs: number;
  offlineAPIs: number;
  averageResponseTime: number;
}
