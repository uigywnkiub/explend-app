import type { TGetTransactions } from '@/app/lib/types'

import InfoText from '../info-text'

type TProps = {
  startEntry: number
  endEntry: number
  totalEntries: TGetTransactions['totalEntries']
  limit: number
}

function PaginationInfo({ startEntry, endEntry, totalEntries, limit }: TProps) {
  return (
    <div className='inline-block'>
      <InfoText
        isSm
        withAsterisk={false}
        text={`${`Showing ${isNaN(startEntry) ? 1 : startEntry} to ${
          isNaN(endEntry)
            ? limit > totalEntries
              ? totalEntries
              : limit
            : endEntry
        } of ${totalEntries} Entries`}`}
      />
    </div>
  )
}

export default PaginationInfo
