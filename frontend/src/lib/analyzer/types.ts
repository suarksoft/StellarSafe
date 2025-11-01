export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Threat {
  title?: string; // Optional title for display
  type?: string; // Legacy field
  severity: ThreatSeverity;
  message?: string; // Legacy field
  description: string;
  technical?: string; // Legacy field
  explanation?: string;
}

export interface AssetAnalysis {
  assetCode: string;
  issuerAddress: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  threats: Threat[];
  recommendations: string[];
  metadata: {
    homeDomain?: string;
    accountAge: number;
    flags: {
      auth_required: boolean;
      auth_revocable: boolean;
      auth_immutable: boolean;
      auth_clawback_enabled: boolean;
    };
    isVerified: boolean;
  };
  analyzedAt: string;
}

export interface TransactionAnalysis {
  transactionXDR: string;
  riskScore: number;
  riskLevel: RiskLevel;
  threats: Threat[];
  recommendations: string[];
  simulationResult?: {
    success: boolean;
    error?: string;
  };
  analyzedAt: string;
}
