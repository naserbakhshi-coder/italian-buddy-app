/**
 * App Configuration
 *
 * To deploy:
 * 1. Set IS_PRODUCTION to true
 * 2. Update PRODUCTION_API_URL with your Railway/Render URL
 * 3. Build and publish with Expo
 */

// Toggle this when deploying
const IS_PRODUCTION = true;

// Your production backend URL (from Railway/Render)
const PRODUCTION_API_URL = 'https://italian-buddy-app-production.up.railway.app';

// Development URL (local network)
const DEVELOPMENT_API_URL = 'http://192.168.68.108:3000';

// Export the active configuration
export const API_BASE_URL = IS_PRODUCTION ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

export const CONFIG = {
  apiUrl: API_BASE_URL,
  environment: IS_PRODUCTION ? 'production' : 'development',
};

console.log('🔧 App Config:', CONFIG);
