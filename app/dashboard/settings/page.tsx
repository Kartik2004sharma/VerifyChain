'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Bell, 
  Shield, 
  Settings, 
  Wallet, 
  ExternalLink, 
  Copy, 
  CheckCircle2,
  Database,
  Scan,
  Clock,
  AlertTriangle,
  Key,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PRODUCT_REGISTRY_ADDRESS } from '@/lib/mock-blockchain-data';

interface VerificationSettings {
  autoVerification: boolean;
  verificationThreshold: number;
  blockchainNetwork: string;
  gasOptimization: 'slow' | 'medium' | 'fast';
  scanHistory: boolean;
  cacheResults: boolean;
  cacheExpiry: number;
  notifications: boolean;
  emailAlerts: boolean;
  pushNotifications: boolean;
  suspiciousProductAlerts: boolean;
  counterfeitAlerts: boolean;
  supplyChainAlerts: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<VerificationSettings>({
    autoVerification: true,
    verificationThreshold: 70,
    blockchainNetwork: 'ethereum-sepolia',
    gasOptimization: 'medium',
    scanHistory: true,
    cacheResults: true,
    cacheExpiry: 24,
    notifications: true,
    emailAlerts: true,
    pushNotifications: false,
    suspiciousProductAlerts: true,
    counterfeitAlerts: true,
    supplyChainAlerts: false,
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const updateSetting = (key: keyof VerificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(PRODUCT_REGISTRY_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your VerifyChain preferences and blockchain settings</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-emerald-500" />
                Verification Settings
              </CardTitle>
              <CardDescription>
                Configure how products are verified on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically verify products when scanned
                  </p>
                </div>
                <Switch
                  checked={settings.autoVerification}
                  onCheckedChange={(checked) => updateSetting('autoVerification', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Confidence Threshold ({settings.verificationThreshold}%)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[settings.verificationThreshold]}
                    onValueChange={([value]) => updateSetting('verificationThreshold', value)}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <span className="text-sm font-medium w-12 text-right">{settings.verificationThreshold}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum blockchain confidence score to mark product as authentic
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Save Scan History</Label>
                  <p className="text-sm text-muted-foreground">
                    Store verification history locally for quick access
                  </p>
                </div>
                <Switch
                  checked={settings.scanHistory}
                  onCheckedChange={(checked) => updateSetting('scanHistory', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cache Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache blockchain verification results to reduce gas costs
                  </p>
                </div>
                <Switch
                  checked={settings.cacheResults}
                  onCheckedChange={(checked) => updateSetting('cacheResults', checked)}
                />
              </div>

              {settings.cacheResults && (
                <div className="space-y-2 ml-4">
                  <Label htmlFor="cacheExpiry">Cache Expiry (hours)</Label>
                  <Input
                    id="cacheExpiry"
                    type="number"
                    value={settings.cacheExpiry}
                    onChange={(e) => updateSetting('cacheExpiry', parseInt(e.target.value))}
                    min={1}
                    max={168}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to cache verification results before re-checking
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                Verification Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-500 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                  <p className="text-2xl font-bold">342</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-500 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Counterfeit</span>
                  </div>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Blockchain Configuration
              </CardTitle>
              <CardDescription>
                Configure blockchain network and smart contract settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="network">Blockchain Network</Label>
                <Select value={settings.blockchainNetwork} onValueChange={(value) => updateSetting('blockchainNetwork', value)}>
                  <SelectTrigger id="network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum-sepolia">Ethereum Sepolia (Testnet)</SelectItem>
                    <SelectItem value="ethereum-mainnet">Ethereum Mainnet</SelectItem>
                    <SelectItem value="polygon-mainnet">Polygon Mainnet</SelectItem>
                    <SelectItem value="polygon-mumbai">Polygon Mumbai (Testnet)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the blockchain network for product verification
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="gas">Gas Optimization</Label>
                <Select value={settings.gasOptimization} onValueChange={(value: any) => updateSetting('gasOptimization', value)}>
                  <SelectTrigger id="gas">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow (15-30s, Lower Fees)</SelectItem>
                    <SelectItem value="medium">Medium (5-15s, Balanced)</SelectItem>
                    <SelectItem value="fast">Fast (1-5s, Higher Fees)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Balance between verification speed and transaction costs
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Product Registry Contract</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={PRODUCT_REGISTRY_ADDRESS} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyAddress}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a 
                      href={`https://sepolia.etherscan.io/address/${PRODUCT_REGISTRY_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Smart contract address for product verification registry
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Connected Wallet</p>
                      <p className="text-xs text-muted-foreground font-mono">0x742d...5a3D</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Balance</p>
                    <p className="font-medium">2.47 ETH</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Network</p>
                    <p className="font-medium">Sepolia</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-500" />
                API Integration
              </CardTitle>
              <CardDescription>
                API key for programmatic access to verification services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={showApiKey ? "vck_live_a1b2c3d4e5f6g7h8i9j0" : "••••••••••••••••••••••••"}
                    readOnly 
                    type={showApiKey ? "text" : "password"}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText("vck_live_a1b2c3d4e5f6g7h8i9j0");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Regenerate API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about verification events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for verification events
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) => updateSetting('emailAlerts', checked)}
                  disabled={!settings.notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  disabled={!settings.notifications}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Alert Types</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Counterfeit Detected</Label>
                    <p className="text-xs text-muted-foreground">
                      Alert when a counterfeit product is detected
                    </p>
                  </div>
                  <Switch
                    checked={settings.counterfeitAlerts}
                    onCheckedChange={(checked) => updateSetting('counterfeitAlerts', checked)}
                    disabled={!settings.notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Suspicious Activity</Label>
                    <p className="text-xs text-muted-foreground">
                      Alert for products with low confidence scores
                    </p>
                  </div>
                  <Switch
                    checked={settings.suspiciousProductAlerts}
                    onCheckedChange={(checked) => updateSetting('suspiciousProductAlerts', checked)}
                    disabled={!settings.notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Supply Chain Updates</Label>
                    <p className="text-xs text-muted-foreground">
                      Notifications for supply chain checkpoint changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.supplyChainAlerts}
                    onCheckedChange={(checked) => updateSetting('supplyChainAlerts', checked)}
                    disabled={!settings.notifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Wallet Security</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your wallet security settings and connected accounts
                  </p>
                </div>

                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="w-4 h-4 mr-2" />
                  View Connected Wallets
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Manage App Permissions
                </Button>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Account Security</h3>
                  <div className="space-y-2">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Enable Two-Factor Authentication</Button>
                    <Button variant="outline">Download Recovery Codes</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
