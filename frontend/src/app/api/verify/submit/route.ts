import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database/postgres';

interface SubmitVerificationRequest {
  code: string;
  contractName: string;
  wasmHash: string;
  wasmSize: number;
  sourceHash: string;
  sourceFiles: string[];
  gitCommit?: string;
  gitRemote?: string;
  gitBranch?: string;
  rustVersion?: string;
  sorobanVersion?: string;
  timestamp: number;
}

interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
}

// Run verification checks
function runVerificationChecks(payload: SubmitVerificationRequest, onChainWasmHash?: string): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  // Check 1: WASM hash match (critical)
  const wasmMatch = onChainWasmHash ? payload.wasmHash === onChainWasmHash : false;
  checks.push({
    name: 'WASM_MATCH',
    passed: wasmMatch,
    message: wasmMatch 
      ? 'WASM hash matches on-chain contract'
      : 'WASM hash does not match on-chain contract (or contract not found)'
  });

  // Check 2: Public source (critical)
  const hasGitRemote = !!payload.gitRemote && payload.gitRemote.includes('github.com');
  checks.push({
    name: 'PUBLIC_SOURCE',
    passed: hasGitRemote,
    message: hasGitRemote 
      ? `Source code available at ${payload.gitRemote}`
      : 'No public GitHub repository found'
  });

  // Check 3: Source files count (critical)
  const reasonableFileCount = payload.sourceFiles.length >= 1 && payload.sourceFiles.length <= 1000;
  checks.push({
    name: 'SOURCE_FILES',
    passed: reasonableFileCount,
    message: `${payload.sourceFiles.length} source files${reasonableFileCount ? ' (reasonable)' : ' (suspicious)'}`
  });

  // Check 4: Build environment (critical)
  const validBuildEnv = !!payload.rustVersion && !!payload.sorobanVersion;
  checks.push({
    name: 'BUILD_ENV',
    passed: validBuildEnv,
    message: validBuildEnv
      ? `Built with ${payload.rustVersion}, ${payload.sorobanVersion}`
      : 'Invalid or missing build environment information'
  });

  // Check 5: WASM size reasonable (warning)
  const reasonableSize = payload.wasmSize > 100 && payload.wasmSize < 10 * 1024 * 1024; // 100 bytes to 10MB
  checks.push({
    name: 'WASM_SIZE',
    passed: reasonableSize,
    message: `WASM size: ${(payload.wasmSize / 1024).toFixed(1)}KB${reasonableSize ? ' (reasonable)' : ' (suspicious)'}`
  });

  // Check 6: Recent build (warning)
  const buildAge = Date.now() - payload.timestamp;
  const recentBuild = buildAge < 30 * 24 * 60 * 60 * 1000; // 30 days
  checks.push({
    name: 'BUILD_RECENCY',
    passed: recentBuild,
    message: recentBuild
      ? 'Contract built recently'
      : 'Contract build is older than 30 days'
  });

  return checks;
}

export async function POST(request: NextRequest) {
  try {
    const code = request.headers.get('X-Verification-Code');
    if (!code) {
      return NextResponse.json(
        { error: 'Verification code header is required' },
        { status: 400 }
      );
    }

    const payload: SubmitVerificationRequest = await request.json();

    // Validate payload
    if (!payload.wasmHash || !payload.sourceHash || !payload.contractName) {
      return NextResponse.json(
        { error: 'Missing required verification data' },
        { status: 400 }
      );
    }

    // Find verification request
    const result = await executeQuery(
      'SELECT * FROM verification_requests WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    const verificationRequest = result.rows[0];

    // Check if code is expired
    if (new Date(verificationRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Check if code is already used
    if (verificationRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Verification code has already been used' },
        { status: 400 }
      );
    }

    // Run verification checks
    // Note: For now, we skip on-chain WASM verification since contract might not be deployed
    const checks = runVerificationChecks(payload);
    
    // Determine if verification passed (all critical checks must pass)
    const criticalChecks = ['WASM_MATCH', 'PUBLIC_SOURCE', 'SOURCE_FILES', 'BUILD_ENV'];
    const criticalCheckResults = checks.filter(check => criticalChecks.includes(check.name));
    const verified = criticalCheckResults.every(check => check.passed);

    // Save verification result using transaction
    const queries = [
      // Insert/update verified contract
      {
        text: `INSERT INTO verified_contracts 
               (contract_id, network, verified, checks, wasm_hash, wasm_size, source_hash, 
                source_files, git_commit, git_remote, git_branch, rust_version, 
                soroban_version, contract_name, verified_by) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
               ON CONFLICT (contract_id, network) 
               DO UPDATE SET 
                 verified = EXCLUDED.verified,
                 checks = EXCLUDED.checks,
                 wasm_hash = EXCLUDED.wasm_hash,
                 wasm_size = EXCLUDED.wasm_size,
                 source_hash = EXCLUDED.source_hash,
                 source_files = EXCLUDED.source_files,
                 git_commit = EXCLUDED.git_commit,
                 git_remote = EXCLUDED.git_remote,
                 git_branch = EXCLUDED.git_branch,
                 rust_version = EXCLUDED.rust_version,
                 soroban_version = EXCLUDED.soroban_version,
                 contract_name = EXCLUDED.contract_name,
                 verified_by = EXCLUDED.verified_by,
                 updated_at = NOW()`,
        params: [
          verificationRequest.contract_id,
          verificationRequest.network,
          verified,
          JSON.stringify(checks),
          payload.wasmHash,
          payload.wasmSize,
          payload.sourceHash,
          payload.sourceFiles,
          payload.gitCommit,
          payload.gitRemote,
          payload.gitBranch,
          payload.rustVersion,
          payload.sorobanVersion,
          payload.contractName,
          'stellarsafe-cli'
        ]
      },
      // Update request status
      {
        text: 'UPDATE verification_requests SET status = $1, completed_at = NOW() WHERE code = $2',
        params: ['COMPLETED', code]
      }
    ];

    await executeTransaction(queries);

    return NextResponse.json({
      success: true,
      verified,
      checks,
      message: verified 
        ? 'Contract verification completed successfully!'
        : 'Contract verification completed with warnings. Some checks failed.',
      contractId: verificationRequest.contract_id,
      network: verificationRequest.network
    });

  } catch (error) {
    console.error('Submit verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}