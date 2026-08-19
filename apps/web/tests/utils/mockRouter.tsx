import { NextRouter } from 'next/router';
import { jest } from '@jest/globals';

/**
 * Create a mock Next.js App Router for testing (next/navigation)
 * This is for Next.js 13+ App Router
 */
export interface MockAppRouter {
  push: ReturnType<typeof jest.fn>;
  replace: ReturnType<typeof jest.fn>;
  refresh: ReturnType<typeof jest.fn>;
  back: ReturnType<typeof jest.fn>;
  forward: ReturnType<typeof jest.fn>;
  prefetch: ReturnType<typeof jest.fn>;
}

export const createMockAppRouter = (overrides: Partial<MockAppRouter> = {}): MockAppRouter => {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    ...overrides,
  };
};

/**
 * Create a mock Next.js Pages Router for testing (next/router)
 * This is for backward compatibility with Pages Router
 */
export const createMockPagesRouter = (overrides: Partial<NextRouter> = {}): NextRouter => {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    ...overrides,
  } as NextRouter;
};

/**
 * Default export for backward compatibility
 * Returns App Router mock by default (Next.js 13+)
 */
export const createMockRouter = createMockAppRouter;
