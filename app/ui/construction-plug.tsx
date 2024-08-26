import { toLowerCase } from '../lib/helpers'

type TProps = {
  pageTitle?: string
  target?: 'page' | 'section'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  withIcon?: boolean
}

export default function ConstructionPlug({
  pageTitle,
  target = 'page',
  size = 'md',
  withIcon = true,
}: TProps) {
  let textSizeClass = 'text-md'
  switch (size) {
    case 'xs':
      textSizeClass = 'text-xs'
      break
    case 'sm':
      textSizeClass = 'text-sm'
      break
    case 'lg':
      textSizeClass = 'text-lg'
      break
  }

  return (
    <p className={`${textSizeClass} text-warning`}>
      {withIcon ? '🚧' : null} The{' '}
      {target === 'page' && pageTitle
        ? `${toLowerCase(pageTitle)} ${target}`
        : target}{' '}
      is under construction.
    </p>
  )
}
