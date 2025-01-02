import { cn } from '../lib/helpers'

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
        'text-default-500 hover:cursor-none hover:text-foreground',
        isSm ? 'text-xs md:text-sm' : 'text-xs',
      )}
    >
      {withDoubleAsterisk && ' ** '}
      {!withDoubleAsterisk && withAsterisk && ' * '}
      {text}
    </p>
  )
}
