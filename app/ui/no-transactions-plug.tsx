type TProps = {
  text?: string
}

export default function NoTransactionsPlug({
  text = 'No Transactions Found',
}: TProps) {
  return (
    <p className='rounded-medium hover:text-foreground text-default-500 p-2 text-center hover:cursor-none'>
      {text}
    </p>
  )
}
