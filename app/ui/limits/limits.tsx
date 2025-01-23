'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
  PiDotsThreeOutlineVerticalFill,
  PiNotePencil,
  PiNotePencilFill,
  PiPlusCircle,
  PiPlusCircleFill,
  PiTrash,
  PiTrashFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Selection,
  SelectItem,
  SelectSection,
  useDisclosure,
} from '@heroui/react'

import {
  DEFAULT_CATEGORY,
  DEFAULT_CATEGORY_EMOJI,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'

import {
  addCategoryLimit,
  deleteCategoryLimit,
  editCategoryLimit,
} from '@/app/lib/actions'
import {
  calculateTotalsByCategory,
  filterTransactions,
  getTransactionsByCurrMonth,
} from '@/app/lib/data'
import {
  cn,
  formatAmount,
  getCategoryItemNames,
  getCategoryWithEmoji,
  getEmojiFromCategory,
  getFormattedCurrency,
} from '@/app/lib/helpers'
import type { TCategoryLimits, TTransaction, TUserId } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import NoTransactionsPlug from '../no-transactions-plug'
import AmountInput from './amount-input'

const enum DROPDOWN_KEY {
  EDIT = 'edit',
  DELETE = 'delete',
}

const AMOUNT_LENGTH = 6

type TProps = {
  userId: TUserId
  currency: TTransaction['currency']
  transactions: TTransaction[]
  userCategories: TTransaction['categories']
}

function Limits({ userId, currency, transactions, userCategories }: TProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const {
    isOpen: isOpenReset,
    onOpen: onOpenReset,
    onOpenChange: onOpenChangeReset,
  } = useDisclosure()
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure()
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onOpenChange: onOpenChangeEdit,
  } = useDisclosure()
  const [category, setCategory] = useState<Selection>(new Set([]))
  const [amount, setAmount] = useState('')
  const [tempCategoryName, setTempCategoryName] = useState<string | null>(null)
  const [tempLimitAmount, setTempLimitAmount] = useState<string | null>(null)
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [isLoadingReset, setIsLoadingReset] = useState(false)
  const [isLoadingAddLimit, setIsLoadingAddLimit] = useState(false)

  // useMemo hooks
  const transactionsByCurrMonth = useMemo(
    () => getTransactionsByCurrMonth(transactions),
    [transactions],
  )
  if (transactionsByCurrMonth.length === 0) {
    return (
      <>
        <NoTransactionsPlug />
        <div className='mt-2'>
          <InfoText text='At the current month.' />
        </div>
      </>
    )
  }

  const { expense } = filterTransactions(transactionsByCurrMonth)
  const totalsByCategory = calculateTotalsByCategory(expense, true)

  const [_userLimitsData] = transactionsByCurrMonth
    .map((e) => e.categoryLimits)
    .filter(Boolean)
  const userLimitsData = _userLimitsData || []

  const changedCategoryNames = userLimitsData
    .map((e) => e.categoryName)
    .filter((name) => !getCategoryItemNames(userCategories).includes(name))

  const calculatedLimitsData = userLimitsData.map((data) => {
    const { categoryName, limitAmount: limitValue } = data
    const currentAmount = totalsByCategory[categoryName] || 0
    const limitAmount = parseFloat(formatAmount(limitValue))
    const difference = limitAmount - currentAmount
    const isLimitOver = difference < 0
    const status = isLimitOver
      ? `over by ${getFormattedCurrency(Math.abs(difference))}`
      : `left ${getFormattedCurrency(difference)}`

    return {
      categoryName,
      limitAmount,
      difference,
      status,
      isLimitOver,
    }
  })

  const disabledCategories = [
    ...new Set(
      transactionsByCurrMonth
        .map((t) => t.categoryLimits)
        .filter(Boolean)
        .flatMap((c) => c!.map((k) => k.categoryName)),
    ),
  ]

  const getLimitAmount = (categoryName: string) => {
    const limit = userLimitsData.find((l) => l.categoryName === categoryName)

    return limit ? limit.limitAmount : null
  }

  const categoryName = Array.from(category)[0]?.toString()
  const isAmountInvalid = !amount || amount === '0'
  const isDisabledSubmitBtn = !categoryName || isAmountInvalid
  const isNoUserLimitsData = userLimitsData.length === 0

  const resetStates = () => {
    setCategory(new Set([]))
    setAmount('')
  }

  const onAddLimitByCategory = async (onClose: () => void) => {
    const newLimitData: TCategoryLimits = Object.freeze({
      categoryName,
      limitAmount: amount,
    })
    setIsLoadingAddLimit(true)
    try {
      await addCategoryLimit(userId, [...userLimitsData, newLimitData])
      toast.success('Limit added.')
      resetStates()
    } catch (err) {
      toast.error('Failed to add limit.')
      throw err
    } finally {
      setIsLoadingAddLimit(false)
      onClose()
    }
  }

  const onDeleteCategoryLimit = async (
    categoryName: TCategoryLimits['categoryName'] | null,
    onCloseDeleteCallback: () => void,
  ) => {
    if (!categoryName) {
      toast.error('Invalid category name.')

      return
    }
    setIsLoadingDelete(true)
    try {
      await deleteCategoryLimit(userId, categoryName)
      toast.success('Limit deleted.')
    } catch (err) {
      toast.error('Failed to delete limit.')
      throw err
    } finally {
      setIsLoadingDelete(false)
      onCloseDeleteCallback()
    }
  }

  const onResetLimits = async (onCloseResetCallback: () => void) => {
    setIsLoadingReset(true)
    try {
      await addCategoryLimit(userId, [])
      toast.success('All limits reset.')
    } catch (err) {
      toast.error('Failed to reset limits.')
      throw err
    } finally {
      setIsLoadingReset(false)
      onCloseResetCallback()
    }
  }

  const onEditCategoryLimit = async (
    categoryName: TCategoryLimits['categoryName'] | null,
    limitAmount: TCategoryLimits['limitAmount'] | null,
    onCloseEditCallback: () => void,
  ) => {
    if (!categoryName) {
      toast.error('Invalid category name.')

      return
    }
    if (!limitAmount) {
      toast.error('Invalid limit amount.')

      return
    }
    if (limitAmount === tempLimitAmount) {
      toast.error('Limit amount is the same.')

      return
    }
    setIsLoadingEdit(true)
    try {
      await editCategoryLimit(userId, categoryName, limitAmount)
      toast.success('Limit edited.')
    } catch (err) {
      toast.error('Failed to edit limit.')
      throw err
    } finally {
      setIsLoadingEdit(false)
      onCloseEditCallback()
    }
  }

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawAmount = formatAmount(e.target.value)
    if (!isNaN(Number(rawAmount)) && rawAmount.length <= AMOUNT_LENGTH) {
      setAmount(getFormattedCurrency(rawAmount, false))
    }
  }

  return (
    <div className='rounded-medium bg-content1 p-4 md:p-8'>
      <div className='flex items-center justify-between'>
        <h2>Limits by Category</h2>
        <div className='flex gap-2'>
          <Button
            isDisabled={isNoUserLimitsData}
            onPress={onOpenReset}
            color='danger'
            variant='flat'
            className='min-w-4'
          >
            <HoverableElement
              uKey='reset'
              element={<PiArrowClockwise size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiArrowClockwiseFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />
          </Button>
          <Button
            onPress={onOpen}
            color='primary'
            variant='flat'
            className='min-w-4'
          >
            <HoverableElement
              uKey='add'
              element={<PiPlusCircle size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiPlusCircleFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />
          </Button>
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <PiPlusCircleFill size={DEFAULT_ICON_SIZE} /> Add Limit by
                    Category
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className='flex flex-col gap-4'>
                    <div>
                      <p className='mb-1 text-sm text-default-500'>
                        Category{' '}
                        <span
                          className={cn(
                            'text-danger',
                            categoryName && 'hidden',
                          )}
                        >
                          *
                        </span>
                      </p>
                      <Select
                        isVirtualized={false}
                        isRequired
                        isDisabled={false}
                        name='category'
                        aria-label='Category'
                        placeholder='Select a category'
                        className='w-full'
                        classNames={{
                          trigger:
                            'h-12 min-h-12 py-1.5 px-3 md:h-14 md:min-h-14 md:py-2',
                        }}
                        items={userCategories}
                        selectedKeys={category}
                        onSelectionChange={setCategory}
                        disabledKeys={disabledCategories}
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
                                  disabledCategories.includes(item.name) ? (
                                    <span className='text-xs'>
                                      already added by{' '}
                                      {getLimitAmount(item.name)}{' '}
                                      {currency?.code || DEFAULT_CURRENCY_CODE}
                                    </span>
                                  ) : item.name === DEFAULT_CATEGORY ? (
                                    <InfoText
                                      text='default'
                                      withAsterisk={false}
                                      withHover={false}
                                    />
                                  ) : null
                                }
                              >
                                {`${item.emoji} ${item.name}`}
                              </SelectItem>
                            ))}
                          </SelectSection>
                        ))}
                      </Select>
                    </div>
                    <AmountInput
                      isAmountInvalid={isAmountInvalid}
                      amount={amount}
                      setAmount={setAmount}
                      onChangeAmount={onChangeAmount}
                      AMOUNT_LENGTH={AMOUNT_LENGTH}
                      currency={currency}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color='danger' variant='light' onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color='primary'
                    onPress={() => [onAddLimitByCategory(onClose)]}
                    isLoading={isLoadingAddLimit}
                    isDisabled={isDisabledSubmitBtn}
                  >
                    Add
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      <Divider className='mx-auto my-3 bg-divider md:my-6' />

      {isNoUserLimitsData && (
        <p className='text-center text-default-500'>No Limits Found</p>
      )}

      <ul className='space-y-4'>
        {calculatedLimitsData.map((data) => {
          const { categoryName, difference, limitAmount, status, isLimitOver } =
            data
          const progressPercentage =
            limitAmount > 0
              ? Math.min(
                  100,
                  Math.max(0, ((limitAmount - difference) / limitAmount) * 100),
                )
              : 0
          const isCategoryChangedName =
            changedCategoryNames.includes(categoryName)

          return (
            <li
              key={categoryName}
              className='flex items-center justify-between py-2'
            >
              <div className='flex items-center md:w-1/2'>
                <p className='mt-2 text-2xl md:text-3xl'>
                  {isCategoryChangedName
                    ? DEFAULT_CATEGORY_EMOJI
                    : getEmojiFromCategory(
                        getCategoryWithEmoji(categoryName, userCategories),
                      )}
                </p>
                <div className='-mt-4 ml-4 w-full md:-mt-2.5'>
                  <div className='text-left'>
                    <p
                      className={cn(
                        'truncate text-sm md:text-lg',
                        isCategoryChangedName &&
                          'text-default-500 line-through',
                      )}
                    >
                      {categoryName}
                    </p>
                    {isCategoryChangedName && (
                      <p className='text-xs'>No longer exists</p>
                    )}
                  </div>
                  <div className='absolute mt-1.5 h-[5px] w-[30%] rounded-full bg-content4 md:relative md:mt-2.5 md:w-full'>
                    <div
                      className={cn(
                        'absolute h-[5px] rounded-full bg-content4-foreground',
                        isLimitOver ? 'bg-danger' : 'bg-success',
                      )}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <div className='text-right'>
                  <p className='text-sm md:text-lg'>
                    {getFormattedCurrency(limitAmount)}{' '}
                    {currency?.code || DEFAULT_CURRENCY_CODE}{' '}
                  </p>
                  <p className='text-xs text-default-500 md:text-sm'>
                    {status} {currency?.code || DEFAULT_CURRENCY_CODE}
                  </p>
                </div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant='light'
                      isIconOnly
                      size='md'
                      className='md:size-12'
                    >
                      <PiDotsThreeOutlineVerticalFill className='size-4 fill-foreground' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label='Limit actions'
                    onAction={(key) => {
                      if (key === DROPDOWN_KEY.EDIT) {
                        const prevLimitAmount = getLimitAmount(categoryName)
                        if (prevLimitAmount) {
                          setAmount(prevLimitAmount)
                          setTempLimitAmount(prevLimitAmount)
                        }
                        setTempCategoryName(categoryName)
                        onOpenEdit()
                      }
                      if (key === DROPDOWN_KEY.DELETE) {
                        setTempCategoryName(categoryName)
                        onOpenDelete()
                      }
                    }}
                  >
                    <DropdownSection title='Actions' showDivider>
                      <DropdownItem
                        key={DROPDOWN_KEY.EDIT}
                        startContent={
                          <HoverableElement
                            uKey={DROPDOWN_KEY.EDIT}
                            element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
                            hoveredElement={
                              <PiNotePencilFill size={DEFAULT_ICON_SIZE} />
                            }
                          />
                        }
                        description='Edit category limit'
                      >
                        Edit
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title='Danger zone'>
                      <DropdownItem
                        key={DROPDOWN_KEY.DELETE}
                        className='text-danger'
                        color='danger'
                        startContent={
                          <HoverableElement
                            uKey={DROPDOWN_KEY.DELETE}
                            element={<PiTrash size={DEFAULT_ICON_SIZE} />}
                            hoveredElement={
                              <PiTrashFill size={DEFAULT_ICON_SIZE} />
                            }
                          />
                        }
                        description='Permanently delete category limit'
                      >
                        Delete
                      </DropdownItem>
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </li>
          )
        })}
      </ul>
      <div className='mt-4 flex flex-col gap-2 text-left md:mt-8'>
        <InfoText
          withDoubleAsterisk
          text='The calculation of limits is based on transactions by the current month.'
        />
        <InfoText text='Your limits will not be deleted automatically in the new month.' />
      </div>

      {/* Reset user category limits modal */}
      <Modal
        isOpen={isOpenReset}
        onOpenChange={onOpenChangeReset}
        onClose={() => setAmount('')}
      >
        <ModalContent>
          {(onCloseReset) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} /> Reset limits
                </div>
              </ModalHeader>
              <ModalBody>
                <p className='text-default-500'>
                  Are you sure you want to{' '}
                  <span className='text-foreground'>
                    reset all your category limits
                  </span>
                  ? This action is irreversible.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={() => [onCloseReset()]}>
                  Close
                </Button>
                <Button
                  color='danger'
                  isLoading={isLoadingReset}
                  onPress={() => [onResetLimits(onCloseReset)]}
                >
                  Reset
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit category limits modal */}
      <Modal
        isOpen={isOpenEdit}
        onOpenChange={onOpenChangeEdit}
        onClose={() => setAmount('')}
      >
        <ModalContent>
          {(onCloseEdit) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiNotePencilFill size={DEFAULT_ICON_SIZE} /> Edit limit
                </div>
              </ModalHeader>
              <ModalBody>
                <AmountInput
                  isAmountInvalid={isAmountInvalid}
                  amount={amount}
                  setAmount={setAmount}
                  onChangeAmount={onChangeAmount}
                  AMOUNT_LENGTH={AMOUNT_LENGTH}
                  currency={currency}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={() => [onCloseEdit()]}>
                  Close
                </Button>
                <Button
                  color='danger'
                  isLoading={isLoadingEdit}
                  isDisabled={isAmountInvalid}
                  onPress={() => [
                    onEditCategoryLimit(
                      categoryName || tempCategoryName,
                      amount,
                      onCloseEdit,
                    ),
                  ]}
                >
                  Edit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete category limits modal */}
      <Modal isOpen={isOpenDelete} onOpenChange={onOpenChangeDelete}>
        <ModalContent>
          {(onCloseDelete) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} /> Delete limit
                </div>
              </ModalHeader>
              <ModalBody>
                <p className='overflow-hidden text-ellipsis text-default-500'>
                  Are you sure you want to delete the{' '}
                  <span className='text-foreground'>{tempCategoryName}</span>{' '}
                  category limit? This action is permanent and cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={() => [onCloseDelete()]}>
                  Close
                </Button>
                <Button
                  color='danger'
                  isLoading={isLoadingDelete}
                  onPress={() => [
                    onDeleteCategoryLimit(
                      categoryName || tempCategoryName,
                      onCloseDelete,
                    ),
                  ]}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Limits
