'use client'

import { Button, ButtonProps } from '@heroui/react'

type TProps = {
  title: string
}

export default function ClientButton({
  title,
  ...attrs
}: Omit<ButtonProps, 'title'> & TProps) {
  return <Button {...attrs}>{title}</Button>
}
