// ============================================================
// SERVICE WORKER — WebDenúncia Offline-First
// ============================================================
const CACHE_NAME = 'webdenuncia-v1';
const OFFLINE_PAGE = '/index.html';

// Todos os assets estáticos que devem ser cacheados no install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
];

// ============================================================
// INSTALL — pré-cacheia todos os assets essenciais
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Ativa imediatamente, sem esperar tabs antigas fecharem
  self.skipWaiting();
});

// ============================================================
// ACTIVATE — remove caches antigas de versões anteriores
// ============================================================
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
  // Assume controle imediato de todas as abas abertas
  self.clients.claim();
});

// ============================================================
// FETCH — estratégia Cache-First com fallback de rede
// Para navegação (HTML): Network-First com fallback offline
// Para assets (CSS/JS): Cache-First
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de outras origens (ex: CDNs externos no futuro)
  if (url.origin !== self.location.origin) return;

  // Requisições de navegação: Network-First → garante conteúdo atualizado
  // quando online; cai no cache quando offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Atualiza o cache com a versão mais recente
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => {
          // Offline: serve o index.html cacheado
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // Assets (CSS, JS, imagens, fontes): Cache-First → resposta instantânea
  // Atualiza em background (stale-while-revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Dispara requisição de rede em background para manter cache fresco
      const networkFetch = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => null);

      // Retorna do cache imediatamente se disponível, senão aguarda rede
      return cachedResponse || networkFetch;
    })
  );
});

// ============================================================
// BACKGROUND SYNC — salva denúncias pendentes quando offline
// ============================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-denuncia') {
    event.waitUntil(syncPendingDenuncias());
  }
});

async function syncPendingDenuncias() {
  // Lê denúncias salvas offline do IndexedDB
  const db = await openDB();
  const pending = await getAllPending(db);

  for (const item of pending) {
    try {
      // Tenta enviar para o servidor real quando voltar online
      // (neste wireframe, apenas marca como sincronizado)
      await markSynced(db, item.id);
      // Notifica o usuário
      self.registration.showNotification('WebDenúncia', {
        body: `Denúncia ${item.protocolo} sincronizada com sucesso.`,
        icon: '/icon-192.png',
      });
    } catch (err) {
      // Deixa para a próxima tentativa de sync
    }
  }
}

// ============================================================
// IndexedDB helpers para denúncias offline
// ============================================================
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('webdenuncia-offline', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
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
