# 🔍 Stellar Laboratory - Detaylı Adımlar

## 📍 Adım 4: Operation Ekle - Tam Lokasyon

### 1. Laboratory Sayfasında Neredesin?
```
https://laboratory.stellar.org/#?network=test
```

### 2. Hangi Sekmede Olmalısın?
- Sol menüde **"Transaction Builder"** sekmesine tıkla
- (Diğer sekmeler: Account Viewer, XDR Viewer vs. - bunlar değil!)

### 3. Transaction Builder Sayfasında:

#### A) Network Seçimi (Üstte)
```
┌─────────────────────────────────────┐
│ Network: [Test ▼] [Public ▼]       │  ← Test seçili olmalı
└─────────────────────────────────────┘
```

#### B) Source Account (Ortada)
```
┌─────────────────────────────────────┐
│ Source Account                      │
│ [Account ID gir]                    │
│ [Generate Keypair] [Fund Account]   │  ← Buradan account oluştur
└─────────────────────────────────────┘
```

#### C) Operations Bölümü (Aşağıda) - İŞTE BURASI!
```
┌─────────────────────────────────────┐
│ Operations                          │
│                                     │
│ [+ Add Operation]  ← BU BUTONA BAS! │
│                                     │
│ (Henüz operation yok)               │
└─────────────────────────────────────┘
```

### 4. "Add Operation" Butonuna Bastıktan Sonra:

#### Dropdown Menü Açılacak:
```
┌─────────────────────────────────────┐
│ Operation Type:                     │
│ [Select Operation ▼]                │
│                                     │
│ ├─ Create Account                   │
│ ├─ Payment                          │
│ ├─ Path Payment Strict Send         │
│ ├─ Manage Sell Offer               │
│ ├─ Create Passive Sell Offer       │
│ ├─ Set Options                      │
│ ├─ Change Trust                     │
│ ├─ Allow Trust                      │
│ ├─ Account Merge                    │
│ ├─ Inflation                        │
│ ├─ Manage Data                      │
│ ├─ Bump Sequence                    │
│ ├─ Manage Buy Offer                 │
│ ├─ Path Payment Strict Receive     │
│ ├─ Create Claimable Balance         │
│ ├─ Claim Claimable Balance          │
│ ├─ Begin Sponsoring Future Reserves │
│ ├─ End Sponsoring Future Reserves   │
│ ├─ Revoke Sponsorship               │
│ ├─ Clawback                         │
│ ├─ Clawback Claimable Balance       │
│ ├─ Set Trust Line Flags             │
│ ├─ Liquidity Pool Deposit           │
│ ├─ Liquidity Pool Withdraw          │
│ ├─ Invoke Host Function             │
│ └─ Upload Contract WASM  ← BU!      │
└─────────────────────────────────────┘
```

**"Upload Contract WASM"** seçeneğini bul ve tıkla!

### 5. "Upload Contract WASM" Seçtikten Sonra:

```
┌─────────────────────────────────────┐
│ Upload Contract WASM                │
│                                     │
│ WASM File:                          │
│ [Choose File] [No file chosen]      │  ← Buraya tıkla
│                                     │
└─────────────────────────────────────┘
```

### 6. "Choose File" Butonuna Tıklayınca:

Mac Finder açılacak:
```
1. Desktop'a git
2. stellarostim klasörüne git  
3. test-contract klasörüne git
4. target klasörüne git
5. wasm32v1-none klasörüne git
6. release klasörüne git
7. test_contract.wasm dosyasını seç
8. "Open" butonuna bas
```

**Tam Path:** 
```
Desktop → stellarostim → test-contract → target → wasm32v1-none → release → test_contract.wasm
```

### 7. Dosya Seçildikten Sonra:

```
┌─────────────────────────────────────┐
│ Upload Contract WASM                │
│                                     │
│ WASM File:                          │
│ [Choose File] [test_contract.wasm]  │  ← Dosya seçildi ✅
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 Özet - Tam Yol:

1. **Laboratory:** https://laboratory.stellar.org/#?network=test
2. **Sol menü:** "Transaction Builder"
3. **Network:** "Test" seç
4. **Account:** Generate Keypair + Fund Account
5. **Operations bölümü:** "[+ Add Operation]" butonu
6. **Dropdown:** "Upload Contract WASM" seç
7. **Choose File:** test_contract.wasm dosyasını seç
8. **Sign & Submit**

---

## 📱 Görsel Referans:

Laboratory sayfası şöyle görünecek:
```
┌─ Stellar Laboratory ──────────────────────────────────────┐
│                                                           │
│ [Account Viewer] [Transaction Builder] [XDR Viewer] ...   │
│                        ↑                                  │
│                   BU SEKME                                │
│                                                           │
│ Network: [Test ▼]                                        │
│                                                           │
│ Source Account: [___________________]                     │
│                                                           │
│ Operations:                                               │
│ [+ Add Operation] ← BU BUTON                             │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Şimdi daha net mi? Hangi adımda takıldın, söyle yardımcı olayım! 🚀
