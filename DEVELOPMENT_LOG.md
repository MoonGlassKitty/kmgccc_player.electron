# Development Log

## 2026-06-08

- BK 背景颜色改回封面主题色方向，使用 HSB 转 RGB 输出以避免 HSL 高亮度混白导致的灰白感。
- dot 点阵改为独立反色变量，不再让 BK 背景或浮动 shape 取反色。
- 提高 BK 背景、dot 渐变和点阵的有效饱和度，减少底色与覆盖层被白色冲淡。
- dot 双层显示对齐 Swift：内圈使用大点半径，外圈使用小点半径，两层共享固定网格位置。
- 清空 Windows 端默认假歌；修复本地导入歌曲 ID 使用路径前缀导致多首歌冲突的问题，改为 SHA-256 路径 hash。
- 资料库持久化扩展到播放列表；批量导入后不再自动播放，并支持按当前专辑/艺人/播放列表队列切歌。

## 2026-06-09

- BK 背景状态切换增加 paint reveal 闸门，dot-a/dot-b 必须等刷漆遮罩完成后才开始点阵运动，避免点阵在遮罩下提前跑完。
- 切歌时 BK surface 保存独立主题快照：旧背景保持旧歌颜色，新歌颜色只随 paint mask 刷入，遮罩完成后再完整切换。
- BK paint 进入层增加首帧 opacity gate，避免 mask sprite 第 0 帧漏出下一首主题导致切歌瞬间整体变鲜艳。
- 纯油漆/image 阶段切歌前冻结旧 surface 当前 phase，避免 previous 层重挂载后从 phase-a 重启造成背景跳变；dot 阶段保持原逻辑。
- BK image phase 改为通过 surface 主题快照同步命中 tint cache，避免 previous image 重挂载时先渲染 loading 空背景造成纯油漆切歌跳变。
- 纯油漆 image→image transition 增加与 17 帧 paint mask 同步的轻量刷痕高光层，让无 dot 的油漆阶段也有可见小动效。
- BK surface 普通/切歌落点改为 6 桶 seed 选择：image 仅 1/6，dot-a 到 dot-e 占 5/6，并给 dot-b/d 使用反向运动。
- BK 小点缀生成改为多候选避让采样，按尺寸和距离惩罚初始重叠，并按边缘方向打散初始落点。
- 底部播放进度垫层从 width 动画改为 transform scaleX，并将 audio timeupdate 先直写 CSS 变量、降低 React playbackTime 刷新频率，减少对 BK 点缀动画的抢占。
