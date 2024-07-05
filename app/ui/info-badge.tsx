type TProps = {
  text: string
  withAsterisk?: boolean
}

export default function InfoBadge({ text, withAsterisk = true }: TProps) {
  return (
    <span className='text-xxs text-default-300'>
      {withAsterisk && ' *'}
      {text}
    </span>
  )
}
