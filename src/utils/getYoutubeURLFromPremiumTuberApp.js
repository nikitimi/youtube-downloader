import puppeteer from "puppeteer";

const baseURL = "https://www.premiumtuberapp.com/video/";

function sanitizeURL(url) {
  const [base, uri, ...rest] = url.split(baseURL);
  if (rest.length !== 0) {
    console.log(
      "Overlapping URL paramaters detected. Please provide a valid URL."
    );
  }
  if (base !== "") {
    console.log("Invalid URL. Please provide a valid URL.");
  }

  return `${baseURL}${uri}`;
}

export default async function getYoutubeURLFromPremiumTuberApp(
  premiumtuberAppURLList
) {
  if (!premiumtuberAppURLList instanceof Array) {
    return console.log("Invalid input. Please provide an array of URLs.");
  }
  const youtubeVideoIdList = [];
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });
  const page = await browser.newPage();

  for (const url of premiumtuberAppURLList) {
    const sanitizedURL = sanitizeURL(url);
    await page.goto(sanitizedURL);

    const youtubeVideoId = new Promise((resolve) =>
      page
        .waitForSelector("::-p-xpath(//main/section/div/div/iframe)")
        .then((iframe) => {
          let placeholderURL = "";
          if (!iframe) {
            console.log("Cannot find iframe.");
          } else {
            iframe.contentFrame().then((frame) => {
              placeholderURL = frame
                .url()
                .replace("https://www.youtube.com/embed/", "");
            });
          }
          resolve(placeholderURL);
        })
    );
    youtubeVideoIdList.push(youtubeVideoId);
  }

  await browser.close();
  return youtubeVideoIdList;
}
