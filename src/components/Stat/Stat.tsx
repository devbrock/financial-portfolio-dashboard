import { cn } from "@utils/cn";
import type { StatProps } from "./Stat.types";
import {
  statContainerClassName,
  statLabelClassName,
  statSubvalueClassName,
  statValueClassName,
} from "./Stat.styles";

/**
 * Stat
 * Metric display (label + value + delta) for dashboards/overview cards.
 */
export function Stat(props: StatProps) {
  const { label, value, subvalue, className, ...rest } = props;
  return (
    <div className={cn(statContainerClassName, className)} {...rest}>
      <div className={statLabelClassName}>{label}</div>
      <div className={statValueClassName}>{value}</div>
      {subvalue ? (
        <div className={statSubvalueClassName}>{subvalue}</div>
      ) : null}
    </div>
  );
}
