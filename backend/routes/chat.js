const express = require('express');
const router = express.Router();
const ItalianAgent = require('../agent');
const { saveConversation, getConversationHistory } = require('../db/supabase');

/**
 * POST /api/chat
 * Send a message in chat mode and receive AI response with grammar corrections
 *
 * Request body:
 * {
 *   message: string,
 *   userId: string (optional, defaults to 'demo-user'),
 *   conversationHistory: array (optional, for maintaining context)
 * }
 *
 * Response:
 * {
 *   aiMessage: string,
 *   grammarCorrections: object | null,
 *   conversationId: string
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userId = 'demo-user', conversationHistory = [] } = req.body;

    // Validate request
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Initialize agent (supports both Anthropic and OpenAI)
    const agent = new ItalianAgent(
      process.env.ANTHROPIC_API_KEY,
      process.env.OPENAI_API_KEY
    );

    // Get AI response
    console.log(`Processing chat message from user: ${userId}`);
    const { aiMessage, grammarCorrections } = await agent.chat(
      message,
      conversationHistory
    );

    // Save conversation to database
    let conversationId = null;
    try {
      const saved = await saveConversation({
        userId,
        mode: 'chat',
        userMessage: message,
        aiResponse: aiMessage,
        grammarCorrections
      });
      conversationId = saved.id;
    } catch (dbError) {
      // Log but don't fail the request if database save fails
      console.error('Failed to save conversation to database:', dbError.message);
    }

    // Return response
    res.json({
      aiMessage,
      grammarCorrections,
      conversationId
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);

    // Handle specific errors
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'Anthropic API key is not configured correctly'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/chat/history/:userId
 * Get conversation history for a user
 *
 * Query params:
 * - limit: number of recent messages (default: 20)
 *
 * Response:
 * {
 *   conversations: array
 * }
 */
router.get('/chat/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const conversations = await getConversationHistory(userId, 'chat', limit);

    res.json({
      conversations,
      count: conversations.length
    });

  } catch (error) {
    console.error('Error in /api/chat/history:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch conversation history'
    });
  }
});

module.exports = router;
