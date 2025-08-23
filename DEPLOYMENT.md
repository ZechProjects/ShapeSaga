# ShapeSaga Deployment Guide

This guide covers how to deploy ShapeSaga to Vercel using GitHub Actions.

## Prerequisites

- GitHub repository with your ShapeSaga code
- Vercel account (free tier)
- Node.js 18+ installed locally

## Setup Instructions

### 1. Vercel Setup

1. **Create a Vercel account** at [vercel.com](https://vercel.com) (free)
2. **Import your GitHub repository** to Vercel:
   - Go to your Vercel dashboard
   - Click "New Project"
   - Connect your GitHub account
   - Select your ShapeSaga repository
3. **Configure project settings**:
   - Framework Preset: `Vite`
   - Root Directory: `./` (leave as default)
   - Build Command: `cd frontend && npm ci && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install --prefix frontend`

### 2. Get Vercel Credentials

You need three pieces of information from Vercel:

1. **Vercel Token**:

   - Go to [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - Create a new token with a descriptive name like "ShapeSaga GitHub Actions"
   - Copy the token value

2. **Organization ID**:

   - Go to your Vercel team settings
   - Copy the "Team ID" (this is your org ID)
   - For personal accounts, this is your user ID

3. **Project ID**:
   - Go to your project settings in Vercel
   - Copy the "Project ID" from the General tab

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following repository secrets:

**Vercel Deployment:**

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_organization_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

**Shape Network Testnet (for automatic deployments):**

```
DEPLOYER_PRIVATE_KEY=your_deployer_wallet_private_key
SHAPE_TESTNET_RPC_URL=https://testnet-rpc.shape.network
SHAPE_EXPLORER_API_KEY=your_shape_explorer_api_key
```

**Shape Network Mainnet (for production deployments - optional):**

```
DEPLOYER_PRIVATE_KEY_MAINNET=your_mainnet_deployer_private_key
SHAPE_MAINNET_RPC_URL=https://mainnet-rpc.shape.network
VITE_SHAPE_NETWORK_RPC_URL_MAINNET=https://mainnet-rpc.shape.network
VITE_STORY_REGISTRY_ADDRESS_MAINNET=deployed_contract_address
VITE_NFT_MINTER_ADDRESS_MAINNET=deployed_contract_address
VITE_REWARD_SYSTEM_ADDRESS_MAINNET=deployed_contract_address
VITE_CONTRIBUTION_MANAGER_ADDRESS_MAINNET=deployed_contract_address
```

**Security Note:** Use different private keys for testnet and mainnet. Never commit private keys to your repository.

### 4. Environment Variables (Optional)

If your app needs environment variables:

1. Create a `.env.local` file in the frontend directory (not committed to git)
2. Add your environment variables to Vercel:
   - Go to Project Settings > Environment Variables in Vercel
   - Add your production environment variables

Example variables:

```
VITE_SHAPE_NETWORK_RPC_URL=https://testnet-rpc.shape.network
VITE_SHAPE_NETWORK_CHAIN_ID=11011
VITE_SHAPE_NETWORK_CHAIN_NAME=Shape Testnet
VITE_STORY_REGISTRY_ADDRESS=your_deployed_contract_address
```

**Note**: This project is configured to use Shape Network testnet (Sepolia-based) by default for development and testing. For production deployments, update the environment variables to use mainnet values.

## Deployment Workflow

### Automatic Deployments (Testnet)

- **Main branch**: Pushes to `main` trigger:
  - Smart contract deployment to Shape Network testnet
  - Frontend deployment to Vercel with testnet configuration
- **Pull Requests**: Automatically create preview deployments with unique URLs
- **Feature branches**: Can be manually deployed via Vercel dashboard

### Production Deployments (Mainnet)

Production deployments to mainnet are **manual only** for security:

1. Go to your GitHub repository
2. Navigate to Actions tab
3. Select "Production Deployment" workflow
4. Click "Run workflow"
5. Choose whether to deploy contracts and/or frontend
6. Confirm the deployment

This approach ensures mainnet deployments are intentional and reviewed.

### Manual Deployment

You can also deploy manually:

1. **Via Vercel CLI**:

   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Via Vercel Dashboard**:
   - Go to your project dashboard
   - Click "Deploy" and select your branch

## Monitoring and Logs

- **Deployment logs**: Available in both GitHub Actions and Vercel dashboard
- **Runtime logs**: Available in Vercel dashboard > Functions tab
- **Performance**: Available in Vercel dashboard > Analytics tab

## Troubleshooting

### Common Issues

1. **Build fails**:

   - Check that your build command works locally: `cd frontend && npm run build`
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors: `cd frontend && npm run type-check`

2. **Environment variables not working**:

   - Make sure variables are prefixed with `VITE_` for Vite
   - Check they're set in Vercel project settings
   - Ensure they're not in quotes in Vercel dashboard

3. **404 errors on refresh**:

   - This is handled by the `vercel.json` configuration
   - Ensure the routes configuration is correct

4. **GitHub Actions failing**:
   - Check that all secrets are set correctly
   - Verify the Vercel token has sufficient permissions
   - Check the workflow logs for specific error messages

### Getting Help

- Check [Vercel Documentation](https://vercel.com/docs)
- Review [GitHub Actions Documentation](https://docs.github.com/en/actions)
- Check project Issues for common problems

## Free Tier Limits

Vercel free tier includes:

- Unlimited personal projects
- 100GB bandwidth per month
- 100 deployments per day
- 10GB source code per month
- Serverless Functions with 100GB-hour execution time

These limits are typically sufficient for development and small to medium applications.
