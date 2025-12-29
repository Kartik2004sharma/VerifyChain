'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Shield,
  Package,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useManufacturerInfo, useRegisterManufacturer } from '@/hooks/useProductRegistry';
import toast from 'react-hot-toast';

export default function RegisterManufacturerPage() {
  const [companyName, setCompanyName] = useState('');
  const { address, isConnected } = useAccount();
  const { manufacturer, refetch } = useManufacturerInfo(address);
  const { registerManufacturer, isPending, isSuccess } = useRegisterManufacturer();

  const handleRegister = async () => {
    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    if (companyName.trim().length < 3) {
      toast.error('Company name must be at least 3 characters');
      return;
    }

    toast.loading('Submitting manufacturer registration...', { id: 'register' });
    try {
      await registerManufacturer(companyName.trim());
      toast.success('Registration submitted! Please approve in MetaMask.', { 
        id: 'register',
        duration: 6000 
      });
    } catch (error) {
      toast.error('Failed to register manufacturer', { id: 'register' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-emerald-500" />
            Manufacturer Registration
          </h1>
          <p className="text-muted-foreground">
            Register your company on the blockchain to start registering products
          </p>
        </div>

        {/* Wallet Not Connected */}
        {!isConnected && (
          <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-950/20 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400 mb-2">Wallet Not Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Please connect your MetaMask wallet using the button in the top-right corner to register as a manufacturer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Already Registered */}
        {isConnected && manufacturer?.isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                  Manufacturer Verified
                </CardTitle>
                <CardDescription>
                  Your company is registered on the blockchain and ready to register products!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Manufacturer Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Company Name</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">
                      {manufacturer.name || 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span className="text-xs font-medium">Products Registered</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">
                      {manufacturer.productCount || 0}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Status</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">
                      {manufacturer.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Wallet Address</label>
                  <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-3 border border-emerald-500/10">
                    <p className="text-sm font-mono text-emerald-400 flex-1 break-all">
                      {address}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address || '');
                        toast.success('Address copied!');
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Registration Date</label>
                  <p className="text-sm text-emerald-400">
                    {manufacturer.registrationDate 
                      ? new Date(manufacturer.registrationDate * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'
                    }
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Registered Manufacturer
                  </Badge>
                  {manufacturer.isActive && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>

                {/* Next Steps */}
                <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-400 mb-2">🎉 You're all set!</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    You can now register products on the blockchain. Head over to the Register Product page to get started.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/dashboard/register-product'}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Register Your First Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Registration Form */}
        {isConnected && !manufacturer?.isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Info Card */}
            <Card className="border-blue-500/30 bg-gradient-to-r from-blue-950/20 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-400">Why Register?</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Permanently link your company to your wallet address on the blockchain</li>
                      <li>Gain the ability to register and track products</li>
                      <li>Build your reputation score through verified product registrations</li>
                      <li>Participate in the decentralized supply chain ecosystem</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Form Card */}
            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  Register Your Company
                </CardTitle>
                <CardDescription>
                  Enter your company or manufacturer name to register on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Name Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Company/Manufacturer Name *</label>
                  <Input
                    placeholder="e.g., Apple Inc., Nike, Tesla, Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="border-emerald-500/20 focus:border-emerald-500/50"
                    maxLength={100}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      This name will be permanently stored on the blockchain
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {companyName.length}/100
                    </p>
                  </div>
                </div>

                {/* Wallet Address Display */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Your Wallet Address</label>
                  <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-3 border border-emerald-500/10">
                    <p className="text-sm font-mono text-emerald-400 flex-1 truncate">
                      {address}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address || '');
                        toast.success('Address copied!');
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-amber-950/30 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-400 mb-2">⚠️ Important:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Registration is permanent and cannot be changed</li>
                    <li>You'll need Sepolia ETH for gas fees (~0.001 ETH)</li>
                    <li>Approve the transaction in MetaMask when prompted</li>
                    <li>Wait 10-30 seconds for blockchain confirmation</li>
                  </ul>
                </div>

                {/* Register Button */}
                <Button
                  onClick={handleRegister}
                  disabled={isPending || !companyName.trim() || companyName.trim().length < 3}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registering on Blockchain...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Register as Manufacturer
                    </>
                  )}
                </Button>

                {/* After Registration Help */}
                {isSuccess && (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-emerald-400 mb-2">✅ Registration Submitted!</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your transaction has been submitted to the blockchain. Please wait 10-30 seconds for confirmation, then refresh this page.
                    </p>
                    <Button
                      onClick={() => {
                        refetch();
                        window.location.reload();
                      }}
                      variant="outline"
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Refresh Page
                    </Button>
                  </div>
                )}

                {/* Network Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-emerald-500/10">
                    <p className="text-muted-foreground mb-1">Network</p>
                    <p className="font-semibold text-emerald-400">Sepolia Testnet</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-emerald-500/10">
                    <p className="text-muted-foreground mb-1">Gas Fee</p>
                    <p className="font-semibold text-emerald-400">~0.001 ETH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
