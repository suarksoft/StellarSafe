# 🚀 StellarSafe - Revised Development Roadmap
## Gerçekçi, Adım Adım, Uygulanabilir Plan

> **Hedef:** MVP (Minimum Viable Product) - Çalışan demo
> **Timeline:** 2-3 Hafta (part-time) veya 1 Hafta (full-time)
> **Strateji:** Önce çalışan bir şey, sonra geliştir

---

## 📍 MEVCUT DURUM ANALİZİ

✅ **Var Olanlar:**
- Frontend template (Next.js 14 + Tailwind)
- Soroban token contract (stellar-contract/)
- Detaylı dokümantasyon

❌ **Eksikler:**
- Hiçbir backend kodu yok
- Stellar entegrasyonu yok
- Database yok
- Extension yok
- UI components StellarSafe'e göre değil

---

## 🎯 YENİ STRATEJİ: Modüler İlerleme

Her fase **bağımsız** çalışan bir özellik üretecek.
Test edip sonrakine geçeceğiz.

---

# PHASE 1: Foundation Setup (2-3 gün)
## Hedef: Stellar'a bağlan, basit asset analizi yap

### 📦 1.1 Dependencies & Environment (1 saat)

**Yapılacaklar:**
```bash
cd frontend

# Stellar SDK
npm install @stellar/stellar-sdk

# Database (Supabase)
npm install @supabase/supabase-js

# Validation & Utils
npm install zod
npm install axios

# Dev tools
npm install -D @types/node
```

**Environment Variables:**
```bash
# frontend/.env.local
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

**Checklist:**
- [ ] Package.json güncellendi
- [ ] .env.local oluşturuldu
- [ ] npm install başarılı
- [ ] TypeScript config OK

---

### 🗂️ 1.2 Folder Structure (30 dakika)

**Oluşturulacak yapı:**
```
frontend/src/
├── app/
│   ├── api/                    ← Backend API routes
│   │   ├── health/
│   │   │   └── route.ts
│   │   ├── analyze/
│   │   │   ├── asset/
│   │   │   │   └── route.ts
│   │   │   └── transaction/
│   │   │       └── route.ts
│   │   └── assets/
│   │       └── route.ts
│   │
│   ├── analyze/                ← Frontend pages (yeni)
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── assets/
│       └── page.tsx
│
├── lib/                        ← Core logic
│   ├── stellar/
│   │   ├── client.ts           ← Horizon connection
│   │   ├── types.ts            ← TypeScript interfaces
│   │   └── utils.ts
│   │
│   ├── analyzer/
│   │   ├── asset-analyzer.ts   ← Asset risk analysis
│   │   ├── transaction-analyzer.ts
│   │   ├── risk-scorer.ts
│   │   └── types.ts
│   │
│   ├── database/
│   │   ├── client.ts           ← Supabase client
│   │   ├── queries.ts          ← DB operations
│   │   └── schema.sql          ← Table definitions
│   │
│   └── utils/
│       ├── validation.ts       ← Zod schemas
│       └── helpers.ts
│
├── components/
│   ├── analysis/               ← Analysis UI (yeni)
│   │   ├── RiskBadge.tsx
│   │   ├── ThreatCard.tsx
│   │   └── AnalysisResult.tsx
│   │
│   ├── assets/                 ← Asset UI (yeni)
│   │   ├── AssetCard.tsx
│   │   └── AssetList.tsx
│   │
│   └── ui/                     ← Shared components (mevcut)
│       └── ...
│
└── types/
    ├── stellar.ts              ← Stellar types
    ├── analysis.ts             ← Analysis types
    └── api.ts                  ← API types
```

**Komutlar:**
```bash
cd frontend/src

# API routes
mkdir -p app/api/health
mkdir -p app/api/analyze/asset
mkdir -p app/api/analyze/transaction
mkdir -p app/api/assets

# Frontend pages
mkdir -p app/analyze
mkdir -p app/dashboard
mkdir -p app/assets

# Lib
mkdir -p lib/stellar
mkdir -p lib/analyzer
mkdir -p lib/database
mkdir -p lib/utils

# Components
mkdir -p components/analysis
mkdir -p components/assets

# Types
mkdir -p types
```

**Checklist:**
- [ ] Tüm klasörler oluşturuldu
- [ ] Git commit: "feat: setup project structure"

---

### 🔌 1.3 Stellar Client (2 saat)

**File: `src/lib/stellar/types.ts`**
```typescript
// Stellar domain types
export interface StellarAccount {
  id: string;
  sequence: string;
  balances: Balance[];
  signers: Signer[];
  flags: AccountFlags;
  thresholds: Thresholds;
  data: Record<string, string>;
  home_domain?: string;
}

export interface Balance {
  balance: string;
  limit?: string;
  asset_type: 'native' | 'credit_alphanum4' | 'credit_alphanum12';
  asset_code?: string;
  asset_issuer?: string;
}

export interface AccountFlags {
  auth_required: boolean;
  auth_revocable: boolean;
  auth_immutable: boolean;
  auth_clawback_enabled: boolean;
}

export interface AssetInfo {
  asset_code: string;
  asset_issuer: string;
  accounts: number;
  balances: string;
  flags: AccountFlags;
}
```

**File: `src/lib/stellar/client.ts`**
```typescript
import { Server, Networks, Horizon, Asset } from '@stellar/stellar-sdk';

export class StellarClient {
  private server: Server;
  public network: string;
  public networkPassphrase: string;

  constructor(isTestnet: boolean = true) {
    const horizonUrl = isTestnet
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org';
    
    this.server = new Server(horizonUrl);
    this.network = isTestnet ? 'testnet' : 'mainnet';
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
  }

  /**
   * Load account from Stellar network
   */
  async loadAccount(accountId: string): Promise<Horizon.ServerApi.AccountRecord> {
    try {
      const account = await this.server.loadAccount(accountId);
      return account;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load account ${accountId}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get asset information
   */
  async getAssetInfo(assetCode: string, issuerAddress: string) {
    try {
      const assets = await this.server
        .assets()
        .forCode(assetCode)
        .forIssuer(issuerAddress)
        .limit(1)
        .call();

      if (assets.records.length === 0) {
        throw new Error('Asset not found');
      }

      return assets.records[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get asset: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get account transactions
   */
  async getTransactions(accountId: string, limit: number = 10) {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();

      return transactions.records;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get transactions: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get account operations
   */
  async getOperations(accountId: string, limit: number = 50) {
    try {
      const operations = await this.server
        .operations()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();

      return operations.records;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get operations: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verify TOML file from home domain
   */
  async verifyToml(homeDomain: string, issuerAddress: string): Promise<boolean> {
    try {
      const tomlUrl = `https://${homeDomain}/.well-known/stellar.toml`;
      const response = await fetch(tomlUrl);
      
      if (!response.ok) {
        return false;
      }

      const tomlContent = await response.text();
      
      // Simple check: does TOML contain the issuer address?
      return tomlContent.includes(issuerAddress);
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate account age in days
   */
  async getAccountAge(accountId: string): Promise<number> {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(accountId)
        .order('asc')
        .limit(1)
        .call();

      if (transactions.records.length === 0) {
        return 0;
      }

      const createdAt = new Date(transactions.records[0].created_at);
      const now = new Date();
      const ageInMs = now.getTime() - createdAt.getTime();
      const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));

      return ageInDays;
    } catch (error) {
      return 0;
    }
  }
}

// Export singleton instance
export const stellarClient = new StellarClient(
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet'
);
```

**File: `src/lib/stellar/utils.ts`**
```typescript
import { Networks, StrKey } from '@stellar/stellar-sdk';

/**
 * Validate Stellar address
 */
export function isValidStellarAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

/**
 * Truncate Stellar address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format balance amount
 */
export function formatBalance(balance: string, decimals: number = 2): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}

/**
 * Get network passphrase
 */
export function getNetworkPassphrase(network: 'testnet' | 'mainnet'): string {
  return network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
}
```

**Test File: `src/lib/stellar/__tests__/client.test.ts`**
```typescript
import { StellarClient } from '../client';
import { isValidStellarAddress } from '../utils';

describe('StellarClient', () => {
  const client = new StellarClient(true); // testnet

  it('should validate Stellar addresses', () => {
    const validAddress = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
    const invalidAddress = 'INVALID_ADDRESS';

    expect(isValidStellarAddress(validAddress)).toBe(true);
    expect(isValidStellarAddress(invalidAddress)).toBe(false);
  });

  // Add more tests as needed
});
```

**Checklist:**
- [ ] types.ts oluşturuldu
- [ ] client.ts oluşturuldu ve test edildi
- [ ] utils.ts helper fonksiyonları eklendi
- [ ] Test case'ler yazıldı
- [ ] Git commit: "feat: Stellar client integration"

---

### 🏥 1.4 Health Check API (30 dakika)

**File: `src/app/api/health/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { stellarClient } from '@/lib/stellar/client';

export async function GET() {
  try {
    // Test Stellar connection
    const testAccount = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
    await stellarClient.loadAccount(testAccount);

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stellar: {
          connected: true,
          network: stellarClient.network,
        },
        version: '0.1.0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service unhealthy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

**Test:**
```bash
npm run dev
# Visit: http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-01T...",
    "stellar": {
      "connected": true,
      "network": "testnet"
    },
    "version": "0.1.0"
  }
}
```

**Checklist:**
- [ ] Health API çalışıyor
- [ ] Stellar connection doğrulandı
- [ ] Git commit: "feat: health check endpoint"

---

## ✅ PHASE 1 TAMAMLANDI!

**Şu an yapabileceklerimiz:**
- ✅ Stellar testnet'e bağlanabiliyoruz
- ✅ Account bilgilerini okuyabiliyoruz
- ✅ Asset bilgilerini çekebiliyoruz
- ✅ Health check API çalışıyor

**Next:** Phase 2 - Asset Analyzer

---

# PHASE 2: Asset Analyzer (2-3 gün)
## Hedef: Asset risk analizi yap, API ile dışarı aç

### 🧮 2.1 Risk Scoring System (2 saat)

**File: `src/lib/analyzer/types.ts`**
```typescript
export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Threat {
  type: string;
  severity: ThreatSeverity;
  message: string;
  technical: string;
  explanation?: string;
}

export interface AssetAnalysis {
  assetCode: string;
  issuerAddress: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  threats: Threat[];
  recommendations: string[];
  metadata: {
    homeDomain?: string;
    accountAge: number;
    flags: {
      auth_required: boolean;
      auth_revocable: boolean;
      auth_immutable: boolean;
      auth_clawback_enabled: boolean;
    };
    isVerified: boolean;
  };
  analyzedAt: string;
}
```

**File: `src/lib/analyzer/risk-scorer.ts`**
```typescript
import { ThreatSeverity, RiskLevel } from './types';

/**
 * Risk scoring weights
 */
export const RISK_WEIGHTS = {
  LOW: 10,
  MEDIUM: 20,
  HIGH: 35,
  CRITICAL: 50,
};

/**
 * Calculate total risk score from threats
 */
export function calculateRiskScore(threats: Array<{ severity: ThreatSeverity }>): number {
  let score = 0;

  for (const threat of threats) {
    score += RISK_WEIGHTS[threat.severity];
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Determine risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'SAFE';
}

/**
 * Generate recommendations based on threats
 */
export function generateRecommendations(threats: Array<{ type: string }>): string[] {
  const recommendations: string[] = [];

  const threatTypes = threats.map(t => t.type);

  if (threatTypes.includes('FREEZABLE_ASSET')) {
    recommendations.push('Consider removing this trustline if you already have it');
    recommendations.push('Look for alternative assets without AUTH_REVOCABLE flag');
  }

  if (threatTypes.includes('NAME_IMPERSONATION')) {
    recommendations.push('Verify the issuer address matches the official source');
    recommendations.push('Use the verified asset from trusted issuers');
  }

  if (threatTypes.includes('UNVERIFIED_ISSUER')) {
    recommendations.push('Wait for issuer to establish a verified home domain');
    recommendations.push('Research the project before trusting assets');
  }

  if (threatTypes.includes('NEW_ISSUER')) {
    recommendations.push('Exercise caution with newly created accounts');
    recommendations.push('Wait for the issuer to build a track record');
  }

  if (threatTypes.includes('BLACKLISTED')) {
    recommendations.push('DO NOT PROCEED - This address is known for scams');
    recommendations.push('Report this to the community if you encountered it');
  }

  return recommendations;
}
```

**Checklist:**
- [ ] Types tanımlandı
- [ ] Risk scorer oluşturuldu
- [ ] Git commit: "feat: risk scoring system"

---

### 🔍 2.2 Asset Analyzer Core (3 saat)

**File: `src/lib/analyzer/asset-analyzer.ts`**
```typescript
import { stellarClient } from '@/lib/stellar/client';
import { AssetAnalysis, Threat } from './types';
import { calculateRiskScore, getRiskLevel, generateRecommendations } from './risk-scorer';

export class AssetAnalyzer {
  /**
   * Main analysis function
   */
  async analyzeAsset(assetCode: string, issuerAddress: string): Promise<AssetAnalysis> {
    const threats: Threat[] = [];
    
    // Load issuer account
    const issuerAccount = await stellarClient.loadAccount(issuerAddress);
    
    // 1. Flag Analysis
    const flagThreats = this.analyzFlags(issuerAccount);
    threats.push(...flagThreats);
    
    // 2. Home Domain Check
    const domainThreats = await this.analyzeHomeDomain(issuerAccount, issuerAddress);
    threats.push(...domainThreats);
    
    // 3. Account Age Check
    const ageThreats = await this.analyzeAccountAge(issuerAddress);
    threats.push(...ageThreats);
    
    // 4. Database Checks (whitelist/blacklist)
    // TODO: Phase 4
    
    // 5. Name Similarity Check
    // TODO: Phase 4
    
    // Calculate final risk
    const riskScore = calculateRiskScore(threats);
    const riskLevel = getRiskLevel(riskScore);
    const recommendations = generateRecommendations(threats);
    
    return {
      assetCode,
      issuerAddress,
      riskScore,
      riskLevel,
      threats,
      recommendations,
      metadata: {
        homeDomain: issuerAccount.home_domain,
        accountAge: await stellarClient.getAccountAge(issuerAddress),
        flags: {
          auth_required: (issuerAccount.flags.auth_required || false),
          auth_revocable: (issuerAccount.flags.auth_revocable || false),
          auth_immutable: (issuerAccount.flags.auth_immutable || false),
          auth_clawback_enabled: (issuerAccount.flags.auth_clawback_enabled || false),
        },
        isVerified: false, // TODO: Check whitelist
      },
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * Analyze asset flags
   */
  private analyzeFlags(account: any): Threat[] {
    const threats: Threat[] = [];

    if (account.flags.auth_revocable) {
      threats.push({
        type: 'FREEZABLE_ASSET',
        severity: 'HIGH',
        message: 'Issuer can freeze your balance',
        technical: 'AUTH_REVOCABLE flag is enabled',
        explanation: 'The issuer has the ability to freeze your assets at any time, making them untradeable.',
      });
    }

    if (account.flags.auth_required) {
      threats.push({
        type: 'AUTHORIZATION_REQUIRED',
        severity: 'MEDIUM',
        message: 'Issuer must approve all holders',
        technical: 'AUTH_REQUIRED flag is enabled',
        explanation: 'You need explicit authorization from the issuer to hold this asset.',
      });
    }

    if (account.flags.auth_clawback_enabled) {
      threats.push({
        type: 'CLAWBACK_ENABLED',
        severity: 'MEDIUM',
        message: 'Issuer can take back tokens',
        technical: 'AUTH_CLAWBACK_ENABLED flag is set',
        explanation: 'The issuer can reclaim tokens from your account.',
      });
    }

    return threats;
  }

  /**
   * Analyze home domain and TOML
   */
  private async analyzeHomeDomain(account: any, issuerAddress: string): Promise<Threat[]> {
    const threats: Threat[] = [];

    if (!account.home_domain) {
      threats.push({
        type: 'UNVERIFIED_ISSUER',
        severity: 'HIGH',
        message: 'No home domain found',
        technical: 'Missing home_domain field',
        explanation: 'Legitimate issuers typically have a verified website with TOML file.',
      });
      return threats;
    }

    // Verify TOML
    const tomlValid = await stellarClient.verifyToml(account.home_domain, issuerAddress);
    
    if (!tomlValid) {
      threats.push({
        type: 'INVALID_TOML',
        severity: 'HIGH',
        message: 'Invalid or missing stellar.toml file',
        technical: `Could not verify TOML at ${account.home_domain}`,
        explanation: 'The stellar.toml file could not be verified, indicating potential issues.',
      });
    }

    return threats;
  }

  /**
   * Analyze account age
   */
  private async analyzeAccountAge(issuerAddress: string): Promise<Threat[]> {
    const threats: Threat[] = [];
    const age = await stellarClient.getAccountAge(issuerAddress);

    if (age < 7) {
      threats.push({
        type: 'NEW_ISSUER',
        severity: 'MEDIUM',
        message: `Account created ${age} days ago`,
        technical: 'Recently created issuer account',
        explanation: 'New accounts have less established reputation and higher risk.',
      });
    }

    return threats;
  }
}

// Export singleton
export const assetAnalyzer = new AssetAnalyzer();
```

**Checklist:**
- [ ] Asset analyzer oluşturuldu
- [ ] Flag analizi çalışıyor
- [ ] Home domain check çalışıyor
- [ ] Account age check çalışıyor
- [ ] Git commit: "feat: asset analyzer core"

---

### 🌐 2.3 Asset Analysis API (1 saat)

**File: `src/app/api/analyze/asset/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assetAnalyzer } from '@/lib/analyzer/asset-analyzer';
import { isValidStellarAddress } from '@/lib/stellar/utils';

// Request validation schema
const AnalyzeAssetSchema = z.object({
  assetCode: z.string().min(1).max(12),
  issuerAddress: z.string().refine(isValidStellarAddress, {
    message: 'Invalid Stellar address',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = AnalyzeAssetSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { assetCode, issuerAddress } = validation.data;

    // Analyze asset
    const analysis = await assetAnalyzer.analyzeAsset(assetCode, issuerAddress);

    return NextResponse.json({
      success: true,
      data: analysis,
    });

  } catch (error) {
    console.error('Asset analysis error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

**Test:**
```bash
# Test with fake USDC
curl -X POST http://localhost:3000/api/analyze/asset \
  -H "Content-Type: application/json" \
  -d '{
    "assetCode": "USDC",
    "issuerAddress": "GTEST123..." 
  }'
```

**Checklist:**
- [ ] API endpoint oluşturuldu
- [ ] Validation çalışıyor
- [ ] Error handling var
- [ ] Test edildi
- [ ] Git commit: "feat: asset analysis API"

---

## ✅ PHASE 2 TAMAMLANDI!

**Şu an yapabileceklerimiz:**
- ✅ Asset risk analizi yapabiliyoruz
- ✅ Flags kontrolü çalışıyor
- ✅ Home domain verification çalışıyor
- ✅ Account age hesaplanıyor
- ✅ API endpoint hazır

**Test Scenario:**
```typescript
// Circle USDC (Real) - SAFE
POST /api/analyze/asset
{
  "assetCode": "USDC",
  "issuerAddress": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
}
// Expected: Risk: SAFE, Score: <20

// Fake USDC - CRITICAL
POST /api/analyze/asset
{
  "assetCode": "USDC",
  "issuerAddress": "GFAKE..." // with AUTH_REVOCABLE
}
// Expected: Risk: HIGH/CRITICAL, Multiple threats
```

---

# PHASE 3-8: Devam...

Şimdilik **Phase 1 ve 2'yi tamamlayalım**, sonra devam ederiz.

Her fase:
- ✅ Bağımsız çalışan
- ✅ Test edilebilir
- ✅ Demo edilebilir

---

## 📅 ZAMAN PLANI

**Haftaiçi (Part-time: 3 saat/gün):**
- Phase 1: 2 gün
- Phase 2: 2 gün
- Phase 3: 2 gün
- Phase 4: 2 gün
- Phase 5: 3 gün
- Phase 6: 3 gün
- Phase 7: 2 gün
- Phase 8: 2 gün
**TOPLAM: ~18 gün (3 hafta)**

**Hafta sonu (Full-time: 8 saat/gün):**
- Phase 1-2: 2 gün
- Phase 3-4: 2 gün
- Phase 5-6: 3 gün
**TOPLAM: ~7 gün (1 hafta)**

---

## 🎯 İLK ADIM

**Hemen şimdi:**
1. Dependencies kur
2. Folder structure oluştur
3. Stellar client yaz
4. Health API test et

**Başlayalım mı?** 🚀
