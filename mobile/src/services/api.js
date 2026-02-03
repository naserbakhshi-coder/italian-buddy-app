import axios from 'axios';
import { CONFIG } from '../../config';

// Use the configuration from config.js
// To deploy: Update IS_PRODUCTION and PRODUCTION_API_URL in mobile/config.js
const API_URL = `${CONFIG.apiUrl}/api`;

console.log('🌐 API URL:', API_URL);

/**
 * API client for Italian Learning Backend
 */
class ItalianBuddyAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.message);
        if (error.response) {
          // Server responded with error status
          console.error('Response data:', error.response.data);
          throw new Error(error.response.data.message || error.response.data.error);
        } else if (error.request) {
          // Request made but no response
          throw new Error('No response from server. Is the backend running?');
        } else {
          // Something else happened
          throw new Error(error.message);
        }
      }
    );
  }

  /**
   * Send a chat message and receive AI response
   * @param {string} message - User's Italian message
   * @param {string} userId - User ID (optional)
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} - { aiMessage, grammarCorrections }
   */
  async sendChatMessage(message, userId = 'demo-user', conversationHistory = []) {
    try {
      const response = await this.client.post('/chat', {
        message,
        userId,
        conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Get chat history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of messages to retrieve
   * @returns {Promise<Array>} - Array of conversations
   */
  async getChatHistory(userId = 'demo-user', limit = 20) {
    try {
      const response = await this.client.get(`/chat/history/${userId}`, {
        params: { limit },
      });
      return response.data.conversations;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Get vocabulary words due for review
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of vocabulary words
   */
  async getVocabularyDue(userId = 'demo-user') {
    try {
      const response = await this.client.get(`/vocabulary/due/${userId}`);
      return response.data.words;
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
  }

  /**
   * Submit vocabulary review result
   * @param {string} wordId - Vocabulary word ID
   * @param {boolean} correct - Whether user got it correct
   * @returns {Promise<Object>} - Updated vocabulary word
   */
  async reviewVocabulary(wordId, correct) {
    try {
      const response = await this.client.post('/vocabulary/review', {
        wordId,
        correct,
      });
      return response.data;
    } catch (error) {
      console.error('Error reviewing vocabulary:', error);
      throw error;
    }
  }

  /**
   * Seed initial vocabulary for a user
   * @param {string} userId - User ID
   * @param {number} count - Number of words to add
   * @returns {Promise<Object>} - { added, words }
   */
  async seedVocabulary(userId = 'demo-user', count = 20) {
    try {
      const response = await this.client.post('/vocabulary/seed', {
        userId,
        count,
      });
      return response.data;
    } catch (error) {
      console.error('Error seeding vocabulary:', error);
      throw error;
    }
  }

  /**
   * Get available scenarios
   * @returns {Promise<Array>} - Array of scenarios
   */
  async getScenarios() {
    try {
      const response = await this.client.get('/scenarios');
      return response.data.scenarios;
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }
  }

  /**
   * Send message in a scenario
   * @param {string} scenarioId - Scenario ID
   * @param {string} message - User's message
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} - AI response
   */
  async sendScenarioMessage(scenarioId, message, conversationHistory = []) {
    try {
      const response = await this.client.post('/scenarios/message', {
        scenarioId,
        userMessage: message,
        conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending scenario message:', error);
      throw error;
    }
  }

  /**
   * Get daily writing prompt
   * @returns {Promise<Object>} - { prompt }
   */
  async getDailyPrompt() {
    try {
      const response = await this.client.get('/daily-prompt');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily prompt:', error);
      throw error;
    }
  }

  /**
   * Submit daily prompt response for feedback
   * @param {string} response - User's Italian response
   * @returns {Promise<Object>} - { feedback }
   */
  async submitDailyPrompt(userResponse) {
    try {
      const response = await this.client.post('/daily-prompt/submit', {
        response: userResponse,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting daily prompt:', error);
      throw error;
    }
  }

  /**
   * Health check
   * @returns {Promise<Object>} - Server status
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health', {
        baseURL: API_URL.replace('/api', ''),
      });
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new ItalianBuddyAPI();
