import { Badge } from '@nextui-org/react'

type TSize = 'sm' | 'md' | 'lg'

type TProps = {
  size?: 'smallest' | 'xs' | TSize
  badgeSize?: TSize
  withBadge?: boolean
}

export default function Logo({
  size = 'md',
  badgeSize = 'md',
  withBadge = true,
}: TProps) {
  let logoSizeClass = 'h-40 w-40'
  let textSizeClass = 'text-7xl'
  switch (size) {
    case 'smallest':
      logoSizeClass = 'h-5 w-5'
      textSizeClass = 'text-xxs'
      break
    case 'xs':
      logoSizeClass = 'h-16 w-16'
      textSizeClass = 'text-3xl'
      break
    case 'sm':
      logoSizeClass = 'h-20 w-20'
      textSizeClass = 'text-4xl'
      break
    case 'lg':
      logoSizeClass = 'h-60 w-60'
      textSizeClass = 'text-9xl'
      break
  }

  return (
    <Badge
      content='beta'
      color='warning'
      variant='solid'
      size={badgeSize}
      isInvisible={!withBadge}
    >
      <div className='flex items-center justify-center'>
        <div
          className={`h- flex bg-logo-gradient text-background ${logoSizeClass} items-center justify-center ${size === 'smallest' ? 'rounded-md' : 'rounded-medium'}`}
        >
          <span
            className={`${textSizeClass} -skew-x-6 transform-gpu cursor-default font-inter font-bold drop-shadow-lg`}
          >
            Ex
          </span>
        </div>
      </div>
    </Badge>
  )
}
