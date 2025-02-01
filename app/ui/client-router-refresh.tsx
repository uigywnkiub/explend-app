'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Loading from '@/app/loading'

type TProps = {
  loadingText?: string
}

export default function ClientRouterRefresh({
  loadingText = 'Just a second...',
}: TProps) {
  const router = useRouter()

  useEffect(() => {
    router.refresh()
  }, [router])

  return <Loading text={loadingText} />
}
