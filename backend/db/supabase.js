const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key for backend (bypasses RLS), fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Fixed UUID for demo user (vocabulary table requires UUID format)
const DEMO_USER_UUID = '00000000-0000-0000-0000-000000000001';

/**
 * Convert user ID to UUID format for vocabulary table
 * @param {string} userId - User ID (may be 'demo-user' or a UUID)
 * @returns {string} - UUID format user ID
 */
function toVocabularyUserId(userId) {
  if (userId === 'demo-user') {
    return DEMO_USER_UUID;
  }
  return userId;
}

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not configured. Database operations will fail.');
} else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. Using anon key - some operations may fail due to RLS policies.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Save a conversation message to the database
 * @param {Object} data - Conversation data
 * @returns {Promise<Object>} - Saved conversation record
 */
async function saveConversation(data) {
  const { error, data: result } = await supabase
    .from('conversations')
    .insert({
      user_id: data.userId,
      mode: data.mode,
      user_message: data.userMessage,
      ai_response: data.aiResponse,
      grammar_corrections: data.grammarCorrections
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }

  return result;
}

/**
 * Get conversation history for a user
 * @param {string} userId - User ID
 * @param {string} mode - Mode filter (optional)
 * @param {number} limit - Number of recent messages to retrieve
 * @returns {Promise<Array>} - Array of conversation records
 */
async function getConversationHistory(userId, mode = null, limit = 20) {
  let query = supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (mode) {
    query = query.eq('mode', mode);
  }

  const { error, data } = await query;

  if (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }

  // Return in chronological order (oldest first)
  return data.reverse();
}

/**
 * Get vocabulary words due for review
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of vocabulary words
 */
async function getVocabularyDue(userId) {
  const now = new Date().toISOString();
  const vocabUserId = toVocabularyUserId(userId);

  const { error, data } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('user_id', vocabUserId)
    .lte('next_review', now)
    .order('next_review', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Error fetching vocabulary:', error);
    throw error;
  }

  return data;
}

/**
 * Update vocabulary review result
 * @param {string} wordId - Vocabulary word ID
 * @param {boolean} correct - Whether the user got it correct
 * @returns {Promise<Object>} - Updated vocabulary record
 */
async function updateVocabularyReview(wordId, correct) {
  // Get current word data
  const { data: word, error: fetchError } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('id', wordId)
    .single();

  if (fetchError) {
    console.error('Error fetching vocabulary word:', fetchError);
    throw fetchError;
  }

  // Calculate next review date using spaced repetition
  // Intervals: 1d, 3d, 7d, 14d, 30d
  const intervals = [1, 3, 7, 14, 30];
  let nextInterval;

  if (correct) {
    const currentCorrect = word.correct_count || 0;
    const intervalIndex = Math.min(currentCorrect, intervals.length - 1);
    nextInterval = intervals[intervalIndex];
  } else {
    // Reset to first interval if incorrect
    nextInterval = intervals[0];
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + nextInterval);

  // Update word
  const { error: updateError, data: result } = await supabase
    .from('vocabulary')
    .update({
      correct_count: correct ? (word.correct_count || 0) + 1 : 0,
      last_reviewed: new Date().toISOString(),
      next_review: nextReview.toISOString()
    })
    .eq('id', wordId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating vocabulary:', updateError);
    throw updateError;
  }

  return result;
}

/**
 * Add a new vocabulary word for a user
 * @param {Object} data - Vocabulary data
 * @returns {Promise<Object>} - Created vocabulary record
 */
async function addVocabularyWord(data) {
  // Set next_review to now so words are immediately available for review
  const nextReview = new Date();
  const vocabUserId = toVocabularyUserId(data.userId);

  const { error, data: result } = await supabase
    .from('vocabulary')
    .insert({
      user_id: vocabUserId,
      word: data.word,
      translation: data.translation,
      example_italian: data.exampleItalian,
      correct_count: 0,
      last_reviewed: new Date().toISOString(),
      next_review: nextReview.toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding vocabulary word:', error);
    throw error;
  }

  return result;
}

module.exports = {
  supabase,
  saveConversation,
  getConversationHistory,
  getVocabularyDue,
  updateVocabularyReview,
  addVocabularyWord
};
