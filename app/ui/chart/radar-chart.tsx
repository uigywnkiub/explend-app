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

import { DANGER, SUCCESS } from '@/config/constants/colors'
import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { toWords } from '@/config/to-words'

import {
  calculateChartData,
  filterTransactions,
  getFirstAndLastTransactions,
  getTransactionsByCurrMonth,
  getTransactionsTotals,
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
import { TTransaction } from '@/app/lib/types'

import InfoText from '../info-text'
import CustomLegend from './custom-legend'
import CustomTooltip from './custom-tooltip'

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

  const firstTransactionDate = formatDate(firstTransaction.createdAt)
  const lastTransactionDate = formatDate(lastTransaction.createdAt)

  const { income, expense } = filterTransactions(transactions)
  const chartData = calculateChartData(income, expense)
  const transactionsTotals = getTransactionsTotals([...income, ...expense])
  const isPositiveBalance =
    transactionsTotals.income > transactionsTotals.expense

  return (
    <>
      <ResponsiveContainer width='100%' height='100%' className='-mt-8'>
        <RechartRadarChart cx='50%' cy='50%' outerRadius='75%' data={chartData}>
          <PolarGrid
            className={cn(
              !getBooleanFromLocalStorage(LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN)
                ? isPositiveBalance
                  ? 'fill-success-50/20'
                  : 'fill-danger-50/20'
                : 'fill-content1/20',
            )}
          />
          <PolarAngleAxis
            dataKey='category'
            tick={(props) => {
              const category = props.payload.value

              return (
                <text
                  {...props}
                  className='cursor-pointer fill-foreground text-sm hover:opacity-hover md:text-medium'
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
              )
            }}
          />
          <Radar
            dataKey='income'
            stroke={SUCCESS}
            fill={SUCCESS}
            fillOpacity={0.6}
          />
          <Radar
            dataKey='expense'
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
            tickFormatter={(value) => getFormattedCurrency(value)}
            className='text-sm md:text-medium'
          />
        </RechartRadarChart>
      </ResponsiveContainer>

      <div className='-mt-2 flex flex-col gap-2 text-center'>
        <InfoText
          text={`Visualization of ${isChartByCurrMonth ? 'current month' : 'all-time'} transactions.`}
          withAsterisk={false}
        />
        <InfoText
          text={`From ${firstTransactionDate} to ${lastTransactionDate}.`}
          withAsterisk={false}
        />
        <InfoText
          text={`${toWords.convert(transactions.length)} (${getFormattedCurrency(transactions.length, false)}) entries.`}
          withAsterisk={false}
        />
      </div>
    </>
  )
}

export default memo(RadarChart)
