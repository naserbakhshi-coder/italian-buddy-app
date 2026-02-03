# Deployment Guide - My Italian Buddy

This guide will help you deploy the Italian language learning app so it's accessible from the internet for iPhone users.

## Prerequisites

- GitHub account (for version control and deployment)
- Railway or Render account (free tier available)
- Expo account (free)

## Deployment Steps

### Step 1: Deploy Backend to Railway (Recommended - Easiest)

1. **Push your code to GitHub**
   ```bash
   cd "/Users/NBakhshi/My Italian Buddy - Italian Language Coach "
   git init
   git add .
   git commit -m "Initial commit - Italian Buddy app"
   # Create a new repository on GitHub first, then:
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to https://railway.app
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect the backend folder
   - Set root directory to `/backend` if needed

3. **Configure Environment Variables on Railway**
   - In Railway dashboard, go to your project → Variables
   - Add these environment variables:
     - `ANTHROPIC_API_KEY` = (your Anthropic API key)
     - `OPENAI_API_KEY` = (your OpenAI API key)
     - `SUPABASE_URL` = (your Supabase URL)
     - `SUPABASE_ANON_KEY` = (your Supabase anon key)
     - `NODE_ENV` = production
     - `PORT` = 3000

4. **Get your Railway deployment URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Test it: `https://your-app.up.railway.app/health`

### Alternative: Deploy Backend to Render

1. **Deploy to Render**
   - Go to https://render.com
   - Sign up/login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - Name: italian-buddy-backend
     - Root Directory: backend
     - Build Command: `npm install`
     - Start Command: `node server.js`

2. **Configure Environment Variables**
   - Same as Railway above

### Step 2: Update Mobile App API Endpoint

1. **Update the API base URL in mobile app**
   - Edit: `mobile/src/services/api.js`
   - Replace `http://192.168.237.101:3000` with your Railway/Render URL
   - Example: `https://your-app.up.railway.app`

### Step 3: Deploy Mobile App with Expo

**Option A: Expo Go (Quick Testing - No App Store)**

1. **Install Expo CLI** (if not already installed)
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   cd mobile
   eas login
   ```

3. **Configure Expo project**
   ```bash
   eas build:configure
   ```

4. **Publish update**
   ```bash
   expo publish
   ```

5. **Share with users**
   - Users install Expo Go app from App Store
   - Share your Expo project URL with them
   - They scan QR code or open link in Expo Go

**Option B: Standalone iOS App (Full Production - Requires Apple Developer Account)**

1. **Requirements**
   - Apple Developer account ($99/year)
   - Bundle identifier (e.g., com.yourname.italianbuddy)

2. **Configure app.json**
   - Set bundle identifier
   - Set app version

3. **Build iOS app**
   ```bash
   eas build --platform ios
   ```

4. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

## Quick Start Commands

```bash
# 1. Deploy backend (after setting up Railway/Render)
# Just push to GitHub - Railway/Render auto-deploys

# 2. Update mobile app API URL
# Edit mobile/src/services/api.js with your production URL

# 3. Test locally first
cd backend
npm start

cd ../mobile
npm start

# 4. When ready, publish to Expo
cd mobile
expo publish
```

## Environment Variables Needed

**Backend (.env or Railway/Render dashboard):**
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- NODE_ENV=production
- PORT=3000

**Mobile (app.json):**
- API_URL (set in code or config)

## Testing Deployment

1. **Backend Health Check**
   ```bash
   curl https://your-app.up.railway.app/health
   ```

2. **Mobile App**
   - Open Expo Go on iPhone
   - Scan QR code from `expo publish`
   - Test all features

## Troubleshooting

**Backend Issues:**
- Check Railway/Render logs
- Verify environment variables are set
- Test health endpoint

**Mobile App Issues:**
- Clear Expo cache: `expo start -c`
- Check API URL is correct
- Verify backend is running

## Cost Breakdown

**Free Tier (Testing):**
- Railway: $5 credit/month (enough for testing)
- Render: Free tier available
- Expo: Free for development
- Supabase: Free tier

**Production (App Store):**
- Apple Developer: $99/year
- Railway/Render: ~$5-10/month
- Expo: Free
- Supabase: Free tier or ~$25/month for pro

## Next Steps

1. ✅ Backend deployed to Railway/Render
2. ✅ Environment variables configured
3. ✅ Mobile app updated with production API URL
4. ✅ Published to Expo (for testing)
5. ⏳ Submit to App Store (optional - requires Apple Developer account)

## Support

If you encounter issues:
1. Check deployment logs on Railway/Render
2. Verify all environment variables are set
3. Test backend health endpoint
4. Check mobile app API configuration
