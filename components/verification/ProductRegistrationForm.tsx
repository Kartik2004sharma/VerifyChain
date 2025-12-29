"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  Calendar,
  Package,
} from "lucide-react"

type Step = 1 | 2 | 3

interface ProductFormData {
  // Step 1: Product Information
  productName: string
  category: string
  description: string
  productImage?: File

  // Step 2: Manufacturing Details
  manufacturingDate: string
  batchNumber: string
  serialNumber: string
  manufacturingLocation: string

  // Step 3: Blockchain Registration (review + submit)
}

interface FormErrors {
  [key: string]: string
}

export function ProductRegistrationForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "electronics",
    description: "",
    manufacturingDate: "",
    batchNumber: "",
    serialNumber: "",
    manufacturingLocation: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [registrationResult, setRegistrationResult] = useState<{
    blockchainHash: string
    transactionId: string
    qrCode: string
  } | null>(null)

  const { toast } = useToast()

  // Validation for Step 1
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validation for Step 2
  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.manufacturingDate) {
      newErrors.manufacturingDate = "Manufacturing date is required"
    }

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = "Batch number is required"
    }

    if (!formData.manufacturingLocation.trim()) {
      newErrors.manufacturingLocation = "Manufacturing location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input change
  const handleInputChange = (
    field: keyof Omit<ProductFormData, "productImage">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setFormData((prev) => ({ ...prev, productImage: file }))
    }
  }

  // Handle next step
  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3)
      }
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
      setErrors({})
    }
  }

  // Handle registration
  const handleRegister = async () => {
    setIsLoading(true)
    try {
      // Simulate blockchain registration
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResult = {
        blockchainHash:
          "0x" + Math.random().toString(16).substring(2, 66),
        transactionId: `TXN-${Math.random().toString(36).substring(7).toUpperCase()}`,
        qrCode: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Crect fill='%23000' x='20' y='20' width='60' height='60'/%3E%3Crect fill='%23000' x='120' y='20' width='60' height='60'/%3E%3Crect fill='%23000' x='20' y='120' width='60' height='60'/%3E%3Ctext x='100' y='150' font-size='12' text-anchor='middle' fill='%23000'%3E${formData.productName}%3C/text%3E%3C/svg%3E`,
      }

      setRegistrationResult(mockResult)
      setIsSubmitted(true)

      toast({
        title: "Registration Successful",
        description: "Product registered on blockchain successfully!",
      })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Success screen
  if (isSubmitted && registrationResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="border border-green-500/50 bg-green-500/10 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </motion.div>

          <h2 className="text-2xl font-bold text-center mb-2">
            Registration Complete!
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Your product has been successfully registered on the blockchain
          </p>

          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={registrationResult.qrCode} alt="Product QR Code" className="w-48 h-48" />
            </div>

            {/* Blockchain Details */}
            <div className="bg-background rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                <p className="font-mono text-sm font-semibold break-all">
                  {registrationResult.transactionId}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Blockchain Hash</Label>
                <p className="font-mono text-sm font-semibold break-all">
                  {registrationResult.blockchainHash.substring(0, 32)}...
                </p>
              </div>
            </div>

            {/* Product Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Name:</span>
                <span className="font-semibold">{formData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch Number:</span>
                <span className="font-semibold">{formData.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manufacturing Date:</span>
                <span className="font-semibold">
                  {new Date(formData.manufacturingDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <Button
              onClick={() => {
                // Download QR code
                const link = document.createElement("a")
                link.href = registrationResult.qrCode
                link.download = `${formData.productName}-qr.png`
                link.click()
              }}
              variant="outline"
              className="w-full"
            >
              Download QR Code
            </Button>

            <Button
              onClick={() => {
                // Reset form
                setCurrentStep(1)
                setIsSubmitted(false)
                setFormData({
                  productName: "",
                  category: "electronics",
                  description: "",
                  manufacturingDate: "",
                  batchNumber: "",
                  serialNumber: "",
                  manufacturingLocation: "",
                })
                setRegistrationResult(null)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Register Another Product
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Registration Progress</h3>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of 3
          </span>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <motion.div
                animate={currentStep >= step ? { scale: 1 } : { scale: 0.8 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
              </motion.div>
              {step < 3 && (
                <div
                  className={`h-1 flex-1 mx-1 ${
                    currentStep > step ? "bg-blue-600" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step 1: Product Information */}
      {currentStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Product Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="productName" className="block mb-2">
                  Product Name *
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., Premium DeFi Card"
                  value={formData.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                  className={`h-11 ${errors.productName ? "border-red-500" : ""}`}
                />
                {errors.productName && (
                  <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="block mb-2">
                  Category *
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-border/50 bg-muted/50 text-foreground"
                >
                  <option value="electronics">Electronics</option>
                  <option value="financial">Financial Products</option>
                  <option value="luxury">Luxury Goods</option>
                  <option value="pharma">Pharmaceuticals</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="block mb-2">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the product in detail..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`min-h-24 ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="image" className="block mb-2">
                  Product Image (Optional)
                </Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-6">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formData.productImage?.name || "Click to upload image"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Max 5MB
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Manufacturing Details */}
      {currentStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Manufacturing Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="manufacturingDate" className="block mb-2">
                  Manufacturing Date *
                </Label>
                <Input
                  id="manufacturingDate"
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={(e) => handleInputChange("manufacturingDate", e.target.value)}
                  className={`h-11 ${errors.manufacturingDate ? "border-red-500" : ""}`}
                />
                {errors.manufacturingDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.manufacturingDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="batchNumber" className="block mb-2">
                  Batch Number *
                </Label>
                <Input
                  id="batchNumber"
                  placeholder="e.g., BATCH-2025-A1"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                  className={`h-11 ${errors.batchNumber ? "border-red-500" : ""}`}
                />
                {errors.batchNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.batchNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="serialNumber" className="block mb-2">
                  Serial Number (Optional)
                </Label>
                <Input
                  id="serialNumber"
                  placeholder="e.g., SN-12345"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="manufacturingLocation" className="block mb-2">
                  Manufacturing Location *
                </Label>
                <Input
                  id="manufacturingLocation"
                  placeholder="e.g., Taipei, Taiwan"
                  value={formData.manufacturingLocation}
                  onChange={(e) => handleInputChange("manufacturingLocation", e.target.value)}
                  className={`h-11 ${errors.manufacturingLocation ? "border-red-500" : ""}`}
                />
                {errors.manufacturingLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.manufacturingLocation}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Review & Confirm */}
      {currentStep === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="border border-border/50 p-6">
            <h2 className="text-xl font-bold mb-6">Review Product Details</h2>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between pb-3 border-b border-border/30">
                  <span className="text-muted-foreground">Product Name</span>
                  <span className="font-semibold">{formData.productName}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-border/30">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold capitalize">{formData.category}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-border/30">
                  <span className="text-muted-foreground">Batch Number</span>
                  <span className="font-semibold">{formData.batchNumber}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-border/30">
                  <span className="text-muted-foreground">Manufacturing Date</span>
                  <span className="font-semibold">
                    {new Date(formData.manufacturingDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-semibold">{formData.manufacturingLocation}</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  By proceeding, you authorize this product to be registered on the blockchain.
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border border-green-500/30 bg-green-500/5 p-4">
            <p className="text-sm text-foreground">
              Gas estimate: <span className="font-semibold">~0.05 ETH</span>
            </p>
          </Card>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading}
          variant="outline"
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleRegister}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" className="border-white border-t-white" />
                Registering...
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Register on Blockchain
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
