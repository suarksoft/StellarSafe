#!/bin/bash
set -e

echo "🧪 StellarSafe Verification System - Complete Test"
echo "═══════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo -e "${RED}✗ Rust not found. Install from https://rustup.rs${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Rust: $(rustc --version)${NC}"

# Check Soroban
if ! command -v soroban &> /dev/null; then
    echo -e "${RED}✗ Soroban CLI not found. Install: cargo install soroban-cli${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Soroban: $(soroban --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

# Check if frontend is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${YELLOW}⚠ Frontend not running. Start with: cd frontend && npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend running on http://localhost:3000${NC}\n"

# Step 1: Build contract
echo -e "${BLUE}📦 Step 1: Building contract...${NC}"
cd stellar-contract
soroban contract build
echo -e "${GREEN}✓ Contract built${NC}\n"

# Step 2: Deploy
echo -e "${BLUE}🚀 Step 2: Deploying to testnet...${NC}"
CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe.wasm \
  --source admin \
  --network testnet 2>&1 | tail -1)

if [[ ! $CONTRACT_ID =~ ^C[A-Z0-9]{55}$ ]]; then
  echo -e "${RED}✗ Deployment failed. Check your Stellar account and network settings.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Contract deployed: $CONTRACT_ID${NC}\n"

# Step 3: Generate verification code
echo -e "${BLUE}🔑 Step 3: Generating verification code...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/verify/generate \
  -H "Content-Type: application/json" \
  -d "{\"contractId\":\"$CONTRACT_ID\",\"network\":\"testnet\"}")

CODE=$(echo $RESPONSE | jq -r '.code')

if [ "$CODE" == "null" ] || [ -z "$CODE" ]; then
  echo -e "${RED}✗ Failed to generate code${NC}"
  echo "Response:"
  echo $RESPONSE | jq '.'
  exit 1
fi

echo -e "${GREEN}✓ Code generated: $CODE${NC}"
echo -e "  Expires in: 30 minutes\n"

# Step 4: Wait a moment for database
echo -e "${YELLOW}⏳ Waiting 2 seconds for database...${NC}"
sleep 2

# Step 5: Run CLI verification
echo -e "${BLUE}🔒 Step 4: Running CLI verification...${NC}\n"

cd ..
if ! command -v stellarsafe &> /dev/null; then
  echo -e "${YELLOW}⚠ stellarsafe CLI not linked. Using npx...${NC}"
  cd stellar-contract
  npx @stellarsafe/cli verify $CODE --directory .
else
  cd stellar-contract
  stellarsafe verify $CODE
fi

echo ""

# Step 6: Summary
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ VERIFICATION TEST COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  Contract ID: $CONTRACT_ID"
echo "  Verification Code: $CODE"
echo "  Network: testnet"
echo ""
echo -e "${BLUE}🌐 View results:${NC}"
echo "  http://localhost:3000/contract/$CONTRACT_ID"
echo ""
echo -e "${BLUE}💾 Check database:${NC}"
echo "  SELECT * FROM verified_contracts WHERE contract_id = '$CONTRACT_ID';"
echo ""
echo -e "${GREEN}✨ Test completed successfully! Your contract is verified.${NC}"
echo ""

