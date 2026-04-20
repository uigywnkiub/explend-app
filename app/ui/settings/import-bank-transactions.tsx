'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { Button, Image } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { importBankTransactions } from '@/app/lib/actions'
import { capitalizeFirstLetter, pluralize } from '@/app/lib/helpers'
import { TBank, TIcon, TTransaction, TUserId } from '@/app/lib/types'

type TProps = {
  userId: TUserId
  currency: TTransaction['currency']
  userCategories: TTransaction['categories']
  userSalaryDay: TTransaction['salaryDay']
}

export default function ImportBankTransactions({
  userId,
  currency,
  userCategories,
  userSalaryDay,
}: TProps) {
  const monoRef = useRef<HTMLInputElement>(null)
  const privatRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<TBank | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    bank: TBank,
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const isMonobank = bank === 'monobank'
    const expectedExt = isMonobank ? '.csv' : '.xlsx'

    if (!file.name.endsWith(expectedExt)) {
      haptic.error()
      toast.error(
        `Only ${expectedExt} files are supported for ${isMonobank ? 'Monobank' : 'Privat24'}.`,
      )

      return
    }

    setUploading(bank)
    setError(null)
    setSuccess(null)

    try {
      const payload = isMonobank
        ? await file.text()
        : Buffer.from(await file.arrayBuffer()).toString('base64')

      const result = await toast.promise(
        importBankTransactions(
          userId,
          currency,
          userCategories,
          userSalaryDay,
          bank,
          payload,
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
      haptic.error()
      setError('Import failed. Check the file format and try again.')
    } finally {
      setUploading(null)
      if (monoRef.current) monoRef.current.value = ''
      if (privatRef.current) privatRef.current.value = ''
    }
  }

  const importButton = (bank: TBank, icon: TIcon, label: string) => (
    <Button
      onPress={() => {
        haptic()
        ;(bank === 'monobank' ? monoRef : privatRef).current?.click()
      }}
      isLoading={uploading === bank}
      isDisabled={uploading !== null}
      variant='bordered'
      startContent={uploading !== bank && icon}
      className='w-full font-medium'
    >
      {label}
    </Button>
  )

  return (
    <div className='flex flex-col items-start gap-4'>
      <div className='flex w-full items-center gap-4'>
        <div className='flex-1'>
          {importButton(
            'monobank',
            <Image
              src='/images/monobank-logo.jpeg'
              alt={capitalizeFirstLetter('monobank' satisfies TBank)}
              className='size-4.5'
            />,
            'Mono CSV',
          )}
        </div>
        <div className='flex-1'>
          {importButton(
            'privat24',
            <Image
              src='/images/privat24-logo.jpeg'
              alt={capitalizeFirstLetter('privat24' satisfies TBank)}
              className='size-4.5'
            />,
            'Privat24 XLSX',
          )}
        </div>
        <input
          ref={monoRef}
          type='file'
          accept='.csv'
          className='hidden'
          onChange={(e) => onFileChange(e, 'monobank')}
        />
        <input
          ref={privatRef}
          type='file'
          accept='.xlsx'
          className='hidden'
          onChange={(e) => onFileChange(e, 'privat24')}
        />
      </div>
      {error && <p className='text-danger text-sm'>{error}</p>}
      {success && <p className='text-success text-sm'>{success}</p>}
    </div>
  )
}
