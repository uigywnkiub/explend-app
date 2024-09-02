import { TGetTransactions } from '@/app/lib/types'

type TProps = {
  startEntry: number
  endEntry: number
  totalEntries: TGetTransactions['totalEntries']
  limit: number
}

function PaginationInfo({ startEntry, endEntry, totalEntries, limit }: TProps) {
  return (
    <p className='text-sm text-default-500 hover:cursor-none hover:text-foreground'>
      Showing {isNaN(startEntry) ? 1 : startEntry} to{' '}
      {isNaN(endEntry)
        ? limit > totalEntries
          ? totalEntries
          : limit
        : endEntry}{' '}
      of {totalEntries} Entries
    </p>
  )
}

export default PaginationInfo
