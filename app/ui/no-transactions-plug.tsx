type TProps = {
  text?: string
}

export default function NoTransactionsPlug({
  text = 'No Transactions Found',
}: TProps) {
  return (
    <p className='rounded-medium bg-content1 p-2 text-center text-default-500'>
      {text}
    </p>
  )
}
