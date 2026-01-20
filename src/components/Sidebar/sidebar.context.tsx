/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { useControllableState } from '../_internal/useControllableState';
import type { SidebarProviderProps } from './sidebar.types';

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return ctx;
}

/**
 * SidebarProvider
 * Handles the sidebar open/collapsed state (controlled or uncontrolled).
 */
export function SidebarProvider(props: SidebarProviderProps) {
  const { children, open, defaultOpen = true, onOpenChange } = props;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const toggle = React.useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);

  const value: SidebarContextValue = React.useMemo(
    () => ({ open: isOpen, setOpen: setIsOpen, toggle }),
    [isOpen, setIsOpen, toggle]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
