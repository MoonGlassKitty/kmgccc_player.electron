# kmgccc_player Electron - Windows Branch

This branch is for Windows Electron development.

The original Swift/macOS source is intentionally removed from this branch. Use `main` when you need Swift reference code, layout constants, visual behavior, or MediaRemote implementation details.

## Scope

- Windows 10/11 x64 Electron app.
- Local music import/playback.
- AMLL lyrics rendering.
- Liquid Glass style UI.
- Windows external playback source integration.

## External Playback

The sidebar source switcher exposes:

- `第三方音乐软件`
- `其他源`
- `自动检测`

Windows uses GSMTC:

- NodeRT first: `@nodert-win11/windows.media.control`
- PowerShell WinRT fallback when the native module is unavailable

The macOS Swift source is not present here by design.

## Commands

```bash
cd windows-player
npm install
npm run typecheck
npm run build
npm run package:win
```

## Branch Policy

- Commit Windows-only work here.
- Do not re-add `myPlayer2/` or `kmgccc_player.xcodeproj/` to this branch.
- If Swift reference is needed, inspect `main`.
- Keep shared Electron changes easy to cherry-pick to `mac` and `linux`.
