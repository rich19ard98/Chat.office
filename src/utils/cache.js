// utils/cache.js
import LZString from "lz-string";

// ---------- Sauvegarde ----------
export async function saveCache(name, key, data) {
    const payload = { ...data, timestamp: Date.now() };
    const compressed = LZString.compressToUTF16(JSON.stringify(payload));
    const storageKey = `${name}_${key}`;
    const requestKey = new Request(`cache://${storageKey}`); // ✅ clé unique

    try {
        if ("caches" in window) {
            const cache = await caches.open(name);
            const response = new Response(compressed, {
                headers: { "Content-Type": "text/plain" },
            });
            await cache.put(requestKey, response);
        } else {
            localStorage.setItem(storageKey, compressed);
        }
    } catch (err) {
        console.warn("⚠️ Erreur saveCache → fallback brut", err);
        localStorage.setItem(storageKey, JSON.stringify(payload));
    }
}

// ---------- Lecture ----------
export async function loadCache(name, key, maxAgeMs = 3600000) {
    const storageKey = `${name}_${key}`;
    const requestKey = new Request(`cache://${storageKey}`);

    try {
        let compressed = null;

        if ("caches" in window) {
            const cache = await caches.open(name);
            const cachedResponse = await cache.match(requestKey);
            if (cachedResponse) {
                compressed = await cachedResponse.text();
            }
        } else {
            compressed = localStorage.getItem(storageKey);
        }

        if (compressed) {
            let decompressed = LZString.decompressFromUTF16(compressed);
            if (!decompressed) {
                // fallback si déjà brut JSON
                decompressed = compressed;
            }
            const json = JSON.parse(decompressed);

            const isExpired = Date.now() - json.timestamp > maxAgeMs;
            if (!isExpired) return json;
        }
    } catch (err) {
        console.warn("⚠️ Erreur loadCache", err);
    }
    return null;
}
