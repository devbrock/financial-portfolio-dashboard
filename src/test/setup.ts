import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';
import type { AxeResults } from 'jest-axe';
import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});

type AxeMatcherContext = {
  isNot: boolean;
};

type AxeMatcherResult = {
  pass: boolean;
  message(): string;
};

const formatViolationCountMessage = (violationCount: number, isNegated: boolean): string => {
  if (violationCount === 0) {
    return isNegated
      ? 'Expected at least one accessibility violation, but found none.'
      : 'Expected no accessibility violations, and found none.';
  }

  return isNegated
    ? `Expected no accessibility violations, but found ${violationCount}.`
    : `Expected accessibility violations, but found ${violationCount}.`;
};

/**
 * Custom matcher to avoid relying on Jest-specific matcher internals.
 */
const toHaveNoViolations = function (
  this: AxeMatcherContext,
  results: AxeResults
): AxeMatcherResult {
  const violationCount = Array.isArray(results?.violations) ? results.violations.length : 0;
  const pass = violationCount === 0;

  return {
    pass,
    message: () => formatViolationCountMessage(violationCount, this.isNot),
  };
};

expect.extend({ toHaveNoViolations });

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
