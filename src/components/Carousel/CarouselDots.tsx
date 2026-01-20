import { cn } from '@/utils/cn';
import type { CarouselDotsProps } from './Carousel.types';
import { carouselDotStyles, carouselDotsContainerStyles } from './Carousel.styles';

/**
 * CarouselDots
 * Pagination dots for carousel navigation.
 */
export function CarouselDots(props: CarouselDotsProps) {
  const { total, current, onSelect, className } = props;

  return (
    <div
      className={cn(carouselDotsContainerStyles(), className)}
      role="tablist"
      aria-label="Carousel pagination"
    >
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === current}
          aria-label={`Go to slide ${index + 1}`}
          className={carouselDotStyles({ active: index === current })}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
