'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Globe,
  Users,
  Zap,
  ExternalLink,
  ChevronDown,
  MapIcon,
  List,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductRegistry } from '@/hooks/blockchain/useProductRegistry';
import { useSupplyChainTracker } from '@/hooks/blockchain/useSupplyChainTracker';
import { useAccount } from 'wagmi';

interface Checkpoint {
  id: string;
  step: number;
  location: string;
  country: string;
  coordinates: [number, number];
  date: string;
  time: string;
  handler: string;
  status: 'completed' | 'in-transit' | 'flagged';
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  temperature?: number;
  humidity?: number;
  documents: string[];
}

interface Product {
  id: string;
  name: string;
  status: 'in-transit' | 'delivered' | 'flagged';
  currentLocation: string;
  thumbnail: string;
  batchNumber: string;
  checkpoints: Checkpoint[];
  createdAt: string;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Luxury Watch',
    status: 'in-transit',
    currentLocation: 'Dubai, UAE',
    thumbnail: '⌚',
    batchNumber: 'BATCH-2025-A001',
    createdAt: '2025-11-01',
    checkpoints: [
      {
        id: 'cp-1',
        step: 1,
        location: 'Shanghai',
        country: 'China',
        coordinates: [121.4737, 31.2304],
        date: '2025-11-01',
        time: '08:30 AM',
        handler: 'ShanghaiManufacturing Co',
        status: 'completed',
        transactionHash: '0x8f3e7a2d9c1b4e6f5a8c3d9e2b7f1a4c',
        blockNumber: 18945230,
        gasUsed: '45,230',
        temperature: 22,
        humidity: 45,
        documents: ['Certificate.pdf', 'QR-Code.png'],
      },
      {
        id: 'cp-2',
        step: 2,
        location: 'Singapore',
        country: 'Singapore',
        coordinates: [103.8198, 1.3521],
        date: '2025-11-03',
        time: '02:15 PM',
        handler: 'GlobalLogistics SG',
        status: 'completed',
        transactionHash: '0x5c3b2a1d8e9f7a4c6b5e8d2f1a9c3e7b',
        blockNumber: 18956742,
        gasUsed: '42,105',
        temperature: 24,
        humidity: 50,
        documents: ['Shipping.pdf'],
      },
      {
        id: 'cp-3',
        step: 3,
        location: 'Dubai',
        country: 'UAE',
        coordinates: [55.2708, 25.2048],
        date: '2025-11-05',
        time: '11:45 AM',
        handler: 'DubaiDistribution Hub',
        status: 'in-transit',
        transactionHash: '0x7f3e2a1d9c1b4e6f5a8c3d9e2b7f1a4c',
        blockNumber: 18968901,
        gasUsed: '39,876',
        temperature: 28,
        humidity: 35,
        documents: ['InTransit.pdf'],
      },
    ],
  },
  {
    id: 'PROD-002',
    name: 'Designer Handbag',
    status: 'delivered',
    currentLocation: 'London, UK',
    thumbnail: '👜',
    batchNumber: 'BATCH-2025-B002',
    createdAt: '2025-10-28',
    checkpoints: [
      {
        id: 'cp-4',
        step: 1,
        location: 'Milan',
        country: 'Italy',
        coordinates: [9.19, 45.4642],
        date: '2025-10-28',
        time: '09:00 AM',
        handler: 'MilanFactory Ltd',
        status: 'completed',
        transactionHash: '0x3d2c1b0a9e8f7d6c5b4a3d2c1b0a9e8f',
        blockNumber: 18901234,
        gasUsed: '41,230',
        documents: [],
      },
      {
        id: 'cp-5',
        step: 2,
        location: 'Rotterdam',
        country: 'Netherlands',
        coordinates: [4.4699, 51.9225],
        date: '2025-11-01',
        time: '03:30 PM',
        handler: 'PortLogistics NL',
        status: 'completed',
        transactionHash: '0x4e3d2c1b0a9e8f7d6c5b4a3d2c1b0a9e',
        blockNumber: 18912456,
        gasUsed: '38,456',
        documents: ['PortCertificate.pdf'],
      },
      {
        id: 'cp-6',
        step: 3,
        location: 'London',
        country: 'UK',
        coordinates: [-0.1276, 51.5074],
        date: '2025-11-04',
        time: '10:20 AM',
        handler: 'London Distribution',
        status: 'completed',
        transactionHash: '0x5f4e3d2c1b0a9e8f7d6c5b4a3d2c1b0a',
        blockNumber: 18954789,
        gasUsed: '36,789',
        documents: ['DeliveryProof.pdf'],
      },
    ],
  },
  {
    id: 'PROD-003',
    name: 'Premium Smartphone',
    status: 'flagged',
    currentLocation: 'Unknown',
    thumbnail: '📱',
    batchNumber: 'BATCH-2025-C003',
    createdAt: '2025-10-25',
    checkpoints: [
      {
        id: 'cp-7',
        step: 1,
        location: 'Seoul',
        country: 'South Korea',
        coordinates: [126.9784, 37.5665],
        date: '2025-10-25',
        time: '11:00 AM',
        handler: 'SeoulTech Manufacturing',
        status: 'completed',
        transactionHash: '0x6g5f4e3d2c1b0a9e8f7d6c5b4a3d2c1b',
        blockNumber: 18876543,
        gasUsed: '44,123',
        documents: [],
      },
      {
        id: 'cp-8',
        step: 2,
        location: 'Bangkok',
        country: 'Thailand',
        coordinates: [100.5018, 13.7563],
        date: '2025-10-29',
        time: '06:45 PM',
        handler: 'BangkokHub Logistics',
        status: 'flagged',
        transactionHash: '0x7h6g5f4e3d2c1b0a9e8f7d6c5b4a3d2c',
        blockNumber: 18888765,
        gasUsed: '40,987',
        documents: ['FlagReport.pdf'],
      },
    ],
  },
];

const timeRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days'];
const filterOptions = ['All Products', 'In Transit', 'Delivered', 'Flagged'];

export default function SupplyChainPage() {
  const { address } = useAccount();
  const { useIsProductRegistered, useGetProduct } = useProductRegistry();
  const { useGetCompleteSupplyChain, useGetSupplyChainInfo } = useSupplyChainTracker();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedProductId, setSearchedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(mockProducts[0]);
  const [expandedCheckpoint, setExpandedCheckpoint] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All Products');
  const [activeTimeRange, setActiveTimeRange] = useState('Last 30 days');
  const [sortBy, setSortBy] = useState('Newest First');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [blockchainProducts, setBlockchainProducts] = useState<Product[]>([]);

  // Check if searched product is registered
  const { data: isRegistered } = useIsProductRegistered(searchedProductId);
  const { data: productData } = useGetProduct(searchedProductId);
  const { data: supplyChainData } = useGetCompleteSupplyChain(searchedProductId);
  const { data: supplyChainInfo } = useGetSupplyChainInfo(searchedProductId);

  // When product data is fetched from blockchain, add it to the list
  useEffect(() => {
    if (isRegistered && productData && searchedProductId) {
      const [productName, manufacturer, registrationTime, dataHash, isActive, metadataURI] = productData as readonly [string, `0x${string}`, bigint, `0x${string}`, boolean, string];
      
      // Convert blockchain data to Product format
      const blockchainProduct: Product = {
        id: searchedProductId,
        name: productName,
        status: isActive ? 'in-transit' : 'delivered',
        currentLocation: 'Blockchain Registered',
        thumbnail: '📦',
        batchNumber: `Hash: ${dataHash.slice(0, 10)}...`,
        createdAt: new Date(Number(registrationTime) * 1000).toISOString().split('T')[0],
        checkpoints: supplyChainData ? convertSupplyChainData(supplyChainData as any) : [
          {
            id: 'blockchain-cp-1',
            step: 1,
            location: 'Blockchain',
            country: 'Ethereum',
            coordinates: [0, 0],
            date: new Date(Number(registrationTime) * 1000).toISOString().split('T')[0],
            time: new Date(Number(registrationTime) * 1000).toLocaleTimeString(),
            handler: manufacturer,
            status: 'completed',
            transactionHash: dataHash,
            blockNumber: 0,
            gasUsed: 'N/A',
            temperature: undefined,
            humidity: undefined,
            documents: [],
          }
        ],
      };

      // Check if product already exists in blockchainProducts
      setBlockchainProducts(prev => {
        const exists = prev.some(p => p.id === searchedProductId);
        if (!exists) {
          return [blockchainProduct, ...prev];
        }
        return prev;
      });

      // Auto-select the searched product
      setSelectedProduct(blockchainProduct);
    }
  }, [isRegistered, productData, searchedProductId, supplyChainData]);

  // Helper function to convert blockchain supply chain data to checkpoints
  const convertSupplyChainData = (data: any): Checkpoint[] => {
    // This would need to be implemented based on the actual contract return structure
    // For now, return empty array
    return [];
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchedProductId(searchQuery.trim());
    }
  };

  // Combine mock products with blockchain products
  const allProducts = [...blockchainProducts, ...mockProducts];

  // Filter products based on search and filter
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === 'All Products' || product.status === activeFilter.toLowerCase().replace(' ', '-');

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, allProducts]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === 'Newest First') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Oldest First') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'Most Checkpoints') {
      sorted.sort((a, b) => b.checkpoints.length - a.checkpoints.length);
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-transit':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'flagged':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-transit':
        return <TrendingUp className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'flagged':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const calculateStats = () => {
    if (!selectedProduct) return { days: 0, checkpoints: 0, countries: 0, handlers: 0, score: 0 };

    const checkpoints = selectedProduct.checkpoints;
    const countries = new Set(checkpoints.map((c) => c.country)).size;
    const handlers = new Set(checkpoints.map((c) => c.handler)).size;

    let days = 0;
    if (checkpoints.length > 1) {
      const start = new Date(checkpoints[0].date);
      const end = new Date(checkpoints[checkpoints.length - 1].date);
      days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    const score = selectedProduct.status === 'flagged' ? 65 : 95;

    return {
      days,
      checkpoints: checkpoints.length,
      countries,
      handlers,
      score,
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Supply Chain Tracking</h1>
          <p className="text-muted-foreground">
            Real-time product journey tracking with blockchain verification
          </p>
          <div className="mt-4 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-sm text-emerald-400">
              💡 <strong>Tip:</strong> Enter your Product ID in the search box and click "Search Blockchain" to track your registered products.
            </p>
          </div>
        </div>

        {/* Search & Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 mb-6"
        >
          {/* Search Bar */}
          <div className="relative flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Product ID or Batch Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 border-emerald-500/20"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Search Blockchain
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 items-center">
            {filterOptions.map((filter) => (
              <Badge
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  activeFilter === filter
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Badge>
            ))}

            {/* Divider */}
            <div className="h-6 border-l border-emerald-500/20 mx-2" />

            {/* Time Range */}
            {timeRanges.map((range) => (
              <Badge
                key={range}
                variant={activeTimeRange === range ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors text-xs ${
                  activeTimeRange === range
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                }`}
                onClick={() => setActiveTimeRange(range)}
              >
                {range}
              </Badge>
            ))}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/20 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Most Checkpoints</option>
            </select>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6"
        >
          {/* Left Sidebar: Product List (30%) */}
          <div className="lg:col-span-2">
            <Card className="border-emerald-500/20 h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Products</CardTitle>
                <CardDescription>
                  {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2">
                {searchedProductId && !isRegistered && (
                  <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Product ID "{searchedProductId}" not found on blockchain.
                  </div>
                )}
                
                {sortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No products found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try entering a Product ID and click "Search Blockchain"
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {sortedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => setSelectedProduct(product)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="text-2xl">{product.thumbnail}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{product.name}</p>
                            {blockchainProducts.some(p => p.id === product.id) && (
                              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                Blockchain
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{product.id}</p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(product.status)}`}
                            >
                              {getStatusIcon(product.status)}
                              <span className="ml-1">{product.status.replace('-', ' ')}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {product.checkpoints.length} stops
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{product.currentLocation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Journey Timeline (70%) */}
          <div className="lg:col-span-3">
            <Card className="border-emerald-500/20 h-[600px] flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedProduct?.name}</CardTitle>
                  <CardDescription>{selectedProduct?.id}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className="text-xs"
                  >
                    <List className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    onClick={() => setViewMode('map')}
                    className="text-xs"
                  >
                    <MapIcon className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {viewMode === 'list' && (
                  <div className="relative space-y-4">
                    {/* Timeline */}
                    {selectedProduct?.checkpoints.map((checkpoint, index) => (
                      <div key={checkpoint.id}>
                        {/* Connecting Line */}
                        {index < (selectedProduct?.checkpoints.length ?? 0) - 1 && (
                          <div
                            className={`absolute left-5 top-12 w-0.5 h-12 ${
                              checkpoint.status === 'flagged'
                                ? 'bg-red-500/50'
                                : 'bg-emerald-500/30'
                            }`}
                          />
                        )}

                        {/* Checkpoint Card */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-16"
                        >
                          {/* Status Circle */}
                          <div className="absolute left-0 top-0">
                            <motion.div
                              animate={
                                index === (selectedProduct?.checkpoints.length ?? 0) - 1 &&
                                checkpoint.status === 'in-transit'
                                  ? { scale: [1, 1.2, 1] }
                                  : {}
                              }
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                checkpoint.status === 'flagged'
                                  ? 'border-red-500 bg-red-500/10'
                                  : checkpoint.status === 'in-transit'
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-emerald-500 bg-emerald-500/10'
                              }`}
                            >
                              {checkpoint.status === 'flagged' ? (
                                <AlertCircle className="w-6 h-6 text-red-400" />
                              ) : checkpoint.status === 'in-transit' ? (
                                <TrendingUp className="w-6 h-6 text-blue-400" />
                              ) : (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                              )}
                            </motion.div>
                          </div>

                          {/* Checkpoint Details */}
                          <div
                            onClick={() =>
                              setExpandedCheckpoint(
                                expandedCheckpoint === checkpoint.id ? null : checkpoint.id
                              )
                            }
                            className="cursor-pointer p-3 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">Step {checkpoint.step}</span>
                                  <span className="text-xs text-emerald-400">
                                    {checkpoint.location}, {checkpoint.country}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {checkpoint.date} • {checkpoint.time}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Handler: {checkpoint.handler}
                                </div>
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 text-muted-foreground transition-transform ${
                                  expandedCheckpoint === checkpoint.id ? 'rotate-180' : ''
                                }`}
                              />
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {expandedCheckpoint === checkpoint.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 space-y-2 pt-3 border-t border-emerald-500/10"
                                >
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <p className="text-muted-foreground">Temperature</p>
                                      <p className="font-semibold text-emerald-400">
                                        {checkpoint.temperature}°C
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Humidity</p>
                                      <p className="font-semibold text-emerald-400">
                                        {checkpoint.humidity}%
                                      </p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-muted-foreground mb-1">Blockchain Proof</p>
                                      <div className="bg-slate-900/50 p-2 rounded border border-emerald-500/10 space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">Hash:</span>
                                          <a
                                            href="https://etherscan.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-emerald-400 hover:text-emerald-300 font-mono truncate max-w-[150px]"
                                          >
                                            {checkpoint.transactionHash.slice(0, 10)}...
                                            <ExternalLink className="w-3 h-3 inline ml-1" />
                                          </a>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">Block:</span>
                                          <span className="text-emerald-400">
                                            {checkpoint.blockNumber.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">Gas:</span>
                                          <span className="text-emerald-400">{checkpoint.gasUsed}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {checkpoint.documents.length > 0 && (
                                      <div className="col-span-2">
                                        <p className="text-muted-foreground mb-1">Documents</p>
                                        <div className="space-y-1">
                                          {checkpoint.documents.map((doc) => (
                                            <a
                                              key={doc}
                                              href="#"
                                              className="block text-xs text-emerald-400 hover:text-emerald-300 truncate"
                                            >
                                              📄 {doc}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'map' && (
                  <div className="w-full h-full flex items-center justify-center rounded-lg bg-slate-900/30 border border-emerald-500/10">
                    <div className="text-center">
                      <MapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Map integration ready
                        <br />
                        {selectedProduct?.checkpoints.length} locations
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Statistics Panel */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            <Card className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{stats.days}</p>
                  <p className="text-xs text-muted-foreground mt-1">Transit Days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{stats.checkpoints}</p>
                  <p className="text-xs text-muted-foreground mt-1">Checkpoints</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <p className="text-2xl font-bold text-emerald-400">{stats.countries}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Countries</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <p className="text-2xl font-bold text-emerald-400">{stats.handlers}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Handlers</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <p className="text-2xl font-bold text-emerald-400">{stats.score}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Score /100</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
