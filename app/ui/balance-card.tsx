'use client'

import { useCallback, useEffect, useState } from 'react'
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

import { getAllTransactions } from '../lib/actions'
import { getTransactionsTotals, getWeeklySpendData } from '../lib/data'
import {
  cn,
  getBooleanFromLocalStorage,
  getFormattedCurrency,
  getGreeting,
  setInLocalStorage,
} from '../lib/helpers'
import type {
  TCurrency,
  TTransaction,
  TUser,
  TWeeklySpendData,
} from '../lib/types'
import Loading from '../loading'
import AnimatedGreeting from './animated-greeting'
import AnimatedNumber from './animated-number'
import { HoverableElement } from './hoverables'

type TProps = {
  user: TUser | undefined
  balance: TTransaction['balance']
  currency: TCurrency
  hasTransactions: boolean
  transactionCount: number
}

const SPEND_CHART_COLOR = 'hsl(var(--heroui-primary-400))'
const CHART_MUTED_COLOR = 'hsl(var(--heroui-default-400))'

function BalanceCard({
  user,
  balance,
  currency,
  hasTransactions,
  transactionCount,
}: TProps) {
  const [isShowTotals, setIsChangeInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedTransactionCount, setLoadedTransactionCount] = useState<
    number | null
  >(null)
  const [total, setTotal] = useState<{
    income: number
    expense: number
  }>({
    income: 0,
    expense: 0,
  })
  const [weeklySpend, setWeeklySpend] = useState<TWeeklySpendData | null>(null)

  const userId = user?.email
  const isTotalLoaded = Boolean(total.income) || Boolean(total.expense)
  const isPositiveBalance = Number(balance) > 0
  const isAmountHidden = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN,
  )
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const greetingMsg = `${getGreeting(currentTimeZone || DEFAULT_TIME_ZONE)}, ${user?.name} 👋🏼`

  const onChangeInfo = () => {
    if (!hasTransactions) return
    haptic()
    setIsChangeInfo((prev) => !prev)
  }

  const getTotal = useCallback(async () => {
    setIsLoading(true)
    try {
      const transactions = await getAllTransactions(userId)
      setTotal({
        income: getTransactionsTotals(transactions).income,
        expense: getTransactionsTotals(transactions).expense,
      })
      try {
        setWeeklySpend(getWeeklySpendData(transactions))
      } catch {
        setWeeklySpend(null)
      }
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
    setInLocalStorage(
      LOCAL_STORAGE_KEY.IS_POSITIVE_BALANCE,
      String(isPositiveBalance),
    )
  }, [isPositiveBalance])

  return (
    <Card
      className={cn(
        'p-2 shadow-xs',
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
      aria-expanded={isShowTotals}
      aria-label={isShowTotals ? 'Hide Details' : 'Show Details'}
      onPress={onChangeInfo}
    >
      <div className='pointer-events-none absolute -inset-px opacity-0' />
      <CardHeader className='flex flex-col items-center justify-between gap-4 px-2 md:px-4'>
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
                <AnimatedNumber value={balance} isFormattedBalance />{' '}
                {currency.code}
              </motion.p>
            )}
            {hasTransactions && (
              <span className='text-primary-500 mt-1 inline-flex items-center gap-1 text-xs font-medium'>
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
                    'flex w-full max-w-48 cursor-text items-center justify-end gap-1.5 text-right text-xs select-text',
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
                            size={DEFAULT_ICON_SIZE}
                            className='fill-success cursor-default'
                          />
                        }
                        hoveredElement={
                          <PiCheckCircleFill
                            size={DEFAULT_ICON_SIZE}
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
                            size={DEFAULT_ICON_SIZE}
                            className='fill-danger cursor-default'
                          />
                        }
                        hoveredElement={
                          <PiWarningCircleFill
                            size={DEFAULT_ICON_SIZE}
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
                  data={weeklySpend.chartData}
                  margin={{ top: 20, right: 16, bottom: -10, left: 2 }}
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
                    isFront
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
