# Pinata v3 API Migration Guide

## Overview

The ShapeSaga project has been upgraded to use Pinata's v3 Files API instead of the legacy v2 pinning API. This provides better performance, security, and features.

## Changes Made

### 1. API Endpoint Update

- **Old**: `/pinning/pinFileToIPFS` with API Key + Secret Key headers
- **New**: `/pinning/pinFileToIPFS` with JWT Bearer token authentication

### 2. Authentication Method

- **Old**: API Key + Secret Key headers (`pinata_api_key`, `pinata_secret_api_key`)
- **New**: JWT Bearer token (`Authorization: Bearer <JWT>`)

### 3. Response Format

- **Old**: `IpfsHash`, `PinSize`, `Timestamp`
- **New**: `IpfsHash`, `PinSize`, `Timestamp` (same format, but with JWT auth)

### 4. Metadata Format

- **Old**: `keyvalues` object in `pinataMetadata`
- **New**: `keyvalues` object in `pinataMetadata` (same format, but with JWT auth)

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

In your `/frontend/.env` file, replace the old API keys with the new JWT:

```bash
# Remove these old variables:
# VITE_PINATA_API_KEY=your_old_api_key
# VITE_PINATA_SECRET_KEY=your_old_secret_key

# Add this new variable:
VITE_PINATA_JWT=your_jwt_token_here
```

### 3. Benefits of v3 API

- **Better Security**: JWT tokens are more secure than API key/secret pairs
- **Improved Performance**: v3 API is faster and more reliable
- **Enhanced Metadata**: More detailed file information and better organization
- **Future-Proof**: v3 is the actively maintained API version

## File Changes

The following files were updated:

- `frontend/src/lib/ipfs.ts` - Updated to use v3 Files API
- `frontend/.env.example` - Updated environment variable examples
- `frontend/README.md` - Updated documentation

## Testing

After setting up your JWT token:

1. Start the frontend: `npm run dev`
2. Try creating a new story to test IPFS upload
3. Check the Pinata dashboard to verify files are being uploaded correctly

## Troubleshooting

### Common Issues

1. **"JWT not configured"**: Make sure `VITE_PINATA_JWT` is set in your `.env` file
2. **"401 Unauthorized"**: Your JWT token may be invalid or expired
3. **"403 Forbidden"**: Your JWT token doesn't have the required permissions

### Getting Help

- [Pinata v3 API Documentation](https://docs.pinata.cloud/api-reference/files)
- [Pinata Support](https://support.pinata.cloud/)

## Migration Checklist

- [ ] Get new Pinata JWT token with correct permissions
- [ ] Update `.env` file with `VITE_PINATA_JWT`
- [ ] Remove old `VITE_PINATA_API_KEY` and `VITE_PINATA_SECRET_KEY`
- [ ] Test file upload functionality
- [ ] Verify files appear in Pinata dashboard
