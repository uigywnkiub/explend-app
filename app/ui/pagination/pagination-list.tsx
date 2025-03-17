'use client'

import { useCallback, useEffect } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Pagination } from '@heroui/react'

import {
  DEFAULT_PAGINATION_PAGE_NUMBER,
  SEARCH_PARAM,
} from '@/config/constants/navigation'

import { calculateEntryRange, safeConvertToNumber } from '@/app/lib/helpers'
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
  const pageParam = searchParams.get(SEARCH_PARAM.PAGE)
  const currentPage = Number(
    safeConvertToNumber(pageParam || DEFAULT_PAGINATION_PAGE_NUMBER),
  )
  const isPageExceedingTotal = currentPage > totalPages
  const { startEntry, endEntry } = calculateEntryRange(
    currentPage,
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

  // Redirect to the last page if the pageParam is invalid or exceeds the total pages.
  useEffect(() => {
    if (isPageExceedingTotal) {
      router.push(
        `${pathname}?${createQueryString(SEARCH_PARAM.PAGE, totalPages.toString())}`,
      )
    }
  }, [isPageExceedingTotal, router, pathname, createQueryString, totalPages])

  if (!totalPages || !totalEntries) return null

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
        page={currentPage}
        onChange={(page: number) => {
          router.push(
            `${pathname}?${createQueryString(SEARCH_PARAM.PAGE, page.toString())}`,
          )
        }}
        className='flex justify-center'
      />
    </>
  )
}

export default PaginationList
