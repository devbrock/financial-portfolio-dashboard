import { twMerge } from "tailwind-merge";

/**
 * Tailwind-safe className merge utility.
 *
 * - Accepts strings, arrays, and `{ [className]: boolean }` maps.
 * - De-dupes and resolves conflicting Tailwind utilities via `tailwind-merge`.
 */
export function cn(
  ...inputs: Array<
    | string
    | false
    | null
    | undefined
    | 0
    | ReadonlyArray<string | false | null | undefined>
    | Readonly<Record<string, boolean>>
  >
): string {
  const flattened: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      flattened.push(input);
      continue;
    }
    if (Array.isArray(input)) {
      for (const item of input) {
        if (item) flattened.push(item);
      }
      continue;
    }
    for (const [className, enabled] of Object.entries(input)) {
      if (enabled) flattened.push(className);
    }
  }

  return twMerge(flattened.join(" "));
}
