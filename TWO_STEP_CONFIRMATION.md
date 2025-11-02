# 🛡️ İki Aşamalı Güvenlik Onay Sistemi

## 📋 Genel Bakış

Kullanıcılar artık kripto göndermeden önce **iki aşamalı onay süreci**nden geçiyor:

```
1. Form Doldurma
   ↓
2. Otomatik Güvenlik Taraması (1 saniye debounce)
   ↓
3. "Devam Et" butonu
   ↓
4. STEP 1: Güvenlik Raporu Review
   ↓
5. STEP 2: Final Onay
   ↓
6. Transaction Gönderiliyor
   ↓
7. Başarı Mesajı
```

---

## 🔒 Güvenlik Aşamaları

### STEP 1: Güvenlik Raporu Review

**Ne gösterilir:**
- ✅ Risk seviyesi badge (büyük, renkli)
- 🤖 AI güvenlik analizi özeti
- 💡 AI önerileri
- ⚠️ Uyarılar listesi (varsa)
- ✅ Pozitif işaretler (varsa)
- 📋 İşlem detayları özeti:
  - Gönderilen miktar
  - Alıcı adres (kısaltılmış)
  - Memo (varsa)
  - Network (testnet/mainnet)
  - İşlem ücreti tahmini

**Kullanıcı ne yapar:**
- Tüm güvenlik bilgilerini okur
- Risk seviyesini görür
- AI önerilerini inceler
- "← Geri Dön" (forma döner)
- "Devam Et →" (final onaya geçer)

**CRITICAL Risk Engelleme:**
- CRITICAL risk seviyesinde "Devam Et" butonu devre dışı
- Kullanıcı forma geri dönmek zorunda
- Hata mesajı: "⛔ Bu adrese gönderim yapılamaz"

---

### STEP 2: Final Onay

**Ne gösterilir:**
- ⚡ "Son Onay" başlığı
- ⚠️ Önemli uyarı kutusu (turuncu):
  - "Bu işlem geri alınamaz"
  - "Alıcı adresini tekrar kontrol edin"
  - "Yanlış adrese gönderilen kripto kurtarılamaz"
- 📊 Final işlem özeti:
  - **BÜYÜK** miktar gösterimi
  - Tam alıcı adresi (kopyalanabilir)
  - Risk seviyesi badge
- ✅ "Onayla ve Gönder" butonu (gradient, turuncu-kırmızı)

**Kullanıcı ne yapar:**
- Son kez tüm bilgileri kontrol eder
- Adresin doğruluğunu onaylar
- "← Geri" (güvenlik raporuna döner)
- "✅ Onayla ve Gönder" (transaction başlar)

---

## 🎨 UI Gösterimi

### STEP 1: Güvenlik Raporu

```
┌──────────────────────────────────────────────────┐
│ 🔍 Güvenlik Taraması Tamamlandı                  │
│ İşleminizi onaylamadan önce tüm detayları        │
│ inceleyin                                        │
├──────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐ │
│ │ ⚠️ HIGH                   Risk: 78/100       │ │
│ │ Risk Seviyesi: HIGH                          │ │
│ │                                              │ │
│ │ ⚠️ DİKKAT: Yüksek riskli adres.             │ │
│ │    Küçük miktarla test edin.                 │ │
│ │                                              │ │
│ │ 🤖 AI Güvenlik Analizi                       │ │
│ │ Bu adres yüksek risk içeriyor...             │ │
│ │                                              │ │
│ │ 💡 Öneriler:                                 │ │
│ │ • Önce küçük test miktarı gönderin           │ │
│ │ • Alıcının adresi doğrulamasını isteyin      │ │
│ │                                              │ │
│ │ ⚠️ Uyarılar:                                 │ │
│ │ • Çok yeni hesap                             │ │
│ │ • Yetersiz transaction geçmişi               │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ 📋 İşlem Detayları                               │
│ Gönderilen Miktar: 100 XLM                       │
│ Alıcı Adres: GAAAAAAA...BBBBBBBB                 │
│ Network: 🧪 Testnet                              │
│ İşlem Ücreti: ~0.00001 XLM                       │
│                                                  │
│ [← Geri Dön]        [Devam Et →]                 │
└──────────────────────────────────────────────────┘
```

### STEP 2: Final Onay

```
┌──────────────────────────────────────────────────┐
│ ⚡ Son Onay                                       │
│ Bu işlem geri alınamaz. Lütfen tüm bilgileri    │
│ kontrol edin.                                    │
├──────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐ │
│ │ ⚠️ Önemli Uyarı                              │ │
│ │                                              │ │
│ │ • Bu işlem geri alınamaz ve iptal edilemez   │ │
│ │ • Alıcı adresini tekrar kontrol edin         │ │
│ │ • Yanlış adrese gönderilen kripto            │ │
│ │   kurtarılamaz                               │ │
│ │ • Devam etmek istediğinize emin misiniz?     │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │        Onaylanacak İşlem                     │ │
│ │                                              │ │
│ │           100 XLM                            │ │
│ │           gönderilecek                       │ │
│ │                                              │ │
│ │               ↓                              │ │
│ │                                              │ │
│ │ Alıcı Adres:                                 │ │
│ │ GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...           │ │
│ │                                              │ │
│ │        ⚠️ HIGH RİSK                          │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [← Geri]    [✅ Onayla ve Gönder]                │
│              (gradient button)                   │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Kullanıcı Akışı

### Senaryo 1: SAFE Risk - Normal Akış

```
1. Kullanıcı form doldurur
   - Asset seçer (XLM)
   - Adres girer: GSAFE...
   - Miktar girer: 50

2. [1 saniye bekleme]
   ✅ Güvenlik analizi: SAFE (Risk: 15/100)

3. "Devam Et" butonuna tıklar

4. STEP 1: Güvenlik Raporu Review
   ✅ SAFE Risk
   ✅ Pozitif işaretler:
      • Eski ve güvenilir hesap
      • Zengin transaction geçmişi
   💡 AI Öneri: "Güvenle gönderim yapabilirsiniz"
   
   [Devam Et →] tıklar

5. STEP 2: Final Onay
   ⚠️ Önemli uyarı okur
   📊 İşlem özetini görür:
      50 XLM → GSAFE...
   
   [✅ Onayla ve Gönder] tıklar

6. Transaction gönderiliyor...
   Freighter pop-up açılır
   İmzalar

7. ✅ Gönderim Başarılı!
   50 XLM başarıyla gönderildi
```

### Senaryo 2: HIGH Risk - Dikkatli Akış

```
1. Kullanıcı form doldurur
   - Asset seçer (XLM)
   - Adres girer: GNEW...
   - Miktar girer: 100

2. [1 saniye bekleme]
   ⚠️ Güvenlik analizi: HIGH (Risk: 78/100)

3. "Devam Et" butonuna tıklar

4. STEP 1: Güvenlik Raporu Review
   ⚠️ HIGH Risk - turuncu renk
   ⚠️ Uyarılar:
      • Çok yeni hesap (7 gün)
      • Yetersiz transaction (12 tx)
   💡 AI Öneri:
      • Önce küçük test miktarı gönderin
      • Alıcının adresi doğrulamasını isteyin
   
   Kullanıcı okuyor ve düşünüyor...
   
   Seçenek A: [← Geri Dön] tıklar
              → Forma döner
              → Miktarı 10 XLM'e düşürür
              → Tekrar dener
   
   Seçenek B: [Devam Et →] tıklar
              → STEP 2'ye geçer

5. STEP 2: Final Onay
   ⚠️ Önemli uyarı - daha dikkatli okur
   📊 İşlem özeti:
      100 XLM → GNEW... (⚠️ HIGH RİSK)
   
   Seçenek A: [← Geri] tıklar
              → STEP 1'e döner
   
   Seçenek B: [✅ Onayla ve Gönder] tıklar
              → Transaction başlar

6. Transaction gönderiliyor...

7. ✅ Başarılı
```

### Senaryo 3: CRITICAL Risk - Engellendi

```
1. Kullanıcı form doldurur
   - Asset seçer (XLM)
   - Adres girer: GSCAM...
   - Miktar girer: 500

2. [1 saniye bekleme]
   🛑 Güvenlik analizi: CRITICAL (Risk: 95/100)
   ⛔ Bilinen scammer adresi!

3. "Devam Et" butonuna tıklar

4. ❌ HATA MESAJI:
   "⛔ Bu adrese gönderim yapılamaz. 
    Çok yüksek risk tespit edildi!"
   
   Kullanıcı forma geri döner
   Transaction GÖNDERİLMEZ
   
   Log: 'cancelled' (analytics'e kaydedilir)
```

---

## 🎯 Önemli Özellikler

### 1. Risk Bazlı Akış
- **SAFE/LOW**: Normal akış, hızlı onay
- **MEDIUM**: Dikkatli okuma önerilir
- **HIGH**: Uyarılar gösterilir, dikkatli akış
- **CRITICAL**: İşlem ENGELLENİR ⛔

### 2. Geri Dönülebilir
- Her aşamada "← Geri" butonu var
- Kullanıcı istediği zaman forma dönebilir
- Hiçbir şey kaybolmaz

### 3. Bilgilendirme
Kullanıcıya gösterilen her şey:
- ✅ Risk seviyesi ve açıklaması
- 🤖 AI güvenlik analizi
- 💡 Öneriler
- ⚠️ Uyarılar
- ✅ Pozitif işaretler
- 📋 İşlem detayları
- ⚡ İşlem ücretleri
- 🌐 Network bilgisi

### 4. Analytics
Her adımda log tutulur:
- Form doldurma → Analiz
- STEP 1 → Review
- STEP 2 → Final onay
- Transaction → Sent/Cancelled

### 5. UX İyileştirmeleri
- Loading states (analiz ediliyor, gönderiliyor)
- Disabled states (analiz tamamlanana kadar)
- Gradient button (final onay için dikkat çekici)
- Color coding (risk seviyesine göre renkler)
- Icons (emoji ve SVG)

---

## 🧪 Test Senaryoları

### Test 1: SAFE Adres - Hızlı Akış
```bash
Adres: Mainnet'te eski exchange adresi
Miktar: 50 XLM
Beklenen: 
- SAFE risk
- Hızlı onay
- Transaction başarılı
```

### Test 2: HIGH Adres - Dikkatli Akış
```bash
Adres: Testnet'te yeni hesap (7 gün)
Miktar: 100 XLM
Beklenen:
- HIGH risk (turuncu)
- Uyarılar gösterilir
- Kullanıcı iki kez düşünür
- Transaction yapılabilir (onaylanırsa)
```

### Test 3: CRITICAL Adres - Engelleme
```bash
Adres: Bilinen scam (KNOWN_SCAM_ADDRESSES'e ekle)
Miktar: 500 XLM
Beklenen:
- CRITICAL risk (kırmızı)
- "Devam Et" butonu hata verir
- Transaction GÖNDERİLMEZ ⛔
```

### Test 4: Geri Dönme
```bash
1. Form doldur
2. "Devam Et" tıkla
3. STEP 1'de "← Geri Dön" tıkla
4. Forma döndüğünü kontrol et
5. Bilgilerin korunduğunu kontrol et
```

### Test 5: Adres Değiştirme
```bash
1. İlk adres gir → Analiz yapılır
2. Adresi değiştir → Yeni analiz başlar
3. 1 saniye bekle (debounce)
4. Yeni analiz sonuçlarını gör
```

---

## 💡 Kullanıcı İçin Faydalar

### 1. Güvenlik
- ✅ Scam adreslerine gönderim önlenir
- ✅ Riskli adreslerde uyarı alınır
- ✅ Kullanıcı bilgilendirilir

### 2. Şeffaflık
- ✅ Tüm detaylar gösterilir
- ✅ Risk faktörleri açıklanır
- ✅ AI önerileri sunulur

### 3. Kontrol
- ✅ Her aşamada geri dönülebilir
- ✅ Final onay kullanıcıda
- ✅ İstediği zaman iptal edebilir

### 4. Eğitim
- ✅ Risk faktörleri öğrenilir
- ✅ Güvenli transaction alışkanlığı kazanılır
- ✅ Blockchain güvenlik bilinci artar

---

## 🚀 Özet

**Eski Sistem:**
```
Form → [Gönder] → Transaction
         ↓
    (Çok hızlı, riskli!)
```

**Yeni Sistem:**
```
Form → [Devam Et] → STEP 1: Güvenlik Raporu
                        ↓
                   [Devam Et →]
                        ↓
                   STEP 2: Final Onay
                        ↓
                   [✅ Onayla ve Gönder]
                        ↓
                   Transaction
```

**Sonuç:**
- ✅ Daha güvenli
- ✅ Daha bilinçli
- ✅ Daha şeffaf
- ✅ Kullanıcı kontrol sahibi

**Test Et:**
```bash
npm run dev
# http://localhost:3000/defense-wallet
# "Kripto Gönder" → İki aşamalı onay sistemini dene
```
