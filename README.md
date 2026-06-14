# mgkccc_player Electron - Windows Branch

Language: English | [中文](README.zh-CN.md)

你可在顶部切换为中文版README。

You can use the language links at the top to view the Chinese version.

This is the Windows Electron branch for **mgkccc_player**.

This project continues development and adaptation based on the original **kmgccc** software. The original project name is **kmgccc**; the maintained version in this repository is named **mgkccc_player**.

## Authors

- Original author: the author of **kmgccc**
- Current maintainer: **MoonGlassKitty**
- Current project name: **mgkccc_player**

Thanks to the original author for the design and implementation of kmgccc. This repository continues Windows Electron adaptation, feature work, and experience improvements on top of the original project.

## Scope

- Windows 10/11 x64 Electron app
- Local music import and playback
- AMLL lyrics rendering
- Liquid Glass style UI
- Windows third-party music app playback source integration

## Third-Party Playback

The sidebar playback source switcher supports:

- Third-party music apps
- Other sources
- Auto detect

On Windows, external playback state is read and controlled through GSMTC:

- Prefer NodeRT: `@nodert-win11/windows.media.control`
- Fall back to the PowerShell WinRT path when the native module is unavailable

## Development Commands

```bash
cd windows-player
npm install
npm run typecheck
npm run build
npm run package:win
```

## Branch Notes

- This branch is for Windows Electron development.
- The original macOS Swift source is not kept in this Windows branch.
- To reference Swift layout constants, visual behavior, or MediaRemote implementation details, use the main/reference branch.
- Shared Electron changes should be kept easy to cherry-pick to the macOS and Linux branches.
