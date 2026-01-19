declare module 'jest-axe' {
  export type AxeResults = {
    violations: unknown[];
  };

  export function axe(
    container: Element | Document | string,
    options?: Record<string, unknown>
  ): Promise<AxeResults>;

  export function toHaveNoViolations(results: AxeResults): {
    pass: boolean;
    message(): string;
  };
}
