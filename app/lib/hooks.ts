import { useCallback, useEffect } from 'react'
import { useLocalStorage } from 'react-use'

import type { TTransaction } from './types'

const ATTEMPT_LIMIT = 3
const ATTEMPT_RESET_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds.
// 24 * 60 * 60 * 1000; // 24 hours in milliseconds.
// 10 * 1000; // 10 seconds in milliseconds.

export function useAttemptTracker(
  storageKey: string,
  attemptLimit: number = ATTEMPT_LIMIT,
  attemptResetInterval: number = ATTEMPT_RESET_INTERVAL,
) {
  const [attemptsData, setAttemptsData] = useLocalStorage(storageKey, {
    count: 0,
    // eslint-disable-next-line react-hooks/purity
    lastAttemptTime: Date.now(),
  })

  const resetAttempts = useCallback(() => {
    setAttemptsData({ count: 0, lastAttemptTime: Date.now() })
  }, [setAttemptsData])

  const canAttempt = useCallback(() => {
    if (!attemptsData) return true
    const { count, lastAttemptTime } = attemptsData
    const currTime = Date.now()
    // Reset attempts if attemptResetInterval or ATTEMPT_RESET_INTERVAL number value have passed.
    if (currTime - lastAttemptTime > attemptResetInterval) {
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

export function useImageNavigation(
  isOpen: boolean,
  images: TTransaction['images'],
  setCurrIdx: React.Dispatch<React.SetStateAction<number>>,
) {
  const cycleIdx = useCallback(
    (prev: number, step: number) => {
      if (!images || images.length === 0) return prev
      if (prev === -1) return step > 0 ? 0 : images.length - 1

      return (prev + step + images.length) % images.length
    },
    [images],
  )

  const nextImage = useCallback(
    () => setCurrIdx((prev) => cycleIdx(prev, +1)),
    [setCurrIdx, cycleIdx],
  )

  const prevImage = useCallback(
    () => setCurrIdx((prev) => cycleIdx(prev, -1)),
    [setCurrIdx, cycleIdx],
  )

  useEffect(() => {
    if (!isOpen || !images || images.length === 0) return

    let touchStartX = 0

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
    }

    const onTouchEnd = (e: TouchEvent) => {
      const diffX = e.changedTouches[0].clientX - touchStartX
      if (Math.abs(diffX) > 50) {
        if (diffX < 0) nextImage() // Swipe left → next
        if (diffX > 0) prevImage() // Swipe right → prev
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isOpen, images, nextImage, prevImage])

  return {
    nextImage,
    prevImage,
  }
}
