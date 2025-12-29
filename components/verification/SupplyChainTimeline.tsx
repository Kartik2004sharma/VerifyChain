'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle,
  User,
  Calendar,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Transfer {
  transferId: number;
  productId: number;
  from: string;
  to: string;
  timestamp: number;
  location: string;
  isAnomaly: boolean;
}

export interface SupplyChainTimelineProps {
  transfers: Transfer[];
  productName?: string;
}

export function SupplyChainTimeline({ transfers, productName }: SupplyChainTimelineProps) {
  const shortenAddress = (address: string) => {
    if (address === '0x0000000000000000000000000000000000000000') return 'Genesis';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (transfers.length === 0) {
    return (
      <Card className="border-emerald-500/20">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No supply chain transfers recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Supply Chain History
          {productName && <span className="text-sm text-muted-foreground ml-2">• {productName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-500/20" />

          {/* Transfer events */}
          <div className="space-y-6">
            {transfers.map((transfer, index) => (
              <div key={transfer.transferId} className="relative pl-14">
                {/* Timeline dot */}
                <div 
                  className={cn(
                    "absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    transfer.isAnomaly 
                      ? "bg-red-500/20 border-red-500" 
                      : "bg-emerald-500/20 border-emerald-500"
                  )}
                >
                  {transfer.isAnomaly ? (
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  )}
                </div>

                {/* Transfer card */}
                <div 
                  className={cn(
                    "rounded-lg border p-4 transition-all duration-200",
                    transfer.isAnomaly 
                      ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50" 
                      : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Transfer #{transfer.transferId}</span>
                        {transfer.isAnomaly && (
                          <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 text-xs">
                            Anomaly Detected
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-white/80">{formatDate(transfer.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer flow */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 p-3 rounded-md bg-background/50 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">From</span>
                      </div>
                      <p className="text-sm font-mono text-emerald-400">{shortenAddress(transfer.from)}</p>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    
                    <div className="flex-1 p-3 rounded-md bg-background/50 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">To</span>
                      </div>
                      <p className="text-sm font-mono text-emerald-400">{shortenAddress(transfer.to)}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-white/80">{transfer.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-emerald-500/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400">{transfers.length}</p>
              <p className="text-xs text-muted-foreground">Total Transfers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">
                {transfers.filter(t => !t.isAnomaly).length}
              </p>
              <p className="text-xs text-muted-foreground">Normal</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {transfers.filter(t => t.isAnomaly).length}
              </p>
              <p className="text-xs text-muted-foreground">Anomalies</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
