'use client'

import ClientButton from './ui/client-button'
import InfoText from './ui/info-text'
import Logo from './ui/logo'

export default function Error({
  // eslint-disable-next-line unused-imports/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className='xs:px-0 mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center'>
      <div className='opacity-30 grayscale invert transition-discrete duration-250 hover:invert-50'>
        <Logo size='xs' />
      </div>
      <div className='flex flex-col items-center'>
        <InfoText withAsterisk={false} isMd text='#InternalError' />
      </div>
      <h1 className='md:text-lg'>
        We are currently experiencing technical difficulties. We have identified
        the error and are working on fixing it and will have it resolved soon.
      </h1>
      <ClientButton
        title='Try again'
        color='primary'
        className='text-default-50'
        onPress={reset}
      />
    </main>
  )
}
