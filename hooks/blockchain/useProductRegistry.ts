import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { contracts } from '@/lib/wagmi-config'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { keccak256, toBytes } from 'viem'

export interface ProductRegistrationData {
  productId: string
  productName: string
  dataHash: `0x${string}`
  metadataURI: string
}

export function useProductRegistry() {
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)

  // Write contract hook for registration
  const { writeContract, data: hash, error: writeError } = useWriteContract()

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Check if product is registered
   */
  const useIsProductRegistered = (productId: string) => {
    return useReadContract({
      ...contracts.productRegistry,
      functionName: 'isProductRegistered',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get product details
   */
  const useGetProduct = (productId: string) => {
    return useReadContract({
      ...contracts.productRegistry,
      functionName: 'getProduct',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get manufacturer details
   */
  const useGetManufacturer = (address: `0x${string}`) => {
    return useReadContract({
      ...contracts.productRegistry,
      functionName: 'getManufacturer',
      args: [address],
      query: {
        enabled: !!address,
      },
    })
  }

  /**
   * Get manufacturer product count
   */
  const useGetManufacturerProductCount = (address: `0x${string}`) => {
    return useReadContract({
      ...contracts.productRegistry,
      functionName: 'getManufacturerProductCount',
      args: [address],
      query: {
        enabled: !!address,
      },
    })
  }

  /**
   * Register as manufacturer
   */
  const registerManufacturer = async (companyName: string) => {
    try {
      setIsRegistering(true)

      await writeContract({
        ...contracts.productRegistry,
        functionName: 'registerManufacturer',
        args: [companyName],
      })

      toast({
        title: 'Registration Submitted',
        description: 'Waiting for blockchain confirmation...',
      })

      return true
    } catch (error) {
      console.error('Error registering manufacturer:', error)
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsRegistering(false)
    }
  }

  /**
   * Register a product on blockchain
   */
  const registerProduct = async (data: ProductRegistrationData) => {
    try {
      setIsRegistering(true)

      await writeContract({
        ...contracts.productRegistry,
        functionName: 'registerProduct',
        args: [
          data.productId,
          data.productName,
          data.dataHash,
          data.metadataURI,
        ],
      })

      toast({
        title: 'Product Registration Submitted',
        description: 'Waiting for blockchain confirmation...',
      })

      return true
    } catch (error) {
      console.error('Error registering product:', error)
      toast({
        title: 'Product Registration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsRegistering(false)
    }
  }

  /**
   * Batch register products
   */
  const batchRegisterProducts = async (products: ProductRegistrationData[]) => {
    try {
      setIsRegistering(true)

      const productIds = products.map(p => p.productId)
      const names = products.map(p => p.productName)
      const hashes = products.map(p => p.dataHash)
      const uris = products.map(p => p.metadataURI)

      await writeContract({
        ...contracts.productRegistry,
        functionName: 'batchRegisterProducts',
        args: [productIds, names, hashes, uris],
      })

      toast({
        title: 'Batch Registration Submitted',
        description: `Registering ${products.length} products...`,
      })

      return true
    } catch (error) {
      console.error('Error batch registering products:', error)
      toast({
        title: 'Batch Registration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsRegistering(false)
    }
  }

  /**
   * Generate data hash from product data
   */
  const generateDataHash = (data: object): `0x${string}` => {
    const dataString = JSON.stringify(data)
    return keccak256(toBytes(dataString))
  }

  return {
    // Read functions (hooks)
    useIsProductRegistered,
    useGetProduct,
    useGetManufacturer,
    useGetManufacturerProductCount,

    // Write functions
    registerManufacturer,
    registerProduct,
    batchRegisterProducts,

    // Utilities
    generateDataHash,

    // State
    isRegistering: isRegistering || isConfirming,
    isConfirmed,
    transactionHash: hash,
    error: writeError,
  }
}
