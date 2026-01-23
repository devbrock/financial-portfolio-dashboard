import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';
import type { AxeResults } from 'jest-axe';
import { server } from './msw/server';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) =>
      createElement('div', { style: { width: 800, height: 400 } }, children),
  };
});

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

const DEFAULT_ELEMENT_WIDTH = 800;
const DEFAULT_ELEMENT_HEIGHT = 400;

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    return DEFAULT_ELEMENT_WIDTH;
  },
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() {
    return DEFAULT_ELEMENT_HEIGHT;
  },
});

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    return DEFAULT_ELEMENT_WIDTH;
  },
});

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get() {
    return DEFAULT_ELEMENT_HEIGHT;
  },
});

const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value() {
    const rect = originalGetBoundingClientRect?.call(this);
    if (rect && (rect.width > 0 || rect.height > 0)) {
      return rect;
    }

    return {
      x: 0,
      y: 0,
      width: DEFAULT_ELEMENT_WIDTH,
      height: DEFAULT_ELEMENT_HEIGHT,
      top: 0,
      left: 0,
      right: DEFAULT_ELEMENT_WIDTH,
      bottom: DEFAULT_ELEMENT_HEIGHT,
      toJSON: () => '',
    };
  },
});

if (!window.ResizeObserver) {
  class ResizeObserverMock {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: {
              x: 0,
              y: 0,
              width: DEFAULT_ELEMENT_WIDTH,
              height: DEFAULT_ELEMENT_HEIGHT,
              top: 0,
              left: 0,
              right: DEFAULT_ELEMENT_WIDTH,
              bottom: DEFAULT_ELEMENT_HEIGHT,
              toJSON: () => '',
            },
          } as ResizeObserverEntry,
        ],
        this
      );
    }

    unobserve() {}

    disconnect() {}
  }

  window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
