# Railway Deployment Guide

This guide will walk you through deploying your Investment Portfolio Management app to Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub account
- Your code pushed to GitHub

## Step 1: Push Code to GitHub (If Not Already Done)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Railway deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin master
```

## Step 2: Create a New Railway Project

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authenticate with GitHub if prompted
5. Select your repository

## Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click "+ New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will automatically create and configure the database
5. **IMPORTANT**: Copy the `DATABASE_URL` connection string (you'll need it)

## Step 4: Deploy Backend Service

1. Click "+ New" → "GitHub Repo" → Select your repo again
2. Configure the service:
   - **Name**: `backend` (or any name you prefer)
   - **Root Directory**: `/backend`
   - Railway will auto-detect it's a Node.js app

3. Add Environment Variables (Settings → Variables):
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generate-a-strong-random-secret>
   CORS_ORIGIN=<will-add-after-frontend-deployment>
   LOG_LEVEL=info
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **To generate a strong JWT_SECRET**, run this in your terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Railway will automatically deploy

5. Once deployed, copy the backend URL:
   - Go to Settings → Domains
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-backend-xyz.railway.app`)

## Step 5: Deploy Frontend Service

1. Click "+ New" → "GitHub Repo" → Select your repo
2. Configure the service:
   - **Name**: `frontend`
   - **Root Directory**: `/frontend`

3. Add Environment Variables:
   ```
   VITE_API_URL=<your-backend-url-from-step-4>
   ```
   Example: `VITE_API_URL=https://your-backend-xyz.railway.app`

4. Railway will automatically deploy

5. Generate a domain:
   - Go to Settings → Domains
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-frontend-abc.railway.app`)

## Step 6: Update Backend CORS

1. Go to your backend service in Railway
2. Update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-frontend-abc.railway.app
   ```
3. The backend will automatically redeploy

## Step 7: Database Migration

Railway automatically runs `npx prisma migrate deploy` during backend deployment (configured in railway.json), so your database schema is already set up!

## Step 8: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend-abc.railway.app`
2. Test registration and login
3. Create test data

## Important Notes

### File Uploads
- Railway has ephemeral filesystem (files are deleted on redeployment)
- For production, you'll need to use cloud storage (S3, Cloudinary, etc.)
- For testing purposes, uploaded images will work but disappear on redeploy

### Database
- Railway provides a shared PostgreSQL database on free tier
- Automatically backs up your data
- Connection pooling is handled automatically

### Monitoring
- Railway provides logs in the deployment view
- Click on any service to see real-time logs

### Costs
- **Free Tier**: $5 credit/month
- Typical usage for testing: ~$3-4/month
- If you need more, plans start at $5/month

## Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Verify all environment variables are set
- Make sure DATABASE_URL is referencing the Postgres service: `${{Postgres.DATABASE_URL}}`

### Frontend can't connect to backend
- Verify VITE_API_URL is set correctly
- Check CORS_ORIGIN in backend matches frontend domain
- Check backend logs for CORS errors

### Database connection errors
- Make sure Postgres service is running
- Verify DATABASE_URL is correct
- Check if migrations ran successfully (check backend deployment logs)

### Build failures
- Check build logs in Railway
- Make sure all dependencies are in package.json (not just devDependencies)
- Verify build commands in railway.json are correct

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check deployment logs for specific error messages

## Environment Variables Quick Reference

### Backend
- `NODE_ENV` - Set to "production"
- `PORT` - Set to 3001 (Railway provides $PORT automatically)
- `DATABASE_URL` - Reference Railway Postgres: `${{Postgres.DATABASE_URL}}`
- `JWT_SECRET` - Strong random secret (use crypto.randomBytes)
- `CORS_ORIGIN` - Your frontend Railway URL
- `LOG_LEVEL` - "info" recommended
- `RATE_LIMIT_WINDOW_MS` - 900000 (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS` - 100

### Frontend
- `VITE_API_URL` - Your backend Railway URL

## After Deployment

1. Test all features thoroughly
2. Share the frontend URL with your tester
3. Monitor logs for any errors
4. Consider setting up custom domains (Railway supports this)

## Optional: Custom Domain

Railway allows custom domains on all plans:
1. Go to Settings → Domains
2. Click "Custom Domain"
3. Enter your domain
4. Configure DNS as instructed

---

**You're all set! 🚀**

Your app should now be live on Railway. The frontend and backend are connected, and the database is ready to use.
