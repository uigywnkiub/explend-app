'use client'

import { PiLock, PiLockFill } from 'react-icons/pi'

import { Tooltip } from '@heroui/react'

import { DEFAULT } from '@/config/constants/colors'
import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import { getBooleanFromLocalStorage } from '@/app/lib/helpers'

import { HoverableElement } from '../hoverables'

export default function MaskAmountInfo() {
  if (!getBooleanFromLocalStorage(LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN)) {
    return null
  }

  return (
    <Tooltip content='Masked amounts' size='sm' placement='left'>
      <div className='fixed right-6 bottom-8 md:right-11 md:bottom-8'>
        <HoverableElement
          uKey='mask-amount-info'
          element={<PiLock fill={DEFAULT} />}
          hoveredElement={<PiLockFill fill={DEFAULT} />}
          withShift={false}
        />
      </div>
    </Tooltip>
  )
}
