// service-worker.js
// Install
self.addEventListener("install", event => {
  console.log("SW installé");
  self.skipWaiting(); // Passe immédiatement à l'état actif
});

// Activate
self.addEventListener("activate", event => {
  console.log("SW activé");
  clients.claim(); // Prend le contrôle de toutes les pages
});

// Push
self.addEventListener("push", event => {
  console.log("Push reçu :", event.data ? event.data.text() : "pas de payload");

  const data = event.data ? event.data.json() : {
    title: "Test",
    message: "Message vide"
  };

  // Affiche la notification système
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/icons/Banguka.jpg",
      badge: "/icons/Banguka.jpg",
      tag: "notification-" + (data.ID_UTILISATEUR || "global"),
      data: {
        url: data.URL || "/",

      }
    })
  );
  // Envoie un message aux pages actives pour que React réagisse
  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: "window" })
      .then(clients => {
        clients.forEach(client => {
          // ⚡ Filtrage côté SW : si notification ciblée, vérifier client
          client.postMessage({ type: "PUSH_RECEIVED", payload: data });
        });
      })
  );
});
self.addEventListener("notificationclick", event => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";
  const fullUrl = urlToOpen.startsWith("http") 
    ? urlToOpen 
    : `${self.registration.scope.replace(/\/$/, "")}${urlToOpen}`;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) return client.focus();
      }
      return clients.openWindow(fullUrl);
    })
  );
});

