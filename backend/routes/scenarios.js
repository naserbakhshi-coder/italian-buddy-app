const express = require('express');
const router = express.Router();
const ItalianAgent = require('../agent');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/scenarios
 * Get all available scenarios
 *
 * Response:
 * {
 *   scenarios: array of scenario objects
 * }
 */
router.get('/scenarios', async (req, res) => {
  try {
    const scenariosPath = path.join(__dirname, '../data/scenarios.json');
    const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'));

    res.json({
      scenarios,
      count: scenarios.length
    });

  } catch (error) {
    console.error('Error in /api/scenarios:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch scenarios'
    });
  }
});

/**
 * GET /api/scenarios/:scenarioId
 * Get a specific scenario by ID
 *
 * Response:
 * {
 *   scenario: scenario object
 * }
 */
router.get('/scenarios/:scenarioId', async (req, res) => {
  try {
    const { scenarioId } = req.params;

    const scenariosPath = path.join(__dirname, '../data/scenarios.json');
    const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'));

    const scenario = scenarios.find(s => s.id === scenarioId);

    if (!scenario) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Scenario with id "${scenarioId}" not found`
      });
    }

    res.json({ scenario });

  } catch (error) {
    console.error('Error in /api/scenarios/:scenarioId:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch scenario'
    });
  }
});

/**
 * POST /api/scenarios/message
 * Send a message in scenario mode and get AI response
 *
 * Request body:
 * {
 *   scenarioId: string,
 *   userMessage: string,
 *   conversationHistory: array (optional)
 * }
 *
 * Response:
 * {
 *   response: string (AI response in character)
 * }
 */
router.post('/scenarios/message', async (req, res) => {
  try {
    const { scenarioId, userMessage, conversationHistory = [] } = req.body;

    if (!scenarioId || typeof scenarioId !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'scenarioId is required and must be a string'
      });
    }

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userMessage is required and must be a string'
      });
    }

    // Load scenario
    const scenariosPath = path.join(__dirname, '../data/scenarios.json');
    const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'));
    const scenario = scenarios.find(s => s.id === scenarioId);

    if (!scenario) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Scenario with id "${scenarioId}" not found`
      });
    }

    // Initialize agent
    const agent = new ItalianAgent(
      process.env.ANTHROPIC_API_KEY,
      process.env.OPENAI_API_KEY
    );

    // Get AI response in scenario mode
    const result = await agent.runScenario({
      scenario,
      userMessage,
      conversationHistory
    });

    res.json({
      response: result.response,
      grammarCorrections: result.grammarCorrections
    });

  } catch (error) {
    console.error('Error in /api/scenarios/message:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to process scenario message'
    });
  }
});

module.exports = router;
