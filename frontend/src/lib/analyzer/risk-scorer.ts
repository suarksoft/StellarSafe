import { ThreatSeverity, RiskLevel, Threat } from './types';

/**
 * Risk scoring weights
 */
export const RISK_WEIGHTS = {
  LOW: 10,
  MEDIUM: 20,
  HIGH: 35,
  CRITICAL: 50,
};

/**
 * Calculate total risk score from threats
 */
export function calculateRiskScore(threats: Array<{ severity: ThreatSeverity }>): number {
  let score = 0;

  for (const threat of threats) {
    score += RISK_WEIGHTS[threat.severity];
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Determine risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'SAFE';
}

/**
 * Generate recommendations based on threats
 */
export function generateRecommendations(threats: Threat[]): string[] {
  const recommendations: string[] = [];

  const threatTypes = threats.map(t => t.type);

  if (threatTypes.includes('FREEZABLE_ASSET')) {
    recommendations.push('Consider removing this trustline if you already have it');
    recommendations.push('Look for alternative assets without AUTH_REVOCABLE flag');
  }

  if (threatTypes.includes('NAME_IMPERSONATION')) {
    recommendations.push('Verify the issuer address matches the official source');
    recommendations.push('Use the verified asset from trusted issuers');
  }

  if (threatTypes.includes('UNVERIFIED_ISSUER')) {
    recommendations.push('Wait for issuer to establish a verified home domain');
    recommendations.push('Research the project before trusting assets');
  }

  if (threatTypes.includes('NEW_ISSUER')) {
    recommendations.push('Exercise caution with newly created accounts');
    recommendations.push('Wait for the issuer to build a track record');
  }

  if (threatTypes.includes('BLACKLISTED')) {
    recommendations.push('DO NOT PROCEED - This address is known for scams');
    recommendations.push('Report this to the community if you encountered it');
  }

  if (threatTypes.includes('AUTHORIZATION_REQUIRED')) {
    recommendations.push('You need issuer approval to hold this asset');
    recommendations.push('Contact the issuer for authorization');
  }

  if (threatTypes.includes('CLAWBACK_ENABLED')) {
    recommendations.push('Be aware that tokens can be reclaimed by the issuer');
    recommendations.push('Only use if you trust the issuer completely');
  }

  if (recommendations.length === 0) {
    recommendations.push('This asset appears safe to use');
    recommendations.push('Always verify issuer details before trusting large amounts');
  }

  return recommendations;
}

/**
 * Get color for risk level
 */
export function getRiskColor(level: RiskLevel): string {
  const colors = {
    SAFE: 'green',
    LOW: 'blue',
    MEDIUM: 'yellow',
    HIGH: 'orange',
    CRITICAL: 'red',
  };
  return colors[level];
}
