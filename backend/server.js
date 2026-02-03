// Load environment variables from .env file (local) or use platform environment (production)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../.env' });
} else {
  require('dotenv').config(); // Look for .env in current directory in production
}
const express = require('express');
const cors = require('cors');
const chatRouter = require('./routes/chat');
const vocabularyRouter = require('./routes/vocabulary');
const scenariosRouter = require('./routes/scenarios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for mobile app
app.use(express.json()); // Parse JSON request bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'My Italian Buddy API'
  });
});

// Temporary debug endpoint - remove after diagnosis
app.get('/debug-env', (req, res) => {
  // Test which provider would be selected
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const isValidKey = (key, prefix) => key && key.startsWith(prefix) && key.length > 20;

  let selectedProvider = 'none';
  if (isValidKey(openaiKey, 'sk-')) {
    selectedProvider = 'openai';
  } else if (isValidKey(anthropicKey, 'sk-ant-')) {
    selectedProvider = 'anthropic';
  }

  res.json({
    ANTHROPIC_API_KEY: anthropicKey ? anthropicKey.slice(0, 20) + '...' : 'NOT SET',
    OPENAI_API_KEY: openaiKey ? openaiKey.slice(0, 20) + '...' : 'NOT SET',
    selectedProvider,
    anthropicValid: isValidKey(anthropicKey, 'sk-ant-'),
    openaiValid: isValidKey(openaiKey, 'sk-'),
    NODE_ENV: process.env.NODE_ENV,
    cwd: process.cwd(),
    __dirname: __dirname
  });
});

// API Routes
app.use('/api', chatRouter);
app.use('/api', vocabularyRouter);
app.use('/api', scenariosRouter);
// Future routes will be added here:
// app.use('/api', dailyPromptRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server - listen on all network interfaces for iPhone access
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('My Italian Buddy API Server');
  console.log('=================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Network access: http://192.168.236.226:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('=================================');

  // Check for required environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not set in .env file');
  }
  if (!process.env.SUPABASE_URL) {
    console.warn('⚠️  WARNING: SUPABASE_URL not set in .env file');
  }
  if (!process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  WARNING: SUPABASE_ANON_KEY not set in .env file');
  }
});

module.exports = app;
