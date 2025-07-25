// Interface para definir o endpoint da API
interface APIEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  expectedStatus?: number;
  timeout?: number;
}

// Interface para o resultado da verificação
interface APICheckResult {
  responseTime: number;
  status: 'success' | 'error' | 'timeout';
  statusCode?: number;
  errorMessage?: string;
  responseBody?: any;
}

class APIChecker {
  private abortControllers = new Map<string, AbortController>();

  async checkAPI(api: APIEndpoint): Promise<APICheckResult> {
    const startTime = performance.now();
    const controller = new AbortController();

    this.abortControllers.set(api.id, controller);

    try {
      const timeoutMs = api.timeout || 10000;
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      // Preparar o payload para o proxy
      const proxyPayload = {
        url: api.url,
        method: api.method || 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          ...(api.headers || {}),
        },
        // Só incluir body se o método permitir e se existir
        ...(this.shouldIncludeBody(api.method) && api.body ? { body: api.body } : {}),
      };

      console.log('Enviando para proxy:', {
        ...proxyPayload,
        body: proxyPayload.body ? '[BODY PRESENTE]' : '[SEM BODY]',
      });

      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proxyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      console.log('Status da resposta do proxy:', response.status);

      // Tentar parsear a resposta do proxy
      let result: any;
      try {
        result = await response.json();
        console.log('Resposta do proxy:', result);
      } catch (parseError) {
        console.error('Erro ao parsear resposta do proxy:', parseError);
        return {
          responseTime,
          status: 'error',
          errorMessage: 'Proxy returned invalid JSON',
        };
      }

      // Se o proxy retornou erro (não conseguiu fazer a requisição)
      if (!response.ok) {
        return {
          responseTime,
          status: 'error',
          statusCode: response.status,
          errorMessage: result.error || `Proxy error: ${response.status}`,
          responseBody: result,
        };
      }

      // Verificar se a API alvo retornou o status esperado
      const expectedStatus = api.expectedStatus || 200;
      const actualStatus = result.status;

      // Determinar se foi sucesso
      const isSuccess = this.isSuccessfulStatus(actualStatus, expectedStatus);

      const checkResult: APICheckResult = {
        responseTime: result.responseTime || responseTime,
        status: isSuccess ? 'success' : 'error',
        statusCode: actualStatus,
        responseBody: result.body,
      };

      if (!isSuccess) {
        checkResult.errorMessage = `Expected status ${expectedStatus}, got ${actualStatus}. Response: ${JSON.stringify(
          result.body
        )}`;
      }

      return checkResult;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      console.error('Erro na verificação da API:', error);

      // Verificar se foi timeout
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          responseTime: api.timeout || 10000,
          status: 'timeout',
          errorMessage: 'Request timeout',
        };
      }

      // Erro genérico
      return {
        responseTime,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.abortControllers.delete(api.id);
    }
  }

  private shouldIncludeBody(method: string): boolean {
    const methodsWithoutBody = ['GET', 'HEAD'];
    return !methodsWithoutBody.includes(method.toUpperCase());
  }

  private isSuccessfulStatus(actualStatus: number, expectedStatus: number): boolean {
    // Se há um status específico esperado, deve ser exato
    if (expectedStatus !== 200) {
      return actualStatus === expectedStatus;
    }

    // Se o status esperado é 200 (padrão), aceitar qualquer 2xx
    return actualStatus >= 200 && actualStatus < 300;
  }

  // Método para cancelar uma verificação específica
  cancelCheck(apiId: string): void {
    const controller = this.abortControllers.get(apiId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(apiId);
    }
  }

  // Método para cancelar todas as verificações
  cancelAllChecks(): void {
    for (const [apiId, controller] of this.abortControllers) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
}

export default APIChecker;
