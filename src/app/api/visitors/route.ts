// src/app/api/visitors/route.ts
import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// A variável GOOGLE_APPLICATION_CREDENTIALS na Vercel deve conter o JSON completo da sua service account
const analyticsDataClient = new BetaAnalyticsDataClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://leonardofirme.com.br',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!propertyId) {
      console.error('ERRO: GA_PROPERTY_ID não encontrado nas variáveis de ambiente.');
      throw new Error('Configuração ausente');
    }

    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;

    // Log para depuração no painel da Vercel
    console.log(`Debug API: Propriedade ${propertyId} retornou ${activeUsers} usuários.`);

    return NextResponse.json(
      { activeUsers: parseInt(activeUsers as string, 10) },
      { headers: { ...corsHeaders, 'Cache-Control': 's-maxage=15' } }
    );
  } catch (error: any) {
    console.error('Erro detalhado no servidor:', error.message);
    return NextResponse.json({ activeUsers: 0 }, { status: 500, headers: corsHeaders });
  }
}