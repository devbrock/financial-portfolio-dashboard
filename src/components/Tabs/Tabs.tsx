import * as React from 'react';
import { cn } from '@utils/cn';
import { useControllableState } from '../_internal/useControllableState';
import type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps } from './Tabs.types';
import { tabsListClassName, tabsTriggerActiveClassName, tabsTriggerClassName } from './Tabs.styles';

type RegisteredTab = {
  value: string;
  ref: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  id: string;
  panelId: string;
};

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
  register: (tab: RegisteredTab) => void;
  unregister: (value: string) => void;
  getTab: (value: string) => RegisteredTab | undefined;
  getTabs: () => readonly RegisteredTab[];
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>.');
  return ctx;
}

/**
 * Tabs
 * Accessible tabs with roving tabindex and arrow-key navigation.
 */
export function Tabs(props: TabsProps) {
  const { value, defaultValue, onValueChange, children } = props;
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const tabsRef = React.useRef<RegisteredTab[]>([]);

  const register = React.useCallback((tab: RegisteredTab) => {
    const idx = tabsRef.current.findIndex(t => t.value === tab.value);
    if (idx === -1) {
      tabsRef.current = [...tabsRef.current, tab];
      return;
    }
    tabsRef.current = tabsRef.current.map((t, i) => (i === idx ? tab : t));
  }, []);

  const unregister = React.useCallback((tabValue: string) => {
    tabsRef.current = tabsRef.current.filter(t => t.value !== tabValue);
  }, []);

  const getTab = React.useCallback(
    (tabValue: string) => tabsRef.current.find(t => t.value === tabValue),
    []
  );

  const getTabs = React.useCallback(() => tabsRef.current, []);

  const ctx: TabsContextValue = React.useMemo(
    () => ({
      value: selected,
      setValue: setSelected,
      register,
      unregister,
      getTab,
      getTabs,
    }),
    [getTab, getTabs, register, selected, setSelected, unregister]
  );

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export function TabsList(props: TabsListProps) {
  const { className, ...rest } = props;
  return <div role="tablist" className={cn(tabsListClassName, className)} {...rest} />;
}

export function TabsTrigger(props: TabsTriggerProps) {
  const { value, className, disabled = false, onKeyDown, onClick, ...rest } = props;
  const ctx = useTabsContext();
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const reactId = React.useId();

  const id = `tab-${reactId}`;
  const panelId = `panel-${reactId}`;

  const selected = ctx.value === value;

  React.useEffect(() => {
    ctx.register({ value, ref, disabled, id, panelId });
    return () => ctx.unregister(value);
  }, [ctx, disabled, id, panelId, value]);

  const focusNext = (dir: 1 | -1) => {
    const tabs = ctx.getTabs().filter(t => !t.disabled);

    const idx = tabs.findIndex(t => t.value === value);
    if (idx === -1 || tabs.length === 0) return;
    const next = tabs[(idx + dir + tabs.length) % tabs.length];
    next?.ref.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusNext(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusNext(-1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!disabled) ctx.setValue(value);
        break;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!disabled) ctx.setValue(value);
  };

  return (
    <button
      ref={ref}
      type="button"
      id={id}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cn(tabsTriggerClassName, selected && tabsTriggerActiveClassName, className)}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...rest}
    />
  );
}

export function TabsContent(props: TabsContentProps) {
  const { value, className, ...rest } = props;
  const ctx = useTabsContext();
  const tab = ctx.getTab(value);
  const selected = ctx.value === value;

  return (
    <div
      role="tabpanel"
      id={tab?.panelId}
      aria-labelledby={tab?.id}
      hidden={!selected}
      className={cn(className)}
      {...rest}
    />
  );
}
