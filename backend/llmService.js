import fetch from 'node-fetch';
import config from './config.js';

/**
 * Validates that the required environment variables are set
 * @throws {Error} - If OPENAI_API_KEY is missing
 */
function validateEnvironment() {
  if (!config.openai.apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
    console.error('Please create a .env file in the backend directory with:');
    console.error('OPENAI_API_KEY=your_actual_api_key_here');
    console.error('');
    console.error('You can get your API key from: https://platform.openai.com/api-keys');
    throw new Error('Missing OPENAI_API_KEY in environment. Please check the console for setup instructions.');
  }
  
  console.log('✅ OPENAI_API_KEY is properly configured');
}

/**
 * Validates input text for summarization
 * @param {string} text - Text to validate
 * @returns {boolean} - Whether text is valid
 */
function validateInput(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  if (text.trim().length === 0) {
    return false;
  }
  
  if (text.length > config.openai.maxInputLength) {
    return false;
  }
  
  return true;
}

/**
 * Creates the OpenAI API request payload
 * @param {string} text - Text to summarize
 * @returns {Object} - API request payload
 */
function createApiPayload(text) {
  return {
    model: config.openai.model,
    prompt: `Summarize the following text in a concise paragraph:\n\n${text}`,
    max_tokens: config.openai.maxTokens,
    temperature: config.openai.temperature,
    n: 1,
    stop: null,
  };
}

/**
 * Handles OpenAI API errors with better error messages
 * @param {Response} response - Fetch response object
 * @returns {Promise<never>} - Throws error with details
 */
async function handleApiError(response) {
  let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
  
  try {
    const errorData = await response.json();
    if (errorData.error?.message) {
      errorMessage += ` - ${errorData.error.message}`;
    } else if (errorData.error) {
      errorMessage += ` - ${JSON.stringify(errorData.error)}`;
    }
  } catch (parseError) {
    // If we can't parse the error response, use the status text
    console.warn('Could not parse error response:', parseError.message);
  }
  
  throw new Error(errorMessage);
}

/**
 * Summarizes text using OpenAI API
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summarized text
 * @throws {Error} - If input is invalid or API call fails
 */
async function summarize(text) {
  // Validate environment first
  validateEnvironment();
  
  // Input validation
  if (!validateInput(text)) {
    throw new Error('Invalid input: Text must be a non-empty string under 10,000 characters');
  }

  try {
    const response = await fetch(`${config.api.baseUrl}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify(createApiPayload(text)),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data.choices[0]?.text?.trim() || 'No summary generated';
    
  } catch (error) {
    // Re-throw validation errors as-is
    if (error.message.includes('Invalid input:')) {
      throw error;
    }
    
    // Enhance API errors with context
    if (error.message.includes('OpenAI API error:')) {
      throw error;
    }
    
    // Handle network/other errors
    throw new Error(`Summarization failed: ${error.message}`);
  }
}

export default { summarize };