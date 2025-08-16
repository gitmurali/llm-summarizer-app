import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './api'; // Import all exports from api.js

// Test suite for the App component
describe('App component', () => {
  // Test case: checks if the component renders correctly with its main title
  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText(/llm content summarizer/i)).toBeInTheDocument();
  });

  // Test case: checks if an error message appears when submitting empty text
  it('shows error when submitting empty text', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/summarize/i)); // Click the summarize button
    expect(screen.getByText(/please enter text to summarize/i)).toBeInTheDocument();
  });

  // Test case: checks if the summary is displayed after a successful API call
  it('shows summary after successful API call', async () => {
    // Mock the summarizeText function to return a predefined successful response
    jest.spyOn(api, 'summarizeText').mockResolvedValue({ summary: 'Mock summary text' });
    render(<App />);

    // Type some text into the textarea
    fireEvent.change(screen.getByPlaceholderText(/paste or enter text here/i), { target: { value: 'Some text' } });
    fireEvent.click(screen.getByText(/summarize/i)); // Click the summarize button

    // Wait for the summary text to appear in the document after the async operation
    await waitFor(() => expect(screen.getByText(/mock summary text/i)).toBeInTheDocument());
    // Verify that the mock API function was called
    expect(api.summarizeText).toHaveBeenCalledWith('Some text');
  });

  // Test case: checks if an error message is displayed on API failure
  it('shows error message on API failure', async () => {
    // Mock the summarizeText function to simulate an API error
    jest.spyOn(api, 'summarizeText').mockRejectedValue(new Error('API failure'));
    render(<App />);

    // Type some text into the textarea
    fireEvent.change(screen.getByPlaceholderText(/paste or enter text here/i), { target: { value: 'Some text' } });
    fireEvent.click(screen.getByText(/summarize/i)); // Click the summarize button

    // Wait for the error message to appear in the document
    await waitFor(() => expect(screen.getByText(/failed to fetch summary/i)).toBeInTheDocument());
    // Verify that the mock API function was called
    expect(api.summarizeText).toHaveBeenCalledWith('Some text');
  });
});
