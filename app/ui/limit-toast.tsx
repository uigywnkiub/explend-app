'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useDebounce } from 'react-use'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { TOAST_DURATION } from '@/config/constants/toast'

import {
  getAllTransactions,
  getCachedAuthSession,
  getCategoryLimits,
} from '@/app/lib/actions'
import {
  calculateTotalsByCategory,
  getTransactionsByCurrMonth,
} from '@/app/lib/data'
import {
  formatAmount,
  getCategoryWithEmoji,
  getEmojiFromCategory,
} from '@/app/lib/helpers'

type TProps = {
  readonly triggerBy: unknown
}

export default function LimitToast({ triggerBy }: TProps) {
  const init = async () => {
    try {
      const selectedCategoryName = localStorage.getItem(
        LOCAL_STORAGE_KEY.SELECTED_CATEGORY_NAME,
      )
      if (!selectedCategoryName) return null

      const session = await getCachedAuthSession()
      const userId = session?.user?.email
      const [limitsRaw, transactions] = await Promise.all([
        getCategoryLimits(userId),
        getAllTransactions(userId),
      ])

      const [userCategories] = transactions
        .map((t) => t.categories)
        .filter(Boolean)

      const totals = calculateTotalsByCategory(
        getTransactionsByCurrMonth(transactions),
        true,
      )

      const limits = limitsRaw
        ?.filter((limit) => {
          const categoryTotal = totals[limit.categoryName] || 0
          const limitAmount = parseFloat(formatAmount(limit.limitAmount))

          return categoryTotal > limitAmount
        })
        .map((limit) => {
          const categoryTotal = totals[limit.categoryName]
          const limitAmount = parseFloat(formatAmount(limit.limitAmount))

          return {
            categoryName: limit.categoryName,
            amount: categoryTotal,
            limit: limitAmount,
            difference: categoryTotal - limitAmount,
          }
        })

      const foundCategoryLimit = limits?.find(
        (l) => l.categoryName === selectedCategoryName,
      )

      if (typeof foundCategoryLimit === 'object') {
        toast.error(`${foundCategoryLimit.categoryName} limit is over!`, {
          icon: getEmojiFromCategory(
            getCategoryWithEmoji(
              foundCategoryLimit.categoryName,
              userCategories || DEFAULT_CATEGORIES,
            ),
          ),
          duration: TOAST_DURATION * 2,
        })
      }
    } catch (err) {
      throw err
    }
  }

  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(() => init(), 200, [triggerBy])

  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

  return null
}
