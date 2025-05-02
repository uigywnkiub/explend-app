import { TCookie } from '@/app/lib/types'

export const COOKIE_FEEDBACK: TCookie = Object.freeze({
  NAME: 'isSentFeedback',
  VALUE: 'true',
  MAX_AGE: 60 * 60 * 24 * 7, // 7 days
})

export const COOKIE_CONFETTI: TCookie = Object.freeze({
  NAME: 'isConfettiFired',
  VALUE: 'true',
  MAX_AGE: 60 * 60 * 24 * 7, // 7 days
})
