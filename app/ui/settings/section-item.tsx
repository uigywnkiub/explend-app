import type { JSX } from 'react'

type TProps = {
  title: string
  subtitle: string
  children?: JSX.Element
}

export default function SectionItem({ title, subtitle, children }: TProps) {
  return (
    <div className='max-w-3xl'>
      <h2>{title}</h2>
      <p className='text-balance text-sm text-default-500'>{subtitle}</p>
      {children}
    </div>
  )
}
