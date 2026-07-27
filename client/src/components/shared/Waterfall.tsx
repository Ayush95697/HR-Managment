import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

interface WaterfallContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: (custom: { staggerDelay?: number; initialDelay?: number } = {}) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerDelay ?? 0.18,
      delayChildren: custom.initialDelay ?? 0.1,
    },
  }),
};

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // Apple-style ultra-smooth decelerating curve
    },
  },
};

export function WaterfallContainer({
  children,
  staggerDelay = 0.18,
  initialDelay = 0.1,
  className = '',
  style = {},
}: WaterfallContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      custom={{ staggerDelay, initialDelay }}
      initial="hidden"
      animate="show"
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface WaterfallItemProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  customVariants?: Variants;
}

export function WaterfallItem({
  children,
  className = '',
  style = {},
  customVariants = itemVariants,
}: WaterfallItemProps) {
  return (
    <motion.div variants={customVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}
