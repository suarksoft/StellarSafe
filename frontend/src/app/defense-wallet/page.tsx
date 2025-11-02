'use client';

import React from 'react';
import { RootLayout } from '@/components/RootLayout';
import { Container } from '@/components/Container';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { useEnhancedPortfolio } from '@/hooks/useEnhancedPortfolio';
import { WalletConnectModal } from '@/components/WalletConnectModal';
import { SendAssetModal } from '@/components/wallet/SendAssetModal';
import { ReceiveAssetModal } from '@/components/wallet/ReceiveAssetModal';
import { SwapAssetModal } from '@/components/wallet/SwapAssetModal';
import { useState } from 'react';

const DefenseWallet = () => {
  const { wallet, isConnected, isConnecting } = useWalletConnect();
  const { data, isLoading, error, refresh, lastUpdated } = useEnhancedPortfolio();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('Wallet connection state:', { isConnected, wallet, isConnecting });
    if (data) {
      console.log('Enhanced portfolio data:', data);
    }
  }, [isConnected, wallet, isConnecting, data]);

  if (!isConnected && !isConnecting) {
    return (
      <RootLayout>
        <Container className="py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-neutral-100 border-2 border-neutral-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-neutral-950 mb-4">
              Defense Wallet
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Connect your Stellar wallet to monitor your portfolio security, 
              detect threats, and protect your assets in real-time.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="bg-neutral-950 text-white px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Connect Wallet
            </button>
          </div>
        </Container>
        
        <WalletConnectModal 
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
        />
      </RootLayout>
    );
  }

  if (isLoading) {
    return (
      <RootLayout>
        <Container className="py-12">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-neutral-200 rounded-2xl"></div>
                <div className="h-96 bg-neutral-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </Container>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <Container className="py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-neutral-100 border-2 border-neutral-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-950 mb-4">
              Error Loading Portfolio
            </h1>
            <p className="text-neutral-600 mb-8">{error}</p>
            <button
              onClick={refresh}
              className="bg-neutral-950 text-white px-6 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </Container>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <Container className="py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-950">
                    Defense Wallet
                  </h1>
                  <p className="text-sm text-neutral-500">
                    Secure portfolio management
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {lastUpdated && (
                  <div className="text-xs text-neutral-500 text-right">
                    <div>Last updated</div>
                    <div className="font-medium">{lastUpdated.toLocaleTimeString()}</div>
                  </div>
                )}
                <button
                  onClick={refresh}
                  className="bg-white border-2 border-neutral-200 hover:border-neutral-300 text-neutral-950 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            {/* Connected Wallet Badge */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                      Connected Wallet
                    </div>
                    <div className="font-mono text-sm text-neutral-950 font-semibold">
                      {wallet?.publicKey.slice(0, 12)}...{wallet?.publicKey.slice(-12)}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  wallet?.network === 'testnet'
                    ? 'bg-neutral-100 text-neutral-700 border-neutral-300'
                    : 'bg-neutral-900 text-white border-neutral-900'
                }`}>
                  {wallet?.network === 'testnet' ? 'Testnet' : 'Mainnet'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Total Value</h3>
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-neutral-950 mb-1">
                ${data?.assets.totalValueUSD.toFixed(2)}
              </p>
              <p className="text-sm text-neutral-500">
                {data?.assets.balances.length} assets
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Security Score</h3>
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-neutral-950 mb-1">
                {data?.security.securityScore}/100
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-700 rounded-full transition-all"
                    style={{ width: `${data?.security.securityScore}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500">
                  {data?.stats.totalTransactions} txs
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Account Age</h3>
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-neutral-950 mb-1">
                {data?.accountInfo.ageInDays}d
              </p>
              <p className="text-sm text-neutral-500">
                Since {data?.accountInfo.createdAt?.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setShowSendModal(true)}
              className="bg-white border-2 border-neutral-200 hover:border-neutral-300 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 bg-neutral-100 group-hover:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-7 h-7 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-neutral-950 block">Gönder</span>
                  <span className="text-xs text-neutral-500">Send Assets</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowReceiveModal(true)}
              className="bg-white border-2 border-neutral-200 hover:border-neutral-300 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 bg-neutral-100 group-hover:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-7 h-7 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-neutral-950 block">Al</span>
                  <span className="text-xs text-neutral-500">Receive Assets</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowSwapModal(true)}
              className="bg-white border-2 border-neutral-200 hover:border-neutral-300 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 bg-neutral-100 group-hover:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-7 h-7 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-neutral-950 block">Swap</span>
                  <span className="text-xs text-neutral-500">Exchange Assets</span>
                </div>
              </div>
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security & Activity Stats */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-950 mb-4">Activity Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Total Transactions</span>
                  <span className="font-semibold text-neutral-950">{data?.stats.totalTransactions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Total Payments</span>
                  <span className="font-semibold text-neutral-950">{data?.stats.totalPayments}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Total Operations</span>
                  <span className="font-semibold text-neutral-950">{data?.stats.totalOperations}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Active Offers</span>
                  <span className="font-semibold text-neutral-950">{data?.stats.activeOffers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Recent Trades</span>
                  <span className="font-semibold text-neutral-950">{data?.activity.recentTrades.length}</span>
                </div>
              </div>
            </div>

            {/* Assets */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-950 mb-4">Assets</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data?.assets.balances.map((balance: any, index: number) => (
                  <div key={index} className="bg-neutral-50 hover:bg-neutral-100 rounded-xl p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                          <span className="text-neutral-700 font-bold text-sm">
                            {balance.asset.code.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-950">{balance.asset.code}</h4>
                          {balance.asset.issuer && (
                            <p className="text-xs text-neutral-500">
                              {balance.asset.issuer.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-950">
                          {parseFloat(balance.balance).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security Details */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signers */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-950 mb-4">
                Signers ({data?.security.signers.length})
              </h3>
              <div className="space-y-2">
                {data?.security.signers.map((signer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm font-mono text-neutral-600">
                      {signer.key.slice(0, 16)}...{signer.key.slice(-8)}
                    </span>
                    <span className="text-sm font-medium text-neutral-950">
                      Weight: {signer.weight}
                    </span>
                  </div>
                ))}
              </div>
              {data?.stats.hasMultiSig && (
                <div className="mt-4 p-3 bg-neutral-100 border border-neutral-300 rounded-lg">
                  <p className="text-sm text-neutral-700">✅ Multi-signature enabled</p>
                </div>
              )}
            </div>

            {/* Thresholds & Flags */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-950 mb-4">Security Settings</h3>
              
              <h4 className="font-medium text-neutral-950 mb-2">Thresholds</h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between p-2 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Low</span>
                  <span className="text-sm text-neutral-950">{data?.security.thresholds?.low_threshold}</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Medium</span>
                  <span className="text-sm text-neutral-950">{data?.security.thresholds?.med_threshold}</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">High</span>
                  <span className="text-sm text-neutral-950">{data?.security.thresholds?.high_threshold}</span>
                </div>
              </div>

              <h4 className="font-medium text-neutral-950 mb-2">Flags</h4>
              <div className="space-y-2">
                {data?.security.flags?.auth_required && (
                  <div className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm text-neutral-700">
                    🔒 Authorization Required
                  </div>
                )}
                {data?.security.flags?.auth_revocable && (
                  <div className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm text-neutral-700">
                    ⚠️ Authorization Revocable
                  </div>
                )}
                {data?.security.flags?.auth_immutable && (
                  <div className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm text-neutral-700">
                    ✅ Authorization Immutable
                  </div>
                )}
                {data?.security.flags?.auth_clawback_enabled && (
                  <div className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm text-neutral-700">
                    🔴 Clawback Enabled
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-950 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {data?.activity.recentTransactions.slice(0, 5).map((tx: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm font-mono text-neutral-600">
                      {tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-950">
                      {tx.operation_count} ops
                    </p>
                    <p className="text-xs text-neutral-500">
                      {tx.successful ? '✅ Success' : '❌ Failed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Modals */}
      {data && (
        <>
          <SendAssetModal
            isOpen={showSendModal}
            onClose={() => setShowSendModal(false)}
            assets={data.assets.balances}
            onSuccess={refresh}
          />
          <ReceiveAssetModal
            isOpen={showReceiveModal}
            onClose={() => setShowReceiveModal(false)}
          />
          <SwapAssetModal
            isOpen={showSwapModal}
            onClose={() => setShowSwapModal(false)}
            assets={data.assets.balances}
            onSuccess={refresh}
          />
        </>
      )}
    </RootLayout>
  );
};

export default DefenseWallet;