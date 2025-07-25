import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, method = 'GET', headers = {} } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validar URL
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const startTime = Date.now();

    // Configurar headers seguros
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'API-Monitor/1.0',
      Accept: 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache',
      ...headers,
    };

    // Remover headers problemáticos
    delete fetchHeaders.host;
    delete fetchHeaders.origin;
    delete fetchHeaders.referer;

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: fetchHeaders,
      // Não incluir body para GET/HEAD
      ...(method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD' && body.body
        ? {
            body: typeof body.body === 'string' ? body.body : JSON.stringify(body.body),
          }
        : {}),
    };

    console.log(`🔍 Proxy fazendo request para: ${url}`);

    const response = await fetch(url, fetchOptions);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Ler o body apenas uma vez
    let responseBody: any = null;
    const contentType = response.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        const textResponse = await response.text();
        responseBody = textResponse.length > 0 ? textResponse : null;
      }
    } catch (parseError) {
      console.warn('Erro ao parsear resposta:', parseError);
      responseBody = null;
    }

    const result = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      body: responseBody,
      headers: Object.fromEntries(response.headers.entries()),
    };

    console.log(`✅ Proxy response: ${response.status} em ${responseTime}ms`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Erro no proxy:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Proxy error',
        status: 0,
        responseTime: 0,
      },
      { status: 500 }
    );
  }
}
