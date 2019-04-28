const Page = require('./helpers/page');
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When not logged in', async () => {
  test('should not create a blog post', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'My Title', content: 'My Content' })
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });
  test('should not get blogs', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.getContents('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('the form shows and error message', async () => {
      const title = await page.getContents('.title .red-text');
      const content = await page.getContents('.content .red-text');
      expect(title).toEqual('You must provide a value');
      expect(content).toEqual('You must provide a value');
    });
  });

  describe('and using valid inputs', async () => {
    const setTitle = 'Test title';
    const setContent = 'Test Content';
    beforeEach(async () => {
      await page.type('.title input', setTitle);
      await page.type('.content input', setContent);
      await page.click('form button');
    });
    test('should take the user to review screen', async () => {
      const text = await page.getContents('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('should then save and adds the blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContents('.card-title');
      const content = await page.getContents('p');
      expect(title).toEqual(setTitle);
      expect(content).toEqual(setContent);
    });
  });
});
