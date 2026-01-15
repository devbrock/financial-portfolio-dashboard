import * as React from "react";
import { cn } from "@utils/cn";
import type { ChartContainerProps } from "./ChartContainer.types";
import {
  chartContainerStyles,
  chartHeaderStyles,
  chartSubtitleStyles,
  chartTitleStyles,
} from "./ChartContainer.styles";

/**
 * ChartContainer
 * A consistent surface and header for Recharts visualizations.
 */
export function ChartContainer(props: ChartContainerProps) {
  const { title, subtitle, actions, className, children, ...rest } = props;

  return (
    <section className={cn(chartContainerStyles(), className)} {...rest}>
      {(title || subtitle || actions) && (
        <header className={chartHeaderStyles()}>
          <div className="min-w-0">
            {title ? <div className={chartTitleStyles()}>{title}</div> : null}
            {subtitle ? (
              <div className={chartSubtitleStyles()}>{subtitle}</div>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      )}

      {children}
    </section>
  );
}
