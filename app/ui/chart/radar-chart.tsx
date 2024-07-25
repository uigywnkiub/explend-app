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

import { calculateChartData, filterTransactions } from '@/app/lib/data'
import { TTransaction } from '@/app/lib/types'
import { capitalizeFirstLetter, getFormattedCurrency } from '@/app/lib/utils'

import CustomLegend from './custom-legend'

type TProps = {
  transactions: TTransaction[]
  currency: TTransaction['currency']
}

function RadarChart({ transactions, currency }: TProps) {
  const { income, expense } = filterTransactions(transactions)
  const chartData = calculateChartData(income, expense)

  return (
    <ResponsiveContainer width='100%' height='100%' className='-mt-8'>
      <RechartRadarChart cx='50%' cy='50%' outerRadius='75%' data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey='category' />
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
          separator=': '
          contentStyle={{ backgroundColor: 'none' }}
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
        />
      </RechartRadarChart>
    </ResponsiveContainer>
  )
}

export default RadarChart
