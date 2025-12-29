'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VerificationStatus = 'verified' | 'counterfeit' | 'pending' | 'disputed';

export interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  confidenceScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showConfidence?: boolean;
}

const statusConfig = {
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    className: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
    iconColor: 'text-emerald-400'
  },
  counterfeit: {
    label: 'Counterfeit',
    icon: XCircle,
    className: 'border-red-500/50 text-red-400 bg-red-500/10',
    iconColor: 'text-red-400'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10',
    iconColor: 'text-yellow-400'
  },
  disputed: {
    label: 'Disputed',
    icon: AlertTriangle,
    className: 'border-orange-500/50 text-orange-400 bg-orange-500/10',
    iconColor: 'text-orange-400'
  }
};

export function VerificationStatusBadge({
  status,
  confidenceScore,
  size = 'md',
  showIcon = true,
  showConfidence = false
}: VerificationStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        sizeClasses[size],
        'font-semibold flex items-center gap-1.5'
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], config.iconColor)} />}
      <span>{config.label}</span>
      {showConfidence && confidenceScore !== undefined && (
        <span className="ml-1 text-xs opacity-80">
          ({confidenceScore}%)
        </span>
      )}
    </Badge>
  );
}

export interface ConfidenceScoreIndicatorProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceScoreIndicator({
  score,
  showLabel = true,
  size = 'md'
}: ConfidenceScoreIndicatorProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('text-muted-foreground', textSizes[size])}>
            Confidence Score
          </span>
          <span className={cn('font-semibold', getTextColor(score), textSizes[size])}>
            {score}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-white/5 rounded-full overflow-hidden', heights[size])}>
        <div 
          className={cn('h-full transition-all duration-500 rounded-full', getColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
