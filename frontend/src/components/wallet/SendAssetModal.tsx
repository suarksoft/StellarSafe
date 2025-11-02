'use client';

import React, { useState, useEffect } from 'react';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from '@/lib/stellar/client';
import {
  WalletAnalysisResult,
  RiskLevel,
  getRiskLevelColor,
  getRiskLevelEmoji,
} from '@/lib/analyzer/walletRiskAnalyzer';
import { 
  EnhancedWalletRiskAnalyzer,
  EnhancedAnalysisResult 
} from '@/lib/analyzer/enhancedWalletRiskAnalyzer';
import { TransactionPreviewService, TransactionPreview } from '@/lib/analyzer/transactionPreview';
import { getMockAIExplanation } from '@/lib/analyzer/aiRiskExplainer';
import { useAnalyticsLogger } from '@/lib/analyzer/analyticsLogger';

interface SendAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Array<{
    asset: { code: string; issuer?: string };
    balance: string;
  }>;
  onSuccess?: () => void;
}

export const SendAssetModal: React.FC<SendAssetModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSuccess,
}) => {
  const { wallet, signTransaction } = useWalletConnect();
  const { logAnalysis, logTransaction } = useAnalyticsLogger();
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Risk Analizi
  const [analysis, setAnalysis] = useState<EnhancedAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [isCachedResult, setIsCachedResult] = useState(false);

  // Transaction Preview
  const [transactionPreview, setTransactionPreview] = useState<TransactionPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // İki Aşamalı Onay Sistemi
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState<'review' | 'final'>('review');

  // Destination değiştiğinde analiz yap
  useEffect(() => {
    if (!destination || destination.length < 56) {
      setAnalysis(null);
      setShowAnalysis(false);
      return;
    }

    // Stellar adresi formatı kontrolü (G ile başlayan 56 karakter)
    if (!destination.startsWith('G') || destination.length !== 56) {
      return;
    }

    const analyzeDestination = async () => {
      setIsAnalyzing(true);
      try {
        // Check cache first (1 hour TTL)
        const cacheKey = `stellarsafe_analysis_${destination}_${wallet?.network || 'public'}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            const ONE_HOUR = 3600000; // 1 hour in ms
            
            if (age < ONE_HOUR) {
              console.log('✅ Using cached analysis (age:', Math.round(age / 1000), 'seconds)');
              setAnalysis(data);
              setShowAnalysis(true);
              setIsCachedResult(true);
              
              const aiExp = getMockAIExplanation(data);
              setAiExplanation(aiExp);
              setIsAnalyzing(false);
              return;
            } else {
              // Expired, remove from cache
              localStorage.removeItem(cacheKey);
            }
          } catch (cacheError) {
            console.warn('Cache parse error:', cacheError);
            localStorage.removeItem(cacheKey);
          }
        }
        
        // Enhanced Analyzer kullan - Stellar Expert + TOML verification
        const enhancedAnalyzer = new EnhancedWalletRiskAnalyzer(wallet?.network === 'testnet');
        
        // Home domain varsa kullan (hesaptan çek)
        let homeDomain: string | undefined;
        try {
          const stellarClient = new StellarClient(wallet?.network === 'testnet');
          const accountData = await stellarClient.loadAccount(destination);
          homeDomain = accountData.home_domain;
        } catch (error) {
          // Home domain çekemedik, devam et
          console.log('Home domain alınamadı:', error);
        }
        
        let result: EnhancedAnalysisResult;
        
        try {
          // Enhanced analiz yap (timeout: 10 saniye)
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Analysis timeout')), 10000)
          );
          
          result = await Promise.race([
            enhancedAnalyzer.analyzeWallet(destination, homeDomain),
            timeoutPromise
          ]) as EnhancedAnalysisResult;
          
        } catch (enhancedError) {
          console.warn('Enhanced analysis failed, falling back to base analyzer:', enhancedError);
          
          // Fallback: Base analyzer kullan
          const { WalletRiskAnalyzer } = await import('@/lib/analyzer/walletRiskAnalyzer');
          const baseAnalyzer = new WalletRiskAnalyzer(wallet?.network === 'testnet');
          const baseResult = await baseAnalyzer.analyzeWallet(destination);
          
          // Base result'u enhanced result formatına dönüştür
          result = {
            ...baseResult,
            verificationBadges: ['⚠️ Kısıtlı analiz (API erişimi başarısız)']
          } as EnhancedAnalysisResult;
        }
        
        setAnalysis(result);
        setShowAnalysis(true);
        setIsCachedResult(false);

        // Cache the result (1 hour TTL)
        try {
          const cacheKey = `stellarsafe_analysis_${destination}_${wallet?.network || 'public'}`;
          const cacheData = {
            data: result,
            timestamp: Date.now()
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          console.log('💾 Analysis cached for 1 hour');
        } catch (cacheError) {
          console.warn('Failed to cache analysis:', cacheError);
          // Continue even if cache fails
        }

        // AI açıklaması ekle (mock - API key varsa gerçek AI kullanılabilir)
        const aiExp = getMockAIExplanation(result);
        setAiExplanation(aiExp);

        // Analizi log'la
        if (wallet?.publicKey) {
          logAnalysis(
            wallet.publicKey,
            destination,
            result,
            wallet.network === 'testnet' ? 'testnet' : 'mainnet'
          );
        }
      } catch (error) {
        console.error('Risk analizi hatası:', error);
        setAnalysis(null);
        setAiExplanation(null);
        setError('Güvenlik analizi başarısız oldu. Lütfen tekrar deneyin.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Debounce: 1 saniye bekle
    const timer = setTimeout(() => {
      analyzeDestination();
    }, 1000);

    return () => clearTimeout(timer);
  }, [destination, wallet?.network, logAnalysis, wallet?.publicKey]);

  if (!isOpen) return null;

  // İlk "Gönder" butonu - Güvenlik taraması ve review'a git
  const handleInitiateSend = async () => {
    if (!wallet || !destination || !amount) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (!analysis) {
      setError('Güvenlik analizi tamamlanmamış. Lütfen bekleyin...');
      return;
    }

    // CRITICAL risk seviyesinde uyar ve iptal et
    if (analysis.riskLevel === RiskLevel.CRITICAL) {
      if (wallet?.publicKey) {
        logTransaction(
          wallet.publicKey,
          destination,
          analysis,
          'cancelled',
          amount,
          selectedAsset.asset.code,
          wallet.network === 'testnet' ? 'testnet' : 'mainnet'
        );
      }
      setError('⛔ Bu adrese gönderim yapılamaz. Çok yüksek risk tespit edildi!');
      return;
    }

    // Transaction Preview yap
    setIsPreviewLoading(true);
    try {
      const previewService = new TransactionPreviewService(wallet.network === 'testnet');
      
      // Asset oluştur
      const asset = selectedAsset.asset.issuer
        ? new StellarSdk.Asset(selectedAsset.asset.code, selectedAsset.asset.issuer)
        : StellarSdk.Asset.native();

      const preview = await previewService.previewTransaction(
        wallet.publicKey,
        destination,
        asset,
        amount,
        memo || undefined
      );

      setTransactionPreview(preview);
      
      // Eğer critical error varsa durduralım
      if (!preview.success && preview.errors && preview.errors.length > 0) {
        setError(preview.errors[0]);
        setIsPreviewLoading(false);
        return;
      }
    } catch (error) {
      console.error('Transaction preview hatası:', error);
      // Preview başarısız olsa bile devam edebiliriz
      setTransactionPreview(null);
    }
    setIsPreviewLoading(false);

    // Review aşamasına geç
    setConfirmationStep('review');
    setShowConfirmation(true);
    setError(null);
  };

  // Review'dan sonra final onay
  const handleConfirmReview = () => {
    setConfirmationStep('final');
  };

  // Final onaydan sonra transaction'ı gönder
  const handleFinalConfirm = async () => {
    if (!wallet) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('💸 Sending asset...', {
        from: wallet.publicKey,
        to: destination,
        asset: selectedAsset.asset.code,
        amount,
      });

      // Stellar client oluştur
      const stellarClient = new StellarClient(wallet.network === 'testnet');
      const server = new StellarSdk.Horizon.Server(
        wallet.network === 'testnet'
          ? 'https://horizon-testnet.stellar.org'
          : 'https://horizon.stellar.org'
      );

      // Kaynak hesabı yükle
      const sourceAccount = await stellarClient.loadAccount(wallet.publicKey);

      // Transaction builder
      let transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase:
          wallet.network === 'testnet'
            ? StellarSdk.Networks.TESTNET
            : StellarSdk.Networks.PUBLIC,
      });

      // Asset oluştur
      let asset: StellarSdk.Asset;
      if (selectedAsset.asset.code === 'XLM') {
        asset = StellarSdk.Asset.native();
      } else {
        asset = new StellarSdk.Asset(
          selectedAsset.asset.code,
          selectedAsset.asset.issuer!
        );
      }

      // Payment operation ekle
      transaction = transaction.addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset,
          amount: amount.toString(),
        })
      );

      // Memo ekle (varsa)
      if (memo) {
        transaction = transaction.addMemo(StellarSdk.Memo.text(memo));
      }

      // Timeout ekle
      transaction = transaction.setTimeout(180);

      // Transaction'ı build et
      const builtTransaction = transaction.build();

      // XDR'a çevir
      const xdr = builtTransaction.toXDR();

      console.log('📝 Transaction XDR:', xdr);

      // Freighter ile imzala
      const signedXdr = await signTransaction(xdr);

      console.log('✍️ Signed XDR:', signedXdr);

      // Transaction'ı submit et
      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        stellarClient.networkPassphrase
      );

      const result = await server.submitTransaction(transactionToSubmit as any);

      console.log('✅ Transaction successful:', result);

      // Başarılı transaction'ı log'la
      if (wallet?.publicKey && analysis) {
        logTransaction(
          wallet.publicKey,
          destination,
          analysis,
          'sent',
          amount,
          selectedAsset.asset.code,
          wallet.network === 'testnet' ? 'testnet' : 'mainnet'
        );
      }

      setSuccess(true);
      setAmount('');
      setDestination('');
      setMemo('');

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('❌ Send error:', err);
      setError(err?.message || 'Transaction başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header - Sabit */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-950">Kripto Gönder</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-thin">{/* Scroll container başlangıcı */}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-950 mb-2">
              Gönderim Başarılı!
            </h3>
            <p className="text-neutral-600">
              {amount} {selectedAsset.asset.code} başarıyla gönderildi
            </p>
          </div>
        ) : showConfirmation ? (
          // Onay Ekranları
          confirmationStep === 'review' ? (
            // STEP 1: Güvenlik Raporu Review
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Güvenlik Taraması Tamamlandı
                  </h3>
                  <p className="text-sm text-neutral-600">
                    İşleminizi onaylamadan önce tüm detayları inceleyin
                  </p>
                </div>
              </div>

              {/* Risk Raporu */}
              {analysis && (
                <div className={`p-6 rounded-xl border-2 ${getRiskLevelColor(analysis.riskLevel).bg} ${getRiskLevelColor(analysis.riskLevel).border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{getRiskLevelEmoji(analysis.riskLevel)}</span>
                      <div>
                        <div className="text-lg font-bold">
                          Risk Seviyesi: {analysis.riskLevel.toUpperCase()}
                        </div>
                        <div className="text-sm opacity-75">
                          Risk Skoru: {analysis.riskScore}/100
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Badges - Confirmation Step */}
                  {analysis.verificationBadges && analysis.verificationBadges.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {analysis.verificationBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Data Summary */}
                  <div className="mb-4 space-y-2">
                    {analysis.expertData && (
                      <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg text-sm">
                        <span className="font-medium">🌟 Stellar Expert Trust Score:</span>
                        <span className="font-mono font-bold text-blue-600">{analysis.expertData.trustScore}/100</span>
                      </div>
                    )}
                    {analysis.tomlVerification && analysis.tomlVerification.verified && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg text-sm">
                        <span className="font-medium">🔐 Domain Verified:</span>
                        <span className="font-mono font-bold text-green-700">{analysis.tomlVerification.domain}</span>
                      </div>
                    )}
                  </div>

                  <p className={`text-sm font-medium mb-4 ${getRiskLevelColor(analysis.riskLevel).text}`}>
                    {analysis.recommendation}
                  </p>

                  {/* AI Açıklama */}
                  {aiExplanation && (
                    <div className="p-4 bg-white/50 rounded-lg mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-semibold">AI Güvenlik Analizi</span>
                      </div>
                      <p className="text-sm mb-3">{aiExplanation.summary}</p>
                      {aiExplanation.recommendations && aiExplanation.recommendations.length > 0 && (
                        <div className="text-xs">
                          <div className="font-semibold mb-1">💡 Öneriler:</div>
                          <ul className="list-disc list-inside space-y-1 opacity-90">
                            {aiExplanation.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uyarılar ve Pozitif İşaretler */}
                  <div className="grid grid-cols-1 gap-3">
                    {analysis.warnings.length > 0 && (
                      <div className="p-3 bg-red-50/50 rounded-lg">
                        <div className="font-semibold text-red-700 mb-2 text-sm">⚠️ Uyarılar:</div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-red-600">
                          {analysis.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.greenFlags.length > 0 && (
                      <div className="p-3 bg-green-50/50 rounded-lg">
                        <div className="font-semibold text-green-700 mb-2 text-sm">✅ Pozitif İşaretler:</div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-green-600">
                          {analysis.greenFlags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Preview */}
              {transactionPreview && (
                <div className={`p-4 rounded-xl border-2 ${
                  transactionPreview.success 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <h4 className="font-semibold text-neutral-950 mb-3 flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Transaction Preview</span>
                  </h4>
                  
                  {/* Preview Details */}
                  <div className="space-y-2 text-sm mb-3">
                    {transactionPreview.fee && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Estimated Fee:</span>
                        <span className="font-mono font-semibold text-blue-700">{transactionPreview.fee}</span>
                      </div>
                    )}
                    {transactionPreview.estimatedTime && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Estimated Time:</span>
                        <span className="text-neutral-700">{transactionPreview.estimatedTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Warnings */}
                  {transactionPreview.warnings && transactionPreview.warnings.length > 0 && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-semibold text-yellow-800 mb-1 text-sm">⚠️ Uyarılar:</div>
                      <ul className="space-y-1">
                        {transactionPreview.warnings.map((warning, idx) => (
                          <li key={idx} className="text-xs text-yellow-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Errors */}
                  {transactionPreview.errors && transactionPreview.errors.length > 0 && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="font-semibold text-red-800 mb-1 text-sm">❌ Hatalar:</div>
                      <ul className="space-y-1">
                        {transactionPreview.errors.map((error, idx) => (
                          <li key={idx} className="text-xs text-red-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Operations Summary */}
                  {transactionPreview.operations && transactionPreview.operations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <div className="text-xs text-neutral-600">
                        Operations: {transactionPreview.operations.length}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* İşlem Detayları Özet */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <h4 className="font-semibold text-neutral-950 mb-3">📋 İşlem Detayları</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Gönderilen Miktar:</span>
                    <span className="font-semibold text-neutral-950">{amount} {selectedAsset.asset.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Alıcı Adres:</span>
                    <code className="font-mono text-xs text-neutral-700">
                      {destination.slice(0, 8)}...{destination.slice(-8)}
                    </code>
                  </div>
                  {memo && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Memo:</span>
                      <span className="font-mono text-xs text-neutral-700">{memo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Network:</span>
                    <span className="text-neutral-950">
                      {wallet?.network === 'testnet' ? '🧪 Testnet' : '🌐 Mainnet'}
                    </span>
                  </div>
                  {transactionPreview?.fee && (
                    <div className="flex justify-between pt-2 border-t border-neutral-300">
                      <span className="text-neutral-600">İşlem Ücreti:</span>
                      <span className="font-semibold text-neutral-950">{transactionPreview.fee}</span>
                    </div>
                  )}
                  {!transactionPreview?.fee && (
                    <div className="flex justify-between pt-2 border-t border-neutral-300">
                      <span className="text-neutral-600">İşlem Ücreti (tahmini):</span>
                      <span className="font-semibold text-neutral-950">~0.00001 XLM</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmationStep('review');
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  ← Geri Dön
                </button>
                <button
                  onClick={handleConfirmReview}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Devam Et →
                </button>
              </div>
            </div>
          ) : (
            // STEP 2: Final Onay
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Son Onay
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Bu işlem geri alınamaz. Lütfen tüm bilgileri kontrol edin.
                  </p>
                </div>
              </div>

              {/* Kritik Bilgiler */}
              <div className="p-6 bg-orange-50 border-2 border-orange-300 rounded-xl">
                <div className="flex items-start space-x-3 mb-4">
                  <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-bold text-orange-900 mb-2">⚠️ Önemli Uyarı</h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• Bu işlem geri alınamaz ve iptal edilemez</li>
                      <li>• Alıcı adresini tekrar kontrol edin</li>
                      <li>• Yanlış adrese gönderilen kripto kurtarılamaz</li>
                      <li>• Devam etmek istediğinize emin misiniz?</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Final İşlem Özeti */}
              <div className="p-6 bg-white border-2 border-neutral-300 rounded-xl">
                <h4 className="font-bold text-neutral-950 mb-4 text-center text-lg">
                  Onaylanacak İşlem
                </h4>
                <div className="space-y-3">
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-3xl font-bold text-neutral-950 mb-1">
                      {amount} {selectedAsset.asset.code}
                    </div>
                    <div className="text-sm text-neutral-600">gönderilecek</div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3 py-2">
                    <span className="text-neutral-500">→</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-600 mb-1">Alıcı Adres:</div>
                    <code className="text-xs font-mono text-neutral-950 break-all">
                      {destination}
                    </code>
                  </div>

                  {analysis && (
                    <div className="flex items-center justify-center space-x-2 py-2">
                      <span className="text-2xl">{getRiskLevelEmoji(analysis.riskLevel)}</span>
                      <span className={`font-semibold ${getRiskLevelColor(analysis.riskLevel).text}`}>
                        {analysis.riskLevel.toUpperCase()} RİSK
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Final Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setConfirmationStep('review')}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  ← Geri
                </button>
                <button
                  onClick={handleFinalConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Gönderiliyor...</span>
                    </span>
                  ) : (
                    '✅ Onayla ve Gönder'
                  )}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {/* Asset Seçimi */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Asset
              </label>
              <select
                value={selectedAsset.asset.code}
                onChange={(e) => {
                  const asset = assets.find((a) => a.asset.code === e.target.value);
                  if (asset) setSelectedAsset(asset);
                }}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {assets.map((asset, idx) => (
                  <option key={idx} value={asset.asset.code}>
                    {asset.asset.code} (Balance: {parseFloat(asset.balance).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Alıcı Adresi */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Alıcı Adresi
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              
              {/* Analiz Durumu - Enhanced */}
              {isAnalyzing && destination.length === 56 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-blue-800 mb-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="font-semibold">Güvenlik Analizi Yapılıyor...</span>
                  </div>
                  <div className="space-y-1 text-xs text-blue-700 pl-6">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                      <span>On-chain data kontrolü</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span>Stellar Expert verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                      <span>TOML domain verification</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Analizi Sonuçları */}
              {showAnalysis && analysis && (
                <div className={`mt-3 p-4 rounded-lg border-2 ${getRiskLevelColor(analysis.riskLevel).bg} ${getRiskLevelColor(analysis.riskLevel).border}`}>
                  {/* Cache Indicator with Clear Button */}
                  {isCachedResult && (
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs text-neutral-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Cache&apos;den yüklendi (1 saat geçerli)</span>
                      </div>
                      <button
                        onClick={() => {
                          const cacheKey = `stellarsafe_analysis_${destination}_${wallet?.network || 'public'}`;
                          localStorage.removeItem(cacheKey);
                          setAnalysis(null);
                          setShowAnalysis(false);
                          setIsCachedResult(false);
                          setAiExplanation(null);
                          // Trigger re-analysis
                          setTimeout(() => {
                            if (destination.length === 56) {
                              // Will trigger useEffect
                              setDestination(destination);
                            }
                          }, 100);
                        }}
                        className="flex items-center space-x-1 px-2 py-0.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Yeni analiz yap"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Yenile</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Risk Seviyesi Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getRiskLevelEmoji(analysis.riskLevel)}</span>
                      <div>
                        <div className="font-semibold text-sm">
                          Risk Seviyesi: {analysis.riskLevel.toUpperCase()}
                        </div>
                        <div className="text-xs opacity-75">
                          Risk Skoru: {analysis.riskScore}/100
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Badges - Enhanced */}
                  {analysis.verificationBadges && analysis.verificationBadges.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {analysis.verificationBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stellar Expert Data */}
                  {analysis.expertData && (
                    <div className="mb-3 p-2 bg-white/50 rounded-lg border border-neutral-200">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">🌟 Trust Score:</span>
                          <span className="font-mono">{analysis.expertData.trustScore}/100</span>
                        </div>
                        {analysis.expertData.orgType && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {analysis.expertData.orgType}
                          </span>
                        )}
                      </div>
                      {analysis.expertData.tags && analysis.expertData.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {analysis.expertData.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TOML Verification Info */}
                  {analysis.tomlVerification && analysis.tomlVerification.verified && (
                    <div className="mb-3 p-2 bg-green-50/50 rounded-lg border border-green-200">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-800">🔐 Domain Verified:</span>
                          <span className="text-green-700">{analysis.tomlVerification.domain}</span>
                        </div>
                        {analysis.tomlVerification.orgName && (
                          <div className="text-green-700">
                            Organization: {analysis.tomlVerification.orgName}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <p className={`text-sm font-medium mb-3 ${getRiskLevelColor(analysis.riskLevel).text}`}>
                    {analysis.recommendation}
                  </p>

                  {/* AI Açıklaması */}
                  {aiExplanation && (
                    <div className="mt-3 pt-3 border-t border-neutral-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-semibold text-sm">AI Analiz</span>
                      </div>
                      <p className="text-sm mb-2">{aiExplanation.summary}</p>
                      
                      {aiExplanation.recommendations && aiExplanation.recommendations.length > 0 && (
                        <div className="text-xs space-y-1">
                          <div className="font-semibold">💡 Tavsiyeler:</div>
                          <ul className="list-disc list-inside space-y-0.5 opacity-90">
                            {aiExplanation.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detaylar Toggle */}
                  <details className="text-sm mt-3">
                    <summary className="cursor-pointer font-medium mb-2 hover:underline">
                      📊 Teknik Detaylar
                    </summary>
                    
                    <div className="space-y-2 pl-4 mt-2">
                      {/* Warnings */}
                      {analysis.warnings.length > 0 && (
                        <div>
                          <div className="font-semibold text-red-700 mb-1">⚠️ Uyarılar:</div>
                          <ul className="list-disc list-inside space-y-1 text-red-600">
                            {analysis.warnings.map((warning, idx) => (
                              <li key={idx}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Green Flags */}
                      {analysis.greenFlags.length > 0 && (
                        <div>
                          <div className="font-semibold text-green-700 mb-1">✅ Pozitif İşaretler:</div>
                          <ul className="list-disc list-inside space-y-1 text-green-600">
                            {analysis.greenFlags.map((flag, idx) => (
                              <li key={idx}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Risk Faktörleri */}
                      <div className="mt-3">
                        <div className="font-semibold mb-2">📈 Risk Faktörleri:</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Hesap Yaşı:</span>
                            <span className="font-mono text-[10px]">{analysis.factors.accountAge.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transaction Geçmişi:</span>
                            <span className="font-mono text-[10px]">{analysis.factors.transactionHistory.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hesap Aktivitesi:</span>
                            <span className="font-mono text-[10px]">{analysis.factors.accountActivity.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Güvenlik:</span>
                            <span className="font-mono text-[10px]">{analysis.factors.multiSig.description}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Detaylı Analiz */}
                      {aiExplanation?.detailedAnalysis && (
                        <div className="mt-3 pt-3 border-t border-neutral-200">
                          <div className="font-semibold mb-1">🤖 Detaylı AI Analizi:</div>
                          <p className="text-xs opacity-80">{aiExplanation.detailedAnalysis}</p>
                          
                          {aiExplanation.riskMitigation && aiExplanation.riskMitigation.length > 0 && (
                            <div className="mt-2">
                              <div className="font-semibold mb-1">🛡️ Risk Azaltma:</div>
                              <ul className="list-disc list-inside space-y-0.5 text-xs opacity-80">
                                {aiExplanation.riskMitigation.map((mitigation: string, idx: number) => (
                                  <li key={idx}>{mitigation}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Miktar */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Miktar
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.0000001"
                  min="0"
                  max={selectedAsset.balance}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setAmount(selectedAsset.balance)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Available: {parseFloat(selectedAsset.balance).toFixed(7)} {selectedAsset.asset.code}
              </p>
            </div>

            {/* Memo (Opsiyonel) */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Memo (Opsiyonel)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Memo text..."
                maxLength={28}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Bazı exchange&apos;ler memo gerektirir
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
                onClick={handleInitiateSend}
                disabled={isLoading || !destination || !amount || isAnalyzing || !analysis || isPreviewLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? 'Gönderiliyor...' 
                  : isAnalyzing 
                    ? 'Analiz ediliyor...' 
                    : isPreviewLoading
                      ? 'Preview hazırlanıyor...'
                      : 'Devam Et'
                }
              </button>
            </div>
          </div>
        )}
        </div>{/* Scroll container sonu */}
      </div>
    </div>
  );
};
