import type * as React from "react";

export type StatProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  value: React.ReactNode;
  subvalue?: React.ReactNode;
};


