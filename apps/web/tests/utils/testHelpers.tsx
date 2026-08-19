import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextRouter } from 'next/router';
import testLogger from './testLogger';
import { createMockAppRouter, createMockPagesRouter } from './mockRouter';

/**
 * Mock Next.js Pages Router (for backward compatibility)
 * @deprecated Use createMockAppRouter for App Router or createMockPagesRouter for Pages Router
 */
export const createMockRouter = (router: Partial<NextRouter> = {}): NextRouter => {
  return createMockPagesRouter(router);
};

/**
 * Custom render function with providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

/**
 * Mock API response
 */
export const mockApiResponse = <T,>(data: T, status: number = 200) => {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  };
};

/**
 * Mock API error
 */
export const mockApiError = (message: string, status: number = 400) => {
  return {
    response: {
      data: { message, success: false },
      status,
      statusText: 'Error',
      headers: {},
    },
    message,
    isAxiosError: true,
  };
};

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Test logging helpers
 */
interface TestContext {
  [key: string]: unknown;
}

/**
 * Log test start with context
 */
export const logTestStart = (testName: string, suite?: string, context?: TestContext): void => {
  testLogger.testStart(testName, suite, context);
};

/**
 * Log test completion
 */
export const logTestEnd = (
  testName: string,
  status: 'passed' | 'failed' | 'skipped',
  duration?: number,
  context?: TestContext
): void => {
  testLogger.testEnd(testName, status, duration, context);
};

/**
 * Log test error with context
 */
export const logTestError = (testName: string, error: Error | unknown, context?: TestContext): void => {
  testLogger.testError(testName, error, context);
};

/**
 * Log assertion result
 */
export const logTestAssertion = (description: string, passed: boolean, details?: TestContext): void => {
  testLogger.assertion(description, passed, details);
};

/**
 * Log test step
 */
export const logTestStep = (stepName: string, context?: TestContext): void => {
  testLogger.step(stepName, context);
};

