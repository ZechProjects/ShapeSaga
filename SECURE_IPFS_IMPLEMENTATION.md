# Secure IPFS/Pinata Implementation Guide

## Overview

This guide outlines the secure implementation of IPFS uploads using Pinata v3 API through Vercel serverless functions, eliminating the security risk of exposing JWT tokens in client-side code.

## Security Improvements

### Before (Insecure)

- ❌ JWT token exposed in client-side code via `VITE_PINATA_JWT`
- ❌ Direct Pinata API calls from frontend
- ❌ Token visible in browser development tools and bundled code
- ❌ No request validation or rate limiting

### After (Secure)

- ✅ JWT token kept server-side only via `PINATA_JWT` (no VITE\_ prefix)
- ✅ API calls proxied through secure Vercel serverless functions
- ✅ Request validation and error handling
- ✅ Token never exposed to client-side code

## Architecture

```
Frontend (Client) → Vercel API Functions (Server) → Pinata API
```

### API Endpoints

1. **`/api/upload-story`** - Upload story metadata
2. **`/api/upload-contribution`** - Upload contribution metadata
3. **`/api/upload-file`** - Upload files (images, documents, etc.)

## Environment Variables

### Development (.env)

```bash
# Server-side only (no VITE_ prefix)
PINATA_JWT=your_jwt_token_here

# Client-side API base URL
VITE_APP_URL=http://localhost:3001
```

### Production (Vercel Environment Variables)

```bash
# Add to Vercel dashboard:
PINATA_JWT=your_production_jwt_token_here
VITE_APP_URL=https://your-domain.vercel.app
```

## API Function Structure

Each API function follows this pattern:

1. **Method validation** - Only allow POST requests
2. **Environment check** - Verify PINATA_JWT is configured
3. **Input validation** - Validate required fields
4. **Data processing** - Format data for Pinata API
5. **Secure upload** - Make authenticated request to Pinata
6. **Error handling** - Return appropriate error responses
7. **Response formatting** - Return standardized success response

## Frontend Integration

The frontend now uses these secure endpoints:

```typescript
// Old (insecure)
const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  headers: { Authorization: `Bearer ${VITE_PINATA_JWT}` },
});

// New (secure)
const response = await fetch("/api/upload-story", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(metadata),
});
```

## Security Benefits

1. **Token Protection**: JWT never exposed to client-side
2. **Request Validation**: Server validates all requests before forwarding
3. **Error Sanitization**: Sensitive error details not exposed to client
4. **Rate Limiting**: Can be implemented at API function level
5. **Audit Trail**: Server-side logging of all IPFS operations
6. **Access Control**: Can add authentication/authorization as needed

## Deployment Instructions

### 1. Update Environment Variables

Remove any `VITE_PINATA_JWT` from your environment and add `PINATA_JWT` (server-side only).

### 2. Vercel Configuration

The existing `vercel.json` will automatically deploy the API functions. No changes needed.

### 3. Environment Variables in Vercel

1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Add `PINATA_JWT` with your token value
3. Set for all environments (Production, Preview, Development)

### 4. Testing

1. Deploy to Vercel
2. Test story creation to verify IPFS uploads work
3. Check Pinata dashboard to confirm files are uploaded
4. Verify JWT token is not visible in browser dev tools

## Best Practices

1. **Regular Token Rotation**: Rotate JWT tokens periodically
2. **Minimal Permissions**: Only grant necessary permissions to tokens
3. **Environment Separation**: Use different tokens for dev/staging/prod
4. **Monitoring**: Monitor API usage and errors
5. **Backup Strategy**: Have backup IPFS providers configured

## Troubleshooting

### Common Issues

1. **"Server configuration error"**

   - Check that `PINATA_JWT` is set in Vercel environment variables
   - Verify no VITE\_ prefix on the server-side token

2. **"Method not allowed"**

   - Ensure you're making POST requests to the API endpoints

3. **"Upload failed"**
   - Check Pinata token permissions
   - Verify token hasn't expired
   - Check Pinata API status

### Debugging

1. Check Vercel function logs for detailed error messages
2. Verify environment variables are properly set
3. Test API endpoints directly using curl or Postman

## Migration Checklist

- [ ] Install `@vercel/node` dependency
- [ ] Create API functions in `/frontend/api/` directory
- [ ] Update `ipfs.ts` to use new API endpoints
- [ ] Remove `VITE_PINATA_JWT` from environment files
- [ ] Add `PINATA_JWT` (no VITE\_ prefix) to environment
- [ ] Update Vercel environment variables
- [ ] Test IPFS uploads functionality
- [ ] Verify JWT token not exposed in browser
- [ ] Update documentation and deployment guides
