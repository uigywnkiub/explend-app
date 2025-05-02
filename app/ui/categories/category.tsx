import { memo, useRef } from 'react'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
  PiFloppyDisk,
  PiFloppyDiskFill,
  PiNotePencil,
  PiNotePencilFill,
} from 'react-icons/pi'

import { useRouter } from 'next/navigation'

import { Button, Input, Tooltip } from '@heroui/react'
import { EmojiClickData } from 'emoji-picker-react'
import { AnimatePresence, motion } from 'framer-motion'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import {
  TCategoriesLoading,
  TEditingItemIndex,
  TTransaction,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import CategoryItem from './category-item'

type TProps = {
  category: TTransaction['categories'][number]
  index: number
  editingIndex: number | null
  newTargetName: string
  onEditTargetClick: (index: number, currentTarget: string) => void
  setNewTargetName: (name: string) => void
  onSaveTargetClick: (index: number) => void
  onEditItemClick: (
    categoryIndex: number,
    itemIndex: number,
    currentItemName: string,
  ) => void
  editingItemIndex: TEditingItemIndex | null
  newItemName: string
  setNewItemName: (name: string) => void
  onSaveItemClick: (categoryIndex: number, itemIndex: number) => void
  showEmojiPicker: boolean
  toggleEmojiPicker: () => void
  isLoading: TCategoriesLoading
  onEmojiClick: (emojiData: EmojiClickData) => void
  onResetEmojiClick: (categoryIndex: number, itemIndex: number) => void
  isNewEmojiPick: boolean
  onDeleteItemClick: (categoryIndex: number, itemIndex: number) => void
}

function Category({
  category,
  index,
  editingIndex,
  newTargetName,
  onEditTargetClick,
  setNewTargetName,
  onSaveTargetClick,
  onEditItemClick,
  editingItemIndex,
  newItemName,
  setNewItemName,
  onSaveItemClick,
  showEmojiPicker,
  toggleEmojiPicker,
  isLoading,
  onEmojiClick,
  onResetEmojiClick,
  isNewEmojiPick,
  onDeleteItemClick,
}: TProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // const isNewTargetNameInvalid = newTargetName.length < 1

  // const onTabPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Tab' && isNewTargetNameInvalid) {
  //     e.preventDefault()
  //     setNewTargetName(category.subject)

  //     inputRef.current?.blur()
  //   }
  // }

  return (
    <div className='mb-4 md:mb-8'>
      {editingIndex === index ? (
        <div className='mb-3 flex h-[40px] items-center justify-between gap-2 px-2 md:gap-4 md:px-4'>
          <Input
            ref={inputRef}
            isDisabled={isLoading.subject}
            type='text'
            aria-label={newTargetName}
            value={newTargetName}
            onChange={(e) => setNewTargetName(e.target.value)}
            // onKeyDown={onTabPress}
            placeholder={category.subject}
            size='lg'
            classNames={{
              input: '!placeholder:text-default-500 !text-foreground',
              base: 'w-fit',
            }}
            // endContent={
            //   <Kbd
            //     keys={['tab']}
            //     classNames={{
            //       base: cn(
            //         'hidden md:block',
            //         !isNewTargetNameInvalid &&
            //           // Internal classes.
            //           'opacity-disabled transition-transform-colors-opacity cursor-default',
            //       ),
            //     }}
            //   >
            //     Tab
            //   </Kbd>
            // }
          />
          <div className='flex gap-2'>
            <AnimatePresence>
              {!(
                isLoading.subject || newTargetName.trim() === category.subject
              ) && (
                <motion.div
                  key='reset-button'
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip
                    content='Reset category subject by your data'
                    placement='bottom'
                  >
                    <Button
                      onPress={() => {
                        setNewTargetName(category.subject)
                      }}
                      color='danger'
                      variant='flat'
                      className='min-w-4 px-4 font-medium md:min-w-20 md:px-0'
                    >
                      <HoverableElement
                        uKey={category.subject}
                        element={<PiArrowClockwise size={DEFAULT_ICON_SIZE} />}
                        hoveredElement={
                          <PiArrowClockwiseFill size={DEFAULT_ICON_SIZE} />
                        }
                        withShift={false}
                      />
                      <span className='hidden md:block'>Reset</span>
                    </Button>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onPress={() => onSaveTargetClick(index)}
              isLoading={isLoading.subject}
              isDisabled={newTargetName.length < 1}
              className='bg-foreground px-0 font-medium text-default-50'
            >
              {!isLoading.subject && (
                <HoverableElement
                  uKey={category.subject}
                  element={<PiFloppyDisk size={DEFAULT_ICON_SIZE} />}
                  hoveredElement={<PiFloppyDiskFill size={DEFAULT_ICON_SIZE} />}
                  withShift={false}
                />
              )}{' '}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className='mb-3 flex h-[40px] items-center justify-between gap-2 rounded-medium bg-background px-2 md:gap-4 md:px-4'>
          <h2 className='text-lg font-semibold md:text-xl'>
            {category.subject}
            <button className='ml-1 h-0' onClick={() => router.push('#hint-1')}>
              <sup className='cursor-pointer p-1 text-xs text-default-500 md:hover:text-foreground md:hover:opacity-hover'>
                1
              </sup>
            </button>
          </h2>
          <Tooltip content='Edit category subject' placement='bottom'>
            <Button
              onPress={() => onEditTargetClick(index, category.subject)}
              className='px-0 font-medium'
            >
              <HoverableElement
                uKey={category.subject}
                element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
                hoveredElement={<PiNotePencilFill size={DEFAULT_ICON_SIZE} />}
                withShift={false}
              />{' '}
              Edit
            </Button>
          </Tooltip>
        </div>
      )}
      <ul className='list-inside list-disc'>
        <AnimatePresence>
          {category.items?.map((item, itemIndex) => {
            return (
              <CategoryItem
                key={item.name}
                item={item}
                categoryIndex={index}
                itemIndex={itemIndex}
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
        </AnimatePresence>
      </ul>
    </div>
  )
}

export default memo(Category)
