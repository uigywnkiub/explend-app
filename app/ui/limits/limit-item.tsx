import {
  PiDotsSixVerticalBold,
  PiDotsThreeOutlineVerticalFill,
  PiNotePencil,
  PiNotePencilFill,
  PiTrash,
  PiTrashFill,
} from 'react-icons/pi'

import Link from 'next/link'

import {
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Tooltip,
} from '@heroui/react'
import { Reorder, useDragControls } from 'framer-motion'

import {
  DEFAULT_CATEGORY_EMOJI,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'
import { MOTION_LIST } from '@/config/constants/motion'

import {
  createSearchHrefWithKeyword,
  formatPercentage,
  getCategoryWithEmoji,
  getEmojiFromCategory,
  getFormattedCurrency,
} from '@/app/lib/helpers'
import { TCalculatedLimits, TTransaction } from '@/app/lib/types'

import AnimatedNumber from '../animated-number'
import { HoverableElement } from '../hoverables'
import { DROPDOWN_KEY } from './limits'

type TProps = {
  data: TCalculatedLimits
  idx: number
  currency: TTransaction['currency']
  userCategories: TTransaction['categories']
  changedCategoryNames: string[]
  reorderContainer: React.RefObject<null>
  onAction: (key: string, categoryName: string) => void
}

function LimitItem({
  data,
  idx,
  currency,
  userCategories,
  changedCategoryNames,
  reorderContainer,
  onAction,
}: TProps) {
  const dragControls = useDragControls()

  const {
    categoryName,
    difference,
    limitAmount,
    isLimitOver,
    currMonthAmount,
    prevMonthAmount,
    currMonthPercentage,
    prevMonthPercentage,
  } = data

  const isChangedCategoryName = changedCategoryNames.includes(categoryName)

  const growthRate =
    prevMonthAmount > 0
      ? ((currMonthAmount - prevMonthAmount) / prevMonthAmount) * 100
      : 0

  const isIncreasedAmountByCurrMonth =
    currMonthAmount > 0 &&
    currMonthAmount >= prevMonthAmount &&
    currMonthPercentage

  return (
    <Reorder.Item
      key={categoryName}
      value={categoryName}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={reorderContainer}
      dragElastic={0.1}
      {...MOTION_LIST(idx)}
      className='rounded-medium bg-content1 relative flex items-center justify-between py-3'
    >
      <div className='flex items-center text-balance md:w-1/2'>
        <Tooltip content='Drag to reorder' placement='left'>
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className='mr-2 cursor-grab touch-none'
          >
            <PiDotsSixVerticalBold size={DEFAULT_ICON_SIZE} />
          </div>
        </Tooltip>
        <p className='-mb-1.5 text-xl md:text-2xl'>
          {isChangedCategoryName
            ? DEFAULT_CATEGORY_EMOJI
            : getEmojiFromCategory(
                getCategoryWithEmoji(categoryName, userCategories),
              )}
        </p>
        <div className='mb-2 ml-2 w-full'>
          <div className='mb-2 text-left'>
            <Tooltip content='Search by category' placement='top'>
              <Link
                href={createSearchHrefWithKeyword(categoryName)}
                className={cn(
                  'hover:opacity-hover -mt-3 truncate text-balance md:-mt-1.5',
                  isChangedCategoryName && 'text-default-500 line-through',
                )}
              >
                {categoryName}
              </Link>
            </Tooltip>
            {isChangedCategoryName && (
              <p className='text-xs'>No longer exists</p>
            )}
          </div>
          <Tooltip
            content={
              <div
                className={cn(
                  'from-secondary to-success flex justify-center gap-3 bg-linear-to-r bg-clip-text p-2 text-xs text-transparent',
                  !isIncreasedAmountByCurrMonth &&
                    prevMonthAmount !== 0 &&
                    currMonthAmount !== 0 &&
                    'flex-row-reverse bg-linear-to-l',
                  isLimitOver && 'to-danger',
                )}
              >
                <div className={cn('flex flex-col items-center')}>
                  <span className='text-default-500 pb-2'>Previous</span>
                  <span>{`${formatPercentage(prevMonthPercentage)} %`}</span>
                  <span>
                    {getFormattedCurrency(prevMonthAmount)} {currency.sign}
                  </span>
                </div>
                <div className='bg-default w-px' />
                <div className='flex flex-col items-center'>
                  <span className='text-default-500 pb-2'>Trend</span>
                  <div className='flex flex-col items-center'>
                    <span>{isIncreasedAmountByCurrMonth ? '↑' : '↓'}</span>
                    <span>
                      {prevMonthAmount > 0
                        ? `${formatPercentage(growthRate, true)} %`
                        : '—'}
                    </span>
                  </div>
                </div>
                <div className='bg-default w-px' />
                <div className={cn('flex flex-col items-center')}>
                  <span className='text-default-500 pb-2'>Current</span>
                  <span>{`${formatPercentage(currMonthPercentage)} %`}</span>
                  <span>
                    {getFormattedCurrency(currMonthAmount)} {currency.sign}
                  </span>
                </div>
              </div>
            }
            placement='bottom'
          >
            <div className='bg-default absolute -mt-0.5 h-[5px] w-[30%] rounded-full md:relative md:w-full'>
              <div
                className={cn(
                  'bg-secondary/50 absolute h-[5px] rounded-full',
                  isIncreasedAmountByCurrMonth && 'z-10',
                )}
                style={{ width: `${prevMonthPercentage}%` }}
              />
              <div
                className={cn(
                  'absolute h-[5px] rounded-full',
                  isLimitOver ? 'bg-danger' : 'bg-success',
                )}
                style={{ width: `${currMonthPercentage}%` }}
              />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <div className='text-right'>
          <p>
            <AnimatedNumber value={limitAmount} /> {currency.code}
          </p>
          <p
            className={cn(
              'text-xs',
              isLimitOver ? 'text-danger' : 'text-success',
            )}
          >
            {isLimitOver ? (
              <>
                over by <AnimatedNumber value={Math.abs(difference)} />{' '}
                {currency.code}
              </>
            ) : (
              <>
                left <AnimatedNumber value={difference} /> {currency.code}
              </>
            )}
          </p>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant='light'
              isIconOnly
              size='md'
              className='z-0 md:size-10'
            >
              <PiDotsThreeOutlineVerticalFill className='fill-foreground size-4' />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Limit actions'
            onAction={(key) => onAction(key as string, categoryName)}
          >
            <DropdownSection title='Actions' showDivider>
              <DropdownItem
                key={DROPDOWN_KEY.EDIT}
                startContent={
                  <HoverableElement
                    uKey={DROPDOWN_KEY.EDIT}
                    element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
                    hoveredElement={
                      <PiNotePencilFill size={DEFAULT_ICON_SIZE} />
                    }
                  />
                }
                description='Edit limit details'
                classNames={{ description: 'text-default-500' }}
              >
                Edit
              </DropdownItem>
            </DropdownSection>
            <DropdownSection title='Danger zone'>
              <DropdownItem
                key={DROPDOWN_KEY.DELETE}
                className='text-danger'
                color='danger'
                startContent={
                  <HoverableElement
                    uKey={DROPDOWN_KEY.DELETE}
                    element={<PiTrash size={DEFAULT_ICON_SIZE} />}
                    hoveredElement={<PiTrashFill size={DEFAULT_ICON_SIZE} />}
                  />
                }
                description='Permanently delete limit'
                classNames={{ description: 'text-default-500' }}
              >
                Delete
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </Reorder.Item>
  )
}

export default LimitItem
