'use client'

import { useCallback, useEffect } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Pagination } from '@heroui/react'

import {
  DEFAULT_PAGINATION_PAGE_NUMBER,
  SEARCH_PARAM,
} from '@/config/constants/navigation'

import { calculateEntryRange, convertToNumber } from '@/app/lib/helpers'
import type { TGetTransactions } from '@/app/lib/types'

import PaginationInfo from './pagination-info'

type TProps = {
  totalPages: TGetTransactions['totalPages']
  totalEntries: TGetTransactions['totalEntries']
  limit: number
}

function PaginationList({ totalPages, totalEntries, limit }: TProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page =
    searchParams.get(SEARCH_PARAM.PAGE) || DEFAULT_PAGINATION_PAGE_NUMBER
  const isPageExceedingTotal =
    convertToNumber(page || DEFAULT_PAGINATION_PAGE_NUMBER) > totalPages
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
        page={convertToNumber(page)}
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
