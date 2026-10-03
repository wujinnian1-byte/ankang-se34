(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('.chapter')];
  const frames = chapters.map(s => s.querySelector('iframe'));
  const nav = document.querySelector('.brand-navigation');
  const links = [...nav.querySelectorAll('a')];
  const progress = nav.querySelector('.progress span');
  const heights = new Map();
  let active = '', scheduled = false;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  function loadFrame(frame) {
    if (!frame.src && frame.dataset.src) { frame.src = frame.dataset.src; delete frame.dataset.src; }
  }
  function sync() {
    scheduled = false;
    const viewport = frames[0].clientHeight || innerHeight;
    const y = window.scrollY;
    let index = chapters.findIndex(s => y < s.offsetTop + s.offsetHeight - 1);
    if (index < 0) index = chapters.length - 1;
    const chapter = chapters[index], frame = frames[index];
    if (active !== chapter.id) {
      active = chapter.id;
      links.forEach(a => a.dataset.target === active ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
      progress.style.background = ['#1bddc0','#a1d9f0','#ffe543'][index];
      document.querySelector('meta[name="theme-color"]').content = ['#172f70','#203135','#e5e7e9'][index];
    }
    frames.forEach((f,i) => {
      if (i === index || Math.abs(chapters[i].offsetTop - y) < viewport * 3) loadFrame(f);
      if (!f.contentWindow || !f.src) return;
      const innerY = clamp(y - chapters[i].offsetTop, 0, Math.max(0, chapters[i].offsetHeight - viewport));
      f.contentWindow.postMessage({type:'journey:position', y:innerY, active:i===index}, location.origin);
    });
    progress.style.transform = `scaleX(${clamp((y-chapter.offsetTop) / Math.max(1,chapter.offsetHeight-viewport),0,1)})`;
  }
  function requestSync() { if (!scheduled) { scheduled = true; requestAnimationFrame(sync); } }
  window.addEventListener('scroll', requestSync, {passive:true});
  window.addEventListener('resize', requestSync, {passive:true});
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || !event.data || !String(event.data.type).startsWith('journey:')) return;
    const i = frames.findIndex(f => f.contentWindow === event.source);
    if (i < 0) return;
    const chapter = chapters[i], frame = frames[i], d = event.data;
    if (d.type === 'journey:height') {
      const h = Math.max(frame.clientHeight, Math.ceil(d.height));
      if (Number.isFinite(h) && h < 200000 && heights.get(frame) !== h) {
        const before = chapter.offsetHeight;
        const wasAbove = chapter.offsetTop + before <= window.scrollY + 1;
        heights.set(frame,h); chapter.style.height = `${h}px`;
        if (wasAbove) window.scrollBy(0,h-before);
      }
      requestSync();
    } else if (d.type === 'journey:wheel') {
      window.scrollBy({top:d.delta,behavior:'instant'});
    } else if (d.type === 'journey:goto') {
      window.scrollTo({top:chapter.offsetTop + clamp(d.y,0,chapter.offsetHeight-frame.clientHeight), behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    } else if (d.type === 'journey:ready') requestSync();
  });
  links.forEach(a => a.addEventListener('click', event => {
    event.preventDefault();
    const section = document.getElementById(a.dataset.target);
    loadFrame(section.querySelector('iframe'));
    history.replaceState(null,'',a.hash);
    // Instant chapter changes do not animate through thousands of pixels.
    window.scrollTo({top:section.offsetTop,behavior:'instant'});
    requestSync();
  }));
  nav.querySelector('button').addEventListener('click',event=>{
    const collapsed=nav.classList.toggle('is-collapsed');
    event.currentTarget.textContent=collapsed?'+':'−';
    event.currentTarget.setAttribute('aria-expanded',String(!collapsed));
    event.currentTarget.setAttribute('aria-label',collapsed?'展开品牌导航':'收起品牌导航');
  });
  for (const frame of frames) frame.addEventListener('load',requestSync);
  setTimeout(()=>{frames.forEach(loadFrame);requestSync();},1400);
  if (location.hash) setTimeout(()=>links.find(a=>a.hash===location.hash)?.click(),250);
  requestSync();
})();
