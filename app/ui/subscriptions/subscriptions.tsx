'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
  PiNotePencilFill,
  PiPlus,
  PiPlusFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'
import { useDebounce } from 'react-use'

import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Selection,
  Tooltip,
  useDisclosure,
} from '@heroui/react'
import { AnimatePresence, Reorder } from 'framer-motion'

import {
  DEFAULT_CATEGORY_EMOJI,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'

import {
  addSubscription,
  createTransaction,
  deleteSubscription,
  editSubscription,
  resetAllSubscriptions,
} from '@/app/lib/actions'
import { getTransactionsByCurrMonth } from '@/app/lib/data'
import {
  capitalizeFirstLetter,
  createFormData,
  getCategoriesMap,
  getCategoryWithEmoji,
  getCategoryWithoutEmoji,
  getEmojiFromCategory,
  getFormattedAmountState,
  pluralize,
  toUpperCase,
} from '@/app/lib/helpers'
import type { TSubscriptions, TTransaction, TUserId } from '@/app/lib/types'

import AmountInput from '../amount-input'
import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import DescriptionInput from './description-input'
import NoteInput from './note-input'
import SelectInput from './select-input'
import SubscriptionItem from './subscription-item'

export const enum DROPDOWN_KEY {
  ADD = 'add',
  EDIT = 'edit',
  DELETE = 'delete',
}

type TProps = {
  userId: TUserId
  currency: TTransaction['currency']
  subscriptionsData: TTransaction['subscriptions']
  userCategories: TTransaction['categories']
  userSalaryDay: TTransaction['salaryDay']
  transactions: TTransaction[]
}

export default function Subscriptions({
  userId,
  currency,
  subscriptionsData,
  userCategories,
  userSalaryDay,
  transactions,
}: TProps) {
  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onOpenChange: onOpenChangeCreate,
  } = useDisclosure()
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onOpenChange: onOpenChangeEdit,
  } = useDisclosure()
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure()
  const {
    isOpen: isOpenReset,
    onOpen: onOpenReset,
    onOpenChange: onOpenChangeReset,
  } = useDisclosure()

  const [subscriptionId, setSubscriptionId] = useState('')
  const [category, setCategory] = useState<Selection>(new Set([]))
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const [tempCategoryName, setTempCategoryName] = useState('')
  const [tempDescription, setTempDescription] = useState('')
  const [tempAmount, setTempAmount] = useState('')
  const [tempNote, setTempNote] = useState('')

  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)
  const [isLoadingReset, setIsLoadingReset] = useState(false)

  const [isReorderSave, setIsReorderSave] = useState(false)
  const [subscriptionsDataState, setSubscriptionsDataState] =
    useState<TSubscriptions[]>(subscriptionsData)
  useEffect(() => {
    setSubscriptionsDataState(subscriptionsData)
  }, [subscriptionsData])

  const reorderContainer = useRef(null)

  const categoryName = Array.from(category)[0]?.toString()
  const trimmedDescription = capitalizeFirstLetter(description.trim())
  const trimmedNote = capitalizeFirstLetter(note?.trim())
  const isCategoryNameInvalid = !Boolean(categoryName)
  const isDescriptionInvalid = !Boolean(description)
  const isAmountInvalid = !amount || amount === '0'
  const isDisabledAddBtn =
    isCategoryNameInvalid || isAmountInvalid || isDescriptionInvalid
  const hasSubscriptions = subscriptionsData.length > 0

  const subscriptionTransactionsByCurrMonth = useMemo(
    () =>
      getTransactionsByCurrMonth(transactions).filter((t) => t.isSubscription),
    [transactions],
  )

  const userCategoriesMap = useMemo(
    () => getCategoriesMap(userCategories),
    [userCategories],
  )

  const changedCategoryNames = useMemo(() => {
    return subscriptionsData
      .map((s) => getCategoryWithoutEmoji(s.category))
      .filter((name) => !userCategoriesMap.has(name))
  }, [subscriptionsData, userCategoriesMap])

  const isChangedCategoryName = changedCategoryNames.includes(tempCategoryName)

  const changedCategoryNameWithEmoji = useMemo(() => {
    if (!isChangedCategoryName) return

    return (
      subscriptionsData.find(
        (s) => getCategoryWithoutEmoji(s.category) === tempCategoryName,
      )?.category || tempCategoryName
    )
  }, [isChangedCategoryName, subscriptionsData, tempCategoryName])

  const resetStates = () => {
    setCategory(new Set([]))
    setDescription('')
    setAmount('')
    setNote('')
  }

  const getCurrSubscription = (_id: TTransaction['id']) => {
    return subscriptionsData.find((s) => s._id === _id)
  }

  const onReorderSubscriptions = useCallback(
    async (reorderedData: TSubscriptions[]) => {
      try {
        await addSubscription(userId, reorderedData)
        setIsReorderSave(false)
        toast.success('Reordered.')
      } catch (err) {
        toast.error('Failed to reorder.')
        throw err
      }
    },
    [userId],
  )

  const onReorderSubscription = (newIds: TSubscriptions['_id'][]) => {
    const reordered = newIds
      .map((id) => subscriptionsDataState.find((s) => s._id === id))
      .filter((s): s is TSubscriptions => s !== undefined)

    if (reordered.length === 0) return

    setSubscriptionsDataState(reordered)
    setIsReorderSave(true)
  }

  const [isReady, cancel] = useDebounce(
    () => isReorderSave && onReorderSubscriptions(subscriptionsDataState),
    1000,
    [isReorderSave],
  )
  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

  const onAddSubscription = async (onClose: () => void) => {
    const newSubscription: Omit<TSubscriptions, '_id'> = Object.freeze({
      category: getCategoryWithEmoji(categoryName, userCategories),
      description: trimmedDescription,
      amount,
      note: trimmedNote,
    })
    setIsLoadingCreate(true)
    try {
      await addSubscription(userId, [...subscriptionsData, newSubscription])
      toast.success('Subscription created.')
      resetStates()
    } catch (err) {
      toast.error('Failed to create subscription.')
      throw err
    } finally {
      setIsLoadingCreate(false)
      onClose()
    }
  }

  const onAddAsTransaction = async (
    subscriptionData: Omit<TSubscriptions, '_id'> & {
      isSubscription: TTransaction['isSubscription']
    },
  ) => {
    try {
      const newSubscription = createFormData(subscriptionData)
      await toast.promise(
        createTransaction(
          userId,
          currency,
          userCategories,
          userSalaryDay,
          newSubscription,
        ),
        {
          loading: 'Processing as transaction...',
          success: 'Transaction added.',
          error: 'Failed to add as transaction.',
        },
      )
      resetStates()
    } catch (err) {
      throw err
    }
  }

  const onEditSubscription = async (
    _id: TTransaction['id'],
    category: TSubscriptions['category'],
    description: TSubscriptions['description'],
    amount: TSubscriptions['amount'],
    note: TSubscriptions['note'],
    onCloseEditCallback: () => void,
  ) => {
    const hasChanges =
      categoryName === tempCategoryName &&
      description === tempDescription &&
      amount === tempAmount &&
      note === tempNote
    if (hasChanges) {
      toast.error('No changes detected.')

      return
    }
    setIsLoadingEdit(true)
    try {
      await editSubscription(
        userId,
        _id,
        getCategoryWithEmoji(category, userCategories),
        description,
        amount,
        note,
      )
      toast.success('Subscription edited.')
    } catch (err) {
      toast.error('Failed to edit subscription.')
      throw err
    } finally {
      setIsLoadingEdit(false)
      onCloseEditCallback()
    }
  }

  const onDeleteSubscription = async (
    _id: TTransaction['id'],
    onCloseDeleteCallback: () => void,
  ) => {
    setIsLoadingDelete(true)
    try {
      await deleteSubscription(userId, _id)
      toast.success('Subscription deleted.')
    } catch (err) {
      toast.error('Failed to delete subscription.')
      throw err
    } finally {
      setIsLoadingDelete(false)
      onCloseDeleteCallback()
    }
  }

  const onResetAllSubscriptions = async (onCloseResetCallback: () => void) => {
    setIsLoadingReset(true)
    try {
      await resetAllSubscriptions(userId)
      toast.success('All subscriptions reset.')
    } catch (err) {
      toast.error('Failed to reset subscriptions.')
      throw err
    } finally {
      setIsLoadingReset(false)
      onCloseResetCallback()
    }
  }

  const onChangeAmount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      getFormattedAmountState(e, setAmount)
    },
    [],
  )

  const onChangeDescription = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const formatted = value ? toUpperCase(value[0]) + value.slice(1) : ''

      setDescription(formatted)
    },
    [],
  )

  const onChangeNote = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = value ? toUpperCase(value[0]) + value.slice(1) : ''

    setNote(formatted)
  }, [])

  return (
    <>
      <div className='rounded-medium bg-content1 p-4 md:p-8'>
        <div className='flex items-center justify-between'>
          <h2>Subscriptions</h2>
          <div className='flex gap-2'>
            <Tooltip content='Reset all subscriptions' placement='bottom'>
              <Button
                isDisabled={!hasSubscriptions}
                onPress={onOpenReset}
                color='danger'
                variant='flat'
                className='min-w-4'
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
            <Tooltip content='Add subscription' placement='bottom'>
              <Button
                onPress={() => {
                  const predefinedCategory = 'Subscription'
                  if (userCategoriesMap.has(predefinedCategory)) {
                    const categoryName =
                      userCategoriesMap.get(predefinedCategory)?.name
                    if (categoryName) {
                      setCategory(new Set([categoryName]))
                    }
                  }
                  onOpenCreate()
                }}
                color='primary'
                variant='flat'
                className='min-w-4'
              >
                <HoverableElement
                  uKey='create'
                  element={<PiPlus size={DEFAULT_ICON_SIZE} />}
                  hoveredElement={<PiPlusFill size={DEFAULT_ICON_SIZE} />}
                  withShift={false}
                />
              </Button>
            </Tooltip>
          </div>

          {/* Create subscription modal. */}
          <Modal isOpen={isOpenCreate} onOpenChange={onOpenChangeCreate}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <PiPlusFill size={DEFAULT_ICON_SIZE} /> Add subscription
                    </div>
                  </ModalHeader>
                  <ModalBody>
                    <div className='flex flex-col gap-4'>
                      <SelectInput
                        category={category}
                        setCategory={setCategory}
                        categoryName={categoryName}
                        userCategories={userCategories}
                      />
                      <DescriptionInput
                        isDescriptionInvalid={isDescriptionInvalid}
                        description={description}
                        onChangeDescription={onChangeDescription}
                      />
                      <AmountInput
                        isAmountInvalid={isAmountInvalid}
                        amount={amount}
                        setAmount={setAmount}
                        onChangeAmount={onChangeAmount}
                        currency={currency}
                      />
                      <NoteInput note={note} onChangeNote={onChangeNote} />
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant='light' onPress={onClose}>
                      Close
                    </Button>
                    <Button
                      color='primary'
                      onPress={() => [onAddSubscription(onClose)]}
                      isLoading={isLoadingCreate}
                      isDisabled={isDisabledAddBtn}
                    >
                      Add
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
        <Divider className='bg-divider mx-auto my-3 md:my-6' />

        {!hasSubscriptions && (
          <p className='text-default-500 text-center'>No Subscriptions Found</p>
        )}

        <Reorder.Group
          axis='y'
          values={subscriptionsDataState.map((s) => s._id)}
          onReorder={onReorderSubscription}
          ref={reorderContainer}
          className='space-y-4 select-none'
        >
          <AnimatePresence>
            {subscriptionsDataState.map((s, idx) => (
              <SubscriptionItem
                key={s._id}
                s={s}
                idx={idx}
                currency={currency}
                userCategories={userCategories}
                changedCategoryNames={changedCategoryNames}
                subscriptionTransactionsByCurrMonth={
                  subscriptionTransactionsByCurrMonth
                }
                onAction={(key) => {
                  const currSubscription = getCurrSubscription(s._id)
                  if (!currSubscription)
                    throw new Error('Cannot find current subscription')

                  const currCategoryWithoutEmoji = getCategoryWithoutEmoji(
                    currSubscription.category,
                  )

                  setCategory(
                    new Set(
                      changedCategoryNames.includes(currCategoryWithoutEmoji)
                        ? []
                        : [currCategoryWithoutEmoji],
                    ),
                  )
                  setDescription(currSubscription.description)
                  setAmount(currSubscription.amount)
                  setSubscriptionId(currSubscription._id)
                  setNote(currSubscription.note)
                  setTempCategoryName(currCategoryWithoutEmoji)
                  setTempDescription(currSubscription.description)
                  setTempAmount(currSubscription.amount)
                  setTempNote(currSubscription.note)

                  if (key === DROPDOWN_KEY.ADD) {
                    onAddAsTransaction({
                      category: getCategoryWithEmoji(
                        s.category,
                        userCategories,
                      ),
                      description: s.description,
                      amount: s.amount,
                      isSubscription: true,
                      note: s.note,
                    })
                  }
                  if (key === DROPDOWN_KEY.EDIT) onOpenEdit()
                  if (key === DROPDOWN_KEY.DELETE) onOpenDelete()
                }}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <div className='mt-4 flex flex-col gap-1 text-left md:mt-8'>
          <InfoText text='You can add each subscription to transactions as an expense.' />
          <InfoText text='The green check icon indicates a subscription has been added this month.' />
        </div>
      </div>

      {changedCategoryNames.length > 0 && (
        <p className='text-warning mt-4 text-center text-sm'>
          <PiWarningOctagonFill className='inline animate-pulse' />{' '}
          {`You have ${changedCategoryNames.length} ${pluralize(changedCategoryNames.length, 'subscription', 'subscriptions')} with the old category.`}
        </p>
      )}

      {/* Edit subscriptions modal */}
      <Modal
        isOpen={isOpenEdit}
        onOpenChange={onOpenChangeEdit}
        onClose={resetStates}
      >
        <ModalContent>
          {(onCloseEdit) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiNotePencilFill size={DEFAULT_ICON_SIZE} /> Edit
                  subscription
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='flex flex-col gap-4'>
                  <SelectInput
                    category={category}
                    setCategory={setCategory}
                    categoryName={categoryName}
                    userCategories={userCategories}
                    changedCategoryNameWithEmoji={changedCategoryNameWithEmoji}
                    isCategoryNameInvalid={isCategoryNameInvalid}
                    isChangedCategoryName={isChangedCategoryName}
                  />
                  <DescriptionInput
                    isDescriptionInvalid={isDescriptionInvalid}
                    description={description}
                    onChangeDescription={onChangeDescription}
                  />
                  <AmountInput
                    isAmountInvalid={isAmountInvalid}
                    amount={amount}
                    setAmount={setAmount}
                    onChangeAmount={onChangeAmount}
                    currency={currency}
                  />
                  <NoteInput note={note} onChangeNote={onChangeNote} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onCloseEdit}>
                  Close
                </Button>
                <Button
                  color='primary'
                  isLoading={isLoadingEdit}
                  isDisabled={
                    isAmountInvalid ||
                    isDescriptionInvalid ||
                    isCategoryNameInvalid
                  }
                  onPress={() =>
                    onEditSubscription(
                      subscriptionId,
                      categoryName,
                      trimmedDescription,
                      amount,
                      trimmedNote,
                      onCloseEdit,
                    )
                  }
                >
                  Edit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete subscription modal. */}
      <Modal
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
        onClose={resetStates}
      >
        <ModalContent>
          {(onCloseDelete) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} /> Delete
                  subscription
                </div>
              </ModalHeader>
              <ModalBody>
                <p className='text-default-500 overflow-hidden text-ellipsis'>
                  Are you sure you want to delete the
                  <br />
                  <span className='text-foreground'>
                    {isChangedCategoryName
                      ? DEFAULT_CATEGORY_EMOJI
                      : getEmojiFromCategory(
                          getCategoryWithEmoji(categoryName, userCategories),
                        )}{' '}
                    {description}
                  </span>{' '}
                  subscription? This action is permanent and cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onCloseDelete}>
                  Close
                </Button>
                <Button
                  color='danger'
                  isLoading={isLoadingDelete}
                  onPress={() =>
                    onDeleteSubscription(subscriptionId, onCloseDelete)
                  }
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Reset all subscriptions modal. */}
      <Modal
        isOpen={isOpenReset}
        onOpenChange={onOpenChangeReset}
        onClose={resetStates}
      >
        <ModalContent>
          {(onCloseReset) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} /> Reset
                  subscriptions
                </div>
              </ModalHeader>
              <ModalBody>
                <p className='text-default-500'>
                  Are you sure you want to{' '}
                  <span className='text-foreground'>
                    reset all your subscriptions?
                  </span>{' '}
                  This action is irreversible.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onCloseReset}>
                  Close
                </Button>
                <Button
                  color='danger'
                  isLoading={isLoadingReset}
                  onPress={() => [onResetAllSubscriptions(onCloseReset)]}
                >
                  Reset
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
