import { describe, it, expect } from 'vitest';
import llmResponses from '../fixtures/llm-responses.json';

describe('MSW Setup Validation', () => {
  it('should intercept OpenAI chat completion requests', async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-test-key',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual(llmResponses.negotiation_success);
  });

  it('should return a counter-offer when "counter" is in the prompt', async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-test-key',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Please give me a counter offer' }],
      }),
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual(llmResponses.negotiation_counter);
  });

  it('should return a rejection when "reject" is in the prompt', async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-test-key',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'I reject this offer' }],
      }),
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual(llmResponses.negotiation_rejected);
  });

  it('should return an error when Authorization header is missing', async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toEqual(llmResponses.error_invalid_api_key);
  });
});
