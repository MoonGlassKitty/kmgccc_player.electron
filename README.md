# kmgccc_player Electron - Linux Branch

This branch is for Linux Electron development.

The original Swift/macOS source is intentionally removed from this branch. Use `main` when you need Swift reference code, visual behavior, or layout constants.

## Scope

- Linux Electron app.
- Local music import/playback.
- AMLL lyrics rendering.
- Liquid Glass style UI where compositor support allows it.
- Linux external playback integration when a practical media-session backend is selected.

## External Playback Direction

The Electron source switcher should keep the same user model as the other platform branches:

- `第三方音乐软件`
- `其他源`
- `自动检测`

Linux implementation should be decided separately, likely through MPRIS/DBus rather than Windows GSMTC or macOS MediaRemote.

## Commands

```bash
cd windows-player
npm install
npm run typecheck
npm run build
```

## Branch Policy

- Commit Linux Electron work here.
- Do not re-add `myPlayer2/` or `kmgccc_player.xcodeproj/` to this branch.
- Use `main` as the Swift reference branch.
- Keep shared Electron changes easy to cherry-pick to `mgkccc-win` and `mgkccc-mac`.
