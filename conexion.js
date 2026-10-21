/* Conexión de la app con Supabase (base de datos, archivos y acceso).
   Imita la pequeña interfaz window.claude.use(...) que usa la app, para que
   el código de la app sea el mismo dentro y fuera de Claude. */
(function(){
  const CFG = window.APP_CONFIG || {};
  const configured = /^https:\/\//.test(CFG.SUPABASE_URL || "") && !!CFG.SUPABASE_ANON_KEY && !CFG.SUPABASE_ANON_KEY.includes("PEGAR");
  const sb = configured ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "recatelo-sesion" }
  }) : null;
  const DEFAULT_LOGO = "c37727719b16fb206a49359b064fca6d";
  const state = { uid: null, directiva: false, email: null };
  let readyResolve; const ready = new Promise(r => readyResolve = r);

  /* ---------- archivos ---------- */
  window.blobUrl = function(id){
    if(!id || id === DEFAULT_LOGO) return "logo.jpg";
    return sb.storage.from("archivos").getPublicUrl(id).data.publicUrl;
  };

  /* ---------- base de datos con forma de documentos ---------- */
  const listeners = new Map(); // key -> Set(fn)
  const err = (code, message) => ({ code, message });
  function split(path){ const p = path.split("/"); return { coll: p[0], id: p[1] }; }
  function snapDoc(id, row){ const d = row ? row.data : undefined; return { id, exists: !!row, data: () => d, metadata: { fromCache:false, hasPendingWrites:false } }; }
  async function fetchColl(coll){
    const { data, error } = await sb.from("docs").select("id,data").eq("coll", coll).limit(1000);
    if(error) throw err("unavailable", error.message);
    const docs = data.map(r => snapDoc(r.id, r));
    return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache:false, hasPendingWrites:false } };
  }
  async function fetchDoc(coll, id){
    const { data, error } = await sb.from("docs").select("id,data").eq("coll", coll).eq("id", id).maybeSingle();
    if(error) throw err("unavailable", error.message);
    return snapDoc(id, data);
  }
  function notify(coll){
    for(const [key, set] of listeners){
      if(key === coll || key.startsWith(coll + "/")) set.forEach(fn => fn());
    }
  }
  function listen(key, run){
    if(!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(run); run();
    return () => listeners.get(key) && listeners.get(key).delete(run);
  }
  function refreshAll(){ for(const set of listeners.values()) set.forEach(fn => fn()); }
  setInterval(() => { if(document.visibilityState === "visible") refreshAll(); }, 30000);
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible") refreshAll(); });

  function docRef(coll, id){
    return {
      id, path: coll + "/" + id,
      get: () => fetchDoc(coll, id),
      async set(data){
        const { error } = await sb.from("docs").upsert({ coll, id, data, updated_at: new Date().toISOString() });
        if(error) throw err("invalid_argument", error.message);
        notify(coll);
        if(coll === "items" || coll === "mercadillo") sb.functions.invoke("smart-task", { body: { coll, id } }).catch(() => {});
      },
      async update(patch){
        const cur = await fetchDoc(coll, id);
        if(!cur.exists) throw err("invalid_argument", "El documento no existe");
        const data = { ...cur.data(), ...patch };
        const { error } = await sb.from("docs").update({ data, updated_at: new Date().toISOString() }).eq("coll", coll).eq("id", id);
        if(error) throw err("invalid_argument", error.message);
        notify(coll);
      },
      async delete(){
        const { error } = await sb.from("docs").delete().eq("coll", coll).eq("id", id);
        if(error) throw err("invalid_argument", error.message);
        notify(coll);
      },
      onSnapshot(next, onErr){
        return listen(coll + "/" + id, () => fetchDoc(coll, id).then(next, e => onErr && onErr(e)));
      }
    };
  }
  function newId(){ return Array.from(crypto.getRandomValues(new Uint8Array(10)), b => b.toString(16).padStart(2,"0")).join(""); }
  const db = {
    doc(path){ const { coll, id } = split(path); return docRef(coll, id); },
    collection(coll){
      return {
        path: coll,
        doc: (id) => docRef(coll, id || newId()),
        get: () => fetchColl(coll),
        async add(data){ const r = docRef(coll, newId()); await r.set(data); return r; },
        onSnapshot(next, onErr){ return listen(coll, () => fetchColl(coll).then(next, e => onErr && onErr(e))); }
      };
    }
  };

  const assets = {
    async upload(file, opts){
      const type = (opts && opts.type) || file.type || "application/octet-stream";
      const ext = ({ "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/gif":"gif", "image/svg+xml":"svg", "application/pdf":"pdf" })[type] || "bin";
      if(file.size > 20 * 1024 * 1024) throw err("too_large", "Archivo demasiado grande");
      const name = newId() + newId().slice(0,12) + "." + ext;
      const { error } = await sb.storage.from("archivos").upload(name, file, { contentType: type, upsert: false });
      if(error) throw err("upstream_error", error.message);
      return { id: name, url: window.blobUrl(name), sizeBytes: file.size, contentType: type };
    },
    async delete(id){ if(!id || id === DEFAULT_LOGO) return { deleted:false }; await sb.storage.from("archivos").remove([id]); return { deleted:true }; },
    async list(){ return { assets: [], usage: {} }; }
  };
  // Los socios suben fotos solo a su carpeta socios/<su id>/ (lo controla Supabase)
  window.subirFotoSocio = async file => {
    const type = file.type || "image/jpeg";
    const ext = ({ "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/gif":"gif" })[type];
    if(!ext) throw err("unsupported_type", "Solo fotos JPG, PNG, WEBP o GIF");
    if(file.size > 20 * 1024 * 1024) throw err("too_large", "Archivo demasiado grande");
    const name = "socios/" + state.uid + "/" + newId() + "." + ext;
    const { error } = await sb.storage.from("archivos").upload(name, file, { contentType: type, upsert: false });
    if(error) throw err("upstream_error", error.message);
    return { id: name, contentType: type };
  };

  const user = {
    isOwner: async () => state.directiva,
    canEdit: async () => state.directiva,
    can: async () => null,
    id: async () => state.uid,
    name: async () => "",
    async profiles(ids){
      const out = {};
      if(state.directiva && ids.length){
        const { data } = await sb.from("docs").select("id,data").eq("coll","socios").in("id", ids);
        (data || []).forEach(r => out[r.id] = { id: r.id, name: (r.data && r.data.nombre) || "" });
      }
      ids.forEach(id => { if(!out[id]) out[id] = { id, name: "" }; });
      return out;
    }
  };

  window.claude = {
    use(name){
      return ready.then(() => name === "db" ? db : name === "user" ? user : name === "assets" ? (state.directiva ? assets : null) : null);
    }
  };

  /* ---------- pantalla de acceso ---------- */
  const css = `
  .acc-bg{position:fixed;inset:0;z-index:50;background:var(--bg);overflow:auto;display:flex;justify-content:center;
    padding:calc(24px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
  .acc{width:100%;max-width:440px;display:grid;gap:16px;align-content:start}
  .acc img{width:100%;max-width:360px;justify-self:center;background:#fff;border-radius:14px;padding:10px}
  .acc h1{font-family:var(--display);font-size:1.6rem;margin:0;color:var(--green);text-wrap:balance}
  .acc .tabs2{display:flex;gap:6px}.acc .tabs2 button{flex:1;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:8px;font:inherit;font-weight:700;cursor:pointer}
  .acc .tabs2 button[aria-pressed="true"]{background:var(--green);color:var(--surface);border-color:var(--green)}
  .acc-small{color:var(--muted);font-size:.9rem;margin:0}
  `;
  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  function showLogin(msg){
    const el = document.createElement("div"); el.className = "acc-bg"; el.id = "acc";
    el.innerHTML = `<div class="acc">
      <img src="logo.jpg" alt="Asociación de Vecinos Parque de Rosalía de Castro-Recatelo">
      <h1>App de socios</h1>
      <div class="tabs2"><button type="button" data-m="socio" aria-pressed="true">Soy socio/a</button><button type="button" data-m="dir" aria-pressed="false">Soy de la directiva</button></div>
      <form class="card" id="acc-socio" novalidate>
        <label for="acc-codigo">Tu código personal<input id="acc-codigo" autocomplete="off" autocapitalize="characters" placeholder="El que te ha mandado la directiva"></label>
        <p class="acc-small">Cada socio tiene su propio código. Solo hay que ponerlo una vez y no sirve para otras personas.</p>
        ${/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone ? `<div class="notice">En iPhone, instala primero la app: pulsa Compartir y “Añadir a pantalla de inicio”. Después ábrela desde el icono y escribe ahí tu código.</div>` : ""}
        <p class="err" id="acc-err1" hidden></p>
        <button class="btn">Entrar</button>
      </form>
      <form class="card" id="acc-dir" novalidate hidden>
        <label for="acc-email">Correo<input id="acc-email" type="email" autocomplete="username"></label>
        <label for="acc-pass">Contraseña<input id="acc-pass" type="password" autocomplete="current-password"></label>
        <p class="err" id="acc-err2" hidden></p>
        <button class="btn">Entrar como directiva</button>
      </form>
      ${msg ? `<div class="notice">${msg}</div>` : ""}
    </div>`;
    document.body.appendChild(el);
    el.querySelector(".tabs2").addEventListener("click", e => {
      const b = e.target.closest("[data-m]"); if(!b) return;
      el.querySelectorAll(".tabs2 button").forEach(x => x.setAttribute("aria-pressed", x === b));
      el.querySelector("#acc-socio").hidden = b.dataset.m !== "socio";
      el.querySelector("#acc-dir").hidden = b.dataset.m !== "dir";
    });
    el.querySelector("#acc-socio").addEventListener("submit", async e => {
      e.preventDefault();
      const er = el.querySelector("#acc-err1"); er.hidden = true;
      const code = el.querySelector("#acc-codigo").value.replace(/[^a-z0-9]/gi, "").toUpperCase();
      if(!code){ er.textContent = "Escribe el código de socio."; er.hidden = false; return; }
      const btn = e.target.querySelector("button"); btn.disabled = true; btn.textContent = "Entrando…";
      try{
        let { data: { session } } = await sb.auth.getSession();
        if(!session){ const r = await sb.auth.signInAnonymously(); if(r.error) throw r.error; }
        const { data: ok, error } = await sb.rpc("canjear_codigo", { codigo: code });
        if(error) throw error;
        if(ok !== "ok" && ok !== true){
          er.textContent = ok === "usado" ? "Ese código ya se ha usado en otro móvil. Pide uno nuevo a la directiva." : "Ese código no es correcto o ya no está activo. Pídeselo a la directiva.";
          er.hidden = false; btn.disabled = false; btn.textContent = "Entrar"; return;
        }
        await enter();
      }catch(x){ const det = String((x && (x.message || x.code)) || "").slice(0, 160); er.textContent = "No se ha podido entrar. Comprueba la conexión y vuelve a intentarlo." + (det ? " (Detalle: " + det + ")" : ""); er.hidden = false; btn.disabled = false; btn.textContent = "Entrar"; }
    });
    el.querySelector("#acc-dir").addEventListener("submit", async e => {
      e.preventDefault();
      const er = el.querySelector("#acc-err2"); er.hidden = true;
      const btn = e.target.querySelector("button"); btn.disabled = true; btn.textContent = "Entrando…";
      const { error } = await sb.auth.signInWithPassword({ email: el.querySelector("#acc-email").value.trim(), password: el.querySelector("#acc-pass").value });
      if(error){ er.textContent = "Correo o contraseña incorrectos."; er.hidden = false; btn.disabled = false; btn.textContent = "Entrar como directiva"; return; }
      await enter();
    });
  }

  async function enter(){
    const { data: { session } } = await sb.auth.getSession();
    if(!session) return showLogin();
    const [{ data: soc }, { data: dir }] = await Promise.all([sb.rpc("es_socio"), sb.rpc("es_directiva")]);
    if(!soc){ document.getElementById("acc") || showLogin(); return; }
    state.uid = session.user.id; state.directiva = !!dir; state.email = session.user.email || null;
    const acc = document.getElementById("acc"); if(acc) acc.remove();
    addTools();
    readyResolve();
  }

  /* ---------- herramientas: instalar, ajustes de la directiva, salir ---------- */
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; const b = document.getElementById("btn-instalar"); if(b) b.hidden = false; });
  function addTools(){
    const f = document.querySelector("footer"); if(!f || document.getElementById("tools")) return;
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const t = document.createElement("div"); t.id = "tools"; t.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px";
    t.innerHTML = `${standalone ? "" : `<button class="btn ghost small" id="btn-instalar" ${installEvt || ios ? "" : "hidden"}>Instalar la app en el móvil</button>`}
      <button class="btn ghost small" id="btn-avisos" hidden>Activar notificaciones</button>
      ${state.directiva ? `<button class="btn ghost small" id="btn-codigo">Códigos de socios</button><button class="btn ghost small" id="btn-clave">Cambiar contraseña</button>` : ""}
      <button class="btn ghost small" id="btn-salir">Cerrar sesión</button>`;
    f.appendChild(t);
    pintarAvisos();
    t.addEventListener("click", async e => {
      if(e.target.id === "btn-instalar"){
        if(installEvt){ installEvt.prompt(); installEvt = null; e.target.hidden = true; }
        else sheet(`<h2>Instalar en iPhone</h2><p class="body">1. Abre esta página en Safari.\n2. Pulsa el botón Compartir (el cuadrado con la flecha).\n3. Elige “Añadir a pantalla de inicio”.</p>`);
      }
      if(e.target.id === "btn-salir"){ await sb.auth.signOut(); location.reload(); }
      if(e.target.id === "btn-codigo") codigos();
      if(e.target.id === "btn-avisos") cambiarAvisos(e.target);
      if(e.target.id === "btn-clave") cambiarClave();
    });
  }

  function cambiarClave(){
    sheet(`<h2>Cambiar la contraseña de la directiva</h2><p class="body">La nueva contraseña sirve para todos los que entran con el correo de la directiva. Avisad a quien la use.</p>
      <label class="field"><span>Contraseña actual</span><input id="cl-0" type="password" autocomplete="current-password"></label>
      <label class="field"><span>Nueva contraseña (mínimo 8 caracteres)</span><input id="cl-1" type="password" autocomplete="new-password"></label>
      <label class="field"><span>Repítela</span><input id="cl-2" type="password" autocomplete="new-password"></label>
      <p class="err" id="cl-err" hidden></p><div class="row-actions"><button class="btn" id="cl-ok">Guardar contraseña</button></div>`, r => {
      r.querySelector("#cl-ok").onclick = async () => {
        const a = r.querySelector("#cl-1").value, b = r.querySelector("#cl-2").value, er = r.querySelector("#cl-err");
        er.hidden = true;
        if(a.length < 8){ er.textContent = "Tiene que tener al menos 8 caracteres."; er.hidden = false; return; }
        if(a !== b){ er.textContent = "Las dos contraseñas no coinciden."; er.hidden = false; return; }
        const { error: mal } = await sb.auth.signInWithPassword({ email: state.email, password: r.querySelector("#cl-0").value });
        if(mal){ er.textContent = "La contraseña actual no es correcta."; er.hidden = false; return; }
        const { error } = await sb.auth.updateUser({ password: a });
        if(error){ er.textContent = "No se ha podido cambiar. (Detalle: " + error.message + ")"; er.hidden = false; return; }
        sheet(`<h2>Contraseña cambiada</h2><p class="body">A partir de ahora, la directiva entra con la contraseña nueva.</p>`);
      };
    });
  }

  /* ---------- notificaciones al móvil ---------- */
  const pushOk = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  async function suscripcion(){ const reg = await navigator.serviceWorker.ready; return reg.pushManager.getSubscription(); }
  async function pintarAvisos(){
    const b = document.getElementById("btn-avisos"); if(!b) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if(!pushOk() && !(ios && !standalone)) return;
    b.hidden = false;
    const s = pushOk() ? await suscripcion().catch(() => null) : null;
    b.textContent = s && Notification.permission === "granted" ? "🔔 Notificaciones activadas" : "Activar notificaciones";
  }
  function claveBytes(b64){ const s = atob((b64 + "=".repeat((4 - b64.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); }
  async function cambiarAvisos(b){
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if(!pushOk() || (ios && !standalone)) return sheet(`<h2>Notificaciones en iPhone</h2><p class="body">En iPhone, las notificaciones solo funcionan con la app instalada.\n1. Abre esta página en Safari.\n2. Pulsa Compartir (el cuadrado con la flecha) y elige “Añadir a pantalla de inicio”.\n3. Abre la app desde el icono nuevo y pulsa “Activar notificaciones”.</p>`);
    const actual = await suscripcion().catch(() => null);
    if(actual && Notification.permission === "granted"){
      return sheet(`<h2>Notificaciones activadas</h2><p class="body">Te avisaremos en este móvil cuando la directiva publique algo o haya un anuncio nuevo en el Mercadiño.</p><div class="row-actions"><button class="btn ghost" id="av-off">Desactivar en este móvil</button></div>`, r => {
        r.querySelector("#av-off").onclick = async () => { await sb.rpc("quitar_movil", { endpoint: actual.endpoint }).catch(() => {}); await actual.unsubscribe().catch(() => {}); r.innerHTML = ""; pintarAvisos(); };
      });
    }
    b.disabled = true; const txt = b.textContent; b.textContent = "Activando…";
    try{
      const perm = await Notification.requestPermission();
      if(perm !== "granted") throw new Error("permiso");
      const { data, error } = await sb.functions.invoke("smart-task", { body: { accion: "clave" } });
      if(error || !data || !data.clave) throw new Error("clave");
      const reg = await navigator.serviceWorker.ready;
      const s = actual || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: claveBytes(data.clave) });
      const { data: ok } = await sb.rpc("guardar_movil", { sub: s.toJSON() });
      if(!ok) throw new Error("guardar");
      sheet(`<h2>¡Listo!</h2><p class="body">Te avisaremos en este móvil cuando la directiva publique algo o haya un anuncio nuevo en el Mercadiño.</p>`);
    }catch(x){
      sheet(x.message === "permiso"
        ? `<h2>Notificaciones bloqueadas</h2><p class="body">El móvil no ha dado permiso. Para activarlas, entra en los ajustes del navegador o del móvil, busca esta app y permite las notificaciones. Después vuelve a pulsar el botón.</p>`
        : `<h2>No se han podido activar</h2><p class="body">Comprueba la conexión y vuelve a intentarlo dentro de un rato.</p>`);
    }
    b.disabled = false; b.textContent = txt; pintarAvisos();
  }
  const escH = v => String(v == null ? "" : v).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c]);
  const appUrl = () => location.origin + location.pathname.replace(/index\.html$/, "");
  const mensaje = (nombre, codigo) => `Hola, ${nombre}. Este es tu acceso personal a la app de socios de la Asociación de Vecinos Parque de Rosalía de Castro-Recatelo.\n\n1. Abre: ${appUrl()}\n2. Pulsa "Soy socio/a" y escribe tu código: ${codigo}\n\nEl código es solo para ti y no sirve para otras personas.`;
  async function codigos(aviso){
    const { data: lista } = await sb.rpc("listar_codigos");
    const filas = (lista || []).map(k => `<li style="display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding:8px 0">
        <span><strong>${escH(k.nombre)}</strong><br><span class="acc-small">${escH(k.codigo)} · ${!k.activo ? "sin acceso" : k.usos ? "en uso (" + k.usos + " de " + k.max_usos + " móviles)" : "sin usar todavía"}</span></span>
        <span style="display:flex;flex-wrap:wrap;gap:6px">${k.activo ? `<button class="btn ghost small" data-wa="${escH(k.codigo)}" data-n="${escH(k.nombre)}">WhatsApp</button><button class="btn ghost small" data-quitar="${escH(k.codigo)}" data-n="${escH(k.nombre)}">Quitar acceso</button>` : ""}<button class="btn ghost small" data-borrar="${escH(k.codigo)}" data-n="${escH(k.nombre)}">Borrar</button></span>
      </li>`).join("");
    sheet(`<h2>Códigos de socios</h2>
      <p class="body">Cada socio recibe su propio código. Funciona en un máximo de 2 móviles o navegadores de esa persona; si alguien lo reenvía, no le servirá a nadie más. Si un socio cambia de móvil, quítale el acceso y créale uno nuevo.</p>
      ${aviso || ""}
      <label for="cod-nombre">Nombre del socio<input id="cod-nombre" autocomplete="off"></label><p class="err" id="cod-err" hidden></p>
      <div class="row-actions"><button class="btn" id="cod-crear">Crear código</button></div>
      <ul style="list-style:none;margin:0;padding:0">${filas || `<li class="acc-small">Todavía no hay códigos.</li>`}</ul>`, root => {
      root.querySelector("#cod-crear").onclick = async () => {
        const n = root.querySelector("#cod-nombre").value.trim(); const er = root.querySelector("#cod-err");
        if(n.length < 2){ er.textContent = "Escribe el nombre del socio."; er.hidden = false; return; }
        const { data: c } = await sb.rpc("crear_codigo", { nombre: n });
        if(!c){ er.textContent = "No se ha podido crear. Inténtalo de nuevo."; er.hidden = false; return; }
        codigos(`<div class="notice">Código de <strong>${escH(n)}</strong>: <strong>${escH(c)}</strong><br><a class="btn small" style="margin-top:8px" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(mensaje(n, c))}">Enviar por WhatsApp</a></div>`);
      };
      root.querySelectorAll("[data-wa]").forEach(b => b.onclick = () => window.open("https://wa.me/?text=" + encodeURIComponent(mensaje(b.dataset.n, b.dataset.wa)), "_blank", "noopener"));
      root.querySelectorAll("[data-quitar]").forEach(b => b.onclick = async () => {
        if(!confirm(`¿Quitar el acceso a ${b.dataset.n}? Dejará de poder entrar en la app.`)) return;
        await sb.rpc("quitar_codigo", { codigo: b.dataset.quitar }); codigos();
      });
      root.querySelectorAll("[data-borrar]").forEach(b => b.onclick = async () => {
        if(!confirm(`¿Borrar el código ${b.dataset.borrar} de ${b.dataset.n}? Dejará de funcionar y desaparecerá de la lista.`)) return;
        const { data: ok, error } = await sb.rpc("borrar_codigo", { codigo: b.dataset.borrar });
        if(error || !ok) return codigos(`<div class="notice">No se ha podido borrar. Si es la primera vez, falta pegar en Supabase el texto supabase-borrar-codigos.sql.</div>`);
        codigos();
      });
    });
  }
  function sheet(html, after){
    const r = document.getElementById("sheet-root");
    r.innerHTML = `<div class="sheet-bg" id="sheet-bg"><div class="sheet">${html}<div class="row-actions"><button class="btn ghost" id="sh-close">Cerrar</button></div></div></div>`;
    r.querySelector("#sh-close").onclick = () => r.innerHTML = "";
    r.querySelector("#sheet-bg").addEventListener("click", e => { if(e.target.id === "sheet-bg") r.innerHTML = ""; });
    if(after) after(r);
  }

  if("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  if(!configured){
    showLogin("Falta conectar la base de datos (config.js).");
  } else {
    sb.auth.getSession().then(({ data: { session } }) => session ? enter() : showLogin());
  }
})();
