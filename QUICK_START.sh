#!/bin/bash
# 🚀 Contract Verification Quick Start Test
# Bu script verification sistemini hızlıca test eder

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 StellarSafe Contract Verification Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Gerekli komutları kontrol et
echo "📋 Ön kontroller..."
echo ""

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 kurulu"
    else
        echo -e "${RED}✗${NC} $1 bulunamadı!"
        exit 1
    fi
}

check_command "node"
check_command "npm"
check_command "stellar"
check_command "soroban"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 2. CLI Tool'u hazırla
echo "🔨 CLI Tool hazırlanıyor..."
echo ""

cd cli-tool

if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies yükleniyor..."
    npm install --silent
fi

if [ ! -d "dist" ] || [ src/index.ts -nt dist/index.js ]; then
    echo "🔧 TypeScript build ediliyor..."
    npm run build
fi

echo -e "${GREEN}✓${NC} CLI tool hazır"
echo ""

# CLI'ı link et (global komut olarak)
echo "🔗 CLI global olarak link ediliyor..."
npm link

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 3. Native Asset Contract ID al (her zaman mevcuttur)
echo "📦 Native XLM Contract ID alınıyor..."
echo ""

cd ../stellar-contract

NATIVE_CONTRACT=$(stellar contract id asset --asset native --network testnet 2>/dev/null || echo "")

if [ -z "$NATIVE_CONTRACT" ]; then
    echo -e "${YELLOW}⚠${NC}  Native contract ID alınamadı, bilinen ID kullanılıyor"
    NATIVE_CONTRACT="CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
else
    echo -e "${GREEN}✓${NC} Native Contract ID: $NATIVE_CONTRACT"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 4. Frontend durumunu kontrol et
echo "🌐 Frontend kontrolü..."
echo ""

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Frontend dependencies yükleniyor..."
    npm install
fi

# .env.local var mı kontrol et
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠${NC}  .env.local dosyası bulunamadı"
    echo "   Mock mode ile test edebilirsiniz"
    echo ""
    echo "   Supabase kullanmak için:"
    echo "   1. frontend/.env.local dosyası oluşturun"
    echo "   2. Supabase credentials ekleyin"
    echo ""
fi

# Frontend çalışıyor mu kontrol et
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend çalışıyor (http://localhost:3000)"
else
    echo -e "${YELLOW}⚠${NC}  Frontend çalışmıyor"
    echo ""
    echo "   Frontend başlatmak için:"
    echo "   $ cd frontend"
    echo "   $ npm run dev"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. Test talimatları
echo "✅ Hazırlık tamamlandı!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Şimdi şunları yapın:"
echo ""
echo "1️⃣  Frontend'i başlatın (başka terminalde):"
echo "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "2️⃣  Browser'da açın:"
echo "   ${GREEN}http://localhost:3000/developer${NC}"
echo ""
echo "3️⃣  Contract ID girin:"
echo "   ${GREEN}$NATIVE_CONTRACT${NC}"
echo "   Network: ${GREEN}testnet${NC}"
echo ""
echo "4️⃣  'Generate Verification Code' butonuna basın"
echo ""
echo "5️⃣  Aldığınız kodu bu terminalde çalıştırın:"
echo "   ${GREEN}cd stellar-contract${NC}"
echo "   ${GREEN}stellarsafe verify YOUR_CODE${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 İPUCU: Kod 30 dakika geçerlidir"
echo ""

