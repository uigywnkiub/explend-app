'use client'

import { useEffect } from 'react'

import { registerPushSubscription } from '../lib/push'

export default function RegisterPushSubscription() {
  useEffect(() => {
    registerPushSubscription()
  }, [])

  return null
}
