# 📦 NPM Package Publish Rehberi

## 🎯 Hedef
CLI'yı NPM'e publish ederek kullanıcıların `npx @stellarsafe/cli` ile kullanabilmesini sağlamak.

---

## 📋 Publish Adımları

### 1. NPM Account Kontrol
```bash
npm whoami
# Eğer login değilsen:
npm login
```

### 2. Package Build
```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/cli-tool
npm run build
```

### 3. Package Test (Local)
```bash
# Local test
npm pack
# Çıktı: stellarsafe-cli-1.0.0.tgz
```

### 4. NPM Publish
```bash
npm publish --access public
```

**Beklenen Çıktı:**
```
+ @stellarsafe/cli@1.0.0
```

---

## ✅ Publish Sonrası Test

### 1. Global Install Test
```bash
npm install -g @stellarsafe/cli
stellarsafe --version
# Çıktı: 1.0.0
```

### 2. NPX Test
```bash
npx @stellarsafe/cli --version
# Çıktı: 1.0.0
```

### 3. Verification Test
```bash
cd /path/to/any/contract
npx @stellarsafe/cli verify TEST123
```

---

## 🌐 Kullanıcı Dokümantasyonu

### README.md Güncellemesi
```markdown
# StellarSafe CLI

## Installation

### Option 1: One-time use (Recommended)
```bash
npx @stellarsafe/cli verify YOUR_CODE
```

### Option 2: Global install
```bash
npm install -g @stellarsafe/cli
stellarsafe verify YOUR_CODE
```

## Usage

1. Deploy your contract to Stellar
2. Visit https://stellarsafe.io/developer
3. Generate verification code
4. Run verification:

```bash
cd your-contract-directory
npx @stellarsafe/cli verify YOUR_CODE
```
```

---

## 📊 Package Stats

Package bilgileri:
- **Name:** @stellarsafe/cli
- **Version:** 1.0.0
- **Size:** ~50KB (dependencies dahil)
- **Node:** >=14.0.0

---

## 🚀 Şimdi Publish Et!

```bash
cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/cli-tool
npm publish --access public
```

Publish sonrası kullanıcılar şöyle kullanabilecek:

```bash
# Herhangi bir Soroban contract dizininde
npx @stellarsafe/cli verify X7K9M2
```

---

## 🎯 Production URL Güncellemesi

Publish sonrası CLI'da default API URL'yi production'a çevir:

```typescript
// cli-tool/src/index.ts
const defaultApiUrl = 'https://stellarsafe.io'; // localhost:3002 yerine
```

Sonra version bump et:
```bash
npm version patch  # 1.0.0 → 1.0.1
npm publish
```
