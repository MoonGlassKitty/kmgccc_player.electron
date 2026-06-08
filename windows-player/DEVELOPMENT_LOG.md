# Development Log

## 2026-06-08

- Re-read Swift `BKColorEngine` and `FileImportService` before changing the Windows port.
- Matched song import behavior closer to Swift: multi-select can include folders, folders are scanned recursively, supported extensions include Swift's audio set plus Chromium-playable ogg/opus, and per-file failures no longer discard successful imports.
- Reworked BK theme extraction so the first background tone comes from the artwork area-dominant color and the second tone comes from salient artwork color candidates, avoiding the previous gray/desaturated background path.
- Verified `npm run typecheck && npm run build`, confirmed local NetEase music files exist, and captured now-playing route/theme screenshots under `windows-player/work/screenshots/`.
