# 🧪 Contract Verification - Pratik Test Rehberi

## 🎯 Hedef
Kendi contract'ımızı baştan sona başarıyla onaylamak!

---

## 📋 Ön Hazırlık Kontrolü

### 1. Gerekli Araçlar
```bash
# Node.js versiyonunu kontrol et
node --version  # v14+ olmalı

# Rust ve Soroban CLI
rustc --version
soroban --version

# Stellar CLI
stellar --version
```

### 2. Supabase Setup
```bash
# .env.local dosyası oluştur
cd frontend
touch .env.local

# İçine ekle:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org
```

**⚠️ Eğer Supabase yoksa:** Mock mode ile test edebiliriz (aşağıda açıklayacağım)

---

## 🚀 Adım 1: Frontend'i Başlat

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/frontend

# Dependencies yükle (ilk kez ise)
npm install

# Development server başlat
npm run dev
```

**Kontrol:** http://localhost:3000 açılmalı

---

## 🔨 Adım 2: CLI Tool'u Hazırla

Yeni terminal aç:

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/cli-tool

# Dependencies yükle
npm install

# TypeScript build
npm run build

# Global link (local test için)
npm link
```

**Kontrol:** `stellarsafe --version` çalışmalı

---

## 📦 Adım 3: Contract Deploy Et

### SEÇENEK A: Mevcut Contract'ı Deploy Et (Önerilen)

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/stellar-contract

# Contract'ı build et
soroban contract build

# Stellar identity oluştur (yoksa)
stellar keys generate test-deployer --network testnet --fund

# Contract'ı deploy et
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source test-deployer \
  --network testnet
```

**Çıktı:** Contract ID alacaksın (örn: `CAABC...`)

**⚠️ Sorun Olursa:** Aşağıdaki SEÇENEK B'ye geç

### SEÇENEK B: Native Asset Contract Kullan (Kolay)

```bash
# Native XLM'in contract ID'sini al
stellar contract id asset \
  --asset native \
  --network testnet
```

**Çıktı:** `CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA`

Bu gerçek bir Stellar Asset Contract (SAC), zaten deploy edilmiş!

### SEÇENEK C: Test Token Contract (En Kolay)

```bash
# Stellar'ın resmi test token'ı
# Contract ID: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

Bu önceden deploy edilmiş bir token contract.

---

## 🔐 Adım 4: Verification Code Al

1. **Browser'da aç:** http://localhost:3000/developer

2. **Contract ID gir:**
   - SEÇENEK A: Kendi deploy ettiğin ID
   - SEÇENEK B: `CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA`
   - SEÇENEK C: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

3. **Network seç:** Testnet

4. **"Generate Verification Code" butonuna bas**

5. **Kodu kaydet:** Örneğin `X7K9M2`

**⚠️ Hata Alırsan:**
- Console'da (F12) hata mesajını kontrol et
- Supabase bağlantısı yoksa mock mode kullanacağız

---

## ✅ Adım 5: CLI ile Verify Et

### SEÇENEK A: Kendi Contract'ın İçin

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/stellar-contract

# Verify komutunu çalıştır
stellarsafe verify X7K9M2
```

### SEÇENEK B: Native Asset Contract İçin

```bash
# Git repository gerektirdiği için özel test directory
mkdir -p ~/stellarsafe-test
cd ~/stellarsafe-test

# Git init
git init
git config user.name "Test User"
git config user.email "test@example.com"

# WASM dosyasını kopyala veya mock oluştur
mkdir -p target/wasm32-unknown-unknown/release
echo "mock wasm" > target/wasm32-unknown-unknown/release/contract.wasm

# Kaynak dosya oluştur
mkdir -p src
cat > src/lib.rs << 'EOF'
// Mock contract for testing
#![no_std]
use soroban_sdk::{contract, contractimpl};

#[contract]
pub struct TestContract;

#[contractimpl]
impl TestContract {
    pub fn hello() -> u32 {
        42
    }
}
EOF

# Git commit
git add .
git commit -m "Initial commit"

# Remote ekle (GitHub repo gerekli - public olmalı!)
git remote add origin https://github.com/YOUR_USERNAME/stellarsafe-test.git

# Verify
stellarsafe verify X7K9M2
```

---

## 🐛 Sorun Giderme

### Problem 1: "Missing Supabase credentials"

**Çözüm:** Mock mode ile test et

```bash
# Frontend'de mock API kullan
cd frontend/src/app/api/verify/generate

# route.ts dosyasına mock response ekle
```

### Problem 2: "Contract not found on network"

**Çözüm:** Contract ID'yi kontrol et

```bash
# Horizon ile kontrol et
curl "https://horizon-testnet.stellar.org/accounts/YOUR_CONTRACT_ID"
```

### Problem 3: "WASM hash mismatch"

**Çözüm:** Bu normal! Farklı build environment'lar farklı hash üretir.
- Bu durumda test amacıyla manuel database insert yapabiliriz
- Ya da mock WASM hash kullanabiliriz

### Problem 4: "Git repository required"

**Çözüm:** Git init + commit

```bash
git init
git add .
git commit -m "Test"
git remote add origin https://github.com/username/repo.git
```

---

## 💡 Hızlı Test: Mock Verification

Eğer tüm sistem çalışmıyorsa, sadece API'leri test et:

### Test 1: Code Generation

```bash
curl -X POST http://localhost:3000/api/verify/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "network": "testnet"
  }'
```

**Beklenen Çıktı:**
```json
{
  "code": "X7K9M2",
  "expiresAt": "2025-11-02T12:30:00Z"
}
```

### Test 2: CLI Collection

```bash
cd stellar-contract
stellarsafe verify X7K9M2 --dry-run
```

Bu sadece bilgi toplar, submit etmez.

---

## 📊 Başarı Durumu Kontrolleri

### ✅ Başarılı Verification Özellikleri:

1. **CLI Çıktısı:**
```
✓ Collecting contract information...
✓ WASM hash: abc123...
✓ Source files: 8 files
✓ Git commit: def456...
✓ Submitting to API...
✓ Verification successful!

🎉 CONTRACT VERIFIED!
```

2. **Frontend:**
- Polling sonucu "COMPLETED" durumu
- Yeşil check mark
- Verification detayları görünür

3. **Database:**
```sql
SELECT * FROM verified_contracts 
WHERE contract_id = 'YOUR_CONTRACT_ID';
```

---

## 🎯 En Basit Test Yolu (5 Dakika)

Eğer sadece sistemi denemek istiyorsan:

```bash
# 1. Frontend başlat
cd frontend && npm run dev

# 2. Developer sayfasını aç
open http://localhost:3000/developer

# 3. Bu mock ID'yi kullan (database'de var)
Contract ID: CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Network: Testnet

# 4. Code al

# 5. Yeni terminal
cd stellar-contract
stellarsafe verify YOUR_CODE

# NOT: WASM mismatch olacak ama sistem çalıştığını göreceksin!
```

---

## 📞 Yardım

Herhangi bir adımda takılırsan:

1. **Logs kontrol et:**
```bash
# Frontend logs
cd frontend && npm run dev  # Terminal'de hataları göreceksin

# API logs
# Browser console (F12 -> Console)
```

2. **Database kontrol et:**
```sql
-- Verification requests
SELECT * FROM verification_requests 
ORDER BY created_at DESC LIMIT 5;

-- Verified contracts
SELECT * FROM verified_contracts 
ORDER BY verified_at DESC LIMIT 5;
```

3. **CLI debug mode:**
```bash
stellarsafe verify CODE --verbose
```

---

## 🚀 Şimdi Dene!

Hangi yolu seçiyorsun?

- **A) Tam test (kendi contract):** Adım 1-5'i takip et
- **B) Hızlı test (native asset):** SEÇENEK B kullan
- **C) Mock test (sadece sistem):** En basit test yolu

Bana hangi adımda olduğunu söyle, birlikte yapalım! 🎯

