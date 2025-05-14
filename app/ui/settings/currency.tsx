'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { Avatar, Select, SelectItem } from '@heroui/react'

import {
  CURRENCIES_LIST,
  CURRENCY_CODE,
  CURRENCY_NAME,
  CURRENCY_SIGN,
} from '@/config/constants/currencies'
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'

import { updateCurrency } from '@/app/lib/actions'
import { getSlicedCurrencyCode } from '@/app/lib/helpers'
import type {
  TGetTransactions,
  TIcon,
  TTransaction,
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

const getCurrencyData = (code: CURRENCY_NAME): TTransaction['currency'] => {
  switch (code) {
    case CURRENCY_NAME.UAH:
      return {
        name: CURRENCY_NAME.UAH,
        code: CURRENCY_CODE.UAH,
        sign: CURRENCY_SIGN.UAH,
      }
    case CURRENCY_NAME.USD:
      return {
        name: CURRENCY_NAME.USD,
        code: CURRENCY_CODE.USD,
        sign: CURRENCY_SIGN.USD,
      }
    case CURRENCY_NAME.EUR:
      return {
        name: CURRENCY_NAME.EUR,
        code: CURRENCY_CODE.EUR,
        sign: CURRENCY_SIGN.EUR,
      }
    case CURRENCY_NAME.GBP:
      return {
        name: CURRENCY_NAME.GBP,
        code: CURRENCY_CODE.GBP,
        sign: CURRENCY_SIGN.GBP,
      }
    case CURRENCY_NAME.CAD:
      return {
        name: CURRENCY_NAME.CAD,
        code: CURRENCY_CODE.CAD,
        sign: CURRENCY_SIGN.CAD,
      }
    case CURRENCY_NAME.AED:
      return {
        name: CURRENCY_NAME.AED,
        code: CURRENCY_CODE.AED,
        sign: CURRENCY_SIGN.AED,
      }
    case CURRENCY_NAME.INR:
      return {
        name: CURRENCY_NAME.INR,
        code: CURRENCY_CODE.INR,
        sign: CURRENCY_SIGN.INR,
      }
    case CURRENCY_NAME.IDR:
      return {
        name: CURRENCY_NAME.IDR,
        code: CURRENCY_CODE.IDR,
        sign: CURRENCY_SIGN.IDR,
      }
    case CURRENCY_NAME.BRL:
      return {
        name: CURRENCY_NAME.BRL,
        code: CURRENCY_CODE.BRL,
        sign: CURRENCY_SIGN.BRL,
      }
    case CURRENCY_NAME.HKD:
      return {
        name: CURRENCY_NAME.HKD,
        code: CURRENCY_CODE.HKD,
        sign: CURRENCY_SIGN.HKD,
      }
    case CURRENCY_NAME.CNY:
      return {
        name: CURRENCY_NAME.CNY,
        code: CURRENCY_CODE.CNY,
        sign: CURRENCY_SIGN.CNY,
      }
    case CURRENCY_NAME.HUF:
      return {
        name: CURRENCY_NAME.HUF,
        code: CURRENCY_CODE.HUF,
        sign: CURRENCY_SIGN.HUF,
      }
    case CURRENCY_NAME.PLN:
      return {
        name: CURRENCY_NAME.PLN,
        code: CURRENCY_CODE.PLN,
        sign: CURRENCY_SIGN.PLN,
      }
    default:
      return {
        name: DEFAULT_CURRENCY_NAME as CURRENCY_NAME,
        code: DEFAULT_CURRENCY_CODE as CURRENCY_CODE,
        sign: DEFAULT_CURRENCY_SIGN as CURRENCY_SIGN,
      }
  }
}

type TProps = {
  userId: TUserId
  currency: TTransaction['currency']
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
    </Select>
  )
}

export default Currency
