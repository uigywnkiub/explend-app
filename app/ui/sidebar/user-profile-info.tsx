'use client'

import { Popover, PopoverContent, PopoverTrigger, User } from '@heroui/react'

import { signOutAccount } from '@/app/lib/actions'
import type { TDefaultSession } from '@/app/lib/types'

import ExitAccount from '../settings/exit-account'

type TProps = {
  user: TDefaultSession['user']
}

function UserProfileInfo({ user }: TProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <div className='cursor-pointer'>
          <User
            name={user?.name}
            description={user?.email}
            avatarProps={{
              ImgComponent: 'img',
              imgProps: {
                width: 40,
                height: 40,
              },
              src: user?.image || '',
            }}
            classNames={{
              name: 'text-md md:text-sm',
              description: 'text-sm md:text-tiny',
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className='flex flex-col gap-2 px-2 py-3'>
          <div className='text-sm font-semibold'>Exit account</div>
          <div className='text-xs'>
            Sign out or switch to a different account
          </div>
          <form action={signOutAccount}>
            <ExitAccount />
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default UserProfileInfo
