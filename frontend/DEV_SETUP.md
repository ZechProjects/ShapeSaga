# Development Setup for Secure IPFS Implementation

## Quick Start

To run the development environment with the secure IPFS API:

```bash
cd frontend
npm run dev:full
```

This will start:

- **Frontend (Vite)**: http://localhost:3001
- **API Server**: http://localhost:3003 (proxied through frontend)

## Available Scripts

- `npm run dev` - Start frontend only (Vite dev server)
- `npm run dev:api` - Start API server only
- `npm run dev:full` - Start both frontend and API server

## API Endpoints

The development API server provides these endpoints:

- `POST /api/upload-story` - Upload story metadata to IPFS
- `POST /api/upload-contribution` - Upload contribution metadata to IPFS
- `POST /api/upload-file` - Upload files to IPFS

## Environment Setup

Make sure your `.env` file contains:

```bash
# Server-side Pinata JWT (no VITE_ prefix)
PINATA_JWT=your_jwt_token_here

# Other environment variables...
VITE_APP_URL=http://localhost:3001
```

## How It Works

1. **Frontend** (React/Vite) runs on port 3001
2. **API Server** (Express) runs on port 3003
3. **Vite Proxy** forwards `/api/*` requests to the API server
4. **API Server** handles Pinata JWT securely and forwards requests

## Production vs Development

### Development

- Uses local Express server to simulate Vercel functions
- API endpoints available at `/api/*`
- JWT token loaded from local `.env` file

### Production (Vercel)

- Uses actual Vercel serverless functions
- Same API endpoints available at `/api/*`
- JWT token loaded from Vercel environment variables

## Testing the API

You can test the API endpoints directly:

```bash
# Test story upload
curl -X POST http://localhost:3001/api/upload-story \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Story","description":"Test description","genre":"fantasy"}'
```

## Troubleshooting

1. **Port conflicts**: If ports 3001 or 3003 are in use, kill existing processes:

   ```bash
   pkill -f "vite\|node.*dev-server"
   ```

2. **API not found**: Make sure both servers are running with `npm run dev:full`

3. **JWT errors**: Verify `PINATA_JWT` is set in your `.env` file (without VITE\_ prefix)
