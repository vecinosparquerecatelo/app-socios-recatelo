// Guarda la app en el móvil para que abra rápido y funcione aunque falle la conexión un momento.
const CACHE = "recatelo-v50";
const SHELL = ["./", "index.html", "config.js", "conexion.js", "gl.js", "i18n.js", "vendor/supabase.js", "logo.jpg", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== "recatelo-compartido").map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Fotos que llegan con el botón Compartir (WhatsApp, galería…): se guardan y se abre la app en Fotos
  if(e.request.method === "POST" && url.pathname.endsWith("/compartir")){
    e.respondWith((async () => {
      try{
        const fd = await e.request.formData(), c = await caches.open("recatelo-compartido"); let i = 0;
        for(const f of fd.getAll("fotos")) if(f && f.size && /^image\//.test(f.type || "image/jpeg"))
          await c.put("compartida-" + Date.now() + "-" + (i++), new Response(f, { headers: { "content-type": f.type || "image/jpeg", "x-nombre": encodeURIComponent(f.name || "foto.jpg") } }));
      }catch(x){}
      return Response.redirect("./?n=1&compartir=1#fotos", 303);
    })());
    return;
  }
  if(e.request.method !== "GET" || url.origin !== location.origin) return; // los datos siempre van a internet
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

// Notificaciones al móvil
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch(x) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Asoc. Vecinos Recatelo", {
    body: d.body || "", icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = ((e.notification.data && e.notification.data.url) || "./").replace(/#/, "?n=1#");
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ("focus" in w) { w.navigate(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
