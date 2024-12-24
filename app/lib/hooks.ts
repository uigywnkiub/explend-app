import { useCallback } from 'react'
import { useLocalStorage } from 'react-use'

const ATTEMPT_LIMIT = 3
const ATTEMPT_RESET_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds.
// 24 * 60 * 60 * 1000; // 24 hours in milliseconds.
// 10 * 1000; // 10 seconds in milliseconds.

const useAttemptTracker = (
  storageKey: string,
  attemptLimit: number = ATTEMPT_LIMIT,
  attemptResetInterval: number = ATTEMPT_RESET_INTERVAL,
) => {
  const [attemptsData, setAttemptsData] = useLocalStorage(storageKey, {
    count: 0,
    lastAttemptTime: Date.now(),
  })

  const resetAttempts = useCallback(() => {
    setAttemptsData({ count: 0, lastAttemptTime: Date.now() })
  }, [setAttemptsData])

  const canAttempt = useCallback(() => {
    if (!attemptsData) return true
    const { count, lastAttemptTime } = attemptsData
    const currentTime = Date.now()
    // Reset attempts if attemptResetInterval or ATTEMPT_RESET_INTERVAL number value have passed.
    if (currentTime - lastAttemptTime > attemptResetInterval) {
      resetAttempts()

      return true
    }

    return count < attemptLimit
  }, [attemptLimit, attemptResetInterval, attemptsData, resetAttempts])

  const registerAttempt = useCallback(() => {
    if (!attemptsData) {
      setAttemptsData({ count: 1, lastAttemptTime: Date.now() })

      return
    }
    const { count } = attemptsData
    setAttemptsData({
      count: count + 1,
      lastAttemptTime: Date.now(),
    })
  }, [attemptsData, setAttemptsData])

  return { canAttempt, registerAttempt }
}

export default useAttemptTracker
