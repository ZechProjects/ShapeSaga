# Pinata v3 API Migration Guide - Secure Implementation

## Overview

The ShapeSaga project has been upgraded to use Pinata's v3 Files API through secure Vercel serverless functions, eliminating the security risk of exposing JWT tokens in client-side code.

## Security Improvements

### Before (Insecure v2 Implementation)

- ❌ API keys exposed in client-side code
- ❌ Direct Pinata API calls from frontend
- ❌ Credentials visible in browser development tools

### After (Secure v3 Implementation)

- ✅ JWT token kept server-side only
- ✅ API calls proxied through secure Vercel functions
- ✅ No sensitive credentials exposed to client-side

## Architecture

```
Frontend → Vercel API Functions → Pinata v3 API
```

## Changes Made

### 1. API Architecture Update

- **Old**: Direct client-side calls to Pinata API with exposed credentials
- **New**: Secure server-side API functions that proxy requests to Pinata

### 2. Authentication Method

- **Old**: Client-side JWT token via `VITE_PINATA_JWT`
- **New**: Server-side JWT token via `PINATA_JWT` (no VITE\_ prefix)

### 3. API Endpoints

- **New**: `/api/upload-story` - Upload story metadata
- **New**: `/api/upload-contribution` - Upload contribution metadata
- **New**: `/api/upload-file` - Upload files (images, documents, etc.)

### 4. Security Enhancements

- JWT token never exposed to client-side code
- Request validation and error handling
- Standardized API responses

## Setup Instructions

### 1. Get a Pinata v3 JWT Token

1. Go to [Pinata Dashboard](https://app.pinata.cloud/)
2. Navigate to **API Keys** section
3. Click **"New Key"** or **"Generate API Key"**
4. Select **JWT** as the key type
5. Enable the following permissions:
   - ✅ **Files: Create** (for uploading files)
   - ✅ **Files: Read** (for reading file metadata)
   - ✅ **Files: Delete** (optional, for file management)

### 2. Update Environment Variables

⚠️ **IMPORTANT SECURITY CHANGE**: The JWT token is now server-side only!

In your `/frontend/.env` file:

```bash
# Server-side only (no VITE_ prefix for security)
PINATA_JWT=your_jwt_token_here

# Client-side app URL for API calls
VITE_APP_URL=http://localhost:3001
```

### 3. Vercel Environment Variables

For production deployment, add to Vercel dashboard:

1. Go to Vercel → Project → Settings → Environment Variables
2. Add `PINATA_JWT` with your token value
3. Set for all environments (Production, Preview, Development)

### 4. Benefits of Secure v3 Implementation

- **Enhanced Security**: JWT tokens never exposed to client-side code
- **Better Performance**: v3 API is faster and more reliable
- **Enhanced Metadata**: More detailed file information and better organization
- **Future-Proof**: v3 is the actively maintained API version
- **Request Validation**: Server-side validation and error handling
- **Audit Trail**: Server-side logging of all IPFS operations

## File Changes

The following files were updated for secure implementation:

- `frontend/api/upload-story.ts` - NEW: Secure server-side story upload
- `frontend/api/upload-contribution.ts` - NEW: Secure server-side contribution upload
- `frontend/api/upload-file.ts` - NEW: Secure server-side file upload
- `frontend/src/lib/ipfs.ts` - Updated to use secure API endpoints
- `frontend/.env.example` - Updated environment variable examples
- `vercel.json` - Added serverless function configuration
- `SECURE_IPFS_IMPLEMENTATION.md` - NEW: Security implementation guide

## Testing

After setting up your JWT token and deploying:

1. Set `PINATA_JWT` in your environment (no VITE\_ prefix)
2. Start the frontend: `npm run dev`
3. Try creating a new story to test IPFS upload
4. Check the Pinata dashboard to verify files are being uploaded correctly
5. Verify JWT token is NOT visible in browser dev tools

## Troubleshooting

### Common Issues

1. **"Server configuration error"**:

   - Make sure `PINATA_JWT` is set (no VITE\_ prefix)
   - For local development: check `.env` file
   - For production: check Vercel environment variables

2. **"Method not allowed"**:

   - Ensure you're making POST requests to API endpoints
   - Check that API functions are properly deployed

3. **"Upload failed"**:
   - Your JWT token may be invalid or expired
   - Your JWT token doesn't have the required permissions
   - Check Pinata API status

### Security Verification

1. Open browser dev tools → Network tab
2. Create a story or upload a file
3. Verify API calls go to `/api/upload-*` endpoints
4. Confirm no Pinata JWT tokens are visible in requests
5. Check that only your app's API endpoints are called

### Getting Help

- [Pinata v3 API Documentation](https://docs.pinata.cloud/api-reference/files)
- [Pinata Support](https://support.pinata.cloud/)

## Migration Checklist

- [ ] Install `@vercel/node` dependency
- [ ] Create secure API functions in `/frontend/api/` directory
- [ ] Update `ipfs.ts` to use new secure API endpoints
- [ ] Remove `VITE_PINATA_JWT` from all environment files
- [ ] Add `PINATA_JWT` (no VITE\_ prefix) to environment
- [ ] Update Vercel environment variables in dashboard
- [ ] Test IPFS uploads functionality
- [ ] Verify JWT token is NOT exposed in browser dev tools
- [ ] Update documentation and deployment guides
