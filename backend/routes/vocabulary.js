const express = require('express');
const router = express.Router();
const ItalianAgent = require('../agent');
const {
  getVocabularyDue,
  updateVocabularyReview,
  addVocabularyWord
} = require('../db/supabase');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/vocabulary/due/:userId
 * Get vocabulary words due for review
 *
 * Response:
 * {
 *   words: array of vocabulary words with examples
 * }
 */
router.get('/vocabulary/due/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const words = await getVocabularyDue(userId);

    res.json({
      words,
      count: words.length
    });

  } catch (error) {
    console.error('Error in /api/vocabulary/due:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch vocabulary'
    });
  }
});

/**
 * POST /api/vocabulary/review
 * Submit review result for a vocabulary word
 *
 * Request body:
 * {
 *   wordId: string,
 *   correct: boolean
 * }
 *
 * Response:
 * {
 *   word: updated vocabulary record,
 *   nextReview: date
 * }
 */
router.post('/vocabulary/review', async (req, res) => {
  try {
    const { wordId, correct } = req.body;

    if (!wordId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'wordId is required'
      });
    }

    if (typeof correct !== 'boolean') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'correct must be a boolean'
      });
    }

    const updatedWord = await updateVocabularyReview(wordId, correct);

    res.json({
      word: updatedWord,
      nextReview: updatedWord.next_review
    });

  } catch (error) {
    console.error('Error in /api/vocabulary/review:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to update vocabulary review'
    });
  }
});

/**
 * POST /api/vocabulary/generate-example
 * Generate an example sentence for a word using AI
 *
 * Request body:
 * {
 *   word: string (Italian word)
 * }
 *
 * Response:
 * {
 *   example_italian: string,
 *   example_english: string,
 *   usage_note: string (optional)
 * }
 */
router.post('/vocabulary/generate-example', async (req, res) => {
  try {
    const { word } = req.body;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'word is required and must be a string'
      });
    }

    // Initialize agent
    const agent = new ItalianAgent(
      process.env.ANTHROPIC_API_KEY,
      process.env.OPENAI_API_KEY
    );

    const result = await agent.generateVocabularyExample(word);

    res.json(result);

  } catch (error) {
    console.error('Error in /api/vocabulary/generate-example:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to generate example'
    });
  }
});

/**
 * POST /api/vocabulary/seed
 * Seed initial vocabulary for a user from vocabulary.json
 *
 * Request body:
 * {
 *   userId: string,
 *   count: number (optional, default 20)
 * }
 *
 * Response:
 * {
 *   added: number,
 *   words: array
 * }
 */
router.post('/vocabulary/seed', async (req, res) => {
  try {
    const { userId, count = 20 } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId is required'
      });
    }

    // Load vocabulary data
    const vocabularyPath = path.join(__dirname, '../data/vocabulary.json');
    const vocabularyData = JSON.parse(fs.readFileSync(vocabularyPath, 'utf-8'));

    // Shuffle and take first 'count' words
    const shuffled = vocabularyData.sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, Math.min(count, vocabularyData.length));

    // Add words to database
    const addedWords = [];
    const errors = [];
    for (const wordData of selectedWords) {
      try {
        const added = await addVocabularyWord({
          userId,
          word: wordData.word,
          translation: wordData.translation,
          exampleItalian: `Example will be generated when reviewed.`
        });
        addedWords.push(added);
      } catch (error) {
        console.error(`Failed to add word ${wordData.word}:`, error.message);
        errors.push({ word: wordData.word, error: error.message });
      }
    }

    res.json({
      added: addedWords.length,
      words: addedWords,
      errors: errors.length > 0 ? errors : undefined,
      debug: {
        totalVocabulary: vocabularyData.length,
        selectedCount: selectedWords.length,
        requestedCount: count
      }
    });

  } catch (error) {
    console.error('Error in /api/vocabulary/seed:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to seed vocabulary'
    });
  }
});

module.exports = router;
