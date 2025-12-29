'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Upload,
  X,
  Copy,
  CheckCircle2,
  CheckCircle,
  Download,
  RefreshCw,
  AlertCircle,
  Calendar,
  Sparkles,
  QrCode as QrCodeIcon,
  Loader2,
  Clock,
  Building2,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useRegisterProduct } from '@/hooks/useProductRegistry';
import { useProductRegistry } from '@/hooks/blockchain/useProductRegistry';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';


type Step = 1 | 2 | 3;

interface ProductData {
  // Step 1
  productName: string;
  category: string;
  manufacturer: string;
  description: string;
  image: string | null;
  imageName: string;

  // Step 2
  manufacturingDate: string;
  batchNumber: string;
  serialNumber: string;
  location: string;
  facility: string;
  certifications: string[];

  // Step 3 (generated)
  productId: string;
  qrCode: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Pharmaceuticals',
  'Luxury Goods',
  'Food & Beverage',
  'Automotive Parts',
  'Cosmetics',
  'Other',
];

const CERTIFICATIONS = ['ISO 9001', 'CE Marking', 'FDA Approved', 'GMP Certified'];

export default function RegisterProductPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState(1);
  const [previewHash, setPreviewHash] = useState<string>('');

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { registerProduct, isPending: isRegistering, hash, isSuccess: txSuccess } = useRegisterProduct();
  const { generateDataHash, batchRegisterProducts } = useProductRegistry();

  const [productData, setProductData] = useState<ProductData>({
    productName: '',
    category: '',
    manufacturer: address || '',
    description: '',
    image: null,
    imageName: '',

    manufacturingDate: '',
    batchNumber: '',
    serialNumber: '',
    location: '',
    facility: '',
    certifications: [],

    productId: '',
    qrCode: '',
  });

  // Update manufacturer when wallet connects
  useEffect(() => {
    if (address) {
      setProductData(prev => ({ ...prev, manufacturer: address }));
    }
  }, [address]);

  // Handle successful transaction
  useEffect(() => {
    console.log('Transaction status:', { txSuccess, hash, isSuccess });
    if (txSuccess && hash) {
      console.log('✅ Transaction successful! Setting isSuccess to true');
      setIsSuccess(true);
    }
  }, [txSuccess, hash]);

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!productData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!productData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!productData.manufacturingDate) {
      newErrors.manufacturingDate = 'Manufacturing date is required';
    } else {
      const selectedDate = new Date(productData.manufacturingDate);
      if (selectedDate > new Date()) {
        newErrors.manufacturingDate = 'Manufacturing date cannot be in the future';
      }
    }

    if (!productData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    }

    if (!productData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }

    if (!productData.location.trim()) {
      newErrors.location = 'Manufacturing location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Change = (field: keyof Omit<ProductData, 'manufacturingDate' | 'batchNumber' | 'serialNumber' | 'location' | 'facility' | 'certifications' | 'productId' | 'qrCode'>, value: string) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleStep2Change = (field: keyof Omit<ProductData, 'productName' | 'category' | 'manufacturer' | 'description' | 'image' | 'imageName' | 'productId' | 'qrCode'>, value: string | string[]) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'File size must be less than 5MB' }));
      return;
    }

    // Validate file type
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Only PNG and JPG files are allowed' }));
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductData((prev) => ({
        ...prev,
        image: event.target?.result as string,
        imageName: file.name,
      }));
      setErrors((prev) => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleImageUpload({ target: input } as any);
      }
    }
  };

  const generateBatchNumber = () => {
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    setProductData((prev) => ({ ...prev, batchNumber: `BATCH-${year}-${random}` }));
  };

  const generateSerialNumber = () => {
    const random = String(Math.floor(Math.random() * 10000000000)).padStart(10, '0');
    setProductData((prev) => ({ ...prev, serialNumber: `SN-${random}` }));
  };

  const toggleCertification = (cert: string) => {
    setProductData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      // Generate unique product ID with timestamp to ensure uniqueness
      const timestamp = Date.now();
      const randomPart = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      const productId = `VRF-${timestamp}-${randomPart}`;
      
      // Generate preview hash for step 3
      const previewMetadata = {
        name: productData.productName,
        description: productData.description,
        category: productData.category,
        manufacturingDate: productData.manufacturingDate,
        batchNumber: productData.batchNumber,
        serialNumber: productData.serialNumber,
        location: productData.location,
        facility: productData.facility,
        certifications: productData.certifications,
        image: productData.image,
      };
      const hash = generateDataHash(previewMetadata);
      setPreviewHash(hash);
      
      // Create verification URL for QR code using the actual product ID
      const verificationUrl = `${window.location.origin}/dashboard/verify-product?id=${productId}`;
      
      setProductData((prev) => ({
        ...prev,
        productId,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verificationUrl)}`,
      }));
      setCurrentStep(3);
    }
  };

  const handleRegisterOnBlockchain = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to register product');
      return;
    }

    try {
      if (isBatchMode && batchQuantity > 1) {
        // Batch registration
        toast.loading(`Generating ${batchQuantity} products...`);
        
        const products = Array.from({ length: batchQuantity }, (_, index) => {
          const timestamp = Date.now() + index;
          const productId = `VRF-${timestamp}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
          const serialNumber = `${productData.serialNumber}-${String(index + 1).padStart(3, '0')}`;
          
          const metadata = {
            name: `${productData.productName} #${index + 1}`,
            description: productData.description,
            category: productData.category,
            manufacturingDate: productData.manufacturingDate,
            batchNumber: productData.batchNumber,
            serialNumber: serialNumber,
            location: productData.location,
            facility: productData.facility,
            certifications: productData.certifications,
            image: productData.image,
            timestamp,
            batchIndex: index + 1,
          };
          
          const dataHash = generateDataHash(metadata);
          
          return {
            productId,
            productName: metadata.name,
            dataHash: dataHash,
            // Use the actual hash as the metadata URI for verification
            metadataURI: `ipfs://hash/${dataHash}`,
          };
        });
        
        toast.dismiss();
        toast.loading('Registering batch on blockchain...');
        
        const success = await batchRegisterProducts(products);
        
        if (success) {
          toast.dismiss();
          toast.success(`Successfully registered ${batchQuantity} products!`);
        }
      } else {
        // Single product registration
        const metadata = {
          name: productData.productName,
          description: productData.description,
          category: productData.category,
          manufacturingDate: productData.manufacturingDate,
          batchNumber: productData.batchNumber,
          serialNumber: productData.serialNumber,
          location: productData.location,
          facility: productData.facility,
          certifications: productData.certifications,
          image: productData.image,
          timestamp: Date.now(),
        };
        
        // Generate blockchain hash from metadata (keccak256)
        const dataHash = generateDataHash(metadata);
        
        // Use the actual hash in the metadata URI for verification
        // In production, you would:
        // 1. Upload metadata to IPFS and get real CID
        // 2. Store both the hash and IPFS CID on blockchain
        // For now, we use the hash as part of the URI
        const metadataURI = `ipfs://hash/${dataHash}`;
        
        console.log('📦 Product Registration Data:', {
          productId: productData.productId,
          productName: productData.productName,
          dataHash,
          metadataURI,
          metadata
        });
        
        // Register on blockchain with actual hash
        await registerProduct(
          productData.productId,
          productData.productName,
          productData.description,
          metadataURI
        );
      }
    } catch (error) {
      toast.dismiss();
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setErrors({});
    setProductData({
      productName: '',
      category: '',
      manufacturer: address || '',
      description: '',
      image: null,
      imageName: '',
      manufacturingDate: '',
      batchNumber: '',
      serialNumber: '',
      location: '',
      facility: '',
      certifications: [],
      productId: '',
      qrCode: '',
    });
  };

  const downloadQRCode = () => {
    if (!productData.qrCode) {
      toast.error('QR Code not available');
      return;
    }
    
    const link = document.createElement('a');
    link.href = productData.qrCode;
    link.download = `QR-${productData.productId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded!');
  };

  const downloadCertificate = () => {
    // Generate a simple certificate as text/html and download as PDF-style
    const certificateContent = `
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
                    PRODUCT REGISTRATION CERTIFICATE
                              VerifyChain
      
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      Product Name:        ${productData.productName}
      Product ID:          ${productData.productId}
      Category:            ${productData.category}
      
      Manufacturer:        ${productData.manufacturer}
      Batch Number:        ${productData.batchNumber}
      Serial Number:       ${productData.serialNumber}
      
      Manufacturing Date:  ${productData.manufacturingDate}
      Location:            ${productData.location}
      Facility:            ${productData.facility}
      
      Certifications:      ${productData.certifications.join(', ') || 'None'}
      
      Transaction Hash:    ${hash || 'Pending'}
      Registration Date:   ${new Date().toLocaleString()}
      
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      This certificate confirms the registration of the above
      product on the VerifyChain blockchain-based verification
      system on Sepolia testnet.
      
      Verify at: https://sepolia.etherscan.io/tx/${hash}
      
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate-${productData.productId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Certificate downloaded!');
  };

  const viewProductDetails = () => {
    // Use the actual product ID that was registered
    if (productData.productId) {
      toast.success(`Your Product ID is ${productData.productId}. Navigating to verification page...`, {
        duration: 3000,
        icon: '🎉',
      });
      
      // Navigate to verify product page with the product ID
      setTimeout(() => {
        router.push(`/dashboard/verify-product?id=${productData.productId}`);
      }, 1500);
    } else {
      toast.error('Product ID not found');
    }
  };

  const progressPercentage = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  console.log('🔍 Render state:', { 
    isSuccess, 
    txSuccess, 
    hash, 
    currentStep, 
    isRegistering,
    productId: productData.productId 
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Register Product</h1>
          <p className="text-muted-foreground">
            Register your product on the blockchain for counterfeit protection
          </p>
        </div>

        {/* Wallet Connection Warning */}
        {!isConnected && (
          <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-950/20 to-transparent mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Wallet Not Connected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to connect your wallet to register products on the blockchain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <>
              {/* Always show wizard - auto-register manufacturer if needed */}
              <motion.div
                key="wizard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">
                      {currentStep === 1 && 'Product Information'}
                      {currentStep === 2 && 'Manufacturing Details'}
                      {currentStep === 3 && 'Review & Register'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Step {currentStep} of 3
                    </p>
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                    {progressPercentage}%
                  </Badge>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* STEP 1: Product Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-emerald-500/20">
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                      <CardDescription>Fill in your product details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Product Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g., Premium Leather Handbag"
                          value={productData.productName}
                          onChange={(e) => handleStep1Change('productName', e.target.value)}
                          className={`border-emerald-500/20 ${
                            errors.productName ? 'border-red-500/50' : ''
                          }`}
                        />
                        {errors.productName && (
                          <p className="text-xs text-red-400">{errors.productName}</p>
                        )}
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={productData.category}
                          onChange={(e) => handleStep1Change('category', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-white ${
                            errors.category
                              ? 'border-red-500/50'
                              : 'border-emerald-500/20'
                          } focus:outline-none focus:border-emerald-500/50`}
                        >
                          <option value="">Select a category</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="text-xs text-red-400">{errors.category}</p>
                        )}
                      </div>

                      {/* Manufacturer Name (Display Only) */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Manufacturer Name</label>
                        <div className="px-3 py-2 rounded-lg bg-slate-800 border border-emerald-500/10 text-muted-foreground text-sm">
                          {productData.manufacturer}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From your connected wallet
                        </p>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Product Description</label>
                        <div className="space-y-2">
                          <textarea
                            placeholder="Describe your product..."
                            value={productData.description}
                            onChange={(e) =>
                              handleStep1Change(
                                'description',
                                e.target.value.slice(0, 500)
                              )
                            }
                            maxLength={500}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/20 text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 resize-none h-24"
                          />
                          <p className="text-xs text-muted-foreground text-right">
                            {productData.description.length}/500
                          </p>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Product Image</label>
                        {!productData.image ? (
                          <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-emerald-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/png,image/jpeg"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium mb-1">
                              Drag and drop your image here
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG or JPG • Max 5MB
                            </p>
                          </div>
                        ) : (
                          <div className="relative inline-block">
                            <img
                              src={productData.image}
                              alt="Product preview"
                              className="max-w-xs h-40 object-cover rounded-lg border border-emerald-500/20"
                            />
                            <button
                              onClick={() =>
                                setProductData((prev) => ({
                                  ...prev,
                                  image: null,
                                  imageName: '',
                                }))
                              }
                              className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                            <p className="text-xs text-muted-foreground mt-2">
                              {productData.imageName}
                            </p>
                          </div>
                        )}
                        {errors.image && (
                          <p className="text-xs text-red-400">{errors.image}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 1 Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Next: Manufacturing Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Manufacturing Details */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-emerald-500/20">
                    <CardHeader>
                      <CardTitle>Manufacturing Details</CardTitle>
                      <CardDescription>Provide manufacturing information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Batch Registration Toggle */}
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-400" />
                              Batch Registration
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Register multiple identical products at once
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isBatchMode}
                                onChange={(e) => setIsBatchMode(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </div>
                        </div>
                        
                        {isBatchMode && (
                          <div className="mt-4 space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={batchQuantity}
                                onChange={(e) => setBatchQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                className="w-32 border-emerald-500/20"
                              />
                              <span className="text-sm text-muted-foreground">
                                products (max 100)
                              </span>
                            </div>
                            <p className="text-xs text-yellow-400">
                              Note: Serial numbers will be auto-generated with sequential suffixes
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Manufacturing Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Manufacturing Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={productData.manufacturingDate}
                            onChange={(e) =>
                              handleStep2Change('manufacturingDate', e.target.value)
                            }
                            className={`border-emerald-500/20 ${
                              errors.manufacturingDate ? 'border-red-500/50' : ''
                            }`}
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                        {errors.manufacturingDate && (
                          <p className="text-xs text-red-400">
                            {errors.manufacturingDate}
                          </p>
                        )}
                      </div>

                      {/* Batch Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Batch Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Format: BATCH-YYYY-XXXX"
                            value={productData.batchNumber}
                            onChange={(e) =>
                              handleStep2Change('batchNumber', e.target.value)
                            }
                            className={`flex-1 border-emerald-500/20 ${
                              errors.batchNumber ? 'border-red-500/50' : ''
                            }`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateBatchNumber}
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        </div>
                        {errors.batchNumber && (
                          <p className="text-xs text-red-400">{errors.batchNumber}</p>
                        )}
                      </div>

                      {/* Serial Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Serial Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Format: SN-XXXXXXXXXX"
                            value={productData.serialNumber}
                            onChange={(e) =>
                              handleStep2Change('serialNumber', e.target.value)
                            }
                            className={`flex-1 border-emerald-500/20 ${
                              errors.serialNumber ? 'border-red-500/50' : ''
                            }`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateSerialNumber}
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        </div>
                        {errors.serialNumber && (
                          <p className="text-xs text-red-400">
                            {errors.serialNumber}
                          </p>
                        )}
                      </div>

                      {/* Manufacturing Location */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Manufacturing Location <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="City, Country (e.g., Shanghai, China)"
                          value={productData.location}
                          onChange={(e) =>
                            handleStep2Change('location', e.target.value)
                          }
                          className={`border-emerald-500/20 ${
                            errors.location ? 'border-red-500/50' : ''
                          }`}
                        />
                        {errors.location && (
                          <p className="text-xs text-red-400">{errors.location}</p>
                        )}
                      </div>

                      {/* Production Facility */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Production Facility</label>
                        <Input
                          placeholder="Facility name or ID (optional)"
                          value={productData.facility}
                          onChange={(e) =>
                            handleStep2Change('facility', e.target.value)
                          }
                          className="border-emerald-500/20"
                        />
                      </div>

                      {/* Quality Certifications */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Quality Certifications</label>
                        <div className="space-y-2">
                          {CERTIFICATIONS.map((cert) => (
                            <label
                              key={cert}
                              className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={productData.certifications.includes(cert)}
                                onChange={() => toggleCertification(cert)}
                                className="w-4 h-4 rounded accent-emerald-500"
                              />
                              <span className="text-sm">{cert}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2 Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Next: Review & Register
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Review & Register */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Product Summary */}
                  <Card className="border-emerald-500/20">
                    <CardHeader>
                      <CardTitle>Product Summary</CardTitle>
                      <CardDescription>Review your product details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Details */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Product Name</p>
                            <p className="text-sm font-semibold">{productData.productName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Category</p>
                            <p className="text-sm font-semibold">{productData.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Manufacturing Date
                            </p>
                            <p className="text-sm font-semibold">
                              {new Date(productData.manufacturingDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Batch Number</p>
                            <p className="text-sm font-semibold">{productData.batchNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Serial Number</p>
                            <p className="text-sm font-semibold">{productData.serialNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Location</p>
                            <p className="text-sm font-semibold">{productData.location}</p>
                          </div>
                        </div>

                        {/* Image & QR Code */}
                        <div className="space-y-4">
                          {productData.image && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Product Image</p>
                              <img
                                src={productData.image}
                                alt="Product"
                                className="w-full h-32 object-cover rounded-lg border border-emerald-500/20"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">QR Code</p>
                            <img
                              src={productData.qrCode}
                              alt="QR Code"
                              className="w-32 h-32 border border-emerald-500/20 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Smart Contract Information */}
                  <Card className="border-emerald-500/20 bg-emerald-950/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <QrCodeIcon className="w-5 h-5 text-emerald-500" />
                        Blockchain Registration Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Data Hash Preview */}
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-emerald-500/20">
                        <p className="text-xs text-muted-foreground mb-2">Blockchain Data Hash (keccak256)</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-emerald-400 break-all">
                            {previewHash || 'Generating...'}
                          </p>
                          {previewHash && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(previewHash);
                                toast.success('Hash copied to clipboard!');
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This cryptographic hash uniquely identifies your product data on the blockchain
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Network</p>
                          <p className="text-sm font-semibold">Ethereum Sepolia Testnet</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-emerald-400">
                              0x2BD0...768
                            </p>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText('0x2BD03E56dEd1C4A37fc933FCaAe010183451B768');
                                toast.success('Contract address copied!');
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Estimated Gas</p>
                          <p className="text-sm font-semibold">~0.002 ETH</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Confirmation Time</p>
                          <p className="text-sm font-semibold">~15 seconds</p>
                        </div>
                      </div>

                      {isBatchMode && (
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-xs text-blue-400 font-medium mb-1">
                            Batch Registration Mode
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {batchQuantity} products will be registered with sequential serial numbers
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <Button
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => setCurrentStep(1)}
                    >
                      Edit Product Details
                    </Button>
                    <Button
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate New QR Code
                    </Button>
                  </div>

                  {/* Register Button */}
                  <Button
                    onClick={handleRegisterOnBlockchain}
                    disabled={isRegistering}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                  >
                    {isRegistering ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Registering on Blockchain...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Register on Blockchain
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </>
          ) : (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-emerald-500/30 bg-emerald-950/20">
                <CardContent className="pt-12 pb-8 text-center space-y-6">
                  {/* Success Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex justify-center"
                  >
                    <div className="relative w-16 h-16">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-emerald-500/20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="flex items-center justify-center w-full h-full rounded-full bg-emerald-500/30 border border-emerald-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Product Successfully Registered!</h2>
                    <p className="text-muted-foreground">
                      Your product has been registered on the blockchain
                    </p>
                  </div>

                  {/* PROMINENT PRODUCT ID DISPLAY */}
                  <div className="bg-gradient-to-r from-emerald-950/50 to-emerald-900/30 border-2 border-emerald-500/50 rounded-xl p-6 shadow-lg">
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                        <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                          Your Product ID
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-emerald-400 break-all px-4">
                        {productData.productId}
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Save this ID! You'll need it to verify your product on the "Verify Product" page.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(productData.productId);
                          toast.success('Product ID copied to clipboard!');
                        }}
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Product ID
                      </Button>
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="space-y-3 bg-slate-900/50 rounded-lg p-4 border border-emerald-500/10">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                      <div className="flex items-center gap-2 justify-center">
                        <p className="text-sm font-mono text-emerald-400">
                          {hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : 'N/A'}
                        </p>
                        <button 
                          onClick={() => {
                            if (hash) {
                              navigator.clipboard.writeText(hash);
                              toast.success('Transaction hash copied!');
                            }
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {hash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Product ID (Blockchain)</p>
                      <p className="text-lg font-bold text-emerald-400 break-all">
                        {productData.productId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use this ID to verify your product!
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Internal Reference ID</p>
                      <p className="text-sm font-mono text-muted-foreground">
                        {productData.productId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">QR Code</p>
                      <img
                        src={productData.qrCode}
                        alt="QR Code"
                        className="w-40 h-40 border border-emerald-500/20 rounded-lg mx-auto"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Registration Timestamp</p>
                      <p className="text-sm text-emerald-400">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={downloadQRCode}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                    <Button
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={downloadCertificate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>

                  {/* Final Action Buttons */}
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleReset}
                    >
                      Register Another Product
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={viewProductDetails}
                    >
                      View Product Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
