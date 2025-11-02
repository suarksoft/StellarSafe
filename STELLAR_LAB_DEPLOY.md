# 🧪 Stellar Laboratory ile Contract Deploy

## 🎯 Plan
Stellar Laboratory kullanarak contract deploy edip, sonra verification sistemini test edeceğiz.

---

## 📋 Adım Adım Rehber

### 1. WASM Dosyasını Hazırla

Test contract'ımız hazır:
```
Path: /Users/ahmetbugrakurnaz/Desktop/stellarostim/test-contract/target/wasm32v1-none/release/test_contract.wasm
Hash: 57fd076e45f76c1b2ca7d7324271d1d36db621f4dd270e95e66327fdf7323704
Size: ~18KB
```

### 2. Stellar Laboratory'ye Git

**URL:** https://laboratory.stellar.org/#?network=test

### 3. Transaction Builder Kullan

**Adımlar:**
1. "Transaction Builder" sekmesini seç
2. Network: **Test** (önemli!)
3. Source Account: Herhangi bir testnet account (ya da yeni oluştur)

### 4. Operation Ekle

**Operation Type:** "Upload Contract WASM"
1. "Add Operation" butonuna bas
2. "Upload Contract WASM" seç
3. WASM dosyasını upload et: `test_contract.wasm`

### 5. Transaction'ı Sign Et

1. "Sign Transaction" butonuna bas
2. Secret key gir (testnet account'ın)
3. Transaction'ı submit et

### 6. Contract ID Al

Transaction başarılı olunca:
1. Transaction hash'i kopyala
2. Horizon'da transaction'ı ara
3. Operations kısmından Contract ID'yi al

---

## 🔧 Alternatif: Freighter Wallet Kullan

Eğer Freighter wallet varsa:

1. Laboratory'de "Sign with Freighter" seç
2. Wallet'ı connect et
3. Transaction'ı approve et

---

## 📝 Beklenen Sonuç

Deploy başarılı olunca şuna benzer bir Contract ID alacaksın:
```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Bu ID'yi alınca:

1. ✅ Contract ID'yi kaydet
2. ✅ Frontend'e git: http://localhost:3000/developer
3. ✅ Contract ID'yi gir
4. ✅ Verification code al
5. ✅ CLI ile verify et

---

## 🚀 Şimdi Ne Yap?

1. **Stellar Laboratory'ye git:** https://laboratory.stellar.org/#?network=test
2. **WASM dosyasını hazırla:** `/Users/ahmetbugrakurnaz/Desktop/stellarostim/test-contract/target/wasm32v1-none/release/test_contract.wasm`
3. **Deploy et**
4. **Contract ID'yi bana söyle**

Ben de o sırada frontend'i hazır hale getireyim! 🎯
