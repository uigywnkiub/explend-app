'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
  PiDotsSixVerticalBold,
  PiDotsThreeOutlineVerticalFill,
  PiNotePencil,
  PiNotePencilFill,
  PiPlus,
  PiPlusFill,
  PiTrash,
  PiTrashFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'
import { useDebounce } from 'react-use'

import Link from 'next/link'

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
  Tooltip,
  useDisclosure,
} from '@heroui/react'
import { AnimatePresence, Reorder, useDragControls } from 'framer-motion'

import {
  DEFAULT_CATEGORY,
  DEFAULT_CATEGORY_EMOJI,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'
import { MOTION_LIST } from '@/config/constants/motion'

import { addLimit, deleteLimit, editLimit } from '@/app/lib/actions'
import {
  calculateTotalsByCategory,
  filterTransactions,
  getTransactionsByCurrMonth,
} from '@/app/lib/data'
import {
  cn,
  createSearchHrefWithKeyword,
  formatAmount,
  getCategoryItemNames,
  getCategoryWithEmoji,
  getEmojiFromCategory,
  getFormattedAmountState,
  getFormattedCurrency,
} from '@/app/lib/helpers'
import type {
  TCalculatedLimits,
  TCategoryLimits,
  TTransaction,
  TUserId,
} from '@/app/lib/types'

import AnimatedNumber from '../animated-number'
import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import AmountInput from './amount-input'

const enum DROPDOWN_KEY {
  EDIT = 'edit',
  DELETE = 'delete',
}

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
  const [isReorderLimitSave, setIsReorderLimitSave] = useState(false)

  const reorderContainer = useRef(null)
  const controls = useDragControls()

  // useMemo hooks
  const transactionsByCurrMonth = useMemo(
    () => getTransactionsByCurrMonth(transactions),
    [transactions],
  )
  const expense = useMemo(() => {
    return filterTransactions(transactionsByCurrMonth).expense
  }, [transactionsByCurrMonth])
  const totalsByCategory = useMemo(() => {
    return calculateTotalsByCategory(expense, true)
  }, [expense])
  const userLimitsData = useMemo(() => {
    const [_userLimitsData] = transactions
      .map((t) => t.categoryLimits)
      .filter(Boolean)

    return _userLimitsData || []
  }, [transactions])

  const changedCategoryNames = userLimitsData
    .map((e) => e.categoryName)
    .filter((name) => !getCategoryItemNames(userCategories).includes(name))

  const calculatedLimitsData: TCalculatedLimits[] = useMemo(() => {
    return userLimitsData.map((data) => {
      const { categoryName, limitAmount: limitValue } = data
      const currentAmount = totalsByCategory[categoryName] || 0
      const limitAmount = parseFloat(formatAmount(limitValue))
      const difference = limitAmount - currentAmount
      const isLimitOver = difference < 0

      return {
        categoryName,
        limitAmount,
        difference,
        isLimitOver,
      }
    })
  }, [userLimitsData, totalsByCategory])
  const [calculatedLimitsDataState, setCalculatedLimitsDataState] =
    useState<TCalculatedLimits[]>(calculatedLimitsData)
  useEffect(() => {
    setCalculatedLimitsDataState(calculatedLimitsData)
  }, [calculatedLimitsData])

  const disabledCategories = [
    ...new Set(
      transactions
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

  const onAddLimit = async (onClose: () => void) => {
    const newLimitData: TCategoryLimits = Object.freeze({
      categoryName,
      limitAmount: amount,
    })
    setIsLoadingAddLimit(true)
    try {
      await addLimit(userId, [...userLimitsData, newLimitData])
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

  const onAddReorderLimit = useCallback(
    async (reorderedData: TCalculatedLimits[]) => {
      const strippedLimitsOrder: TCategoryLimits[] = reorderedData.map(
        ({ categoryName, limitAmount }) => ({
          categoryName,
          limitAmount: getFormattedCurrency(limitAmount),
        }),
      )
      try {
        await addLimit(userId, strippedLimitsOrder)
        setIsReorderLimitSave(false)
        toast.success('Reordered.')
      } catch (err) {
        toast.error('Failed to reorder.')
        throw err
      }
    },
    [userId],
  )

  const onReorderLimit = (
    newCategoryNames: TCategoryLimits['categoryName'][],
  ) => {
    const reorderedLimits = newCategoryNames
      .map((name) =>
        calculatedLimitsDataState.find((item) => item.categoryName === name),
      )
      .filter((item): item is TCalculatedLimits => item !== undefined)

    if (reorderedLimits.length === 0) return

    setCalculatedLimitsDataState(reorderedLimits)
    setIsReorderLimitSave(true)
    // setTimeout(() => onAddReorderLimit(reorderedLimits), 1000)
  }

  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(
    () => isReorderLimitSave && onAddReorderLimit(calculatedLimitsDataState),
    1000,
    [isReorderLimitSave],
  )
  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

  const onDeleteLimit = async (
    categoryName: TCategoryLimits['categoryName'] | null,
    onCloseDeleteCallback: () => void,
  ) => {
    if (!categoryName) {
      toast.error('Invalid category name.')

      return
    }
    setIsLoadingDelete(true)
    try {
      await deleteLimit(userId, categoryName)
      toast.success('Limit deleted.')
    } catch (err) {
      toast.error('Failed to delete limit.')
      throw err
    } finally {
      setIsLoadingDelete(false)
      onCloseDeleteCallback()
    }
  }

  const onResetAllLimits = async (onCloseResetCallback: () => void) => {
    setIsLoadingReset(true)
    try {
      await addLimit(userId, [])
      toast.success('All limits reset.')
    } catch (err) {
      toast.error('Failed to reset limits.')
      throw err
    } finally {
      setIsLoadingReset(false)
      onCloseResetCallback()
    }
  }

  const onEditLimit = async (
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
      await editLimit(userId, categoryName, limitAmount)
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
    getFormattedAmountState(e, setAmount)
  }

  return (
    <div className='rounded-medium bg-content1 p-4 md:p-8'>
      <div className='flex items-center justify-between'>
        <h2>Limits</h2>
        <div className='flex gap-2'>
          <Tooltip content='Reset all limits' placement='bottom'>
            <Button
              isDisabled={isNoUserLimitsData}
              onPress={onOpenReset}
              color='danger'
              variant='flat'
              className='min-w-4 font-medium'
            >
              <HoverableElement
                uKey='reset'
                element={<PiArrowClockwise size={DEFAULT_ICON_SIZE} />}
                hoveredElement={
                  <PiArrowClockwiseFill size={DEFAULT_ICON_SIZE} />
                }
                withShift={false}
              />
            </Button>
          </Tooltip>
          <Tooltip content='Add limit' placement='bottom'>
            <Button
              onPress={onOpen}
              color='primary'
              variant='flat'
              className='min-w-4 font-medium'
            >
              <HoverableElement
                uKey='add'
                element={<PiPlus size={DEFAULT_ICON_SIZE} />}
                hoveredElement={<PiPlusFill size={DEFAULT_ICON_SIZE} />}
                withShift={false}
              />
            </Button>
          </Tooltip>
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <PiPlusFill size={DEFAULT_ICON_SIZE} /> Add limit
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
                            'h-12 min-h-12 py-1.5 px-3 md:h-13 md:min-h-13 md:py-2',
                          innerWrapper: 'pl-1 text-default-500',
                        }}
                        items={userCategories}
                        selectedKeys={category}
                        onSelectionChange={setCategory}
                        disabledKeys={disabledCategories.concat(
                          DEFAULT_CATEGORY,
                        )}
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
                                      added by {getLimitAmount(item.name)}{' '}
                                      {currency.code}
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
                    onPress={() => [onAddLimit(onClose)]}
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

      <Reorder.Group
        axis='y'
        values={calculatedLimitsDataState.map((l) => l.categoryName)}
        onReorder={onReorderLimit}
        ref={reorderContainer}
        className='select-none space-y-4'
      >
        <AnimatePresence>
          {calculatedLimitsDataState.map((data, idx) => {
            const { categoryName, difference, limitAmount, isLimitOver } = data
            const progressPercentage =
              limitAmount > 0
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      ((limitAmount - difference) / limitAmount) * 100,
                    ),
                  )
                : 0
            const isChangedCategoryName =
              changedCategoryNames.includes(categoryName)

            return (
              <Reorder.Item
                key={categoryName}
                value={categoryName}
                dragListener={false}
                dragControls={controls}
                dragConstraints={reorderContainer}
                dragElastic={0.1}
                {...MOTION_LIST(idx)}
                className='relative flex items-center justify-between rounded-medium bg-content1 py-3'
              >
                <div className='flex items-center text-balance md:w-1/2'>
                  <Tooltip content='Drag to reorder' placement='left'>
                    <div
                      onPointerDown={(e) => controls.start(e)}
                      className='mr-2 cursor-grab touch-none'
                    >
                      <PiDotsSixVerticalBold size={DEFAULT_ICON_SIZE} />
                    </div>
                  </Tooltip>
                  <p className='-mb-1.5 text-xl md:text-2xl'>
                    {isChangedCategoryName
                      ? DEFAULT_CATEGORY_EMOJI
                      : getEmojiFromCategory(
                          getCategoryWithEmoji(categoryName, userCategories),
                        )}
                  </p>
                  <div className='mb-2 ml-2 w-full'>
                    <div className='mb-2 text-left'>
                      <Tooltip content='Search by category' placement='top'>
                        <Link
                          href={createSearchHrefWithKeyword(categoryName)}
                          className={cn(
                            '-mt-3 truncate text-balance hover:opacity-hover md:-mt-1.5',
                            isChangedCategoryName &&
                              'text-default-500 line-through',
                          )}
                        >
                          {categoryName}
                        </Link>
                      </Tooltip>
                      {isChangedCategoryName && (
                        <p className='text-xs'>No longer exists</p>
                      )}
                    </div>
                    <Tooltip
                      content={`${progressPercentage}%`}
                      placement='bottom'
                    >
                      <div className='absolute -mt-0.5 h-[5px] w-[30%] rounded-full bg-default md:relative md:w-full'>
                        <div
                          className={cn(
                            'absolute h-[5px] rounded-full',
                            isLimitOver ? 'bg-danger' : 'bg-success',
                          )}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-right'>
                    <p>
                      <AnimatedNumber value={limitAmount} /> {currency.code}
                    </p>
                    <p
                      className={cn(
                        'text-xs',
                        isLimitOver ? 'text-danger' : 'text-success',
                      )}
                    >
                      {isLimitOver ? (
                        <>
                          over by{' '}
                          <AnimatedNumber value={Math.abs(difference)} />{' '}
                          {currency.code}
                        </>
                      ) : (
                        <>
                          left <AnimatedNumber value={difference} />{' '}
                          {currency.code}
                        </>
                      )}
                    </p>
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant='light'
                        isIconOnly
                        size='md'
                        className='z-0 md:size-10'
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
                              element={
                                <PiNotePencil size={DEFAULT_ICON_SIZE} />
                              }
                              hoveredElement={
                                <PiNotePencilFill size={DEFAULT_ICON_SIZE} />
                              }
                            />
                          }
                          description='Edit limit details'
                          classNames={{ description: 'text-default-500' }}
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
                          description='Permanently delete limit'
                          classNames={{ description: 'text-default-500' }}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownSection>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </Reorder.Item>
            )
          })}
        </AnimatePresence>
      </Reorder.Group>

      <div className='mt-4 flex flex-col gap-1 text-left md:mt-8'>
        <InfoText text='The calculation of limits is based on transactions by the current month.' />
        {/* <InfoText text='Your limits will be reset automatically in the new month.' /> */}
        <InfoText text='If your limit is over, you will be notified when trying to add a new transaction.' />
      </div>

      {/* Reset limits modal. */}
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
                    reset all your category limits?
                  </span>{' '}
                  This action is irreversible.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={() => [onCloseReset()]}>
                  Close
                </Button>
                <Button
                  color='danger'
                  isLoading={isLoadingReset}
                  onPress={() => [onResetAllLimits(onCloseReset)]}
                >
                  Reset
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit category limits modal. */}
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
                    onEditLimit(
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

      {/* Delete limits modal. */}
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
                  Are you sure you want to delete the
                  <br />
                  <span className='text-foreground'>
                    {getEmojiFromCategory(
                      getCategoryWithEmoji(tempCategoryName, userCategories),
                    ) || DEFAULT_CATEGORY_EMOJI}{' '}
                    {tempCategoryName}
                  </span>{' '}
                  limit? This action is permanent and cannot be undone.
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
                    onDeleteLimit(
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
