import Link from 'next/link'

import { ROUTE } from '@/config/constants/routes'

import ClientButton from './ui/client-button'

export default function NotFound() {
  return (
    <main className='xs:px-0 mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center'>
      <div className='flex flex-col items-center'>
        <p className='text-default-500'>#404NotFound</p>
      </div>
      <h1 className='text-lg font-medium'>
        Looks like this page got lost in the internet abyss. Do not worry, we
        will help you find your way home.
      </h1>
      <Link href={ROUTE.HOME}>
        <ClientButton
          title='Return home'
          className='bg-primary text-default-50 max-w-md font-medium'
        />
      </Link>
    </main>
  )
}
