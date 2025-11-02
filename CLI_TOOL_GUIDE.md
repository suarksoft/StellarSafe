# StellarSafe CLI Tool Guide

The StellarSafe CLI tool enables developers to verify their Soroban smart contracts directly from their development environment. This guide covers installation, usage, and troubleshooting.

## 🚀 Quick Start

### Installation

#### Global Installation (Recommended)
```bash
npm install -g @stellarsafe/cli
```

#### One-time Use
```bash
npx @stellarsafe/cli verify <CODE>
```

### Basic Usage

1. **Deploy your contract** to Stellar network
2. **Generate verification code** at [stellarsafe.io/developer](https://stellarsafe.io/developer)
3. **Run verification** in your contract directory:

```bash
cd my-contract
stellarsafe verify ABC123
```

## 📋 Prerequisites

Before using the CLI tool, ensure you have:

- ✅ **Rust** installed (1.60.0 or later)
- ✅ **Soroban CLI** installed and configured
- ✅ **Git repository** (recommended for full verification)
- ✅ **Contract deployed** to Stellar network
- ✅ **WASM binary** built in `target/wasm32-unknown-unknown/release/`

### Required Project Structure

```
my-contract/
├── Cargo.toml              # Required: Contract metadata
├── src/                    # Required: Source code
│   ├── lib.rs
│   └── contract.rs
├── target/                 # Required: Build artifacts
│   └── wasm32-unknown-unknown/
│       └── release/
│           └── my_contract.wasm
└── .git/                   # Optional: Git repository
```

## 🔧 Commands

### `verify <CODE>`

Verifies your contract using the provided verification code.

```bash
stellarsafe verify ABC123
```

**Options:**
- `--verbose, -v`: Show detailed output
- `--dry-run`: Show what would be verified without submitting
- `--help, -h`: Show help information

**Examples:**
```bash
# Basic verification
stellarsafe verify ABC123

# Verbose output
stellarsafe verify ABC123 --verbose

# Dry run (test without submitting)
stellarsafe verify ABC123 --dry-run
```

### `status <CODE>`

Check the status of a verification request.

```bash
stellarsafe status ABC123
```

### `version`

Show CLI version information.

```bash
stellarsafe version
```

## 📊 What Gets Verified

The CLI tool collects and verifies the following information:

### 1. **WASM Binary**
- ✅ Reads compiled WASM from `target/wasm32-unknown-unknown/release/`
- ✅ Computes SHA-256 hash
- ✅ Compares with on-chain contract bytecode

### 2. **Source Code**
- ✅ Scans all `.rs` files in `src/` directory
- ✅ Computes deterministic hash of source files
- ✅ Excludes build artifacts and dependencies

### 3. **Git Information** (if available)
- ✅ Current commit hash
- ✅ Remote repository URL
- ✅ Current branch name
- ✅ Repository accessibility check

### 4. **Build Environment**
- ✅ Rust compiler version
- ✅ Soroban CLI version
- ✅ Build timestamp
- ✅ Contract metadata from `Cargo.toml`

## 🔍 Verification Process

### Step 1: Environment Check
```
🔍 Checking environment...
✓ Found Cargo.toml
✓ Found src/ directory
✓ Found WASM binary
✓ Git repository detected
```

### Step 2: Data Collection
```
📦 Collecting contract data...
✓ Contract: my_token (45.6 KB)
✓ Source files: 5 files hashed
✓ Git: a1b2c3d4 on main branch
✓ Build: rustc 1.70.0, soroban-cli 20.0.0
```

### Step 3: Submission
```
📤 Submitting to StellarSafe...
✓ Verification code: ABC123
✓ Contract ID: CABCDEF123...
✓ Network: testnet
```

### Step 4: Results
```
✅ Contract verified successfully!

Verification Details:
✅ WASM bytecode matches on-chain contract
✅ Source code is publicly accessible
✅ Contract has 5 source files (reasonable)
✅ Built with rustc 1.70.0, soroban-cli 20.0.0
✅ WASM size: 45.6KB (reasonable)
✅ Contract built recently

🔗 View: https://stellarsafe.io/contract/CABCDEF123...
```

## ⚠️ Common Issues

### Issue: "Contract not found"
```
❌ Error: Contract not found on Stellar network
```

**Solutions:**
- Verify your contract is deployed to the correct network
- Check the contract ID in your verification request
- Ensure the contract is accessible on Horizon

### Issue: "WASM binary not found"
```
❌ Error: WASM binary not found at target/wasm32-unknown-unknown/release/
```

**Solutions:**
```bash
# Build your contract
soroban contract build

# Verify the WASM file exists
ls target/wasm32-unknown-unknown/release/
```

### Issue: "Git repository not accessible"
```
⚠️ Warning: Source code repository is not accessible
```

**Solutions:**
- Make your repository public on GitHub
- Check repository URL in `git remote -v`
- Ensure repository contains the verified source code

### Issue: "WASM hash mismatch"
```
❌ WASM bytecode does NOT match on-chain contract
```

**Solutions:**
- Rebuild your contract: `soroban contract build`
- Redeploy if necessary
- Ensure you're verifying the correct contract ID

### Issue: "Verification code expired"
```
❌ Error: Verification code has expired
```

**Solutions:**
- Generate a new verification code
- Verification codes expire after 30 minutes
- Complete verification promptly after code generation

## 🔐 Security & Privacy

### What We Collect
- ✅ **Source code hashes** (not the actual source code)
- ✅ **WASM binary hash** and size
- ✅ **Git metadata** (commit hash, repository URL)
- ✅ **Build environment** information
- ✅ **File structure** information

### What We DON'T Collect
- ❌ **Actual source code** content
- ❌ **Private keys** or secrets
- ❌ **Personal information**
- ❌ **Build artifacts** beyond WASM

### Data Usage
- Data is used solely for contract verification
- Verification results are publicly accessible
- No personal or sensitive information is stored
- All data transmission is encrypted (HTTPS)

## 🛠️ Advanced Usage

### Custom Contract Name
If your contract name differs from the Cargo.toml package name:

```bash
stellarsafe verify ABC123 --contract-name my_custom_name
```

### Specify Network
```bash
stellarsafe verify ABC123 --network testnet
stellarsafe verify ABC123 --network mainnet
```

### CI/CD Integration

For automated verification in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Verify Contract
  run: |
    npx @stellarsafe/cli verify ${{ secrets.VERIFICATION_CODE }} --verbose
  env:
    STELLARSAFE_API_URL: https://api.stellarsafe.io
```

### Configuration File

Create `.stellarsafe.json` in your project root:

```json
{
  "contractName": "my_token",
  "network": "testnet",
  "excludeFiles": ["tests/", "examples/"],
  "apiUrl": "https://api.stellarsafe.io"
}
```

## 📚 API Reference

### Environment Variables

- `STELLARSAFE_API_URL`: Override API endpoint (default: https://api.stellarsafe.io)
- `STELLARSAFE_TIMEOUT`: Request timeout in seconds (default: 30)
- `STELLARSAFE_VERBOSE`: Enable verbose logging (true/false)

### Exit Codes

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: Network error
- `4`: Verification failed
- `5`: Contract not found

## 🆘 Support

### Getting Help

```bash
# Show help
stellarsafe --help

# Show command-specific help
stellarsafe verify --help

# Check version
stellarsafe --version
```

### Troubleshooting

1. **Enable verbose output**: `--verbose` flag
2. **Check prerequisites**: Rust, Soroban CLI, Git
3. **Verify project structure**: Cargo.toml, src/, target/
4. **Test with dry run**: `--dry-run` flag

### Community Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/stellarsafe/cli/issues)
- 💬 **Discord**: [StellarSafe Community](https://discord.gg/stellarsafe)
- 📧 **Email**: support@stellarsafe.io
- 📖 **Docs**: [stellarsafe.io/docs](https://stellarsafe.io/docs)

## 🔄 Updates

### Checking for Updates
```bash
npm list -g @stellarsafe/cli
npm update -g @stellarsafe/cli
```

### Changelog
- **v1.0.0**: Initial release
- **v1.1.0**: Added status command and configuration file support
- **v1.2.0**: Improved error handling and CI/CD integration

---

## 📝 Example Workflow

Here's a complete example of verifying a contract:

```bash
# 1. Build your contract
cd my-token-contract
soroban contract build

# 2. Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_token.wasm \
  --network testnet

# Output: Contract deployed! ID: CABCDEF123...

# 3. Generate verification code at stellarsafe.io/developer
# Enter contract ID: CABCDEF123...
# Select network: Testnet
# Get code: ABC123

# 4. Verify the contract
stellarsafe verify ABC123

# 5. View results at stellarsafe.io/contract/CABCDEF123...
```

That's it! Your contract is now verified and trusted by the Stellar community. 🎉
