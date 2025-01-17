'use client'

import { PiLock, PiLockFill } from 'react-icons/pi'

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
      className='fixed bottom-4 right-4 cursor-none md:bottom-8 md:right-8'
    >
      <HoverableElement
        uKey='mask-amount-info'
        element={<PiLock />}
        hoveredElement={<PiLockFill />}
        withShift={false}
      />
    </div>
  )
}
