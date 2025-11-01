 StellarSafe - Komple Proje Dokümantasyonu

📋 İÇİNDEKİLER

Proje Özeti
Teknik Mimari
Teknoloji Stack'i
Veritabanı Yapısı
Backend Mantığı
Frontend Yapısı
Browser Extension
API Endpoint'leri
Güvenlik Analiz Algoritmaları
UI/UX Tasarımı
Demo Senaryoları
Deployment Stratejisi


1. PROJE ÖZETİ
Ne?
StellarSafe, Stellar blockchain üzerinde işlem yapmadan önce kullanıcıları koruyan bir güvenlik katmanıdır. Kullanıcı bir transaction imzalamadan önce otomatik olarak risk analizi yapar, tehdit tespit eder ve anlaşılır uyarılar gösterir.
Neden?
Stellar'ın protokol güvenliği mükemmel ama kullanıcı seviyesinde işlem öncesi uyarı sistemi yok. Kullanıcılar sahte token'lara trustline açıyor, scam issuer'lardan asset alıyor ve paralarını kaybediyor. StellarSafe bu boşluğu dolduruyor.
Nasıl?
Üç katmanlı sistem:

Browser extension wallet'ları intercept ediyor
Backend'de multi-layer analiz yapılıyor
Frontend'de kullanıcı dostu uyarılar gösteriliyor

Kimin İçin?

Birincil: Stellar kullanıcıları (özellikle yeni başlayanlar)
İkincil: Wallet geliştiricileri (SDK olarak entegre edebilirler)
Üçüncül: DApp geliştiricileri (API olarak kullanabilirler)


2. TEKNİK MİMARİ
Genel Akış
Adım 1: Transaction Başlatma
Kullanıcı cüzdanında bir işlem yapmak istiyor. Örneğin bir token'a trustline açacak veya para gönderecek. "Sign" butonuna basıyor.
Adım 2: Interception
StellarSafe browser extension devreye giriyor. Freighter veya diğer wallet'ların signTransaction fonksiyonunu intercept ediyor. Transaction henüz imzalanmadı, sadece XDR formatında hazırlandı.
Adım 3: Backend'e Gönderim
Extension, transaction XDR'ini StellarSafe backend API'sine gönderiyor. Ayrıca kullanıcının hesap bilgilerini de gönderiyor.
Adım 4: Çoklu Katmanlı Analiz
Backend üç farklı analiz katmanı çalıştırıyor:
Katman 1 - On-Chain Deterministik Analiz:
Stellar Horizon API'sine sorgu yapıyor. Asset issuer hesabını çekiyor. Hesabın flag'lerini kontrol ediyor (AUTH_REVOCABLE, AUTH_REQUIRED, AUTH_IMMUTABLE). Home domain var mı bakıyor. Stellar.toml dosyasını doğruluyor. Account yaşını hesaplıyor. Transaction geçmişini inceliyor.
Katman 2 - Pattern Matching ve Heuristic Analiz:
Transaction operation'larını parse ediyor. Şüpheli pattern'ler arıyor (mass trustline creation, sequence bump manipulation, flag changes). Asset code benzerliği kontrolü yapıyor (USDC vs USDC farklı issuer). Amount anomaly detection yapıyor (kullanıcının ortalamasının çok üstünde mı?). Destination address'i analiz ediyor (ilk kez mi gönderiliyor?).
Katman 3 - Community Intelligence:
Veritabanındaki whitelist'e bakıyor (Circle USDC gibi bilinen güvenli issuer'lar). Blacklist kontrol ediyor (daha önce report edilmiş scammer'lar). Community report'larını çekiyor (bu asset/issuer için kaç scam raporu var?). Crowd-sourced rating'leri hesaplıyor.
Adım 5: Risk Skoru Hesaplama
Her katmandan gelen threat'ler toplanıyor. Her threat'in severity'sine göre risk skoru hesaplanıyor. 0-100 arası bir skor üretiliyor. Risk level belirleniyor (SAFE, LOW, MEDIUM, HIGH, CRITICAL).
Adım 6: Simülasyon
Stellar'ın simulateTransaction API'si kullanılıyor. Transaction gerçekten gönderilmeden ne olacağı test ediliyor. Kullanıcının bakiyesi nasıl değişecek hesaplanıyor. Fee tahmin ediliyor. Potential error'lar tespit ediliyor.
Adım 7: Response Dönüşü
Tüm analiz sonuçları JSON formatında extension'a dönüyor. Risk skoru, threat listesi, recommendations, simulation result içeriyor.
Adım 8: UI Gösterimi
Extension response'u parse ediyor. Risk seviyesine göre modal popup açıyor. Eğer CRITICAL risk varsa büyük kırmızı uyarı. Eğer MEDIUM/HIGH ise sarı/turuncu uyarı. Eğer SAFE/LOW ise yeşil onay. Her threat için açıklama gösteriliyor. Simulation result bakiye değişimlerini gösteriyor. Kullanıcıya iki seçenek veriliyor: "Cancel" veya "Proceed Anyway".
Adım 9: Kullanıcı Kararı
Kullanıcı "Cancel" seçerse transaction iptal ediliyor. Kullanıcı "Proceed" seçerse orijinal wallet signing flow'u devam ediyor. Transaction Stellar network'üne gönderiliyor.
Mimari Katmanlar
Presentation Layer (Frontend):

Next.js web application (dashboard, asset viewer, education pages)
Browser extension popup (quick stats, scan button)
Extension content script (wallet interception)
React components (modals, cards, badges, charts)

API Layer:

Next.js API routes
RESTful endpoints
JSON request/response
Rate limiting
Authentication (future)

Business Logic Layer:

Asset analyzer module
Transaction analyzer module
Pattern detection engine
Risk scoring algorithm
Simulation engine
Community intelligence aggregator

Data Layer:

PostgreSQL database (asset registry, scam reports, cache)
Redis cache (optional, for performance)
Stellar Horizon API (on-chain data)
Soroban RPC (simulation)

Integration Layer:

Stellar SDK client
Freighter API wrapper
WebSocket listener (real-time monitoring)
External API connectors (future: DeFiLlama, CoinGecko)


3. TEKNOLOJİ STACK'İ
Frontend Stack
Framework: Next.js 14
Neden seçildi? App Router ile modern React patterns. Server-side rendering for SEO. API routes backend ile aynı projede. Vercel'de kolay deployment. TypeScript native support.
UI Library: Shadcn/ui + Tailwind CSS
Neden? Modern, customizable components. Accessibility built-in. Dark mode support. Responsive by default. Copy-paste components (fast development).
State Management: Zustand
Neden? Lightweight (Redux'tan çok daha basit). React hooks ile native çalışıyor. DevTools support. Minimal boilerplate.
Data Fetching: TanStack Query (React Query)
Neden? Automatic caching. Background refetching. Optimistic updates. Loading/error states handling. Server state management.
Form Handling: React Hook Form
Neden? Performance (uncontrolled components). Validation built-in. TypeScript support. Easy integration with Zod schemas.
Charts: Recharts
Neden? Built for React. Responsive. Customizable. Good documentation.
Backend Stack
Runtime: Node.js 20
Neden? JavaScript ecosystem (same as frontend). Async I/O for blockchain queries. Large package ecosystem. Good Stellar SDK support.
Database: PostgreSQL 15
Neden? Relational data (assets, reports, users). JSONB support for flexible data. Full-text search. Reliable and mature. Good for analytics queries.
ORM: Prisma
Neden? Type-safe database client. Auto-generated TypeScript types. Migration management. Excellent DX (developer experience).
Caching: Redis (optional)
Ne zaman? Production'da high traffic geldiğinde. Asset metadata caching. Rate limiting. Session storage.
Blockchain Integration
Stellar SDK: @stellar/stellar-sdk
Özellikleri: Transaction building. Account loading. Asset operations. XDR encoding/decoding. Network communication.
RPC Client: Soroban RPC
Ne için? Transaction simulation. Smart contract interaction. Event listening. State queries.
API: Horizon REST API
Ne için? Account data. Asset information. Transaction history. Operation details. Ledger information.
Browser Extension Stack
Manifest: V3
Neden? Latest standard. Better security. Service workers. Modern APIs.
Build Tool: Vite
Neden? Fast hot reload. Modern bundling. Easy configuration. TypeScript support.
Storage: chrome.storage API
Ne için? User preferences. Cached data. Wallet connections.
Development Tools
Language: TypeScript
Neden? Type safety critical for crypto. Better IDE support. Catch errors compile-time. Self-documenting code.
Testing: Vitest
Neden? Fast (ESM native). Vite compatible. Similar API to Jest. Good TypeScript support.
Linting: ESLint + Prettier
Neden? Code consistency. Catch bugs early. Auto-formatting.
Version Control: Git + GitHub
Neden? Industry standard. Good CI/CD integration. Collaboration features.
Deployment Stack
Web App: Vercel
Neden? Next.js optimized. Automatic deployments. Edge network. Free tier generous. Preview deployments.
Database: Supabase veya Railway
Neden? Managed PostgreSQL. Automatic backups. Easy scaling. Good free tier.
Extension: Chrome Web Store
Neden? Largest user base. Automatic updates. Built-in analytics.
Monitoring: Sentry
Ne için? Error tracking. Performance monitoring. User feedback.

4. VERİTABANI YAPISI
Neden PostgreSQL?
Relational data çünkü asset'ler, issuer'lar, report'lar birbirine bağlı. JSONB support var, flexible data için (flags, metadata). Full-text search gerekecek (asset arama). Analitik sorgular yapacağız (en çok report edilen issuer'lar vs). Mature ve güvenilir.
Tablo Yapıları
assets tablosu
Bu tablo Stellar'daki tüm asset'leri tutuyor. Her asset için bir satır var. Primary key otomatik artan ID. Unique constraint var asset_code + issuer_address kombinasyonunda (aynı asset iki kez kayıtlı olmasın).
Sütunlar:

id: Integer, otomatik artan, primary key
asset_code: String (max 12 karakter), örneğin "USDC", "BTC", "AQUA"
issuer_address: String (56 karakter), Stellar address (G ile başlayan)
risk_level: Enum (SAFE, LOW, MEDIUM, HIGH, CRITICAL)
trust_score: Integer (0-100), community + algorithm tarafından hesaplanan skor
is_verified: Boolean, StellarSafe tarafından doğrulandı mı
home_domain: String (nullable), issuer'ın web sitesi
flags: JSONB object, örnek: {auth_required: true, auth_revocable: false}
metadata: JSONB object, ek bilgiler (logo URL, description vs)
created_at: Timestamp, kayıt zamanı
updated_at: Timestamp, son güncelleme zamanı

İndeksler:

asset_code üzerinde index (arama hızlandırma)
issuer_address üzerinde index
risk_level üzerinde index (filtreleme için)
trust_score üzerinde index (sıralama için)

scam_reports tablosu
Community'nin asset/issuer report'larını tutuyor. Kullanıcılar "Report as Scam" butonuna basınca buraya yazılıyor.
Sütunlar:

id: Integer, primary key
asset_code: String (nullable çünkü sadece issuer de report edilebilir)
issuer_address: String, report edilen issuer
reporter_address: String, report eden kullanıcının Stellar adresi
report_type: Enum (PHISHING, FAKE_TOKEN, RUG_PULL, HONEYPOT, FROZEN_FUNDS, OTHER)
description: Text, kullanıcının açıklaması
evidence_url: String (nullable), kanıt linki (screenshot, transaction hash vs)
status: Enum (PENDING, VERIFIED, REJECTED, SPAM)
verified_by: String (nullable), admin/moderator adresi
created_at: Timestamp

İndeksler:

issuer_address (en çok report edilen issuer'ları bulmak için)
status (pending report'ları filtrelemek için)
created_at (son report'ları görmek için)

whitelist tablosu
Bilinen güvenli issuer'ları tutuyor. Circle, Stellar Foundation gibi resmi hesaplar.
Sütunlar:

id: Integer, primary key
issuer_address: String, unique
name: String, issuer adı (örneğin "Circle", "Stellar Foundation")
description: Text, açıklama
asset_codes: Array of strings, bu issuer'ın çıkardığı güvenli asset'ler
verified_by: String, kim doğruladı (örneğin "Stellar Foundation")
proof_url: String, doğrulama belgesi linki
added_at: Timestamp

blacklist tablosu
Bilinen scammer adresleri. Verified scam report'lardan otomatik ekleniyor.
Sütunlar:

id: Integer, primary key
address: String, unique, kötü niyetli adres
address_type: Enum (ISSUER, RECIPIENT, CONTRACT), ne tür bir adres
reason: Text, neden blacklist'e alındı
evidence_url: String, kanıt
severity: Enum (MEDIUM, HIGH, CRITICAL)
added_at: Timestamp
expires_at: Timestamp (nullable), temporary ban için

analysis_cache tablosu
Transaction analiz sonuçlarını cache'liyor. Aynı transaction tekrar analiz edilmesin diye.
Sütunlar:

id: Integer, primary key
transaction_hash: String, unique
risk_score: Integer
risk_level: Enum
threats: JSONB array, threat listesi
analysis_data: JSONB, tüm analiz detayları
created_at: Timestamp
expires_at: Timestamp (24 saat sonra)

TTL (Time To Live): 24 saat. Expired cache'ler otomatik temizleniyor (cron job ile).
user_portfolios tablosu (future feature)
Kullanıcıların portfolio'larını tracking için.
Sütunlar:

id: Integer, primary key
stellar_address: String, unique
last_scan_at: Timestamp
risk_score: Integer
risky_assets_count: Integer
alerts_enabled: Boolean
created_at: Timestamp

alerts tablosu (future feature)
Kullanıcılara gönderilen uyarıları tutuyor.
Sütunlar:

id: Integer, primary key
user_address: String
alert_type: Enum (DANGEROUS_TRUSTLINE, ISSUER_FLAG_CHANGE, BLACKLIST_ADDED, etc)
severity: Enum
message: Text
is_read: Boolean
created_at: Timestamp

Database Seed Data
Başlangıç için database'e eklenmesi gerekenler:
Whitelist Seeds:
Circle USDC issuer address + asset code. Stellar Development Foundation XLM. Aqua token issuer. MoneyGram USDC. yUSDC issuer. Diğer bilinen güvenli issuer'lar.
Test Scam Seeds (demo için):
Sahte USDC issuer (AUTH_REVOCABLE flag açık). Honeypot token örneği. Rug pull yapılmış token örneği. Phishing address örneği.
Assets Seeds:
Top 50 Stellar asset'ini metadata ile birlikte. Circle USDC (trust_score: 100, is_verified: true). AQUA token bilgileri. Native XLM entry.
Database Migrations
Prisma ile migration yönetimi. Her schema değişikliğinde yeni migration oluşturulacak. Development'ta migrate dev komutu. Production'da migrate deploy komutu.
Migration strategy:

Backward compatible olmalı (eski API versiyonları bozulmasın)
Seed data migrations ayrı tutulmalı
Rollback stratejisi olmalı


5. BACKEND MANTIKLARI
Asset Analyzer Logic
Asset analyzer bir asset'in güvenli olup olmadığını belirliyor. Input: asset_code ve issuer_address. Output: risk analysis object (score, level, threats, recommendations).
Analiz Adımları:
Adım 1: Issuer Account Bilgilerini Çek
Stellar Horizon API'sine GET request at. Endpoint: /accounts/{issuer_address}. Response'da account bilgileri gelecek: thresholds, flags, signers, data entries, balances, sequence, age.
Adım 2: Flag Analizi
Response'daki flags alanına bak. AUTH_REQUIRED flag true mu? Eğer true ise: threat ekle (type: AUTHORIZATION_REQUIRED, severity: MEDIUM, message: "Issuer must approve all holders"). Risk score'a +15 ekle.
AUTH_REVOCABLE flag true mu? Eğer true ise: threat ekle (type: FREEZABLE_ASSET, severity: HIGH, message: "Issuer can freeze your balance anytime"). Risk score'a +30 ekle. Bu en tehlikeli flag çünkü issuer istediği zaman bakiyeyi dondurabilir.
AUTH_IMMUTABLE flag true mu? Eğer true ise: iyi bir şey, flag'ler değiştirilemez. Risk score'dan -5 çıkar.
AUTH_CLAWBACK_ENABLED flag true mu? Eğer true ise: threat ekle (type: CLAWBACK_ENABLED, severity: MEDIUM, message: "Issuer can take back tokens"). Risk score'a +20 ekle.
Adım 3: Home Domain Doğrulama
Account'ta home_domain field var mı? Eğer yoksa: threat ekle (UNVERIFIED_ISSUER). Risk score'a +25 ekle.
Eğer varsa: HTTP GET request at home_domain/.well-known/stellar.toml. Response geldi mi? TOML parse edilebiliyor mu? TOML içinde bu issuer address var mı? Eğer geçersizse: threat ekle. Eğer geçerliyse: risk score'dan -10 çıkar.
Adım 4: Account Age Kontrolü
Account ne zaman oluşturulmuş? Ledger sequence'dan hesapla. Eğer 7 günden yeni ise: threat ekle (NEW_ISSUER, severity: MEDIUM). Risk score'a +20 ekle. Çünkü yeni hesaplar scam olabilir.
Eğer 1 yıldan eski ise: risk score'dan -5 çıkar (eski = daha güvenilir).
Adım 5: Transaction History Analizi
Issuer'ın son işlemlerini çek. Endpoint: /accounts/{issuer}/operations. Toplam kaç işlem yapmış? Eğer 5'ten az ise: şüpheli, risk score'a +15 ekle.
Asset issuance işlemi var mı? (type: payment, asset: bu asset). Kaç hesaba göndermiş? Eğer sadece 1-2 hesaba göndermiş: threat ekle (LIMITED_DISTRIBUTION). Eğer 1000+ hesaba göndermiş: iyi işaret, score'dan -10 çıkar.
Adım 6: Database Kontrolleri
Whitelist'te mi? Database'de SELECT * FROM whitelist WHERE issuer_address = ?. Eğer bulursa: risk score = 0, level = SAFE, is_verified = true, direkt return et.
Blacklist'te mi? SELECT * FROM blacklist WHERE address = ?. Eğer bulursa: risk score = 100, level = CRITICAL, threat ekle (BLACKLISTED), direkt return et.
Adım 7: Community Intelligence
Bu issuer için kaç scam report var? SELECT COUNT(*) FROM scam_reports WHERE issuer_address = ? AND status = 'VERIFIED'. Eğer 10+ report varsa: risk score'a +40 ekle. Eğer 50+ report varsa: otomatik blacklist'e ekle.
Average community rating nedir? Eğer 2/5'ten düşükse: risk score'a +25 ekle.
Adım 8: Name Similarity Check
Asset code benzerliği var mı başka bilinen asset'lerle? Örneğin asset_code = "USDC" ama issuer Circle değil. Database'de SELECT * FROM assets WHERE asset_code = ? AND is_verified = true. Eğer başka bir verified USDC varsa: threat ekle (NAME_IMPERSONATION, severity: CRITICAL). Risk score'a +35 ekle. Message: "This looks like USDC but isn't from Circle. Real USDC issuer: GA5Z...".
Benzer isimler: "USDC" vs "USD€", "BTC" vs "BT€", "AQUA" vs "AQUA" (farklı issuer).
Adım 9: Supply ve Distribution Analizi (advanced)
Total supply ne kadar? Kaç holder var? Top holder kaç % tutuyor? Eğer tek holder %99+ tutuyorsa: threat ekle (CENTRALIZED_SUPPLY). Rug pull riski yüksek.
Adım 10: Price ve Liquidity Check (future feature)
DEX'te liquidity var mı? Price manipulation olmuş mu? Honeypot indicator'ları var mı? (alınabiliyor ama satılamıyor).
Risk Score Hesaplama:
Başlangıç score = 0. Her threat severity'sine göre puan ekle:

LOW: +5-10
MEDIUM: +15-20
HIGH: +25-35
CRITICAL: +40-50

Pozitif factor'lar için puan çıkar (verified TOML, old account, high distribution).
Final score = Math.min(calculated_score, 100). Yani 100'ü geçmez.
Risk Level Mapping:

score >= 80: CRITICAL
score >= 60: HIGH
score >= 40: MEDIUM
score >= 20: LOW
score < 20: SAFE

Recommendations Oluşturma:
Threat'lere göre recommendation'lar üret. Eğer FREEZABLE_ASSET varsa: "Consider removing this trustline if you already have it". Eğer NAME_IMPERSONATION varsa: "Use the verified asset instead: [link]". Eğer NEW_ISSUER varsa: "Wait for this issuer to establish a track record".
Transaction Analyzer Logic
Transaction analyzer bir transaction'ın güvenli olup olmadığını belirliyor. Input: transaction XDR + source account address. Output: transaction analysis object (risk_score, threats, simulation, state_changes, recommendations).
Analiz Adımları:
Adım 1: Transaction Parse
XDR'den Transaction object oluştur. Transaction içindeki operation'ları parse et. Source account'u belirle. Fee'yi check et. Sequence number'ı check et. Time bounds var mı check et.
Adım 2: Operation-by-Operation Analiz
Her operation için ayrı analiz yap.
ChangeTrust Operation:
Asset code ve issuer address'i al. Asset analyzer'ı çağır (yukarıdaki logic). Asset risk score'u bu operation için de geçerli. Eğer risky asset'e trustline açılıyorsa: threat ekle. Limit amount ne kadar? Eğer unlimited ise: uyarı ekle (dikkatli ol).
Payment Operation:
Destination address'i kontrol et. Blacklist'te mi? Eğer blacklist'teyse: CRITICAL threat. First time recipient mı? Kullanıcının geçmiş transaction'larına bak. Bu address'e daha önce göndermiş mi? Eğer ilk kez ise: threat ekle (FIRST_TIME_RECIPIENT, severity: LOW). Message: "You're sending to this address for the first time. Double-check it's correct."
Amount kontrolü: Kullanıcının average payment amount'u ne? Database'den veya Horizon'dan geçmiş ödemeleri çek. Average hesapla. Bu ödeme average'ın %500'ü üstünde mi? Eğer öyleyse: threat ekle (UNUSUAL_AMOUNT, severity: MEDIUM). Message: "This amount is 5x your usual payments. Confirm this is intended."
Asset kontrolü: Hangi asset gönderiliyor? Eğer custom asset ise: asset analyzer'ı çağır. Risky asset mi? Uyarı ekle.
CreateClaimableBalance Operation:
Claimant'lar kimler? Predicate conditions neler? Time-locked mı? Karmaşık condition'lar mı var? Eğer karmaşıksa: threat ekle (COMPLEX_CLAIMABLE_BALANCE). Kullanıcı anlamayabilir.
Sponsor kim? Sponsor blacklist'te mi? Sponsor new account mı?
SetOptions Operation:
Flag'ler değiştiriliyor mu? Eğer AUTH_REVOCABLE flag set ediliyorsa: CRITICAL threat. Message: "Issuer enabling ability to freeze balances!". Bu çok tehlikeli çünkü issuer sonradan tüm holder'ları dondurabiliyor.
Signer ekleniyor/çıkarılıyor mu? Multisig yapısı değişiyor mu? Uyarı ekle (hesap kontrolü değişiyor).
Home domain değiştiriliyor mu? Phishing indication olabilir.
InvokeHostFunction Operation (Soroban):
Contract address'i al. Contract blacklist'te mi? Contract verified mı? Contract ne yapıyor? Function name nedir? Arguments neler? Eğer "approve_all" veya "set_approval_for_all" gibi tehlikeli function ise: CRITICAL threat. Unlimited approval veriyor olabilir.
Contract'ın source code'u verified mı? TOML'de contract info var mı? Community review'ları var mı?
BumpSequence Operation:
Sequence kaça bump ediliyor? Current sequence + 100'den fazla mı? Eğer öyleyse: threat ekle (SEQUENCE_MANIPULATION). Pending transaction'ları invalid hale getirmeye çalışıyor olabilir.
Adım 3: Pattern Detection
Multiple operation'lara bakarak pattern tespit et.
Mass Trustline Pattern:
5+ changeTrust operation aynı transaction'da mı? Threat ekle (MASS_TRUSTLINE_CREATION). Message: "Creating many trustlines at once. This is often used in airdrop scams." Risk score +15.
Drain Pattern:
Tüm asset'leri bir adrese mi gönderiliyor? Threat ekle (POTENTIAL_DRAIN). Hesap boşaltılıyor olabilir.
Flash Loan Pattern:
CreateClaimableBalance + Payment + ClaimClaimableBalance kombinasyonu var mı? Advanced DeFi operation. Uyarı ver (complex transaction).
Adım 4: Destination Analysis
Transaction'daki tüm destination address'leri topla. Her birini kontrol et: Blacklist check. Known phishing address mi? Account age check. Community report check.
Adım 5: Amount Anomaly Detection
Kullanıcının account history'sini Horizon'dan çek. Son 30 gün payment'ları. Average, median, max hesapla. Standard deviation hesapla. Bu transaction amount outlier mı? Eğer 3 standard deviation dışındaysa: anomaly threat ekle.
Adım 6: Fee Analysis
Transaction fee ne kadar? Normal Stellar fee 0.00001 XLM (100 stroops). Fee bundan çok yüksek mi? Eğer 10x'ten fazlaysa: uyarı ekle (HIGH_FEE). Kullanıcı farkında mı?
Fee-bump transaction mı? Sponsor kim? Sponsor güvenilir mi?
Adım 7: Time Bounds Check
Transaction time-bounded mı? Min time ve max time var mı? Eğer çok kısa bir window varsa (5 saniye gibi): uyarı ekle. Front-running veya sandwich attack olabilir.
Adım 8: Simulation
Stellar RPC simulateTransaction endpoint'ini kullan. Transaction'ı simulate et (gerçekten gönderme). Simulation result'ı parse et. Success mi, fail mi? Eğer fail ise: neden? Error message nedir?
State changes neler? Kullanıcının bakiyesi nasıl değişecek? Her asset için before/after göster. Fee düşüldükten sonra ne kalacak?
Events neler? Soroban contract event'leri parse et. Unexpected event var mı?
Resource consumption ne kadar? Fee estimation doğru mu?
Adım 9: Risk Score Calculation
Her threat'in severity'sine göre puan topla. Operation type'a göre weight uygula (changeTrust daha risky, payment daha az). Destination risk score'u ekle. Pattern detection score'u ekle. Anomaly detection score'u ekle.
Final risk score hesapla. Risk level belirle.
Adım 10: Recommendation Generation
Threat'lere göre actionable recommendation'lar üret. Eğer first time recipient ise: "Send a small test amount first (10 XLM) to verify the address." Eğer unusual amount ise: "Consider splitting this into smaller transactions." Eğer risky asset ise: "Use a verified alternative asset instead." Eğer blacklisted address ise: "DO NOT PROCEED. This address is known for scams."
Simulation Engine Logic
Simülasyon engine transaction'ı gerçekten göndermeden ne olacağını gösteriyor.
Stellar RPC Kullanımı:
Soroban RPC server'a bağlan. simulateTransaction method'unu çağır. Input: Transaction object (XDR encoded). Output: SimulateTransactionResponse.
Response Parse:
Response içinde neler var: results array (her operation için result). restorePreamble (restore gerekli mi?). minResourceFee (minimum ödenmesi gereken fee). events array (contract events). latestLedger (simulation hangi ledger'da yapıldı).
State Changes Extraction:
Simulation result'ından state changes'leri parse et. Ledger entries before/after comparison. Account balance'lar nasıl değişiyor? Trustline'lar nasıl değişiyor? Claimable balance'lar oluşuyor mu?
Balance Calculation:
Kullanıcının her asset için current balance'ını al. Transaction fee'yi çıkar. Payment amount'ları çıkar. Receive edilen amount'ları ekle. Final balance'ı hesapla.
State Change Object:
Her asset için: asset_code, issuer (native ise null), before_balance, after_balance, change (+ veya -), change_percentage.
Error Handling:
Simulation fail ederse: error code'u ve message'ı parse et. Kullanıcıya anlaşılır şekilde açıkla. Örnek error: "Insufficient balance - you need 100 XLM but only have 50".
Ortak error'lar: op_underfunded (yetersiz bakiye), op_no_trust (trustline yok), op_not_authorized (authorization gerekli), op_line_full (trustline limit dolmuş).
Community Intelligence Aggregator
Community intelligence sistemini nasıl kullanıyoruz.
Report Collection:
Kullanıcılar asset/issuer report edebiliyor. Report form: asset_code, issuer_address, report_type dropdown, description textarea, evidence_url (optional). Submit edince database'e yazılıyor (status: PENDING).
Report Verification:
Moderator (admin) pending report'ları görüyor. Evidence'ları check ediyor. Transaction hash varsa Stellar Explorer'da doğruluyor. Multiple report varsa cross-check yapıyor. Decision veriyor: VERIFIED, REJECTED, veya SPAM.
Auto-Blacklisting:
Eğer bir issuer/address için 10+ VERIFIED report gelirse: Otomatik blacklist'e ekleniyor. Alert gönderiliyor (future: bu asset'e trustline olan kullanıcılara).
Reputation Scoring:
Her issuer için reputation score hesaplanıyor. Formula: base_score = 50. Her verified scam report: -10 puan. Her positive review: +5 puan. Account age: +0.1 puan per day (max 20 puan). Verified TOML: +10 puan. Whitelist'te ise: +50 puan (total 100). Final score clamped 0-100 arası.
Crowd-Sourced Rating:
Kullanıcılar asset'lere 1-5 yıldız verebiliyor (future feature). Average rating hesaplanıyor. Rating count gösteriliyor. Trust score hesaplamasında kullanılıyor.

6. FRONTEND YAPISI
Page Structure
Next.js App Router kullanıyoruz. Folder-based routing.
Ana Sayfalar:
/app/page.tsx - Landing Page
Hero section: büyük başlık "Protect Your Stellar Transactions", alt başlık açıklama, CTA buttons (Install Extension, View Demo). Features section: 4 özellik kartı (Pre-Transaction Analysis, Asset Verification, Real-Time Monitoring, Educational Warnings). Her kart icon + başlık + açıklama. How It Works section: 3 adım gösterimi (1. Connect Wallet, 2. Make Transaction, 3. Get Protected). Demo video embed. Social proof: "10,000+ transactions protected, 500+ users". Footer: links, social media, contact.
/app/dashboard/page.tsx - Main Dashboard
Sadece authenticated users görebiliyor (future). Header: "Your Security Dashboard", connected wallet address gösterimi. Security Score Card: büyük circular progress (90/100), color-coded (green, yellow, red), "Your Portfolio is Secure" mesajı. Stats Grid: 4 kart (Transactions Protected, Threats Blocked, Trustlines, Risky Assets). Quick Actions: 3 button (Scan Portfolio, Analyze Transaction, View History). Recent Alerts: son 5 alert listesi, her alert severity badge + message + timestamp. Risky Assets Warning: eğer risky trustline varsa burada gösteriliyor, "Review and Remove" button.
/app/analyze/page.tsx - Transaction Analyzer
Manual transaction analysis tool. Input form: Transaction XDR textarea, Source Account input, Network selection (Testnet/Mainnet), "Analyze" button. Loading state: spinner + "Analyzing transaction..." Result display: AnalysisResult component render ediliyor (risk badge, threats, simulation, recommendations). Export button: JSON download veya PDF report.
/app/assets/page.tsx - Asset Explorer
Tüm Stellar asset'leri browse etme. Search bar: asset code veya issuer arama. Filters: risk level filter (All, Safe, Risky), verified only checkbox, sort by (Trust Score, Alphabet, Recent). Asset Grid: her asset için AssetCard component. Pagination: 20 asset per page, load more button.
/app/assets/[code]/[issuer]/page.tsx - Asset Detail
Belirli bir asset'in detay sayfası. Asset header: asset code, issuer address (truncated with copy button), verified badge, risk badge. Tabs: Overview (issuer info, flags, home domain), Security Analysis (threat list, risk factors, recommendations), Community (reports, ratings, comments), Holders (top holders list, distribution chart).
/app/education/page.tsx - Education Center
Security best practices öğretimi. Article list: "Understanding Trustlines", "What are Asset Flags?", "How to Spot Scams", "Safe Trading Practices". Each article: title, description, read time, "Read More" button. FAQ section: expandable question/answer. Glossary: Stellar terminology açıklamaları (sequence number, trustline, issuer, etc).
/app/settings/page.tsx - User Settings (future)
Alert preferences: email notifications on/off, risk threshold slider (hangi seviyede uyarı alsın). Wallet connections: connected wallet listesi, disconnect button. API keys: developer API key generate, usage stats. Privacy: data sharing preferences.
Component Architecture
Atomic Design Principles:
Atoms (en küçük): Button, Badge, Input, Icon. Molecules (kombinasyon): RiskBadge, ThreatCard, StatCard. Organisms (kompleks): AnalysisResult, AssetCard, DashboardHeader. Templates: DashboardLayout, LandingLayout. Pages: Yukarıdaki sayfalar.
Shared Components:
RiskBadge Component:
Input props: level (SAFE|LOW|MEDIUM|HIGH|CRITICAL), score (0-100). Render: rounded pill, background color risk level'a göre, icon (✅🟢⚠️🔶🚨), text "RISK LEVEL", score sayısı. Colors: SAFE green-100, LOW blue-100, MEDIUM yellow-100, HIGH orange-100, CRITICAL red-100.
ThreatCard Component:
Input props: threat object (type, severity, message, technical, explanation). Render: card with left border (color = severity), threat message (bold), technical details (small, gray), expandable "Why is this risky?" section (collapsible), severity badge top-right. Interaction: click to expand/collapse explanation.
AnalysisResult Component:
Input props: analysis object, onProceed callback, onCancel callback. Render: centered modal veya page. Risk badge at top center. Threats list (her threat için ThreatCard). Simulation result card (wallet state changes before/after). Recommendations card (bullet list). Action buttons: Cancel (red, left), Proceed Anyway (green, right, disabled if CRITICAL). Educational alert box at bottom ("Learn more about these risks").
AssetCard Component:
Input props: asset object. Render: card with shadow. Header: asset code (title), verified badge if applicable, risk badge top-right, issuer address (small, monospace, truncated). Body: issuer details grid (home domain, account age), flags badges (AUTH_REQUIRED, AUTH_REVOCABLE with color coding), community rating stars + review count. Footer: two buttons (View Details, Report Scam).
WalletStateChanges Component:
Input props: changes array (asset, before, after, change). Render: table veya list. Her asset için bir row. Columns: Asset (code + icon), Before (balance), After (balance), Change (+ or - with arrow, colored). Net change summary at bottom (total value change in USD if applicable).
StatCard Component:
Input props: label, value, icon, trend (optional). Render: card with background. Large number (value), small label below, icon top-left, trend indicator if exists (+5% last week, colored).
State Management
Global State (Zustand):
Connected wallet store: address, network (testnet/mainnet), balance, connection status, connect/disconnect functions. User preferences store: theme (light/dark), alert settings, language. Analysis cache store: recent analyses, avoid re-analyzing same transaction.
Server State (React Query):
Asset data queries: useAsset hook (fetch single asset), useAssets hook (fetch asset list with pagination). Analysis queries: useAnalyzeTransaction hook (transaction analysis API call), useAnalyzeAsset hook (asset analysis). Cache configuration: staleTime 5 minutes, cacheTime 10 minutes, refetchOnWindowFocus false.
Form State (React Hook Form):
Transaction analyze form. Asset search form. Scam report form. Validation with Zod schemas.
Styling Approach
Tailwind Utility Classes:
Spacing: p-4, m-2, gap-4. Colors: bg-gray-100, text-red-600. Typography: text-xl, font-bold. Layout: flex, grid, items-center. Responsive: md:text-lg, lg:grid-cols-3.
Custom CSS (minimal):
Animations (fadeIn, slideUp). Gradients (hero section background). Custom scrollbar. Print styles.
Dark Mode:
Tailwind dark: prefix. Example: bg-white dark:bg-gray-900. User toggle in settings. System preference fallback.

7. BROWSER EXTENSION
Extension Architecture
Manifest V3 Structure:
service_worker (background.js): persistent background logic. content_scripts (content.js): injected into web pages. popup (popup.html): extension popup UI. options page (optional): settings UI.
Content Script Logic
Content script her web sayfasına inject ediliyor. Wallet API'lerini intercept ediyor.
Freighter Wallet Interception:
Freighter window.freighterApi object'i oluşturuyor. Content script sayfaya inject olur olmaz bunu wrap ediyor. Original freighterApi'yi sakla. Yeni bir proxy object oluştur. signTransaction method'unu override et.
SignTransaction Override:
User signTransaction çağırdığında: XDR ve options'ı yakala. Log: "StellarSafe intercepted transaction". Backend API'ye POST request at (/api/analyze/transaction). Request body: {transactionXDR, sourceAccount, network}. Loading indicator göster ("Analyzing transaction..."). Response bekle (2-5 saniye). Response geldiğinde: risk score check et. Eğer score > 40 ise: warning modal göster. Eğer score < 40 ise: silent check (background'da log tut ama user'ı engelleme). Modal'da user'ın kararını bekle. Eğer "Cancel" seçerse: throw new Error, transaction iptal. Eğer "Proceed" seçerse: original freighterApi.signTransaction'ı çağır, normal flow devam.
Diğer Wallet'lar için:
Albedo: window.albedo.signTx. Rabet: window.rabet.sign. xBull: window.xBullSDK. Her biri için benzer interception logic. Generic wallet detector: tüm popüler wallet'ları detect et, mevcut olanı intercept et.
Modal Injection:
Custom modal HTML oluştur. DOM'a ekle (document.body.appendChild). Fixed position, z-index 9999999 (her şeyin üstünde). Backdrop (black, 80% opacity, blur effect). Modal content: centered white card, rounded corners, shadow. Content: StellarSafe logo, warning icon, risk badge, threat list, action buttons. Event listeners: Cancel button click, Proceed button click, outside click (close modal).
Background Service Worker
Service worker persistent background process (Manifest V3'te).
Responsibilities:
API communication orchestration. Cache management (store recent analyses). Badge update (extension icon'una notification badge). Cross-tab communication (eğer multiple tab varsa sync).
API Communication:
Content script'ten message alıyor (chrome.runtime.sendMessage). API'ye fetch request atıyor. Response'u parse ediyor. Content script'e geri gönderiyor (chrome.tabs.sendMessage).
Cache Management:
Chrome.storage.local kullanarak cache tutuyor. Recent analyses (last 100), asset metadata cache, user preferences. TTL management (eski cache'leri sil).
Badge Update:
Extension icon'una badge ekliyor. Badge text: threat count (örn. "3"). Badge color: risk level'e göre (green, yellow, red). User tıklayınca popup açılıyor.
Popup UI
Extension icon'una tıklayınca açılan küçük UI (400x600px).
Content:
Header: StellarSafe logo, connected wallet address (truncated). Security Score: circular progress bar, score number, status text ("Secure" veya "At Risk"). Quick Stats: 2x2 grid (Transactions Protected, Threats Blocked, Trustlines, Risky Assets). Quick Actions: 3 button (Scan Portfolio Now, Open Dashboard, Settings). Recent Alerts: last 3 alerts, condensed view, "View All" link.
Interactions:
Scan Portfolio button: trigger full portfolio scan, show loading, update stats. Open Dashboard button: chrome.tabs.create to dashboard URL. Settings button: open options page. Alert click: open detail view.
Extension Storage
chrome.storage.local:
User preferences (alert settings, theme). Cached data (asset metadata, analysis results). Session data (current wallet, connection status). Usage stats (transaction count, threat count).
chrome.storage.sync: (optional)
Settings sync across devices. User preferences. Whitelist/blacklist sync.
Permissions
Required Permissions:
storage: cache ve preferences için. tabs: tab management için. webRequest: network request interception için (optional). Host permissions: Stellar Horizon URL'leri.
Optional Permissions:
notifications: desktop notifications için. alarms: scheduled tasks için (cache cleanup).

8. API ENDPOINT'LERİ
RESTful API Design
Base URL: /api
Authentication: (future) JWT token in Authorization header. For now: public access (rate-limited).
Response Format:
Standard JSON: {success: boolean, data: object|array|null, error: string|null, meta: {timestamp, requestId}}.
Endpoint Listesi
POST /api/analyze/asset
Asset risk analizi yapıyor. Request body: {assetCode: string, issuerAddress: string}. Response: {success: true, data: {score: number, level: string, threats: array, recommendations: array, metadata: object}}. Status codes: 200 success, 400 invalid input, 500 server error. Rate limit: 100 requests/hour per IP.
POST /api/analyze/transaction
Transaction risk analizi. Request body: {transactionXDR: string, sourceAccount: string, network: "testnet"|"mainnet"}. Response: {success: true, data: {riskScore, riskLevel, threats, simulationResult, walletStateChange, recommendations}}. Processing time: 2-5 saniye (includes simulation). Rate limit: 50 requests/hour per IP.
POST /api/analyze/trustline
Trustline-specific analysis (convenience endpoint). Request body: {assetCode, issuerAddress, sourceAccount}. Response: asset analysis + user'ın mevcut trustline durumu. Rate limit: 100 requests/hour.
POST /api/analyze/payment
Payment operation analysis. Request body: {amount, destination, asset, sourceAccount}. Response: destination risk + amount anomaly + asset risk. Rate limit: 100 requests/hour.
GET /api/assets
Asset listesi. Query params: page, limit, search, riskLevel, verified. Response: {success, data: {assets: array, total: number, page, pages}, meta}. Pagination: default 20 per page, max 100. Cache: 5 dakika.
GET /api/assets/:assetCode/:issuer
Single asset detail. Params: assetCode, issuer address. Response: full asset object with analysis. Cache: 10 dakika.
GET /api/assets/:assetCode/:issuer/holders
Asset holder listesi. Query params: page, limit. Response: holder adresleri + balance'lar. Data source: Stellar Horizon. Cache: 1 saat.
POST /api/report/scam
Scam report submit. Request body: {assetCode (optional), issuerAddress, reportType, description, evidenceUrl (optional), reporterAddress}. Response: {success, data: {reportId}}. Validation: address format, enum values. Rate limit: 10 reports/day per address.
GET /api/reports/:issuer
Issuer için report listesi. Params: issuer address. Query: status filter. Response: report array. Public data (no personal info).
GET /api/whitelist
Verified issuer listesi. Response: {success, data: array of {issuer, name, assets, verifiedBy}}. Cache: 24 saat. Public endpoint.
GET /api/blacklist
Blacklisted addresses. Response: {success, data: array of {address, reason, severity, addedAt}}. Cache: 1 saat. Public endpoint.
GET /api/health
Health check endpoint. Response: {success: true, data: {status: "healthy", uptime, version, database: "connected"}}. Monitoring için.
GET /api/stats
Platform statistics. Response: {totalTransactionsAnalyzed, totalThreatsDetected, totalUsers, totalAssets}. Cache: 15 dakika. Public endpoint.
POST /api/portfolio/scan (future)
Full portfolio scan. Request body: {stellarAddress}. Response: {riskScore, riskyAssets: array, trustlineHealth: array, recommendations}. Long-running: 10-30 saniye. Rate limit: 5 scans/day per address.
POST /api/monitor/start (future)
Real-time monitoring başlat. Request body: {stellarAddress, alertThreshold}. Response: {monitoringId, status: "active"}. WebSocket connection kurulacak.
API Rate Limiting
Implementation:
Express-rate-limit middleware. Redis backend (production). In-memory (development). Per-endpoint limits (yukarıda belirtildi).
Rate Limit Headers:
X-RateLimit-Limit: total limit. X-RateLimit-Remaining: remaining requests. X-RateLimit-Reset: reset timestamp. Status 429 when exceeded: {success: false, error: "Rate limit exceeded. Try again in X seconds"}.
API Caching Strategy
Cache Layers:
Browser cache (HTTP headers). API response cache (Redis/in-memory). Database query cache (Prisma). External API cache (Stellar Horizon responses).
Cache Keys:
asset:{assetCode}:{issuer}. transaction:{hash}. portfolio:{address}. whitelist:all. TTL varies by endpoint.
Cache Invalidation:
Time-based (TTL). Event-based (new scam report invalidates issuer cache). Manual (admin can clear cache).

9. GÜVENLİK ANALİZ ALGORİTMALARI
Risk Scoring Algorithm
Weighted Scoring System:
Her threat bir weight'e sahip. Weight threat severity'sine göre: LOW = 1.0, MEDIUM = 1.5, HIGH = 2.0, CRITICAL = 3.0.
Base Score Calculation:
Her threat için: threat_score = base_points * severity_weight * confidence_factor. Confidence factor: 0.5-1.0 arası, threat'in ne kadar certain olduğu. Example: AUTH_REVOCABLE flag (certain fact) = 1.0 confidence. Community report (uncertain) = 0.7 confidence.
Score Aggregation:
Total score = sum of all threat scores. Normalization: 0-100 arası scale et. Formula: normalized = (total / max_possible) * 100. Max possible: eğer her possible threat varsa ne olur.
Adjustments:
Positive factors için bonus: verified TOML (-10), old account (-5), high distribution (-10), whitelist (-50). Negative factors için penalty: blacklist (+50 instant 100), mass reports (+5 per report).
Final Score:
Clamp to 0-100. Round to integer. Store in database.
Pattern Detection Algorithms
Mass Trustline Detection:
Input: transaction operations array. Count changeTrust operations. If count > threshold (5): pattern detected. Calculate distribution: kaç farklı issuer'a trustline açılıyor? If all from same issuer: less suspicious (maybe one project). If all from different issuer'lar: very suspicious (airdrop scam prep).
Sequence Bump Attack Detection:
Input: transaction operations, current account sequence. Check bumpSequence operations. Calculate bump amount: target_sequence - current_sequence. If bump > 100: suspicious. Check pending transactions: user'ın mempool'da bekleyen tx'i var mı? If yes + large bump: likely cancellation attack.
Drain Pattern Detection:
Input: transaction operations, account balances. Check all payment operations. Calculate total outgoing: sum of all payment amounts. Compare to account balance: if > 90% of balance: drain pattern. Check destinations: if all to same address: confirmed drain.
Honeypot Detection: (advanced, future)
Input: asset trading history. Check: can people sell this asset? Query DEX: are there completed sell orders? If not: potential honeypot. Check: is price always increasing? No liquidity on sell side? Red flags.
Machine Learning Models (Future Feature)
Training Data:
Labeled transactions: scam (1) vs legitimate (0). Features: asset flags, issuer age, transaction patterns, amounts, destinations. Dataset: 10K+ labeled transactions (collect from community reports + historical scams).
Model Architecture:
Binary classification (scam or not). Random Forest or XGBoost (not deep learning, overkill). Features: 50+ features extracted from transaction and context.
Features:
Issuer features: account age, transaction count, home domain exists, flags set. Asset features: supply, holders, distribution, price volatility. Transaction features: operation types, amounts, destination count, time bounds. Context features: user history, average amounts, known addresses.
Training:
Train-test split 80-20. Cross-validation. Metrics: precision, recall, F1-score (balanced). Threshold tuning: optimize for high recall (catch all scams), accept some false positives.
Inference:
Model runs on backend. Input: transaction + context. Output: probability 0-1 (scam likelihood). Threshold: if prob > 0.7: flag as risky. Combine with rule-based system: ML score + rule-based score weighted average.
Continuous Learning:
Retrain monthly with new data. User feedback loop: false positives/negatives improve model. A/B testing: compare model versions.

10. UI/UX TASARIMI
Design Principles
Clarity Over Complexity:
Security warnings anlaşılır olmalı. Technical jargon yok. Simple language. Visual hierarchy açık: risk level first, details second.
Progressive Disclosure:
Too much information overwhelming. Default: high-level summary. "Learn More" expandable sections. Technical details optional.
Color Psychology:
Green = safe, positive. Yellow/Orange = caution, warning. Red = danger, critical. Blue = info, neutral. Consistent color coding across all UI.
Accessibility:
WCAG 2.1 AA compliance. Keyboard navigation support. Screen reader compatible. Color blind friendly (not just color, use icons too). High contrast mode.
Mobile-First:
Responsive design. Touch-friendly targets (min 44x44px). Readable on small screens. Simplified mobile layouts.
Visual Design System
Typography:
Headings: Inter font family, bold. Body: Inter regular, 16px. Code/addresses: JetBrains Mono, 14px. Line height: 1.5 for readability.
Spacing:
Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64px. Consistent padding/margin. White space for breathing room.
Colors:
Primary: Blue (#3B82F6) for actions. Success: Green (#10B981). Warning: Yellow (#F59E0B). Danger: Red (#EF4444). Neutral: Gray scale (#F9FAFB to #111827).
Components:
Cards: white background, subtle shadow, rounded corners (8px). Buttons: medium size (px-4 py-2), rounded (6px), hover states. Badges: small size, uppercase text, colored background. Inputs: border, focus ring, validation states.
Icons:
Lucide Icons library. Consistent size (20px default). Meaningful icons (not decorative). Color matches context.
User Flows
Main Flow: Transaction Protection

User initiates transaction in wallet. 2. Wallet shows transaction details. 3. User clicks "Sign". 4. StellarSafe intercepts. 5. Loading state: "Analyzing..." (spinner). 6. Analysis complete: modal appears. 7. Modal shows: risk badge (large, prominent), threat list (collapsed by default), primary CTA ("Cancel" red, "Proceed" green). 8. User explores: click threat to expand explanation, see "Why risky?", click "Learn More" for education article. 9. Decision: Cancel → modal closes, transaction aborted, toast notification "Transaction cancelled". Proceed → modal closes, original flow continues, transaction signed. 10. Post-decision: toast notification "Transaction analyzed and signed", option to view analysis in dashboard.

Secondary Flow: Manual Analysis

User visits dashboard → "Analyze Transaction" button. 2. Form appears: paste XDR, enter source account, select network. 3. Click "Analyze". 4. Loading state (2-5 sec). 5. Results page: full analysis display (not modal, full page), detailed sections (risk summary, threats, simulation, recommendations), export button (PDF/JSON). 6. User actions: review threats, read explanations, copy risk score, share link.

Tertiary Flow: Asset Research

User visits Asset Explorer. 2. Search bar: type asset code or issuer. 3. Results grid: asset cards appear. 4. User clicks asset card. 5. Asset detail page loads: header (risk badge, verified badge), tabs (Overview, Security, Community, Holders). 6. User explores: read issuer info, check flags, view community reports, see holder distribution. 7. User actions: compare with similar assets, report scam, add to watchlist (future).

Animation & Micro-interactions
Loading States:
Skeleton loaders (not spinners) for content. Shimmer effect. Smooth transitions.
Success/Error Feedback:
Toast notifications (bottom-right). Auto-dismiss after 3 seconds. Slide-in animation. Color-coded (green success, red error).
Modal Transitions:
Fade-in backdrop (0.2s). Scale-up modal content (0.3s spring). Focus trap (keyboard navigation stays in modal).
Hover States:
Button: scale 1.02, brightness increase. Card: elevation increase (shadow). Link: underline appear.
Progress Indicators:
Circular progress (risk score). Linear progress (portfolio scan). Step indicator (multi-step forms).
Error Handling UI
Validation Errors:
Inline field errors (below input, red text). Form-level errors (top of form, red box). Clear error messages ("Invalid address format" not "Error 400").
API Errors:
User-friendly messages. Example: "Failed to analyze transaction" not "Network request failed". Retry button if applicable. Contact support link.
Empty States:
No data yet: illustration + message + CTA. Example: "No risky assets found. Your portfolio is secure!"
Fallbacks:
If simulation fails: show warning "Simulation unavailable, analysis may be incomplete". If API slow: show "Analysis taking longer than usual..." after 5s. If API down: graceful degradation "Offline mode: using cached data".

11. DEMO SENARYOLARI
Scenario 1: Fake USDC Attack
Setup:
Testnet'te fake issuer account oluştur. Fake USDC token issue et (asset code: "USDC"). AUTH_REVOCABLE flag'ini enable et. Home domain ekle ama geçersiz TOML. Birkaç fake transaction yap (görünüm için).
Demo Script:
"Meet Alice, new Stellar user. She wants to add USDC to her wallet. She searches 'USDC' and finds this asset. Let's see what happens without StellarSafe." [Show normal wallet UI] "She clicks Add Asset. No warnings. Trustline created. Later she tries to trade... and her balance is frozen!" [Show frozen balance error]
"Now let's try with StellarSafe." [Reset] "Alice searches USDC again. Clicks Add Asset. But this time..." [StellarSafe modal appears] "🚨 CRITICAL RISK! This is NOT real USDC. Auth Revocable flag detected - issuer can freeze your balance. Name impersonation - looks like USDC but wrong issuer. No verified TOML file."
"StellarSafe shows the real USDC: Circle issuer, verified domain, no freezing risk. Alice switches to the safe asset. Money protected!"
Expected Analysis:
Risk Score: 95/100. Threats: NAME_IMPERSONATION (CRITICAL), FREEZABLE_ASSET (HIGH), UNVERIFIED_ISSUER (HIGH). Recommendations: "Use Circle's USDC instead: GA5Z...", "Never trust assets without verified TOML", "Check issuer before trusting".
Scenario 2: Unusual Amount Warning
Setup:
Test account with transaction history (10 payments, avg 50 XLM). Create payment transaction: 1000 XLM (20x average). New destination address (never sent before).
Demo Script:
"Bob regularly sends 50 XLM to friends. Today he's sending 1000 XLM to a new address. Maybe he mistyped? Let's see." [Show transaction form, 1000 XLM entered] "Bob clicks Send. StellarSafe analyzes..." [Modal appears]
"⚠️ MEDIUM RISK. Unusual amount detected: You're sending 20x your average payment. First-time recipient: You've never sent to this address before."
"StellarSafe recommends: Send a small test amount first (10 XLM). Verify the address is correct. Bob decides to test with 10 XLM first. Smart!"
Expected Analysis:
Risk Score: 45/100. Threats: UNUSUAL_AMOUNT (MEDIUM), FIRST_TIME_RECIPIENT (LOW). Simulation: shows balance before (1500 XLM) → after (500 XLM), clearly visualizes large change. Recommendations: "Send test amount first", "Double-check recipient address", "Confirm via separate channel".
Scenario 3: Malicious Contract
Setup:
Soroban testnet contract (drainer contract). Contract function: approve_unlimited. Transaction: invoke this function.
Demo Script:
"Carol finds a DeFi app. Clicks 'Connect' then 'Approve'. She's about to give unlimited approval to a contract. Let's watch." [Show DApp UI] "Carol clicks Approve. StellarSafe intercepts..." [Modal appears]
"🚨 CRITICAL RISK! Unlimited approval requested. Unverified contract - no audit, no community review. Blacklisted contract - reported 47 times for draining wallets. Function: approve_all - dangerous pattern."
"StellarSafe recommendation: DO NOT PROCEED. This contract will drain your wallet. Carol cancels. Funds safe!"
Expected Analysis:
Risk Score: 100/100. Threats: UNLIMITED_APPROVAL (CRITICAL), UNVERIFIED_CONTRACT (HIGH), BLACKLISTED_CONTRACT (CRITICAL). Simulation: would show all assets approved. Recommendations: "Cancel immediately", "Never approve unknown contracts", "Report to Stellar".
Demo Presentation Tips
Visual Comparison:
Split screen: left = without StellarSafe (user loses money), right = with StellarSafe (user protected).
Live Demo:
Actually run these transactions on testnet. Show real Freighter wallet + StellarSafe extension. Interactive (click through UI).
Timing:
Each scenario: 60-90 seconds. Total demo: 3-4 minutes. Leave time for Q&A.
Talking Points:
Emphasize: "This happens every day on Stellar". "Protocol is secure but users aren't protected". "StellarSafe fills the gap". "Works with any wallet". "Free to use".

12. DEPLOYMENT STRATEJİSİ
Development Environment
Local Setup:
PostgreSQL local instance (Docker container). Next.js dev server (port 3000). Environment variables in .env.local: DATABASE_URL, STELLAR_NETWORK=testnet, API_KEY (future). Hot reload enabled. Browser extension: load unpacked (Chrome devtools).
Staging Environment
Purpose:
Test production build. Beta testers. Internal testing.
Infrastructure:
Vercel staging deployment (separate project). Supabase staging database (separate instance). Environment: STELLAR_NETWORK=testnet. Domain: staging.stellarsafe.app. Password protected (basic auth).
Testing:
Full user flows. Performance testing. API load testing (Artillery). Security scanning (OWASP ZAP). Cross-browser testing (Chrome, Firefox, Safari, Edge).
Production Environment
Web Application:
Vercel production deployment. Custom domain: stellarsafe.app. Automatic deployments from main branch. Environment: STELLAR_NETWORK=mainnet (also support testnet toggle). HTTPS enforced. CDN (Vercel Edge Network).
Database:
Supabase production (or Railway). PostgreSQL 15. Automated daily backups. Connection pooling (PgBouncer). Read replicas (if high traffic).
Monitoring:
Sentry for error tracking (frontend + backend). Vercel Analytics for performance. Custom logging (structured logs, Winston). Uptime monitoring (UptimeRobot). Alerts (email + Discord).
Browser Extension Deployment
Chrome Web Store:
Create developer account. Prepare assets: 128x128 icon, promotional images (1280x800), description (max 132 chars short, detailed description). Set privacy policy URL. Set categories (Productivity, Developer Tools). Pricing: Free. Distribution: Public.
Review Process:
Submit for review (2-7 days). Address feedback if rejected. Approval → published. Auto-updates for users.
Updates:
Version bump in manifest. Build extension. Upload new ZIP. Submit for review. Users get auto-update.
Firefox Add-ons: (future)
Similar process. Mozilla Add-ons store.
API Deployment
Endpoints:
All Next.js API routes deploy with Vercel. Serverless functions (auto-scaling). Cold start optimization (keep warm with cron). Rate limiting configured (via middleware).
Documentation:
API docs generated (Swagger/OpenAPI). Hosted at stellarsafe.app/api/docs. Interactive API explorer. Code examples (cURL, JS, Python).
Database Migrations
Strategy:
Never breaking changes (backward compatible). Add new tables/columns (don't drop immediately). Deprecation period (3 months warning). Rollback plan (down migrations).
Process:
Write migration (Prisma migrate). Test on staging. Apply to production (off-peak hours). Verify (check data integrity). Monitor (watch for errors).
CI/CD Pipeline
GitHub Actions:
On pull request: run tests, lint, type check, build. On merge to main: deploy to staging automatically. On release tag: deploy to production (manual approval).
Tests:
Unit tests (Vitest). Integration tests (API endpoints). E2E tests (Playwright, critical flows). Coverage threshold: 70%.
Quality Checks:
ESLint (no errors allowed). Prettier (auto-format). TypeScript (strict mode). Bundle size check (max 500KB JS).
Performance Optimization
Frontend:
Code splitting (Next.js automatic). Image optimization (Next.js Image). Lazy loading (React.lazy). Preloading (critical resources). Service worker (cache assets).
Backend:
Database query optimization (indexes). N+1 query prevention. Response caching (Redis). API request batching. Compression (gzip).
Metrics:
Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1. API latency: p95 < 500ms. Database query time: p95 < 100ms.
Security Measures
HTTPS:
Force HTTPS (HSTS header). TLS 1.3. Certificate auto-renewal (Vercel handles).
Input Validation:
Sanitize all inputs. XDR validation (must be valid base64). Address validation (ED25519 format). SQL injection prevention (Prisma parameterized queries).
Rate Limiting:
IP-based (100 req/hour). API key-based (1000 req/hour, future). Exponential backoff on abuse. Cloudflare DDoS protection.
Secrets Management:
Environment variables (never commit). Vercel encrypted env vars. Separate secrets per environment. Rotate keys quarterly.
Data Privacy:
No PII stored (no email, name). Wallet addresses pseudonymous. GDPR compliant (no personal data). Cookie consent (minimal cookies).
Backup & Disaster Recovery
Database Backups:
Daily automated backups (Supabase). Point-in-time recovery (7 days). Backup testing (monthly restore test). Offsite storage (S3).
Code Backups:
Git repository (GitHub). Multiple branches (main, staging, dev). Tag releases. Mirror repository (GitLab backup).
Disaster Recovery Plan:
Database restore procedure documented. Vercel rollback (instant, via UI). DNS failover (if needed). Incident response team. Recovery Time Objective: 1 hour. Recovery Point Objective: 24 hours.
Monitoring & Alerts
Application Monitoring:
Sentry error tracking. Alert on: error rate > 1%, API latency > 1s, database connection failure. Discord webhook notifications.
Infrastructure Monitoring:
Vercel analytics (build times, function invocations). Database monitoring (CPU, memory, connections). Uptime checks (5-minute intervals).
Custom Metrics:
Analysis count (transactions analyzed). Threat detection (threats found). User growth (active users). Performance (analysis latency).
Scaling Strategy
Phase 1 (0-1K users):
Vercel free tier sufficient. Supabase free tier (up to 500MB DB). No caching needed. Simple architecture.
Phase 2 (1K-10K users):
Vercel Pro ($20/month). Supabase paid tier ($25/month). Add Redis caching ($10/month). Optimize database queries.
Phase 3 (10K-100K users):
Vercel Enterprise (custom pricing). Dedicated database (Railway/AWS RDS). Redis cluster (ElastiCache). Read replicas. CDN optimization.
Phase 4 (100K+ users):
Microservices architecture (split analyzer service). Kubernetes deployment (EKS/GKE). Multi-region deployment. Load balancer. Auto-scaling. Dedicated DevOps engineer.

📝 ÖZET: PROJE BİLEŞENLERİ
Core Components (MVP için şart)

✅ PostgreSQL database (5 main tables)
✅ Next.js web app (6 main pages)
✅ Browser extension (Freighter interception)
✅ Asset analyzer (multi-layer analysis)
✅ Transaction analyzer (risk scoring)
✅ Simulation engine (Stellar RPC)
✅ API layer (8 endpoints)
✅ UI components (10 major components)

Nice-to-Have (Post-MVP)

Machine learning model
Mobile apps
Real-time monitoring (WebSocket)
Advanced analytics dashboard
Multi-language support
Insurance partnerships

Success Criteria (Hackathon)

✅ Working demo (3 scenarios)
✅ Live testnet deployment
✅ Browser extension functional
✅ Professional UI
✅ Clear documentation
✅ Impressive pitch