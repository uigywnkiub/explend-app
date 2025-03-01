import { memo } from 'react'
import {
  PiFloppyDisk,
  PiFloppyDiskFill,
  PiNotePencil,
  PiNotePencilFill,
} from 'react-icons/pi'

import { useRouter } from 'next/navigation'

import { Button, Input } from '@heroui/react'
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
  toggleEmojiPicker: () => void
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
  toggleEmojiPicker,
  isLoading,
  onEmojiClick,
}: TProps) {
  const router = useRouter()

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
            color='success'
            classNames={{
              input:
                'border-none focus:ring-0 placeholder:text-default-500 font-semibold text-lg md:text-xl',
              base: 'w-fit',
            }}
          />
          <Button
            onPress={() => onSaveTargetClick(index)}
            isLoading={isLoading.subject}
            color='success'
            className='px-0 font-medium text-background'
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
      ) : (
        <div className='mb-2 flex items-center justify-between gap-2 px-3 font-semibold'>
          <h2 className='text-lg md:text-xl'>
            {category.subject}
            <button className='ml-1 h-0' onClick={() => router.push('#hint-1')}>
              <sup className='cursor-pointer p-1 text-xs text-default-500 underline md:hover:text-foreground md:hover:no-underline md:hover:opacity-hover'>
                1
              </sup>
            </button>
          </h2>
          <Button
            onPress={() => onEditTargetClick(index, category.subject)}
            className='bg-foreground px-0 font-medium text-default-50'
          >
            <HoverableElement
              uKey={category.subject}
              element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiNotePencilFill size={DEFAULT_ICON_SIZE} />}
              withShift={false}
            />{' '}
            Edit
          </Button>
        </div>
      )}
      <ul className='list-inside list-disc'>
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
            />
          )
        })}
      </ul>
    </div>
  )
}

export default memo(Category)
