# ShapeSaga - AI-Powered Collaborative Storytelling Platform

A blockchain-powered platform built on Shape Network that enables users to create, extend, and branch collaborative stories using AI-generated content.

## 🌟 Features

- **Collaborative Storytelling**: Users can create new stories and contribute by extending existing ones or branching into different story arcs
- **AI-Powered Content Generation**: Support for multiple content formats:
  - Text-based stories
  - Image-based comics
  - Short video narratives
- **Blockchain Integration**: Built on Shape Network for decentralized ownership and governance
- **Story Branching**: Multiple narrative paths and community-driven story development
- **NFT Support**: Stories and contributions can be minted as NFTs

## 🏗️ Project Structure

```
ShapeSaga/
├── api/                     # Vercel API routes
├── contracts/               # Hardhat smart contracts for Shape Network
│   ├── contracts/          # Solidity smart contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/              # Contract tests
│   ├── deployments/       # Deployment artifacts
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   ├── public/            # Static assets
│   └── package.json
├── docs/                  # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v22 or higher)
- npm or yarn
- MetaMask wallet
- Shape Network testnet tokens

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd ShapeSaga
```

2. Install dependencies for all packages:

```bash
npm run install:all
```

### Smart Contracts (Shape Network)

1. Navigate to contracts directory:

```bash
cd contracts
```

2. Configure your environment:

```bash
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

3. Compile contracts:

```bash
npm run compile
```

4. Run tests:

```bash
npm run test
```

5. Deploy to Shape Network testnet (default):

```bash
npm run deploy
```

Or deploy to mainnet (production):

```bash
npm run deploy:mainnet
```

### Frontend Development

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Start development server:

```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## 🛠️ Technology Stack

### Blockchain

- **Shape Network**: L2 blockchain for low-cost transactions
- **Hardhat**: Development environment for smart contracts
- **Solidity**: Smart contract programming language
- **OpenZeppelin**: Security-audited contract libraries

### Frontend

- **React**: User interface framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **ethers.js**: Ethereum library for blockchain interaction

### AI Integration

- **OpenAI API**: Text and image generation
- **Stable Diffusion**: Image generation for comics
- **Text-to-Video APIs**: Short video generation

## 📝 Smart Contract Architecture

### Core Contracts

1. **StoryRegistry.sol**: Main contract for story creation and management
2. **ContributionManager.sol**: Handles story contributions and branching
3. **RewardSystem.sol**: Manages token rewards for contributors
4. **NFTMinter.sol**: Mints story contributions as NFTs

### Key Features

- Story creation with metadata
- Contribution tracking and validation
- Branching mechanism for alternative story paths
- Reward distribution for quality contributions
- NFT minting for story ownership

## 🎨 Frontend Features

### User Interface

- Story creation wizard
- Interactive story tree visualization
- Content type selection (text/image/video)
- Contribution submission interface
- Wallet integration with MetaMask

### AI Integration

- Text generation for story extensions
- Image generation for comic panels
- Video generation for short narratives
- Content moderation and quality checks

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
npm run test
```

### Frontend

```bash
cd frontend
npm run test
```

## 🚀 Deployment

This project is configured for automatic deployment using GitHub Actions and Vercel.

### Frontend Deployment (Vercel)

The frontend is automatically deployed to Vercel:

- **Production**: Deploys automatically when pushing to `main` branch
- **Preview**: Creates preview deployments for pull requests
- **Free Tier**: Uses Vercel's free plan with generous limits

For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Smart Contracts (Shape Network Testnet)

```bash
cd contracts
npm run deploy
```

For mainnet deployment:

```bash
cd contracts
npm run deploy:mainnet
```

### Manual Frontend Deployment

```bash
cd frontend
npm run build
# Build artifacts are in frontend/dist/
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

This project is submitted for the Shape Network Hackathon. It demonstrates:

- Advanced smart contract development on Shape Network
- Integration with AI services for content generation
- Modern frontend development practices
- Innovative use of blockchain for creative applications

## 🔗 Links

- [Shape Network Documentation](https://docs.shape.network)
- [Live Demo](https://shape-saga.vercel.app/)
- [Video Presentation](https://drive.google.com/drive/folders/1TCG7QoPuAYFzo7ytPdlPQhAcLRbZl1g9?usp=drive_link)

## 👥 Team

- **Zech** - Full Stack Developer

---

_Built with ❤️ for the Shape Network Hackathon_
