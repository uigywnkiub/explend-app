'use client'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebounce } from 'react-use'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Accordion, AccordionItem, Input } from '@heroui/react'

import {
  DEFAULT_PAGINATION_PAGE_NUMBER,
  SEARCH_PARAM,
} from '@/config/constants/navigation'

import InfoText from '../info-text'

const ACCORDION_ITEM_KEY = 'Search'

type TProps = {
  hasSearchedTransactionsByQuery: boolean
}

export default function Search({ hasSearchedTransactionsByQuery }: TProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get(SEARCH_PARAM.QUERY)?.toString() || '',
  )
  const [isExpanded, setIsExpanded] = useState(Boolean(searchTerm))
  const isInitialRender = useRef(true)
  const isInitialExpanded = useRef(Boolean(searchTerm))

  const onSearchChange = (term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(SEARCH_PARAM.PAGE, DEFAULT_PAGINATION_PAGE_NUMBER)
    if (term) {
      params.set(SEARCH_PARAM.QUERY, term)
    } else {
      params.delete(SEARCH_PARAM.QUERY)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(() => onSearchChange(searchTerm), 300, [
    searchTerm,
  ])

  const onExpandedChange = () => {
    setIsExpanded((prev) => {
      const newState = !prev
      if (newState) {
        isInitialExpanded.current = true
      }

      return newState
    })
  }

  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

  useEffect(() => {
    // Skip the first render
    if (isInitialRender.current) {
      isInitialRender.current = false

      return
    }

    if (isInitialExpanded.current) {
      if (hasSearchedTransactionsByQuery) {
        toast.success('Transactions found.')
      } else {
        toast.error('No transactions found.')
      }
    }
  }, [hasSearchedTransactionsByQuery])

  const accordionTitle = isExpanded
    ? `Hide ${ACCORDION_ITEM_KEY}`
    : `Show ${ACCORDION_ITEM_KEY}`

  return (
    <>
      <Accordion
        isCompact
        hideIndicator
        onExpandedChange={onExpandedChange}
        defaultExpandedKeys={
          isInitialExpanded.current ? [ACCORDION_ITEM_KEY] : []
        }
        className='p-0'
      >
        <AccordionItem
          key={ACCORDION_ITEM_KEY}
          isCompact
          aria-label={accordionTitle}
          title={accordionTitle}
          classNames={{
            title: 'text-center hover:opacity-hover',
          }}
        >
          <Input
            size='lg'
            color={hasSearchedTransactionsByQuery ? 'primary' : 'danger'}
            placeholder='Type to search...'
            description={
              <InfoText
                text='You can do searches by date, description, category, and amount.'
                withAsterisk={false}
              />
            }
            isClearable
            onClear={() => [onSearchChange(''), setSearchTerm('')]}
            onChange={(e) => setSearchTerm(e.target.value.trim())}
            defaultValue={searchTerm}
            classNames={{
              input: 'border-none focus:ring-0 placeholder:text-default-500',
              inputWrapper: 'h-16 md:h-20 my-2 px-3',
              description: 'text-left',
            }}
          />
        </AccordionItem>
      </Accordion>
    </>
  )
}
