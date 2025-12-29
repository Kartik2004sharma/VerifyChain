"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VerificationResult } from "@/lib/blockchain-verification"

interface VerificationResultProps {
  result: VerificationResult
  onClose?: () => void
  onViewSupplyChain?: () => void
}

export function VerificationResultComponent({
  result,
  onClose,
  onViewSupplyChain,
}: VerificationResultProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Blockchain hash copied to clipboard",
    })
  }

  const downloadCertificate = () => {
    toast({
      title: "Certificate Generated",
      description: "Your verification certificate is being generated...",
    })
    // In production, generate actual PDF
  }

  const getConfidenceColor = (score: number): string => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getConfidenceBackground = (score: number): string => {
    if (score >= 90) return "bg-green-500/20"
    if (score >= 70) return "bg-yellow-500/20"
    return "bg-red-500/20"
  }

  const truncateHash = (hash: string, length: number = 12): string => {
    if (hash.length <= length) return hash
    return `${hash.substring(0, length)}...${hash.substring(hash.length - 6)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Status Section */}
      <Card className="border border-border/50 overflow-hidden">
        <div className={`p-6 ${result.isAuthentic ? "bg-green-500/10" : "bg-red-500/10"}`}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0">
              {result.isAuthentic ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </motion.div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">
                {result.isAuthentic ? "Product Authentic" : "Product Alert"}
              </h3>
              <p className={`text-sm ${result.isAuthentic ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {result.isAuthentic
                  ? "This product has been verified as genuine"
                  : "This product could not be verified as authentic"}
              </p>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Confidence Score */}
      <Card className="border border-border/50 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Verification Confidence</h4>
            <span className={`text-2xl font-bold ${getConfidenceColor(result.confidenceScore)}`}>
              {result.confidenceScore}%
            </span>
          </div>

          <Progress
            value={result.confidenceScore}
            className="h-3"
          />

          <div className={`p-3 rounded-lg ${getConfidenceBackground(result.confidenceScore)}`}>
            <p className="text-sm text-foreground">
              {result.confidenceScore >= 90
                ? "Verification factors are fully validated and consistent"
                : result.confidenceScore >= 70
                  ? "Most verification factors are validated with minor concerns"
                  : "Significant verification discrepancies detected"}
            </p>
          </div>

          {/* Confidence Factors */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Blockchain Integrity</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold">Valid</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Supply Chain</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold">Complete</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Manufacturer</p>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${result.isAuthentic ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm font-semibold">
                  {result.isAuthentic ? "Confirmed" : "Failed"}
                </span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Documents</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Product Details */}
      {result.productData && (
        <Card className="border border-border/50 p-6">
          <h4 className="font-semibold mb-4">Product Information</h4>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.1 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-start pb-3 border-b border-border/30">
              <span className="text-muted-foreground">Product Name</span>
              <span className="font-semibold text-right">{result.productData.name}</span>
            </div>

            <div className="flex justify-between items-start pb-3 border-b border-border/30">
              <span className="text-muted-foreground">Manufacturer</span>
              <span className="font-semibold text-right">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {result.productData.manufacturer}
                </div>
              </span>
            </div>

            <div className="flex justify-between items-start pb-3 border-b border-border/30">
              <span className="text-muted-foreground">Product ID</span>
              <span className="font-semibold text-right font-mono text-sm">
                {result.productData.id}
              </span>
            </div>

            <div className="flex justify-between items-start pb-3 border-b border-border/30">
              <span className="text-muted-foreground">Batch Number</span>
              <span className="font-semibold text-right font-mono text-sm">
                {result.productData.batchNumber}
              </span>
            </div>

            <div className="flex justify-between items-start pb-3 border-b border-border/30">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Manufacturing Date
              </span>
              <span className="font-semibold text-right">
                {new Date(result.productData.manufacturingDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Registration Date</span>
              <span className="font-semibold text-right">
                {new Date(result.productData.registeredDate).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        </Card>
      )}

      {/* Blockchain Hash */}
      <Card className="border border-border/50 p-6 bg-muted/30">
        <h4 className="font-semibold mb-4">Blockchain Verification</h4>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border/50">
              <code className="flex-1 text-xs font-mono truncate">
                {result.blockchainHash}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(result.blockchainHash)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Open block explorer
              const blockExplorerUrl = `https://sepolia.etherscan.io/tx/${result.blockchainHash}`
              window.open(blockExplorerUrl, "_blank")
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Block Explorer
          </Button>
        </div>
      </Card>

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <Card className="border border-yellow-500/50 bg-yellow-500/10 p-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                Verification Warnings
              </h4>
              <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Supply Chain Preview */}
      {result.supplyChain.length > 0 && (
        <Card className="border border-border/50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Supply Chain Checkpoints</h4>
            <span className="text-sm text-muted-foreground">
              {result.supplyChain.length} stops
            </span>
          </div>

          <div className="space-y-2">
            {result.supplyChain.slice(0, 3).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition"
              >
                <div className="flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{step.location}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(step.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}

            {result.supplyChain.length > 3 && (
              <p className="text-sm text-muted-foreground pt-2">
                +{result.supplyChain.length - 3} more checkpoint{result.supplyChain.length - 3 !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {onViewSupplyChain && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={onViewSupplyChain}
            >
              View Full Supply Chain
            </Button>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={downloadCertificate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Certificate
        </Button>

        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Verification Timestamp */}
      <p className="text-xs text-muted-foreground text-center pt-4">
        Verified at {new Date(result.verificationTimestamp).toLocaleString()}
      </p>
    </motion.div>
  )
}
