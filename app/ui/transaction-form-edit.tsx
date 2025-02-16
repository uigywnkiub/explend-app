'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

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
} from '@heroui/react'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_CATEGORY } from '@/config/constants/main'

import { editTransactionById } from '../lib/actions'
import { getTransactionsWithChangedCategory } from '../lib/data'
import {
  capitalizeFirstLetter,
  cn,
  formatAmount,
  getCategoryWithEmoji,
  getCategoryWithoutEmoji,
  getFormattedCurrency,
  removeFromLocalStorage,
  setInLocalStorage,
} from '../lib/helpers'
import type { TTheme, TTransaction } from '../lib/types'
import Loading from '../loading'
import InfoText from './info-text'
import LimitToast from './limit-toast'

const AMOUNT_LENGTH = 6

type TProps = {
  transaction: TTransaction
}

function TransactionFormEdit({ transaction }: TProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchedOn, setIsSwitchedOn] = useState(transaction.isIncome)
  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(
    getFormattedCurrency(transaction.amount, false),
  )
  const isTransactionWithChangedCategory = Boolean(
    getTransactionsWithChangedCategory([transaction]).length,
  )
  const [category, setCategory] = useState<Selection>(
    new Set(
      isTransactionWithChangedCategory
        ? []
        : [getCategoryWithoutEmoji(transaction.category)],
    ),
  )
  // @ts-expect-error - Property 'size' does not exist on type 'Selection', but it does.
  const isCategorySelect = Boolean(category.size)
  const categoryName = Array.from(category)[0]?.toString()
  useEffect(() => {
    if (categoryName) {
      setInLocalStorage(LOCAL_STORAGE_KEY.SELECTED_CATEGORY_NAME, categoryName)
    }

    return () =>
      removeFromLocalStorage(LOCAL_STORAGE_KEY.SELECTED_CATEGORY_NAME)
  }, [categoryName])
  const userCategories = transaction.categories
  const categoryWithEmoji = getCategoryWithEmoji(categoryName, userCategories)
  const prevCategory = transaction.category
  const currency = transaction.currency
  const isEdited = transaction.isEdited
  const transactionId = transaction.id

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawAmount = formatAmount(e.target.value)
    if (!isNaN(Number(rawAmount)) && rawAmount.length <= AMOUNT_LENGTH) {
      setAmount(getFormattedCurrency(rawAmount, false))
    }
  }

  const hasChanges = (
    newData: Partial<TTransaction>,
    oldData: TTransaction,
  ) => {
    const modifiedOldData: TTransaction = {
      ...oldData,
      amount: getFormattedCurrency(oldData.amount, false),
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
      router.back()
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
      <LimitToast triggerBy={categoryName} />
      <form onSubmit={onSubmit}>
        <Switch
          isDisabled={isLoading}
          color='success'
          name='isIncome'
          value='isIncome'
          aria-label='Income switch'
          isSelected={isSwitchedOn}
          onValueChange={(isSelected) => setIsSwitchedOn(isSelected)}
        >
          Income
        </Switch>
        <Input
          isDisabled={isLoading}
          isRequired
          autoComplete='off'
          type='text'
          name='description'
          aria-label='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          size='lg'
          color={isSwitchedOn ? 'success' : 'danger'}
          placeholder={isSwitchedOn ? 'Type income...' : 'Type expense...'}
          classNames={{
            input: 'border-none focus:ring-0 placeholder:text-default-500',
            inputWrapper: 'h-16 md:h-20 my-2 px-3',
          }}
          endContent={
            <Input
              isRequired
              autoComplete='off'
              type='text'
              name='amount'
              aria-label='Amount'
              value={amount}
              onChange={onChangeAmount}
              onBlur={() => parseFloat(amount) === 0 && setAmount('')}
              required
              maxLength={AMOUNT_LENGTH + 1}
              // pattern='\d+'
              pattern='[\d\s,]+'
              inputMode='decimal'
              placeholder='0'
              size='lg'
              classNames={{
                input:
                  'border-none focus:ring-0 placeholder:text-default-500 mt-0.5 text-default-500 text-center',
                inputWrapper: 'h-12 w-full pl-3 md:px-4',
                base: 'w-[154px] md:w-36',
              }}
              endContent={
                <div className='pointer-events-none mt-[4px] flex items-center'>
                  <span
                    className={cn(
                      'text-md',
                      parseFloat(amount) >= 1
                        ? 'text-foreground'
                        : 'text-default-500',
                    )}
                  >
                    {transaction.currency.sign}
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
                  isVirtualized={false}
                  isDisabled={isLoading}
                  name='category'
                  label='Select a category'
                  className='w-56'
                  classNames={{
                    trigger:
                      'h-12 min-h-12 py-1.5 px-3 md:h-14 md:min-h-14 md:py-2',
                  }}
                  items={userCategories}
                  selectedKeys={category}
                  defaultSelectedKeys={category}
                  onSelectionChange={setCategory}
                >
                  {userCategories.map((category, idx, arr) => (
                    <SelectSection
                      key={category.subject}
                      showDivider={idx !== arr.length - 1}
                      title={category.subject}
                    >
                      {category.items.map((item) => (
                        <SelectItem
                          key={item.name}
                          endContent={
                            item.name === DEFAULT_CATEGORY && (
                              <InfoText
                                text='default'
                                withAsterisk={false}
                                withHover={false}
                              />
                            )
                          }
                        >
                          {`${item.emoji} ${item.name}`}
                        </SelectItem>
                      ))}
                    </SelectSection>
                  ))}
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
                className={cn(
                  `${isCategorySelect && isTransactionWithChangedCategory ? `animate-blink-${(theme as TTheme) === 'system' ? 'light' : theme}-once` : ''} cursor-pointer bg-background px-0`,
                )}
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
