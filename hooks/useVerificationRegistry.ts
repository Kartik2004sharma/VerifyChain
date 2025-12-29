'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

// Contract addresses
const VERIFICATION_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_SEPOLIA_VERIFICATION_REGISTRY_ADDRESS as `0x${string}`;

// Contract ABI - VerificationRegistry
const VERIFICATION_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "getTotalVerifications",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "getProductVerifications",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "verificationId", "type": "uint256"},
          {"internalType": "uint256", "name": "productId", "type": "uint256"},
          {"internalType": "address", "name": "verifier", "type": "address"},
          {"internalType": "bool", "name": "isGenuine", "type": "bool"},
          {"internalType": "uint256", "name": "confidenceScore", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "string", "name": "proofHash", "type": "string"}
        ],
        "internalType": "struct VerificationRegistry.Verification[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "getVerificationStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalVerifications", "type": "uint256"},
      {"internalType": "uint256", "name": "genuineCount", "type": "uint256"},
      {"internalType": "uint256", "name": "counterfeitCount", "type": "uint256"},
      {"internalType": "uint256", "name": "averageConfidence", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "bool", "name": "isGenuine", "type": "bool"},
      {"internalType": "uint256", "name": "confidenceScore", "type": "uint256"},
      {"internalType": "string", "name": "proofHash", "type": "string"}
    ],
    "name": "recordVerification",
    "outputs": [{"internalType": "uint256", "name": "verificationId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "productId", "type": "uint256"},
          {"internalType": "bool", "name": "isGenuine", "type": "bool"},
          {"internalType": "uint256", "name": "confidenceScore", "type": "uint256"},
          {"internalType": "string", "name": "proofHash", "type": "string"}
        ],
        "internalType": "struct VerificationRegistry.VerificationInput[]",
        "name": "verifications",
        "type": "tuple[]"
      }
    ],
    "name": "batchRecordVerifications",
    "outputs": [{"internalType": "uint256[]", "name": "verificationIds", "type": "uint256[]"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "verificationId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "productId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "verifier", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "isGenuine", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "confidenceScore", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "VerificationRecorded",
    "type": "event"
  }
] as const;

// Hook to get total verifications
export function useTotalVerifications() {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: VERIFICATION_REGISTRY_ADDRESS,
    abi: VERIFICATION_REGISTRY_ABI,
    functionName: 'getTotalVerifications',
    chainId,
  });

  return {
    totalVerifications: data ? Number(data) : 0,
    isLoading,
    error,
    refetch
  };
}

// Hook to get product verifications
export function useProductVerifications(productId: number) {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: VERIFICATION_REGISTRY_ADDRESS,
    abi: VERIFICATION_REGISTRY_ABI,
    functionName: 'getProductVerifications',
    args: [BigInt(productId)],
    chainId,
  });

  return {
    verifications: data ? data.map((v: any) => ({
      verificationId: Number(v.verificationId),
      productId: Number(v.productId),
      verifier: v.verifier,
      isGenuine: v.isGenuine,
      confidenceScore: Number(v.confidenceScore),
      timestamp: Number(v.timestamp),
      proofHash: v.proofHash
    })) : [],
    isLoading,
    error,
    refetch
  };
}

// Hook to get verification stats for a product
export function useVerificationStats(productId: number) {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: VERIFICATION_REGISTRY_ADDRESS,
    abi: VERIFICATION_REGISTRY_ABI,
    functionName: 'getVerificationStats',
    args: [BigInt(productId)],
    chainId,
  });

  return {
    stats: data ? {
      totalVerifications: Number(data[0]),
      genuineCount: Number(data[1]),
      counterfeitCount: Number(data[2]),
      averageConfidence: Number(data[3])
    } : null,
    isLoading,
    error,
    refetch
  };
}

// Hook to record a verification
export function useRecordVerification() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const recordVerification = async (
    productId: number,
    isGenuine: boolean,
    confidenceScore: number,
    proofHash: string
  ) => {
    try {
      writeContract({
        address: VERIFICATION_REGISTRY_ADDRESS,
        abi: VERIFICATION_REGISTRY_ABI,
        functionName: 'recordVerification',
        args: [BigInt(productId), isGenuine, BigInt(confidenceScore), proofHash],
      });
    } catch (err) {
      console.error('Error recording verification:', err);
      toast.error('Failed to record verification');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Verification recorded on blockchain!');
    }
  }, [isSuccess]);

  return {
    recordVerification,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}

// Hook to batch record verifications
export function useBatchRecordVerifications() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const batchRecordVerifications = async (
    verifications: Array<{
      productId: number;
      isGenuine: boolean;
      confidenceScore: number;
      proofHash: string;
    }>
  ) => {
    try {
      const verificationInputs = verifications.map(v => ({
        productId: BigInt(v.productId),
        isGenuine: v.isGenuine,
        confidenceScore: BigInt(v.confidenceScore),
        proofHash: v.proofHash
      }));

      writeContract({
        address: VERIFICATION_REGISTRY_ADDRESS,
        abi: VERIFICATION_REGISTRY_ABI,
        functionName: 'batchRecordVerifications',
        args: [verificationInputs],
      });
    } catch (err) {
      console.error('Error batch recording verifications:', err);
      toast.error('Failed to batch record verifications');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Verifications batch recorded on blockchain!');
    }
  }, [isSuccess]);

  return {
    batchRecordVerifications,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}
