import { memo } from 'react'
import {
  PiFloppyDisk,
  PiFloppyDiskFill,
  PiNotePencil,
  PiNotePencilFill,
} from 'react-icons/pi'

import { Button, Input } from '@heroui/react'
import { EmojiClickData } from 'emoji-picker-react'
import { motion } from 'framer-motion'

import { DEFAULT_CATEGORY, DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { MOTION_LIST } from '@/config/constants/motion'

import { cn } from '@/app/lib/helpers'
import type {
  TCategoriesLoading,
  TEditingItemIndex,
  TTransaction,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import CustomEmojiPicker from './custom-emoji-picker'

type TProps = {
  item: TTransaction['categories'][number]['items'][number]
  categoryIndex: number
  itemIndex: number
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
}

function CategoryItem({
  item,
  categoryIndex,
  itemIndex,
  onEditItemClick,
  editingItemIndex,
  newItemName,
  setNewItemName,
  onSaveItemClick,
  showEmojiPicker,
  toggleEmojiPicker,
  isLoading,
  onEmojiClick,
}: TProps) {
  return (
    <motion.li className='mb-3 flex items-center' {...MOTION_LIST(itemIndex)}>
      {editingItemIndex &&
      editingItemIndex.categoryIndex === categoryIndex &&
      editingItemIndex.itemIndex === itemIndex ? (
        <div className='w-full'>
          <div className='flex h-20 w-full items-center justify-between gap-2 rounded-medium bg-content1 p-2 text-left md:p-4 md:text-lg'>
            <div className='flex items-center gap-2 truncate break-keep md:gap-4'>
              <div
                className='cursor-pointer rounded-medium bg-content2 px-3 py-1 text-xl hover:bg-default-200 md:text-2xl'
                onClick={toggleEmojiPicker}
              >
                <div className='select-none pt-1.5'>{item.emoji}</div>
              </div>
              <Input
                isRequired
                isDisabled={isLoading.item}
                required
                type='text'
                aria-label={newItemName}
                value={newItemName}
                isInvalid={newItemName.length < 1}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={item.name}
                size='lg'
                classNames={{
                  input: '!placeholder:text-default-500 !text-foreground',
                }}
              />
            </div>
            <Button
              onPress={() => onSaveItemClick(categoryIndex, itemIndex)}
              isLoading={isLoading.item}
              isDisabled={newItemName.length < 1 || isLoading.item}
              className='bg-foreground px-0 font-medium text-default-50'
            >
              {!isLoading.item && (
                <HoverableElement
                  uKey={item.name}
                  element={<PiFloppyDisk size={DEFAULT_ICON_SIZE} />}
                  hoveredElement={<PiFloppyDiskFill size={DEFAULT_ICON_SIZE} />}
                  withShift={false}
                />
              )}{' '}
              Save
            </Button>
          </div>
          <div className={cn(showEmojiPicker && '-mt-4')}>
            <CustomEmojiPicker
              showEmojiPicker={showEmojiPicker}
              onEmojiClick={onEmojiClick}
            />
          </div>
        </div>
      ) : (
        <div className='flex h-20 w-full items-center justify-between gap-2 break-all rounded-medium bg-content1 p-2 text-left md:p-4'>
          <div className='flex items-center gap-2 truncate break-keep md:gap-4'>
            <div className='rounded-medium bg-content2 px-3 py-1 text-2xl'>
              <div className='select-none pt-1.5'>{item.emoji}</div>
            </div>
            <div>
              {item.name}
              {item.name === DEFAULT_CATEGORY && (
                <InfoText text='Default category' withAsterisk={false} />
              )}
            </div>
          </div>
          <Button
            onPress={() => onEditItemClick(categoryIndex, itemIndex, item.name)}
            isDisabled={item.name === DEFAULT_CATEGORY}
            className='px-0 font-medium'
          >
            <HoverableElement
              uKey={item.name}
              element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiNotePencilFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />{' '}
            Edit
          </Button>
        </div>
      )}
    </motion.li>
  )
}

export default memo(CategoryItem)
