'use client'

import { JSX, useEffect } from 'react'

import {
  animate,
  motion,
  SpringOptions,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion'

// import { DANGER, SUCCESS } from '@/config/constants/colors'

import {
  cn,
  convertToNumber,
  formatPercentage,
  getFormattedBalance,
  getFormattedCurrency,
} from '../lib/helpers'

const SPRING_CONFIG: SpringOptions = {
  bounce: 0,
  duration: 1000,
}

type TProps = {
  value: number | string
  isFormatted?: boolean
  isFormattedBalance?: boolean
  isPercentage?: boolean
  className?: string
  springOptions?: SpringOptions
  as?: React.ElementType
}

export default function AnimatedNumber({
  value,
  isFormatted = true,
  isFormattedBalance = false,
  isPercentage = false,
  className,
  springOptions = SPRING_CONFIG,
  as = 'span',
}: TProps) {
  const MotionComponent = motion.create(as as keyof JSX.IntrinsicElements)
  const numericValue = convertToNumber(value)

  // const color = useMotionValue('inherit')
  const blur = useMotionValue(0)

  const filter = useMotionTemplate`blur(${blur}px)`

  const spring = useSpring(numericValue, springOptions)
  const display = useTransform(spring, (current) => {
    if (isPercentage) return formatPercentage(current)

    const roundedCurrent = Math.round(current)

    return isFormattedBalance
      ? getFormattedBalance(roundedCurrent.toString())
      : isFormatted
        ? getFormattedCurrency(roundedCurrent)
        : roundedCurrent.toString()
  })

  // eslint-disable-next-line unused-imports/no-unused-vars
  useMotionValueEvent(spring, 'change', (latest) => {
    blur.set(0.5)

    animate(blur, 0, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      duration: springOptions?.duration! / 10000,
    })

    if (!isFormattedBalance) return

    // const roundedLatest = Math.round(latest)
    // color.set(
    //   numericValue > roundedLatest
    //     ? SUCCESS //  If the value is increasing.
    //     : numericValue < roundedLatest
    //       ? DANGER // If the value is decreasing.
    //       : 'inherit', // If the value remains unchanged.
    // )
  })

  useEffect(() => {
    spring.set(numericValue)
  }, [spring, numericValue])

  return (
    <MotionComponent
      style={{
        // color,
        filter,
      }}
      // className={cn('slashed-zero tabular-nums', className)}
      className={cn(className)}
    >
      {display}
    </MotionComponent>
  )
}
