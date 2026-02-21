import Link from 'next/link'

import { ROUTE } from '@/config/constants/routes'

import ClientButton from './ui/client-button'
import InfoText from './ui/info-text'
import Logo from './ui/logo'

export default function NotFound() {
  return (
    <main className='xs:px-0 mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center'>
      <div className='opacity-30 grayscale invert transition-discrete duration-250 hover:invert-50'>
        <Logo size='xs' />
      </div>
      <div className='flex flex-col items-center'>
        <InfoText withAsterisk={false} isMd text='#404NotFound' />
      </div>
      <h1 className='md:text-lg'>
        Looks like this page got lost in the internet abyss. Do not worry, we
        will help you find your way home.
      </h1>
      <Link href={ROUTE.HOME}>
        <ClientButton
          title='Return home'
          color='primary'
          className='text-default-50'
        />
      </Link>
    </main>
  )
}
