# Cüzdan Bağlantı Rehberi / Wallet Connection Guide

## 🔧 Yapılan Düzeltmeler / Fixes Applied

### 1. **useWalletConnect Hook İyileştirmeleri**
- ✅ localStorage'dan mevcut bağlantıyı geri yükleme eklendi
- ✅ Cüzdan extension'larının yüklenmesi için bekleme mekanizması eklendi
- ✅ Freighter bağlantısında gelişmiş hata yönetimi
- ✅ Console log'ları ile debug desteği

### 2. **WalletConnectModal Geliştirmeleri**
- ✅ Birden fazla deneme ile cüzdan algılama (500ms, 1s, 2s)
- ✅ Bağlantı sonrası state güncellemesi için delay eklendi
- ✅ Daha iyi hata gösterimi

### 3. **Defense Wallet Sayfası**
- ✅ Connection state debug logging eklendi
- ✅ isConnecting durumu kontrolü eklendi

### 4. **Test Sayfası Eklendi**
- ✅ work/page.tsx'e cüzdan test bölümü eklendi
- ✅ Debug bilgileri gösterimi
- ✅ Bağlantı durumu göstergesi

## 🚀 Test Adımları / Testing Steps

### 1. Freighter Cüzdan Kurulumu
1. Chrome/Edge için: https://freighter.app adresinden extension'ı yükleyin
2. Freighter'ı açın ve yeni bir cüzdan oluşturun veya mevcut cüzdanınızı import edin
3. **Testnet** moduna geçin (Settings > Network > Testnet)

### 2. Test Hesabı Oluşturma (Testnet)
```bash
# Stellar Laboratory kullanarak:
# https://laboratory.stellar.org/#account-creator?network=test
```

Veya Freighter ile:
1. Freighter'da "Request Testnet XLM" butonuna tıklayın
2. Otomatik olarak testnet hesabı oluşturulur ve 10,000 XLM yüklenir

### 3. Uygulamayı Test Etme

#### Adım 1: Sunucuyu Başlatın
```bash
cd frontend
npm run dev
```

#### Adım 2: Test Sayfasına Gidin
```
http://localhost:3000/work
```

#### Adım 3: Cüzdan Bağlantısını Test Edin
1. "Connect Wallet" butonuna tıklayın
2. Modal açılmalı ve Freighter görünmeli
3. Freighter'a tıklayın
4. Freighter popup'ı açılır, izni onaylayın
5. Bağlantı başarılı olmalı

#### Adım 4: Defense Wallet'ı Test Edin
```
http://localhost:3000/defense-wallet
```

Burada görmelisiniz:
- ✅ Bağlı cüzdan adresi
- ✅ Güvenlik skoru
- ✅ Varlık listesi
- ✅ Hesap detayları

## 🐛 Sık Karşılaşılan Sorunlar / Common Issues

### Sorun 1: "Freighter not detected"
**Çözüm:**
1. Tarayıcıyı kapatıp yeniden açın
2. Freighter extension'ının aktif olduğundan emin olun
3. Sayfayı yenileyin (F5)
4. Console'da `window.freighterApi` yazıp kontrol edin

### Sorun 2: "Connection timeout"
**Çözüm:**
1. Modal'ı kapatıp tekrar açın
2. Freighter'ı açık bırakın
3. Popup blocker'ı kontrol edin

### Sorun 3: "Account not found"
**Çözüm:**
1. Freighter'da doğru network'te (testnet) olduğunuzdan emin olun
2. Hesabınızda testnet XLM olduğunu kontrol edin
3. https://stellar.expert/explorer/testnet/account/YOUR_PUBLIC_KEY adresinden hesabınızı kontrol edin

### Sorun 4: Modal açılmıyor
**Çözüm:**
1. Console'da hata mesajlarını kontrol edin
2. React DevTools ile component state'ini inceleyin
3. Browser cache'i temizleyin

## 📊 Debug Console Komutları

```javascript
// Freighter kontrolü
window.freighterApi

// Bağlantı durumu
localStorage.getItem('stellarsafe_wallet')

// Manuel bağlantı testi
await window.freighterApi.getPublicKey()
await window.freighterApi.getNetwork()
```

## 🔐 Güvenlik Notları

1. **Testnet kullanın**: Geliştirme sırasında her zaman testnet kullanın
2. **Private key'leri paylaşmayın**: Asla private key veya seed phrase paylaşmayın
3. **Extension doğrulaması**: Freighter'ı sadece resmi kaynaklardan indirin
4. **Network kontrolü**: Mainnet'e geçmeden önce iki kez kontrol edin

## 📝 Teknik Detaylar

### Desteklenen Cüzdanlar
- ✅ **Freighter** (Tam destek)
- ⚠️ **Albedo** (Temel destek)
- ⚠️ **Rabet** (Temel destek)
- 🚧 **xBull** (Yakında)
- 🚧 **Lobstr** (Yakında)

### Kullanılan Teknolojiler
- **@stellar/stellar-sdk**: Stellar blockchain etkileşimi
- **Freighter API**: Cüzdan bağlantısı
- **React Hooks**: State yönetimi
- **Next.js**: Framework
- **TypeScript**: Type safety

## 🎯 Sonraki Adımlar

1. [ ] xBull ve Lobstr entegrasyonu
2. [ ] WalletConnect desteği
3. [ ] Hardware wallet desteği (Ledger)
4. [ ] Multi-signature işlem desteği
5. [ ] Transaction signing UI iyileştirmesi
6. [ ] Mainnet desteği (güvenlik denetimleri tamamlandıktan sonra)

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Browser DevTools'u açın (F12)
3. Network tab'ında Stellar API isteklerini inceleyin
4. Issue açın veya iletişime geçin
