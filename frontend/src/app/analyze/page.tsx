'use client';

import { useState } from 'react';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { RootLayout } from '@/components/RootLayout';
import { PageIntro } from '@/components/PageIntro';
import { RiskBadge } from '@/components/analysis/RiskBadge';
import { ThreatCard } from '@/components/analysis/ThreatCard';
import { AssetAnalysis } from '@/lib/analyzer/types';

export default function AnalyzePage() {
  const [assetCode, setAssetCode] = useState('');
  const [issuerAddress, setIssuerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AssetAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!assetCode || !issuerAddress) {
      setError('Please enter both asset code and issuer address');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze/asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetCode,
          issuerAddress,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Test examples
  const examples = [
    {
      name: 'Circle USDC (Safe)',
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    },
    {
      name: 'AQUA Token',
      code: 'AQUA',
      issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
    },
  ];

  return (
    <RootLayout>
      <PageIntro eyebrow="Security Analysis" title="Asset Risk Analyzer">
        <p>
          Analyze any Stellar asset for security risks before you trust it. We check
          flags, verify issuers, and warn you about potential threats.
        </p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>

          {/* Input Form */}
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl bg-neutral-50 p-8 ring-1 ring-neutral-950/5">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-950 mb-3">
                    Asset Code
                  </label>
                  <input
                    type="text"
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
                    placeholder="e.g., USDC, AQUA, BTC"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-950 shadow-sm transition focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10"
                    maxLength={12}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-950 mb-3">
                    Issuer Address
                  </label>
                  <input
                    type="text"
                    value={issuerAddress}
                    onChange={(e) => setIssuerAddress(e.target.value)}
                    placeholder="G..."
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-950 shadow-sm font-mono text-sm transition focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full rounded-full bg-neutral-950 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyzing...' : 'Analyze Asset'}
                </button>
              </div>

              {/* Quick Examples */}
              <div className="mt-8 pt-8 border-t border-neutral-950/10">
                <p className="text-sm font-semibold text-neutral-950 mb-4">Quick Examples:</p>
                <div className="flex flex-wrap gap-3">
                  {examples.map((example) => (
                    <button
                      key={example.name}
                      onClick={() => {
                        setAssetCode(example.code);
                        setIssuerAddress(example.issuer);
                      }}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 ring-1 ring-inset ring-neutral-950/10 transition hover:bg-neutral-50"
                    >
                      {example.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-auto max-w-2xl mt-12">
              <div className="rounded-3xl bg-red-50 p-6 ring-1 ring-red-200">
                <p className="text-red-900 font-semibold">Error: {error}</p>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && (
            <div className="mx-auto max-w-4xl mt-24">
              <div className="rounded-3xl bg-white p-12 ring-1 ring-neutral-950/5 shadow-xl">
                {/* Header */}
                <div className="text-center mb-12 pb-12 border-b border-neutral-950/10">
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <h2 className="font-display text-4xl font-semibold text-neutral-950">
                      {analysis.assetCode}
                    </h2>
                    <RiskBadge level={analysis.riskLevel} score={analysis.riskScore} size="lg" />
                  </div>
                  <p className="text-sm text-neutral-600 font-mono break-all">{analysis.issuerAddress}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-6 mb-12">
                  <div className="rounded-2xl bg-neutral-50 p-6 ring-1 ring-neutral-950/5">
                    <p className="text-sm font-semibold text-neutral-600 mb-2">Home Domain</p>
                    <p className="font-medium text-neutral-950">
                      {analysis.metadata.homeDomain || 'None'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-6 ring-1 ring-neutral-950/5">
                    <p className="text-sm font-semibold text-neutral-600 mb-2">Account Age</p>
                    <p className="font-medium text-neutral-950">
                      {analysis.metadata.accountAge} days
                    </p>
                  </div>
                </div>

                {/* Flags */}
                <div className="mb-12">
                  <h3 className="font-display text-xl font-semibold text-neutral-950 mb-6">Asset Flags</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(analysis.metadata.flags).map(([flag, enabled]) => (
                      <span
                        key={flag}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
                          enabled
                            ? 'bg-red-50 text-red-900 ring-red-600/20'
                            : 'bg-green-50 text-green-900 ring-green-600/20'
                        }`}
                      >
                        {flag.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Threats */}
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

                {/* Analyzed At */}
                <div className="mt-8 pt-8 border-t border-neutral-950/10 text-center">
                  <p className="text-sm text-neutral-600">
                    Analyzed at: {new Date(analysis.analyzedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </FadeIn>
      </Container>
    </RootLayout>
  );
}
