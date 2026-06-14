# kmgccc_player.electron

Linux Electron 分支。

语言：[English](README.md) | 中文

可以在顶部选择查看英文版本。

该项目主要由 AI 开发，不保证实用性和安全性。

这是 `kmgccc_player` 的 Linux Electron 开发分支。

该分支有意移除了原始 Swift/macOS 源码。需要 Swift 参考代码、视觉行为或布局常量时，请使用 `main`。

## 项目范围

- Linux Electron 应用
- 本地音乐导入与播放
- AMLL 歌词渲染
- 在合成器支持允许的情况下实现 Liquid Glass 风格 UI
- 在确定合适媒体会话后端后实现 Linux 外部播放集成

## 外部播放方向

Electron 播放源切换应保持和其他平台分支相同的用户模型：

- `第三方音乐软件`
- `其他源`
- `自动检测`

Linux 实现需要单独决定，可能应走 MPRIS/DBus，而不是 Windows GSMTC 或 macOS MediaRemote。

## 命令

```bash
cd windows-player
npm install
npm run typecheck
npm run build
```

## 分支策略

- Linux Electron 工作提交到该分支。
- 不要把 `myPlayer2/` 或 `kmgccc_player.xcodeproj/` 重新加入该分支。
- 使用 `main` 作为 Swift 参考分支。
- 共享 Electron 改动应保持易于同步到 `mgkccc-win` 和 `mgkccc-mac`。
