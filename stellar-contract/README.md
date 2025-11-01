# StellarSafe Registry Contract

StellarSafe için Soroban smart contract. Bu kontrat, Stellar blockchain üzerindeki asset'lerin risk analizlerini, scam report'larını ve whitelist/blacklist yönetimini on-chain olarak saklamak için kullanılır.

## Özellikler

### Asset Registry (Varlık Kaydı)
- Asset'lerin risk skorlarını ve seviyelerini kaydetme
- Asset verification (doğrulama) sistemi
- Trust score (güven skoru) yönetimi
- Home domain bilgilerini saklama

### Scam Report Sistemi (Dolandırıcılık Raporlama)
- Community'den scam report'ları gönderme
- Report verification (doğrulama) süreci
- Report türleri: Phishing, Fake Token, Rug Pull, Honeypot, Frozen Funds
- Spam report filtreleme

### Whitelist/Blacklist Yönetimi
- Güvenli issuer'ları whitelist'e ekleme
- Tehlikeli adresleri blacklist'e ekleme
- Geçici ban desteği (expires_at)
- Severity levels (Medium, High, Critical)

## Kurulum

### Gereksinimler
- Rust (stable channel)
- Soroban CLI
- Stellar SDK

### Build
```bash
# Release build
cargo build --target wasm32-unknown-unknown --release

# WASM dosyası target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm konumunda oluşacak
```

### Test
```bash
cargo test
```

## Kontrat Fonksiyonları

### Initialization
- `initialize(admin: Address)` - Kontratı başlatır ve admin atar

### Admin İşlemleri
- `set_admin(new_admin: Address)` - Yeni admin atar

### Asset Registry
- `register_asset(asset_code, issuer_address, risk_score, risk_level, home_domain)` - Yeni asset kaydeder
- `get_asset(asset_code, issuer_address)` - Asset bilgilerini getirir
- `has_asset(asset_code, issuer_address)` - Asset'in kayıtlı olup olmadığını kontrol eder
- `update_asset_risk(asset_code, issuer_address, risk_score, risk_level)` - Risk skorunu günceller (admin only)
- `verify_asset(asset_code, issuer_address)` - Asset'i verify eder (admin only)
- `update_trust_score(asset_code, issuer_address, trust_score)` - Trust skorunu günceller (admin only)

### Scam Reports
- `submit_report(issuer_address, asset_code, report_type, description, evidence_url)` - Yeni report gönderir
- `get_report(report_id)` - Report bilgilerini getirir
- `verify_report(report_id, approved)` - Report'u verify eder (admin only)
- `mark_report_spam(report_id)` - Report'u spam olarak işaretler (admin only)

### Whitelist
- `add_to_whitelist(issuer_address, name, description)` - Whitelist'e ekler (admin only)
- `remove_from_whitelist(issuer_address)` - Whitelist'ten çıkarır (admin only)
- `is_whitelisted(issuer_address)` - Whitelist'te olup olmadığını kontrol eder
- `get_whitelist_entry(issuer_address)` - Whitelist entry getirir

### Blacklist
- `add_to_blacklist(address, reason, evidence_url, severity, expires_at)` - Blacklist'e ekler (admin only)
- `remove_from_blacklist(address)` - Blacklist'ten çıkarır (admin only)
- `is_blacklisted(address)` - Blacklist'te olup olmadığını kontrol eder
- `get_blacklist_entry(address)` - Blacklist entry getirir

## Risk Levels

- `Safe` (0) - Güvenli
- `Low` (1) - Düşük risk
- `Medium` (2) - Orta risk
- `High` (3) - Yüksek risk
- `Critical` (4) - Kritik risk

## Report Types

- `Phishing` - Phishing saldırısı
- `FakeToken` - Sahte token
- `RugPull` - Rug pull (likidite çekme)
- `Honeypot` - Honeypot token
- `FrozenFunds` - Donmuş fonlar
- `Other` - Diğer

## Storage Yapısı

Kontrat aşağıdaki veri yapılarını kullanır:

- **AssetInfo**: Asset bilgileri (risk score, trust score, verification status)
- **ReportData**: Scam report detayları
- **WhitelistEntry**: Güvenli issuer bilgileri
- **BlacklistEntry**: Tehlikeli adres bilgileri

## Deployment

### Testnet
```bash
soroban deploy --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source <your-key> \
  --network testnet
```

### Mainnet
```bash
soroban deploy --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source <your-key> \
  --network mainnet
```

## Lisans

Bu proje StellarSafe projesinin bir parçasıdır.