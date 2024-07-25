import { memo } from 'react'
import {
  PiFloppyDisk,
  PiFloppyDiskFill,
  PiNotePencil,
  PiNotePencilFill,
} from 'react-icons/pi'

import { Button, Input } from '@nextui-org/react'
import EmojiPicker, {
  EmojiClickData,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from 'emoji-picker-react'
import { motion } from 'framer-motion'

import { DEFAULT_CATEGORY, DEFAULT_ICON_SIZE } from '@/config/constants/main'

import type {
  TCategoriesLoading,
  TEditingItemIndex,
  TTransaction,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import InfoBadge from '../info-badge'

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
  isLoading,
  onEmojiClick,
}: TProps) {
  return (
    <li className='mb-2 flex items-center'>
      {editingItemIndex &&
      editingItemIndex.categoryIndex === categoryIndex &&
      editingItemIndex.itemIndex === itemIndex ? (
        <div className='w-full'>
          <div className='text-md flex h-auto w-full items-center justify-between gap-2 rounded-medium bg-content1 p-3 text-left font-bold md:text-lg'>
            <div className='flex h-[52px] items-center'>
              <div className='z-10 mr-2 rounded-medium bg-content2 px-3 py-2 text-xl md:text-2xl'>
                <motion.div
                  drag
                  dragConstraints={{ top: 0, left: 0, bottom: 0, right: 0 }}
                >
                  {item.emoji}
                </motion.div>
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
                size='lg'
                classNames={{
                  input:
                    'border-none focus:ring-0 placeholder:text-default-500 font-bold text-md md:text-lg',
                }}
              />
            </div>
            <Button
              onClick={() => onSaveItemClick(categoryIndex, itemIndex)}
              isLoading={isLoading.item}
            >
              {!isLoading.item && (
                <HoverableElement
                  element={<PiFloppyDisk size={DEFAULT_ICON_SIZE} />}
                  hoveredElement={<PiFloppyDiskFill size={DEFAULT_ICON_SIZE} />}
                  withShift={false}
                />
              )}{' '}
              Save
            </Button>
          </div>
          {showEmojiPicker && (
            <EmojiPicker
              lazyLoadEmojis
              onEmojiClick={onEmojiClick}
              searchPlaceHolder='Search emoji...'
              // width={300}
              // height={400}
              theme={Theme.AUTO}
              suggestedEmojisMode={SuggestionMode.RECENT}
              skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
              className='my-2'
            />
          )}
        </div>
      ) : (
        <div className='text-md flex h-auto w-full items-center justify-between gap-2 rounded-medium bg-content1 p-3 text-left font-bold md:text-lg'>
          <div className='flex h-[52px] items-center'>
            <div className='z-10 mr-2 rounded-medium bg-content2 px-3 py-2 text-xl md:text-2xl'>
              <motion.div
                drag
                dragConstraints={{ top: 0, left: 0, bottom: 0, right: 0 }}
              >
                {item.emoji}
              </motion.div>
            </div>
            <div className='overflow-hidden text-ellipsis whitespace-nowrap text-balance'>
              {item.name}{' '}
              {item.name === DEFAULT_CATEGORY && (
                <InfoBadge text='Default category cannot be edited.' />
              )}
            </div>
          </div>
          <Button
            onClick={() => onEditItemClick(categoryIndex, itemIndex, item.name)}
            isDisabled={item.name === DEFAULT_CATEGORY}
          >
            <HoverableElement
              element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiNotePencilFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />{' '}
            Edit
          </Button>
        </div>
      )}
    </li>
  )
}

export default memo(CategoryItem)
