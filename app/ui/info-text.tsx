import { cn } from '../lib/utils'

type TProps = {
  id?: string
  text: string
  withAsterisk?: boolean
  withDoubleAsterisk?: boolean
  isSm?: boolean
}

export default function InfoText({
  id,
  text,
  withAsterisk = true,
  withDoubleAsterisk = false,
  isSm = false,
}: TProps) {
  return (
    <p
      id={id}
      className={cn(
        'text-default-300 hover:cursor-none hover:text-foreground',
        isSm ? 'text-sm' : 'text-xxs md:text-xs',
      )}
    >
      {withDoubleAsterisk && ' ** '}
      {!withDoubleAsterisk && withAsterisk && ' * '}
      {text}
    </p>
  )
}
