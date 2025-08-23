# ShapeSaga Frontend

React + TypeScript + Vite frontend for the ShapeSaga platform.

## Features

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Wagmi** for Ethereum wallet integration
- **React Query** for data fetching
- **React Router** for navigation
- **Zustand** for state management
- **Shape Network** integration

## Quick Start

1. **Install dependencies**:

```bash
npm install
```

2. **Set up environment variables**:

```bash
cp .env.example .env
# Edit .env with your values
```

3. **Start development server**:

```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the following:

- `VITE_WALLETCONNECT_PROJECT_ID`: Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- `VITE_OPENAI_API_KEY`: OpenAI API key for AI content generation
- `VITE_PINATA_JWT`: Pinata JWT token for IPFS storage (v3 API)
- `VITE_CONTRACT_*`: Smart contract addresses (set after deployment)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Utility libraries and configurations
├── hooks/         # Custom React hooks
├── stores/        # Zustand stores
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Technologies

- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi**: React hooks for Ethereum
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Framer Motion**: Animation library
- **React Hook Form**: Form handling
- **Zod**: Schema validation

## Shape Network Integration

The app is configured to work with:

- **Shape Testnet** (Chain ID: 11011) - Default for development
- **Shape Mainnet** (Chain ID: 360) - For production

The project is configured to use Shape Network testnet by default. To switch to mainnet, update the environment variables:

```bash
VITE_SHAPE_NETWORK_RPC_URL=https://mainnet-rpc.shape.network
VITE_SHAPE_NETWORK_CHAIN_ID=360
VITE_SHAPE_NETWORK_CHAIN_NAME=Shape Mainnet
```

Make sure your wallet is configured to connect to Shape Network.

## Development

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation if needed

### Smart Contract Integration

1. Deploy contracts using the contracts package
2. Update contract addresses in `.env`
3. Use wagmi hooks for contract interactions

### AI Integration

The frontend integrates with AI services for:

- Text generation (OpenAI GPT)
- Image generation (DALL-E, Stable Diffusion)
- Content moderation

Configure API keys in environment variables.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Deployment

The app can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- IPFS

Make sure to set environment variables in your deployment platform.
