'use client';

import { ReactNode, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { scaleVariants } from '@/shared/core/theme/utils/motion';

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Popover({
  trigger,
  content,
  position = 'bottom',
  align = 'center',
  open: controlledOpen,
  onOpenChange,
  className,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  // Position calculation with proper timing and boundary detection
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});
  const calculatePositionRef = useRef<() => void>();

  const calculatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    
    // Check if trigger has valid dimensions
    if (triggerRect.width === 0 || triggerRect.height === 0) {
      // Trigger not yet rendered, retry
      if (calculatePositionRef.current) {
        requestAnimationFrame(calculatePositionRef.current);
      }
      return;
    }
    
    // Check if popover has dimensions (might be 0 on first render)
    if (popoverRect.width === 0 || popoverRect.height === 0) {
      // Retry on next frame
      if (calculatePositionRef.current) {
        requestAnimationFrame(calculatePositionRef.current);
      }
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;
    const gap = 8;

    let top = 0;
    let left = 0;

    // Calculate initial position
    switch (position) {
      case 'top':
        top = triggerRect.top - popoverRect.height - gap;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        break;
      case 'left':
        top = triggerRect.top;
        left = triggerRect.left - popoverRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top;
        left = triggerRect.right + gap;
        break;
    }

    // Calculate alignment
    switch (align) {
      case 'start':
        if (position === 'top' || position === 'bottom') {
          left = triggerRect.left;
        }
        break;
      case 'center':
        if (position === 'top' || position === 'bottom') {
          left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        }
        break;
      case 'end':
        if (position === 'top' || position === 'bottom') {
          // Align right edge of popover with right edge of trigger
          left = triggerRect.right - popoverRect.width;
          // Ensure left doesn't go negative
          if (left < 0) {
            left = triggerRect.left;
          }
        }
        break;
    }

    // Viewport boundary detection and adjustment
    // Horizontal adjustment - but preserve alignment preference
    const minLeft = padding;
    const maxLeft = viewportWidth - popoverRect.width - padding;
    
    // Only adjust if absolutely necessary, prefer keeping alignment
    if (left < minLeft) {
      // If too far left, move to minimum but try to keep relative to trigger
      left = Math.max(minLeft, triggerRect.left);
    } else if (left + popoverRect.width > viewportWidth - padding) {
      // If too far right, adjust but try to keep right edge aligned with trigger
      if (align === 'end') {
        // For end alignment, try to keep right edge of popover aligned with trigger
        left = Math.min(maxLeft, triggerRect.right - popoverRect.width);
      } else {
        left = maxLeft;
      }
    }

    // Vertical adjustment
    if (top + popoverRect.height > viewportHeight - padding) {
      // If bottom doesn't fit and position is bottom, flip to top
      if (position === 'bottom') {
        top = triggerRect.top - popoverRect.height - gap;
      } else {
        top = viewportHeight - popoverRect.height - padding;
      }
    }
    if (top < padding) {
      top = padding;
    }

    // Use fixed positioning for reliability
    setPositionStyle({ 
      top: `${top}px`, 
      left: `${left}px`, 
      position: 'fixed',
    });
  }, [isOpen, position, align]);

  // Calculate position when popover opens
  useLayoutEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPositionStyle({});
      return;
    }

    // Set a temporary position immediately to ensure visibility
    if (triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setPositionStyle({
        position: 'fixed',
        top: `${triggerRect.bottom + 8}px`,
        left: `${triggerRect.right - 256}px`, // Approximate width for end alignment
      });
    }

    // Use triple requestAnimationFrame to ensure DOM is fully ready
    // and trigger element is in its final layout position
    let rafId1: number;
    let rafId2: number;
    const timeoutId = setTimeout(() => {
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          requestAnimationFrame(calculatePosition);
        });
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (rafId1) cancelAnimationFrame(rafId1);
      if (rafId2) cancelAnimationFrame(rafId2);
    };
  }, [isOpen, calculatePosition]);

  // Recalculate on scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, calculatePosition]);

  if (typeof window === 'undefined') return null;

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex items-center"
        style={{ position: 'relative' }}
        onClick={() => handleOpenChange(!isOpen)}
      >
        {trigger}
      </div>
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              ref={popoverRef}
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                ...positionStyle,
                // Ensure minimum visibility even if position calculation fails
                minWidth: '200px',
                maxWidth: '90vw',
              }}
              className={cn(
                'z-[100] rounded-lg bg-surface border border-border shadow-lg',
                'overflow-hidden', // Ensure content doesn't overflow
                className
              )}
              onAnimationComplete={() => {
                // Ensure position is recalculated after animation starts
                if (isOpen && positionStyle.top) {
                  calculatePosition();
                }
              }}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
