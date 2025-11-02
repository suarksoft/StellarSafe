# Contract Deployment ve Contract ID Alma Rehberi

## 🚀 Hızlı Başlangıç - Testnet'e Deploy

### 1. Contract'ı Build Et

```bash
cd stellar-contract
soroban contract build
```

Bu komut `target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm` dosyasını oluşturur.

### 2. Soroban CLI'yi Kontrol Et

```bash
soroban --version
```

Eğer yoksa:
```bash
cargo install --locked --version 20.1.0 soroban-cli
```

### 3. Testnet Secret Key Oluştur (İlk Kez)

```bash
# Yeni bir key pair oluştur
soroban keys generate test-key

# Key'i fund et (testnet tokens için)
soroban keys fund test-key --network testnet
```

Ya da mevcut bir key kullan:
```bash
# Mevcut key'leri listele
soroban keys list

# Yeni key ekle
soroban keys add test-key
# Secret key'i gir: S...
```

### 4. Contract'ı Deploy Et

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source test-key \
  --network testnet
```

**Output örneği:**
```
Contract successfully deployed
Contract ID: CABCDEF123456789ABCDEF123456789ABCDEF123456789ABCDEF1234567890
```

### 5. Contract ID'yi Kopyala

Yukarıdaki çıktıdan **Contract ID**'yi kopyala. Bu ID'yi `/developer` sayfasında kullanabilirsin!

---

## 📝 Detaylı Adımlar

### Seçenek 1: Testnet'e Deploy (Önerilen)

Testnet'te deploy etmek ücretsiz ve hızlıdır.

```bash
# 1. Build
cd stellar-contract
soroban contract build

# 2. Deploy
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source <your-key-name> \
  --network testnet

# Contract ID çıktıda görünecek
```

### Seçenek 2: Local Network'e Deploy (Development)

Development için local bir network kullanabilirsin:

```bash
# Soroban local network başlat
soroban quickstart

# Deploy et
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source <your-key-name> \
  --network local
```

### Seçenek 3: Test Amaçlı Geçici Contract ID

Test için geçici bir contract ID oluşturabilirsin (gerçek deploy olmadan):

```bash
# Sadece contract hash'ini al
soroban contract install \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --network testnet

# Bu hash'i contract ID olarak kullanabilirsin (ama contract deploy edilmemiş olur)
```

---

## 🔑 Soroban Keys Yönetimi

### Key Oluşturma

```bash
# Yeni key oluştur
soroban keys generate my-test-key

# Output:
# Secret Key: S...
# Public Key: G...
```

### Key'i Testnet'e Fund Etme

```bash
# Friendbot ile fund et
soroban keys fund my-test-key --network testnet

# Ya da manual:
curl "https://friendbot.stellar.org/?addr=<PUBLIC_KEY>"
```

### Key'leri Listeleme

```bash
soroban keys list
```

---

## 🧪 Contract ID'yi Test Etme

Deploy ettikten sonra contract'ın çalıştığını test et:

```bash
# Contract'ı invoke et
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source test-key \
  --network testnet \
  -- initialize

# Ya da contract bilgilerini al
soroban contract read \
  --id <CONTRACT_ID> \
  --network testnet \
  get_version
```

---

## 📋 Contract ID Formatı

Soroban contract ID'leri:
- **Format**: `C` ile başlar, 56 karakter
- **Örnek**: `CABCDEF123456789ABCDEF123456789ABCDEF123456789ABCDEF1234567890`

### Contract ID'yi Nerede Bulurum?

1. **Deploy çıktısında**: Deploy komutu başarılı olduğunda contract ID gösterilir
2. **`.stellar/contract-ids/` klasöründe**: Deploy sonrası burada JSON dosyası oluşur
3. **Horizon API'den**: `https://horizon-testnet.stellar.org/contracts/<CONTRACT_ID>`

---

## 🔍 Mevcut Contract ID'leri

Projende zaten bazı contract ID'leri var:

**Local/Test:**
- Hash: `6539a37e9f3cde3a47ef55b3b8f8c30cc6125c5918231e278d1bfcfc2a355aa1`

Bu hash'i Soroban contract ID formatına çevirmek için:

```bash
# Soroban CLI ile contract ID formatına çevir
soroban contract id from-hash 6539a37e9f3cde3a47ef55b3b8f8c30cc6125c5918231e278d1bfcfc2a355aa1
```

---

## 🎯 Developer Sayfasında Kullanım

1. Contract ID'yi al (`C` ile başlayan 56 karakter)
2. `http://localhost:3000/developer` adresine git
3. Contract ID'yi gir
4. Network seç (Testnet)
5. "Generate Verification Code" butonuna bas

---

## ⚠️ Troubleshooting

### "Contract not found" Hatası

- Contract'ın gerçekten deploy edildiğinden emin ol
- Network'i doğru seçtiğinden emin ol (testnet/mainnet)
- Horizon API'yi kontrol et: `https://horizon-testnet.stellar.org/contracts/<CONTRACT_ID>`

### "Insufficient balance" Hatası

```bash
# Key'i fund et
soroban keys fund <key-name> --network testnet
```

### "WASM file not found" Hatası

```bash
# Contract'ı build et
soroban contract build

# Dosyanın var olduğunu kontrol et
ls target/wasm32-unknown-unknown/release/
```

---

## 🚀 Hızlı Test İçin

En hızlı yol - tek komutla:

```bash
cd stellar-contract && \
soroban contract build && \
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source $(soroban keys list | grep -v "No keys" | head -1 | awk '{print $1}') \
  --network testnet | grep "Contract ID" | awk '{print $3}'
```

Bu komut contract ID'yi direkt çıktıya yazar! 🎉
