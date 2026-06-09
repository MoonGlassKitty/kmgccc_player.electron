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
- 播放中 mini 进度更新进一步降频：普通播放约 1.1s 更新一次 CSS/React，歌词打开时保留更高刷新，seek 仍即时同步。
- 底部时间轴改为 CSS 自跑动画：播放中从当前比例按剩余时长动画到 100%，timeupdate 不再持续推动时间轴，只在歌词或离散同步时刷新状态。
- 底部时间轴点击 rail 的水平判定范围从左右 20px 改为左右 1px，对齐底栏进度垫层的实际铺设范围。
- 底部时间轴从 mini-player 玻璃伪元素拆为独立顶层 sibling，复用同一定位但 z-index 高于玻璃，避免进度动画挂在 backdrop/filter 玻璃本体上。
- 修复独立时间轴点击失效：timeline layer 直接覆盖底栏和底部 42px 判定区，rail 不再用负 bottom 伸出 paint containment。
- 分层后 seek 立即写入 `.mini-timeline-layer` 的进度变量，避免点击跳转后视觉进度仍写到旧 mini-player 层。
- 右键编辑弹窗开始按 Swift sheet 重写：扩展艺人/专辑/歌曲详细元数据持久化字段，并将弹窗改为纯白 metadata sheet 外壳。
- 右键编辑弹窗封面区接入本地图片选择和移除，艺人/专辑自定义封面通过曲目聚合字段持久化并优先显示。
- 歌曲编辑弹窗的 TTML/LRC/TXT 导入按钮接入本地文件读取，导入内容立即进入歌词 draft 并可保存。
- 歌曲编辑弹窗“查找元数据”接入现有 `syncTrackInfo` IPC，同步标题、艺人、专辑、封面和歌词 draft，并显示查找结果状态。
- 专辑/艺人编辑弹窗“查找元数据”接入新的 IPC 查找流程，并修复 preload 中 updateAlbum/updateArtist 仍使用旧参数导致保存对象无法传递的问题。
- 编辑弹窗保存按钮增加 draft 变更检测，没有改动时保持禁用，贴近 Swift sheet 的保存行为。
- 歌曲编辑弹窗歌词搜索按钮接入 `lookupLyrics` IPC，复用现有歌词获取逻辑并将搜索结果写入歌词 draft。
- 编辑弹窗按 Swift 尺寸区分歌曲 550x750 与艺人/专辑 560x720，并在封面、元数据、歌词区域之间补分割线。
- 完善编辑弹窗剩余按钮行为：封面“查找封面”接入对应元数据查找流程，歌词搜索的模式/翻译/平台按钮改为可切换状态并参与搜索参数。
- 按 Swift 封面流程继续完善：新增 `lookupCover` IPC 返回候选封面列表，封面区显示可选缩略图；艺人“生成封面”改为按名称生成稳定渐变占位图。
- 左侧导航栏艺人/专辑按 Swift Sidebar 改为 disclosure 层级：标题行只控制折叠展开，展开后显示“查看全部”和具体艺人/专辑子项。
- 封面查找按 Swift/QQMusicApi 源补齐：主进程接入 `musicu.fcg` QQMusic 搜索结构，网易云专辑搜索返回多候选，并将远程封面下载校验成 data URL 后再交给渲染层保存/显示，避免热链封面失败。
- 艺人“生成封面”按 Swift `ArtistArtworkGenerator` 参数重写：优先从该艺人歌曲封面抽取调色板，使用 HSB clamp、稳定角度、低饱和 fallback、高光和对比文字；专辑“使用歌曲封面”改为取专辑内歌曲封面。
- BK 背景按 Swift 状态分支校正：dot 阶段不再透出动态背景图和大块径向底纹，只保留主题纯色底与轻量渐变层；image/油漆阶段继续使用 tinted background 变换，并整体降低 BK 背景、dot、shape 的饱和度。
- BK dot 可见度微调：dot 窗口改为正常混合，压低底层渐变干扰，提高大小点阵层透明度和轻微对比，保持低饱和但让点阵更清楚。
- BK dot 调回中值：dot 色相改为浅第一主题色附近，降低反色感；运动 travel 小幅收窄、duration 放慢，对比度和透明度从偏强值回收。
