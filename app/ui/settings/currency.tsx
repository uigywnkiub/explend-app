'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { Avatar, Select, SelectItem } from '@heroui/react'

import {
  CURRENCY_CODE,
  CURRENCY_NAME,
  CURRENCY_SIGN,
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
}[] = [
  {
    name: CURRENCY_NAME.UAH,
    code: CURRENCY_CODE.UAH,
    icon: (
      <Avatar
        // ImgComponent={Image}
        ImgComponent={'img'}
        imgProps={{ width: DEFAULT_ICON_SIZE, height: DEFAULT_ICON_SIZE }}
        alt={CURRENCY_NAME.UAH}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.UAH)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.USD,
    code: CURRENCY_CODE.USD,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.USD}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.USD)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.EUR,
    code: CURRENCY_CODE.EUR,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.EUR}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.EUR)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.GBP,
    code: CURRENCY_CODE.GBP,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.GBP}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.GBP)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.CAD,
    code: CURRENCY_CODE.CAD,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.CAD}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.CAD)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.INR,
    code: CURRENCY_CODE.INR,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.INR}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.INR)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.IDR,
    code: CURRENCY_CODE.IDR,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.IDR}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.IDR)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.BRL,
    code: CURRENCY_CODE.BRL,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.BRL}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.BRL)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.HKD,
    code: CURRENCY_CODE.HKD,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.HKD}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.HKD)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.CNY,
    code: CURRENCY_CODE.CNY,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.CNY}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.CNY)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.HUF,
    code: CURRENCY_CODE.HUF,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.HUF}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.HUF)}.svg`}
      />
    ),
  },
  {
    name: CURRENCY_NAME.PLN,
    code: CURRENCY_CODE.PLN,
    icon: (
      <Avatar
        alt={CURRENCY_NAME.PLN}
        className={AVATAR_SIZE}
        src={`https://flagcdn.com/${getSlicedCurrencyCode(CURRENCY_CODE.PLN)}.svg`}
      />
    ),
  },
]

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
