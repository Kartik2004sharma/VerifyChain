'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, AlertCircle, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAccount } from 'wagmi';
import { useVerificationRegistry } from '@/hooks/blockchain/useVerificationRegistry';
import { useToast } from '@/components/ui/use-toast';

interface VerificationRecord {
  timestamp: number;
  verifier: string;
  result: boolean;
  confidenceScore: number;
  location: string;
  proofHash: string;
}

export default function VerificationHistoryPage() {
  const { toast } = useToast();
  const [searchProductId, setSearchProductId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredVerifications, setFilteredVerifications] = useState<VerificationRecord[]>([]);

  const { isConnected } = useAccount();
  const { useGetVerificationHistory, useGetVerificationCount, useGetProductStats } = useVerificationRegistry();
  
  // Get verification data from blockchain
  const { data: verificationHistory, isLoading } = useGetVerificationHistory(selectedProductId);
  const { data: verificationCount } = useGetVerificationCount(selectedProductId);
  const { data: productStats } = useGetProductStats(selectedProductId);

  // Convert blockchain data to display format
  useEffect(() => {
    if (verificationHistory && Array.isArray(verificationHistory)) {
      // verificationHistory is an array of verification records from the contract
      const records: VerificationRecord[] = verificationHistory.map((record: any, index: number) => ({
        timestamp: Number(record.timestamp || record[0]),
        verifier: record.verifier || record[1],
        result: record.result !== undefined ? record.result : record[2],
        confidenceScore: Number(record.confidenceScore || record[3]),
        location: record.location || record[4] || 'Unknown',
        proofHash: record.proofHash || record[5] || '0x0000000000000000000000000000000000000000000000000000000000000000',
      }));
      setFilteredVerifications(records);
    } else {
      setFilteredVerifications([]);
    }
  }, [verificationHistory]);

  // Apply filters
  useEffect(() => {
    if (!verificationHistory || !Array.isArray(verificationHistory)) {
      setFilteredVerifications([]);
      return;
    }

    let filtered = verificationHistory.map((record: any, index: number) => ({
      timestamp: Number(record.timestamp || record[0]),
      verifier: record.verifier || record[1],
      result: record.result !== undefined ? record.result : record[2],
      confidenceScore: Number(record.confidenceScore || record[3]),
      location: record.location || record[4] || 'Unknown',
      proofHash: record.proofHash || record[5] || '0x0000000000000000000000000000000000000000000000000000000000000000',
    }));

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'genuine') {
        filtered = filtered.filter((v: VerificationRecord) => v.result);
      } else if (statusFilter === 'counterfeit') {
        filtered = filtered.filter((v: VerificationRecord) => !v.result);
      }
    }

    setFilteredVerifications(filtered);
  }, [verificationHistory, statusFilter]);

  const handleSearch = () => {
    if (!searchProductId.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid product ID',
        variant: 'destructive',
      });
      return;
    }
    setSelectedProductId(searchProductId.trim());
  };

  const handleClearSearch = () => {
    setSearchProductId('');
    setSelectedProductId('');
    setFilteredVerifications([]);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const exportToCSV = () => {
    if (filteredVerifications.length === 0) {
      toast({
        title: 'No Data',
        description: 'No verifications to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Timestamp', 'Verifier', 'Status', 'Confidence', 'Location', 'Proof Hash'];
    const rows = filteredVerifications.map(v => [
      formatTimestamp(v.timestamp),
      v.verifier,
      v.result ? 'Genuine' : 'Counterfeit',
      v.confidenceScore,
      v.location,
      v.proofHash,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifications-${selectedProductId}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: 'Success',
      description: 'Exported to CSV',
    });
  };

  const stats = {
    total: filteredVerifications.length,
    genuine: filteredVerifications.filter(v => v.result).length,
    counterfeit: filteredVerifications.filter(v => !v.result).length,
    avgConfidence: filteredVerifications.length > 0
      ? Math.round(filteredVerifications.reduce((acc, v) => acc + v.confidenceScore, 0) / filteredVerifications.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Verification History</h1>
          <p className="text-muted-foreground">
            View all product verification records from the blockchain
          </p>
          <div className="mt-4 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-sm text-emerald-400">
              💡 <strong>Tip:</strong> Enter your Product ID (e.g., PROD-20251113-001) to view all verification attempts for that product.
            </p>
          </div>
        </div>

        {/* Wallet Warning */}
        {!isConnected && (
          <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-950/20 to-transparent mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Wallet Not Connected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your wallet to view verification history from the blockchain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="border-emerald-500/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              Search Verifications
            </CardTitle>
            <CardDescription>
              Enter a product ID to view its verification history (e.g., PROD-20251113-001)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter Product ID (e.g., PROD-20251113-001)"
                  value={searchProductId}
                  onChange={(e) => setSearchProductId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-emerald-500/20 focus:border-emerald-500/50"
                />
                <Button
                  onClick={handleSearch}
                  disabled={!isConnected || !searchProductId}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                {selectedProductId && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    className="border-emerald-500/50"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-emerald-500/20">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="genuine">Genuine Only</SelectItem>
                  <SelectItem value="counterfeit">Counterfeit Only</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={exportToCSV}
                disabled={filteredVerifications.length === 0}
                variant="outline"
                className="ml-auto border-emerald-500/50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {selectedProductId && filteredVerifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Verifications</p>
                    <p className="text-2xl font-bold text-emerald-400">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Genuine</p>
                    <p className="text-2xl font-bold text-emerald-400">{stats.genuine}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Counterfeit</p>
                    <p className="text-2xl font-bold text-red-400">{stats.counterfeit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    <p className="text-2xl font-bold text-emerald-400">{stats.avgConfidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Records */}
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Search Verification Records
              {selectedProductId && (
                <Badge variant="outline" className="ml-2 border-emerald-500/50 text-emerald-400">
                  {selectedProductId}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {filteredVerifications.length > 0 
                ? `Showing ${filteredVerifications.length} verification${filteredVerifications.length !== 1 ? 's' : ''}`
                : 'No verifications to display'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-4" />
                <p className="text-muted-foreground">Loading verifications...</p>
              </div>
            ) : !selectedProductId ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Product Selected</h3>
                <p className="text-muted-foreground">
                  Enter a product ID above to view its verification history
                </p>
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Verifications Found</h3>
                <p className="text-muted-foreground">
                  Product "{selectedProductId}" has no verification records yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVerifications.map((verification, index) => (
                  <motion.div
                    key={`${selectedProductId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`${
                            verification.result
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                              : 'border-red-500/50 bg-red-500/10 text-red-400'
                          }`}
                        >
                          {verification.result ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Genuine
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Counterfeit
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                          {verification.confidenceScore}% Confidence
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Verification #{index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(verification.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Product ID: </span>
                        <span className="font-mono text-emerald-400">{selectedProductId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Verifier: </span>
                        <span className="font-mono text-emerald-400">{shortenAddress(verification.verifier)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location: </span>
                        <span className="text-white/80">{verification.location}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Proof Hash: </span>
                      <span className="font-mono text-emerald-400/70">{verification.proofHash}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
