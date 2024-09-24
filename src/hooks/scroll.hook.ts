'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const useScrollRestoration = (): void => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollPositions = useRef<{ [key: string]: { x: number; y: number } }>(
    {}
  );

  // Save scroll position before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pathname) {
        scrollPositions.current[pathname + searchParams.toString()] = {
          x: window.scrollX,
          y: window.scrollY,
        };
      }
    };

    // Listen to before page unload or refresh
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, searchParams]);

  // Restore scroll position after navigation
  useEffect(() => {
    const position =
      scrollPositions.current[pathname + searchParams.toString()];
    if (position) {
      window.scrollTo(position.x, position.y);
    }
  }, [pathname, searchParams]);
};

export default useScrollRestoration;
