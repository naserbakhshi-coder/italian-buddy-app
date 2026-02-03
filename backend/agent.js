const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class ItalianAgent {
  constructor(anthropicKey, openaiKey) {
    // Helper to check if a key is valid (not a placeholder)
    const isValidKey = (key, prefix) => key && key.startsWith(prefix) && key.length > 20;

    // Determine which provider to use (prefer OpenAI for cost, fall back to Anthropic)
    if (isValidKey(openaiKey, 'sk-')) {
      this.provider = 'openai';
      this.client = new OpenAI({ apiKey: openaiKey });
      this.model = 'gpt-4o-mini'; // Cheaper and faster
      console.log('✅ Using OpenAI as AI provider');
    } else if (isValidKey(anthropicKey, 'sk-ant-')) {
      this.provider = 'anthropic';
      this.client = new Anthropic({ apiKey: anthropicKey });
      this.model = 'claude-sonnet-4-5-20250929';
      console.log('✅ Using Anthropic Claude as AI provider');
    } else {
      throw new Error('No valid API key found. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env file');
    }
  }

  /**
   * Load workflow instructions from markdown file
   * @param {string} mode - The workflow mode (chat, vocabulary, scenario, daily_prompt)
   * @returns {string} - The workflow content
   */
  loadWorkflow(mode) {
    const workflowPath = path.join(__dirname, 'workflows', `${mode}_mode.md`);

    if (!fs.existsSync(workflowPath)) {
      const debug = { workflowPath, __dirname, cwd: process.cwd(), files: fs.readdirSync(__dirname).slice(0, 20) };
      throw new Error(`Workflow file not found. Debug: ${JSON.stringify(debug)}`);
    }

    return fs.readFileSync(workflowPath, 'utf-8');
  }

  /**
   * Chat mode: Italian conversation with grammar correction
   * @param {string} userMessage - User's Italian message
   * @param {Array} conversationHistory - Previous messages in format
   * @returns {Object} - { aiMessage, grammarCorrections }
   */
  async chat(userMessage, conversationHistory = []) {
    try {
      // Load chat workflow
      const workflow = this.loadWorkflow('chat');

      // Limit conversation history to last 10 exchanges (20 messages)
      const limitedHistory = conversationHistory.slice(-20);

      let responseText;

      if (this.provider === 'openai') {
        // OpenAI format: system message + conversation history
        const messages = [
          { role: 'system', content: workflow },
          ...limitedHistory,
          { role: 'user', content: userMessage }
        ];

        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: messages,
          max_tokens: 1024,
          temperature: 0.7,
        });

        responseText = response.choices[0].message.content;
      } else {
        // Anthropic format: system in separate field
        const messages = [
          ...limitedHistory,
          { role: 'user', content: userMessage }
        ];

        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 1024,
          temperature: 0.7,
          system: workflow,
          messages: messages
        });

        responseText = response.content[0].text;
      }

      // Parse response to extract AI message and grammar corrections
      return this.parseResponse(responseText);
    } catch (error) {
      console.error('Error in chat agent:', error);
      throw error;
    }
  }

  /**
   * Parse Claude's response to extract AI message and grammar corrections
   * @param {string} text - Raw response from Claude
   * @returns {Object} - { aiMessage, grammarCorrections }
   */
  parseResponse(text) {
    try {
      // Look for JSON block containing grammar corrections
      // Format: ```json\n{...}\n``` or just {...}
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```|(\{[\s\S]*?"errors"[\s\S]*?\})/);

      let grammarCorrections = null;
      let aiMessage = text;

      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        try {
          grammarCorrections = JSON.parse(jsonString.trim());
          // Remove JSON from AI message
          aiMessage = text.replace(jsonMatch[0], '').trim();
        } catch (parseError) {
          console.error('Error parsing grammar corrections JSON:', parseError);
          // If parsing fails, just return the full text
        }
      }

      return {
        aiMessage: aiMessage,
        grammarCorrections: grammarCorrections
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        aiMessage: text,
        grammarCorrections: null
      };
    }
  }

  /**
   * Vocabulary mode: Generate flashcard with example
   * @param {string} word - Italian word
   * @returns {Object} - { example_italian, example_english, usage_note }
   */
  async generateVocabularyExample(word) {
    try {
      const workflow = this.loadWorkflow('vocabulary');
      const userPrompt = `Generate an example sentence for the Italian word: "${word}"`;

      let responseText;

      if (this.provider === 'openai') {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: workflow },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 512,
          temperature: 0.7,
        });
        responseText = response.choices[0].message.content;
      } else {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 512,
          temperature: 0.7,
          system: workflow,
          messages: [{
            role: 'user',
            content: userPrompt
          }]
        });
        responseText = response.content[0].text;
      }

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if no JSON found
      return {
        example_italian: responseText,
        example_english: '',
        usage_note: ''
      };
    } catch (error) {
      console.error('Error generating vocabulary example:', error);
      throw error;
    }
  }

  /**
   * Scenario mode: Role-play conversation
   * @param {Object} params - Parameters object
   * @param {Object} params.scenario - Scenario details (title, aiRole, objectives)
   * @param {string} params.userMessage - User's message in scenario
   * @param {Array} params.conversationHistory - Previous messages
   * @returns {Object} - { response }
   */
  async runScenario({ scenario, userMessage, conversationHistory = [] }) {
    try {
      const workflow = this.loadWorkflow('scenario');

      // Inject scenario details into system prompt
      const systemPrompt = `${workflow}\n\n## Current Scenario\n**Title:** ${scenario.title}\n**Your Role:** ${scenario.aiRole}\n**Objectives:** ${scenario.objectives.join(', ')}`;

      // Limit conversation history to last 10 exchanges (20 messages)
      const limitedHistory = conversationHistory.slice(-20);

      let responseText;

      if (this.provider === 'openai') {
        // OpenAI format: system message + conversation history
        const messages = [
          { role: 'system', content: systemPrompt },
          ...limitedHistory,
          { role: 'user', content: userMessage }
        ];

        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: messages,
          max_tokens: 1024,
          temperature: 0.7,
        });

        responseText = response.choices[0].message.content;
      } else {
        // Anthropic format: system in separate field
        const messages = [
          ...limitedHistory,
          { role: 'user', content: userMessage }
        ];

        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 1024,
          temperature: 0.7,
          system: systemPrompt,
          messages: messages
        });

        responseText = response.content[0].text;
      }

      // Parse response to extract AI message and grammar corrections
      const parsed = this.parseResponse(responseText);

      return {
        response: parsed.aiMessage,
        grammarCorrections: parsed.grammarCorrections
      };
    } catch (error) {
      console.error('Error in scenario agent:', error);
      throw error;
    }
  }

  /**
   * Daily Prompt mode: Generate writing prompt and evaluate response
   * @param {string} action - 'generate' or 'evaluate'
   * @param {string} data - For 'evaluate': user's response
   * @returns {Object} - { prompt } or { feedback }
   */
  async dailyPrompt(action, data = null) {
    try {
      const workflow = this.loadWorkflow('daily_prompt');

      let userContent;
      if (action === 'generate') {
        userContent = `Generate a creative Italian writing prompt for an intermediate learner (B1-B2 level). Make it engaging and relevant to daily life.`;
      } else if (action === 'evaluate') {
        userContent = `Evaluate this Italian writing response and provide feedback:\n\n${data}`;
      } else {
        throw new Error('Invalid action for daily prompt');
      }

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: workflow,
        messages: [{ role: 'user', content: userContent }]
      });

      if (action === 'generate') {
        return { prompt: response.content[0].text };
      } else {
        return { feedback: response.content[0].text };
      }
    } catch (error) {
      console.error('Error in daily prompt agent:', error);
      throw error;
    }
  }
}

module.exports = ItalianAgent;
