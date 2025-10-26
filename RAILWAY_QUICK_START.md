# Railway Quick Start - TL;DR Version

## 1. Push to GitHub (If Not Done)
```bash
# Check if you have a remote
git remote -v

# If no remote, add one (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin master
```

## 2. Railway Setup (15 minutes)

### A. Create Project & Database
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo" → Select your repo
3. Click "+ New" → "Database" → "PostgreSQL"

### B. Deploy Backend
1. Click "+ New" → "GitHub Repo" → Select your repo
2. Settings → Change "Root Directory" to `/backend`
3. Settings → Variables → Add these:
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   CORS_ORIGIN=<will-add-later>
   PORT=3001
   LOG_LEVEL=info
   ```
4. Settings → Domains → "Generate Domain" → **Copy this URL!**

### C. Deploy Frontend
1. Click "+ New" → "GitHub Repo" → Select your repo
2. Settings → Change "Root Directory" to `/frontend`
3. Settings → Variables → Add:
   ```
   VITE_API_URL=<your-backend-url-from-step-B4>
   ```
4. Settings → Domains → "Generate Domain" → **Copy this URL!**

### D. Update Backend CORS
1. Go to Backend service
2. Variables → Edit `CORS_ORIGIN`
3. Set it to your frontend URL from step C4
4. Backend will auto-redeploy

## 3. Test It!
Visit your frontend URL and test the app!

## URLs You'll Get
- **Frontend**: `https://your-app-production-abc123.up.railway.app`
- **Backend**: `https://your-app-production-xyz789.up.railway.app`

## Cost
- Free tier: $5 credit/month
- Your app: ~$3-4/month
- You're good for testing!

## Help?
Read full guide: `DEPLOYMENT.md`
