import { useEffect, useState } from 'react';

/**
 * useMediaQuery
 * Tracks a CSS media query match with a safe browser fallback.
 */
export function useMediaQuery(query: string, initialState = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return initialState;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);
    handleChange();
    media.addEventListener?.('change', handleChange);
    media.addListener?.(handleChange);
    return () => {
      media.removeEventListener?.('change', handleChange);
      media.removeListener?.(handleChange);
    };
  }, [query]);

  return matches;
}
