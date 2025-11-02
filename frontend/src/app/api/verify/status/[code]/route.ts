import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/postgres';

interface VerificationStatus {
  code: string;
  contractId: string;
  network: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
  verified?: boolean;
  checks?: any[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Get verification request
    const result = await executeQuery(
      'SELECT * FROM verification_requests WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Verification code not found' },
        { status: 404 }
      );
    }

    const verificationRequest = result.rows[0];

    // Check if expired
    const isExpired = new Date(verificationRequest.expires_at) < new Date();
    const status = isExpired ? 'EXPIRED' : verificationRequest.status;

    const response: VerificationStatus = {
      code: verificationRequest.code,
      contractId: verificationRequest.contract_id,
      network: verificationRequest.network,
      status,
      createdAt: verificationRequest.created_at,
      expiresAt: verificationRequest.expires_at,
      completedAt: verificationRequest.completed_at,
    };

    // If completed, get verification result
    if (status === 'COMPLETED') {
      const verificationResult = await executeQuery(
        'SELECT verified, checks FROM verified_contracts WHERE contract_id = $1 AND network = $2',
        [verificationRequest.contract_id, verificationRequest.network]
      );

      if (verificationResult.rows.length > 0) {
        const result = verificationResult.rows[0];
        response.verified = result.verified;
        response.checks = result.checks;
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
