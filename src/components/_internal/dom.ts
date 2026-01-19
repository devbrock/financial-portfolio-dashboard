/**
 * DOM helpers shared across interactive components (Modal, Tooltip, DropdownMenu, etc.)
 * No external UI libs — keep this small, predictable, and accessible.
 */

/**
 * Returns focusable elements within a container, in DOM order.
 * This is used for focus trapping (Modal) and roving focus (Menu/Tabs).
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
  );
}

/**
 * Returns true if an event target is inside the given element.
 */
export function isEventInside(container: HTMLElement, target: EventTarget | null): boolean {
  return !!target && target instanceof Node && container.contains(target);
}
