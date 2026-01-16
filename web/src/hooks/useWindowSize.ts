import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize(); // Call once to set initial size

      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}

export function useShouldUseMirroredBackground(contentHeight?: number): boolean {
  const { width, height } = useWindowSize();

  // Very conservative mirroring: only use when window is extremely wide (> 1920px)
  // OR when height is severely constrained (< 70% of content height)
  // This prevents stretching on normal desktop screens
  const shouldUseMirror = width > 1920 || (contentHeight && height < contentHeight * 0.7);

  return shouldUseMirror;
}

export function useBackgroundSizing(): { tileCount: number; imageHeight: string } {
  const { width, height } = useWindowSize();

  // Calculate aspect ratio to determine optimal sizing
  const aspectRatio = width / height;

  // For very wide screens, use more tiles with natural height to prevent stretching
  if (width > 1600) {
    return { tileCount: 6, imageHeight: '100%' };
  }
  // For normal wide screens, balanced approach with natural height
  else if (width > 1200) {
    return { tileCount: 4, imageHeight: '100%' };
  }
  // For smaller screens, fewer tiles with natural height
  else {
    return { tileCount: 3, imageHeight: '100%' };
  }
}