# mgkccc Player Electron - Windows 分支

这是 **mgkccc** 的 Windows Electron 分支。

本项目基于原作者的 **kmgccc** 软件继续开发与适配。原项目名称为 **kmgccc**，本仓库维护的版本名称为 **mgkccc**。

## 作者说明

- 原作者：**kmgccc** 的作者
- 当前维护者：**MoonGlassKitty**
- 当前项目名：**mgkccc**

感谢原作者对 kmgccc 的设计与实现。本仓库在原项目基础上继续进行 Windows 端 Electron 适配、功能补充与体验优化。

## 项目范围

- Windows 10/11 x64 Electron 应用
- 本地音乐导入与播放
- AMLL 歌词渲染
- Liquid Glass 风格界面
- Windows 第三方音乐软件播放源集成

## 第三方播放

侧边栏播放源切换支持：

- 第三方音乐软件
- 其他源
- 自动检测

Windows 端通过 GSMTC 读取和控制外部播放状态：

- 优先使用 NodeRT：`@nodert-win11/windows.media.control`
- 当原生模块不可用时，回退到 PowerShell WinRT 路径

## 开发命令

```bash
cd windows-player
npm install
npm run typecheck
npm run build
npm run package:win
```

## 分支说明

- 当前分支用于 Windows Electron 开发。
- macOS Swift 原始源码不保留在该 Windows 分支中。
- 如需参考 Swift 布局常量、视觉行为或 MediaRemote 实现，请查看对应主线/参考分支。
- 共享 Electron 改动应尽量保持易于 cherry-pick 到 macOS 与 Linux 分支。
