#!/bin/bash
# Frontend'i temizleyip başlat

cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/frontend

echo "🧹 Cache temizleniyor..."
rm -rf .next

echo "🚀 Frontend başlatılıyor..."
echo ""
echo "Browser'da aç: http://localhost:3000/developer"
echo ""

npm run dev

