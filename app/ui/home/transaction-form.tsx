'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { PiCamera, PiCameraFill } from 'react-icons/pi'
import { useDebounce } from 'react-use'
import type { UseDebounceReturn } from 'react-use/lib/useDebounce'

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
} from '@heroui/react'
import Compressor from 'compressorjs'
import heic2any from 'heic2any'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import {
  DEFAULT_CATEGORY,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_SIGN,
  DEFAULT_ICON_SIZE,
  IS_PROD,
} from '@/config/constants/main'
import { TOAST_DURATION } from '@/config/constants/toast'

import {
  getAnalyzedReceiptAI,
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
  isLocalStorageAvailable,
} from '../../lib/helpers'
import type { TReceipt, TTransaction } from '../../lib/types'
import AILogo from '../ai-logo'
import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import LimitToast from '../limit-toast'

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
  // Receipt AI-related state
  const [receiptAIData, setReceiptAIData] = useState<
    {
      description: TReceipt['description']
      amount: TTransaction['amount']
    }[]
  >([])
  const [currReceiptAIDataIdx, setCurrReceiptAIDataIdx] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasReceiptAIData = receiptAIData.length > 0
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
      findApproxCategoryByValue(trimmedDescription, userCategories)?.item.name,
    [trimmedDescription, userCategories],
  )
  const isCategoryItemNameAIValid = useMemo(
    () => getCategoryItemNames(userCategories).includes(categoryItemNameAI),
    [categoryItemNameAI, userCategories],
  )
  const categoryItemName = useMemo(() => {
    if (isCategoryItemNameAIValid) return categoryItemNameAI
    if (approxCategoryItemName) return approxCategoryItemName

    return DEFAULT_CATEGORY
  }, [isCategoryItemNameAIValid, categoryItemNameAI, approxCategoryItemName])
  const newCategoryState = useMemo(
    () => new Set([categoryItemName]),
    [categoryItemName],
  )
  const [category, setCategory] = useState<Selection>(newCategoryState)
  // Synchronize category state with derived value
  useEffect(() => setCategory(newCategoryState), [newCategoryState])

  const categoryName = Array.from(category)[0]?.toString()
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      if (categoryName && categoryName !== DEFAULT_CATEGORY) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY.SELECTED_CATEGORY_NAME,
          categoryName,
        )
      }
    }

    return () =>
      localStorage.removeItem(LOCAL_STORAGE_KEY.SELECTED_CATEGORY_NAME)
  }, [categoryName])

  const resetAllStates = useCallback(() => {
    setIsSwitchedOn(false)
    // setIsExpanded(false)
    setAmount('')
    setDescription('')
    setIsLoadingAIData(false)
    setIsAmountAIValid(false)
    setIsTransactionTypeAIValid(false)
    setCategoryItemNameAI('')
    setCategory(new Set([DEFAULT_CATEGORY]))
    setReceiptAIData([])
  }, [])

  const resetAIRelatedStates = useCallback(() => {
    setIsAmountAIValid(false)
    setIsTransactionTypeAIValid(false)
    setIsSwitchedOn(false)
    if (!hasReceiptAIData) setAmount('')
    setCategoryItemNameAI('')
  }, [hasReceiptAIData])

  const getReceiptAIData = async (compressedFile: File) => {
    try {
      const res = await toast.promise(getAnalyzedReceiptAI(compressedFile), {
        loading: 'Analyzing receipt...',
        success: 'Receipt successfully analyzed.',
        error: 'Failed to analyze receipt.',
      })
      const parsedRes: TReceipt[] = JSON.parse(res)
      const modifiedText = parsedRes.map((item) => ({
        ...item,
        amount: getFormattedCurrency(Math.round(item.amount), false),
      }))

      setReceiptAIData(modifiedText)
      if (modifiedText.length > 0) {
        setDescription(modifiedText[0].description)
        setAmount(modifiedText[0].amount)
      } else {
        setTimeout(() => {
          toast.error('Not a valid receipt.')
        }, TOAST_DURATION)
      }
    } catch (err) {
      throw err
    }
  }

  const onUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = e.target.files?.[0]
    if (!targetFile || !(targetFile instanceof File)) return

    try {
      let processedFile: File | Blob = targetFile

      // Convert HEIC to jpeg
      if (targetFile.type === 'image/heic') {
        const convertedBlob = await toast.promise(
          heic2any({
            blob: targetFile,
            toType: 'image/jpeg',
          }),
          {
            loading: 'Converting receipt...',
            success: 'Receipt converted successfully.',
            error: 'Failed to convert receipt.',
          },
        )

        processedFile = new File(
          [convertedBlob as Blob],
          targetFile.name.replace(/\.\w+$/, '.jpg'),
          { type: 'image/jpeg' },
        )
      }

      // Compress
      new Compressor(processedFile, {
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        convertSize: 1000000,
        checkOrientation: false,
        success: (compressedFile: File) => {
          getReceiptAIData(compressedFile)
        },
        error: (err) => {
          throw err
        },
      })
    } catch (err) {
      throw err
    }
  }

  const onSubmitReceiptTransaction = useCallback(() => {
    const nextIndex = currReceiptAIDataIdx + 1
    if (nextIndex < receiptAIData.length) {
      toast.success(`${nextIndex}/${receiptAIData.length} transactions added.`)

      setCurrReceiptAIDataIdx(nextIndex)
      setDescription(receiptAIData[nextIndex].description)
      setAmount(receiptAIData[nextIndex].amount)
    } else {
      toast.success(
        `${receiptAIData.length}/${receiptAIData.length} transactions added.`,
      )
      setTimeout(() => {
        toast.success('All transactions added.')
      }, TOAST_DURATION)
      resetAllStates()
    }
  }, [currReceiptAIDataIdx, receiptAIData, resetAllStates])

  const getCompletionAIData = useCallback(
    async (
      categories: TTransaction['categories'],
      userPrompt: string,
    ): Promise<UseDebounceReturn | undefined> => {
      if (!trimmedDescription) {
        resetAIRelatedStates()

        return [() => null, () => undefined]
      }

      setIsLoadingAIData(true)
      resetAIRelatedStates()

      try {
        const [categoryItemNameAI, amountAI, transactionTypeAI] =
          await Promise.all([
            getCachedCategoryItemAI(categories, userPrompt),
            !hasReceiptAIData
              ? getCachedAmountAI(
                  currency?.code || DEFAULT_CURRENCY_CODE,
                  userPrompt,
                )
              : Promise.resolve(''),
            getCachedTransactionTypeAI(userPrompt),
          ])

        setCategoryItemNameAI(categoryItemNameAI)
        const rawAmountAI = formatAmount(amountAI)
        if (
          !isNaN(Number(rawAmountAI)) &&
          rawAmountAI.length <= AMOUNT_LENGTH &&
          !hasReceiptAIData
        ) {
          setAmount(getFormattedCurrency(rawAmountAI, false))
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
    },
    [
      currency?.code,
      hasReceiptAIData,
      resetAIRelatedStates,
      trimmedDescription,
    ],
  )
  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(
    () =>
      // In dev mode, we may get an error or bug like the one below with an empty category after successfully analyzing the receipt.
      // Error: Transaction validation failed: category: Path `category` is required.
      IS_PROD
        ? getCompletionAIData(
            userCategories,
            capitalizeFirstLetter(trimmedDescription),
          )
        : [() => null, () => undefined],
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
      setAmount(getFormattedCurrency(rawAmount, false))
    }
  }

  const onExpandedChange = () => {
    setIsExpanded((prev) => !prev)
  }

  useEffect(() => {
    if (pending) {
      // Abort useDebounce after form submit.
      cancel()
      if (hasReceiptAIData) {
        return onSubmitReceiptTransaction()
      }
      resetAllStates()

      // The idea is to show toast after async form action.
      setTimeout(() => toast.success('Transaction added.'), 0)
    }
  }, [
    cancel,
    onSubmitReceiptTransaction,
    hasReceiptAIData,
    pending,
    resetAllStates,
  ])

  const accordionTitle = isExpanded
    ? `Hide ${ACCORDION_ITEM_KEY}`
    : `Show ${ACCORDION_ITEM_KEY}`

  return (
    <>
      <LimitToast triggerBy={categoryName} />
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
              isDisabled={pending || isLoadingAIData}
              isSelected={isSwitchedOn}
              color='success'
              name='isIncome'
              value='isIncome'
              aria-label='Income switch'
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
              <div className='flex flex-wrap items-center gap-1'>
                <div className='flex'>
                  <AILogo asText={isAnyAIDataExist && !isLoadingAIData} />
                </div>
                <InfoText
                  text='fills in the remaining fields.'
                  withAsterisk={false}
                />
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
            startContent={
              <>
                <input
                  type='file'
                  accept='image/*, .heic'
                  onChange={onUploadReceipt}
                  className='hidden'
                  ref={fileInputRef}
                />
                <Button
                  isIconOnly
                  onPress={() => fileInputRef.current?.click()}
                  className='bg-transparent'
                >
                  <HoverableElement
                    uKey='camera'
                    element={<PiCamera size={DEFAULT_ICON_SIZE} />}
                    hoveredElement={<PiCameraFill size={DEFAULT_ICON_SIZE} />}
                    withShift={false}
                  />
                </Button>
              </>
            }
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
                    isDisabled={pending || isLoadingAIData}
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
                        'border-none focus:ring-0 placeholder:text-default-500 mt-0.5 text-default-500 text-center',
                      inputWrapper: 'h-12 w-full pl-3 md:px-4',
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
                    isVirtualized={false}
                    isDisabled={pending || isLoadingAIData}
                    isLoading={isLoadingAIData}
                    items={userCategories}
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
                    {userCategories.map((category, idx, arr) => (
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
                    !amount || amount === '0' || pending || isLoadingAIData
                  }
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
    </>
  )
}

export default TransactionForm
