/* Idioma de la app: castellano (el original) o gallego.
   Cada socio elige con las pestañas Galego / Castellano y se recuerda en este móvil.
   En gallego, los textos de la app se cambian al vuelo usando el diccionario de gl.js;
   lo que escriben la directiva y los socios se queda como lo escribieron. */
(function(){
  let lang = null;
  try{ lang = localStorage.getItem("recatelo-idioma"); }catch(_){}
  if(lang !== "gl" && lang !== "es") lang = /^gl\b/i.test(navigator.language || "") ? "gl" : "es";
  window.IDIOMA = lang;
  document.documentElement.lang = lang;

  window.ponerIdioma = l => {
    if(l === lang) return;
    try{ localStorage.setItem("recatelo-idioma", l); }catch(_){}
    location.reload();
  };
  // Las dos pestañas; cada idioma se escribe en su propia lengua
  window.idiomaHTML = () => `<div class="idioma" role="group" aria-label="Idioma" data-noi18n>${[["gl","Galego"],["es","Castellano"]].map(([k,t]) =>
    `<button type="button" lang="${k}" aria-pressed="${k === lang}" onclick="ponerIdioma('${k}')">${t}</button>`).join("")}</div>`;
  const css = document.createElement("style");
  css.textContent = `.idioma{display:inline-flex;gap:2px;padding:3px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35)}
  .idioma button{border:0;background:none;color:inherit;font:inherit;font-size:.85rem;font-weight:600;padding:5px 12px;border-radius:999px;cursor:pointer;opacity:.85}
  .idioma button[aria-pressed="true"]{background:#fff;color:#2f5d46;opacity:1}
  .acc .idioma{background:#e8efe9;border-color:#c9d8cd;color:#24413b;justify-self:center}
  #idioma-top{display:flex;justify-content:flex-end;padding-top:10px;margin-bottom:-6px}
  #idioma-top .idioma button{font-size:.8rem;padding:4px 11px}`;
  document.head.appendChild(css);

  if(lang !== "gl") return;

  const D = window.GL_DICT || {};
  const norm = s => s.replace(/\s+/g, " ").trim();
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Frases con huecos ({0}, {1}…) para los textos que llevan números o nombres dentro
  const pats = Object.keys(D).filter(k => /\{\d+\}/.test(k) && D[k] !== k && k.replace(/\{\d+\}/g, "").trim().length > 2)
    .map(k => {
      const order = []; const re = new RegExp("^" + k.split(/(\{\d+\})/).map(p => {
        const m = p.match(/^\{(\d+)\}$/); if(m){ order.push(+m[1]); return "([\\s\\S]*?)"; } return esc(p);
      }).join("") + "$");
      return { re, order, gl: D[k], weight: k.replace(/\{\d+\}/g, "").length };
    }).sort((a, b) => b.weight - a.weight);
  const cache = new Map();
  function trText(n){
    if(cache.has(n)) return cache.get(n);
    let t = D[n];
    if(t === undefined){
      for(const p of pats){
        const m = n.match(p.re); if(!m) continue;
        const vals = {}; p.order.forEach((idx, i) => { const v = m[i + 1]; vals[idx] = D[norm(v)] !== undefined ? D[norm(v)] : v; });
        t = p.gl.replace(/\{(\d+)\}/g, (_, i) => vals[i] !== undefined ? vals[i] : ""); break;
      }
    }
    if(t === undefined) t = null;
    if(cache.size < 5000) cache.set(n, t);
    return t;
  }
  function tr(s){
    if(!s || !/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(s)) return s;
    const n = norm(s), t = trText(n);
    if(t === null || t === n) return s;
    return s.match(/^\s*/)[0] + t + s.match(/\s*$/)[0];
  }
  window.trGL = tr;

  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);
  const hecho = new WeakMap(); // nodo -> último texto puesto, para no traducir dos veces
  const omitir = el => { for(let e = el; e && e.nodeType === 1; e = e.parentElement){ if(SKIP.has(e.tagName) || e.hasAttribute("data-noi18n") || e.isContentEditable) return true; } return false; };
  function textNode(node){
    if(hecho.get(node) === node.data) return;
    if(omitir(node.parentElement)) return;
    const t = tr(node.data);
    if(t !== node.data) node.data = t;
    hecho.set(node, node.data);
  }
  const ATTRS = ["placeholder", "aria-label", "title", "alt"];
  function attrs(el){
    if(el.hasAttribute("data-noi18n")) return;
    for(const a of ATTRS){ const v = el.getAttribute(a); if(v){ const t = tr(v); if(t !== v) el.setAttribute(a, t); } }
    if(el.tagName === "INPUT" && /^(submit|button)$/i.test(el.type) && el.value){ const t = tr(el.value); if(t !== el.value) el.value = t; }
  }
  function walk(root){
    if(root.nodeType === 3){ textNode(root); return; }
    if(root.nodeType !== 1 && root.nodeType !== 11) return;
    if(root.nodeType === 1){ if(root.hasAttribute("data-noi18n")) return; attrs(root); if(omitir(root)) return; }
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: n => {
        if(n.nodeType !== 1) return NodeFilter.FILTER_ACCEPT;
        if(n.hasAttribute("data-noi18n") || n.isContentEditable) return NodeFilter.FILTER_REJECT;
        if(SKIP.has(n.tagName)){ attrs(n); return NodeFilter.FILTER_REJECT; } // los campos: solo el texto de ayuda
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n; while((n = w.nextNode())){ if(n.nodeType === 3) textNode(n); else attrs(n); }
  }
  // Las plantillas (<template>) se traducen al usarlas, cuando entran en la página
  new MutationObserver(list => {
    for(const m of list){
      if(m.type === "childList") m.addedNodes.forEach(walk);
      else if(m.type === "characterData") textNode(m.target);
      else if(m.type === "attributes" && m.target.nodeType === 1) attrs(m.target);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  walk(document.body || document.documentElement);
  if(document.title) document.title = tr(document.title);

  // Mensajes emergentes
  const A = window.alert, C = window.confirm, P = window.prompt;
  window.alert = m => A.call(window, tr(String(m ?? "")));
  window.confirm = m => C.call(window, tr(String(m ?? "")));
  window.prompt = (m, d) => P.call(window, tr(String(m ?? "")), d);

  // Fechas en gallego («luns, 3 de xuño»…)
  const glLoc = l => (l === undefined || /^es\b/i.test(String(l))) ? "gl-ES" : l;
  for(const f of ["toLocaleDateString", "toLocaleString", "toLocaleTimeString"]){
    const o = Date.prototype[f]; Date.prototype[f] = function(l, opt){ return o.call(this, glLoc(l), opt); };
  }
})();
