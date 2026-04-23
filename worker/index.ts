/* eslint-disable check-file/no-index */
/// <reference lib="webworker" />
import { APP_NAME } from '@/config/constants/main'
import { ROUTE } from '@/config/constants/routes'

export {}

declare const self: ServiceWorkerGlobalScope & typeof globalThis

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}

  event.waitUntil(
    self.registration.showNotification(data.title || APP_NAME.SHORT, {
      body: data.body,
      icon: data.icon || '/icon.png',
      data: { url: data.url || ROUTE.HOME },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || ROUTE.HOME),
  )
})
