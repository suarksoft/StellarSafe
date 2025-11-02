# 🔧 PostgreSQL API Setup

## 📦 Gerekli Package'lar

Frontend'e PostgreSQL client eklemek gerekiyor:

```bash
cd frontend
npm install pg @types/pg
```

---

## 🔄 API Route Güncellemeleri

### 1. Database Client Oluştur

**Dosya:** `/frontend/src/lib/database/postgres.ts`

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'stellarsafe',
  user: process.env.POSTGRES_USER || 'stellarsafe_user',
  password: process.env.POSTGRES_PASSWORD || 'stellarsafe_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

### 2. Generate Route Güncelle

**Dosya:** `/frontend/src/app/api/verify/generate/route.ts`

Supabase kısmını değiştir:
```typescript
// Eski (Supabase)
import { createClient } from '@supabase/supabase-js';

// Yeni (PostgreSQL)
import pool from '@/lib/database/postgres';
```

Database işlemleri:
```typescript
// Eski
const { data, error } = await supabase
  .from('verification_requests')
  .insert({...});

// Yeni
const client = await pool.connect();
try {
  const result = await client.query(
    'INSERT INTO verification_requests (code, contract_id, network, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [code, contractId, network, expiresAt]
  );
  return result.rows[0];
} finally {
  client.release();
}
```

### 3. Submit Route Güncelle

**Dosya:** `/frontend/src/app/api/verify/submit/route.ts`

Aynı şekilde PostgreSQL query'leri ile değiştir.

### 4. Status Route Güncelle

**Dosya:** `/frontend/src/app/api/verify/status/[code]/route.ts`

PostgreSQL SELECT query'leri ekle.

---

## 🚀 Hızlı Setup Script

Ben sana hazır script verebilirim:

```bash
# 1. Package'ları yükle
cd frontend && npm install pg @types/pg

# 2. API route'larını güncelle (otomatik)
# 3. Frontend'i restart et
npm run dev
```

---

## 🎯 Şu An Ne Yapmalıyız?

**Seçenek A:** Sen önce pgAdmin'de database'i kur, ben bekleyeyim
**Seçenek B:** Ben şimdi API route'larını güncelleyeyim, sen database'i kurarken
**Seçenek C:** İkisini paralel yapalım

Hangisini tercih ediyorsun? 

Database kurulumu ne kadar sürer sence? 5-10 dakika ise ben API'leri güncelleyebilirim o sırada. 🚀
