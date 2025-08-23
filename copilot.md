# ShapeSaga - AI Assistant Context Guide

This document provides comprehensive context for AI assistants working on the ShapeSaga project.

## Project Overview

**ShapeSaga** is an AI-powered collaborative storytelling platform built on the Shape Network blockchain. Users can create, extend, and branch collaborative stories using AI-generated content in multiple formats (text, images, videos).

### Key Features

- **Collaborative Storytelling**: Create stories and contribute by extending or branching existing narratives
- **AI-Powered Content**: Generate text, images, and videos for story contributions
- **Blockchain Integration**: Built on Shape Network L2 for decentralized ownership
- **Story Branching**: Multiple narrative paths and community-driven development
- **NFT Support**: Stories and contributions can be minted as NFTs
- **Reward System**: Token-based incentives for quality contributions

## Architecture Overview

```
ShapeSaga/
├── contracts/              # Smart contracts (Hardhat/Solidity)
├── frontend/               # React frontend application
├── docs/                   # Documentation
└── deployment configs      # Vercel, etc.
```

## Smart Contract Architecture

### Core Contracts (Solidity 0.8.20)

1. **StoryRegistry.sol**

   - Main contract for story creation and management
   - Handles story metadata, creator tracking, and story settings
   - Events: `StoryCreated`
   - Key functions: `createStory()`, `getStory()`, `getUserStories()`

2. **ContributionManager.sol**

   - Manages story contributions and branching logic
   - Handles voting, approval workflows, and tree structure
   - Events: `ContributionSubmitted`
   - Key functions: `submitContribution()`, `getContribution()`, `getStoryContributions()`, `getContributionChildren()`

3. **RewardSystem.sol**

   - Token-based reward distribution for contributors
   - Manages reward pools and distribution logic
   - Handles staking and reputation systems

4. **NFTMinter.sol**
   - ERC721 contract for minting story contributions as NFTs
   - Extends OpenZeppelin's ERC721URIStorage
   - Connects to IPFS for metadata storage

### Network Configuration

- **Shape Testnet**: Chain ID 11011, RPC: https://sepolia.shape.network
- **Shape Mainnet**: Chain ID 360, RPC: https://mainnet.shape.network
- **Block Explorer**: https://sepolia.shapescan.xyz (testnet), https://shapescan.xyz (mainnet)

## Frontend Architecture

### Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **wagmi** + **viem** for Ethereum interactions
- **@tanstack/react-query** for data fetching
- **Zustand** for state management
- **React Router** for navigation
- **Framer Motion** for animations

### Key Components

#### Wallet Integration

- `ConnectWallet.tsx`: MetaMask connection interface
- `WalletTroubleshoot.tsx`: Troubleshooting guide for wallet issues
- `useWalletConnection.ts`: Custom hook for wallet state management

#### Story Management

- `StoryCard.tsx`: Display individual story information
- `ContributionTree.tsx`: Interactive tree visualization of story contributions
- `ContributionViewer.tsx`: View and interact with story contributions
- `ContributorCard.tsx`: Display contributor profiles and stats

#### Custom Hooks

- `useStories.ts`: Fetch and manage stories data
- `useContributions.ts`: Handle contribution data
- `useCreateStory.ts`: Story creation logic
- `useCreateContribution.ts`: Contribution submission
- `useFavorites.ts`: User favorites management

### Smart Contract Integration

#### Contract Configuration (`lib/contracts.ts`)

```typescript
export const CONTRACT_ADDRESSES = {
  STORY_REGISTRY: process.env.VITE_CONTRACT_STORY_REGISTRY,
  CONTRIBUTION_MANAGER: process.env.VITE_CONTRACT_CONTRIBUTION_MANAGER,
  NFT_MINTER: process.env.VITE_CONTRACT_NFT_MINTER,
  REWARD_SYSTEM: process.env.VITE_CONTRACT_REWARD_SYSTEM,
};
```

#### Content Types

- `TEXT = 0`: Traditional text-based stories
- `IMAGE = 1`: Comic/visual storytelling
- `VIDEO = 2`: Short video narratives

#### Contribution Status

- `PENDING = 0`: Awaiting approval
- `APPROVED = 1`: Accepted into story
- `REJECTED = 2`: Not accepted

### AI Integration (`lib/ai.ts`)

Currently implements placeholder functions for:

- `generateImage(prompt: string)`: Image generation for comics
- `generateVideo(prompt: string)`: Video generation for narratives
- Text generation (TODO: implement with OpenAI/other APIs)

**Note**: Current implementation uses mock data. Production integration requires:

- OpenAI API for text generation
- Stable Diffusion or DALL-E for image generation
- RunwayML or similar for video generation

### IPFS Integration (`lib/ipfs.ts`)

Handles decentralized storage for:

- Story metadata
- Contribution content
- NFT metadata
- Media files (images, videos)

## Development Setup

### Prerequisites

- Node.js v16+
- npm/yarn
- MetaMask wallet
- Shape Network testnet tokens

### Quick Start Commands

```bash
# Install all dependencies
npm run install:all

# Start frontend development
npm run dev:frontend

# Compile smart contracts
npm run build:contracts

# Deploy to testnet
npm run deploy:contracts:testnet

# Run contract tests
npm run test:contracts
```

### Environment Variables

#### Frontend (.env in /frontend)

```
VITE_CONTRACT_STORY_REGISTRY=0x...
VITE_CONTRACT_CONTRIBUTION_MANAGER=0x...
VITE_CONTRACT_NFT_MINTER=0x...
VITE_CONTRACT_REWARD_SYSTEM=0x...
VITE_IPFS_API_URL=https://api.pinata.cloud
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud
```

#### Contracts (.env in /contracts)

```
PRIVATE_KEY=0x...
SHAPE_TESTNET_RPC_URL=https://sepolia.shape.network
SHAPE_MAINNET_RPC_URL=https://mainnet.shape.network
```

## Data Models

### Story Structure

```typescript
interface Story {
  id: bigint;
  creator: Address;
  title: string;
  description: string;
  contentType: ContentType;
  metadataURI: string;
  createdAt: bigint;
  totalContributions: bigint;
  isActive: boolean;
  rewardPool: bigint;
}
```

### Contribution Structure

```typescript
interface Contribution {
  id: bigint;
  storyId: bigint;
  parentContributionId: bigint;
  contributor: Address;
  metadataURI: string;
  status: ContributionStatus;
  createdAt: bigint;
  upvotes: bigint;
  downvotes: bigint;
  isBranch: boolean;
}
```

### Tree Visualization

The platform implements a tree structure for story contributions:

- Root contributions branch directly from the main story
- Child contributions extend from parent contributions
- Branch contributions create alternative narrative paths
- Maximum depth and branching can be configured per story

## Deployment

### Frontend (Vercel)

- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Framework**: Vite
- **Automatic deployments** on push to main branch

### Smart Contracts

- **Testnet**: `npm run deploy:contracts:testnet`
- **Mainnet**: `npm run deploy:contracts:mainnet`
- **Verification**: Automatic via Hardhat + Blockscout

## Common Development Patterns

### Adding New Features

1. **Smart Contract Changes**: Modify contracts, update ABIs in frontend
2. **Frontend Integration**: Update contract interfaces, add hooks
3. **UI Components**: Create/modify React components
4. **Testing**: Write tests for both contracts and frontend

### Working with Stories

1. Create story with metadata
2. Upload content to IPFS
3. Submit transaction to blockchain
4. Update UI with new story data

### Working with Contributions

1. Validate contribution against story rules
2. Generate/upload content using AI
3. Submit contribution to ContributionManager
4. Update contribution tree visualization

## Troubleshooting Guide

### Common Issues

1. **Wallet Connection**: Ensure MetaMask is connected to Shape Network
2. **Contract Interactions**: Check network configuration and contract addresses
3. **IPFS Uploads**: Verify IPFS service configuration
4. **Build Errors**: Check Node.js version and dependency conflicts

### Debugging

- Use browser dev tools for frontend debugging
- Use Hardhat console for contract debugging
- Check Shape Network block explorer for transaction status
- Monitor network requests for API call issues

## Testing

### Smart Contracts

```bash
cd contracts
npm run test
```

Tests cover:

- Story creation and management
- Contribution submission and approval
- Reward distribution
- NFT minting
- Tree structure validation

### Frontend

```bash
cd frontend
npm run test
```

Focus areas:

- Component rendering
- Wallet integration
- Contract interaction hooks
- State management

## Security Considerations

### Smart Contracts

- Uses OpenZeppelin security libraries
- Implements ReentrancyGuard and Pausable patterns
- Access control with Ownable
- Input validation and bounds checking

### Frontend

- Validates user input before contract calls
- Handles wallet connection securely
- Implements proper error handling
- Sanitizes user-generated content

## Performance Optimization

### Frontend

- React Query for efficient data caching
- Lazy loading for large story trees
- Image optimization for AI-generated content
- Bundle splitting with Vite

### Blockchain

- Gas-optimized contract functions
- Batch operations where possible
- Efficient data structures for tree storage
- Event-based UI updates

---

This document should be updated as the project evolves. Key areas for expansion:

- AI integration implementation details
- Advanced tree visualization features
- Reward system mechanics
- Community governance features
