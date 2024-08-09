'use client'

import { useCallback, useEffect } from 'react'

import { useTransitionRouter } from 'next-view-transitions'
import { usePathname, useSearchParams } from 'next/navigation'

import { Pagination } from '@nextui-org/react'

import { SEARCH_PARAM } from '@/config/constants/navigation'

import type { TGetTransactions } from '../../lib/types'
import { calculateEntryRange, toNumber } from '../../lib/utils'
import PaginationInfo from './pagination-info'

type TProps = {
  totalPages: TGetTransactions['totalPages']
  totalEntries: TGetTransactions['totalEntries']
  limit: number
}

function PaginationList({ totalPages, totalEntries, limit }: TProps) {
  const router = useTransitionRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = searchParams.get(SEARCH_PARAM.PAGE)
  const isPageExceedingTotal = toNumber(page) > totalPages
  const { startEntry, endEntry } = calculateEntryRange(
    page,
    limit,
    totalEntries,
  )

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  useEffect(() => {
    if (isPageExceedingTotal) {
      router.back()
    }
  }, [isPageExceedingTotal, router])

  if (isPageExceedingTotal || totalPages === 0) return null

  return (
    <>
      <div className='mb-2.5 text-center'>
        <PaginationInfo
          startEntry={startEntry}
          endEntry={endEntry}
          totalEntries={totalEntries}
          limit={limit}
        />
      </div>
      <Pagination
        color='primary'
        total={totalPages}
        page={toNumber(page) || 1}
        onChange={(page: number) => {
          return router.push(
            `${pathname}?${createQueryString(SEARCH_PARAM.PAGE, page.toString())}`,
          )
        }}
        className='flex justify-center'
      />
    </>
  )
}

export default PaginationList
