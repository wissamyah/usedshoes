// Service Worker for Used Shoes Business Tracker
// Provides caching and offline functionality

const CACHE_NAME = 'usedshoes-v1';
const STATIC_CACHE = 'usedshoes-static-v1';
const DYNAMIC_CACHE = 'usedshoes-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// API endpoints that can be cached
const CACHEABLE_API_ENDPOINTS = [
  '/api/data',
  '/api/settings'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
  
  // Take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with different strategies
  if (isStaticAsset(request)) {
    // Cache First strategy for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(request)) {
    // Network First strategy for API requests
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (isNavigationRequest(request)) {
    // Network First with fallback to cached shell
    event.respondWith(navigationStrategy(request));
  } else {
    // Stale While Revalidate for other requests
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Background Sync - for offline data synchronization
self.addEventListener('sync', (event) => {
  if (event.tag === 'github-sync') {
    console.log('[SW] Background sync: github-sync');
    event.waitUntil(
      syncWithGitHub()
        .catch(error => {
          console.error('[SW] Background sync failed:', error);
        })
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: 'usedshoes-notification',
    actions: [
      {
        action: 'view',
        title: 'View App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Used Shoes Tracker', options)
  );
});

// Helper functions
function isStaticAsset(request) {
  return request.url.includes('/static/') || 
         request.url.includes('/icons/') ||
         request.url.endsWith('.js') ||
         request.url.endsWith('.css') ||
         request.url.endsWith('.png') ||
         request.url.endsWith('.jpg') ||
         request.url.endsWith('.svg');
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('api.github.com');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Caching strategies
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const networkResponse = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(cacheName);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(error => {
      console.log('[SW] Stale while revalidate network failed:', error.message);
    });

  return cachedResponse || networkResponse;
}

async function navigationStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Navigation network failed:', error.message);
  }

  // Fallback to cached shell
  const cachedResponse = await caches.match('/index.html');
  if (cachedResponse) {
    return cachedResponse;
  }

  // Last resort - return a basic offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Used Shoes Tracker - Offline</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            text-align: center; 
            padding: 2rem;
            background: #f8fafc;
            color: #374151;
          }
          .offline-container {
            max-width: 500px;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .offline-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            opacity: 0.6;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1>You're Offline</h1>
          <p>Used Shoes Tracker is not available right now. Check your internet connection and try again.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// GitHub synchronization function
async function syncWithGitHub() {
  // Get pending sync data from IndexedDB
  const pendingData = await getPendingSyncData();
  
  if (!pendingData || pendingData.length === 0) {
    console.log('[SW] No pending sync data');
    return;
  }

  // Attempt to sync each pending item
  for (const item of pendingData) {
    try {
      await syncDataItem(item);
      await removePendingSyncData(item.id);
      console.log('[SW] Synced item:', item.id);
    } catch (error) {
      console.error('[SW] Failed to sync item:', item.id, error);
    }
  }
}

// IndexedDB helpers for offline data
async function getPendingSyncData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('usedshoes-offline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending-sync'], 'readonly');
      const store = transaction.objectStore('pending-sync');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-sync')) {
        db.createObjectStore('pending-sync', { keyPath: 'id' });
      }
    };
  });
}

async function removePendingSyncData(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('usedshoes-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending-sync'], 'readwrite');
      const store = transaction.objectStore('pending-sync');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

async function syncDataItem(item) {
  // Implement actual sync logic with GitHub API
  const response = await fetch(`https://api.github.com/repos/${item.owner}/${item.repo}/contents/${item.file}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${item.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: item.commitMessage,
      content: btoa(JSON.stringify(item.data, null, 2)),
      sha: item.sha
    })
  });

  if (!response.ok) {
    throw new Error(`GitHub sync failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MARK') {
    console.log('[SW] Performance mark:', event.data.name, event.data.duration);
  }
});

console.log('[SW] Service Worker loaded');