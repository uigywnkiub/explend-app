'use client'

import { useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'

import categories from '@/public/data/categories.json'
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Kbd,
  Select,
  SelectItem,
  SelectSection,
  Switch,
} from '@nextui-org/react'

import {
  DEFAULT_CATEGORY,
  DEFAULT_CURRENCY_SIGN,
} from '@/config/constants/main'

import type { TTransaction } from '../lib/types'
import { getFormattedCurrency } from '../lib/utils'

const ACCORDION_ITEM_KEY = 'Form'
const AMOUNT_LENGTH = 6

type TProps = {
  currency: TTransaction['currency']
}

function TransactionForm({ currency }: TProps) {
  const { pending } = useFormStatus()
  const [isSwitchedOn, setIsSwitchedOn] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [amount, setAmount] = useState('')

  const isInitialExpanded = isExpanded ? [ACCORDION_ITEM_KEY] : ['']

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

  const onExpandedChange = () => {
    setIsExpanded((prev) => !prev)
    setIsSwitchedOn(false)
    setAmount('')
  }

  useEffect(() => {
    if (pending) {
      // the idea is to show toast after async form action
      setTimeout(() => toast.success('Transaction added.'), 0)
    }
  }, [pending])

  const accordionTitle = isExpanded
    ? `Hide ${ACCORDION_ITEM_KEY}`
    : `Show ${ACCORDION_ITEM_KEY}`

  return (
    <Accordion
      isCompact
      hideIndicator
      onExpandedChange={onExpandedChange}
      defaultExpandedKeys={isInitialExpanded}
      className='p-0'
    >
      <AccordionItem
        key={ACCORDION_ITEM_KEY}
        isCompact
        aria-label={accordionTitle}
        title={accordionTitle}
        classNames={{
          title: 'text-center hover:opacity-hover',
        }}
      >
        <Switch
          isDisabled={pending}
          color='success'
          name='isIncome'
          value='isIncome'
          aria-label='Income Switch'
          onValueChange={(isSelected) => setIsSwitchedOn(isSelected)}
        >
          Income
        </Switch>
        <Input
          isDisabled={pending}
          isRequired
          type='text'
          name='description'
          aria-label='Description'
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
                    {currency?.sign || DEFAULT_CURRENCY_SIGN}
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
                isDisabled={pending}
                name='category'
                label='Select a category'
                className='w-56'
                items={categories}
                defaultSelectedKeys={[DEFAULT_CATEGORY]}
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
              Press{' '}
              <Button
                aria-label='Enter'
                type='submit'
                isDisabled={!amount || amount === '0' || pending}
                className='cursor-pointer bg-background px-0'
                size='sm'
              >
                <Kbd keys={['enter']}>Enter</Kbd>
              </Button>{' '}
              to Add Transaction
            </p>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  )
}

export default TransactionForm
