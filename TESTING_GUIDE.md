# Testing Guide

## Testing Demo Scenarios

### 1. Web Application Testing

**Start the development server:**
```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000/demo

**Test Each Scenario:**

1. **Safe USDC Payment**
   - Click "Test This Scenario"
   - Should show: SAFE risk level, 0 threats
   - Green badge, no warnings
   
2. **Risky Unknown Asset**
   - Click "Test This Scenario"
   - Should show: MEDIUM risk level, 2+ threats
   - Yellow badge, warning messages
   
3. **Critical - Fake USDC**
   - Click "Test This Scenario"
   - Should show: CRITICAL risk level, 3+ threats
   - Red badge, critical warnings about blacklisted asset

### 2. Browser Extension Testing

**Load Extension in Chrome:**

1. Open Chrome/Brave browser
2. Go to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select `/extension` folder
6. Extension icon should appear in toolbar

**Test Extension:**

1. **Check Popup:**
   - Click extension icon
   - Should see stats (verified/blacklisted assets count)
   - Toggle "Protection Enabled" on/off
   - Click "Open Dashboard" link

2. **Test Freighter Interception (if you have Freighter wallet):**
   - Open Stellar app that uses Freighter (e.g., StellarX, Lobstr web)
   - Try to sign a transaction
   - Extension should intercept and show warning modal
   - Modal should display risk analysis
   
3. **Manual Console Test:**
   - Open any webpage
   - Open DevTools Console (F12)
   - Type:
   ```javascript
   window.freighterApi?.signTransaction('test-xdr-string')
   ```
   - Should show modal with analysis

### 3. API Endpoint Testing

**Test Transaction Analysis:**
```bash
curl -X POST http://localhost:3000/api/transaction/analyze \
  -H "Content-Type: application/json" \
  -d '{"xdr":"AAAAAgAAAABElb1HRLd3ecXLt0cFfYw0bLsdPBUWDJpHXwAVE73maQAAAGQADKHZAAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAABCYcSzRodOfXFBlKSvFnTZle5FVlIvOgzIxJZHTLN2bwAAAAFVU0RDAAAAAEI8SYOm7fL7axE64EbyhQzDfMIEpSnoHh3cxfL5klU2AAAAAAJfTOAAAAAAAAAAAQ=="}'
```

**Test Asset Analysis:**
```bash
curl http://localhost:3000/api/asset/analyze?code=USDC&issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
```

**Test Database:**
```bash
# Verified assets
curl http://localhost:3000/api/assets/verified

# Blacklisted assets
curl http://localhost:3000/api/assets/blacklisted

# Stats
curl http://localhost:3000/api/assets/stats
```

### 4. Portfolio Scanner Testing

Visit: http://localhost:3000/dashboard

**Test with real Testnet addresses:**
```
GBQKQNV2EZWWVYLGU2KBHSLXNKPJFVMOXKJX7VZXQ5W7PSHJ3YMCMTGQ
```

Or create a test account:
```bash
# In Node.js console
const StellarSdk = require('@stellar/stellar-sdk');
const pair = StellarSdk.Keypair.random();
console.log('Public:', pair.publicKey());
console.log('Secret:', pair.secret());
```

### 5. Expected Results

**Database Seed Data:**
- 4 verified assets: USDC, AQUA, yXLM, MOBI
- 2 blacklisted assets: Fake USDC, Fake BTC

**Demo Scenarios:**
- Scenario 1 (Safe): 0 threats, SAFE level
- Scenario 2 (Risky): 2+ threats, MEDIUM level  
- Scenario 3 (Critical): 3+ threats, CRITICAL level

**Extension:**
- Popup shows asset counts from database
- Content script successfully loads
- Background worker can call API endpoints
- Freighter interception works (if Freighter installed)

### 6. Troubleshooting

**If demo scenarios don't work:**
- Check dev server is running
- Check browser console for errors
- Verify API endpoints respond

**If extension doesn't load:**
- Check manifest.json is valid
- Verify all file paths are correct
- Check extension console for errors

**If database queries fail:**
- Verify .env.local has correct Supabase credentials
- Check Supabase SQL Editor that tables exist
- Test connection with test-db.js

### 7. Performance Testing

**Load Testing:**
- Analyze 10+ transactions in quick succession
- Scan portfolios with 50+ assets
- Search asset database with various queries

**Response Times:**
- Asset analysis: < 500ms
- Transaction analysis: < 1000ms
- Database queries: < 200ms
- Portfolio scan (10 assets): < 3000ms

### 8. Manual Test Checklist

- [ ] All pages load without errors
- [ ] Navigation menu works
- [ ] Demo scenarios all execute
- [ ] Asset Explorer shows verified/blacklisted tabs
- [ ] Dashboard portfolio scanner works
- [ ] Transaction analyzer accepts XDR
- [ ] Asset analyzer shows risk badges
- [ ] Browser extension loads
- [ ] Extension popup displays stats
- [ ] API endpoints return valid JSON
- [ ] Database queries work
- [ ] No console errors
- [ ] Mobile responsive (test on phone)
