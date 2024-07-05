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
      className={`rounded-medium ${withBackground && 'bg-content1'} p-${padding} text-${align} text-default-300`}
    >
      No transactions found
    </p>
  )
}
