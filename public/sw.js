const CACHE_NAME = 'zenith-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon.svg',
      ])
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // 1. Skip caching for API requests, Groq streams, and non-GET requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request))
    return
  }

  // 2. For page routes and HTML documents, use a Network-First strategy
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/dashboard' ||
    url.pathname === '/sky' ||
    url.pathname === '/weather' ||
    url.pathname === '/skylens'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh page structure
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          }
          return response
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
          })
        })
    )
    return
  }

  // 3. For static assets (JS, CSS, fonts, SVG), use Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          }
          return networkResponse
        })
        .catch(() => null)

      return cachedResponse || fetchPromise || new Response('Offline', { status: 503 })
    })
  )
})
