'use client'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebounce } from 'react-use'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Accordion, AccordionItem, Input } from '@nextui-org/react'

import { SEARCH_PARAM } from '@/config/constants/navigation'

const ACCORDION_ITEM_KEY = 'Search'

type TProps = {
  placeholder: string
  hasSearchedTransactions: boolean
}

export default function Search({
  placeholder,
  hasSearchedTransactions,
}: TProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get(SEARCH_PARAM.QUERY)?.toString() || '',
  )
  const [isExpanded, setIsExpanded] = useState(!!searchTerm)
  const isInitialRender = useRef(true)
  const isInitialExpanded = useRef(!!searchTerm)

  const onSearchChange = (term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(SEARCH_PARAM.PAGE, '1')
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
      if (hasSearchedTransactions) {
        toast.success('Transactions found.')
      } else {
        toast.error('No transactions found.')
      }
    }
  }, [hasSearchedTransactions])

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
            color='primary'
            isClearable
            placeholder={placeholder}
            onClear={() => [onSearchChange(''), setSearchTerm('')]}
            onChange={(e) => setSearchTerm(e.target.value)}
            defaultValue={searchTerm}
            classNames={{
              input: 'border-none focus:ring-0 placeholder:text-default-500',
              inputWrapper: 'h-20 my-2 px-4',
            }}
          />
        </AccordionItem>
      </Accordion>
    </>
  )
}
