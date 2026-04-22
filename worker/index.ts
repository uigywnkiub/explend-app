/* eslint-disable check-file/no-index */
/// <reference lib="webworker" />
import { APP_NAME } from '@/config/constants/main'

export {}

declare const self: ServiceWorkerGlobalScope & typeof globalThis

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}

  event.waitUntil(
    self.registration.showNotification(data.title || APP_NAME.SHORT, {
      body: data.body,
      icon: data.icon || '/icon.png',
      data: { url: data.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/'))
})
