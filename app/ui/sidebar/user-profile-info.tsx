'use client'

import Image from 'next/image'

import { User } from '@nextui-org/react'

import { TDefaultSession } from '@/app/lib/types'

type TProps = {
  user: TDefaultSession['user']
}

function UserProfileInfo({ user }: TProps) {
  return (
    <User
      name={user?.name}
      description={user?.email}
      avatarProps={{
        ImgComponent: Image,
        imgProps: {
          // @ts-ignore
          priority: true,
          quality: 100,
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
  )
}

export default UserProfileInfo
