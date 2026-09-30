const DEFAULT_TITLE = "GoLifeCraft";
const ICON_URL = "/assets/img/icon-dark.png";
const PUSH_RECEIVED = "golifecraft.push.received";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
