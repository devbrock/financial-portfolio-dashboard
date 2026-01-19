import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '@utils/cn';
import type { CarouselProps, CarouselSlideProps, CarouselDotsProps } from './Carousel.types';
import {
  carouselStyles,
  carouselTrackStyles,
  carouselSlideStyles,
  carouselArrowStyles,
  carouselDotsContainerStyles,
  carouselDotStyles,
} from './Carousel.styles';

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
    >
      <path
        d="M12 5l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
    >
      <path
        d="M8 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * CarouselDots
 * Pagination dots for carousel navigation.
 */
function CarouselDots(props: CarouselDotsProps) {
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

/**
 * Carousel
 * An accessible carousel/slider component for displaying content in a rotating view.
 *
 * A11y notes:
 * - Keyboard navigation with arrow keys when focused.
 * - Dots use role="tablist" and role="tab" pattern.
 * - Slides use role="tabpanel".
 * - Respects reduced motion preferences.
 * - Pause autoplay on focus/hover for accessibility.
 */
export function Carousel(props: CarouselProps) {
  const {
    className,
    children,
    size,
    showArrows = true,
    showDots = true,
    autoplay,
    pauseOnHover = true,
    loop = true,
    onSlideChange,
    initialSlide = 0,
    ...rest
  } = props;

  const slides = Children.toArray(children);
  const slideCount = slides.length;

  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const canGoNext = loop || currentIndex < slideCount - 1;
  const canGoPrev = loop || currentIndex > 0;

  const goToSlide = useCallback(
    (index: number) => {
      let nextIndex = index;

      if (loop) {
        if (index < 0) {
          nextIndex = slideCount - 1;
        } else if (index >= slideCount) {
          nextIndex = 0;
        }
      } else {
        nextIndex = Math.max(0, Math.min(index, slideCount - 1));
      }

      setCurrentIndex(nextIndex);
      onSlideChange?.(nextIndex);
    },
    [loop, slideCount, onSlideChange]
  );

  const goNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || autoplay <= 0 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      goNext();
    }, autoplay);

    return () => clearInterval(interval);
  }, [autoplay, isPaused, goNext]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goNext();
          break;
      }
    },
    [goNext, goPrev]
  );

  // Pause on hover/focus
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  const handleFocus = () => {
    setIsPaused(true);
  };

  const handleBlur = (event: FocusEvent) => {
    // Only unpause if focus is leaving the carousel entirely
    if (!containerRef.current?.contains(event.relatedTarget)) {
      setIsPaused(false);
    }
  };

  if (slideCount === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(carouselStyles({ size }), className)}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      {...rest}
    >
      {/* Track */}
      <div
        className={carouselTrackStyles()}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <CarouselSlide key={index} isActive={index === currentIndex}>
            {slide}
          </CarouselSlide>
        ))}
      </div>

      {/* Previous Arrow */}
      {showArrows && slideCount > 1 && (
        <button
          type="button"
          className={carouselArrowStyles({ position: 'left' })}
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous slide"
        >
          <ChevronLeftIcon />
        </button>
      )}

      {/* Next Arrow */}
      {showArrows && slideCount > 1 && (
        <button
          type="button"
          className={carouselArrowStyles({ position: 'right' })}
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Next slide"
        >
          <ChevronRightIcon />
        </button>
      )}

      {/* Dots */}
      {showDots && slideCount > 1 && (
        <CarouselDots total={slideCount} current={currentIndex} onSelect={goToSlide} />
      )}
    </div>
  );
}
