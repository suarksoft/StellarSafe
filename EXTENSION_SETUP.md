# StellarSafe Extension - Setup Guide

## 🚀 Quick Start (5 dakika)

### Adım 1: Supabase Credentials Ekle

1. **Supabase projesini aç**: https://app.supabase.com
2. Project Settings → API sayfasına git
3. **Project URL** ve **anon public key** kopyala
4. `frontend/.env.local` dosyasını aç ve değerleri yapıştır:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

### Adım 2: Frontend'i Başlat

```bash
cd frontend
npm install
npm run dev
```

Tarayıcıda aç: http://localhost:3000

✅ Health check: http://localhost:3000/api/health

### Adım 3: Extension'ı Yükle

**Chrome:**
1. Chrome'u aç → `chrome://extensions/`
2. Sağ üstte **Developer mode** toggle'ı aktif et
3. **Load unpacked** butonuna tıkla
4. `extension` klasörünü seç
5. Extension yüklendi! 🎉

**Firefox:**
1. Firefox'u aç → `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on** tıkla
3. `extension/manifest.json` dosyasını seç
4. Extension yüklendi! 🎉

### Adım 4: Freighter Wallet Kur

Extension'ın çalışması için Freighter gerekli:

1. Chrome Web Store'dan yükle: https://www.freighter.app/
2. Yeni wallet oluştur veya import et
3. **Testnet** moduna geç (Settings → Network → Testnet)

### Adım 5: Test Et! 🧪

**Yöntem 1: Demo Sayfası** (En kolay)
1. http://localhost:3000/demo sayfasına git
2. 3 farklı senaryo göreceksin:
   - ✅ Safe USDC Payment
   - ⚠️ Risky Unknown Asset
   - 🚨 Critical - Fake USDC
3. "Test This Scenario" butonuna bas
4. Analiz sonuçlarını gör

**Yöntem 2: Stellar Laboratory** (Gerçek test)
1. https://laboratory.stellar.org/#?network=test aç
2. Transaction Builder'a git
3. Test transaction oluştur (örnek aşağıda)
4. "Sign in Transaction Signer" tıkla
5. "Sign with Freighter" seç
6. 🛡️ **StellarSafe modal'ı açılacak!** 
7. Risk analizi göreceksin
8. Cancel veya Proceed seç

---

## 📝 Test Transaction Örnekleri

### Safe Transaction - Verified USDC

```
Source Account: [Senin testnet adresin]
Operation: Payment
Destination: GDJLBYYKMCXNVVNABOE66NYXQGIA5AC5D223Z2KF6ZEYK4UBCA7FKLTG
Asset: USDC (GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN)
Amount: 10
```

Expected result: ✅ SAFE - Low risk, verified asset

### Risky Transaction - Unknown Asset

```
Source Account: [Senin testnet adresin]
Operation: Change Trust
Asset Code: SCAM
Issuer: GAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQ (fake address)
Limit: 1000
```

Expected result: ⚠️ HIGH - Unverified issuer, no TOML

### Critical Transaction - Account Merge

```
Source Account: [Senin testnet adresin]
Operation: Account Merge
Destination: [Random address]
```

Expected result: 🚨 CRITICAL - Irreversible, account will be closed

---

## 🔍 Extension Nasıl Çalışıyor?

### Akış:

```
1. Freighter'da "Sign" butonuna basıyorsun
   ↓
2. StellarSafe transaction'ı intercept ediyor
   ↓
3. XDR API'ye gönderiliyor (localhost:3000/api/analyze/transaction)
   ↓
4. Backend analiz yapıyor:
   - Asset issuer kontrol
   - Flag'ler (AUTH_REVOCABLE, etc)
   - Blacklist/whitelist check
   - Operation type analizi
   ↓
5. Risk skoru hesaplanıyor (0-100)
   ↓
6. Warning modal açılıyor
   ↓
7. Sen karar veriyorsun:
   - ❌ Cancel → Transaction iptal
   - ✅ Proceed → Normal Freighter signing devam ediyor
```

### Dosya Yapısı:

```
extension/
├── manifest.json         # Extension config
├── injected.js          # Freighter'ı intercept eder (page context)
├── content.js           # Message bridge (extension context)
├── background.js        # API calls yapar (service worker)
├── popup.html/js        # Extension icon popup UI
└── icons/               # Extension iconları (HAZIR ✅)
```

---

## 🐛 Troubleshooting

### Extension çalışmıyor
```bash
# 1. Console'u kontrol et
chrome://extensions/ → StellarSafe → "Inspect views: service worker"

# 2. API health check
curl http://localhost:3000/api/health

# 3. Extension'ı reload et
chrome://extensions/ → StellarSafe → Reload button
```

### Modal görünmüyor
1. Extension popup'ı aç (icon'a tıkla)
2. "Enable Protection" toggle'ının ON olduğunu kontrol et
3. "Show Warnings" toggle'ının ON olduğunu kontrol et

### API bağlantı hatası
```bash
# Frontend çalışıyor mu?
lsof -i :3000

# Çalışmıyorsa:
cd frontend
npm run dev

# background.js'teki API_BASE_URL'i kontrol et (should be localhost:3000)
```

### Freighter bulunamadı
1. Freighter extension yüklü mü? → chrome://extensions/
2. Freighter aktif mi? (icon toolbar'da görünüyor mu?)
3. Sayfa yenile (Ctrl+R / Cmd+R)

---

## ✅ Test Checklist

- [ ] Frontend çalışıyor (http://localhost:3000)
- [ ] Supabase bağlantısı çalışıyor (Assets sayfasında veriler görünüyor)
- [ ] Extension yüklendi
- [ ] Freighter yüklendi (testnet mode)
- [ ] Demo sayfası çalışıyor
- [ ] Extension popup açılıyor ve stats gösteriyor
- [ ] Stellar Lab'de test transaction oluştur
- [ ] Sign butonuna bas
- [ ] 🎉 StellarSafe modal açıldı!

---

## 🎯 Sonraki Adımlar

Artık sistem çalışıyor! Şunları deneyebilirsin:

1. **Asset Explorer**: http://localhost:3000/assets
   - Verified ve blacklisted asset'leri gör
   
2. **Transaction Analyzer**: http://localhost:3000/analyze
   - Manuel XDR analizi yap
   
3. **Dashboard**: http://localhost:3000/dashboard
   - Portfolio özet sayfası

4. **Extension ile canlı test**:
   - Gerçek Stellar dApp'leri ziyaret et (testnet)
   - Transaction'ları dene
   - StellarSafe korumasını gör

---

## 🚢 Production'a Deploy (İleride)

### Frontend (Vercel)
```bash
vercel --prod
```

### Extension (Chrome Web Store)
```bash
cd extension
# background.js'te API_BASE_URL'i production'a değiştir
zip -r stellarsafe-extension.zip .
# Chrome Web Store Developer Console'a yükle
```

---

## 📚 Kaynaklar

- **Stellar Docs**: https://developers.stellar.org
- **Freighter Docs**: https://docs.freighter.app
- **Supabase Docs**: https://supabase.com/docs
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions

---

Made with ❤️ for Stellar Community

