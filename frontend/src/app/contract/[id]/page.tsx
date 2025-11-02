'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ContactSection } from '@/components/ContactSection';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { PageIntro } from '@/components/PageIntro';
import { RootLayout } from '@/components/RootLayout';
import { Button } from '@/components/Button';

interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
}

interface ContractDetails {
  contractId: string;
  network: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  checks?: VerificationCheck[];
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function VerificationBadge({ contract }: { contract: ContractDetails }) {
  if (contract.verified) {
    return (
      <div className="rounded-3xl bg-green-50 border-2 border-green-200 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-800">
              ✅ VERIFIED CONTRACT
            </h2>
            <p className="text-green-600">
              Verified {contract.verifiedAt ? formatDate(contract.verifiedAt) : 'recently'} by {contract.verifiedBy || 'StellarSafe'}
            </p>
          </div>
        </div>

        {contract.checks && (
          <div className="space-y-3">
            <h3 className="font-semibold text-green-800 mb-3">Verification Details:</h3>
            {contract.checks.map((check, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="text-lg">
                  {check.passed ? '✅' : '❌'}
                </div>
                <div className="text-sm text-green-700">
                  {check.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-red-50 border-2 border-red-200 p-8 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-red-800">
            ❌ VERIFICATION FAILED
          </h2>
          <p className="text-red-600">
            This contract could not be verified or has failed verification checks
          </p>
        </div>
      </div>

      {contract.checks && (
        <div className="space-y-3">
          <h3 className="font-semibold text-red-800 mb-3">Issues Found:</h3>
          {contract.checks.map((check, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="text-lg">
                {check.passed ? '✅' : '❌'}
              </div>
              <div className="text-sm text-red-700">
                {check.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TechnicalDetails({ contract }: { contract: ContractDetails }) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-neutral-950 mb-6">Technical Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-neutral-50 p-6">
          <div className="text-sm font-medium text-neutral-600 mb-2">WASM Hash</div>
          <div className="font-mono text-xs break-all text-neutral-900">
            {contract.wasmHash || 'Not available'}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-6">
          <div className="text-sm font-medium text-neutral-600 mb-2">Source Hash</div>
          <div className="font-mono text-xs break-all text-neutral-900">
            {contract.sourceHash || 'Not available'}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-6">
          <div className="text-sm font-medium text-neutral-600 mb-2">WASM Size</div>
          <div className="text-sm text-neutral-900">
            {contract.wasmSize ? formatBytes(contract.wasmSize) : 'Not available'}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-6">
          <div className="text-sm font-medium text-neutral-600 mb-2">Source Files</div>
          <div className="text-sm text-neutral-900">
            {contract.sourceFiles ? `${contract.sourceFiles.length} files` : 'Not available'}
          </div>
        </div>

        {contract.gitCommit && (
          <div className="rounded-2xl bg-neutral-50 p-6">
            <div className="text-sm font-medium text-neutral-600 mb-2">Git Commit</div>
            <div className="font-mono text-sm text-neutral-900">
              {contract.gitCommit.substring(0, 8)}
            </div>
          </div>
        )}

        {contract.gitBranch && (
          <div className="rounded-2xl bg-neutral-50 p-6">
            <div className="text-sm font-medium text-neutral-600 mb-2">Git Branch</div>
            <div className="text-sm text-neutral-900">
              {contract.gitBranch}
            </div>
          </div>
        )}

        {contract.rustVersion && (
          <div className="rounded-2xl bg-neutral-50 p-6">
            <div className="text-sm font-medium text-neutral-600 mb-2">Rust Version</div>
            <div className="text-sm text-neutral-900">
              {contract.rustVersion}
            </div>
          </div>
        )}

        {contract.sorobanVersion && (
          <div className="rounded-2xl bg-neutral-50 p-6">
            <div className="text-sm font-medium text-neutral-600 mb-2">Soroban Version</div>
            <div className="text-sm text-neutral-900">
              {contract.sorobanVersion}
            </div>
          </div>
        )}
      </div>

      {contract.sourceFiles && contract.sourceFiles.length > 0 && (
        <div className="mt-6 rounded-2xl bg-neutral-50 p-6">
          <div className="text-sm font-medium text-neutral-600 mb-3">Source Files</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {contract.sourceFiles.map((file, index) => (
              <div key={index} className="text-xs font-mono text-neutral-700 bg-white px-2 py-1 rounded">
                {file}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContractLinks({ contract }: { contract: ContractDetails }) {
  const horizonUrl = contract.network === 'testnet' 
    ? 'https://horizon-testnet.stellar.org'
    : 'https://horizon.stellar.org';
  
  const stellarExpertUrl = `https://stellar.expert/explorer/${contract.network}/contract/${contract.contractId}`;

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4">
      {contract.gitRemote && (
        <Button
          href={contract.gitRemote}
          className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View Source Code
          </span>
        </Button>
      )}
      
      <Button
        href={stellarExpertUrl}
        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          View on Stellar Expert
        </span>
      </Button>

      {contract.metadata?.websiteUrl && (
        <Button
          href={contract.metadata.websiteUrl}
          className="flex-1 bg-green-600 text-white hover:bg-green-700"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
            </svg>
            Visit Website
          </span>
        </Button>
      )}
    </div>
  );
}

export default function ContractPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contractId = params.id as string;
  const network = searchParams.get('network') || 'testnet';
  
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContractDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/contract/${contractId}?network=${network}`);
        const data = await response.json();

        if (response.ok) {
          setContract(data);
        } else {
          setError(data.error || 'Failed to fetch contract details');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (contractId) {
      fetchContractDetails();
    }
  }, [contractId, network]);

  if (loading) {
    return (
      <RootLayout>
        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg text-neutral-600">Loading contract details...</span>
            </div>
          </div>
        </Container>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <div className="text-center py-12">
            <div className="rounded-3xl bg-red-50 border border-red-200 p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <h2 className="text-xl font-semibold text-red-800">Error Loading Contract</h2>
              </div>
              <p className="text-red-600 mb-6">{error}</p>
              <Button href="/developer" className="bg-blue-600 text-white hover:bg-blue-700">
                Verify a Contract
              </Button>
            </div>
          </div>
        </Container>
      </RootLayout>
    );
  }

  if (!contract) {
    return (
      <RootLayout>
        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <div className="text-center py-12">
            <div className="rounded-3xl bg-neutral-50 border border-neutral-200 p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Contract Not Found</h2>
              <p className="text-neutral-600 mb-6">
                This contract has not been verified yet or does not exist.
              </p>
              <Button href="/developer" className="bg-blue-600 text-white hover:bg-blue-700">
                Verify This Contract
              </Button>
            </div>
          </div>
        </Container>
      </RootLayout>
    );
  }

  const displayName = contract.metadata?.name || contract.contractName || 'Smart Contract';
  const description = contract.metadata?.description || 'A Soroban smart contract on the Stellar network.';

  return (
    <RootLayout>
      <PageIntro 
        eyebrow={`${network.charAt(0).toUpperCase() + network.slice(1)} Contract`}
        title={displayName}
      >
        <p>{description}</p>
        <div className="mt-4 font-mono text-sm text-neutral-600 break-all">
          {contract.contractId}
        </div>
      </PageIntro>

      <Container className="mt-16">
        <FadeIn>
          <VerificationBadge contract={contract} />
          <TechnicalDetails contract={contract} />
          <ContractLinks contract={contract} />
        </FadeIn>
      </Container>

      <ContactSection />
    </RootLayout>
  );
}
