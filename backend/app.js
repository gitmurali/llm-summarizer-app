import express from 'express';
import cors from 'cors';
import config from './config.js';
import llmService from './llmService.js';

const app = express();
app.use(cors()); 
app.use(express.json());

// API endpoint to summarize text
app.post('/api/summarize', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  try {
    const summary = await llmService.summarize(text);
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing text:", error);
    res.status(500).json({ error: "LLM summarization failed" });
  }
});

const port = config.server.port;
app.listen(port, () => {
  console.log(`✅ Backend server running on port ${port}`);
});
