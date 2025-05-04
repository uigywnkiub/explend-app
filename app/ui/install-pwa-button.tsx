'use client'

import { useEffect, useState } from 'react'

import { Button } from '@heroui/react'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<IBeforeInstallPWAPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (e: IBeforeInstallPWAPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const onAppInstalled = () => {
      setIsInstallable(false) // Hide the install button when the app is installed.
    }

    window.addEventListener(
      'beforeinstallprompt',
      onBeforeInstallPrompt as EventListener,
    )
    window.addEventListener('appinstalled', onAppInstalled as EventListener)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        onBeforeInstallPrompt as EventListener,
      )
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const onInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        if (choiceResult.outcome === 'accepted') {
          // User accepted the install prompt.
        } else {
          // User dismissed the install prompt.
        }
      } catch (err) {
        throw err
      } finally {
        setDeferredPrompt(null)
      }
    }
  }

  if (!isInstallable) {
    return null // Don't render anything if the app is not installable or already installed.
  }

  return (
    <Button
      variant='light'
      onPress={onInstall}
      className='fixed right-3 top-3 text-default-500'
    >
      Install
    </Button>
  )
}
