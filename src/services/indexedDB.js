// utils/indexedDB.ts
// export const openDB = () => {
//     return new Promise<IDBDatabase>((resolve, reject) => {
//       const request = indexedDB.open('UserDB', 1);
//       request.onupgradeneeded = () => {
//         const db = request.result;
//         if (!db.objectStoreNames.contains('pending-users')) {
//           db.createObjectStore('pending-users', { autoIncrement: true });
//         }
//       };
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   };
  
//   export const saveUserOffline = async (data: any) => {
//     const db = await openDB();
//     const tx = db.transaction('pending-users', 'readwrite');
//     const store = tx.objectStore('pending-users');
//     store.add(data);
//     await tx.done;
//   };
  
export const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('UserDB', 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('pending-users')) {
          db.createObjectStore('pending-users', { autoIncrement: true });
        }
      };
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  export const saveUserOffline = async (data) => {
    const db = await openDB();
    const tx = db.transaction('pending-users', 'readwrite');
    const store = tx.objectStore('pending-users');
    store.add(data);
  };
  


  