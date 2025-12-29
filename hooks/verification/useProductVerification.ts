import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { VerificationResult } from "@/lib/blockchain-verification"

interface UseProductVerificationOptions {
  onSuccess?: (data: VerificationResult) => void
  onError?: (error: Error) => void
  enabled?: boolean
}

/**
 * Custom hook for product verification with React Query
 * Handles API calls, caching, and error handling
 */
export function useProductVerification(options?: UseProductVerificationOptions) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Mutation for single product verification
  const verifyMutation = useMutation({
    mutationFn: async (productId: string): Promise<VerificationResult> => {
      const response = await fetch("/api/blockchain/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Verification failed")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Verification failed")
      }

      return data.data as VerificationResult
    },
    onSuccess: (data) => {
      toast({
        title: "Verification Complete",
        description: data.isAuthentic
          ? "✓ Product verified as authentic!"
          : "⚠ Product verification failed. Please review details.",
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["verifications"] })

      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "An error occurred during verification",
        variant: "destructive",
      })

      options?.onError?.(error)
    },
  })

  // Mutation for batch verification
  const batchVerifyMutation = useMutation({
    mutationFn: async (productIds: string[]): Promise<Map<string, VerificationResult>> => {
      const results = new Map<string, VerificationResult>()

      for (const productId of productIds) {
        const response = await fetch("/api/blockchain/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        })

        if (!response.ok) {
          console.error(`Failed to verify ${productId}`)
          continue
        }

        const data = await response.json()
        if (data.success) {
          results.set(productId, data.data as VerificationResult)
        }
      }

      return results
    },
    onSuccess: () => {
      toast({
        title: "Batch Verification Complete",
        description: "All products have been verified",
      })
      queryClient.invalidateQueries({ queryKey: ["verifications"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Batch Verification Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    // Single product verification
    verify: verifyMutation.mutate,
    verifyAsync: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    verificationError: verifyMutation.error,
    verificationData: verifyMutation.data,
    verificationStatus: verifyMutation.status,

    // Batch verification
    batchVerify: batchVerifyMutation.mutate,
    batchVerifyAsync: batchVerifyMutation.mutateAsync,
    isBatchVerifying: batchVerifyMutation.isPending,
    batchVerificationError: batchVerifyMutation.error,
    batchVerificationData: batchVerifyMutation.data,

    // Reset mutations
    reset: () => {
      verifyMutation.reset()
      batchVerifyMutation.reset()
    },
  }
}

/**
 * Hook to fetch verification history for a product
 */
export function useVerificationHistory(productId: string) {
  return useQuery({
    queryKey: ["verificationHistory", productId],
    queryFn: async () => {
      const response = await fetch(`/api/blockchain/history?productId=${productId}`)
      if (!response.ok) throw new Error("Failed to fetch history")
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch verification stats
 */
export function useVerificationStats(timeRange: "day" | "week" | "month" = "week") {
  return useQuery({
    queryKey: ["verificationStats", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/blockchain/stats?timeRange=${timeRange}`)
      if (!response.ok) throw new Error("Failed to fetch stats")
      return response.json()
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to check if a product exists
 */
export function useProductExists(productId: string) {
  return useQuery({
    queryKey: ["productExists", productId],
    queryFn: async () => {
      const response = await fetch(`/api/blockchain/exists?productId=${productId}`)
      if (!response.ok) throw new Error("Failed to check product")
      const data = await response.json()
      return data.exists as boolean
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!productId,
  })
}
