# 🚀 Contract Deploy Rehberi

## 📋 Stellar Laboratory ile Deploy

### Adım 1: Laboratory'ye Git
**URL:** https://laboratory.stellar.org/#?network=test

### Adım 2: Transaction Builder
1. "Transaction Builder" sekmesi
2. Network: **Test** (mutlaka!)
3. Source Account: Testnet account gerekli

### Adım 3: Account Oluştur (Eğer yoksa)
```
1. "Generate Keypair" butonuna bas
2. Public Key'i kopyala
3. "Fund with Friendbot" butonuna bas
4. Secret Key'i kaydet (güvenli yerde)
```

### Adım 4: Operation Ekle
1. "Add Operation" butonu
2. Operation Type: **"Upload Contract WASM"**
3. WASM File: Browse ile dosyayı seç
   - Path: `/Users/ahmetbugrakurnaz/Desktop/stellarostim/test-contract/target/wasm32v1-none/release/test_contract.wasm`

### Adım 5: Transaction Sign
1. "Sign Transaction" butonu
2. Secret Key gir (Adım 3'ten)
3. "Submit Transaction" butonu

### Adım 6: Contract ID Al
Deploy başarılı olunca:
1. Transaction hash görünecek
2. "View in Horizon" linkine tıkla
3. Operations bölümünde Contract ID'yi bul
4. Contract ID'yi kopyala (CXXXXX... formatında)

---

## 🔧 Freighter Wallet ile (Kolay)

Eğer Freighter extension'ı varsa:

### Adım 1-3: Aynı (Laboratory + Network + Account)

### Adım 4: Freighter ile Sign
1. Operation ekledikten sonra
2. "Sign with Freighter" butonuna bas
3. Freighter popup'ında "Approve" bas

---

## 📝 Beklenen Sonuç

Deploy başarılı olunca şuna benzer bir Contract ID alacaksın:
```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Bu ID'yi aldığında bana söyle, hemen verification test yaparız!

---

## 🆘 Sorun Giderme

### Problem: "Account not found"
- Friendbot ile account fund et
- Public key doğru mu kontrol et

### Problem: "Invalid WASM"
- WASM dosyası doğru mu?
- File size 10MB'dan küçük mü?

### Problem: "Transaction failed"
- Network testnet mi?
- Account'ta XLM var mı?

---

## 🎯 Sonraki Adım

Contract ID'yi aldıktan sonra:

1. **Yeni verification code al:**
```bash
curl -X POST http://localhost:3002/api/verify/generate \
  -H "Content-Type: application/json" \
  -d '{"contractId": "YOUR_REAL_CONTRACT_ID", "network": "testnet"}'
```

2. **CLI ile verify et:**
```bash
cd test-contract
stellarsafe verify NEW_CODE --api-url http://localhost:3002
```

3. **WASM_MATCH kontrolü geçecek!** ✅

---

**Şimdi Laboratory'ye git ve deploy et! 🚀**
