'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PiArrowCircleDownFill,
  PiArrowCircleUpFill,
  PiCaretDown,
  PiCheckCircle,
  PiCheckCircleFill,
  PiWarningCircle,
  PiWarningCircleFill,
} from 'react-icons/pi'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardHeader, Tooltip } from '@heroui/react'
import { motion } from 'framer-motion'
import { haptic } from 'ios-haptics'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_ICON_SIZE, DEFAULT_TIME_ZONE } from '@/config/constants/main'
import { DIV } from '@/config/constants/motion'

import { getBalanceCardData } from '../lib/actions'
import { getWeeklySpendData } from '../lib/data'
import {
  cn,
  getBooleanFromLocalStorage,
  getDayPeriod,
  getFormattedCurrency,
  getFromLocalStorage,
  getGreeting,
  setInLocalStorage,
} from '../lib/helpers'
import type {
  TCurrency,
  TTotals,
  TTransaction,
  TUser,
  TWeeklySpendData,
} from '../lib/types'
import Loading from '../loading'
import AnimatedGreeting from './animated-greeting'
import AnimatedNumber from './animated-number'
import './aquarium.css'
import { HoverableElement } from './hoverables'

type TProps = {
  user: TUser | undefined
  balance: TTransaction['balance']
  currency: TCurrency
  hasTransactions: boolean
  transactionCount: number
  isBalanceLoading?: boolean
}

const SPEND_CHART_COLOR = 'hsl(var(--heroui-primary-500))'
const CHART_MUTED_COLOR = 'hsl(var(--heroui-default-500))'

const seededUnit = (seed: number) => {
  let value = (seed + 1) * 16807

  value = (value ^ (value >>> 13)) * 1274126177
  value = value ^ (value >>> 16)

  return (value >>> 0) / 4294967296
}

const MINI_SCHOOL_FORMATIONS = [
  [
    { left: 0, top: 10 },
    { left: 9, top: 17 },
    { left: 18, top: 10 },
  ],
  [
    { left: 0, top: 8 },
    { left: 10, top: 14 },
    { left: 20, top: 20 },
    { left: 30, top: 14 },
    { left: 40, top: 8 },
  ],
  [
    { left: 0, top: 8 },
    { left: 10, top: 8 },
    { left: 20, top: 8 },
    { left: 5, top: 18 },
    { left: 15, top: 18 },
    { left: 25, top: 18 },
  ],
] as const

function AquariumEffect({
  period,
  expanded,
}: {
  period: ReturnType<typeof getDayPeriod>
  expanded: boolean
}) {
  const fish = useMemo(
    () =>
      Array.from({ length: expanded ? 13 : 10 }, (_, index) => ({
        id: index,
        left: 8 + seededUnit(index + 1) * 80,
        top: 16 + seededUnit(index + 9) * 68,
        size: 0.58 + seededUnit(index + 17) * 0.72,
        duration: 14 + seededUnit(index + 25) * 27,
        delay: -seededUnit(index + 33) * 38,
        route: Math.floor(seededUnit(index + 41) * 6),
        shape: Math.floor(seededUnit(index + 49) * 4),
        tailDuration: 0.45 + seededUnit(index + 57) * 0.75,
        sway: -8 + seededUnit(index + 65) * 16,
        pointA: 12 + seededUnit(index + 73) * 76,
        pointB: 10 + seededUnit(index + 81) * 80,
        pointC: 12 + seededUnit(index + 89) * 76,
        pointD: 10 + seededUnit(index + 97) * 80,
        verticalA: 12 + seededUnit(index + 105) * 68,
        verticalB: 12 + seededUnit(index + 113) * 70,
        verticalC: 10 + seededUnit(index + 121) * 72,
        verticalD: 12 + seededUnit(index + 129) * 68,
      })),
    [expanded],
  )
  const shadowFish = fish.slice(0, 3)

  return (
    <div
      className={cn(
        'aquarium',
        `aquarium--${period}`,
        expanded && 'aquarium--expanded',
      )}
      aria-hidden='true'
    >
      <div className='aquarium__light' />
      <div className='aquarium__cloud-shadow' />
      <div className='aquarium__waterline' />
      <div className='aquarium__celestial' />
      <div className='aquarium__stars' />
      <div className='aquarium__depth aquarium__depth--back' />
      <div className='aquarium__depth aquarium__depth--middle' />
      <div className='aquarium__depth aquarium__depth--front' />
      <div className='aquarium__caustics' />
      <div className='aquarium__surface-glints' aria-hidden='true'>
        {Array.from({ length: 5 }, (_, index) => (
          <i
            key={index}
            style={
              {
                '--glint-left': `${7 + index * 21}%`,
                '--glint-delay': `${-index * 1.1}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__sun-path' />
      <div className='aquarium__sun-reflection' />
      <div className='aquarium__current aquarium__current--1' />
      <div className='aquarium__current aquarium__current--2' />
      <div className='aquarium__vortex aquarium__vortex--1' />
      <div className='aquarium__vortex aquarium__vortex--2' />
      <div className='aquarium__glint' />
      {[22, 43, 68].map((top, index) => (
        <div
          key={top}
          className={`aquarium__wave aquarium__wave--${index + 1}`}
          style={{ top: `${top}%` }}
        />
      ))}
      <div className='aquarium__surface-distortion' aria-hidden='true' />
      <div className='aquarium__refraction' aria-hidden='true'>
        {Array.from({ length: 4 }, (_, index) => (
          <i
            key={index}
            style={
              {
                '--refraction-left': `${10 + index * 26}%`,
                '--refraction-delay': `${-index * 2.1}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__plankton' aria-hidden='true'>
        {Array.from({ length: expanded ? 12 : 7 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${4 + ((index * 31) % 92)}%`,
                top: `${12 + ((index * 47) % 74)}%`,
                '--particle-delay': `${-index * 2.3}s`,
                '--particle-duration': `${14 + (index % 5) * 2}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__seabed'>
        <div className='aquarium__cast-shadows' aria-hidden='true'>
          {shadowFish.map((item, index) => (
            <i
              key={item.id}
              className='aquarium__cast-shadow aquarium__cast-shadow--fish'
              style={
                {
                  left: `${item.left}%`,
                  top: `${12 + index * 15}%`,
                  '--fish-origin-x': `${item.left}%`,
                  '--fish-point-a': `${item.pointA}%`,
                  '--fish-point-b': `${item.pointB}%`,
                  '--fish-point-c': `${item.pointC}%`,
                  '--fish-point-d': `${item.pointD}%`,
                  '--fish-duration': `${item.duration}s`,
                  '--fish-delay': `${item.delay}s`,
                  '--fish-shadow-scale': `${0.75 + item.size * 0.18}`,
                  '--fish-shadow-opacity': `${0.2 - index * 0.025}`,
                  '--fish-shadow-width': `${28 + item.size * 9}px`,
                } as React.CSSProperties
              }
            />
          ))}
          {Array.from({ length: 3 }, (_, index) => {
            const seed = index + 271

            return (
              <i
                key={`passer-${index}`}
                className='aquarium__cast-shadow--passer'
                style={
                  {
                    left: `${6 + seededUnit(seed) * 82}%`,
                    top: `${8 + seededUnit(seed + 1) * 72}%`,
                    '--passer-scale': `${0.62 + seededUnit(seed + 2) * 0.7}`,
                    '--passer-duration': `${18 + seededUnit(seed + 3) * 17}s`,
                    '--passer-delay': `${-seededUnit(seed + 4) * 35}s`,
                    '--passer-opacity-base': `${0.08 + seededUnit(seed + 5) * 0.07}`,
                  } as React.CSSProperties
                }
              />
            )
          })}
          <i className='aquarium__cast-shadow aquarium__cast-shadow--rock' />
          <i className='aquarium__cast-shadow aquarium__cast-shadow--coral' />
          <i className='aquarium__cast-shadow aquarium__cast-shadow--wood' />
        </div>
        <div className='aquarium__sand-grains' aria-hidden='true'>
          {Array.from({ length: 22 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  left: `${(index * 29 + (index % 4) * 7) % 96}%`,
                  top: `${18 + ((index * 43) % 68)}%`,
                  '--sand-delay': `${-(index % 9) * 0.45}s`,
                  '--sand-size': `${1 + (index % 3)}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
      <div className='aquarium__rocks' aria-hidden='true'>
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className='aquarium__snail' aria-hidden='true'>
        <i className='aquarium__snail-body' />
        <i className='aquarium__snail-shell' />
        <b className='aquarium__snail-eye aquarium__snail-eye--1' />
        <b className='aquarium__snail-eye aquarium__snail-eye--2' />
      </div>
      <div className='aquarium__plant-bubbles' aria-hidden='true'>
        {Array.from({ length: 3 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${7 + index * 42}%`,
                bottom: `${8 + seededUnit(index + 281) * 10}%`,
                '--plant-bubble-size': `${2 + seededUnit(index + 287) * 2}px`,
                '--plant-bubble-duration': `${16 + seededUnit(index + 293) * 8}s`,
                '--plant-bubble-delay': `${-seededUnit(index + 299) * 24}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__distance-reef' aria-hidden='true'>
        {Array.from({ length: 9 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${index * 11}%`,
                '--reef-height': `${22 + ((index * 19) % 32)}px`,
                '--reef-delay': `${-(index % 5) * 0.7}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__coral aquarium__coral--left'>
        <i />
        <i />
        <i />
      </div>
      <div className='aquarium__coral aquarium__coral--right'>
        <i />
        <i />
        <i />
      </div>
      <div className='aquarium__driftwood' aria-hidden='true'>
        <i />
        <i />
        <i />
      </div>
      <div className='aquarium__wood-bubbles' aria-hidden='true'>
        {Array.from({ length: 3 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${index * 8}px`,
                '--wood-bubble-delay': `${-index * 4.6}s`,
                '--wood-bubble-duration': `${13 + (index % 3) * 2}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__shells' aria-hidden='true'>
        {Array.from({ length: 3 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${22 + index * 28}%`,
                scale: `${0.72 + (index % 3) * 0.12}`,
                '--shell-delay': `${-index * 0.9}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__seagrass' aria-hidden='true'>
        {Array.from({ length: 8 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${index * 12.5}%`,
                '--grass-height': `${26 + ((index * 13) % 28)}px`,
                '--grass-delay': `${-seededUnit(index + 211) * 12}s`,
                '--grass-duration': `${9 + seededUnit(index + 223) * 6}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__hermit-crab' aria-hidden='true'>
        <i />
      </div>
      <div className='aquarium__ray' aria-hidden='true'>
        <i />
      </div>
      {MINI_SCHOOL_FORMATIONS.map((formation, schoolIndex) => (
        <div
          key={schoolIndex}
          className={cn(
            'aquarium__mini-school',
            `aquarium__mini-school--${schoolIndex + 1}`,
          )}
          aria-hidden='true'
        >
          {formation.map(({ left, top }, index) => (
            <i
              key={index}
              className={
                index === schoolIndex + 1
                  ? 'aquarium__mini-school-scout'
                  : undefined
              }
              style={
                {
                  '--school-left': `${left}px`,
                  '--school-delay': `${-(index * 0.42 + schoolIndex * 0.7)}s`,
                  '--school-fish-duration': `${1.5 + ((index + schoolIndex) % 3) * 0.2}s`,
                  '--school-top': `${top}px`,
                  '--scout-duration': `${19 + schoolIndex * 3}s`,
                  '--scout-delay': `${-(schoolIndex * 5 + 3)}s`,
                  '--scout-x': schoolIndex === 1 ? '-12px' : '12px',
                  '--scout-half-x': schoolIndex === 1 ? '-6px' : '6px',
                  '--scout-y': schoolIndex === 2 ? '-5px' : '-3px',
                  '--scout-half-y': schoolIndex === 2 ? '-2px' : '-1px',
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
      <div
        className='aquarium__jellyfish aquarium__jellyfish--1'
        aria-hidden='true'
      >
        <i />
      </div>
      <div
        className='aquarium__jellyfish aquarium__jellyfish--2'
        aria-hidden='true'
      >
        <i />
      </div>
      <div className='aquarium__shrimp-swarm' aria-hidden='true'>
        {Array.from({ length: 4 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${18 + ((index * 29) % 68)}%`,
                '--shrimp-delay': `${-index * 1.8}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div
        className='aquarium__starfish aquarium__starfish--1'
        aria-hidden='true'
      >
        <i />
      </div>
      <div
        className='aquarium__starfish aquarium__starfish--2'
        aria-hidden='true'
      >
        <i />
      </div>
      <div className='aquarium__crab' aria-hidden='true'>
        <i />
      </div>
      <div className='aquarium__catfish' aria-hidden='true'>
        <i className='aquarium__catfish-body'>
          <b className='aquarium__catfish-eye' />
          <span className='aquarium__catfish-whisker aquarium__catfish-whisker--top' />
          <span className='aquarium__catfish-whisker aquarium__catfish-whisker--bottom' />
        </i>
      </div>
      <div className='aquarium__benthic-fish' aria-hidden='true'>
        <i className='aquarium__benthic-fish-body'>
          <b className='aquarium__benthic-fish-eye' />
          <b className='aquarium__benthic-fish-mouth' />
        </i>
        <i className='aquarium__benthic-fish-tail' />
        <i className='aquarium__benthic-fish-fin aquarium__benthic-fish-fin--top' />
        <i className='aquarium__benthic-fish-fin aquarium__benthic-fish-fin--bottom' />
        <i className='aquarium__benthic-fish-barbel aquarium__benthic-fish-barbel--left' />
        <i className='aquarium__benthic-fish-barbel aquarium__benthic-fish-barbel--right' />
      </div>
      <div className='aquarium__plants aquarium__plants--left'>
        {Array.from({ length: expanded ? 15 : 9 }, (_, index) => (
          <i
            key={index}
            style={
              {
                '--plant-duration': `${9 + seededUnit(index + 181) * 7}s`,
                '--plant-delay': `${-seededUnit(index + 193) * 16}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className='aquarium__plants aquarium__plants--right'>
        {Array.from({ length: 11 }, (_, index) => (
          <i
            key={index}
            style={
              {
                '--plant-duration': `${9 + seededUnit(index + 241) * 7}s`,
                '--plant-delay': `${-seededUnit(index + 253) * 16}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      {fish.map((item) => (
        <span
          key={item.id}
          className={`aquarium__fish-wrap aquarium__fish-wrap--${
            item.size < 0.82 ? 'back' : item.size > 1.05 ? 'front' : 'middle'
          }`}
          style={
            {
              '--fish-origin-x': `${item.left}%`,
              '--fish-origin-y': `${item.top}%`,
              '--fish-duration': `${item.duration}s`,
              '--fish-expanded-duration': `${item.duration * 0.82}s`,
              '--fish-delay': `${item.delay}s`,
              '--fish-shadow-scale': `${0.65 + item.size * 0.42}`,
              '--fish-sway': `${item.sway}deg`,
              '--fish-point-a': `${item.pointA}%`,
              '--fish-point-b': `${item.pointB}%`,
              '--fish-point-c': `${item.pointC}%`,
              '--fish-point-d': `${item.pointD}%`,
              '--fish-y-a': `${item.verticalA}%`,
              '--fish-y-b': `${item.verticalB}%`,
              '--fish-y-c': `${item.verticalC}%`,
              '--fish-y-d': `${item.verticalD}%`,
              '--fish-tail-duration': `${item.tailDuration}s`,
              '--fish-expanded-tail-duration': `${item.tailDuration * 0.82}s`,
              '--fish-tail-delay': `${-item.tailDuration * seededUnit(item.id + 137)}s`,
            } as React.CSSProperties
          }
        >
          <i className='aquarium__fish-shadow' />
          <span
            className={`aquarium__fish aquarium__fish--shape-${item.shape} ${
              item.size < 0.82
                ? 'aquarium__fish--back'
                : item.size > 1.05
                  ? 'aquarium__fish--front'
                  : ''
            }`}
            style={
              {
                '--fish-scale': item.size,
                '--fish-shadow-scale': `${0.65 + item.size * 0.42}`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
      {Array.from({ length: expanded ? 7 : 5 }, (_, index) => (
        <i
          key={index}
          className='aquarium__bubble'
          style={
            {
              left: `${8 + ((index * 37) % 86)}%`,
              '--bubble-duration': `${5 + (index % 5)}s`,
              '--bubble-delay': `${-index * 1.3}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function BalanceCard({
  user,
  balance,
  currency,
  hasTransactions,
  transactionCount,
  isBalanceLoading = false,
}: TProps) {
  const [isShowTotals, setIsChangeInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedTransactionCount, setLoadedTransactionCount] = useState<
    number | null
  >(null)
  const [total, setTotal] = useState<TTotals>({
    income: 0,
    expense: 0,
  })
  const [weeklySpend, setWeeklySpend] = useState<TWeeklySpendData | null>(null)
  const [currentTimeZone, setCurrentTimeZone] = useState(DEFAULT_TIME_ZONE)
  const [isAquariumEnabled, setIsAquariumEnabled] = useState(true)

  const userId = user?.email
  const isTotalLoaded = Boolean(total.income) || Boolean(total.expense)
  const isPositiveBalance = Number(balance) > 0
  const isAmountHidden = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN,
  )
  const dayPeriod = getDayPeriod(currentTimeZone || DEFAULT_TIME_ZONE)
  const greetingMsg = `${getGreeting(currentTimeZone || DEFAULT_TIME_ZONE)}, ${user?.name} 👋🏼`
  const maxSpendLength = Math.max(
    Math.trunc(weeklySpend?.previousWeekSpend ?? 0).toString().length,
    Math.trunc(weeklySpend?.currentWeekSpend ?? 0).toString().length,
  )

  const onChangeInfo = () => {
    if (!hasTransactions) return
    haptic()
    setIsChangeInfo((prev) => !prev)
  }

  const getTotal = useCallback(async () => {
    setIsLoading(true)
    try {
      const { total, weeklyTransactions } = await getBalanceCardData(userId)
      setTotal(total)
      setWeeklySpend(getWeeklySpendData(weeklyTransactions))
      setLoadedTransactionCount(transactionCount)
    } catch (err) {
      setTotal({
        income: 0,
        expense: 0,
      })
      setWeeklySpend(null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [transactionCount, userId])

  useEffect(() => {
    if (isShowTotals && loadedTransactionCount !== transactionCount) {
      getTotal()
    }
  }, [getTotal, isShowTotals, loadedTransactionCount, transactionCount])

  useEffect(() => {
    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE
    setCurrentTimeZone(browserTimeZone)
  }, [])

  useEffect(() => {
    const storedValue = getFromLocalStorage(
      LOCAL_STORAGE_KEY.IS_AQUARIUM_ENABLED,
    )
    setIsAquariumEnabled(storedValue === null || storedValue === 'true')
  }, [])

  useEffect(() => {
    setInLocalStorage(
      LOCAL_STORAGE_KEY.IS_POSITIVE_BALANCE,
      String(isPositiveBalance),
    )
  }, [isPositiveBalance])

  return (
    <Card
      className={cn(
        'relative isolate overflow-hidden p-2 shadow-xs',
        hasTransactions &&
          'rounded-medium focus-visible:ring-primary cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isShowTotals && isTotalLoaded
          ? isPositiveBalance
            ? 'from-success/10 to-content1 bg-radial'
            : 'from-danger/10 to-content1 bg-radial'
          : 'bg-content1',
        isShowTotals && isTotalLoaded && isAmountHidden && 'bg-default/50',
      )}
      shadow='none'
      isPressable={hasTransactions}
      allowTextSelectionOnPress
      aria-expanded={hasTransactions ? isShowTotals : undefined}
      aria-label={
        hasTransactions
          ? isShowTotals
            ? 'Hide Details'
            : 'Show Details'
          : undefined
      }
      onPress={onChangeInfo}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 7
        event.currentTarget.style.setProperty('--aquarium-x', `${x}px`)
        event.currentTarget.style.setProperty('--aquarium-y', `${y}px`)
        event.currentTarget.style.setProperty('--aquarium-pointer-active', '1')
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--aquarium-x', '0px')
        event.currentTarget.style.setProperty('--aquarium-y', '0px')
        event.currentTarget.style.setProperty('--aquarium-pointer-active', '0')
      }}
      onPointerDown={(event) => {
        event.currentTarget.style.setProperty('--aquarium-touch-active', '1')
      }}
      onPointerUp={(event) => {
        event.currentTarget.style.setProperty('--aquarium-touch-active', '0')
      }}
      onPointerCancel={(event) => {
        event.currentTarget.style.setProperty('--aquarium-touch-active', '0')
      }}
    >
      {!isBalanceLoading && isAquariumEnabled && (
        <AquariumEffect period={dayPeriod} expanded={isShowTotals} />
      )}
      <div className='pointer-events-none absolute -inset-px opacity-0' />
      <CardHeader className='relative z-10 flex flex-col items-center justify-between gap-4 px-2 md:px-4'>
        <div className='aquarium__text-shimmer' aria-hidden='true' />
        <Tooltip
          content={isShowTotals ? 'Totals' : 'Balance'}
          placement='bottom'
        >
          <div className='text-center text-xl'>
            <AnimatedGreeting message={greetingMsg} />
            {isShowTotals ? (
              <>
                {!isLoading && isTotalLoaded ? (
                  <motion.div
                    className='flex flex-wrap justify-center gap-0 text-lg select-none md:gap-2'
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...DIV.TRANSITION_SPRING }}
                  >
                    <p>
                      <PiArrowCircleUpFill className='fill-success mr-1 inline' />
                      <span className='text-default-500 text-sm'>Income:</span>{' '}
                      <span className='font-semibold'>
                        <AnimatedNumber value={total.income} /> {currency.code}
                      </span>
                    </p>
                    <p>
                      <PiArrowCircleDownFill className='fill-danger mr-1 inline' />
                      <span className='text-default-500 text-sm'>Expense:</span>{' '}
                      <span className='font-semibold'>
                        <AnimatedNumber value={total.expense} /> {currency.code}
                      </span>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    className='flex h-7 items-center justify-center gap-2'
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...DIV.TRANSITION_SPRING }}
                  >
                    <Loading
                      size='sm'
                      isInline
                      wrapperClassName='flex flex-col items-center mb-1'
                      withoutText
                    />
                  </motion.div>
                )}
              </>
            ) : (
              <motion.p
                className='font-semibold select-none'
                initial={
                  isTotalLoaded
                    ? { opacity: 0, scale: 0 }
                    : { opacity: 1, scale: 1 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...DIV.TRANSITION_SPRING }}
              >
                {isBalanceLoading ? (
                  <span
                    role='status'
                    aria-label='Loading balance'
                    className='bg-default-200 inline-block h-6 w-32 animate-pulse rounded align-middle'
                  />
                ) : (
                  <>
                    <AnimatedNumber value={balance} isFormattedBalance />{' '}
                    {currency.code}
                  </>
                )}
              </motion.p>
            )}
            {hasTransactions && (
              <span
                // style={{ color: SPEND_CHART_COLOR }}
                className='mt-1 inline-flex items-center gap-1 text-xs font-medium'
              >
                {isShowTotals ? 'Hide Details' : 'Show Details'}
                <motion.span
                  animate={{ rotate: isShowTotals ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden='true'
                >
                  <PiCaretDown size={14} />
                </motion.span>
              </span>
            )}
          </div>
        </Tooltip>
        {isShowTotals && isTotalLoaded && weeklySpend && (
          <div
            className='w-full min-w-0 self-stretch'
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <div className='grid grid-cols-2 items-start gap-3 px-2 md:px-4'>
              <div className='min-w-0 text-left select-text'>
                <p className='text-default-500 cursor-text text-sm'>
                  Current spend this week
                </p>
                <p className='mt-2 cursor-text text-lg leading-tight font-semibold'>
                  <AnimatedNumber value={weeklySpend.currentWeekSpend} />{' '}
                  {currency.sign}
                </p>
              </div>
              <div className='flex min-w-0 cursor-default flex-col items-end text-right'>
                <div
                  className={cn(
                    'flex w-full max-w-48 cursor-text items-center justify-end gap-1 text-right text-xs select-text',
                    weeklySpend.previousWeekSpend === null
                      ? 'text-default-500'
                      : weeklySpend.previousWeekSpend >=
                          weeklySpend.currentWeekSpend
                        ? 'text-success'
                        : 'text-danger',
                  )}
                >
                  {weeklySpend.previousWeekSpend !== null &&
                    (weeklySpend.previousWeekSpend >=
                    weeklySpend.currentWeekSpend ? (
                      <HoverableElement
                        uKey='weekly-spend-check'
                        element={
                          <PiCheckCircle
                            size={DEFAULT_ICON_SIZE - 2}
                            className='fill-success cursor-default'
                          />
                        }
                        hoveredElement={
                          <PiCheckCircleFill
                            size={DEFAULT_ICON_SIZE - 2}
                            className='fill-success cursor-default'
                          />
                        }
                        withShift={false}
                      />
                    ) : (
                      <HoverableElement
                        uKey='weekly-spend-warning'
                        element={
                          <PiWarningCircle
                            size={DEFAULT_ICON_SIZE - 2}
                            className='fill-danger cursor-default'
                          />
                        }
                        hoveredElement={
                          <PiWarningCircleFill
                            size={DEFAULT_ICON_SIZE - 2}
                            className='fill-danger cursor-default'
                          />
                        }
                        withShift={false}
                      />
                    ))}
                  <span className='text-default-500'>
                    {weeklySpend.previousWeekSpend === null ? (
                      'No previous week data'
                    ) : weeklySpend.previousWeekSpend ===
                      weeklySpend.currentWeekSpend ? (
                      'Same as last week'
                    ) : (
                      <>
                        <AnimatedNumber
                          value={Math.abs(
                            weeklySpend.previousWeekSpend -
                              weeklySpend.currentWeekSpend,
                          )}
                        />{' '}
                        {currency.sign}{' '}
                        {weeklySpend.previousWeekSpend >
                        weeklySpend.currentWeekSpend
                          ? 'below'
                          : 'above'}{' '}
                        last week
                      </>
                    )}
                  </span>
                </div>
                <div className='text-default-500 mt-3 flex flex-wrap items-center justify-end gap-3 text-xs select-text'>
                  {weeklySpend.previousWeekSpend !== null && (
                    <span className='inline-flex cursor-text items-center gap-1'>
                      <span
                        className='w-4'
                        style={{ borderTop: `2px dashed ${CHART_MUTED_COLOR}` }}
                      />
                      Last week
                    </span>
                  )}
                  <span className='inline-flex cursor-text items-center gap-1'>
                    <span
                      className='h-0.5 w-4'
                      style={{ backgroundColor: SPEND_CHART_COLOR }}
                    />
                    This week
                  </span>
                </div>
              </div>
            </div>
            <div
              className='h-40 w-full min-w-0'
              role='img'
              aria-label={`Current week spending: ${getFormattedCurrency(weeklySpend.currentWeekSpend)} ${currency.sign}${weeklySpend.previousWeekSpend !== null ? `, previous week ${getFormattedCurrency(weeklySpend.previousWeekSpend)} ${currency.sign}` : ''}`}
            >
              <ResponsiveContainer
                width='100%'
                height='100%'
                className='w-full min-w-0'
              >
                <AreaChart
                  accessibilityLayer={false}
                  data={weeklySpend.chartData}
                  margin={{
                    top: 20,
                    right: 16,
                    bottom: -10,
                    left:
                      maxSpendLength >= 5
                        ? 6
                        : maxSpendLength === 4
                          ? 1
                          : maxSpendLength === 3
                            ? -4
                            : -10,
                  }}
                >
                  <defs>
                    <linearGradient
                      id='balance-spend-gradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='0%'
                        stopColor={SPEND_CHART_COLOR}
                        stopOpacity={0.18}
                      />
                      <stop
                        offset='100%'
                        stopColor={SPEND_CHART_COLOR}
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke={CHART_MUTED_COLOR}
                    strokeOpacity={0.2}
                  />
                  <YAxis
                    width={56}
                    tickCount={4}
                    axisLine={false}
                    tickLine={false}
                    tick={({ x, y, payload }) => (
                      <text
                        x={x}
                        y={y}
                        dy={3}
                        textAnchor='end'
                        fill={CHART_MUTED_COLOR}
                        fontSize={10}
                      >
                        <AnimatedNumber
                          value={Number(payload.value)}
                          as='tspan'
                        />{' '}
                        {currency.sign}
                      </text>
                    )}
                    domain={[
                      0,
                      Math.max(
                        weeklySpend.currentWeekSpend,
                        weeklySpend.previousWeekSpend || 0,
                      ) * 1.05 || 1,
                    ]}
                  />
                  <XAxis
                    dataKey='dateLabel'
                    axisLine={false}
                    tickLine={false}
                    minTickGap={8}
                    interval='preserveStartEnd'
                    tick={{ fontSize: 10, fill: CHART_MUTED_COLOR }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null

                      return (
                        <div className='rounded-medium bg-background/90 p-1.5 text-left drop-shadow-md md:p-3'>
                          <p className='mb-1 text-xs font-medium'>
                            {payload[0]?.payload.tooltipDateLabel}
                          </p>
                          {payload.map((item, index) => {
                            if (item.value === undefined || item.value === null)
                              return null

                            const isCurrentWeek =
                              item.dataKey === 'cumulativeSpend'
                            const color = isCurrentWeek
                              ? SPEND_CHART_COLOR
                              : CHART_MUTED_COLOR

                            return (
                              <p key={index} className='text-xs leading-4'>
                                <span
                                  className='mr-1 inline-block size-2 rounded-full'
                                  style={{ backgroundColor: color }}
                                />
                                <span className='text-default-500'>
                                  {item.name}:{' '}
                                </span>
                                <span className='font-semibold'>
                                  {getFormattedCurrency(Number(item.value))}{' '}
                                  {currency.sign}
                                </span>
                              </p>
                            )
                          })}
                        </div>
                      )
                    }}
                  />
                  {weeklySpend.previousWeekSpend !== null && (
                    <Area
                      type='monotone'
                      dataKey='previousWeekCumulativeSpend'
                      name='Last week'
                      stroke={CHART_MUTED_COLOR}
                      strokeDasharray='5 4'
                      strokeWidth={2}
                      fill='none'
                      dot={false}
                    />
                  )}
                  <Area
                    type='monotone'
                    dataKey='cumulativeSpend'
                    name='This week'
                    stroke={SPEND_CHART_COLOR}
                    strokeWidth={3}
                    fill='url(#balance-spend-gradient)'
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: 'white',
                      stroke: SPEND_CHART_COLOR,
                    }}
                  />
                  <ReferenceDot
                    x={weeklySpend.currentDay}
                    y={weeklySpend.currentWeekSpend}
                    r={4}
                    fill='white'
                    stroke={SPEND_CHART_COLOR}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  )
}

export default BalanceCard
