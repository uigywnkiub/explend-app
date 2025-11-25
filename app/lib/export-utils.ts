import { format } from 'date-fns'

import type { TTransaction } from './types'

export type ExportFormat = 'csv' | 'json'

export const formatTransactionForExport = (transaction: TTransaction) => {
  return {
    date: format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    category: transaction.category,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.isIncome ? 'income' : 'expense',
    balance: transaction.balance,
    currency: transaction.currency.code,
    isSubscription: transaction.isSubscription,
    isEdited: transaction.isEdited,
  }
}

export const generateCSV = (transactions: TTransaction[]): string => {
  if (transactions.length === 0) {
    return 'No transactions to export'
  }

  const headers = [
    'Date',
    'Category',
    'Description',
    'Amount',
    'Type',
    'Balance',
    'Currency',
    'Subscription',
    'Edited',
  ]

  const rows = transactions.map((transaction) => {
    const formatted = formatTransactionForExport(transaction)
    return [
      formatted.date,
      formatted.category,
      `"${formatted.description.replace(/"/g, '""')}"`,
      formatted.amount,
      formatted.type,
      formatted.balance,
      formatted.currency,
      formatted.isSubscription ? 'Yes' : 'No',
      formatted.isEdited ? 'Yes' : 'No',
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export const generateJSON = (transactions: TTransaction[]): string => {
  const formattedTransactions = transactions.map(formatTransactionForExport)
  return JSON.stringify(formattedTransactions, null, 2)
}

export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string,
) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const getExportFilename = (format: ExportFormat): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  return `explend_transactions_${timestamp}.${format}`
}

export const getMimeType = (format: ExportFormat): string => {
  const mimeTypes: Record<ExportFormat, string> = {
    csv: 'text/csv;charset=utf-8;',
    json: 'application/json;charset=utf-8;',
  }
  return mimeTypes[format]
}
