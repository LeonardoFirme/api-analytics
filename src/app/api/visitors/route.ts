// src/app/api/visitors/route.ts
import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient();

// Função auxiliar para definir cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://leonardofirme.com.br',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handler para requisições OPTIONS (Preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!propertyId) {
      throw new Error('GA_PROPERTY_ID não configurado');
    }

    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;

    return NextResponse.json(
      { activeUsers: parseInt(activeUsers as string, 10) },
      {
        headers: {
          ...corsHeaders,
          'Cache-Control': 's-maxage=30, stale-while-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Erro na API de visitantes:', error);
    return NextResponse.json(
      { activeUsers: 0 },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}