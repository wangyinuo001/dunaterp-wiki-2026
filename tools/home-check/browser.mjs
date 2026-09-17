// Optional browser regression harness. Playwright is a developer tool, not a site dependency.
// PLAYWRIGHT_MODULE may point to an installed Playwright module; CHROMIUM_MODULE
// optionally points to @sparticuz/chromium for managed Linux environments.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
const root = fileURLToPath(new URL('../../', import.meta.url));
const shots = process.env.HOME_SHOTS || '/tmp/dunaterp-home-shots';
fs.mkdirSync(shots, { recursive: true });
process.env.VITE_BASE_PATH = '/dunaterp-wiki/';
const server = await createServer({ root, server: { host: '127.0.0.1', port: 4175, strictPort: true, hmr: false, watch: { ignored: ['**/tools/**'] } } });
await server.listen();
const { chromium: pw } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const bundle = process.env.CHROMIUM_MODULE ? (await import(process.env.CHROMIUM_MODULE)).default : null;
const launchBrowser = async () => bundle
  ? pw.launch({ executablePath: await bundle.executablePath(), args: bundle.args, headless: true })
  : pw.launch({ headless: true });
let browser = await launchBrowser();
try {
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:4175/dunaterp-wiki/');
await page.waitForSelector('[data-story-state="OPENING"]');
await page.waitForTimeout(5500);
await page.screenshot({path:path.join(shots, 'opening-desktop.png')});
assert.equal(await page.locator('.home-world-header').evaluate(e=>getComputedStyle(e).visibility),'hidden');
const canvas=await page.locator('.px-canvas').elementHandle();
if((await page.locator('.story-next').textContent()).includes('Reveal'))await page.locator('.story-dialogue-button').click();
await page.locator('.story-dialogue-button').focus();
await page.keyboard.press('Enter');
await page.waitForSelector('[data-story-state="PROBLEM"]');
for(let i=0;i<14;i++){
 if(i===3||i===5||i===8||i===11)await page.screenshot({path:path.join(shots, `desktop-beat-${i}.png`)});
 const button=page.locator('.story-dialogue-button');
 if((await button.locator('.story-next').textContent()).includes('Reveal'))await button.click();
 await button.click();
}
await page.waitForSelector('[data-story-state="TRANSITION"]');
await page.waitForSelector('.home-prologue',{state:'detached'});
assert.equal(await canvas.evaluate(e=>e===document.querySelector('.px-canvas')),true,'canvas reused');
assert.equal(await page.evaluate(()=>localStorage.getItem('dunaterpIntroSeen')),'true');
assert.equal(await page.locator('.px-canvas').evaluate(e=>e===document.activeElement),true);
await page.screenshot({path:path.join(shots, 'world-desktop.png')});
await page.keyboard.press('w');
await page.waitForSelector('.px-world.is-free');
await page.getByRole('button',{name:'PLAY INTRO'}).click();
await page.waitForSelector('[data-story-state="OPENING"]');
await page.getByRole('button',{name:'SKIP INTRO'}).click();
await page.waitForSelector('.home-prologue',{state:'detached'});
await page.reload();
await page.waitForSelector('.px-world.is-ready');
assert.equal(await page.locator('.home-prologue').count(),0);
await page.evaluate(() => window.scrollTo(0, (document.querySelector('.px-world').offsetHeight - innerHeight) * .245));
await page.waitForSelector('.px-chapter-card');
await page.locator('.px-chapter-card').first().click({ position: { x: 10, y: 10 } });
await page.waitForURL(/project-description/);
await page.goBack();
await page.waitForSelector('.px-world.is-ready');
await page.getByRole('button',{name:'PLAY INTRO'}).click();
await page.waitForSelector('[data-story-state="OPENING"]');
assert.deepEqual(errors,[]);
console.log('PASS desktop: opening, every beat, transition, same canvas, focus, WASD, free-roam replay, skip, persistence, no console errors');
await browser.close();
browser = await launchBrowser();
const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
mobile.on('pageerror',e=>errors.push(e.message));
await mobile.goto('http://127.0.0.1:4175/dunaterp-wiki/');
await mobile.waitForSelector('[data-story-state="OPENING"]');
await mobile.screenshot({path:path.join(shots, 'opening-mobile.png')});
await mobile.locator('.story-dialogue-button').tap();
for(let i=0;i<14;i++){
 assert.ok(await mobile.locator('.story-dialogue-button').evaluate(e=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight && r.top>=0;}),`dialogue visible ${i}`);
 assert.ok(await mobile.locator('.home-prologue').evaluate(e=>e.scrollWidth<=e.clientWidth),`no horizontal overflow ${i}`);
 if(i===3||i===5||i===8||i===11)await mobile.screenshot({path:path.join(shots, `mobile-beat-${i}.png`)});
 await mobile.locator('.story-dialogue-button').tap();
}
await mobile.waitForSelector('.home-prologue',{state:'detached'});
await mobile.getByRole('button',{name:'Free roam',exact:true}).tap();
await mobile.waitForSelector('.px-dpad');
assert.equal(await mobile.locator('.px-world').evaluate(e=>e.classList.contains('is-free')),true);
assert.deepEqual(errors,[]);
console.log('PASS mobile: all beats visible, touch navigation, reduced motion, no horizontal overflow, controls restored');

} finally { await browser.close(); await server.close(); }
