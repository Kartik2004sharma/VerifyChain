'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Download,
  Share2,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Heart,
  Flag,
  Shield,
  MapPin,
  Calendar,
  User,
  Twitter,
  Linkedin,
  QrCode,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface VerificationResult {
  status: 'verified' | 'counterfeit' | 'suspicious' | 'inconclusive';
  productId: string;
  productName: string;
  manufacturer: string;
  category: string;
  manufacturingDate: string;
  batchNumber: string;
  serialNumber: string;
  registrationDate: string;
  productImage: string;
  blockchainHash: string;
  blockNumber: number;
  transactionId: string;
  verificationTimestamp: string;
  network: string;
  contractAddress: string;
  gasUsed: string;
  confirmations: number;
  confidenceScore: number;
  scoreBreakdown: {
    blockchainIntegrity: number;
    supplyChainCompleteness: number;
    manufacturerReputation: number;
    historicalPatternMatch: number;
    dataConsistency: number;
  };
  blockchainProofs: {
    validHash: boolean;
    confirmedBlocks: boolean;
    noDoubleSpending: boolean;
    contractVerified: boolean;
    hashMatch: boolean;
    timestampValid: boolean;
    signatureAuthentic: boolean;
  };
  checkpoints: Array<{
    step: number;
    location: string;
    date: string;
    handler: string;
    transactionHash: string;
    blockNumber: number;
    verified: boolean;
  }>;
  verificationHistory: Array<{
    date: string;
    location: string;
    verifier: string;
    result: 'verified' | 'counterfeit' | 'suspicious';
    transactionHash: string;
    blockNumber: number;
  }>;
  similarCounterfeits?: Array<{
    id: string;
    name: string;
    reportedCount: number;
    blockchainEvidence: string;
  }>;
}

interface VerificationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult;
}

const VerificationResultModal: React.FC<VerificationResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'confidence' | 'journey' | 'history'>(
    'details'
  );
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getStatusColor = () => {
    switch (result.status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          text: 'Product Verified ✓',
          banner: 'bg-emerald-500/10 border-emerald-500/20',
          bannerText: 'text-emerald-400',
        };
      case 'counterfeit':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          text: 'Counterfeit Detected ⚠',
          banner: 'bg-red-500/10 border-red-500/20',
          bannerText: 'text-red-400',
        };
      case 'suspicious':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          text: 'Verification Inconclusive',
          banner: 'bg-yellow-500/10 border-yellow-500/20',
          bannerText: 'text-yellow-400',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20',
          text: 'Verification Inconclusive',
          banner: 'bg-slate-500/10 border-slate-500/20',
          bannerText: 'text-slate-400',
        };
    }
  };

  const statusStyle = getStatusColor();
  const StatusIcon = statusStyle.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.blockchainHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCertificate = () => {
    // Mock PDF generation
    console.log('Downloading certificate for:', result.productId);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Verification: ${result.productId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl"
        >
          {/* Header with Status */}
          <div className={`${statusStyle.bgColor} border-b ${statusStyle.borderColor} p-8`}>
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                {result.status === 'verified' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <StatusIcon className={`w-16 h-16 ${statusStyle.color}`} />
                  </motion.div>
                ) : result.status === 'counterfeit' ? (
                  <motion.div
                    animate={{ x: [-10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <StatusIcon className={`w-16 h-16 ${statusStyle.color}`} />
                  </motion.div>
                ) : (
                  <StatusIcon className={`w-16 h-16 ${statusStyle.color}`} />
                )}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-3xl font-bold ${statusStyle.color}`}
              >
                {statusStyle.text}
              </motion.h1>
              {result.status === 'verified' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">
                    Blockchain Verified • {result.confirmations} Confirmations
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Alert Banner for Counterfeit */}
          {result.status === 'counterfeit' && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`${statusStyle.banner} border-b border-red-500/20 px-8 py-4`}
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-400 font-semibold">
                    Counterfeit Product Detected via Blockchain Analysis
                  </p>
                  <p className="text-xs text-red-400/80 mt-1">
                    Do not purchase. Report to manufacturer and authorities.
                  </p>
                </div>
              </div>
              {result.similarCounterfeits && result.similarCounterfeits.length > 0 && (
                <div className="bg-slate-900/50 p-3 rounded border border-red-500/10 mt-2">
                  <p className="text-xs text-red-400 font-semibold mb-2">Similar Counterfeits Found on Blockchain:</p>
                  {result.similarCounterfeits.map((item, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                      <span>{item.name} (ID: {item.id})</span>
                      <span className="text-red-400">{item.reportedCount} reports</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="border-b border-emerald-500/10 px-8 flex gap-1">
            {(['details', 'confidence', 'journey', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'details' && 'Product Details'}
                {tab === 'confidence' && 'Confidence Score'}
                {tab === 'journey' && 'Supply Chain'}
                {tab === 'history' && 'Verification History'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Tab 1: Product Details */}
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Product Image */}
                    <div className="md:col-span-1">
                      <div className="aspect-square bg-slate-800 rounded-lg border border-emerald-500/20 flex items-center justify-center text-4xl">
                        {result.productImage}
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="md:col-span-2 space-y-4">
                      <Card className="border-emerald-500/20">
                        <CardHeader>
                          <CardTitle className="text-lg">Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Product Name</p>
                              <p className="font-semibold text-emerald-400">{result.productName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Manufacturer</p>
                              <p className="font-semibold text-emerald-400">{result.manufacturer}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Category</p>
                              <p className="font-semibold text-emerald-400">{result.category}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Batch Number</p>
                              <p className="font-semibold text-emerald-400 font-mono text-sm">
                                {result.batchNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Serial Number</p>
                              <p className="font-semibold text-emerald-400 font-mono text-sm">
                                {result.serialNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Manufacturing Date</p>
                              <p className="font-semibold text-emerald-400">{result.manufacturingDate}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-emerald-500/10">
                            <p className="text-xs text-muted-foreground">Registration Date</p>
                            <p className="font-semibold text-emerald-400">{result.registrationDate}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Blockchain Proof */}
                      <Card className="border-emerald-500/20">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            Blockchain Proof
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
                            <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded border border-emerald-500/10">
                              <code className="text-xs text-emerald-400 flex-1 font-mono break-all">
                                {result.blockchainHash}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCopy}
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Block Number</p>
                              <p className="font-semibold text-emerald-400">
                                {result.blockNumber.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Network</p>
                              <p className="font-semibold text-emerald-400">{result.network}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Gas Used</p>
                              <p className="font-semibold text-emerald-400">{result.gasUsed}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Confirmations</p>
                              <p className="font-semibold text-emerald-400">{result.confirmations} blocks</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-emerald-500/10">
                            <p className="text-xs text-muted-foreground mb-2">Smart Contract Address</p>
                            <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded border border-emerald-500/10">
                              <code className="text-xs text-emerald-400 flex-1 font-mono break-all">
                                {result.contractAddress}
                              </code>
                              <a
                                href={`https://sepolia.etherscan.io/address/${result.contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">View on Block Explorer</p>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${result.transactionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded hover:border-emerald-500/50 transition-colors text-sm text-emerald-400"
                            >
                              Etherscan <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="pt-2 border-t border-emerald-500/10">
                            <p className="text-xs text-muted-foreground">Verification Timestamp</p>
                            <p className="font-semibold text-emerald-400">{result.verificationTimestamp}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Confidence Score */}
              {activeTab === 'confidence' && (
                <motion.div
                  key="confidence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Main Score Circle */}
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-slate-800"
                        />
                        {/* Progress circle */}
                        <motion.circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 90}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                          animate={{
                            strokeDashoffset: 2 * Math.PI * 90 * (1 - result.confidenceScore / 100),
                          }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          className={`${
                            result.confidenceScore >= 90
                              ? 'text-emerald-400'
                              : result.confidenceScore >= 70
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <p className={`text-4xl font-bold ${getScoreColor(result.confidenceScore)}`}>
                            {result.confidenceScore}%
                          </p>
                          <p className="text-xs text-muted-foreground text-center mt-1">Confidence Score</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-center mb-4">Score Breakdown</h3>
                    
                    {/* Blockchain Integrity */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Blockchain Integrity</span>
                          <p className="text-xs text-slate-400">Valid hash • Confirmed blocks • No double-spending</p>
                        </div>
                        <span className="font-semibold text-emerald-400">{result.scoreBreakdown.blockchainIntegrity}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.scoreBreakdown.blockchainIntegrity}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        />
                      </div>
                    </motion.div>

                    {/* Supply Chain Completeness */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Supply Chain Completeness</span>
                          <p className="text-xs text-slate-400">Checkpoints • Timestamps • Handler verification</p>
                        </div>
                        <span className="font-semibold text-emerald-400">{result.scoreBreakdown.supplyChainCompleteness}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.scoreBreakdown.supplyChainCompleteness}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        />
                      </div>
                    </motion.div>

                    {/* Manufacturer Reputation */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Manufacturer Reputation</span>
                          <p className="text-xs text-slate-400">Products registered • History • Blockchain age</p>
                        </div>
                        <span className="font-semibold text-emerald-400">{result.scoreBreakdown.manufacturerReputation}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.scoreBreakdown.manufacturerReputation}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        />
                      </div>
                    </motion.div>

                    {/* Historical Pattern Match */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Historical Pattern Match</span>
                          <p className="text-xs text-slate-400">Previous verifications • Data consistency • Time patterns</p>
                        </div>
                        <span className="font-semibold text-emerald-400">{result.scoreBreakdown.historicalPatternMatch}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.scoreBreakdown.historicalPatternMatch}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        />
                      </div>
                    </motion.div>

                    {/* Data Consistency */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Data Consistency</span>
                          <p className="text-xs text-slate-400">Metadata integrity • Signatures • Immutability proof</p>
                        </div>
                        <span className="font-semibold text-emerald-400">{result.scoreBreakdown.dataConsistency}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.scoreBreakdown.dataConsistency}%` }}
                          transition={{ duration: 1, delay: 0.9 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Blockchain Verification Details */}
                  <Card className={`border-emerald-500/20 ${getScoreBgColor(result.confidenceScore)}`}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Blockchain Verification Details
                      </CardTitle>
                      <CardDescription>Cryptographic proof from blockchain</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          {result.blockchainProofs.confirmedBlocks ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">Confirmations</p>
                            <p className="text-xs text-muted-foreground">{result.confirmations} blocks</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {result.blockchainProofs.contractVerified ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">Contract Verification</p>
                            <p className="text-xs text-muted-foreground">Verified on Etherscan</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {result.blockchainProofs.hashMatch ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">Hash Validation</p>
                            <p className="text-xs text-muted-foreground">Match confirmed</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {result.blockchainProofs.timestampValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">Timestamp Validation</p>
                            <p className="text-xs text-muted-foreground">Valid</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {result.blockchainProofs.signatureAuthentic ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">Digital Signature</p>
                            <p className="text-xs text-muted-foreground">Authentic</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {result.blockchainProofs.noDoubleSpending ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">Double-Spending</p>
                            <p className="text-xs text-muted-foreground">None detected</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tab 3: Supply Chain Journey */}
              {activeTab === 'journey' && (
                <motion.div
                  key="journey"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Card className="border-emerald-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        Supply Chain Journey with Blockchain Proof
                      </CardTitle>
                      <CardDescription>Each checkpoint verified on blockchain</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.checkpoints.map((checkpoint, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-emerald-500/10 rounded-lg p-3"
                          >
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === result.checkpoints.length - 1
                                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                                      : checkpoint.verified
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {checkpoint.step}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                      {checkpoint.location}
                                      {checkpoint.verified && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{checkpoint.date}</p>
                                    <p className="text-xs text-muted-foreground">{checkpoint.handler}</p>
                                  </div>
                                </div>
                                
                                {/* Blockchain Proof */}
                                <div className="mt-2 space-y-1 bg-slate-900/50 p-2 rounded border border-emerald-500/10">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Transaction:</span>
                                    <code className="text-xs text-emerald-400 font-mono">
                                      {checkpoint.transactionHash.slice(0, 10)}...
                                    </code>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Block:</span>
                                    <span className="text-xs text-emerald-400">
                                      {checkpoint.blockNumber.toLocaleString()}
                                    </span>
                                  </div>
                                  <a
                                    href={`https://sepolia.etherscan.io/tx/${checkpoint.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-1"
                                  >
                                    Verify on Blockchain <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.location.href = '/dashboard/supply-chain'}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      View Full Journey <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Verification History */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Card className="border-emerald-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Blockchain Verification History</CardTitle>
                      <CardDescription>
                        Total verifications: {result.verificationHistory.length} times • All recorded on blockchain
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.verificationHistory.map((entry, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-3 bg-slate-800/30 rounded border border-emerald-500/10"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {entry.date}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {entry.location}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                Verifier: {entry.verifier.slice(0, 6)}...{entry.verifier.slice(-4)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                entry.result === 'verified'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : entry.result === 'counterfeit'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }
                            >
                              {entry.result}
                            </Badge>
                          </div>
                          
                          {/* Blockchain Details */}
                          <div className="bg-slate-900/50 p-2 rounded border border-emerald-500/10 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Transaction:</span>
                              <a
                                href={`https://sepolia.etherscan.io/tx/${entry.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 font-mono"
                              >
                                {entry.transactionHash.slice(0, 10)}... <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Block Number:</span>
                              <span className="text-emerald-400">{entry.blockNumber.toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Trend Chart */}
                  <Card className="border-emerald-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Verification Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 flex items-end justify-around gap-2">
                        {[65, 72, 81, 88, 94, 92, 95].map((value, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ height: 0 }}
                            animate={{ height: `${value}%` }}
                            transition={{ delay: idx * 0.1 + 0.3 }}
                            className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                            title={`${value}%`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">Last 7 days</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* QR Code Section */}
          <div className="border-t border-emerald-500/10 px-8 py-4">
            <div className="flex items-center justify-center gap-4">
              <QrCode className="w-24 h-24 text-emerald-500/30" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Verification Proof</p>
                <p className="text-sm font-semibold text-emerald-400">{result.productId}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this QR code to verify authenticity
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-emerald-500/10 px-8 py-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Button
                onClick={handleDownloadCertificate}
                variant="outline"
                className="border-emerald-500/20 hover:bg-emerald-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-emerald-500/20 hover:bg-emerald-500/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${result.transactionId}`, '_blank')}
                variant="outline"
                className="border-emerald-500/20 hover:bg-emerald-500/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Etherscan
              </Button>
              {result.status === 'verified' && (
                <Button
                  onClick={() => setIsFavorite(!isFavorite)}
                  variant="outline"
                  className={`border-emerald-500/20 ${isFavorite ? 'bg-emerald-500/10' : 'hover:bg-emerald-500/10'}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-emerald-400' : ''}`} />
                  Favorite
                </Button>
              )}
              {result.status === 'counterfeit' && (
                <Button
                  variant="outline"
                  className="border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              )}
              <Button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 md:col-span-1 col-span-2"
              >
                Close
              </Button>
            </div>

            {/* Social Share */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-emerald-500/10">
              <p className="text-xs text-muted-foreground">Share:</p>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationResultModal;

// Zap icon import fix
const Zap = TrendingUp;
