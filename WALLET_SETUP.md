# Wallet Connection Setup for ShapeSaga

## Overview

The ShapeSaga frontend now includes a fully functional wallet connection system using Reown (formerly WalletConnect). The implementation supports multiple wallet types including MetaMask, WalletConnect-compatible wallets, and injected wallets.

## Features

### ✅ Implemented

- **Connect Wallet Button**: Dropdown interface with multiple wallet options
- **Reown Integration**: Updated WalletConnect configuration using Reown project ID
- **Wallet State Management**: Shows connected wallet address and disconnect option
- **Multiple Wallet Support**: MetaMask, WalletConnect (Reown), and injected wallets
- **Toast Notifications**: Success/error feedback for connection attempts
- **Responsive UI**: Clean dropdown interface with wallet icons
- **Auto-connect**: Attempts to reconnect previously connected wallets

### 🔧 Configuration

The wallet connection is configured in `/frontend/src/lib/wagmi.ts` with:

- Shape Network mainnet and testnet support
- Reown project ID from environment variables
- Proper metadata for wallet display

### 🎯 Environment Setup

Make sure your `/frontend/.env` file contains:

```bash
VITE_WALLETCONNECT_PROJECT_ID=e5427b992adba543fdada0fbcf1f52e1
```

## Usage

1. **Start the frontend**: `npm run dev` from the `/frontend` directory
2. **Click "Connect Wallet"** in the top navigation
3. **Choose your wallet** from the dropdown:
   - **MetaMask**: If installed in browser
   - **WalletConnect**: For mobile wallets and other WC-compatible wallets
   - **Injected**: For other browser extension wallets

## Testing

### Local Testing

1. Ensure you have MetaMask or another wallet installed
2. Start the development server: `npm run dev`
3. Open http://localhost:3001
4. Click "Connect Wallet" and test each connector

### Wallet Support

- ✅ **MetaMask**: Browser extension
- ✅ **WalletConnect/Reown**: Mobile wallets (Trust Wallet, Rainbow, etc.)
- ✅ **Injected Wallets**: Other browser extensions

### Network Support

- ✅ **Shape Network Testnet** (ID: 11011)
- ✅ **Shape Network Mainnet** (ID: 360)

## Troubleshooting

### Common Issues

1. **"Project ID not found"**: Ensure VITE_WALLETCONNECT_PROJECT_ID is set
2. **MetaMask not appearing**: Check if MetaMask is installed and enabled
3. **WalletConnect not working**: Verify the Reown project ID is valid

### Getting a Reown Project ID

1. Visit [https://cloud.reown.com/](https://cloud.reown.com/)
2. Create a new project
3. Copy the Project ID to your `.env` file

## Components

### ConnectWallet Component

Location: `/frontend/src/components/ConnectWallet.tsx`

Features:

- Dropdown interface for wallet selection
- Connected state display with formatted address
- Disconnect functionality
- Loading states and error handling
- Toast notifications

### Wagmi Configuration

Location: `/frontend/src/lib/wagmi.ts`

Includes:

- Shape Network chain configuration
- Multiple wallet connectors
- Reown/WalletConnect setup with metadata

## Next Steps

The wallet connection is now fully functional. You can:

1. **Add Network Switching**: Implement network switching between Shape testnet/mainnet
2. **Enhanced Error Handling**: Add more specific error messages for different failure cases
3. **Wallet Detection**: Add logic to detect and suggest wallet installations
4. **Custom Wallet Icons**: Add specific icons for different wallet types
5. **Connection Persistence**: Improve auto-reconnection logic

## Dependencies

Current wallet-related dependencies:

- `wagmi@^1.4.0`: Main Ethereum library
- `@wagmi/core@^1.4.0`: Core wagmi functionality
- `@wagmi/connectors@^3.1.0`: Wallet connectors
- `viem@^1.18.0`: Ethereum client
- `@walletconnect/web3wallet`: WalletConnect v2 support
- `@walletconnect/core`: WalletConnect core functionality
