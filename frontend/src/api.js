import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function summarizeText(text) {
  const response = await axios.post(`${API_BASE_URL}/api/summarize`, { text });
  return response.data; // Returns the data from the backend response
}
