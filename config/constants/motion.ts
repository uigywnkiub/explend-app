import { type MotionProps } from 'framer-motion'

import type {
  TMOTION_NUMBER,
  TSHARED_TRANSACTION,
} from '@/app/lib/motion-types'

const SHARED_TRANSACTION = {
  TRANSACTION_TWEEN: { type: 'tween', duration: 0.2 },
  TRANSACTION_SPRING: {
    scale: { type: 'spring', visualDuration: 0.2, bounce: 0.2 },
    duration: 0.2,
  },
} satisfies TSHARED_TRANSACTION

export const DIV = {
  INITIAL: { scale: 1 },
  ANIMATE: (hovered: boolean, withScale: boolean, scale?: number) => {
    if (withScale) {
      return hovered ? { scale: scale || 1.1 } : { scale: 1 }
    }

    return {}
  },
  TRANSITION: SHARED_TRANSACTION.TRANSACTION_TWEEN,
  TRANSITION_SPRING: SHARED_TRANSACTION.TRANSACTION_SPRING,
}

export const MOTION_NUMBER = {
  INITIAL: { opacity: 0, display: 'none' },
  // ANIMATE: (val: number) => {
  //   // If the value is less than 0, it does not show in UI.
  //   // return { opacity: val > 0 ? 1 : 0 }
  // },
  ANIMATE: (val: number) => ({
    opacity: val !== 0 ? 1 : 0,
    display: val !== 0 ? 'inline-flex' : 'none', // Show only when val is not 0.
  }),
  EXIT: { opacity: 0 },
  ...SHARED_TRANSACTION,
} satisfies TMOTION_NUMBER

export const MOTION_LIST = (idx: number) => {
  return {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    transition: { duration: 0.2, delay: idx * 0.1 }, // Staggered effect.
  } satisfies MotionProps
}

// Comment the custom View Transition API function until all modern browsers support it.
// export const slideInOut = () => {
//   const duration = DIV.TRANSITION.duration * 1000
//   const easing = 'ease'
//   const fill = 'forwards'
//   const translateY = '50px'

//   document.documentElement.animate(
//     [
//       {
//         opacity: 1,
//         transform: 'translate(0, 0)',
//       },
//       {
//         opacity: 0,
//         transform: `translate(0, ${translateY})`,
//       },
//     ],
//     {
//       duration,
//       easing,
//       fill,
//       pseudoElement: '::view-transition-old(root)',
//     },
//   )

//   document.documentElement.animate(
//     [
//       {
//         opacity: 0,
//         transform: `translate(0, -${translateY})`,
//       },
//       {
//         opacity: 1,
//         transform: 'translate(0, 0)',
//       },
//     ],
//     {
//       duration,
//       easing,
//       fill,
//       pseudoElement: '::view-transition-new(root)',
//     },
//   )
// }
