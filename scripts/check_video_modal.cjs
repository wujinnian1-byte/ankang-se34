#!/usr/bin/env node
'use strict';

// Execute the production scripts with a small DOM/event harness. Native dialog
// focus trapping, rendering, and actual media decoding still require browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const sources = Object.fromEntries(['video-modal', 'journey', 'bridge'].map(name =>
  [name, fs.readFileSync(path.join(root, 'dist/integration', `${name}.js`), 'utf8')]));
let checks = 0;

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  dispatchEvent(event) {
    event.target ??= this;
    event.currentTarget = this;
    event.preventDefault ??= function () { this.defaultPrevented = true; };
    event.stopImmediatePropagation ??= function () { this.immediateStopped = true; };
    for (const callback of this.listeners.get(event.type) || []) {
      callback.call(this, event);
      if (event.immediateStopped) break;
    }
    return !event.defaultPrevented;
  }
  emit(type, values = {}) {
    const event = {type, ...values};
    this.dispatchEvent(event);
    return event;
  }
}

class Style {
  constructor(changed = () => {}) { this.values = new Map(); this.changed = changed; }
  setProperty(name, value, priority = '') {
    this.values.set(name, [String(value), priority]);
    this.changed(name, String(value));
  }
  getPropertyValue(name) { return this.values.get(name)?.[0] || ''; }
  getPropertyPriority(name) { return this.values.get(name)?.[1] || ''; }
  removeProperty(name) { this.values.delete(name); this.changed(name, ''); }
}

class Element extends Events {
  constructor(tag = 'div') {
    super();
    this.tagName = tag.toUpperCase();
    this.nodeType = 1;
    this.style = new Style();
    this.dataset = {};
    this.attributes = new Map();
    this.children = [];
    this.isConnected = true;
    this.focuses = [];
    this.scrollHeight = this.clientHeight = 100;
    this.scrollTop = 0;
    this.classList = {toggle: () => true};
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); if (name === 'src') this.src = ''; }
  hasAttribute(name) { return this.attributes.has(name); }
  append(element) { this.children.push(element); element.parentElement = this; }
  closest() { return null; }
  focus(options) { this.focuses.push(options); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

function environment() {
  const window = new Events();
  const document = new Events();
  const html = new Element('html'), body = new Element('body'), head = new Element('head');
  html.clientWidth = 1184;
  html.scrollHeight = body.scrollHeight = 6000;
  document.documentElement = html;
  document.body = body;
  document.head = head;
  document.activeElement = body;
  document.querySelector = () => null;
  document.querySelectorAll = () => [];
  document.getElementById = () => null;
  window.document = document;
  window.parent = window;
  window.scrollX = 0;
  window.scrollY = 0;
  const scrolls = [], tasks = [], raf = new Map();
  let nextFrame = 1, now = 0;
  const location = {origin:'https://example.test', pathname:'/experiences/fizzi/', href:'https://example.test/experiences/fizzi/', hash:''};
  const history = {calls:[], replaceState(...args) { this.calls.push(args); }};
  window.scrollTo = (...args) => {
    const [first, second] = args;
    const x = typeof first === 'object' ? first.left ?? window.scrollX : first;
    const y = typeof first === 'object' ? first.top ?? window.scrollY : second;
    window.scrollX = x; window.scrollY = y;
    scrolls.push({kind:'to', x, y});
    window.emit('scroll');
  };
  window.scrollBy = (...args) => {
    const [first, second] = args;
    const x = typeof first === 'object' ? first.left || 0 : first;
    const y = typeof first === 'object' ? first.top || 0 : second;
    window.scrollX += x; window.scrollY += y;
    scrolls.push({kind:'by', x, y});
    window.emit('scroll');
  };
  // A fixed body can reset the viewport offset: expose that regression to sync().
  body.style = new Style((name, value) => {
    if (name === 'position' && value === 'fixed') {
      window.scrollY = 0;
      window.emit('scroll');
    }
  });
  const dialogs = [];
  document.createElement = tag => {
    const element = new Element(tag);
    if (tag === 'dialog') {
      const video = new Element('video'), closeButton = new Element('button'), error = new Element('p');
      error.hidden = true;
      video.pauseCount = video.loadCount = video.playCount = 0;
      video.play = () => { video.playCount++; return Promise.resolve(); };
      video.pause = () => { video.pauseCount++; };
      video.load = () => { video.loadCount++; };
      element.querySelector = selector => selector === 'video' ? video : selector === 'button' ? closeButton : error;
      element.showModal = () => { element.open = true; };
      element.close = () => { element.open = false; tasks.push(() => element.emit('close')); };
      Object.assign(element, {video, closeButton, error});
      dialogs.push(element);
    }
    return element;
  };
  const context = vm.createContext({
    window, document, location, history, URL, console,
    innerWidth:1200, innerHeight:800,
    getComputedStyle: element => ({paddingRight:element.style.getPropertyValue('padding-right') || '0px', overflowY:'visible'}),
    CustomEvent:class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    Event:class { constructor(type) { this.type = type; } },
    ResizeObserver:class { observe() {} },
    performance:{now:() => now},
    matchMedia:() => ({matches:true}),
    requestAnimationFrame:callback => { const id = nextFrame++; raf.set(id, callback); return id; },
    cancelAnimationFrame:id => raf.delete(id),
    setTimeout:() => 0,
    setInterval:() => 0,
  });
  Object.defineProperties(context, {
    parent:{get:() => window.parent},
    scrollY:{get:() => window.scrollY},
    scrollX:{get:() => window.scrollX},
  });
  return {
    window, document, html, body, context, scrolls, dialogs, raf, tasks, location, history,
    tick(ms = 16) { now += ms; },
    frame() {
      const callbacks = [...raf.values()]; raf.clear();
      callbacks.forEach(callback => callback(now));
    },
    flushTasks() { while (tasks.length) tasks.shift()(); },
    run(name) { vm.runInContext(sources[name], context, {filename:`dist/integration/${name}.js`}); },
  };
}

function parentEnvironment() {
  const env = environment();
  const brands = ['serrana', 'baikal', 'fizzi'], initialHeights = [5000, 7000, 6000];
  const frames = brands.map(brand => {
    const frame = new Element('iframe');
    frame.clientHeight = 800;
    frame.dataset.brand = brand;
    frame.src = `/experiences/${brand}/`;
    frame.messages = [];
    frame.contentWindow = {postMessage:(data, origin) => frame.messages.push({data, origin})};
    return frame;
  });
  const chapters = brands.map((brand, index) => {
    const chapter = new Element('section');
    chapter.id = brand;
    chapter.querySelector = () => frames[index];
    Object.defineProperty(chapter, 'offsetHeight', {get:() => parseFloat(chapter.style.height) || initialHeights[index]});
    Object.defineProperty(chapter, 'offsetTop', {get:() => chapters.slice(0, index).reduce((sum, item) => sum + item.offsetHeight, 0)});
    return chapter;
  });
  const links = brands.map(brand => {
    const link = new Element('a'); link.dataset.target = brand; link.hash = `#${brand}`; return link;
  });
  const nav = new Element('nav'), progress = new Element(), toggle = new Element('button'), theme = {};
  nav.querySelectorAll = () => links;
  nav.querySelector = selector => selector === 'button' ? toggle : progress;
  env.document.querySelectorAll = selector => selector === '.chapter' ? chapters : selector === '.chapter iframe' ? frames : [];
  env.document.querySelector = selector => selector === '.brand-navigation' ? nav : selector === 'meta[name="theme-color"]' ? theme : null;
  env.document.getElementById = id => chapters.find(chapter => chapter.id === id);
  env.send = (index, data, origin = env.location.origin, source = frames[index].contentWindow) =>
    env.window.emit('message', {source, origin, data});
  Object.assign(env, {frames, chapters, links});
  return env;
}

function test(name, callback) {
  callback(); checks++;
  console.log(`PASS ${name}`);
}

test('parent freezes position sync, queues heights, blocks movement, restores chapter offset and styles', () => {
  const e = parentEnvironment();
  e.html.style.setProperty('overflow', 'clip', 'important');
  e.html.style.setProperty('scroll-behavior', 'smooth');
  e.body.style.setProperty('position', 'relative');
  e.body.style.setProperty('top', '2px');
  e.body.style.setProperty('padding-right', '5px', 'important');
  e.window.scrollY = 14050;
  e.run('video-modal'); e.run('journey'); e.frame();
  const positionCount = () => e.frames.flatMap(frame => frame.messages).filter(item => item.data.type === 'journey:position').length;
  const beforePositions = positionCount();
  e.send(2, {type:'journey:modal-open', id:'red-orb'}, 'https://wrong.test');
  e.send(2, {type:'journey:modal-open', id:'red-orb'}, e.location.origin, {});
  e.send(0, {type:'journey:modal-open', id:'red-orb'});
  e.send(2, {type:'journey:modal-open', id:'unknown'});
  assert.equal(e.window.SE34VideoModal.isOpen, false);
  e.send(2, {type:'journey:modal-open', id:'red-orb'});
  const dialog = e.dialogs[0];
  assert.equal(dialog.open, true);
  assert.equal(e.window.scrollY, 0, 'harness exposes fixed-body scroll reset');
  assert.equal(e.body.style.getPropertyValue('top'), '-14050px');
  assert.equal(e.body.style.getPropertyValue('padding-right'), '21px');
  assert.equal(dialog.closeButton.focuses[0].preventScroll, true);
  assert.equal(dialog.video.src, '/brand/red-orb-video/se34.mp4');
  assert.equal(dialog.video.poster, '/brand/red-orb-video/poster.jpg');
  assert.equal(dialog.video.playCount, 1);
  e.frame();
  assert.equal(positionCount(), beforePositions, 'no zero-position broadcast while locked');
  for (const frame of e.frames) assert.equal(frame.messages.at(-1).data.open, true);
  e.send(0, {type:'journey:height', height:5300});
  e.send(0, {type:'journey:height', height:5500});
  e.send(1, {type:'journey:height', height:6800});
  e.send(2, {type:'journey:height', height:6500});
  e.send(2, {type:'journey:height', height:Infinity});
  e.send(1, {type:'journey:height', height:200000});
  assert.deepEqual(e.chapters.map(chapter => chapter.offsetHeight), [5000,7000,6000]);
  const beforeScrolls = e.scrolls.length;
  e.send(2, {type:'journey:wheel', delta:1000});
  e.send(2, {type:'journey:goto', y:0});
  e.links[0].emit('click');
  e.window.emit('resize'); e.frame();
  assert.equal(e.scrolls.length, beforeScrolls);
  assert.equal(e.history.calls.length, 0);
  assert.equal(positionCount(), beforePositions);
  dialog.closeButton.emit('click'); e.flushTasks();
  assert.equal(e.window.SE34VideoModal.isOpen, false);
  assert.equal(dialog.open, false);
  assert.equal(dialog.video.pauseCount, 1);
  assert.equal(dialog.video.src, '');
  assert.equal(dialog.video.loadCount, 1, 'queued close event does not clean twice');
  assert.deepEqual(e.chapters.map(chapter => chapter.offsetHeight), [5500,6800,6500]);
  assert.equal(e.window.scrollY, 14350, 'new chapter top + original 2050px internal offset');
  assert.equal(e.body.style.getPropertyValue('position'), 'relative');
  assert.equal(e.body.style.getPropertyValue('top'), '2px');
  assert.equal(e.body.style.getPropertyValue('width'), '');
  assert.equal(e.body.style.getPropertyValue('padding-right'), '5px');
  assert.equal(e.body.style.getPropertyPriority('padding-right'), 'important');
  assert.equal(e.html.style.getPropertyValue('overflow'), 'clip');
  assert.equal(e.html.style.getPropertyPriority('overflow'), 'important');
  assert.equal(e.html.style.getPropertyValue('scroll-behavior'), 'smooth');
  assert.equal(e.frames[2].focuses.at(-1).preventScroll, true);
  assert.equal(e.frames[2].messages.at(-1).data.type, 'journey:modal-closed');
  e.frame();
  assert.equal(e.frames[2].messages.at(-1).data.type, 'journey:position');
  assert.equal(e.frames[2].messages.at(-1).data.y, 2050);
  assert.equal(e.frames[2].messages.at(-1).data.active, true);
  e.send(2, {type:'journey:wheel', delta:40});
  assert.equal(e.window.scrollY, 14390, 'scroll forwarding resumes');
});

test('standalone close, Escape, media error, duplicate open and repeated open are safe', () => {
  const e = environment(), trigger = new Element('button');
  e.window.scrollX = 7; e.window.scrollY = 3200;
  e.run('video-modal');
  e.window.SE34VideoModal.open(trigger);
  e.window.SE34VideoModal.open(trigger);
  const dialog = e.dialogs[0];
  assert.equal(dialog.video.playCount, 1);
  dialog.video.emit('error'); assert.equal(dialog.error.hidden, false);
  const cancel = dialog.emit('cancel');
  assert.equal(cancel.defaultPrevented, true);
  e.flushTasks();
  assert.equal(e.window.scrollX, 7); assert.equal(e.window.scrollY, 3200);
  assert.equal(trigger.focuses.at(-1).preventScroll, true);
  assert.equal(dialog.video.pauseCount, 1);
  e.window.SE34VideoModal.close(); assert.equal(dialog.video.pauseCount, 1);
  e.window.SE34VideoModal.open(trigger);
  assert.equal(dialog.error.hidden, true);
  assert.equal(dialog.video.playCount, 2);
  e.window.SE34VideoModal.close(); e.flushTasks();
  assert.equal(dialog.video.pauseCount, 2);
  assert.equal(dialog.video.loadCount, 2);
});

test('a queued close event cannot close a newly reopened modal', () => {
  const e = environment(), trigger = new Element('button');
  e.window.scrollY = 3200;
  e.run('video-modal');
  e.window.SE34VideoModal.open(trigger);
  const dialog = e.dialogs[0];
  e.window.SE34VideoModal.close();
  e.window.SE34VideoModal.open(trigger);
  e.flushTasks();
  assert.equal(dialog.open, true);
  assert.equal(e.window.SE34VideoModal.isOpen, true, 'stale close event must not clear the new snapshot');
  assert.match(dialog.video.src, /\/se34\.mp4$/);
  assert.equal(dialog.video.pauseCount, 1, 'only the first session was paused');
  e.window.SE34VideoModal.close(); e.flushTasks();
});

test('bridge cancels momentum, rejects spoofed state, suppresses locked input and preserves button Space', () => {
  const e = environment(), messages = [];
  const parent = {postMessage:(data, origin) => messages.push({data, origin})};
  e.window.parent = parent;
  const target = new Element(); target.parentElement = e.body;
  const button = new Element('button');
  button.closest = selector => selector === '[data-se34-video="red-orb"]' ? button : null;
  const message = (data, source = parent, origin = e.location.origin) => e.window.emit('message', {data, source, origin});
  const wheel = () => e.window.emit('wheel', {target, deltaX:0, deltaY:40, deltaMode:0});
  e.run('bridge');
  const space = e.window.emit('keydown', {target:button, key:' '});
  assert.equal(Boolean(space.defaultPrevented), false); assert.equal(messages.length, 0);
  message({type:'journey:modal-state', open:true}, {}, e.location.origin);
  message({type:'journey:modal-state', open:true}, parent, 'https://wrong.test');
  wheel(); assert.equal(messages.at(-1).data.type, 'journey:wheel');
  e.window.emit('touchstart', {target, touches:[{clientX:10,clientY:100}]}); e.tick();
  e.window.emit('touchmove', {target, touches:[{clientX:10,clientY:60}]});
  e.window.emit('touchend'); assert.equal(e.raf.size, 1);
  message({type:'journey:modal-state', open:true});
  assert.equal(e.raf.size, 0, 'pending momentum animation canceled');
  const before = messages.length;
  assert.equal(wheel().defaultPrevented, true);
  assert.equal(e.window.emit('keydown', {target, key:'PageDown'}).defaultPrevented, true);
  assert.equal(e.window.emit('touchmove', {target, touches:[{clientX:10,clientY:20}]}).defaultPrevented, true);
  message({type:'journey:position', y:4000, active:true});
  assert.equal(e.window.scrollY, 0);
  e.window.emit('touchend'); e.frame();
  assert.equal(messages.length, before);
  message({type:'journey:modal-state', open:false});
  e.window.emit('touchend'); assert.equal(e.raf.size, 0, 'no stale fling after unlocking');
  message({type:'journey:position', y:4000, active:true});
  assert.equal(e.window.scrollY, 4000);
  wheel(); assert.equal(messages.length, before + 1);
});

test('embedded trigger uses known parent and restores the original or replacement trigger', () => {
  const e = environment(), messages = [], original = new Element('button'), replacement = new Element('button');
  const selector = '.blindbox-position-2 [data-se34-video="red-orb"]';
  original.closest = value => value === selector ? original : null;
  const parent = {
    SE34VideoModal:{},
    document:{querySelectorAll:() => [{contentWindow:e.window}]},
    postMessage:(data, origin) => messages.push({data, origin}),
  };
  e.window.parent = parent;
  e.document.querySelector = value => value === selector ? replacement : null;
  e.run('video-modal');
  e.document.emit('click', {target:original});
  assert.equal(messages[0].data.type, 'journey:modal-open');
  assert.equal(messages[0].origin, e.location.origin);
  assert.equal(e.dialogs.length, 0, 'child does not create a second dialog');
  const data = {type:'journey:modal-closed', id:'red-orb'};
  e.window.emit('message', {data, source:parent, origin:'https://wrong.test'});
  e.window.emit('message', {data, source:{}, origin:e.location.origin});
  assert.equal(original.focuses.length, 0);
  e.window.emit('message', {data, source:parent, origin:e.location.origin});
  assert.equal(original.focuses.at(-1).preventScroll, true);
  original.isConnected = false;
  e.window.emit('message', {data, source:parent, origin:e.location.origin});
  assert.equal(replacement.focuses.at(-1).preventScroll, true);
});

console.log(`Video modal checks passed: ${checks} scenarios. Native dialog behavior and video rendering need browser QA.`);
