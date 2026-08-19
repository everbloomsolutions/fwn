/**
 * Transition tokens
 * Animation durations and easing functions
 */

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
} as const;

export type TransitionToken = typeof transitions;

