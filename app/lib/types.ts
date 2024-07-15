import type { DefaultSession, Session, User } from 'next-auth'

import type { ObjectId } from 'mongoose'

import {
  CURRENCY_CODE,
  CURRENCY_NAME,
  CURRENCY_SIGN,
} from '@/config/constants/main'
import { NAV_TITLE } from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

export type TSession = Session | null
export type TDefaultSession = DefaultSession
export type TUser = User
export type TUserId = TUser['email']

export type TTransaction = {
  id: string
  userId: string
  category: string
  description: string
  amount: string
  isIncome: boolean
  balance: string
  currency:
    | {
        name: CURRENCY_NAME
        code: CURRENCY_CODE
        sign: CURRENCY_SIGN
      }
    | undefined
  transactionLimit: number | null | undefined
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}

export type TRawTransaction = TTransaction & {
  _id?: ObjectId
  __v?: number
}

export type TGetTransactions = {
  transactions: TTransaction[]
  totalEntries: number
  totalPages: number
}

export type TBalance = Pick<TRawTransaction, 'amount' | 'isIncome'>

export type TBalanceProjection = ['amount', 'isIncome']

export type TGroupedTransactions = Record<string, TTransaction[]>

export type TTotals = {
  income: number
  expense: number
}

export type TTotalsTransaction = Record<
  string,
  { income: TTotals['income']; expense: TTotals['expense'] }
>

export type TCategoryData = {
  category: TTransaction['category']
  spent: number
  percentage: string
}

export type TChartData = {
  category: TTransaction['category']
  income: TTotals['income']
  expense: TTotals['expense']
}

export type TAuthProvider =
  | 'github'
  | 'google'
  | 'spotify'
  | 'dribbble'
  | 'notion'

export type TNavLink = {
  title: NAV_TITLE
  url: ROUTE
  icon: JSX.Element
  hoverIcon: JSX.Element
}

export type TSelect = {
  key: string
  value: string
  icon: TNavLink['icon']
  hoverIcon: TNavLink['hoverIcon']
}

export type TSocialLink = {
  href: string
  icon: TNavLink['icon']
  hoverIcon: TNavLink['hoverIcon']
}

export type TIcon = TNavLink['icon']

export type TSignInButton = {
  provider: TAuthProvider
  title: string
  isLoading: boolean
  icon: TNavLink['icon']
  hoverIcon: TNavLink['hoverIcon']
}

export type TAuthProvidersLoading = Record<TAuthProvider, boolean>

export type THTMLElement =
  | HTMLDivElement
  | HTMLSpanElement
  | HTMLParagraphElement
  | HTMLHeadingElement
  | HTMLLIElement
  | HTMLAnchorElement
  | HTMLButtonElement
  | HTMLQuoteElement

export type TCookie = {
  NAME: string
  VALUE: string
  MAX_AGE: number
}

export type TTheme = 'system' | 'dark' | 'light'
