import { Divider, Spacer } from '@nextui-org/react'

type TProps = {
  title: string
  subtitle: string
  withDivider?: boolean
  children: JSX.Element
}

export default function Section({
  title,
  subtitle,
  withDivider = true,
  children,
}: TProps) {
  return (
    <div className='max-w-3xl'>
      <h1 className='text-xl font-semibold'>{title}</h1>
      <p className='text-md text-balance text-default-500'>{subtitle}</p>
      <Spacer y={8} />
      {children}
      {withDivider && <Divider className='my-6' />}
    </div>
  )
}
