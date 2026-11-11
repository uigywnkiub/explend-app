'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
  PiNotePencil,
  PiNotePencilFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
import { EmojiClickData } from 'emoji-picker-react'
import { Reorder } from 'framer-motion'
import { haptic } from 'ios-haptics'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { ANCHOR_ROUTE } from '@/config/constants/routes'

import {
  getCategoryTransactionCount,
  resetCategories,
  updateCategories,
} from '@/app/lib/actions'
import {
  deepCloneCategories,
  getUniqueCategoriesFromDefaults,
} from '@/app/lib/data'
import {
  capitalizeFirstLetter,
  deepCompareArrays,
  pluralize,
} from '@/app/lib/helpers'
import type {
  TCategories,
  TCategoriesItem,
  TCategoriesLoading,
  TEditingItemIndex,
  TIcon,
  TUserId,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import WarningText from '../warning-text'
import Category from './category'

const RESET_CATEGORIES_BTN_TEXT = 'Reset categories'

const PLACEHOLDER = {
  emoji: '➕', // Emoji may be invisible in IDE.
  name: 'New category',
  __isPlaceholder: true as const,
} as TCategoriesItem

type TProps = {
  userId: TUserId
  userCategories: TCategories[]
  areCategoriesLengthMismatch: boolean
}

function Categories({
  userId,
  userCategories,
  areCategoriesLengthMismatch,
}: TProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure()

  const withPlaceholder = useCallback((cats: TCategories[]) => {
    return cats.map((cat) => {
      const hasPlaceholder = cat.items.some((i) => i.__isPlaceholder)

      return {
        ...cat,
        items: hasPlaceholder ? cat.items : [...cat.items, PLACEHOLDER],
      }
    })
  }, [])
  const stripPlaceholder = useCallback((cats: TCategories[]) => {
    return cats.map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => !i.__isPlaceholder),
    }))
  }, [])
  const [categories, setCategories] = useState<TCategories[]>(() =>
    withPlaceholder(userCategories),
  )
  const updateCategoriesState = useCallback(
    (updater: (prev: TCategories[]) => TCategories[]) => {
      setCategories((prev) => withPlaceholder(updater(prev)))
    },
    [withPlaceholder],
  )

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newTargetName, setNewTargetName] = useState('')
  const [editingItemIndex, setEditingItemIndex] =
    useState<TEditingItemIndex | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [editingOriginalCategory, setEditingOriginalCategory] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isLoading, setIsLoading] = useState<TCategoriesLoading>({
    subject: false,
    item: false,
    reset: false,
  })
  const [isNewEmojiPick, setIsNewEmojiPick] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const reorderContainer = useRef<HTMLDivElement>(null)
  const orderBeforeReordering = useRef<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<{
    categoryIndex: number
    itemIndex: number
    itemName: string
    itemEmoji: string
  } | null>(null)
  const [pendingCategoryRename, setPendingCategoryRename] = useState<{
    oldCategory: string
    newCategory: string
    categoryIndex: number
    data: Partial<TCategories>
  } | null>(null)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renameTransactionCount, setRenameTransactionCount] = useState(0)

  const originalUserCategories = useMemo(
    () => deepCloneCategories(userCategories),
    [userCategories],
  )

  const onEditTargetClick = useCallback(
    (index: number, currentTarget: string) => {
      setEditingIndex(index)
      setNewTargetName(currentTarget)
    },
    [],
  )

  const toggleEmojiPicker = useCallback(() => {
    haptic()
    setShowEmojiPicker((prev) => !prev)
  }, [])

  const onSaveTargetClick = useCallback(
    async (index: number) => {
      const updatedCategories = [...categories]
      const oldTargetName = updatedCategories[index].subject
      const _newTargetName = capitalizeFirstLetter(newTargetName).trim()

      if (oldTargetName === _newTargetName) {
        setEditingIndex(null)
        setNewTargetName('')
        setIsReordering(false)
        haptic.error()
        toast.error('No changes detected.')

        return
      }

      updatedCategories[index].subject = _newTargetName
      updateCategoriesState(() => updatedCategories)

      const newCategoriesData = {
        subject: _newTargetName,
        items: stripPlaceholder(updatedCategories)[index].items.filter((i) =>
          Boolean(i.name),
        ),
      }

      setIsLoading({ subject: true, item: false, reset: false })
      try {
        await updateCategories(userId, oldTargetName, newCategoriesData)
        haptic.confirm()
        toast.success('Categories updated.')
        setIsReordering(false)
        orderBeforeReordering.current = null
      } catch (err) {
        haptic.error()
        toast.error('Failed to update categories.')
        throw err
      } finally {
        setEditingIndex(null)
        setNewTargetName('')
        setIsLoading({ subject: false, item: false, reset: false })
      }
    },
    [
      categories,
      newTargetName,
      stripPlaceholder,
      updateCategoriesState,
      userId,
    ],
  )

  const onEditItemClick = useCallback(
    (categoryIndex: number, itemIndex: number, currentItemName: string) => {
      const item = categories?.[categoryIndex]?.items?.[itemIndex]
      if (!item) return

      if (item.__isPlaceholder) {
        setEditingOriginalCategory('')
        // Replace placeholder with a temporary new editable item and mark it as __isNew.
        updateCategoriesState((prev) => {
          const updated = [...prev]
          const cat = {
            ...updated[categoryIndex],
            items: [...updated[categoryIndex].items],
          }
          cat.items.splice(itemIndex, 1, {
            emoji: PLACEHOLDER.emoji,
            name: '',
            __isNew: true,
          })
          updated[categoryIndex] = cat

          return updated
        })

        // Open editor for that new row.
        setEditingItemIndex({ categoryIndex, itemIndex })
        setNewItemName('') // Start with empty input.
        setShowEmojiPicker(true)

        return
      }

      // Normal edit for existing item.
      setEditingOriginalCategory(`${item.emoji} ${item.name}`)
      setEditingItemIndex({ categoryIndex, itemIndex })
      setNewItemName(currentItemName)
      setShowEmojiPicker(true)
    },
    [categories, updateCategoriesState],
  )

  const onEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      haptic()
      if (editingItemIndex) {
        const { categoryIndex, itemIndex } = editingItemIndex
        const updatedCategories = [...categories]
        updatedCategories[categoryIndex].items[itemIndex].emoji =
          emojiData.emoji

        setIsNewEmojiPick(true)
        updateCategoriesState(() => updatedCategories)
      }
    },
    [categories, editingItemIndex, updateCategoriesState],
  )

  const onResetEmojiClick = useCallback(
    (categoryIndex: number, itemIndex: number) => {
      const originalEmoji =
        originalUserCategories[categoryIndex].items[itemIndex].emoji
      const updatedCategories = [...categories]
      updatedCategories[categoryIndex].items[itemIndex].emoji = originalEmoji

      updateCategoriesState(() => updatedCategories)
      setIsNewEmojiPick(false)
    },
    [categories, originalUserCategories, updateCategoriesState],
  )

  const onSaveItemClick = useCallback(
    async (categoryIndex: number, itemIndex: number) => {
      const oldCategory = editingOriginalCategory
      const updatedCategories = deepCloneCategories(categories)
      const oldItemName = updatedCategories[categoryIndex].items[itemIndex].name
      const _newItemName = capitalizeFirstLetter(newItemName).trim()

      const duplicateItem = updatedCategories.some((category, catIndex) =>
        category.items.some(
          (item, index) =>
            (catIndex !== categoryIndex || index !== itemIndex) &&
            !item.__isPlaceholder &&
            item.name.trim().toLocaleLowerCase() ===
              _newItemName.toLocaleLowerCase(),
        ),
      )
      if (duplicateItem) {
        haptic.error()
        toast.error('A category with this name already exists.')

        return
      }

      if (oldItemName === _newItemName && !isNewEmojiPick) {
        setEditingItemIndex(null)
        setNewItemName('')
        setIsReordering(false)
        haptic.error()
        toast.error('No changes detected.')

        return
      }

      // Locally update name.
      updatedCategories[categoryIndex].items[itemIndex].name = _newItemName
      updateCategoriesState(() => updatedCategories)

      // Prepare payload (placeholder stripped).
      const newCategoriesData = {
        subject: updatedCategories[categoryIndex].subject,
        items: stripPlaceholder(updatedCategories)
          [categoryIndex].items.map(({ emoji, name }) => ({ emoji, name }))
          .filter((i) => Boolean(i.name)),
      }

      const newCategory = `${updatedCategories[categoryIndex].items[itemIndex].emoji} ${_newItemName}`
      const transactionCount = await getCategoryTransactionCount(
        userId,
        oldCategory,
      )
      if (transactionCount > 0 && oldCategory !== newCategory) {
        setPendingCategoryRename({
          oldCategory,
          newCategory,
          categoryIndex,
          data: newCategoriesData,
        })
        setRenameTransactionCount(transactionCount)
        setIsRenameOpen(true)
        setIsLoading({ subject: false, item: false, reset: false })

        return
      }

      setIsLoading({ subject: false, item: true, reset: false })
      setShowEmojiPicker(false)
      try {
        await updateCategories(
          userId,
          newCategoriesData.subject,
          newCategoriesData,
        )

        // Remove __isNew flag locally so item becomes "real".
        setCategories((prev) => {
          const copy = [...prev]

          // Get the category we are updating.
          const cat = {
            ...copy[categoryIndex],
            items: [...copy[categoryIndex].items],
          }

          // Remove __isNew flag and any items with empty name.
          cat.items = cat.items
            .filter((i) => i.name.trim() !== '') // Remove empty names.
            .map((i) => {
              if (i.__isNew) {
                const newItem = { ...i }
                delete newItem.__isNew

                return newItem
              }

              return i
            })

          // Apply placeholder at the end.
          copy[categoryIndex] = {
            ...cat,
            items: withPlaceholder([cat])[0].items,
          }

          return copy
        })

        haptic.confirm()
        toast.success('Categories updated.')
        setIsReordering(false)
        orderBeforeReordering.current = null
      } catch (err) {
        haptic.error()
        toast.error('Failed to update categories.')
        throw err
      } finally {
        setEditingItemIndex(null)
        setNewItemName('')
        setIsNewEmojiPick(false)
        setIsLoading({ subject: false, item: false, reset: false })
      }
    },
    [
      categories,
      isNewEmojiPick,
      newItemName,
      editingOriginalCategory,
      stripPlaceholder,
      updateCategoriesState,
      userId,
      withPlaceholder,
    ],
  )

  const onDeleteItemClick = useCallback(
    (categoryIndex: number, itemIndex: number) => {
      const item = categories[categoryIndex]?.items[itemIndex]
      if (!item || item.__isPlaceholder) return
      setPendingDeletion({
        categoryIndex,
        itemIndex,
        itemName: item.name,
        itemEmoji: item.emoji,
      })
      onDeleteOpen()
    },
    [categories, onDeleteOpen],
  )

  const onConfirmDeleteItem = useCallback(
    async (categoryIndex: number, itemIndex: number) => {
      const category = categories[categoryIndex]
      const itemToDelete = category.items[itemIndex]

      if (!itemToDelete || itemToDelete.__isPlaceholder) {
        haptic.error()
        toast.error('Category not found or cannot delete placeholder.')

        return
      }

      const updatedCategory = {
        ...category,
        items: category.items.filter((_, index) => index !== itemIndex),
      }
      const updatedCategories = [...categories]

      const isNoCategoryItems =
        stripPlaceholder([updatedCategory])[0].items.length === 0
      if (isNoCategoryItems) {
        updatedCategories.splice(categoryIndex, 1)
      } else {
        updatedCategories[categoryIndex] = updatedCategory
      }

      updateCategoriesState(() => updatedCategories)
      setShowEmojiPicker(false)
      setEditingItemIndex(null)

      try {
        const newCategoriesData = {
          subject: category.subject,
          items: stripPlaceholder([updatedCategory])[0].items.filter((i) =>
            Boolean(i.name),
          ),
        }
        await updateCategories(userId, category.subject, newCategoriesData)

        if (isNoCategoryItems) {
          haptic.confirm()
          toast.success('Category and subject deleted.')
        } else {
          haptic.confirm()
          toast.success('Category deleted.')
        }
        setIsReordering(false)
        orderBeforeReordering.current = null
      } catch (err) {
        if (isNoCategoryItems) {
          haptic.error()
          toast.error('Failed to delete item and subject.')
        } else {
          haptic.error()
          toast.error('Failed to delete item.')
        }
        throw err
      }
    },
    [categories, stripPlaceholder, updateCategoriesState, userId],
  )

  const confirmPendingDeletion = useCallback(async () => {
    if (!pendingDeletion) return
    await onConfirmDeleteItem(
      pendingDeletion.categoryIndex,
      pendingDeletion.itemIndex,
    )
    setPendingDeletion(null)
    onDeleteClose()
  }, [onConfirmDeleteItem, onDeleteClose, pendingDeletion])

  const finishPendingCategoryRename = useCallback(
    async (migrate: boolean) => {
      if (!pendingCategoryRename) return
      const { oldCategory, newCategory, categoryIndex, data } =
        pendingCategoryRename
      setIsLoading({ subject: false, item: true, reset: false })
      try {
        await updateCategories(userId, data.subject!, data, {
          from: oldCategory,
          to: newCategory,
          migrate,
        })
        haptic.confirm()
        toast.success(
          migrate
            ? `Category updated in ${renameTransactionCount} transactions.`
            : 'Category updated. Previous transactions kept their category.',
        )
        setCategories((prev) => {
          const copy = [...prev]
          const category = {
            ...copy[categoryIndex],
            items: copy[categoryIndex].items
              .filter((item) => item.name.trim())
              .map((item) => {
                if (!item.__isNew) return item
                const clean = { ...item }
                delete clean.__isNew

                return clean
              }),
          }
          copy[categoryIndex] = withPlaceholder([category])[0]

          return copy
        })
        setEditingItemIndex(null)
        setNewItemName('')
        setIsReordering(false)
        orderBeforeReordering.current = null
      } catch {
        haptic.error()
        toast.error('Failed to update category.')
      } finally {
        setIsLoading({ subject: false, item: false, reset: false })
        setPendingCategoryRename(null)
        setIsRenameOpen(false)
      }
    },
    [pendingCategoryRename, renameTransactionCount, userId, withPlaceholder],
  )

  const haveCategoriesChanged = useMemo(() => {
    const cleanedCategories = categories.map((c) => ({
      ...c,
      items: c.items.filter((i) => !i.__isPlaceholder && i.name.trim() !== ''),
    }))

    return deepCompareArrays(cleanedCategories, DEFAULT_CATEGORIES)
  }, [categories])

  const diffCategories = useMemo(
    () => getUniqueCategoriesFromDefaults(categories),
    [categories],
  )

  const onResetCategories = useCallback(async () => {
    setIsLoading({ subject: false, item: false, reset: true })
    try {
      await resetCategories(userId, DEFAULT_CATEGORIES)
      haptic.confirm()
      toast.success('All categories reset.')
    } catch (err) {
      haptic.error()
      toast.error('Failed to reset categories.')
      throw err
    } finally {
      setIsLoading({ subject: false, item: false, reset: false })
    }
  }, [userId])

  const onReorderCategories = useCallback((subjects: string[]) => {
    setCategories((current) =>
      subjects
        .map((subject) =>
          current.find((category) => category.subject === subject),
        )
        .filter((category): category is TCategories => Boolean(category)),
    )
  }, [])

  const onReorderCategoryItems = useCallback(
    (categoryIndex: number, items: TCategoriesItem[]) => {
      setCategories((current) =>
        current.map((category, index) =>
          index === categoryIndex ? { ...category, items } : category,
        ),
      )
    },
    [],
  )

  const onSaveCategoryOrder = useCallback(async () => {
    const currentOrder = JSON.stringify(
      stripPlaceholder(categories).map(({ subject, items }) => ({
        subject,
        items: items.map((item) => item.name),
      })),
    )
    if (currentOrder === orderBeforeReordering.current) {
      setIsReordering(false)
      orderBeforeReordering.current = null

      return
    }

    setIsSavingOrder(true)
    try {
      await resetCategories(userId, stripPlaceholder(categories))
      haptic.confirm()
      toast.success('Category order saved.')
      setIsReordering(false)
      orderBeforeReordering.current = null
    } catch {
      haptic.error()
      toast.error('Failed to save category order.')
    } finally {
      setIsSavingOrder(false)
    }
  }, [categories, stripPlaceholder, userId])

  const buttonWithIcon = (icon: TIcon) => (
    <Button
      isDisabled={haveCategoriesChanged}
      className='bg-danger text-default-50 h-10 w-full font-medium'
      onPress={() => [haptic(), onOpen()]}
      startContent={icon}
    >
      {RESET_CATEGORIES_BTN_TEXT}
    </Button>
  )

  const categoryElements = categories.map((category, index) => (
    <Category
      key={category.subject}
      category={category}
      index={index}
      isReordering={isReordering}
      reorderContainer={reorderContainer}
      onReorderItems={onReorderCategoryItems}
      editingIndex={editingIndex}
      newTargetName={newTargetName}
      onEditTargetClick={onEditTargetClick}
      setNewTargetName={setNewTargetName}
      onSaveTargetClick={onSaveTargetClick}
      onEditItemClick={onEditItemClick}
      editingItemIndex={editingItemIndex}
      newItemName={newItemName}
      setNewItemName={setNewItemName}
      onSaveItemClick={onSaveItemClick}
      showEmojiPicker={showEmojiPicker}
      toggleEmojiPicker={toggleEmojiPicker}
      isLoading={isLoading}
      onEmojiClick={onEmojiClick}
      onResetEmojiClick={onResetEmojiClick}
      isNewEmojiPick={isNewEmojiPick}
      onDeleteItemClick={onDeleteItemClick}
      placeholderItemName={PLACEHOLDER.name}
      originalUserCategories={originalUserCategories}
    />
  ))

  return (
    <>
      <Modal
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        isDismissable={!isLoading.item}
        hideCloseButton={isLoading.item}
      >
        <ModalContent>
          <ModalHeader className='flex items-center gap-2'>
            <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} />
            Update previous transactions?
          </ModalHeader>
          <ModalBody>
            <p className='text-default-500 text-balance'>
              {renameTransactionCount}{' '}
              {pluralize(
                renameTransactionCount,
                'transaction uses',
                'transactions use',
              )}{' '}
              with category “{pendingCategoryRename?.oldCategory}”. Choose
              whether to update them to “{pendingCategoryRename?.newCategory}”.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='light'
              isDisabled={isLoading.item}
              onPress={() => finishPendingCategoryRename(false)}
            >
              Keep old category
            </Button>
            <Button
              color='primary'
              isLoading={isLoading.item}
              onPress={() => finishPendingCategoryRename(true)}
            >
              Update transactions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div ref={reorderContainer}>
        {isReordering ? (
          <Reorder.Group
            axis='y'
            values={categories.map((category) => category.subject)}
            onReorder={onReorderCategories}
            className='select-none'
          >
            {categoryElements}
          </Reorder.Group>
        ) : (
          <div>{categoryElements}</div>
        )}
      </div>
      {areCategoriesLengthMismatch && (
        <div className='mb-4'>
          <WarningText
            text='We detected a mismatch between your current categories and the default ones.'
            actionText={`Press "${RESET_CATEGORIES_BTN_TEXT}" button to restore the default and overwrite your current categories.`}
          />
        </div>
      )}
      <div className='mx-auto flex max-w-md flex-col gap-2 md:flex-row'>
        <div className='flex-1'>
          <Button
            isDisabled={categories.length === 0 || isSavingOrder}
            isLoading={isSavingOrder}
            aria-label={
              isReordering ? 'Done editing categories' : 'Edit categories'
            }
            aria-pressed={isReordering}
            onPress={() => {
              haptic()
              if (isReordering) void onSaveCategoryOrder()
              else {
                orderBeforeReordering.current = JSON.stringify(
                  stripPlaceholder(categories).map(({ subject, items }) => ({
                    subject,
                    items: items.map((item) => item.name),
                  })),
                )
                setIsReordering(true)
              }
            }}
            variant='flat'
            color={isReordering ? 'primary' : 'default'}
            className='h-10 w-full min-w-0 px-2'
          >
            {!isSavingOrder && (
              <span className='flex items-center gap-1'>
                <HoverableElement
                  uKey='edit-categories'
                  element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
                  hoveredElement={<PiNotePencilFill size={DEFAULT_ICON_SIZE} />}
                  withShift={false}
                />
              </span>
            )}
            {isReordering ? 'Done' : 'Edit categories'}
          </Button>
        </div>
        <div className='flex-1'>
          <HoverableElement
            uKey={RESET_CATEGORIES_BTN_TEXT}
            element={buttonWithIcon(
              <PiArrowClockwise size={DEFAULT_ICON_SIZE} />,
            )}
            hoveredElement={buttonWithIcon(
              <PiArrowClockwiseFill size={DEFAULT_ICON_SIZE} />,
            )}
            withShift={false}
          />
        </div>
      </div>
      <div className='mt-4 flex flex-col gap-1 md:mt-8'>
        <InfoText
          withDoubleAsterisk
          text='If necessary, it is better to customize all categories at once for yourself and not edit them in the future to avoid overlapping transaction category names.'
        />
        <InfoText text='Once editing, you will need to manually update your previous transactions with previous categories to new categories. You will see a badge on them.' />
        <InfoText
          id={ANCHOR_ROUTE.HINT1.slice(1)}
          text='The category subject does not affect the category data.'
        />
      </div>
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => {
            return (
              <>
                <ModalHeader className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} />
                  Delete category item
                </ModalHeader>
                <ModalBody>
                  <p className='text-default-500'>
                    Are you sure you want to delete{' '}
                    <span className='text-foreground font-medium'>
                      {pendingDeletion?.itemEmoji} {pendingDeletion?.itemName}
                    </span>
                    ? This change may affect how existing transactions are
                    categorized.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant='light' onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color='danger'
                    onPress={async () => {
                      try {
                        await confirmPendingDeletion()
                      } catch {
                        // The delete handler already reports the failure.
                      }
                    }}
                  >
                    Delete
                  </Button>
                </ModalFooter>
              </>
            )
          }}
        </ModalContent>
      </Modal>
      <Modal
        defaultOpen
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton={isLoading.reset}
        isDismissable={!isLoading.reset}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={onResetCategories}>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} /> Reset
                  categories
                </div>
              </ModalHeader>
              <ModalBody>
                <p className='text-default-500'>
                  Are you sure you want to reset your categories to the default
                  state? This action is irreversible and will{' '}
                  <span className='text-foreground'>
                    reset all your current category data to default.
                  </span>
                </p>
                {diffCategories.length > 0 && (
                  <div className='flex flex-col gap-2'>
                    <p className='text-default-500 text-sm'>
                      The following custom{' '}
                      {pluralize(
                        diffCategories.length,
                        'category',
                        'categories',
                      )}{' '}
                      will also be reset:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {diffCategories.map((item) => (
                        <Chip
                          key={`${item.emoji}-${item.name}`}
                          variant='flat'
                          color='danger'
                        >
                          {item.emoji} {item.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                <InfoText text='Once reset, if you have changed any categories in the past, you will need to manually update previous transactions that use those categories to the new default categories. You will see a badge on them.' />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant='light'
                  onPress={() => [haptic(), onClose()]}
                  isDisabled={isLoading.reset}
                >
                  Close
                </Button>
                <Button
                  type='submit'
                  color='danger'
                  isDisabled={isLoading.reset}
                  isLoading={isLoading.reset}
                  onPress={haptic}
                >
                  Reset
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default Categories
