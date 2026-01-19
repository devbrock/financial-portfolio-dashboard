import { cva } from 'class-variance-authority';

/**
 * Carousel container styles
 */
export const carouselStyles = cva(
  ['relative w-full overflow-hidden rounded-2xl', 'bg-(--ui-bg)'].join(' '),
  {
    variants: {
      size: {
        sm: 'min-h-48',
        md: 'min-h-64',
        lg: 'min-h-96',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Carousel track (holds all slides)
 */
export const carouselTrackStyles = cva(
  ['flex transition-transform duration-300 ease-out', 'motion-reduce:transition-none'].join(' ')
);

/**
 * Individual slide styles
 */
export const carouselSlideStyles = cva(['w-full flex-shrink-0'].join(' '));

/**
 * Navigation arrow button styles
 */
export const carouselArrowStyles = cva(
  [
    'absolute top-1/2 -translate-y-1/2 z-10',
    'inline-flex items-center justify-center',
    'h-10 w-10 rounded-full',
    'bg-(--ui-bg)/80 backdrop-blur-sm',
    'border border-(--ui-border)',
    'text-(--ui-text)',
    'shadow-sm shadow-black/5',
    'hover:bg-(--ui-surface)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus)',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)',
    'disabled:opacity-40 disabled:pointer-events-none',
    'transition-colors duration-200',
    'motion-reduce:transition-none',
  ].join(' '),
  {
    variants: {
      position: {
        left: 'left-3',
        right: 'right-3',
      },
    },
  }
);

/**
 * Pagination dots container
 */
export const carouselDotsContainerStyles = cva(
  [
    'absolute bottom-4 left-1/2 -translate-x-1/2 z-10',
    'flex items-center gap-2',
    'px-3 py-2 rounded-full',
    'bg-(--ui-bg)/80 backdrop-blur-sm',
    'border border-(--ui-border)',
  ].join(' ')
);

/**
 * Individual dot button styles
 */
export const carouselDotStyles = cva(
  [
    'h-2 w-2 rounded-full',
    'transition-all duration-200',
    'motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus)',
    'focus-visible:ring-offset-1 focus-visible:ring-offset-(--ui-bg)',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'bg-(--ui-primary) w-6',
        false: 'bg-(--ui-text-subtle) hover:bg-(--ui-text-muted)',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
