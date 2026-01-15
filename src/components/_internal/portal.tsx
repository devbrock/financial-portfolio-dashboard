import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Simple portal that renders into `document.body`.
 * Safe for SSR-ish environments (renders null until mounted).
 */
export function Portal(props: { children: ReactNode }) {
  const { children } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(children, document.body);
}


