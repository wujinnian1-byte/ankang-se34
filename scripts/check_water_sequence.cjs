#!/usr/bin/env node
'use strict';

// Execute the installed webpack modules in dependency-free VM fixtures.
// Browser layout, GSAP interpolation and visual quality remain browser QA work.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const chunkPath = 'dist/experiences/baikal/_next/static/chunks/539-56c7674de5e8a087.js';
const chunk = read(chunkPath);
const source = read('design-source/water-sequence-module.js');
const html = read('dist/experiences/baikal/index.html');
const css = read('dist/brand/water-entry.css');
const registrations = [];
vm.runInNewContext(chunk, {self:{webpackChunk_N_E:registrations}}, {filename:chunkPath});
const modules = Object.assign({}, ...registrations.map(entry => entry[1]));
let checks = 0;
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} != ${expected}`);
const value = input => typeof input === 'function' ? input() : input;

function descendants(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  const children = node.props?.children;
  return [...(predicate(node) ? [node] : []),
    ...(Array.isArray(children) ? children : [children]).flatMap(child => descendants(child, predicate))];
}
const byClass = (tree, name) => descendants(tree, node => (node.props?.className || '').split(/\s+/).includes(name));

function jpegSize(buffer) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8, 'frame is a JPEG');
  let offset = 2;
  while (offset < buffer.length) {
    assert.equal(buffer[offset++], 0xff);
    while (buffer[offset] === 0xff) offset++;
    const marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {height:buffer.readUInt16BE(offset + 3), width:buffer.readUInt16BE(offset + 5)};
    }
    offset += length;
  }
  throw new Error('JPEG has no supported size marker');
}
const imageSizes = Object.fromEntries(['frames', 'frames-mobile'].map(folder => [folder,
  jpegSize(fs.readFileSync(path.join(root, 'dist/brand/water-entry', folder, 'se34-0000.jpg')))]));

function fixture(moduleId, width, height, {safari = true, complete = true, initialScroll = 0} = {}) {
  const effects = [], gsapEffects = [], cleanups = [], timelines = [], images = [], drawing = [], sets = [], atomWrites = [], media = [];
  const listeners = new Map();
  const canvasContext = {
    fillStyle:'',
    fillRect(...args) { drawing.push({method:'fillRect', args, fillStyle:this.fillStyle}); },
    drawImage(...args) { drawing.push({method:'drawImage', args}); },
  };
  const window = {innerWidth:width, innerHeight:height, scrollY:initialScroll,
    addEventListener(type, callback) { listeners.set(type, callback); },
    removeEventListener(type, callback) { if (listeners.get(type) === callback) listeners.delete(type); }};
  const jsx = (type, props = {}) => {
    const node = {type, props, style:{zIndex:''}, getContext:() => canvasContext};
    if (props.ref) props.ref.current = node;
    return node;
  };
  const react = {
    useRef:current => ({current}), useMemo:callback => callback(), useCallback:callback => callback,
    useEffect:callback => effects.push(callback), createElement:(type, props) => jsx(type, props),
    memo:callback => callback, useState:initial => [typeof initial === 'boolean' ? safari : initial, () => {}],
  };
  const matches = query => query === 'all' || (query.includes('min-width') ? window.innerWidth >= 1280 : window.innerWidth <= 1279);
  const gsap = {
    registerPlugin() {},
    set(target, vars) { sets.push({target, vars}); },
    matchMedia() {
      const instance = {add(query, callback) {
        media.push(query);
        if (matches(query)) { const cleanup = callback(); if (typeof cleanup === 'function') cleanups.push(cleanup); }
        return this;
      }, revert() {}};
      return instance;
    },
    timeline(options = {}) {
      const timeline = {options, steps:[], killed:false,
        set(target, vars, position) { this.steps.push({method:'set', target, vars, position}); return this; },
        to(target, vars, position) { this.steps.push({method:'to', target, vars, position}); return this; },
        fromTo(target, from, vars, position) { this.steps.push({method:'fromTo', target, from, vars, position}); return this; },
        kill() { this.killed = true; }};
      if (options.scrollTrigger) {
        timeline.scrollTrigger = {...options.scrollTrigger, start:1000, end:5000, scroll:() => window.scrollY};
      }
      timelines.push(timeline); return timeline;
    },
  };
  const styles = new Proxy({}, {get:(target, name) => String(name)});
  const dependencies = {
    5155:{jsx, jsxs:jsx}, 2115:react,
    2262:styles, 5276:styles, 116:styles, 1306:styles, 8840:styles, 6767:styles, 4149:styles,
    1661:{Ae:(...values) => values.filter(Boolean).join(' '), nr:() => safari},
    3850:{A() {}}, 1060:{A() {}}, 1222:{V() {}}, 5545:{A() {}}, 3001:{A() {}},
    9676:{L:callback => gsapEffects.push(callback)}, 802:{os:gsap, Ay:gsap},
    192:{H:() => { throw new Error('Canvas must not use the delayed responsive hook'); },
      f:({up}) => window.innerWidth >= up},
    9166:{fi:{xl:1280, md:768}, Yv:{TITLE_DURATION:1}},
    3353:{Xr:atom => input => atomWrites.push({atom, value:input}), md:() => ({hasEnded:true, isEndedProgressAnim:true})},
    5710:{HP:'HP', NY:'NY'}, 2618:{A:'progress'}, 4927:{yX:'yX'},
    7753:{A:'intro'}, 410:{A:'page'}, 5228:{A() {}}, 1470:{M:{create() {}}}, 9088:{u:{refresh() {}}},
  };
  const requireMock = id => {
    assert.ok(Object.hasOwn(dependencies, id), `unexpected module dependency ${id}`);
    return dependencies[id];
  };
  requireMock.n = input => () => input;
  requireMock.d = (exports, getters) => Object.entries(getters).forEach(([name, getter]) =>
    Object.defineProperty(exports, name, {get:getter}));
  class Image {
    constructor() { this.complete = complete; this.events = new Map(); images.push(this); }
    set src(url) {
      this.url = url;
      const size = imageSizes[url.includes('/frames-mobile/') ? 'frames-mobile' : 'frames'];
      this.width = this.naturalWidth = size.width;
      this.height = this.naturalHeight = size.height;
    }
    get src() { return this.url; }
    addEventListener(type, callback, options = {}) {
      if (!this.events.has(type)) this.events.set(type, []);
      this.events.get(type).push({callback, once:options.once});
    }
    emit(type) {
      for (const entry of [...(this.events.get(type) || [])]) {
        if (entry.once) this.events.set(type, this.events.get(type).filter(item => item !== entry));
        entry.callback();
      }
    }
  }
  const exports = {};
  vm.runInNewContext(`(${modules[moduleId].toString()})`, {window, Image, setTimeout, clearTimeout})({}, exports, requireMock);
  const tree = exports.default(moduleId === 9814 ? {content:[], mobileBg:{src:'retired.jpg'}} : {video:{}, title:'Brand', text:'Lead', subtitle:'Water'});
  for (const callback of [...effects, ...gsapEffects]) {
    const cleanup = callback(); if (typeof cleanup === 'function') cleanups.push(cleanup);
  }
  return {tree, window, listeners, timelines, images, drawing, sets, atomWrites, media,
    cleanup() { cleanups.reverse().forEach(callback => callback()); }};
}

function cssRules(text) {
  const stack = [], rules = [];
  for (const match of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/[^{}]*[{}]/g)) {
    const token = match[0];
    if (token.endsWith('{')) stack.push(token.slice(0, -1).trim());
    else {
      const selector = stack.pop();
      if (selector && !selector.startsWith('@')) rules.push({selector, body:token.slice(0, -1), media:stack.join(' ')});
    }
  }
  return rules;
}
function parseHtml(text) {
  const tree = {type:'document', props:{children:[]}}, stack = [tree];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const match of text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').matchAll(/<(\/?)([a-z][\w:-]*)\b([^>]*?)>/gi)) {
    const [, closing, rawTag, body] = match, tag = rawTag.toLowerCase();
    if (closing) { if (stack.at(-1).type === tag) stack.pop(); continue; }
    const props = {children:[]};
    for (const attr of body.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) props[attr[1] === 'class' ? 'className' : attr[1]] = attr[2] ?? attr[3] ?? attr[4] ?? '';
    const node = {type:tag, props}; stack.at(-1).props.children.push(node);
    if (!voidTags.has(tag) && !body.endsWith('/')) stack.push(node);
  }
  return tree;
}
async function test(name, callback) { await callback(); console.log(`PASS ${name}`); checks++; }

async function main() {
  await test('readable 9814 exactly matches installed module; desktop and mobile each have 171 valid frames', () => {
    assert.equal(modules[9814].toString(), vm.runInNewContext(`${source}\nWATER_SEQUENCE_MODULE;`).toString());
    assert.equal(modules[9814].toString().includes('BAIAKL_Bubbles'), false);
    for (const folder of ['frames', 'frames-mobile']) {
      const directory = path.join(root, 'dist/brand/water-entry', folder);
      const files = fs.readdirSync(directory).filter(name => /^se34-\d{4}\.jpg$/.test(name));
      assert.equal(files.length, 171);
      for (let index = 0; index < 171; index++) {
        const file = path.join(directory, `se34-${String(index).padStart(4, '0')}.jpg`);
        assert.ok(fs.statSync(file).isFile());
        assert.deepEqual(jpegSize(fs.readFileSync(file)), imageSizes[folder], 'consistent frame dimensions');
      }
    }
  });

  for (const [width, height] of [[375, 844], [768, 1024], [1279, 720], [1280, 1000], [1470, 720]]) {
    await test(`${width}x${height}: stable canvas, correct 171-frame source and uninterrupted black/fade/motion/hold/fade timeline`, () => {
      const f = fixture(9814, width, height);
      const canvases = descendants(f.tree, node => node.type === 'canvas');
      assert.equal(canvases.length, 1);
      assert.equal(descendants(f.tree, node => ['video', 'button', 'picture'].includes(node.type)).length, 0);
      assert.equal(byClass(f.tree, 'rootMobileBg').length, 0);
      assert.equal(canvases[0].props.role, 'img');
      assert.ok(canvases[0].props['aria-label']);
      assert.equal(canvases[0].width, width); assert.equal(canvases[0].height, height);
      assert.equal(f.images.length, 171);
      f.images.forEach((image, index) => assert.equal(image.src,
        `/brand/water-entry/${width < 1280 ? 'frames-mobile' : 'frames'}/se34-${String(index).padStart(4, '0')}.jpg`));
      const playback = f.timelines.filter(timeline => timeline.steps.some(step => Object.hasOwn(step.vars, 'current')));
      assert.equal(playback.length, 1);
      const timeline = playback[0], trigger = timeline.options.scrollTrigger;
      assert.equal(trigger.start, 'top top'); assert.equal(trigger.end, 'bottom bottom'); assert.equal(trigger.scrub, 0.45);
      assert.equal(trigger.invalidateOnRefresh, true); assert.equal(trigger.immediateRender, false);
      assert.equal(timeline.steps.length, 4);
      const [initial, fadeIn, motion, fadeOut] = timeline.steps;
      assert.equal(initial.method, 'set'); assert.equal(initial.target, canvases[0]); assert.equal(initial.vars.opacity, 0); assert.equal(initial.position, 0);
      assert.equal(fadeIn.target, canvases[0]); assert.equal(fadeIn.vars.opacity, 1); assert.equal(fadeIn.position, 0.05); assert.equal(fadeIn.vars.duration, 0.08);
      assert.equal(motion.position, 0.10); assert.equal(motion.target.current, 0); assert.equal(value(motion.vars.current), 170);
      assert.equal(motion.vars.duration, 0.77); assert.equal(motion.vars.ease, 'power2.out'); assert.equal(motion.vars.snap, 'current');
      assert.equal(fadeOut.target, canvases[0]); assert.equal(fadeOut.vars.opacity, 0); assert.equal(fadeOut.position, 0.94); assert.equal(fadeOut.vars.duration, 0.06);
      near(motion.position + motion.vars.duration, 0.87, 'last frame reached');
      near(fadeOut.position - motion.position - motion.vars.duration, 0.07, 'last frame hold');
      near(fadeOut.position + fadeOut.vars.duration, 1, 'total timeline duration');
      for (const frame of [0, 170]) {
        motion.target.current = frame; motion.vars.onUpdate();
        const draw = f.drawing.filter(entry => entry.method === 'drawImage').at(-1);
        assert.equal(draw.args.length, 5, 'no source rectangle crop'); assert.equal(draw.args[0], f.images[frame]);
        const [image, x, y, drawnWidth, drawnHeight] = draw.args;
        const scale = width < 1280 ? Math.min(height * 0.94 / image.naturalHeight, width * 0.9 / (image.naturalWidth * 0.24)) : 0.96 * Math.min(width / image.naturalWidth, height / image.naturalHeight);
        near(drawnWidth, image.naturalWidth * scale, 'image width'); near(drawnHeight, image.naturalHeight * scale, 'image height');
        near(x, (width - drawnWidth) / 2, 'horizontal centering'); near(y, (height - drawnHeight) / 2, 'vertical centering');
        if (width >= 1280) {
          assert.ok(x >= width * 0.02 - 1e-8 && y >= height * 0.02 - 1e-8, 'whole image retains at least 2% margins');
          assert.ok(x + drawnWidth <= width * 0.98 + 1e-8 && y + drawnHeight <= height * 0.98 + 1e-8);
        } else {
          assert.ok(drawnHeight <= height * 0.94 + 1e-8, 'full bottle height is protected');
          assert.ok(drawnWidth * 0.24 <= width * 0.9 + 1e-8, 'central bottle band fits 90% viewport width');
        }
        const fill = f.drawing.filter(entry => entry.method === 'fillRect').at(-1);
        assert.equal(fill.fillStyle, '#010101'); assert.deepEqual(fill.args, [0, 0, width, height]);
      }
      f.cleanup(); assert.ok(timeline.killed, 'timeline cleaned up'); assert.equal(f.listeners.has('resize'), false);
    });
  }

  await test('late image loads redraw the current frame only; resize redraws and duplicate frame updates are skipped', () => {
    const f = fixture(9814, 375, 844, {complete:false});
    assert.equal(f.drawing.length, 0);
    const motion = f.timelines.flatMap(timeline => timeline.steps).find(step => Object.hasOwn(step.vars, 'current'));
    motion.target.current = 100; motion.vars.onUpdate(); assert.equal(f.drawing.length, 0);
    f.images[1].complete = true; f.images[1].emit('load'); assert.equal(f.drawing.length, 0);
    f.images[100].complete = true; f.images[100].emit('load');
    assert.equal(f.drawing.at(-1).args[0], f.images[100]);
    const count = f.drawing.length; motion.vars.onUpdate(); assert.equal(f.drawing.length, count);
    f.window.innerWidth = 768; f.window.innerHeight = 1024; f.listeners.get('resize')();
    assert.equal(descendants(f.tree, node => node.type === 'canvas')[0].width, 768);
    assert.equal(f.drawing.at(-1).args[0], f.images[100]); f.cleanup();
  });

  await test('sequence header atom transitions remain desktop-only, with original return and cleanup behavior', () => {
    for (const width of [375, 1279, 1280, 1470]) {
      const f = fixture(9814, width, 900);
      const headers = f.timelines.filter(timeline => timeline.options.scrollTrigger?.onLeave);
      assert.equal(headers.length, width >= 1280 ? 2 : 0);
      for (const [index, timeline] of headers.entries()) {
        const trigger = timeline.options.scrollTrigger;
        assert.equal(trigger.start, 'top top'); assert.equal(trigger.end, index === 0 ? '40% top' : 'bottom top');
        trigger.onLeave(); trigger.onEnterBack();
      }
      assert.deepEqual(f.atomWrites, width >= 1280 ? [{atom:'NY', value:true}, {atom:'NY', value:false}, {atom:'yX', value:true}, {atom:'yX', value:false}] : []);
      f.cleanup(); assert.deepEqual(f.atomWrites.at(-1), {atom:'NY', value:true});
    }
  });

  await test('Lead black overlay is last in sticky wrapper, outside mask, and fades at every width; responsive Safari reset retained', () => {
    for (const width of [375, 768, 1279, 1280, 1470]) {
      const f = fixture(6138, width, 900);
      const wrapper = byClass(f.tree, 'rootWrapper')[0], overlay = byClass(f.tree, 'rootTransition')[0];
      assert.equal(wrapper.props.children.at(-1), overlay);
      assert.equal(byClass(byClass(f.tree, 'rootVideoWrapper')[0], 'rootTransition').length, 0);
      const transition = f.timelines.find(timeline => timeline.options.scrollTrigger?.start === '75% bottom');
      assert.ok(transition); assert.equal(transition.options.scrollTrigger.end, '99% bottom'); assert.equal(transition.options.scrollTrigger.scrub, true);
      assert.equal(transition.steps[0].target, overlay); assert.equal(transition.steps[0].from.opacity, 0); assert.equal(transition.steps[0].vars.opacity, 1);
      assert.ok(f.media.includes('all')); transition.options.scrollTrigger.onEnterBack();
      const mask = f.sets.find(entry => Object.hasOwn(entry.vars, 'maskSize'));
      assert.equal(value(mask.vars.maskSize), width >= 1280 ? '150vw auto' : width >= 768 ? '200vmax 200vmax' : '180vmax 180vmax');
      assert.ok(f.sets.some(entry => entry.target === overlay && entry.vars.opacity === 0));
      f.cleanup(); assert.ok(transition.killed);
    }
    const regular = fixture(6138, 375, 844, {safari:false});
    regular.timelines.find(t => t.options.scrollTrigger?.start === '75% bottom').options.scrollTrigger.onEnterBack();
    assert.ok(regular.sets.some(entry => entry.vars.clipPath === 'inset(0% 0% round 0vh)')); regular.cleanup();
  });

  await test('Lead header timelines retain the two original breakpoint branches and atom policies', () => {
    for (const width of [375, 1279, 1280, 1470]) {
      const f = fixture(6138, width, 900);
      const headers = f.timelines.filter(timeline => timeline.options.scrollTrigger?.end === 'bottom top');
      assert.equal(headers.length, 1);
      const trigger = headers[0].options.scrollTrigger;
      assert.equal(trigger.start, width >= 1280 ? 'top top' : '-10px top'); assert.equal(trigger.scrub, 1);
      trigger.onEnter();
      assert.deepEqual(f.atomWrites, width >= 1280 ? [{atom:'NY', value:false}, {atom:'yX', value:false}] : [{atom:'yX', value:false}]);
      f.atomWrites.length = 0;
      trigger.onUpdate({progress:0.2}); trigger.onUpdate({progress:0.05}); trigger.onUpdate({progress:1});
      assert.deepEqual(f.atomWrites, [{atom:'HP', value:true}, {atom:'HP', value:false}]);
      f.atomWrites.length = 0; trigger.onEnterBack({progress:0.2});
      if (width < 1280) { trigger.onLeave(); trigger.onLeaveBack(); }
      assert.deepEqual(f.atomWrites, width >= 1280 ? [{atom:'HP', value:true}] : [{atom:'yX', value:false}, {atom:'HP', value:true}, {atom:'yX', value:true}, {atom:'yX', value:false}]);
      f.cleanup(); assert.ok(headers[0].killed);
    }
  });

  await test('scene layering hands over exactly at the top, including jumps, reverse, refresh and cleanup', () => {
    for (const width of [400, 1470]) {
      for (const initialScroll of [900, 1000, 1400, 6000]) {
        const f = fixture(9814, width, 720, {initialScroll});
        const timeline = f.timelines.find(item => item.steps.some(step => Object.hasOwn(step.vars, 'current')));
        const callbacks = timeline.options.scrollTrigger, trigger = timeline.scrollTrigger;
        assert.equal(f.tree.style.zIndex, initialScroll >= trigger.start ? '2' : '0', 'initial scroll may already be beyond the entire sequence');
        f.window.scrollY = trigger.start - 1; callbacks.onLeaveBack(trigger);
        assert.equal(f.tree.style.zIndex, '0', 'Lead stays above the incoming lower part of the section');
        f.window.scrollY = trigger.start; callbacks.onEnter(trigger);
        assert.equal(f.tree.style.zIndex, '2', 'handover happens when the sequence fills the viewport');
        f.window.scrollY = trigger.end - 1; callbacks.onEnterBack(trigger);
        assert.equal(f.tree.style.zIndex, '2', 'reverse entry from the following section retains the scene');
        f.window.scrollY = trigger.end + 2000; callbacks.onRefresh(trigger);
        assert.equal(f.tree.style.zIndex, '2', 'a non-active trigger after its end must still be in front');
        f.window.scrollY = 1400; trigger.start = 1500; callbacks.onRefresh(trigger);
        assert.equal(f.tree.style.zIndex, '0', 'refresh uses the recomputed start rather than stale progress');
        trigger.start = 1300; callbacks.onRefresh(trigger);
        assert.equal(f.tree.style.zIndex, '2');
        f.window.scrollY = 0; callbacks.onLeaveBack(trigger);
        assert.equal(f.tree.style.zIndex, '0');
        f.cleanup(); assert.equal(f.tree.style.zIndex, '', 'unmount restores the original inline layer');
      }
    }
  });

  await test('all-width CSS and SSR agree on sticky canvas, full black overlay and retired infographic visibility', () => {
    const rules = cssRules(css);
    const rule = suffix => {
      const matches = rules.filter(entry => entry.selector.endsWith(suffix)); assert.equal(matches.length, 1, suffix);
      assert.equal(matches[0].media, '', 'new scene layout applies at every width'); return matches[0].body;
    };
    assert.match(rule('.Lead_root__N97wS'), /height:\s*300vh/); assert.match(rule('.Lead_root__N97wS'), /margin-bottom:\s*-100vh/);
    assert.match(rule('.Lead_root__N97wS'), /z-index:\s*1\s*;/);
    const overlay = rule('.Lead_rootWrapper__FU8Ms > .Lead_rootTransition__wS_dK');
    for (const pattern of [/inset:\s*0/, /width:\s*100%/, /height:\s*100%/, /z-index:\s*10/, /background:\s*#010101/, /pointer-events:\s*none/]) assert.match(overlay, pattern);
    const section = rule('.SectionSequence_root__oHi4Z'); assert.match(section, /height:\s*420vh/); assert.match(section, /background:\s*#010101/);
    assert.match(section, /z-index:\s*0\s*;/);
    assert.match(read('dist/experiences/baikal/_next/static/css/3d071de425fdb1ff.css'), /\.Header_root__pRNY8\{[^}]*z-index:100;/, 'the original header remains above both scene layers');
    const sticky = rule('.SectionSequence_rootBgWrapper__mw41g');
    for (const pattern of [/display:\s*block/, /position:\s*sticky/, /top:\s*0/, /height:\s*100vh/, /overflow:\s*hidden/]) assert.match(sticky, pattern);
    assert.match(rule('.SectionSequence_rootCanvas__had7n'), /opacity:\s*0/);
    for (const selector of ['.SectionSequence_rootContent__0R_47', '.SectionSequence_rootLine__AcqkT', '.SectionSequence_root__oHi4Z .DepthRange_rootRanges__Vh2Se']) {
      assert.ok(rules.some(entry => entry.selector.includes(selector) && /display:\s*none\s*!important/.test(entry.body)), selector);
    }
    const tree = parseHtml(html), lead = byClass(tree, 'Lead_rootWrapper__FU8Ms')[0];
    assert.equal(lead.props.children.at(-1).props.className, 'Lead_rootTransition__wS_dK');
    assert.equal(byClass(byClass(lead, 'Lead_rootVideoWrapper__olncZ')[0], 'Lead_rootTransition__wS_dK').length, 0);
    const sequence = byClass(tree, 'SectionSequence_root__oHi4Z')[0];
    assert.equal(descendants(sequence, node => node.type === 'canvas').length, 1);
    assert.equal(descendants(sequence, node => ['video', 'button'].includes(node.type)).length, 0);
    assert.equal(byClass(sequence, 'SectionSequence_rootMobileBg__gFMGY').length, 0);
    assert.equal(fs.existsSync(path.join(root, 'dist/brand/water-entry.js')), false);
    assert.equal(html.includes('/brand/water-entry.js'), false); assert.equal(html.includes('data-water-entry'), false);
    const cssVersion = html.match(/\/brand\/water-entry\.css\?v=([^"<>]+)/);
    assert.ok(cssVersion); const chunkVersions = [...html.matchAll(/539-56c7674de5e8a087\.js\?v=([^"<>\\]+)/g)];
    assert.ok(chunkVersions.length >= 1); chunkVersions.forEach(match => assert.equal(match[1], cssVersion[1]));
  });
  console.log(`\n${checks} water sequence checks passed.`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
