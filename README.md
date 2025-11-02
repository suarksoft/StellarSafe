# StellarSafe - Stellar Blockchain Güvenlik Platformu

![StellarSafe Logo](https://via.placeholder.com/800x200/1e293b/ffffff?text=StellarSafe)

## 🌟 Proje Hakkında

StellarSafe, Stellar blockchain ekosisteminde kullanıcıları scam'lerden, sahte token'lardan ve riskli işlemlerden koruyan kapsamlı bir güvenlik platformudur. Gerçek zamanlı risk analizi, akıllı kontrat doğrulama ve topluluk destekli tehdit istihbaratı ile Stellar kullanıcılarının güvenliğini sağlar.

## 🎯 Ana Özellikler

### 🔍 Risk Analizi Sistemi
- **Gerçek Zamanlı Adres Analizi**: Stellar adreslerinin risk seviyesini anında değerlendirir
- **Multi-Kaynak Doğrulama**: Stellar Expert, TOML dosyaları ve topluluk verileri
- **İşlem Öncesi Uyarılar**: Riskli işlemler öncesi kullanıcıyı uyarır
- **AI Destekli Açıklamalar**: Riskleri anlaşılır dilde açıklar

### 🛡️ Güvenlik Araçları
- **Browser Extension**: Otomatik işlem analizi ve uyarılar
- **Web Dashboard**: Portföy güvenlik analizi ve risk raporları
- **CLI Tool**: Geliştiriciler için komut satırı aracı
- **JavaScript Widget**: Web sitelerine entegre edilebilir güvenlik katmanı

### ✅ Akıllı Kontrat Doğrulama
- **Kaynak Kod Doğrulama**: WASM binary ile kaynak kod eşleşmesi
- **Build Environment Kontrolü**: Reproducible build doğrulaması
- **Git Repository Analizi**: Kod geçmişi ve güvenilirlik kontrolü
- **Doğrulama Rozetleri**: Güvenilir kontratlar için görsel işaretler

### 🌐 Topluluk Destekli Güvenlik
- **Scam Raporlama**: Topluluk tabanlı tehdit raporlama sistemi
- **Blacklist Yönetimi**: Bilinen riskli adres ve token listesi
- **Whitelist Sistemi**: Doğrulanmış güvenli varlıklar
- **Güvenlik İstatistikleri**: Ekosistem güvenlik durumu raporları

## 🏗️ Teknik Mimari

### Frontend (Next.js 15)
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Cüzdan Dashboard
│   │   ├── analyze/           # Risk Analizi Sayfası
│   │   ├── developer/         # Kontrat Doğrulama
│   │   └── assets/            # Asset Explorer
│   ├── components/            # React Bileşenleri
│   │   ├── analysis/          # Risk analizi bileşenleri
│   │   ├── wallet/            # Cüzdan bileşenleri
│   │   └── ui/                # UI bileşenleri
│   ├── lib/                   # Utility fonksiyonları
│   │   ├── analyzer/          # Risk analizi motoru
│   │   ├── database/          # Veritabanı servisleri
│   │   ├── stellar/           # Stellar SDK entegrasyonu
│   │   └── transaction/       # İşlem analizi
│   └── hooks/                 # Custom React Hooks
```

### Backend Servisleri
- **PostgreSQL**: Ana veritabanı (verified_assets, blacklisted_assets, contract_metadata)
- **Stellar Horizon API**: Blockchain veri kaynağı
- **Stellar Expert API**: Adres doğrulama ve istatistikler
- **TOML Verification**: SEP-20 standardı doğrulaması

### Browser Extension
```
extension/
├── manifest.json              # Extension yapılandırması
├── background.js              # Arka plan servisi
├── content.js                 # Sayfa içerik scripti
├── injected.js                # Cüzdan entegrasyonu
└── popup.html                 # Extension popup UI
```

### CLI Tool
```
cli-tool/
├── src/
│   ├── index.ts               # Ana CLI interface
│   ├── collector.ts           # Kontrat bilgi toplama
│   ├── api-client.ts          # API iletişimi
│   └── types.ts               # TypeScript tipleri
└── dist/                      # Compiled JavaScript
```

### Smart Contract (Soroban)
```
stellar-contract/
├── src/
│   ├── lib.rs                 # Ana kontrat kodu
│   ├── admin.rs               # Admin fonksiyonları
│   ├── asset_registry.rs      # Asset kayıt sistemi
│   ├── blacklist.rs           # Blacklist yönetimi
│   ├── whitelist.rs           # Whitelist yönetimi
│   └── scam_report.rs         # Scam raporlama
└── target/                    # Build çıktıları
```

### Widget (Embeddable)
```
widget/
├── src/
│   ├── widget.ts              # Ana widget kodu
│   ├── api.ts                 # API iletişimi
│   ├── styles.css             # Widget stilleri
│   └── types.ts               # TypeScript tipleri
└── webpack.config.js          # Build yapılandırması
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Rust 1.70+ (Soroban kontratları için)
- Soroban CLI

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/yourusername/stellarsafe.git
cd stellarsafe
```

### 2. PostgreSQL Veritabanını Kurun
```bash
# PostgreSQL'i başlatın
brew services start postgresql

# Veritabanını oluşturun
createdb stellarsafe

# Schema'yı yükleyin
psql stellarsafe < database-schema.sql
```

### 3. Environment Variables
```bash
# frontend/.env.local
DATABASE_URL="postgresql://postgres:Option0601@localhost:5432/stellarsafe"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="stellarsafe"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="Option0601"

# Stellar API Keys (opsiyonel)
STELLAR_EXPERT_API_KEY="your_key_here"
SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
```

### 4. Frontend'i Çalıştırın
```bash
cd frontend
npm install
npm run dev
```

### 5. CLI Tool'u Kurun
```bash
cd cli-tool
npm install
npm run build
npm link  # Global kurulum için
```

### 6. Browser Extension'ı Yükleyin
1. Chrome'da `chrome://extensions/` adresine gidin
2. "Developer mode"u aktifleştirin
3. "Load unpacked" ile `extension/` klasörünü seçin

### 7. Smart Contract'ı Deploy Edin
```bash
cd stellar-contract
soroban contract build
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellarsafe_contract.wasm --network testnet
```

## 🔧 Kullanım Kılavuzu

### Web Dashboard
1. **Cüzdan Bağlama**: Freighter, Albedo veya diğer Stellar cüzdanları
2. **Portfolio Analizi**: Sahip olduğunuz varlıkların güvenlik durumu
3. **Risk Raporları**: Detaylı güvenlik analizi ve öneriler
4. **İşlem Geçmişi**: Geçmiş işlemlerin güvenlik değerlendirmesi

### Browser Extension
- Otomatik olarak Stellar işlemlerini analiz eder
- Riskli işlemler öncesi uyarı verir
- Sahte token'ları tespit eder
- Güvenli alternatifler önerir

### CLI Tool
```bash
# Kontrat doğrulama
stellarsafe verify CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# Adres analizi
stellarsafe analyze GCKFBEIYTKP6JY4Q7IVDVDM2WRQBN6WCBROH5VG6YWRFWQ7SHPQNSKP5

# Toplu analiz
stellarsafe batch-analyze addresses.txt
```

### JavaScript Widget
```html
<script src="https://cdn.stellarsafe.io/widget.js"></script>
<script>
const stellarSafe = new StellarSafeWidget({
  network: 'mainnet',
  apiKey: 'your_api_key'
});

stellarSafe.analyzeAddress('GXXXXXXX...')
  .then(result => {
    if (result.riskLevel === 'HIGH') {
      showWarning('Riskli adres tespit edildi!');
    }
  });
</script>
```

## 📊 Veritabanı Şeması

### Verified Assets
```sql
CREATE TABLE verified_assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(12) NOT NULL,
    issuer_address VARCHAR(56) NOT NULL,
    home_domain VARCHAR(255),
    description TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending',
    risk_level VARCHAR(20) DEFAULT 'MEDIUM',
    risk_score INTEGER DEFAULT 50,
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    toml_url VARCHAR(500),
    logo_url VARCHAR(500),
    website VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Blacklisted Assets
```sql
CREATE TABLE blacklisted_assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(12) NOT NULL,
    issuer_address VARCHAR(56) NOT NULL,
    reason TEXT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'HIGH',
    risk_score INTEGER DEFAULT 80,
    blacklisted_at TIMESTAMP DEFAULT NOW(),
    reported_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Verified Contracts
```sql
CREATE TABLE verified_contracts (
    id SERIAL PRIMARY KEY,
    contract_id VARCHAR(56) NOT NULL,
    network VARCHAR(20) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    checks JSONB,
    wasm_hash VARCHAR(64),
    wasm_size INTEGER,
    source_hash VARCHAR(64),
    source_files TEXT[],
    git_commit VARCHAR(40),
    git_remote VARCHAR(500),
    git_branch VARCHAR(100),
    rust_version VARCHAR(20),
    soroban_version VARCHAR(20),
    contract_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Güvenlik Özellikleri

### Risk Değerlendirme Kriterleri
1. **Hesap Yaşı**: Yeni hesaplar daha riskli
2. **İşlem Geçmişi**: Düşük aktivite riski artırır
3. **Stellar Expert Doğrulaması**: Doğrulanmış organizasyonlar güvenli
4. **TOML Dosyası**: SEP-20 standardına uygunluk
5. **Topluluk Raporları**: Kullanıcı şikayetleri ve raporlar
6. **Blacklist Kontrolü**: Bilinen scam adresleri

### Risk Seviyeleri
- **SAFE** (0-20): Güvenli, işlem yapılabilir
- **LOW** (21-40): Düşük risk, dikkatli olun
- **MEDIUM** (41-60): Orta risk, araştırın
- **HIGH** (61-80): Yüksek risk, kaçının
- **CRITICAL** (81-100): Kritik risk, kesinlikle kaçının

## 🛠️ Geliştirme

### Kod Yapısı
- **TypeScript**: Tüm projede tip güvenliği
- **React 18**: Modern React özellikleri
- **Next.js 15**: App Router ve Server Components
- **Tailwind CSS**: Utility-first CSS framework
- **PostgreSQL**: İlişkisel veritabanı
- **Stellar SDK**: Blockchain entegrasyonu

### Test Etme
```bash
# Frontend testleri
cd frontend
npm test

# CLI testleri
cd cli-tool
npm test

# Smart contract testleri
cd stellar-contract
cargo test
```

### Build ve Deploy
```bash
# Frontend production build
cd frontend
npm run build

# CLI tool build
cd cli-tool
npm run build

# Widget build
cd widget
npm run build

# Smart contract build
cd stellar-contract
soroban contract build
```

## 📈 Roadmap

### Kısa Vadeli (Q1 2024)
- [x] Web dashboard geliştirme
- [x] Browser extension
- [x] CLI tool
- [x] Smart contract doğrulama
- [ ] Mobil uygulama (React Native)

### Orta Vadeli (Q2-Q3 2024)
- [ ] API monetizasyonu
- [ ] Premium özellikler
- [ ] Kurumsal dashboard
- [ ] Gelişmiş AI analizi
- [ ] Multi-chain desteği

### Uzun Vadeli (Q4 2024+)
- [ ] DeFi protokol entegrasyonları
- [ ] Governance token
- [ ] DAO yapısına geçiş
- [ ] Topluluk ödül sistemi

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.



## 🙏 Teşekkürler

- Stellar Development Foundation
- Stellar Community
- Open source katkıda bulunanlar
- Beta test kullanıcıları

---

**StellarSafe** - Stellar Blockchain'de Güvenliğiniz Bizim Önceliğimiz 🌟
