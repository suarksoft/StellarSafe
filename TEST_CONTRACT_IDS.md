# Test Contract IDs

Verification sistemini test etmek için kullanabileceğin contract ID'ler:

## 🧪 Test Amaçlı Contract ID'ler

### Örnek 1: Verified Contract (Database'de)
```
CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```
- Network: Testnet
- Status: Verified ✅
- Kayıt: Database'de örnek olarak var

### Örnek 2: Failed Contract (Database'de)
```
CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
```
- Network: Testnet  
- Status: Failed ❌ (WASM mismatch)
- Kayıt: Database'de örnek olarak var

---

## 🚀 Gerçek Testnet Contract Kullanmak İçin

### Stellar Token Contract Örneği (SAC)

Stellar Asset Contract (SAC) ID formatı kullanabilirsin. Örnek:

```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

Bu tip ID'ler Stellar asset'lerinin contract wrapper'ları. Gerçek deploy edilmiş contract'lar.

---

## 🔧 Manuel Deploy Seçeneği

Soroban CLI versiyonu uyumsuzluk veriyor. Alternatif yöntemler:

### 1. Stellar Laboratory Kullan

https://laboratory.stellar.org/#?network=test

1. "Transaction Builder" seçeneğine git
2. Upload WASM yaparak contract deploy et
3. Contract ID al

### 2. Önceden Deploy Edilmiş Contract

```bash
# Stellar'ın örnek token contract'ı
soroban contract id asset --asset native --network testnet
```

---

## ✅ Şu An Ne Yapabilirim?

### Seçenek 1: Database Örnek ID'sini Kullan

1. Frontend'i başlat:
```bash
cd frontend
npm run dev
```

2. `http://localhost:3000/developer` adresine git

3. Bu Contract ID'yi kullan:
```
CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

4. Network: Testnet

5. "Generate Verification Code" butonuna bas

**Not:** Bu ID database'de mock data olarak var. Verification API'si bu ID'yi tanıyacak.

---

### Seçenek 2: Native Asset Contract

Native XLM'in contract ID'sini al:

```bash
soroban contract id asset --asset native --network testnet
```

Bu komut gerçek bir Stellar Asset Contract ID'si verecek.

---

## 🧪 Test Flow'u

1. **Database'i Setup Et:**
```bash
# Supabase'de database-schema.sql'i çalıştır
# Örnek contract'lar otomatik insert edilecek
```

2. **Frontend'i Başlat:**
```bash
cd frontend
npm run dev
```

3. **Developer Sayfasını Aç:**
```
http://localhost:3000/developer
```

4. **Örnek Contract ID Kullan:**
```
CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

5. **Verification Code Oluştur**

6. **Contract Detaylarını Gör:**
```
http://localhost:3000/contract/CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?network=testnet
```

---

## 📝 Not

Soroban CLI'deki XDR hatası SDK versiyonundan kaynaklanıyor olabilir. Production'da bu sorun olmayacak çünkü:

1. Gerçek developer'lar kendi contract'larını deploy edecek
2. Deploy zaten yapılmış olacak
3. Sadece verification için Contract ID lazım

Test için yukarıdaki örnek ID'leri kullanabilirsin! 🎉
