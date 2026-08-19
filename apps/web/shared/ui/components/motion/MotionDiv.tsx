/**
 * Motion wrapper component
 * Framer Motion wrapper with common variants
 */

'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeVariants, slideUpVariants, scaleVariants } from '@/shared/core/theme/utils/motion';

export interface MotionDivProps extends HTMLMotionProps<'div'> {
  variant?: 'fade' | 'slideUp' | 'scale';
}

export function MotionDiv({ variant = 'fade', children, ...props }: MotionDivProps) {
  const variants = {
    fade: fadeVariants,
    slideUp: slideUpVariants,
    scale: scaleVariants,
  }[variant];

  return (
    <motion.div variants={variants} initial="hidden" animate="visible" exit="exit" {...props}>
      {children}
    </motion.div>
  );
}

