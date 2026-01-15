import { cn } from "@utils/cn";
import type { AlertProps } from "./Alert.types";
import { alertStyles } from "./Alert.styles";

/**
 * Alert
 * Inline alert banner for errors/warnings/info.
 *
 * A11y notes (spec):
 * - Use `role="status"` for info/success.
 * - Use `role="alert"` for danger when immediate attention required.
 */
export function Alert(props: AlertProps) {
  const { tone = "info", className, ...rest } = props;
  const role = tone === "danger" ? "alert" : "status";

  return (
    <div
      role={role}
      className={cn(alertStyles({ tone }), className)}
      {...rest}
    />
  );
}
