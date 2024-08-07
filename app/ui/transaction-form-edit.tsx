'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useTheme } from 'next-themes'
import { useTransitionRouter } from 'next-view-transitions'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import {
  Badge,
  Button,
  Input,
  Kbd,
  Select,
  Selection,
  SelectItem,
  SelectSection,
  Switch,
} from '@nextui-org/react'

import { DEFAULT_CURRENCY_SIGN } from '@/config/constants/main'
import { slideInOut } from '@/config/constants/motion'
import { ROUTE } from '@/config/constants/routes'

import { editTransactionById } from '../lib/actions'
import type { TTheme, TTransaction } from '../lib/types'
import {
  capitalizeFirstLetter,
  getCategoryWithEmoji,
  getCategoryWithoutEmoji,
  getFormattedCurrency,
  getTransactionsWithChangedCategory,
} from '../lib/utils'
import Loading from '../loading'
import InfoText from './info-text'

const AMOUNT_LENGTH = 6

type TProps = {
  transaction: TTransaction
}

function TransactionFormEdit({ transaction }: TProps) {
  const router = useTransitionRouter()
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchedOn, setIsSwitchedOn] = useState(transaction.isIncome)
  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(getFormattedCurrency(transaction.amount))
  const isTransactionWithChangedCategory = !!getTransactionsWithChangedCategory(
    [transaction],
  ).length
  const [category, setCategory] = useState<Selection>(
    new Set(
      isTransactionWithChangedCategory
        ? []
        : [getCategoryWithoutEmoji(transaction.category)],
    ),
  )
  // @ts-ignore
  const isCategorySelect = Boolean(category.size)
  const categoryName = Array.from(category)[0]?.toString()
  const userCategories = transaction.categories
  const categoryWithEmoji = getCategoryWithEmoji(
    categoryName,
    userCategories || DEFAULT_CATEGORIES,
  )
  const prevCategory = transaction.category
  const currency = transaction.currency
  const isEdited = transaction.isEdited
  const transactionId = transaction.id

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawAmount = e.target.value
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/^0+/, '')
    if (!isNaN(Number(rawAmount)) && rawAmount.length <= AMOUNT_LENGTH) {
      const formattedValue = getFormattedCurrency(rawAmount)
      setAmount(formattedValue)
    }
  }

  const hasChanges = (
    newData: Partial<TTransaction>,
    oldData: TTransaction,
  ) => {
    const { amount, ...restOldData } = oldData
    const modifiedOldData: TTransaction = {
      ...restOldData,
      amount: getFormattedCurrency(oldData.amount),
    }
    return Object.keys(newData).some((key) => {
      const newKey = key as keyof typeof newData
      return (
        newData[newKey] !== undefined &&
        newData[newKey] !== modifiedOldData[newKey]
      )
    })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const newTransactionData = {
      isIncome: isSwitchedOn,
      isEdited,
      description: capitalizeFirstLetter(description),
      amount,
      category: categoryWithEmoji,
      currency,
    }

    if (!hasChanges(newTransactionData, transaction)) {
      toast.error('No changes detected.')
      setIsLoading(false)
      return
    }
    newTransactionData.isEdited = true

    try {
      await editTransactionById(transactionId, newTransactionData)
      toast.success('Transaction edited.')
      router.push(ROUTE.HOME, {
        onTransitionReady: slideInOut,
      })
    } catch (err) {
      toast.error('Failed to edit transaction.')
      throw err
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <Switch
          isDisabled={isLoading}
          color='success'
          name='isIncome'
          value='isIncome'
          aria-label='Income Switch'
          isSelected={isSwitchedOn}
          onValueChange={(isSelected) => setIsSwitchedOn(isSelected)}
        >
          Income
        </Switch>
        <Input
          isDisabled={isLoading}
          isRequired
          type='text'
          name='description'
          aria-label='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          size='lg'
          color={isSwitchedOn ? 'success' : 'danger'}
          placeholder={
            isSwitchedOn
              ? 'Type income transaction...'
              : 'Type expense transaction...'
          }
          classNames={{
            input: 'border-none focus:ring-0 placeholder:text-default-500',
            inputWrapper: 'h-20 my-2 px-4',
          }}
          endContent={
            <Input
              isRequired
              type='text'
              name='amount'
              aria-label='Amount'
              value={amount}
              onChange={onChangeAmount}
              required
              maxLength={AMOUNT_LENGTH + 1}
              // pattern='\d+'
              pattern='[\d\s,]+'
              inputMode='decimal'
              placeholder='0'
              size='lg'
              classNames={{
                input:
                  'border-none focus:ring-0 placeholder:text-default-500 text-center',
                inputWrapper: 'h-12 w-full px-4',
                base: 'w-44 md:w-36',
              }}
              endContent={
                <div className='pointer-events-none flex items-center'>
                  <span className='text-md text-lg text-default-500'>
                    {transaction.currency?.sign || DEFAULT_CURRENCY_SIGN}
                  </span>
                </div>
              }
            />
          }
        />
        <div className='flex justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex w-full flex-wrap gap-4 md:flex-nowrap'>
              <Badge
                content=''
                shape='rectangle'
                color='warning'
                variant='solid'
                size='sm'
                isDot
                placement='top-right'
                classNames={{
                  base: 'w-full',
                  badge: 'right-1',
                }}
                isInvisible={
                  !isTransactionWithChangedCategory || isCategorySelect
                }
              >
                <Select
                  isDisabled={isLoading}
                  name='category'
                  label='Select a category'
                  className='w-56'
                  items={userCategories || DEFAULT_CATEGORIES}
                  selectedKeys={category}
                  defaultSelectedKeys={category}
                  onSelectionChange={setCategory}
                >
                  {(userCategories || DEFAULT_CATEGORIES).map(
                    (category, idx, arr) => (
                      <SelectSection
                        key={category.subject}
                        showDivider={idx !== arr.length - 1}
                        title={category.subject}
                      >
                        {category.items.map((item) => (
                          <SelectItem key={item.name}>
                            {`${item.emoji} ${item.name}`}
                          </SelectItem>
                        ))}
                      </SelectSection>
                    ),
                  )}
                </Select>
              </Badge>
            </div>
          </div>
          <div className='flex items-center'>
            <p className='text-sm text-default-500'>
              <span className='hidden md:inline'>Press </span>
              <span className='inline md:hidden'>Tap </span>
              <Button
                aria-label='Enter'
                type='submit'
                isDisabled={
                  !amount || amount === '0' || isLoading || !isCategorySelect
                }
                className={`${isCategorySelect && isTransactionWithChangedCategory ? `animate-blink-${(theme as TTheme) === 'system' ? 'light' : theme}-once` : ''} cursor-pointer bg-background px-0`}
                size='sm'
              >
                <Kbd keys={['enter']}>Enter</Kbd>
              </Button>
              <span className='hidden md:inline'> to Add Transaction</span>
            </p>
          </div>
        </div>
      </form>
      {isTransactionWithChangedCategory && (
        <div className='mt-2 flex flex-col gap-2'>
          <InfoText text='Looks like you have changed the category data. Please select an existing one.' />
          <InfoText text={`Your previous category was: ${prevCategory}.`} />
        </div>
      )}
    </>
  )
}

export default TransactionFormEdit
