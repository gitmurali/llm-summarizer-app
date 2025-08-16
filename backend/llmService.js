import fetch from 'node-fetch'; 
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config({ path: path.join(__dirname, '.env') });
if (result.error) {
  console.warn('Warning: .env file not found. Please create a .env file in the backend directory.');
  console.warn('Required environment variables: OPENAI_API_KEY');
  console.warn('You can copy .env.example to .env and fill in your values.');
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// handle missing openai-api key
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  console.error('Please create a .env file in the backend directory with:');
  console.error('OPENAI_API_KEY=your_actual_api_key_here');
  console.error('');
  console.error('You can get your API key from: https://platform.openai.com/api-keys');
  throw new Error('Missing OPENAI_API_KEY in environment. Please check the console for setup instructions.🚀');
}

console.log('✅ OPENAI_API_KEY is properly configured');

async function summarize(text) {
  const prompt = `Summarize the following text in a concise paragraph:\n\n${text}`;

  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}` 
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      prompt,
      max_tokens: 150, // Limit the length of the summary
      temperature: 0.7, // Creativity level
      n: 1, // Number of completions to generate
      stop: null // Sequence to stop generation
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].text.trim();
}

export default { summarize };