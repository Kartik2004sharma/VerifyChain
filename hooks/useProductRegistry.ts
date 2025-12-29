'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Contract addresses
const PRODUCT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_SEPOLIA_PRODUCT_REGISTRY_ADDRESS as `0x${string}`;

// Contract ABI - ProductRegistry
const PRODUCT_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "getTotalProductCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "manufacturer", "type": "address"}],
    "name": "getManufacturer",
    "outputs": [
      {"internalType": "string", "name": "companyName", "type": "string"},
      {"internalType": "bool", "name": "isRegistered", "type": "bool"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "registrationTime", "type": "uint256"},
      {"internalType": "uint256", "name": "productCount", "type": "uint256"},
      {"internalType": "uint256", "name": "reputationScore", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "productId", "type": "string"}],
    "name": "isProductRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "productId", "type": "string"}],
    "name": "getProduct",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "address", "name": "manufacturer", "type": "address"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"},
      {"internalType": "string", "name": "metadataURI", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "productId", "type": "string"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
      {"internalType": "string", "name": "metadataURI", "type": "string"}
    ],
    "name": "registerProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "companyName", "type": "string"}],
    "name": "registerManufacturer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "productId", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "manufacturer", "type": "address"},
      {"indexed": false, "internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256"}
    ],
    "name": "ProductRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "manufacturer", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "companyName", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "ManufacturerRegistered",
    "type": "event"
  }
] as const;

// Hook to get total product count
export function useProductCount() {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'getTotalProductCount',
    chainId,
    query: {
      enabled: !!PRODUCT_REGISTRY_ADDRESS,
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  return {
    productCount: data ? Number(data) : 0,
    isLoading,
    error,
    refetch
  };
}

// Hook to get total manufacturer count - removed as function doesn't exist in contract

// Hook to get product details
export function useProductDetails(productId: string) {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'getProduct',
    args: productId ? [productId] : undefined,
    chainId,
  });

  return {
    product: data ? {
      name: data[0],
      manufacturer: data[1],
      timestamp: Number(data[2]),
      dataHash: data[3],
      isVerified: data[4],
      metadataURI: data[5]
    } : null,
    isLoading,
    error,
    refetch
  };
}

// Hook to get manufacturer info
export function useManufacturerInfo(address: `0x${string}` | undefined) {
  const chainId = useChainId();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'getManufacturer',
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: !!address && !!PRODUCT_REGISTRY_ADDRESS,
    }
  });

  return {
    manufacturer: data ? {
      name: data[0] as string,
      isRegistered: data[1] as boolean,
      isActive: data[2] as boolean,
      registrationDate: Number(data[3]),
      productCount: Number(data[4]),
      reputationScore: Number(data[5]),
    } : null,
    isLoading,
    error,
    refetch
  };
}

// Hook to register a manufacturer
export function useRegisterManufacturer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const registerManufacturer = async (companyName: string) => {
    try {
      console.log('🏭 Registering manufacturer:', companyName);
      console.log('📍 Contract address:', PRODUCT_REGISTRY_ADDRESS);
      
      writeContract({
        address: PRODUCT_REGISTRY_ADDRESS,
        abi: PRODUCT_REGISTRY_ABI,
        functionName: 'registerManufacturer',
        args: [companyName],
      });
    } catch (err) {
      console.error('❌ Error registering manufacturer:', err);
      toast.error('Failed to register manufacturer');
      throw err;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Manufacturer registered successfully!', { duration: 5000 });
    }
    if (error) {
      console.error('❌ Registration error:', error);
      toast.error(`Registration failed: ${error.message}`);
    }
  }, [isSuccess, error]);

  return {
    registerManufacturer,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}

// Hook to register a product
export function useRegisterProduct() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const registerProduct = async (productId: string, name: string, description: string, metadataURI: string) => {
    try {
      // Generate data hash from product description
      const dataHash = `0x${Buffer.from(description).toString('hex').padEnd(64, '0').slice(0, 64)}` as `0x${string}`;
      
      writeContract({
        address: PRODUCT_REGISTRY_ADDRESS,
        abi: PRODUCT_REGISTRY_ABI,
        functionName: 'registerProduct',
        args: [productId, name, dataHash, metadataURI],
      });
    } catch (err) {
      console.error('Error registering product:', err);
      toast.error('Failed to register product');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Product registered successfully on blockchain!');
    }
    if (error) {
      console.error('Registration error:', error);
      toast.error(`Registration failed: ${error.message}`);
    }
  }, [isSuccess, error]);

  return {
    registerProduct,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}
