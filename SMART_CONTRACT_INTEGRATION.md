# ShapeSaga Smart Contract Integration

This document explains how the CreateStoryPage integrates with the Hardhat smart contracts.

## Overview

The CreateStoryPage now connects to the StoryRegistry smart contract to create stories on the Shape blockchain. Here's what has been implemented:

## Implementation Details

### 1. Smart Contract Integration (`/src/lib/contracts.ts`)

- **Contract ABIs**: Includes the StoryRegistry contract ABI with createStory function
- **Type Definitions**: TypeScript interfaces for Story, StorySettings, and StoryMetadata
- **Content Type Enum**: Maps frontend medium types to blockchain enum values
- **Contract Addresses**: Environment-based configuration

### 2. IPFS Integration (`/src/lib/ipfs.ts`)

- **Metadata Upload**: Uploads story metadata as JSON to IPFS via Pinata
- **File Upload**: Supports uploading additional files (for future features)
- **URL Generation**: Converts IPFS hashes to gateway URLs
- **Metadata Fetching**: Retrieves metadata from IPFS URIs

### 3. Story Creation Hook (`/src/hooks/useCreateStory.ts`)

- **Wallet Integration**: Uses wagmi for wallet connection and contract interaction
- **IPFS Upload**: Automatically uploads metadata before blockchain transaction
- **Transaction Handling**: Manages write operations and transaction confirmations
- **Error Handling**: Provides user-friendly error messages with toast notifications
- **Loading States**: Tracks upload, transaction, and confirmation states

### 4. Updated CreateStoryPage (`/src/pages/CreateStoryPage.tsx`)

#### New Features:

- **Wallet Connection Check**: Validates wallet connection and network
- **Reward Pool Field**: Allows users to add ETH rewards for contributors
- **Approval Settings**: Toggle for requiring approval for contributions
- **Smart Contract Integration**: Creates stories on the blockchain
- **Enhanced Loading States**: Shows progress during IPFS upload and transaction
- **Network Validation**: Ensures user is on Shape Network

#### Form to Contract Mapping:

```typescript
// Form data maps to smart contract parameters:
{
  name: string → title: string
  description: string → description: string
  medium: "text"|"comic"|"video" → contentType: enum (0,1,2)
  // All other fields → metadataURI: string (IPFS)
  rewardPool: string → msg.value: ETH amount
  requireApproval: boolean → settings.requireApproval
  maxChapters → settings.maxContributions
}
```

## Deployment Instructions

### 1. Deploy Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network shape-testnet
```

### 2. Update Environment Variables

After deployment, update `frontend/.env`:

```bash
VITE_CONTRACT_STORY_REGISTRY=0x[deployed_address]
VITE_CONTRACT_CONTRIBUTION_MANAGER=0x[deployed_address]
VITE_CONTRACT_NFT_MINTER=0x[deployed_address]
VITE_CONTRACT_REWARD_SYSTEM=0x[deployed_address]
```

### 3. Configure IPFS (Pinata)

1. Sign up at [Pinata](https://pinata.cloud/)
2. Get API credentials
3. Update environment variables:

```bash
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_SECRET_KEY=your_secret_key
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## User Flow

1. **Connect Wallet**: User connects MetaMask or WalletConnect
2. **Network Check**: Validates user is on Shape Network
3. **Fill Form**: User completes story creation form
4. **Submit**: Triggers the following sequence:
   - Upload metadata to IPFS
   - Call `createStory` function on StoryRegistry contract
   - Wait for transaction confirmation
   - Show success message and redirect

## Error Handling

The implementation includes comprehensive error handling for:

- **Wallet Connection**: Prompts to connect if not connected
- **Network Issues**: Warns if not on Shape Network
- **IPFS Upload Failures**: Retries and clear error messages
- **Transaction Failures**: Gas estimation errors, user rejection, etc.
- **Contract Errors**: Validation failures, insufficient funds, etc.

## Testing

To test the implementation:

1. **Local Development**: Use placeholder contract addresses (0x000...)
2. **Testnet**: Deploy contracts to Shape testnet and test full flow
3. **Mainnet**: Deploy to Shape mainnet for production

## Future Enhancements

- **File Upload**: Support for images, videos in story content
- **Draft Saving**: Save drafts locally before blockchain submission
- **Gas Estimation**: Show estimated gas costs before transaction
- **Batch Operations**: Create multiple stories in one transaction
- **Advanced Settings**: More granular control over story parameters

## Troubleshooting

### Common Issues:

1. **"Contract not configured"**: Update environment variables with deployed addresses
2. **"Pinata upload failed"**: Check IPFS credentials
3. **"Wrong network"**: Switch to Shape Network in wallet
4. **Transaction failures**: Check wallet balance, gas settings

### Debug Tools:

- Browser console for detailed error logs
- Wagmi DevTools for contract interaction debugging
- Shape Network explorer for transaction verification
