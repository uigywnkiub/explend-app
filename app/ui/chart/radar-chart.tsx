'use client'

import { memo } from 'react'

import { useRouter } from 'next/navigation'

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { Tooltip as HeroUITooltip } from '@heroui/react'

import { DANGER, SUCCESS } from '@/config/constants/colors'
import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import {
  calculateChartData,
  filterTransactions,
  getFirstAndLastTransactions,
  getTransactionsByCurrMonth,
} from '@/app/lib/data'
import {
  capitalizeFirstLetter,
  cn,
  createSearchHrefWithKeyword,
  formatDate,
  getBooleanFromLocalStorage,
  getCategoryWithoutEmoji,
  getFormattedCurrency,
} from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

import NoTransactionsPlug from '../no-transactions-plug'
import CustomLegend from './custom-legend'
import CustomTooltip from './custom-tooltip'

const DATA_KEY = {
  CATEGORY: 'category',
  INCOME: 'income',
  EXPENSE: 'expense',
}

type TProps = {
  transactionsRaw: TTransaction[]
  currency: TTransaction['currency']
}

function RadarChart({ transactionsRaw, currency }: TProps) {
  const router = useRouter()

  const isChartByCurrMonth = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_CHART_BY_CURR_MONTH,
  )
  const transactions = isChartByCurrMonth
    ? getTransactionsByCurrMonth(transactionsRaw)
    : transactionsRaw

  const { firstTransaction, lastTransaction } =
    getFirstAndLastTransactions(transactions)

  if (isChartByCurrMonth && !firstTransaction && !lastTransaction) {
    return (
      <div className='mt-4 md:mt-8'>
        <NoTransactionsPlug text='This month no transactions found' />
      </div>
    )
  }

  const firstTransactionDate = formatDate(firstTransaction!.createdAt)
  const lastTransactionDate = formatDate(lastTransaction!.createdAt)

  const { income, expense } = filterTransactions(transactions)
  const chartData = calculateChartData(income, expense)
  const isPositiveBalance = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_POSITIVE_BALANCE,
  )
  const isAmountHidden = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN,
  )

  return (
    <>
      <ResponsiveContainer width='100%' height='100%' className='-mt-8'>
        <RechartRadarChart cx='50%' cy='50%' outerRadius='75%' data={chartData}>
          <PolarGrid
            className={cn(
              !isAmountHidden
                ? isPositiveBalance
                  ? 'fill-success-50/20'
                  : 'fill-danger-50/20'
                : 'fill-default/20',
            )}
          />
          <PolarAngleAxis
            dataKey={DATA_KEY.CATEGORY}
            tick={(props) => {
              const category = props.payload.value

              return (
                <HeroUITooltip content='Search by category' placement='top'>
                  <text
                    {...props}
                    className='cursor-pointer fill-foreground text-sm outline-none hover:opacity-hover md:text-medium'
                    alignmentBaseline='central'
                    onClick={() =>
                      router.push(
                        createSearchHrefWithKeyword(
                          getCategoryWithoutEmoji(category),
                        ),
                      )
                    }
                  >
                    {category}
                  </text>
                </HeroUITooltip>
              )
            }}
          />
          <Radar
            dataKey={DATA_KEY.INCOME}
            stroke={SUCCESS}
            fill={SUCCESS}
            fillOpacity={0.6}
          />
          <Radar
            dataKey={DATA_KEY.EXPENSE}
            stroke={DANGER}
            fill={DANGER}
            fillOpacity={0.6}
          />
          <Legend content={<CustomLegend />} />
          <Tooltip
            contentStyle={{ backgroundColor: 'none' }}
            content={
              <CustomTooltip
                active={false}
                payload={[]}
                label={''}
                currency={currency}
              />
            }
            wrapperClassName='rounded-medium bg-background'
            formatter={(value, name) => [
              `${getFormattedCurrency(value as number)} ${currency.code}`,
              capitalizeFirstLetter(name as string),
            ]}
          />
          <PolarRadiusAxis
            angle={30}
            orientation='middle'
            tickFormatter={(value) =>
              `${getFormattedCurrency(value)} ${currency.sign}`
            }
            className='text-sm md:text-medium'
          />
        </RechartRadarChart>
      </ResponsiveContainer>

      <div className='-mt-2 flex flex-col gap-1 text-center text-xs md:text-sm'>
        <p>
          {`Visualization of ${isChartByCurrMonth ? 'current month' : 'all-time'} transactions.`}
        </p>
        <p>{`From ${firstTransactionDate} to ${lastTransactionDate}.`}</p>
        <p>
          {/* {`${toWords.convert(transactions.length)} (${getFormattedCurrency(transactions.length, false)}) entries.`} */}
          {`${getFormattedCurrency(transactions.length, false)} entries.`}
        </p>
      </div>
    </>
  )
}

export default memo(RadarChart)
