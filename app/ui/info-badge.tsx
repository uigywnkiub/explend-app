type TProps = {
  id?: string
  text: string
  withAsterisk?: boolean
  withDoubleAsterisk?: boolean
}

export default function InfoBadge({
  id,
  text,
  withAsterisk = true,
  withDoubleAsterisk = false,
}: TProps) {
  return (
    <p
      id={id}
      className='text-xxs text-default-300 md:text-xs md:hover:cursor-none md:hover:text-foreground'
    >
      {withDoubleAsterisk && ' ** '}
      {!withDoubleAsterisk && withAsterisk && ' * '}
      {text}
    </p>
  )
}
