const http = require('http');
const { spawn } = require('child_process');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempDir = require('os').tmpdir() + '\\cdp-diag-' + Date.now();

const p = spawn(chrome, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9227',
  '--user-data-dir=' + tempDir,
  '--window-size=1440,900',
  'http://localhost:5174/?p=0.38'
]);

setTimeout(async () => {
  try {
    const list = await new Promise(r => http.get('http://127.0.0.1:9227/json/list', res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
    }));
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: {
        expression: 'JSON.stringify({ scrollY: window.scrollY, innerH: window.innerHeight, cards: document.querySelectorAll("article").length, canvas: !!document.querySelector("canvas"), cardHtml: document.querySelector("article")?.outerHTML, bodyText: document.body.innerText.slice(0, 200) })',
        returnByValue: true
      }}));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('DOM info at p=0.38:', msg.result.result.value);
        ws.close();
        p.kill();
        process.exit(0);
      }
    };
  } catch(err) {
    console.error(err);
    p.kill();
    process.exit(1);
  }
}, 3000);
