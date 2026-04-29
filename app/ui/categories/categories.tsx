'use client'

import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
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
import { haptic } from 'ios-haptics'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { resetCategories, updateCategories } from '@/app/lib/actions'
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
  TTransaction,
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
  userCategories: TTransaction['categories']
  areCategoriesLengthMismatch: boolean
}

function Categories({
  userId,
  userCategories,
  areCategoriesLengthMismatch,
}: TProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isLoading, setIsLoading] = useState<TCategoriesLoading>({
    subject: false,
    item: false,
    reset: false,
  })
  const [isNewEmojiPick, setIsNewEmojiPick] = useState(false)

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
      const updatedCategories = [...categories]
      const oldItemName = updatedCategories[categoryIndex].items[itemIndex].name
      const _newItemName = capitalizeFirstLetter(newItemName).trim()

      if (oldItemName === _newItemName && !isNewEmojiPick) {
        setEditingItemIndex(null)
        setNewItemName('')
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
      stripPlaceholder,
      updateCategoriesState,
      userId,
      withPlaceholder,
    ],
  )

  const onDeleteItemClick = useCallback(
    async (categoryIndex: number, itemIndex: number) => {
      const category = categories[categoryIndex]
      const itemToDelete = category.items[itemIndex]

      if (!itemToDelete || itemToDelete.__isPlaceholder) {
        haptic.error()
        toast.error('Category not found or cannot delete placeholder.')

        return
      }

      const updatedCategories = [...categories]
      category.items.splice(itemIndex, 1)

      const isNoCategoryItems =
        stripPlaceholder([category])[0].items.length === 0
      if (isNoCategoryItems) {
        updatedCategories.splice(categoryIndex, 1)
      }

      updateCategoriesState(() => updatedCategories)
      setShowEmojiPicker(false)
      setEditingItemIndex(null)

      try {
        const newCategoriesData = {
          subject: category.subject,
          items: stripPlaceholder([category])[0].items.filter((i) =>
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

  const buttonWithIcon = (icon: TIcon) => (
    <Button
      isDisabled={haveCategoriesChanged}
      className='bg-danger text-default-50 mx-auto w-full font-medium'
      onPress={() => [haptic(), onOpen()]}
      startContent={icon}
    >
      {RESET_CATEGORIES_BTN_TEXT}
    </Button>
  )

  return (
    <>
      {categories.map((category, index) => {
        return (
          <Category
            key={category.subject}
            category={category}
            index={index}
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
        )
      })}
      {areCategoriesLengthMismatch && (
        <div className='mb-4'>
          <WarningText
            text='We detected a mismatch between your current categories and the default ones.'
            actionText={`Press "${RESET_CATEGORIES_BTN_TEXT}" button to restore the default and overwrite your current categories.`}
          />
        </div>
      )}
      <div className='mx-auto max-w-md'>
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
      <div className='mt-4 flex flex-col gap-1 md:mt-8'>
        <InfoText
          withDoubleAsterisk
          text='If necessary, it is better to customize all categories at once for yourself and not edit them in the future to avoid overlapping transaction category names.'
        />
        <InfoText text='Once editing, you will need to manually update your previous transactions with previous categories to new categories. You will see a badge on them.' />
        <InfoText text='The emoji picker may appear with a slight delay.' />
        <InfoText
          id='hint-1'
          text='1. The category subject does not affect the category data.'
          withAsterisk={false}
        />
      </div>
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
                          color='warning'
                        >
                          {item.emoji} {item.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                <InfoText text='Once reset, you will need to manually update your previous transactions with previous categories to new default categories. You will see a badge on them.' />
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
