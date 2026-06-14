# kmgccc_player Electron - macOS 分支

语言：[English](README.md) | 中文

可以在顶部选择查看英文版本。

这是 `kmgccc_player` 的 macOS Electron 开发分支。

该分支有意移除了原始 Swift/macOS 源码。需要 Swift 参考代码时，请使用 `main`。该分支应在 Electron 中实现 macOS 行为，而不是通过编辑 Swift 实现。

## 项目范围

- macOS Electron 应用
- 本地音乐导入与播放
- AMLL 歌词渲染
- Liquid Glass 风格 UI
- 通过 Electron 监控 macOS 外部播放

## 外部播放方向

Electron 播放源切换应暴露：

- `第三方音乐软件`
- `其他源`
- `自动检测`

macOS 外部播放应参考 Swift 中的 MediaRemote adapter 路径，但实现放在 Electron 主进程：

- `mediaremote-adapter.pl`
- `MediaRemoteAdapter.framework`
- 可用时使用 `MediaRemoteAdapterTestClient`

不要在该分支修改 Swift 源码。如果行为不明确，请查看 `main`。

## 命令

```bash
cd windows-player
npm install
npm run typecheck
npm run build
```

## 分支策略

- macOS Electron 工作提交到该分支。
- 不要把 `myPlayer2/` 或 `kmgccc_player.xcodeproj/` 重新加入该分支。
- 使用 `main` 作为 Swift 参考分支。
- 共享 Electron 改动应保持易于同步到 `mgkccc-win` 和 `mgkccc-linux`。
