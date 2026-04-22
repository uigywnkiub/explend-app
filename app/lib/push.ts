function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)

  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function registerPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const reg = await navigator.serviceWorker.ready

  const existing = await reg.pushManager.getSubscription()
  const subscription =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    }))

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })
}
