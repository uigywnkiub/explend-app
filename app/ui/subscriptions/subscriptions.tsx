'use client'

import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
  PiCheckCircle,
  PiCheckCircleFill,
  PiDotsThreeOutlineVerticalFill,
  PiNotePencil,
  PiNotePencilFill,
  PiPlus,
  PiPlusFill,
  PiTrash,
  PiTrashFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import Link from 'next/link'

import {
  Badge,
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
  Selection,
  useDisclosure,
} from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'

import {
  DEFAULT_CATEGORY_EMOJI,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'
import { MOTION_LIST } from '@/config/constants/motion'

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
  createSearchHrefWithKeyword,
  formatAmount,
  getCategoriesMap,
  getCategoryWithEmoji,
  getCategoryWithoutEmoji,
  getEmojiFromCategory,
  getFormattedAmountState,
  pluralize,
  toLowerCase,
} from '@/app/lib/helpers'
import type { TSubscriptions, TTransaction, TUserId } from '@/app/lib/types'

import AnimatedNumber from '../animated-number'
import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import AmountInput from '../limits/amount-input'
import DescriptionInput from './description-input'
import SelectInput from './select-input'

const enum DROPDOWN_KEY {
  ADD = 'add',
  EDIT = 'edit',
  DELETE = 'delete',
}

type TProps = {
  userId: TUserId
  currency: TTransaction['currency']
  subscriptionsData: TTransaction['subscriptions']
  userCategories: TTransaction['categories']
  transactions: TTransaction[]
}

export default function Subscriptions({
  userId,
  currency,
  subscriptionsData,
  userCategories,
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

  const [tempCategoryName, setTempCategoryName] = useState('')
  const [tempDescription, setTempDescription] = useState('')
  const [tempAmount, setTempAmount] = useState('')

  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)
  const [isLoadingReset, setIsLoadingReset] = useState(false)

  const categoryName = Array.from(category)[0]?.toString()
  const trimmedDescription = capitalizeFirstLetter(description.trim())
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
  }

  const getCurrSubscription = (_id: TTransaction['id']) => {
    return subscriptionsData.find((s) => s._id === _id)
  }

  const onAddSubscription = async (onClose: () => void) => {
    const newSubscription: Omit<TSubscriptions, '_id'> = Object.freeze({
      category: getCategoryWithEmoji(categoryName, userCategories),
      description: trimmedDescription,
      amount,
    })
    setIsLoadingCreate(true)
    try {
      await addSubscription(userId, newSubscription)
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
        createTransaction(userId, currency, userCategories, newSubscription),
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
    onCloseEditCallback: () => void,
  ) => {
    const hasChanges =
      categoryName === tempCategoryName &&
      description === tempDescription &&
      amount === tempAmount
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
      setDescription(e.target.value)
    },
    [],
  )

  return (
    <>
      <div className='rounded-medium bg-content1 p-4 md:p-8'>
        <div className='flex items-center justify-between'>
          <h2>Subscriptions</h2>
          <div className='flex gap-2'>
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
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color='danger' variant='light' onPress={onClose}>
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
        <Divider className='mx-auto my-3 bg-divider md:my-6' />

        {!hasSubscriptions && (
          <p className='text-center text-default-500'>No Subscriptions Found</p>
        )}

        <ul className='space-y-4'>
          <AnimatePresence>
            {subscriptionsData.map((s, idx) => {
              const { _id, category, description, amount } = s

              const isChangedCategoryName = changedCategoryNames.includes(
                getCategoryWithoutEmoji(category),
              )

              const isAddedSubscriptionInThisMonth =
                subscriptionTransactionsByCurrMonth.some(
                  (t) =>
                    toLowerCase(t.description) === toLowerCase(description) &&
                    t.category === category &&
                    formatAmount(t.amount) === formatAmount(amount),
                )

              const checkIconClassName = isAddedSubscriptionInThisMonth
                ? 'fill-success'
                : ''

              return (
                <motion.li
                  key={_id}
                  className='flex items-center justify-between py-2'
                  {...MOTION_LIST(idx)}
                >
                  <div className='flex items-center gap-2 text-balance md:w-1/2'>
                    <p className='-mb-1 text-xl md:text-2xl'>
                      {isChangedCategoryName
                        ? DEFAULT_CATEGORY_EMOJI
                        : getEmojiFromCategory(
                            getCategoryWithEmoji(category, userCategories),
                          )}
                    </p>
                    <Link
                      href={createSearchHrefWithKeyword(description)}
                      className='hover:opacity-hover'
                    >
                      {description}
                    </Link>

                    <div className='pr-2'>
                      <HoverableElement
                        uKey='check-subscription-icon'
                        element={
                          <PiCheckCircle
                            size={DEFAULT_ICON_SIZE}
                            className={checkIconClassName}
                          />
                        }
                        hoveredElement={
                          <PiCheckCircleFill
                            size={DEFAULT_ICON_SIZE}
                            className={checkIconClassName}
                          />
                        }
                      />
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <p className='text-center'>
                      <AnimatedNumber value={amount} /> {currency.code}
                    </p>
                    <Dropdown>
                      <Badge
                        content=''
                        shape='rectangle'
                        color='warning'
                        variant='solid'
                        size='sm'
                        isDot
                        placement='top-right'
                        classNames={{
                          badge: 'right-1',
                        }}
                        isInvisible={!isChangedCategoryName}
                      >
                        <DropdownTrigger className='-mt-1'>
                          <Button
                            variant='light'
                            isIconOnly
                            size='md'
                            className='md:size-10'
                          >
                            <PiDotsThreeOutlineVerticalFill className='size-4 fill-foreground' />
                          </Button>
                        </DropdownTrigger>
                      </Badge>
                      <DropdownMenu
                        aria-label='Subscription actions'
                        onAction={(key) => {
                          const currSubscription = getCurrSubscription(_id)
                          if (!currSubscription) {
                            throw new Error('Cannot find current subscription')
                          }

                          const currCategoryWithoutEmoji =
                            getCategoryWithoutEmoji(currSubscription.category)

                          setCategory(
                            new Set(
                              changedCategoryNames.includes(
                                currCategoryWithoutEmoji,
                              )
                                ? []
                                : [currCategoryWithoutEmoji],
                            ),
                          )
                          setDescription(currSubscription.description)
                          setAmount(currSubscription.amount)
                          setSubscriptionId(currSubscription._id)

                          setTempCategoryName(currCategoryWithoutEmoji)
                          setTempDescription(currSubscription.description)
                          setTempAmount(currSubscription.amount)

                          if (key === DROPDOWN_KEY.ADD) {
                            onAddAsTransaction({
                              category: getCategoryWithEmoji(
                                category,
                                userCategories,
                              ),
                              description,
                              amount,
                              isSubscription: true,
                            })
                          }
                          if (key === DROPDOWN_KEY.EDIT) {
                            onOpenEdit()
                          }
                          if (key === DROPDOWN_KEY.DELETE) {
                            onOpenDelete()
                          }
                        }}
                      >
                        <DropdownSection title='Actions' showDivider>
                          <DropdownItem
                            key={DROPDOWN_KEY.ADD}
                            startContent={
                              <HoverableElement
                                uKey={DROPDOWN_KEY.ADD}
                                element={<PiPlus size={DEFAULT_ICON_SIZE} />}
                                hoveredElement={
                                  <PiPlusFill size={DEFAULT_ICON_SIZE} />
                                }
                              />
                            }
                            description='Add subscription as transaction'
                            classNames={{
                              description: 'text-default-500',
                            }}
                          >
                            Add
                          </DropdownItem>
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
                            description={
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
                                isInvisible={!isChangedCategoryName}
                              >
                                Edit subscription details
                              </Badge>
                            }
                            classNames={{
                              description: 'text-default-500',
                            }}
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
                            description='Permanently delete subscription'
                            classNames={{
                              description: 'text-default-500',
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownSection>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        <div className='mt-4 flex flex-col gap-1 text-left md:mt-8'>
          <InfoText text='You can add each subscription to transactions as an expense.' />
          <InfoText text='The green check icon indicates a subscription has been added this month.' />
        </div>
      </div>

      {changedCategoryNames.length > 0 && (
        <p className='mt-4 text-center text-sm text-warning'>
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
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onCloseEdit}>
                  Close
                </Button>
                <Button
                  color='danger'
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
                <p className='overflow-hidden text-ellipsis text-default-500'>
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
