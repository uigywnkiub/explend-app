import Link from 'next/link'

import { ROUTE } from '@/config/constants/routes'

import ClientButton from './ui/default-button'

export default function NotFound() {
  return (
    <main className='mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center xs:px-0'>
      <div className='flex flex-col items-center'>
        <p className='text-default-300'>#404NotFound</p>
      </div>
      <h1 className='text-lg font-medium'>
        Looks like this page got lost in the internet abyss. Do not worry, we
        will help you find your way home.
      </h1>
      <Link href={ROUTE.HOME}>
        <ClientButton
          title='Return home'
          className='max-w-md bg-primary font-medium text-default-50'
        />
      </Link>
    </main>
  )
}
