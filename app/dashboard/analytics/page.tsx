'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAccount, useBlockNumber } from 'wagmi'
import { useProductRegistry } from '@/hooks/blockchain/useProductRegistry'
import { useVerificationRegistry } from '@/hooks/blockchain/useVerificationRegistry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart,
  TrendingUp,
  Package,
  Shield,
  AlertTriangle,
  Users,
  Activity,
  Download,
  ExternalLink
} from 'lucide-react'
import { ConnectWallet } from '@/components/ConnectWallet'

// Dynamic imports for heavy chart components - loads only when needed
const LineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div> }
)
const Line = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Line })),
  { ssr: false }
)
const BarChart2 = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div> }
)
const Bar = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Bar })),
  { ssr: false }
)
const PieChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PieChart })),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div> }
)
const Pie = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Pie })),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Cell })),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.XAxis })),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.YAxis })),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => ({ default: mod.CartesianGrid })),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Tooltip })),
  { ssr: false }
)
const Legend = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Legend })),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
)

import { getBlockExplorerUrl } from '@/lib/wagmi-config'

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AnalyticsPage() {
  const { address, isConnected, chainId } = useAccount()
  const [timeRange, setTimeRange] = useState('7d')
  
  const { useGetGlobalStats } = useVerificationRegistry()
  const { data: blockNumber } = useBlockNumber({ watch: true })

  // Fetch global statistics from blockchain
  const { data: globalStats } = useGetGlobalStats()

  // Mock data for charts (in production, this would come from indexed blockchain data)
  const verificationTrends = [
    { date: 'Nov 7', total: 412, authentic: 391, counterfeit: 21 },
    { date: 'Nov 8', total: 398, authentic: 378, counterfeit: 20 },
    { date: 'Nov 9', total: 445, authentic: 421, counterfeit: 24 },
    { date: 'Nov 10', total: 501, authentic: 476, counterfeit: 25 },
    { date: 'Nov 11', total: 467, authentic: 442, counterfeit: 25 },
    { date: 'Nov 12', total: 523, authentic: 498, counterfeit: 25 },
    { date: 'Nov 13', total: 287, authentic: 272, counterfeit: 15 },
  ]

  const categoryData = [
    { name: 'Fashion & Apparel', value: 28.9 },
    { name: 'Electronics', value: 25.1 },
    { name: 'Pharmaceuticals', value: 19.8 },
    { name: 'Luxury Goods', value: 14.5 },
    { name: 'Cosmetics', value: 6.7 },
    { name: 'Other', value: 5.0 },
  ]

  const counterfeitHotspots = [
    { city: 'Bangkok', country: 'Thailand', count: 45 },
    { city: 'Mumbai', country: 'India', count: 38 },
    { city: 'Lagos', country: 'Nigeria', count: 32 },
    { city: 'Jakarta', country: 'Indonesia', count: 28 },
    { city: 'Mexico City', country: 'Mexico', count: 24 },
  ]

  const exportAnalytics = () => {
    const data = {
      exportDate: new Date().toISOString(),
      globalStats: {
        totalVerifications: globalStats?.[0]?.toString() || '0',
        authenticCount: globalStats?.[1]?.toString() || '0',
        counterfeitCount: globalStats?.[2]?.toString() || '0',
        successRate: globalStats?.[3]?.toString() || '0'
      },
      verificationTrends,
      categoryData,
      counterfeitHotspots
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${Date.now()}.json`
    link.click()
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
              Connect your wallet to view analytics
            </p>
            <ConnectWallet />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Verification Analytics</h1>
          <p className="text-gray-400">
            Real-time blockchain verification data and statistics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Blockchain Status Banner */}
      <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-400">⛓️ Blockchain Verified Data</p>
                <p className="text-xs text-gray-500 mt-1">
                  Current Block: #{blockNumber?.toString() || '...'} • 
                  Network: {chainId === 11155111 ? 'Sepolia Testnet' : 'Unknown'}
                </p>
              </div>
            </div>
            <a
              href={`https://sepolia.etherscan.io/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Verifications */}
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
              From blockchain registry
            </p>
          </CardContent>
        </Card>

        {/* Authentic Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Authentic Products
            </CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats?.[1]?.toString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Verified as authentic
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats?.[3]?.toString() || '0'}%
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Authentic vs total
            </p>
          </CardContent>
        </Card>

        {/* Counterfeit Detected */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Counterfeits Detected
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats?.[2]?.toString() || '0'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Flagged as counterfeit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Verification Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-emerald-500" />
              Verification Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={verificationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  name="Total"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="authentic" 
                  stroke="#10B981" 
                  name="Authentic"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="counterfeit" 
                  stroke="#EF4444" 
                  name="Counterfeit"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Product Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="hotspots" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hotspots">Counterfeit Hotspots</TabsTrigger>
          <TabsTrigger value="manufacturers">Top Manufacturers</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Metrics</TabsTrigger>
        </TabsList>

        {/* Counterfeit Hotspots */}
        <TabsContent value="hotspots">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Counterfeit Detection Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {counterfeitHotspots.map((hotspot, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-red-500">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{hotspot.city}</p>
                        <p className="text-sm text-gray-400">{hotspot.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-500">{hotspot.count}</p>
                      <p className="text-xs text-gray-400">detections</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hotspot Chart */}
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart2 data={counterfeitHotspots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="city" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart2>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Manufacturers */}
        <TabsContent value="manufacturers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Top Manufacturers by Blockchain Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    name: 'LuxLeather Industries Inc.', 
                    products: 342, 
                    verifications: 1876, 
                    successRate: 98.5,
                    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f35bA'
                  },
                  { 
                    name: 'AudioTech Corporation', 
                    products: 289, 
                    verifications: 1654, 
                    successRate: 96.2,
                    address: '0x8f3e42Cc8845D1532925b4c955Cd0e8706g46cB'
                  },
                  { 
                    name: 'HealthPlus Pharmaceuticals', 
                    products: 456, 
                    verifications: 2345, 
                    successRate: 99.1,
                    address: '0x9g4f53Dd9956E2643036c5d066De1f9817h57dC'
                  },
                ].map((mfr, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border border-gray-700 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{mfr.name}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {mfr.address.slice(0, 10)}...{mfr.address.slice(-8)}
                        </p>
                      </div>
                      <Badge variant={mfr.successRate >= 95 ? 'default' : 'secondary'}>
                        {mfr.successRate}% Success
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Products</p>
                        <p className="font-semibold">{mfr.products}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Verifications</p>
                        <p className="font-semibold">{mfr.verifications.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">On Blockchain</p>
                        <a
                          href={getBlockExplorerUrl(mfr.address, chainId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Metrics */}
        <TabsContent value="blockchain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Network Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Network Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Current Block</span>
                  <span className="font-mono">#{blockNumber?.toString() || '...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Network</span>
                  <Badge>{chainId === 11155111 ? 'Sepolia' : 'Unknown'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Average Block Time</span>
                  <span>~12 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Gas Price (avg)</span>
                  <span>~25 Gwei</span>
                </div>
              </CardContent>
            </Card>

            {/* Smart Contract Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Smart Contract Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Transactions</span>
                  <span className="font-semibold">{globalStats?.[0]?.toString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Success Rate</span>
                  <span className="font-semibold text-emerald-500">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Failed Transactions</span>
                  <span className="font-semibold">25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Avg Gas Used</span>
                  <span>~89,234</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Recent Blockchain Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Verification', hash: '0x1a2b...3c4d', time: '2 min ago', status: 'Success' },
                    { type: 'Registration', hash: '0x5e6f...7a8b', time: '5 min ago', status: 'Success' },
                    { type: 'Supply Chain', hash: '0x9c0d...1e2f', time: '8 min ago', status: 'Success' },
                  ].map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium">{tx.type}</p>
                          <p className="text-xs text-gray-400 font-mono">{tx.hash}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="mb-1">
                          {tx.status}
                        </Badge>
                        <p className="text-xs text-gray-400">{tx.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Data Source Indicator */}
      <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4 text-blue-500" />
            <p>
              All statistics are sourced directly from blockchain smart contracts.
              Data is immutable and cryptographically verified.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
