const staticCacheName = 's-app-v6';
const dynamicCacheName = 'd-app-v2';

const assetUrls = ['index.html', 'css/styles.css', 'js/app.js', 'offline.html'];

self.addEventListener('install', async (event) => {
    try {
        const cache = await caches.open(staticCacheName);
        await cache.addAll(assetUrls);
    } catch (error) {
        console.log(error);
    }
});

self.addEventListener('activate', async (event) => {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((name) => name !== staticCacheName)
                .filter((name) => name !== dynamicCacheName)
                .map((name) => caches.delete(name))
        );
    } catch (error) {
        console.log(error);
    }
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(networkFirst(request));
    }
});

async function cacheFirst(request) {
    try {
        const cached = await caches.match(request);
        return cached ?? (await fetch(request));
    } catch (error) {
        console.log(error);
    }
}

async function networkFirst(request) {
    const cache = await caches.open(dynamicCacheName);
    try {
        const response = await fetch(request);
        await cache.put(request, response.clone());
        return resonse;
    } catch (error) {
        const cached = await cache.match(request);
        return cached ?? (await match('/offline.html'));
    }
}
