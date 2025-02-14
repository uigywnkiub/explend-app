import { cn } from '../lib/helpers'

type TProps = {
  withBackground?: boolean
  align?: 'left' | 'center' | 'right'
  padding?: 2 | 0
}

export default function NoTransactionsPlug({
  withBackground = true,
  align = 'center',
  padding = 2,
}: TProps) {
  return (
    <p
      className={cn(
        `rounded-medium ${withBackground && 'bg-content1'} p-${padding} text-${align} text-default-500`,
      )}
    >
      No Transactions Found
    </p>
  )
}
