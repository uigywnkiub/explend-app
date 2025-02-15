import { cn } from '../lib/helpers'

type TProps = {
  withBackground?: boolean
}

export default function NoTransactionsPlug({ withBackground = true }: TProps) {
  return (
    <p
      className={cn(
        `rounded-medium p-2 text-center text-default-500 ${withBackground && 'bg-content1'}`,
      )}
    >
      No Transactions Found
    </p>
  )
}
