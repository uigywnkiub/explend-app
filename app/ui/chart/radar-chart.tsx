'use client'

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

import {
  calculateChartData,
  filterTransactions,
  getTransactionsTotals,
} from '@/app/lib/data'
import {
  capitalizeFirstLetter,
  cn,
  getFormattedCurrency,
} from '@/app/lib/helpers'
import { TTransaction } from '@/app/lib/types'

import CustomLegend from './custom-legend'
import CustomTooltip from './custom-tooltip'

type TProps = {
  transactions: TTransaction[]
  currency: TTransaction['currency']
}

function RadarChart({ transactions, currency }: TProps) {
  const { income, expense } = filterTransactions(transactions)
  const chartData = calculateChartData(income, expense)
  const transactionsTotals = getTransactionsTotals([...income, ...expense])
  const isPositiveBalance =
    transactionsTotals.income > transactionsTotals.expense

  return (
    <ResponsiveContainer width='100%' height='100%' className='-mt-8'>
      <RechartRadarChart cx='50%' cy='50%' outerRadius='75%' data={chartData}>
        <PolarGrid
          className={cn(
            isPositiveBalance ? 'fill-success-50/20' : 'fill-danger-50/20',
          )}
        />
        <PolarAngleAxis
          dataKey='category'
          tick={(props) => (
            <text
              {...props}
              className='fill-foreground text-sm md:text-medium'
              alignmentBaseline='central'
            >
              {props.payload.value}
            </text>
          )}
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
            `${getFormattedCurrency(value as number)} ${currency?.code}`,
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
  )
}

export default RadarChart
