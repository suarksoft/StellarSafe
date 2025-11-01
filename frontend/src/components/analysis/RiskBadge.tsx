import { RiskLevel } from '@/lib/analyzer/types';
import { getRiskColor } from '@/lib/analyzer/risk-scorer';

interface RiskBadgeProps {
  level: RiskLevel;
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export function RiskBadge({ level, score, size = 'md', showScore = true }: RiskBadgeProps) {
  const color = getRiskColor(level);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border-2 font-semibold
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
    >
      <div className="flex flex-col">
        <span className="uppercase tracking-wide">{level} RISK</span>
        {showScore && (
          <span className="text-xs opacity-75">Score: {score}/100</span>
        )}
      </div>
    </div>
  );
}
