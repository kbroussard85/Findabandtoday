import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Set dummy API keys for MSW interception
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'sk-test-key';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test (important for test isolation)
afterEach(() => server.resetHandlers());

// Close MSW server after all tests
afterAll(() => server.close());

// Mocking some common browser APIs if needed
// Object.defineProperty(window, 'matchMedia', { ... })
