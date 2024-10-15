import { useState, useEffect } from 'react';

export enum MediaQueryValues {
  XS = '(min-width: 500px)',
  SM = '(min-width: 640px)',
  MD = '(min-width: 768px)',
  LG = '(min-width: 1024px)',
  XL = '(min-width: 1280px)',
  '2XL' = '(min-width: 1536px)',
}
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
