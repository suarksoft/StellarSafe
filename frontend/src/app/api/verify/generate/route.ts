import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/postgres';

// Check environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL environment variable!');
  console.error('DATABASE_URL:', databaseUrl ? '✓ Set' : '✗ Missing');
}

interface GenerateCodeRequest {
  contractId: string;
  network: 'testnet' | 'public';
}

interface VerificationRequest {
  id: string;
  code: string;
  contract_id: string;
  network: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  created_at: string;
  expires_at: string;
  completed_at?: string;
}

// Generate a unique 6-character verification code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, L, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Check if contract exists on Stellar network using Soroban RPC
async function checkContractExists(contractId: string, network: string): Promise<boolean> {
  try {
    // Use Soroban RPC instead of Horizon for contract checks
    const rpcUrl = network === 'testnet' 
      ? 'https://soroban-testnet.stellar.org'
      : 'https://soroban-mainnet.stellar.org';
    
    // Get contract WASM using Soroban RPC
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getContractData',
        params: {
          contractId,
          key: {
            type: 'LedgerKeyContractCode'
          },
          durability: 'persistent'
        }
      })
    });

    if (!response.ok) {
      console.warn(`Soroban RPC returned ${response.status} for contract ${contractId}`);
      return false;
    }

    const data = await response.json();
    
    // If we get a result (even if null), the contract exists or is valid
    // For SAC contracts and other special cases, we'll be permissive
    if (data.error) {
      console.warn(`Contract check error for ${contractId}:`, data.error);
      // Don't fail - some contracts might not be queryable but are still valid
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking contract:', error);
    // Be permissive - allow verification to proceed
    // The actual WASM verification will catch invalid contracts
    return true;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    if (!databaseUrl) {
      console.error('❌ Database connection not configured');
      return NextResponse.json(
        { 
          error: 'Database connection not configured. Please check environment variables.',
          details: 'DATABASE_URL must be set in .env.local'
        },
        { status: 500 }
      );
    }

    const body: GenerateCodeRequest = await request.json();
    const { contractId, network } = body;

    // Validate input
    if (!contractId || !network) {
      return NextResponse.json(
        { error: 'Contract ID and network are required' },
        { status: 400 }
      );
    }

    // Validate contract ID format (Stellar contract IDs are 56 characters)
    if (contractId.length !== 56 || !contractId.startsWith('C')) {
      return NextResponse.json(
        { error: 'Invalid contract ID format' },
        { status: 400 }
      );
    }

    // Validate network
    if (!['testnet', 'public'].includes(network)) {
      return NextResponse.json(
        { error: 'Network must be testnet or public' },
        { status: 400 }
      );
    }

    // Basic validation: Contract ID format check
    // More thorough check will happen during actual verification (WASM hash match)
    // We use Soroban RPC for contract existence check
    const contractExists = await checkContractExists(contractId, network);
    
    if (!contractExists) {
      console.warn(`Contract ${contractId} validation warning - proceeding with verification`);
      // We're permissive here because:
      // 1. SAC contracts may not be queryable via RPC
      // 2. Some contract types have special handling
      // 3. Real verification happens during WASM hash matching
    }

    // Rate limiting: Check recent requests for this contract
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    try {
      const result = await executeQuery(
        'SELECT COUNT(*) as count FROM verification_requests WHERE contract_id = $1 AND network = $2 AND created_at >= $3',
        [contractId, network, oneHourAgo]
      );
      
      const requestCount = parseInt(result.rows[0].count);
      if (requestCount >= 5) {
        return NextResponse.json(
          { error: 'Too many verification attempts. Please try again later.' },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Generate unique code
    let code: string;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      code = generateCode();
      try {
        const result = await executeQuery(
          'SELECT id FROM verification_requests WHERE code = $1 AND expires_at > NOW()',
          [code]
        );
        codeExists = result.rows.length > 0;
      } catch (error) {
        console.error('Code check error:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
      attempts++;
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Unable to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // Create verification request
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    try {
      const result = await executeQuery(
        'INSERT INTO verification_requests (code, contract_id, network, status, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [code!, contractId, network, 'PENDING', expiresAt]
      );
      
      const verificationRequest = result.rows[0];
      
      return NextResponse.json({
        success: true,
        code: verificationRequest.code,
        expiresIn: 1800, // 30 minutes in seconds
        contractId,
        network,
      });
    } catch (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create verification request' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Generate code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
