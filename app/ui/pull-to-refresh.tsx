'use client'

import { useEffect, useRef, useState } from 'react'

import { animate, AnimatePresence, motion, useMotionValue } from 'framer-motion'

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 8
const OVERSHOOT_RESISTANCE = 0.2
const MAX_OVERSHOOT_RATIO = 0.2

function getPullPosition(distance: number, threshold: number) {
  if (distance <= threshold) return distance

  const overshoot = Math.min(
    (distance - threshold) * OVERSHOOT_RESISTANCE,
    threshold * MAX_OVERSHOOT_RATIO,
  )

  return threshold + overshoot
}

function getScrollContainers(target: EventTarget | null): HTMLElement[] {
  if (!(target instanceof Element)) {
    const scrollingElement = document.scrollingElement as HTMLElement | null

    return scrollingElement ? [scrollingElement] : []
  }

  let element: Element | null = target
  const containers: HTMLElement[] = []

  while (element && element !== document.body) {
    const { overflowY } = window.getComputedStyle(element)
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      element.scrollHeight > element.clientHeight
    ) {
      containers.push(element as HTMLElement)
    }
    element = element.parentElement
  }

  const scrollingElement = document.scrollingElement as HTMLElement | null
  if (scrollingElement && !containers.includes(scrollingElement)) {
    containers.push(scrollingElement)
  }

  return containers
}

export default function PullToRefresh() {
  const translateY = useMotionValue(0)
  const [pullDistance, setPullDistance] = useState(0)
  const [pullThreshold, setPullThreshold] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRefreshingRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const pendingPullDistanceRef = useRef(0)
  const startRef = useRef<{
    x: number
    y: number
    containers: HTMLElement[]
    threshold: number
  } | null>(null)
  const distanceRef = useRef(0)
  const pullThresholdRef = useRef(0)

  useEffect(() => {
    const resetPull = () => {
      startRef.current = null
      distanceRef.current = 0
      animate(translateY, 0, {
        type: 'spring',
        stiffness: 420,
        damping: 42,
        mass: 0.55,
      })
      setPullThreshold(0)
      setPullDistance(0)

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      translateY.stop()
      translateY.set(0)
      pullThresholdRef.current = 0

      if (event.touches.length !== 1) {
        resetPull()

        return
      }

      distanceRef.current = 0

      if (touch.clientY > window.innerHeight * 0.05) {
        resetPull()

        return
      }

      const containers = getScrollContainers(event.target)
      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        containers,
        threshold: Math.round(window.innerHeight * 0.2),
      }
      setPullThreshold(startRef.current.threshold)
      pullThresholdRef.current = startRef.current.threshold
    }

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      const start = startRef.current

      if (event.touches.length !== 1 || isRefreshingRef.current) return

      if (!start) return
      const deltaY = touch.clientY - start.y
      const deltaX = touch.clientX - start.x

      if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY <= 0) {
        resetPull()

        return
      }

      if (start.containers.some((container) => container.scrollTop > 0)) {
        resetPull()

        return
      }

      event.preventDefault()
      distanceRef.current = deltaY
      pendingPullDistanceRef.current = getPullPosition(deltaY, start.threshold)
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(() => {
          setPullDistance(pendingPullDistanceRef.current)
          translateY.set(pendingPullDistanceRef.current)
          animationFrameRef.current = null
        })
      }
    }

    const onTouchEnd = () => {
      const start = startRef.current
      const distance = distanceRef.current
      const threshold = start?.threshold ?? pullThresholdRef.current
      const progress = threshold > 0 ? distance / threshold : 0

      if (progress >= 1 && !isRefreshingRef.current) {
        isRefreshingRef.current = true
        setIsRefreshing(true)
        window.setTimeout(() => window.location.reload(), 220)
      }

      resetPull()
      pullThresholdRef.current = 0
    }

    const onTouchCancel = () => {
      resetPull()
      pullThresholdRef.current = 0
    }

    document.addEventListener('touchstart', onTouchStart, {
      capture: true,
      passive: true,
    })
    document.addEventListener('touchmove', onTouchMove, {
      capture: true,
      passive: false,
    })
    document.addEventListener('touchend', onTouchEnd, {
      capture: true,
      passive: true,
    })
    document.addEventListener('touchcancel', onTouchCancel, {
      capture: true,
      passive: true,
    })

    return () => {
      document.removeEventListener('touchstart', onTouchStart, true)
      document.removeEventListener('touchmove', onTouchMove, true)
      document.removeEventListener('touchend', onTouchEnd, true)
      document.removeEventListener('touchcancel', onTouchCancel, true)
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      translateY.stop()
    }
  }, [translateY])

  const isVisible = pullDistance > 8 || isRefreshing
  const pullProgress =
    pullThreshold > 0 ? Math.min(pullDistance / pullThreshold, 1) : 0
  const isReadyToRefresh = pullProgress >= 1 && !isRefreshing
  const circleProgress = isRefreshing ? 0.28 : pullProgress
  const statusText = isRefreshing
    ? 'Refreshing...'
    : pullProgress >= 1
      ? 'Release to refresh'
      : 'Pull to refresh'

  return (
    <div
      aria-live='polite'
      className='pointer-events-none fixed inset-x-0 z-[2147483647] flex justify-center'
      role='status'
      style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <motion.div
        className='bg-content1 shadow-medium rounded-medium flex w-max items-center gap-2 py-2 pr-2 pl-2 text-sm'
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.15, ease: 'easeOut' } }}
        style={{ y: translateY }}
      >
        <svg
          aria-hidden='true'
          className={`size-4 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`}
          viewBox='0 0 20 20'
        >
          <circle
            cx='10'
            cy='10'
            r='8'
            fill='none'
            stroke='currentColor'
            strokeOpacity='0.2'
            strokeWidth='2'
          />
          <motion.circle
            cx='10'
            cy='10'
            r='8'
            fill='none'
            initial={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE }}
            stroke='currentColor'
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            animate={{
              strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - circleProgress),
              opacity: isReadyToRefresh ? 0 : 1,
            }}
            strokeLinecap='round'
            strokeWidth='2'
            transition={{
              type: 'spring',
              stiffness: 360,
              damping: 30,
              mass: 0.4,
            }}
          />
          <motion.path
            d='m5.5 10.5 3 3 6-7'
            fill='none'
            initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
            animate={{
              pathLength: isReadyToRefresh ? 1 : 0,
              opacity: isReadyToRefresh ? 1 : 0,
              scale: isReadyToRefresh ? 1 : 0.8,
            }}
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2.5'
            style={{ transformOrigin: 'center' }}
            transition={{
              pathLength: { duration: 0.18, ease: 'easeOut' },
              opacity: { duration: 0.12 },
              scale: { duration: 0.18, ease: 'easeOut' },
            }}
          />
        </svg>
        <span
          aria-hidden='true'
          className='relative h-5 w-32 shrink-0 overflow-hidden'
        >
          <AnimatePresence mode='sync' initial={false}>
            <motion.span
              key={statusText}
              className='absolute inset-0 flex items-center justify-center whitespace-nowrap'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.18, ease: 'easeInOut' } }}
            >
              {statusText}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className='sr-only'>{statusText}</span>
      </motion.div>
    </div>
  )
}
