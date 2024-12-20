import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { findTransactionById, getAuthSession } from '@/app/lib/actions'

import WithSidebar from '@/app/ui/sidebar/with-sidebar'
import TransactionFormEdit from '@/app/ui/transaction-form-edit'

const PAGE_TITLE = 'Edit Transaction'

export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const [transaction, session] = await Promise.all([
    findTransactionById(id),
    getAuthSession(),
  ])
  const userId = session?.user?.email
  const isCurrentUser = userId === transaction?.userId

  if (!transaction || !isCurrentUser) {
    notFound()
  }

  const content = (
    <main className='mx-auto max-w-3xl'>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {PAGE_TITLE}
      </h1>
      <TransactionFormEdit transaction={transaction} />
    </main>
  )

  return <WithSidebar contentNearby={content} />
}
