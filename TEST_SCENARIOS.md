# StellarSafe Test Scenarios

Bu dosyada extension'ı test etmek için kullanabileceğin gerçek senaryolar var.

## 🧪 Hızlı Test: Demo Sayfası

**En kolay test yöntemi:**

1. Frontend'i başlat: `cd frontend && npm run dev`
2. Tarayıcıda aç: http://localhost:3000/demo
3. 3 hazır senaryo göreceksin
4. "Test This Scenario" butonuna bas
5. Analiz sonuçlarını görüntüle

## 🔬 Stellar Laboratory ile Test

### Senaryo 1: ✅ Safe Payment (Circle USDC)

**Adımlar:**
1. https://laboratory.stellar.org/#?network=test aç
2. Transaction Builder → Start
3. Source Account: [Senin testnet adresin]
4. Transaction Sequence Number: [Auto-fetch]
5. Add Operation → Payment
   - Destination: `GDJLBYYKMCXNVVNABOE66NYXQGIA5AC5D223Z2KF6ZEYK4UBCA7FKLTG`
   - Asset: Custom
   - Asset Code: `USDC`
   - Issuer: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
   - Amount: `10`
6. Sign in Transaction Signer → Sign with Freighter

**Beklenen Sonuç:**
```
Risk Level: SAFE ✅
Risk Score: 0-20
Threats: 0
Message: "This is verified USDC from Circle. Safe to proceed."
```

---

### Senaryo 2: ⚠️ Risky Trustline (Unknown Asset)

**Adımlar:**
1. Stellar Laboratory → Transaction Builder
2. Source Account: [Senin adresin]
3. Add Operation → Change Trust
   - Asset Code: `SCAM`
   - Issuer: `GAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQBAQ` (fake address)
   - Trust Limit: `1000`
4. Sign with Freighter

**Beklenen Sonuç:**
```
Risk Level: HIGH ⚠️
Risk Score: 60-80
Threats: 2-3
- UNVERIFIED_ISSUER: No home domain found
- NEW_ISSUER: Account created recently
- No stellar.toml file
```

---

### Senaryo 3: 🚨 Critical - Account Merge

**Adımlar:**
1. Stellar Laboratory → Transaction Builder
2. Source Account: [Test account - dikkatli ol!]
3. Add Operation → Account Merge
   - Destination: `GDJLBYYKMCXNVVNABOE66NYXQGIA5AC5D223Z2KF6ZEYK4UBCA7FKLTG`
4. Sign with Freighter

**Beklenen Sonuç:**
```
Risk Level: CRITICAL 🚨
Risk Score: 90-100
Threats: 1
- ACCOUNT_MERGE: This operation will merge your account and transfer all funds. 
  Account will be permanently closed. This is IRREVERSIBLE.
Recommendation: "DO NOT PROCEED unless you fully understand this operation."
```

---

### Senaryo 4: 🔴 Blacklisted Asset (Fake USDC)

**Gerçek test için database'e fake USDC ekle:**

```sql
-- Supabase SQL Editor'da çalıştır
INSERT INTO blacklisted_assets (asset_code, issuer_address, reason, threat_level, verified_scam)
VALUES (
  'USDC',
  'GFAKEISSUERFAKEISSUERFAKEISSUERFAKEISSUERFAKEISS',
  'Impersonating Circle USDC - Known scam',
  'CRITICAL',
  TRUE
);
```

**Test:**
1. Stellar Laboratory → Change Trust
   - Asset Code: `USDC`
   - Issuer: `GFAKEISSUERFAKEISSUERFAKEISSUERFAKEISSUERFAKEISS`
2. Sign with Freighter

**Beklenen Sonuç:**
```
Risk Level: CRITICAL 🚨
Risk Score: 100
Threats: 2
- BLACKLISTED_ASSET: This asset is blacklisted
- NAME_IMPERSONATION: This looks like USDC but isn't from Circle
  Real USDC issuer: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
```

---

### Senaryo 5: 🟡 Medium Risk - Set Options (Signer Change)

**Adımlar:**
1. Stellar Laboratory → Transaction Builder
2. Source Account: [Senin adresin]
3. Add Operation → Set Options
   - Add Signer:
     - Public Key: `GDJLBYYKMCXNVVNABOE66NYXQGIA5AC5D223Z2KF6ZEYK4UBCA7FKLTG`
     - Weight: `1`
4. Sign with Freighter

**Beklenen Sonuç:**
```
Risk Level: MEDIUM 🟡
Risk Score: 40-60
Threats: 1
- Adding New Signer: A new signer is being added to your account.
  New signers can control your account based on threshold settings.
  Only add signers you fully trust.
```

---

## 🎬 Video Test Senaryosu (Demo için)

**"Scammer'dan korunma" demo:**

1. **Başlangıç**: "Ben yeni bir Stellar kullanıcısıyım. Birisi bana DEX'te USDC trade etmemi söyledi."

2. **Trustline açma**: Stellar Lab'de fake USDC'ye trustline aç
   - Asset Code: `USDC`
   - Issuer: `GFAKEXXXXXX`

3. **StellarSafe devreye girer**: 🛡️ Modal açılır
   ```
   🚨 CRITICAL RISK!
   
   ⚠️ This is NOT real USDC
   ⚠️ Name impersonation detected
   ⚠️ Issuer is blacklisted
   
   Real USDC: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
   
   ❌ Cancel Transaction
   ```

4. **Sonuç**: "StellarSafe beni fake USDC scam'inden korudu! ✅"

---

## 📊 Extension Debug Mode

Console'da extension log'larını görmek için:

```javascript
// Browser console'da
localStorage.setItem('stellarsafe-debug', 'true');

// Log'ları göreceksin:
// ✅ StellarSafe: Freighter detected
// ✅ StellarSafe: Intercepted signTransaction
// ✅ StellarSafe: Analysis complete
```

---

## 🔧 Custom Test Scenarios Oluşturma

Kendi test XDR'lerini oluşturmak için:

```javascript
// Node.js veya browser console'da
const StellarSdk = require('@stellar/stellar-sdk');

// Keypair oluştur
const source = StellarSdk.Keypair.random();
const destination = StellarSdk.Keypair.random();

// Transaction oluştur
const account = await server.loadAccount(source.publicKey());
const transaction = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET
})
.addOperation(StellarSdk.Operation.payment({
  destination: destination.publicKey(),
  asset: StellarSdk.Asset.native(),
  amount: '100'
}))
.setTimeout(180)
.build();

// XDR al
console.log(transaction.toXDR());
```

---

## ✅ Test Checklist

Her senaryo için kontrol et:

- [ ] Modal açıldı
- [ ] Risk level doğru gösterildi
- [ ] Risk score mantıklı (0-100)
- [ ] Threat'ler listelenmiş
- [ ] Explanation'lar anlaşılır
- [ ] Operation detayları görünüyor
- [ ] Cancel butonu çalışıyor (transaction iptal oluyor)
- [ ] Proceed butonu çalışıyor (Freighter normal devam ediyor)

---

## 🐛 Known Issues (Bilinen Sorunlar)

1. **First load delay**: İlk intercepted transaction 1-2 saniye gecikmeli olabilir (normal)
2. **Modal styling**: Bazı site'larda CSS conflict olabilir (z-index'i yükselttik)
3. **Freighter detection**: Sayfa yüklenmeden önce transaction yaparsan intercept olmayabilir

---

## 🎓 Eğitim İçin Kullanım

Workshop/sunum için önerilen sıra:

1. ✅ Safe transaction → "Normal kullanım, problem yok"
2. ⚠️ Unknown asset → "Dikkat et, doğrulanmamış"
3. 🚨 Fake USDC → "TEHLIKE! Scam detected"
4. 🔴 Account merge → "Bu geri alınamaz, çok dikkatli ol"

Her biri için before/after karşılaştırması yap:
- **StellarSafe olmadan**: Kullanıcı fark etmeden imzalıyor → para kaybı
- **StellarSafe ile**: Uyarı alıyor → bilinçli karar veriyor → para güvende

---

## 🏆 Başarı Kriterleri

Extension başarılı sayılır eğer:

- ✅ %100 CRITICAL threat'leri yakalar
- ✅ %95+ HIGH threat'leri yakalar
- ✅ %90+ MEDIUM threat'leri yakalar
- ✅ False positive < %5 (gerçekten safe transaction'ları engellemez)
- ✅ Analysis time < 3 saniye
- ✅ User experience smooth (lag yok)

---

Happy Testing! 🚀
