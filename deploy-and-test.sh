#!/bin/bash

# StellarSafe Contract Deployment and Test Script
# Bu script contract'ı deploy eder ve contract ID'yi gösterir

set -e

echo "🚀 StellarSafe Contract Deployment Script"
echo "=========================================="
echo ""

# Contract klasörüne git
cd "$(dirname "$0")/stellar-contract"

# 1. Contract'ı build et
echo "📦 Building contract..."
soroban contract build

if [ ! -f "target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm" ]; then
    echo "❌ Error: WASM file not found!"
    exit 1
fi

echo "✅ Contract built successfully!"
echo ""

# 2. Key kontrolü
echo "🔑 Checking for Soroban keys..."
KEYS=$(soroban keys list 2>/dev/null | grep -v "No keys found" || echo "")

if [ -z "$KEYS" ]; then
    echo "⚠️  No keys found. Creating test key..."
    soroban keys generate test-deploy-key
    echo "💰 Funding test key..."
    soroban keys fund test-deploy-key --network testnet || echo "⚠️  Could not fund key automatically"
    KEY_NAME="test-deploy-key"
else
    KEY_NAME=$(echo "$KEYS" | head -1 | awk '{print $1}')
    echo "✅ Using existing key: $KEY_NAME"
fi

echo ""

# 3. Contract'ı deploy et
echo "🚀 Deploying contract to testnet..."
echo ""

CONTRACT_OUTPUT=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarsafe_registry.wasm \
  --source "$KEY_NAME" \
  --network testnet 2>&1)

echo "$CONTRACT_OUTPUT"
echo ""

# Contract ID'yi extract et
CONTRACT_ID=$(echo "$CONTRACT_OUTPUT" | grep -oP 'Contract ID: \K[CA-Z0-9]{56}' || echo "")

if [ -z "$CONTRACT_ID" ]; then
    # Alternatif format dene
    CONTRACT_ID=$(echo "$CONTRACT_OUTPUT" | grep -i "contract" | grep -oP '[CA-Z0-9]{56}' | head -1 || echo "")
fi

if [ -n "$CONTRACT_ID" ]; then
    echo "=========================================="
    echo "✅ SUCCESS! Contract Deployed"
    echo "=========================================="
    echo ""
    echo "📋 Contract ID:"
    echo "   $CONTRACT_ID"
    echo ""
    echo "🔗 Next Steps:"
    echo "   1. Copy the Contract ID above"
    echo "   2. Go to: http://localhost:3000/developer"
    echo "   3. Paste the Contract ID"
    echo "   4. Select 'Testnet' network"
    echo "   5. Click 'Generate Verification Code'"
    echo ""
    echo "🌐 View on Stellar Expert:"
    echo "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
    echo ""
    
    # Contract ID'yi bir dosyaya kaydet
    echo "$CONTRACT_ID" > ../CONTRACT_ID.txt
    echo "💾 Contract ID saved to CONTRACT_ID.txt"
else
    echo "⚠️  Could not extract Contract ID from output"
    echo "Please check the output above for the Contract ID"
fi
