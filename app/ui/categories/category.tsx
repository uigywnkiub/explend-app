import { memo } from 'react'
import {
  PiFloppyDisk,
  PiFloppyDiskFill,
  PiNotePencil,
  PiNotePencilFill,
} from 'react-icons/pi'

import { Button, Input } from '@nextui-org/react'
import { EmojiClickData } from 'emoji-picker-react'

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
  isLoading: TCategoriesLoading
  onEmojiClick: (emojiData: EmojiClickData) => void
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
  isLoading,
  onEmojiClick,
}: TProps) {
  return (
    <div className='mb-4 md:mb-8'>
      {editingIndex === index ? (
        <div className='mb-2 flex h-[40px] items-center justify-between gap-2 pr-3'>
          <Input
            isRequired
            isDisabled={isLoading.subject}
            required
            type='text'
            aria-label={newTargetName}
            value={newTargetName}
            isInvalid={newTargetName.length < 1}
            onChange={(e) => setNewTargetName(e.target.value)}
            size='lg'
            classNames={{
              input:
                'border-none focus:ring-0 placeholder:text-default-500 font-bold text-lg md:text-xl',
              base: 'w-fit',
            }}
          />
          <Button
            onClick={() => onSaveTargetClick(index)}
            isLoading={isLoading.subject}
          >
            {!isLoading.subject && (
              <HoverableElement
                element={<PiFloppyDisk size={DEFAULT_ICON_SIZE} />}
                hoveredElement={<PiFloppyDiskFill size={DEFAULT_ICON_SIZE} />}
                withShift={false}
              />
            )}{' '}
            Save
          </Button>
        </div>
      ) : (
        <div className='mb-2 flex items-center justify-between gap-2 px-3'>
          <h2 className='text-lg font-semibold md:text-xl'>
            {category.subject}
          </h2>
          <Button onClick={() => onEditTargetClick(index, category.subject)}>
            <HoverableElement
              element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiNotePencilFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />{' '}
            Edit
          </Button>
        </div>
      )}
      <ul className='list-inside list-disc'>
        {category.items?.map((item, itemIndex) => (
          <CategoryItem
            key={itemIndex}
            item={item}
            categoryIndex={index}
            itemIndex={itemIndex}
            onEditItemClick={onEditItemClick}
            editingItemIndex={editingItemIndex}
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            onSaveItemClick={onSaveItemClick}
            showEmojiPicker={showEmojiPicker}
            isLoading={isLoading}
            onEmojiClick={onEmojiClick}
          />
        ))}
      </ul>
    </div>
  )
}

export default memo(Category)
