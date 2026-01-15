import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@utils/cn";
import { Portal } from "../_internal/portal";
import { getFocusableElements, isEventInside } from "../_internal/dom";
import { useControllableState } from "../_internal/useControllableState";
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
} from "./DropdownMenu.types";
import {
  dropdownMenuContentClassName,
  dropdownMenuItemClassName,
  dropdownMenuSeparatorClassName,
} from "./DropdownMenu.styles";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerAnchorRef: React.RefObject<HTMLSpanElement | null>;
  triggerElRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx)
    throw new Error(
      "DropdownMenu components must be used within <DropdownMenu>."
    );
  return ctx;
}

/**
 * DropdownMenu
 * Action menu (sort presets, row actions).
 *
 * A11y notes (spec):
 * - Opens on Enter/Space/ArrowDown from trigger.
 * - Arrow keys navigate items; Esc closes; focus returns to trigger.
 */
export function DropdownMenu(props: DropdownMenuProps) {
  const { open, defaultOpen = false, onOpenChange, children } = props;
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const triggerAnchorRef = React.useRef<HTMLSpanElement | null>(null);
  const triggerElRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target;
      const trigger = triggerAnchorRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;
      if (isEventInside(content, target) || isEventInside(trigger, target))
        return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, setIsOpen]);

  React.useEffect(() => {
    if (isOpen) return;
    triggerElRef.current?.focus();
  }, [isOpen]);

  const ctx: DropdownMenuContextValue = React.useMemo(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      triggerAnchorRef,
      triggerElRef,
      contentRef,
    }),
    [isOpen, setIsOpen]
  );

  return (
    <DropdownMenuContext.Provider value={ctx}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { asChild, children } = props;
  const ctx = useDropdownMenuContext();
  const Comp = asChild ? Slot : "button";

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // eslint-disable-next-line react-hooks/immutability
    ctx.triggerElRef.current = e.currentTarget as HTMLElement;
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        ctx.setOpen(true);
        break;
    }
  };

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    // eslint-disable-next-line react-hooks/immutability
    ctx.triggerElRef.current = e.currentTarget as HTMLElement;
    ctx.setOpen(!ctx.open);
  };

  return (
    <span ref={ctx.triggerAnchorRef} className="inline-flex">
      <Comp
        onKeyDown={onKeyDown}
        onClick={onClick}
        aria-haspopup="menu"
        aria-expanded={ctx.open}
      >
        {children}
      </Comp>
    </span>
  );
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { className, style, minWidth, ...rest } = props;
  const ctx = useDropdownMenuContext();
  const { open, setOpen, triggerAnchorRef, contentRef } = ctx;
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  React.useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerAnchorRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onReflow = () => {
      const trigger = triggerAnchorRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const content = contentRef.current;
    if (!content) return;
    const focusables = getFocusableElements(content);
    focusables[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        role="menu"
        aria-orientation="vertical"
        className={cn(dropdownMenuContentClassName, className)}
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          minWidth: minWidth ?? undefined,
          ...style,
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            return;
          }
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

          e.preventDefault();
          const content = contentRef.current;
          if (!content) return;
          const focusables = getFocusableElements(content);
          const current = document.activeElement;
          const idx = focusables.findIndex((el) => el === current);
          if (idx === -1) {
            focusables[0]?.focus();
            return;
          }
          const dir = e.key === "ArrowDown" ? 1 : -1;
          const next = (idx + dir + focusables.length) % focusables.length;
          focusables[next]?.focus();
        }}
        {...rest}
      />
    </Portal>
  );
}

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { className, inset, onClick, ...rest } = props;
  const ctx = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(dropdownMenuItemClassName, inset && "pl-8", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        ctx.setOpen(false);
      }}
      {...rest}
    />
  );
}

export function DropdownMenuSeparator(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return (
    <div
      role="separator"
      className={cn(dropdownMenuSeparatorClassName, className)}
      {...rest}
    />
  );
}
