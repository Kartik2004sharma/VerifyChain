'use client'

import { http, createConfig } from 'wagmi'
import { sepolia, localhost } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Import contract addresses and ABIs
import contractAddresses from './contracts/addresses.json'
import { ABIS } from './contracts/abis'

// Contract addresses with fallbacks
export const PRODUCT_REGISTRY_ADDRESS = (
	contractAddresses?.ProductRegistry || 
	process.env.NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS || 
	'0x742d35Cc6634C0532925a3b844Bc9e7595f35bA'
) as `0x${string}`

export const VERIFICATION_REGISTRY_ADDRESS = (
	contractAddresses?.VerificationRegistry || 
	process.env.NEXT_PUBLIC_VERIFICATION_REGISTRY_ADDRESS || 
	'0x8f3e42Cc8845D1532925b4c955Cd0e8706g46cB'
) as `0x${string}`

export const SUPPLY_CHAIN_TRACKER_ADDRESS = (
	contractAddresses?.SupplyChainTracker || 
	process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS || 
	'0x9g4f53Dd9956E2643036c5d066De1f9817h57dC'
) as `0x${string}`

export const COUNTERFEIT_REPORTER_ADDRESS = (
	contractAddresses?.CounterfeitReporter || 
	process.env.NEXT_PUBLIC_COUNTERFEIT_REPORTER_ADDRESS || 
	'0xa5g64Ee0067F3754147d6e177Ef2g0928i68eD'
) as `0x${string}`

// Export ABIs for use in components
export const ProductRegistryABI = ABIS.ProductRegistry
export const VerificationRegistryABI = ABIS.VerificationRegistry
export const SupplyChainTrackerABI = ABIS.SupplyChainTracker
export const CounterfeitReporterABI = ABIS.CounterfeitReporter

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Configure chains
const chains = [sepolia, localhost] as const

// Lazy config initialization to avoid SSR issues
let _wagmiConfig: ReturnType<typeof createConfig> | null = null

function getWagmiConfig() {
	if (_wagmiConfig) return _wagmiConfig

	// Only create config on client side
	if (typeof window === 'undefined') {
		// Return a dummy config for SSR
		return createConfig({
			chains,
			connectors: [injected()],
			transports: {
				[sepolia.id]: http('https://rpc.sepolia.org'),
				[localhost.id]: http('http://127.0.0.1:8545'),
			},
		})
	}

	// Build connectors array conditionally (client-side only)
	const connectors = [
		injected(),
		...(projectId ? [
			walletConnect({ 
				projectId,
				showQrModal: true,
				metadata: {
					name: 'VerifyChain',
					description: 'Blockchain-based Product Authentication System',
					url: typeof window !== 'undefined' ? window.location.origin : 'https://verifychain.app',
					icons: ['https://verifychain.app/icon.png']
				}
			})
		] : []),
		coinbaseWallet({
			appName: 'VerifyChain',
			appLogoUrl: 'https://verifychain.app/icon.png'
		}),
	]

	_wagmiConfig = createConfig({
		chains,
		connectors,
		transports: {
			[sepolia.id]: http(
				process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
			),
			[localhost.id]: http('http://127.0.0.1:8545'),
		},
	})

	return _wagmiConfig
}

// Export the wagmi config
export const wagmiConfig = new Proxy({} as ReturnType<typeof createConfig>, {
	get(target, prop) {
		const config = getWagmiConfig()
		return config[prop as keyof typeof config]
	}
})

// Contract configurations for easy access
export const contracts = {
	productRegistry: {
		address: PRODUCT_REGISTRY_ADDRESS,
		abi: ProductRegistryABI,
	},
	verificationRegistry: {
		address: VERIFICATION_REGISTRY_ADDRESS,
		abi: VerificationRegistryABI,
	},
	supplyChainTracker: {
		address: SUPPLY_CHAIN_TRACKER_ADDRESS,
		abi: SupplyChainTrackerABI,
	},
	counterfeitReporter: {
		address: COUNTERFEIT_REPORTER_ADDRESS,
		abi: CounterfeitReporterABI,
	},
} as const

// Network info
export const NETWORK_INFO = {
	sepolia: {
		chainId: 11155111,
		name: 'Sepolia Testnet',
		explorer: 'https://sepolia.etherscan.io',
		rpcUrl: 'https://rpc.sepolia.org',
	},
	localhost: {
		chainId: 31337,
		name: 'Localhost',
		explorer: 'http://localhost:8545',
		rpcUrl: 'http://127.0.0.1:8545',
	},
}

// Helper function to get block explorer URL
export function getBlockExplorerUrl(txHash: string, chainId: number = 11155111): string {
	if (chainId === 11155111) {
		return `${NETWORK_INFO.sepolia.explorer}/tx/${txHash}`
	}
	return `${NETWORK_INFO.localhost.explorer}/tx/${txHash}`
}

// Helper function to get address explorer URL
export function getAddressExplorerUrl(address: string, chainId: number = 11155111): string {
	if (chainId === 11155111) {
		return `${NETWORK_INFO.sepolia.explorer}/address/${address}`
	}
	return `${NETWORK_INFO.localhost.explorer}/address/${address}`
}

export default wagmiConfig
