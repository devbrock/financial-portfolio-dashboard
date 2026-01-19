import type * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { carouselStyles } from './Carousel.styles';

export type CarouselVariants = VariantProps<typeof carouselStyles>;

export type CarouselProps = React.HTMLAttributes<HTMLDivElement> &
  CarouselVariants & {
    /**
     * Array of items to display in the carousel.
     */
    children: React.ReactNode;
    /**
     * Whether to show navigation arrows.
     * @default true
     */
    showArrows?: boolean;
    /**
     * Whether to show pagination dots.
     * @default true
     */
    showDots?: boolean;
    /**
     * Enable autoplay with interval in milliseconds.
     * Set to 0 or undefined to disable.
     * @default undefined
     */
    autoplay?: number;
    /**
     * Whether to pause autoplay on hover.
     * @default true
     */
    pauseOnHover?: boolean;
    /**
     * Whether to loop back to start when reaching the end.
     * @default true
     */
    loop?: boolean;
    /**
     * Callback fired when the active slide changes.
     */
    onSlideChange?: (index: number) => void;
    /**
     * Initial slide index.
     * @default 0
     */
    initialSlide?: number;
    /**
     * Optional test id.
     */
    'data-testid'?: string;
  };

export type CarouselSlideProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Whether this slide is currently active.
   */
  isActive?: boolean;
};

export type CarouselDotsProps = {
  /**
   * Total number of slides.
   */
  total: number;
  /**
   * Currently active slide index.
   */
  current: number;
  /**
   * Callback to navigate to a specific slide.
   */
  onSelect: (index: number) => void;
  /**
   * Optional className.
   */
  className?: string;
};
