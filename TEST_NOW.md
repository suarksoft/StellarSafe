# 🧪 Contract Verification - ŞİMDİ TEST ET!

## 🎯 Durum Raporu

✅ **CLI Tool:** Hazır ve çalışıyor
✅ **Contract WASM:** Build edilmiş
✅ **Native Contract ID:** Elimizde var
⚠️ **Frontend:** Build hatası var (düzeltildi, restart gerekiyor)

---

## 🚀 ŞİMDİ İKİ YÖNTEMDEN BİRİNİ SEÇ

### YÖNTEM A: Full Test (UI + CLI) - 10 Dakika

**Adım 1: Frontend'i Restart Et**

Yeni bir terminal aç ve şunu çalıştır:
```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim
chmod +x START_FRONTEND.sh
./START_FRONTEND.sh
```

**Adım 2: Browser'da Developer Sayfasını Aç**
```
http://localhost:3000/developer
```

**Adım 3: Contract ID Gir**
```
Contract ID: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
Network: testnet
```

**Adım 4: Generate Code Butonuna Bas**
- 6-haneli bir kod alacaksın (örn: X7K9M2)

**Adım 5: CLI ile Verify Et**
```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/stellar-contract
stellarsafe verify YOUR_CODE
```

---

### YÖNTEM B: CLI Testi (Hızlı Debug) - 2 Dakika

Frontend olmadan CLI'ın ne topladığını görelim:

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/stellar-contract

# CLI'ın bilgi toplama işini test et
stellarsafe verify TEST123 2>&1 | head -50
```

Bu komut:
- ✅ WASM hash'i toplar
- ✅ Source file'ları listeler  
- ✅ Git bilgilerini çıkarır
- ✅ Rust/Soroban versiyonlarını algılar
- ❌ API'ye submit ederken hata verir (çünkü TEST123 geçerli bir kod değil)

Ama bu bize CLI'ın düzgün çalıştığını gösterir!

---

## 🔍 CLI'ın Ne Topladığını Görmek İçin

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim

cat > test-cli-collector.js << 'EOF'
// CLI collector'ın topladığı bilgileri görelim
const { exec } = require('child_process');
const path = require('path');

console.log('🔍 CLI Collector Test\n');
console.log('Contract directory:', path.resolve('./stellar-contract'));
console.log('');

// WASM dosyasını kontrol et
const fs = require('fs');
const wasmPath = './stellar-contract/target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm';

if (fs.existsSync(wasmPath)) {
  const stats = fs.statSync(wasmPath);
  console.log('✅ WASM dosyası bulundu:');
  console.log('   Path:', wasmPath);
  console.log('   Size:', stats.size, 'bytes');
  console.log('   Modified:', stats.mtime.toISOString());
  console.log('');
  
  // Hash hesapla
  const crypto = require('crypto');
  const wasmContent = fs.readFileSync(wasmPath);
  const hash = crypto.createHash('sha256').update(wasmContent).digest('hex');
  console.log('   SHA-256:', hash);
  console.log('');
} else {
  console.log('❌ WASM dosyası bulunamadı');
}

// Source file'ları listele
exec('find ./stellar-contract/src -name "*.rs"', (err, stdout) => {
  if (!err && stdout) {
    const files = stdout.trim().split('\n');
    console.log('✅ Kaynak dosyaları:', files.length, 'adet');
    files.forEach(f => console.log('   -', f));
    console.log('');
  }
});

// Git bilgilerini al
exec('cd stellar-contract && git rev-parse --short HEAD 2>/dev/null', (err, stdout) => {
  if (!err && stdout) {
    console.log('✅ Git Commit:', stdout.trim());
  } else {
    console.log('⚠️  Git commit alınamadı');
  }
});

exec('cd stellar-contract && git config --get remote.origin.url 2>/dev/null', (err, stdout) => {
  if (!err && stdout) {
    console.log('✅ Git Remote:', stdout.trim());
  } else {
    console.log('⚠️  Git remote alınamadı');
  }
});

exec('cd stellar-contract && git rev-parse --abbrev-ref HEAD 2>/dev/null', (err, stdout) => {
  if (!err && stdout) {
    console.log('✅ Git Branch:', stdout.trim());
    console.log('');
  } else {
    console.log('⚠️  Git branch alınamadı\n');
  }
  
  // Versiyonları al
  exec('rustc --version', (err, stdout) => {
    console.log('✅ Rust:', stdout ? stdout.trim() : 'Bulunamadı');
  });
  
  exec('soroban --version', (err, stdout) => {
    console.log('✅ Soroban:', stdout ? stdout.trim() : 'Bulunamadı');
  });
});
EOF

node test-cli-collector.js
```

---

## 🎯 Beklenen Sonuç

### CLI Başarılı Output:
```
🚀 StellarSafe Contract Verification

Collecting contract information...
✓ WASM hash: a1b2c3d4e5f6...
✓ WASM size: 18578 bytes
✓ Source files: 8 files
✓ Git commit: abc123f
✓ Git remote: https://github.com/...
✓ Rust version: 1.75.0
✓ Soroban version: 22.0.1

Submitting to StellarSafe API...
✓ Verification request submitted!

Verification Code: X7K9M2
Status: PENDING → COMPLETED

🎉 CONTRACT VERIFIED!

View details: https://stellarsafe.io/contract/CABCD...
```

### CLI Hata Durumları:

**1. "Invalid verification code"**
- Code yanlış yazılmış
- Code expire olmuş (30 dakika)
- Code kullanılmış

**2. "WASM file not found"**
- Contract build edilmemiş
- Path yanlış

**3. "Git repository required"**
- Directory git repo değil
- `git init` yapılmamış

**4. "API connection failed"**
- Frontend çalışmıyor
- Network problemi
- Port 3000 açık değil

---

## 💡 Hızlı Sorun Giderme

### Problem: Frontend başlamıyor
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Problem: CLI bulunamıyor
```bash
cd cli-tool
npm run build
npm link
stellarsafe --version
```

### Problem: WASM hash mismatch
```
Bu normal! Farklı build environment'lar farklı hash üretir.
Production'da developer kendi environment'ında build ediyor,
bu yüzden hash'ler match etmeli.

Test için: Mock bir contract kullan ya da
database'e manuel insert yap.
```

---

## 🚀 Şimdi Dene!

Hangi yöntemi seçiyorsun?

**A) Full Test:** `./START_FRONTEND.sh` çalıştır
**B) CLI Debug:** `node test-cli-collector.js` çalıştır

Bana hangi adımdasın söyle, yardımcı olayım! 🎯

