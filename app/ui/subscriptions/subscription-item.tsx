import {
  PiCheckCircle,
  PiCheckCircleFill,
  PiDotsSixVerticalBold,
  PiDotsThreeOutlineVerticalFill,
  PiNotePencil,
  PiNotePencilFill,
  PiPlus,
  PiPlusFill,
  PiRepeat,
  PiRepeatFill,
  PiTrash,
  PiTrashFill,
} from 'react-icons/pi'

import Link from 'next/link'

import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Tooltip,
} from '@heroui/react'
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from 'framer-motion'
import { haptic } from 'ios-haptics'

import {
  DEFAULT_CATEGORY_EMOJI,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'
import { MOTION_LIST, MOTION_REORDER_HANDLE } from '@/config/constants/motion'

import {
  capitalizeFirstLetter,
  createSearchHrefWithKeyword,
  formatAmount,
  getCategoryWithEmoji,
  getCategoryWithoutEmoji,
  getEmojiFromCategory,
  toLowerCase,
} from '@/app/lib/helpers'
import {
  TCategories,
  TCurrency,
  TSubscriptions,
  TTransaction,
} from '@/app/lib/types'

import AnimatedNumber from '../animated-number'
import { HoverableElement } from '../hoverables'
import { DROPDOWN_KEY } from './subscriptions'

type TProps = {
  s: TSubscriptions
  idx: number
  currency: TCurrency
  userCategories: TCategories[]
  changedCategoryNames: string[]
  reorderContainer: React.RefObject<null>
  isReordering: boolean
  subscriptionTransactionsByCurrMonth: TTransaction[]
  onAction: (key: string) => void
}

function SubscriptionItem({
  s,
  idx,
  currency,
  userCategories,
  changedCategoryNames,
  reorderContainer,
  isReordering,
  subscriptionTransactionsByCurrMonth,
  onAction,
}: TProps) {
  const dragControls = useDragControls()

  const { _id, category, description, amount, note, autoRenew, renewDay } = s

  const isChangedCategoryName = changedCategoryNames.includes(
    getCategoryWithoutEmoji(category),
  )
  const categoryEmoji = isChangedCategoryName
    ? DEFAULT_CATEGORY_EMOJI
    : getEmojiFromCategory(getCategoryWithEmoji(category, userCategories))

  const isAddedSubscriptionInThisMonth =
    subscriptionTransactionsByCurrMonth.some(
      (t) =>
        toLowerCase(t.description) === toLowerCase(description) &&
        t.category === category &&
        formatAmount(t.amount) === formatAmount(amount),
    )

  const checkIconClassName = isAddedSubscriptionInThisMonth
    ? 'fill-success'
    : 'fill-default'
  const addedSubscriptionStr = 'added this month'

  return (
    <Reorder.Item
      value={_id}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={reorderContainer}
      dragElastic={0.1}
      {...MOTION_LIST(idx)}
      className='rounded-medium bg-content1 relative flex flex-col items-center justify-between py-3'
    >
      <div className='flex w-full items-center justify-between'>
        <div className='flex min-w-0 items-center gap-2'>
          <AnimatePresence>
            {isReordering && (
              <motion.div
                {...MOTION_REORDER_HANDLE}
                className='flex shrink-0 items-center overflow-hidden'
              >
                <Tooltip content='Drag to reorder' placement='left'>
                  <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className='flex h-6 w-6 cursor-grab touch-none items-center justify-center active:cursor-grabbing'
                  >
                    <PiDotsSixVerticalBold size={DEFAULT_ICON_SIZE} />
                  </div>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
          <Tooltip
            content={getCategoryWithoutEmoji(category)}
            placement='bottom'
          >
            <p className='-mb-1 cursor-default text-xl md:text-2xl'>
              {categoryEmoji}
            </p>
          </Tooltip>
          <div className='flex min-w-0 flex-1 flex-col items-start gap-1'>
            <div className='flex w-full flex-wrap items-center gap-2'>
              <Tooltip content='Search by description' placement='bottom'>
                <Link
                  href={createSearchHrefWithKeyword(description)}
                  className='hover:opacity-hover'
                >
                  {description}
                </Link>
              </Tooltip>
              {autoRenew && (
                <Tooltip
                  content={`Auto-renews monthly on day ${renewDay}`}
                  placement='bottom'
                >
                  <div>
                    <HoverableElement
                      uKey={`renew-subscription-icon-${_id}`}
                      element={
                        <PiRepeat
                          size={DEFAULT_ICON_SIZE}
                          className='fill-primary'
                        />
                      }
                      hoveredElement={
                        <PiRepeatFill
                          size={DEFAULT_ICON_SIZE}
                          className='fill-primary'
                        />
                      }
                      withShift={false}
                    />
                  </div>
                </Tooltip>
              )}
              <Tooltip
                content={
                  isAddedSubscriptionInThisMonth
                    ? capitalizeFirstLetter(addedSubscriptionStr)
                    : 'Ready to add'
                }
                placement='bottom'
              >
                <div className='pr-2'>
                  <HoverableElement
                    uKey='check-subscription-icon'
                    element={
                      <PiCheckCircle
                        size={DEFAULT_ICON_SIZE}
                        className={checkIconClassName}
                      />
                    }
                    hoveredElement={
                      <PiCheckCircleFill
                        size={DEFAULT_ICON_SIZE}
                        className={checkIconClassName}
                      />
                    }
                  />
                </div>
              </Tooltip>
            </div>
            {Boolean(note) && (
              <p className='text-default-500 max-w-full text-left text-sm'>
                {note}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <p className='text-center'>
            <AnimatedNumber value={amount} /> {currency.code}
          </p>
          <Dropdown>
            <Badge
              content=''
              shape='rectangle'
              color='warning'
              variant='solid'
              size='sm'
              isDot
              placement='top-right'
              classNames={{ badge: 'right-1' }}
              isInvisible={!isChangedCategoryName}
            >
              <DropdownTrigger className='-mt-1'>
                <Button
                  variant='light'
                  isIconOnly
                  size='md'
                  className='md:size-10'
                  onPress={haptic}
                >
                  <PiDotsThreeOutlineVerticalFill className='fill-foreground size-4' />
                </Button>
              </DropdownTrigger>
            </Badge>
            <DropdownMenu
              aria-label='Subscription actions'
              onAction={(key) => onAction(key as string)}
            >
              <DropdownSection title='Actions' showDivider>
                <DropdownItem
                  key={DROPDOWN_KEY.ADD}
                  startContent={
                    <HoverableElement
                      uKey={DROPDOWN_KEY.ADD}
                      element={<PiPlus size={DEFAULT_ICON_SIZE} />}
                      hoveredElement={<PiPlusFill size={DEFAULT_ICON_SIZE} />}
                    />
                  }
                  description='Add subscription as transaction'
                  classNames={{ description: 'text-default-500' }}
                >
                  Add{' '}
                  {isAddedSubscriptionInThisMonth &&
                    `(${addedSubscriptionStr})`}
                </DropdownItem>
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
                  description={
                    <Badge
                      content=''
                      shape='rectangle'
                      color='warning'
                      variant='solid'
                      size='sm'
                      isDot
                      placement='top-right'
                      classNames={{ base: 'w-full', badge: 'right-1' }}
                      isInvisible={!isChangedCategoryName}
                    >
                      Edit subscription details
                    </Badge>
                  }
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
                  description='Permanently delete subscription'
                  classNames={{ description: 'text-default-500' }}
                >
                  Delete
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </Reorder.Item>
  )
}

export default SubscriptionItem
