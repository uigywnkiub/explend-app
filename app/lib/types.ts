import type { JSX } from 'react'

import type { DefaultSession, Session, User } from 'next-auth'

import { type ObjectId } from 'mongoose'

import {
  CURRENCY_CODE,
  CURRENCY_NAME,
  CURRENCY_SIGN,
} from '@/config/constants/currencies'
import { NAV_TITLE } from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

export type TSession = Session | null
export type TDefaultSession = DefaultSession
export type TUser = User
export type TUserId = TUser['email']

export type TTransactionType = 'expense' | 'income'

export type TCategoriesItem = {
  emoji: string
  name: string
}

export type TCategories = {
  subject: string
  items: TCategoriesItem[]
}

export type TCurrency = {
  name: CURRENCY_NAME
  code: CURRENCY_CODE
  sign: CURRENCY_SIGN
}

export type TTransaction = {
  id: string
  userId: string
  category: string
  categories: TCategories[]
  categoryLimits: TCategoryLimits[] | undefined
  subscriptions: TSubscriptions[] | []
  description: string
  amount: string
  isIncome: boolean
  balance: string
  currency: TCurrency
  transactionLimit: number | null | undefined
  isEdited: boolean
  isSubscription: boolean
  isTest: boolean
  createdAt: Date
  updatedAt: Date
}

export type TCategoryLimits = {
  categoryName: TTransaction['category']
  limitAmount: TTransaction['amount']
}

export type TSubscriptions = {
  _id: TTransaction['id']
  category: TTransaction['category']
  description: TTransaction['description']
  amount: TTransaction['amount']
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

type TTotals = {
  income: number
  expense: number
}

export type TTotalsTransaction = Record<
  string,
  { income: TTotals['income']; expense: TTotals['expense'] }
>

export type TExpenseReport = {
  category: TTransaction['category']
  spent: number
  percentage: string
}

export type TIncomeReport = {
  category: TExpenseReport['category']
  earned: TExpenseReport['spent']
  percentage: TExpenseReport['percentage']
}

export type TChartData = {
  category: TTransaction['category']
  income: TTotals['income']
  expense: TTotals['expense']
}

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

export type TIcon = TNavLink['icon']

export type TAuthProvider =
  | 'github'
  | 'google'
  | 'spotify'
  | 'dribbble'
  | 'notion'

export type TSignInButton = {
  provider: TAuthProvider
  title: string
  isLoading: boolean
  icon: TNavLink['icon']
  hoverIcon: TNavLink['hoverIcon']
}

export type TSocialLink = {
  title: TSignInButton['title']
  url: string
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

export type TEditingItemIndex = {
  categoryIndex: number
  itemIndex: number
}

export type TCategoriesLoading = {
  subject: boolean
  item: boolean
  reset: boolean
}

export type TBrowserName =
  | 'Chrome'
  | 'Safari'
  | 'Edge'
  | 'Opera'
  | 'Firefox'
  | 'Unknown'

export type TApproxCategory = {
  subject: TTransaction['categories'][0]['subject'][0]
  item: TTransaction['categories'][0]['items'][0]
  itemIndex: number
}

export type TMinMaxTransactionByDate = {
  minTransaction: TTransaction | undefined
  maxTransaction: TTransaction | undefined
}

export type TExpenseAdvice = {
  category: TTransaction['category']
  tip: string
  savings: string
}

export type TReceipt = {
  description: TTransaction['description']
  amount: number
}

export type TReceiptState = {
  description: TTransaction['description']
  amount: TTransaction['amount']
}

export type TCalculatedLimits = {
  categoryName: TCategoryLimits['categoryName']
  limitAmount: number
  difference: number
  isLimitOver: boolean
}
