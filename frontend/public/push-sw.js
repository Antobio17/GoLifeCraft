const DEFAULT_TITLE = "GoLifeCraft";
const ICON_URL = "/assets/img/icon-dark.png";
const PUSH_RECEIVED = "golifecraft.push.received";
const ASSET_CACHE = "golifecraft-assets-v1";
const MAX_CACHED_ASSETS = 1200;
const HASHED_ASSET =
  /^\/(?:(?:chunk|main|polyfills|styles)-[A-Za-z0-9_-]+\.(?:js|css)|media\/[A-Za-z0-9_-]+-[A-Z0-9]{8}\.(?:woff2?|ttf))$/;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([self.clients.claim(), dropStaleCaches()]));
});

self.addEventListener("fetch", (event) => {
  if (!isHashedAsset(event.request)) return;

  event.respondWith(cacheFirst(event));
});

self.addEventListener("push", (event) => {
  const payload = readPayload(event);

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: ICON_URL,
        badge: ICON_URL,
        tag: payload.tag || undefined,
        data: { url: sameOriginUrl(payload.url) },
      }),
      announceToWindows(),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(focusOrOpen(sameOriginUrl(event.notification.data?.url)));
});

function isHashedAsset(request) {
  if ("GET" !== request.method) return false;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return false;

  return HASHED_ASSET.test(url.pathname);
}

async function cacheFirst(event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(event.request);

  if (cached) return cached;

  const response = await fetch(event.request);

  if (!response.ok) return response;

  event.waitUntil(store(cache, event.request, response.clone()));

  return response;
}

async function store(cache, request, response) {
  await cache.put(request, response);

  const keys = await cache.keys();
  const overflow = keys.slice(0, Math.max(0, keys.length - MAX_CACHED_ASSETS));

  await Promise.all(overflow.map((key) => cache.delete(key)));
}

async function dropStaleCaches() {
  const names = await caches.keys();
  const stale = names.filter(
    (name) => name.startsWith("golifecraft-assets-") && name !== ASSET_CACHE,
  );

  await Promise.all(stale.map((name) => caches.delete(name)));
}

function readPayload(event) {
  const fallback = { title: DEFAULT_TITLE, body: "", url: "/", tag: null };

  if (!event.data) return fallback;

  try {
    return { ...fallback, ...event.data.json() };
  } catch {
    return { ...fallback, body: event.data.text() };
  }
}

async function announceToWindows() {
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  windows.forEach((client) => client.postMessage({ type: PUSH_RECEIVED }));
}

function sameOriginUrl(url) {
  const target = new URL(url || "/", self.location.origin);

  if (target.origin !== self.location.origin) return self.location.origin + "/";

  return target.href;
}

async function focusOrOpen(url) {
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const client = windows.find(
    (candidate) => new URL(candidate.url).origin === self.location.origin,
  );

  if (!client) return self.clients.openWindow(url);

  const focused = await client.focus();

  if (focused.url === url || !focused.navigate) return focused;

  return focused.navigate(url);
}
