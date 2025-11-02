# 🔧 PostgreSQL Environment Configuration

## 📋 pgAdmin'de Yapılacaklar:

### 1. Database Oluştur
```sql
-- Database
CREATE DATABASE stellarsafe;

-- User
CREATE USER stellarsafe_user WITH PASSWORD 'stellarsafe_password';

-- Permissions
GRANT ALL PRIVILEGES ON DATABASE stellarsafe TO stellarsafe_user;
GRANT ALL ON SCHEMA public TO stellarsafe_user;
```

### 2. Schema Yükle
`database-schema.sql` dosyasını pgAdmin'de çalıştır:
- Query Tool aç
- `/Users/ahmetbugrakurnaz/Desktop/stellarostim/database-schema.sql` dosyasını aç
- Execute et

---

## 📄 .env.local Dosyası

Frontend klasöründe `.env.local` dosyası oluştur:

**Path:** `/Users/ahmetbugrakurnaz/Desktop/stellarostim/frontend/.env.local`

**İçerik:**
```bash
# Database Configuration
DATABASE_URL="postgresql://stellarsafe_user:stellarsafe_password@localhost:5432/stellarsafe"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="stellarsafe"
POSTGRES_USER="stellarsafe_user"
POSTGRES_PASSWORD="stellarsafe_password"

# Supabase Alternative (Local PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL="postgresql://localhost:5432"
SUPABASE_SERVICE_ROLE_KEY="local_dev_key_2024"

# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_HORIZON_URL_TESTNET="https://horizon-testnet.stellar.org"
NEXT_PUBLIC_HORIZON_URL_MAINNET="https://horizon.stellar.org"
NEXT_PUBLIC_SOROBAN_RPC_TESTNET="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_SOROBAN_RPC_MAINNET="https://soroban-mainnet.stellar.org"

# API Settings
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
API_SECRET_KEY="stellarsafe_local_secret_2024"

# Verification Settings
VERIFICATION_CODE_EXPIRY_MINUTES="30"
RATE_LIMIT_MAX_REQUESTS="5"
RATE_LIMIT_WINDOW_HOURS="1"

# Development
NODE_ENV="development"
NEXT_PUBLIC_DEBUG="true"
```

---

## 🔄 API Route Güncellemesi

`/frontend/src/app/api/verify/generate/route.ts` dosyasını PostgreSQL için güncellemek gerekebilir.

Şu anki kod Supabase kullanıyor:
```typescript
import { createClient } from '@supabase/supabase-js';
```

PostgreSQL için değiştirmemiz gerekecek:
```typescript
import { Pool } from 'pg';
```

---

## ✅ Test Adımları

1. **pgAdmin'de setup yap**
2. **`.env.local` dosyasını oluştur**
3. **Frontend'i restart et:**
   ```bash
   cd frontend
   npm run dev
   ```
4. **Database bağlantısını test et:**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 🎯 Sonraki Adım

Sen pgAdmin'de database'i kurarken, ben de API route'larını PostgreSQL için güncelleyeyim mi?

Yoksa önce database kurulumunu tamamlayalım, sonra API'leri mi güncelleyelim?
