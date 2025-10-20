
import fetchApi from "../src/helpers/fetchApi";
const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll([
          '/',
          '/index.html',
          OFFLINE_URL,
        ]);
      } catch (error) {
        console.error('[Service Worker] Erreur lors du cache des fichiers :', error);
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🛑 Ignorer toutes les requêtes vers des APIs
  if (url.pathname.startsWith('/administration/')) return;

  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((response) => {
        return response || caches.match(OFFLINE_URL);
      })
    )
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-users') {
    event.waitUntil(syncPendingUsers());
  }
});

async function syncPendingUsers() {
  try {
    const db = await openDB();
    const tx = db.transaction('pending-users', 'readwrite');
    const store = tx.objectStore('pending-users');
    const users = await store.getAll();

    for (const user of users) {
      try {
        await fetchApi('/administration/utilisateurs/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
      } catch (err) {
        console.error('[Sync] Erreur de synchronisation utilisateur', err);
        return;
      }
    }

    await store.clear();
    console.log('[Sync] Tous les utilisateurs hors-ligne ont été synchronisés');
  } catch (err) {
    console.error('[Sync] Erreur de synchronisation :', err);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('UserDB', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending-users')) {
        db.createObjectStore('pending-users', { autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      console.log("✅ IndexedDB ouverte avec succès !");
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("❌ Erreur d'ouverture de IndexedDB :", request.error);
      reject(request.error);
    };
  });
}
