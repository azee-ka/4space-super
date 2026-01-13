import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import usePopperDropdown from './usePopperDropdown';

interface DropdownButtonProps {
  children: React.ReactNode | ((props: { closeDropdown: () => void }) => React.ReactNode);
  toggleContent?: ReactElement;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' | 'bottom' | 'top' | 'left' | 'right';
  boundaryRef?: React.RefObject<HTMLElement>;
  anchorEl?: React.RefObject<HTMLElement | null> | HTMLElement | null;
  onToggle?: (isOpen: boolean) => void;
  zIndex?: number;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  toggleContent,
  placement = 'bottom-start',
  boundaryRef,
  anchorEl,
  onToggle,
  zIndex = 99999,
}) => {
  const { buttonRef, dropdownRef, showDropdown, toggleDropdown, setShowDropdown } = usePopperDropdown(
    false,
    placement,
    boundaryRef,
    anchorEl
  );

  useEffect(() => {
    if (onToggle) {
      onToggle(showDropdown);
    }
  }, [showDropdown, onToggle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, buttonRef, setShowDropdown]);

  const renderToggle =
    !anchorEl && toggleContent
      ? React.cloneElement(toggleContent, {
          ref: (node: HTMLElement | null) => {
            // Set the ref immediately
            buttonRef.current = node;
            // Merge refs if the element already has a ref
            if (typeof (toggleContent as any).ref === 'function') {
              (toggleContent as any).ref(node);
            } else if ((toggleContent as any).ref) {
              (toggleContent as any).ref.current = node;
            }
          },
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            toggleDropdown();
          },
          className: `${(toggleContent.props as any).className || ''} ${showDropdown ? 'active' : ''}`.trim(),
        } as any)
      : null;

  const closeDropdown = () => setShowDropdown(false);

  let content: React.ReactNode;
  if (typeof children === 'function') {
    // Render prop: call with closeDropdown
    content = children({ closeDropdown });
  } else {
    // Normal JSX element(s)
    content = children;
  }

  return (
    <>
      {renderToggle}
      {showDropdown &&
        createPortal(
          <AnimatePresence mode="wait">
            <div
              ref={(node: HTMLDivElement | null) => {
                dropdownRef.current = node;
              }}
              style={{ 
                zIndex, 
                position: 'fixed', 
                pointerEvents: 'auto',
                // Let Popper.js handle positioning - don't set top/left here
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {content}
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default DropdownButton;
