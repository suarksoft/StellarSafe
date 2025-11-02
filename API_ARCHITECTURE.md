# 🚀 StellarSafe API - Architecture & Design

## 🎯 Amaç

StellarSafe güvenlik analiz sistemini **standalone API service** olarak sunmak. Diğer Stellar wallet'lar (Freighter, Lobstr, Solar, vs.) bu API'yi kullanarak kullanıcılarına gelişmiş güvenlik özellikeri sağlayabilirler.

---

## 📋 API Endpoints

### 1. **Address Risk Analysis** 🔍
```http
POST /api/v1/analyze/address
```

**Description:** Bir Stellar adresinin risk analizini yapar (Enhanced Analyzer)

**Request Body:**
```json
{
  "address": "GXXXXXXX...",
  "network": "testnet" | "public",
  "homeDomain": "optional-domain.com",
  "apiKey": "your-api-key"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "cached": false,
  "cacheAge": null,
  "analysis": {
    "address": "GXXXXXXX...",
    "riskScore": 15,
    "riskLevel": "SAFE",
    "recommendation": "✅ Doğrulanmış ve güvenilir kuruluş",
    "warnings": [],
    "greenFlags": [
      "Stellar Expert tarafından doğrulanmış",
      "Domain ownership doğrulandı"
    ],
    "verificationBadges": [
      "✅ Doğrulanmış Exchange",
      "✅ Doğrulanmış: Binance (binance.com)"
    ],
    "expertData": {
      "trustScore": 95,
      "isVerifiedOrg": true,
      "orgType": "exchange",
      "tags": ["exchange", "verified", "anchor"]
    },
    "tomlVerification": {
      "verified": true,
      "domain": "binance.com",
      "orgName": "Binance",
      "orgEmail": "support@binance.com"
    },
    "accountAge": {
      "days": 1825,
      "risk": 0
    },
    "transactionHistory": {
      "totalTransactions": 15000,
      "risk": 0
    },
    "timestamp": "2025-11-02T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid address format",
  "code": "INVALID_ADDRESS"
}
```

**Error Response (429):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

### 2. **Transaction Preview** 🔍
```http
POST /api/v1/analyze/transaction
```

**Description:** Transaction simülasyonu yapar, fee tahmin eder, uyarıları gösterir

**Request Body:**
```json
{
  "source": "GXXXXXXX...",
  "destination": "GYYYYYY...",
  "asset": {
    "code": "XLM",
    "issuer": null
  },
  "amount": "100",
  "memo": "optional memo",
  "network": "testnet",
  "apiKey": "your-api-key"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "preview": {
    "success": true,
    "fee": "0.00001 XLM",
    "estimatedTime": "~5 seconds",
    "operations": [
      {
        "type": "payment",
        "details": {
          "destination": "GYYYYYY...",
          "asset": "XLM",
          "amount": "100"
        }
      }
    ],
    "warnings": [
      "⚠️ Bu gönderimden sonra bakiyeniz düşük olacak"
    ],
    "errors": [],
    "balanceAfter": "5.5 XLM"
  }
}
```

---

### 3. **Batch Analysis** 📦
```http
POST /api/v1/analyze/batch
```

**Description:** Birden fazla adresi aynı anda analiz eder (bulk operations)

**Request Body:**
```json
{
  "addresses": [
    "GXXXXXXX...",
    "GYYYYYY...",
    "GZZZZZZ..."
  ],
  "network": "testnet",
  "apiKey": "your-api-key"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "address": "GXXXXXXX...",
      "riskScore": 0,
      "riskLevel": "SAFE",
      "verified": true
    },
    {
      "address": "GYYYYYY...",
      "riskScore": 75,
      "riskLevel": "HIGH",
      "verified": false
    }
  ],
  "processed": 3,
  "failed": 0
}
```

---

### 4. **Cache Management** 🗑️
```http
DELETE /api/v1/cache/address/:address
```

**Description:** Belirli bir adresin cache'ini temizler

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cache cleared for address"
}
```

---

### 5. **Health Check** ❤️
```http
GET /api/v1/health
```

**Description:** API sağlık kontrolü

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "services": {
    "stellarExpert": "operational",
    "tomlVerification": "operational",
    "cache": "operational"
  },
  "uptime": 86400
}
```

---

### 6. **API Key Management** 🔑
```http
POST /api/v1/auth/generate-key
```

**Description:** Yeni API key oluşturur (admin only)

**Request Body:**
```json
{
  "name": "Lobstr Wallet",
  "email": "dev@lobstr.co",
  "tier": "free" | "premium" | "enterprise",
  "adminSecret": "admin-secret-key"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "apiKey": "sk_live_xxxxxxxxxxxxxxxx",
  "tier": "free",
  "rateLimit": {
    "requests": 1000,
    "period": "day"
  },
  "expiresAt": null
}
```

---

## 🔐 Authentication

### API Key Format
```
sk_test_xxxxxxxxxxxxxxxx  (testnet)
sk_live_xxxxxxxxxxxxxxxx  (mainnet)
```

### Header
```http
Authorization: Bearer sk_live_xxxxxxxxxxxxxxxx
```

### Request Example
```bash
curl -X POST https://api.stellarsafe.io/v1/analyze/address \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "GXXXXXXX...",
    "network": "public"
  }'
```

---

## 📊 Rate Limiting

### Tiers

| Tier | Requests/Day | Requests/Minute | Cache TTL | Batch Size |
|------|--------------|-----------------|-----------|------------|
| **Free** | 1,000 | 10 | 1 hour | 10 |
| **Premium** | 10,000 | 50 | 30 min | 50 |
| **Enterprise** | Unlimited | 200 | 15 min | 200 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1699000000
```

---

## 🎨 Integration Examples

### JavaScript/TypeScript
```typescript
// StellarSafe API Client
class StellarSafeAPI {
  constructor(private apiKey: string, private baseUrl: string) {}

  async analyzeAddress(address: string, network: 'testnet' | 'public') {
    const response = await fetch(`${this.baseUrl}/v1/analyze/address`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address, network })
    });
    
    return response.json();
  }
}

// Usage
const client = new StellarSafeAPI('sk_live_xxx', 'https://api.stellarsafe.io');
const analysis = await client.analyzeAddress('GXXXXXXX...', 'public');

if (analysis.analysis.riskLevel === 'CRITICAL') {
  alert('⛔ Yüksek riskli adres! İşlemi iptal edin.');
}
```

### React Hook
```typescript
import { useState, useEffect } from 'react';

function useStellarSafeAnalysis(address: string) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!address || address.length !== 56) return;
    
    const analyze = async () => {
      setLoading(true);
      const client = new StellarSafeAPI(process.env.STELLARSAFE_API_KEY);
      const result = await client.analyzeAddress(address, 'public');
      setAnalysis(result.analysis);
      setLoading(false);
    };
    
    analyze();
  }, [address]);
  
  return { analysis, loading };
}

// Usage in component
function SendModal() {
  const { analysis, loading } = useStellarSafeAnalysis(destination);
  
  return (
    <div>
      {loading && <Spinner />}
      {analysis && (
        <RiskBadge 
          level={analysis.riskLevel} 
          score={analysis.riskScore} 
        />
      )}
    </div>
  );
}
```

### Wallet Integration Pattern
```typescript
// In your wallet's send flow
async function handleSendTransaction(destination: string, amount: string) {
  // 1. Analyze destination address
  const stellarSafe = new StellarSafeAPI(API_KEY);
  const analysis = await stellarSafe.analyzeAddress(destination, 'public');
  
  // 2. Show risk warning to user
  if (analysis.analysis.riskLevel === 'CRITICAL') {
    const confirmed = await showRiskWarning({
      level: 'CRITICAL',
      message: analysis.analysis.recommendation,
      warnings: analysis.analysis.warnings
    });
    
    if (!confirmed) {
      return; // User cancelled
    }
  }
  
  // 3. Preview transaction
  const preview = await stellarSafe.previewTransaction({
    source: userAddress,
    destination,
    asset: { code: 'XLM' },
    amount,
    network: 'public'
  });
  
  // 4. Show preview to user
  await showTransactionPreview(preview);
  
  // 5. Execute transaction
  await executeTransaction();
}
```

---

## 🏗️ Infrastructure

### Tech Stack
```
Frontend:     Next.js 15, React 18, TypeScript
Backend:      Next.js API Routes (serverless)
Database:     Supabase (PostgreSQL)
Cache:        Redis / localStorage
Hosting:      Vercel Edge Functions
CDN:          Cloudflare
Monitoring:   Sentry, Datadog
```

### Architecture
```
┌─────────────────────────────────────────────┐
│           Wallet Applications               │
│  (Freighter, Lobstr, Solar, Custom...)     │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTPS + API Key
                   ▼
┌─────────────────────────────────────────────┐
│         StellarSafe API Gateway             │
│      (Rate Limiting + Auth + Cache)         │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┬────────────┐
        ▼                     ▼            ▼
┌───────────────┐    ┌────────────┐  ┌─────────┐
│ Enhanced      │    │ Transaction│  │  Cache  │
│ Analyzer      │    │ Preview    │  │  Layer  │
│               │    │            │  │ (Redis) │
└───────┬───────┘    └─────┬──────┘  └─────────┘
        │                  │
    ┌───┴─────┬────────────┴──┬──────────┐
    ▼         ▼               ▼          ▼
┌─────────┐ ┌──────┐  ┌──────────┐ ┌─────────┐
│ Stellar │ │ TOML │  │  Horizon │ │ Stellar │
│ Expert  │ │Verify│  │   API    │ │   SDK   │
└─────────┘ └──────┘  └──────────┘ └─────────┘
```

---

## 📦 NPM Package (Future)

```bash
npm install @stellarsafe/sdk
```

```typescript
import { StellarSafe } from '@stellarsafe/sdk';

const stellarSafe = new StellarSafe({
  apiKey: process.env.STELLARSAFE_API_KEY,
  network: 'public'
});

// Simple usage
const result = await stellarSafe.analyze('GXXXXXXX...');
console.log(result.riskLevel); // "SAFE"

// With options
const result = await stellarSafe.analyze('GXXXXXXX...', {
  includeExpertData: true,
  includeTOMLVerification: true,
  cache: true
});
```

---

## 💰 Pricing Model

### Free Tier
- 1,000 requests/day
- Basic risk analysis
- 1-hour cache
- Community support

### Premium Tier ($49/month)
- 10,000 requests/day
- Enhanced analysis + TOML
- 30-min cache
- Email support
- Custom branding

### Enterprise Tier (Custom)
- Unlimited requests
- Dedicated infrastructure
- Custom cache TTL
- 24/7 support
- SLA guarantee
- White-label option

---

## 🛡️ Security

### API Key Storage
```typescript
// ❌ Never expose in frontend
const API_KEY = 'sk_live_xxx'; // DON'T DO THIS

// ✅ Use environment variables
const API_KEY = process.env.NEXT_PUBLIC_STELLARSAFE_API_KEY;

// ✅ Or proxy through your backend
async function analyzeThroughBackend(address: string) {
  const response = await fetch('/api/stellarsafe-proxy', {
    method: 'POST',
    body: JSON.stringify({ address })
  });
  return response.json();
}
```

### CORS Policy
```
Allowed Origins: 
  - localhost:* (development)
  - *.stellarsafe.io
  - *.lobstr.co
  - *.freighter.app
  (configurable per API key)
```

---

## 📊 Monitoring & Analytics

### Metrics to Track
- API requests per minute/hour/day
- Average response time
- Cache hit ratio
- Error rates by endpoint
- Rate limit violations
- Most analyzed addresses
- Geographic distribution

### Dashboard (Future)
```
┌──────────────────────────────────────────────┐
│  StellarSafe API Dashboard                   │
├──────────────────────────────────────────────┤
│  Today:                                      │
│  📊 Requests:        1,234                   │
│  ⚡ Avg Response:    450ms                   │
│  💾 Cache Hit:       75%                     │
│  ❌ Error Rate:      0.5%                    │
│                                              │
│  Top Endpoints:                              │
│  1. /analyze/address      890 req           │
│  2. /analyze/transaction  234 req           │
│  3. /analyze/batch         110 req          │
└──────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Implement API Routes** (Next.js)
2. **Add Authentication Middleware**
3. **Setup Rate Limiting** (Redis)
4. **Create API Key Management**
5. **Write Integration Docs**
6. **Build SDK Package**
7. **Setup Monitoring**
8. **Launch Beta Program**

---

## 📚 Documentation Site

```
https://docs.stellarsafe.io

Sections:
- Getting Started
- Authentication
- API Reference
- Integration Examples
- Rate Limits & Pricing
- Best Practices
- FAQ
- SDK Documentation
```

---

## 🎉 Launch Strategy

### Phase 1: Internal Testing
- Use in StellarSafe frontend
- Test all endpoints
- Monitor performance

### Phase 2: Private Beta
- Invite 5-10 wallet developers
- Collect feedback
- Iterate on API design

### Phase 3: Public Beta
- Open registration
- Free tier only
- Gather usage data

### Phase 4: General Availability
- Launch pricing tiers
- Full documentation
- Marketing campaign

---

**Ready to build the API!** 🚀

Next: Implement API routes in `/frontend/src/app/api/v1/`
