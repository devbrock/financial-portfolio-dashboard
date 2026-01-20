import { cn } from '@/utils/cn';
import type { CarouselSlideProps } from './Carousel.types';
import { carouselSlideStyles } from './Carousel.styles';

/**
 * CarouselSlide
 * Individual slide wrapper component.
 */
export function CarouselSlide(props: CarouselSlideProps) {
  const { className, isActive, children, ...rest } = props;

  return (
    <div
      role="tabpanel"
      aria-hidden={!isActive}
      className={cn(carouselSlideStyles(), className)}
      {...rest}
    >
      {children}
    </div>
  );
}
