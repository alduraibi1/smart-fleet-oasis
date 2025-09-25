import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SmoothTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

const transitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
};

export function SmoothTransition({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.3,
  type = 'fade' 
}: SmoothTransitionProps) {
  const transition = transitions[type];
  
  return (
    <motion.div
      className={className}
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={{ 
        duration, 
        delay,
        ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier for smooth feel
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="wait">
      <SmoothTransition className={className} type="slideUp">
        {children}
      </SmoothTransition>
    </AnimatePresence>
  );
}