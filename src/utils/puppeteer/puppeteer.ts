import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  // headless: false,
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
});

export default browser;
