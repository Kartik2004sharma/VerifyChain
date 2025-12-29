'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Calendar, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ManufacturerBadgeProps {
  name: string;
  address: `0x${string}`;
  isVerified: boolean;
  reputationScore?: number;
  registrationDate?: number;
  productCount?: number;
  variant?: 'compact' | 'detailed';
}

export function ManufacturerBadge({
  name,
  address,
  isVerified,
  reputationScore,
  registrationDate,
  productCount,
  variant = 'compact'
}: ManufacturerBadgeProps) {
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
        <Shield className={cn('w-4 h-4', isVerified ? 'text-emerald-400' : 'text-muted-foreground')} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/90">{name}</span>
            {isVerified && (
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            )}
          </div>
          <span className="text-xs font-mono text-emerald-400/60">{shortenAddress(address)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg border',
            isVerified 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-white/5 border-white/10'
          )}>
            <Shield className={cn('w-5 h-5', isVerified ? 'text-emerald-400' : 'text-muted-foreground')} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white/90">{name}</h3>
              {isVerified && (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-emerald-400/60 mt-1">{address}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        {reputationScore !== undefined && (
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Award className="w-3 h-3" />
              <span className="text-xs">Reputation</span>
            </div>
            <p className={cn('font-semibold', getReputationColor(reputationScore))}>
              {reputationScore}/100
            </p>
          </div>
        )}
        
        {productCount !== undefined && (
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Shield className="w-3 h-3" />
              <span className="text-xs">Products</span>
            </div>
            <p className="font-semibold text-white/90">{productCount}</p>
          </div>
        )}
        
        {registrationDate !== undefined && (
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Since</span>
            </div>
            <p className="font-semibold text-white/90 text-xs">{formatDate(registrationDate)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
