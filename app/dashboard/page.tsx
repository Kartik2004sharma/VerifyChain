'use client'

import { useAccount } from 'wagmi'
import { useProductRegistry } from '@/hooks/blockchain/useProductRegistry'
import { useVerificationRegistry } from '@/hooks/blockchain/useVerificationRegistry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  MapPin,
  User
} from 'lucide-react'
import Link from 'next/link'
import { ConnectWallet } from '@/components/ConnectWallet'
import { useEffect, useState } from 'react'
import { useWatchContractEvent, usePublicClient } from 'wagmi'
import { contracts } from '@/lib/wagmi-config'
import { parseAbiItem } from 'viem'

interface RecentVerification {
  productId: string
  timestamp: number
  result: boolean
  verifier: string
  confidenceScore?: number
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const [recentActivity, setRecentActivity] = useState<RecentVerification[]>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const publicClient = usePublicClient()
  
  const { useGetManufacturer, useGetManufacturerProductCount } = useProductRegistry()
  const { useGetGlobalStats } = useVerificationRegistry()

  // Fetch blockchain data
  const { data: manufacturerData } = useGetManufacturer(address as `0x${string}`)
  const { data: productCount } = useGetManufacturerProductCount(address as `0x${string}`)
  const { data: globalStats } = useGetGlobalStats()

  // Debug: Log blockchain data
  useEffect(() => {
    if (globalStats) {
      console.log('🔍 [Dashboard] Global Stats from Blockchain:', {
        totalVerifications: globalStats[0]?.toString(),
        totalAuthentic: globalStats[1]?.toString(),
        totalCounterfeit: globalStats[2]?.toString(),
        successRate: globalStats[3]?.toString(),
      })
    }
  }, [globalStats])

  // Fetch historical verification events from blockchain
  useEffect(() => {
    async function fetchRecentVerifications() {
      if (!publicClient || !isConnected) return

      try {
        setIsLoadingActivity(true)
        console.log('📜 [Dashboard] Fetching historical verification events...')

        // Get the current block number
        const currentBlock = await publicClient.getBlockNumber()
        console.log('📍 Current block:', currentBlock.toString())
        
        // Fetch events from last 10000 blocks (more history) or from genesis
        const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n
        console.log('📍 Fetching from block:', fromBlock.toString(), 'to', currentBlock.toString())

        const logs = await publicClient.getLogs({
          address: contracts.verificationRegistry.address,
          event: parseAbiItem('event VerificationRecorded(string indexed productId, address indexed verifier, bool result, uint8 confidenceScore, uint256 timestamp, uint256 blockNumber)'),
          fromBlock,
          toBlock: 'latest',
        })

        console.log('📡 [Dashboard] Found verification events:', logs.length)
        console.log('📡 [Dashboard] Raw logs:', logs)

        // Parse logs and convert to RecentVerification format
        const verifications: RecentVerification[] = logs.map((log: any) => {
          const { args } = log
          console.log('🔍 Parsing log args:', args)
          return {
            productId: args.productId || '',
            timestamp: Number(args.timestamp) * 1000, // Convert to milliseconds
            result: args.result || false,
            verifier: args.verifier || '',
            confidenceScore: args.confidenceScore ? Number(args.confidenceScore) : undefined,
          }
        }).filter(v => v.productId) // Filter out any invalid entries

        console.log('✨ Parsed verifications:', verifications)

        // Sort by timestamp descending and take latest 10
        const sorted = verifications.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
        
        setRecentActivity(sorted)
        console.log('✅ [Dashboard] Loaded recent verifications:', sorted.length)
        if (sorted.length > 0) {
          console.log('📊 First verification:', sorted[0])
        }
      } catch (error) {
        console.error('❌ [Dashboard] Error fetching verification events:', error)
      } finally {
        setIsLoadingActivity(false)
      }
    }

    fetchRecentVerifications()
  }, [publicClient, isConnected])

  // Listen to NEW blockchain verification events in real-time
  useWatchContractEvent({
    ...contracts.verificationRegistry,
    eventName: 'VerificationRecorded',
    onLogs(logs: any[]) {
      console.log('📡 [Dashboard] New verification event detected:', logs)
      
      // Parse the event and add to recent activity
      logs.forEach((log: any) => {
        const { args } = log
        if (args) {
          const newVerification: RecentVerification = {
            productId: args.productId || args[0],
            timestamp: Number(args.timestamp || args[1]) * 1000,
            result: args.result || args[2],
            verifier: args.verifier || args[3],
            confidenceScore: args.confidenceScore ? Number(args.confidenceScore) : undefined,
          }
          
          setRecentActivity(prev => {
            // Check if this verification already exists
            const exists = prev.some(v => 
              v.productId === newVerification.productId && 
              v.timestamp === newVerification.timestamp
            )
            if (!exists) {
              return [newVerification, ...prev].slice(0, 10) // Keep latest 10
            }
            return prev
          })
        }
      })
    },
  })

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <Shield className="w-20 h-20 mx-auto text-emerald-500" />
          <h1 className="text-4xl font-bold">VerifyChain</h1>
          <p className="text-gray-400">
            Blockchain-based Product Authentication System
          </p>
          <p className="text-sm text-gray-500">
            Connect your wallet to access the verification dashboard
          </p>
          <ConnectWallet />
        </div>
      </div>
    )
  }

  const isManufacturer = manufacturerData?.[1] // isRegistered
  const isActive = manufacturerData?.[2] // isActive

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Verification Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Blockchain-based counterfeit detection and product authentication
          </p>
        </div>
        <ConnectWallet />
      </div>

      {/* Blockchain Connection Status */}
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Blockchain Verification System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Network Status</p>
              <Badge className="mt-1" variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Smart Contracts</p>
              <Badge className="mt-1" variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Deployed
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Verification System</p>
              <Badge className="mt-1" variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Registry Status</p>
              <Badge className="mt-1" variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operational
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manufacturer Status */}
      {isManufacturer ? (
        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="space-y-1 md:col-span-3">
                <p className="text-sm text-gray-400">Company Name</p>
                <p className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap" title={manufacturerData?.[0]}>
                  {manufacturerData?.[0]}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Products Registered</p>
                <p className="text-lg font-semibold">{productCount?.toString() || '0'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Status</p>
                <Badge variant={isActive ? 'default' : 'destructive'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Not Registered as Manufacturer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Register as a manufacturer to start registering products on the blockchain.
            </p>
            <Link href="/dashboard/register-manufacturer">
              <Button>Register as Manufacturer</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Verified */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Verifications
            </CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats?.[0]?.toString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              All-time verification attempts
            </p>
            <Badge variant="outline" className="mt-2 text-xs border-emerald-500/30 text-emerald-400">
              Live from blockchain
            </Badge>
          </CardContent>
        </Card>

        {/* Authentic Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Authentic Verified
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {globalStats?.[1]?.toString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Verified as authentic
            </p>
            <Badge variant="outline" className="mt-2 text-xs border-emerald-500/30 text-emerald-400">
              Live from blockchain
            </Badge>
          </CardContent>
        </Card>

        {/* Counterfeit Detections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Counterfeit Detected
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {globalStats?.[2]?.toString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Detected as counterfeit
            </p>
            <Badge variant="outline" className="mt-2 text-xs border-red-500/30 text-red-400">
              Live from blockchain
            </Badge>
          </CardContent>
        </Card>

        {/* User's Registered Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Products
            </CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productCount?.toString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Registered by you
            </p>
            <Badge variant="outline" className="mt-2 text-xs border-blue-500/30 text-blue-400">
              Your blockchain data
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate Banner */}
      <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Global Success Rate</p>
              <p className="text-4xl font-bold text-emerald-400">
                {globalStats?.[3]?.toString() || '0'}%
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {globalStats?.[1]?.toString() || '0'} authentic out of {globalStats?.[0]?.toString() || '0'} total verifications
              </p>
            </div>
            <TrendingUp className="h-16 w-16 text-emerald-500/30" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/verify-product">
              <Button className="w-full" size="lg">
                <Shield className="w-4 h-4 mr-2" />
                Verify Product
              </Button>
            </Link>
            
            {isManufacturer && (
              <Link href="/dashboard/register-product">
                <Button className="w-full" size="lg" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Register Product
                </Button>
              </Link>
            )}
            
            <Link href="/dashboard/supply-chain">
              <Button className="w-full" size="lg" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Track Supply Chain
              </Button>
            </Link>
            
            <Link href="/dashboard/analytics">
              <Button className="w-full" size="lg" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Blockchain Activity</CardTitle>
          <Link href="/dashboard/verification-history">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingActivity ? (
            <div className="text-center py-8 text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-4" />
              <p className="font-medium mb-1">Loading from blockchain...</p>
              <p className="text-sm">Fetching recent verification events</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No Recent Verifications</p>
              <p className="text-sm">Verify a product to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div
                  key={`${item.productId}-${item.timestamp}-${index}`}
                  className="flex items-start gap-4 p-4 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                >
                  <div className={`p-2 rounded-full ${item.result ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex-shrink-0`}>
                    {item.result ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-base">Product Verification</p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-20">Product ID</span>
                        <p className="text-sm font-mono text-gray-300 truncate">
                          {item.productId}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-20">Status</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.result
                              ? 'border-emerald-500/50 text-emerald-400'
                              : 'border-red-500/50 text-red-400'
                          }`}
                        >
                          {item.result ? '✓ Blockchain Registered' : '✗ Counterfeit Detected'}
                        </Badge>
                      </div>
                      
                      {item.confidenceScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20">Confidence</span>
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            {item.confidenceScore}% confidence score
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-20">Verified</span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-20">Verifier</span>
                        <span className="text-xs text-gray-400 font-mono">
                          {item.verifier.slice(0, 6)}...{item.verifier.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}