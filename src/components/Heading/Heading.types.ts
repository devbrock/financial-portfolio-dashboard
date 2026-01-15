import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { headingStyles } from "./Heading.styles";

export type HeadingVariants = VariantProps<typeof headingStyles>;

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  HeadingVariants & {
    /**
     * Which heading element to render.
     */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };


