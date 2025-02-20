'use client'

import { PiLock, PiLockFill } from 'react-icons/pi'

import { DEFAULT } from '@/config/constants/colors'
import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import { getBooleanFromLocalStorage } from '@/app/lib/helpers'

import { HoverableElement } from '../hoverables'

export default function MaskAmountInfo() {
  if (!getBooleanFromLocalStorage(LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN)) {
    return null
  }

  return (
    <div
      title='Masked amounts'
      className='fixed bottom-8 right-6 md:bottom-8 md:right-11'
    >
      <HoverableElement
        uKey='mask-amount-info'
        element={<PiLock fill={DEFAULT} />}
        hoveredElement={<PiLockFill fill={DEFAULT} />}
        withShift={false}
      />
    </div>
  )
}
