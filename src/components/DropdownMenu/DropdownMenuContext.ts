import * as React from 'react';

export type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerAnchorRef: React.RefObject<HTMLSpanElement | null>;
  triggerElRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export const DropdownMenuProvider = DropdownMenuContext.Provider;

export function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>.');
  return ctx;
}
