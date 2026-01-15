import type * as React from "react";

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "success" | "warning" | "danger";
};


