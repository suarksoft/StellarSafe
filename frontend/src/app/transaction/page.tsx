'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/RootLayout';
import { PageIntro } from '@/components/PageIntro';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { Button } from '@/components/Button';
import { RiskBadge } from '@/components/analysis/RiskBadge';
import { ThreatCard } from '@/components/analysis/ThreatCard';
import { TransactionAnalysis } from '@/lib/transaction/types';

export default function TransactionAnalyzePage() {
  const [xdrInput, setXdrInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [inputMode, setInputMode] = useState<'xdr' | 'hash'>('xdr');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          inputMode === 'xdr' ? { xdr: xdrInput } : { hash: hashInput }
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <RootLayout>
      <PageIntro eyebrow="Transaction Analysis" title="Analyze Stellar Transactions">
        <p>
          Decode and analyze Stellar transactions before signing. Detect risky operations,
          verify destinations, and understand what your transaction will do.
        </p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          {/* Input Mode Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputMode('xdr')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                inputMode === 'xdr'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Transaction XDR
            </button>
            <button
              onClick={() => setInputMode('hash')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                inputMode === 'hash'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Transaction Hash
            </button>
          </div>

          {/* Input Form */}
          <div className="rounded-3xl bg-neutral-50 p-8 ring-1 ring-neutral-950/5">
            {inputMode === 'xdr' ? (
              <div>
                <label className="block text-sm font-semibold text-neutral-950 mb-2">
                  Transaction XDR (Base64)
                </label>
                <textarea
                  value={xdrInput}
                  onChange={(e) => setXdrInput(e.target.value)}
                  placeholder="Paste transaction XDR here..."
                  rows={6}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm font-mono focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-neutral-950 mb-2">
                  Transaction Hash
                </label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter transaction hash..."
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm font-mono focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5"
                />
                <p className="mt-2 text-xs text-neutral-600">
                  Fetches transaction from {process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet' ? 'Testnet' : 'Mainnet'}
                </p>
              </div>
            )}

            {/* Example Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setInputMode('hash');
                  setHashInput('a1b2c3d4e5f6'); // Example testnet tx
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold"
              >
                Load Example Transaction
              </button>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (inputMode === 'xdr' ? !xdrInput : !hashInput)}
              className="mt-6"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Transaction'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-8 rounded-3xl bg-red-50 p-6 ring-1 ring-red-600/20">
              <p className="text-sm font-semibold text-red-900">Error: {error}</p>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="mt-12 space-y-8">
              {/* Risk Overview */}
              <div className="rounded-3xl bg-neutral-50 p-8 ring-1 ring-neutral-950/5">
                <h2 className="text-2xl font-display font-semibold text-neutral-950 mb-6">
                  Risk Assessment
                </h2>
                
                <div className="flex items-center gap-4 mb-8">
                  <RiskBadge
                    level={analysis.overallRisk.level}
                    score={analysis.overallRisk.score}
                    size="lg"
                  />
                </div>

                {/* Transaction Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-neutral-950">Source Account:</span>
                    <p className="font-mono text-neutral-600 break-all">{analysis.source}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-950">Fee:</span>
                    <p className="text-neutral-600">{analysis.fee} stroops</p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-950">Operations:</span>
                    <p className="text-neutral-600">{analysis.metadata.operationCount}</p>
                  </div>
                  {analysis.transactionHash && (
                    <div>
                      <span className="font-semibold text-neutral-950">Transaction Hash:</span>
                      <p className="font-mono text-neutral-600 break-all text-xs">{analysis.transactionHash}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Operations List */}
              <div className="rounded-3xl bg-neutral-50 p-8 ring-1 ring-neutral-950/5">
                <h3 className="text-xl font-display font-semibold text-neutral-950 mb-6">
                  Operations ({analysis.operations.length})
                </h3>
                
                <div className="space-y-4">
                  {analysis.operations.map((operation, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-white p-6 ring-1 ring-neutral-950/5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-neutral-950">
                            {index + 1}. {operation.type.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          {operation.sourceAccount && (
                            <p className="text-xs font-mono text-neutral-600 mt-1">
                              {operation.sourceAccount}
                            </p>
                          )}
                        </div>
                        <RiskBadge
                          level={operation.riskLevel}
                          score={0}
                          size="sm"
                          showScore={false}
                        />
                      </div>

                      {/* Operation Details */}
                      <div className="space-y-2 text-sm">
                        {operation.destination && (
                          <div>
                            <span className="font-semibold text-neutral-950">Destination:</span>
                            <p className="font-mono text-neutral-600 break-all">{operation.destination}</p>
                          </div>
                        )}
                        {operation.asset && (
                          <div>
                            <span className="font-semibold text-neutral-950">Asset:</span>
                            <p className="text-neutral-600">
                              {operation.asset.code}
                              {operation.asset.issuer !== 'native' && (
                                <span className="text-xs text-neutral-500 ml-2">
                                  (Issuer: {operation.asset.issuer.slice(0, 8)}...)
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                        {operation.amount && (
                          <div>
                            <span className="font-semibold text-neutral-950">Amount:</span>
                            <p className="text-neutral-600">{operation.amount}</p>
                          </div>
                        )}
                      </div>

                      {/* Operation Threats */}
                      {operation.threats.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-neutral-200">
                          <p className="text-xs font-semibold text-neutral-950 mb-2">
                            Threats for this operation:
                          </p>
                          <div className="space-y-2">
                            {operation.threats.map((threat, threatIndex) => (
                              <div
                                key={threatIndex}
                                className="text-xs rounded-lg bg-red-50 p-3 ring-1 ring-red-600/20"
                              >
                                <p className="font-semibold text-red-900">{threat.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Threats */}
              {analysis.threats.length > 0 && (
                <div>
                  <h3 className="text-xl font-display font-semibold text-neutral-950 mb-4">
                    Detected Threats
                  </h3>
                  <div className="space-y-3">
                    {analysis.threats.map((threat, index) => (
                      <ThreatCard key={index} threat={threat} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xl font-display font-semibold text-neutral-950 mb-4">
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-neutral-600">• {recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </FadeIn>
      </Container>
    </RootLayout>
  );
}
