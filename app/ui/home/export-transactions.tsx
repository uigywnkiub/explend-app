'use client'

import { useState } from 'react'

import toast from 'react-hot-toast'
import { PiDownloadSimpleFill } from 'react-icons/pi'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DateRangePicker,
  Select,
  SelectItem,
} from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { format, subMonths } from 'date-fns'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import {
  type ExportFormat,
  downloadFile,
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
} from '../../lib/export-utils'
import type { TTransaction } from '../../lib/types'

type ExportTransactionsProps = {
  transactions: TTransaction[]
  onExport: (startDate?: Date, endDate?: Date) => Promise<TTransaction[]>
}

export default function ExportTransactions({
  transactions,
  onExport,
}: ExportTransactionsProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{
    start: string
    end: string
  } | null>(null)

  const defaultStart = format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  const defaultEnd = format(new Date(), 'yyyy-MM-dd')

  const handleExport = async () => {
    try {
      setIsLoading(true)

      let transactionsToExport = transactions

      if (dateRange) {
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999)

        transactionsToExport = await onExport(startDate, endDate)
      }

      if (transactionsToExport.length === 0) {
        toast.error('No transactions to export')
        return
      }

      let content: string
      if (format === 'csv') {
        content = generateCSV(transactionsToExport)
      } else {
        content = generateJSON(transactionsToExport)
      }

      const filename = getExportFilename(format)
      const mimeType = getMimeType(format)

      downloadFile(content, filename, mimeType)

      toast.success(
        `Exported ${transactionsToExport.length} transaction${transactionsToExport.length !== 1 ? 's' : ''}`,
      )
    } catch (error) {
      toast.error('Failed to export transactions')
      console.error('Export error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className='text-lg font-semibold'>Export Transactions</h2>
      </CardHeader>
      <CardBody className='gap-4'>
        <Select
          label='Export Format'
          selectedKeys={[format]}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
          className='max-w-xs'
        >
          <SelectItem key='csv' value='csv'>
            CSV (Spreadsheet)
          </SelectItem>
          <SelectItem key='json' value='json'>
            JSON (Data)
          </SelectItem>
        </Select>

        <DateRangePicker
          label='Date Range (Optional)'
          className='max-w-xs'
          defaultValue={
            dateRange
              ? {
                  start: parseDate(dateRange.start),
                  end: parseDate(dateRange.end),
                }
              : undefined
          }
          onChange={(value) => {
            if (value) {
              setDateRange({
                start: value.start.toString(),
                end: value.end.toString(),
              })
            } else {
              setDateRange(null)
            }
          }}
        />

        <Button
          color='primary'
          startContent={
            isLoading ? null : <PiDownloadSimpleFill size={DEFAULT_ICON_SIZE} />
          }
          onPress={handleExport}
          isLoading={isLoading}
          className='max-w-xs'
        >
          {isLoading ? 'Exporting...' : 'Export'}
        </Button>

        <p className='text-sm text-default-500'>
          {dateRange
            ? `Exporting transactions from ${dateRange.start} to ${dateRange.end}`
            : `Ready to export all ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
        </p>
      </CardBody>
    </Card>
  )
}
