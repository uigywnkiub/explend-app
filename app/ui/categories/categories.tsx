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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
import { EmojiClickData } from 'emoji-picker-react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { resetCategories, updateCategories } from '@/app/lib/actions'
import { deepCloneCategories } from '@/app/lib/data'
import { capitalizeFirstLetter, deepCompareArrays } from '@/app/lib/helpers'
import type {
  TCategoriesLoading,
  TEditingItemIndex,
  TTransaction,
  TUserId,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import WarningText from '../warning-text'
import Category from './category'

const RESET_CATEGORIES_BTN_TEXT = 'Reset categories'

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
  const [categories, setCategories] = useState(userCategories)
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

  const toggleEmojiPicker = useCallback(
    () => setShowEmojiPicker((prev) => !prev),
    [],
  )

  const onSaveTargetClick = useCallback(
    async (index: number) => {
      const updatedCategories = [...categories]
      const oldTargetName = updatedCategories[index].subject
      const _newTargetName = capitalizeFirstLetter(newTargetName).trim()

      if (oldTargetName === _newTargetName) {
        setEditingIndex(null)
        setNewTargetName('')
        // toast.error('No changes detected.')

        return
      }

      updatedCategories[index].subject = _newTargetName
      setCategories(updatedCategories)

      const newCategoriesData = {
        subject: _newTargetName,
        items: updatedCategories[index].items,
      }
      setIsLoading({ subject: true, item: false, reset: false })
      try {
        await updateCategories(userId, oldTargetName, newCategoriesData)
        toast.success('Categories updated.')
      } catch (err) {
        toast.error('Failed to update categories.')
        throw err
      } finally {
        setEditingIndex(null)
        setNewTargetName('')
        setIsLoading({ subject: false, item: false, reset: false })
      }
    },
    [categories, newTargetName, userId],
  )

  const onEditItemClick = useCallback(
    (categoryIndex: number, itemIndex: number, currentItemName: string) => {
      setEditingItemIndex({ categoryIndex, itemIndex })
      setNewItemName(currentItemName)
      setShowEmojiPicker(true)
    },
    [],
  )

  const onEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      if (editingItemIndex) {
        const { categoryIndex, itemIndex } = editingItemIndex
        const updatedCategories = [...categories]
        updatedCategories[categoryIndex].items[itemIndex].emoji =
          emojiData.emoji

        setIsNewEmojiPick(true)
        setCategories(updatedCategories)
        // setShowEmojiPicker(false)
      }
    },
    [categories, editingItemIndex],
  )

  const onResetEmojiClick = useCallback(
    (categoryIndex: number, itemIndex: number) => {
      const originalEmoji =
        originalUserCategories[categoryIndex].items[itemIndex].emoji
      const updatedCategories = [...categories]
      updatedCategories[categoryIndex].items[itemIndex].emoji = originalEmoji

      setCategories(updatedCategories)
      setIsNewEmojiPick(false)
    },
    [categories, originalUserCategories],
  )

  const onSaveItemClick = useCallback(
    async (categoryIndex: number, itemIndex: number) => {
      const updatedCategories = [...categories]
      const oldItemName = updatedCategories[categoryIndex].items[itemIndex].name
      const _newItemName = capitalizeFirstLetter(newItemName).trim()

      if (oldItemName === _newItemName && !isNewEmojiPick) {
        setEditingItemIndex(null)
        setNewItemName('')
        // toast.error('No changes detected.')

        return
      }

      updatedCategories[categoryIndex].items[itemIndex].name = _newItemName
      setCategories(updatedCategories)

      const newCategoriesData = {
        subject: updatedCategories[categoryIndex].subject,
        items: updatedCategories[categoryIndex].items,
      }

      setIsLoading({ subject: false, item: true, reset: false })
      setShowEmojiPicker(false)
      try {
        await updateCategories(
          userId,
          newCategoriesData.subject,
          newCategoriesData,
        )
        toast.success('Categories updated.')
      } catch (err) {
        toast.error('Failed to update categories.')
        throw err
      } finally {
        setEditingItemIndex(null)
        setNewItemName('')
        setIsNewEmojiPick(false)
        setIsLoading({ subject: false, item: false, reset: false })
      }
    },
    [categories, isNewEmojiPick, newItemName, userId],
  )

  const onDeleteItemClick = useCallback(
    async (categoryIndex: number, itemIndex: number) => {
      const updatedCategories = [...categories]
      const category = updatedCategories[categoryIndex]
      const itemToDelete = category.items[itemIndex]

      if (!itemToDelete) {
        toast.error('Item not found.')

        return
      }

      category.items.splice(itemIndex, 1)

      const isNoCategoryItems = category.items.length === 0

      if (isNoCategoryItems) {
        updatedCategories.splice(categoryIndex, 1)
      }

      setCategories(updatedCategories)
      setShowEmojiPicker(false)
      setEditingItemIndex(null)

      try {
        await updateCategories(userId, category.subject, {
          subject: category.subject,
          items: category.items,
        })

        if (isNoCategoryItems) {
          toast.success('Item and subject deleted.')
        } else {
          toast.success('Item deleted.')
        }
      } catch (err) {
        if (isNoCategoryItems) {
          toast.error('Failed to delete item and subject.')
        } else {
          toast.error('Failed to delete item.')
        }
        throw err
      }
    },
    [categories, userId],
  )

  const haveCategoriesChanged = useMemo(
    () => deepCompareArrays(categories, DEFAULT_CATEGORIES),
    [categories],
  )

  const onResetCategories = useCallback(async () => {
    setIsLoading({ subject: false, item: false, reset: true })
    try {
      await resetCategories(userId, DEFAULT_CATEGORIES)
      toast.success('All categories reset.')
    } catch (err) {
      toast.error('Failed to reset categories.')
      throw err
    } finally {
      setIsLoading({ subject: false, item: false, reset: false })
    }
  }, [userId])

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
        <Button
          isDisabled={haveCategoriesChanged}
          className='mx-auto w-full bg-danger font-medium text-default-50'
          onPress={onOpen}
          startContent={
            <HoverableElement
              uKey='reset-categories'
              element={<PiArrowClockwise size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiArrowClockwiseFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />
          }
        >
          {RESET_CATEGORIES_BTN_TEXT}
        </Button>
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
                <InfoText text='Once reset, you will need to manually update your previous transactions with previous categories to new default categories. You will see a badge on them.' />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant='light'
                  onPress={onClose}
                  isDisabled={isLoading.reset}
                >
                  Close
                </Button>
                <Button
                  type='submit'
                  color='danger'
                  isDisabled={isLoading.reset}
                  isLoading={isLoading.reset}
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
