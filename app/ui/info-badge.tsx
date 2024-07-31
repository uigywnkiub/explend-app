type TProps = {
  text: string
  withAsterisk?: boolean
  withDoubleAsterisk?: boolean
}

export default function InfoBadge({
  text,
  withAsterisk = true,
  withDoubleAsterisk = false,
}: TProps) {
  return (
    <span className='text-xxs text-default-300 md:text-xs'>
      {withDoubleAsterisk && ' ** '}
      {!withDoubleAsterisk && withAsterisk && ' * '}
      {text}
    </span>
  )
}
