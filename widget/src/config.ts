import { PartnerConfig, NetworkConfig, StellarNetwork } from './types';

export const networkConfigs: Record<StellarNetwork, NetworkConfig> = {
  testnet: {
    name: 'Testnet',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    tomlDomain: 'testnet.stellar.org'
  },
  mainnet: {
    name: 'Mainnet',
    horizonUrl: 'https://horizon.stellar.org', 
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    tomlDomain: 'stellar.org'
  }
};

export const apiEndpoints = {
  testnet: {
    analyze: 'https://api-testnet.stellarsafe.io/v1/analyze',
    demo: true
  },
  mainnet: {
    analyze: 'https://api.stellarsafe.io/v1/analyze', 
    demo: false
  }
};

export const partnerConfigs: Record<string, PartnerConfig> = {
  lobstr: {
    id: 'lobstr',
    name: 'Lobstr Security Shield',
    logo: 'https://lobstr.co/assets/logo-security.png',
    colors: {
      primary: '#1A73E8',
      danger: '#E53E3E', 
      success: '#38A169',
      warning: '#F56500'
    },
    messages: {
      checking: 'Lobstr is verifying address security...',
      safe: '✅ Address verified by Lobstr Security',
      warning: '⚠️ Lobstr detected potential risks with this address',
      danger: '🚫 Lobstr Security: High risk address detected',
      error: 'Lobstr Security verification temporarily unavailable'
    },
    position: 'center',
    animation: true
  },

  freighter: {
    id: 'freighter',
    name: 'Freighter Security Check',
    logo: 'https://freighter.app/icon-security.png', 
    colors: {
      primary: '#5B21B6',
      danger: '#DC2626',
      success: '#059669',
      warning: '#D97706'
    },
    messages: {
      checking: 'Freighter is checking address safety...',
      safe: '✅ Freighter verified this address as safe',
      warning: '⚠️ Freighter found potential issues with this address', 
      danger: '🛡️ Freighter Security: This address may be unsafe',
      error: 'Freighter security check failed'
    },
    position: 'top',
    animation: true
  },

  xbull: {
    id: 'xbull',
    name: 'xBull Security',
    logo: 'https://xbull.app/security-badge.png',
    colors: {
      primary: '#0F172A',
      danger: '#EF4444', 
      success: '#10B981',
      warning: '#F59E0B'
    },
    messages: {
      checking: 'xBull Security analyzing address...',
      safe: '🛡️ xBull Security: Address verified',
      warning: '⚠️ xBull Security: Proceed with caution',
      danger: '🚨 xBull Security: High risk address',
      error: 'xBull Security check unavailable'
    },
    position: 'center',
    animation: false
  },

  // Default fallback config
  default: {
    id: 'default',
    name: 'StellarSafe Security',
    colors: {
      primary: '#3B82F6',
      danger: '#EF4444',
      success: '#10B981', 
      warning: '#F59E0B'
    },
    messages: {
      checking: 'Checking address security...',
      safe: '✅ Address verified as safe',
      warning: '⚠️ Potential risks detected',
      danger: '🚫 High risk address detected',
      error: 'Security check failed'
    },
    position: 'center',
    animation: true
  }
};