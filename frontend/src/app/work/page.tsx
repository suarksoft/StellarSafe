'use client';

import { useState } from 'react';
import { ContactSection } from '@/components/ContactSection';
import { PageIntro } from '@/components/PageIntro';
import { RootLayout } from '@/components/RootLayout';
import { Container } from '@/components/Container';
import { WalletConnectModal } from '@/components/WalletConnectModal';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { useRouter } from 'next/navigation';

export default function Work() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { wallet, isConnected, disconnect } = useWalletConnect();
  const router = useRouter();

  return (
    <RootLayout>
      <PageIntro eyebrow="Our work" title="Case Studies">
        <p>
          Coming soon: Real-world examples of how StellarSafe protects users from scams and fraud.
        </p>
      </PageIntro>

      <Container className="mt-12 mb-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-950 mb-4">
              Test Wallet Connection
            </h2>
            
            {!isConnected ? (
              <div>
                <p className="text-neutral-600 mb-6">
                  Connect your Stellar wallet to test the Defense Wallet feature
                </p>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="bg-neutral-950 text-white px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors font-medium"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg mb-2">
                    <span className="mr-2">✅</span>
                    <span className="font-medium">Wallet Connected</span>
                  </div>
                  <p className="text-neutral-600 mb-2">
                    <strong>Address:</strong> {wallet?.publicKey.slice(0, 8)}...{wallet?.publicKey.slice(-8)}
                  </p>
                  <p className="text-neutral-600 mb-4">
                    <strong>Network:</strong> {wallet?.network}
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/defense-wallet')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Defense Wallet
                  </button>
                  <button
                    onClick={disconnect}
                    className="bg-neutral-200 text-neutral-950 px-6 py-2 rounded-lg hover:bg-neutral-300 transition-colors font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
            <h3 className="font-semibold text-neutral-950 mb-2">Debug Info</h3>
            <div className="text-sm text-neutral-600 space-y-1">
              <p>• Connection Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}</p>
              <p>• Wallet Type: {wallet?.type || 'None'}</p>
              <p>• Freighter API: {typeof window !== 'undefined' && (window as any).freighterApi ? '✅ Detected' : '❌ Not Found'}</p>
            </div>
          </div>
        </div>
      </Container>

      <ContactSection />

      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </RootLayout>
  );
}
