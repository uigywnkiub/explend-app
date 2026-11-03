import { memo, useRef } from 'react'
import {
  PiArrowClockwise,
  PiArrowClockwiseFill,
  PiDotsSixVerticalBold,
  PiFloppyDisk,
  PiFloppyDiskFill,
  PiNotePencil,
  PiNotePencilFill,
  PiPlus,
  PiPlusFill,
  PiTrash,
  PiTrashFill,
} from 'react-icons/pi'

import Link from 'next/link'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { Badge, Button, Input, Tooltip } from '@heroui/react'
import { EmojiClickData } from 'emoji-picker-react'
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from 'framer-motion'
import { haptic } from 'ios-haptics'

import { DEFAULT_CATEGORY, DEFAULT_ICON_SIZE } from '@/config/constants/main'
import {
  MOTION_COLLAPSE,
  MOTION_LIST,
  MOTION_REORDER_HANDLE,
} from '@/config/constants/motion'

import {
  capitalizeFirstLetter,
  createSearchHrefWithKeyword,
  toLowerCase,
} from '@/app/lib/helpers'
import type {
  TCategories,
  TCategoriesItem,
  TCategoriesLoading,
  TEditingItemIndex,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import CustomEmojiPicker from './custom-emoji-picker'

type TProps = {
  item: TCategoriesItem
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
  onResetEmojiClick: (categoryIndex: number, itemIndex: number) => void
  isNewEmojiPick: boolean
  onDeleteItemClick: (categoryIndex: number, itemIndex: number) => void
  placeholderItemName: TCategoriesItem['name']
  originalUserCategories: TCategories[]
  isReordering: boolean
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
  onResetEmojiClick,
  isNewEmojiPick,
  onDeleteItemClick,
  placeholderItemName,
  originalUserCategories,
  isReordering,
}: TProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragControls = useDragControls()

  const isNewCategory = [...DEFAULT_CATEGORIES, ...originalUserCategories].some(
    (c) => c.items.some((i) => toLowerCase(i.name) === toLowerCase(item.name)),
  )
  const isDefaultCategory = DEFAULT_CATEGORIES.some((c) =>
    c.items.some(
      (i) =>
        toLowerCase(i.name) === toLowerCase(item.name) &&
        i.emoji === item.emoji,
    ),
  )

  // const isNewItemNameInvalid = newItemName.length < 1

  // const onTabPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Tab' && isNewItemNameInvalid) {
  //     e.preventDefault()
  //     setNewItemName(item.name)

  //     inputRef.current?.blur()
  //   }
  // }

  const itemContent = (
    <>
      {editingItemIndex &&
      editingItemIndex.categoryIndex === categoryIndex &&
      editingItemIndex.itemIndex === itemIndex ? (
        <div className='w-full'>
          <div className='rounded-medium bg-content1 flex h-20 w-full items-center justify-between gap-2 p-2 text-left md:p-4 md:text-lg'>
            <div className='flex items-center gap-2 truncate break-keep md:gap-4'>
              <Tooltip
                content={
                  showEmojiPicker ? 'Close emoji picker' : 'Open emoji picker'
                }
                placement='bottom'
              >
                <div
                  role='button'
                  className='rounded-medium bg-content2 hover:bg-default-200 cursor-pointer px-3 py-1 text-2xl'
                  onClick={toggleEmojiPicker}
                >
                  <div className='pt-1.5 select-none'>{item.emoji}</div>
                </div>
              </Tooltip>
              <Input
                ref={inputRef}
                isDisabled={isLoading.item}
                type='text'
                aria-label={newItemName}
                value={newItemName}
                onChange={(e) =>
                  setNewItemName(capitalizeFirstLetter(e.target.value))
                }
                // onKeyDown={onTabPress}
                placeholder={item.name || placeholderItemName}
                size='lg'
                classNames={{
                  input: '!placeholder:text-default-500 text-foreground!',
                }}
                // endContent={
                //   <Kbd
                //     keys={['tab']}
                //     classNames={{
                //       base: cn(
                //         'hidden md:block',
                //         !isNewItemNameInvalid &&
                //           // Internal classes.
                //           'opacity-disabled transition-transform-colors-opacity cursor-default',
                //       ),
                //     }}
                //   >
                //     Tab
                //   </Kbd>
                // }
              />
            </div>
            <div className='flex gap-2'>
              <AnimatePresence>
                {!(
                  isLoading.item ||
                  (newItemName.trim() === item.name && !isNewEmojiPick)
                ) &&
                  !item.__isPlaceholder &&
                  !item.__isNew && (
                    <motion.div
                      key='reset-button'
                      initial={{ opacity: 0, x: 40, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 40, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Tooltip
                        content='Reset category by your data'
                        placement='bottom'
                      >
                        <Button
                          onPress={() => {
                            haptic()
                            setNewItemName(item.name)
                            onResetEmojiClick(categoryIndex, itemIndex)
                          }}
                          color='danger'
                          variant='flat'
                          className='min-w-4 px-4 font-medium md:min-w-20 md:px-0'
                        >
                          <HoverableElement
                            uKey={item.name}
                            element={
                              <PiArrowClockwise size={DEFAULT_ICON_SIZE} />
                            }
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

              {!item.__isPlaceholder && !item.__isNew && !isLoading.item && (
                <Tooltip content='Delete category' placement='bottom'>
                  <Button
                    onPress={() => [
                      haptic(),
                      onDeleteItemClick(categoryIndex, itemIndex),
                    ]}
                    color='danger'
                    className='min-w-4 px-4 font-medium'
                  >
                    <HoverableElement
                      uKey={item.name}
                      element={<PiTrash size={DEFAULT_ICON_SIZE} />}
                      hoveredElement={<PiTrashFill size={DEFAULT_ICON_SIZE} />}
                      withShift={false}
                    />
                  </Button>
                </Tooltip>
              )}

              <Tooltip content='Save category' placement='bottom'>
                <Button
                  onPress={() => [
                    haptic(),
                    onSaveItemClick(categoryIndex, itemIndex),
                  ]}
                  isLoading={isLoading.item}
                  isDisabled={newItemName.length < 1 || isLoading.item}
                  className='bg-foreground text-default-50 min-w-4 px-4 font-medium md:min-w-20 md:px-0'
                >
                  {!isLoading.item && (
                    <HoverableElement
                      uKey={item.name}
                      element={<PiFloppyDisk size={DEFAULT_ICON_SIZE} />}
                      hoveredElement={
                        <PiFloppyDiskFill size={DEFAULT_ICON_SIZE} />
                      }
                      withShift={false}
                    />
                  )}
                  <span className='hidden md:block'>Save</span>
                </Button>
              </Tooltip>
            </div>
          </div>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div {...MOTION_COLLAPSE} className='-mt-4'>
                <CustomEmojiPicker onEmojiClick={onEmojiClick} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Badge
          content=''
          shape='rectangle'
          color='default'
          variant='flat'
          size='sm'
          isDot
          isInvisible={
            isDefaultCategory ||
            item.__isPlaceholder ||
            toLowerCase(item.name) === toLowerCase(placeholderItemName)
          }
          placement='top-right'
          classNames={{ base: 'w-full', badge: 'right-1 top-1' }}
        >
          <div className='rounded-medium bg-content1 flex h-20 w-full items-center justify-between gap-2 p-2 text-left break-all md:p-4'>
            <div className='flex items-center gap-2 truncate break-keep md:gap-4'>
              <AnimatePresence>
                {isReordering && !item.__isPlaceholder && !item.__isNew && (
                  <motion.div
                    {...MOTION_REORDER_HANDLE}
                    className='flex shrink-0 items-center overflow-hidden'
                  >
                    <Tooltip content='Drag to reorder' placement='left'>
                      <button
                        type='button'
                        aria-label={`Drag to reorder ${item.name}`}
                        onPointerDown={(event) => dragControls.start(event)}
                        className='flex h-6 w-6 cursor-grab touch-none items-center justify-center active:cursor-grabbing'
                      >
                        <PiDotsSixVerticalBold size={DEFAULT_ICON_SIZE} />
                      </button>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
              <Tooltip
                content={
                  isDefaultCategory ? 'Default category' : 'Custom category'
                }
                isDisabled={
                  toLowerCase(item.name) === toLowerCase(placeholderItemName)
                }
                placement='bottom'
              >
                <div className='rounded-medium bg-content2 px-3 py-1 text-2xl'>
                  <div className='pt-1.5 select-none'>{item.emoji}</div>
                </div>
              </Tooltip>
              <div className='truncate'>
                {!isDefaultCategory &&
                toLowerCase(item.name) === toLowerCase(placeholderItemName) ? (
                  <p className='cursor-default'>{item.name}</p>
                ) : (
                  <>
                    <Link
                      href={createSearchHrefWithKeyword(item.name)}
                      className='hover:opacity-hover'
                    >
                      {item.name}
                    </Link>
                    {item.name === DEFAULT_CATEGORY && (
                      <InfoText text='Default category' withAsterisk={false} />
                    )}
                  </>
                )}
              </div>
            </div>
            {(!isNewCategory || isReordering) && (
              <Tooltip
                content={!isNewCategory ? 'Add category' : 'Edit category'}
                placement='bottom'
              >
                <Button
                  onPress={() => {
                    haptic()
                    onEditItemClick(categoryIndex, itemIndex, item.name)
                  }}
                  isDisabled={item.name === DEFAULT_CATEGORY}
                  className='px-0 font-medium'
                >
                  {isNewCategory ? (
                    <>
                      <HoverableElement
                        uKey={item.name}
                        element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
                        hoveredElement={
                          <PiNotePencilFill size={DEFAULT_ICON_SIZE} />
                        }
                        withShift={false}
                      />{' '}
                      Edit
                    </>
                  ) : (
                    <>
                      <HoverableElement
                        uKey={item.name}
                        element={<PiPlus size={DEFAULT_ICON_SIZE} />}
                        hoveredElement={<PiPlusFill size={DEFAULT_ICON_SIZE} />}
                        withShift={false}
                      />{' '}
                      Add
                    </>
                  )}
                </Button>
              </Tooltip>
            )}
          </div>
        </Badge>
      )}
    </>
  )

  if (isReordering) {
    return (
      <Reorder.Item
        value={item}
        layout='position'
        dragListener={false}
        dragControls={dragControls}
        whileDrag={{ zIndex: 50 }}
        className='rounded-medium relative z-0 mb-3 flex items-center shadow-xs'
      >
        {itemContent}
      </Reorder.Item>
    )
  }

  return (
    <motion.li
      className='rounded-medium relative mb-3 flex items-center shadow-xs'
      {...MOTION_LIST(itemIndex)}
    >
      {itemContent}
    </motion.li>
  )
}

export default memo(CategoryItem)
