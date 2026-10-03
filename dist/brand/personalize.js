(() => {
  'use strict';
  const brand=location.pathname.includes('/baikal')?'baikal':location.pathname.includes('/fizzi')?'fizzi':'serrana';
  let queued=false, layoutRefreshed=false;
  function clean(){
    queued=false;
    document.documentElement.dataset.brand=brand;
    if(!document.querySelector('link[href^="/brand/personalize.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='/brand/personalize.css?v=20261003-r3';document.head.append(css);}
    // Remove old contact destinations, certification claims, and agencies from the rendered experience.
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(/mailto:|tel:|baikal-sea\.com|baikal430_media|only\.digital|facebook\.com|linkedin\.com|instagram\.com|avitamina\.pt|fssc\.com|certificate_BAIKAL|declaration_BAIKAL|changes_in_labeling|photo_60227/.test(href))a.hidden=true;
      if(brand==='baikal'&&/where-to-buy/.test(href))a.href='#se34-products';
      if(brand==='baikal'&&(href==='/ru'||href==='/en'))a.hidden=true;
    });
    if(brand==='baikal'){
      document.querySelector('.se34-design-section')?.setAttribute('id','se34-products');
      document.querySelectorAll('[class*=FormatsCard_rootImage] picture').forEach(p=>{
        p.querySelectorAll('source').forEach(s=>s.srcset='/brand/se34-bottle.png');
        p.querySelectorAll('img').forEach(img=>{if(!img.src.endsWith('/brand/se34-bottle.png'))img.src='/brand/se34-bottle.png';img.removeAttribute('srcset');img.alt='安康硒谷 SE·34 玻璃瓶';});
      });
      document.querySelectorAll('[class*=DepthRange_rootValueNumber] .h-1').forEach(el=>{if(el.textContent!=='34')el.textContent='34';});
      document.querySelectorAll('[class*=DepthRange_rootTextContent] .all-caps').forEach(el=>{if(el.textContent==='meters')el.textContent='Se · 元素印记';});
      const footer=document.querySelector('footer');
      if(footer&&!footer.querySelector('.brand-footer'))footer.insertAdjacentHTML('beforeend','<div class="brand-footer"><strong>安康硒谷</strong><p>秦巴山水 · 汉江之滨<br>让自然的力量与你相遇</p><small>© 2026 安康硒谷 · SE·34</small></div>');
    }
    if(!layoutRefreshed){layoutRefreshed=true;setTimeout(()=>window.dispatchEvent(new Event('resize')),300);}
    if(brand==='fizzi'){
      document.querySelectorAll('img').forEach(img=>{if(/all-cans-bunched/.test(img.src)){img.src='/brand/se34-bottle.png';img.removeAttribute('srcset');img.alt='安康硒谷 SE·34';}});
      const section=[...document.querySelectorAll('section')].find(s=>s.textContent.includes('选择你的硒灵'));
      if(section){section.id='se34-collection';document.querySelectorAll('a').forEach(a=>{if(a.textContent.includes('探索系列'))a.href='#se34-collection';});}
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    clean();
    // Observe inserted text/nodes only; our own attribute fixes cannot create an observer loop.
    new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(clean);}}).observe(document,{childList:true,subtree:true});
  });
})();
