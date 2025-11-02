# 🔌 StellarSafe API Integration Examples

## 📦 Installation

### NPM/Yarn (Future Package)
```bash
npm install @stellarsafe/sdk
# or
yarn add @stellarsafe/sdk
```

### Direct Import (Current)
```typescript
import { StellarSafeClient } from '@/lib/sdk/stellarsafe-client';
```

---

## 🚀 Quick Start

### 1. Initialize Client
```typescript
import { StellarSafeClient } from '@stellarsafe/sdk';

const client = new StellarSafeClient({
  apiKey: process.env.STELLARSAFE_API_KEY || 'sk_test_xxx',
  baseUrl: 'http://localhost:3000/api', // Development
  // baseUrl: 'https://api.stellarsafe.io', // Production
  timeout: 30000 // 30 seconds
});
```

### 2. Analyze Address
```typescript
async function checkAddress(address: string) {
  try {
    const result = await client.analyzeAddress(address, 'public');
    
    console.log('Risk Level:', result.analysis.riskLevel);
    console.log('Risk Score:', result.analysis.riskScore);
    console.log('Verification:', result.analysis.verificationBadges);
    
    return result.analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

### 3. Preview Transaction
```typescript
async function previewSend(from: string, to: string, amount: string) {
  try {
    const preview = await client.previewTransaction({
      source: from,
      destination: to,
      asset: { code: 'XLM' },
      amount,
      network: 'public'
    });
    
    console.log('Fee:', preview.preview.fee);
    console.log('Warnings:', preview.preview.warnings);
    
    return preview.preview;
  } catch (error) {
    console.error('Preview failed:', error);
    throw error;
  }
}
```

---

## 🎨 Wallet Integration Patterns

### Pattern 1: Pre-Transaction Check
```typescript
/**
 * Lobstr Wallet Integration Example
 */
import { StellarSafeClient, StellarSafeError } from '@stellarsafe/sdk';

class LobstrWallet {
  private stellarSafe: StellarSafeClient;
  
  constructor() {
    this.stellarSafe = new StellarSafeClient({
      apiKey: process.env.STELLARSAFE_API_KEY!
    });
  }
  
  async sendPayment(destination: string, amount: string) {
    // Step 1: Analyze destination address
    console.log('🔍 Analyzing destination address...');
    
    try {
      const analysis = await this.stellarSafe.analyzeAddress(
        destination,
        'public'
      );
      
      // Step 2: Check risk level
      if (analysis.analysis.riskLevel === 'CRITICAL') {
        throw new Error(
          `⛔ Cannot send to high-risk address: ${analysis.analysis.recommendation}`
        );
      }
      
      // Step 3: Show warning for MEDIUM/HIGH risk
      if (['MEDIUM', 'HIGH'].includes(analysis.analysis.riskLevel)) {
        const confirmed = await this.showRiskWarning({
          level: analysis.analysis.riskLevel,
          score: analysis.analysis.riskScore,
          warnings: analysis.analysis.warnings,
          recommendation: analysis.analysis.recommendation
        });
        
        if (!confirmed) {
          console.log('❌ User cancelled due to risk warning');
          return;
        }
      }
      
      // Step 4: Preview transaction
      console.log('🔍 Previewing transaction...');
      const preview = await this.stellarSafe.previewTransaction({
        source: this.userAddress,
        destination,
        asset: { code: 'XLM' },
        amount,
        network: 'public'
      });
      
      if (!preview.preview.success) {
        throw new Error(
          `Transaction preview failed: ${preview.preview.errors?.join(', ')}`
        );
      }
      
      // Step 5: Show preview to user
      await this.showTransactionPreview({
        destination,
        amount,
        fee: preview.preview.fee,
        warnings: preview.preview.warnings,
        verificationBadges: analysis.analysis.verificationBadges
      });
      
      // Step 6: Execute transaction
      console.log('✅ Executing transaction...');
      const result = await this.executeTransaction(destination, amount);
      
      console.log('🎉 Transaction successful:', result);
      return result;
      
    } catch (error) {
      if (error instanceof StellarSafeError) {
        console.error('StellarSafe API Error:', {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode
        });
      }
      throw error;
    }
  }
  
  private async showRiskWarning(data: any): Promise<boolean> {
    // Show modal/dialog to user
    return confirm(
      `⚠️ Risk Warning\n\n` +
      `Risk Level: ${data.level}\n` +
      `Risk Score: ${data.score}/100\n\n` +
      `${data.recommendation}\n\n` +
      `Do you want to continue?`
    );
  }
  
  private async showTransactionPreview(data: any): Promise<void> {
    console.log('Transaction Preview:');
    console.log('  To:', data.destination);
    console.log('  Amount:', data.amount, 'XLM');
    console.log('  Fee:', data.fee);
    console.log('  Verified:', data.verificationBadges.join(', '));
    
    if (data.warnings?.length > 0) {
      console.log('  Warnings:', data.warnings.join(', '));
    }
  }
  
  private async executeTransaction(to: string, amount: string) {
    // Your wallet's transaction execution logic
    return { hash: 'abc123', success: true };
  }
  
  private get userAddress() {
    return 'GXXXXXXX...'; // Get from wallet state
  }
}

// Usage
const wallet = new LobstrWallet();
await wallet.sendPayment('GYYYYYY...', '100');
```

---

### Pattern 2: React Hook Integration
```typescript
/**
 * React Hook for StellarSafe
 */
import { useState, useEffect } from 'react';
import { StellarSafeClient, AddressAnalysisResponse } from '@stellarsafe/sdk';

export function useStellarSafeAnalysis(
  address: string,
  network: 'testnet' | 'public' = 'public'
) {
  const [analysis, setAnalysis] = useState<AddressAnalysisResponse['analysis'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const client = new StellarSafeClient({
    apiKey: process.env.NEXT_PUBLIC_STELLARSAFE_API_KEY!
  });
  
  useEffect(() => {
    if (!address || address.length !== 56) {
      setAnalysis(null);
      return;
    }
    
    let cancelled = false;
    
    async function analyze() {
      setLoading(true);
      setError(null);
      
      try {
        const result = await client.analyzeAddress(address, network);
        
        if (!cancelled) {
          setAnalysis(result.analysis);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    // Debounce
    const timer = setTimeout(analyze, 1000);
    
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address, network]);
  
  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.analyzeAddress(address, network);
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  return { analysis, loading, error, refetch };
}

// Usage in React Component
function SendModal({ destination }: { destination: string }) {
  const { analysis, loading, error, refetch } = useStellarSafeAnalysis(
    destination,
    'public'
  );
  
  if (loading) {
    return <Spinner text="Analyzing address..." />;
  }
  
  if (error) {
    return <ErrorCard message={error.message} onRetry={refetch} />;
  }
  
  if (!analysis) {
    return null;
  }
  
  return (
    <div>
      <RiskBadge 
        level={analysis.riskLevel} 
        score={analysis.riskScore} 
      />
      
      {analysis.verificationBadges.map((badge, i) => (
        <Badge key={i} variant="success">{badge}</Badge>
      ))}
      
      {analysis.warnings.map((warning, i) => (
        <Alert key={i} variant="warning">{warning}</Alert>
      ))}
      
      <button onClick={refetch}>
        🔄 Refresh Analysis
      </button>
    </div>
  );
}
```

---

### Pattern 3: Vue.js Composable
```typescript
/**
 * Vue.js Composable for StellarSafe
 */
import { ref, watch, computed } from 'vue';
import { StellarSafeClient } from '@stellarsafe/sdk';

export function useStellarSafe(apiKey: string) {
  const client = new StellarSafeClient({ apiKey });
  
  const analysis = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  async function analyzeAddress(address: string, network: 'testnet' | 'public' = 'public') {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await client.analyzeAddress(address, network);
      analysis.value = result.analysis;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }
  
  const isHighRisk = computed(() => {
    return analysis.value?.riskLevel === 'HIGH' || 
           analysis.value?.riskLevel === 'CRITICAL';
  });
  
  return {
    analysis,
    loading,
    error,
    isHighRisk,
    analyzeAddress
  };
}

// Usage in Vue Component
<script setup>
import { ref, watch } from 'vue';
import { useStellarSafe } from '@/composables/useStellarSafe';

const destination = ref('');
const { analysis, loading, isHighRisk, analyzeAddress } = useStellarSafe(
  import.meta.env.VITE_STELLARSAFE_API_KEY
);

watch(destination, (newAddress) => {
  if (newAddress.length === 56) {
    analyzeAddress(newAddress, 'public');
  }
});
</script>

<template>
  <div>
    <input v-model="destination" placeholder="Destination address" />
    
    <div v-if="loading">Analyzing...</div>
    
    <div v-else-if="analysis">
      <div :class="isHighRisk ? 'risk-high' : 'risk-safe'">
        Risk Level: {{ analysis.riskLevel }}
      </div>
      <div v-for="badge in analysis.verificationBadges" :key="badge">
        {{ badge }}
      </div>
    </div>
  </div>
</template>
```

---

### Pattern 4: Vanilla JavaScript
```javascript
/**
 * Plain JavaScript Integration
 */
class WalletSecurityChecker {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.stellarsafe.io';
  }
  
  async checkAddress(address, network = 'public') {
    try {
      const response = await fetch(`${this.baseUrl}/v1/analyze/address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          network,
          apiKey: this.apiKey
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }
      
      const data = await response.json();
      return data.analysis;
      
    } catch (error) {
      console.error('Security check failed:', error);
      throw error;
    }
  }
  
  displayRiskBadge(analysis, containerElement) {
    const badge = document.createElement('div');
    badge.className = `risk-badge risk-${analysis.riskLevel.toLowerCase()}`;
    badge.innerHTML = `
      <div class="risk-level">${analysis.riskLevel}</div>
      <div class="risk-score">${analysis.riskScore}/100</div>
      <div class="risk-recommendation">${analysis.recommendation}</div>
    `;
    
    containerElement.appendChild(badge);
    
    // Add verification badges
    analysis.verificationBadges.forEach(badgeText => {
      const verificationBadge = document.createElement('span');
      verificationBadge.className = 'verification-badge';
      verificationBadge.textContent = badgeText;
      containerElement.appendChild(verificationBadge);
    });
  }
}

// Usage
const checker = new WalletSecurityChecker('sk_live_xxx');

document.getElementById('send-button').addEventListener('click', async () => {
  const address = document.getElementById('destination').value;
  const container = document.getElementById('risk-container');
  
  try {
    const analysis = await checker.checkAddress(address);
    checker.displayRiskBadge(analysis, container);
    
    if (analysis.riskLevel === 'CRITICAL') {
      alert('⛔ Cannot send to this address!');
      return;
    }
    
    // Proceed with transaction
    sendTransaction(address);
    
  } catch (error) {
    alert('Security check failed: ' + error.message);
  }
});
```

---

## 🔒 Security Best Practices

### 1. **Never Expose API Keys in Frontend**
```typescript
// ❌ BAD - Exposed in client-side code
const client = new StellarSafeClient({
  apiKey: 'sk_live_xxx123456' // NEVER DO THIS!
});

// ✅ GOOD - Use environment variables
const client = new StellarSafeClient({
  apiKey: process.env.STELLARSAFE_API_KEY!
});

// ✅ BETTER - Proxy through your backend
async function checkAddressSafe(address: string) {
  const response = await fetch('/api/internal/check-address', {
    method: 'POST',
    body: JSON.stringify({ address })
  });
  return response.json();
}
```

### 2. **Implement Your Own Backend Proxy**
```typescript
// /pages/api/internal/check-address.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { StellarSafeClient } from '@stellarsafe/sdk';

const client = new StellarSafeClient({
  apiKey: process.env.STELLARSAFE_API_KEY! // Server-side only
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { address } = req.body;
  
  try {
    const analysis = await client.analyzeAddress(address, 'public');
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
}
```

---

## 🧪 Testing

### Local Testing
```bash
# Start your development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/v1/health

# Test address analysis
curl -X POST http://localhost:3000/api/v1/analyze/address \
  -H "Content-Type: application/json" \
  -d '{
    "address": "GXXXXXXX...",
    "network": "testnet",
    "apiKey": "test_key"
  }'
```

### Integration Tests
```typescript
import { StellarSafeClient } from '@stellarsafe/sdk';

describe('StellarSafe SDK', () => {
  const client = new StellarSafeClient({
    apiKey: 'test_key',
    baseUrl: 'http://localhost:3000/api'
  });
  
  it('should analyze address', async () => {
    const result = await client.analyzeAddress(
      'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
      'testnet'
    );
    
    expect(result.success).toBe(true);
    expect(result.analysis.address).toBeDefined();
    expect(result.analysis.riskLevel).toMatch(/SAFE|LOW|MEDIUM|HIGH|CRITICAL/);
  });
  
  it('should handle rate limiting', async () => {
    // Make 11 requests quickly
    const promises = Array(11).fill(0).map(() => 
      client.analyzeAddress('GXXXXXXX...', 'testnet')
    );
    
    await expect(Promise.all(promises)).rejects.toThrow('Rate limit exceeded');
  });
});
```

---

## 📚 Additional Resources

- **API Documentation:** https://docs.stellarsafe.io
- **GitHub Repository:** https://github.com/stellarsafe/api
- **Discord Community:** https://discord.gg/stellarsafe
- **Email Support:** api@stellarsafe.io

---

**Ready to integrate!** 🚀
