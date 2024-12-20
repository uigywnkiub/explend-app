'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiListMagnifyingGlass,
  PiListMagnifyingGlassFill,
} from 'react-icons/pi'

import { Select, SelectItem } from '@nextui-org/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { DEFAULT_TRANSACTION_LIMIT } from '@/config/constants/navigation'

import { updateTransactionLimit } from '@/app/lib/actions'
import {
  TGetTransactions,
  TSelect,
  TTransaction,
  TUserId,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const limits: TSelect[] = [
  {
    key: '10',
    value: '10',
    icon: <PiListMagnifyingGlass size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiListMagnifyingGlassFill size={DEFAULT_ICON_SIZE} />,
  },
  {
    key: '20',
    value: '20',
    icon: <PiListMagnifyingGlass size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiListMagnifyingGlassFill size={DEFAULT_ICON_SIZE} />,
  },
  {
    key: DEFAULT_TRANSACTION_LIMIT.toString(),
    value: DEFAULT_TRANSACTION_LIMIT.toString(),
    icon: <PiListMagnifyingGlass size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiListMagnifyingGlassFill size={DEFAULT_ICON_SIZE} />,
  },
  {
    key: '40',
    value: '40',
    icon: <PiListMagnifyingGlass size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiListMagnifyingGlassFill size={DEFAULT_ICON_SIZE} />,
  },
  {
    key: '50',
    value: '50',
    icon: <PiListMagnifyingGlass size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiListMagnifyingGlassFill size={DEFAULT_ICON_SIZE} />,
  },
]

type TProps = {
  userId: TUserId
  userTransactionLimit: TTransaction['transactionLimit']
  transactionsCount: TGetTransactions['totalEntries']
}

function TransactionLimit({
  userId,
  userTransactionLimit,
  transactionsCount,
}: TProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onChangeLimit = async (key: string) => {
    setIsLoading(true)
    try {
      await updateTransactionLimit(userId, Number(key))
      toast.success('Transaction limit updated.')
    } catch (err) {
      toast.error('Failed to update transaction limit.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const disableState =
    userTransactionLimit?.toString() || DEFAULT_TRANSACTION_LIMIT.toString()

  return (
    <Select
      label='Select a limit'
      items={limits}
      isDisabled={!transactionsCount}
      isLoading={isLoading}
      disabledKeys={[disableState]}
      defaultSelectedKeys={[disableState]}
      onChange={(key) => onChangeLimit(key.target.value)}
    >
      {limits.map((limit) => (
        <SelectItem
          key={limit.key}
          startContent={
            <HoverableElement
              uKey={limit.key + limit.value}
              element={limit.icon}
              hoveredElement={limit.hoverIcon}
            />
          }
        >
          {limit.value}
        </SelectItem>
      ))}
    </Select>
  )
}

export default TransactionLimit
