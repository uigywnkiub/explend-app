'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Kbd,
  Select,
  Selection,
  SelectItem,
  SelectSection,
  Switch,
} from '@nextui-org/react'

import {
  DEFAULT_CATEGORY,
  DEFAULT_CURRENCY_SIGN,
} from '@/config/constants/main'

import type { TTransaction } from '../../lib/types'
import {
  cn,
  findApproxCategoryByValue,
  getFormattedCurrency,
  toLowerCase,
} from '../../lib/utils'

const ACCORDION_ITEM_KEY = 'Form'
const AMOUNT_LENGTH = 6
const AUTO_SWITCH_INCOME_STR = 'salary'

type TProps = {
  currency: TTransaction['currency']
  userCategories: TTransaction['categories']
}

function TransactionForm({ currency, userCategories }: TProps) {
  const { pending } = useFormStatus()
  const [isSwitchedOn, setIsSwitchedOn] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const approxCategory = useMemo(
    () =>
      findApproxCategoryByValue(
        description,
        userCategories || DEFAULT_CATEGORIES,
      ),
    [description, userCategories],
  )
  const newCategoryState = useMemo(
    () =>
      new Set([
        approxCategory?.item.name
          ? approxCategory?.item.name
          : DEFAULT_CATEGORY,
      ]),
    [approxCategory?.item.name],
  )
  const [category, setCategory] = useState<Selection>(newCategoryState)
  useEffect(() => setCategory(newCategoryState), [newCategoryState])
  const isSalary = useMemo(
    () => toLowerCase(description).includes(AUTO_SWITCH_INCOME_STR),
    [description],
  )
  useEffect(() => setIsSwitchedOn(isSalary), [isSalary])

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
  }

  useEffect(() => {
    if (pending) {
      // The idea is to show toast after async form action
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
          isSelected={isSwitchedOn}
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
              type='text'
              name='amount'
              aria-label='Amount'
              value={amount}
              onChange={onChangeAmount}
              required
              onBlur={() => parseFloat(amount) === 0 && setAmount('')}
              maxLength={AMOUNT_LENGTH + 1}
              // pattern='\d+'
              pattern='[\d\s,]+'
              inputMode='decimal'
              placeholder='0'
              size='lg'
              classNames={{
                input:
                  'border-none focus:ring-0 placeholder:text-default-500 text-default-500 text-center',
                inputWrapper: 'h-12 w-full pl-3 md:px-4',
                base: 'w-[154px] md:w-36',
              }}
              endContent={
                <div className='pointer-events-none mt-[3px] flex items-center'>
                  <span
                    className={cn(
                      'text-md text-lg',
                      parseFloat(amount) >= 1
                        ? 'text-foreground'
                        : 'text-default-500',
                    )}
                  >
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
                classNames={{
                  trigger:
                    'h-12 min-h-12 py-1.5 px-3 md:h-14 md:min-h-14 md:py-2',
                }}
                items={userCategories || DEFAULT_CATEGORIES}
                defaultSelectedKeys={[DEFAULT_CATEGORY]}
                selectedKeys={category}
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
            </div>
          </div>
          <div className='flex items-center'>
            <p className='text-sm text-default-500'>
              <span className='hidden md:inline'>Press </span>
              <span className='inline md:hidden'>Tap </span>
              <Button
                aria-label='Enter'
                type='submit'
                isDisabled={!amount || amount === '0' || pending}
                className='cursor-pointer bg-background px-0'
                size='sm'
              >
                <Kbd keys={['enter']}>Enter</Kbd>
              </Button>
              <span className='hidden md:inline'> to Add Transaction</span>
            </p>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  )
}

export default TransactionForm
