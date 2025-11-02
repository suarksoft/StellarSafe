'use client';

import { useState } from 'react';
import * as React from 'react';
import { type Metadata } from 'next';

import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { PageIntro } from '@/components/PageIntro';
import { RootLayout } from '@/components/RootLayout';
import { Button } from '@/components/Button';
import { GridList, GridListItem } from '@/components/GridList';
import { SectionIntro } from '@/components/SectionIntro';

interface VerificationRequest {
  code: string;
  contractId: string;
  network: string;
  expiresAt: string;
}

interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
}

interface VerificationResult {
  success: boolean;
  verified: boolean;
  checks: VerificationCheck[];
  contractId: string;
  error?: string;
}

function VerificationSteps() {
  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <SectionIntro
        eyebrow="Nasıl Çalışır"
        title="Kontrat Onaylama Süreci"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Stellar akıllı kontratlarınızı 4 basit adımda onaylayın. 
          Kontratınızın gerçekliğini ve güvenliğini kanıtlayarak kullanıcılarınızın güvenini kazanın.
        </p>
      </SectionIntro>

      <GridList className="mt-16">
        <GridListItem title="1. Kontratı Yayınla">
          Soroban kontratınızı CLI araçlarını kullanarak Stellar ağına yayınlayın. 
          Kontrat ID&apos;nizi hazır bulundurun.
        </GridListItem>
        <GridListItem title="2. Kod Üret">
          Kontrat ID&apos;nizi ve ağı girin, sonra benzersiz 6 haneli doğrulama kodu oluşturun.
        </GridListItem>
        <GridListItem title="3. CLI Aracını Çalıştır">
          CLI aracımızı kullanarak kontratınızın kaynak kodunu, WASM binary&apos;sini 
          ve build bilgilerini gönderin.
        </GridListItem>
        <GridListItem title="4. Onaylanın">
          Doğrulama rozeti alın ve Stellar ekosistemindeki kullanıcılarla güven oluşturun.
        </GridListItem>
      </GridList>
    </Container>
  );
}

function VerificationForm() {
  const [contractId, setContractId] = useState('');
  const [network, setNetwork] = useState('testnet');
  const [loading, setLoading] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [polling, setPolling] = useState(false);

  const handleGenerateCode = async () => {
    // Validation
    if (!contractId.trim()) {
      setError('Please enter a contract ID');
      return;
    }

    // Validate contract ID format (should start with C and be 56 chars)
    const trimmedId = contractId.trim();
    if (!trimmedId.startsWith('C') || trimmedId.length !== 56) {
      setError('Invalid contract ID format. Must start with "C" and be 56 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verify/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: trimmedId,
          network,
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 404) {
          setError('Contract not found on Stellar network. Please verify the contract ID and network.');
          return;
        } else if (response.status === 429) {
          setError('Too many requests. Please wait a few minutes before trying again.');
          return;
        } else if (response.status === 500) {
          setError('Server error. Please try again later or contact support.');
          return;
        }
      }

      const data = await response.json();

      if (data.success) {
        setVerificationRequest({
          code: data.code,
          contractId: trimmedId,
          network,
          expiresAt: new Date(Date.now() + data.expiresIn * 1000).toISOString(),
        });
      } else {
        // Handle specific error messages from API
        const errorMessage = data.error || 'Failed to generate verification code';
        
        // Provide helpful context for common errors
        if (errorMessage.includes('not found')) {
          setError('Contract not found on Stellar network. Please check the contract ID and network selection.');
        } else if (errorMessage.includes('Invalid')) {
          setError(errorMessage);
        } else if (errorMessage.includes('Too many')) {
          setError('Rate limit exceeded. Please wait before requesting another code.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Verification code generation error:', err);
      
      // Determine error type
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the development server is running (npm run dev).');
      } else if (err instanceof SyntaxError) {
        setError('Invalid response from server. Please try again or contact support.');
      } else {
        setError('An unexpected error occurred. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationRequest(null);
    setVerificationResult(null);
    setContractId('');
    setError(null);
    setPolling(false);
  };

  // Poll for verification status
  const pollVerificationStatus = async (code: string) => {
    try {
      const response = await fetch(`/api/verify/status/${code}`);
      const data = await response.json();

      if (data.status === 'COMPLETED' && data.verified !== undefined) {
        setVerificationResult({
          success: true,
          verified: data.verified,
          checks: data.checks || [],
          contractId: data.contractId,
        });
        setPolling(false);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Status polling error:', err);
      return false;
    }
  };

  // Start polling when verification request is created
  React.useEffect(() => {
    if (verificationRequest && !verificationResult) {
      setPolling(true);
      const pollInterval = setInterval(async () => {
        const completed = await pollVerificationStatus(verificationRequest.code);
        if (completed) {
          clearInterval(pollInterval);
        }
      }, 3000); // Poll every 3 seconds

      // Stop polling after 10 minutes
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        setPolling(false);
      }, 10 * 60 * 1000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [verificationRequest, verificationResult]);

  // Show verification result if available
  if (verificationResult) {
    return (
      <Container className="mt-16">
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <div className={`rounded-3xl p-8 ${verificationResult.verified ? 'bg-green-50 ring-2 ring-green-200' : 'bg-yellow-50 ring-2 ring-yellow-200'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${verificationResult.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <svg className={`h-6 w-6 ${verificationResult.verified ? 'text-green-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    {verificationResult.verified ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${verificationResult.verified ? 'text-green-950' : 'text-yellow-950'}`}>
                    {verificationResult.verified ? '✓ Contract Verified Successfully!' : '⚠ Verification Completed with Issues'}
                  </h3>
                  <p className={`text-sm ${verificationResult.verified ? 'text-green-700' : 'text-yellow-700'}`}>
                    {verificationResult.verified ? 'Your contract has been verified and awarded a verified badge!' : 'Some verification checks did not pass.'}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-2xl bg-white p-6">
                <h4 className="font-semibold text-neutral-950 mb-4">Verification Checks:</h4>
                <div className="space-y-3">
                  {verificationResult.checks.map((check, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-0.5 ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {check.passed ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{check.name}</span>
                          <span className={`text-xs font-semibold ${check.passed ? 'text-green-700' : 'text-red-700'}`}>
                            {check.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleReset} className="flex-1">
                  Verify Another Contract
                </Button>
                {verificationResult.contractId && (
                  <Button 
                    href={`/contract/${verificationResult.contractId}`}
                    className="flex-1"
                    invert
                  >
                    View Contract Page
                  </Button>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    );
  }

  if (verificationRequest) {
    return (
      <Container className="mt-16">
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl bg-neutral-50 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-950">
                    Verification Code Generated
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Contract ID: {verificationRequest.contractId}
                  </p>
                </div>
              </div>

              <div className="mb-8 rounded-2xl bg-blue-50 border-2 border-blue-200 p-6 text-center">
                <div className="text-sm text-neutral-600 mb-2">Your Verification Code:</div>
                <div className="text-4xl font-mono font-bold text-blue-600 tracking-wider">
                  {verificationRequest.code}
                </div>
                <div className="text-sm text-neutral-500 mt-2">
                  Expires in 30 minutes
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-neutral-950 mb-3">Instructions:</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-2">
                        1. Navigate to your contract directory:
                      </p>
                      <div className="rounded-lg bg-neutral-900 p-3">
                        <code className="text-green-400 text-sm">cd my-contract</code>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 mb-2">
                        2. Run the verification command:
                      </p>
                      <div className="rounded-lg bg-neutral-900 p-3">
                        <code className="text-green-400 text-sm">
                          npx @devrunnel/stellarsafe-cli verify {verificationRequest.code}
                        </code>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 mb-2">
                        Or install globally:
                      </p>
                      <div className="rounded-lg bg-neutral-900 p-3 space-y-1">
                        <div><code className="text-green-400 text-sm">npm i -g @devrunnel/stellarsafe-cli</code></div>
                        <div><code className="text-green-400 text-sm">stellarsafe verify {verificationRequest.code}</code></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-6">
                  <h5 className="font-semibold text-blue-900 mb-4">📋 Gereksinimler:</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h6 className="font-medium text-blue-900">📁 Dosya Yapısı:</h6>
                      <ul className="space-y-1 text-blue-700">
                        <li>✓ Cargo.toml dosyası</li>
                        <li>✓ src/*.rs kaynak dosyaları</li>
                        <li>✓ target/wasm32-unknown-unknown/release/*.wasm</li>
                        <li>✓ .git/ klasörü (Git repository)</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h6 className="font-medium text-blue-900">🔧 Araçlar:</h6>
                      <ul className="space-y-1 text-blue-700">
                        <li>✓ Node.js (v14+)</li>
                        <li>✓ Rust & Cargo</li>
                        <li>✓ Soroban CLI</li>
                        <li>✓ Git</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-6">
                  <h5 className="font-semibold text-amber-900 mb-4">🔧 Yaygın Sorunlar:</h5>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium text-amber-900">❌ &quot;WASM file not found&quot;</p>
                      <p className="text-amber-700 mb-2">Çözüm: Contract&apos;ı build edin</p>
                      <div className="bg-neutral-900 rounded p-2">
                        <code className="text-green-400 text-xs">soroban contract build</code>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-amber-900">❌ &quot;Git repository required&quot;</p>
                      <p className="text-amber-700 mb-2">Çözüm: Git repository oluşturun</p>
                      <div className="bg-neutral-900 rounded p-2">
                        <code className="text-green-400 text-xs">git init && git add . && git commit -m &quot;Initial&quot;</code>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-amber-900">❌ &quot;Public source required&quot;</p>
                      <p className="text-amber-700 mb-2">Çözüm: GitHub&apos;da public repository oluşturun</p>
                      <div className="bg-neutral-900 rounded p-2">
                        <code className="text-green-400 text-xs">git remote add origin https://github.com/username/repo</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-neutral-50 border border-neutral-200 p-6">
                  <h5 className="font-semibold text-neutral-900 mb-4">📂 Örnek Contract Yapısı:</h5>
                  
                  <div className="bg-neutral-900 rounded p-4 text-xs font-mono overflow-x-auto">
                    <div className="text-blue-400">my-soroban-contract/</div>
                    <div className="ml-4 text-white">├── Cargo.toml</div>
                    <div className="ml-4 text-white">├── src/</div>
                    <div className="ml-8 text-white">│   ├── lib.rs</div>
                    <div className="ml-8 text-white">│   └── contract.rs</div>
                    <div className="ml-4 text-white">├── target/</div>
                    <div className="ml-8 text-white">│   └── wasm32-unknown-unknown/</div>
                    <div className="ml-12 text-white">│       └── release/</div>
                    <div className="ml-16 text-green-400">│           └── my_contract.wasm ← Bu dosya gerekli</div>
                    <div className="ml-4 text-white">├── .git/ ← Git repository gerekli</div>
                    <div className="ml-4 text-white">└── README.md</div>
                  </div>
                  
                  <p className="text-xs text-neutral-600 mt-3">
                    💡 CLI bu yapıyı arar ve otomatik olarak gerekli bilgileri toplar
                  </p>
                </div>

                <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {polling ? (
                      <svg className="animate-spin h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-semibold text-yellow-800">
                      {polling ? 'Waiting for verification...' : 'Waiting for verification data...'}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Run the command above to complete verification. The page will update automatically once verification is complete.
                  </p>
                  {polling && (
                    <p className="text-xs text-yellow-600 mt-2">
                      ⏳ Checking status every 3 seconds...
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleReset} className="flex-1">
                    Verify Another Contract
                  </Button>
                  <Button 
                    href={`/contract/${verificationRequest.contractId}`}
                    className="flex-1"
                    invert
                  >
                    View Contract Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    );
  }

  return (
    <Container className="mt-16">
      <FadeIn>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-neutral-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-2.25 0L21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-950">
                  Kontratınızı Onaylayın
                </h3>
                <p className="text-sm text-neutral-600">
                  Soroban akıllı kontratınızı doğrulayarak güven oluşturun
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 mb-1">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                    
                    {error.includes('development server') && (
                      <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                        <p className="text-xs font-semibold text-red-800 mb-1">Quick Fix:</p>
                        <code className="text-xs text-red-900 bg-white px-2 py-1 rounded block">
                          cd frontend && npm run dev
                        </code>
                      </div>
                    )}
                    
                    {error.includes('Invalid contract ID format') && (
                      <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                        <p className="text-xs font-semibold text-red-800 mb-1">Example valid Contract ID:</p>
                        <code className="text-xs text-red-900 bg-white px-2 py-1 rounded block">
                          CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
                        </code>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                    aria-label="Dismiss error"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="contractId" className="block text-sm font-medium text-neutral-950 mb-2">
                  Kontrat ID
                </label>
                <input
                  type="text"
                  id="contractId"
                  placeholder="CABCDEF123456789..."
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Yayınlanan Soroban kontrat ID&apos;nizi girin
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-950 mb-3">
                  Ağ
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="testnet"
                      checked={network === 'testnet'}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-neutral-700">Testnet</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="public"
                      checked={network === 'public'}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-neutral-700">Mainnet</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleGenerateCode}
                disabled={!contractId.trim() || loading}
                className="w-full py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Doğrulama Kodu Oluştur'
                )}
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
}

function CLIInstallation() {
  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <SectionIntro
        eyebrow="CLI Aracı"
        title="StellarSafe CLI"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Komut satırı aracımız kontrat doğrulamasını sorunsuz hale getirir. 
          Bir kez kurun ve istediğiniz kadar kontrat doğrulayın.
        </p>
      </SectionIntro>

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <FadeIn>
          <div className="rounded-3xl bg-neutral-50 p-8">
            <h3 className="text-lg font-semibold text-neutral-950 mb-4">
              Hızlı Kurulum
            </h3>
            <div className="rounded-lg bg-neutral-900 p-4 mb-4">
              <code className="text-green-400 text-sm">
                npm install -g @stellarsafe/cli
              </code>
            </div>
            <p className="text-sm text-neutral-600">
              Global olarak kurun ve <code className="text-neutral-800 bg-neutral-200 px-1 rounded">stellarsafe</code> komutunu 
              her yerden kullanın.
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="rounded-3xl bg-neutral-50 p-8">
            <h3 className="text-lg font-semibold text-neutral-950 mb-4">
              Tek Kullanım
            </h3>
            <div className="rounded-lg bg-neutral-900 p-4 mb-4">
              <code className="text-green-400 text-sm">
                npx @stellarsafe/cli verify CODE
              </code>
            </div>
            <p className="text-sm text-neutral-600">
              Kurmadan kullanın. CI/CD pipeline&apos;ları ve tek seferlik doğrulamalar için ideal.
            </p>
          </div>
        </FadeIn>
      </div>

      <FadeIn>
        <div className="mt-8 rounded-3xl bg-blue-50 border border-blue-200 p-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            CLI neyi kontrol eder:
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-800">WASM bytecode eşleşmesi</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-800">Kaynak kod erişilebilirliği</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-800">Build ortamı</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-800">Git repository bilgisi</span>
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
}

export default function DeveloperPage() {
  return (
    <RootLayout>
      <PageIntro 
        eyebrow="Contract Verification" 
        title="Stellar Kontrat Onaylama Merkezi"
        centered
      >
        <p>
          Stellar ekosisteminde güveni artırın. Soroban akıllı kontratlarınızın 
          doğruluğunu kanıtlayın ve kullanıcılarınıza kodunuzun güvenilir olduğunu gösterin.
        </p>
      </PageIntro>

      <VerificationForm />
      <VerificationSteps />
      <CLIInstallation />
    </RootLayout>
  );
}