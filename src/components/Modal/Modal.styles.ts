/**
 * Spec: `design_system.json` -> components.navigationAndOverlays.Modal.classes
 */
export const modalOverlayClassName = [
  'fixed inset-0 bg-black/40 backdrop-blur-[1px]',
  // tw-animate-css: subtle fade-in + reduced motion fallback
  'animate-in fade-in duration-200 motion-reduce:animate-none',
].join(' ');

export const modalContentClassName = [
  'fixed left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-(--ui-border) bg-(--ui-bg) shadow-lg shadow-black/20 p-6',
  // tw-animate-css: scale-in for overlays + reduced motion fallback
  'animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none',
].join(' ');

export const modalHeaderClassName = 'mb-4 space-y-1';
export const modalTitleClassName = 'text-xl font-semibold font-(--font-brand) text-(--ui-text)';
export const modalDescriptionClassName = 'text-sm text-(--ui-text-muted)';
export const modalFooterClassName = 'mt-6 flex items-center justify-end gap-3';
