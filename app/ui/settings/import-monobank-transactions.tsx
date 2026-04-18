'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PiUpload, PiUploadFill } from 'react-icons/pi'

import { Button } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { importTransactionsFromMonobankCsv } from '@/app/lib/actions'
import { pluralize } from '@/app/lib/helpers'
import { TIcon, TTransaction, TUserId } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

type TProps = {
  userId: TUserId
  currency: TTransaction['currency']
  userCategories: TTransaction['categories']
  userSalaryDay: TTransaction['salaryDay']
}

export default function ImportMonobankTransactions({
  userId,
  currency,
  userCategories,
  userSalaryDay,
}: TProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Only .csv files are supported.')
      haptic.error()
      toast.error('Only .csv files are supported.')

      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()

      const result = await toast.promise(
        importTransactionsFromMonobankCsv(
          userId,
          currency,
          userCategories,
          userSalaryDay,
          text,
        ),
        {
          loading: 'Importing transactions...',
          success: (res) =>
            res.skipped > 0
              ? `Imported ${res.count} ${pluralize(res.count, 'transaction', 'transactions')}, skipped ${res.skipped} ${pluralize(res.skipped, 'duplicate', 'duplicates')}.`
              : `Successfully imported ${res.count} ${pluralize(res.count, 'transaction', 'transactions')}.`,
          error: 'Import failed. Check the file format and try again.',
        },
      )

      setSuccess(
        result.skipped > 0
          ? `Imported ${result.count} ${pluralize(result.count, 'transaction', 'transactions')}, skipped ${result.skipped} ${pluralize(result.skipped, 'duplicate', 'duplicates')}.`
          : `Successfully imported ${result.count} ${pluralize(result.count, 'transaction', 'transactions')}.`,
      )
    } catch {
      setError('Import failed. Check the file format and try again.')
      haptic.error()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const uploadButtonWithIcon = (icon: TIcon) => (
    <Button
      onPress={() => [haptic(), fileInputRef.current?.click()]}
      isLoading={uploading}
      isDisabled={uploading}
      variant='bordered'
      startContent={!uploading && icon}
      className='w-full font-medium'
    >
      Import CSV
    </Button>
  )

  return (
    <div className='flex flex-col items-start gap-4'>
      <div className='w-full'>
        <HoverableElement
          uKey='import-csv-transactions'
          element={uploadButtonWithIcon(<PiUpload size={DEFAULT_ICON_SIZE} />)}
          hoveredElement={uploadButtonWithIcon(
            <PiUploadFill size={DEFAULT_ICON_SIZE} />,
          )}
          withShift={false}
        />
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='.csv'
        className='hidden'
        onChange={onFileChange}
      />
      {error && <p className='text-danger text-sm'>{error}</p>}
      {success && <p className='text-success text-sm'>{success}</p>}
    </div>
  )
}
