'use client'

import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { useState, useEffect } from 'react'

export default function ConnectWalletPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Mock wallet functions for now
  const connectWallet = async () => {
    setError('')
    setLoading(true)
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWalletAddress('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
      setIsConnected(true)
      setBalance(1000)
    } catch (err) {
      setError('Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }
  
  const disconnectWallet = () => {
    setWalletAddress('')
    setIsConnected(false)
    setBalance(0)
    setError('')
  }
  
  const refreshBalance = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setBalance(Math.floor(Math.random() * 2000) + 500)
    setLoading(false)
  }
  
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <RootLayout>
      <PageIntro eyebrow="Wallet" title="Connect Your Wallet">
        <p>
          Connect your Stellar wallet to access StellarSafe features
        </p>
      </PageIntro>

      <Container className="mt-16">
        <div className="max-w-2xl mx-auto">
          {/* Connection Status */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 mb-8">
            {!isConnected ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-950 mb-4">
                  Not Connected
                </h2>
                <p className="text-neutral-600 mb-6">
                  Connect your Freighter wallet to get started
                </p>
                <button
                  onClick={handleConnect}
                  disabled={connecting || loading}
                  className="bg-neutral-950 text-white px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">✅</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-950">Connected</h3>
                      <p className="text-sm text-neutral-600">Freighter Wallet</p>
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="bg-neutral-200 text-neutral-950 px-4 py-2 rounded-lg hover:bg-neutral-300 transition-colors font-medium text-sm"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Wallet Address */}
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-neutral-600 mb-1">Address</p>
                  <p className="font-mono text-sm text-neutral-950 break-all">
                    {walletAddress}
                  </p>
                </div>

                {/* Balance */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Balance</p>
                      <p className="text-2xl font-bold text-neutral-950">
                        {balance.toLocaleString()} XLM
                      </p>
                    </div>
                    <button
                      onClick={refreshBalance}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          {isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="/defense-wallet"
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:border-neutral-950 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-neutral-950 mb-2">
                  Defense Wallet
                </h3>
                <p className="text-sm text-neutral-600">
                  Monitor your portfolio security and detect threats
                </p>
              </a>

              <a
                href="/analyze"
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:border-neutral-950 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-neutral-950 mb-2">
                  Analyze Transaction
                </h3>
                <p className="text-sm text-neutral-600">
                  Verify transactions before signing
                </p>
              </a>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
            <h3 className="font-semibold text-blue-950 mb-2">
              🔐 Security First
            </h3>
            <p className="text-sm text-blue-800">
              Your private keys never leave your device. StellarSafe only requests read access 
              to your public key and permission to sign transactions when you approve them.
            </p>
          </div>
        </div>
      </Container>
    </RootLayout>
  )
}
