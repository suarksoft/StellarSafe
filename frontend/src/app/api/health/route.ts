import { NextResponse } from 'next/server';
import { stellarClient } from '@/lib/stellar/client';

export async function GET() {
  try {
    // Test Stellar connection with a known Stellar account
    const testAccount = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
    await stellarClient.loadAccount(testAccount);

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stellar: {
          connected: true,
          network: stellarClient.network,
        },
        version: '0.1.0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service unhealthy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
