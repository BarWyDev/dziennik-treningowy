// Service Worker dla Dziennik Treningowy
const CACHE_NAME = 'dziennik-treningowy-v1';
const STATIC_CACHE_NAME = 'dziennik-static-v1';
const DYNAMIC_CACHE_NAME = 'dziennik-dynamic-v1';

// Zasoby do cache'owania przy instalacji
const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
];

// Zasoby do cache'owania dynamicznie (API responses)
const API_CACHE_PATTERNS = [
  /^\/api\/trainings/,
  /^\/api\/dashboard/,
  /^\/api\/goals/,
  /^\/api\/training-types/,
  /^\/api\/personal-records/,
];

// Instalacja Service Workera
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Aktywacja Service Workera
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Interceptowanie requestów
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignoruj requesty do API auth (muszą być zawsze świeże)
  if (url.pathname.startsWith('/api/auth')) {
    return;
  }

  // Strategia: Network First dla API, Cache First dla statycznych zasobów
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  } else if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Dla stron HTML - Network First z fallback do cache
    event.respondWith(networkFirstStrategy(request));
  }
});

// Strategia: Network First (dla API i stron)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache tylko successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback dla stron - zwróć stronę główną
    if (request.destination === 'document') {
      const fallback = await caches.match('/');
      if (fallback) return fallback;
    }
    
    throw error;
  }
}

// Strategia: Cache First (dla statycznych zasobów)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Cache and network failed:', error);
    throw error;
  }
}

// Obsługa wiadomości (dla aktualizacji cache)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
