import { Skeleton } from '@nextui-org/react'

export function UserInfoSkeleton() {
  return (
    <div className='flex w-full items-center gap-x-2'>
      <div>
        <Skeleton className='flex h-[40px] w-[40px] rounded-full' />
      </div>
      <div className='flex w-full flex-col gap-2'>
        <Skeleton className='h-3 w-3/5 rounded-medium' />
        <Skeleton className='h-3 w-4/5 rounded-medium' />
      </div>
    </div>
  )
}
