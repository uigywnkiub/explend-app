'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PiImageFill, PiReadCvLogoFill, PiXCircleFill } from 'react-icons/pi'

import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

import {
  Badge,
  Button,
  Card,
  CardBody,
  Image,
  Input,
  Kbd,
  Select,
  Selection,
  SelectItem,
  SelectSection,
  Switch,
  Tab,
  Tabs,
} from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_CATEGORY, DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { MOTION_LIST } from '@/config/constants/motion'
import { URL_REGEXP } from '@/config/constants/regexp'

import { editTransactionById } from '../lib/actions'
import { getTransactionsWithChangedCategory } from '../lib/data'
import {
  AMOUNT_LENGTH,
  capitalizeFirstLetter,
  cn,
  filterStrArrayByRegExp,
  getCategoryWithEmoji,
  getCategoryWithoutEmoji,
  getFormattedAmountState,
  getFormattedCurrency,
  removeFromLocalStorage,
  setInLocalStorage,
  uniqueArray,
} from '../lib/helpers'
import type { TTheme, TTransaction } from '../lib/types'
import Loading from '../loading'
import InfoText from './info-text'
import LimitToast from './limit-toast'

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
  const transactionImages = transaction.images || []
  const initTransactionImagesState = Array.from(
    { length: Math.min(Math.max(transactionImages.length + 1, 3), 5) }, // At least 3, at most 5.
    (_, i) => transactionImages[i] || '',
  )
  const [imageSrcs, setImageSrcs] = useState<
    NonNullable<TTransaction['images']>
  >(initTransactionImagesState)
  const validImageSrcs = uniqueArray(
    filterStrArrayByRegExp(imageSrcs, URL_REGEXP),
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
    getFormattedAmountState(e, setAmount)
  }

  const hasChanges = (
    newData: Partial<TTransaction>,
    oldData: TTransaction,
  ): boolean => {
    const modifiedOldData: TTransaction = {
      ...oldData,
      amount: getFormattedCurrency(oldData.amount, false),
    }

    const transactionChanged = Object.keys(newData).some((key) => {
      if (key === 'images') return false // Handled separately.

      const newKey = key as keyof typeof newData

      return (
        newData[newKey] !== undefined &&
        newData[newKey] !== modifiedOldData[newKey as keyof TTransaction]
      )
    })

    const imagesChanged = (() => {
      if (!newData.images) return false
      const oldImages = oldData.images ?? []
      if (newData.images.length !== oldImages.length) return true

      // Compare element by element.
      return newData.images.some((img, i) => img !== oldImages[i])
    })()

    return transactionChanged || imagesChanged
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const newTransactionData: Pick<
      TTransaction,
      | 'isIncome'
      | 'isEdited'
      | 'description'
      | 'amount'
      | 'category'
      | 'currency'
      | 'images'
    > = {
      isIncome: isSwitchedOn,
      isEdited,
      description: capitalizeFirstLetter(description),
      amount,
      category: categoryWithEmoji,
      currency,
      images: validImageSrcs,
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

  const onImageChange = (index: number, value: string) => {
    const updated = [...imageSrcs]
    updated[index] = value
    // Remove trailing empty inputs beyond 3
    while (updated.length > 3 && updated[updated.length - 1].trim() === '') {
      updated.pop()
    }
    // If first 3 inputs are filled, add one more (up to 5)
    const firstThreeFilled = updated.slice(0, 3).every((v) => v.trim() !== '')
    if (firstThreeFilled && updated.length < 5) {
      updated.push('')
    }
    setImageSrcs(updated)
  }

  const onDeleteImage = (idx: number) => {
    setImageSrcs((prev) => {
      const newImages = [...prev]
      newImages.splice(idx, 1)
      newImages.push('')

      return newImages
    })
  }

  const onResetImages = () => setImageSrcs([...initTransactionImagesState])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <LimitToast triggerBy={categoryName} />
      <Tabs fullWidth className='mb-4'>
        <Tab
          key='transaction'
          title={
            <div className='flex items-center space-x-2'>
              <PiReadCvLogoFill />
              <span>Transaction</span>
            </div>
          }
        >
          <Card shadow='none' className='bg-transparent'>
            <CardBody>
              <form onSubmit={onSubmit}>
                <Switch
                  isDisabled={isLoading}
                  color='success'
                  name='isIncome'
                  aria-label='Income switch'
                  value={isSwitchedOn ? 'true' : 'false'}
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
                  placeholder={
                    isSwitchedOn ? 'Type income...' : 'Type expense...'
                  }
                  classNames={{
                    input:
                      'border-none focus:ring-0 placeholder:text-default-500',
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
                    <p className='text-center text-sm md:text-medium'>
                      <span className='hidden md:inline'>Press </span>
                      <span className='inline md:hidden'>Tap </span>
                      <Button
                        aria-label='Enter'
                        type='submit'
                        isDisabled={
                          !amount ||
                          amount === '0' ||
                          isLoading ||
                          !isCategorySelect
                        }
                        className={cn(
                          `${isCategorySelect && isTransactionWithChangedCategory ? `animate-blink-${(theme as TTheme) === 'system' ? 'light' : theme}-once` : ''} cursor-pointer bg-background px-0`,
                        )}
                        size='sm'
                      >
                        <Kbd keys={['enter']}>Enter</Kbd>
                      </Button>
                      <span className='hidden md:inline'>
                        {' '}
                        to Edit Transaction
                      </span>
                    </p>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key='images'
          title={
            <div className='flex items-center space-x-2'>
              <PiImageFill />
              <span>Images</span>
            </div>
          }
        >
          <Card shadow='none' className='bg-transparent'>
            <CardBody className='flex flex-col gap-4'>
              <AnimatePresence>
                <div className='flex flex-wrap items-center justify-start'>
                  {validImageSrcs.length === 0 && (
                    <p className='text-sm text-default-500'>
                      No images added yet.
                    </p>
                  )}
                  {validImageSrcs.map((img, idx) => (
                    <div key={idx} className='relative m-1 inline-block'>
                      <Image
                        src={img}
                        alt={`Transaction image ${idx + 1}`}
                        className='max-h-20 max-w-20 rounded-medium md:max-h-28 md:max-w-28'
                      />
                      <Button
                        size='sm'
                        isIconOnly
                        onPress={() => onDeleteImage(idx)}
                        className='absolute -right-1 top-0 z-10 size-6 bg-transparent'
                      >
                        <PiXCircleFill
                          size={DEFAULT_ICON_SIZE}
                          className='fill-background'
                        />
                      </Button>
                    </div>
                  ))}
                </div>
                {imageSrcs.map((src, idx) => (
                  <motion.div key={idx} {...MOTION_LIST(idx)}>
                    <Input
                      autoComplete='off'
                      type='text'
                      aria-label='Image URL'
                      label={`Image ${idx + 1}`}
                      value={src}
                      pattern={URL_REGEXP.source}
                      onChange={(e) => onImageChange(idx, e.target.value)}
                      placeholder='Paste image URL'
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                onPress={onResetImages}
                className='mx-auto mt-4'
                variant='flat'
              >
                Reset
              </Button>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
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
