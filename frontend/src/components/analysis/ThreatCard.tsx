'use client';

import { useState } from 'react';
import { Threat } from '@/lib/analyzer/types';

interface ThreatCardProps {
  threat: Threat;
}

export function ThreatCard({ threat }: ThreatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColors: Record<string, string> = {
    LOW: 'border-l-blue-500 bg-blue-50',
    MEDIUM: 'border-l-yellow-500 bg-yellow-50',
    HIGH: 'border-l-orange-500 bg-orange-50',
    CRITICAL: 'border-l-red-500 bg-red-50',
  };

  const severityBadge: Record<string, string> = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`border-l-4 rounded-2xl p-6 ${severityColors[threat.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="font-semibold text-neutral-950">{threat.message}</h4>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityBadge[threat.severity]}`}>
              {threat.severity}
            </span>
          </div>
          <p className="text-sm text-neutral-700 mb-2">
            <span className="font-semibold">Technical:</span> {threat.technical}
          </p>
        </div>
      </div>

      {threat.explanation && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-neutral-900 hover:text-neutral-700 font-semibold flex items-center gap-2 transition-colors"
          >
            Why is this risky?
            <span className="transform transition-transform" style={{ display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          </button>
          {isExpanded && (
            <div className="mt-3 p-4 bg-white rounded-xl ring-1 ring-neutral-950/10">
              <p className="text-sm text-neutral-700 leading-relaxed">{threat.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
