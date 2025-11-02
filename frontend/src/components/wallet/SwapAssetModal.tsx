'use client';

import React, { useState, useEffect } from 'react';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from '@/lib/stellar/client';

interface SwapAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Array<{
    asset: { code: string; issuer?: string };
    balance: string;
  }>;
  onSuccess?: () => void;
}

export const SwapAssetModal: React.FC<SwapAssetModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSuccess,
}) => {
  const { wallet, signTransaction } = useWalletConnect();
  const [fromAsset, setFromAsset] = useState(assets[0]);
  const [toAsset, setToAsset] = useState(assets[1] || assets[0]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [estimating, setEstimating] = useState(false);

  // Basit fiyat tahmini (gerçek uygulamada DEX'ten path payment strict send kullanılmalı)
  const estimateSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      return;
    }

    setEstimating(true);
    try {
      // Basit sabit oran (gerçek uygulamada Stellar DEX'ten fiyat çekilmeli)
      // XLM-XLM durumunda 1:1, diğer durumlarda mock rate
      if (fromAsset.asset.code === toAsset.asset.code) {
        setToAmount(fromAmount);
      } else {
        // Mock exchange rate (gerçek uygulamada path payment strict send ile hesaplanmalı)
        const mockRate = 0.95; // %5 slippage varsayımı
        setToAmount((parseFloat(fromAmount) * mockRate).toFixed(7));
      }
    } catch (err) {
      console.error('Estimation error:', err);
      setToAmount('~');
    } finally {
      setEstimating(false);
    }
  };

  useEffect(() => {
    estimateSwap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAmount, fromAsset, toAsset]);

  const handleSwap = async () => {
    if (!wallet || !fromAmount || !toAmount) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Swapping assets...', {
        from: fromAsset.asset.code,
        to: toAsset.asset.code,
        amount: fromAmount,
      });

      const stellarClient = new StellarClient(wallet.network === 'testnet');
      const server = new StellarSdk.Horizon.Server(
        wallet.network === 'testnet'
          ? 'https://horizon-testnet.stellar.org'
          : 'https://horizon.stellar.org'
      );

      const sourceAccount = await stellarClient.loadAccount(wallet.publicKey);

      // From asset
      let sendAsset: StellarSdk.Asset;
      if (fromAsset.asset.code === 'XLM') {
        sendAsset = StellarSdk.Asset.native();
      } else {
        sendAsset = new StellarSdk.Asset(
          fromAsset.asset.code,
          fromAsset.asset.issuer!
        );
      }

      // To asset
      let destAsset: StellarSdk.Asset;
      if (toAsset.asset.code === 'XLM') {
        destAsset = StellarSdk.Asset.native();
      } else {
        destAsset = new StellarSdk.Asset(
          toAsset.asset.code,
          toAsset.asset.issuer!
        );
      }

      // Path payment strict send operation kullan
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase:
          wallet.network === 'testnet'
            ? StellarSdk.Networks.TESTNET
            : StellarSdk.Networks.PUBLIC,
      })
        .addOperation(
          StellarSdk.Operation.pathPaymentStrictSend({
            sendAsset,
            sendAmount: fromAmount,
            destination: wallet.publicKey, // Kendimize gönder
            destAsset,
            destMin: (parseFloat(toAmount) * 0.99).toString(), // %1 slippage tolerance
          })
        )
        .setTimeout(180)
        .build();

      const xdr = transaction.toXDR();
      console.log('📝 Swap XDR:', xdr);

      const signedXdr = await signTransaction(xdr);
      console.log('✍️ Signed XDR:', signedXdr);

      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        stellarClient.networkPassphrase
      );

      const result = await server.submitTransaction(transactionToSubmit as any);
      console.log('✅ Swap successful:', result);

      setSuccess(true);
      setFromAmount('');
      setToAmount('');

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('❌ Swap error:', err);
      
      // Daha açıklayıcı hata mesajları
      if (err?.message?.includes('op_no_trust')) {
        setError('Hedef asset için trustline oluşturmanız gerekiyor');
      } else if (err?.message?.includes('op_underfunded')) {
        setError('Yetersiz bakiye');
      } else if (err?.message?.includes('op_no_issuer')) {
        setError('Asset issuer bulunamadı');
      } else {
        setError(err?.message || 'Swap işlemi başarısız oldu. Lütfen manuel path payment deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount('');
    setToAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-950">Swap Assets</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-950 mb-2">
              Swap Başarılı!
            </h3>
            <p className="text-neutral-600">
              {fromAmount} {fromAsset.asset.code} → {toAmount} {toAsset.asset.code}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* From Asset */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Gönderilecek
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.0000001"
                  min="0"
                  max={fromAsset.balance}
                  className="flex-1 text-2xl font-bold bg-transparent border-none outline-none"
                />
                <select
                  value={fromAsset.asset.code}
                  onChange={(e) => {
                    const asset = assets.find((a) => a.asset.code === e.target.value);
                    if (asset) setFromAsset(asset);
                  }}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded-lg font-semibold"
                >
                  {assets.map((asset, idx) => (
                    <option key={idx} value={asset.asset.code}>
                      {asset.asset.code}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Balance: {parseFloat(fromAsset.balance).toFixed(7)}
              </p>
            </div>

            {/* Flip Button */}
            <div className="flex justify-center">
              <button
                onClick={handleFlip}
                className="w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-xl">⇅</span>
              </button>
            </div>

            {/* To Asset */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Alınacak (Tahmini)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={estimating ? '...' : toAmount}
                  readOnly
                  placeholder="0.00"
                  className="flex-1 text-2xl font-bold bg-transparent border-none outline-none"
                />
                <select
                  value={toAsset.asset.code}
                  onChange={(e) => {
                    const asset = assets.find((a) => a.asset.code === e.target.value);
                    if (asset) setToAsset(asset);
                  }}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded-lg font-semibold"
                >
                  {assets.map((asset, idx) => (
                    <option key={idx} value={asset.asset.code}>
                      {asset.asset.code}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Balance: {parseFloat(toAsset.balance).toFixed(7)}
              </p>
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Stellar DEX üzerinden path payment kullanılarak swap yapılır. 
                Slippage tolerance: %1
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleSwap}
                disabled={isLoading || !fromAmount || !toAmount || fromAsset.asset.code === toAsset.asset.code}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Swap Yapılıyor...' : 'Swap'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
