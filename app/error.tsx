'use client'

import ClientButton from './ui/default-button'

export default function Error({
  // eslint-disable-next-line unused-imports/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className='mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center xs:px-0'>
      <div className='flex flex-col items-center'>
        <p className='text-default-500'>#InternalError</p>
      </div>
      <h1 className='text-lg font-medium'>
        We are currently experiencing technical difficulties. We have identified
        the error and are working on fixing it and will have it resolved soon.
      </h1>
      <ClientButton
        title='Try Again'
        className='max-w-md bg-primary font-medium text-default-50'
        onPress={() => [reset()]}
      />
    </main>
  )
}
