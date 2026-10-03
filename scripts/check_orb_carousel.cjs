'use strict';
// Tests the installed webpack carousel module without opening a browser.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const chunk = fs.readFileSync(path.join(root, 'dist/experiences/fizzi/_next/static/chunks/942-919c3dfdb19288ef.js'), 'utf8');
const registrations = [];
vm.runInNewContext(chunk, { self: { webpackChunk_N_E: registrations } });
const modules = Object.assign({}, ...registrations.map(item => item[1]));
const state = [], refs = [];
let stateIndex = 0, refIndex = 0;
const react = {
  useState(initial) {
    const index = stateIndex++;
    if (state[index] === undefined) state[index] = initial;
    return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
  },
  useRef(initial) {
    const index = refIndex++;
    return refs[index] || (refs[index] = { current: initial });
  },
  useEffect() {},
};
const jsx = (type, props, key) => typeof type === 'function' ? type(props) : { type, props: props || {}, key };
const requireMock = id => {
  if (id === 2265) return react;
  if (id === 7437) return { jsx, jsxs: jsx };
  throw new Error(`Carousel unexpectedly depends on module ${id}`);
};
requireMock.r = () => {};
requireMock.d = (exports, getters) => Object.entries(getters).forEach(([key, getter]) => Object.defineProperty(exports, key, { get: getter }));
const exportsObject = {};
modules[91]({}, exportsObject, requireMock);
function render() { stateIndex = 0; refIndex = 0; return all(exportsObject.default({}), el => el.props.id === 'se34-collection')[0]; }
function all(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  const children = node.props?.children;
  return [...(predicate(node) ? [node] : []), ...(Array.isArray(children) ? children : [children]).flatMap(child => all(child, predicate))];
}
const named = (node, label) => all(node, el => el.props['aria-label'] === label)[0];
const byClass = (node, value) => all(node, el => el.props.className?.split(' ').includes(value))[0];
const index = () => render().props['data-orb-index'];
const event = overrides => ({ preventDefault() {}, stopPropagation() {}, ...overrides });
let tree = render();
assert.equal(tree.props.id, 'se34-collection');
assert.equal(index(), 0);
assert.equal(all(tree, el => el.type === 'img')[0].props.src, '../../brand/orbs/orb-silver.png?v=20261003-r4');
assert.equal(all(tree, el => el.type === 'canvas').length, 0);
named(tree, '上一款玻璃珠').props.onClick();
assert.equal(index(), 5, 'Previous from silver wraps to purple');
named(render(), '下一款玻璃珠').props.onClick();
assert.equal(index(), 0);
const sameRenderNext = named(render(), '下一款玻璃珠').props.onClick;
sameRenderNext(); sameRenderNext();
assert.equal(index(), 2, 'Rapid events use current state');
const names = ['能量之灵', '水之灵', '茶之灵', '文化之灵', '山之灵', '隐藏款'];
const colors = ['silver', 'blue', 'amber', 'red', 'green', 'purple'];
const scales = [.95606, .96289, .93777, .93859, .92969, .98129];
for (let i = 0; i < names.length; i++) {
  const swatches = all(render(), el => el.props.className === 'orb-swatch');
  assert.equal(swatches.length, 6);
  swatches[i].props.onClick();
  tree = render();
  assert.equal(index(), i);
  assert.equal(byClass(tree, 'orb-name').props.children, names[i]);
  assert.equal(all(tree, el => el.props.className === 'orb-swatch' && el.props['aria-pressed']).length, 1);
  const productImage = all(tree, el => el.type === 'img' && el.props.alt)[0];
  assert.equal(productImage.props.src, `../../brand/orbs/orb-${colors[i]}.png?v=20261003-r4`);
  assert.equal(productImage.props.style.transform, `scale(${scales[i]})`);
}
render().props.onKeyDown(event({ key: 'Home' }));
assert.equal(index(), 0);
render().props.onKeyDown(event({ key: 'ArrowRight' }));
assert.equal(index(), 1);
render().props.onKeyDown(event({ key: 'ArrowLeft' }));
assert.equal(index(), 0);
render().props.onKeyDown(event({ key: 'End' }));
assert.equal(index(), 5);
function swipe(dx, dy, cancel = false) {
  const stage = byClass(render(), 'orb-stage');
  const base = { isPrimary: true, button: 0, pointerId: 7, currentTarget: { setPointerCapture() {} } };
  stage.props.onPointerDown(event({ ...base, clientX: 100, clientY: 100 }));
  if (cancel) stage.props.onPointerCancel();
  stage.props.onPointerUp(event({ ...base, clientX: 100 + dx, clientY: 100 + dy }));
}
swipe(-100, 10);
assert.equal(index(), 0, 'Left swipe wraps to next');
swipe(100, 10);
assert.equal(index(), 5, 'Right swipe selects previous');
swipe(10, -100);
assert.equal(index(), 5, 'Vertical gesture leaves selection unchanged');
swipe(-100, 0, true);
assert.equal(index(), 5, 'Cancelled gesture leaves selection unchanged');
stateIndex = 0; refIndex = 0;
const collection = exportsObject.default({});
const videoTriggers = all(collection, el => el.props['data-se34-video'] === 'red-orb');
assert.equal(videoTriggers.length, 1, 'Only one orb opens the video');
assert.equal(videoTriggers[0].type, 'button', 'Video orb supports native keyboard activation');
assert.equal(videoTriggers[0].props['aria-label'], '播放赤色玻璃球视频');
assert.equal(videoTriggers[0].props['aria-haspopup'], 'dialog');
const redPosition = byClass(collection, 'blindbox-position-2');
assert.equal(all(redPosition, el => el.props['data-se34-video'] === 'red-orb').length, 1);
assert.equal(all(collection, el => el.props.className === 'blindbox-orb' && el.props.role === 'img').length, 6, 'Other six floating orbs stay images');
const css = fs.readFileSync(path.join(root, 'dist/brand/orb-carousel.css'), 'utf8');
assert.ok(css.includes('prefers-reduced-motion: reduce'));
assert.ok(css.includes('touch-action: pan-y'));
console.log('PASS: installed carousel renders 6 correct assets/names, preserves wrapping and rapid clicks, supports selection keys/swipes, ignores vertical/cancelled gestures, and has reduced-motion styles.');
