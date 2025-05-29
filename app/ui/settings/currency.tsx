'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { Avatar, Select, SelectItem, SelectSection } from '@heroui/react'

import {
  CURRENCIES_LIST,
  CURRENCY_CODE,
  CURRENCY_NAME,
  getCurrencyData,
} from '@/config/constants/currencies'
import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { updateCurrency } from '@/app/lib/actions'
import { getSlicedCurrencyCode } from '@/app/lib/helpers'
import type {
  TCurrency,
  TGetTransactions,
  TIcon,
  TUserId,
} from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const AVATAR_SIZE = `h-[${DEFAULT_ICON_SIZE}px] w-[${DEFAULT_ICON_SIZE}px]`
// const AVATAR_SIZE = 'h-[18px] w-[18px]'

const currencies: {
  name: CURRENCY_NAME
  code: CURRENCY_CODE
  icon: TIcon
}[] = CURRENCIES_LIST.map(({ name, code }) => ({
  name,
  code,
  icon: (
    <Avatar
      alt={name}
      className={AVATAR_SIZE}
      src={`https://flagcdn.com/${getSlicedCurrencyCode(code)}.svg`}
    />
  ),
}))

type TProps = {
  userId: TUserId
  currency: TCurrency
  transactionsCount: TGetTransactions['totalEntries']
}

function Currency({ userId, currency, transactionsCount }: TProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onChangeCurrency = async (key: string) => {
    setIsLoading(true)
    try {
      await updateCurrency(userId, getCurrencyData(key as CURRENCY_NAME))
      toast.success('Currency updated.')
    } catch (err) {
      toast.error('Failed to update currency.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const disableState = currency.name

  return (
    <Select
      isVirtualized={false}
      label='Select a currency'
      items={currencies}
      isDisabled={!transactionsCount}
      isLoading={isLoading}
      disabledKeys={[disableState]}
      defaultSelectedKeys={[disableState]}
      onChange={(key) => onChangeCurrency(key.target.value)}
    >
      <SelectSection title='Alphabetically ordered'>
        {currencies.map((currency) => (
          <SelectItem
            key={currency.name}
            startContent={
              <HoverableElement uKey={currency.name} element={currency.icon} />
            }
            endContent={
              <HoverableElement
                uKey={currency.code}
                element={currency.code}
                withScale={false}
              />
            }
          >
            {currency.name}
          </SelectItem>
        ))}
      </SelectSection>
    </Select>
  )
}

export default Currency
