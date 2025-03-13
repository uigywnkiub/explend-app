import { cn } from '../lib/helpers'

type TProps = {
  id?: string
  text: string | React.ReactNode
  withAsterisk?: boolean
  withDoubleAsterisk?: boolean
  withHover?: boolean
  isSm?: boolean
}

export default function InfoText({
  id,
  text,
  withAsterisk = true,
  withDoubleAsterisk = false,
  withHover = true,
  isSm = false,
}: TProps) {
  return (
    <p
      id={id}
      className={cn(
        'text-default-500',
        isSm ? 'text-sm' : 'text-xs',
        withHover && 'hover:cursor-none hover:text-foreground',
      )}
    >
      {withDoubleAsterisk && ' ** '}
      {!withDoubleAsterisk && withAsterisk && ' * '}
      {text}
    </p>
  )
}
