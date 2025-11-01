import { supabase, VerifiedAsset, BlacklistedAsset, AnalysisHistory } from './supabase';

/**
 * Asset Database Service
 * Handles verified and blacklisted asset operations
 */
export class AssetDatabaseService {
  /**
   * Check if an asset is verified
   */
  async isVerified(assetCode: string, issuerAddress: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('verified_assets')
        .select('id')
        .eq('asset_code', assetCode)
        .eq('issuer_address', issuerAddress)
        .eq('verification_status', 'verified')
        .single();

      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Check if an asset is blacklisted
   */
  async isBlacklisted(assetCode: string, issuerAddress: string): Promise<BlacklistedAsset | null> {
    try {
      const { data, error } = await supabase
        .from('blacklisted_assets')
        .select('*')
        .eq('asset_code', assetCode)
        .eq('issuer_address', issuerAddress)
        .single();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Get verified asset details
   */
  async getVerifiedAsset(assetCode: string, issuerAddress: string): Promise<VerifiedAsset | null> {
    try {
      const { data, error } = await supabase
        .from('verified_assets')
        .select('*')
        .eq('asset_code', assetCode)
        .eq('issuer_address', issuerAddress)
        .single();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Get all verified assets
   */
  async getAllVerifiedAssets(limit: number = 100): Promise<VerifiedAsset[]> {
    try {
      const { data, error } = await supabase
        .from('verified_assets')
        .select('*')
        .eq('verification_status', 'verified')
        .order('risk_score', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch verified assets:', error);
      return [];
    }
  }

  /**
   * Search verified assets
   */
  async searchVerifiedAssets(query: string): Promise<VerifiedAsset[]> {
    try {
      const { data, error } = await supabase
        .from('verified_assets')
        .select('*')
        .eq('verification_status', 'verified')
        .or(`asset_code.ilike.%${query}%,home_domain.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * Get all blacklisted assets
   */
  async getAllBlacklistedAssets(): Promise<BlacklistedAsset[]> {
    try {
      const { data, error } = await supabase
        .from('blacklisted_assets')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch blacklisted assets:', error);
      return [];
    }
  }

  /**
   * Save analysis to history
   */
  async saveAnalysisHistory(
    analysisType: 'asset' | 'transaction',
    analysisData: any
  ): Promise<boolean> {
    try {
      const historyEntry: Partial<AnalysisHistory> = {
        analysis_type: analysisType,
        risk_level: analysisData.riskLevel || analysisData.overallRisk?.level,
        risk_score: analysisData.riskScore || analysisData.overallRisk?.score,
        threats_count: analysisData.threats?.length || 0,
        analysis_data: analysisData,
      };

      if (analysisType === 'asset') {
        historyEntry.asset_code = analysisData.assetCode;
        historyEntry.issuer_address = analysisData.issuerAddress;
      } else if (analysisType === 'transaction') {
        historyEntry.transaction_hash = analysisData.transactionHash;
      }

      const { error } = await supabase
        .from('analysis_history')
        .insert(historyEntry);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save analysis history:', error);
      return false;
    }
  }

  /**
   * Get recent analysis history
   */
  async getRecentAnalyses(limit: number = 20): Promise<AnalysisHistory[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
      return [];
    }
  }

  /**
   * Get asset statistics
   */
  async getAssetStats() {
    try {
      const [verifiedCount, blacklistedCount] = await Promise.all([
        supabase
          .from('verified_assets')
          .select('id', { count: 'exact', head: true })
          .eq('verification_status', 'verified'),
        supabase
          .from('blacklisted_assets')
          .select('id', { count: 'exact', head: true }),
      ]);

      return {
        verifiedCount: verifiedCount.count || 0,
        blacklistedCount: blacklistedCount.count || 0,
      };
    } catch (error) {
      console.error('Failed to fetch asset stats:', error);
      return {
        verifiedCount: 0,
        blacklistedCount: 0,
      };
    }
  }
}

// Export singleton
export const assetDatabase = new AssetDatabaseService();
