const CACHE = 'ziwei-v2';

// 安裝：快取主頁面
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache =>
            cache.addAll(['./'])
        ).then(() => self.skipWaiting())
    );
});

// 啟動：清除舊快取
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// 攔截請求：優先用快取，失敗才上網，並把新資源存入快取
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(resp => {
                if (resp && resp.status === 200 && e.request.method === 'GET') {
                    const clone = resp.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return resp;
            }).catch(() => cached);
        })
    );
});
