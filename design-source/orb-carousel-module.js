/* SPDX-License-Identifier: Apache-2.0
 * Contains wave paths derived from Prismic course-fizzi-next.
 * Original carousel adapted for the SE-34 glass orb collection, 2026.
 * See licenses/fizzi-Apache-2.0.txt and THIRD_PARTY_NOTICES.md.
 */
/* Readable source for Fizzi's carousel only. Installed by scripts/update_orb_carousel.py. */
const ORB_CAROUSEL_MODULE = function(module, exports, require) {
  require.r(exports);
  require.d(exports, { default: () => OrbCollection });
  const React = require(2265);
  const { jsx, jsxs } = require(7437);
  const orbRoot = '../../brand/orbs/';
  const assetVersion = '20261003-r4';
  const orbImageSrc = orb => `${orbRoot}orb-${orb.id}.png?v=${assetVersion}`;
  const orbs = [
    { id: 'silver', name: '能量之灵', finish: '银色', color: '#667b87', backdrop: '#dbe4e8', scale: .95606 },
    { id: 'blue', name: '水之灵', finish: '蓝色', color: '#17769d', backdrop: '#c1e5ec', scale: .96289 },
    { id: 'amber', name: '茶之灵', finish: '金色', color: '#a76729', backdrop: '#f2dfbb', scale: .93777 },
    { id: 'red', name: '文化之灵', finish: '红色', color: '#a94f5a', backdrop: '#f0d4d9', scale: .93859 },
    { id: 'green', name: '山之灵', finish: '绿色', color: '#427960', backdrop: '#d3e6d4', scale: .92969 },
    { id: 'purple', name: '隐藏款', finish: '紫色', color: '#795d9f', backdrop: '#e1d6ef', scale: .98129 },
  ];
  const outerWave = 'M1133.5 619c-5 76.2-84.8 126.7-113.5 183.3-28.7 56.6-20.8 149-74 195.6-53 46.6-143.6 26.9-203.4 48-59.9 21.2-120.2 93.8-196.5 88.9-76.2-5-126.6-86.2-183.2-113.5-56.6-28.7-149-20.8-195.6-74-46.7-53-26.9-143.6-46.7-203.4-19.8-59.7-93.7-121.5-88.8-196.4 4.8-74.8 84.8-128 113.6-184.6 28.7-56.6 19.4-149 72.5-195.7 53.1-46.7 143.7-26.9 203.4-46.7C481 100.8 543 26.8 619.1 31.8c76.2 5 126.7 84.7 183.3 113.5 56.6 28.7 149 19.4 195.7 72.5 46.6 53.1 26.8 143.7 48 203.5 19.8 59.7 92.3 121.5 87.4 197.7z';
  const innerWave = 'M827.9 672.6c-12.4 34-55.3 46.3-75.9 68.2-20.5 22-29.2 64.9-59.5 79-30.3 14.2-68.8-6.8-98.7-5.1-30 1.6-67 26.6-101 14.2-33.9-12.3-46-55.9-68-75.8-22-20.5-65-29.2-79-59.5-14.1-30.3 6.9-68.8 5.8-98.6-1-29.7-26.4-67.6-14.2-101 12.1-33.3 55.5-46.9 76-68.8 20.6-21.8 28.6-65 59-79.2 30.2-14.1 68.7 6.9 98.4 5.8 29.8-1 67.7-26.4 101.6-14 34 12.3 46.2 55.2 68.1 75.8 21.9 20.5 65 28.6 79.2 58.9 14.1 30.3-6.9 68.8-5.2 98.8 1 29.7 25.7 67.4 13.4 101.3z';

  function OrbCollection() {
    const labels = ['绿境玻璃球', '紫梦玻璃球', '赤色玻璃球', '粉色玻璃球', '水蓝玻璃球', '秋橙玻璃球', '神秘隐藏球'];
    return jsxs('div', { className: 'orb-collection-sections', children: [
      jsx(OrbCarousel, {}),
      jsxs('section', { className: 'blindbox-gallery', 'aria-label': 'SE-34 七款悬浮玻璃球', children: [
        jsxs('div', { className: 'blindbox-heading', children: [
          jsx('p', { children: 'SE–34 BLIND BOX SERIES' }),
          jsx('h2', { children: '一方山水，七重奇遇' }),
          jsx('span', { children: 'SE–34 盲盒系列' }),
        ] }),
        jsx('div', { className: 'blindbox-sky', children: labels.map((label, index) =>
          jsx('div', { className: `blindbox-position blindbox-position-${index}`, children:
            jsx('div', { className: 'blindbox-float', style: { '--delay': `${index * -1.3}s`, '--duration': `${6 + index * .45}s` }, children:
              jsx('div', { className: 'blindbox-orb', role: 'img', 'aria-label': label,
                style: { backgroundPosition: `${(index % 4) * 100 / 3}% ${index < 4 ? 0 : 100}%` } })
            })
          }, label)) }),
        jsx('p', { className: 'blindbox-signature', children: '安康山水 · 硒养万物' }),
      ] }),
    ] });
  }

  function Arrow({ direction, onClick }) {
    return jsx('button', {
      type: 'button', className: 'orb-arrow', onClick,
      'aria-label': direction === -1 ? '上一款玻璃珠' : '下一款玻璃珠',
      children: jsx('svg', {
        viewBox: '0 0 52 52', fill: 'none', 'aria-hidden': true,
        style: { transform: direction === 1 ? 'rotate(180deg)' : undefined },
        children: jsx('path', {
          fill: 'currentColor',
          d: 'M9 25.7c0 1.1.6 2.2 1.1 2.8l18.6 18.6a4.4 4.4 0 006.2 0 4.4 4.4 0 000-6.2L19.7 25.7 35 10.5a4.4 4.4 0 000-6.2 4.4 4.4 0 00-6.2 0l-18 18C9.6 23.4 9 24.6 9 25.7z',
        }),
      }),
    });
  }

  function OrbImage({ orb, outgoing, revision }) {
    return jsx('div', {
      className: outgoing ? 'orb-layer orb-layer-out' : 'orb-layer orb-layer-in',
      'aria-hidden': outgoing || undefined,
      children: jsx('div', {
        className: 'orb-float',
        children: jsx('img', {
          src: orbImageSrc(orb),
          alt: outgoing ? '' : `${orb.name} · ${orb.finish}透明玻璃珠`,
          className: 'orb-product-image', width: 1254, height: 1254,
          style: { transform: `scale(${orb.scale})` },
          draggable: false, decoding: 'async',
        }),
      }),
    }, `${outgoing ? 'out' : 'in'}-${revision}`);
  }

  function OrbCarousel() {
    const [selection, setSelection] = React.useState({ index: 0, previous: null, direction: 1, revision: 0 });
    const gesture = React.useRef(null);
    const lastSwipe = React.useRef(0);
    const orb = orbs[selection.index];

    function select(value, relative = false) {
      setSelection(current => {
        const requested = relative ? current.index + value : value;
        const index = (requested + orbs.length) % orbs.length;
        if (index === current.index) return current;
        return {
          index, previous: current.index,
          direction: relative ? Math.sign(value) : Math.sign(index - current.index),
          revision: current.revision + 1,
        };
      });
    }

    React.useEffect(() => {
      const nearby = [(selection.index + 1) % orbs.length, (selection.index + orbs.length - 1) % orbs.length];
      nearby.forEach(index => { const image = new Image(); image.src = orbImageSrc(orbs[index]); });
    }, [selection.index]);

    function onKeyDown(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const action = {
        ArrowLeft: () => select(-1, true), ArrowRight: () => select(1, true),
        Home: () => select(0), End: () => select(orbs.length - 1),
      }[event.key];
      if (action) { event.preventDefault(); event.stopPropagation(); action(); }
    }

    function pointerDown(event) {
      if (!event.isPrimary || event.button !== 0) return;
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    function pointerUp(event) {
      const start = gesture.current;
      gesture.current = null;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) >= 36 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        event.preventDefault(); event.stopPropagation();
        lastSwipe.current = Date.now();
        select(dx < 0 ? 1 : -1, true);
      }
    }

    return jsxs('section', {
      id: 'se34-collection', className: 'carousel orb-carousel',
      'data-orb-carousel': true, 'data-orb-index': selection.index,
      role: 'region', 'aria-roledescription': '轮播', 'aria-label': '安康硒谷六款玻璃珠',
      tabIndex: 0, onKeyDown,
      style: { '--orb-color': orb.color, '--orb-direction': selection.direction, backgroundColor: orb.backdrop },
      children: [
        jsxs('svg', {
          className: 'orb-waves', viewBox: '0 0 1165 1166', fill: 'none', 'aria-hidden': true,
          children: [jsx('path', { className: 'orb-wave-outer', d: outerWave }), jsx('path', { className: 'orb-wave-inner', d: innerWave })],
        }),
        jsx('h2', { className: 'orb-heading', children: '选择你的硒灵' }),
        jsxs('div', {
          className: 'orb-controls', children: [
            jsx(Arrow, { direction: -1, onClick: () => select(-1, true) }),
            jsxs('div', {
              className: 'orb-stage', 'data-orb-stage': true,
              onPointerDown: pointerDown, onPointerUp: pointerUp,
              onPointerCancel: () => { gesture.current = null; },
              onTouchEnd: event => {
                if (Date.now() - lastSwipe.current < 300) event.stopPropagation();
              },
              children: [
                jsx('div', { className: 'orb-shadow', 'aria-hidden': true }),
                selection.previous === null ? null : jsx(OrbImage, { orb: orbs[selection.previous], outgoing: true, revision: selection.revision }),
                jsx(OrbImage, { orb, outgoing: false, revision: selection.revision }),
              ],
            }),
            jsx(Arrow, { direction: 1, onClick: () => select(1, true) }),
          ],
        }),
        jsxs('div', {
          className: 'orb-caption', children: [
            jsxs('div', {
              role: 'status', 'aria-live': 'polite', 'aria-atomic': true,
              children: [
                jsx('p', { className: 'orb-name', children: orb.name }, selection.revision),
                jsx('p', { className: 'orb-count', children: `${String(selection.index + 1).padStart(2, '0')} / 06` }),
              ],
            }),
            jsx('div', {
              className: 'orb-swatches', role: 'group', 'aria-label': '选择玻璃珠款式',
              children: orbs.map((item, index) => jsx('button', {
                type: 'button', className: 'orb-swatch',
                style: { '--swatch-color': item.color },
                'aria-label': `${item.name}，${item.finish}，第${index + 1}款，共6款`,
                'aria-pressed': selection.index === index,
                onClick: () => select(index),
                children: jsx('span', { 'aria-hidden': true }),
              }, item.id)),
            }),
          ],
        }),
      ],
    });
  }
};
