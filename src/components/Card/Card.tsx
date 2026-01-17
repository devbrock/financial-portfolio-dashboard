import { Slot } from "@radix-ui/react-slot";
import { cn } from "@utils/cn";
import type { CardProps, CardSectionProps } from "./Card.types";
import {
  cardBodyStyles,
  cardFooterStyles,
  cardHeaderStyles,
  cardStyles,
} from "./Card.styles";

/**
 * Card
 * Primary surface container used throughout the site/app; supports header/body/footer regions.
 */
export function Card(props: CardProps) {
  const { asChild, className, tone, elevation, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(cardStyles({ tone, elevation }), className)}
      {...rest}
    />
  );
}

/**
 * CardHeader
 * Slots: title, subtitle, actions (composition via children).
 */
export function CardHeader(props: CardSectionProps) {
  const { className, ...rest } = props;
  return <div className={cn(cardHeaderStyles(), className)} {...rest} />;
}

/**
 * CardBody
 */
export function CardBody(props: CardSectionProps) {
  const { className, ...rest } = props;
  return <div className={cn(cardBodyStyles(), className)} {...rest} />;
}

/**
 * CardFooter
 */
export function CardFooter(props: CardSectionProps) {
  const { className, ...rest } = props;
  return <div className={cn(cardFooterStyles(), className)} {...rest} />;
}
