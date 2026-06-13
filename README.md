# kmgccc_player Electron - macOS Branch

This branch is for macOS Electron development.

The original Swift/macOS source is intentionally removed from this branch. Use `main` when you need Swift reference code. This branch should implement macOS behavior in Electron, not by editing Swift.

## Scope

- macOS Electron app.
- Local music import/playback.
- AMLL lyrics rendering.
- Liquid Glass style UI.
- macOS external playback monitoring through Electron.

## External Playback Direction

The Electron source switcher should expose:

- `第三方音乐软件`
- `其他源`
- `自动检测`

macOS external playback should use the MediaRemote adapter path from the Swift reference, but implemented in Electron main process:

- `mediaremote-adapter.pl`
- `MediaRemoteAdapter.framework`
- `MediaRemoteAdapterTestClient` when available

Do not modify Swift source on this branch. If behavior is unclear, inspect `main`.

## Commands

```bash
cd windows-player
npm install
npm run typecheck
npm run build
```

## Branch Policy

- Commit macOS Electron work here.
- Do not re-add `myPlayer2/` or `kmgccc_player.xcodeproj/` to this branch.
- Use `main` as the Swift reference branch.
- Keep shared Electron changes easy to cherry-pick to `mgkccc-win` and `mgkccc-linux`.
