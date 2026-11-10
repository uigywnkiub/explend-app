'use client'

import { memo, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartRadarChart,
  Text as RechartText,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { DANGER_COLOR, SUCCESS_COLOR } from '@/tailwind.config'
import {
  Chip,
  Divider,
  Tooltip as HeroUITooltip,
  Select,
  SelectItem,
  SelectSection,
  Spacer,
  Switch,
} from '@heroui/react'
import { haptic } from 'ios-haptics'

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
  getCategoryMedalByAmount,
  getCategoryWithoutEmoji,
  getFormattedCurrency,
  pluralize,
} from '@/app/lib/helpers'
import type { TCategories, TCurrency, TTransaction } from '@/app/lib/types'

import AnimatedNumber from '../animated-number'
import InfoText from '../info-text'
import CustomTooltip from './custom-tooltip'

const DATA_KEY = {
  CATEGORY: 'category',
  INCOME: 'income',
  EXPENSE: 'expense',
}

type TCategoryExcludeSelectProps = {
  categories: TCategories[]
  excludedCategories: Set<string>
  availableCategories: Set<string>
  amountsByCategory: Map<string, { income: number; expense: number }>
  currency: TCurrency
  onSelectionChange: (keys: Set<string>) => void
}

function CategoryExcludeSelect({
  categories,
  excludedCategories,
  availableCategories,
  amountsByCategory,
  currency,
  onSelectionChange,
}: TCategoryExcludeSelectProps) {
  const categorySections = categories
    .map((category) => ({
      subject: category.subject,
      items: category.items
        .map((item) => `${item.emoji} ${item.name}`)
        .filter((item) => availableCategories.has(item)),
    }))
    .filter((category) => category.items.length > 0)
  const configuredCategoryKeys = new Set(
    categorySections.flatMap((category) => category.items),
  )
  const otherCategories = [...availableCategories].filter(
    (category) => !configuredCategoryKeys.has(category),
  )
  if (otherCategories.length > 0) {
    categorySections.push({ subject: 'Other', items: otherCategories })
  }
  const selectedAvailableCategories = new Set(
    [...excludedCategories].filter((category) =>
      availableCategories.has(category),
    ),
  )

  return (
    <div className='my-4 w-full max-w-md'>
      <div className='mb-3'>
        <h3 className='font-medium'>Exclude categories</h3>
        <p className='text-default-500 text-sm'>
          Choose categories to leave out of the chart.
        </p>
      </div>
      <Select
        isClearable
        label='Categories'
        placeholder='Select categories to exclude'
        selectionMode='multiple'
        selectedKeys={selectedAvailableCategories}
        onSelectionChange={(keys) =>
          onSelectionChange(
            keys === 'all'
              ? new Set(availableCategories)
              : new Set(Array.from(keys).map(String)),
          )
        }
        items={categorySections}
        className='w-full'
        classNames={{ trigger: 'min-h-12' }}
      >
        {categorySections.map((category) => (
          <SelectSection
            key={category.subject}
            title={category.subject}
            classNames={{
              heading:
                'flex w-full sticky top-1 z-20 py-1.5 px-2 text-default-500 bg-background rounded-medium',
            }}
          >
            {category.items.map((item) => (
              <SelectItem
                key={item}
                textValue={item}
                endContent={(() => {
                  const amounts = amountsByCategory.get(item)
                  if (!amounts) return null

                  return (
                    <div className='text-default-500 flex flex-col items-end gap-1 text-xs'>
                      {amounts.expense > 0 && (
                        <span>
                          Expense by {getFormattedCurrency(amounts.expense)}{' '}
                          {currency.sign}
                        </span>
                      )}
                      {amounts.income > 0 && (
                        <span>
                          Income by {getFormattedCurrency(amounts.income)}{' '}
                          {currency.sign}
                        </span>
                      )}
                    </div>
                  )
                })()}
              >
                {item}
              </SelectItem>
            ))}
          </SelectSection>
        ))}
      </Select>
    </div>
  )
}

type TProps = {
  transactionsRaw: TTransaction[]
  categories: TCategories[]
  currency: TCurrency
}

function RadarChart({ transactionsRaw, categories, currency }: TProps) {
  const router = useRouter()
  const [isChartByCurrMonth, setIsChartByCurrMonth] = useState(true)
  const [isPositiveBalance, setIsPositiveBalance] = useState(false)
  const [isAmountHidden, setIsAmountHidden] = useState(false)
  const [isChartForExpensesOnly, setIsChartForExpensesOnly] = useState(false)
  const [areMedalsHidden, setAreMedalsHidden] = useState(true)

  useEffect(() => {
    setIsPositiveBalance(
      getBooleanFromLocalStorage(LOCAL_STORAGE_KEY.IS_POSITIVE_BALANCE) ===
        true,
    )
    setIsAmountHidden(
      getBooleanFromLocalStorage(LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN) === true,
    )
  }, [])

  const chartTransactionsRaw = isChartByCurrMonth
    ? getTransactionsByCurrMonth(transactionsRaw)
    : transactionsRaw
  const availableCategories = new Set(
    chartTransactionsRaw.map(({ category }) => category),
  )
  const amountsByCategory = new Map<
    string,
    { income: number; expense: number }
  >()
  chartTransactionsRaw.forEach(({ category, amount, isIncome }) => {
    const amounts = amountsByCategory.get(category) ?? { income: 0, expense: 0 }
    amounts[isIncome ? 'income' : 'expense'] += parseFloat(amount)
    amountsByCategory.set(category, amounts)
  })
  const [excludedCategories, setExcludedCategories] = useState<Set<string>>(
    new Set(),
  )

  const includedTransactions = transactionsRaw.filter(
    ({ category }) => !excludedCategories.has(category),
  )
  const transactions = isChartByCurrMonth
    ? getTransactionsByCurrMonth(includedTransactions)
    : includedTransactions

  const { firstTransaction, lastTransaction } =
    getFirstAndLastTransactions(transactions)

  const firstTransactionDate = firstTransaction
    ? formatDate(firstTransaction.createdAt)
    : ''
  const lastTransactionDate = lastTransaction
    ? formatDate(lastTransaction.createdAt)
    : ''

  const { income, expense } = filterTransactions(transactions)
  const chartData = calculateChartData(
    isChartForExpensesOnly ? [] : income,
    expense,
  )
  const totals = chartData.reduce(
    (result, item) => ({
      income: result.income + item.income,
      expense: result.expense + item.expense,
    }),
    { income: 0, expense: 0 },
  )
  // const getTransactionTypeTotal = (transactionType: TTransactionType) =>
  //   calculateTotalAmount(
  //     chartData.map((data): { amount: TTransaction['amount'] } => ({
  //       amount: data[transactionType].toString(),
  //     })) as unknown as TTransaction[],
  //   )

  return (
    <>
      {transactions.length === 0 ? (
        <div className='mx-auto my-4 max-w-3xl md:my-8'>
          <p className='md:text-medium text-default-500 text-center text-sm'>
            {isChartByCurrMonth && chartTransactionsRaw.length === 0
              ? 'No transactions found this month'
              : 'No transactions found for the selected categories'}
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width='100%' height='100%'>
            <RechartRadarChart
              accessibilityLayer={false}
              cx='50%'
              cy='50%'
              outerRadius='75%'
              data={chartData}
            >
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
                  const medal = areMedalsHidden
                    ? ''
                    : getCategoryMedalByAmount(chartData, category)

                  return (
                    <HeroUITooltip content='Search by category' placement='top'>
                      <RechartText
                        {...props}
                        className='fill-foreground hover:opacity-hover md:text-medium cursor-pointer text-sm outline-hidden'
                        alignmentBaseline='central'
                        onClick={() =>
                          router.push(
                            createSearchHrefWithKeyword(
                              getCategoryWithoutEmoji(category),
                            ),
                          )
                        }
                      >
                        {`${category}${medal ? ` ${medal}` : ''}`}
                      </RechartText>
                    </HeroUITooltip>
                  )
                }}
              />
              <Radar
                dataKey={DATA_KEY.INCOME}
                stroke={SUCCESS_COLOR}
                fill={SUCCESS_COLOR}
                fillOpacity={0.6}
              />
              <Radar
                dataKey={DATA_KEY.EXPENSE}
                stroke={DANGER_COLOR}
                fill={DANGER_COLOR}
                fillOpacity={0.6}
              />
              {/* <Legend
            content={
              <CustomLegend
                expenseTotal={getTransactionTypeTotal('expense')}
                incomeTotal={getTransactionTypeTotal('income')}
                currency={currency}
                isChartForExpensesOnly={isChartForExpensesOnly}
              />
            }
          /> */}
              <Tooltip
                contentStyle={{ backgroundColor: 'none' }}
                content={
                  <CustomTooltip
                    active={false}
                    payload={[]}
                    label={''}
                    currency={currency}
                    transactions={transactions}
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
                className='md:text-medium text-sm'
              />
            </RechartRadarChart>
          </ResponsiveContainer>
        </>
      )}
      <section className='rounded-medium bg-content1 mx-auto w-full max-w-3xl p-4 shadow-xs md:p-8'>
        <div>
          <h2 className='text-xl font-semibold'>Chart options</h2>
          <p className='text-default-500'>
            Customize what appears in your chart.
          </p>
        </div>
        <Spacer y={4} />
        <CategoryExcludeSelect
          categories={categories}
          excludedCategories={excludedCategories}
          availableCategories={availableCategories}
          amountsByCategory={amountsByCategory}
          currency={currency}
          onSelectionChange={setExcludedCategories}
        />
        <Divider />
        <div className='flex items-center justify-between gap-4 py-4'>
          <div className='min-w-0'>
            <h3 className='font-medium'>Current month</h3>
            <p className='text-default-500 text-sm'>
              Show this month instead of all time.
            </p>
          </div>
          <Switch
            aria-label='Show chart for current month'
            color='primary'
            isSelected={isChartByCurrMonth}
            onValueChange={(value) => {
              haptic()
              setIsChartByCurrMonth(value)
            }}
          />
        </div>
        <Divider />
        <div className='flex items-center justify-between gap-4 py-4'>
          <div className='min-w-0'>
            <h3 className='font-medium'>Expenses only</h3>
            <p className='text-default-500 text-sm'>
              Exclude income transactions from the chart.
            </p>
          </div>
          <Switch
            aria-label='Show expenses only'
            color='primary'
            isSelected={isChartForExpensesOnly}
            onValueChange={(value) => {
              haptic()
              setIsChartForExpensesOnly(value)
            }}
          />
        </div>
        <Divider />
        <div className='flex items-center justify-between gap-4 py-4 pb-0'>
          <div className='min-w-0'>
            <h3 className='font-medium'>Hide category medals</h3>
            <p className='text-default-500 text-sm'>
              Remove medal icons from category labels.
            </p>
          </div>
          <Switch
            aria-label='Hide category medals'
            color='primary'
            isSelected={areMedalsHidden}
            onValueChange={(value) => {
              haptic()
              setAreMedalsHidden(value)
            }}
          />
        </div>
      </section>
      {transactions.length > 0 && (
        <div className='mx-auto mt-4 flex max-w-3xl flex-col gap-1 text-center text-xs md:text-sm'>
          <div className='mb-1 flex flex-row justify-center gap-2 sm:gap-6'>
            <div className='flex items-center justify-center gap-2'>
              <InfoText isSm withAsterisk={false} text='Income:' />
              <Chip color='success' size='sm' variant='flat'>
                <AnimatedNumber value={totals.income} /> {currency.sign}
              </Chip>
            </div>
            <div className='flex items-center justify-center gap-2'>
              <InfoText isSm withAsterisk={false} text='Expense:' />
              <Chip color='danger' size='sm' variant='flat'>
                <AnimatedNumber value={totals.expense} /> {currency.sign}
              </Chip>
            </div>
          </div>
          <InfoText
            withAsterisk={false}
            text={`Visualization of ${isChartByCurrMonth ? 'current month' : 'all-time'} ${pluralize(
              transactions.length,
              'transaction',
              'transactions',
            )}`}
          />
          <InfoText
            withAsterisk={false}
            text={`From ${firstTransactionDate} to ${lastTransactionDate}`}
          />
          <InfoText
            withAsterisk={false}
            text={`${transactions.length} ${pluralize(
              transactions.length,
              'entry',
              'entries',
            )}`}
          />
        </div>
      )}
    </>
  )
}

export default memo(RadarChart)
