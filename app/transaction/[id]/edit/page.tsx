import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  findTransactionById,
  getAuthSession,
  getCachedUserCategories,
  getCurrency,
} from '@/app/lib/actions'
import { getUserCategories } from '@/app/lib/data'

import WithSidebarContent from '@/app/ui/sidebar/with-sidebar-content'
import TransactionFormEdit from '@/app/ui/transaction-form-edit'

const PAGE_TITLE = 'Edit Transaction'

export const metadata: Metadata = {
  title: PAGE_TITLE,
}

async function EditTransactionPageContent(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const { id } = params
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [transaction, categoriesFromSettings, currency] = await Promise.all([
    findTransactionById(id),
    getCachedUserCategories(userId),
    getCurrency(userId),
  ])
  const isCurrentUser = userId === transaction?.userId

  if (!transaction || !isCurrentUser) {
    notFound()
  }

  const content = (
    <main className='mx-auto max-w-3xl'>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {PAGE_TITLE}
      </h1>
      <TransactionFormEdit
        transaction={transaction}
        userCategories={getUserCategories(categoriesFromSettings)}
        currency={currency}
      />
    </main>
  )

  return content
}

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <WithSidebarContent title={PAGE_TITLE}>
      <EditTransactionPageContent {...props} />
    </WithSidebarContent>
  )
}
