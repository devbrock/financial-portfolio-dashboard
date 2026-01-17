import { cn } from "@utils/cn";
import type { HeadingProps } from "./Heading.types";
import { headingStyles } from "./Heading.styles";

/**
 * Heading
 * Consistent headings h1–h6 with brand typography.
 */
export function Heading(props: HeadingProps) {
  const { as = "h2", tone, className, ...rest } = props;
  const Comp = as;

  return (
    <Comp className={cn(headingStyles({ as, tone }), className)} {...rest} />
  );
}
