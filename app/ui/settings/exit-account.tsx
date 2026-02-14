'use client'

import { useFormStatus } from 'react-dom'
import { PiUserSwitch, PiUserSwitchFill } from 'react-icons/pi'

import { Button } from '@heroui/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import type { TIcon } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

function ExitAccount() {
  const { pending } = useFormStatus()

  const buttonWithIcon = (icon: TIcon) => (
    <Button
      type='submit'
      isLoading={pending}
      isDisabled={pending}
      startContent={!pending && icon}
      className='bg-foreground text-default-50 w-full font-medium'
    >
      Sign out
    </Button>
  )

  return (
    <HoverableElement
      uKey='exit-account'
      element={buttonWithIcon(<PiUserSwitch size={DEFAULT_ICON_SIZE} />)}
      hoveredElement={buttonWithIcon(
        <PiUserSwitchFill size={DEFAULT_ICON_SIZE} />,
      )}
      withShift={false}
    />
  )
}

export default ExitAccount
