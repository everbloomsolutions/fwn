// Learn more: https://github.com/testing-library/jest-dom

// Set NODE_ENV to test to ensure logging is enabled
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Polyfill for TextDecoder/TextEncoder in jsdom
// Always polyfill in jsdom environment (it doesn't have TextDecoder/TextEncoder)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextDecoder: NodeTextDecoder, TextEncoder: NodeTextEncoder } = require('util');
  
  // Set on both global and window for compatibility
  global.TextDecoder = NodeTextDecoder;
  global.TextEncoder = NodeTextEncoder;
  if (typeof window !== 'undefined') {
    window.TextDecoder = NodeTextDecoder;
    window.TextEncoder = NodeTextEncoder;
  }
} catch {
  // Fallback: create minimal polyfills
  global.TextDecoder = class TextDecoder {
    decode(input) { return Buffer.from(input).toString('utf8'); }
  };
  global.TextEncoder = class TextEncoder {
    encode(input) { return Buffer.from(input, 'utf8'); }
  };
}

// Now load jest-dom
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/jest-dom');

// Mock window.matchMedia for theme/color mode tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Next.js 15 App Router navigation
// This global mock applies to all tests and bypasses the "invariant expected app router to be mounted" error
// Create a shared mock router instance that can be accessed in tests
const createMockRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
});

// Store it globally so tests can access it
global.mockNextRouter = createMockRouter();

jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => global.mockNextRouter,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  };
});
