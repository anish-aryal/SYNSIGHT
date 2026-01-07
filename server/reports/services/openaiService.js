import axios from 'axios';

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini';
  }

  async generateCompletion(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured. Please add it to your .env file.');
    }

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 4096,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return {
        content,
        usage: response.data?.usage || {}
      };
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || 'Unknown error';

        if (status === 401) {
          throw new Error('Invalid API key');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 500) {
          throw new Error('OpenAI service temporarily unavailable');
        }
        throw new Error(`OpenAI API error: ${message}`);
      }
      throw error;
    }
  }
}

export default new OpenAIService();