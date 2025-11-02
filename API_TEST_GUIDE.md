# 🧪 API Test Guide

## Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/api/v1/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2025-11-02T...",
  "services": {
    "stellarExpert": "operational",
    "tomlVerification": "operational",
    "cache": "operational",
    "database": "operational"
  },
  "uptime": 123,
  "endpoints": {
    "analyzeAddress": "/api/v1/analyze/address",
    "analyzeTransaction": "/api/v1/analyze/transaction",
    "health": "/api/v1/health"
  }
}
```

---

### 2. Address Analysis
```bash
curl -X POST http://localhost:3000/api/v1/analyze/address \
  -H "Content-Type: application/json" \
  -d '{
    "address": "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA",
    "network": "testnet",
    "apiKey": "test_key_12345"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "cached": false,
  "cacheAge": null,
  "analysis": {
    "address": "GBNZ...",
    "riskScore": 0,
    "riskLevel": "SAFE",
    "recommendation": "...",
    "verificationBadges": ["✅ ..."],
    "timestamp": "2025-11-02T...",
    "processingTime": "1200ms"
  }
}
```

---

### 3. Transaction Preview
```bash
curl -X POST http://localhost:3000/api/v1/analyze/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "source": "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
    "destination": "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA",
    "asset": {
      "code": "XLM"
    },
    "amount": "10",
    "network": "testnet",
    "apiKey": "test_key_12345"
  }'
```

---

### 4. Rate Limit Test
```bash
# Make 11 requests quickly (limit is 10/min)
for i in {1..11}; do
  echo "Request $i"
  curl -X POST http://localhost:3000/api/v1/analyze/address \
    -H "Content-Type: application/json" \
    -d '{
      "address": "GXXXXX...",
      "network": "testnet",
      "apiKey": "test_key"
    }'
  echo ""
done
```

**Expected:** 11th request should return 429 (Rate Limit Exceeded)

---

### 5. Error Cases

**Missing API Key:**
```bash
curl -X POST http://localhost:3000/api/v1/analyze/address \
  -H "Content-Type: application/json" \
  -d '{
    "address": "GXXXXX...",
    "network": "testnet"
  }'
```
Expected: `401 Unauthorized`

**Invalid Address:**
```bash
curl -X POST http://localhost:3000/api/v1/analyze/address \
  -H "Content-Type: application/json" \
  -d '{
    "address": "invalid",
    "network": "testnet",
    "apiKey": "test_key"
  }'
```
Expected: `400 Bad Request`

---

## SDK Test

### JavaScript Test
```javascript
// test-sdk.js
const { StellarSafeClient } = require('./src/lib/sdk/stellarsafe-client');

async function test() {
  const client = new StellarSafeClient({
    apiKey: 'test_key_12345',
    baseUrl: 'http://localhost:3000/api'
  });
  
  try {
    console.log('Testing health endpoint...');
    const health = await client.health();
    console.log('✅ Health:', health.status);
    
    console.log('\nTesting address analysis...');
    const analysis = await client.analyzeAddress(
      'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
      'testnet'
    );
    console.log('✅ Risk Level:', analysis.analysis.riskLevel);
    console.log('✅ Risk Score:', analysis.analysis.riskScore);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Run with:
```bash
node test-sdk.js
```

---

## Integration Test Checklist

- [ ] Health endpoint returns 200
- [ ] Address analysis works with testnet
- [ ] Address analysis works with mainnet
- [ ] Transaction preview works
- [ ] Rate limiting triggers at 11th request
- [ ] Missing API key returns 401
- [ ] Invalid address returns 400
- [ ] Invalid network returns 400
- [ ] SDK client works correctly
- [ ] Error handling works
- [ ] Response headers include rate limit info
- [ ] CORS works (if needed)

---

## Start Testing

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, run tests
curl http://localhost:3000/api/v1/health

# 3. Check response
```

**All API endpoints ready for testing!** 🚀
