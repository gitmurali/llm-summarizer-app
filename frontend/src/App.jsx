import React, { useState, useCallback } from 'react';
import { summarizeText } from './api';
import './App.css';

export default function App() {
  const [appState, setAppState] = useState({
    text: '',
    summary: '',
    isLoading: false,
    errorMessage: '',
  });

  const updateAppState = useCallback((updates) => {
    setAppState(prevState => ({
      ...prevState,
      ...updates,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault(); 
    
    if (!appState.text.trim()) { 
      updateAppState({
        errorMessage: 'Please enter text to summarize.',
        summary: '',
      });
      return;
    }
    
    updateAppState({
      errorMessage: '',
      isLoading: true,
      summary: '',
    });

    try {
      const result = await summarizeText(appState.text); 
      updateAppState({ summary: result.summary }); 
    } catch (err) {
      console.error("Error during summarization:", err);
      updateAppState({ errorMessage: 'Failed to fetch summary. Please check your input or try again later.' });
    } finally {
      updateAppState({ isLoading: false });
    }
  }, [appState.text, updateAppState]);

  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    
    setAppState(prevState => {
      const newState = { ...prevState, text: newText };
      
      if (prevState.errorMessage || prevState.summary) {
        newState.errorMessage = '';
        newState.summary = '';
      }
      return newState;
    });
  }, []);


  return (
    <main className="app-main">
      <h1 className="app-title">LLM Content Summarizer</h1>
      <form onSubmit={handleSubmit} className="app-form">
        <textarea
          value={appState.text}
          onChange={handleTextChange}
          rows={8}
          placeholder="Paste or enter text here..."
          className="app-textarea"
          aria-label="Text to summarize"
        />
        <button type="submit" disabled={appState.isLoading} className="app-button">
          {appState.isLoading ? 'Summarizing...' : 'Summarize'}
        </button>
      </form>

      {appState.errorMessage && <p className="app-message app-error">
      {appState.errorMessage}
      </p>}
      {appState.isLoading && !appState.summary && <p className="app-message app-loading">Loading summary...</p>}
      {appState.summary && (
        <section className="app-summary-section">
          <h2>Summary</h2>
          <p>{appState.summary}</p>
        </section>
      )}
    </main>
  );
}
