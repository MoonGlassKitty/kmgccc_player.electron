# kmgccc_player.electron

语言：[English](README.md) | 中文

可以在顶部选择查看英文版本。

该项目主要由 AI 开发，不保证实用性和安全性。

这是 `kmgccc_player` 的 Windows/macOS/Linux Electron 移植工作区，`main` 分支保留原始 Swift/macOS 源码作为视觉和行为参考。

## 分支

- `main`：标准参考分支。保留原始 Swift 源码和 Electron 实现。
- `mgkccc-win`：Windows Electron 开发分支。该分支移除了 Swift 源码，以保持分支聚焦。
- `mgkccc-mac`：macOS Electron 开发分支。该分支移除了 Swift 源码；需要 Swift 参考时使用 `main`。
- `mgkccc-linux`：Linux Electron 开发分支。该分支移除了 Swift 源码；需要 Swift 参考时使用 `main`。

## 目录内容

- `myPlayer2/`：原始 Swift/macOS 应用源码。仅在 `main` 上作为参考。
- `kmgccc_player.xcodeproj/`：原始 Xcode 工程。仅在 `main` 上作为参考。
- `windows-player/`：Electron + React 实现。虽然目录名包含 Windows，但现在它是平台分支共用的 Electron 代码库。
- `AGENTS.md`：给 Codex/协作者看的项目规则和开发流程。
- `CONTRIBUTING.md`：贡献和分支协作规则。
- `DEVELOPMENT_LOG.md`：持续开发日志。代码工作后应添加简短记录。
- `bug-list.md`：已知 BUG 和可选开发方向清单。

## Electron 应用

```bash
cd windows-player
npm install
npm run typecheck
npm run build
```

Windows portable 构建：

```bash
npm run package:win
```

Electron 应用已经包含外部播放源切换：

- `第三方音乐软件`
- `其他源`
- `自动检测`

Windows 优先使用 GSMTC/NodeRT，原生模块不可用时回退到 PowerShell WinRT。

## 开发规则

- 视觉和行为改动应以 `main` 上的 Swift 实现为参考。
- 除非任务明确要求，否则不要在平台分支修改 Swift 源码。
- 除非明确要求，否则不要为了性能捷径移除 Liquid Glass/blur 效果。
- 每个有意义的检查点都应创建本地提交。
- 平台专属工作推送到对应平台分支，不要直接推送到无关平台分支。

## 推荐工作流

```bash
git checkout mgkccc-win    # Windows Electron 工作
git checkout mgkccc-mac    # macOS Electron 工作
git checkout mgkccc-linux  # Linux Electron 工作
git checkout main          # Swift 参考 + 共享基线
```

当平台分支需要 Swift 参考代码时：

```bash
git checkout main -- myPlayer2 kmgccc_player.xcodeproj
```

仅在临时检查或明确参考更新时使用这种方式。
