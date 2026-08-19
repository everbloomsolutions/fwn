# Vercel Serverless Function Deployment

This document explains how the Express server is configured for Vercel serverless functions.

## Structure

```
apps/server/
├── api/
│   └── index.ts          # Vercel serverless function handler
├── src/                  # Source TypeScript files
├── dist/                 # Compiled JavaScript (built by buildCommand)
└── vercel.json          # Vercel configuration
```

## How It Works

1. **Build Process**: 
   - Vercel runs `buildCommand`: `cd ../.. && pnpm build --filter=@fwn/server`
   - This compiles TypeScript from `src/` to `dist/`

2. **Serverless Function**:
   - `api/index.ts` is automatically detected by Vercel as a serverless function
   - It imports the compiled Express app from `dist/`
   - All requests are rewritten to `/api` (handled by `vercel.json` rewrites)

3. **Request Flow**:
   ```
   Request → Vercel → Rewrite to /api → api/index.ts → Express App
   ```

## Configuration

### vercel.json

```json
{
  "version": 2,
  "buildCommand": "cd ../.. && pnpm build --filter=@fwn/server",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  }
}
```

### Key Settings

- **buildCommand**: Builds the server from monorepo root
- **installCommand**: Installs dependencies from monorepo root
- **rewrites**: Routes all requests to `/api` serverless function
- **functions**: Configures the serverless function runtime and timeout
- **runtime**: `nodejs20.x` - Node.js 20 runtime
- **maxDuration**: `30` seconds - Maximum execution time

**Note**: Framework is auto-detected from `express` import in `api/index.ts`

## Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required
- `NODE_ENV=production`
- `FRONTEND_URL=https://foodworldnaturals.com`
- `BACKEND_CORS_ORIGIN=https://foodworldnaturals.com,https://www.foodworldnaturals.com`
- `MONGODB_URI=mongodb+srv://...`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL`

### Optional
- `BACKEND_URL=https://api.foodworldnaturals.com` (for OAuth callbacks)
- `REDIS_URL=...` (if using Redis)
- `LOG_LEVEL=info`

## Deployment Steps

### Step 1: Create Vercel Project

1. **Go to Vercel Dashboard** → Add New Project
2. **Import your Git repository**
3. **IMPORTANT**: When configuring the project:
   - **Root Directory**: Set to `apps/server` ⚠️ **CRITICAL**
   - This tells Vercel which part of the monorepo to deploy
   - Framework Preset: Leave as "Other" or "Express" (Vercel will auto-detect)
   - Build Command: Already set in `vercel.json` (don't override)
   - Output Directory: Leave empty (not used for serverless functions)
   - Install Command: Already set in `vercel.json` (don't override)

### Step 2: Configure Environment Variables

**In Vercel Dashboard → Project Settings → Environment Variables**, add:

**Required Variables:**
```bash
NODE_ENV=production
FRONTEND_URL=https://foodworldnaturals.com
BACKEND_CORS_ORIGIN=https://foodworldnaturals.com,https://www.foodworldnaturals.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=foodworldnaturals@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@foodworldnaturals.com
ADMIN_EMAIL=admin@foodworldnaturals.com
```

**Optional Variables:**
```bash
BACKEND_URL=https://api.foodworldnaturals.com  # For OAuth callbacks
REDIS_URL=redis://...  # If using Redis
LOG_LEVEL=info
```

### Step 3: Deploy

1. **Push code to Git** (Vercel auto-deploys on push)
2. **Or manually trigger deployment** from Vercel Dashboard

### Step 4: Verify Deployment

After deployment, test the API:

```bash
# Health check
curl https://your-project.vercel.app/health

# API info
curl https://your-project.vercel.app/api/v1
```

## Testing

After deployment, test the API:

```bash
# Health check
curl https://your-vercel-url.vercel.app/health

# API info
curl https://your-vercel-url.vercel.app/api/v1

# Contact form
curl -X POST https://your-vercel-url.vercel.app/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test message"}'
```

## Important Notes

1. **Cold Starts**: Serverless functions have cold starts. The first request may be slower.

2. **Connection Pooling**: Database connections are reused across invocations (MongoDB connection pooling).

3. **State**: Each serverless function invocation is stateless. Don't rely on in-memory state between requests.

4. **Timeouts**: Maximum execution time is 30 seconds (configurable in `vercel.json`).

5. **File System**: Serverless functions have read-only file system (except `/tmp`).

6. **Background Jobs**: Scheduler/background jobs may not work as expected in serverless. Consider using Vercel Cron Jobs or external services.

## Troubleshooting

### Build Fails
- Check that `dist/` directory is created after build
- Verify TypeScript compilation succeeds
- Check build logs in Vercel dashboard

### Function Not Found
- Ensure `api/index.ts` exists
- Check that `vercel.json` rewrites are configured correctly
- Verify project root is set to `apps/server`

### Import Errors
- Ensure `dist/` files are built before function runs
- Check that imports use correct paths (`../dist/...`)
- Verify module exports are correct

### Database Connection Issues
- Check `MONGODB_URI` is set correctly
- Verify MongoDB allows connections from Vercel IPs
- Check connection pooling settings

## Alternative: Separate API Domain

If you want the API on a separate domain (e.g., `api.foodworldnaturals.com`):

1. Create a separate Vercel project for the server
2. Point `api.foodworldnaturals.com` DNS to Vercel
3. Update `NEXT_PUBLIC_API_URL` in frontend to `https://api.foodworldnaturals.com`
