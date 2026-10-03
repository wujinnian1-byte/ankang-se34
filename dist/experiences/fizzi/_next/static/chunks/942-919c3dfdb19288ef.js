"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[942],{7867:function(e,t,r){r.d(t,{g:function(){return a}});var n=r(7437),o=r(4839);let a=e=>{let{as:t="section",className:r,children:a,...i}=e;return(0,n.jsx)(t,{className:(0,o.Z)("px-4 first:pt-10 md:px-6",r),...i,children:(0,n.jsx)("div",{className:"mx-auto flex w-full max-w-7xl flex-col items-center",children:a})})}},490:function(e,t,r){r.d(t,{J:function(){return x}});var n=r(7437),o=r(2265),a=r(789),i=r(1143),s=r(854),l=r(7776);i.L.preload("/experiences/fizzi/se34/SE34-bottle.gltf");let c={lemonLime:"/experiences/fizzi/label-lemon-lime.png",grape:"/experiences/fizzi/label-grape.png",blackCherry:"/experiences/fizzi/label-black-cherry.png",strawberryLemonade:"/experiences/fizzi/label-strawberry-lemonade.png",watermelon:"/experiences/fizzi/label-watermelon.png"},d=new l.MeshStandardMaterial({roughness:.3,metalness:1,color:"#bbbbbb"});function u(e) {
  const { flavor = 'blackCherry', scale = 2, ...props } = e;
  const tones = {
    blackCherry:'#819d96', lemonLime:'#769bab', grape:'#a29778',
    strawberryLemonade:'#8d9ba9', watermelon:'#aa8f96', pure:'#8b9ea9'
  };
  const { nodes } = (0, i.L)('/experiences/fizzi/se34/SE34-bottle.gltf');
  const maps = (0, s.mE)({
    badge: '/experiences/fizzi/se34/badge-se34.svg',
    wordmark: '/experiences/fizzi/se34/wordmark-se34.svg'
  });
  maps.badge.colorSpace = l.SRGBColorSpace;
  maps.wordmark.colorSpace = l.SRGBColorSpace;
  maps.badge.flipY = true;
  maps.wordmark.flipY = true;
  maps.badge.anisotropy = maps.wordmark.anisotropy = 8;
  // Scene transmission can only sample WebGL content, not the HTML behind the
  // transparent Canvas. Use a reflective Fresnel-alpha surface here instead of
  // a white transmission buffer. This retains clear centers + solid glass rims.
  const glassShader = shader => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      float se34Edge = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.2);
      diffuseColor.a = mix(0.065, 0.58, se34Edge);
      outgoingLight = mix(outgoingLight, vec3(0.028, 0.055, 0.075), 0.36 * se34Edge);
      #include <opaque_fragment>
      `
    );
  };
  const mesh = (name, kind, material) => (0, n.jsx)('mesh', {
    geometry: nodes[name].geometry,
    castShadow: name === 'cylinder',
    receiveShadow: false,
    renderOrder: name.includes('Decal') ? 20 : name === 'cylinder_1' ? 5 : 0,
    children: (0, n.jsx)(kind, material)
  }, name);
  return (0, n.jsxs)('group', {
    ...props,
    dispose: null,
    scale,
    rotation: [0, -Math.PI, 0],
    // Original can Y bbox [-.349270970,.350070447], center .000399739.
    // Bottle Y bbox [-.45036,.4571264], center .0033832.
    // Uniform normalization preserves the bottle proportions and original poses.
    children: (0, n.jsxs)('group', {
      scale: 0.7706356991784645,
      position: [-0.00001833587885, -0.00220747614727, 0.00039511436023],
      children: [
      mesh('cylinder', 'meshStandardMaterial', { color:'#a8b3bd', metalness:1, roughness:.145, envMapIntensity:.72 }),
      mesh('cylinder_1', 'meshPhysicalMaterial', {
        color:tones[flavor] || tones.pure, metalness:.015, roughness:.075,
        transmission:0, ior:1.46, thickness:0,
        clearcoat:.26, clearcoatRoughness:.06, specularIntensity:.9,
        envMapIntensity:.38, transparent:true, opacity:1,
        depthWrite:false, side:l.FrontSide,
        onBeforeCompile:glassShader,
        customProgramCacheKey:()=> 'se34-fresnel-alpha-v2'
      }),
      mesh('Tab', 'meshStandardMaterial', { color:'#b9c5ce', metalness:1, roughness:.16, envMapIntensity:.7 }),
      mesh('BadgeInset', 'meshBasicMaterial', { color:'#172630', toneMapped:false }),
      mesh('MountainCrystal', 'meshPhysicalMaterial', {
        color:'#6e8799', metalness:.28, roughness:.20, transmission:0,
        ior:1.46, clearcoat:.25, envMapIntensity:.68
      }),
      mesh('BadgeDecal', 'meshBasicMaterial', { map:maps.badge, transparent:true, depthWrite:false, depthTest:false, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2 }),
      mesh('WordmarkDecal', 'meshBasicMaterial', { map:maps.wordmark, color:'#6c7b87', transparent:true, depthWrite:false, depthTest:false, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2 })
      ]
    })
  });
}
let x=(0,o.forwardRef)((e,t)=>{let{flavor:r="blackCherry",floatSpeed:o=1.5,rotationIntensity:i=1,floatIntensity:s=1,floatingRange:l=[-.1,.1],children:c,...d}=e;return(0,n.jsx)("group",{ref:t,...d,children:(0,n.jsxs)(a.b,{speed:o,rotationIntensity:i,floatIntensity:s,floatingRange:l,children:[c,(0,n.jsx)(u,{flavor:r})]})})});x.displayName="FloatingCan"},8198:function(e,t,r){r.d(t,{a:function(){return o}});var n=r(2265);function o(e,t){let r=(0,n.useCallback)(t=>{let r=matchMedia(e);return r.addEventListener("change",t),()=>{r.removeEventListener("change",t)}},[e]);return(0,n.useSyncExternalStore)(r,()=>matchMedia(e).matches,()=>t)}},2781:function(e,t,r){r.r(t),r.d(t,{default:function(){return f}});var n=r(7437),o=r(7867),a=r(5271),i=r(4960),s=r(5753),l=r(8410),c=r(9582),d=r(1204),u=r(19),x=r(2265),p=r(490),m=r(4490);function h(e){let{}=e,t=["#FFA6B5","#E9CFF6","#CBEF9A"];(0,u.V)(()=>{let e=c.ZP.utils.toArray(".alternating-section");if(!r.current)return;let n=c.ZP.timeline({scrollTrigger:{trigger:".alternating-text-view",endTrigger:".alternating-text-container",pin:!0,start:"top top",end:"bottom bottom",scrub:!0}});e.forEach((e,o)=>{if(0===o||!r.current)return;let a=o%2!=0;n.to(r.current.position,{ease:"circ.inOut",x:a?"-1":"1",delay:.5}),n.to(r.current.rotation,{ease:"back.inOut",y:a?".4":"-.4",delay:0},"<"),n.to(".alternating-text-container",{backgroundColor:c.ZP.utils.wrap(t,o)},"<")})});let r=(0,x.useRef)(null);return(0,n.jsxs)("group",{ref:r,"rotation-y":-.3,"position-x":1,children:[(0,n.jsx)(p.J,{flavor:"strawberryLemonade"}),(0,n.jsx)(m.qA,{files:"/experiences/fizzi/hdr/lobby.hdr",environmentIntensity:1.5,environmentRotation:[0,0,0]})]})}c.ZP.registerPlugin(d.i,u.V),c.ZP.registerPlugin(d.i,u.V);var f=e=>{let{slice:t}=e;return(0,n.jsx)(o.g,{"data-slice-type":t.slice_type,"data-slice-variation":t.variation,className:"alternating-text-container relative bg-yellow-300 text-sky-950",children:(0,n.jsx)("div",{children:(0,n.jsxs)("div",{className:"relative grid",children:[(0,n.jsx)(l.G,{className:"alternating-text-view absolute left-0 top-0 h-screen max-h-[1100px] w-full",children:(0,n.jsx)(h,{startingSide:t.variation})}),t.primary.text_group.map((e,t)=>(0,n.jsx)("div",{className:"alternating-section grid h-screen place-items-center gap-x-12 md:grid-cols-2",children:(0,n.jsxs)("div",{className:t%2==0?"col-start-1":"md:col-start-2",children:[(0,n.jsx)("h2",{className:"text-balance text-6xl font-bold",children:(0,n.jsx)(i.K,{field:e.heading})}),(0,n.jsx)("div",{className:"mt-4 text-xl",children:(0,n.jsx)(s.v,{field:e.body})})]})},(0,a.S)(e.heading)))]})})})}},91:function(module, exports, require) {
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
              jsx(index === 2 ? 'button' : 'div', { className: 'blindbox-orb',
                type: index === 2 ? 'button' : undefined, role: index === 2 ? undefined : 'img',
                'aria-label': index === 2 ? '播放赤色玻璃球视频' : label,
                'aria-haspopup': index === 2 ? 'dialog' : undefined,
                'data-se34-video': index === 2 ? 'red-orb' : undefined,
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
},9090:function(e,t,r){r.r(t),r.d(t,{default:function(){return b}});var n=r(7437),o=r(8410),a=r(7867),i=r(2265),s=r(7322),l=r(4490),c=r(4379),d=r(7776),u=r(9582),x=r(1204),p=r(19),m=r(490),h=r(8198);u.ZP.registerPlugin(x.i,p.V);let f=Math.PI/180*75;function y(e){let{sentence:t,flavor:r}=e,o=(0,i.useRef)(null),a=(0,i.useRef)(null),c=(0,i.useRef)(null),x=(0,i.useRef)(null),h=(0,i.useRef)(null),y=(0,i.useRef)(null),b=e=>e*Math.cos(f),v=e=>e*Math.sin(f),j=e=>({x:b(e),y:v(-1*e)});return(0,p.V)(()=>{c.current&&a.current&&y.current&&h.current&&x.current&&(u.ZP.set(c.current.position,{z:10}),u.ZP.set(a.current.position,{...j(-4)}),u.ZP.set(y.current.children.map(e=>e.position),{...j(7),z:2}),u.ZP.to(a.current.rotation,{y:2*Math.PI,duration:1.7,repeat:-1,ease:"none"}),u.ZP.timeline({scrollTrigger:{trigger:".diving-scene",pin:!0,start:"top top",end:"+=2000",scrub:1.5}}).to("body",{backgroundColor:"#C0F0F5",overwrite:"auto",duration:.1}).to(c.current.position,{z:0,duration:.3},0).to(a.current.position,{x:0,y:0,duration:.3,ease:"back.out(1.7)"},0).to(y.current.children.map(e=>e.position),{keyframes:[{x:0,y:0,z:-1},{...j(-7),z:-7}],stagger:.3},0).to(a.current.position,{...j(4),duration:.5,ease:"back.in(1.7)"}).to(c.current.position,{z:6,duration:.5}),u.ZP.set([h.current.position,x.current.position],{...j(15)}),u.ZP.to([x.current.position],{y:"+=".concat(v(30)),x:"+=".concat(b(-30)),ease:"none",repeat:-1,duration:6}),u.ZP.to([h.current.position],{y:"+=".concat(v(30)),x:"+=".concat(b(-30)),ease:"none",repeat:-1,delay:2,duration:6}))},{}),(0,n.jsxs)("group",{ref:o,children:[(0,n.jsx)("ambientLight",{intensity:2,color:"#9ddefa"}),(0,n.jsx)("group",{rotation:[0,0,.5],children:(0,n.jsx)(m.J,{ref:a,rotationIntensity:0,floatIntensity:3,floatSpeed:3,flavor:r,children:(0,n.jsx)("pointLight",{intensity:30,color:"#8c0413",decay:.6})})}),(0,n.jsx)("group",{ref:y,children:t&&(0,n.jsx)(g,{text:t,color:"#f97315"})}),(0,n.jsxs)(s.lc,{material:d.MeshLambertMaterial,ref:c,children:[(0,n.jsx)(s.ZJ,{ref:x,bounds:[10,10,2],color:"white",growth:2,speed:1}),(0,n.jsx)(s.ZJ,{ref:h,bounds:[10,10,2],color:"white",growth:0,speed:1})]}),(0,n.jsx)(l.qA,{files:"/experiences/fizzi/hdr/field.hdr",environmentIntensity:1.5,environmentRotation:[0,0,0]})]})}function g(e){let{text:t,color:r="white"}=e,o=t.toUpperCase().split(" "),a=new d.MeshLambertMaterial,i=(0,h.a)("(min-width: 950px)",!0);return o.map((e,t)=>(0,n.jsx)(c.x,{scale:i?1:.5,color:r,material:a,font:"/experiences/fizzi/fonts/Alpino-Variable.woff",fontWeight:"900",anchorX:"center",anchorY:"middle",characters:"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!,.",children:e},"".concat(t,"-").concat(e)))}var b=e=>{let{slice:t}=e;return(0,n.jsxs)(a.g,{className:"diving-scene h-[100vh]",children:[(0,n.jsx)("h2",{className:"sr-only",children:t.primary.words}),(0,n.jsx)(o.G,{className:"h-screen w-screen",children:(0,n.jsx)(y,{sentence:t.primary.words,flavor:t.primary.flavor})})]})}},3869:function(e,t,r){r.r(t),r.d(t,{default:function(){return P}});var n=r(7437),o=r(5271),a=r(5753),i=r(5275),s=r(9582),l=r(19),c=r(8410),d=r(8198),u=r(4839);function x(e){let{className:t,...r}=e;return(0,n.jsx)("a",{className:(0,u.Z)("rounded-xl bg-orange-600 px-5 py-4 text-center text-xl font-bold uppercase tracking-wide text-white transition-colors duration-150 hover:bg-orange-700 md:text-2xl",t),...r})}var p=r(7867);function m(e){let{text:t,className:r}=e;if(!t)return null;let o=t.split(" ");return o.map((e,t)=>{let a=e.split("");return(0,n.jsxs)("span",{className:"split-word ".concat(r),style:{display:"inline-block",whiteSpace:"pre"},children:[a.map((e,r)=>" "===e?" ":(0,n.jsx)("span",{className:"split-char inline-block split-char--".concat(t,"-").concat(r),children:e},r)),t<o.length-1?(0,n.jsx)("span",{className:"split-char",children:" "}):""]},"".concat(t,"-").concat(e))})}var h=r(2265),f=r(4490),y=r(490);let g=(0,r(9099).Ue)(e=>({ready:!1,isReady:()=>e({ready:!0})}));function b(e){let{}=e,t=(0,h.useRef)(null),r=(0,h.useRef)(null),o=(0,h.useRef)(null),a=(0,h.useRef)(null),i=(0,h.useRef)(null),c=(0,h.useRef)(null),d=(0,h.useRef)(null),u=(0,h.useRef)(null),x=g(e=>e.isReady);return(0,l.V)(()=>{if(!o.current||!a.current||!i.current||!c.current||!d.current||!t.current||!r.current||!u.current)return;x(),s.ZP.set(o.current.position,{x:-1.5,y:0,z:0}),s.ZP.set(o.current.rotation,{z:-.5}),s.ZP.set(a.current.position,{x:1.5,y:0,z:0}),s.ZP.set(a.current.rotation,{z:.5}),s.ZP.set(i.current.position,{x:0,y:5,z:2}),s.ZP.set(c.current.position,{x:2,y:4,z:2}),s.ZP.set(d.current.position,{x:0,y:-5,z:0});let e=s.ZP.timeline({defaults:{duration:3,ease:"back.out(1.4)"}});window.scrollY<20&&e.from(t.current.position,{y:-5,x:1},0).from(t.current.rotation,{z:3},0).from(r.current.position,{y:5,x:-1},.5).from(r.current.rotation,{z:-1},.5),s.ZP.timeline({defaults:{duration:2,immediateRender:!1},scrollTrigger:{trigger:".hero",start:"top top",end:"bottom bottom",scrub:1.5}}).to(u.current.rotation,{y:2*Math.PI}).to(o.current.position,{x:-.2,y:-.7,z:-2},0).to(o.current.rotation,{z:.3},0).to(a.current.position,{x:1,y:-.2,z:-1},0).to(a.current.rotation,{z:0},0).to(i.current.position,{x:-.3,y:.5,z:-1},0).to(i.current.rotation,{z:-.1},0).to(c.current.position,{x:0,y:-.3,z:.5},0).to(c.current.rotation,{z:.3},0).to(d.current.position,{x:.3,y:.5,z:-.5},0).to(d.current.rotation,{z:-.25},0).to(u.current.position,{x:1,duration:3,ease:"sine.inOut"},1.3)}),(0,n.jsx)(n.Fragment,{children:(0,n.jsxs)("group",{ref:u,children:[(0,n.jsx)("group",{ref:t,children:(0,n.jsx)(y.J,{ref:o,flavor:"blackCherry",floatSpeed:1.5})}),(0,n.jsx)("group",{ref:r,children:(0,n.jsx)(y.J,{ref:a,flavor:"lemonLime",floatSpeed:1.5})}),(0,n.jsx)(y.J,{ref:i,flavor:"grape",floatSpeed:1.5}),(0,n.jsx)(y.J,{ref:c,flavor:"strawberryLemonade",floatSpeed:1.5}),(0,n.jsx)(y.J,{ref:d,flavor:"watermelon",floatSpeed:1.5}),(0,n.jsx)(f.qA,{files:"/experiences/fizzi/hdr/lobby.hdr",environmentIntensity:1.5,environmentRotation:[0,0,0]})]})})}var v=r(7776),j=r(1864);let w=new v.Object3D;function N(e){let{count:t=300,speed:r=5,bubbleSize:o=.05,opacity:a=.5,repeat:i=!0}=e,l=(0,h.useRef)(null),c=(0,h.useRef)(new Float32Array(t)),d=.001*r,u=.005*r,x=new v.MeshStandardMaterial({transparent:!0,opacity:a}),p=new v.SphereGeometry(o,16,16);return(0,h.useEffect)(()=>{let e=l.current;if(e){for(let r=0;r<t;r++)w.position.set(s.ZP.utils.random(-4,4),s.ZP.utils.random(-4,4),s.ZP.utils.random(-4,4)),w.updateMatrix(),e.setMatrixAt(r,w.matrix),c.current[r]=s.ZP.utils.random(d,u);return e.instanceMatrix.needsUpdate=!0,()=>{e.geometry.dispose(),e.material.dispose()}}},[t,d,u]),(0,j.F)(()=>{if(l.current){x.color=new v.Color(document.body.style.backgroundColor);for(let e=0;e<t;e++)l.current.getMatrixAt(e,w.matrix),w.position.setFromMatrixPosition(w.matrix),w.position.y+=c.current[e],w.position.y>4&&i&&(w.position.y=-2,w.position.x=s.ZP.utils.random(-4,4),w.position.z=s.ZP.utils.random(0,8)),w.updateMatrix(),l.current.setMatrixAt(e,w.matrix);l.current.instanceMatrix.needsUpdate=!0}}),(0,n.jsx)("instancedMesh",{ref:l,args:[void 0,void 0,t],position:[0,0,0],material:x,geometry:p})}s.ZP.registerPlugin(l.V);var P=e=>{let{slice:t}=e,r=g(e=>e.ready),u=(0,d.a)("(min-width: 768px)",!0);return(0,l.V)(()=>{if(!r&&u)return;let e=s.ZP.timeline({}),t=s.ZP.timeline({scrollTrigger:{trigger:".hero",start:"top top",end:"bottom bottom",scrub:1.5}});e.fromTo(".hero-header-word",{scale:3,opacity:0},{scale:1,opacity:1,duration:1,stagger:1,delay:.3,ease:"power4.in"}),e.fromTo(".hero-subheading",{opacity:0,y:30},{y:0,opacity:1,duration:1,delay:.8}),e.fromTo(".hero-body",{opacity:0},{opacity:1,duration:1}),e.fromTo(".hero-button",{opacity:0,y:10},{y:0,opacity:1,duration:.6}),t.fromTo("body",{backgroundColor:"#FDE047"},{backgroundColor:"#d9f99d",overwrite:"auto"},1).from(".split-char",{scale:1.3,y:40,rotate:-25,opacity:0,stagger:.1,ease:"back.out(3)",duration:.5},3).from(".text-side-body",{y:20,opacity:0})},{dependencies:[r,u]}),(0,n.jsxs)(p.g,{className:"hero max-h-[2000px]",children:[u&&(0,n.jsxs)(c.G,{className:"hero-scene pointer-events-none sticky top-0 z-50 -mt-[100vh] hidden h-screen w-screen md:block",children:[(0,n.jsx)(b,{}),(0,n.jsx)(N,{count:300,speed:2,repeat:!0})]}),(0,n.jsxs)("div",{className:"grid",children:[(0,n.jsx)("div",{className:"grid h-screen place-items-center",children:(0,n.jsxs)("div",{className:"grid auto-rows-min place-items-center text-center",children:[(0,n.jsx)("h1",{className:"hero-header text-center text-7xl font-black uppercase leading-[.8] text-orange-500 md:text-[9rem] lg:text-[13rem]",children:(0,o.S)(t.primary.heading).split(" ").map((e,t)=>(0,n.jsx)("span",{className:"hero-header-word block opacity-0",children:e},t+e))}),(0,n.jsx)("p",{className:"hero-subheading mt-12 text-5xl font-semibold text-sky-950 opacity-0 lg:text-6xl",children:t.primary.subheading}),(0,n.jsx)("div",{className:"hero-body text-2xl font-normal text-sky-950 opacity-0",children:(0,n.jsx)(a.v,{field:t.primary.body})}),(0,n.jsx)(x,{href:"/",className:"hero-button mt-12 opacity-0",children:t.primary.buttontext})]})}),(0,n.jsxs)("div",{className:"text-side relative z-[80] grid h-screen items-center gap-4 md:grid-cols-2",children:[(0,n.jsx)(i.P,{field:t.primary.cans_image,className:"w-full md:hidden"}),(0,n.jsxs)("div",{children:[(0,n.jsx)("h2",{className:"text-side-heading text-balance text-6xl font-black uppercase text-sky-950 lg:text-8xl",children:(0,n.jsx)(m,{text:(0,o.S)(t.primary.secondheading)})}),(0,n.jsx)("div",{className:"text-side-body mt-4 max-w-xl text-balance text-xl font-normal text-sky-950",children:(0,n.jsx)(a.v,{field:t.primary.secondbody})})]})]})]})]})}}}]);