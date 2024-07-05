'use client'

import Image from 'next/image'

import { TDefaultSession } from '@/app/lib/types'
import { User } from '@nextui-org/react'

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
    />
  )
}

export default UserProfileInfo
