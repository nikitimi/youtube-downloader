import { type Browser, type Page, firefox } from "playwright";

export default class Automation {
  private browser: null | Browser = null;
  private page: null | Page = null;

  constructor(browser?: Browser) {
    if (typeof browser === "undefined") {
      console.warn("[INITIALIZATION]: CANNOT BE CALLED DIRECTLY.");
      return;
    }
  }

  static async build() {
    const browser = await firefox.launch();
    if (browser) {
      return new Automation(browser);
    }
  }

  async visit(url: string) {
    if (!this.browser) {
      return console.warn(`[URL VISIT ERROR]: BROWSER IS NOT INITIALIZED.`);
    }
    if (!this.page) {
      this.page = await this.browser.newPage();
    }
    console.info(`GOING TO: ${url}`);
    await this.page.goto(url);
    await this.page.waitForSelector("p");
  }

  async exit() {
    if (!this.browser) {
      return console.warn("[EXIT FAILED]: NO BROWSER.");
    }
    await this.browser.close();
  }

  // const browser = await firefox.launch({
  //   // headless: false,
  //   executablePath:
  //     "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  // });
}
