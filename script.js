/* Фабрика Сна. Ванильный JS: плиты и отогнутый угол одеяла, меню, якоря, язык, подбор, форма. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");
  var ASSET_V = ((doc.currentScript && doc.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";
  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var smooth = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  var easeOut = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var VW = W.innerWidth, VH = W.innerHeight;
  var LANG = "ru";

  /* ---------- Контакты ---------- */
  var WA_NUM = "77760614911";

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата на window, совместимо с LeadBot) ---------- */
  var SITE = "Пишу с сайта Фабрика Сна.";
  var WA = { ru: {
    "default": "Здравствуйте! " + SITE + " Хочу подобрать матрас.",
    hero: "Здравствуйте! " + SITE + " Помогите подобрать матрас. Размер кровати: ",
    menu: "Здравствуйте! " + SITE + " Хочу подобрать матрас.",
    matrasy: "Здравствуйте! " + SITE + " Интересует цена на матрас. Размер: ",
    tip: "Здравствуйте! " + SITE + " Интересует цена:",
    toppery: "Здравствуйте! " + SITE + " Интересует топпер. Размер: ",
    podarok: "Здравствуйте! " + SITE + " Хочу матрас с подушкой в подарок. Размер: ",
    opt: "Здравствуйте! " + SITE + " Нужен оптовый прайс. Объект и количество: ",
    kontakty: "Здравствуйте! " + SITE + " Хочу подобрать матрас.",
    sticky: "Здравствуйте! " + SITE + " Хочу подобрать матрас.",
    podbor: "Здравствуйте! " + SITE + " Подберите, пожалуйста:"
  } };
  var PICK_L = { ru: { what: "Что", size: "Размер", firm: "Жёсткость", who: "Для кого" } };

  function pickData() {
    var f = doc.getElementById("pick"); if (!f) return null;
    var out = {};
    ["what", "size", "firm", "who"].forEach(function (n) {
      var el = f.querySelector('input[name="' + n + '"]:checked');
      if (el) { var sp = el.nextElementSibling; out[n] = { val: el.value, txt: sp ? sp.textContent.trim() : el.value }; }
    });
    return out;
  }
  function pickSummary() {
    var s = doc.getElementById("pick-sum"), d = pickData();
    if (!s || !d) return;
    var parts = [];
    ["what", "size", "firm", "who"].forEach(function (n) { if (d[n]) parts.push(d[n].txt); });
    s.textContent = parts.join(" · ");
  }
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var d = WA[LANG] || WA.ru;
    var text = d[key] || WA.ru[key] || WA.ru["default"];
    if (key === "tip") {
      var card = a.closest(".tip"), nm = card ? card.querySelector("h3") : null;
      text += "\n" + (nm ? nm.textContent.trim() : "");
    }
    if (key === "podbor") {
      var p = pickData() || {}, L = PICK_L[LANG] || PICK_L.ru;
      ["what", "size", "firm", "who"].forEach(function (n) { if (p[n]) text += "\n" + L[n] + ": " + p[n].txt; });
    }
    a.setAttribute("href", "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(text));
  }, true);

  /* ---------- fitText для строк заголовка героя ---------- */
  var h1 = doc.getElementById("h1");
  function fitLine(sel, prop) {
    var l = h1.querySelector(sel), avail = h1.clientWidth;
    if (!l || !avail) return;
    h1.style.removeProperty(prop);
    var fs = parseFloat(getComputedStyle(l).fontSize), guard = 0;
    while (guard++ < 40 && l.scrollWidth > avail + 1 && fs > 18) { fs *= 0.95; h1.style.setProperty(prop, fs + "px"); }
  }
  function fitText() { if (!h1) return; fitLine(".l1", "--fs"); fitLine(".l2", "--fs2"); }

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.querySelector(".foot"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    if (open === was) return;
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("open"); }); });
      setTimeout(function () { var first = menu.querySelector("a"); if (first) first.focus({ preventScroll: true }); }, 60);
    } else {
      menu.classList.remove("open");
      setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 320);
      if (returnFocus) burger.focus({ preventScroll: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 72; };
  function isSticky(el) { return el.classList.contains("pw") && getComputedStyle(el.firstElementChild).position === "sticky"; }
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.id === "top") return 0;
    if (isSticky(el)) return r;
    if (el.classList.contains("sec") || el.classList.contains("pw")) return r - HDR() + (el.classList.contains("pw") ? 0 : 1);
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
    }
  });

  /* ---------- Плиты и одеяло ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false;
  var st = pws.map(function (pw) { return { out: {}, sigs: [].slice.call(pw.querySelectorAll(".sig")), txts: pw.querySelectorAll(".txt"), on: null }; });
  function put(pw, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; pw.style.setProperty(k, v); } }
  function update() {
    ticking = false;
    var H = VH, pageY = W.pageYOffset, i;
    /* чтение пакетом */
    var kontTop = kont ? kont.getBoundingClientRect().top : null;
    var rects = [], nxt = [];
    for (i = 0; i < pws.length; i++) {
      rects.push(pws[i].getBoundingClientRect());
      var nx = pws[i].nextElementSibling;
      nxt.push(nx ? nx.getBoundingClientRect().top : null);
    }
    /* запись */
    for (i = 0; i < pws.length; i++) {
      var pw = pws[i], r = rects[i], s = st[i];
      var near = r.bottom > -H * 0.3 && r.top < H * 1.3;
      var isHero = pw.classList.contains("pw-hero");
      if (!near && s.wasFar) continue;
      s.wasFar = !near;
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H * 1.1 ? clamp(-r.top / (r.height - H)) : clamp(-r.top / (r.height * 0.7));
      var exit = nxt[i] !== null ? clamp(1 - nxt[i] / H) : 0;
      var open = REDUCED ? 1 : smooth((enter - 0.3) / 0.65);
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", stay.toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      if (isHero) put(pw, s, "--intro", (REDUCED ? 1 : easeOut(INTRO)).toFixed(4));
      else put(pw, s, "--open", open.toFixed(4));
      var done = isHero ? (REDUCED || stay >= 0.99) : open >= 0.999;
      for (var g = 0; g < s.sigs.length; g++) {
        s.sigs[g].classList.toggle("near", near);
        s.sigs[g].classList.toggle("done", done);
      }
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1);
      var on = isHero ? INTRO > 0.3 : enter > 0.62;
      if (s.on !== on) { s.on = on; for (var t = 0; t < s.txts.length; t++) s.txts[t].classList.toggle("on", on); }
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (kontTop !== null && kontTop < H * 0.6) show = false;
      sticky.classList.toggle("show", show);
    }
    if (hdr) hdr.classList.toggle("scrolled", pageY > 12);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    /* на телефоне смена только высоты - это адресная строка: раскладку не пересчитываем */
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; fitText(); }
    else if (!TOUCH) VH = W.innerHeight;
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart - 250) / 1400);
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Одеяло на карточках вне плит: отгибается при появлении ---------- */
  var cards = [].slice.call(doc.querySelectorAll(".fold-io"));
  function openCard(c) {
    c.classList.add("near");
    requestAnimationFrame(function () { c.classList.add("in"); });
    setTimeout(function () { c.classList.add("done"); }, 1750);
  }
  if ("IntersectionObserver" in W && !REDUCED) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { openCard(x.target); cio.unobserve(x.target); } });
    }, { threshold: 0.35 });
    cards.forEach(function (c) { c.classList.add("near"); cio.observe(c); });
  } else cards.forEach(function (c) { c.classList.add("in", "done"); });

  /* ---------- Бегущая лента: четыре копии, шаг цикла - одна копия ---------- */
  [].forEach.call(doc.querySelectorAll(".ribbon-track"), function (tr) {
    var n = tr.children.length;
    for (var k = 0; k < n; k++) tr.appendChild(tr.children[k].cloneNode(true));
  });

  /* ---------- Язык: RU в разметке, KZ подгружается отдельным файлом ---------- */
  var I18N = { ru: {} };
  var RU = I18N.ru;
  var iEls = function () { return [].slice.call(doc.querySelectorAll("[data-i]")); };
  var phEls = [].slice.call(doc.querySelectorAll("[data-i-ph]"));
  var ariaEls = [].slice.call(doc.querySelectorAll("[data-i-aria]"));
  var altEls = [].slice.call(doc.querySelectorAll("[data-i-alt]"));
  var metaDesc = doc.querySelector('meta[name="description"]');
  iEls().forEach(function (el) { RU[el.getAttribute("data-i")] = el.textContent; });
  phEls.forEach(function (el) { RU[el.getAttribute("data-i-ph")] = el.getAttribute("placeholder"); });
  ariaEls.forEach(function (el) { RU[el.getAttribute("data-i-aria")] = el.getAttribute("aria-label"); });
  altEls.forEach(function (el) { RU[el.getAttribute("data-i-alt")] = el.getAttribute("alt"); });
  RU["meta.title"] = doc.title;
  RU["meta.desc"] = metaDesc ? metaDesc.getAttribute("content") : "";
  var FORM_L = { ru: { head: "Заявка с сайта Фабрика Сна", name: "Имя", phone: "Телефон", msg: "Что нужно" } };
  function t(key) { var d = I18N[LANG] || RU; return d[key] != null ? d[key] : RU[key]; }
  function applyLang(lang) {
    if (!I18N[lang]) lang = "ru";
    LANG = lang;
    iEls().forEach(function (el) { var v = t(el.getAttribute("data-i")); if (v != null) el.textContent = v; });
    phEls.forEach(function (el) { var v = t(el.getAttribute("data-i-ph")); if (v != null) el.setAttribute("placeholder", v); });
    ariaEls.forEach(function (el) { var v = t(el.getAttribute("data-i-aria")); if (v != null) el.setAttribute("aria-label", v); });
    altEls.forEach(function (el) { var v = t(el.getAttribute("data-i-alt")); if (v != null) el.setAttribute("alt", v); });
    doc.title = t("meta.title");
    if (metaDesc) metaDesc.setAttribute("content", t("meta.desc"));
    root.setAttribute("lang", lang);
    [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("fsna-lang", lang); } catch (e) {}
    fitText();
    pickSummary();
  }
  function loadLang(lang, done) {
    if (I18N[lang] || lang !== "kk") return done();
    var s = doc.createElement("script");
    s.src = "assets/lang/kk.js" + (ASSET_V ? "?v=" + ASSET_V : "");
    s.onload = function () {
      if (W.SITE_KK) {
        I18N.kk = W.SITE_KK;
        if (W.SITE_KK_WA) WA.kk = W.SITE_KK_WA;
        if (W.SITE_KK_FORM) FORM_L.kk = W.SITE_KK_FORM;
        if (W.SITE_KK_PICK) PICK_L.kk = W.SITE_KK_PICK;
      }
      done();
    };
    s.onerror = function () { done(); };
    doc.head.appendChild(s);
  }
  function setLang(lang) { loadLang(lang, function () { applyLang(lang); }); }
  [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  (function initLang() {
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem("fsna-lang"); } catch (e) {}
    var lang = forced || saved || "ru";
    if (lang !== "ru") setLang(lang);
  })();

  /* ---------- Подбор ---------- */
  var pick = doc.getElementById("pick");
  if (pick) {
    pick.addEventListener("change", pickSummary);
    pick.addEventListener("submit", function (e) { e.preventDefault(); });
    pickSummary();
  }

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) el.classList.add("in"); }); }, 1500);
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Форма -> WhatsApp ---------- */
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) { form.hidden = true; if (thanks) thanks.hidden = false; return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badName = !name, badPhone = phone.replace(/\D/g, "").length < 10;
      f.name.classList.toggle("bad", badName); f.phone.classList.toggle("bad", badPhone);
      f.name.setAttribute("aria-invalid", badName ? "true" : "false"); f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badName || badPhone) { if (ferr) ferr.hidden = false; (badName ? f.name : f.phone).focus(); return; }
      if (ferr) ferr.hidden = true;
      var L = FORM_L[LANG] || FORM_L.ru;
      var lines = [L.head, L.name + ": " + name, L.phone + ": " + phone];
      if (f.message.value.trim()) lines.push(L.msg + ": " + f.message.value.trim());
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(lines.join("\n"));
      W.open(url, "_blank", "noopener");
      form.hidden = true;
      if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
      form.reset();
    });
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  function start() {
    fitText();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      goTo(id, true);
      setTimeout(function () { goTo(id, true); update(); }, 80);
      setTimeout(function () { goTo(id, true); update(); }, 600);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitText(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  update();
})();
