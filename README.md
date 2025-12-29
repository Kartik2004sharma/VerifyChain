# 🛡️ VerifyChain - Blockchain Product Authentication System

A decentralized product authentication and counterfeit detection platform built on Ethereum blockchain.

## 🌟 Features

### Product Authentication
- **Blockchain Registration**: Register products permanently on the blockchain
- **QR Code Verification**: Scan products to verify authenticity
- **Manufacturer Management**: Register as a manufacturer and manage your products
- **Real-time Verification**: Instant verification with confidence scores

### Supply Chain Tracking
- **Multi-step Tracking**: Track products through the entire supply chain
- **Location Verification**: GPS-based location tracking for each step
- **Status Updates**: Real-time status updates (In Transit, Delivered, etc.)
- **Event History**: Complete audit trail of all supply chain events

### Analytics & Reporting
- **Global Statistics**: View verification trends and success rates
- **Manufacturer Dashboard**: Track your products and verifications
- **Counterfeit Detection**: Identify and report counterfeit products
- **Blockchain Activity**: Real-time activity feed from the blockchain

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask wallet
- Sepolia testnet ETH (for gas fees)
- Get free Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Kartik2004sharma/Cardfi.git
cd Cardfi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values:
# - Add your WalletConnect Project ID from https://cloud.walletconnect.com/

# Run development server (optimized)
npm run dev:fast
```

Visit `http://localhost:3000` to see the application.

### First-Time Setup

1. **Connect MetaMask** - Click "Connect Wallet" in the navigation
2. **Switch to Sepolia** - Make sure you're on Sepolia testnet
3. **Get Test ETH** - Use the faucet link above if needed
4. **Register as Manufacturer** - Go to Dashboard → Register Manufacturer
5. **Start Registering Products** - Now you can add products to the blockchain!

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Blockchain**: Ethereum, Wagmi, Viem, RainbowKit
- **Smart Contracts**: Solidity, Hardhat
- **Network**: Sepolia Testnet

## 📦 Smart Contracts

### Deployed Contracts (Sepolia Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| ProductRegistry | `0x2BD03E56dEd1C4A37fc933FCaAe010183451B768` | Product registration |
| VerificationRegistry | `0xEAaA8fF50c4833d79b5699DeC2DB10e8c9304E0D` | Verification records |
| SupplyChainTracker | `0xe949FcAe3C78187E6e961F00E9D6F29776405913` | Supply chain tracking |
| CounterfeitReporter | `0xd67A6d895Ef32B6d17a10e03CA09EeaE091040F4` | Counterfeit reporting |

## 📱 User Guide

### For Manufacturers

1. **Register as Manufacturer**
   - Go to Dashboard → Register Manufacturer
   - Enter your company name
   - Approve the transaction in MetaMask

2. **Register Products**
   - Go to Dashboard → Register Product
   - Fill in product details (name, category, description)
   - Upload product image (optional)
   - Submit to blockchain

3. **Track Your Products**
   - View all registered products in your dashboard
   - Monitor verification statistics
   - See recent verifications

### For Consumers

1. **Verify Products**
   - Go to Dashboard → Verify Product
   - Enter product ID or scan QR code
   - View verification result with confidence score
   - Check blockchain proof

2. **View Supply Chain**
   - Access supply chain tracker
   - See complete product journey
   - Verify each step's authenticity

## 🛠️ Development

### Project Structure

```
verifychain/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   └── api/              # API routes
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/              # Reusable UI components
├── contracts/            # Solidity smart contracts
├── hooks/               # Custom React hooks
│   └── blockchain/     # Blockchain interaction hooks
├── lib/                 # Utility libraries
│   ├── contracts/      # Contract ABIs and configs
│   └── blockchain-verification.ts
└── public/             # Static assets
```

### Available Scripts

```bash
# Development with optimizations
npm run dev:fast

# Standard development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Clean cache
npm run clean

# Lint code
npm run lint
```

### Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

## 🔐 Security

- All product data is stored on-chain
- IPFS integration for metadata storage
- Cryptographic hashing for data integrity
- Multi-signature verification support
- Event-based audit trail

## 📊 Performance Optimizations

- Turbopack for faster builds
- Dynamic imports for heavy components
- Optimized package imports
- React Server Components
- Edge runtime support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for educational and research purposes.

## � Deployment

### Deploy to Vercel (Recommended)

VerifyChain is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the Vercel dashboard:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_ENABLE_TESTNETS=true`
4. Deploy! 🎉

**Note**: Smart contracts are already deployed on Sepolia testnet - no need to redeploy them!

### Deploy to Netlify (Alternative)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables Required

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- `NEXT_PUBLIC_ENABLE_TESTNETS=true` - Enable testnet support

## �🔗 Important Links

- **Live Demo**: [Deploy and add your link here]
- **Sepolia Etherscan**: [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
- **WalletConnect Cloud**: [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
- **Sepolia Faucet**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
- **MetaMask**: [https://metamask.io/](https://metamask.io/)

## 🔧 Troubleshooting

### Common Issues

**MetaMask "Failed to fetch" Error**
- This is normal when the page loads before wallet connection
- Simply connect your wallet and the error will disappear

**WagmiProvider Error**
- Refresh the page after connecting your wallet
- Make sure you're accessing the site through localhost:3000

**No Products Found**
- Register a product first using "Register Product" page
- Make sure you're connected to Sepolia testnet
- Check that the transaction was confirmed on the blockchain

**Slow Performance**
- Use `npm run dev:fast` for optimized development
- Clear browser cache and restart the dev server
- Ensure you have at least 8GB RAM available

### Getting Help

- Check browser console for error messages
- Verify you're on Sepolia testnet in MetaMask
- Ensure you have enough ETH for gas fees
- Check [Sepolia Etherscan](https://sepolia.etherscan.io/) for transaction status

## 👨‍💻 Author

**Kartik Sharma**
- GitHub: [@Kartik2004sharma](https://github.com/Kartik2004sharma)
- GitHub: [@JeeyaSharma](https://github.com/JeeyaSharma)


---

Built with ❤️ using Next.js, Ethereum, and Web3 technologies
