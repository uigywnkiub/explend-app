'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiDownload,
  PiDownloadFill,
  PiUpload,
  PiUploadFill,
} from 'react-icons/pi'

import { Button } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { APP_NAME, DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { getDataDump, importDataDump } from '../../lib/actions'
import {
  pluralize,
  readFileAsText,
  triggerDownloadJSON,
} from '../../lib/helpers'
import { TIcon, TTransaction, TUserId, TUserSettings } from '../../lib/types'
import { HoverableElement } from '../hoverables'

type TProps = {
  userId: TUserId
}

export default function DownloadUploadTransactions({ userId }: TProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [downloading, setDownloading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onDownload() {
    setDownloading(true)
    setError(null)
    setSuccess(null)

    try {
      const dump = await toast.promise(getDataDump(userId), {
        loading: 'Exporting data...',
        success: 'Data exported.',
        error: 'Download failed. Please try again.',
      })

      if (!dump.transactions.length && !dump.usersettings) {
        setError('No data found.')
        haptic.error()
        toast.error('No data found.')

        return
      }

      const now = new Date()
      const date = now.toISOString().split('T')[0]
      const time = now.toTimeString().slice(0, 5).replace(':', '-')
      const userIdentifier = userId ?? 'user'
      const emailPrefix = userIdentifier.includes('@')
        ? userIdentifier.split('@')[0].slice(0, 12)
        : userIdentifier.slice(0, 12)
      const safeEmailPrefix = emailPrefix
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
      triggerDownloadJSON(
        JSON.stringify(dump, null, 2),
        `${APP_NAME.FULL.toLowerCase().replace(' ', '-')}-${safeEmailPrefix}-dump-${date}_${time}.json`,
      )
    } catch {
      setError('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setError('Only .json files are supported.')
      haptic.error()
      toast.error('Only .json files are supported.')

      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await readFileAsText(file)
      const parsed: unknown = JSON.parse(text)
      // Continue to accept older backups that contain only a transaction array.
      const dump = Array.isArray(parsed)
        ? { transactions: parsed as Partial<TTransaction>[] }
        : (parsed as {
            usersettings?: Partial<TUserSettings> | null
            transactions?: Partial<TTransaction>[]
          })

      if (
        !dump ||
        !Array.isArray(dump.transactions) ||
        (!dump.transactions.length && !dump.usersettings)
      ) {
        setError('File is empty or has an invalid format.')
        haptic.error()
        toast.error('File is empty or has an invalid format.')

        return
      }

      const result = await toast.promise(
        importDataDump(userId, {
          usersettings: dump.usersettings,
          transactions: dump.transactions,
        }),
        {
          loading: 'Importing transactions...',
          success: (res) =>
            res.skipped > 0
              ? `Imported ${res.count} ${pluralize(res.count, 'transaction', 'transactions')}, skipped ${res.skipped} ${pluralize(res.skipped, 'duplicate', 'duplicates')}.`
              : `Successfully imported ${res.count} ${pluralize(res.count, 'transaction', 'transactions')}.`,
          // error: (err) => 'Upload failed. Check the file format and try again.',
        },
      )

      setSuccess(
        result.skipped > 0
          ? `Imported ${result.count} ${pluralize(
              result.count,
              'transaction',
              'transactions',
            )}, skipped ${result.skipped} ${pluralize(
              result.skipped,
              'duplicate',
              'duplicates',
            )}.`
          : `Successfully imported ${result.count} ${pluralize(
              result.count,
              'transaction',
              'transactions',
            )}.`,
      )
    } catch (err) {
      if (
        err instanceof Error &&
        ((err as { code?: string }).code === 'MONGO_BULK_WRITE_ERROR' ||
          err.message.includes('E11000'))
      ) {
        setError(
          `Some transactions already exist and were skipped. (${err.name})`,
        )
        haptic.error()
        toast.error(`Duplicate transactions skipped. (${err.name})`)

        return
      }

      setError('Upload failed. Check the file format and try again.')
      haptic.error()
      toast.error('Upload failed. Check the file format and try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const busy = downloading || uploading

  const downloadButtonWithIcon = (icon: TIcon) => (
    <Button
      onPress={() => [haptic(), onDownload()]}
      isLoading={downloading}
      isDisabled={busy}
      startContent={!downloading && icon}
      className='bg-foreground text-default-50 w-full font-medium'
    >
      Download JSON
    </Button>
  )

  const uploadButtonWithIcon = (icon: TIcon) => (
    <Button
      onPress={() => [haptic(), fileInputRef.current?.click()]}
      isLoading={uploading}
      isDisabled={busy}
      variant='bordered'
      startContent={!uploading && icon}
      className='w-full font-medium'
    >
      Upload JSON
    </Button>
  )

  return (
    <div className='flex flex-col items-start gap-4'>
      <div className='flex w-full flex-col gap-4 md:flex-row'>
        <div className='flex-1'>
          <HoverableElement
            uKey='download-transactions'
            element={downloadButtonWithIcon(
              <PiDownload size={DEFAULT_ICON_SIZE} />,
            )}
            hoveredElement={downloadButtonWithIcon(
              <PiDownloadFill size={DEFAULT_ICON_SIZE} />,
            )}
            withShift={false}
          />
        </div>
        <input
          ref={fileInputRef}
          type='file'
          accept='.json'
          className='hidden'
          onChange={onFileChange}
        />
        <div className='flex-1'>
          <HoverableElement
            uKey='upload-transactions'
            element={uploadButtonWithIcon(
              <PiUpload size={DEFAULT_ICON_SIZE} />,
            )}
            hoveredElement={uploadButtonWithIcon(
              <PiUploadFill size={DEFAULT_ICON_SIZE} />,
            )}
            withShift={false}
          />
        </div>
      </div>

      {error && <p className='text-danger text-sm'>{error}</p>}
      {success && <p className='text-success text-sm'>{success}</p>}
    </div>
  )
}
