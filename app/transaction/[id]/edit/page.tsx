import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { findTransactionById } from '@/app/lib/actions'

import WithSidebar from '@/app/ui/sidebar/with-sidebar'
import TransactionFormEdit from '@/app/ui/transaction-form-edit'

const PAGE_TITLE = 'Edit Transaction'

export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const transaction = await findTransactionById(id)

  if (!transaction) {
    notFound()
  }

  const content = (
    <main className='mx-auto max-w-2xl'>
      <h1 className='mb-8 text-center text-2xl font-bold'>{PAGE_TITLE}</h1>
      <TransactionFormEdit transaction={transaction} />
    </main>
  )

  return <WithSidebar contentNearby={content} />
}
