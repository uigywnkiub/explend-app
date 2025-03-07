'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { PiTrash, PiTrashFill } from 'react-icons/pi'

import { Button, cn } from '@heroui/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { deleteTestTransactions } from '@/app/lib/actions'
import type { TUserId } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

type TProps = {
  userId: TUserId
}

export default function DeleteTestTransactions({ userId }: TProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onDeleteTestTransactions = async () => {
    setIsLoading(true)
    try {
      await deleteTestTransactions(userId)
      toast.success('Test transactions deleted.')
    } catch (err) {
      toast.error('Failed to delete test transactions.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center gap-2 text-balance text-center'>
      <p className='text-sm'>Delete all test transactions.</p>
      <Button
        onPress={onDeleteTestTransactions}
        isDisabled={isLoading}
        isLoading={isLoading}
        color='danger'
      >
        {isLoading ? (
          <span className='flex gap-1'>
            <span className={cn(isLoading && 'hidden')}>
              <HoverableElement
                uKey='creating'
                element={<PiTrash size={DEFAULT_ICON_SIZE} />}
                hoveredElement={<PiTrashFill size={DEFAULT_ICON_SIZE} />}
                withShift={false}
              />
            </span>
            Deleting...
          </span>
        ) : (
          <span className='flex gap-1'>
            <span className={cn(isLoading && 'hidden')}>
              <HoverableElement
                uKey='create'
                element={<PiTrash size={DEFAULT_ICON_SIZE} />}
                hoveredElement={<PiTrashFill size={DEFAULT_ICON_SIZE} />}
                withShift={false}
              />
            </span>
            Delete
          </span>
        )}
      </Button>
    </div>
  )
}
