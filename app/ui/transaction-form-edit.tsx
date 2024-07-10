'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'

import categories from '@/public/data/categories.json'
import {
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
import { ROUTE } from '@/config/constants/routes'

import { editTransactionById } from '../lib/actions'
import type { TTransaction } from '../lib/types'
import {
  capitalizeFirstLetter,
  getCategoryWithEmoji,
  getCategoryWithoutEmoji,
  getFormattedCurrency,
} from '../lib/utils'
import Loading from '../loading'

const AMOUNT_LENGTH = 6

type TProps = {
  transaction: TTransaction
}

function TransactionFormEdit({ transaction }: TProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchedOn, setIsSwitchedOn] = useState(transaction.isIncome)
  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(getFormattedCurrency(transaction.amount))
  const [category, setCategory] = useState<Selection>(
    new Set([getCategoryWithoutEmoji(transaction.category)]),
  )
  const categoryWithEmoji = getCategoryWithEmoji(
    Array.from(category)[0]?.toString(),
  )
  const currency = transaction.currency
  const isEdited = transaction.isEdited
  const transactionId = transaction.id

  const onChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

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
      router.push(ROUTE.HOME)
      toast.success('Transaction edited.')
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
        onChange={onChangeDescription}
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
              base: 'w-36',
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
            <Select
              isDisabled={isLoading}
              name='category'
              label='Select a category'
              className='w-56'
              items={categories}
              selectedKeys={category}
              defaultSelectedKeys={category}
              onSelectionChange={setCategory}
            >
              {categories.map((category, idx, arr) => (
                <SelectSection
                  key={category.target}
                  showDivider={idx !== arr.length - 1}
                  title={category.target}
                >
                  {category.items.map((item) => (
                    <SelectItem key={item.name}>
                      {`${item.emoji} ${item.name}`}
                    </SelectItem>
                  ))}
                </SelectSection>
              ))}
            </Select>
          </div>
        </div>
        <div className='flex items-center'>
          <p className='text-sm text-default-500'>
            <span className='hidden md:inline'>Press </span>
            <span className='inline md:hidden'>Tap </span>
            <Button
              aria-label='Enter'
              type='submit'
              isDisabled={!amount || amount === '0' || isLoading}
              className='cursor-pointer bg-background px-0'
              size='sm'
            >
              <Kbd keys={['enter']}>Enter</Kbd>
            </Button>
            <span className='hidden md:inline'> to Add Transaction</span>
          </p>
        </div>
      </div>
    </form>
  )
}

export default TransactionFormEdit
