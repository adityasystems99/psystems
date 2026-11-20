const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 9223;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\KIIT\\.gemini\\antigravity\\brain\\4aae64ba-79b2-484f-ad7a-a09656f3d3a7";
const tempUserData = path.join(process.env.TEMP, 'chrome-cdp-' + Date.now());

async function run() {
  console.log("Starting Chrome with remote debugging on port", PORT);
  const chromeProc = spawn(CHROME_PATH, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${tempUserData}`,
    '--window-size=390,844',
    'http://localhost:5174/'
  ]);

  // Wait 2.5 seconds for Chrome to start
  await new Promise(r => setTimeout(r, 2500));

  // Get WebSocket debugger URL
  const versionInfo = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = versionInfo.find(t => t.type === 'page');
  if (!pageTarget) throw new Error("No page target found");

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    }
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable domains
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  console.log("Device emulated: 390x844");

  // Helper evaluate
  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  // 1. Acceptance test: Horizontal scroll width
  await send('Page.navigate', { url: 'http://localhost:5174/?p=0.02' });
  await new Promise(r => setTimeout(r, 1500));

  const scrollCheck = await evaluate(`({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth
  })`);
  console.log("Scroll check at p=0.02:", scrollCheck);
  const noHScroll = scrollCheck.scrollWidth <= scrollCheck.innerWidth && scrollCheck.bodyScrollWidth <= scrollCheck.innerWidth;
  console.log("Criterion 1: No horizontal scrollbar at 390x844? ->", noHScroll ? "PASS" : "FAIL");

  // 2. Acceptance test: Carousel at p=0.80
  await send('Page.navigate', { url: 'http://localhost:5174/?p=0.80' });
  await new Promise(r => setTimeout(r, 2000));

  const carouselCheck = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('main > div:first-child div[style*="perspective"] > div'));
    const vw = window.innerWidth;
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const style = window.getComputedStyle(c);
      return {
        index: i,
        rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) },
        opacity: Math.round(parseFloat(style.opacity) * 100) / 100,
        isFullyOnScreen: rect.left >= -5 && rect.right <= vw + 5,
        peekingLeft: rect.left < 0 && rect.right > 0,
        peekingRight: rect.left < vw && rect.right > vw
      };
    });
  })()`);

  console.log("Carousel cards check at p=0.80:", JSON.stringify(carouselCheck, null, 2));

  // Check acceptance: centered card fully on screen, neighbor peeking
  const hasCenteredOnScreen = carouselCheck.some(c => c.isFullyOnScreen && c.opacity > 0.8);
  const hasNeighborPeeking = carouselCheck.some(c => c.peekingLeft || c.peekingRight);
  console.log("Criterion 2: Centered card on screen? ->", hasCenteredOnScreen ? "PASS" : "FAIL");
  console.log("Criterion 2: Neighbor card peeking in? ->", hasNeighborPeeking ? "PASS" : "FAIL");

  // 3. Acceptance test: Chain cards stay inside screen width
  let chainCardsAllInside = true;
  for (const testP of [0.38, 0.44, 0.50, 0.56]) {
    await send('Page.navigate', { url: `http://localhost:5174/?p=${testP}` });
    await new Promise(r => setTimeout(r, 1200));

    const chainCheck = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('div[style*="translate(-50%, -50%)"]'));
      const vw = window.innerWidth;
      return cards.map(c => {
        const rect = c.getBoundingClientRect();
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          inside: rect.left >= 0 && rect.right <= vw
        };
      });
    })()`);

    console.log(`Chain cards check at p=${testP}:`, chainCheck);
    if (chainCheck.length > 0 && !chainCheck.every(c => c.inside)) {
      chainCardsAllInside = false;
    }
  }
  console.log("Criterion 3: Chain cards stay inside screen width? ->", chainCardsAllInside ? "PASS" : "FAIL");

  // 4. Console errors check
  console.log("Console errors detected:", consoleErrors.length, consoleErrors);
  console.log("Criterion 6: No console errors? ->", consoleErrors.length === 0 ? "PASS" : "FAIL");

  // Capture clean verification screenshot at p=0.80
  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshotRes.data, 'base64');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mobile_p080.png'), buffer);
  console.log("Saved verification screenshot to verify_mobile_p080.png");

  ws.close();
  chromeProc.kill();
  try {
    fs.rmSync(tempUserData, { recursive: true, force: true });
  } catch(e) {}
}

run().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
