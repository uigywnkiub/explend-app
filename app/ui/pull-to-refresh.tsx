'use client'

import { useEffect, useRef, useState } from 'react'

import { haptic } from 'ios-haptics'

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
  const hasStartedPullRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const pendingPullDistanceRef = useRef(0)
  const startRef = useRef<{
    x: number
    y: number
    containers: HTMLElement[]
    threshold: number
  } | null>(null)
  const distanceRef = useRef(0)

  useEffect(() => {
    const resetPull = () => {
      startRef.current = null
      distanceRef.current = 0
      hasStartedPullRef.current = false
      setPullThreshold(0)
      setIsPulling(false)
      setPullDistance(0)

      if (animationFrameRef.current !== null) {
        hasStartedPullRef.current = false
        animationFrameRef.current = null
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        resetPull()

        return
      }

      const touch = event.touches[0]
      if (touch.clientY > window.innerHeight * 0.1) {
        resetPull()

        return
      }

      const containers = getScrollContainers(event.target)
      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        containers,
        threshold: Math.round(window.innerHeight * 0.3),
      }
      setPullThreshold(startRef.current.threshold)
      distanceRef.current = 0
      hasStartedPullRef.current = false
    }

    const onTouchMove = (event: TouchEvent) => {
      const start = startRef.current
      if (!start || event.touches.length !== 1 || isRefreshingRef.current)
        return

      const touch = event.touches[0]
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

      if (!hasStartedPullRef.current) {
        hasStartedPullRef.current = true
        haptic()
      }

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(() => {
          setPullDistance(pendingPullDistanceRef.current)
          animationFrameRef.current = null
        })
      }
    }

    const onTouchEnd = () => {
      const start = startRef.current
      const didPull = Boolean(start && distanceRef.current > 0)
      const didReachThreshold = Boolean(
        start && distanceRef.current >= start.threshold,
      )

      if (didReachThreshold && !isRefreshingRef.current) {
        haptic.confirm()
        isRefreshingRef.current = true
        setIsRefreshing(true)
        window.setTimeout(() => window.location.reload(), 220)
      } else if (didPull && !isRefreshingRef.current) {
        haptic.error()
      }

      resetPull()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', resetPull, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', resetPull)
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
    <div
      aria-live='polite'
      className={`bg-content1 shadow-medium fixed left-1/2 z-100 flex w-max items-center rounded-full py-2 pr-4 pl-9 text-sm transition-[opacity,transform] ease-out ${isPulling ? 'duration-0' : 'duration-200'} ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      style={{
        top: 'max(0.75rem, env(safe-area-inset-top))',
        transform: `translate(-50%, ${pullDistance}px)`,
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
        <circle
          cx='10'
          cy='10'
          r='8'
          fill='none'
          stroke='currentColor'
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - circleProgress)}
          strokeLinecap='round'
          strokeWidth='2'
        />
      </svg>
      <span className='text-center'>
        {isRefreshing
          ? 'Refreshing...'
          : pullProgress >= 1
            ? 'Release to refresh'
            : 'Pull to refresh'}
      </span>
    </div>
  )
}
