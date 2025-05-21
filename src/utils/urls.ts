export const rootURL = new URL("../../", import.meta.url);
export const textfilesDirectoryURL = new URL("textfiles/", rootURL);
export const rawDirectoryURL = new URL("raw/", rootURL);

export const resultLogURL = new URL("result-log.txt", textfilesDirectoryURL);
export const songListURL = new URL("8link.txt", textfilesDirectoryURL);

export const renamedResultLogURL = () =>
  new URL(`${Date.now()}-result.temp.txt`, textfilesDirectoryURL);
export const renamedSongListURL = () =>
  new URL(`${Date.now()}.temp.txt`, textfilesDirectoryURL);
