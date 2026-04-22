function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)

  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function registerPushSubscription() {
  alert('1: push init started')

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('2: not supported')

    return
  }

  alert('3: requesting permission')
  const permission = await Notification.requestPermission()
  alert(`4: permission: ${permission}`)

  if (permission !== 'granted') return

  alert('5: waiting for SW')
  const reg = await navigator.serviceWorker.ready
  alert('6: SW ready')

  const existing = await reg.pushManager.getSubscription()
  alert(`7: existing: ${existing?.endpoint ?? 'none'}`)

  const subscription =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    }))

  alert(`8: subscription endpoint: ${subscription.endpoint}`)

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  alert(`9: saved, status: ${res.status}`)
}
