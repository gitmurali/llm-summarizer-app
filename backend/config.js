import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables from .env file
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
  console.warn('Warning: .env file not found. Please create a .env file in the backend directory.');
  console.warn('Required environment variables: OPENAI_API_KEY');
  console.warn('You can copy .env.example to .env and fill in your values.');
}

// Check if the file exists
try {
  const envPath = path.join(__dirname, '.env');
  const stats = fs.statSync(envPath);
  console.log('.env file exists, size:', stats.size, 'bytes');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('.env file content (first 100 chars):', content.substring(0, 100));
} catch (err) {
  console.error('Error reading .env file:', err.message);
}

// Configuration object with all environment variables
const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 150,
    temperature: 0.7,
    maxInputLength: 10000,
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // API Configuration
  api: {
    baseUrl: 'https://api.openai.com/v1',
  },
};

// Log environment variables for debugging (remove in production)
console.log('Environment check:');
console.log('- PORT:', config.server.port);
console.log('- OPENAI_API_KEY:', config.openai.apiKey ? 'Set' : 'Not set');
console.log('- NODE_ENV:', config.server.nodeEnv);

// Validation function
function validateConfig() {
  if (!config.openai.apiKey) {
    throw new Error('Missing OPENAI_API_KEY in environment. Please check the console for setup instructions.');
  }
  return true;
}

export default config;
export { validateConfig };
