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
- BK image/油漆状态染色调整：tinted background 的色阶从浅第一主题色改为深一些的第一主题色到第二主题色，增强刷漆时的色彩分层，dot 状态不受影响。
- 底部时间条性能隔离：播放进度动画从连续 linear 改为低频 steps，时间条层使用独立 3D 合成和 isolation，普通播放时 React playbackTime 刷新从 8s 降到 30s，减少与 BK shape/dot 动画抢帧。
- 底部时间条按合并层重写：移除额外透明 rail/fill 子层，播放进度改由底栏 `.mini-player::before` 自身绘制；`mini-timeline-layer` 只保留底部透明 slider 命中层，避免独立时间条动画与 BK/home 点缀抢帧或盖住播放按钮。
- 导入播放列表封面接入 mac 素材库 `cov1`-`cov4`：解出对应 encrypted XCAssets，移除“第一首歌封面”伪兜底；仅导入列表按稳定 hash 显示自动封面，资料库/普通播放列表保持统一 logo。
- 播放列表 logo 修正为透明无底图标；导入列表 cov 保留模板图并按稳定 hash 增加随机染色滤镜，避免灰度模板原样显示。
- Home 性能优化：滚动状态改为 DOM class，不再触发 React 重渲染；home 点缀从每帧 canvas 重绘改为一次性染色贴图 + DOM transform 合成，保留玻璃参数和点缀外观，自动滚动采样约从 36fps 提升到 51fps。
- 左右侧大玻璃调厚：`lg-sidebar` blur 从 2.4 提到 3.2，左导航栏和右歌词栏乳白 alpha 从 0.38 提到 0.48，边缘白度同步提高。
- 设置页按 Swift 继续翻译：外观页接入全局取色、底栏进度、跟随系统、歌词背景、主页卡片材质和主页板块顺序；全屏播放页复用窗口播放的皮肤/歌词/LED 结构但保存独立 fullscreen key；音频页接入 `lookaheadMs` 视觉时钟补偿；数据页接入资料库位置、延后导入补全、批量补全、缓存清理、重置和匿名统计开关。`npm run typecheck` 与 `npm run build` 已通过。
- 继续按 Swift 完善外观设置：主页板块顺序 raw id 改为 `listeningFootprint` 并兼容旧 `stats`；排序控件从上/下按钮改为 pointer 拖拽、占位胶囊和浮动跟手行；补上 `manualAppearance` 手动浅/深色状态和视觉反馈；数据页按钮不再在 IPC 不可用时静默成功，初始化设置后会刷新应用。`npm run typecheck` 与 `npm run build` 已通过。
- 修正主页板块顺序设置样式：保留“艺人”文案，按源程序截图补左侧图标、大号浅灰胶囊行、右侧三横拖拽柄和浅灰列表容器。窗口/全屏播放 LED 改成扁平化圆点条，默认值同步 Swift `LEDDefaults`；播放页 LED 接入 WebAudio `AnalyserNode`，`ledCount`、`ledBrightnessLevels`、`ledCutoffHz`、`ledSpeed` 现在会实际影响显示。`npm run typecheck` 与 `npm run build` 已通过。
- LED 外观继续校正：外层恢复液态玻璃 pill，未点亮的 LED 点默认完全透明，只有亮度值大于 0 时才显色；保留 analyser 驱动和设置页预览共用样式。`npm run typecheck` 与 `npm run build` 已通过。
- LED 默认态再次微调：压低外层液态玻璃乳白底，未点亮灯不再实心发灰，只保留极淡白色轮廓；播放/预览点亮时才填入主题色。`npm run typecheck` 与 `npm run build` 已通过。
- LED 默认态按反馈改为灰色实心灯底，点亮时混入主题色；外层底部液态玻璃乳白底进一步压低到几乎没有，只保留很淡轮廓。`npm run typecheck` 与 `npm run build` 已通过。
- LED 外层玻璃乳白继续降低：背景 alpha 从 0.025 降到 0.008，内轮廓和阴影同步压低，只保留近乎透明的玻璃边界。`npm run typecheck` 与 `npm run build` 已通过。
- LED 外层玻璃继续压低白色 tint，并单独覆盖 `glass-panel` 边框/内高光/内阴影变量；底部状态栏提高乳白 alpha 但削弱边框、内高光和阴影，降低浮雕感。`npm run typecheck` 与 `npm run build` 已通过。
- 歌词交互修正：歌词点击现在走扣除当前显示提前量后的专用 seek，避免跳到错误位置；鼠标移到歌词行时临时关闭 AMLL blur；歌词渲染质量改为只记录精度档位 `0.45 / 0.55 / 0.75`，不再参与字号缩放。`npm run typecheck` 与 `npm run build` 已通过。
- 歌词点按进一步改成 `pointerdown` 直跳，侧栏和全屏歌词都不再只依赖 `click`，减少偶发点按无响应。`npm run typecheck` 与 `npm run build` 已通过。
- 歌词跳转再修正：目标时间额外前移 50ms，避免命中判定边界时落回上一句。`npm run typecheck` 与 `npm run build` 已通过。
- 歌词点击/滚动改回 AMLL 原生事件路径：移除自定义透明命中层和 DOM 测量映射，点击直接使用 `onLyricLineClick` 返回的行索引 seek，并给 AMLL 短暂 `isSeeking` 状态；滚轮/手势不再被覆盖层吃掉，底栏时间也改回真实播放时间而非歌词提前时间。`npm run typecheck` 与 `npm run build` 已通过。
- 歌词栏液态/磨砂背景切换修正：移除歌词侧栏 inline `--filter-url`，让 `lyrics-bg-clear/sidebar` 能真正覆盖；液态模式继续使用 `lg-sidebar` 折射滤镜，磨砂模式改为高 blur、低边缘/内阴影的普通 frosted glass。`npm run typecheck` 与 `npm run build` 已通过。
- 全屏播放外观选择按 Swift 区分窗口/全屏皮肤：新增全屏专属 `fullscreen.coverGradientBlur` 选项并置顶，补右侧填充和模糊半径设置；皮肤预览改为 Swift `SkinPreviewViews` 的中性向量结构，并从本机 macOS SF Symbols 导出 `music.note` / `photo` 用于源程序同款预览图。`npm run typecheck` 与 `npm run build` 已通过。
