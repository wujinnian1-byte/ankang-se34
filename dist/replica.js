/* Local-only form handling. The public reference's backend is never contacted. */
(() => {
  'use strict';
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form[data-replica-form]');
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    let notice = form.querySelector('[data-replica-notice]');
    if (!notice) {
      notice = document.createElement('p');
      notice.dataset.replicaNotice = 'true';
      notice.setAttribute('role', 'status');
      notice.setAttribute('tabindex', '-1');
      form.append(notice);
    }
    notice.textContent = '信息格式已检查。当前为作品展示页，暂未连接消息发送服务，内容未发送。';
    notice.focus({ preventScroll: true });
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.nav-logo-link, a.w-nav-brand').forEach(a => a.setAttribute('aria-label', 'Água Serrana — início'));
    document.querySelectorAll('input[type="email"]').forEach(el => el.setAttribute('autocomplete', 'email'));
    document.querySelectorAll('iframe').forEach(el => {
      if (!el.title) el.title = 'Água Serrana — vídeo';
      el.loading = 'lazy';
    });
  });
})();
