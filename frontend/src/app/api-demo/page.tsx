'use client';

import { useState } from 'react';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { PageIntro } from '@/components/PageIntro';
import { SectionIntro } from '@/components/SectionIntro';
import { RootLayout } from '@/components/RootLayout';
import { Button } from '@/components/Button';

export default function ApiDemoPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Mock API responses for demonstration
  const mockResponses = {
    'risk-analysis': {
      success: true,
      address: 'GCKFBEIYTKP6RCZX...',
      analysis: {
        riskLevel: 'CRITICAL',
        riskScore: 95,
        trustScore: 5,
        recommendation: {
          action: 'BLOCK',
          message: "Don&apos;t interact with this address",
          reasons: [
            'Recently created account',
            'No transaction history',
            'Suspicious patterns detected'
          ]
        },
        factors: {
          // Risk factors analysis
          stellarExpert: {
            isVerified: false,
            trustScore: 0
          },
          onChainAnalysis: {
            accountAge: '2 days',
            transactionVolume: 'NONE',
            suspiciousActivity: true
          }
        }
      }
    }
  };

  const runDemo = async (demoType: string) => {
    setLoading(true);
    setActiveDemo(demoType);
    
    // Simulate API call
    setTimeout(() => {
      setResult(mockResponses[demoType as keyof typeof mockResponses]);
      setLoading(false);
    }, 2000);
  };

  return (
    <RootLayout>
      <PageIntro eyebrow="Demo" title="StellarSafe Güvenlik Analizi Demo">
        <p>
          StellarSafe&apos;in güvenlik özelliklerini test edin. Stellar adresleri ve işlemleri analiz edin,
          risk seviyelerini görün ve güvenlik önerilerini deneyimleyin.
        </p>
      </PageIntro>

      <Container className="mt-16">
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Input */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-950 mb-6">
                Güvenlik Analizi Demo
              </h2>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => runDemo('risk-analysis')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && activeDemo === 'risk-analysis' ? 'Analiz Ediliyor...' : 'Risk Analizi Yap'}
                </Button>
                
                <Button 
                  onClick={() => runDemo('asset-verification')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && activeDemo === 'asset-verification' ? 'Doğrulanıyor...' : 'Token Doğrulama Yap'}
                </Button>
                
                <Button 
                  onClick={() => runDemo('transaction-analysis')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && activeDemo === 'transaction-analysis' ? 'Analiz Ediliyor...' : 'İşlem Analizi Yap'}
                </Button>
              </div>

              {/* Mock data examples */}
              <div className="mt-8">
                <h3 className="font-semibold text-neutral-950 mb-4">
                  Örnek Analiz Senaryoları
                </h3>
                <div className="space-y-4">
                  <div className="bg-neutral-900 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2">Şüpheli Adres Senaryosu:</div>
                    <pre className="text-white text-xs">
{`Adres: GCKFBEIYTKP6RCZX...
Durum: Yeni oluşturulmuş hesap
Risk: Yüksek
Öneriler: İşlem yapmayın`}
                    </pre>
                  </div>
                  
                  <div className="bg-neutral-900 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2">Güvenli Token Senaryosu:</div>
                    <pre className="text-white text-xs">
{`Token: USDC
Issuer: Circle (Doğrulanmış)
Durum: Güvenli
TOML: Mevcut ve geçerli`}
                    </pre>
                  </div>
                  
                  <div className="bg-neutral-900 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2">Riskli İşlem Senaryosu:</div>
                    <pre className="text-white text-xs">
{`İşlem: 1000 XLM transfer
Alıcı: Bilinmeyen adres
Risk: Orta seviye
Öneri: Küçük test miktarı gönderin`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Results */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-950 mb-6">
                Analiz Sonucu
              </h2>
              
              <div className="bg-neutral-900 rounded-lg p-6 text-white font-mono text-sm h-96 overflow-y-auto">
                {result ? (
                  <div>
                    <div className="text-green-400 mb-2">{`// StellarSafe Güvenlik Analizi`}</div>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-neutral-400 text-center mt-20">
                    Bir demo butonuna tıklayarak analiz sonucunu görün
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-6">
                  <h3 className="font-semibold text-neutral-950 mb-4">Analysis Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className={`font-semibold ${
                        result.analysis?.riskLevel === 'CRITICAL' ? 'text-red-600' :
                        result.analysis?.riskLevel === 'HIGH' ? 'text-orange-600' :
                        result.analysis?.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {result.analysis?.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommendation:</span>
                      <span className="font-semibold">{result.analysis?.recommendation?.action}</span>
                    </div>
                  </div>
                  
                  {result.analysis?.recommendation?.reasons && (
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-950 mb-2">Risk Factors:</h4>
                      <ul className="space-y-1">
                        {result.analysis.recommendation.reasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                            <span>⚠️</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Transaction recommendations */}
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Security Recommendations:</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Don&apos;t proceed with this transaction</li>
                      <li>• Can&apos;t verify transaction safety</li>
                      <li>• Won&apos;t affect your balance</li>
                      <li>• Doesn&apos;t require additional fees</li>
                      <li>• Can&apos;t be reversed once submitted</li>
                      <li>• Won&apos;t trigger any smart contracts</li>
                      <li>• Doesn&apos;t involve any third parties</li>
                      <li>• Can&apos;t be modified after submission</li>
                      <li>• Won&apos;t affect network congestion</li>
                      <li>• Doesn&apos;t require manual approval</li>
                      <li>• Can&apos;t be cancelled once broadcast</li>
                      <li>• Won&apos;t trigger compliance checks</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Integration"
        title="StellarSafe Entegrasyonu"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          StellarSafe&apos;i projenize nasıl entegre edeceğinizi görün. 
          Widget, extension ve CLI araçlarını kullanarak güvenlik katmanı ekleyin.
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* JavaScript/TypeScript */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-yellow-500 mr-2">🔧</span>
              StellarSafe Widget
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`// StellarSafe Widget entegrasyonu
<script src="stellarsafe-widget.js"></script>

const stellarSafe = new StellarSafeWidget({
  network: 'mainnet'
});

// Adres analizi
stellarSafe.analyzeAddress('GXXXXXXX...')
  .then(result => {
    if (result.riskLevel === 'HIGH') {
      showWarning('Riskli adres tespit edildi!');
    }
  });`}
              </pre>
            </div>
          </div>

          {/* React Hook */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-blue-500 mr-2">🧩</span>
              Browser Extension
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`// StellarSafe Browser Extension
// Otomatik olarak Stellar işlemlerini analiz eder

// Extension yüklendikten sonra:
// 1. Stellar cüzdanınızı bağlayın
// 2. İşlem yapmaya çalıştığınızda otomatik uyarı
// 3. Risk seviyesine göre öneriler

// Desteklenen cüzdanlar:
// - Freighter
// - Albedo  
// - Rabet`}
              </pre>
            </div>
          </div>

          {/* Python */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-green-500 mr-2">⚙️</span>
              CLI Tool
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`# StellarSafe CLI kurulumu
npm install -g @stellarsafe/cli

# Kontrat doğrulama
stellarsafe verify CDLZFC3SYJYDZT...

# Adres analizi
stellarsafe analyze GCKFBEIYTKP6JY4Q...

# Toplu analiz
stellarsafe batch-analyze addresses.txt

# Sonuçları JSON olarak export
stellarsafe export --format json`}
              </pre>
            </div>
          </div>

          {/* cURL */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-gray-500 mr-2">🌐</span>
              Web Dashboard
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`// StellarSafe Web Dashboard
// https://stellarsafe.io/dashboard

Özellikler:
• Cüzdan bağlama (Freighter, Albedo)
• Portfolio güvenlik analizi
• İşlem geçmişi inceleme
• Risk raporları
• Güvenlik önerileri
• Asset doğrulama
• Gerçek zamanlı uyarılar`}
              </pre>
            </div>
          </div>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Comparison"
        title="StellarSafe Özellikleri"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          StellarSafe&apos;in diğer güvenlik çözümlerinden farkını görün. 
          Neden StellarSafe&apos;i tercih etmelisiniz?
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg border border-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="border-b border-neutral-200 px-6 py-4 text-left font-semibold text-neutral-950">
                  Özellik
                </th>
                <th className="border-b border-neutral-200 px-6 py-4 text-center font-semibold text-neutral-500">
                  Diğer Çözümler
                </th>
                <th className="border-b border-neutral-200 px-6 py-4 text-center font-semibold text-blue-600">
                  StellarSafe
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Gerçek Zamanlı Risk Analizi</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Multi-kaynak</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Stellar Expert Entegrasyonu</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Native</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">TOML Doğrulama</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ SEP-20</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Browser Extension</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Otomatik</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Kontrat Doğrulama</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ CLI Tool</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Web Dashboard</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Tam özellikli</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Widget Entegrasyonu</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Kolay kurulum</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Get Started"
        title="Hazır mısınız?"
        className="mt-24 sm:mt-32 lg:mt-40"
        centered
      >
        <p>
          StellarSafe&apos;i hemen kullanmaya başlayın. Stellar ekosisteminde güvenliğinizi artırın.
          Ücretsiz araçlarımızla başlayın.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button href="/dashboard">Dashboard&apos;a Git</Button>
          <Button href="/developer" invert>Kontrat Doğrula</Button>
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          Ücretsiz • Açık kaynak • Topluluk destekli
        </p>
      </SectionIntro>
    </RootLayout>
  );
}