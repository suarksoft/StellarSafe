# 🛡️ Wallet Risk Analysis System

## Genel Bakış

StellarSafe, kullanıcıların kripto gönderimi yapmadan önce hedef cüzdan adresinin güvenlik riskini analiz eder ve AI destekli açıklamalar sunar.

## 🎯 Özellikler

### 1. Otomatik Risk Analizi
- Kullanıcı bir adres girdiğinde otomatik olarak analiz başlatılır
- 1 saniye debounce ile gereksiz API çağrıları önlenir
- Real-time analiz sonuçları gösterilir

### 2. Çok Katmanlı Risk Değerlendirmesi

#### Risk Faktörleri:
1. **Hesap Yaşı** (20% ağırlık)
   - Yeni hesaplar (0-7 gün): Yüksek risk
   - Orta yaşlı hesaplar (30-90 gün): Orta risk
   - Eski hesaplar (90+ gün): Güvenilir

2. **Transaction Geçmişi** (20% ağırlık)
   - Hiç transaction yok: Şüpheli
   - Az transaction (5-20): Dikkatli olun
   - Çok transaction (50+): Güvenilir

3. **Hesap Aktivitesi** (15% ağırlık)
   - Uzun süredir aktif değil: Terk edilmiş olabilir
   - Düzenli aktivite: Normal kullanıcı
   - Yoğun aktivite: Aktif trader

4. **Bilinen Adres Kontrolü** (40% ağırlık) - EN ÖNEMLİ
   - Bilinen scammer: KRİTİK RİSK - Göndermekten kaçının
   - Doğrulanmış exchange: Güvenilir
   - Bilinmeyen: Dikkatli olun

5. **Multi-Signature** (5% ağırlık)
   - Multi-sig aktif: Çok güvenli
   - Tek signer: Normal güvenlik

#### Risk Seviyeleri:
- **SAFE** (0-30): ✅ Güvenli - Gönderim yapabilirsiniz
- **LOW** (31-50): ✓ Düşük risk - Normal işlem
- **MEDIUM** (51-70): ⚡ Orta risk - Dikkatli olun
- **HIGH** (71-85): ⚠️ Yüksek risk - Küçük miktarla test edin
- **CRITICAL** (86-100): 🛑 Kritik risk - GÖNDERMEYİN!

### 3. AI Destekli Açıklamalar

Mock AI Explainer (API key olmadan):
- Risk seviyesine özel Türkçe açıklamalar
- Kullanıcı dostu tavsiyeler
- Risk azaltma yöntemleri

Gerçek AI Entegrasyonu (Opsiyonel):
- OpenAI GPT-4 veya Claude API
- Daha detaylı ve dinamik analizler
- Kişiselleştirilmiş öneriler

## 🔧 Teknik Mimari

```
┌─────────────────────────────────────────┐
│         SendAssetModal.tsx              │
│  (Kullanıcı hedef adres girer)         │
└──────────────┬──────────────────────────┘
               │
               ↓ (1 saniye debounce)
┌──────────────────────────────────────────┐
│      WalletRiskAnalyzer.ts               │
│  • On-chain data çeker (Stellar API)    │
│  • Risk faktörlerini hesaplar            │
│  • Toplam risk skoru oluşturur           │
└──────────────┬───────────────────────────┘
               │
               ↓ (Analiz sonucu)
┌──────────────────────────────────────────┐
│      AIRiskExplainer.ts (Opsiyonel)     │
│  • Mock AI açıklama (default)           │
│  • OpenAI/Claude API (API key varsa)    │
│  • Türkçe açıklamalar üretir            │
└──────────────┬───────────────────────────┘
               │
               ↓ (Analiz + AI açıklama)
┌──────────────────────────────────────────┐
│      UI - Risk Kartı                     │
│  • Risk seviyesi badge                   │
│  • AI açıklama ve tavsiyeler             │
│  • Teknik detaylar (toggle)              │
│  • Uyarılar ve pozitif işaretler         │
└──────────────────────────────────────────┘
               │
               ↓ (Gönder butonuna basıldığında)
┌──────────────────────────────────────────┐
│      Ek Güvenlik Kontrolleri             │
│  • CRITICAL risk: Confirm dialog         │
│  • HIGH risk: Warning dialog             │
│  • Diğer seviyeler: Normal gönderim      │
└──────────────────────────────────────────┘
```

## 📦 Dosya Yapısı

```
frontend/src/lib/analyzer/
├── walletRiskAnalyzer.ts       # Ana risk analiz motoru
│   ├── WalletRiskAnalyzer      # Analiz sınıfı
│   ├── RiskLevel enum          # Risk seviyeleri
│   ├── RiskFactors interface   # Risk faktörleri
│   └── Helper functions        # UI helpers
│
└── aiRiskExplainer.ts          # AI açıklama servisi
    ├── AIRiskExplainer         # Gerçek AI (OpenAI/Claude)
    └── getMockAIExplanation    # Mock AI (API key gerekmez)
```

## 🚀 Kullanım

### 1. Temel Kullanım (Mock AI - API Key Gerekmez)

Şu anda sistem mock AI kullanıyor. Hiçbir API key gerekmiyor ve tamamen ücretsiz çalışıyor.

```typescript
// SendAssetModal.tsx içinde otomatik olarak çalışıyor
// Kullanıcı adres girdiğinde:
const analyzer = new WalletRiskAnalyzer(isTestnet);
const result = await analyzer.analyzeWallet(destination);
const aiExp = getMockAIExplanation(result);
```

### 2. Gerçek AI Kullanımı (Opsiyonel)

OpenAI veya Claude API key'i varsa:

```typescript
// .env.local dosyasına ekle:
NEXT_PUBLIC_OPENAI_API_KEY=sk-...

// SendAssetModal.tsx'te değiştir:
import { AIRiskExplainer } from '@/lib/analyzer/aiRiskExplainer';

const explainer = new AIRiskExplainer(
  process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  'openai' // veya 'claude'
);
const aiExp = await explainer.explainRisk(result);
```

## 🔍 Test Senaryoları

### Senaryo 1: Yeni Oluşturulmuş Hesap (HIGH RISK)
```
Adres: Yeni testnet hesabı (0 gün, 0 tx)
Beklenen Risk: HIGH veya CRITICAL
AI Açıklama: "Çok yeni hesap - dikkatli olun"
Tavsiye: "Küçük miktarla test yapın"
```

### Senaryo 2: Aktif Trader Hesabı (LOW RISK)
```
Adres: 90+ gün, 50+ transaction
Beklenen Risk: LOW veya SAFE
AI Açıklama: "Normal kullanıcı - güvenilir"
Tavsiye: "Normal şekilde gönderim yapabilirsiniz"
```

### Senaryo 3: Exchange Adresi (SAFE)
```
Adres: Bilinen exchange adresi (KNOWN_SAFE_ADDRESSES)
Beklenen Risk: SAFE
AI Açıklama: "Doğrulanmış güvenilir adres"
Tavsiye: "Memo eklemeyi unutmayın"
```

### Senaryo 4: Scammer Adresi (CRITICAL)
```
Adres: Bilinen scam (KNOWN_SCAM_ADDRESSES)
Beklenen Risk: CRITICAL
AI Açıklama: "BİLİNEN SCAMMER ADRESİ"
Tavsiye: "GÖNDERMEYİN!"
```

## 📊 Risk Skoru Hesaplama Formülü

```
Total Risk Score = (
  knownScammer.risk × 0.40 +      // %40
  accountAge.risk × 0.20 +         // %20
  transactionHistory.risk × 0.20 + // %20
  accountActivity.risk × 0.15 +    // %15
  multiSig.risk × 0.05             // %5
)
```

## 🎨 UI Gösterimi

### Risk Kartı Renkleri:
- **CRITICAL**: Red (bg-red-50, text-red-700, border-red-300)
- **HIGH**: Orange (bg-orange-50, text-orange-700, border-orange-300)
- **MEDIUM**: Yellow (bg-yellow-50, text-yellow-700, border-yellow-300)
- **LOW**: Blue (bg-blue-50, text-blue-700, border-blue-300)
- **SAFE**: Green (bg-green-50, text-green-700, border-green-300)

### Gösterilen Bilgiler:
1. Risk seviyesi badge + emoji
2. Risk skoru (0-100)
3. Ana recommendation
4. AI açıklama ve tavsiyeler
5. Teknik detaylar (toggle ile açılır):
   - Uyarılar listesi
   - Pozitif işaretler
   - Risk faktörleri breakdown
   - Detaylı AI analizi
   - Risk azaltma yöntemleri

## 🔐 Güvenlik Önlemleri

1. **Kritik Risk Kontrolü**: CRITICAL risk seviyesinde confirm dialog gösterilir
2. **Yüksek Risk Uyarısı**: HIGH risk seviyesinde warning dialog gösterilir
3. **Adres Validasyonu**: Stellar adres formatı kontrol edilir (G ile başlayan 56 karakter)
4. **Debounce**: Gereksiz API çağrıları önlenir (1 saniye)
5. **Error Handling**: Analiz başarısız olursa kullanıcıya hata gösterilir

## 🚧 Gelecek Geliştirmeler

### Öncelikli:
1. **Scam Database Entegrasyonu**
   - Stellar Blacklist API
   - Community-driven scam reports
   - Otomatik güncellemeler

2. **Machine Learning Model**
   - Transaction pattern analysis
   - Anomaly detection
   - Predictive risk scoring

3. **Gerçek AI Entegrasyonu**
   - OpenAI GPT-4 Turbo
   - Claude 3 Sonnet/Opus
   - Daha akıllı açıklamalar

### Orta Vadeli:
4. **Sosyal Kanıt**
   - GitHub/Twitter bağlantıları
   - Domain ownership verification
   - Social signals integration

5. **Community Feedback**
   - User ratings
   - Scam reports
   - Trust score

6. **Advanced Analytics**
   - Network graph analysis
   - Fund flow tracing
   - Linked address detection

### Uzun Vadeli:
7. **Blockchain Intelligence**
   - Chainalysis entegrasyonu
   - AML screening
   - Sanctions list check

## 📝 Notlar

- Şu anda sistem **mock AI** kullanıyor - ücretsiz ve API key gerektirmiyor
- Gerçek AI entegrasyonu tamamen opsiyonel
- Risk analizi tamamen on-chain data'ya dayanıyor
- Kullanıcı her zaman final kararı verir
- Sistem sadece bilgilendirme ve uyarı amaçlıdır

## 🧪 Test Etme

1. Defense Wallet sayfasına git: `/defense-wallet`
2. "Kripto Gönder" butonuna tıkla
3. Hedef adres alanına bir Stellar adresi gir
4. 1 saniye bekle - otomatik analiz başlayacak
5. Risk kartını ve AI açıklamalarını gör
6. Teknik detayları aç ve incele
7. Farklı risk seviyelerindeki adresleri dene

## 💡 İpuçları

- **Yeni hesaplar**: Testnet'te yeni hesap oluştur - HIGH risk göreceksin
- **Eski hesaplar**: Mainnet'te eski exchange adresi dene - SAFE göreceksin
- **Mock scam test**: Code'da KNOWN_SCAM_ADDRESSES'e test adresi ekle
- **AI açıklamaları**: getMockAIExplanation fonksiyonunu özelleştir

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Discord: #stellarsafe-support
- Email: support@stellarsafe.io
