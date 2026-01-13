import { useEffect, useRef, useState } from 'react';
import { createPopper } from '@popperjs/core';

const usePopperDropdown = (
  initialShow = false,
  placement: any = 'bottom-start',
  boundaryRef?: React.RefObject<HTMLElement>,
  anchorEl?: React.RefObject<HTMLElement | null> | React.RefObject<HTMLElement> | HTMLElement | null,
) => {
  const [showDropdown, setShowDropdown] = useState(initialShow);
  const buttonRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Intersection Observer: always use buttonRef as before
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) setShowDropdown(false);
        });
      },
      {
        root: boundaryRef?.current || null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );
    
    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }
    
    return () => {
      if (buttonRef.current) observer.unobserve(buttonRef.current);
    };
  }, [boundaryRef]);

  useEffect(() => {
    if (!showDropdown) {
      return;
    }

    let popperInstance: any = null;
    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const getReferenceElement = () => {
      if (anchorEl) {
        if ('current' in anchorEl) {
          return anchorEl.current;
        }
        return anchorEl;
      }
      return buttonRef.current;
    };

    let attempts = 0;
    const maxAttempts = 20;
    
    const setupPopper = () => {
      attempts++;
      const referenceElement = getReferenceElement();
      
      if (!referenceElement || !dropdownRef.current) {
        if (attempts < maxAttempts) {
          // Try again on next frame
          rafId = requestAnimationFrame(setupPopper);
        } else {
          console.warn('Popper setup failed: refs not available after', maxAttempts, 'attempts', {
            referenceElement,
            dropdown: dropdownRef.current,
            buttonRef: buttonRef.current,
            anchorEl
          });
        }
        return;
      }

      // Create popper instance
      try {
        popperInstance = createPopper(referenceElement, dropdownRef.current, {
          placement: placement,
          strategy: 'fixed',
          modifiers: [
            { name: 'offset', options: { offset: [0, 6] } },
            { 
              name: 'preventOverflow', 
              options: { 
                boundary: boundaryRef?.current || 'viewport',
                padding: 8
              } 
            },
            { 
              name: 'flip', 
              options: { 
                enabled: true, 
                boundary: boundaryRef?.current || 'viewport',
                padding: 8
              } 
            },
          ],
        });
        
        // Force update immediately
        popperInstance.update();
        
        // Update again after a short delay to ensure positioning
        timeoutId = setTimeout(() => {
          if (popperInstance) {
            popperInstance.update();
          }
        }, 50);
      } catch (error) {
        console.error('Error creating popper:', error, {
          referenceElement,
          dropdown: dropdownRef.current,
          buttonRef: buttonRef.current
        });
      }
    };

    // Start setup on next frame
    rafId = requestAnimationFrame(setupPopper);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (popperInstance) {
        popperInstance.destroy();
      }
    };
  }, [showDropdown, placement, boundaryRef, anchorEl]);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return { buttonRef, dropdownRef, showDropdown, setShowDropdown, toggleDropdown };
};

export default usePopperDropdown;
