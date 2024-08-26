'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { useDebounce } from 'react-use'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import {
  Accordion,
  AccordionItem,
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

import {
  DEFAULT_CATEGORY,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_SIGN,
  IS_PROD,
} from '@/config/constants/main'

import {
  getCachedAmountAI,
  getCachedCategoryItemAI,
  getCachedTransactionTypeAI,
} from '@/app/lib/actions'

import {
  capitalizeFirstLetter,
  cn,
  findApproxCategoryByValue,
  formatAmount,
  getCategoryItemNames,
  getFormattedCurrency,
} from '../../lib/helpers'
import type { TTransaction } from '../../lib/types'
import AILogo from '../ai-logo'
import InfoText from '../info-text'

const ACCORDION_ITEM_KEY = 'Form'
const AMOUNT_LENGTH = 6

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
  // AI-related states
  const [isLoadingAIData, setIsLoadingAIData] = useState(false)
  const [isAmountAIValid, setIsAmountAIValid] = useState(false)
  const [isTransactionTypeAIValid, setIsTransactionTypeAIValid] =
    useState(false)
  const [categoryItemNameAI, setCategoryItemNameAI] = useState('')
  const isAnyAIDataExist =
    isAmountAIValid || isTransactionTypeAIValid || Boolean(categoryItemNameAI)
  const trimmedDescription = description.trim()
  // Memoized values
  const approxCategoryItemName = useMemo(
    () =>
      findApproxCategoryByValue(
        trimmedDescription,
        userCategories || DEFAULT_CATEGORIES,
      )?.item.name,
    [trimmedDescription, userCategories],
  )
  const isCategoryItemNameAIValid = useMemo(
    () =>
      getCategoryItemNames(userCategories || DEFAULT_CATEGORIES).includes(
        categoryItemNameAI,
      ),
    [categoryItemNameAI, userCategories],
  )
  const categoryItemName = isCategoryItemNameAIValid
    ? categoryItemNameAI
    : approxCategoryItemName
      ? approxCategoryItemName
      : DEFAULT_CATEGORY

  const newCategoryState = useMemo(
    () => new Set([categoryItemName]),
    [categoryItemName],
  )
  const [category, setCategory] = useState<Selection>(newCategoryState)
  // Synchronize category state with derived value
  useEffect(() => setCategory(newCategoryState), [newCategoryState])

  const resetAllStates = () => {
    setIsSwitchedOn(false)
    setIsExpanded(false)
    setAmount('')
    setDescription('')
    setIsLoadingAIData(false)
    setIsAmountAIValid(false)
    setIsTransactionTypeAIValid(false)
    setCategoryItemNameAI('')
    setCategory(new Set([DEFAULT_CATEGORY]))
  }

  const resetAIRelatedStates = () => {
    setIsAmountAIValid(false)
    setIsTransactionTypeAIValid(false)
    setIsSwitchedOn(false)
    setAmount('')
    setCategoryItemNameAI('')
  }

  const getCompletionAIData = async (
    categories: TTransaction['categories'],
    userPrompt: string,
  ) => {
    if (!trimmedDescription) {
      resetAIRelatedStates()
      return
    }
    setIsLoadingAIData(true)
    resetAIRelatedStates()

    try {
      const [categoryItemNameAI, amountAI, transactionTypeAI] =
        await Promise.all([
          getCachedCategoryItemAI(categories, userPrompt),
          getCachedAmountAI(
            currency?.code || DEFAULT_CURRENCY_CODE,
            userPrompt,
          ),
          getCachedTransactionTypeAI(userPrompt),
        ])

      setCategoryItemNameAI(categoryItemNameAI)
      const rawAmountAI = formatAmount(amountAI)
      if (!isNaN(Number(rawAmountAI)) && rawAmountAI.length <= AMOUNT_LENGTH) {
        setAmount(getFormattedCurrency(rawAmountAI))
        setIsAmountAIValid(true)
      }
      if (transactionTypeAI === 'true') {
        setIsSwitchedOn(true)
        setIsTransactionTypeAIValid(true)
      }
    } catch (err) {
      resetAIRelatedStates()
      throw err
    } finally {
      setIsLoadingAIData(false)
    }
  }
  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(
    () =>
      IS_PROD
        ? getCompletionAIData(
            userCategories || DEFAULT_CATEGORIES,
            capitalizeFirstLetter(trimmedDescription),
          )
        : [null, undefined],
    1000,
    [trimmedDescription],
  )
  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

  const isInitialExpanded = isExpanded ? [ACCORDION_ITEM_KEY] : ['']

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawAmount = formatAmount(e.target.value)
    if (!isNaN(Number(rawAmount)) && rawAmount.length <= AMOUNT_LENGTH) {
      setAmount(getFormattedCurrency(rawAmount))
    }
  }

  const onExpandedChange = () => {
    setIsExpanded((prev) => !prev)
  }

  useEffect(() => {
    if (pending) {
      // Abort useDebounce after form submit.
      cancel()
      resetAllStates()
      // The idea is to show toast after async form action.
      setTimeout(() => toast.success('Transaction added.'), 0)
    }
  }, [cancel, pending])

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
        <Badge
          isInvisible={!isTransactionTypeAIValid || isLoadingAIData}
          content={<AILogo asIcon />}
          classNames={{
            badge:
              'right-0 border-0 bg-transparent cursor-pointer md:hover:opacity-hover',
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
        </Badge>
        <Input
          isDisabled={pending}
          isRequired
          autoComplete='off'
          type='text'
          name='description'
          aria-label='Description'
          description={
            <div className='flex flex-wrap items-center xxs:gap-0 xs:gap-1'>
              <InfoText
                text='Type thoughtfully to complete the remaining fields with'
                withAsterisk={false}
              />
              <div className='flex'>
                <AILogo asText={isAnyAIDataExist && !isLoadingAIData} />.
              </div>
            </div>
          }
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
            <div className='w-[154px] md:w-36'>
              <Badge
                isInvisible={!isAmountAIValid || isLoadingAIData}
                content={<AILogo asIcon />}
                classNames={{
                  badge:
                    'right-0 border-0 bg-transparent cursor-pointer md:hover:opacity-hover',
                }}
              >
                <Input
                  isRequired
                  autoComplete='off'
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
              </Badge>
            </div>
          }
        />
        <div className='flex justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex w-full flex-wrap gap-4 md:flex-nowrap'>
              <Badge
                isInvisible={!isCategoryItemNameAIValid || isLoadingAIData}
                content={<AILogo asIcon />}
                classNames={{
                  badge:
                    'right-0 border-0 bg-transparent cursor-pointer md:hover:opacity-hover',
                }}
              >
                <Select
                  isDisabled={pending}
                  isLoading={isLoadingAIData}
                  items={userCategories || DEFAULT_CATEGORIES}
                  defaultSelectedKeys={[DEFAULT_CATEGORY]}
                  selectedKeys={category}
                  onSelectionChange={setCategory}
                  name='category'
                  label='Select a category'
                  className='w-56'
                  classNames={{
                    trigger:
                      'h-12 min-h-12 py-1.5 px-3 md:h-14 md:min-h-14 md:py-2',
                  }}
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
