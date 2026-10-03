(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('.chapter')];
  const frames = chapters.map(s => s.querySelector('iframe'));
  const nav = document.querySelector('.brand-navigation');
  const links = [...nav.querySelectorAll('a')];
  const progress = nav.querySelector('.progress span');
  const heights = new Map();
  const pendingHeights = new Map();
  let modalLocked = false, modalSource = null, modalPosition = null;
  let active = '', scheduled = false;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  function loadFrame(frame) {
    if (!frame.src && frame.dataset.src) { frame.src = frame.dataset.src; delete frame.dataset.src; }
  }
  function sync() {
    scheduled = false;
    if (modalLocked) return;
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
  window.addEventListener('se34:video-before-open', () => {
    modalLocked = true;
    frames.forEach(frame => frame.contentWindow?.postMessage({type:'journey:modal-state',open:true},location.origin));
  });
  window.addEventListener('se34:video-restore', event => {
    pendingHeights.forEach((height, frame) => {
      const i = frames.indexOf(frame);
      heights.set(frame,height);
      chapters[i].style.height = `${height}px`;
    });
    pendingHeights.clear();
    if (modalPosition) {
      const {chapter, offset} = modalPosition;
      event.detail.y = chapter.offsetTop + clamp(offset,0,Math.max(0,chapter.offsetHeight-modalSource.clientHeight));
    }
  });
  window.addEventListener('se34:video-closed', () => {
    modalLocked = false;
    frames.forEach(frame => frame.contentWindow?.postMessage({type:'journey:modal-state',open:false},location.origin));
    modalSource?.contentWindow?.postMessage({type:'journey:modal-closed',id:'red-orb'},location.origin);
    modalSource = modalPosition = null;
    requestSync();
  });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || !event.data || !String(event.data.type).startsWith('journey:')) return;
    const i = frames.findIndex(f => f.contentWindow === event.source);
    if (i < 0) return;
    const chapter = chapters[i], frame = frames[i], d = event.data;
    if (d.type === 'journey:modal-open') {
      if (modalLocked || frame.dataset.brand !== 'fizzi' || d.id !== 'red-orb' || !window.SE34VideoModal) return;
      modalSource = frame;
      modalPosition = {chapter,offset:window.scrollY-chapter.offsetTop};
      window.SE34VideoModal.open(frame);
      return;
    }
    if (d.type === 'journey:height') {
      const h = Math.max(frame.clientHeight, Math.ceil(d.height));
      if (modalLocked) { if(Number.isFinite(h)&&h<200000) pendingHeights.set(frame,h); return; }
      if (Number.isFinite(h) && h < 200000 && heights.get(frame) !== h) {
        const before = chapter.offsetHeight;
        const wasAbove = chapter.offsetTop + before <= window.scrollY + 1;
        heights.set(frame,h); chapter.style.height = `${h}px`;
        if (wasAbove) window.scrollBy(0,h-before);
      }
      requestSync();
    } else if (d.type === 'journey:wheel') {
      if (modalLocked) return;
      window.scrollBy({top:d.delta,behavior:'instant'});
    } else if (d.type === 'journey:goto') {
      if (modalLocked) return;
      window.scrollTo({top:chapter.offsetTop + clamp(d.y,0,chapter.offsetHeight-frame.clientHeight), behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    } else if (d.type === 'journey:ready') requestSync();
  });
  links.forEach(a => a.addEventListener('click', event => {
    event.preventDefault();
    if (modalLocked) return;
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
