'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import Image from 'next/image'

import { updateCurrency } from '@/app/lib/actions'
import { TSelect, TTransaction, TUserId } from '@/app/lib/types'
import { getSlicedCurrencyCode } from '@/app/lib/utils'
import { Avatar, Select, SelectItem } from '@nextui-org/react'

import {
  CURRENCY_CODE,
  CURRENCY_NAME,
  CURRENCY_SIGN,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'

import { HoverableElement } from '../hoverables'

const AVATAR_SIZE = `h-[${DEFAULT_ICON_SIZE}px] w-[${DEFAULT_ICON_SIZE}px]`
// const AVATAR_SIZE = 'h-[18px] w-[18px]'

const currencies: {
  name: CURRENCY_NAME
  code: CURRENCY_CODE
  icon: TSelect['icon']
}[] = [
  {
    name: CURRENCY_NAME.UAH,
    code: CURRENCY_CODE.UAH,
    icon: (
      <Avatar
        ImgComponent={Image}
        imgProps={{
          // @ts-ignore
          quality: 100,
          width: DEFAULT_ICON_SIZE,
          height: DEFAULT_ICON_SIZE,
        }}
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
}

function Currency({ userId, currency }: TProps) {
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

  const disableState = currency?.name || DEFAULT_CURRENCY_NAME

  return (
    <Select
      label='Select a currency'
      items={currencies}
      isDisabled={!currency}
      isLoading={isLoading}
      disabledKeys={[disableState]}
      defaultSelectedKeys={[disableState]}
      onChange={(key) => onChangeCurrency(key.target.value)}
    >
      {currencies.map((currency) => (
        <SelectItem
          key={currency.name}
          startContent={<HoverableElement element={currency.icon} />}
          endContent={
            <HoverableElement element={currency.code} withScale={false} />
          }
        >
          {currency.name}
        </SelectItem>
      ))}
    </Select>
  )
}

export default Currency
