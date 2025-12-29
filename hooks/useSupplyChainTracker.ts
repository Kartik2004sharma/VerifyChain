'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

// Contract addresses
const SUPPLY_CHAIN_TRACKER_ADDRESS = process.env.NEXT_PUBLIC_SEPOLIA_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;

// Contract ABI - SupplyChainTracker
const SUPPLY_CHAIN_TRACKER_ABI = [
  {
    "inputs": [],
    "name": "getActorCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTransferCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "getProductTransferHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "transferId", "type": "uint256"},
          {"internalType": "uint256", "name": "productId", "type": "uint256"},
          {"internalType": "address", "name": "from", "type": "address"},
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "string", "name": "location", "type": "string"},
          {"internalType": "bool", "name": "isAnomaly", "type": "bool"}
        ],
        "internalType": "struct SupplyChainTracker.Transfer[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "getCurrentCustodian",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "actor", "type": "address"}],
    "name": "getActorInfo",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "role", "type": "string"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"},
      {"internalType": "uint256", "name": "registrationDate", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "role", "type": "string"}
    ],
    "name": "registerActor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "location", "type": "string"}
    ],
    "name": "transferCustody",
    "outputs": [{"internalType": "uint256", "name": "transferId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "transferId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "productId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "location", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "CustodyTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "transferId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "AnomalyDetected",
    "type": "event"
  }
] as const;

// Hook to get total actors
export function useActorCount() {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: SUPPLY_CHAIN_TRACKER_ADDRESS,
    abi: SUPPLY_CHAIN_TRACKER_ABI,
    functionName: 'getActorCount',
    chainId,
  });

  return {
    actorCount: data ? Number(data) : 0,
    isLoading,
    error,
    refetch
  };
}

// Hook to get total transfers
export function useTransferCount() {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: SUPPLY_CHAIN_TRACKER_ADDRESS,
    abi: SUPPLY_CHAIN_TRACKER_ABI,
    functionName: 'getTransferCount',
    chainId,
  });

  return {
    transferCount: data ? Number(data) : 0,
    isLoading,
    error,
    refetch
  };
}

// Hook to get product transfer history
export function useProductTransferHistory(productId: number) {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: SUPPLY_CHAIN_TRACKER_ADDRESS,
    abi: SUPPLY_CHAIN_TRACKER_ABI,
    functionName: 'getProductTransferHistory',
    args: [BigInt(productId)],
    chainId,
  });

  return {
    transfers: data ? data.map((t: any) => ({
      transferId: Number(t.transferId),
      productId: Number(t.productId),
      from: t.from,
      to: t.to,
      timestamp: Number(t.timestamp),
      location: t.location,
      isAnomaly: t.isAnomaly
    })) : [],
    isLoading,
    error,
    refetch
  };
}

// Hook to get current custodian of a product
export function useCurrentCustodian(productId: number) {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: SUPPLY_CHAIN_TRACKER_ADDRESS,
    abi: SUPPLY_CHAIN_TRACKER_ABI,
    functionName: 'getCurrentCustodian',
    args: [BigInt(productId)],
    chainId,
  });

  return {
    custodian: data as `0x${string}` | undefined,
    isLoading,
    error,
    refetch
  };
}

// Hook to get actor info
export function useActorInfo(address: `0x${string}` | undefined) {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: SUPPLY_CHAIN_TRACKER_ADDRESS,
    abi: SUPPLY_CHAIN_TRACKER_ABI,
    functionName: 'getActorInfo',
    args: address ? [address] : undefined,
    chainId,
  });

  return {
    actor: data ? {
      name: data[0],
      role: data[1],
      isVerified: data[2],
      registrationDate: Number(data[3])
    } : null,
    isLoading,
    error,
    refetch
  };
}

// Hook to register an actor
export function useRegisterActor() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const registerActor = async (name: string, role: string) => {
    try {
      writeContract({
        address: SUPPLY_CHAIN_TRACKER_ADDRESS,
        abi: SUPPLY_CHAIN_TRACKER_ABI,
        functionName: 'registerActor',
        args: [name, role],
      });
    } catch (err) {
      console.error('Error registering actor:', err);
      toast.error('Failed to register actor');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Actor registered in supply chain!');
    }
  }, [isSuccess]);

  return {
    registerActor,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}

// Hook to transfer custody
export function useTransferCustody() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const transferCustody = async (productId: number, to: `0x${string}`, location: string) => {
    try {
      writeContract({
        address: SUPPLY_CHAIN_TRACKER_ADDRESS,
        abi: SUPPLY_CHAIN_TRACKER_ABI,
        functionName: 'transferCustody',
        args: [BigInt(productId), to, location],
      });
    } catch (err) {
      console.error('Error transferring custody:', err);
      toast.error('Failed to transfer custody');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Custody transferred successfully!');
    }
  }, [isSuccess]);

  return {
    transferCustody,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}
