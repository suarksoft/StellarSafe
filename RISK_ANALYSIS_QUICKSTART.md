# 🚀 Wallet Risk Analysis - Quick Start

## Neler Eklendi?

### 🛡️ Otomatik Güvenlik Analizi
Kullanıcı bir cüzdana kripto göndermek istediğinde **otomatik olarak** risk analizi yapılır ve **AI destekli açıklamalar** sunulur.

---

## 📦 Eklenen Dosyalar

### 1. `/frontend/src/lib/analyzer/walletRiskAnalyzer.ts`
**Ana risk analiz motoru** - 600+ satır

**Ne yapar?**
- Stellar Horizon API'den on-chain data çeker
- 5 farklı risk faktörü analiz eder:
  - Hesap yaşı (yeni = riskli)
  - Transaction geçmişi (az = şüpheli)
  - Hesap aktivitesi (pasif = terk edilmiş?)
  - Bilinen adres kontrolü (scam database)
  - Multi-signature güvenliği
- 0-100 risk skoru hesaplar
- 5 seviye risk kategorisi: SAFE, LOW, MEDIUM, HIGH, CRITICAL

**Key Features:**
```typescript
const analyzer = new WalletRiskAnalyzer(isTestnet);
const result = await analyzer.analyzeWallet(destinationAddress);

// Result:
{
  riskLevel: 'MEDIUM',
  riskScore: 65,
  recommendation: '⚡ UYARI: Orta seviye risk...',
  warnings: ['⚠️ Çok yeni hesap', '📊 Yetersiz transaction'],
  greenFlags: ['✅ Aktif kullanıcı'],
  factors: { ... }
}
```

### 2. `/frontend/src/lib/analyzer/aiRiskExplainer.ts`
**AI açıklama servisi** - 300+ satır

**Ne yapar?**
- Mock AI (API key gerekmez) - Default
- OpenAI GPT-4 entegrasyonu (opsiyonel)
- Claude API entegrasyonu (opsiyonel)
- Türkçe açıklamalar üretir
- Kullanıcı dostu tavsiyeler verir

**Kullanım:**
```typescript
// Mock AI (ücretsiz, API key yok)
const aiExp = getMockAIExplanation(analysis);

// Gerçek AI (OpenAI/Claude API key gerekli)
const explainer = new AIRiskExplainer(apiKey, 'openai');
const aiExp = await explainer.explainRisk(analysis);
```

### 3. `/frontend/src/components/wallet/SendAssetModal.tsx` (Güncellendi)
**Send modal'a risk analizi entegrasyonu**

**Yeni özellikler:**
- Destination adres girildiğinde otomatik analiz (1 saniye debounce)
- Real-time risk kartı gösterimi
- AI destekli açıklamalar
- Teknik detaylar (toggle ile açılır)
- CRITICAL risk: Confirm dialog
- HIGH risk: Warning dialog

---

## 🎯 Nasıl Çalışıyor?

### Kullanıcı Akışı:

```
1. Kullanıcı "Kripto Gönder" butonuna tıklar
   ↓
2. Alıcı adresi girer (Stellar public key)
   ↓
3. [1 saniye bekleme - debounce]
   ↓
4. Otomatik risk analizi başlar
   ├─> Stellar API'den data çeker
   ├─> Risk faktörlerini hesaplar
   ├─> AI açıklama oluşturur
   └─> Risk kartı gösterilir
   ↓
5. Kullanıcı risk kartını görür:
   ├─> Risk seviyesi (SAFE/LOW/MEDIUM/HIGH/CRITICAL)
   ├─> Risk skoru (0-100)
   ├─> AI açıklama ve tavsiyeler
   └─> Teknik detaylar (toggle)
   ↓
6. Kullanıcı "Gönder" butonuna basar:
   ├─> CRITICAL: "⛔ Bu adrese GÖNDERMEYİN!" dialog
   ├─> HIGH: "⚠️ Yüksek risk!" warning dialog
   └─> Diğer: Normal gönderim
   ↓
7. Transaction gerçekleşir (veya iptal edilir)
```

---

## 🔍 Risk Seviyeleri

| Seviye | Skor | Emoji | Açıklama |
|--------|------|-------|----------|
| **SAFE** | 0-30 | ✅ | Güvenli - Gönderim yapabilirsiniz |
| **LOW** | 31-50 | ✓ | Düşük risk - Normal işlem |
| **MEDIUM** | 51-70 | ⚡ | Orta risk - Dikkatli olun |
| **HIGH** | 71-85 | ⚠️ | Yüksek risk - Küçük miktarla test edin |
| **CRITICAL** | 86-100 | 🛑 | Kritik risk - GÖNDERMEYİN! |

---

## 🧪 Test Et

### 1. Defense Wallet'a Git
```bash
npm run dev
# http://localhost:3000/defense-wallet
```

### 2. Freighter ile Bağlan
- Freighter extension'ı aç
- Testnet veya Mainnet seç
- Defense Wallet'a bağlan

### 3. "Kripto Gönder" Butonuna Tıkla

### 4. Test Adresleri Dene

**Yeni Hesap (HIGH RISK):**
- Testnet'te yeni bir hesap oluştur
- 0 gün, 0 transaction
- Beklenen: HIGH veya CRITICAL risk

**Eski Hesap (LOW/SAFE):**
- Mainnet'te eski bir exchange adresi
- 90+ gün, 50+ transaction
- Beklenen: LOW veya SAFE risk

**Aktif Olmayan Hesap (MEDIUM):**
- 6 ay önce son transaction
- Beklenen: MEDIUM risk

---

## 📊 Risk Faktörleri

### 1. Hesap Yaşı (20% ağırlık)
```
0 gün      → 80 risk → YÜKSEK RİSK
1-7 gün    → 60 risk → Çok yeni hesap
7-30 gün   → 40 risk → Yeni hesap
30-90 gün  → 20 risk → Orta yaşlı
90+ gün    → 0 risk  → Güvenilir
```

### 2. Transaction Geçmişi (20% ağırlık)
```
0 tx       → 70 risk → Şüpheli
1-5 tx     → 50 risk → Çok az
5-20 tx    → 30 risk → Az
20-50 tx   → 10 risk → İyi
50+ tx     → 0 risk  → Zengin geçmiş
```

### 3. Hesap Aktivitesi (15% ağırlık)
```
180+ gün inaktif → 50 risk → Terk edilmiş?
90+ gün inaktif  → 30 risk → Bir süredir pasif
Payment/Tx > 0.8 → 5 risk  → Aktif kullanıcı
```

### 4. Bilinen Adres Kontrolü (40% ağırlık) ⚡ EN ÖNEMLİ
```
Scam adresi     → 100 risk → ⛔ GÖNDERMEYİN!
Güvenilir adres → 0 risk   → ✅ Doğrulanmış
Bilinmeyen      → 20 risk  → Dikkatli olun
```

### 5. Multi-Signature (5% ağırlık)
```
3+ signer  → 0 risk  → Çok güvenli
2 signer   → 10 risk → Güvenli
1 signer   → 20 risk → Normal
```

---

## 🎨 UI Önizleme

### SAFE (Yeşil)
```
┌────────────────────────────────────────┐
│ ✅ SAFE                   Risk: 15/100 │
├────────────────────────────────────────┤
│ ✅ Güvenli adres. Gönderim             │
│    yapabilirsiniz.                     │
├────────────────────────────────────────┤
│ 🤖 AI Analiz                           │
│ Bu adres güvenli görünüyor...          │
│                                        │
│ 💡 Tavsiyeler:                         │
│ • Güvenle gönderim yapabilirsiniz      │
│ • Exchange'e gönderiyorsanız memo      │
│   eklemeyi unutmayın                   │
└────────────────────────────────────────┘
```

### HIGH (Turuncu)
```
┌────────────────────────────────────────┐
│ ⚠️ HIGH                   Risk: 78/100 │
├────────────────────────────────────────┤
│ ⚠️ DİKKAT: Yüksek riskli adres.       │
│    Küçük miktarla test edin.           │
├────────────────────────────────────────┤
│ 🤖 AI Analiz                           │
│ Bu adres yüksek risk içeriyor...       │
│                                        │
│ 💡 Tavsiyeler:                         │
│ • Önce küçük test miktarı gönderin     │
│ • Alıcının adresi doğrulamasını isteyin│
│ • Memo alanına açıklama ekleyin        │
├────────────────────────────────────────┤
│ ⚠️ Uyarılar:                           │
│ • Çok yeni hesap                       │
│ • Yetersiz transaction geçmişi         │
└────────────────────────────────────────┘
```

### CRITICAL (Kırmızı)
```
┌────────────────────────────────────────┐
│ 🛑 CRITICAL              Risk: 95/100  │
├────────────────────────────────────────┤
│ 🛑 UYARI: Bu adrese GÖNDERMEYİN!      │
│    Çok yüksek risk tespit edildi.      │
├────────────────────────────────────────┤
│ 🤖 AI Analiz                           │
│ Bu adres son derece tehlikeli...       │
│                                        │
│ 💡 Tavsiyeler:                         │
│ • Bu adrese GÖNDERMEYİN                │
│ • Alıcıyla alternatif kanaldan         │
│   iletişim kurun                       │
│ • Scam olabilir - rapor edin           │
├────────────────────────────────────────┤
│ ⛔ Uyarılar:                           │
│ • Bilinen scammer adresi!              │
│ • Hiç transaction yok                  │
│ • Yeni oluşturulmuş hesap              │
└────────────────────────────────────────┘
```

---

## 🔧 Özelleştirme

### Scam Adresi Ekle
`walletRiskAnalyzer.ts` dosyasında:
```typescript
const KNOWN_SCAM_ADDRESSES = new Set([
  'GASCAMMERADDRESSEXAMPLE1234567890ABCDEFGH',
  'GYOURSCAMADDRESSHERE1234567890ABCDEFGH', // Ekle
]);
```

### Güvenilir Adres Ekle
```typescript
const KNOWN_SAFE_ADDRESSES = new Set([
  'GBINANCE1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'GKRAKEN1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'GYOUREXCHANGEADDRESS1234567890ABCDEFGH', // Ekle
]);
```

### AI Açıklamalarını Özelleştir
`aiRiskExplainer.ts` dosyasında `getMockAIExplanation` fonksiyonunu düzenle.

### Risk Ağırlıklarını Ayarla
`walletRiskAnalyzer.ts` içinde:
```typescript
const weights = {
  knownScammer: 0.4,      // %40 → İstersen değiştir
  accountAge: 0.2,        // %20
  transactionHistory: 0.2, // %20
  accountActivity: 0.15,   // %15
  multiSig: 0.05,         // %5
};
```

---

## 🚀 Gerçek AI Kullan (Opsiyonel)

### OpenAI API Entegrasyonu

1. **API Key Al:**
   - https://platform.openai.com/api-keys
   - Yeni key oluştur

2. **.env.local'e Ekle:**
```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

3. **SendAssetModal.tsx'te Değiştir:**
```typescript
// Mock AI yerine gerçek AI kullan
import { AIRiskExplainer } from '@/lib/analyzer/aiRiskExplainer';

// analyzeDestination fonksiyonu içinde:
const explainer = new AIRiskExplainer(
  process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  'openai'
);
const aiExp = await explainer.explainRisk(result);
// setAiExplanation(aiExp); // Mock yerine gerçek AI
```

### Claude API Entegrasyonu

1. **API Key Al:**
   - https://console.anthropic.com/
   - API key oluştur

2. **.env.local'e Ekle:**
```bash
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
```

3. **SendAssetModal.tsx'te Değiştir:**
```typescript
const explainer = new AIRiskExplainer(
  process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  'claude' // OpenAI yerine Claude
);
```

---

## 📝 Önemli Notlar

### ✅ Şu An Çalışıyor:
- Mock AI açıklamaları (ücretsiz, API key yok)
- On-chain data analizi
- 5 seviye risk kategorisi
- Otomatik analiz (1 saniye debounce)
- Risk kartı gösterimi
- CRITICAL/HIGH risk dialog'ları

### ⏰ Opsiyonel:
- Gerçek AI entegrasyonu (OpenAI/Claude)
- Scam database API
- Machine learning model
- Community feedback

### 🔒 Güvenlik:
- Kullanıcı her zaman final kararı verir
- Sistem sadece bilgilendirme amaçlıdır
- Yüksek risk durumlarında ekstra uyarı
- Transaction'dan önce onay

---

## 🐛 Troubleshooting

### Analiz Çalışmıyor
- Console'da error var mı kontrol et
- Stellar API'ye erişilebiliyor mu?
- Adres formatı doğru mu? (G ile başlayan 56 karakter)

### Risk Kartı Görünmüyor
- 1 saniye bekle (debounce)
- Adres 56 karakter mi?
- Console'da "🔍 Analyzing wallet" mesajı var mı?

### AI Açıklaması Yok
- Mock AI kullanılıyor mu?
- getMockAIExplanation return ediyor mu?
- Console'da error var mı?

---

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için:
- `/WALLET_RISK_ANALYSIS.md` - Tam teknik dokümantasyon
- `/frontend/src/lib/analyzer/walletRiskAnalyzer.ts` - Code comments
- `/frontend/src/lib/analyzer/aiRiskExplainer.ts` - AI servisi

---

## 🎉 Özet

✅ **Çalışıyor:** Kullanıcı cüzdan adresine gönderim yapmadan önce otomatik risk analizi yapılıyor

✅ **AI Destekli:** Mock AI açıklamaları (gerçek AI opsiyonel)

✅ **5 Risk Seviyesi:** SAFE → LOW → MEDIUM → HIGH → CRITICAL

✅ **Kullanıcı Dostu:** Türkçe açıklamalar, renkli kartlar, tavsiyeler

✅ **Güvenlik:** Yüksek risk durumlarında ekstra uyarı

Test et ve feedback ver! 🚀
