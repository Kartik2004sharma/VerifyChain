'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { useProductRegistry } from '@/hooks/blockchain/useProductRegistry'
import { useVerificationRegistry } from '@/hooks/blockchain/useVerificationRegistry'
import { verifyProduct } from '@/lib/blockchain-verification'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  QrCode, 
  Search, 
  CheckCircle, 
  XCircle,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { ConnectWallet } from '@/components/ConnectWallet'
import { getBlockExplorerUrl, contracts } from '@/lib/wagmi-config'
import { parseAbiItem } from 'viem'
import type { VerificationResult } from '@/lib/blockchain-verification'

interface RecentVerification {
  productId: string
  timestamp: number
  result: boolean
  verifier: string
  confidenceScore?: number
}

export default function VerifyProductPage() {
  const { address, isConnected, chainId } = useAccount()
  const publicClient = usePublicClient()
  const [productId, setProductId] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentVerification[]>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)

  const { useIsProductRegistered, useGetProduct } = useProductRegistry()
  const { recordVerification } = useVerificationRegistry()

  // Check if product exists
  const { data: isRegistered, isLoading: checkingRegistry } = useIsProductRegistered(productId)
  const { data: productData } = useGetProduct(productId)

  // Fetch recent verifications from blockchain
  useEffect(() => {
    async function fetchRecentVerifications() {
      if (!publicClient || !isConnected) return

      try {
        setIsLoadingActivity(true)

        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n

        const logs = await publicClient.getLogs({
          address: contracts.verificationRegistry.address,
          event: parseAbiItem('event VerificationRecorded(string indexed productId, address indexed verifier, bool result, uint8 confidenceScore, uint256 timestamp, uint256 blockNumber)'),
          fromBlock,
          toBlock: 'latest',
        })

        const verifications: RecentVerification[] = logs.map((log: any) => {
          const { args } = log
          return {
            productId: args.productId || '',
            timestamp: Number(args.timestamp) * 1000,
            result: args.result || false,
            verifier: args.verifier || '',
            confidenceScore: args.confidenceScore ? Number(args.confidenceScore) : undefined,
          }
        }).filter(v => v.productId)

        // Sort by timestamp descending and take latest 5
        const sorted = verifications.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
        
        setRecentActivity(sorted)
      } catch (err) {
        console.error('Error fetching recent verifications:', err)
      } finally {
        setIsLoadingActivity(false)
      }
    }

    fetchRecentVerifications()
  }, [publicClient, isConnected])

  const handleVerify = async () => {
    if (!productId.trim()) {
      setError('Please enter a product ID')
      return
    }

    if (!address) {
      setError('Please connect your wallet')
      return
    }

    try {
      setIsVerifying(true)
      setError(null)
      setVerificationResult(null)

      console.log('🔍 Starting verification for:', productId)

      // Verify product using blockchain
      const result = await verifyProduct(productId, address)
      
      setVerificationResult(result)

      // Record verification on blockchain
      // This will emit a VerificationRecorded event that the dashboard listens to
      if (result) {
        await recordVerification(
          productId,
          result.isAuthentic,
          result.confidenceScore,
          'Web Interface',
          {
            timestamp: Date.now(),
            method: 'manual_entry',
            verifier: address,
          }
        )
        
        console.log('✅ Verification recorded on blockchain - event will be broadcast')
        
        // Refresh recent activity after recording
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }

      console.log('✅ Verification complete:', result)
    } catch (err) {
      console.error('❌ Verification error:', err)
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleQRScan = () => {
    // TODO: Implement QR scanner
    alert('QR Scanner coming soon!')
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-400">
              Connect your wallet to verify products on the blockchain
            </p>
            <ConnectWallet />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Verify Product Authenticity</h1>
        <p className="text-gray-400">
          Verify products using blockchain technology
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Verification Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Product Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">
                    <Search className="w-4 h-4 mr-2" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="qr">
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product ID or Serial Number</label>
                    <Input
                      placeholder="e.g., VRF-2025-001234"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      disabled={isVerifying}
                      className="text-lg"
                    />
                    <p className="text-xs text-gray-400">
                      Enter the unique product identifier to verify its authenticity
                    </p>
                  </div>

                  {/* Registry Status */}
                  {productId && !checkingRegistry && (
                    <div className="p-3 rounded-lg border">
                      {isRegistered ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Product found in blockchain registry</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Product not found in blockchain registry</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleVerify} 
                    className="w-full" 
                    size="lg"
                    disabled={isVerifying || !productId.trim()}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying on Blockchain...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Now
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400 mb-4">Click to open QR scanner</p>
                    <Button onClick={handleQRScan} variant="outline">
                      Open Camera
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Verifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="text-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((verification, idx) => (
                    <div
                      key={`${verification.productId}-${verification.timestamp}`}
                      className="flex items-start justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                      onClick={() => setProductId(verification.productId)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {verification.result ? (
                            <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                          )}
                          <p className="text-xs font-mono truncate">
                            {verification.productId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>
                            {new Date(verification.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {verification.confidenceScore && (
                            <>
                              <span>•</span>
                              <span>{verification.confidenceScore}% confidence</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={verification.result ? 'default' : 'destructive'}
                        className="ml-2 flex-shrink-0"
                      >
                        {verification.result ? 'Verified' : 'Counterfeit'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 text-sm py-4">
                  No recent verifications
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Verification Result */}
        <div>
          {isVerifying && (
            <Card>
              <CardHeader>
                <CardTitle>Verifying on Blockchain...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Checking blockchain registry</span>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <Progress value={33} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Validating cryptographic hash</span>
                  </div>
                  <Progress value={0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Verifying supply chain</span>
                  </div>
                  <Progress value={0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Calculating confidence score</span>
                  </div>
                  <Progress value={0} />
                </div>
              </CardContent>
            </Card>
          )}

          {verificationResult && !isVerifying && (
            <Card className={
              verificationResult.isAuthentic 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-red-500/50 bg-red-500/5'
            }>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verificationResult.isAuthentic ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                      Product Verified ✓
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-500" />
                      Counterfeit Detected ⚠
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confidence Score */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className="text-lg font-bold">
                      {verificationResult.confidenceScore}%
                    </span>
                  </div>
                  <Progress 
                    value={verificationResult.confidenceScore} 
                    className={
                      verificationResult.confidenceScore >= 90 
                        ? 'bg-emerald-500' 
                        : verificationResult.confidenceScore >= 70 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }
                  />
                </div>

                {/* Product Details */}
                {verificationResult.productData && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Product Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Product ID</p>
                        <p className="font-mono">{verificationResult.productData.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Manufacturer</p>
                        <p className="truncate">{verificationResult.productData.manufacturer}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Category</p>
                        <p>{verificationResult.productData.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <Badge variant={verificationResult.isAuthentic ? 'default' : 'destructive'}>
                          {verificationResult.productData.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blockchain Proof */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Blockchain Proof</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Block Number</span>
                      <span className="font-mono">
                        #{verificationResult.blockchainProof.blockNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confirmations</span>
                      <span>{verificationResult.blockchainProof.confirmations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network</span>
                      <span className="uppercase">{verificationResult.blockchainProof.network}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Transaction</span>
                      <a 
                        href={getBlockExplorerUrl(
                          verificationResult.blockchainProof.transactionHash,
                          chainId
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Data Integrity */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Data Integrity Checks</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Blockchain Hash', valid: verificationResult.dataIntegrity.hashValid },
                      { label: 'Digital Signature', valid: verificationResult.dataIntegrity.signatureValid },
                      { label: 'Timestamp', valid: verificationResult.dataIntegrity.timestampValid },
                      { label: 'Supply Chain', valid: verificationResult.dataIntegrity.supplyChainComplete },
                      { label: 'Confirmations', valid: verificationResult.dataIntegrity.blockchainConfirmed },
                    ].map((check) => (
                      <div key={check.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{check.label}</span>
                        {check.valid ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {verificationResult.dataIntegrity.warnings.length > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-yellow-500">Warnings</p>
                        {verificationResult.dataIntegrity.warnings.map((warning, idx) => (
                          <p key={idx} className="text-xs text-yellow-500/80">
                            • {warning}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={verificationResult.blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Explorer
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Download Certificate
                  </Button>
                </div>

                <Button 
                  onClick={() => {
                    setVerificationResult(null)
                    setProductId('')
                  }} 
                  className="w-full"
                  variant="secondary"
                >
                  Verify Another Product
                </Button>
              </CardContent>
            </Card>
          )}

          {!verificationResult && !isVerifying && (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">
                  Enter a product ID to verify its authenticity on the blockchain
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
