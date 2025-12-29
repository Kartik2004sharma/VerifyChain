#!/bin/bash

# VerifyChain - Quick Deployment Script
# This script automates the deployment process for VerifyChain smart contracts

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         VerifyChain Quick Deployment Setup                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ -f .env.local ]; then
    echo -e "${GREEN}✓${NC} .env.local found"
else
    echo -e "${YELLOW}!${NC} Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠${NC}  Please edit .env.local and add your:"
    echo "   - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID"
    echo "   - PRIVATE_KEY (for deployment)"
    echo "   - ETHERSCAN_API_KEY (for verification)"
    echo ""
    echo -e "${RED}Press Enter when ready to continue...${NC}"
    read
fi

# Check if WalletConnect ID is set
if grep -q "your_wallet_connect_project_id_here" .env.local; then
    echo -e "${RED}✗${NC} WalletConnect Project ID not set!"
    echo "   Get one from: https://cloud.walletconnect.com/"
    echo "   Update NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in .env.local"
    exit 1
else
    echo -e "${GREEN}✓${NC} WalletConnect Project ID configured"
fi

# Check if private key is set
if grep -q "your_private_key_here" .env.local; then
    echo -e "${YELLOW}⚠${NC}  Private key not set in .env.local"
    echo "   Required for contract deployment"
    echo "   Get Sepolia ETH from: https://sepoliafaucet.com/"
    echo ""
    echo -e "${RED}Press Enter when ready to continue...${NC}"
    read
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Compile contracts
echo ""
echo "Compiling smart contracts..."
npx hardhat compile

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                Ready to Deploy!                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Choose deployment network:"
echo "1) Sepolia Testnet (recommended for testing)"
echo "2) Localhost (for local development)"
echo "3) Mainnet (production - use with caution!)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        NETWORK="sepolia"
        ;;
    2)
        NETWORK="localhost"
        echo ""
        echo "Starting local Hardhat node..."
        echo "Run in a separate terminal: npx hardhat node"
        echo ""
        read -p "Press Enter when node is running..."
        ;;
    3)
        NETWORK="mainnet"
        echo ""
        echo -e "${RED}⚠ WARNING: Deploying to MAINNET${NC}"
        echo "This will use real ETH. Are you sure?"
        read -p "Type 'YES' to confirm: " confirm
        if [ "$confirm" != "YES" ]; then
            echo "Deployment cancelled"
            exit 0
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Deploy contracts
echo ""
echo "Deploying to $NETWORK..."
npx hardhat run scripts/deploy-verification.js --network $NETWORK

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 Deployment Complete!                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Update .env.local with deployed contract addresses"
echo "2. Verify contracts on Etherscan (if deploying to testnet/mainnet)"
echo "3. Run: npm run dev"
echo "4. Test verification flow in the dashboard"
echo ""
