'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useWalletConnect } from '@/hooks/useWalletConnect';

interface ReceiveAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveAssetModal: React.FC<ReceiveAssetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wallet } = useWalletConnect();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !wallet) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet.publicKey}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-950">Kripto Al</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-neutral-200 rounded-xl">
              <Image
                src={qrCodeUrl}
                alt="Wallet QR Code"
                width={192}
                height={192}
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-neutral-950 mb-2">
              Cüzdan Adresiniz ({wallet.network})
            </label>
            <div className="relative">
              <div className="px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-sm break-all">
                {wallet.publicKey}
              </div>
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? '✓ Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Önemli Bilgiler</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sadece Stellar ({wallet.network}) ağındaki varlıkları gönderin</li>
                  <li>• QR kodu okutarak veya adresi kopyalayarak kullanabilirsiniz</li>
                  <li>• Bazı exchange&apos;ler memo gerektirebilir</li>
                  <li>• İşlem onaylandıktan sonra otomatik olarak cüzdanınıza yansır</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Network Badge */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`px-4 py-2 rounded-full ${
              wallet.network === 'testnet' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              <span className="font-semibold">
                {wallet.network === 'testnet' ? '🧪 Testnet' : '🌐 Mainnet'}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
