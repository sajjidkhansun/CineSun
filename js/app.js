/* CineSun — cinejoy-style home. Real posters/backdrops/logos via Cinemeta CDN,
   Iconify UI icons, hero carousel, rows, search, modal, my-list. */
"use strict";

(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const rowsEl = () => $("#rows");

  const byId = new Map(CATALOG.map(it => [it.id, it]));
  const byTitle = new Map(CATALOG.map(it => [it.t, it]));

  /* =========================================================
     Real artwork engine — Cinemeta (keyless, CORS-open public CDN)
     entry: { p: posterURL, b: backdropURL, i: imdbId }
     ========================================================= */
  const META_LS = "cineSunMetaV2";
  let metaStore = {};
  try { metaStore = JSON.parse(localStorage.getItem(META_LS) || "{}"); } catch (_) { metaStore = {}; }
  let metaSaveTmr = null;
  function saveMeta() {
    clearTimeout(metaSaveTmr);
    metaSaveTmr = setTimeout(() => { try { localStorage.setItem(META_LS, JSON.stringify(metaStore)); } catch (_) {} }, 600);
  }

  const normT = s => String(s).toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
  const mKey = it => it.type + "|" + normT(it.t) + "|" + it.y;
  /* distance between a catalogue release year and the title's own year */
  const yrNum = (info, y) => Math.abs((parseInt(String(info), 10) || 0) - (y || 0));

  function yearsMatch(info, y) {
    if (!info) return false;
    const m = String(info);
    if (m.includes(String(y))) return true;
    const mm = m.match(/(\d{4})(?:\D+(\d{4})?)?/);
    if (!mm) return false;
    const start = +mm[1];
    const open = /[-–]\s*$/.test(m) && !mm[2];
    const end = mm[2] ? +mm[2] : start;
    if (mm[2] && y >= start && y <= end) return true;
    if (open) return Math.abs(start - y) <= 1;
    return false;
  }

  const metaPending = new Map();
  const metaQueue = [];
  let metaActive = 0;

  function metaFor(item, cb) {
    if (item._meta) { cb(item._meta); return item._meta; }
    const k = mKey(item);
    const c = metaStore[k];
    if (c !== undefined) { cb(c || {}); return c || {}; }
    const q = metaPending.get(k);
    if (q) { q.push(cb); return null; }
    metaPending.set(k, [cb]);
    metaQueue.push({ item, k });
    pumpMeta();
    return null;
  }

  function pumpMeta() {
    while (metaActive < 5 && metaQueue.length) {
      const job = metaQueue.shift();
      metaActive++;
      const ctl = ("AbortSignal" in window && AbortSignal.timeout) ? { signal: AbortSignal.timeout(7000) } : {};
      fetch(`https://v3-cinemeta.strem.io/catalog/${job.item.type === "series" ? "series" : "movie"}/top/search=${encodeURIComponent(normT(job.item.t))}.json`, ctl)
        .then(r => r.ok ? r.json() : Promise.reject(0))
        .then(d => {
          const metas = (d && d.metas) || [];
          const nTitle = normT(job.item.t);
          const y = job.item.y;
          let hit = metas.find(m => normT(m.name || "") === nTitle && yearsMatch(m.releaseInfo, y));
          if (!hit) hit = metas.find(m => normT(m.name || "") === nTitle && yearsMatch(m.releaseInfo, y - 1));
          if (!hit) hit = metas.find(m => normT(m.name || "") === nTitle && yearsMatch(m.releaseInfo, y + 1));
          if (!hit) {
            /* same name, any year — catalogues sometimes list a different
               release year than the title's own (re-releases); nearest wins */
            const same = metas
              .filter(m => normT(m.name || "") === nTitle && (m.poster || m.imdb_id))
              .sort((a, b) => yrNum(a.releaseInfo, y) - yrNum(b.releaseInfo, y));
            if (same.length) hit = same[0];
          }
          if (!hit) {
            /* stylized names ("Se7en" is listed as "Seven"): an early result
               whose year matches exactly and whose name resembles the query */
            hit = metas.slice(0, 3).find(m => {
              const n = normT(m.name || "");
              return n && yearsMatch(m.releaseInfo, y) &&
                n.slice(0, 2) === nTitle.slice(0, 2) &&
                Math.abs(n.length - nTitle.length) <= 3 &&
                (m.poster || m.imdb_id);
            });
          }
          let entry = null;
          if (hit && (hit.imdb_id || hit.poster)) {
            /* same rule as live items: never synthesize a metahub URL —
               titles without a poster keep the procedural fallback and
               make no 404 request. Catalog posters (metahub small or
               Amazon) are upgraded/used as listed. */
            entry = {
              i: hit.imdb_id || "",
              p: hiRes(hit.poster || "", "/poster/small/", "/poster/medium/"),
              b: hit.background ? hiRes(hit.background, "/background/medium/", "/background/large/") : "",
              l: hit.logo || ""
            };
          }
          /* cache only successes — a "no match" can be burst rate limiting,
             and the next visit should retry it instead of staying fallback art */
          if (entry) { metaStore[job.k] = entry; saveMeta(); }
          (metaPending.get(job.k) || []).forEach(cb => cb(entry || {}));
          metaPending.delete(job.k);
        })
        .catch(() => {
          (metaPending.get(job.k) || []).forEach(cb => cb({}));
          metaPending.delete(job.k);
        })
        .finally(() => { metaActive--; pumpMeta(); });
    }
  }

  /* Lazy-load real posters into visible cards */
  let cardIO = null;
  function ensureIO() {
    if (cardIO) return cardIO;
    cardIO = new IntersectionObserver(es => {
      es.forEach(en => {
        if (!en.isIntersecting) return;
        const img = en.target;
        cardIO.unobserve(img);
        if (img.dataset.real) return; /* already handled by the eager attemptReal path */
        const card = img.closest(".card");
        const item = card && byId.get(card.dataset.tid);
        if (!item) return;
        metaFor(item, e => {
          if (e && e.p) {
            img.addEventListener("error", () => { img.src = img.dataset.fb; }, { once: true });
            img.src = e.p;
            img.classList.add("real");
          }
        });
      });
    }, { rootMargin: "620px 480px 620px 320px" });
    return cardIO;
  }

  function attemptReal(img, item) {
    if (img.dataset.real) return;
    img.dataset.real = "1";
    metaFor(item, e => {
      if (e && e.p) {
        img.addEventListener("error", () => { img.src = img.dataset.fb; }, { once: true });
        img.src = e.p;
        img.classList.add("real");
      }
    });
  }

  /* Fallback for browsers/tabs where IntersectionObserver is throttled
     (e.g. a backgrounded tab): every second, upgrade any in-viewport poster
     that the observer hasn't reached yet. attemptReal() is idempotent. */
  let posterWatchTimer = null;
  function startPosterWatch() {
    if (posterWatchTimer) return;
    posterWatchTimer = setInterval(() => {
      const vh = window.innerHeight;
      $$("img.poster-art:not([data-real])").forEach(img => {
        if (img.dataset.real) return;
        const r = img.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 400) return;
        const card = img.closest(".card");
        const item = card && byId.get(card.dataset.tid);
        if (item) attemptReal(img, item);
      });
    }, 900);
  }

  function wirePosters(root) {
    $$("img.poster-art", root).forEach(img => {
      if (img.dataset.mw) return;
      img.dataset.mw = "1";
      ensureIO().observe(img);
    });
    /* first screenful also loads eagerly — resilient to observer timing */
    $$("img.poster-art", root).slice(0, 26).forEach(img => {
      const card = img.closest(".card");
      const item = card && byId.get(card.dataset.tid);
      if (item) attemptReal(img, item);
    });
  }

  /* ---------- cards ---------- */

  function cardHTML(item, rank) {
    const p = posterData(item);
    return `<article class="card ${item.type}" data-tid="${item.id}" tabindex="0" title="${escapeHtml(item.t)}">
  <div class="poster">
    <img class="poster-art" loading="lazy" decoding="async" alt="${escapeHtml(item.t)}" src="${p.uri}" data-fb="${p.uri}">
    ${item.r ? `<span class="rating"><iconify-icon icon="ri:star-fill"></iconify-icon>${item.r.toFixed(1)}</span>` : ""}
    ${rank ? `<span class="rank">${rank}</span>` : ""}
  </div>
  <div class="meta">
    <h3>${escapeHtml(item.t)}</h3>
    <p>${item.y} · <span class="mini-badge">${item.type === "series" ? "Series" : "Movie"}</span></p>
  </div>
</article>`;
  }

  const escapeHtml = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  /* Verified outbound links: real <a> click keeps it popup-blocker friendly. */
  function openURL(u) {
    const a = document.createElement("a");
    a.href = u; a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  /* Verified open-server engine.
     Cinemeta's catalog search gives IMDb ids, but every verified keyless player is keyed
     by the TMDB id — so tmdbFor also resolves moviedb_id from the full Cinemeta meta
     endpoint and caches it as `.m` next to the art fields (older cache entries simply
     lack it and get one free resolution). A cached 0 means "resolve attempted, no id". */
  const TMDB_PENDING = new Map();

  /* Callbacks receive a resolution token: { m: tmdbId-or-0, imdb } or null.
     Cached `.m` of 0 means "resolution already attempted, no TMDB id" — the IMDb
     id (VidLink) can still be present, since the two players key differently. */
  /* Season/episode lists come from the same Cinemeta meta the TMDB resolution
     already fetches — cache them by IMDb id so the picker never re-fetches. */
  const EP_CACHE = new Map(); /* imdb id -> videos[] */

  function tmdbFor(item, cb) {
    if (item._meta) {
      const mm = item._meta;
      cb({ m: typeof mm.m === "number" ? mm.m : 0, imdb: mm.i || "" });
      return mm;
    }
    const k = mKey(item);
    const c = metaStore[k];
    if (c !== undefined) {
      if (c && typeof c.m === "number") { cb({ m: c.m, imdb: c.i || "" }); return c; }
      if (c === null) { cb(null); return null; }
      /* entry exists but has no moviedb id yet → resolve below */
    }
    const q = TMDB_PENDING.get(k);
    if (q) { q.push(cb); return null; }
    TMDB_PENDING.set(k, [cb]);
    const flush = res => {
      (TMDB_PENDING.get(k) || []).forEach(w => w(res));
      TMDB_PENDING.delete(k);
    };
    if (!c || !c.i) {
      /* IMDb id must be resolved (or confirmed missing) first */
      metaFor(item, e => {
        const cur = metaStore[k];
        if (cur && typeof cur.m === "number") { flush({ m: cur.m, imdb: cur.i || "" }); return; }
        if (!e || !e.i) { metaStore[k] = Object.assign({}, metaStore[k] || {}, { m: 0 }); saveMeta(); flush(null); return; }
        fetchTmdb(item, k, e.i);
      });
      return null;
    }
    fetchTmdb(item, k, c.i);
    return null;
  }

  function fetchTmdb(item, k, imdb) {
    const ctl = ("AbortSignal" in window && AbortSignal.timeout) ? { signal: AbortSignal.timeout(7000) } : {};
    fetch(`https://v3-cinemeta.strem.io/meta/${item.type === "series" ? "series" : "movie"}/${imdb}.json`, ctl)
      .then(r => r.ok ? r.json() : Promise.reject(0))
      .then(d => {
        const m = Number((d && d.meta && d.meta.moviedb_id)) || 0;
        metaStore[k] = Object.assign({}, metaStore[k] || {}, { m });
        saveMeta();
        /* freebie: this request already returned the full series meta —
           keep its episode list for the modal's season/episode picker */
        if (d && d.meta && Array.isArray(d.meta.videos) && d.meta.videos.length && !EP_CACHE.has(imdb)) {
          EP_CACHE.set(imdb, d.meta.videos);
        }
        (TMDB_PENDING.get(k) || []).forEach(w => w({ m, imdb }));
      })
      .catch(() => {
        /* transient: don't cache it, but the IMDb id is still usable for IMDb-keyed servers */
        (TMDB_PENDING.get(k) || []).forEach(w => w({ m: 0, imdb }));
      })
      .finally(() => TMDB_PENDING.delete(k));
  }

  /* verified server chips for a title. res = { m, imdb } (or null).
     VidLink keys movies by IMDb and series by TMDB; Mapple keys both by TMDB —
     a chip is skipped when the id kind it needs wasn't resolved. */
  function buildServers(item, res) {
    if (!res || typeof PLAY_SERVERS === "undefined") return [];
    const ids = { imdb: res.imdb || "", tmdb: res.m || 0 };
    return PLAY_SERVERS
      .map(s => {
        const kind = item.type === "series" ? s.tvKey : s.key;
        if (kind === "imdb" && !ids.imdb) return null;
        if (kind === "tmdb" && !ids.tmdb) return null;
        const fn = item.type === "series" ? s.series : s.movie;
        if (typeof fn !== "function") return null;
        const href = item.type === "series" ? fn(ids, modalSel.s, modalSel.e) : fn(ids);
        return href ? { name: s.name, color: s.color, href } : null;
      })
      .filter(Boolean);
  }

  /* ---------- season / episode picker (series modal) ---------- */

  /* Full episode list for a series: served from EP_CACHE when the TMDB
     resolution already ran, otherwise one direct Cinemeta meta request. */
  function episodesFor(item, cb) {
    if (item.type !== "series") { cb(null); return; }
    metaFor(item, e => {
      const imdb = (item._meta && item._meta.i) || (e && e.i) || "";
      if (!imdb) { cb(null); return; }
      if (EP_CACHE.has(imdb)) { cb(EP_CACHE.get(imdb)); return; }
      const ctl = ("AbortSignal" in window && AbortSignal.timeout) ? { signal: AbortSignal.timeout(8000) } : {};
      fetch(`https://v3-cinemeta.strem.io/meta/series/${imdb}.json`, ctl)
        .then(r => r.ok ? r.json() : Promise.reject(0))
        .then(d => {
          const vids = (d && d.meta && d.meta.videos) || [];
          EP_CACHE.set(imdb, vids);
          cb(vids.length ? vids : null);
        })
        .catch(() => cb(null));
    });
  }

  /* ---------- rows & grids ---------- */

  const GENRE_ICON = {
    Anime: "ri:sparkling-2-line", Action: "ri:sword-line", "Sci-Fi": "ri:rocket-line", Comedy: "ri:emotion-laugh-line",
    Drama: "ri:film-line", Thriller: "ri:flashlight-line", Crime: "ri:shield-star-line",
    Adventure: "ri:map-2-line", Fantasy: "ri:magic-line", Animation: "ri:palette-line",
    Romance: "ri:heart-line", Horror: "ri:ghost-line", Mystery: "ri:eye-line"
  };

  function rowHTML(title, items, icon, opts) {
    opts = opts || {};
    if (!items.length) return "";
    const cards = items.map((it, i) => cardHTML(it, opts.ranked ? i + 1 : 0)).join("");
    return `<section class="row">
  <div class="row-head px"><h2>${icon ? `<iconify-icon class="row-icon" icon="${icon}"></iconify-icon>` : ""}${title}</h2><a href="#" class="view-all" data-view="${escapeHtml(title)}">View All<iconify-icon icon="ri:arrow-right-s-line"></iconify-icon></a></div>
  <div class="row-wrap">
    <button class="nav-arrow left" aria-label="Scroll left"><iconify-icon icon="ri:arrow-left-s-line"></iconify-icon></button>
    <div class="scroller">${cards}</div>
    <button class="nav-arrow right" aria-label="Scroll right"><iconify-icon icon="ri:arrow-right-s-line"></iconify-icon></button>
  </div>
</section>`;
  }

  function bindArrows(root) {
    $$(".nav-arrow", root).forEach(btn => {
      btn.addEventListener("click", () => {
        const sc = btn.parentElement.querySelector(".scroller");
        sc.scrollBy({ left: (btn.classList.contains("left") ? -1 : 1) * sc.clientWidth * 0.85, behavior: "smooth" });
      });
    });
  }

  function renderRows() {
    const movies = CATALOG.filter(it => it.type === "movie");
    const series = CATALOG.filter(it => it.type === "series");
    const trending = TRENDING_SERIES.map(t => byTitle.get(t)).filter(Boolean);
    let html = "";
    html += rowHTML("Trending Series", trending, "ri:fire-line");
    html += rowHTML("Top 10 Rated Movies", topSorted(movies).slice(0, 10), "ri:trophy-line", { ranked: true });
    html += rowHTML("Top 10 Rated Series", topSorted(series).slice(0, 10), "ri:trophy-line", { ranked: true });
    html += GENRE_ORDER.map(g => rowHTML(g, topSorted(CATALOG.filter(it => it.g[0] === g)), GENRE_ICON[g])).join("");
    return html;
  }

  /* ---------- hero carousel ---------- */

  let heroIdx = 0, heroTimer = null, heroItems = [];
  const heroPlay = {}; /* slide id -> first verified server URL (set once the TMDB id resolves) */

  function heroSlideHTML(item) {
    const bd = backdropData(item);
    return `<div class="slide" data-tid="${item.id}" style="--bd:url('${bd.uri}')">
      <div class="slide-bg"></div>
      <div class="slide-info">
        <img class="slide-logo" alt="${escapeHtml(item.t)}" hidden>
        <p class="slide-kicker"><iconify-icon icon="ri:sparkling-line"></iconify-icon> ${item.type === "series" ? "Featured Series" : "Featured Movie"}</p>
        <h2 class="slide-title">${escapeHtml(item.t)}</h2>
        <p class="slide-meta"><b class="score"><iconify-icon icon="ri:star-fill"></iconify-icon> ${item.r.toFixed(1)}/10</b><span class="dot">•</span>${item.y}<span class="dot">•</span>${item.g.join(", ")}</p>
        <p class="slide-desc">${escapeHtml(item.d)}</p>
        <div class="slide-actions">
          <button class="pill-action play" data-act="play"><iconify-icon icon="ri:play-fill"></iconify-icon> Play</button>
          <button class="pill-action ghost" data-act="info"><iconify-icon icon="ri:information-line"></iconify-icon> More Info</button>
        </div>
      </div>
    </div>`;
  }

  function setSlide(i) {
    $$("#heroMount .slide").forEach((s, k) => s.classList.toggle("active", k === i));
    $$("#heroDots .hdot").forEach((d, k) => d.classList.toggle("on", k === i));
    heroIdx = i;
  }

  function startHero() { stopHero(); heroTimer = setInterval(() => setSlide((heroIdx + 1) % heroItems.length), 6500); }
  function stopHero() { if (heroTimer) clearInterval(heroTimer); heroTimer = null; }

  function buildHero() {
    heroItems = FEATURED.map(t => byTitle.get(t)).filter(Boolean);
    const hero = $("#hero");
    hero.innerHTML = `<div id="heroMount">${heroItems.map(heroSlideHTML).join("")}</div>
      <div id="heroDots">${heroItems.map((_, i) => `<button class="hdot${i ? "" : " on"}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>`;
    setSlide(0);
    startHero();
    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    $("#heroDots").addEventListener("click", e => {
      const d = e.target.closest(".hdot");
      if (d) { setSlide(+d.dataset.i); startHero(); }
    });
    $("#heroMount").addEventListener("click", e => {
      const btn = e.target.closest(".pill-action");
      if (!btn) return;
      const id = btn.closest(".slide").dataset.tid;
      const act = btn.dataset.act;
      if (act === "play") {
        /* direct video link: instant player when the title's id is resolved, else the details modal */
        const u = heroPlay[id];
        if (u) openURL(u); else openModal(id);
        return;
      }
      if (act === "info") { openModal(id); return; }
    });
    /* real backdrops + logos + verified server URL from Cinemeta (generated art stays as fallback layer) */
    heroItems.forEach((item, i) => {
      metaFor(item, e => {
        const slide = $$("#heroMount .slide")[i];
        if (!slide) return;
        if (e && e.i) {
          tmdbFor(item, m => {
            const chips = buildServers(item, m);
            if (chips.length) heroPlay[item.id] = chips[0].href;
          });
        }
        if (e && e.b) {
          const remote = `url('${e.b}'), url('${backdropData(item).uri}')`;
          slide.style.setProperty("--bd", remote);
          const bg = slide.querySelector(".slide-bg");
          if (bg) bg.style.backgroundImage = remote;
        }
        if (e && e.l) {
          const lg = slide.querySelector(".slide-logo");
          lg.hidden = false;
          lg.addEventListener("load", () => slide.classList.add("has-logo"), { once: true });
          lg.addEventListener("error", () => { lg.hidden = true; slide.classList.remove("has-logo"); }, { once: true });
          lg.src = e.l;
        }
      });
    });
  }

  /* =========================================================
     Worldwide live catalogue (Cinemeta, keyless, CORS-open)
     ~22,000 movies + ~19,000 series, 50 per request, appended
     as you scroll. Every live item carries its IMDb + TMDB ids,
     so Play servers resolve without a second lookup.
     ========================================================= */
  const LIVE_CACHE = new Map();
  const LIVE_MAX_SKIP = 30000;
  const LIVE_PAGE = 50;   /* page size the catalog API is queried with, even when a page returns fewer rows */

  /* Only request artwork the catalogue actually lists — synthesizing a
     metahub URL for a title with no poster is what caused console 404s.
     Catalog posters may be metahub (upgrade small→medium for card quality)
     or Amazon (search results) — both are used as listed. Titles with no
     poster keep the colourful procedural fallback and make no bad request. */
  function hiRes(url, from, to) {
    return url && url.indexOf(from) !== -1 ? url.replace(from, to) : (url || "");
  }

  function liveItem(meta, fallbackType) {
    const imdb = String(meta.imdb_id || (String(meta.id || "").indexOf("tt") === 0 ? meta.id : "") || "");
    if (!imdb) return null;
    const id = "i" + imdb;
    const existing = byId.get(id);
    if (existing) return existing;
    const ym = String(meta.releaseInfo || meta.year || "").match(/\d{4}/);
    const genres = (meta.genres || meta.genre || []).filter(Boolean);
    const tmdb = Number(meta.moviedb_id) || 0;
    const it = {
      id, i: imdb, m: tmdb,
      type: meta.type === "series" ? "series" : (fallbackType || "movie"),
      t: meta.name || "Untitled",
      y: ym ? +ym[0] : 0,
      r: Number(meta.imdbRating) || 0,
      g: genres.length ? genres : ["Drama"],
      d: meta.description || "No description available yet.",
      s: [],
      _meta: {
        i: imdb, m: tmdb,
        enriched: !!meta.description,
        p: meta.poster ? hiRes(meta.poster, "/poster/small/", "/poster/medium/") : "",
        b: meta.background ? hiRes(meta.background, "/background/medium/", "/background/large/") : "",
        l: meta.logo || ""
      }
    };
    byId.set(id, it);
    return it;
  }

  /* Search results from the catalog API are intentionally thin (name + poster +
     year). For a title the visitor actually opens, fetch its full Cinemeta meta
     once so the modal can show the rating, synopsis, genres AND the TMDB id that
     the Mapple player needs. */
  function enrichLive(it, cb) {
    const mm = it._meta;
    if (!mm || mm.enriched || !mm.i) { if (cb) cb(false); return; }
    const ep = `https://v3-cinemeta.strem.io/meta/${it.type === "series" ? "series" : "movie"}/${mm.i}.json`;
    const ctl = ("AbortSignal" in window && AbortSignal.timeout) ? { signal: AbortSignal.timeout(8000) } : {};
    fetch(ep, ctl)
      .then(r => r.ok ? r.json() : Promise.reject(0))
      .then(d => {
        const m = d && d.meta;
        if (!m) return;
        mm.enriched = true;
        if (m.moviedb_id) mm.m = Number(m.moviedb_id) || mm.m;
        if (m.poster && !mm.p) mm.p = hiRes(m.poster, "/poster/small/", "/poster/medium/");
        if (m.background && !mm.b) mm.b = hiRes(m.background, "/background/medium/", "/background/large/");
        if (m.logo && !mm.l) mm.l = m.logo;
        if (m.imdbRating) it.r = Number(m.imdbRating) || it.r;
        if (m.description) it.d = m.description;
        if (Array.isArray(m.genres) && m.genres.length) it.g = m.genres;
        const ym = String(m.releaseInfo || m.year || "").match(/\d{4}/);
        if (ym && !it.y) it.y = +ym[0];
        if (cb) cb(true);
      })
      .catch(() => { mm.enriched = true; if (cb) cb(true); });
  }

  function liveURL(type, s) {
    const parts = [];
    if (s.genre) parts.push("genre=" + encodeURIComponent(s.genre));
    if (s.search) parts.push("search=" + encodeURIComponent(s.search));
    if (s.skip) parts.push("skip=" + s.skip);
    return `https://v3-cinemeta.strem.io/catalog/${type}/top${parts.length ? "/" + parts.join("&") : ""}.json`;
  }

  function fetchLive(type, s) {
    const url = liveURL(type, s);
    if (LIVE_CACHE.has(url)) return Promise.resolve(LIVE_CACHE.get(url));
    const ctl = ("AbortSignal" in window && AbortSignal.timeout) ? { signal: AbortSignal.timeout(9000) } : {};
    return fetch(url, ctl)
      .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
      .then(d => {
        const metas = (d && d.metas) || [];
        const res = {
          items: metas.map(m => liveItem(m, type)).filter(Boolean),
          /* Some pages return slightly fewer than 50 rows (e.g. skip=50 → 46) even
             though the catalogue continues, so only an empty page means "the end". */
          hasMore: metas.length > 0,
          raw: metas.length
        };
        LIVE_CACHE.set(url, res);
        return res;
      });
  }

  let liveView = null;
  let liveViewGen = 0;

  function liveStatus() {
    const v = liveView;
    if (!v || !v.statusEl) return;
    const busy = v.streams.some(s => s.loading);
    const done = !v.streams.length || v.streams.every(s => s.done);
    v.statusEl.textContent = busy
      ? `${v.count} titles · loading more…`
      : done
        ? `${v.count} titles · all loaded`
        : `${v.count} titles · scroll for more`;
    if (v.moreBtn) v.moreBtn.hidden = busy || done;
    if (v.emptyEl) v.emptyEl.hidden = v.count > 0 || busy;
  }

  function appendLiveItems(list) {
    const v = liveView;
    if (!v) return 0;
    const fresh = [];
    list.forEach(it => {
      const key = it.type + "|" + normT(it.t) + "|" + it.y;
      if (v.seen.has(key) || v.seenIds.has(it.id)) return;
      v.seen.add(key);
      v.seenIds.add(it.id);
      fresh.push(it);
    });
    if (!fresh.length) return 0;
    v.grid.insertAdjacentHTML("beforeend", fresh.map(it => cardHTML(it)).join(""));
    v.count += fresh.length;
    wirePosters(v.grid);
    liveStatus();
    return fresh.length;
  }

  function loadNextLive() {
    const v = liveView;
    if (!v) return;
    if (v.streams.some(s => s.loading)) return;
    const pending = v.streams.filter(s => !s.done);
    if (!pending.length) { liveStatus(); return; }
    const gen = v.gen;
    pending.forEach(s => { s.loading = true; });
    liveStatus();
    Promise.all(pending.map(s =>
      fetchLive(s.type, s)
        .then(res => {
          if (!liveView || liveView.gen !== gen) return;
          appendLiveItems(res.items);
          s.skip += LIVE_PAGE;
          if (!res.hasMore) s.done = true;
          if (s.search) s.done = true;
          if (s.skip >= LIVE_MAX_SKIP) s.done = true;
        })
        .catch(() => { s.done = true; })
        .finally(() => { s.loading = false; })
    )).then(() => {
      if (!liveView || liveView.gen !== gen) return;
      liveStatus();
      /* Keep filling whenever the sentinel is still near the viewport. This makes
         infinite scroll work even if IntersectionObserver never re-fires (e.g. a
         backgrounded tab, or when the first page is shorter than the viewport). */
      autoFillLive();
    });
  }

  let autoFillTmr = null;
  let liveWatch = null;

  function stopLiveWatch() {
    clearTimeout(autoFillTmr);
    if (liveWatch) { clearInterval(liveWatch); liveWatch = null; }
  }

  /* Safety net for browsers/tabs where IntersectionObserver is delayed: while a
     catalogue view is open, check a few times a second and load the next page
     whenever the sentinel gets close. Stops itself once every stream is done. */
  function startLiveWatch() {
    if (liveWatch) clearInterval(liveWatch);
    liveWatch = setInterval(() => {
      const v = liveView;
      if (!v) { stopLiveWatch(); return; }
      if (v.streams.every(s => s.done)) { stopLiveWatch(); return; }
      if (v.streams.some(s => s.loading)) return;
      const sentinel = $("#liveSentinel");
      if (sentinel && sentinel.getBoundingClientRect().top <= window.innerHeight + 900) loadNextLive();
    }, 800);
  }

  function autoFillLive() {
    const v = liveView;
    if (!v) return;
    clearTimeout(autoFillTmr);
    const pending = v.streams.some(s => !s.done);
    if (!pending) return;
    autoFillTmr = setTimeout(() => {
      if (!liveView || liveView !== v) return;
      const sentinel = $("#liveSentinel");
      if (!sentinel) return;
      const near = sentinel.getBoundingClientRect().top <= window.innerHeight + 1400;
      if (near) loadNextLive();
    }, 250);
  }

  /* Catalog page used by Movies, Series, genre "View All" and live search. */
  function catalogView(title, streams, opts) {
    opts = opts || {};
    stopLiveWatch();
    stopHero();
    const hero = $("#hero");
    if (hero) hero.style.display = "none";
    if (opts.navKey !== undefined) setNav(opts.navKey); else setNav("");

    const el = rowsEl();
    el.innerHTML = `<div class="viewbar px"><div><h2>${escapeHtml(title)}</h2><p id="liveCount">Starting…</p></div>
      <a href="#" class="view-all" id="backBtn"><iconify-icon icon="ri:arrow-left-s-line"></iconify-icon>Back</a></div>
    <div class="grid px" id="liveGrid"></div>
    <div class="empty" id="liveEmpty" hidden><div class="empty-art"><iconify-icon icon="ri:sun-line"></iconify-icon></div><h2>Nothing found</h2><p>Try another spelling, year or genre.</p></div>
    <div class="live-more-wrap"><button class="live-more" id="liveMore" hidden>Load more titles</button></div>
    <div id="liveSentinel" class="live-sentinel"></div>
    <footer class="page-end"><iconify-icon icon="ri:sun-line"></iconify-icon> <b>CineSun</b> — one colourful home for every platform. Playback happens on the third-party platforms shown; availability &amp; rights are theirs.
      <div class="credit">Developed by <a class="ig" href="https://instagram.com/sunkhannnn" target="_blank" rel="noopener" title="Developer on Instagram"><iconify-icon icon="ri:instagram-line"></iconify-icon>@sunkhannnn</a> <span class="sep">·</span> © 2026 CineSun</div>
      <div class="visits" hidden><iconify-icon icon="ri:eye-line"></iconify-icon><span class="visit-count">–</span><span>lifetime visits</span></div>
    </footer>`;
    $("#backBtn").addEventListener("click", e => { e.preventDefault(); goHome(); });
    renderVisitsCached();

    const v = {
      gen: ++liveViewGen,
      grid: $("#liveGrid"),
      statusEl: $("#liveCount"),
      moreBtn: $("#liveMore"),
      emptyEl: $("#liveEmpty"),
      count: 0,
      seen: new Set(),
      seenIds: new Set(),
      streams: streams.map(s => ({ type: s.type, genre: s.genre, search: s.search, skip: 0, done: false, loading: false }))
    };
    liveView = v;

    /* instant seed from the curated catalogue so the page is never empty */
    const seed = opts.seed || CATALOG.filter(it => streams.some(s =>
      it.type === s.type && (!s.genre || it.g[0] === s.genre)
    ));
    appendLiveItems(topSorted(seed));

    $("#liveMore").addEventListener("click", loadNextLive);
    if ("IntersectionObserver" in window) {
      v.io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting)) loadNextLive();
      }, { rootMargin: "900px 0px" });
      v.io.observe($("#liveSentinel"));
    }
    liveStatus();
    loadNextLive();
    startLiveWatch();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- views ---------- */

  function resultsView(title, items, subtitle, back) {
    liveView = null;
    stopLiveWatch();
    const hero = $("#hero");
    if (hero) { hero.style.display = "none"; stopHero(); }
    const el = rowsEl();
    el.innerHTML = `<div class="viewbar px"><div><h2>${title}</h2><p>${subtitle || (items.length + (items.length === 1 ? " title" : " titles"))}</p></div>
      <a href="#" class="view-all" id="backBtn"><iconify-icon icon="ri:arrow-left-s-line"></iconify-icon>Back</a></div>
    ${items.length ? `<div class="grid px">${items.map(it => cardHTML(it)).join("")}</div>`
      : `<div class="empty"><div class="empty-art"><iconify-icon icon="ri:sun-line"></iconify-icon></div><h2>Nothing found</h2><p>${subtitle || "Try another title, genre or platform."}</p></div>`}
    <footer class="page-end"><iconify-icon icon="ri:sun-line"></iconify-icon> <b>CineSun</b> — one colourful home for every platform. Playback happens on the third-party platforms shown; availability &amp; rights are theirs.
      <div class="credit">Developed by <a class="ig" href="https://instagram.com/sunkhannnn" target="_blank" rel="noopener" title="Developer on Instagram"><iconify-icon icon="ri:instagram-line"></iconify-icon>@sunkhannnn</a> <span class="sep">·</span> © 2026 CineSun</div>
      <div class="visits" hidden><iconify-icon icon="ri:eye-line"></iconify-icon><span class="visit-count">–</span><span>lifetime visits</span></div>
    </footer>`;
    $("#backBtn").addEventListener("click", e => { e.preventDefault(); goHome(); });
    renderVisitsCached();
    wirePosters(el);
  }

  function goHome() {
    searchInput.value = "";
    toggleClear();
    closeNavSearch();
    setNav("home");
    renderHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- navbar pages ---------- */

  function typeViewRaw(title, pred, subtitle) {
    setNav(title.includes("Movies") ? "movies" : title.includes("Series") ? "series" : "");
    resultsView(title, topSorted(CATALOG.filter(pred)), subtitle || "Sorted by rating", true);
  }
  function typeView(title, type, subtitle) {
    typeViewRaw(title, it => it.type === type, subtitle);
  }

  function setNav(key) {
    $$(".nav-btn:not(.logo-btn)").forEach(b => b.classList.toggle("active", b.dataset.nav === key));
  }

  function renderHome() {
    liveView = null;
    stopLiveWatch();
    if (!$("#heroMount")) buildHero();
    stopHero();
    startHero();
    const hero = $("#hero");
    if (hero) hero.style.display = "";
    rowsEl().innerHTML = renderRows();
    bindArrows(rowsEl());
    wirePosters(rowsEl());
    setSlide(heroIdx || 0);
  }

  /* ---------- search ---------- */

  let debounceTimer = null;
  let searchState = { lastWasSearch: false };
  function openNavSearch() {
    $("#navSearch").classList.add("open");
    searchInput.classList.add("open");
    setTimeout(() => searchInput.focus(), 10);
  }
  function closeNavSearch() {
    if (!searchInput.value) {
      $("#navSearch").classList.remove("open");
      searchInput.classList.remove("open");
    }
  }

  let searchInput;
  function onSearch(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) { if (searchState.lastWasSearch) { searchState.lastWasSearch = false; renderHome(); } return; }
    searchState.lastWasSearch = true;

    const local = CATALOG.filter(it => {
      const srcs = (it.s || []).map(k => SOURCES[k]).filter(Boolean);
      return it.t.toLowerCase().includes(q)
        || String(it.y).includes(q)
        || it.type.includes(q)
        || it.g.join(" ").toLowerCase().includes(q)
        || srcs.some(s => (s.name + " " + s.short).toLowerCase().includes(q));
    });

    /* 2+ characters also search the worldwide catalogue (movies + series). */
    const streams = q.length >= 2
      ? [{ type: "movie", search: q }, { type: "series", search: q }]
      : [];

    catalogView(`Results for “${q}”`, streams, { seed: topSorted(local) });
  }

  function toggleClear() {
    $("#clearSearch").hidden = !searchInput.value;
  }

  /* ---------- modal ---------- */

  let modalId = null;
  /* selected season/episode for the open series modal (movies ignore it) */
  let modalSel = { s: 1, e: 1 };
  let modalRes = null; /* resolved { m, imdb } for the open modal */

  function openModal(id) {
    const it = byId.get(id);
    if (!it) return;
    /* enrichLive() re-opens an already-open modal once metadata arrives —
       keep the visitor's season/episode choice in that case */
    const wasOpen = modalId === id;
    modalId = id;
    if (!wasOpen) { modalSel = { s: 1, e: 1 }; modalRes = null; }
    const p = posterData(it);
    /* Browse chips: all four platforms are verified-alive websites, but their per-title
       deep links are not verifiable → site-level globe chips only. Actual playback is
       the Servers row, built from the verified keyless players once the TMDB id resolves. */
    const browseChips = (it.s || []).map(k => {
      const s = SOURCES[k];
      if (!s) return "";
      if (s.search) {
        return `<a class="watch" href="${s.search}${encodeURIComponent(it.t)}" target="_blank" rel="noopener" style="--sc:${s.color}" title="Opens this title's page on ${s.name}"><iconify-icon icon="ri:play-mini-fill"></iconify-icon> ${s.short}</a>`;
      }
      return `<a class="watch site" href="${s.home}" target="_blank" rel="noopener" style="--sc:${s.color}" title="Opens ${s.name} (site-level link)"><iconify-icon icon="ri:globe-line"></iconify-icon> ${s.short}</a>`;
    }).join("");
    const browseHTML = browseChips
      ? `<p class="modal-src-label">Browse:</p>
      <div class="watch-row" id="watchRow">${browseChips}</div>`
      : "";
    $("#modalBody").innerHTML = `
  <div class="modal-grid">
    <div class="modal-poster">
      <img id="modalPoster" alt="${escapeHtml(it.t)}" src="${p.uri}" data-fb="${p.uri}">
    </div>
    <div class="modal-info">
      <span class="kicker ${it.type}">${it.type === "series" ? "SERIES" : "MOVIE"} · ${it.g[0] || (it.type === "series" ? "Series" : "Movie")}</span>
      <h2>${escapeHtml(it.t)}</h2>
      <p class="modal-meta"><b class="stars"><iconify-icon icon="ri:star-fill"></iconify-icon></b>${it.r ? it.r.toFixed(1) + "/10" : "Not rated"} &nbsp;·&nbsp; ${it.y || "—"} &nbsp;·&nbsp; ${it.g.join(", ")}</p>
      <p class="modal-blurb">${escapeHtml(it.d || "No description available yet.")}</p>
      <p class="modal-src-label" id="serverLabel">Servers${it.type === "series" ? ` · S${modalSel.s} E${modalSel.e}` : ""}</p>
      <div class="watch-row" id="serverRow"><span class="server-loading">Resolving servers…</span></div>
      ${it.type === "series" ? `<p class="modal-src-label">Episodes</p><div class="ep-picker" id="epPicker"><span class="server-loading">Loading episodes…</span></div>` : ""}
      ${browseHTML}
      <p class="modal-note">Servers stream this exact title in a verified player — press ▶ inside if it first waits for you, and if one says unavailable, try the next server.${browseChips ? " Browse chips open the platforms." : ""}</p>
    </div>
  </div>`;
    $("#modal").hidden = false;
    document.body.classList.add("no-scroll");
    $("#modalClose").focus();
    /* verified servers + real poster swap (single cached lookup chain) */
    const mp = $("#modalPoster");
    const row = $("#serverRow");
    metaFor(it, e => {
      if ((e && e.p) && mp.isConnected) {
        mp.addEventListener("error", () => { mp.src = mp.dataset.fb; }, { once: true });
        mp.src = e.p;
      }
      tmdbFor(it, m => {
        if (!row.isConnected) return; /* modal was closed meanwhile */
        modalRes = m;
        renderServerChips(it);
      });
    });

    enrichLive(it, ok => {
      if (!ok || modalId !== it.id || $("#modal").hidden) return;
      openModal(it.id);
    });

    if (it.type === "series") episodesFor(it, vids => renderEpPicker(it, vids));
  }

  /* (Re)draw the server chips for the open modal at the current selection. */
  function renderServerChips(it) {
    const row = $("#serverRow");
    if (!row || !row.isConnected) return;
    const chips = buildServers(it, modalRes);
    if (chips.length) {
      row.innerHTML = chips.map(c =>
        `<a class="watch" href="${c.href}" target="_blank" rel="noopener" style="--sc:${c.color}" title="Verified ${escapeHtml(c.name)} player — streams this exact title"><iconify-icon icon="ri:play-mini-fill"></iconify-icon> ${escapeHtml(c.name)}</a>`
      ).join("");
    } else {
      row.innerHTML = `<span class="server-loading">No verified server resolved for this title yet — check again later.</span>`;
    }
  }

  /* Season dropdown + episode list. Clicking an episode selects it, points the
     server chips at that exact S/E and opens the first verified player. */
  function renderEpPicker(item, vids) {
    const box = $("#epPicker");
    if (!box || !box.isConnected) return; /* modal was closed meanwhile */
    const groups = new Map(); /* season -> [{e, name, date}] */
    (vids || []).forEach(v => {
      const s = Number(v.season) || 0;
      const e = Number(v.number || v.episode) || 0;
      if (!e) return;
      if (!groups.has(s)) groups.set(s, []);
      groups.get(s).push({ e, name: v.name || v.title || "", date: v.firstAired || v.released || "" });
    });
    const seasons = [...groups.keys()].sort((a, b) => a - b);
    if (!seasons.length) {
      box.innerHTML = `<span class="server-loading">Episode list isn't available for this title yet — servers default to S1 E1.</span>`;
      return;
    }
    if (!groups.has(modalSel.s)) modalSel = { s: seasons.includes(1) ? 1 : seasons[0], e: 1 };
    const opts = seasons.map(s =>
      `<option value="${s}"${s === modalSel.s ? " selected" : ""}>${s === 0 ? "Specials" : "Season " + s}</option>`
    ).join("");
    box.innerHTML = `
      <div class="ep-head">
        <select id="seasonSelect" class="season-select" aria-label="Season">${opts}</select>
        <span class="ep-count" id="epCount"></span>
      </div>
      <div class="ep-list" id="epList"></div>`;
    const sel = $("#seasonSelect");
    const list = $("#epList");
    const drawList = () => {
      const s = Number(sel.value);
      const eps = (groups.get(s) || []).slice().sort((a, b) => a.e - b.e);
      list.innerHTML = eps.map(x => {
        const on = (s === modalSel.s && x.e === modalSel.e);
        const d = x.date ? new Date(x.date) : null;
        const when = d && !isNaN(d) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
        return `<button type="button" class="ep-item${on ? " on" : ""}" data-s="${s}" data-e="${x.e}" aria-current="${on ? "true" : "false"}">
          <span class="ep-num">${x.e}</span>
          <span class="ep-txt"><span class="ep-name">${escapeHtml(x.name || "Episode " + x.e)}</span>${when ? `<span class="ep-date">${when}</span>` : ""}</span>
          <iconify-icon class="ep-play" icon="ri:play-fill"></iconify-icon>
        </button>`;
      }).join("");
      const cnt = $("#epCount");
      if (cnt) cnt.textContent = eps.length + (eps.length === 1 ? " episode" : " episodes");
    };
    sel.addEventListener("change", drawList);
    list.addEventListener("click", ev => {
      const b = ev.target.closest(".ep-item");
      if (!b) return;
      pickEpisode(item, Number(b.dataset.s), Number(b.dataset.e));
    });
    drawList();
  }

  function pickEpisode(item, s, e) {
    modalSel = { s, e };
    $$("#epList .ep-item").forEach(b => {
      const on = Number(b.dataset.s) === s && Number(b.dataset.e) === e;
      b.classList.toggle("on", on);
      b.setAttribute("aria-current", on ? "true" : "false");
    });
    const lbl = $("#serverLabel");
    if (lbl && lbl.isConnected) lbl.textContent = `Servers · S${s} E${e}`;
    renderServerChips(item);
    const first = $("#serverRow a.watch");
    if (first) window.open(first.getAttribute("href"), "_blank", "noopener");
  }

  function closeModal() {
    modalId = null;
    $("#modal").hidden = true;
    document.body.classList.remove("no-scroll");
  }

  /* ---------- lifetime visit counter (free counter API, no signup) ----------
     Counts once per browser session (hit), then re-reads every minute (get)
     so the number stays live while the page is open. Fails silently — the
     counter simply stays hidden if the API is unreachable. */
  const VISIT_KEY = "cinesun-website-lifetime-visits-2026";
  const VISIT_API = "https://countapi.mileshilliard.com/api/v1";
  const VISIT_LS = "cineSunVisitsCache";
  const VISIT_SESSION = "cineSunVisitCounted";

  function renderVisits(v) {
    const n = Number(v);
    if (!isFinite(n) || n < 0) return;
    const txt = n.toLocaleString("en-US");
    $$(".visit-count").forEach(el => { el.textContent = txt; });
    $$(".visits").forEach(el => el.removeAttribute("hidden"));
    try { localStorage.setItem(VISIT_LS, String(n)); } catch (_) {}
  }

  function fetchVisits(action) {
    const ctl = ("AbortSignal" in window && AbortSignal.timeout) ? { signal: AbortSignal.timeout(8000) } : {};
    return fetch(`${VISIT_API}/${action}/${VISIT_KEY}`, ctl)
      .then(r => {
        if (r.status === 404) return 0; /* key not created yet */
        if (!r.ok) return Promise.reject(new Error("HTTP " + r.status));
        return r.json();
      })
      .then(d => Number(d && d.value));
  }

  /* Show the last known visit count in freshly rendered footers. */
  function renderVisitsCached() {
    try {
      const cached = localStorage.getItem(VISIT_LS);
      if (cached !== null) renderVisits(cached);
    } catch (_) {}
  }

  function initVisits() {
    renderVisitsCached();
    let counted = false;
    try { counted = sessionStorage.getItem(VISIT_SESSION) === "1"; } catch (_) {}
    fetchVisits(counted ? "get" : "hit")
      .then(v => {
        renderVisits(v);
        if (!counted) { try { sessionStorage.setItem(VISIT_SESSION, "1"); } catch (_) {} }
      })
      .catch(() => { /* offline/API down: keep cached value, stay quiet */ });
    setInterval(() => {
      fetchVisits("get").then(renderVisits).catch(() => {});
    }, 60000);
  }

  /* ---------- init ---------- */

  function init() {
    searchInput = $("#search");

    buildHero();
    renderHome();
    startPosterWatch();
    initVisits();

    searchInput.addEventListener("input", () => {
      toggleClear();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => onSearch(searchInput.value), 130);
      if (searchInput.value) setNav("");
    });
    searchInput.addEventListener("keydown", e => { if (e.key === "Escape") { searchInput.value = ""; toggleClear(); renderHome(); searchInput.blur(); } });
    $("#clearSearch").addEventListener("click", () => { searchInput.value = ""; searchInput.focus(); toggleClear(); renderHome(); });
    $("#searchBtn").addEventListener("click", openNavSearch);
    $("#searchBtn2").addEventListener("click", openNavSearch);

    /* only real links navigate — the CineSun brand is a static label (no click function) */
    $$("a.nav-btn").forEach(b => b.addEventListener("click", e => {
      e.preventDefault();
      const k = b.dataset.nav;
      if (k === "home") goHome();
      if (k === "movies") catalogView("All Movies", [{ type: "movie" }], { navKey: "movies" });
      if (k === "anime") catalogView("Anime", [{ type: "movie", genre: "Anime" }, { type: "series", genre: "Anime" }], { navKey: "anime" });
      if (k === "series") catalogView("All Series", [{ type: "series" }], { navKey: "series" });
    }));

    document.addEventListener("click", e => {
      const va = e.target.closest(".view-all");
      if (va && va.id !== "backBtn") {
        e.preventDefault();
        const raw = va.dataset.view || "";
        const t = raw.replace(/^[^A-Za-z]+/, "").trim();
        if (t === "Trending Series") {
          setNav("");
          resultsView("Trending Series", topSorted(TRENDING_SERIES.map(x => byTitle.get(x)).filter(Boolean)), "What everyone is watching", true);
        } else if (t === "Top 10 Rated Movies") {
          typeViewRaw("Top Rated Movies", it => it.type === "movie");
        } else if (t === "Top 10 Rated Series") {
          typeViewRaw("Top Rated Series", it => it.type === "series");
        } else if (t === "Anime") {
          catalogView("Anime", [
            { type: "movie", genre: "Anime" },
            { type: "series", genre: "Anime" }
          ], { seed: topSorted(CATALOG.filter(it => it.g[0] === "Anime")) });
        } else {
          catalogView(`${t} Movies & Series`, [
            { type: "movie", genre: t },
            { type: "series", genre: t }
          ], { seed: topSorted(CATALOG.filter(it => it.g[0] === t)) });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const card = e.target.closest(".card");
      if (card) { openModal(card.dataset.tid); return; }
    });

    $("#randomBtn").addEventListener("click", () => openModal(CATALOG[Math.floor(Math.random() * CATALOG.length)].id));
    $("#randomBtn2").addEventListener("click", () => openModal(CATALOG[Math.floor(Math.random() * CATALOG.length)].id));

    document.addEventListener("keydown", e => {
      if (e.key === "Enter" && document.activeElement && document.activeElement.classList.contains("card")) openModal(document.activeElement.dataset.tid);
      if (e.key === "Escape" && !$("#modal").hidden) closeModal();
      if (e.key === "/" && $("#modal").hidden && document.activeElement !== searchInput) { e.preventDefault(); openNavSearch(); }
    });
    $("#modal").addEventListener("click", e => { if (e.target === $("#modal")) closeModal(); });
    $("#modalClose").addEventListener("click", closeModal);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
