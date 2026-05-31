import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Background alarm — the app sends SET_ALARM when a feed is recorded or interval changes.
// The SW schedules a showNotification so it fires even when the tab is in background.
let alarmTimer = null;

self.addEventListener('message', (event) => {
  const { type, nextAt, nick } = event.data || {};

  if (type === 'SET_ALARM') {
    if (alarmTimer) clearTimeout(alarmTimer);
    const delay = new Date(nextAt) - Date.now();
    if (delay > 0 && delay < 5 * 60 * 60 * 1000) {
      alarmTimer = setTimeout(async () => {
        alarmTimer = null;
        // Only show if the app is not in the foreground
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const appVisible = clients.some((c) => c.visibilityState === 'visible');
        if (!appVisible) {
          self.registration.showNotification('MilkLog 🍼', {
            body: `${nick} 수유 시간이에요`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'milklog-alarm',
            renotify: true,
            vibrate: [200, 100, 200],
          });
        }
      }, delay);
    }
  }

  if (type === 'CANCEL_ALARM') {
    if (alarmTimer) { clearTimeout(alarmTimer); alarmTimer = null; }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});
