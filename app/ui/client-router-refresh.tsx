'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Loading from '@/app/loading'

import { DEFAULT_LOADING_TEXT } from '@/config/constants/main'

type TProps = {
  loadingText?: string
}

export default function ClientRouterRefresh({
  loadingText = DEFAULT_LOADING_TEXT,
}: TProps) {
  const router = useRouter()

  useEffect(() => {
    router.refresh()
  }, [router])

  return <Loading text={loadingText} />
}
