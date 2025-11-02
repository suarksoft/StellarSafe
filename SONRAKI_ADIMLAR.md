# 🚀 Sonraki Adımlar - Contract Verification

## ✅ Tamamlanan İşler

1. ✅ Backend API'ler hazır
2. ✅ Frontend UI hazır
3. ✅ Database schema hazır
4. ✅ CLI tool kodu yazıldı
5. ✅ CLI tool build edildi
6. ✅ TypeScript hataları düzeltildi
7. ✅ Dependencies yüklendi
8. ✅ Komutlar çalışıyor

---

## 🎯 Şimdi Yapılacaklar

### 1. CLI'ı Global Kur (5 dakika)

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/cli-tool
npm link

# Test et:
stellarsafe --version
stellarsafe --help
```

### 2. Frontend Başlat (2 dakika)

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/frontend
npm run dev

# Tarayıcıda aç:
# http://localhost:3000/developer
```

### 3. Test Contract ID Al (3 dakika)

İki seçenek var:

**Seçenek A: Mevcut Contract Kullan**
```bash
# Native XLM token (testnet):
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

**Seçenek B: Yeni Contract Deploy Et**
```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/stellar-contract

# Build (zaten built):
ls target/wasm32-unknown-unknown/release/*.wasm

# Deploy:
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source admin \
  --network testnet

# Contract ID'yi kaydet
```

### 4. Verification Code Al (2 dakika)

```bash
# 1. Tarayıcıda: http://localhost:3000/developer

# 2. Form doldur:
Contract ID: [YUKARI ADIMDAKI ID]
Network: testnet

# 3. "Generate Verification Code" tıkla

# 4. Kodu kopyala (örn: X7K9M2)
```

### 5. CLI Çalıştır (3 dakika)

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/stellar-contract

stellarsafe verify X7K9M2 --api-url http://localhost:3000

# VEYA compiled version:
node ../cli-tool/dist/index.js verify X7K9M2 --api-url http://localhost:3000
```

**Beklenen çıktı:**
```
🔒 StellarSafe Contract Verification
═══════════════════════════════════════

Verification Code: X7K9M2
Project Directory: /Users/.../stellar-contract
API Endpoint: http://localhost:3000

📦 Collecting contract information...

✓ WASM binary found: stellarsafe_registry.wasm
  Hash: abc123def456...
  Size: 18.15 KB

✓ Found 8 source files
  Source hash: def456abc123...

✓ Git commit: 1a2b3c4d
  Branch: main
  Remote: https://github.com/user/repo

✓ Rust version: rustc 1.70.0
  Soroban CLI: soroban 20.0.0

─────────────────────────────────────

📋 Collected Information:
  Contract Name:  stellarsafe_registry
  WASM Hash:      abc123def456...
  WASM Size:      18.15 KB
  Source Files:   8 files
  ...

─────────────────────────────────────

📡 Submitting verification to API...
✓ Verification data submitted

─────────────────────────────────────

🔍 Verification Results:

  ✓ WASM_MATCH         PASSED
  ✓ PUBLIC_SOURCE      PASSED
  ✓ SOURCE_FILES       PASSED
  ✓ BUILD_ENV          PASSED
  ✓ WASM_SIZE         PASSED
  ✓ BUILD_RECENCY     PASSED

─────────────────────────────────────

✓ CONTRACT VERIFIED SUCCESSFULLY! 🎉

Your contract has been verified and will receive a verified badge.

View your contract: http://localhost:3000/contract/CABCD...
```

### 6. Sonuçları Kontrol Et (2 dakika)

**A) Tarayıcıda:**
- Developer sayfası auto-update olmalı
- Yeşil success message görünmeli
- Tüm check'ler PASSED olmalı

**B) Database'de:**
```bash
# Supabase Dashboard'da:
# Tables → verified_contracts
# En son kaydı kontrol et
```

**C) Contract sayfasında:**
```
http://localhost:3000/contract/[CONTRACT_ID]
# Verified badge görünmeli
```

---

## 🔍 Muhtemel Sorunlar ve Çözümler

### Sorun 1: "WASM binary not found"

**Çözüm:**
```bash
cd stellar-contract
soroban contract build
# VEYA:
cargo build --target wasm32-unknown-unknown --release
```

### Sorun 2: "Contract not found on Stellar network"

**Çözüm:**
```bash
# Contract'ı yeniden deploy et:
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source admin \
  --network testnet
```

### Sorun 3: "Cannot connect to server"

**Çözüm:**
```bash
# Frontend çalışıyor mu kontrol et:
curl http://localhost:3000/api/health

# Yoksa başlat:
cd frontend && npm run dev
```

### Sorun 4: "Invalid verification code"

**Çözüm:**
- Kod 30 dakika içinde kullanılmalı
- Yeni kod al: http://localhost:3000/developer
- Kodu doğru kopyala (6 karakter, büyük harf)

### Sorun 5: "Supabase client not initialized"

**Çözüm:**
```bash
# .env.local dosyasını kontrol et:
cd frontend
cat .env.local

# Olması gerekenler:
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# Yoksa oluştur:
cp .env.example .env.local
# Değerleri düzenle
```

### Sorun 6: "WASM_MATCH FAILED"

**Muhtemel sebepler:**
- WASM dosyası değiştirildi ama yeniden deploy edilmedi
- Başka bir WASM dosyası deploy edildi
- Hash hesaplama formatı farklı

**Çözüm:**
```bash
# Aynı WASM'ı yeniden deploy et:
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source admin \
  --network testnet
```

### Sorun 7: "PUBLIC_SOURCE FAILED"

**Sebepler:**
- Git repository private
- Remote URL yok
- GitHub değil (GitLab, Bitbucket)

**Çözüm:**
```bash
# Git remote kontrol et:
cd stellar-contract
git remote -v

# Yoksa ekle:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/user/repo
git push -u origin main

# Repository'yi public yap GitHub'da
```

---

## 📊 Test Checklist

### Pre-Test
- [ ] Frontend running (`npm run dev`)
- [ ] Supabase configured (`.env.local`)
- [ ] Contract built (`.wasm` file exists)
- [ ] Git initialized

### Test Adımları
- [ ] Contract ID alındı
- [ ] Verification code oluşturuldu
- [ ] CLI çalıştırıldı
- [ ] Tüm checks PASSED
- [ ] Database'e kaydedildi
- [ ] UI güncellendi
- [ ] Contract page'de badge var

### Post-Test
- [ ] Logs kontrol edildi
- [ ] Errors olmadı
- [ ] Performance OK (<20 saniye)
- [ ] Database temiz

---

## 🎯 Başarı Kriterleri

Test **başarılı** sayılır eğer:

1. ✅ CLI data collection çalışırsa
2. ✅ API submission başarılı olursa
3. ✅ 6 check'ten en az 4'ü PASSED olursa
4. ✅ Database'e doğru kaydedilirse
5. ✅ UI auto-update çalışırsa
6. ✅ Contract page badge gösterirse

---

## 📝 Test Sonrası

Test başarılı olursa:

### 1. CLI'ı NPM'e Publish Et
```bash
cd cli-tool
npm login
npm publish
```

### 2. Documentation Güncelle
- README'ye production URL'ler ekle
- Example contract ID'ler ekle
- Screenshots ekle

### 3. Production Deploy
```bash
cd frontend
vercel deploy --prod
```

### 4. Duyuru Yap
- Blog post
- Twitter/X
- Discord
- Stellar Forum

---

## ⏰ Tahmini Süre

**Toplam:** ~20-30 dakika

- Setup: 10 dakika
- Test: 5-10 dakika
- Troubleshooting: 5-10 dakika

---

## 🎉 Sonuç

Sistem **%95 hazır**! Son %5 sadece test ve doğrulama.

**Hemen başlayabilirsin:**
```bash
cd cli-tool && npm link
cd ../frontend && npm run dev
```

**Başarılar!** 🚀

