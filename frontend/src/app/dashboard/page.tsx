'use client';

import { useState, useEffect } from 'react';
import { RootLayout } from '@/components/RootLayout';
import { PageIntro } from '@/components/PageIntro';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { Button } from '@/components/Button';
import { RiskBadge } from '@/components/analysis/RiskBadge';
import { PortfolioAnalysis } from '@/lib/portfolio/scanner';
import { assetDatabase } from '@/lib/database/asset-service';
import { AnalysisHistory } from '@/lib/database/supabase';

export default function DashboardPage() {
  const [accountId, setAccountId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisHistory[]>([]);
  const [stats, setStats] = useState({ verifiedCount: 0, blacklistedCount: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyses, assetStats] = await Promise.all([
        assetDatabase.getRecentAnalyses(10),
        assetDatabase.getAssetStats(),
      ]);
      setRecentAnalyses(analyses);
      setStats(assetStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleScanPortfolio = async () => {
    if (!accountId.trim()) return;

    setIsScanning(true);
    setError(null);
    setPortfolio(null);

    try {
      const response = await fetch('/api/portfolio/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: accountId.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Scan failed');
      }

      const result = await response.json();
      setPortfolio(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Portfolio scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExampleAccount = () => {
    // Example Stellar testnet account with assets
    setAccountId('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H');
    setTimeout(() => {
      const button = document.querySelector('button[type="button"]') as HTMLButtonElement;
      button?.click();
    }, 100);
  };

  return (
    <RootLayout>
      <PageIntro eyebrow="Dashboard" title="Security Dashboard">
        <p>
          Monitor your Stellar portfolio, scan for risky assets, and track
          security analysis history.
        </p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
            <div className="rounded-3xl bg-green-50 p-6 ring-1 ring-green-600/20">
              <div className="text-3xl font-bold text-green-900 mb-2">
                {stats.verifiedCount}
              </div>
              <div className="text-sm font-semibold text-green-700">
                Verified Assets in Database
              </div>
            </div>

            <div className="rounded-3xl bg-red-50 p-6 ring-1 ring-red-600/20">
              <div className="text-3xl font-bold text-red-900 mb-2">
                {stats.blacklistedCount}
              </div>
              <div className="text-sm font-semibold text-red-700">
                Known Scam Assets
              </div>
            </div>

            <div className="rounded-3xl bg-blue-50 p-6 ring-1 ring-blue-600/20">
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {recentAnalyses.length}
              </div>
              <div className="text-sm font-semibold text-blue-700">
                Recent Analyses
              </div>
            </div>
          </div>

          {/* Portfolio Scanner */}
          <div className="rounded-3xl bg-neutral-50 p-8 ring-1 ring-neutral-950/5 mb-12">
            <h2 className="text-2xl font-display font-semibold text-neutral-950 mb-4">
              Scan Your Portfolio
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              Enter your Stellar account address to analyze all assets in your portfolio
              and identify potential risks.
            </p>

            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter Stellar account address (G...)"
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 text-sm font-mono focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5"
              />
              <Button
                onClick={handleScanPortfolio}
                disabled={isScanning || !accountId.trim()}
              >
                {isScanning ? 'Scanning...' : 'Scan Portfolio'}
              </Button>
            </div>

            <button
              onClick={handleExampleAccount}
              className="text-xs text-blue-600 hover:underline"
            >
              Try example account
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-3xl bg-red-50 p-6 ring-1 ring-red-600/20 mb-12">
              <p className="text-sm font-semibold text-red-900">Error: {error}</p>
            </div>
          )}

          {/* Portfolio Results */}
          {portfolio && (
            <div className="space-y-8 mb-12">
              {/* Portfolio Overview */}
              <div className="rounded-3xl bg-neutral-50 p-8 ring-1 ring-neutral-950/5">
                <h3 className="text-xl font-display font-semibold text-neutral-950 mb-6">
                  Portfolio Overview
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  <RiskBadge
                    level={portfolio.overallRisk.level}
                    score={portfolio.overallRisk.score}
                    size="lg"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-neutral-950">Total Assets:</span>
                    <p className="text-neutral-600">{portfolio.totalAssets}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-950">XLM Balance:</span>
                    <p className="text-neutral-600">{parseFloat(portfolio.xlmBalance).toFixed(2)} XLM</p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-950">High Risk:</span>
                    <p className="text-red-600 font-semibold">{portfolio.overallRisk.highRiskCount}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-950">Safe Assets:</span>
                    <p className="text-green-600 font-semibold">{portfolio.overallRisk.safeCount}</p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {portfolio.warnings.length > 0 && (
                <div className="rounded-3xl bg-red-50 p-6 ring-1 ring-red-600/20">
                  <h3 className="text-lg font-display font-semibold text-red-950 mb-4">
                    Security Warnings
                  </h3>
                  <ul className="space-y-2">
                    {portfolio.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-900">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assets List */}
              <div>
                <h3 className="text-xl font-display font-semibold text-neutral-950 mb-4">
                  Assets ({portfolio.assets.length})
                </h3>
                <div className="space-y-3">
                  {portfolio.assets.map((asset, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-neutral-50 p-6 ring-1 ring-neutral-950/5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-neutral-950">
                              {asset.asset_code}
                            </h4>
                            <RiskBadge
                              level={asset.riskLevel}
                              score={asset.riskScore}
                              size="sm"
                              showScore={false}
                            />
                            {asset.isVerified && (
                              <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                            {asset.isBlacklisted && (
                              <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-red-600 text-white">
                                BLACKLISTED
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-neutral-950">
                            {parseFloat(asset.balance).toFixed(2)}
                          </p>
                          <p className="text-xs text-neutral-600">{asset.asset_code}</p>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="font-semibold text-neutral-950">Issuer:</span>
                        <p className="font-mono text-neutral-600 break-all">
                          {asset.asset_issuer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h3 className="text-xl font-display font-semibold text-neutral-950 mb-4">
              Recent Analysis History
            </h3>
            {recentAnalyses.length === 0 ? (
              <div className="rounded-3xl bg-neutral-50 p-12 ring-1 ring-neutral-950/5 text-center">
                <p className="text-neutral-600">
                  No analysis history yet. Start by analyzing assets or transactions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-950/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-semibold text-neutral-950 uppercase">
                            {analysis.analysis_type}
                          </span>
                          <RiskBadge
                            level={analysis.risk_level}
                            score={analysis.risk_score}
                            size="sm"
                            showScore={false}
                          />
                        </div>
                        <p className="text-xs text-neutral-600">
                          {analysis.asset_code
                            ? `${analysis.asset_code} asset`
                            : analysis.transaction_hash
                            ? 'Transaction'
                            : 'Unknown'}
                          {' • '}
                          {analysis.threats_count} threat(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-600">
                          {new Date(analysis.analyzed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </Container>
    </RootLayout>
  );
}