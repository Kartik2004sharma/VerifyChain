import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { contracts } from '@/lib/wagmi-config'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { keccak256, toBytes } from 'viem'

export function useVerificationRegistry() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)

  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Get verification count
   */
  const useGetVerificationCount = (productId: string) => {
    return useReadContract({
      ...contracts.verificationRegistry,
      functionName: 'getVerificationCount',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get verification history
   */
  const useGetVerificationHistory = (productId: string) => {
    return useReadContract({
      ...contracts.verificationRegistry,
      functionName: 'getVerificationHistory',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get product statistics
   */
  const useGetProductStats = (productId: string) => {
    return useReadContract({
      ...contracts.verificationRegistry,
      functionName: 'getProductStats',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get success rate
   */
  const useGetSuccessRate = (productId: string) => {
    return useReadContract({
      ...contracts.verificationRegistry,
      functionName: 'getSuccessRate',
      args: [productId],
      query: {
        enabled: !!productId,
      },
    })
  }

  /**
   * Get global statistics
   */
  const useGetGlobalStats = () => {
    return useReadContract({
      ...contracts.verificationRegistry,
      functionName: 'getGlobalStats',
    })
  }

  /**
   * Record verification on blockchain
   */
  const recordVerification = async (
    productId: string,
    result: boolean,
    confidenceScore: number,
    location: string,
    proofData: object
  ) => {
    try {
      setIsRecording(true)

      // Generate proof hash
      const proofHash = keccak256(toBytes(JSON.stringify(proofData)))

      await writeContract({
        ...contracts.verificationRegistry,
        functionName: 'recordVerification',
        args: [
          productId,
          result,
          confidenceScore,
          location,
          proofHash,
        ],
      })

      toast({
        title: 'Verification Submitted',
        description: 'Recording verification on blockchain...',
      })

      return true
    } catch (error) {
      console.error('Error recording verification:', error)
      toast({
        title: 'Verification Recording Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsRecording(false)
    }
  }

  /**
   * Batch record verifications
   */
  const batchRecordVerifications = async (
    verifications: Array<{
      productId: string
      result: boolean
      confidenceScore: number
      proofData: object
    }>
  ) => {
    try {
      setIsRecording(true)

      const productIds = verifications.map(v => v.productId)
      const results = verifications.map(v => v.result)
      const scores = verifications.map(v => v.confidenceScore)
      const proofHashes = verifications.map(v => 
        keccak256(toBytes(JSON.stringify(v.proofData)))
      )

      await writeContract({
        ...contracts.verificationRegistry,
        functionName: 'batchRecordVerifications',
        args: [productIds, results, scores, proofHashes],
      })

      toast({
        title: 'Batch Verification Submitted',
        description: `Recording ${verifications.length} verifications...`,
      })

      return true
    } catch (error) {
      console.error('Error batch recording verifications:', error)
      toast({
        title: 'Batch Recording Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsRecording(false)
    }
  }

  return {
    // Read functions
    useGetVerificationCount,
    useGetVerificationHistory,
    useGetProductStats,
    useGetSuccessRate,
    useGetGlobalStats,

    // Write functions
    recordVerification,
    batchRecordVerifications,

    // State
    isRecording: isRecording || isConfirming,
    isConfirmed,
    transactionHash: hash,
    error: writeError,
  }
}
