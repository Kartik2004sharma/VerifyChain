'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Eye, Calendar, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  manufacturer: string;
  manufacturerAddress: `0x${string}`;
  timestamp: number;
  isActive: boolean;
  metadataURI?: string;
  verificationCount?: number;
  onVerify?: () => void;
}

export function ProductCard({
  id,
  name,
  description,
  manufacturer,
  manufacturerAddress,
  timestamp,
  isActive,
  metadataURI,
  verificationCount = 0,
  onVerify
}: ProductCardProps) {
  const formattedDate = new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className={`border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 ${!isActive ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Product ID: #{id}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={isActive 
              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
              : "border-red-500/50 text-red-400 bg-red-500/10"
            }
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <div>
              <p className="text-xs text-muted-foreground/60">Manufacturer</p>
              <p className="font-medium text-white/80">{manufacturer}</p>
              <p className="text-xs font-mono text-emerald-400/60">
                {shortenAddress(manufacturerAddress)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <div>
              <p className="text-xs text-muted-foreground/60">Registered</p>
              <p className="font-medium text-white/80">{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10">
          <div className="text-sm">
            <span className="text-muted-foreground">Verifications: </span>
            <span className="font-semibold text-emerald-400">{verificationCount}</span>
          </div>
          <div className="flex gap-2">
            {metadataURI && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                asChild
              >
                <a href={metadataURI} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Metadata
                </a>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              onClick={onVerify}
            >
              <Eye className="w-4 h-4 mr-1" />
              Verify
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
