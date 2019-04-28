const Page = require('./helpers/page');
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

test('header has the correct text', async () => {
  const text = await page.getContents('a.brand-logo');
  expect(text).toEqual('Blogster');
});

test('start OAuth flow when click login', async () => {
  await page.click('ul.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('when signed in shows logout button', async () => {
  await page.login();
  const text = await page.getContents('a[href="/auth/logout"]');
  expect(text).toEqual('Logout');
});

test('', async () => {});
