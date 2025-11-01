# Supabase Setup Guide for StellarSafe

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and project name: `stellarsafe`
4. Set a strong database password
5. Choose region closest to your users
6. Click "Create new project"

## Step 2: Run Database Migration

1. Once your project is ready, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire content of `/database-schema.sql` from the project root
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration
6. Verify tables were created by checking "Table Editor" in the left sidebar

You should see these tables:
- `verified_assets`
- `blacklisted_assets`
- `user_watchlist`
- `analysis_history`
- `community_reports`

## Step 3: Get API Credentials

1. Click on "Settings" (gear icon) in the left sidebar
2. Click on "API" under Project Settings
3. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Configure Environment Variables

1. Open `/frontend/.env.local` in your project
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

3. Save the file
4. Restart your Next.js development server

## Step 5: Verify Connection

1. Start your Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000/assets`
3. You should see the Asset Explorer page with stats
4. The page should show "4 Verified Assets" and "2 Blacklisted Assets" (from seed data)

## Step 6: Enable Row Level Security (Optional)

The migration already enables RLS and sets up public read policies. For production:

1. Go to "Authentication" > "Policies"
2. Review the policies for each table
3. For admin write access, you'll need to create additional policies

## Default Seed Data

The migration includes sample data:

**Verified Assets:**
- USDC (Circle)
- AQUA (Aqua Network)
- yXLM (Ultra Stellar)
- MOBI (Mobius Network)

**Blacklisted Assets:**
- 2 fake/scam examples for testing

## Troubleshooting

### Connection Failed
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is not paused
- Ensure you're on the free tier with active credits

### No Data Showing
- Run the SQL migration again in Supabase SQL Editor
- Check browser console for errors
- Verify RLS policies are set correctly

### CORS Errors
- Supabase should handle CORS automatically
- If issues persist, check your Project Settings > API settings

## API Endpoints

Once configured, these endpoints will work:

- `GET /api/assets/verified` - List verified assets
- `GET /api/assets/verified?q=USDC` - Search assets
- `GET /api/assets/blacklisted` - List blacklisted assets
- `GET /api/assets/stats` - Get asset statistics

## Database Service Usage

```typescript
import { assetDatabase } from '@/lib/database/asset-service';

// Check if asset is verified
const isVerified = await assetDatabase.isVerified('USDC', 'GA5ZSE...');

// Check if asset is blacklisted
const blacklisted = await assetDatabase.isBlacklisted('FAKE', 'GXXXX...');

// Get all verified assets
const assets = await assetDatabase.getAllVerifiedAssets();

// Search assets
const results = await assetDatabase.searchVerifiedAssets('USDC');

// Save analysis to history
await assetDatabase.saveAnalysisHistory('asset', analysisResult);
```

## Next Steps

- [ ] Configure Supabase Auth (Phase 6) for user accounts
- [ ] Set up Supabase Storage for asset logos
- [ ] Create admin dashboard for managing verified assets
- [ ] Implement community reporting system
- [ ] Add real-time subscriptions for live updates

## Production Deployment

For production (Phase 8):

1. Create a production Supabase project
2. Run the same migration
3. Update environment variables in Vercel
4. Configure backup policies
5. Set up monitoring and alerts
