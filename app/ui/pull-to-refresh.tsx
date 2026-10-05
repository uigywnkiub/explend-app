'use client'

import { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 8

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
  const [pullDistance, setPullDistance] = useState(0)
  const [pullThreshold, setPullThreshold] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
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
      setPullThreshold(0)
      setIsPulling(false)
      setPullDistance(0)

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
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
      pendingPullDistanceRef.current = Math.min(deltaY, start.threshold)
      setIsPulling(true)

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(() => {
          setPullDistance(pendingPullDistanceRef.current)
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
    }
  }, [])

  const isVisible = pullDistance > 8 || isRefreshing
  const pullProgress =
    pullThreshold > 0 ? Math.min(pullDistance / pullThreshold, 1) : 0
  const circleProgress = isRefreshing ? 0.28 : pullProgress

  return (
    <motion.div
      aria-live='polite'
      className={`bg-content1 shadow-medium rounded-medium fixed left-1/2 z-100 flex w-max -translate-x-1/2 items-center py-2 pr-4 pl-9 text-sm ${isVisible ? '' : 'pointer-events-none'}`}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: isVisible ? 1 : 0, y: pullDistance }}
      transition={{
        y: {
          type: 'spring',
          stiffness: isPulling ? 750 : 450,
          damping: isPulling ? 65 : 38,
          mass: 0.45,
        },
        opacity: { duration: 0.15, ease: 'easeOut' },
      }}
      style={{
        top: 'max(0.75rem, env(safe-area-inset-top))',
        zIndex: 2147483647,
      }}
      role='status'
    >
      <svg
        aria-hidden='true'
        className={`absolute top-1/2 left-4 mt-[-1.5px] size-4 -translate-y-1/2 ${isRefreshing ? 'animate-spin' : ''}`}
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
          stroke='currentColor'
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          animate={{
            strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - circleProgress),
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
      </svg>
      <span className='text-center'>
        {isRefreshing
          ? 'Refreshing...'
          : pullProgress >= 1
            ? 'Release to refresh'
            : 'Pull to refresh'}
      </span>
    </motion.div>
  )
}
