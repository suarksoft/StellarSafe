# 🔒 StellarSafe Contract Verification System - Complete Guide

## Overview

StellarSafe provides a comprehensive contract verification system that allows developers to prove their deployed Soroban smart contracts match the public source code. This builds trust and transparency in the Stellar ecosystem.

## 🌊 Complete Verification Flow

```
┌──────────────┐
│  Developer   │
│  Deploys     │
│  Contract    │
└──────┬───────┘
       │
       │ 1. Contract deployed to Stellar
       │    (testnet or mainnet)
       ▼
┌──────────────────────────────────────────┐
│  Developer Portal                        │
│  https://stellarsafe.io/developer        │
│                                          │
│  [Contract ID: CABCD...]                 │
│  [Network: ● testnet  ○ mainnet]        │
│  [Generate Verification Code]            │
└──────────┬───────────────────────────────┘
           │
           │ 2. Enter Contract ID + Network
           ▼
┌──────────────────────────────────────────┐
│  Backend API                             │
│  POST /api/verify/generate               │
│                                          │
│  ✓ Validates contract ID format          │
│  ✓ Checks contract exists on Stellar     │
│  ✓ Generates 6-digit code (e.g., X7K9M2) │
│  ✓ Stores in DB with 30min TTL          │
└──────────┬───────────────────────────────┘
           │
           │ 3. Returns verification code
           ▼
┌──────────────────────────────────────────┐
│  Developer UI                            │
│                                          │
│  ╔════════════════════════════════╗      │
│  ║  Your Verification Code:       ║      │
│  ║                                ║      │
│  ║         X7K9M2                 ║      │
│  ║                                ║      │
│  ║  Expires in 30 minutes         ║      │
│  ╚════════════════════════════════╝      │
│                                          │
│  Run: stellarsafe verify X7K9M2          │
└──────────┬───────────────────────────────┘
           │
           │ 4. Developer copies code
           ▼
┌──────────────────────────────────────────┐
│  Terminal / CLI                          │
│                                          │
│  $ cd my-contract                        │
│  $ stellarsafe verify X7K9M2             │
└──────────┬───────────────────────────────┘
           │
           │ 5. CLI runs locally
           ▼
┌──────────────────────────────────────────┐
│  CLI - Contract Collector                │
│                                          │
│  Collects:                               │
│  ✓ WASM binary hash                      │
│  ✓ WASM file size                        │
│  ✓ Source code hash (all .rs files)     │
│  ✓ Source file list                      │
│  ✓ Git commit SHA                        │
│  ✓ Git remote URL                        │
│  ✓ Git branch name                       │
│  ✓ Rust version (rustc --version)       │
│  ✓ Soroban CLI version                   │
│  ✓ Build timestamp                       │
└──────────┬───────────────────────────────┘
           │
           │ 6. Package collected data
           ▼
┌──────────────────────────────────────────┐
│  CLI - API Client                        │
│                                          │
│  POST /api/verify/submit                 │
│  Header: X-Verification-Code: X7K9M2     │
│  Body: {                                 │
│    contractName: "my_token",             │
│    wasmHash: "a3f5c2...",               │
│    wasmSize: 43520,                      │
│    sourceHash: "d4e7b9...",             │
│    sourceFiles: ["lib.rs", ...],        │
│    gitCommit: "abc1234",                │
│    gitRemote: "github.com/...",         │
│    rustVersion: "rustc 1.70.0",         │
│    sorobanVersion: "soroban 20.0.0",    │
│    timestamp: 1699123456789             │
│  }                                       │
└──────────┬───────────────────────────────┘
           │
           │ 7. Submit to API
           ▼
┌──────────────────────────────────────────┐
│  Backend - Verification Engine           │
│                                          │
│  Verification Checks:                    │
│                                          │
│  1. WASM_MATCH                           │
│     ✓ Fetch on-chain WASM hash           │
│     ✓ Compare with submitted hash        │
│     ✓ Must match exactly                 │
│                                          │
│  2. PUBLIC_SOURCE                        │
│     ✓ Check Git repository accessible    │
│     ✓ Verify URL responds (GitHub API)   │
│     ✓ Repository must be public          │
│                                          │
│  3. SOURCE_FILES                         │
│     ✓ Count source files                 │
│     ✓ Check reasonable (1-1000 files)    │
│     ✓ Detect suspicious file counts      │
│                                          │
│  4. BUILD_ENV                            │
│     ✓ Validate Rust version exists       │
│     ✓ Validate Soroban CLI version       │
│     ✓ Check versions are reasonable      │
│                                          │
│  5. WASM_SIZE                            │
│     ✓ Check binary size                  │
│     ✓ Must be 100B - 10MB                │
│     ✓ Flag suspicious sizes              │
│                                          │
│  6. BUILD_RECENCY                        │
│     ✓ Check build timestamp              │
│     ✓ Must be within 30 days             │
│     ✓ Ensures fresh build                │
└──────────┬───────────────────────────────┘
           │
           │ 8. All checks complete
           ▼
┌──────────────────────────────────────────┐
│  Backend - Save Results                  │
│                                          │
│  INSERT INTO verified_contracts          │
│  (                                       │
│    contract_id,                          │
│    network,                              │
│    verified: true/false,                 │
│    checks: [...],                        │
│    wasm_hash,                            │
│    source_hash,                          │
│    git_commit,                           │
│    git_remote,                           │
│    rust_version,                         │
│    soroban_version,                      │
│    verified_at: NOW()                    │
│  )                                       │
│                                          │
│  UPDATE verification_requests            │
│  SET status = 'COMPLETED'                │
│  WHERE code = 'X7K9M2'                   │
└──────────┬───────────────────────────────┘
           │
           │ 9. Return results
           ▼
┌──────────────────────────────────────────┐
│  CLI - Display Results                   │
│                                          │
│  🔍 Verification Results:                │
│                                          │
│  ✓ WASM_MATCH         PASSED             │
│  ✓ PUBLIC_SOURCE      PASSED             │
│  ✓ SOURCE_FILES       PASSED             │
│  ✓ BUILD_ENV          PASSED             │
│  ✓ WASM_SIZE         PASSED             │
│  ✓ BUILD_RECENCY     PASSED             │
│                                          │
│  ✓ CONTRACT VERIFIED SUCCESSFULLY! 🎉    │
└──────────┬───────────────────────────────┘
           │
           │ 10. Success!
           ▼
┌──────────────────────────────────────────┐
│  🎉 Verified Badge Awarded!              │
│                                          │
│  Contract page shows:                    │
│  ✅ VERIFIED badge                       │
│  ✓ All verification checks               │
│  ✓ Git repository link                   │
│  ✓ Build information                     │
│  ✓ Verification timestamp                │
└──────────────────────────────────────────┘
```

## 📊 Database Schema

### verification_requests
Temporary table for pending verifications (30-minute TTL)

```sql
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,           -- e.g., "X7K9M2"
  contract_id VARCHAR(56) NOT NULL,           -- Stellar contract ID
  network VARCHAR(50) NOT NULL,               -- "testnet" or "public"
  status VARCHAR(20) DEFAULT 'PENDING',       -- PENDING, COMPLETED, EXPIRED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,            -- created_at + 30 minutes
  completed_at TIMESTAMPTZ
);
```

### verified_contracts
Permanent table for verified contracts

```sql
CREATE TABLE verified_contracts (
  id UUID PRIMARY KEY,
  contract_id VARCHAR(56) NOT NULL,
  network VARCHAR(50) NOT NULL,
  verified BOOLEAN NOT NULL,                   -- Overall result
  checks JSONB NOT NULL,                       -- Array of check results
  wasm_hash TEXT,                              -- SHA-256 of WASM binary
  wasm_size INTEGER,                           -- Size in bytes
  source_hash TEXT,                            -- SHA-256 of all source files
  source_files TEXT[],                         -- List of source files
  git_commit VARCHAR(40),                      -- Git commit SHA
  git_remote TEXT,                             -- Git repository URL
  git_branch VARCHAR(100),                     -- Git branch name
  rust_version VARCHAR(100),                   -- e.g., "rustc 1.70.0"
  soroban_version VARCHAR(100),                -- e.g., "soroban 20.0.0"
  contract_name VARCHAR(255),                  -- From Cargo.toml
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by VARCHAR(50),                     -- "stellarsafe-cli"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contract_id, network)                 -- One verification per contract
);
```

## 🔐 API Endpoints

### POST /api/verify/generate
Generate verification code for a contract

**Request:**
```json
{
  "contractId": "CABCDEFG123456789...",
  "network": "testnet"
}
```

**Response:**
```json
{
  "success": true,
  "code": "X7K9M2",
  "expiresIn": 1800,
  "contractId": "CABCDEFG123456789...",
  "network": "testnet"
}
```

**Error Codes:**
- 400: Invalid contract ID format
- 404: Contract not found on Stellar
- 429: Too many requests (rate limit)
- 500: Server error

### POST /api/verify/submit
Submit verification data from CLI

**Headers:**
```
X-Verification-Code: X7K9M2
Content-Type: application/json
```

**Request:**
```json
{
  "contractName": "my_token_contract",
  "wasmHash": "a3f5c21d8b4e9f6a...",
  "wasmSize": 43520,
  "sourceHash": "d4e7b9c3a6f2e1d8...",
  "sourceFiles": ["src/lib.rs", "src/contract.rs", ...],
  "gitCommit": "abc1234567890def",
  "gitRemote": "https://github.com/user/repo",
  "gitBranch": "main",
  "rustVersion": "rustc 1.70.0",
  "sorobanVersion": "soroban 20.0.0",
  "timestamp": 1699123456789
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "checks": [
    {
      "name": "WASM_MATCH",
      "passed": true,
      "message": "WASM bytecode matches on-chain contract"
    },
    {
      "name": "PUBLIC_SOURCE",
      "passed": true,
      "message": "Source code is publicly accessible"
    },
    ...
  ],
  "contractId": "CABCDEFG123456789...",
  "message": "Contract verified successfully!"
}
```

**Error Codes:**
- 400: Invalid verification code / Missing data / Code expired
- 500: Server error

### GET /api/verify/status/:code
Check verification status

**Response:**
```json
{
  "code": "X7K9M2",
  "contractId": "CABCDEFG123456789...",
  "network": "testnet",
  "status": "COMPLETED",
  "createdAt": "2024-11-01T10:00:00Z",
  "expiresAt": "2024-11-01T10:30:00Z",
  "completedAt": "2024-11-01T10:05:00Z",
  "verified": true,
  "checks": [...]
}
```

**Status Values:**
- `PENDING`: Waiting for CLI submission
- `COMPLETED`: Verification finished
- `EXPIRED`: Code expired (30 minutes passed)

## 🛠️ CLI Implementation Details

### Contract Collector (`collector.ts`)

**WASM Hash Collection:**
```typescript
// Searches for WASM in:
// - target/wasm32-unknown-unknown/release/*.wasm
// - target/wasm32v1-none/release/*.wasm

// Computes SHA-256 hash
const wasmBuffer = fs.readFileSync(wasmPath);
const hash = crypto.createHash('sha256').update(wasmBuffer).digest('hex');
```

**Source Code Hash:**
```typescript
// Finds all .rs files in src/
// Hashes them in sorted order for consistency
const hash = crypto.createHash('sha256');
sourceFiles.sort().forEach(file => {
  hash.update(fs.readFileSync(file));
});
```

**Git Information:**
```typescript
// Uses simple-git library
const commit = await git.revparse(['HEAD']);
const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
const remotes = await git.getRemotes(true);
```

### API Client (`api-client.ts`)

**Submission:**
```typescript
fetch('/api/verify/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Verification-Code': code
  },
  body: JSON.stringify(contractInfo)
});
```

## 🧪 Testing the System

### 1. Local Development Test

```bash
# Terminal 1: Start frontend server
cd frontend
npm run dev

# Terminal 2: Test contract
cd stellar-contract
cargo build --target wasm32-unknown-unknown --release

# Terminal 3: Use CLI with local API
cd cli-tool
npm run build
npm link
stellarsafe verify TEST123 --api-url http://localhost:3000
```

### 2. End-to-End Test

```bash
# 1. Deploy a test contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe.wasm \
  --source admin \
  --network testnet

# 2. Get contract ID from output
CONTRACT_ID="CABCDEFG123..."

# 3. Generate verification code via UI
# Visit http://localhost:3000/developer
# Enter contract ID and network
# Copy the verification code

# 4. Run verification
stellarsafe verify X7K9M2

# 5. Check database
psql $DATABASE_URL
SELECT * FROM verified_contracts WHERE contract_id = 'CABCDEFG123...';
```

## 📈 Future Enhancements

### Phase 1 (Current)
- ✅ Basic verification flow
- ✅ CLI tool
- ✅ Core verification checks
- ✅ Developer UI

### Phase 2 (Planned)
- [ ] Automated re-verification
- [ ] CI/CD integration
- [ ] Webhook notifications
- [ ] Verification badges API
- [ ] Multiple contract versions

### Phase 3 (Future)
- [ ] Source code viewer
- [ ] Interactive verification explorer
- [ ] Verification certificates (NFTs)
- [ ] Multi-sig verification
- [ ] Audit integration

## 🔒 Security Considerations

1. **Rate Limiting**: Max 5 verification attempts per contract per hour
2. **Code Expiry**: Verification codes expire after 30 minutes
3. **Public Source**: Only public repositories can be verified
4. **WASM Matching**: Critical check - must pass for verification
5. **Database Security**: Row-level security on all tables
6. **API Authentication**: Verification code serves as authentication

## 📞 Support

- **Documentation**: https://stellarsafe.io/docs
- **Issues**: https://github.com/stellarsafe/stellarsafe/issues
- **Email**: hello@stellarsafe.io
- **Discord**: https://discord.gg/stellarsafe

## 🎯 Key Benefits

### For Developers
- ✅ Build trust with users
- ✅ Prove contract authenticity
- ✅ Increase adoption
- ✅ Stand out in ecosystem

### For Users
- ✅ Verify contract safety
- ✅ See source code
- ✅ Check build information
- ✅ Trust deployment

### For Ecosystem
- ✅ Increase transparency
- ✅ Reduce scams
- ✅ Build confidence
- ✅ Support growth

---

**Made with ❤️ by the StellarSafe Team**

