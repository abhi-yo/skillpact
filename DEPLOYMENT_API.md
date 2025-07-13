# API Deployment Guide for Vercel

## Overview

This guide explains how to deploy the NestJS API from the monorepo to Vercel.

## Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- Environment variables set up in Vercel dashboard

## Deployment Steps

### 1. Create New Vercel Project

1. Go to Vercel dashboard
2. Click "New Project"
3. Select your GitHub repository: `abhi-yo/skillexchange`
4. **Important**: Set Root Directory to `.` (root of the monorepo, NOT `apps/api`)
5. Set Framework Preset to "Other"

### 2. Configure Environment Variables

Add these environment variables in Vercel dashboard:

```
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=your_strong_random_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
```

### 3. Deploy

The deployment will automatically:

1. Install dependencies with `pnpm install`
2. Build the database package (includes Prisma generate)
3. Build the API package
4. Deploy the serverless function

## Configuration Files

### vercel.json

- Configures build commands and routing
- Points to the serverless wrapper function
- Handles monorepo workspace dependencies

### serverless.js

- Wraps the NestJS application for Vercel's serverless environment
- Handles request/response routing
- Ensures single app instance per serverless function

## Project Structure

```
skillexchange/
├── vercel.json                 # Vercel configuration
├── apps/
│   └── api/
│       ├── serverless.js      # Serverless wrapper
│       └── dist/              # Built NestJS app
└── packages/
    └── database/              # Shared database package
```

## Common Issues and Solutions

### 1. Workspace Dependencies

- **Problem**: `database` package not found
- **Solution**: Deploy from monorepo root, not `apps/api`

### 2. Build Order

- **Problem**: API tries to import database before it's built
- **Solution**: Build database first, then API (handled in vercel.json)

### 3. Serverless Functions

- **Problem**: NestJS app not compatible with serverless
- **Solution**: Use serverless wrapper (serverless.js)

## Testing the Deployment

After deployment, test the API endpoints:

- `GET /` - Health check
- `GET /users` - Users endpoint
- Other endpoints as configured

## Monitoring

- Check Vercel dashboard for deployment logs
- Monitor function invocations and errors
- Set up alerts for failures

## Environment-Specific Notes

- Production uses pooled database connections
- Serverless functions have cold start times
- Database connections are managed per function invocation
