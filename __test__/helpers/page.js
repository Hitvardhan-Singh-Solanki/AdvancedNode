const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/session');
const userFactory = require('../factories/user');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);
    return new Proxy(customPage, {
      get: function(_, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000');
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContents(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
