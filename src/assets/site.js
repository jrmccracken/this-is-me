(function () {
  const icons = {
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 0H3.55A3.55 3.55 0 0 0 0 3.55v16.9A3.55 3.55 0 0 0 3.55 24h16.9A3.55 3.55 0 0 0 24 20.45V3.55A3.55 3.55 0 0 0 20.45 0ZM7.12 20.45H3.56V9h3.56v11.45ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm15.11 13.02h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.3 0H6.7A6.7 6.7 0 0 0 0 6.7v10.6A6.7 6.7 0 0 0 6.7 24h10.6a6.7 6.7 0 0 0 6.7-6.7V6.7A6.7 6.7 0 0 0 17.3 0Zm4.4 17.3a4.4 4.4 0 0 1-4.4 4.4H6.7a4.4 4.4 0 0 1-4.4-4.4V6.7a4.4 4.4 0 0 1 4.4-4.4h10.6a4.4 4.4 0 0 1 4.4 4.4v10.6ZM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.1a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8Zm6.45-11.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z"/></svg>'
  };
  const social = `<a href="https://www.linkedin.com/in/emma-neville/" target="_blank" rel="noopener" aria-label="Emma Neville on LinkedIn">${icons.linkedin}</a><a href="https://www.instagram.com/emmanevillethisisme/" target="_blank" rel="noopener" aria-label="Instagram">${icons.instagram}</a>`;
  const links = [
    ['/', 'Home'],
    ['/work-with-emma.html', 'Work with Emma'],
    ['/hub.html', 'This is Me Hub'],
    ['/charity.html', 'Charity'],
    ['/contact.html', 'Contact']
  ];
  const here = location.pathname.replace(/index\.html$/, '');
  const nav = links.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ''}>${label}</a>`).join('');

  const header = `<div class="topbar" aria-hidden="true"></div>
  <header class="site-header">
    <a class="brand" href="/" aria-label="This is Me by Emma Neville – home"><img src="/assets/img/logo.png" alt="" width="600" height="531"></a>
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span></span></button>
    <nav class="nav-links" id="primary-nav" aria-label="Main">${nav}</nav>
    <div class="social">${social}</div>
  </header>`;

  const footer = `<footer class="site-footer">
    <img class="footer-flower" src="/assets/img/footer-flower.webp" alt="" aria-hidden="true" width="2600" height="1218">
    <nav class="footer-links" aria-label="Footer">${nav}</nav>
    <img class="footer-mark" src="/assets/img/brand-mark.webp" alt="This is Me by Emma Neville">
    <div class="footer-meta">
      <div class="footer-social">${social}</div>
      <p class="copyright">©This is Me 2026 All rights reserved. <a href="/privacy.html">Privacy Policy</a></p>
      <a class="footer-credit" href="https://uther.studio" target="_blank" rel="noopener"><span>Designed by</span><img src="/assets/img/uther-studio.png" alt="uther studio" width="600" height="201"></a>
    </div>
  </footer>`;

  const h = document.querySelector('[data-header]');
  const f = document.querySelector('[data-footer]');
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-links');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Accordions: one panel open at a time within each group
  document.querySelectorAll('[data-accordion]').forEach((group) => {
    const items = [...group.querySelectorAll('details')];
    items.forEach((d) => d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
    }));
  });

  // Horizontal carousels (testimonials) – arrows scroll by one card
  document.querySelectorAll('[data-carousel]').forEach((wrap) => {
    const track = wrap.querySelector('[data-track]');
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + parseFloat(getComputedStyle(track).columnGap || 0);
    wrap.querySelector('[data-prev]')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    wrap.querySelector('[data-next]')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    // Dots + gentle auto-advance when the cards don't all fit on screen (phones)
    const cards = [...track.children];
    const dotsWrap = wrap.querySelector('[data-dots]');
    const dots = cards.map((c, i) => {
      if (!dotsWrap) return null;
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      d.addEventListener('click', () => { goTo(i); pause(); });
      dotsWrap.appendChild(d);
      return d;
    });
    const scrollable = () => track.scrollWidth > track.clientWidth + 4;
    const currentIndex = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, dist = Infinity;
      cards.forEach((c, i) => { const m = c.offsetLeft + c.offsetWidth / 2; const dd = Math.abs(m - mid); if (dd < dist) { dist = dd; best = i; } });
      return best;
    };
    const goTo = (i) => {
      const c = cards[(i + cards.length) % cards.length];
      track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
    };
    const mark = () => { const k = currentIndex(); dots.forEach((d, i) => d && d.setAttribute('aria-current', i === k ? 'true' : 'false')); };
    track.addEventListener('scroll', () => { clearTimeout(track._t); track._t = setTimeout(mark, 80); }, { passive: true });
    let resumeAt = 0;
    const pause = () => { resumeAt = Date.now() + 12000; };
    ['touchstart', 'pointerdown', 'wheel'].forEach((ev) => track.addEventListener(ev, pause, { passive: true }));
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) setInterval(() => {
      if (!scrollable() || Date.now() < resumeAt || document.hidden) return;
      const r = track.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      goTo(currentIndex() + 1);
    }, 6000);
    mark();
  });

  // Case studies – choose which study is in front and show its write-up
  // Case studies gallery – active card in the centre, neighbours either side
  document.querySelectorAll('[data-cases]').forEach((root) => {
    const cards = [...root.querySelectorAll('.case-card')];
    const details = [...document.querySelectorAll('.case-detail')];
    const dotsWrap = root.querySelector('.case-dots');
    const n = cards.length;
    let current = Math.max(0, cards.findIndex((c) => c.classList.contains('active')));
    const dots = cards.map((c, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Show ' + c.querySelector('h3').textContent.trim());
      d.addEventListener('click', () => go(i));
      dotsWrap && dotsWrap.appendChild(d);
      return d;
    });
    function go(i) {
      current = (i + n) % n;
      cards.forEach((c, k) => {
        let pos = k - current;
        if (pos > n / 2) pos -= n;
        if (pos < -n / 2) pos += n;
        c.dataset.pos = String(Math.max(-2, Math.min(2, pos)));
        c.classList.toggle('active', pos === 0);
        c.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
      });
      dots.forEach((d, k) => d.setAttribute('aria-current', k === current ? 'true' : 'false'));
      const id = cards[current].dataset.case;
      details.forEach((d) => { d.hidden = d.id !== id; });
    }
    cards.forEach((c, k) => c.addEventListener('click', (e) => {
      if (k !== current) { e.preventDefault(); go(k); }
      else if (e.target.closest('a')) {
        e.preventDefault();
        document.getElementById(c.dataset.case)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }));
    root.querySelector('.case-nav.prev')?.addEventListener('click', () => go(current - 1));
    root.querySelector('.case-nav.next')?.addEventListener('click', () => go(current + 1));
    // Swipe on touch screens
    let x0 = null;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
    });
    go(current);
  });

  // Logo strip: repeat the logos so the strip scrolls continuously
  document.querySelectorAll('[data-marquee]').forEach((list) => {
    [...list.children].forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      list.appendChild(copy);
    });
    // Keep a steady, gentle speed whatever the screen size (pixels per second)
    const start = () => {
      const half = list.scrollWidth / 2;
      const speed = window.innerWidth < 700 ? 50 : 80;
      list.style.animationDuration = Math.max(20, half / speed) + 's';
      list.classList.add('is-moving');
    };
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
  });

  // Gentle reveal on scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }
})();

// Home video banner: pause button, and respect "reduce motion"
(function(){
  var v=document.querySelector('.hero-video video'), b=document.querySelector('[data-video-toggle]');
  if(!v||!b) return;
  function set(paused){ b.classList.toggle('is-paused',paused); b.setAttribute('aria-label',paused?'Play video':'Pause video'); }
  v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
  var userPaused = false;
  function tryPlay(){ if(userPaused) return; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
  tryPlay();
  v.addEventListener('canplay', tryPlay, { once:true });
  // Some browsers (e.g. battery-saver modes) hold autoplay until the visitor interacts
  ['scroll','touchstart','pointerdown','keydown'].forEach(function(ev){ window.addEventListener(ev, function once(){ if(v.paused) tryPlay(); window.removeEventListener(ev, once); }, { passive:true }); });
  b.addEventListener('click',function(){ if(v.paused){ userPaused=false; v.play(); set(false);} else { userPaused=true; v.pause(); set(true);} });
  v.addEventListener('pause',function(){ set(true); }); v.addEventListener('play',function(){ set(false); });
})();

// Live Instagram feed (Behold). Paste the feed ID from Behold between the quotes.
// While it's empty, the community sections show the fixed photo strip instead.
(function(){
  var BEHOLD_FEED_ID = "";
  if (!BEHOLD_FEED_ID) return;
  var galleries = document.querySelectorAll('.community .gallery');
  if (!galleries.length) return;
  var s = document.createElement('script');
  s.type = 'module'; s.src = 'https://w.behold.so/widget.js';
  document.head.appendChild(s);
  galleries.forEach(function(g){
    var wrap = document.createElement('div');
    wrap.className = 'ig-feed';
    var w = document.createElement('behold-widget');
    w.setAttribute('feed-id', BEHOLD_FEED_ID);
    wrap.appendChild(w);
    g.replaceWith(wrap);
  });
})();
