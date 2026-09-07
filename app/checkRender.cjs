const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    const html = await page.content();
    console.log("PAGE HTML LENGTH:", html.length);
    if (html.length < 500) console.log(html);
    
    await browser.close();
  } catch(e) {
    console.error("Puppeteer script error:", e);
  }
})();
