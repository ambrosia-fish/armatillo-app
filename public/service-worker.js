// Armatillo Service Worker
const CACHE_NAME = 'armatillo-cache-v1';
const OFFLINE_URL = '/index.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json', 
  '/assets/images/icon.png',
  '/assets/images/splash-icon.png',
  '/assets/images/favicon.png'
];

// Install event - cache key files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[ServiceWorker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Helper function - should we cache this request?
function shouldCache(url) {
  // Don't cache API calls
  if (url.pathname.startsWith('/api/') || url.href.includes('/api/')) {
    return false;
  }
  
  // Cache static assets and main pages
  return (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf')
  );
}

// Helper function - is this a navigation request?
function isNavigationRequest(event) {
  return (
    event.request.mode === 'navigate' ||
    (event.request.method === 'GET' &&
     event.request.headers.get('accept').includes('text/html'))
  );
}

// Fetch event handler with navigation support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For navigation requests, try the network first, then fall back to cache
  if (isNavigationRequest(event)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a copy of the response if it's valid
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // For non-navigation requests, use cache-first strategy for static assets
  if (shouldCache(url)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then((response) => {
              // Clone the response
              const responseToCache = response.clone();
              
              // Cache the fetched response
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
    );
  } else {
    // For API requests and other non-cacheable content, just fetch from network
    event.respondWith(fetch(event.request));
  }
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
