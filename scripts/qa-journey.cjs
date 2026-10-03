// Run the browser QA runner from the repository root; screenshots use output/playwright/.
async (page) => {
  const errors=[], failed=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1:4173'))failed.push({url:r.url(),status:r.status()});});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const frames=page.frames();
  const first=frames.find(f=>f.url().includes('/serrana/'));
  const second=frames.find(f=>f.url().includes('/baikal/'));
  const third=frames.find(f=>f.url().includes('/fizzi/'));
  await page.screenshot({path:'output/playwright/final-home-desktop.png'});
  await page.mouse.move(800,450);await page.mouse.wheel(0,650);await page.waitForTimeout(650);
  const scroll=await page.evaluate(()=>({outer:scrollY,inner:document.querySelector('iframe').contentWindow.scrollY}));
  await page.locator('[data-target=baikal]').click();await page.waitForTimeout(1300);
  await page.screenshot({path:'output/playwright/final-second-desktop.png'});
  const cards=await second.evaluate(()=>[...document.querySelectorAll('[class*=FormatsCard_rootImage] img')].map(i=>({src:i.src,ok:i.complete&&i.naturalWidth>0})));
  const gallery=await second.evaluate(()=>[...document.querySelectorAll('[class*=SliderGallery_rootImage] img')].map(i=>i.src));
  await page.locator('[data-target=fizzi]').click();await page.waitForTimeout(1200);
  await page.screenshot({path:'output/playwright/final-third-desktop.png'});
  await third.getByRole('link',{name:'探索系列'}).click();await page.waitForTimeout(1400);
  await third.getByRole('button',{name:'下一款玻璃珠'}).click();await page.waitForTimeout(1300);
  const carousel=await third.evaluate(()=>document.getElementById('se34-collection')?.innerText);
  await page.screenshot({path:'output/playwright/final-collection-desktop.png'});
  const brands=await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>({brand:f.dataset.brand,h:f.contentDocument.documentElement.scrollHeight,overflow:f.contentDocument.documentElement.scrollWidth>f.clientWidth+1,oldCompany:/BAIKAL|Serrana|Fizzi|baikal-sea|vitamina|\+7 ?800/.test(f.contentDocument.body.innerText)})));
  await page.setViewportSize({width:390,height:844});await page.locator('[data-target=serrana]').click();await page.waitForTimeout(1600);
  await page.screenshot({path:'output/playwright/final-home-mobile.png'});
  const menu=first.locator('.w-nav-button');await menu.click();await page.waitForTimeout(500);
  const mobileMenu=await first.locator('.w-nav-menu').evaluate(e=>e.getBoundingClientRect().height>0&&getComputedStyle(e).display!=='none');
  await menu.click();
  await page.locator('[data-target=baikal]').click();await page.waitForTimeout(1000);await page.screenshot({path:'output/playwright/final-second-mobile.png'});
  await page.locator('[data-target=fizzi]').click();await page.waitForTimeout(1000);await page.screenshot({path:'output/playwright/final-third-mobile.png'});
  await page.locator('[data-target=serrana]').click();
  return {scroll,cards,gallery,carousel,brands,mobileMenu,errors,failed};
}
