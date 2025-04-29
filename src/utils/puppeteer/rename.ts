import browser from "./puppeteer.js";

/** Returns the title of YouTube Video. */
export default async function rename(url: string) {
  const page = await browser.newPage();
  await page.goto(url);
  const selector = await page.waitForSelector(
    '::-p-xpath(//div[@id="title"]/h1)'
  );
  if (!selector) {
    console.warn("Invalid selector.");
    return "";
  }
  const title = await selector.evaluate(
    (h1) => (h1 as HTMLHeadElement).innerText
  );
  return title;
}
