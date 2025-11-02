# 🔍 Real vs Mock Data Analizi

## 🎯 **DURUM ANALİZİ**

### ✅ **GERÇEK VERİ (Horizon API)**
```json
{
  "stellar": {
    "connected": true,
    "network": "testnet"  // ← GERÇEK STELLAR TESTNET
  }
}
```

**Circle USDC Test:**
```json
{
  "accountAge": 42,  // ← GERÇEK HORIZON VERİSİ
  "flags": {
    "auth_revocable": false  // ← GERÇEK FLAG VERİSİ
  }
}
```

### ⚠️ **KARIŞIK DURUM: Demo XDR'ler**

**Problem**: `scenarios.ts` dosyasındaki XDR'ler **sahte/test** XDR'leri!

```typescript
// scenarios.ts'deki XDR:
xdr: 'AAAAAgAAAADg3G3hclysZlFitS+s5zWyiiJD5B0STWy5LXCj6i5yxQ...'

// Bu XDR'de fake issuer var:
issuer: 'GAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBA'  // ← FAKE!
```

---

## 🔧 **ÇÖZÜM: GERÇEK XDR OLUŞTUR**

### **Yöntem 1: Stellar Laboratory** (En Kolay)

1. **Git**: https://laboratory.stellar.org/#?network=test
2. **Transaction Builder** seç
3. **Source Account**: Senin gerçek testnet adresin gir
4. **Add Operation** → **Payment** seç:
   - **Destination**: `GDJLBYYKMCXNVVNABOE66NYXQGIA5AC5D223Z2KF6ZEYK4UBCA7FKLTG`
   - **Asset**: Native (XLM)
   - **Amount**: `10`
5. **Sign in Transaction Signer** tıkla
6. **XDR'i kopyala** ve test et!

### **Yöntem 2: Freighter ile Gerçek Transaction**

1. **Freighter wallet** aç
2. **Send** butonuna bas
3. **Gerçek bir transaction** oluştur (küçük miktar)
4. **Sign** butonuna basmadan önce **Network tab**'ı aç
5. **XDR'i yakala** ve test et

---

## 📊 **MEVCUT DATA KAYNAKLARI**

### ✅ **%100 GERÇEK**
- **Horizon API calls** (account age, flags, balances)
- **Database queries** (whitelist/blacklist)
- **TOML verification** (stellar.toml files)

### ⚠️ **MOCK/TEST DATA**
- **Demo scenarios XDRs** (fake transactions)
- **Some issuer addresses** (GAQBAQBA... fake addresses)

### 🎯 **HYBRID (Gerçek + Test)**
- **Asset analysis** → Gerçek Horizon data + Test scenarios
- **Transaction parsing** → Gerçek parser + Fake XDRs

---

## 🧪 **GERÇEK TEST SENARYOLARI**

### **Senaryo 1: Gerçek Circle USDC**
```bash
# Asset Analysis (GERÇEK VERİ)
curl -X POST /api/analyze/asset -d '{
  "assetCode": "USDC",
  "issuerAddress": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
}'

# Response: GERÇEK account age, flags, domain
```

### **Senaryo 2: Gerçek Transaction XDR**
```bash
# Stellar Lab'den aldığın gerçek XDR:
curl -X POST /api/analyze/transaction -d '{
  "xdr": "SENIN_GERCEK_XDR_IN"
}'
```

### **Senaryo 3: Gerçek Risky Asset**
```bash
# Testnet'te gerçek ama risky bir asset:
curl -X POST /api/analyze/asset -d '{
  "assetCode": "TEST",
  "issuerAddress": "GDJLBYYKMCXNVVNABOE66NYXQGIA5AC5D223Z2KF6ZEYK4UBCA7FKLTG"
}'
```

---

## 🎯 **SENIN İÇİN GERÇEK TEST PLANI**

### **Adım 1: Gerçek Testnet Account Oluştur**
```bash
# Freighter'da testnet account oluştur
# Friendbot'tan XLM al: https://laboratory.stellar.org/#account-creator?network=test
```

### **Adım 2: Gerçek XDR Oluştur**
```bash
# Stellar Lab → Transaction Builder
# Senin account → Küçük payment → XDR al
```

### **Adım 3: Test Et**
```bash
# Gerçek XDR'inle:
curl -X POST http://localhost:3000/api/analyze/transaction \
  -H "Content-Type: application/json" \
  -d '{"xdr": "SENIN_GERCEK_XDR_IN"}'
```

---

## 🔍 **NEDEN BAZI XDR'LER ÇALIŞMIYOR?**

### **Muhtemel Sebepler:**

1. **Invalid XDR Format**
   ```
   Error: "Invalid XDR encoding"
   ```

2. **Wrong Network**
   ```
   # XDR mainnet için ama sen testnet kullanıyorsun
   ```

3. **Expired Transaction**
   ```
   # XDR'deki time bounds geçmiş olabilir
   ```

4. **Invalid Account**
   ```
   # Source account testnet'te yok
   ```

---

## ✅ **DOĞRU TEST YÖNTEMİ**

### **Frontend Test için:**

1. **Demo sayfası** → Mevcut scenarios çalışıyor (fake data ama parser test için yeterli)
2. **Analyze sayfası** → Gerçek asset'lerle test et:
   - USDC: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
   - AQUA: `GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA`

### **Extension Test için:**

1. **Freighter yükle**
2. **Testnet'e geç**
3. **Gerçek transaction yap**
4. **StellarSafe intercept'i gör**

---

## 🎯 **ÖZET**

**Mevcut Durum:**
- ✅ **API backend**: %100 gerçek Stellar data
- ⚠️ **Demo XDRs**: Test/mock data (parser test için)
- ✅ **Asset analysis**: Gerçek Horizon API

**Senin Yapman Gereken:**
1. Stellar Lab'de gerçek XDR oluştur
2. Gerçek asset'lerle test et
3. Extension'ı Freighter ile test et

**Sonuç**: Backend gerçek, demo data test amaçlı! 🎯
