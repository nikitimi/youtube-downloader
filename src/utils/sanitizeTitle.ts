export default function sanitizeTitle(title: string) {
  const cleanerRegExp = /([#%&{}\\\/><*\?$":@+`\|=]*)/g;
  const sanitizedTitle = title.replace(cleanerRegExp, "").trim();
  let returnTitle = sanitizedTitle;
  if (sanitizedTitle.includes("mp3")) {
    returnTitle = sanitizedTitle.replace(/mp3/g, "");
  }

  return `${returnTitle}.mp3`;
}
