'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletConnect, WalletType } from '@/hooks/useWalletConnect';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const walletIcons: Record<WalletType, string> = {
  freighter: '🚀',
  albedo: '⭐',
  rabet: '🦊',
  xbull: '🐂',
  lobstr: '🦞',
};

const walletColors: Record<WalletType, string> = {
  freighter: 'from-purple-500 to-blue-500',
  albedo: 'from-yellow-400 to-orange-500',
  rabet: 'from-orange-500 to-red-500',
  xbull: 'from-blue-500 to-indigo-600',
  lobstr: 'from-red-500 to-pink-500',
};

export const WalletConnectModal = ({ isOpen, onClose }: WalletConnectModalProps) => {
  const router = useRouter();
  const { connect, getAvailableWallets, isConnecting, error } = useWalletConnect();
  const [availableWallets, setAvailableWallets] = useState<ReturnType<typeof getAvailableWallets>>([]);

  useEffect(() => {
    if (isOpen) {
      // Update available wallets when modal opens
      const updateWallets = () => {
        // Debug: Check window object
        console.log('Checking for wallets...');
        console.log('window.freighterApi:', window.freighterApi);
        console.log('window.albedo:', window.albedo);
        console.log('window.rabet:', window.rabet);
        
        const wallets = getAvailableWallets();
        console.log('Available wallets:', wallets);
        setAvailableWallets(wallets);
      };

      // Immediate check
      updateWallets();

      // Retry multiple times as extensions might load late
      // Freighter can take up to 3-5 seconds to inject its API
      const timers = [
        setTimeout(updateWallets, 500),
        setTimeout(updateWallets, 1000),
        setTimeout(updateWallets, 2000),
        setTimeout(updateWallets, 3000),
        setTimeout(updateWallets, 5000),
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [isOpen, getAvailableWallets]);

  const handleConnectWallet = async (walletType: WalletType) => {
    try {
      const walletInfo = await connect(walletType);
      console.log('Wallet connected successfully:', walletInfo);
      
      // Close modal and redirect after a brief delay to ensure state updates
      setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 300);
    } catch (error) {
      console.error(`${walletType} connection error:`, error);
      // Error is already handled by the hook
    }
  };

  if (!isOpen) return null;

  const installedWallets = availableWallets.filter(w => w.installed);
  const notInstalledWallets = availableWallets.filter(w => !w.installed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl ring-1 ring-neutral-950/5">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-xl font-semibold text-neutral-950">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Installed Wallets */}
          {installedWallets.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-neutral-700 mb-3">Available Wallets</h3>
              <div className="space-y-3">
                {installedWallets.map((wallet) => (
                  <button
                    key={wallet.type}
                    onClick={() => handleConnectWallet(wallet.type)}
                    disabled={isConnecting}
                    className="w-full p-4 rounded-2xl border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${walletColors[wallet.type]} rounded-full flex items-center justify-center`}>
                        <span className="text-xl">{walletIcons[wallet.type]}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-neutral-950 flex items-center">
                          {wallet.name}
                          {isConnecting && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                              Connecting...
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {wallet.description}
                        </div>
                      </div>
                      <div className="text-neutral-400">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Not Installed Wallets */}
          {notInstalledWallets.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-neutral-700 mb-3">Install a Wallet</h3>
              <div className="space-y-3">
                {notInstalledWallets.map((wallet) => (
                  <div
                    key={wallet.type}
                    className="w-full p-4 rounded-2xl border border-neutral-200 bg-neutral-50 opacity-75"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${walletColors[wallet.type]} rounded-full flex items-center justify-center opacity-50`}>
                        <span className="text-xl">{walletIcons[wallet.type]}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-neutral-600">
                          {wallet.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {wallet.description}
                        </div>
                      </div>
                      <div className="text-neutral-400">
                        Not Installed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Wallets Available */}
          {installedWallets.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-neutral-950 mb-2">Freighter Algılanamadı</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  ⚠️ Freighter yüklü ama API inject edilmemiş
                </p>
                <p className="text-xs text-yellow-700">
                  Bu, Freighter&apos;ın siteye erişim izni olmadığı anlamına gelir.
                </p>
              </div>
              <div className="text-left text-sm text-neutral-700 mb-4 space-y-3 bg-neutral-50 p-4 rounded-lg">
                <p className="font-semibold text-neutral-950">🔧 Çözüm (2 dakika):</p>
                <ol className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Chrome&apos;da <strong>Freighter ikonuna sağ tıklayın</strong> (mor roket 🚀)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>&quot;<strong>Manage Extension</strong>&quot; veya &quot;<strong>Uzantıyı Yönet</strong>&quot; seçin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>&quot;<strong>Site access</strong>&quot; bölümünde &quot;<strong>On all sites</strong>&quot; seçin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>Bu sayfayı <strong>yenileyin</strong> (Cmd+Shift+R)</span>
                  </li>
                </ol>
              </div>
              <div className="flex flex-col space-y-2">
                <a
                  href="/freighter-check.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  🧪 Freighter Test Sayfası
                </a>
                <button
                  onClick={() => {
                    console.log('=== FREIGHTER MANUEL KONTROL ===');
                    console.log('window.freighterApi:', window.freighterApi);
                    console.log('window.freighter:', (window as any).freighter);
                    console.log('All window keys:', Object.keys(window).filter(k => 
                      k.toLowerCase().includes('freighter') || k.toLowerCase().includes('stellar')
                    ));
                    console.log('Navigator:', navigator.userAgent);
                    alert('✅ Console\'u kontrol edin (F12)\n\nFreighter bulunamadıysa:\n1. Extension izinlerini kontrol edin\n2. Sayfayı yenileyin');
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔍 Console Debug
                </button>
                <a
                  href="chrome://extensions/"
                  target="_blank"
                  className="inline-flex items-center justify-center px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors text-center"
                >
                  ⚙️ Extension Ayarlarını Aç
                </a>
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  📥 Freighter&apos;ı Yükle/Güncelle
                </a>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Secure Connection:</strong> Your wallet credentials never leave your device. 
              We only request permission to read your public key and sign transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};