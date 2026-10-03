(() => {
  'use strict';
  if (window.parent === window) return;
  const send = data => parent.postMessage(data, location.origin);
  let velocity = 0, lastTouchTime = 0, momentum = 0;
  let lastHeight = 0, active = null, touchX = 0, touchY = 0, parentY = 0;
  // Install before each site's runtime, so only the outer document consumes vertical gestures.
  function canConsume(target,delta) {
    for(let el=target?.nodeType===1?target:target?.parentElement;el&&el!==document.body;el=el.parentElement){
      if (el.scrollHeight>el.clientHeight+2 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) {
        if ((delta>0&&el.scrollTop+el.clientHeight<el.scrollHeight-1)||(delta<0&&el.scrollTop>0)) return true;
      }
    }
    return false;
  }
  window.addEventListener('wheel',e=>{
    if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||canConsume(e.target,e.deltaY))return;
    e.preventDefault();e.stopImmediatePropagation();
    send({type:'journey:wheel',delta:e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?innerHeight:1)});
  },{capture:true,passive:false});
  window.addEventListener('touchstart',e=>{if(e.touches.length===1){cancelAnimationFrame(momentum);velocity=0;lastTouchTime=performance.now();touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;}},{capture:true,passive:true});
  window.addEventListener('touchmove',e=>{
    if(e.touches.length!==1)return;
    const x=e.touches[0].clientX,y=e.touches[0].clientY,delta=touchY-y,dx=touchX-x;
    const now=performance.now();velocity=delta/Math.max(8,now-lastTouchTime);lastTouchTime=now;touchY=y;touchX=x;
    if(Math.abs(dx)>Math.abs(delta)||canConsume(e.target,delta))return;
    e.preventDefault();e.stopImmediatePropagation();send({type:'journey:wheel',delta});
  },{capture:true,passive:false});
  window.addEventListener('touchend',()=>{if(performance.now()-lastTouchTime>100||Math.abs(velocity)<.15)return;let speed=velocity*16;function coast(){speed*=.93;if(Math.abs(speed)<.4)return;send({type:'journey:wheel',delta:speed});momentum=requestAnimationFrame(coast);}momentum=requestAnimationFrame(coast);},{passive:true});
  window.addEventListener('keydown',e=>{
    if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    // The orb carousel owns its selection keys and native button activation.
    if(e.target.closest('[data-orb-carousel]')&&(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||(e.key===' '&&e.target.closest('button'))))return;
    const dy={ArrowDown:80,ArrowUp:-80,PageDown:innerHeight*.85,PageUp:-innerHeight*.85,' ':innerHeight*.85}[e.key];
    if(dy!==undefined){e.preventDefault();e.stopImmediatePropagation();send({type:'journey:wheel',delta:e.shiftKey?-dy:dy});}
    if(e.key==='Home'||e.key==='End'){e.preventDefault();send({type:'journey:goto',y:e.key==='Home'?0:document.documentElement.scrollHeight});}
  },true);
  window.addEventListener('message',e=>{
    if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='journey:position')return;
    parentY=e.data.y;
    if(Math.abs(scrollY-parentY)>1)window.scrollTo({top:parentY,left:0,behavior:'instant'});
    if(active!==e.data.active){
      active=e.data.active;
      document.querySelectorAll('video[autoplay]').forEach(v=>active?v.play().catch(()=>{}):v.pause());
    }
  });
  function report(){
    const h=Math.max(document.body?.scrollHeight||0,document.documentElement.scrollHeight);
    if(h!==lastHeight){lastHeight=h;send({type:'journey:height',height:h});}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const style=document.createElement('style');
    style.textContent='html{scrollbar-width:none!important}html::-webkit-scrollbar{display:none!important}';
    document.head.append(style);
    new ResizeObserver(report).observe(document.body);
    window.addEventListener('resize',report);
    document.addEventListener('load',report,true);
    document.addEventListener('loadedmetadata',e=>{if(e.target.tagName==='VIDEO'&&!active)e.target.pause();},true);
    setInterval(report,1200);
    report();send({type:'journey:ready'});
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
      const url=new URL(a.href,location.href);
      if(url.hash){
        const el=document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if(el){e.preventDefault();e.stopImmediatePropagation();send({type:'journey:goto',y:el.getBoundingClientRect().top+scrollY});return;}
      }
      if(url.origin===location.origin){
        const brand=document.documentElement.dataset.brand;
        const routes=brand==='baikal'?{'/':'/experiences/baikal/','/en':'/experiences/baikal/','/where-to-buy':'/experiences/baikal/where-to-buy/','/en/where-to-buy':'/experiences/baikal/where-to-buy/'}:brand==='fizzi'?{'/':'/experiences/fizzi/'}:{};
        if(routes[url.pathname]){
          e.preventDefault();e.stopImmediatePropagation();
          if(brand==='fizzi'&&a.textContent.toLowerCase().includes('shop')){
            const el=[...document.querySelectorAll('section')].find(x=>x.textContent.includes('Choose Your Flavor'));
            if(el){send({type:'journey:goto',y:el.getBoundingClientRect().top+scrollY});return;}
          }
          send({type:'journey:goto',y:0});location.href=routes[url.pathname]+url.hash;
        } else if(brand==='serrana'&&url.pathname!==location.pathname){send({type:'journey:goto',y:0});}
      }
    },true);
  });
})();
