# ⚡ Contract Verification - Quick Start Guide

The fastest way to verify your Soroban smart contract on StellarSafe.

## 🚀 5-Minute Quick Start

### 1️⃣ Deploy Your Contract (2 min)

```bash
cd my-contract
soroban contract build
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source my-account \
  --network testnet
```

**Save the output contract ID!** (starts with `C`, 56 characters)

### 2️⃣ Get Verification Code (1 min)

1. Visit: **https://stellarsafe.io/developer**
2. Enter your contract ID
3. Select network (testnet/mainnet)
4. Click **"Generate Verification Code"**
5. Copy the 6-digit code (e.g., `X7K9M2`)

### 3️⃣ Run Verification (2 min)

```bash
cd my-contract
npx @stellarsafe/cli verify X7K9M2
```

**Done!** ✅ Your contract is verified.

---

## 📋 Prerequisites Checklist

- [ ] Contract deployed to Stellar
- [ ] Git repository initialized
- [ ] Source code committed to Git
- [ ] Repository is public on GitHub
- [ ] Node.js 14+ installed

## 🎯 Complete Flow Diagram

```
Developer              StellarSafe            CLI Tool
    |                       |                     |
    |---Deploy Contract---->|                     |
    |                       |                     |
    |---Generate Code------>|                     |
    |<------X7K9M2----------|                     |
    |                       |                     |
    |---------------stellarsafe verify X7K9M2--->|
    |                       |                     |
    |                       |<--Submit Data-------|
    |                       |                     |
    |                       |---Verify Checks---->|
    |                       |                     |
    |<--✅ VERIFIED---------|                     |
```

## 🔑 What Gets Verified?

| Check | What It Means |
|-------|---------------|
| ✅ **WASM Match** | Deployed bytecode = Your source code |
| ✅ **Public Source** | Code is visible on GitHub |
| ✅ **Source Files** | File count is reasonable |
| ✅ **Build Environment** | Valid Rust & Soroban versions |
| ✅ **WASM Size** | Binary size is reasonable |
| ✅ **Build Recency** | Built within 30 days |

## 💡 Common Issues

### "WASM binary not found"
```bash
soroban contract build
```

### "Contract not found on Stellar network"
```bash
# Check contract exists
soroban contract inspect --id YOUR_CONTRACT_ID --network testnet
```

### "Source code repository is not accessible"
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/repo
git push -u origin main

# Make repository public on GitHub
```

### "Verification code has expired"
Codes expire after 30 minutes. Generate a new one at:
https://stellarsafe.io/developer

## 🎨 CLI Output Example

```
🔒 StellarSafe Contract Verification
═══════════════════════════════════════════════════════════

Verification Code: X7K9M2
Project Directory: /Users/dev/my-contract
API Endpoint: https://stellarsafe.io

✓ Contract information collected

📋 Collected Information:
  Contract Name:  my_token_contract
  WASM Hash:      a3f5c21d8b4e9f6a...
  WASM Size:      42.50 KB
  Source Files:   8 files
  Git Commit:     abc1234
  Git Branch:     main
  Git Remote:     https://github.com/user/my-contract

✓ Verification data submitted

🔍 Verification Results:
  ✓ WASM_MATCH         PASSED
  ✓ PUBLIC_SOURCE      PASSED
  ✓ SOURCE_FILES       PASSED
  ✓ BUILD_ENV          PASSED
  ✓ WASM_SIZE         PASSED
  ✓ BUILD_RECENCY     PASSED

✓ CONTRACT VERIFIED SUCCESSFULLY! 🎉
```

## 📚 Installation Options

### Option 1: One-time use (Recommended)
```bash
npx @stellarsafe/cli verify X7K9M2
```

### Option 2: Global install
```bash
npm install -g @stellarsafe/cli
stellarsafe verify X7K9M2
```

### Option 3: Project dependency
```bash
npm install @stellarsafe/cli
npx stellarsafe verify X7K9M2
```

## 🔧 Advanced Usage

### Custom directory
```bash
stellarsafe verify X7K9M2 --directory ./my-contract
```

### Local development
```bash
stellarsafe verify X7K9M2 --api-url http://localhost:3000
```

### Check status
```bash
stellarsafe status X7K9M2
```

### Show help
```bash
stellarsafe help
```

## 🏆 Benefits of Verification

### For Your Users
- ✅ See your source code
- ✅ Trust your contract
- ✅ Verify it's safe
- ✅ Check build details

### For Your Project
- ✅ Build credibility
- ✅ Increase adoption
- ✅ Stand out in ecosystem
- ✅ Attract investors

### For Stellar Ecosystem
- ✅ Reduce scams
- ✅ Increase transparency
- ✅ Build confidence
- ✅ Support growth

## 📞 Need Help?

- **Documentation:** https://stellarsafe.io/docs
- **Full Guide:** See `CONTRACT_VERIFICATION_GUIDE.md`
- **Testing Guide:** See `VERIFICATION_TESTING_GUIDE.md`
- **Issues:** https://github.com/stellarsafe/stellarsafe/issues
- **Email:** hello@stellarsafe.io

## 🎯 Next Steps

After verification:

1. ✅ Share your verified contract badge
2. 📱 Add verification link to your docs
3. 🌐 Promote on social media
4. 🤝 Build user trust

**Verification URL:**
```
https://stellarsafe.io/contract/YOUR_CONTRACT_ID
```

---

**Made with ❤️ by the StellarSafe Team**

