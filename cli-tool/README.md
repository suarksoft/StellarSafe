# 🔒 StellarSafe CLI

Official command-line tool for verifying Soroban smart contracts on StellarSafe.

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @stellarsafe/cli
```

After installation, you can use the `stellarsafe` command anywhere:

```bash
stellarsafe verify X7K9M2
```

### One-time Use with npx

No installation required:

```bash
npx @stellarsafe/cli verify X7K9M2
```

Perfect for CI/CD pipelines and occasional use.

## 🚀 Quick Start

### 1. Deploy Your Contract

First, deploy your Soroban contract to Stellar network:

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source my-account \
  --network testnet
```

### 2. Get Verification Code

1. Visit [https://stellarsafe.io/developer](https://stellarsafe.io/developer)
2. Enter your contract ID and network
3. Click "Generate Verification Code"
4. Copy the 6-character code (e.g., `X7K9M2`)

### 3. Run Verification

Navigate to your contract directory and run:

```bash
cd my-contract
stellarsafe verify X7K9M2
```

The CLI will:
- ✅ Collect contract information (WASM hash, source code, Git info)
- ✅ Submit data to StellarSafe API
- ✅ Run verification checks
- ✅ Display results

### 4. Get Verified Badge! 🎉

If verification passes, your contract receives a verified badge on StellarSafe!

## 📖 Commands

### `verify <code>`

Verify a contract using a verification code.

```bash
stellarsafe verify X7K9M2
```

**Options:**
- `-d, --directory <path>` - Contract directory path (default: current directory)
- `-a, --api-url <url>` - Custom API URL (default: https://stellarsafe.io)

**Examples:**

```bash
# Verify current directory
stellarsafe verify X7K9M2

# Verify specific directory
stellarsafe verify X7K9M2 --directory ./my-contract

# Use local development server
stellarsafe verify X7K9M2 --api-url http://localhost:3000

# Use with npx
npx @stellarsafe/cli verify X7K9M2
```

### `status <code>`

Check the status of a verification request.

```bash
stellarsafe status X7K9M2
```

**Options:**
- `-a, --api-url <url>` - Custom API URL

### `help`

Display help information.

```bash
stellarsafe help
```

## 🔍 What Gets Verified?

The CLI collects and verifies:

| Check | Description |
|-------|-------------|
| **WASM Match** | Ensures deployed bytecode matches your source |
| **Public Source** | Verifies source code is publicly accessible |
| **Source Files** | Validates file count is reasonable |
| **Build Environment** | Checks Rust and Soroban versions |
| **WASM Size** | Ensures binary size is reasonable |
| **Build Recency** | Confirms contract was built recently |

## 📋 Requirements

- **Node.js** 14+ 
- **Rust** (for building contracts)
- **Soroban CLI** (for deploying contracts)
- **Git** (recommended for full verification)

## 🛠️ Development Setup

For contributors and developers:

```bash
# Clone the repository
git clone https://github.com/stellarsafe/stellarsafe.git
cd stellarsafe/cli-tool

# Install dependencies
npm install

# Build the CLI
npm run build

# Test locally
npm link
stellarsafe verify TEST123
```

## 📝 Example Output

```
🔒 StellarSafe Contract Verification

═══════════════════════════════════════════════════════════

Verification Code: X7K9M2
Project Directory: /Users/dev/my-contract
API Endpoint: https://stellarsafe.io

✓ Contract information collected

─────────────────────────────────────────────────────────

📋 Collected Information:

  Contract Name:  my_token_contract
  WASM Hash:      a3f5c21d8b4e9f6a2c1d...
  WASM Size:      42.50 KB
  Source Files:   8 files
  Source Hash:    d4e7b9c3a6f2e1d8c5b4...
  Git Commit:     abc1234
  Git Branch:     main
  Git Remote:     https://github.com/user/my-contract
  Rust Version:   rustc 1.70.0
  Soroban CLI:    soroban 20.0.0

─────────────────────────────────────────────────────────

✓ Verification data submitted

─────────────────────────────────────────────────────────

🔍 Verification Results:

  ✓ WASM_MATCH          PASSED
    WASM bytecode matches on-chain contract
  ✓ PUBLIC_SOURCE       PASSED
    Source code is publicly accessible
  ✓ SOURCE_FILES        PASSED
    Contract has 8 source files (reasonable)
  ✓ BUILD_ENV           PASSED
    Built with rustc 1.70.0, soroban 20.0.0
  ✓ WASM_SIZE          PASSED
    WASM size: 42.5KB (reasonable)
  ✓ BUILD_RECENCY      PASSED
    Contract built recently

─────────────────────────────────────────────────────────

✓ CONTRACT VERIFIED SUCCESSFULLY! 🎉

Your contract has been verified and will receive a verified badge.

View your contract: https://stellarsafe.io/contract/CABCD...
```

## 🐛 Troubleshooting

### "WASM binary not found"

Build your contract first:

```bash
soroban contract build
```

or:

```bash
cargo build --target wasm32-unknown-unknown --release
```

### "Not a git repository"

Initialize git in your project:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/your-repo
git push -u origin main
```

### "Source code repository is not accessible"

Make sure your GitHub repository is public, or if private, verify you have access configured.

### "Invalid verification code"

- Check the code is exactly 6 characters
- Codes expire after 30 minutes - generate a new one
- Make sure you're using the latest code from the website

### "Cannot connect to StellarSafe API"

- Check your internet connection
- Verify you're using the correct API URL
- If using a local server, ensure it's running: `npm run dev`

## 🌐 Resources

- **Website:** [https://stellarsafe.io](https://stellarsafe.io)
- **Documentation:** [https://stellarsafe.io/docs](https://stellarsafe.io/docs)
- **GitHub:** [https://github.com/stellarsafe/stellarsafe](https://github.com/stellarsafe/stellarsafe)
- **Issues:** [https://github.com/stellarsafe/stellarsafe/issues](https://github.com/stellarsafe/stellarsafe/issues)
- **Support:** hello@stellarsafe.io

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

---

Made with ❤️ by the StellarSafe team

