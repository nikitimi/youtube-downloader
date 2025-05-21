Added 8link cleaner for extracting only the 8link URLs from texts
To use:

- Paste the block of texts inside 8link-cleaning.txt

Changes (integrations/playwright-express):

- Retain emojis from song titles, but removed invalid characters.
- Download mode has been passed for every single song.
- automate has been renamed to `processSongList` and been moved to utils.
- `resultHolderSchema` has been changed for better readability.
- Added tryCatch for awaited function that may cause crashes.
- plaintexts has been moved to `textfiles` directory for decluttering.
- Added `POST` route `api/v1/fetchVideoID` for converting 8link.cc URLs to YouTube URLs.
- Added `POST` route `api/v1/downloadSongs/` for downloading song list.
