'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { PageIntro } from '@/components/PageIntro';
import { Button } from '@/components/Button';

interface WalletInfo {
  publicKey: string;
  network: string;
  name: string;
}

interface PortfolioData {
  securityScore: number;
  totalAssets: number;
  riskyAssets: number;
  recentTransactions: number;
  assets: Array<{
    code: string;
    issuer?: string;
    balance: string;
    riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for connected wallet
    const savedWallet = localStorage.getItem('stellarsafe_wallet');
    if (savedWallet) {
      const walletInfo = JSON.parse(savedWallet);
      setWallet(walletInfo);
      loadPortfolio(walletInfo.publicKey);
    } else {
      setLoading(false);
    }
  }, []);

  const loadPortfolio = async (publicKey: string) => {
    try {
      const response = await fetch('/api/portfolio/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: publicKey }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Mock portfolio data for now
        setPortfolio({
          securityScore: 85,
          totalAssets: 5,
          riskyAssets: 1,
          recentTransactions: 12,
          assets: [
            { code: 'XLM', balance: '1,247.50', riskLevel: 'SAFE' },
            { code: 'USDC', issuer: 'GA5ZSE...', balance: '500.00', riskLevel: 'SAFE' },
            { code: 'AQUA', issuer: 'GBNZIL...', balance: '10,000.00', riskLevel: 'LOW' },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (level: string) => {
    const colors = {
      SAFE: 'bg-green-100 text-green-800',
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.MEDIUM;
  };

  if (loading) {
    return (
      <>
        <PageIntro eyebrow="Dashboard" title="Loading Your Portfolio">
          <p>Analyzing your Stellar assets and transactions...</p>
        </PageIntro>
        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <FadeIn>
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-neutral-200 border-t-neutral-950 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading portfolio...</p>
            </div>
          </FadeIn>
        </Container>
      </>
    );
  }

  if (!wallet) {
    return (
      <>
        <PageIntro eyebrow="Dashboard" title="Wallet Not Connected">
          <p>Please connect your wallet to view your security dashboard.</p>
        </PageIntro>
        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <FadeIn>
            <div className="text-center">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-4xl">🔗</span>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-950 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-neutral-600 mb-8">
                Connect your Stellar wallet to start monitoring your portfolio security.
              </p>
              <Button href="/connect-wallet">
                Connect Wallet
              </Button>
            </div>
          </FadeIn>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageIntro eyebrow="Security Dashboard" title="Your Portfolio">
        <p>
          Real-time security monitoring for your Stellar assets and transactions.
        </p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          {/* Wallet Info */}
          <div className="mb-16 p-6 bg-neutral-50 rounded-3xl ring-1 ring-neutral-950/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-950">Connected Wallet</h3>
                <p className="text-sm text-neutral-600 font-mono mt-1">
                  {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-8)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {wallet.name} • {wallet.network}
                </p>
              </div>
              <Button variant="outline" href="/connect-wallet">
                Switch Wallet
              </Button>
            </div>
          </div>

          {portfolio && (
            <>
              {/* Security Score */}
              <div className="mb-16">
                <div className="bg-white rounded-3xl p-12 ring-1 ring-neutral-950/5 shadow-lg text-center">
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(portfolio.securityScore / 100) * 314} 314`}
                        className={getSecurityScoreColor(portfolio.securityScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getSecurityScoreColor(portfolio.securityScore)}`}>
                          {portfolio.securityScore}
                        </div>
                        <div className="text-xs text-neutral-500">SECURITY</div>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-semibold text-neutral-950 mb-2">
                    Portfolio Security Score
                  </h2>
                  <p className="text-neutral-600 mb-8">
                    Your portfolio has been analyzed for security risks
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-2xl font-bold text-neutral-950">{portfolio.totalAssets}</div>
                      <div className="text-sm text-neutral-600">Total Assets</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{portfolio.riskyAssets}</div>
                      <div className="text-sm text-neutral-600">Risky Assets</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-950">{portfolio.recentTransactions}</div>
                      <div className="text-sm text-neutral-600">Protected Transactions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Holdings */}
              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-neutral-950 mb-8">Your Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.assets.map((asset, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 ring-1 ring-neutral-950/5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-neutral-950">{asset.code}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(asset.riskLevel)}`}>
                          {asset.riskLevel}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">Balance:</span>
                          <span className="text-sm font-semibold text-neutral-950">{asset.balance}</span>
                        </div>
                        
                        {asset.issuer && (
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600">Issuer:</span>
                            <span className="text-xs font-mono text-neutral-500">
                              {asset.issuer.slice(0, 8)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-neutral-950 mb-8">Quick Actions</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button href="/analyze">
                    Analyze Asset
                  </Button>
                  <Button href="/demo" variant="outline">
                    Test Security
                  </Button>
                  <Button href="/assets" variant="outline">
                    Browse Assets
                  </Button>
                </div>
              </div>
            </>
          )}
        </FadeIn>
      </Container>
    </>
  );
}