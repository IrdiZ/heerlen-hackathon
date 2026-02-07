'use client';

import { useState, useMemo } from 'react';

interface DataFreshnessIndicatorProps {
  lastVerified: string; // ISO date
  sourceName?: string;
  compact?: boolean; // For inline use
  showBanner?: boolean; // Show warning banner for stale data
}

type FreshnessLevel = 'fresh' | 'recent' | 'aging' | 'stale';

interface FreshnessConfig {
  level: FreshnessLevel;
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
  icon: string;
  animate: boolean;
}

function getFreshnessConfig(daysSince: number): FreshnessConfig {
  if (daysSince < 30) {
    return {
      level: 'fresh',
      label: 'Fresh',
      description: 'Verified within the last month',
      bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/50',
      glowClass: 'shadow-emerald-500/30',
      icon: '✓',
      animate: false,
    };
  } else if (daysSince < 90) {
    return {
      level: 'recent',
      label: 'Recent',
      description: 'Verified 1-3 months ago',
      bgClass: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      textClass: 'text-yellow-400',
      borderClass: 'border-yellow-500/50',
      glowClass: 'shadow-yellow-500/30',
      icon: '◐',
      animate: false,
    };
  } else if (daysSince < 180) {
    return {
      level: 'aging',
      label: 'Aging',
      description: 'Verified 3-6 months ago',
      bgClass: 'bg-gradient-to-r from-orange-500 to-red-400',
      textClass: 'text-orange-400',
      borderClass: 'border-orange-500/50',
      glowClass: 'shadow-orange-500/30',
      icon: '◔',
      animate: false,
    };
  } else {
    return {
      level: 'stale',
      label: 'May be Outdated',
      description: 'Verified over 6 months ago',
      bgClass: 'bg-gradient-to-r from-red-600 to-rose-600',
      textClass: 'text-red-400',
      borderClass: 'border-red-500/50',
      glowClass: 'shadow-red-500/50',
      icon: '⚠',
      animate: true,
    };
  }
}

export function DataFreshnessIndicator({
  lastVerified,
  sourceName,
  compact = false,
  showBanner = true,
}: DataFreshnessIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { config, daysSince, formattedDate } = useMemo(() => {
    const verifiedDate = new Date(lastVerified);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - verifiedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      config: getFreshnessConfig(diffDays),
      daysSince: diffDays,
      formattedDate: verifiedDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }, [lastVerified]);

  const relativeTime = useMemo(() => {
    if (daysSince === 0) return 'Today';
    if (daysSince === 1) return 'Yesterday';
    if (daysSince < 7) return `${daysSince} days ago`;
    if (daysSince < 30) return `${Math.floor(daysSince / 7)} weeks ago`;
    if (daysSince < 365) return `${Math.floor(daysSince / 30)} months ago`;
    return `${Math.floor(daysSince / 365)} years ago`;
  }, [daysSince]);

  return (
    <>
      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes pulse-warning {
          0%, 100% { 
            opacity: 1; 
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% { 
            opacity: 0.85; 
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
          }
          50% { 
            box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
          }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .pulse-badge {
          animation: pulse-warning 2s ease-in-out infinite;
        }
        .shake-icon {
          animation: shake 0.5s ease-in-out;
        }
        .glow-text {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .tooltip-arrow::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 6px 6px 6px;
          border-style: solid;
          border-color: transparent transparent rgb(30 41 59) transparent;
        }
      `}</style>

      <div className="inline-flex flex-col gap-2">
        {/* Badge */}
        <div 
          className="relative inline-flex items-center"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white
              cursor-help transition-all duration-300 hover:scale-105
              ${config.bgClass}
              ${config.animate ? 'pulse-badge gradient-animate' : ''}
              ${compact ? 'px-2 py-0.5' : ''}
            `}
          >
            <span className={`${config.animate ? 'shake-icon' : ''}`}>
              {config.icon}
            </span>
            {!compact && (
              <span>{config.label}</span>
            )}
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div 
              className="tooltip-arrow absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 min-w-[200px]"
            >
              <div className="bg-slate-800 text-white rounded-lg p-3 shadow-xl border border-slate-700">
                <div className="text-sm font-semibold mb-1">
                  {sourceName ? `${sourceName}` : 'Data Source'}
                </div>
                <div className="text-xs text-slate-300 mb-2">
                  {config.description}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Last verified:</span>
                  <span className={`font-medium ${config.textClass}`}>
                    {formattedDate}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ({relativeTime})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stale Warning Banner */}
        {showBanner && config.level === 'stale' && (
          <div className="relative overflow-hidden rounded-lg border-2 border-red-500/50">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950 gradient-animate opacity-90" />
            
            {/* Content */}
            <div className="relative p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-lg glow-text text-red-400">⚠️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-red-300 mb-1">
                    This information may be outdated
                  </h4>
                  <p className="text-xs text-red-200/80 mb-2">
                    Last verified on {formattedDate} ({relativeTime}). 
                    Immigration rules can change frequently.
                  </p>
                  <a
                    href={`mailto:feedback@heerlen-expat.nl?subject=Outdated%20Info%20Report${sourceName ? `:%20${encodeURIComponent(sourceName)}` : ''}&body=I%20found%20potentially%20outdated%20information%20on%20the%20Heerlen%20Expat%20Guide.%0A%0APage/Section:%20${sourceName || 'Unknown'}%0ADate%20Reported:%20${new Date().toISOString().split('T')[0]}%0A%0AWhat%20seems%20incorrect:%0A%0A`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600/80 hover:bg-red-500 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Report outdated info
                  </a>
                </div>
              </div>
            </div>

            {/* Pulsing border effect */}
            <div className="absolute inset-0 rounded-lg border-2 border-red-400 opacity-30 pulse-badge pointer-events-none" />
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Compact inline version for use in cards/lists
 */
export function DataFreshnessBadge({
  lastVerified,
  sourceName,
}: {
  lastVerified: string;
  sourceName?: string;
}) {
  return (
    <DataFreshnessIndicator
      lastVerified={lastVerified}
      sourceName={sourceName}
      compact
      showBanner={false}
    />
  );
}

/**
 * Full-width warning banner for page headers
 */
export function DataStalenessWarning({
  lastVerified,
  sourceName,
}: {
  lastVerified: string;
  sourceName?: string;
}) {
  const verifiedDate = new Date(lastVerified);
  const now = new Date();
  const daysSince = Math.ceil(
    Math.abs(now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Only show if data is stale (> 6 months)
  if (daysSince < 180) return null;

  return (
    <DataFreshnessIndicator
      lastVerified={lastVerified}
      sourceName={sourceName}
      showBanner
    />
  );
}

export default DataFreshnessIndicator;
