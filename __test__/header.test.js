const puppeteer = require('puppeteer');

test('test add two numbers', () => {
  const sum = 1 + 2;
  expect(sum).toEqual(3);
});

test('launch browser', async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
});
