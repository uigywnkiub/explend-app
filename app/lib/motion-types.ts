import type { MotionProps } from 'framer-motion'

export type TSHARED_TRANSACTION = {
  TRANSACTION_TWEEN: MotionProps['transition']
  TRANSACTION_SPRING: MotionProps['transition']
}

export type TMOTION_NUMBER = {
  INITIAL: MotionProps['initial']
  ANIMATE: (val: number) => MotionProps['animate']
  EXIT: MotionProps['exit']
} & TSHARED_TRANSACTION
