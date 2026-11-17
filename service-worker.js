const CACHE_NAME = "news-widget-v1";

const APP_FILES = [
    "./",
    "index.html",
    "style.css",
    "script.js",
    "assets/logo.png",
    "assets/background.jpg"
];

// Save the widget's own files so it can start without internet.
async function saveAppFiles() {
    const CACHE = await caches.open(CACHE_NAME);
    await CACHE.addAll(APP_FILES);
}

// Feed and page files: try the internet first, use the saved copy when offline.
async function getFromNetwork(request) {
    const CACHE = await caches.open(CACHE_NAME);

    try {
        const RESPONSE = await fetch(request);
        await CACHE.put(request, RESPONSE.clone());
        return RESPONSE;
    } catch (error) {
        return CACHE.match(request);
    }
}

// Images: use the saved copy first, download only if it is not saved yet.
async function getFromCache(request) {
    const CACHE = await caches.open(CACHE_NAME);
    const SAVED_RESPONSE = await CACHE.match(request);

    if (SAVED_RESPONSE) {
        return SAVED_RESPONSE;
    }

    const RESPONSE = await fetch(request);
    await CACHE.put(request, RESPONSE.clone());
    return RESPONSE;
}

// Decide how each request is handled.
function handleFetch(event) {
    if (event.request.method !== "GET") {
        return;
    }

    if (event.request.destination === "image") {
        event.respondWith(getFromCache(event.request));
        return;
    }

    event.respondWith(getFromNetwork(event.request));
}

self.addEventListener("install", (event) => {
    event.waitUntil(saveAppFiles());
    self.skipWaiting();
});

self.addEventListener("activate", () => {
    self.clients.claim();
});

self.addEventListener("fetch", handleFetch);