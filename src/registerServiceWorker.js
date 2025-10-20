export function registerServiceWorker() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker enregistré avec succès ✅');
  
            // Essayer d'enregistrer une sync si des utilisateurs sont en attente
            navigator.serviceWorker.ready.then((swReg) => {
              swReg.sync.register('sync-new-user');
            });
          })
          .catch((err) => {
            console.error('Erreur d’enregistrement du Service Worker 😓', err);
          });
      });
    }
  }
  