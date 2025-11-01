-- StellarSafe Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verified Assets Table
CREATE TABLE verified_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_code VARCHAR(12) NOT NULL,
  issuer_address VARCHAR(56) NOT NULL,
  home_domain VARCHAR(255),
  description TEXT,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  risk_level VARCHAR(20) NOT NULL DEFAULT 'SAFE',
  risk_score INTEGER DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by VARCHAR(255),
  toml_url VARCHAR(500),
  logo_url VARCHAR(500),
  website VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  UNIQUE(asset_code, issuer_address)
);

-- Create index for faster lookups
CREATE INDEX idx_verified_assets_issuer ON verified_assets(issuer_address);
CREATE INDEX idx_verified_assets_code ON verified_assets(asset_code);
CREATE INDEX idx_verified_assets_status ON verified_assets(verification_status);

-- Blacklisted Assets Table
CREATE TABLE blacklisted_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_code VARCHAR(12) NOT NULL,
  issuer_address VARCHAR(56) NOT NULL,
  reason TEXT NOT NULL,
  threat_level VARCHAR(20) NOT NULL DEFAULT 'HIGH',
  reported_by VARCHAR(255),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_scam BOOLEAN DEFAULT FALSE,
  evidence_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  UNIQUE(asset_code, issuer_address)
);

CREATE INDEX idx_blacklisted_assets_issuer ON blacklisted_assets(issuer_address);

-- User Watchlist Table (for future user accounts)
CREATE TABLE user_watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(56) NOT NULL, -- Stellar address for now
  asset_code VARCHAR(12) NOT NULL,
  issuer_address VARCHAR(56) NOT NULL,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  UNIQUE(user_id, asset_code, issuer_address)
);

CREATE INDEX idx_watchlist_user ON user_watchlist(user_id);

-- Analysis History Table (to cache analysis results)
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type VARCHAR(20) NOT NULL, -- 'asset' or 'transaction'
  asset_code VARCHAR(12),
  issuer_address VARCHAR(56),
  transaction_hash VARCHAR(64),
  risk_level VARCHAR(20) NOT NULL,
  risk_score INTEGER NOT NULL,
  threats_count INTEGER DEFAULT 0,
  analysis_data JSONB NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for faster queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_history_type ON analysis_history(analysis_type);
CREATE INDEX idx_analysis_history_asset ON analysis_history(asset_code, issuer_address);
CREATE INDEX idx_analysis_history_tx ON analysis_history(transaction_hash);
CREATE INDEX idx_analysis_history_date ON analysis_history(created_at DESC);

-- Community Reports Table
CREATE TABLE community_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_code VARCHAR(12) NOT NULL,
  issuer_address VARCHAR(56) NOT NULL,
  reporter_address VARCHAR(56),
  report_type VARCHAR(20) NOT NULL, -- 'scam', 'suspicious', 'legitimate'
  description TEXT NOT NULL,
  evidence_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'verified', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255)
);

CREATE INDEX idx_reports_asset ON community_reports(asset_code, issuer_address);
CREATE INDEX idx_reports_status ON community_reports(status);

-- Insert some default verified assets (popular Stellar assets)
INSERT INTO verified_assets (asset_code, issuer_address, home_domain, description, verification_status, risk_level, risk_score, verified_at, verified_by) VALUES
('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', 'centre.io', 'USD Coin by Circle', 'verified', 'SAFE', 0, NOW(), 'StellarSafe'),
('AQUA', 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', 'aqua.network', 'AQUA token for Stellar ecosystem', 'verified', 'SAFE', 0, NOW(), 'StellarSafe'),
('yXLM', 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55', 'ultra-stellar.org', 'Yield-bearing XLM by Ultra Stellar', 'verified', 'LOW', 5, NOW(), 'StellarSafe'),
('MOBI', 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH', 'mobius.network', 'Mobius Network Token', 'verified', 'LOW', 10, NOW(), 'StellarSafe');

-- Insert some example blacklisted assets (fake/scam examples)
INSERT INTO blacklisted_assets (asset_code, issuer_address, reason, threat_level, verified_scam, reported_by) VALUES
('USDC', 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Fake USDC - impersonating Circle USDC', 'CRITICAL', TRUE, 'Community'),
('BTC', 'GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', 'Fake Bitcoin anchor - unverified issuer', 'HIGH', TRUE, 'StellarSafe');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for verified_assets
CREATE TRIGGER update_verified_assets_updated_at BEFORE UPDATE ON verified_assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - optional for public read access
ALTER TABLE verified_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklisted_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to verified assets"
ON verified_assets FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to blacklisted assets"
ON blacklisted_assets FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to analysis history"
ON analysis_history FOR SELECT
USING (true);

-- Note: Write access policies can be added later for admin users
