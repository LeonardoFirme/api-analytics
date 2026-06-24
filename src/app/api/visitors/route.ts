// src/app/api/visitors/route.ts
import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient();

export async function GET() {
  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;

    return NextResponse.json({ activeUsers }, {
      headers: {
        'Access-Control-Allow-Origin': 'https://leonardofirme.com.br', // Libera apenas para o seu site
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 's-maxage=30, stale-while-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ activeUsers: 0 }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': 'https://leonardofirme.com.br' }
    });
  }
}