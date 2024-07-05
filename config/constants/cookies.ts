import { TCookie } from '@/app/lib/types'

export const FEEDBACK: TCookie = Object.freeze({
  NAME: 'isSentFeedback',
  VALUE: 'true',
  MAX_AGE: 60 * 60 * 24 * 7, // 7 days
})

export const CONFETTI: TCookie = Object.freeze({
  NAME: 'isConfettiFired',
  VALUE: 'true',
  MAX_AGE: 60 * 60 * 24 * 7, // 7 days
})
