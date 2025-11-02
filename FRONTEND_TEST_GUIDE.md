# 🧪 Frontend Test Rehberi

## 🎯 3 Kolay Test Yöntemi

### 1. 🚀 **Demo Sayfası** (En Kolay)

**URL**: http://localhost:3000/demo

**Ne yapacaksın:**
1. Tarayıcıda demo sayfasını aç
2. 3 hazır senaryo göreceksin:
   - ✅ Safe USDC Payment
   - ⚠️ Risky Unknown Asset  
   - 🚨 Critical - Fake USDC
3. **"Test This Scenario"** butonuna bas
4. Analiz sonuçlarını gör

**Avantaj**: Hazır XDR'ler var, sadece butona basıyorsun!

---

### 2. 🔍 **Manual Analyzer** (Kendi XDR'inle)

**URL**: http://localhost:3000/analyze

**Test için kullanabileceğin XDR'ler:**

#### ✅ **Safe Payment (Native XLM)**
```
AAAAAgAAAABexSIg06FtXzmFBQQtHZsrnyWxUzmthkBEhs/ktoeVYgAAAGQADKI/AAAABAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAABexSIg06FtXzmFBQQtHZsrnyWxUzmthkBEhs/ktoeVYgAAAAAAAAAAAAAAAAmJaAAAAAAAAAAAA==
```
**Beklenen**: SAFE risk level

#### ⚠️ **Risky Trustline (Unknown Asset)**
```
AAAAAgAAAADg3G3hclysZlFitS+s5zWyiiJD5B0STWy5LXCj6i5yxQAAAGQADKI/AAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAABgAAAAFTQ0FNAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAAAAAAvrwAAAAAAAAAAA==
```
**Beklenen**: HIGH risk level

#### 🚨 **Critical Account Merge**
```
AAAAAgAAAABexSIg06FtXzmFBQQtHZsrnyWxUzmthkBEhs/ktoeVYgAAAGQADKI/AAAABQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAACAAAAABexSIg06FtXzmFBQQtHZsrnyWxUzmthkBEhs/ktoeVYgAAAAAAAAAAAA==
```
**Beklenen**: CRITICAL risk level

**Nasıl test edersin:**
1. http://localhost:3000/analyze sayfasını aç
2. Yukarıdaki XDR'lerden birini kopyala
3. "Transaction XDR" kutusuna yapıştır
4. **"Analyze Transaction"** butonuna bas
5. Sonuçları gör!

---

### 3. 🎨 **Asset Explorer** (Asset Test)

**URL**: http://localhost:3000/assets

**Test edebileceğin asset'ler:**

#### ✅ **Circle USDC (Safe)**
- **Asset Code**: `USDC`
- **Issuer**: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
- **Beklenen**: Verified badge, SAFE risk

#### ⚠️ **Unknown Asset (Risky)**  
- **Asset Code**: `TEST`
- **Issuer**: `GDJLBYYKMCXNVVNABOE66NYXQGIA5AC5D223Z2KF6ZEYK4UBCA7FKLTG`
- **Beklenen**: HIGH risk, no home domain

#### 🚨 **Fake USDC (Critical)**
- **Asset Code**: `USDC` 
- **Issuer**: `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- **Beklenen**: CRITICAL risk, blacklisted

**Nasıl test edersin:**
1. Asset Explorer sayfasını aç
2. Search bar'a asset code yaz (örn: "USDC")
3. Sonuçlara tıkla
4. Risk badge'lerini gör

---

## 🛠️ **Manuel API Test** (Developer)

**Browser Console'da:**

```javascript
// Asset analysis test
fetch('/api/analyze/asset', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    assetCode: 'USDC',
    issuerAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
  })
})
.then(r => r.json())
.then(console.log);

// Transaction analysis test  
fetch('/api/analyze/transaction', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    xdr: 'AAAAAgAAAABexSIg06FtXzmFBQQtHZsrnyWxUzmthkBEhs/ktoeVYgAAAGQADKI/AAAABAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAABexSIg06FtXzmFBQQtHZsrnyWxUzmthkBEhs/ktoeVYgAAAAAAAAAAAAAAAAmJaAAAAAAAAAAAA=='
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 📱 **Dashboard Test**

**URL**: http://localhost:3000/dashboard

**Ne göreceksin:**
- Security score widget
- Asset statistics
- Recent analysis results
- Quick action buttons

---

## 🎯 **Beklenen Sonuçlar**

### ✅ **Safe Transaction**
```json
{
  "overallRisk": {
    "level": "SAFE",
    "score": 5
  },
  "threats": []
}
```

### ⚠️ **Risky Asset**
```json
{
  "riskLevel": "HIGH",
  "riskScore": 65,
  "threats": [
    {
      "type": "UNVERIFIED_ISSUER",
      "severity": "HIGH"
    }
  ]
}
```

### 🚨 **Critical Operation**
```json
{
  "overallRisk": {
    "level": "CRITICAL", 
    "score": 95
  },
  "threats": [
    {
      "type": "ACCOUNT_MERGE",
      "severity": "CRITICAL"
    }
  ]
}
```

---

## 🔧 **Troubleshooting**

### Server çalışmıyor mu?
```bash
cd frontend
npm run dev
```

### API response gelmiyor mu?
1. http://localhost:3000/api/health kontrol et
2. Browser console'da error var mı bak
3. Network tab'de request'leri kontrol et

### Supabase bağlantısı yok mu?
1. `.env.local` dosyasında credentials doğru mu?
2. http://localhost:3000/api/assets/stats test et

---

## 🎬 **Demo Video Senaryosu**

1. **Demo sayfasını aç** → 3 senaryo göster
2. **"Critical - Fake USDC"** seçeneğini test et
3. **Sonuçları göster**: 🚨 CRITICAL risk
4. **Analyze sayfasını aç** → Manuel XDR test et
5. **Asset Explorer** → USDC ara, verified badge göster

**Total süre**: 2-3 dakika, etkileyici demo!

---

## 📋 **Quick Test Checklist**

- [ ] Demo sayfası açılıyor
- [ ] 3 senaryo test ediliyor  
- [ ] Analyze sayfasında XDR test ediliyor
- [ ] Asset Explorer'da arama çalışıyor
- [ ] Risk badge'leri doğru renklerde
- [ ] API response'lar gelişiyor
- [ ] Loading state'ler çalışıyor

---

**En kolay test**: Demo sayfasını aç, butona bas! 🚀**
