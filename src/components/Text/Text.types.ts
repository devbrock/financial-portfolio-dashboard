import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { textStyles } from "./Text.styles";

export type TextVariants = VariantProps<typeof textStyles>;

type TextOwnProps<TAs extends React.ElementType> = TextVariants & {
  /**
   * Render element. Defaults to `p`.
   *
   * Polymorphic typing ensures element-specific props (ex: `htmlFor` on `label`)
   * are available when the corresponding `as` value is used.
   */
  as?: TAs;
};

/**
 * Polymorphic Text props.
 *
 * @template TAs - Element/component to render.
 */
export type TextProps<TAs extends React.ElementType = "p"> = TextOwnProps<TAs> &
  Omit<React.ComponentPropsWithoutRef<TAs>, keyof TextOwnProps<TAs>>;


