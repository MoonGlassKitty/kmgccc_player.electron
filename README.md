# kmgccc_player.winToX86

Windows/macOS/Linux Electron translation workspace for `kmgccc_player`, with the original Swift/macOS source kept as the visual and behavior reference.

## Branches

- `main`: canonical reference branch. Keeps both the original Swift source and the Electron implementation.
- `win`: Windows Electron development branch. Swift source is removed there to keep the branch focused.
- `mac`: macOS Electron development branch. Swift source is removed there; use `main` when Swift reference is needed.
- `linux`: Linux Electron development branch. Swift source is removed there; use `main` when Swift reference is needed.

## What Lives Here

- `myPlayer2/`: original Swift/macOS app source. Reference only on `main`.
- `kmgccc_player.xcodeproj/`: original Xcode project. Reference only on `main`.
- `windows-player/`: Electron + React implementation. Despite the name, this is now the shared Electron codebase for platform branches.
- `AGENTS.md`: project rules for Codex/development workflow.
- `DEVELOPMENT_LOG.md`: running implementation log. Add a concise entry after code-writing sessions.
- `交接.md`: handoff notes for continuing development on Windows.

## Electron App

```bash
cd windows-player
npm install
npm run typecheck
npm run build
```

Windows portable build:

```bash
npm run package:win
```

The Electron app already contains the external playback source switcher:

- `第三方音乐软件`
- `其他源`
- `自动检测`

Windows uses GSMTC/NodeRT first and falls back to PowerShell WinRT when the native module is unavailable.

## Development Rules

- Keep visual and behavior changes grounded in the Swift implementation on `main`.
- Do not modify Swift source on platform branches unless the task explicitly says to.
- Do not remove Liquid Glass/blur effects for performance shortcuts unless explicitly requested.
- Commit each meaningful checkpoint locally.
- Push branch-specific work to its platform branch, not directly to unrelated platform branches.

## Recommended Workflow

```bash
git checkout win    # Windows Electron work
git checkout mac    # macOS Electron work
git checkout linux  # Linux Electron work
git checkout main   # Swift reference + shared baseline
```

When a platform branch needs Swift reference code:

```bash
git checkout main -- myPlayer2 kmgccc_player.xcodeproj
```

Use that only for temporary inspection or a deliberate reference update.
