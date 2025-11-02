export interface PartnerConfig {
  id: string;
  name: string;
  logo?: string;
  colors: {
    primary: string;
    danger: string;
    success: string;
    warning: string;
  };
  messages: {
    checking: string;
    safe: string;
    warning: string;
    danger: string;
    error: string;
  };
  position?: 'center' | 'top' | 'bottom';
  animation?: boolean;
}

export interface RiskAnalysisResult {
  success: boolean;
  address: string;
  riskLevel: 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';
  riskScore: number;
  trustScore: number;
  message: string;
  factors: {
    stellarExpert?: {
      verified: boolean;
      organization?: string;
      trustScore: number;
    };
    tomlVerification?: {
      verified: boolean;
      domain?: string;
      organization?: string;
    };
    onChainAnalysis?: {
      accountAge: string;
      transactionVolume: 'LOW' | 'MEDIUM' | 'HIGH';
      suspiciousActivity: boolean;
    };
  };
  recommendation: {
    action: 'ALLOW' | 'WARN' | 'BLOCK';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export type StellarNetwork = 'testnet' | 'mainnet';

export interface NetworkConfig {
  name: string;
  horizonUrl: string;
  networkPassphrase: string;
  tomlDomain: string;
}

export interface WidgetInitOptions {
  partnerId?: string;
  network?: StellarNetwork;
  customConfig?: Partial<PartnerConfig>;
  apiHost?: string;
  authToken?: string;
  failMode?: 'open' | 'closed';
}

export interface WidgetOptions {
  address: string;
  onResult?: (result: RiskAnalysisResult) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}