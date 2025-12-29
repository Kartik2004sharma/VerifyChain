'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Package,
  Eye,
  Plus,
  Activity,
  BarChart3,
  Clock,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAccount, useChainId } from 'wagmi';
import { useProductCount, useManufacturerCount } from '@/hooks/useProductRegistry';
import { useTotalVerifications } from '@/hooks/useVerificationRegistry';

export function ProductVerificationDashboard() {
  const [isLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Fetch real blockchain data
  const { productCount, isLoading: productsLoading } = useProductCount();
  const { manufacturerCount, isLoading: manufacturersLoading } = useManufacturerCount();
  const { totalVerifications, isLoading: verificationsLoading } = useTotalVerifications();
  
  // Calculate success rate (mock for now, would need more contract data)
  const successRate = totalVerifications > 0 ? 98.7 : 0;

  // Mock data for dashboard
  const verificationData = [
    { date: 'Mon', verified: 1200, counterfeits: 45 },
    { date: 'Tue', verified: 1900, counterfeits: 78 },
    { date: 'Wed', verified: 1400, counterfeits: 62 },
    { date: 'Thu', verified: 2100, counterfeits: 92 },
    { date: 'Fri', verified: 2000, counterfeits: 85 },
    { date: 'Sat', verified: 2200, counterfeits: 98 },
    { date: 'Sun', verified: 1800, counterfeits: 72 },
  ];

  const supplyChainData = [
    { date: 'Week 1', activity: 320 },
    { date: 'Week 2', activity: 450 },
    { date: 'Week 3', activity: 520 },
    { date: 'Week 4', activity: 680 },
  ];

  const recentVerifications = [
    { id: 'PROD-001', product: 'Luxury Watch', manufacturer: 'TechLux Inc', status: 'verified', timestamp: '2 hours ago' },
    { id: 'PROD-002', product: 'Designer Handbag', manufacturer: 'Fashion House', status: 'verified', timestamp: '4 hours ago' },
    { id: 'PROD-003', product: 'Sports Shoe', manufacturer: 'AthleteGear Co', status: 'counterfeit', timestamp: '6 hours ago' },
    { id: 'PROD-004', product: 'Smartwatch', manufacturer: 'TechCorp', status: 'verified', timestamp: '8 hours ago' },
    { id: 'PROD-005', product: 'Perfume Bottle', manufacturer: 'Luxury Brand', status: 'pending', timestamp: '10 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-950/20 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-400">Wallet Not Connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please connect your wallet to view live blockchain data and interact with smart contracts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockchain Verification System Status */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <CardTitle>Blockchain Verification System</CardTitle>
            </div>
          </div>
          <CardDescription>Real-time product authentication via distributed ledger</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Blockchain</p>
                <p className="text-sm font-semibold text-emerald-400">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Smart Contracts</p>
                <p className="text-sm font-semibold text-emerald-400">Deployed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Verification System</p>
                <p className="text-sm font-semibold text-emerald-400">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Registry</p>
                <p className="text-sm font-semibold text-emerald-400">Operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Registered</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-3xl font-bold text-emerald-400">Loading...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-emerald-400">{productCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected ? 'Live from blockchain' : 'Connect wallet to view'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            {verificationsLoading ? (
              <div className="text-3xl font-bold text-emerald-400">Loading...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-emerald-400">{totalVerifications.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected ? 'Recorded on-chain' : 'Connect wallet to view'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Manufacturers</CardTitle>
          </CardHeader>
          <CardContent>
            {manufacturersLoading ? (
              <div className="text-3xl font-bold text-emerald-400">Loading...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-emerald-400">{manufacturerCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected ? 'Registered on network' : 'Connect wallet to view'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Demo Mode Banner */}
      <Card className="border-emerald-500/20 bg-emerald-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-400">Research & Demonstration Mode</p>
              <p className="text-sm text-muted-foreground mt-1">
                This is a research platform demonstrating blockchain-based counterfeit detection. Verification data shown is for demonstration purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/verify-product">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
            <Eye className="w-4 h-4 mr-2" />
            Verify Product
          </Button>
        </Link>
        <Link href="/dashboard/register-product">
          <Button className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500/10" variant="outline" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Register New Product
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Verified</CardTitle>
            <CheckCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVerifications.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 mt-1">
              {isConnected ? 'From blockchain' : 'Connect wallet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-emerald-400 mt-1">Genuine products confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Manufacturers</CardTitle>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manufacturerCount.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 mt-1">
              {isConnected ? 'Connected to network' : 'Connect wallet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isConnected ? 'Online' : 'Offline'}</div>
            <p className="text-xs text-emerald-400 mt-1">
              {isConnected ? `Chain ID: ${chainId}` : 'Not connected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Analytics Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Verification Analytics
            </CardTitle>
            <CardDescription>Weekly verification trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={verificationData}>
                <defs>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #10B981' }}
                  labelStyle={{ color: '#10B981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="verified" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorVerified)"
                  name="Verified Products"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supply Chain Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Supply Chain Activity
            </CardTitle>
            <CardDescription>Monthly blockchain transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={supplyChainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #10B981' }}
                  labelStyle={{ color: '#10B981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="activity" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Transactions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Verifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                Recent Verifications
              </CardTitle>
              <CardDescription>Latest product verification records</CardDescription>
            </div>
            <Link href="/dashboard/verification-history">
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVerifications.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    {record.status === 'verified' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    {record.status === 'counterfeit' && <AlertCircle className="w-5 h-5 text-red-400" />}
                    {record.status === 'pending' && <Clock className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{record.product}</p>
                    <p className="text-xs text-muted-foreground">{record.manufacturer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={
                      record.status === 'verified' 
                        ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                        : record.status === 'counterfeit'
                        ? 'border-red-500/50 text-red-400 bg-red-500/10'
                        : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                    }
                  >
                    {record.status === 'verified' ? 'Verified' : record.status === 'counterfeit' ? 'Counterfeit' : 'Pending'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{record.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
