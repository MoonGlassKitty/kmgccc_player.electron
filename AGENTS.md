# kmgccc_player Windows Translation Notes

## Project Goal

Build a Windows 10 x86_64 high-fidelity development version of `kmgccc_player`, translating the macOS 26 local music player experience to Windows with visual fidelity as the highest priority.

This is not a direct SwiftUI/AppKit compilation target. Treat it as a Windows-side reimplementation that preserves the original product feeling, especially the macOS 26 Liquid Glass-like visual language.

## Current User Decisions

- Target platform: Windows 10 x86_64.
- First deliverable: high-fidelity development build. Whether the output is portable/green or installer-based is less important than visual and experiential quality.
- Reference app: the user has installed the `kmgccc_player.dmg` release locally on this macOS 26 machine. The app is already open and has imported songs. Codex may operate it and take screenshots directly for visual comparison without asking each time.
- Visual reference screenshot from the user shows the installed app on a local artist/library page with imported music.
- Preferred stack: Electron is acceptable and preferred if it better reproduces the large glass effect.
- Liquid Glass reference: https://www.liquid-glass.pro/generator.html
- Windows system Acrylic/Mica/DWM alone is not enough. The implementation should first make the custom Liquid Glass effect convincing, then optionally use platform effects only as supporting layers.
- Overall appearance: preserve the macOS-style app identity. Window controls/titlebar buttons should use Windows-style controls rather than macOS red/yellow/green dots.
- Assets: the user authorizes direct decryption and use of the `.kmgasset` resources in this fork. It is acceptable to port the encrypted asset loading path for Windows.
- Initial feature scope: local music import and playback first. Other integrations can come later once local playback works.
- Apple Music / external playback integration can be ignored for the first phase on Windows.
- The user has test music available in the installed macOS app. If software operation requires a skill, tool, or authorization, say so; otherwise proceed autonomously.
- Dependencies: common libraries may be added as needed. Ask only for critical or unusual dependencies.
- Screen recording/screenshot permission is available. Codex may screenshot and record the installed macOS app and Windows/Electron prototype to inspect runtime visuals.
- After every code-writing session, write a concise development log entry so long-running work does not lose context.
- After each implementation checkpoint, create a local git commit so every meaningful working state can be restored.

## Engineering Direction

Default direction: create a Windows-oriented Electron application, likely using Vite + React + TypeScript, unless later repository constraints make another route clearly better.

Prioritize:

1. Visual shell and Liquid Glass system.
2. Local library import and playback.
3. Mini player, playback controls, progress, volume, and queue state.
4. Album-art color extraction and theme tinting.
5. Lyrics panel and AMLL reuse.
6. Cassette/CD/fullscreen skins and visualizer effects.
7. Later integrations such as NCM, LDDC, cover search, and other metadata services.

## Functional Roadmap Notes

- Runtime verification should prefer the Electron application when app behavior, local file access, playback, window chrome, or screenshots are involved. The web renderer port is still useful for fast layout iteration, but local media features must be validated in Electron.
- First functional milestone: import a single local audio file, decode/play it through Chromium/Electron media playback, show it in the local library, and wire it to the mini player.
- Library model should become album-centered: every track must belong to at least one album. A minimal synced album record only needs artist and album artwork at first.
- Metadata sync milestone: use API integration to sync single-track metadata, including lyrics, artist, album cover, and album-level information.
- Lyrics milestone: add a dedicated lyrics playback page after local import/playback and metadata sync are stable.
- Approved/reference libraries and services from the macOS app/settings page:
  - `applemusic-like-lyrics` / AMLL for lyric rendering and Apple Music-like lyrics behavior.
  - `apple-audio-visualization` for later audio visualization.
  - `LDDC` for lyrics and lyric metadata workflows.
  - `QQMusicApi` for music metadata lookup where appropriate.
  - `sacad` as a cover-art lookup reference.
  - `ncmdump` for NetEase encrypted audio conversion support later.
  - `WhatsNewKit` is a macOS-side reference only unless a Windows/Electron equivalent is needed.

## Visual Requirements

- Build a custom glass system inspired by macOS 26 Liquid Glass and the referenced generator page.
- The first prototype glass was too close to plain frosted translucency. Future glass work must emulate the reference generator more directly: `backdrop-filter`, SVG turbulence/displacement, strong inner shadow/highlight, tint opacity, and edge thickness/refraction must all be present.
- The Liquid Glass generator is treated as an approved/open-source implementation reference. Prefer copying its core effect model directly instead of inventing a parallel approximation: background + glass block, `::before` tint/inner shadow, `::after` backdrop blur + `filter: url(#glass-distortion)`.
- Preserve the generator parameter names where possible (`innerShadowColor`, `innerShadowBlur`, `innerShadowSpread`, `glassTintColor`, `glassTintOpacity`, `frostBlurRadius`, `noiseFrequency`, `noiseStrength`). When the user sends tuned generator parameters later, map them directly into the Windows prototype.
- Important surfaces: sidebar, toolbar controls, search field, lyrics panel, bottom floating mini player, selection pills, playback mode selector, and modal/settings surfaces.
- Effects should include layered translucency, blur, tint, highlight, thin borders, subtle shadows, depth, and dynamic album-art-driven color.
- Screenshots should be compared against both repository screenshots and the installed macOS release.
- Effect quality is more important than completing every feature in the first pass.

## Local Reference Material

- macOS source app: `myPlayer2/`
- macOS Xcode project: `kmgccc_player.xcodeproj`
- Installed release source package: `kmgccc_player.dmg`
- Screenshots: `screenshots/`
- Web/AMLL integration: `applemusic-like-lyrics-kmgcccplayer-integration/`
- Encrypted first-party art assets: `EncryptedArtAssets/`

Useful source files already identified:

- `myPlayer2/Utilities/GlassPillView.swift`
- `myPlayer2/Utilities/GlassStyleTokens.swift`
- `myPlayer2/Views/MiniPlayer/MiniPlayerView.swift`
- `myPlayer2/Services/Lyrics/LyricsBridge.swift`
- `myPlayer2/Skins/NowPlaying/KmgcccCassetteSkin.swift`
- `myPlayer2/Skins/NowPlaying/RotatingCoverSkin.swift`
- `myPlayer2/Services/Theme/EncryptedArtAssetLoader.swift`

## Version Notes

The local DMG reports `CFBundleShortVersionString = 2.1.1`, while local `pages/version.json` still reports `1.3.1` and GitHub latest redirects to tag `7` whose page title is `Release 1.3.1`. Use the installed DMG as the visual runtime reference unless the user later says otherwise.

## Workflow Notes

- Do not treat the original SwiftUI/AppKit UI as directly portable.
- Reuse concepts, constants, algorithms, and AMLL web assets where practical.
- Keep user-facing progress concise.
- Before inspecting images/screenshots sent in the conversation or uploading them into context, run the local `image-preflight` skill compression workflow first to avoid context blowups.
- Before major implementation choices, inspect the existing repo shape first.
- Since effect fidelity is the point, use screenshot verification early and often.
