import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiCopy,
  PiCopyFill,
  PiDotsThreeOutlineVerticalFill,
  PiNotePencil,
  PiNotePencilFill,
  PiTrash,
  PiTrashFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import { useRouter } from 'next/navigation'

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
} from '@nextui-org/react'
import { motion } from 'framer-motion'

import { BLINK_DURATION } from '@/config/constants/animation'
import {
  APP_NAME,
  DEFAULT_CURRENCY_SIGN,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'

import { deleteTransaction } from '../../lib/actions'
import {
  copyToClipboard,
  formatTime,
  getEmojiFromCategory,
  getFormattedCurrency,
} from '../../lib/helpers'
import type { TTransaction } from '../../lib/types'
import { HoverableElement } from '../hoverables'

const enum DROPDOWN_KEY {
  COPY = 'copy',
  EDIT = 'edit',
  DELETE = 'delete',
}

type TProps = Omit<
  TTransaction,
  | 'userId'
  | 'balance'
  | 'updatedAt'
  | 'transactionLimit'
  | 'categories'
  | 'hasCategoryChanged'
> & {
  hasCategoryChanged: boolean
}

function TransactionItem({
  id,
  category,
  description,
  amount,
  currency,
  isIncome,
  isEdited,
  createdAt,
  hasCategoryChanged,
}: TProps) {
  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [isBlinkTransaction, setIsBlinkTransaction] = useState(false)
  const transactionDataToCopy = `Transaction data from ${APP_NAME.FULL}

${isIncome ? 'Type: Income' : 'Type: Expense'}
Category: ${category}
Description: ${description}
Amount: ${isIncome ? '+' : '-'} ${getFormattedCurrency(amount)} ${currency?.sign || DEFAULT_CURRENCY_SIGN}
Time: ${formatTime(createdAt)}`

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

  const onDeleteTransaction = async () => {
    try {
      await deleteTransaction(id)
      toast.success('Transaction deleted.')
    } catch (err) {
      toast.error('Failed to delete transaction.')
      throw err
    }
  }

  return (
    <>
      <div
        className={`h-auto w-full rounded-medium bg-content1 px-4 py-2 text-left md:px-6 md:py-4 ${isBlinkTransaction && 'animate-blink-light-once dark:animate-blink-dark-once'}`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 truncate break-keep'>
            <div className='rounded-medium bg-content2 px-3 py-2 text-2xl md:px-4 md:py-3'>
              <motion.div
                drag
                dragConstraints={{ top: 0, left: 0, bottom: 0, right: 0 }}
              >
                {getEmojiFromCategory(category)}
              </motion.div>
            </div>
            <div className='font-semibold'>
              {isIncome ? (
                <p className='text-lg text-success'>
                  + {getFormattedCurrency(amount)}{' '}
                  {currency?.sign || DEFAULT_CURRENCY_SIGN}
                </p>
              ) : (
                <p className='text-lg'>
                  - {getFormattedCurrency(amount)}{' '}
                  {currency?.sign || DEFAULT_CURRENCY_SIGN}
                </p>
              )}
              <p className='text-balance text-sm font-medium'>{description}</p>
              <p className='text-xs font-medium text-default-500'>
                {isEdited && 'edited'} {formatTime(createdAt)}
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
                  className='md:h-12 md:w-12'
                >
                  <PiDotsThreeOutlineVerticalFill className='h-4 w-4 fill-foreground' />
                </Button>
              </DropdownTrigger>
            </Badge>
            <DropdownMenu
              aria-label='Transaction actions'
              onAction={(key) => {
                if (key === DROPDOWN_KEY.COPY) {
                  copyToClipboard(
                    'Transaction copied.',
                    'Failed to copy transaction.',
                    undefined,
                    transactionDataToCopy,
                  )
                }
                if (key === DROPDOWN_KEY.EDIT) {
                  router.push(`/transaction/${id}/edit`)
                }
                if (key === DROPDOWN_KEY.DELETE) {
                  onOpen()
                }
              }}
            >
              <DropdownSection title='Actions' showDivider>
                <DropdownItem
                  key={DROPDOWN_KEY.COPY}
                  startContent={
                    <HoverableElement
                      element={<PiCopy size={DEFAULT_ICON_SIZE} />}
                      hoveredElement={<PiCopyFill size={DEFAULT_ICON_SIZE} />}
                    />
                  }
                  description='Copy transaction data'
                >
                  Copy
                </DropdownItem>
                <DropdownItem
                  key={DROPDOWN_KEY.EDIT}
                  startContent={
                    <HoverableElement
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
                      element={<PiTrash size={DEFAULT_ICON_SIZE} />}
                      hoveredElement={<PiTrashFill size={DEFAULT_ICON_SIZE} />}
                    />
                  }
                  description='Permanently delete the transaction'
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
                  Are you sure you want to delete the{' '}
                  <span className='text-foreground'>{description}</span>{' '}
                  transaction? This action is permanent and cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={() => [onClose()]}>
                  Close
                </Button>
                <Button
                  color='danger'
                  onPress={() => [onDeleteTransaction(), onClose()]}
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
