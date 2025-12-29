/**
 * Mock Blockchain Data for Product Verification
 * Used for development and demo purposes
 */

export interface ProductData {
  id: string
  name: string
  manufacturer: string
  category: string
  manufacturingDate: string
  batchNumber: string
  serialNumber: string
  blockchainHash: string
  registeredDate: string
  status: "verified" | "unverified" | "pending" | "counterfeit"
  verificationCount: number
  qrCode?: string
  description?: string
}

export interface SupplyChainStep {
  location: string
  timestamp: number
  handler: string
  blockchainTx: string
  status: "completed" | "in-transit" | "failed"
  details?: string
}

export interface VerificationHistory {
  id: string
  productId: string
  verificationDate: string
  verifier: string
  result: "verified" | "counterfeit" | "suspicious"
  confidenceScore: number
  blockchainTx: string
}

export interface AnalyticsData {
  totalVerifications: number
  verifiedCount: number
  counterfeitCount: number
  suspiciousCount: number
  averageConfidenceScore: number
}

// Mock Products Database
export const mockProducts: ProductData[] = [
  {
    id: "CRDFI-2025-001",
    name: "CardFi Premium DeFi Card",
    manufacturer: "CardFi Technologies Inc.",
    category: "Financial Card",
    manufacturingDate: "2025-01-15T08:30:00Z",
    batchNumber: "BATCH-2025-A1",
    serialNumber: "SN-45678901",
    blockchainHash:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
    registeredDate: "2025-01-15T10:00:00Z",
    status: "verified",
    verificationCount: 342,
    description: "Premium DeFi payment card with yield rewards",
  },
  {
    id: "CRDFI-2025-002",
    name: "CardFi Standard DeFi Card",
    manufacturer: "CardFi Technologies Inc.",
    category: "Financial Card",
    manufacturingDate: "2025-01-10T14:20:00Z",
    batchNumber: "BATCH-2025-A1",
    serialNumber: "SN-45678902",
    blockchainHash:
      "0x8a0cbde2d0e68b8f76cd5fbe80a0eaf2d0e68b8f76cd5fbe80a0eaf2d0e68b8f",
    registeredDate: "2025-01-10T15:30:00Z",
    status: "verified",
    verificationCount: 251,
    description: "Standard DeFi payment card with basic rewards",
  },
  {
    id: "CRDFI-2025-003",
    name: "CardFi Starter Card",
    manufacturer: "CardFi Technologies Inc.",
    category: "Financial Card",
    manufacturingDate: "2025-01-05T09:15:00Z",
    batchNumber: "BATCH-2025-S1",
    serialNumber: "SN-45678903",
    blockchainHash:
      "0x9b1dcef3e1f79c9f87de6fcf91b1fbf3e1f79c9f87de6fcf91b1fbf3e1f79c9f",
    registeredDate: "2025-01-05T11:00:00Z",
    status: "verified",
    verificationCount: 128,
    description: "Starter DeFi payment card",
  },
  {
    id: "CRDFI-2025-004",
    name: "CardFi Enterprise Card",
    manufacturer: "CardFi Technologies Inc.",
    category: "Financial Card",
    manufacturingDate: "2024-12-28T10:45:00Z",
    batchNumber: "BATCH-2025-E1",
    serialNumber: "SN-45678904",
    blockchainHash:
      "0xac2edff4f2g80d0f98ef7gdf02c2gcg4f2g80d0f98ef7gdf02c2gcg4f2g80d0f",
    registeredDate: "2024-12-28T12:30:00Z",
    status: "verified",
    verificationCount: 89,
    description: "Enterprise-grade DeFi payment card",
  },
  {
    id: "CRDFI-2025-005",
    name: "CardFi Counterfeit Test",
    manufacturer: "Unknown Manufacturer",
    category: "Financial Card",
    manufacturingDate: "2024-12-15T08:00:00Z",
    batchNumber: "BATCH-UNKNOWN",
    serialNumber: "SN-FAKE001",
    blockchainHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    registeredDate: "2024-12-15T08:00:00Z",
    status: "counterfeit",
    verificationCount: 0,
    description: "Test counterfeit card for verification",
  },
]

// Mock Supply Chain Data
export const mockSupplyChain: Record<string, SupplyChainStep[]> = {
  "CRDFI-2025-001": [
    {
      location: "Manufacturing Facility - Taipei, Taiwan",
      timestamp: Date.parse("2025-01-15T08:30:00Z"),
      handler: "Production Line A",
      blockchainTx: "0xabc123def456",
      status: "completed",
      details: "Card manufactured and tested",
    },
    {
      location: "Quality Control Center - Taipei, Taiwan",
      timestamp: Date.parse("2025-01-15T11:00:00Z"),
      handler: "QC Team B",
      blockchainTx: "0xabc123def457",
      status: "completed",
      details: "Passed all quality checks",
    },
    {
      location: "Packaging Facility - Taoyuan, Taiwan",
      timestamp: Date.parse("2025-01-15T14:30:00Z"),
      handler: "Packaging Station 3",
      blockchainTx: "0xabc123def458",
      status: "completed",
      details: "Packaged and labeled",
    },
    {
      location: "Logistics Hub - Shanghai, China",
      timestamp: Date.parse("2025-01-17T06:00:00Z"),
      handler: "DHL Logistics",
      blockchainTx: "0xabc123def459",
      status: "completed",
      details: "In transit to distribution",
    },
    {
      location: "Distribution Center - Singapore",
      timestamp: Date.parse("2025-01-19T10:15:00Z"),
      handler: "Regional Distributor A",
      blockchainTx: "0xabc123def460",
      status: "completed",
      details: "Received and cataloged",
    },
    {
      location: "Retail Partner - Singapore",
      timestamp: Date.parse("2025-01-20T09:30:00Z"),
      handler: "Retail Store XYZ",
      blockchainTx: "0xabc123def461",
      status: "completed",
      details: "Available for purchase",
    },
  ],
  "CRDFI-2025-002": [
    {
      location: "Manufacturing Facility - Taipei, Taiwan",
      timestamp: Date.parse("2025-01-10T14:20:00Z"),
      handler: "Production Line B",
      blockchainTx: "0xdef456ghi789",
      status: "completed",
      details: "Card manufactured",
    },
    {
      location: "Quality Control Center - Taipei, Taiwan",
      timestamp: Date.parse("2025-01-10T16:45:00Z"),
      handler: "QC Team A",
      blockchainTx: "0xdef456ghi790",
      status: "completed",
      details: "Quality verified",
    },
    {
      location: "Logistics Hub - Shanghai, China",
      timestamp: Date.parse("2025-01-12T08:00:00Z"),
      handler: "FedEx Express",
      blockchainTx: "0xdef456ghi791",
      status: "completed",
      details: "In transit",
    },
    {
      location: "Distribution Center - Hong Kong",
      timestamp: Date.parse("2025-01-14T14:30:00Z"),
      handler: "Regional Distributor B",
      blockchainTx: "0xdef456ghi792",
      status: "completed",
      details: "Distributed",
    },
  ],
  "CRDFI-2025-003": [
    {
      location: "Manufacturing Facility - Taipei, Taiwan",
      timestamp: Date.parse("2025-01-05T09:15:00Z"),
      handler: "Production Line C",
      blockchainTx: "0xghi789jkl012",
      status: "completed",
      details: "Card manufactured",
    },
    {
      location: "Quality Control Center - Taipei, Taiwan",
      timestamp: Date.parse("2025-01-05T12:00:00Z"),
      handler: "QC Team C",
      blockchainTx: "0xghi789jkl013",
      status: "completed",
      details: "Passed QC",
    },
    {
      location: "Distribution Center - Singapore",
      timestamp: Date.parse("2025-01-08T11:20:00Z"),
      handler: "Regional Distributor A",
      blockchainTx: "0xghi789jkl014",
      status: "completed",
      details: "Received",
    },
  ],
}

// Mock Verification History
export const mockVerifications: VerificationHistory[] = [
  {
    id: "VER-001",
    productId: "CRDFI-2025-001",
    verificationDate: "2025-02-01T10:30:00Z",
    verifier: "0x1234...5678",
    result: "verified",
    confidenceScore: 98,
    blockchainTx: "0xver001tx123",
  },
  {
    id: "VER-002",
    productId: "CRDFI-2025-001",
    verificationDate: "2025-02-02T14:15:00Z",
    verifier: "0x2345...6789",
    result: "verified",
    confidenceScore: 99,
    blockchainTx: "0xver002tx124",
  },
  {
    id: "VER-003",
    productId: "CRDFI-2025-002",
    verificationDate: "2025-02-03T09:45:00Z",
    verifier: "0x3456...7890",
    result: "verified",
    confidenceScore: 97,
    blockchainTx: "0xver003tx125",
  },
  {
    id: "VER-004",
    productId: "CRDFI-2025-005",
    verificationDate: "2025-02-04T11:00:00Z",
    verifier: "0x4567...8901",
    result: "counterfeit",
    confidenceScore: 15,
    blockchainTx: "0xver004tx126",
  },
]

/**
 * Get product by ID from mock database
 */
export function getProductById(id: string): ProductData | undefined {
  return mockProducts.find((product) => product.id === id)
}

/**
 * Get supply chain for a product
 */
export function getSupplyChain(productId: string): SupplyChainStep[] {
  return mockSupplyChain[productId] || []
}

/**
 * Get verifications for a product
 */
export function getVerificationHistory(productId: string): VerificationHistory[] {
  return mockVerifications.filter((v) => v.productId === productId)
}

// Blockchain Constants
export const PRODUCT_REGISTRY_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f35bA'
export const CURRENT_BLOCK_NUMBER = 4700000

// Enhanced VerificationResult Interface
export interface VerificationResult {
  isAuthentic: boolean
  confidenceScore: number
  productData?: ProductData
  supplyChain: SupplyChainStep[]
  verificationTimestamp: number
  verificationMethod: string
  verifierId: string
  blockExplorerUrl: string
  blockchainProof: {
    hash: string
    blockNumber: number
    transactionHash: string
    network: string
    timestamp: number
    gasUsed: string
    gasPrice: string
    confirmations: number
    contractAddress: string
    from: string
    to: string
  }
  dataIntegrity: {
    hashValid: boolean
    signatureValid: boolean
    timestampValid: boolean
    supplyChainComplete: boolean
    blockchainConfirmed: boolean
    warnings: string[]
  }
}

// Helper Functions for Blockchain Validation

/**
 * Validate blockchain hash format (0x + 64 hex characters)
 */
export function validateBlockchainHash(hash: string): boolean {
  if (!hash || hash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return false
  }
  return /^0x[0-9a-f]{64}$/i.test(hash)
}

/**
 * Calculate confirmations based on block number
 */
export function calculateConfirmations(blockNumber: number): number {
  return Math.max(0, CURRENT_BLOCK_NUMBER - blockNumber)
}

/**
 * Validate cryptographic signature (checks hash format)
 */
export function validateCryptographicSignature(product: ProductData): boolean {
  return validateBlockchainHash(product.blockchainHash)
}

/**
 * Validate timestamp (not in future, not older than 5 years)
 */
export function validateTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp)
  const now = Date.now()
  const fiveYearsAgo = now - (5 * 365 * 24 * 60 * 60 * 1000)
  const timestampMs = date.getTime()
  return timestampMs <= now && timestampMs >= fiveYearsAgo
}

/**
 * Calculate gas used for a transaction (75000-100000 range)
 */
export function calculateGasUsed(blockNumber: number): string {
  const base = 75000 + (blockNumber % 25000)
  return base.toString()
}

/**
 * Calculate current gas price (15-50 Gwei range)
 */
export function calculateGasPrice(): string {
  const gwei = 15 + Math.floor(Math.random() * 35)
  return `${gwei} Gwei`
}

/**
 * Simulate verification process with blockchain-only validation
 * Confidence score based on 6 blockchain factors (100 points total):
 * 1. Blockchain hash validity (30 points)
 * 2. Supply chain completeness (25 points)
 * 3. Number of confirmations (15 points)
 * 4. Manufacturer blockchain history (15 points)
 * 5. Historical verifications (10 points)
 * 6. Cryptographic signature validity (5 points)
 */
export async function simulateVerification(
  productId: string,
  walletAddress?: string
): Promise<VerificationResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const product = getProductById(productId)
  const supplyChain = getSupplyChain(productId)
  const verificationHistory = getVerificationHistory(productId)

  const verifierId = walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`
  const blockNumber = CURRENT_BLOCK_NUMBER - Math.floor(Math.random() * 1000)
  const confirmations = calculateConfirmations(blockNumber)

  if (!product) {
    return {
      isAuthentic: false,
      confidenceScore: 0,
      supplyChain: [],
      verificationTimestamp: Date.now(),
      verificationMethod: "blockchain",
      verifierId,
      blockExplorerUrl: `https://sepolia.etherscan.io/address/${PRODUCT_REGISTRY_ADDRESS}`,
      blockchainProof: {
        hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        blockNumber: 0,
        transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        network: "Ethereum Sepolia",
        timestamp: Date.now(),
        gasUsed: "0",
        gasPrice: "0 Gwei",
        confirmations: 0,
        contractAddress: PRODUCT_REGISTRY_ADDRESS,
        from: verifierId,
        to: PRODUCT_REGISTRY_ADDRESS,
      },
      dataIntegrity: {
        hashValid: false,
        signatureValid: false,
        timestampValid: false,
        supplyChainComplete: false,
        blockchainConfirmed: false,
        warnings: ["Product not found in blockchain registry"],
      },
    }
  }

  // Calculate confidence score based on 6 blockchain factors
  let confidenceScore = 0
  const warnings: string[] = []

  // Factor 1: Blockchain hash validity (30 points)
  const hashValid = validateBlockchainHash(product.blockchainHash)
  if (hashValid) {
    confidenceScore += 30
  } else {
    warnings.push("Invalid blockchain hash format")
  }

  // Factor 2: Supply chain completeness (25 points)
  const supplyChainSteps = supplyChain.length
  let supplyChainComplete = false
  if (supplyChainSteps >= 4) {
    confidenceScore += 25
    supplyChainComplete = true
  } else if (supplyChainSteps === 3) {
    confidenceScore += 18
    warnings.push("Supply chain incomplete: only 3 checkpoints verified")
  } else if (supplyChainSteps === 2) {
    confidenceScore += 10
    warnings.push("Supply chain incomplete: only 2 checkpoints verified")
  } else {
    warnings.push("Supply chain incomplete: less than 2 checkpoints")
  }
  
  // Check for failed supply chain steps
  const hasFailedSteps = supplyChain.some(step => step.status === "failed")
  if (hasFailedSteps) {
    confidenceScore = Math.max(0, confidenceScore - 20)
    warnings.push("Supply chain contains failed checkpoints")
  }

  // Factor 3: Number of confirmations (15 points)
  if (confirmations >= 12) {
    confidenceScore += 15
  } else if (confirmations >= 6) {
    confidenceScore += 10
    warnings.push("Confirmations below optimal threshold (< 12)")
  } else if (confirmations >= 3) {
    confidenceScore += 5
    warnings.push("Low confirmation count (< 6)")
  } else {
    warnings.push("Very low confirmation count (< 3)")
  }

  // Factor 4: Manufacturer blockchain history (15 points)
  const manufacturerProducts = mockProducts.filter(
    p => p.manufacturer === product.manufacturer && p.status === "verified"
  ).length
  if (manufacturerProducts >= 50) {
    confidenceScore += 15
  } else if (manufacturerProducts >= 20) {
    confidenceScore += 12
  } else if (manufacturerProducts >= 5) {
    confidenceScore += 8
  } else {
    confidenceScore += 3
    warnings.push("Manufacturer has limited blockchain history")
  }

  // Factor 5: Historical verifications (10 points)
  const verificationCount = product.verificationCount
  const counterfeitFlags = verificationHistory.filter(v => v.result === "counterfeit").length
  
  if (counterfeitFlags > 0) {
    confidenceScore = Math.max(0, confidenceScore - 30)
    warnings.push("Product has previous counterfeit flags")
  } else if (verificationCount >= 100) {
    confidenceScore += 10
  } else if (verificationCount >= 50) {
    confidenceScore += 8
  } else if (verificationCount >= 10) {
    confidenceScore += 5
  } else if (verificationCount >= 1) {
    confidenceScore += 2
  }

  // Factor 6: Cryptographic signature validity (5 points)
  const signatureValid = validateCryptographicSignature(product)
  if (signatureValid) {
    confidenceScore += 5
  } else {
    warnings.push("Cryptographic signature validation failed")
  }

  // Timestamp validation
  const timestampValid = validateTimestamp(product.registeredDate)
  if (!timestampValid) {
    warnings.push("Product registration timestamp is invalid")
  }

  // Final authentication determination
  const isAuthentic = product.status === "verified" && confidenceScore >= 70
  const blockchainConfirmed = hashValid && confirmations >= 3

  // Generate transaction hash
  const txHash = `0x${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`

  return {
    isAuthentic,
    confidenceScore: Math.min(100, Math.max(0, Math.round(confidenceScore))),
    productData: product,
    supplyChain,
    verificationTimestamp: Date.now(),
    verificationMethod: "blockchain",
    verifierId,
    blockExplorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
    blockchainProof: {
      hash: product.blockchainHash,
      blockNumber,
      transactionHash: txHash,
      network: "Ethereum Sepolia",
      timestamp: Date.now(),
      gasUsed: calculateGasUsed(blockNumber),
      gasPrice: calculateGasPrice(),
      confirmations,
      contractAddress: PRODUCT_REGISTRY_ADDRESS,
      from: verifierId,
      to: PRODUCT_REGISTRY_ADDRESS,
    },
    dataIntegrity: {
      hashValid,
      signatureValid,
      timestampValid,
      supplyChainComplete,
      blockchainConfirmed,
      warnings,
    },
  }
}

/**
 * Get analytics for a time range
 */
export function getVerificationStats(timeRange: "day" | "week" | "month"): AnalyticsData {
  const filtered = mockVerifications.filter(() => {
    // In real app, filter by timeRange
    return true
  })

  const verifiedCount = filtered.filter((v) => v.result === "verified").length
  const counterfeitCount = filtered.filter((v) => v.result === "counterfeit").length
  const suspiciousCount = filtered.filter((v) => v.result === "suspicious").length

  const avgScore =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((sum, v) => sum + v.confidenceScore, 0) / filtered.length
        )
      : 0

  return {
    totalVerifications: filtered.length,
    verifiedCount,
    counterfeitCount,
    suspiciousCount,
    averageConfidenceScore: avgScore,
  }
}

/**
 * Enhanced Analytics Data with Blockchain Metrics
 */
export interface EnhancedAnalyticsData extends AnalyticsData {
  blockchainMetrics: {
    totalBlocks: number
    averageBlockTime: string
    currentGasPrice: string
    networkHashRate: string
    pendingTransactions: number
    contractInteractions: number
    totalGasUsed: string
    averageConfirmationTime: string
    lastBlockNumber: number
    lastBlockTimestamp: number
  }
  smartContractStats: {
    productRegistryAddress: string
    verificationRegistryAddress: string
    contractVersion: string
    contractVerified: boolean
    contractBalance: string
    totalTransactions: number
    successfulTransactions: number
    failedTransactions: number
    averageGasPerTransaction: string
    deploymentBlock: number
    deploymentDate: string
  }
}

/**
 * Mock Enhanced Analytics Data
 */
export const mockAnalytics: EnhancedAnalyticsData = {
  // Basic analytics
  totalVerifications: 12847,
  verifiedCount: 12178,
  counterfeitCount: 589,
  suspiciousCount: 80,
  averageConfidenceScore: 94,

  // Blockchain metrics
  blockchainMetrics: {
    totalBlocks: CURRENT_BLOCK_NUMBER,
    averageBlockTime: "15.2s",
    currentGasPrice: "23.5 Gwei",
    networkHashRate: "892.4 TH/s",
    pendingTransactions: 42,
    contractInteractions: 25694,
    totalGasUsed: "2,147,483,647",
    averageConfirmationTime: "1.2s",
    lastBlockNumber: CURRENT_BLOCK_NUMBER,
    lastBlockTimestamp: Date.now(),
  },

  // Smart contract statistics
  smartContractStats: {
    productRegistryAddress: PRODUCT_REGISTRY_ADDRESS,
    verificationRegistryAddress: "0x8B3192f2ecD3E1f2e1f5cE4a3dF9b2d3c4e5f6a7",
    contractVersion: "v1.2.0",
    contractVerified: true,
    contractBalance: "12.47 ETH",
    totalTransactions: 25694,
    successfulTransactions: 25512,
    failedTransactions: 182,
    averageGasPerTransaction: "87,432 gas",
    deploymentBlock: 4500000,
    deploymentDate: "2024-12-15T10:00:00Z",
  },
}

/**
 * Get enhanced analytics with blockchain metrics
 */
export function getEnhancedAnalytics(timeRange: "day" | "week" | "month" = "week"): EnhancedAnalyticsData {
  const baseStats = getVerificationStats(timeRange)
  
  return {
    ...baseStats,
    blockchainMetrics: mockAnalytics.blockchainMetrics,
    smartContractStats: mockAnalytics.smartContractStats,
  }
}

/**
 * Generate mock QR code data URL (base64 encoded)
 * In production, use a QR code library like 'qrcode.react'
 */
export function generateMockQRCode(productId: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Crect fill='%23000' x='20' y='20' width='60' height='60'/%3E%3Crect fill='%23000' x='120' y='20' width='60' height='60'/%3E%3Crect fill='%23000' x='20' y='120' width='60' height='60'/%3E%3Ctext x='100' y='150' font-size='12' text-anchor='middle' fill='%23000'%3E${productId}%3C/text%3E%3C/svg%3E`
}

/**
 * Generate realistic blockchain hash
 */
export function generateBlockchainHash(): string {
  const chars = "0123456789abcdef"
  let hash = "0x"
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return hash
}
