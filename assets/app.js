/* Strapitec · Official Neri Partner — interactie */
(() => {
  const d = document, root = d.documentElement;
  root.classList.remove("no-js");
  const $ = (s, el = d) => el.querySelector(s), $$ = (s, el = d) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* intro: lantaarn gaat aan, 1x per sessie */
  const intro = $(".intro");
  if (intro) {
    let seen = false;
    try { seen = sessionStorage.getItem("sx-intro") === "1"; sessionStorage.setItem("sx-intro", "1"); } catch (e) {}
    const end = () => { intro.classList.add("done"); d.body.classList.add("ready"); setTimeout(() => intro.remove(), 1000); };
    if (seen || reduce) { intro.remove(); d.body.classList.add("ready"); }
    else { setTimeout(end, 3300); $(".skip", intro)?.addEventListener("click", end); intro.addEventListener("click", end); }
  } else d.body.classList.add("ready");

  /* smooth scroll */
  let lenis = null;
  if (window.Lenis && !reduce && !touch) {
    lenis = window.__lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const t = $(a.getAttribute("href")); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
    }));
  }

  /* header verbergen bij naar beneden scrollen */
  const hdr = $(".hdr"); let lastY = 0;
  const mcta = $(".mcta");
  addEventListener("scroll", () => {
    const y = scrollY;
    if (hdr && !d.body.classList.contains("menu-open")) hdr.classList.toggle("hide", y > 300 && y > lastY);
    if (mcta) mcta.classList.toggle("on", y > 700);
    lastY = y;
  }, { passive: true });
  $(".burger")?.addEventListener("click", () => d.body.classList.toggle("menu-open"));
  $$(".mnav a").forEach(a => a.addEventListener("click", () => d.body.classList.remove("menu-open")));

  /* woorden splitsen voor koppen */
  $$(".sl").forEach(el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const w = d.createElement("span"); w.className = "w";
            const i = d.createElement("span"); i.textContent = part; w.append(i); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("w")) walk(n);
      });
    };
    walk(el);
    $$(".w>span", el).forEach((s, i) => s.style.transitionDelay = (i * 0.06) + "s");
  });

  /* in beeld komen */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const watch = () => $$(".rv,.sl,.step,[data-count]").forEach(el => io.observe(el));
  if (d.body.classList.contains("ready")) watch(); else setTimeout(watch, intro && intro.isConnected ? 2600 : 0);
  $$(".rv[data-d]").forEach(el => el.style.transitionDelay = el.dataset.d + "s");

  /* tellers */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const tick = t => { const p = clamp((t - t0) / dur, 0, 1), v = Math.round(to * (1 - Math.pow(1 - p, 4))); el.textContent = v.toLocaleString("nl-NL"); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .5 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* hero zaklamp: licht volgt de cursor, op telefoon zweeft het zelf */
  const hero = $(".hero .bg2");
  if (hero) {
    let tx = 62, ty = 42, x = 62, y = 42, auto = touch, t = 0;
    const box = hero.parentElement;
    box.addEventListener("pointermove", e => { auto = false; const r = box.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100; });
    box.addEventListener("pointerleave", () => auto = true);
    const loop = () => {
      if (auto) { t += 0.006; tx = 58 + Math.sin(t) * 26; ty = 42 + Math.sin(t * 1.7) * 14; }
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      hero.style.setProperty("--mx", x + "%"); hero.style.setProperty("--my", y + "%");
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* cursor-gloed */
  if (!touch && !reduce) {
    const g = d.createElement("div"); g.className = "cglow"; d.body.append(g);
    let gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
    addEventListener("pointermove", e => { gx = e.clientX; gy = e.clientY; }, { passive: true });
    const gl = () => { cx += (gx - cx) * .12; cy += (gy - cy) * .12; g.style.transform = `translate(${cx - 260}px,${cy - 260}px)`; requestAnimationFrame(gl); };
    g.style.left = g.style.top = "0"; g.style.translate = "0 0"; gl();
  }

  /* spotlight op kaarten */
  $$(".sv").forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect(); c.style.setProperty("--x", e.clientX - r.left + "px"); c.style.setProperty("--y", e.clientY - r.top + "px");
  }));

  /* tilt */
  if (!touch) $$(".tilt").forEach(c => {
    c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`; });
    c.addEventListener("pointerleave", () => c.style.transform = "");
  });

  /* scroll-gestuurde secties */
  const scrubs = [];
  const prog = el => { const r = el.getBoundingClientRect(), h = r.height - innerHeight; return clamp(-r.top / (h || 1), 0, 1); };

  // dag -> nacht
  $$(".dn").forEach(dn => {
    const s = $(".dn-s", dn), clock = $(".dn-clock b", dn);
    scrubs.push(() => {
      const p = prog(dn); s.style.setProperty("--p", clamp((p - .12) / .7, 0, 1).toFixed(3));
      if (clock) { const m = Math.round(17 * 60 + 30 + p * 240); clock.textContent = String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
    });
  });

  // horizontale projectenrail
  $$(".hs").forEach(hs => {
    const tr = $(".hs-track", hs), bar = $(".hs-prog", hs);
    const size = () => { if (innerWidth <= 820) { hs.style.height = ""; return; } hs.style.height = (tr.scrollWidth - innerWidth + innerHeight * 1.15) + "px"; };
    size(); addEventListener("resize", size); addEventListener("load", size);
    scrubs.push(() => {
      if (innerWidth <= 820) return;
      const p = prog(hs), max = tr.scrollWidth - innerWidth;
      tr.style.transform = `translate3d(${-p * max}px,0,0)`;
      bar && bar.style.setProperty("--p", p.toFixed(3));
      $$(".pj .im img", tr).forEach((im, i) => { const r = im.parentElement.getBoundingClientRect(); im.style.objectPosition = `${clamp(50 + (r.left / innerWidth - .5) * 30, 0, 100)}% 50%`; });
    });
  });

  // stappenlijn
  $$(".steps").forEach(st => scrubs.push(() => {
    const r = st.getBoundingClientRect(); st.style.setProperty("--p", clamp((innerHeight * .6 - r.top) / r.height, 0, 1).toFixed(3));
  }));

  // parallax
  $$("[data-par]").forEach(el => scrubs.push(() => {
    const r = el.parentElement.getBoundingClientRect(); const k = +el.dataset.par || .15;
    el.style.transform = `translate3d(0,${(r.top) * -k}px,0)`;
  }));


  /* Giorno e Notte: de sectie in het midden van het scherm bepaalt dag of nacht */
  const base = d.body.dataset.t || "night";
  const themed = $$("main > section, main > div.mq, footer.ftr");
  if (themed.length) {
    const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) d.body.dataset.t = e.target.dataset.t || base; }), { rootMargin: "-48% 0px -48% 0px" });
    themed.forEach(el => tio.observe(el));
  }

  /* manifest: woorden gaan aan tijdens het scrollen */
  $$(".mtxt").forEach(el => {
    const wrapWords = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { f.append(" "); return; } const s = d.createElement("span"); s.className = "lw"; s.textContent = t; f.append(s); });
        n.replaceWith(f);
      } else if (n.nodeType === 1) wrapWords(n);
    });
    wrapWords(el);
    const ws = $$(".lw", el);
    scrubs.push(() => {
      const r = el.getBoundingClientRect();
      const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
      const n = Math.round(p * ws.length * 1.08);
      ws.forEach((w, i) => w.classList.toggle("on", i < n));
    });
  });

  /* lichtdeeltjes in de hero */
  $$(".hero canvas.motes, .stage canvas.motes").forEach(cv => {
    if (reduce) return;
    const ctx = cv.getContext("2d"); let W, H, dpr = Math.min(2, devicePixelRatio || 1), parts = [];
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);
    const N = innerWidth < 700 ? 34 : 70;
    for (let i = 0; i < N; i++) parts.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 2.2, s: .00012 + Math.random() * .00045, a: Math.random() * 6.28, w: .2 + Math.random() * .8 });
    let vis = true; new IntersectionObserver(es => vis = es[0].isIntersecting).observe(cv);
    const tick = t => {
      if (vis) {
        ctx.clearRect(0, 0, W, H);
        parts.forEach(p => {
          p.y -= p.s; p.a += .01; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
          const x = (p.x + Math.sin(p.a) * .006) * W, y = p.y * H, al = (.25 + .55 * Math.abs(Math.sin(p.a * .7))) * p.w;
          const g = ctx.createRadialGradient(x, y, 0, x, y, p.r * 5);
          g.addColorStop(0, `rgba(255,214,150,${al})`); g.addColorStop(1, "rgba(255,170,80,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, p.r * 5, 0, 6.28); ctx.fill();
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });


  /* ---------- v3 ---------- */
  const kcol = K => { const t = K / 100; let R, G, B;
    R = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332);
    G = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * Math.pow(t - 60, -0.0755);
    B = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
    return `rgb(${clamp(R, 0, 255) | 0},${clamp(G, 0, 255) | 0},${clamp(B, 0, 255) | 0})`; };

  /* productbühne: lampen schuiven in, gaan aan, kantelen mee met de muis */
  $$(".stage").forEach(st => {
    const items = JSON.parse(st.dataset.items), imgs = $$(".lamp img", st), btns = $$(".sel button", st);
    const emb = $(".emb span", st), nm = $(".sinfo .nm", st), kk = $(".sinfo .k b", st), facts = $(".sinfo .facts", st), go = $(".sinfo .go", st);
    const DUR = 5200; let cur = -1, auto = !reduce, timer, litT;
    const set = (i, user) => {
      if (user) auto = false;
      if (i === cur) return;
      const it = items[i]; const prev = cur; cur = i;
      st.classList.remove("lit"); clearTimeout(litT);
      imgs.forEach((im, k) => { im.classList.toggle("on", k === i); im.classList.toggle("gone", k === prev); });
      setTimeout(() => imgs[prev] && imgs[prev].classList.remove("gone"), 1200);
      st.style.setProperty("--kc", kcol(it.k)); st.style.setProperty("--gx", it.gx * 100 + "%"); st.style.setProperty("--gy", it.gy * 100 + "%"); st.style.setProperty("--ca", (it.ca || 0) + "deg");
      // naam rolt
      emb.classList.add("out");
      nm.style.transform = "translateY(-110%)"; nm.style.opacity = 0; facts.style.opacity = 0;
      setTimeout(() => {
        emb.textContent = it.n; emb.classList.remove("out"); emb.classList.add("in0"); void emb.offsetWidth; emb.classList.remove("in0");
        nm.textContent = it.n; nm.style.transition = "none"; nm.style.transform = "translateY(110%)"; void nm.offsetWidth; nm.style.transition = ""; nm.style.transform = ""; nm.style.opacity = 1;
        kk.textContent = it.b + " · " + it.k + "K · " + it.kl;
        facts.innerHTML = it.f.map(f => `<span>${f}</span>`).join(""); facts.style.opacity = 1;
        go.href = it.u; go.textContent = it.cta;
      }, prev < 0 ? 0 : 420);
      litT = setTimeout(() => st.classList.add("lit"), prev < 0 ? 900 : 1000);
      btns.forEach((b, k) => { b.classList.toggle("on", k === i); b.classList.remove("run"); });
      clearTimeout(timer);
      if (auto) { const b = btns[i]; void b.offsetWidth; b.style.setProperty("--dur", DUR + "ms"); b.classList.add("run"); timer = setTimeout(() => { const r = st.getBoundingClientRect(); if (r.bottom > innerHeight * .4) set((cur + 1) % items.length); else { auto && set((cur + 1) % items.length); } }, DUR); }
    };
    btns.forEach((b, k) => b.addEventListener("click", () => set(k, true)));
    const start = () => set(0);
    if (d.body.classList.contains("ready")) start(); else setTimeout(start, $(".intro") ? 2900 : 0);
    if (!touch && !reduce) {
      const tl = $(".tilt", st), embW = $(".emb", st), gl = $(".bgglow", st);
      st.addEventListener("pointermove", e => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        tl.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 10}deg) translate3d(${x * 14}px,${y * 10}px,0)`;
        embW.style.setProperty("--ex", x * -40 + "px"); embW.style.setProperty("--ey", y * -24 + "px");
        gl.style.transform = `translate(${x * 30}px,${y * 20}px)`;
      });
    }
  });

  /* als de stad aangaat: lantaarns één voor één aan */
  $$(".stad").forEach(sd => {
    const L = JSON.parse(sd.dataset.l), pic = $(".pic", sd), lit = $(".lgt", sd), clock = $(".clock b", sd), cnt = $(".count b", sd), caps = $$(".cap .h2", sd);
    scrubs.push(() => {
      const p = prog(sd);
      const masks = L.map((l, i) => { const a = clamp((p - .08 - i * .075) / .12, 0, 1); const r = (l[2] * a * pic.clientWidth).toFixed(1); return `radial-gradient(circle ${r}px at ${l[0]}% ${l[1]}%, #000 0%, rgba(0,0,0,.85) 35%, transparent 100%)`; });
      lit.style.setProperty("--m", masks.join(","));
      pic.style.setProperty("--f", clamp((p - .72) / .2, 0, 1).toFixed(3));
      pic.style.setProperty("--z", (1.06 - p * .06).toFixed(4));
      const on = L.filter((l, i) => p - .08 - i * .075 > .02).length; cnt.textContent = on;
      const m = Math.round(17 * 60 + 41 + p * 34); clock.textContent = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
      const ci = p < .3 ? 0 : p < .72 ? 1 : 2; caps.forEach((c, k) => c.style.opacity = k === ci ? 1 : 0);
    });
  });

  /* hotspots */
  $$(".hot").forEach(h => {
    const pts = $$(".hp", h), rows = $$(".hlist button", h), v = $(".hot-v", h);
    const on = i => { pts.forEach((p, k) => p.classList.toggle("on", k === i)); rows.forEach((r, k) => r.classList.toggle("on", k === i)); v.classList.toggle("lit", i === 1 || i === 2); };
    [...pts, ...rows].forEach(el => el.addEventListener("click", () => on(+el.dataset.i)));
    pts.forEach(p => p.addEventListener("pointerenter", () => on(+p.dataset.i)));
    on(0);
  });

  /* bioscoop-hoofdstukken */
  $$(".cine").forEach(c => {
    const clips = $$(".clip", c), hs = $$(".chap .t h2", c), ps = JSON.parse(c.dataset.p), pe = $(".chap p", c), tabs = $$(".tabs div", c), vids = clips.map(x => $("video", x));
    let cur = -1;
    scrubs.push(() => {
      const p = prog(c), n = clips.length, f = p * n, i = clamp(Math.floor(f), 0, n - 1);
      tabs.forEach((t, k) => t.style.setProperty("--p", clamp(f - k, 0, 1).toFixed(3)));
      if (i !== cur) {
        cur = i;
        clips.forEach((x, k) => x.classList.toggle("on", k === i)); hs.forEach((x, k) => x.classList.toggle("on", k === i));
        pe.style.opacity = 0; setTimeout(() => { pe.textContent = ps[i]; pe.style.opacity = 1; }, 250);
        vids.forEach((v, k) => { if (!v) return; if (k === i) { v.play().catch(() => {}); } else v.pause(); });
      }
    });
  });

  /* paginaovergang met lichtveeg */
  const pt = d.createElement("div"); pt.className = "pt"; d.body.append(pt);
  let came = false; try { came = sessionStorage.getItem("sx-pt") === "1"; sessionStorage.removeItem("sx-pt"); } catch (e) {}
  if (came && !reduce) { pt.classList.add("start"); requestAnimationFrame(() => requestAnimationFrame(() => { pt.classList.remove("start"); pt.classList.add("leave"); })); }
  addEventListener("pageshow", e => { if (e.persisted) pt.className = "pt"; });
  d.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a || reduce) return;
    const h = a.getAttribute("href") || ""; if (!h.startsWith("/") || h.startsWith("//") || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (h.split("#")[0] === location.pathname + location.search) return;
    e.preventDefault(); try { sessionStorage.setItem("sx-pt", "1"); } catch (err) {}
    pt.className = "pt"; void pt.offsetWidth; pt.classList.add("cover"); setTimeout(() => location.href = h, 520);
  });

  /* eigen cursor */
  if (!touch && !reduce) {
    const cu = d.createElement("div"); cu.className = "cur"; cu.innerHTML = "<span></span>"; d.body.append(cu);
    let mx = -100, my = -100, cx = -100, cy = -100;
    addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const cl = () => { cx += (mx - cx) * .22; cy += (my - cy) * .22; cu.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(cl); }; cl();
    d.addEventListener("pointerover", e => {
      const t = e.target.closest("[data-cur],a,button,input,textarea,select,.range");
      cu.classList.remove("big", "link"); $("span", cu).textContent = "";
      if (!t) return;
      if (t.dataset.cur) { cu.classList.add("big"); $("span", cu).textContent = t.dataset.cur; } else cu.classList.add("link");
    });
  }

  let ticking = false;
  const run = () => { scrubs.forEach(f => f()); ticking = false; };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  addEventListener("resize", run); run();

  /* video's alleen afspelen als ze in beeld zijn */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target; if (e.isIntersecting) { v.play().catch(() => {}); } else v.pause();
  }), { threshold: .15 });
  $$("video[data-auto]").forEach(v => { v.muted = true; v.playsInline = true; vio.observe(v); });

  /* film-hover preview + lightbox */
  const lb = $("div.lb");
  const openLB = (html) => { if (!lb) return; $(".lb-in", lb).innerHTML = html; lb.classList.add("on"); lenis && lenis.stop(); };
  const closeLB = () => { if (!lb) return; lb.classList.remove("on"); $(".lb-in", lb).innerHTML = ""; lenis && lenis.start(); };
  lb && $(".x", lb).addEventListener("click", closeLB);
  lb && lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
  addEventListener("keydown", e => { if (e.key === "Escape") closeLB(); });
  $$(".film").forEach(f => {
    const v = $("video", f);
    if (v && !touch) { f.addEventListener("pointerenter", () => { v.currentTime = 8; v.play().catch(() => {}); }); f.addEventListener("pointerleave", () => v.pause()); }
    f.addEventListener("click", () => openLB(`<video src="${f.dataset.src}" controls autoplay playsinline></video>`));
  });

  // fotogalerij-lightbox
  $$("[data-gal]").forEach(g => {
    const items = $$("button[data-full]", g); let i = 0;
    const show = () => { openLB(`<img src="${items[i].dataset.full}" alt=""><button class="pv" aria-label="Vorige">‹</button><button class="nx" aria-label="Volgende">›</button><div class="ct">${i + 1} / ${items.length}</div>`);
      $(".lb .pv").onclick = e => { e.stopPropagation(); i = (i - 1 + items.length) % items.length; show(); };
      $(".lb .nx").onclick = e => { e.stopPropagation(); i = (i + 1) % items.length; show(); }; };
    items.forEach((b, k) => b.addEventListener("click", () => { i = k; show(); }));
  });

  /* productgalerij */
  $$(".gal").forEach(g => {
    const main = $(".gal-main img", g), th = $$(".gal-th button", g);
    th.forEach(b => b.addEventListener("click", () => {
      th.forEach(x => x.classList.remove("on")); b.classList.add("on");
      main.style.opacity = 0; setTimeout(() => { main.src = b.dataset.full; main.classList.toggle("ph0", b.dataset.cat === "1"); main.style.opacity = 1; }, 180);
    }));
    const box = $(".gal-main", g);
    if (!touch) {
      box.addEventListener("pointermove", e => { const r = box.getBoundingClientRect(); main.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; main.style.transform = "scale(1.7)"; });
      box.addEventListener("pointerleave", () => main.style.transform = "");
    }
  });
  $$(".vars button").forEach(b => b.addEventListener("click", () => openLB(`<img src="${b.dataset.full}" alt="">`)));

  /* kelvin-schuif */
  $$(".kel").forEach(k => {
    const r = $(".range", k), v = $(".kel-v", k), out = $(".read b", k), info = $(".kinfo", k);
    const data = JSON.parse(k.dataset.info || "[]");
    const col = K => { // benadering kleur van een zwarte straler
      const t = K / 100; let R, G, B;
      R = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332);
      G = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * Math.pow(t - 60, -0.0755);
      B = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
      return `rgb(${clamp(R, 0, 255) | 0},${clamp(G, 0, 255) | 0},${clamp(B, 0, 255) | 0})`;
    };
    const upd = () => {
      const K = +r.value; v.style.setProperty("--kc", col(K)); out.textContent = K;
      $(".tint", v).style.opacity = K > 3400 ? .32 : .5;
      const it = data.reduce((a, b) => Math.abs(b.k - K) < Math.abs(a.k - K) ? b : a, data[0]);
      if (it && info.dataset.k != it.k) { info.dataset.k = it.k; info.innerHTML = `<b>${it.t}</b><span class="muted">${it.b}</span>`; }
    };
    r.addEventListener("input", upd); upd();
  });

  /* configurator: mast + top + armatuur */
  $$(".cfg").forEach(c => {
    const sets = JSON.parse(c.dataset.sets), idx = [0, 0, 0], L = c.dataset.lang;
    const cards = $$(".cfg-c", c), sum = $(".cfg-sum b", c), btn = $(".cfg-sum a", c);
    const paint = (k, anim) => {
      const it = sets[k][idx[k]], card = cards[k], im = $("img", card);
      const set = () => { im.src = it.img; im.alt = it.name; $(".nm", card).textContent = it.name; $(".cnt", card).textContent = (idx[k] + 1) + " / " + sets[k].length; im.classList.remove("sw"); };
      if (anim) { im.classList.add("sw"); setTimeout(set, 200); } else set();
      const names = idx.map((i, n) => sets[n][i].name);
      sum.textContent = names.join("  +  ");
      btn.href = btn.dataset.base + "?onderwerp=" + encodeURIComponent((L === "en" ? "Lighting point: " : "Lichtpunt: ") + names.join(" + "));
    };
    cards.forEach((card, k) => {
      $$("button", card).forEach(b => b.addEventListener("click", () => { idx[k] = (idx[k] + (+b.dataset.dir) + sets[k].length) % sets[k].length; paint(k, true); }));
      paint(k, false);
    });
    $(".cfg-rand", c)?.addEventListener("click", () => { [0, 1, 2].forEach(k => { idx[k] = Math.floor(Math.random() * sets[k].length); paint(k, true); }); });
  });

  /* sterrenbeeldkaart */
  $$(".map").forEach(m => {
    const stars = $$(".st", m), links = $$(".plist a", m);
    const on = s => { stars.forEach(x => x.classList.toggle("on", x.dataset.s === s)); links.forEach(x => x.classList.toggle("on", x.dataset.s === s)); };
    [...stars, ...links].forEach(el => el.addEventListener("pointerenter", () => on(el.dataset.s)));
    stars.forEach(s => s.addEventListener("click", () => { const a = links.find(l => l.dataset.s === s.dataset.s); if (a) location.href = a.href; }));
    const path = $(".ln2", m);
    if (path && !reduce) { const L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
      new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { path.style.transition = "stroke-dashoffset 3.5s cubic-bezier(.2,.7,.1,1)"; path.style.strokeDashoffset = 0; o.disconnect(); setTimeout(() => { path.style.strokeDasharray = "4 5"; }, 3600); } }), { threshold: .3 }).observe(m); }
  });

  /* catalogus: merk + groep + subgroep + zoeken */
  $$(".catalog").forEach(cat => {
    const cards = $$(".card", cat), bch = $$(".cat-bar .chip[data-b]", cat), gch = $$(".cat-bar .chip[data-g]", cat), subsBox = $(".subs", cat), q = $(".search input", cat), empty = $(".empty", cat);
    const P = new URLSearchParams(location.search);
    let b = P.get("merk") || "all", g = P.get("groep") || "all", sub = P.get("sub") || "all";
    const renderSubs = () => {
      if (!subsBox) return;
      const pool = cards.filter(c => (b === "all" || c.dataset.b === b) && (g === "all" || c.dataset.g === g));
      const subs = [...new Set(pool.map(c => c.dataset.sub))];
      if (g === "all" || subs.length < 2) { subsBox.innerHTML = ""; return; }
      subsBox.innerHTML = [`<button class="chip${sub === "all" ? " on" : ""}" data-sub="all">${subsBox.dataset.all}</button>`].concat(subs.map(s2 => `<button class="chip${sub === s2 ? " on" : ""}" data-sub="${s2}">${pool.find(c => c.dataset.sub === s2).dataset.subl}</button>`)).join("");
      $$(".chip", subsBox).forEach(x => x.addEventListener("click", () => { sub = x.dataset.sub; renderSubs(); apply(); }));
    };
    const apply = () => {
      const s2 = (q.value || "").trim().toLowerCase(); let n = 0;
      cards.forEach(c => { const ok = (b === "all" || c.dataset.b === b) && (g === "all" || c.dataset.g === g) && (sub === "all" || c.dataset.sub === sub) && (!s2 || c.dataset.q.includes(s2)); c.style.display = ok ? "" : "none"; if (ok) n++; });
      empty.style.display = n ? "none" : "block";
      bch.forEach(c => c.classList.toggle("on", c.dataset.b === b)); gch.forEach(c => c.classList.toggle("on", c.dataset.g === g));
    };
    bch.forEach(c => c.addEventListener("click", () => { b = c.dataset.b; sub = "all"; renderSubs(); apply(); }));
    gch.forEach(c => c.addEventListener("click", () => { g = c.dataset.g; sub = "all"; renderSubs(); apply(); }));
    q.addEventListener("input", apply);
    renderSubs(); apply();
  });

  /* voor/na-schuif */
  $$(".ba").forEach(b => {
    let drag = false;
    const set = x => { const r = b.getBoundingClientRect(); b.style.setProperty("--p", clamp((x - r.left) / r.width * 100, 0, 100) + "%"); };
    b.addEventListener("pointerdown", e => { drag = true; set(e.clientX); b.setPointerCapture(e.pointerId); });
    b.addEventListener("pointermove", e => { if (drag) set(e.clientX); });
    b.addEventListener("pointerup", () => drag = false);
    let t = 0; const hint = () => { if (drag || t > 1) return; t += 0.01; b.style.setProperty("--p", (50 + Math.sin(t * Math.PI * 2) * 18) + "%"); requestAnimationFrame(hint); };
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { hint(); o.disconnect(); } }), { threshold: .5 }).observe(b);
  });

  /* formulier (FormSubmit) */
  $$("form[data-fs]").forEach(f => {
    const p = new URLSearchParams(location.search), sub = p.get("onderwerp");
    if (sub) { const m = f.querySelector("[name=bericht]"); if (m && !m.value) m.value = sub + "\n\n"; const s = f.querySelector("[name=_subject]"); if (s) s.value += " · " + sub; }
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const b = f.querySelector("button[type=submit]"), lbl = b.innerHTML; b.disabled = true; b.innerHTML = "…";
      try {
        const r = await fetch(f.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), { method: "POST", headers: { Accept: "application/json" }, body: new FormData(f) });
        const j = await r.json();
        if (String(j.success) === "true") { f.style.display = "none"; f.nextElementSibling.classList.add("on"); }
        else throw new Error(j.message || "fout");
      } catch (err) { b.disabled = false; b.innerHTML = lbl; alert(f.dataset.err); }
    });
  });
})();
