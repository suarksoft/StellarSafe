import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ContractDetails {
  contractId: string;
  network: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  checks?: any[];
  wasmHash?: string;
  wasmSize?: number;
  sourceHash?: string;
  sourceFiles?: string[];
  gitCommit?: string;
  gitRemote?: string;
  gitBranch?: string;
  rustVersion?: string;
  sorobanVersion?: string;
  contractName?: string;
  metadata?: {
    name?: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    documentationUrl?: string;
    auditReportUrl?: string;
    license?: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'testnet';

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Validate contract ID format
    if (contractId.length !== 56 || !contractId.startsWith('C')) {
      return NextResponse.json(
        { error: 'Invalid contract ID format' },
        { status: 400 }
      );
    }

    // Get verification data
    const { data: verificationData, error: verificationError } = await supabase
      .from('verified_contracts')
      .select('*')
      .eq('contract_id', contractId)
      .eq('network', network)
      .single();

    // Get metadata
    const { data: metadataData, error: metadataError } = await supabase
      .from('contract_metadata')
      .select('*')
      .eq('contract_id', contractId)
      .eq('network', network)
      .single();

    // If no verification data found, return basic info
    if (verificationError || !verificationData) {
      return NextResponse.json({
        contractId,
        network,
        verified: false,
        metadata: metadataData || null,
        message: 'Contract not verified'
      });
    }

    const response: ContractDetails = {
      contractId: verificationData.contract_id,
      network: verificationData.network,
      verified: verificationData.verified,
      verifiedAt: verificationData.verified_at,
      verifiedBy: verificationData.verified_by,
      checks: verificationData.checks,
      wasmHash: verificationData.wasm_hash,
      wasmSize: verificationData.wasm_size,
      sourceHash: verificationData.source_hash,
      sourceFiles: verificationData.source_files,
      gitCommit: verificationData.git_commit,
      gitRemote: verificationData.git_remote,
      gitBranch: verificationData.git_branch,
      rustVersion: verificationData.rust_version,
      sorobanVersion: verificationData.soroban_version,
      contractName: verificationData.contract_name,
    };

    // Add metadata if available
    if (metadataData) {
      response.metadata = {
        name: metadataData.name,
        description: metadataData.description,
        logoUrl: metadataData.logo_url,
        websiteUrl: metadataData.website_url,
        documentationUrl: metadataData.documentation_url,
        auditReportUrl: metadataData.audit_report_url,
        license: metadataData.license,
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Contract details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update contract metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'testnet';
    
    const metadata = await request.json();

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Validate contract ID format
    if (contractId.length !== 56 || !contractId.startsWith('C')) {
      return NextResponse.json(
        { error: 'Invalid contract ID format' },
        { status: 400 }
      );
    }

    // Check if contract is verified (only verified contracts can have metadata updated)
    const { data: verificationData, error: verificationError } = await supabase
      .from('verified_contracts')
      .select('verified')
      .eq('contract_id', contractId)
      .eq('network', network)
      .single();

    if (verificationError || !verificationData || !verificationData.verified) {
      return NextResponse.json(
        { error: 'Only verified contracts can have metadata updated' },
        { status: 403 }
      );
    }

    // Update metadata
    const { data: updatedMetadata, error: updateError } = await supabase
      .from('contract_metadata')
      .upsert({
        contract_id: contractId,
        network,
        name: metadata.name,
        description: metadata.description,
        logo_url: metadata.logoUrl,
        website_url: metadata.websiteUrl,
        documentation_url: metadata.documentationUrl,
        audit_report_url: metadata.auditReportUrl,
        license: metadata.license,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'contract_id,network'
      })
      .select()
      .single();

    if (updateError) {
      console.error('Metadata update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metadata: updatedMetadata,
    });

  } catch (error) {
    console.error('Metadata update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
