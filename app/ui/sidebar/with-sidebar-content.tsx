import { Suspense } from 'react'

import Loading from '@/app/loading'

import WithSidebar from './with-sidebar'

export default function WithSidebarContent({
  children,
  title,
}: Readonly<{ children: React.ReactNode; title: string }>) {
  return (
    <WithSidebar
      contentNearby={
        <Suspense
          fallback={
            <div className='mx-auto max-w-3xl'>
              <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
                {title}
              </h1>
              <div className='flex min-h-[40vh] items-center justify-center'>
                <Loading isInline />
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      }
    />
  )
}
