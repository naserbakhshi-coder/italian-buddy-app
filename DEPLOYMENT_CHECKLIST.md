# 🚀 Quick Deployment Checklist

Follow these steps to deploy your Italian Buddy app to the internet.

## ✅ Step 1: Prepare Your Code

- [x] Backend deployment files created (railway.json, render.yaml)
- [x] Mobile config file created (mobile/config.js)
- [x] .gitignore file created
- [x] Environment example file created (.env.example)

## ☐ Step 2: Deploy Backend (Choose One)

### Option A: Railway (Recommended)

1. ☐ Go to https://railway.app and sign in with GitHub
2. ☐ Click "New Project" → "Deploy from GitHub repo"
3. ☐ Select your repository, set root directory to `/backend`
4. ☐ Add environment variables in Railway dashboard:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV=production`
5. ☐ Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

### Option B: Render

1. ☐ Go to https://render.com and sign in with GitHub
2. ☐ Click "New +" → "Web Service"
3. ☐ Connect repository, set root directory to `backend`
4. ☐ Add environment variables (same as Railway)
5. ☐ Copy your Render URL

## ☐ Step 3: Update Mobile App

1. ☐ Open `mobile/config.js`
2. ☐ Change `IS_PRODUCTION` to `true`
3. ☐ Update `PRODUCTION_API_URL` with your Railway/Render URL
4. ☐ Save the file

```javascript
const IS_PRODUCTION = true;
const PRODUCTION_API_URL = 'https://your-app.up.railway.app'; // Your actual URL
```

## ☐ Step 4: Test Backend

Test your deployed backend:
```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "My Italian Buddy API"
}
```

## ☐ Step 5: Deploy Mobile App

### Quick Testing (Expo Go):

```bash
cd mobile
npx expo publish
```

- ☐ Share the QR code or link with testers
- ☐ Users install "Expo Go" from App Store
- ☐ Users scan QR code to test the app

### Production (App Store - Optional):

Requires Apple Developer account ($99/year):

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
eas submit --platform ios
```

## ☐ Step 6: Share with Users

**For Expo Go (Testing):**
- Share the Expo project URL
- Users download Expo Go from App Store
- Users scan QR code or open link in Expo Go

**For App Store (Production):**
- App will be available in Apple App Store after review
- Users search for "My Italian Buddy" in App Store

## 🔍 Verification

- ☐ Backend health endpoint works
- ☐ Mobile app connects to backend
- ☐ Chat mode works
- ☐ Scenario mode works
- ☐ Grammar corrections appear
- ☐ All features functional

## 🎉 Done!

Your app is now live and accessible to iPhone users!

## 📞 Need Help?

Check these resources:
- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs
- Expo docs: https://docs.expo.dev
- Full guide: See DEPLOYMENT_GUIDE.md
