'use client'

import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiMagnifyingGlass,
  PiMagnifyingGlassFill,
  PiNotePencil,
  PiNotePencilFill,
  PiTrash,
  PiTrashFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import { useRouter } from 'next/navigation'

import {
  Button,
  Chip,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from '@heroui/react'
import { SortIcon } from '@heroui/shared-icons'
import { haptic } from 'ios-haptics'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { deleteTransactions } from '@/app/lib/actions'
import { getTransactionsTotals } from '@/app/lib/data'

import {
  createSearchHrefWithKeyword,
  formatDate,
  getCategoryWithoutEmoji,
  getFormattedCurrency,
  pluralize,
  toLowerCase,
  toUpperCase,
} from '../../lib/helpers'
import { TCurrency, TTableTransaction, TTransaction } from '../../lib/types'
import AnimatedNumber from '../animated-number'
import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import NoTransactionsPlug from '../no-transactions-plug'

type TProps = {
  transactions: TTableTransaction[]
  currency: TCurrency
}

const enum TRANSACTION_TYPE {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

type TTableItem = {
  key: string
  category: TTransaction['category']
  description: TTransaction['description']
  amount: TTransaction['amount']
  type: TRANSACTION_TYPE
  date: string
  rawAmount: number
  rawDate: TTableTransaction['createdAt']
  isIncome: TTransaction['isIncome']
  currencySign: TCurrency['sign']
  imagesCount: number
}

const enum COLUMN_KEY {
  CATEGORY = 'category',
  DESCRIPTION = 'description',
  AMOUNT = 'amount',
  TYPE = 'type',
  DATE = 'date',
}

const COLUMNS: {
  key: keyof Omit<
    TTableItem,
    | 'key'
    | 'rawAmount'
    | 'rawDate'
    | 'isIncome'
    | 'currencySign'
    | 'imagesCount'
  >
  label: string
  allowsSorting?: boolean
}[] = [
  {
    key: COLUMN_KEY.CATEGORY,
    label: toUpperCase(COLUMN_KEY.CATEGORY),
    allowsSorting: true,
  },
  {
    key: COLUMN_KEY.DESCRIPTION,
    label: toUpperCase(COLUMN_KEY.DESCRIPTION),
    allowsSorting: true,
  },
  {
    key: COLUMN_KEY.AMOUNT,
    label: toUpperCase(COLUMN_KEY.AMOUNT),
    allowsSorting: true,
  },
  {
    key: COLUMN_KEY.TYPE,
    label: toUpperCase(COLUMN_KEY.TYPE),
    allowsSorting: true,
  },
  {
    key: COLUMN_KEY.DATE,
    label: toUpperCase(COLUMN_KEY.DATE),
    allowsSorting: true,
  },
] as const

type TSortDescriptor = {
  column: keyof TTableItem
  direction: 'ascending' | 'descending'
}

export default function TransactionTable({ transactions, currency }: TProps) {
  const router = useRouter()
  const [filterValue, setFilterValue] = useState('')
  const [isEditingSelection, setIsEditingSelection] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure()
  const [sortDescriptor, setSortDescriptor] = useState<TSortDescriptor>({
    column: COLUMN_KEY.DATE,
    direction: 'descending',
  })

  const searchText = filterValue.trim()
  const hasSearchFilter = Boolean(searchText)

  const tableItems: TTableItem[] = useMemo(
    () =>
      transactions.map((t) => ({
        key: t.id,
        category: t.category,
        description: t.description,
        amount: `${getFormattedCurrency(t.amount)} ${currency.sign}`,
        type: t.isIncome ? TRANSACTION_TYPE.INCOME : TRANSACTION_TYPE.EXPENSE,
        date: formatDate(t.createdAt),
        rawAmount: parseFloat(t.amount),
        rawDate: t.createdAt,
        isIncome: t.isIncome,
        currencySign: currency.sign,
        imagesCount: t.imagesCount,
      })),
    [transactions, currency],
  )

  const filteredItems = useMemo(() => {
    let filtered = [...tableItems]

    if (hasSearchFilter) {
      filtered = filtered.filter(
        (item) =>
          toLowerCase(item.category).includes(toLowerCase(searchText)) ||
          toLowerCase(item.description).includes(toLowerCase(searchText)) ||
          toLowerCase(item.type).includes(toLowerCase(searchText)),
      )
    }

    return filtered
  }, [tableItems, searchText, hasSearchFilter])

  const sortedItems = useMemo(() => {
    return filteredItems.toSorted((a, b) => {
      let first, second

      // Use raw values for proper sorting.
      if (sortDescriptor.column === COLUMN_KEY.AMOUNT) {
        first = a.rawAmount
        second = b.rawAmount
      } else if (sortDescriptor.column === COLUMN_KEY.DATE) {
        first = a.rawDate.getTime()
        second = b.rawDate.getTime()
      } else {
        first = a[sortDescriptor.column]
        second = b[sortDescriptor.column]
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [filteredItems, sortDescriptor])

  const totals = useMemo(() => {
    const transactionsFromItems = filteredItems.map((item) => ({
      amount: item.rawAmount.toString(),
      isIncome: item.isIncome,
    })) as TTransaction[]

    const { income, expense } = getTransactionsTotals(transactionsFromItems)
    const net = income - expense
    const currencySign = filteredItems[0]?.currencySign || ''

    return { income, expense, net, currencySign }
  }, [filteredItems])

  const onSearchChange = useCallback((value?: string) => {
    setSelectedKeys(new Set())
    if (value) {
      setFilterValue(value)
    } else {
      setFilterValue('')
    }
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setSelectedKeys(new Set())
  }, [])

  const onDeleteSelected = async () => {
    const ids = Array.from(selectedKeys)
    try {
      const deletedCount = await toast.promise(deleteTransactions(ids), {
        loading: 'Deleting transactions...',
        success: (count) =>
          `${count} ${pluralize(count, 'transaction', 'transactions')} deleted.`,
        error: 'Failed to delete transactions.',
      })
      if (deletedCount > 0) {
        setSelectedKeys(new Set())
        onCloseDeleteModal()
        router.refresh()
      }
    } catch {
      // toast.promise displays the failure message.
    }
  }

  const topContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col-reverse gap-3 md:flex-row md:items-end md:justify-between'>
          <Input
            isClearable
            className='w-full sm:max-w-sm'
            placeholder='Search by category, description, or type...'
            startContent={
              <HoverableElement
                uKey='search'
                element={
                  <PiMagnifyingGlass
                    className='cursor-default'
                    size={DEFAULT_ICON_SIZE}
                  />
                }
                hoveredElement={
                  <PiMagnifyingGlassFill
                    className='cursor-default'
                    size={DEFAULT_ICON_SIZE}
                  />
                }
                withShift={false}
              />
            }
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
            classNames={{
              input: 'border-none focus:ring-0 placeholder:text-default-500',
              description: 'text-left',
            }}
          />
          <div className='flex shrink-0 items-center gap-2'>
            {isEditingSelection && (
              <HoverableElement
                uKey='delete-selected-transactions'
                element={
                  <Button
                    color='danger'
                    variant='flat'
                    isDisabled={selectedKeys.size === 0}
                    onPress={() => {
                      haptic()
                      onOpenDeleteModal()
                    }}
                    startContent={<PiTrash size={DEFAULT_ICON_SIZE} />}
                  >
                    Delete selected
                    {selectedKeys.size > 0 ? ` (${selectedKeys.size})` : ''}
                  </Button>
                }
                hoveredElement={
                  <Button
                    color='danger'
                    variant='flat'
                    isDisabled={selectedKeys.size === 0}
                    onPress={() => {
                      haptic()
                      onOpenDeleteModal()
                    }}
                    startContent={<PiTrashFill size={DEFAULT_ICON_SIZE} />}
                  >
                    Delete selected
                    {selectedKeys.size > 0 ? ` (${selectedKeys.size})` : ''}
                  </Button>
                }
                withShift={false}
              />
            )}
            <Button
              variant='flat'
              color={isEditingSelection ? 'primary' : 'default'}
              aria-pressed={isEditingSelection}
              onPress={() => {
                haptic()
                if (isEditingSelection) setSelectedKeys(new Set())
                setIsEditingSelection((editing) => !editing)
              }}
              startContent={
                <HoverableElement
                  uKey='edit-table-selection'
                  element={<PiNotePencil size={DEFAULT_ICON_SIZE} />}
                  hoveredElement={<PiNotePencilFill size={DEFAULT_ICON_SIZE} />}
                  withShift={false}
                />
              }
            >
              {isEditingSelection ? 'Done' : 'Edit'}
            </Button>
          </div>
        </div>
      </div>
    )
  }, [
    filterValue,
    onSearchChange,
    onClear,
    isEditingSelection,
    selectedKeys.size,
    onOpenDeleteModal,
  ])

  const bottomContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-2 p-2'>
        <div className='flex flex-col items-start justify-between gap-3 text-sm sm:flex-row sm:items-center'>
          <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-6'>
            <div className='flex items-center justify-between gap-2 sm:justify-start'>
              <InfoText isSm withAsterisk={false} text='Income:' />
              <Chip color='success' size='sm' variant='flat'>
                <AnimatedNumber value={totals.income} /> {totals.currencySign}
              </Chip>
            </div>
            <div className='flex items-center justify-between gap-2 sm:justify-start'>
              <InfoText isSm withAsterisk={false} text='Expense:' />
              <Chip color='danger' size='sm' variant='flat'>
                <AnimatedNumber value={totals.expense} /> {totals.currencySign}
              </Chip>
            </div>
            <div className='flex items-center justify-between gap-2 sm:justify-start'>
              <InfoText isSm withAsterisk={false} text='Net:' />
              <Chip
                color={totals.net >= 0 ? 'success' : 'danger'}
                size='sm'
                variant='flat'
              >
                {totals.net >= 0 ? '+ ' : ''}
                <AnimatedNumber value={totals.net} isFormattedBalance />{' '}
                {totals.currencySign}
              </Chip>
            </div>
          </div>
          <div className='mt-4 self-start sm:self-auto md:mt-0'>
            <InfoText
              withAsterisk={false}
              text={`Showing ${
                hasSearchFilter ? 'filtered' : 'all-time'
              } transactions. ${filteredItems.length} ${pluralize(
                filteredItems.length,
                'entry',
                'entries',
              )}.`}
            />
          </div>
        </div>
      </div>
    )
  }, [totals, hasSearchFilter, filteredItems.length])

  return (
    <>
      <Table
        aria-label='Transaction table'
        selectionMode={isEditingSelection ? 'multiple' : 'none'}
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          setSelectedKeys(
            keys === 'all'
              ? new Set(sortedItems.map((item) => item.key))
              : new Set(Array.from(keys, String)),
          )
        }}
        isVirtualized
        isHeaderSticky
        isCompact
        isStriped
        topContent={topContent}
        topContentPlacement='outside'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        sortDescriptor={sortDescriptor}
        onSortChange={(descriptor) =>
          setSortDescriptor(descriptor as TSortDescriptor)
        }
        sortIcon={SortIcon}
        shadow='none'
        classNames={{
          wrapper: 'shadow-xs',
        }}
      >
        <TableHeader columns={COLUMNS}>
          {(column) => (
            <TableColumn
              width={column.key === COLUMN_KEY.CATEGORY ? 180 : undefined}
              key={column.key}
              allowsSorting={column.allowsSorting}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          items={sortedItems}
          emptyContent={
            hasSearchFilter ? (
              <div className='py-4 text-center'>
                <p className='text-default-500'>
                  No transactions found matching &quot;{searchText}&quot;
                </p>
              </div>
            ) : (
              <NoTransactionsPlug text='This month no transactions found' />
            )
          }
        >
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => {
                // Only access display properties (exclude raw values)
                const displayKey = columnKey as keyof Omit<
                  TTableItem,
                  | 'key'
                  | 'rawAmount'
                  | 'rawDate'
                  | 'isIncome'
                  | 'currencySign'
                  | 'imagesCount'
                >
                const cellValue = item[displayKey]

                if (columnKey === COLUMN_KEY.TYPE) {
                  return (
                    <TableCell>
                      <Chip
                        className='capitalize'
                        color={
                          item.type === TRANSACTION_TYPE.INCOME
                            ? 'success'
                            : 'danger'
                        }
                        size='sm'
                        variant='flat'
                      >
                        {cellValue}
                      </Chip>
                    </TableCell>
                  )
                }

                if (columnKey === COLUMN_KEY.DESCRIPTION) {
                  const tooltipLengthStr = 30
                  const cellValue = item[displayKey]
                  const descriptionContent = (
                    <div>
                      {cellValue}
                      {item.imagesCount > 0 && (
                        <span className='text-secondary-700 pl-1 text-xs font-medium text-wrap italic'>
                          with {pluralize(item.imagesCount, 'image', 'images')}
                        </span>
                      )}
                    </div>
                  )

                  if (isEditingSelection) {
                    return <TableCell>{descriptionContent}</TableCell>
                  }

                  return (
                    <TableCell>
                      <Tooltip
                        content={`Search by ${cellValue.slice(0, tooltipLengthStr)}${cellValue.length > tooltipLengthStr ? '...' : ''}`}
                        placement='bottom'
                        delay={2000}
                      >
                        <Link
                          size='sm'
                          href={createSearchHrefWithKeyword(
                            getCategoryWithoutEmoji(cellValue),
                          )}
                          className='hover:opacity-hover text-inherit'
                        >
                          {descriptionContent}
                        </Link>
                      </Tooltip>
                    </TableCell>
                  )
                }

                return <TableCell>{cellValue}</TableCell>
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex items-center gap-2'>
                <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} />
                Delete selected transactions?
              </ModalHeader>
              <ModalBody>
                <p className='text-default-500'>
                  You are about to{' '}
                  <span className='text-foreground font-medium'>
                    permanently delete {selectedKeys.size}{' '}
                    {pluralize(
                      selectedKeys.size,
                      'selected transaction',
                      'selected transactions',
                    )}
                  </span>
                  . This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  onPress={onDeleteSelected}
                  isDisabled={selectedKeys.size === 0}
                >
                  Delete transactions
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
