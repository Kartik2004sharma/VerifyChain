import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { contracts } from '@/lib/wagmi-config'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { keccak256, toBytes } from 'viem'

export function useSupplyChainTracker() {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Get supply chain steps count
   */
  const useGetSupplyChainSteps = (productId: string) => {
    return useReadContract({
      ...contracts.supplyChainTracker,
      functionName: 'getSupplyChainSteps',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get specific supply chain step
   */
  const useGetSupplyChainStep = (productId: string, stepIndex: number) => {
    return useReadContract({
      ...contracts.supplyChainTracker,
      functionName: 'getSupplyChainStep',
      args: [productId, BigInt(stepIndex)],
      query: {
        enabled: !!productId && stepIndex >= 0,
      },
    })
  }

  /**
   * Get complete supply chain
   */
  const useGetCompleteSupplyChain = (productId: string) => {
    return useReadContract({
      ...contracts.supplyChainTracker,
      functionName: 'getCompleteSupplyChain',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get supply chain info
   */
  const useGetSupplyChainInfo = (productId: string) => {
    return useReadContract({
      ...contracts.supplyChainTracker,
      functionName: 'getSupplyChainInfo',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Verify supply chain integrity
   */
  const useVerifySupplyChainIntegrity = (productId: string) => {
    return useReadContract({
      ...contracts.supplyChainTracker,
      functionName: 'verifySupplyChainIntegrity',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Check if handler is authorized
   */
  const useIsHandlerAuthorized = (address: `0x${string}`) => {
    return useReadContract({
      ...contracts.supplyChainTracker,
      functionName: 'isHandlerAuthorized',
      args: [address],
      query: {
        enabled: !!address,
      },
    })
  }

  /**
   * Initialize supply chain
   */
  const initializeSupplyChain = async (
    productId: string,
    location: string,
    action: string,
    proofData: object,
    notes: string
  ) => {
    try {
      setIsUpdating(true)

      const proofHash = keccak256(toBytes(JSON.stringify(proofData)))

      await writeContract({
        ...contracts.supplyChainTracker,
        functionName: 'initializeSupplyChain',
        args: [productId, location, action, proofHash, notes],
      })

      toast({
        title: 'Supply Chain Initialized',
        description: 'Recording initial step on blockchain...',
      })

      return true
    } catch (error) {
      console.error('Error initializing supply chain:', error)
      toast({
        title: 'Initialization Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Add supply chain step
   */
  const addSupplyChainStep = async (
    productId: string,
    location: string,
    action: string,
    proofData: object,
    notes: string
  ) => {
    try {
      setIsUpdating(true)

      const proofHash = keccak256(toBytes(JSON.stringify(proofData)))

      await writeContract({
        ...contracts.supplyChainTracker,
        functionName: 'addSupplyChainStep',
        args: [productId, location, action, proofHash, notes],
      })

      toast({
        title: 'Step Added',
        description: 'Adding supply chain checkpoint...',
      })

      return true
    } catch (error) {
      console.error('Error adding supply chain step:', error)
      toast({
        title: 'Step Addition Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Complete supply chain
   */
  const completeSupplyChain = async (productId: string) => {
    try {
      setIsUpdating(true)

      await writeContract({
        ...contracts.supplyChainTracker,
        functionName: 'completeSupplyChain',
        args: [productId],
      })

      toast({
        title: 'Supply Chain Completed',
        description: 'Marking product as delivered...',
      })

      return true
    } catch (error) {
      console.error('Error completing supply chain:', error)
      toast({
        title: 'Completion Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    // Read functions
    useGetSupplyChainSteps,
    useGetSupplyChainStep,
    useGetCompleteSupplyChain,
    useGetSupplyChainInfo,
    useVerifySupplyChainIntegrity,
    useIsHandlerAuthorized,

    // Write functions
    initializeSupplyChain,
    addSupplyChainStep,
    completeSupplyChain,

    // State
    isUpdating: isUpdating || isConfirming,
    isConfirmed,
    transactionHash: hash,
    error: writeError,
  }
}
