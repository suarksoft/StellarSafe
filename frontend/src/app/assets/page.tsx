'use client';

import { useState, useEffect } from 'react';
import { RootLayout } from '@/components/RootLayout';
import { PageIntro } from '@/components/PageIntro';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { RiskBadge } from '@/components/analysis/RiskBadge';
// Types for assets
interface VerifiedAsset {
  id: string;
  asset_code: string;
  issuer_address: string;
  home_domain?: string;
  description?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  risk_level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  verified_at?: string;
  verified_by?: string;
  toml_url?: string;
  logo_url?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

interface BlacklistedAsset {
  id: string;
  asset_code: string;
  issuer_address: string;
  reason: string;
  risk_level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  blacklisted_at: string;
  reported_by: string;
  created_at: string;
  updated_at: string;
}

export default function AssetExplorerPage() {
  const [activeTab, setActiveTab] = useState<'verified' | 'blacklisted'>('verified');
  const [verifiedAssets, setVerifiedAssets] = useState<VerifiedAsset[]>([]);
  const [blacklistedAssets, setBlacklistedAssets] = useState<BlacklistedAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ verifiedCount: 0, blacklistedCount: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [verifiedResponse, blacklistedResponse, statsResponse] = await Promise.all([
        fetch('/api/assets/verified'),
        fetch('/api/assets/blacklisted'),
        fetch('/api/assets/stats'),
      ]);

      const [verifiedData, blacklistedData, statsData] = await Promise.all([
        verifiedResponse.json(),
        blacklistedResponse.json(),
        statsResponse.json(),
      ]);

      setVerifiedAssets(verifiedData.assets || []);
      setBlacklistedAssets(blacklistedData.assets || []);
      setStats({
        verifiedCount: statsData.totalVerified || 0,
        blacklistedCount: statsData.totalBlacklisted || 0
      });
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/assets/verified?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setVerifiedAssets(data.assets || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVerified = searchQuery
    ? verifiedAssets
    : verifiedAssets;

  return (
    <RootLayout>
      <PageIntro eyebrow="Asset Explorer" title="Browse Verified Stellar Assets">
        <p>
          Discover verified assets on the Stellar network. Check asset safety ratings,
          issuer information, and community trust scores.
        </p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="rounded-3xl bg-green-50 p-6 ring-1 ring-green-600/20">
              <div className="text-3xl font-bold text-green-900 mb-2">
                {stats.verifiedCount}
              </div>
              <div className="text-sm font-semibold text-green-700">
                Verified Assets
              </div>
            </div>
            <div className="rounded-3xl bg-red-50 p-6 ring-1 ring-red-600/20">
              <div className="text-3xl font-bold text-red-900 mb-2">
                {stats.blacklistedCount}
              </div>
              <div className="text-sm font-semibold text-red-700">
                Blacklisted Assets
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'verified'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Verified Assets ({stats.verifiedCount})
            </button>
            <button
              onClick={() => setActiveTab('blacklisted')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'blacklisted'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Blacklisted Assets ({stats.blacklistedCount})
            </button>
          </div>

          {/* Search Bar */}
          {activeTab === 'verified' && (
            <div className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by asset code, domain, or description..."
                  className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 rounded-lg bg-neutral-950 text-white font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      loadData();
                    }}
                    className="px-4 py-3 rounded-lg bg-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="text-neutral-600">Loading assets...</div>
            </div>
          )}

          {/* Verified Assets List */}
          {!isLoading && activeTab === 'verified' && (
            <div className="space-y-4">
              {filteredVerified.length === 0 ? (
                <div className="text-center py-12 rounded-3xl bg-neutral-50 ring-1 ring-neutral-950/5">
                  <p className="text-neutral-600">
                    {searchQuery ? 'No assets found matching your search.' : 'No verified assets available.'}
                  </p>
                </div>
              ) : (
                filteredVerified.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-3xl bg-neutral-50 p-6 ring-1 ring-neutral-950/5 hover:ring-neutral-950/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-display font-semibold text-neutral-950">
                            {asset.asset_code}
                          </h3>
                          <RiskBadge
                            level={asset.risk_level}
                            score={asset.risk_score}
                            size="sm"
                            showScore={false}
                          />
                        </div>
                        {asset.description && (
                          <p className="text-sm text-neutral-600 mb-3">{asset.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-neutral-950">Issuer:</span>
                        <p className="font-mono text-neutral-600 break-all text-xs">
                          {asset.issuer_address}
                        </p>
                      </div>
                      {asset.home_domain && (
                        <div>
                          <span className="font-semibold text-neutral-950">Domain:</span>
                          <p className="text-neutral-600">
                            <a
                              href={`https://${asset.home_domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {asset.home_domain}
                            </a>
                          </p>
                        </div>
                      )}
                      {asset.verified_by && (
                        <div>
                          <span className="font-semibold text-neutral-950">Verified By:</span>
                          <p className="text-neutral-600">{asset.verified_by}</p>
                        </div>
                      )}
                      {asset.verified_at && (
                        <div>
                          <span className="font-semibold text-neutral-950">Verified:</span>
                          <p className="text-neutral-600">
                            {new Date(asset.verified_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {asset.website && (
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <a
                          href={asset.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visit Website →
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Blacklisted Assets List */}
          {!isLoading && activeTab === 'blacklisted' && (
            <div className="space-y-4">
              {blacklistedAssets.length === 0 ? (
                <div className="text-center py-12 rounded-3xl bg-neutral-50 ring-1 ring-neutral-950/5">
                  <p className="text-neutral-600">No blacklisted assets found.</p>
                </div>
              ) : (
                blacklistedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-3xl bg-red-50 p-6 ring-1 ring-red-600/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-display font-semibold text-red-950">
                            {asset.asset_code}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              asset.risk_level === 'CRITICAL'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-200 text-red-900'
                            }`}
                          >
                            {asset.risk_level === 'CRITICAL' ? 'VERIFIED SCAM' : asset.risk_level}
                          </span>
                        </div>
                        <p className="text-sm text-red-900 font-semibold mb-3">
                          {asset.reason}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-red-950">Issuer:</span>
                        <p className="font-mono text-red-900 break-all text-xs">
                          {asset.issuer_address}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-red-950">Reported:</span>
                        <p className="text-red-900">
                          {new Date(asset.blacklisted_at).toLocaleDateString()} by{' '}
                          {asset.reported_by || 'Community'}
                        </p>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}
        </FadeIn>
      </Container>
    </RootLayout>
  );
}
