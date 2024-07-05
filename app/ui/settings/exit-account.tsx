'use client'

import { useFormStatus } from 'react-dom'
import { PiUserSwitch, PiUserSwitchFill } from 'react-icons/pi'

import { TIcon } from '@/app/lib/types'
import { Button } from '@nextui-org/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { HoverableElement } from '../hoverables'

function ExitAccount() {
  const { pending } = useFormStatus()

  const buttonWithIcon = (icon: TIcon) => (
    <Button
      type='submit'
      isLoading={pending}
      isDisabled={pending}
      startContent={!pending && icon}
      className='w-full bg-foreground font-medium text-default-50'
    >
      Sign out
    </Button>
  )

  return (
    <HoverableElement
      element={buttonWithIcon(<PiUserSwitch size={DEFAULT_ICON_SIZE} />)}
      hoveredElement={buttonWithIcon(
        <PiUserSwitchFill size={DEFAULT_ICON_SIZE} />,
      )}
      withShift={false}
    />
  )
}

export default ExitAccount
