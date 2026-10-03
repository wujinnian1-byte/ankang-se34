(() => {
  'use strict';
  const VIDEO_URL = '/brand/red-orb-video/se34.mp4';
  const POSTER_URL = '/brand/red-orb-video/poster.jpg';
  const SELECTOR = '.blindbox-position-2 [data-se34-video="red-orb"]';
  let dialog, video, closeButton, errorMessage, snapshot = null, lastTrigger = null;

  function saveStyles(element, names) {
    return names.map(name => [name, element.style.getPropertyValue(name), element.style.getPropertyPriority(name)]);
  }
  function restoreStyles(element, values) {
    values.forEach(([name, value, priority]) => value ? element.style.setProperty(name, value, priority) : element.style.removeProperty(name));
  }
  function notify(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, {detail}));
  }
  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'se34-video-dialog';
    dialog.setAttribute('aria-labelledby', 'se34-video-title');
    dialog.innerHTML = '<div class="se34-video-header"><h2 id="se34-video-title">SE · 34 — 赤色玻璃球</h2><button class="se34-video-close" type="button" aria-label="关闭视频"><span aria-hidden="true">×</span></button></div><video controls playsinline webkit-playsinline preload="metadata" aria-label="赤色玻璃球视频"></video><p class="se34-video-error" role="status" hidden>视频暂时无法加载，请关闭后重试。</p>';
    document.body.append(dialog);
    video = dialog.querySelector('video');
    closeButton = dialog.querySelector('button');
    errorMessage = dialog.querySelector('[role="status"]');
    closeButton.addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => { if (!dialog.open) finishClose(); });
    video.addEventListener('error', () => { if (dialog.open) errorMessage.hidden = false; });
  }
  function open(trigger = document.activeElement) {
    ensureDialog();
    if (snapshot) return;
    const html = document.documentElement, body = document.body;
    snapshot = {
      x: window.scrollX, y: window.scrollY, trigger,
      html: saveStyles(html, ['overflow', 'scroll-behavior']),
      body: saveStyles(body, ['position', 'top', 'left', 'width', 'overflow', 'padding-right']),
    };
    const scrollbar = Math.max(0, innerWidth - html.clientWidth);
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    notify('se34:video-before-open');
    html.style.setProperty('overflow', 'hidden');
    html.style.setProperty('scroll-behavior', 'auto');
    body.style.setProperty('position', 'fixed');
    body.style.setProperty('top', `${-snapshot.y}px`);
    body.style.setProperty('left', `${-snapshot.x}px`);
    body.style.setProperty('width', '100%');
    body.style.setProperty('overflow', 'hidden');
    if (scrollbar) body.style.setProperty('padding-right', `${padding + scrollbar}px`);
    errorMessage.hidden = true;
    video.poster = POSTER_URL;
    video.src = VIDEO_URL;
    dialog.showModal();
    closeButton.focus({preventScroll:true});
    video.play().catch(() => {});
  }
  function close() {
    if (!snapshot) return;
    if (dialog.open) dialog.close();
    finishClose();
  }
  function finishClose() {
    if (!snapshot) return;
    const saved = snapshot;
    snapshot = null;
    video.pause();
    video.removeAttribute('src');
    video.load();
    restoreStyles(document.body, saved.body);
    restoreStyles(document.documentElement, saved.html);
    const position = {x:saved.x, y:saved.y};
    notify('se34:video-restore', position);
    window.scrollTo({left:position.x, top:position.y, behavior:'instant'});
    if (saved.trigger?.isConnected) saved.trigger.focus({preventScroll:true});
    notify('se34:video-closed');
  }
  window.SE34VideoModal = {open, close, get isOpen() { return Boolean(snapshot); }};

  document.addEventListener('click', event => {
    const trigger = event.target.closest?.(SELECTOR);
    if (!trigger) return;
    event.preventDefault();
    lastTrigger = trigger;
    let journeyParent = false;
    try {
      journeyParent = window.parent !== window && parent.SE34VideoModal &&
        [...parent.document.querySelectorAll('.chapter iframe')].some(frame => frame.contentWindow === window);
    } catch (_) { /* An unrelated cross-origin embedding uses this document's dialog. */ }
    if (journeyParent) parent.postMessage({type:'journey:modal-open', id:'red-orb'}, location.origin);
    else open(trigger);
  });
  window.addEventListener('message', event => {
    if (window.parent === window || event.source !== parent || event.origin !== location.origin ||
        event.data?.type !== 'journey:modal-closed' || event.data.id !== 'red-orb') return;
    const trigger = lastTrigger?.isConnected ? lastTrigger : document.querySelector(SELECTOR);
    trigger?.focus({preventScroll:true});
  });
})();
