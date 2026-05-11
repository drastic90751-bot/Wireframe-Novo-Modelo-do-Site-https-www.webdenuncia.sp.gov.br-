const CACHE_NAME = 'webdenuncia-v1';
const OFFLINE_PAGE = '/index.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });

          return networkResponse;
        })
        .catch(() => {
          return caches.match(OFFLINE_PAGE);
        })
    );

    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }

          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || networkFetch;
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-denuncia') {
    event.waitUntil(syncPendingDenuncias());
  }
});

async function syncPendingDenuncias() {
  const db = await openDB();
  const pending = await getAllPending(db);

  for (const item of pending) {
    try {
      await markSynced(db, item.id);

      self.registration.showNotification('WebDenúncia', {
        body: `Denúncia ${item.protocolo} sincronizada com sucesso.`,
        icon: '/icon-192.png',
      });
    } catch (err) {}
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('webdenuncia-offline', 1);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function getAllPending(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readonly');
    const req = tx.objectStore('pending').getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function markSynced(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite');
    const req = tx.objectStore('pending').delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
