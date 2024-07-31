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
} from '@nextui-org/react'
import { EmojiClickData } from 'emoji-picker-react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { updateCategories } from '@/app/lib/actions'
import { resetCategories } from '@/app/lib/actions'
import {
  TCategoriesLoading,
  TEditingItemIndex,
  TTransaction,
  TUserId,
} from '@/app/lib/types'
import { capitalizeFirstLetter, deepCompareArrays } from '@/app/lib/utils'

import { HoverableElement } from '../hoverables'
import InfoBadge from '../info-badge'
import Category from './category'

type TProps = {
  userId: TUserId
  userCategories: TTransaction['categories']
}

function Categories({ userId, userCategories }: TProps) {
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
        toast.error('No changes detected.')
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
        setShowEmojiPicker(false)
      }
    },
    [categories, editingItemIndex],
  )

  const onSaveItemClick = useCallback(
    async (categoryIndex: number, itemIndex: number) => {
      const updatedCategories = [...categories]
      const oldItemName = updatedCategories[categoryIndex].items[itemIndex].name
      const _newItemName = capitalizeFirstLetter(newItemName).trim()

      if (oldItemName === _newItemName && !isNewEmojiPick) {
        setEditingItemIndex(null)
        setNewItemName('')
        toast.error('No changes detected.')
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

  const haveCategoriesChanged = useMemo(
    () => deepCompareArrays(categories, DEFAULT_CATEGORIES),
    [categories],
  )

  const onResetCategories = useCallback(async () => {
    setIsLoading({ subject: false, item: false, reset: true })
    try {
      await resetCategories(userId, DEFAULT_CATEGORIES)
      toast.success('Categories reset.')
    } catch (err) {
      toast.error('Failed to reset categories.')
      throw err
    } finally {
      setIsLoading({ subject: false, item: false, reset: false })
    }
  }, [userId])

  return (
    <>
      <div className='mb-4'>
        <InfoBadge
          withAsterisk={false}
          text='1. If necessary, it is better to customize all categories at once for yourself and not edit them in the future to avoid overlapping transaction category names.'
        />
        <br />
        <InfoBadge
          withAsterisk={false}
          text='2. Once editing, you will need to manually update your previous transactions with previous categories to new categories. You will see a badge on them.'
        />
        <br />
        <InfoBadge
          withAsterisk={false}
          text='3. The category subject does not affect the category data. It is just a subject name.'
        />
        <br />
        <InfoBadge
          withAsterisk={false}
          text='4. The emoji picker may appear with a slight delay.'
        />
      </div>
      {categories.map((category, index) => (
        <Category
          key={index}
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
        />
      ))}
      <div className='mx-auto max-w-md'>
        <Button
          isDisabled={haveCategoriesChanged}
          className='mx-auto w-full bg-danger font-medium text-default-50'
          onClick={onOpen}
          startContent={
            <HoverableElement
              element={<PiArrowClockwise size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiArrowClockwiseFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />
          }
        >
          Reset categories
        </Button>
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
                  state? This action is irreversible and will reset all your
                  current category data to default.
                </p>
                <InfoBadge text='Once reset, you will need to manually update your previous transactions with previous categories to new default categories. You will see a badge on them.' />
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
