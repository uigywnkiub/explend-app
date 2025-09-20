import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiCopy,
  PiCopyFill,
  PiDotsThreeOutlineVerticalFill,
  PiNotePencil,
  PiNotePencilFill,
  PiPlus,
  PiPlusFill,
  PiTrash,
  PiTrashFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'

import { BLINK_DURATION } from '@/config/constants/animation'
import { APP_NAME, DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { SEARCH_PARAM } from '@/config/constants/navigation'

import { createTransaction, deleteTransaction } from '../../lib/actions'
import {
  cn,
  copyToClipboard,
  createFormData,
  formatDate,
  formatTime,
  getEmojiFromCategory,
  getFormattedCurrency,
  omit,
  pluralize,
} from '../../lib/helpers'
import type { TTransaction } from '../../lib/types'
import HighlighterText from '../highlighter-text'
import { HoverableElement } from '../hoverables'
import CategoryWithImage from './category-with-images'

const enum DROPDOWN_KEY {
  REPEAT = 'repeat',
  COPY = 'copy',
  EDIT = 'edit',
  DELETE = 'delete',
}

type TProps = TTransaction & {
  hasCategoryChanged: boolean
}

function TransactionItem({ hasCategoryChanged, ...t }: TProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get(SEARCH_PARAM.QUERY)?.toString() || ''
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [isBlinkTransaction, setIsBlinkTransaction] = useState(false)
  const transactionDataToCopy = `Transaction data from ${APP_NAME.SHORT}

${t.isIncome ? 'Type: Income' : 'Type: Expense'}
Category: ${t.category}
Description: ${t.description}
Amount: ${t.isIncome ? '+' : '-'} ${getFormattedCurrency(t.amount)} ${t.currency.sign}
Date: ${formatDate(t.createdAt)}
Time: ${formatTime(t.createdAt)}`

  const onBlinkTransaction = async () => {
    try {
      setIsBlinkTransaction((prev) => !prev)
      setTimeout(() => {
        setIsBlinkTransaction((prev) => !prev)
      }, BLINK_DURATION * 1000)
    } catch (err) {
      throw err
    }
  }

  const onDeleteTransaction = async (id: TTransaction['id']) => {
    try {
      await toast.promise(deleteTransaction(id), {
        loading: 'Deleting transaction...',
        success: 'Transaction deleted.',
        error: 'Failed to delete transaction.',
      })
    } catch (err) {
      throw err
    }
  }

  const onRepeatTransaction = async (transaction: TTransaction) => {
    try {
      const { userId, currency, categories, ...restT } = omit(transaction, [])
      await toast.promise(
        createTransaction(userId, currency, categories, createFormData(restT)),
        {
          loading: 'Repeating transaction...',
          success: 'Transaction repeated.',
          error: 'Failed to repeat transaction.',
        },
      )
    } catch (err) {
      throw err
    }
  }

  return (
    <>
      <div
        className={`h-auto w-full rounded-medium bg-content1 px-4 py-2 text-left md:px-6 md:py-4 ${isBlinkTransaction && 'animate-blink-light-once dark:animate-blink-dark-once'}`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 truncate break-keep md:gap-4'>
            <CategoryWithImage t={t} />
            <div className='font-semibold'>
              {t.isIncome ? (
                <p className='text-lg text-success selection:bg-success selection:text-light'>
                  +{' '}
                  <HighlighterText
                    query={[getFormattedCurrency(query)]}
                    text={getFormattedCurrency(t.amount)}
                  />{' '}
                  {t.currency.sign}
                </p>
              ) : (
                <p className='text-lg selection:bg-danger selection:text-light'>
                  -{' '}
                  <HighlighterText
                    query={[getFormattedCurrency(query)]}
                    text={getFormattedCurrency(t.amount)}
                  />{' '}
                  {t.currency.sign}
                </p>
              )}
              <p
                className={cn(
                  'text-balance text-sm font-medium',
                  t.isIncome
                    ? 'selection:bg-success selection:text-light'
                    : 'selection:bg-danger selection:text-light',
                )}
              >
                <HighlighterText query={[query]} text={t.description} />
              </p>
              <p className='text-wrap text-xs font-medium italic text-default-500'>
                <span className='pr-1'>{formatTime(t.createdAt)}</span>
                {t.isEdited && <span className='pr-1'>edited</span>}
                {t.isTest && <span className='pr-1 text-danger-700'>test</span>}
                {t.isSubscription && (
                  <span className='pr-1 text-primary-700'>subscription</span>
                )}
                {t.images && t.images.length > 0 && (
                  <span className='text-secondary-700'>
                    with {pluralize(t.images.length, 'image', 'images')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Dropdown>
            <Badge
              content=''
              shape='rectangle'
              color='warning'
              variant='solid'
              size='sm'
              isDot
              placement='top-right'
              classNames={{
                badge: 'right-1',
              }}
              isInvisible={!hasCategoryChanged}
            >
              <DropdownTrigger>
                <Button
                  variant='light'
                  isIconOnly
                  size='md'
                  className='md:size-12'
                >
                  <PiDotsThreeOutlineVerticalFill className='size-4 fill-foreground' />
                </Button>
              </DropdownTrigger>
            </Badge>
            <DropdownMenu
              aria-label='Transaction actions'
              onAction={(key) => {
                if (key === DROPDOWN_KEY.REPEAT) {
                  onRepeatTransaction(t)
                  onBlinkTransaction()
                }
                if (key === DROPDOWN_KEY.COPY) {
                  copyToClipboard(
                    'Transaction copied.',
                    'Failed to copy transaction.',
                    undefined,
                    transactionDataToCopy,
                  )
                  onBlinkTransaction()
                }
                if (key === DROPDOWN_KEY.EDIT) {
                  router.push(`/transaction/${t.id}/edit`)
                }
                if (key === DROPDOWN_KEY.DELETE) {
                  onOpen()
                }
              }}
            >
              <DropdownSection title='Actions' showDivider>
                <DropdownItem
                  key={DROPDOWN_KEY.REPEAT}
                  startContent={
                    <HoverableElement
                      uKey={DROPDOWN_KEY.REPEAT}
                      element={<PiPlus size={DEFAULT_ICON_SIZE} />}
                      hoveredElement={<PiPlusFill size={DEFAULT_ICON_SIZE} />}
                    />
                  }
                  description='Repeat transaction'
                  classNames={{
                    description: 'text-default-500',
                  }}
                >
                  Repeat
                </DropdownItem>
                <DropdownItem
                  key={DROPDOWN_KEY.COPY}
                  startContent={
                    <HoverableElement
                      uKey={DROPDOWN_KEY.COPY}
                      element={<PiCopy size={DEFAULT_ICON_SIZE} />}
                      hoveredElement={<PiCopyFill size={DEFAULT_ICON_SIZE} />}
                    />
                  }
                  description='Copy transaction data'
                  classNames={{
                    description: 'text-default-500',
                  }}
                >
                  Copy
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
                      classNames={{
                        base: 'w-full',
                        badge: 'right-1',
                      }}
                      isInvisible={!hasCategoryChanged}
                    >
                      Edit transaction details
                    </Badge>
                  }
                  classNames={{
                    description: 'text-default-500',
                  }}
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
                  description='Permanently delete transaction'
                  classNames={{
                    description: 'text-default-500',
                  }}
                >
                  Delete
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onBlinkTransaction}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} /> Delete
                  transaction
                </div>
              </ModalHeader>
              <ModalBody>
                <p className='overflow-hidden text-ellipsis text-default-500'>
                  Are you sure you want to delete the
                  <br />
                  <span className='text-foreground'>
                    {getEmojiFromCategory(t.category)} {t.description}
                  </span>{' '}
                  transaction? This action is permanent and cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={() => [onClose()]}>
                  Close
                </Button>
                <Button
                  color='danger'
                  onPress={() => [onDeleteTransaction(t.id), onClose()]}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default TransactionItem
