import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  ArrowDownUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Disc3,
  House,
  ListMusic,
  Maximize2,
  MessageSquareQuote,
  Minus,
  Music2,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  Shuffle,
  SkipBack,
  SkipForward,
  Square,
  Sun,
  UserRound,
  Volume2,
  X
} from 'lucide-react'
import { LiquidGlassFilters } from './LiquidGlassFilter'
import shape1 from './assets/bk-themes/shapes/shape1.png'
import shape2 from './assets/bk-themes/shapes/shape2.png'
import shape3 from './assets/bk-themes/shapes/shape3.png'
import shape4 from './assets/bk-themes/shapes/shape4.png'
import shape5 from './assets/bk-themes/shapes/shape5.png'
import shape6 from './assets/bk-themes/shapes/shape6.png'
import shape7 from './assets/bk-themes/shapes/shape7.png'
import shape8 from './assets/bk-themes/shapes/shape8.png'
import shape9 from './assets/bk-themes/shapes/shape9.png'
import shape10 from './assets/bk-themes/shapes/shape10.png'
import shape11 from './assets/bk-themes/shapes/shape11.png'
import './styles.css'

type Track = {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  duration: number
  artworkUrl?: string
  sourcePath?: string
  sourceUrl?: string
  originalSourcePath?: string
  convertedFromNcm?: boolean
  conversionOutputPath?: string
  conversionFormat?: string
  lyricsText?: string
  syncedLyrics?: string
  metadataSource?: string
}

type ImportSyncState = {
  title: string
  artist: string
  detail: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  processedCount: number
  totalCount: number
}

const albumArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/15/a4/a4/15a4a47c-62db-07c3-d14f-e78c3c8dec85/artwork.jpg/600x600bb.jpg'

const altArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e9/c4/38/e9c43893-e743-269a-6a47-c11120717177/artwork.jpg/600x600bb.jpg'

const demoSyncedLyrics = [
  '[00:00.00]歌词预览已准备',
  '[00:06.00]导入单曲后会自动同步真实歌词',
  '[00:12.00]当前播放行会停在视觉中心',
  '[00:18.00]点击带时间轴的行可以跳转播放',
  '[00:24.00]右侧侧栏和完整界面共用同一套时间轴',
  '[00:30.00]后续可以替换为 AMLL 渲染组件'
].join('\n')

const fallbackHomeSnapshot: HomeSnapshot = {
  heroTrack: { id: 'myth', title: 'Myth', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: 'Myth', albumId: 'album-myth', duration: 241, syncedLyrics: demoSyncedLyrics },
  tracks: [
    { id: 'renascence', title: '!renascence!', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 113 },
    { id: 'basin', title: 'Basin', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 320 },
    { id: 'bones', title: 'Bones', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 232 },
    { id: 'float', title: 'Float', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 270 },
    { id: 'myth', title: 'Myth', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: 'Myth', albumId: 'album-myth', duration: 241, syncedLyrics: demoSyncedLyrics },
    { id: 'udong', title: '乌东', artist: 'MoonGlassKitty', artistId: 'artist-moonglasskitty', album: '乌东', albumId: 'album-udong', duration: 163 }
  ],
  artists: [
    { id: 'artist-moonglasskitty', name: 'MoonGlassKitty', trackCount: 1, albumCount: 1 },
    { id: 'artist-acloudyskye', name: 'acloudyskye', artworkUrl: albumArtwork, trackCount: 5, albumCount: 1 }
  ],
  albums: [
    { id: 'album-last', title: "This Won't Be The Last...", artist: 'acloudyskye', artistId: 'artist-acloudyskye', artworkUrl: albumArtwork, trackCount: 4 },
    { id: 'album-myth', title: 'Myth', artist: 'acloudyskye', artistId: 'artist-acloudyskye', artworkUrl: altArtwork, trackCount: 1 },
    { id: 'album-udong', title: '乌东', artist: 'MoonGlassKitty', artistId: 'artist-moonglasskitty', artworkUrl: altArtwork, trackCount: 1 }
  ],
  playlists: [{ id: 'playlist-import-june-5', name: '导入于 6月 5', artworkUrl: altArtwork, trackCount: 6, trackIds: ['renascence', 'basin', 'bones', 'float', 'myth', 'udong'] }],
  stats: {
    totalTrackCount: 6,
    weeklyPlayCount: 5,
    weeklyListeningSeconds: 480,
    favoriteArtistName: 'acloudyskye',
    favoriteArtistPlayCount: 3,
    ranking: [
      { trackId: 'myth', title: 'Myth', artist: 'acloudyskye', artworkUrl: altArtwork, playCount: 2, score: 0.92 },
      { trackId: 'udong', title: '乌东', artist: 'MoonGlassKitty', artworkUrl: altArtwork, playCount: 1, score: 0.76 }
    ],
    dailyListeningMap: { '2026-06-05': 3, '2026-06-06': 2 }
  }
}

function useElasticScroll<T extends HTMLElement>(): {
  scrollRef: React.RefObject<T | null>
  elasticOffset: number
  isSettling: boolean
  isScrolling: boolean
  onWheel: (event: React.WheelEvent<T>) => void
  onScroll: () => void
} {
  const scrollRef = React.useRef<T>(null)
  const scrollEndTimerRef = React.useRef<number | null>(null)
  const scrollingRef = React.useRef(false)
  const [isScrolling, setIsScrolling] = React.useState(false)
  const onWheel = React.useCallback((_event: React.WheelEvent<T>) => {}, [])
  const onScroll = React.useCallback(() => {
    if (!scrollingRef.current) {
      scrollingRef.current = true
      setIsScrolling(true)
    }

    if (scrollEndTimerRef.current !== null) {
      window.clearTimeout(scrollEndTimerRef.current)
    }
    scrollEndTimerRef.current = window.setTimeout(() => {
      scrollingRef.current = false
      scrollEndTimerRef.current = null
      setIsScrolling(false)
    }, 140)
  }, [])

  React.useEffect(() => () => {
    if (scrollEndTimerRef.current !== null) {
      window.clearTimeout(scrollEndTimerRef.current)
    }
  }, [])

  return { scrollRef, elasticOffset: 0, isSettling: false, isScrolling, onWheel, onScroll }
}

type AppRoute =
  | { name: 'home' }
  | { name: 'allTracks' }
  | { name: 'artistDetail'; id: string; title: string }
  | { name: 'albumDetail'; id: string; title: string }
  | { name: 'playlistDetail'; id: string; title: string }

type DetailRoute = Exclude<AppRoute, { name: 'home' }>

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = safeSeconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

function albumById(snapshot: HomeSnapshot): Map<string, HomeAlbumCard> {
  return new Map(snapshot.albums.map((album) => [album.id, album]))
}

function trackArtwork(track: HomeTrack | Track | null | undefined, albums: Map<string, HomeAlbumCard>): string {
  if (!track) return albumArtwork
  return track.artworkUrl || albums.get(track.albumId)?.artworkUrl || albumArtwork
}

function albumArtworkFor(album?: Pick<HomeAlbumCard, 'artworkUrl'> | null): string {
  return album?.artworkUrl || albumArtwork
}

function coverThemeFor(track: HomeTrack | Track | null | undefined, albums: Map<string, HomeAlbumCard>): React.CSSProperties {
  if (!track) {
    return {
      '--cover-accent': 'rgba(116, 124, 132, 0.34)',
      '--cover-accent-border': 'rgba(66, 72, 78, 0.22)',
      '--cover-accent-text': '#68717a',
      '--cover-accent-shadow': 'rgba(20, 24, 28, 0.08)',
      '--ambient-shape-1': 'rgba(110, 116, 123, 0.3)',
      '--ambient-shape-2': 'rgba(154, 158, 164, 0.24)',
      '--ambient-shape-3': 'rgba(82, 87, 94, 0.18)'
    } as React.CSSProperties
  }

  const artwork = trackArtwork(track, albums)
  const isAltArtwork = artwork === altArtwork || track?.albumId === 'album-myth' || track?.albumId === 'album-udong'
  const accent = isAltArtwork ? 'rgba(124, 143, 104, 0.42)' : 'rgba(88, 190, 229, 0.38)'
  const border = isAltArtwork ? 'rgba(92, 110, 75, 0.34)' : 'rgba(38, 137, 174, 0.24)'
  const text = isAltArtwork ? '#66754e' : '#1680ad'
  const shadow = isAltArtwork ? 'rgba(92, 110, 75, 0.11)' : 'rgba(15, 85, 120, 0.09)'
  const ambient1 = isAltArtwork ? 'rgba(138, 176, 96, 0.5)' : 'rgba(66, 178, 235, 0.54)'
  const ambient2 = isAltArtwork ? 'rgba(224, 132, 142, 0.42)' : 'rgba(238, 106, 142, 0.45)'
  const ambient3 = isAltArtwork ? 'rgba(218, 188, 72, 0.42)' : 'rgba(232, 197, 70, 0.42)'

  return {
    '--cover-accent': accent,
    '--cover-accent-border': border,
    '--cover-accent-text': text,
    '--cover-accent-shadow': shadow,
    '--ambient-shape-1': ambient1,
    '--ambient-shape-2': ambient2,
    '--ambient-shape-3': ambient3
  } as React.CSSProperties
}

type RgbColor = {
  r: number
  g: number
  b: number
}

type HslColor = {
  h: number
  s: number
  l: number
}

const artworkThemeCache = new Map<string, React.CSSProperties>()

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: lightness }
  }

  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0)
  if (max === green) hue = (blue - red) / delta + 2
  if (max === blue) hue = (red - green) / delta + 4
  return { h: hue * 60, s: saturation, l: lightness }
}

function hslToRgb({ h, s, l }: HslColor): RgbColor {
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const hue = h / 60
  const x = chroma * (1 - Math.abs((hue % 2) - 1))
  const match = l - chroma / 2
  let red = 0
  let green = 0
  let blue = 0

  if (hue >= 0 && hue < 1) [red, green, blue] = [chroma, x, 0]
  else if (hue < 2) [red, green, blue] = [x, chroma, 0]
  else if (hue < 3) [red, green, blue] = [0, chroma, x]
  else if (hue < 4) [red, green, blue] = [0, x, chroma]
  else if (hue < 5) [red, green, blue] = [x, 0, chroma]
  else [red, green, blue] = [chroma, 0, x]

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255)
  }
}

function boostThemeColor(color: RgbColor): RgbColor {
  const hsl = rgbToHsl(color)
  return hslToRgb({
    h: hsl.h,
    s: clampNumber(hsl.s * 1.28 + 0.08, 0, 0.86),
    l: clampNumber(hsl.l * 0.94 + 0.05, 0.22, 0.72)
  })
}

function rgbaString(color: RgbColor, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
}

function hexString(color: RgbColor): string {
  const channel = (value: number): string => value.toString(16).padStart(2, '0')
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`
}

function colorDistance(first: RgbColor, second: RgbColor): number {
  return Math.hypot(first.r - second.r, first.g - second.g, first.b - second.b)
}

function hueDistance(first: RgbColor, second: RgbColor): number {
  const a = rgbToHsl(first).h
  const b = rgbToHsl(second).h
  const delta = Math.abs(a - b)
  return Math.min(delta, 360 - delta)
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function extractArtworkThemeColors(artworkUrl: string): Promise<RgbColor[]> {
  const image = await loadImageElement(artworkUrl)
  const canvas = document.createElement('canvas')
  const side = 72
  canvas.width = side
  canvas.height = side
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return []
  context.drawImage(image, 0, 0, side, side)

  const buckets = new Map<string, { color: RgbColor; count: number; score: number }>()
  const pixels = context.getImageData(0, 0, side, side).data
  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3]
    if (alpha < 160) continue
    const r = pixels[index]
    const g = pixels[index + 1]
    const b = pixels[index + 2]
    const hsl = rgbToHsl({ r, g, b })
    if (hsl.l > 0.96 && hsl.s < 0.12) continue
    if (hsl.l < 0.06) continue
    if (hsl.s < 0.28) continue

    const key = `${r >> 4}-${g >> 4}-${b >> 4}`
    const color = {
      r: (r >> 4) * 16 + 8,
      g: (g >> 4) * 16 + 8,
      b: (b >> 4) * 16 + 8
    }
    const existing = buckets.get(key)
    const chroma = Math.max(r, g, b) - Math.min(r, g, b)
    const score = (0.55 + hsl.s * 1.45) * (0.72 + Math.min(1, chroma / 96))
    if (existing) {
      existing.count += 1
      existing.score += score
    } else {
      buckets.set(key, { color, count: 1, score })
    }
  }

  const ranked = Array.from(buckets.values()).sort((a, b) => b.score * Math.sqrt(b.count) - a.score * Math.sqrt(a.count))
  const picked: RgbColor[] = []
  for (const entry of ranked) {
    const color = boostThemeColor(entry.color)
    if (rgbToHsl(color).s < 0.36) continue
    if (picked.every((item) => colorDistance(item, color) > 46 || hueDistance(item, color) > 24)) {
      picked.push(color)
    }
    if (picked.length >= 3) break
  }

  return picked
}

function themeStyleFromExtractedColors(colors: RgbColor[], fallback: React.CSSProperties): React.CSSProperties {
  const first = colors[0]
  const second = colors[1] ?? colors[0]
  const third = colors[2] ?? colors[1] ?? colors[0]
  if (!first || !second || !third) return fallback

  return {
    ...fallback,
    '--cover-accent': rgbaString(first, 0.42),
    '--cover-accent-border': rgbaString(first, 0.28),
    '--cover-accent-text': hexString(boostThemeColor(first)),
    '--cover-accent-shadow': rgbaString(first, 0.1),
    '--ambient-shape-1': rgbaString(first, 0.54),
    '--ambient-shape-2': rgbaString(second, 0.5),
    '--ambient-shape-3': rgbaString(third, 0.48)
  } as React.CSSProperties
}

type AmbientSizeTier = 'small' | 'medium' | 'large' | 'ultra'
type AmbientSide = 'left' | 'right'

type AmbientShapeAsset = {
  name: string
  url: string
  kind: 'normal' | 'featuredLarge' | 'ultra'
}

type AmbientShapeSpec = {
  id: number
  asset: AmbientShapeAsset
  color: string
  side: AmbientSide
  tier: AmbientSizeTier
  baseYViewport: number
  nominalSide: number
  boundaryOffset: number
  baseRotation: number
  parallaxX: number
  parallax: number
  rotationPerPoint: number
  rotationClamp: number
  opacity: number
}

const ambientShapeAssets: AmbientShapeAsset[] = [
  { name: 'shape1.png', url: shape1, kind: 'normal' },
  { name: 'shape2.png', url: shape2, kind: 'normal' },
  { name: 'shape3.png', url: shape3, kind: 'normal' },
  { name: 'shape4.png', url: shape4, kind: 'normal' },
  { name: 'shape5.png', url: shape5, kind: 'normal' },
  { name: 'shape6.png', url: shape6, kind: 'normal' },
  { name: 'shape7.png', url: shape7, kind: 'normal' },
  { name: 'shape8.png', url: shape8, kind: 'normal' },
  { name: 'shape9.png', url: shape9, kind: 'featuredLarge' },
  { name: 'shape10.png', url: shape10, kind: 'ultra' },
  { name: 'shape11.png', url: shape11, kind: 'featuredLarge' }
]

const ambientShapeColors = [
  'var(--ambient-shape-1)',
  'var(--ambient-shape-2)',
  'var(--ambient-shape-3)'
]

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function makeAmbientRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function ambientRange(random: () => number, min: number, max: number): number {
  return min + (max - min) * random()
}

function ambientPick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length) % items.length]
}

function ambientNominalSide(tier: AmbientSizeTier, random: () => number): number {
  switch (tier) {
  case 'small':
    return ambientRange(random, 86, 240)
  case 'medium':
    return ambientRange(random, 190, 410)
  case 'large':
    return ambientRange(random, 330, 660)
  case 'ultra':
    return ambientRange(random, 620, 980)
  }
}

function ambientParallax(tier: AmbientSizeTier, random: () => number): number {
  switch (tier) {
  case 'small':
    return ambientRange(random, 0.45, 0.95)
  case 'medium':
    return ambientRange(random, 0.28, 0.65)
  case 'large':
    return ambientRange(random, 0.12, 0.32)
  case 'ultra':
    return ambientRange(random, 0.08, 0.22)
  }
}

function ambientRotationPerPoint(tier: AmbientSizeTier, random: () => number): number {
  switch (tier) {
  case 'small':
    return random() < 0.5 ? ambientRange(random, -0.18, 0.08) : ambientRange(random, -0.08, 0.18)
  case 'medium':
    return random() < 0.5 ? ambientRange(random, -0.08, 0.04) : ambientRange(random, -0.04, 0.08)
  case 'large':
    return ambientRange(random, -0.018, 0.018)
  case 'ultra':
    return ambientRange(random, -0.01, 0.01)
  }
}

function ambientRotationClamp(tier: AmbientSizeTier): number {
  switch (tier) {
  case 'small':
    return 110
  case 'medium':
    return 92
  case 'large':
    return 44
  case 'ultra':
    return 18
  }
}

function makeAmbientSeed(): number {
  const values = new Uint32Array(1)
  window.crypto?.getRandomValues(values)
  return values[0] || Math.floor(Math.random() * 0xffffffff)
}

function makeAmbientShapeSpecs(seed: number): AmbientShapeSpec[] {
  const random = makeAmbientRandom(seed)
  const largeCount = random() < 0.55 ? 2 : 3
  const mediumCount = random() < 0.5 ? 3 : 4
  let smallCount = random() < 0.5 ? 2 : 3
  if (largeCount + mediumCount + smallCount < 8) smallCount += 1
  if (largeCount + mediumCount + smallCount > 10) smallCount -= 1
  const tiers: AmbientSizeTier[] = [
    ...Array.from({ length: largeCount }, () => 'large' as const),
    ...Array.from({ length: mediumCount }, () => 'medium' as const),
    ...Array.from({ length: smallCount }, () => 'small' as const)
  ]
  const count = tiers.length
  const visibleCount = 3
  let previousAsset: AmbientShapeAsset | null = null
  const featuredAssets = ambientShapeAssets.filter((asset) => asset.kind !== 'normal')

  const edgeSlot = (index: number): Partial<AmbientShapeSpec> | null => {
    switch (index) {
    case 0:
      return {
        asset: ambientPick(featuredAssets, random),
        side: 'left',
        tier: 'large',
        baseYViewport: ambientRange(random, 0.2, 0.48),
        nominalSide: ambientRange(random, 470, 640),
        boundaryOffset: ambientRange(random, -420, -230),
        color: ambientShapeColors[0],
        opacity: ambientRange(random, 0.46, 0.58)
      }
    case 1:
      return {
        asset: ambientPick(featuredAssets, random),
        side: 'right',
        tier: 'large',
        baseYViewport: ambientRange(random, 0.66, 0.84),
        nominalSide: ambientRange(random, 430, 620),
        boundaryOffset: ambientRange(random, -40, 90),
        color: ambientShapeColors[1],
        opacity: ambientRange(random, 0.46, 0.58)
      }
    case 2:
      return {
        asset: largeCount > 2 ? ambientPick(featuredAssets, random) : ambientPick(ambientShapeAssets, random),
        side: 'left',
        tier: largeCount > 2 ? 'large' : 'medium',
        baseYViewport: ambientRange(random, 1.04, 1.24),
        nominalSide: largeCount > 2 ? ambientRange(random, 360, 520) : ambientRange(random, 220, 360),
        boundaryOffset: largeCount > 2 ? ambientRange(random, -320, -150) : ambientRange(random, -70, 150),
        color: ambientShapeColors[2],
        opacity: ambientRange(random, 0.48, 0.6)
      }
    default:
      return null
    }
  }

  return Array.from({ length: count }, (_entry, index) => {
    const anchored = edgeSlot(index)
    const pool = (index < largeCount ? featuredAssets : ambientShapeAssets).filter((asset) => asset !== previousAsset)
    const asset = anchored?.asset ?? ambientPick(pool.length ? pool : ambientShapeAssets, random)
    previousAsset = asset
    const tier = anchored?.tier ?? tiers[index]
    const side = anchored?.side ?? (index % 2 === 0 ? 'left' : 'right')
    const visible = index < visibleCount
    const laneIndex = Math.floor(index / 2)
    const laterLaneIndex = Math.floor((index - visibleCount) / 2)
    const baseYViewport = anchored?.baseYViewport ?? (visible
      ? clampNumber(0.28 + laneIndex * 0.52 + (side === 'right' ? 0.2 : 0) + ambientRange(random, -0.06, 0.08), 0.18, 1.18)
      : clampNumber(1.26 + laterLaneIndex * 0.48 + (side === 'right' ? 0.24 : 0) + ambientRange(random, -0.08, 0.1), 1.2, 2.42))
    const isUltra = tier === 'ultra'
    const boundaryOffset = anchored?.boundaryOffset ?? (side === 'left'
      ? ambientRange(random, tier === 'large' || isUltra ? -380 : -180, tier === 'large' || isUltra ? -160 : 160)
      : ambientRange(random, tier === 'large' || isUltra ? -40 : -220, tier === 'large' || isUltra ? 110 : 120))

    return {
      id: index,
      asset,
      color: anchored?.color ?? ambientShapeColors[index % ambientShapeColors.length],
      side,
      tier,
      baseYViewport,
      nominalSide: anchored?.nominalSide ?? ambientNominalSide(tier, random),
      boundaryOffset,
      baseRotation: tier === 'ultra' ? ambientRange(random, -48, 48) : ambientRange(random, -70, 70),
      parallaxX: ambientRange(random, -0.0025, 0.0025),
      parallax: ambientParallax(tier, random),
      rotationPerPoint: ambientRotationPerPoint(tier, random),
      rotationClamp: ambientRotationClamp(tier),
      opacity: anchored?.opacity ?? (tier === 'ultra' ? 0.5 : tier === 'large' ? 0.52 : tier === 'medium' ? 0.5 : 0.46)
    }
  })
}

function snapshotWithImportedTrack(snapshot: HomeSnapshot, importedTrack: LocalAudioImport): HomeSnapshot {
  const tracks = [importedTrack, ...snapshot.tracks.filter((track) => track.id !== importedTrack.id)]
  const albumTrackCount = tracks.filter((track) => track.albumId === importedTrack.albumId).length
  const albums = snapshot.albums.some((album) => album.id === importedTrack.albumId)
    ? snapshot.albums.map((album) =>
      album.id === importedTrack.albumId
        ? { ...album, artist: importedTrack.artist, artistId: importedTrack.artistId, trackCount: albumTrackCount }
        : album
    )
    : [
      {
        id: importedTrack.albumId,
        title: importedTrack.album,
        artist: importedTrack.artist,
        artistId: importedTrack.artistId,
        artworkUrl: importedTrack.artworkUrl,
        trackCount: albumTrackCount
      },
      ...snapshot.albums
    ]
  const artists = snapshot.artists.some((artist) => artist.id === importedTrack.artistId)
    ? snapshot.artists.map((artist) =>
      artist.id === importedTrack.artistId
        ? {
          ...artist,
          trackCount: tracks.filter((track) => track.artistId === importedTrack.artistId).length,
          albumCount: albums.filter((album) => album.artistId === importedTrack.artistId).length
        }
        : artist
    )
    : [
      {
        id: importedTrack.artistId,
        name: importedTrack.artist,
        artworkUrl: importedTrack.artworkUrl,
        trackCount: tracks.filter((track) => track.artistId === importedTrack.artistId).length,
        albumCount: albums.filter((album) => album.artistId === importedTrack.artistId).length
      },
      ...snapshot.artists
    ]
  const importPlaylist = snapshot.playlists.find((playlist) => playlist.id === 'playlist-local-imports')
  const importedTrackIds = importPlaylist ? [importedTrack.id, ...importPlaylist.trackIds.filter((id) => id !== importedTrack.id)] : [importedTrack.id]
  const playlists = importPlaylist
    ? snapshot.playlists.map((playlist) =>
      playlist.id === importPlaylist.id
        ? { ...playlist, trackCount: importedTrackIds.length, trackIds: importedTrackIds }
        : playlist
    )
    : [
      {
        id: 'playlist-local-imports',
        name: '本地导入',
        artworkUrl: importedTrack.artworkUrl,
        trackCount: importedTrackIds.length,
        trackIds: importedTrackIds
      },
      ...snapshot.playlists
    ]

  return {
    ...snapshot,
    heroTrack: importedTrack,
    tracks,
    artists,
    albums,
    playlists,
    stats: {
      ...snapshot.stats,
      totalTrackCount: tracks.length
    }
  }
}

function snapshotWithSyncedTrack(snapshot: HomeSnapshot, result: TrackMetadataSyncResult): HomeSnapshot {
  const syncedTrack = result.track
  const tracks = snapshot.tracks.map((track) => (track.id === syncedTrack.id ? { ...track, ...syncedTrack } : track))
  const hasTrack = tracks.some((track) => track.id === syncedTrack.id)
  const nextTracks = hasTrack ? tracks : [syncedTrack, ...tracks]
  const albumTrackCount = nextTracks.filter((track) => track.albumId === syncedTrack.albumId).length
  const nextAlbum = {
    id: result.album.id,
    title: result.album.title,
    artist: result.album.artist,
    artistId: result.album.artistId,
    artworkUrl: result.album.artworkUrl,
    trackCount: albumTrackCount
  }
  const albums = snapshot.albums.some((album) => album.id === nextAlbum.id)
    ? snapshot.albums.map((album) => (album.id === nextAlbum.id ? { ...album, ...nextAlbum } : album))
    : [nextAlbum, ...snapshot.albums]
  const artistTrackCount = nextTracks.filter((track) => track.artistId === syncedTrack.artistId).length
  const artistAlbumCount = albums.filter((album) => album.artistId === syncedTrack.artistId).length
  const artists = snapshot.artists.some((artist) => artist.id === syncedTrack.artistId)
    ? snapshot.artists.map((artist) =>
      artist.id === syncedTrack.artistId
        ? { ...artist, name: syncedTrack.artist, artworkUrl: syncedTrack.artworkUrl || artist.artworkUrl, trackCount: artistTrackCount, albumCount: artistAlbumCount }
        : artist
    )
    : [
      {
        id: syncedTrack.artistId,
        name: syncedTrack.artist,
        artworkUrl: syncedTrack.artworkUrl,
        trackCount: artistTrackCount,
        albumCount: artistAlbumCount
      },
      ...snapshot.artists
    ]
  const playlists = snapshot.playlists.map((playlist) =>
    playlist.id === 'playlist-local-imports' && !playlist.trackIds.includes(syncedTrack.id)
      ? { ...playlist, trackCount: playlist.trackCount + 1, trackIds: [syncedTrack.id, ...playlist.trackIds] }
      : playlist
  )

  return {
    ...snapshot,
    heroTrack: snapshot.heroTrack?.id === syncedTrack.id ? { ...snapshot.heroTrack, ...syncedTrack } : snapshot.heroTrack,
    tracks: nextTracks,
    artists,
    albums,
    playlists,
    stats: {
      ...snapshot.stats,
      totalTrackCount: nextTracks.length
    }
  }
}

function snapshotWithTrackDuration(snapshot: HomeSnapshot, trackId: string, duration: number): HomeSnapshot {
  const normalizedDuration = Math.max(0, Math.round(duration))
  return {
    ...snapshot,
    heroTrack: snapshot.heroTrack?.id === trackId ? { ...snapshot.heroTrack, duration: normalizedDuration } : snapshot.heroTrack,
    tracks: snapshot.tracks.map((track) => (track.id === trackId ? { ...track, duration: normalizedDuration } : track))
  }
}

function tracksForRoute(route: DetailRoute, snapshot: HomeSnapshot): HomeTrack[] {
  switch (route.name) {
  case 'allTracks':
    return snapshot.tracks
  case 'artistDetail':
    if (route.id === 'all-artists') return snapshot.tracks
    return snapshot.tracks.filter((track) => track.artistId === route.id)
  case 'albumDetail':
    if (route.id === 'all-albums') return snapshot.tracks
    return snapshot.tracks.filter((track) => track.albumId === route.id)
  case 'playlistDetail': {
    const playlist = snapshot.playlists.find((entry) => entry.id === route.id)
    if (!playlist) return []
    const trackIds = new Set(playlist.trackIds)
    return snapshot.tracks.filter((track) => trackIds.has(track.id))
  }
  }
}

function detailArtwork(route: DetailRoute, snapshot: HomeSnapshot, albums: Map<string, HomeAlbumCard>): string {
  if (route.name === 'albumDetail' && route.id !== 'all-albums') {
    return albumArtworkFor(albums.get(route.id))
  }
  if (route.name === 'artistDetail' && route.id !== 'all-artists') {
    const artist = snapshot.artists.find((entry) => entry.id === route.id)
    const firstTrack = snapshot.tracks.find((track) => track.artistId === route.id)
    return artist?.artworkUrl || trackArtwork(firstTrack, albums)
  }
  if (route.name === 'playlistDetail') {
    const playlist = snapshot.playlists.find((entry) => entry.id === route.id)
    return playlist?.artworkUrl || trackArtwork(tracksForRoute(route, snapshot)[0], albums)
  }
  return trackArtwork(snapshot.heroTrack, albums)
}

function detailSubtitle(route: DetailRoute, snapshot: HomeSnapshot, tracks: HomeTrack[]): string {
  if (route.name === 'albumDetail' && route.id !== 'all-albums') {
    const album = snapshot.albums.find((entry) => entry.id === route.id)
    return `${album?.artist ?? ''} · ${tracks.length} 首歌曲`
  }
  if (route.name === 'artistDetail' && route.id !== 'all-artists') {
    const artist = snapshot.artists.find((entry) => entry.id === route.id)
    return `${tracks.length} 首歌曲 · ${artist?.albumCount ?? 0} 张专辑`
  }
  if (route.name === 'playlistDetail') return `${tracks.length} 首歌曲`
  if (route.name === 'albumDetail') return `${snapshot.albums.length} 张专辑`
  if (route.name === 'artistDetail') return `${snapshot.artists.length} 位艺人`
  return `${tracks.length} 首歌曲`
}

const HomeAmbientShapesLayer = React.memo(function HomeAmbientShapesLayer({
  isActive
}: {
  isActive: boolean
}): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const specs = React.useMemo(() => makeAmbientShapeSpecs(makeAmbientSeed()), [])

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    let frame = 0
    let scrollTrackingFrame = 0
    let scrollTrackingStopTimer = 0
    let scrollElement: HTMLElement | null = null
    let disposed = false
    let loadedImages = new Map<string, HTMLImageElement>()
    const tintedCache = new Map<string, HTMLCanvasElement>()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resolveColor = (color: string): string => {
      const variableMatch = color.match(/^var\((--[^)]+)\)$/)
      if (!variableMatch) return color
      return getComputedStyle(root).getPropertyValue(variableMatch[1]).trim() || color
    }

    const tintedImage = (asset: AmbientShapeAsset, color: string): HTMLCanvasElement | null => {
      const image = loadedImages.get(asset.name)
      if (!image) return null
      const cacheKey = `${asset.name}|${color}`
      const cached = tintedCache.get(cacheKey)
      if (cached) return cached

      const tintCanvas = document.createElement('canvas')
      tintCanvas.width = image.naturalWidth
      tintCanvas.height = image.naturalHeight
      const context = tintCanvas.getContext('2d')
      if (!context) return null
      context.drawImage(image, 0, 0)
      context.globalCompositeOperation = 'source-in'
      context.fillStyle = color
      context.fillRect(0, 0, tintCanvas.width, tintCanvas.height)
      tintedCache.set(cacheKey, tintCanvas)
      return tintCanvas
    }

    const applyTransforms = (): void => {
      frame = 0
      if (!loadedImages.size) return
      const rootRect = root.getBoundingClientRect()
      if (rootRect.width <= 0 || rootRect.height <= 0) return
      const context = canvas.getContext('2d')
      if (!context) return

      const dpr = Math.min(window.devicePixelRatio || 1, 1)
      const pixelWidth = Math.max(1, Math.round(rootRect.width * dpr))
      const pixelHeight = Math.max(1, Math.round(rootRect.height * dpr))
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
        canvas.style.width = `${rootRect.width}px`
        canvas.style.height = `${rootRect.height}px`
      }

      const sidebarRect = document.querySelector('.sidebar')?.getBoundingClientRect()
      const lyricsRect = document.querySelector('.lyrics-side-panel')?.getBoundingClientRect()
      const scrollTop = isActive ? (scrollElement?.scrollTop ?? 0) : 0
      const viewportHeight = Math.max(rootRect.height, 680)
      const virtualHeight = Math.max(viewportHeight * 2.6, viewportHeight + 1400)
      const centerMinX = sidebarRect ? sidebarRect.right - rootRect.left : 280
      const centerMaxX = lyricsRect ? lyricsRect.left - rootRect.left : rootRect.width
      const centerWidth = Math.max(520, centerMaxX - centerMinX)
      const layoutProgress = clampNumber((centerWidth - 560) / 620, 0, 1)
      const fluidProgress = layoutProgress * layoutProgress * (3 - 2 * layoutProgress)
      const fluidBoundaryScale = 0.48 + fluidProgress * 0.52
      const shapeScale = 0.72 + fluidProgress * 0.28

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, rootRect.width, rootRect.height)

      for (const spec of specs) {
        const isUltra = spec.tier === 'ultra'
        const side = clampNumber(spec.nominalSide * shapeScale, spec.tier === 'small' ? 54 : 96, isUltra ? 980 : 760)
        const boundary = spec.side === 'left' ? centerMinX : centerMaxX
        const boundaryOffset = isUltra
          ? spec.boundaryOffset * (0.82 + fluidProgress * 0.18)
          : spec.boundaryOffset * fluidBoundaryScale
        const baseX = clampNumber(
          boundary + boundaryOffset,
          -side * (isUltra ? 1.15 : 0.72),
          rootRect.width + side * (isUltra ? 1.15 : 0.72)
        )
        const baseY = spec.baseYViewport * viewportHeight
        const scrollX = reducedMotion ? 0 : clampNumber(scrollTop * spec.parallaxX, -8, 8)
        const scrollY = reducedMotion ? 0 : clampNumber(-scrollTop * spec.parallax, -virtualHeight, virtualHeight)
        const rotation = reducedMotion
          ? spec.baseRotation
          : spec.baseRotation + clampNumber(scrollTop * spec.rotationPerPoint, -spec.rotationClamp, spec.rotationClamp)
        const image = tintedImage(spec.asset, resolveColor(spec.color))
        if (!image) continue
        const drawX = baseX + scrollX
        const drawY = baseY + scrollY
        if (drawX < -side || drawX > rootRect.width + side || drawY < -side || drawY > rootRect.height + side) continue

        context.save()
        context.globalAlpha = spec.opacity
        context.translate(drawX, drawY)
        context.rotate((rotation * Math.PI) / 180)
        context.drawImage(image, -side / 2, -side / 2, side, side)
        context.restore()
      }
    }

    const requestApply = (): void => {
      if (frame) return
      frame = window.requestAnimationFrame(applyTransforms)
    }

    const stopScrollTracking = (): void => {
      scrollTrackingFrame = 0
    }

    const trackScrolling = (): void => {
      if (!isActive || !scrollElement || disposed) {
        stopScrollTracking()
        return
      }
      applyTransforms()
      scrollTrackingFrame = window.requestAnimationFrame(trackScrolling)
    }

    const startScrollTracking = (): void => {
      if (scrollTrackingFrame === 0) {
        scrollTrackingFrame = window.requestAnimationFrame(trackScrolling)
      }
      if (scrollTrackingStopTimer) {
        window.clearTimeout(scrollTrackingStopTimer)
      }
      scrollTrackingStopTimer = window.setTimeout(() => {
        if (scrollTrackingFrame) {
          window.cancelAnimationFrame(scrollTrackingFrame)
          scrollTrackingFrame = 0
        }
        requestApply()
      }, 180)
    }

    const handleScroll = (): void => {
      startScrollTracking()
      requestApply()
    }

    const handleWheel = (): void => {
      startScrollTracking()
    }

    const bindScrollElement = (): void => {
      scrollElement?.removeEventListener('wheel', handleWheel)
      scrollElement?.removeEventListener('scroll', handleScroll)
      scrollElement = isActive ? document.querySelector<HTMLElement>('.home-page') : null
      scrollElement?.addEventListener('wheel', handleWheel, { passive: true })
      scrollElement?.addEventListener('scroll', handleScroll, { passive: true })
      requestApply()
    }

    const resizeObserver = new ResizeObserver(requestApply)
    resizeObserver.observe(root)
    const themeObserver = new MutationObserver(() => {
      tintedCache.clear()
      requestApply()
    })
    const themeRoot = document.querySelector('.desktop-root')
    if (themeRoot) themeObserver.observe(themeRoot, { attributes: true, attributeFilter: ['style'] })
    Promise.all(
      ambientShapeAssets.map((asset) => new Promise<[string, HTMLImageElement]>((resolve, reject) => {
        const image = new Image()
        image.decoding = 'async'
        image.onload = () => resolve([asset.name, image])
        image.onerror = reject
        image.src = asset.url
      }))
    )
      .then((entries) => {
        if (disposed) return
        loadedImages = new Map(entries)
        requestApply()
      })
      .catch(() => {
        loadedImages = new Map()
      })

    bindScrollElement()
    const bindTimer = window.setTimeout(bindScrollElement, 80)

    return () => {
      disposed = true
      window.clearTimeout(bindTimer)
      if (scrollTrackingStopTimer) window.clearTimeout(scrollTrackingStopTimer)
      if (frame) window.cancelAnimationFrame(frame)
      if (scrollTrackingFrame) window.cancelAnimationFrame(scrollTrackingFrame)
      scrollElement?.removeEventListener('wheel', handleWheel)
      scrollElement?.removeEventListener('scroll', handleScroll)
      themeObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [isActive, specs])

  return (
    <div className="home-ambient-layer" ref={rootRef} aria-hidden="true">
      <canvas className="home-ambient-canvas" ref={canvasRef} />
    </div>
  )
})

function App(): React.ReactElement {
  const [homeSnapshot, setHomeSnapshot] = React.useState<HomeSnapshot>(fallbackHomeSnapshot)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const [sidebarWidth, setSidebarWidth] = React.useState(280)
  const [route, setRoute] = React.useState<AppRoute>({ name: 'home' })
  const [isLyricsSidebarOpen, setIsLyricsSidebarOpen] = React.useState(false)
  const [lyricsSidebarWidth, setLyricsSidebarWidth] = React.useState(460)
  const [isFullscreenLyricsOpen, setIsFullscreenLyricsOpen] = React.useState(false)
  const [currentId, setCurrentId] = React.useState(fallbackHomeSnapshot.heroTrack?.id ?? fallbackHomeSnapshot.tracks[0]?.id ?? '')
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [playbackTime, setPlaybackTime] = React.useState(0)
  const [playbackDuration, setPlaybackDuration] = React.useState(0)
  const [importSyncState, setImportSyncState] = React.useState<ImportSyncState | null>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const lastPlaybackTimeRef = React.useRef(0)
  const albums = React.useMemo(() => albumById(homeSnapshot), [homeSnapshot])
  const currentTrack = React.useMemo(
    () => homeSnapshot.tracks.find((track) => track.id === currentId) ?? homeSnapshot.heroTrack ?? homeSnapshot.tracks[0],
    [currentId, homeSnapshot]
  )
  const fallbackCoverThemeStyle = React.useMemo(() => coverThemeFor(currentTrack, albums), [albums, currentTrack])
  const currentArtworkUrl = React.useMemo(() => currentTrack ? trackArtwork(currentTrack, albums) : '', [albums, currentTrack])
  const [coverThemeStyle, setCoverThemeStyle] = React.useState<React.CSSProperties>(fallbackCoverThemeStyle)

  React.useEffect(() => {
    let cancelled = false
    setCoverThemeStyle(fallbackCoverThemeStyle)
    if (!currentTrack || !currentArtworkUrl) return

    const cached = artworkThemeCache.get(currentArtworkUrl)
    if (cached) {
      setCoverThemeStyle(cached)
      return
    }

    extractArtworkThemeColors(currentArtworkUrl)
      .then((colors) => {
        if (cancelled) return
        const nextTheme = themeStyleFromExtractedColors(colors, fallbackCoverThemeStyle)
        artworkThemeCache.set(currentArtworkUrl, nextTheme)
        setCoverThemeStyle(nextTheme)
      })
      .catch(() => {
        if (!cancelled) setCoverThemeStyle(fallbackCoverThemeStyle)
      })

    return () => {
      cancelled = true
    }
  }, [currentArtworkUrl, currentTrack, fallbackCoverThemeStyle])

  React.useEffect(() => {
    let cancelled = false

    window.kmgccc
      ?.getHomeSnapshot()
      .then((snapshot) => {
        if (cancelled) return
        setHomeSnapshot(snapshot)
        setCurrentId((value) => value || snapshot.heroTrack?.id || snapshot.tracks[0]?.id || '')
      })
      .catch(() => {
        setHomeSnapshot(fallbackHomeSnapshot)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const togglePlayback = React.useCallback(() => {
    setIsPlaying((value) => !value)
  }, [])
  const navigateHome = React.useCallback(() => {
    setRoute({ name: 'home' })
  }, [])
  const importAudioFile = React.useCallback(async () => {
    setImportSyncState({
      title: '准备导入',
      artist: '',
      detail: '选择文件后开始导入；NCM 会先转换为本地可播放音频',
      status: 'running',
      progress: 0.06,
      processedCount: 0,
      totalCount: 1
    })

    let importedTrack: LocalAudioImport | null | undefined
    try {
      importedTrack = await window.kmgccc?.importAudioFile()
    } catch {
      setImportSyncState({
        title: '导入失败',
        artist: '',
        detail: 'NCM 转换或音频导入失败',
        status: 'failed',
        progress: 1,
        processedCount: 0,
        totalCount: 1
      })
      return
    }

    if (!importedTrack) {
      setImportSyncState(null)
      return
    }

    setHomeSnapshot((snapshot) => snapshotWithImportedTrack(snapshot, importedTrack))
    setCurrentId(importedTrack.id)
    setRoute({ name: 'allTracks' })
    setPlaybackTime(0)
    setPlaybackDuration(0)
    setIsPlaying(true)

    setImportSyncState({
      title: importedTrack.title,
      artist: importedTrack.artist,
      detail: importedTrack.convertedFromNcm
        ? `NCM 已转换为 ${importedTrack.conversionFormat?.toUpperCase() ?? 'MP3'}，正在补全歌词、歌曲信息、歌手信息、专辑信息`
        : '正在补全歌词、歌曲信息、歌手信息、专辑信息',
      status: 'running',
      progress: importedTrack.convertedFromNcm ? 0.32 : 0.18,
      processedCount: 0,
      totalCount: 1
    })

    try {
      const result = await window.kmgccc?.syncTrackInfo(importedTrack)
      if (!result) throw new Error('sync unavailable')

      setHomeSnapshot((snapshot) => snapshotWithSyncedTrack(snapshot, result))
      setCurrentId(result.track.id)
      const completedDetail = result.track.convertedFromNcm
        ? `NCM 已转换为 ${result.track.conversionFormat?.toUpperCase() ?? 'MP3'}，${
          result.statuses.lyrics === 'completed' ? '已补全歌曲信息、专辑信息与歌词' : '已补全可用的歌曲信息与专辑信息'
        }`
        : result.statuses.lyrics === 'completed' ? '已补全歌曲信息、专辑信息与歌词' : '已补全可用的歌曲信息与专辑信息'
      setImportSyncState({
        title: result.track.title,
        artist: result.track.artist,
        detail: completedDetail,
        status: 'completed',
        progress: 1,
        processedCount: 1,
        totalCount: 1
      })
      window.setTimeout(() => setImportSyncState(null), 1400)
    } catch {
      setImportSyncState({
        title: importedTrack.title,
        artist: importedTrack.artist,
        detail: '补全失败，已保留本地导入信息',
        status: 'failed',
        progress: 1,
        processedCount: 1,
        totalCount: 1
      })
    }
  }, [])
  const toggleSidebar = React.useCallback(() => {
    setIsSidebarCollapsed((value) => {
      const next = !value
      if (!next && sidebarWidth < 220) {
        setSidebarWidth(280)
      }
      return next
    })
  }, [sidebarWidth])
  const selectTrack = React.useCallback((id: string) => {
    setCurrentId(id)
    setIsPlaying(true)
  }, [])
  const playHomeTrack = React.useCallback((trackId: string) => {
    setCurrentId(trackId)
    setIsPlaying(true)
  }, [])
  const toggleLyricsSidebar = React.useCallback(() => {
    setIsLyricsSidebarOpen((value) => !value)
  }, [])
  const toggleFullscreenLyrics = React.useCallback(() => {
    setIsFullscreenLyricsOpen((value) => !value)
  }, [])
  const handleSidebarResizeStart = React.useCallback((event: React.PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = isSidebarCollapsed ? 82 : sidebarWidth
    const minWidth = 82
    const maxWidth = 360
    const collapseThreshold = 118

    const handleMove = (moveEvent: PointerEvent) => {
      const nextWidth = clampNumber(startWidth + (moveEvent.clientX - startX), minWidth, maxWidth)
      if (nextWidth <= collapseThreshold) {
        setIsSidebarCollapsed(true)
        setSidebarWidth(minWidth)
      } else {
        setIsSidebarCollapsed(false)
        setSidebarWidth(nextWidth)
      }
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [isSidebarCollapsed, sidebarWidth])
  const handleLyricsResizeStart = React.useCallback((event: React.PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = lyricsSidebarWidth
    const minWidth = 380
    const maxWidth = 640

    const handleMove = (moveEvent: PointerEvent) => {
      setLyricsSidebarWidth(clampNumber(startWidth + (startX - moveEvent.clientX), minWidth, maxWidth))
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [lyricsSidebarWidth])
  const seekTo = React.useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(seconds)) return
    audio.currentTime = Math.max(0, seconds)
    lastPlaybackTimeRef.current = audio.currentTime
    setPlaybackTime(audio.currentTime)
  }, [])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!currentTrack?.sourceUrl) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      lastPlaybackTimeRef.current = 0
      setPlaybackTime(0)
      setPlaybackDuration(0)
      setIsPlaying(false)
      return
    }

    if (audio.src !== currentTrack.sourceUrl) {
      audio.src = currentTrack.sourceUrl
      audio.load()
      lastPlaybackTimeRef.current = 0
      setPlaybackTime(0)
    }

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false))
    }
  }, [currentTrack, isPlaying])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack?.sourceUrl) return

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [currentTrack?.sourceUrl, isPlaying])

  const updateAudioMetadata = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack || !Number.isFinite(audio.duration)) return

    setPlaybackDuration(audio.duration)
    if (currentTrack.duration <= 0) {
      setHomeSnapshot((snapshot) => snapshotWithTrackDuration(snapshot, currentTrack.id, audio.duration))
    }
  }, [currentTrack])

  const updateAudioTime = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const nextTime = audio.currentTime
    if (!audio.paused && Math.abs(nextTime - lastPlaybackTimeRef.current) < 0.18) return
    lastPlaybackTimeRef.current = nextTime
    setPlaybackTime(nextTime)
  }, [])

  const handleAudioEnded = React.useCallback(() => {
    setIsPlaying(false)
    setPlaybackTime(0)
  }, [])

  return (
    <div className={`desktop-root ${isFullscreenLyricsOpen ? 'fullscreen-lyrics-open' : ''}`} style={coverThemeStyle}>
      <audio ref={audioRef} onLoadedMetadata={updateAudioMetadata} onTimeUpdate={updateAudioTime} onEnded={handleAudioEnded} />
      <LiquidGlassFilters />
      <div
        className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isLyricsSidebarOpen ? 'lyrics-sidebar-visible' : ''}`}
        style={
          {
            '--sidebar-width': `${isSidebarCollapsed ? 82 : sidebarWidth}px`,
            '--lyrics-width': `${isLyricsSidebarOpen ? lyricsSidebarWidth : 0}px`
          } as React.CSSProperties
        }
      >
        <HomeAmbientShapesLayer isActive={route.name === 'home'} />
        <Sidebar
          snapshot={homeSnapshot}
          route={route}
          onNavigate={setRoute}
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          onResizeStart={handleSidebarResizeStart}
        />
        <WindowControls />
        <div className="titlebar-drag-region chrome-drag" aria-hidden="true" />

        <main className="content-pane">
          <Toolbar
            onNavigateHome={navigateHome}
            onImportAudioFile={importAudioFile}
            onToggleLyricsSidebar={toggleLyricsSidebar}
            isLyricsSidebarOpen={isLyricsSidebarOpen}
          />
          {route.name === 'home' ? (
            <HomePage snapshot={homeSnapshot} albums={albums} onNavigate={setRoute} onPlayTrack={playHomeTrack} />
          ) : (
            <LibraryDetailPage
              route={route}
              snapshot={homeSnapshot}
              albums={albums}
              currentId={currentId}
              onNavigate={setRoute}
              onSelect={selectTrack}
            />
          )}

          {currentTrack ? (
            <>
              {isFullscreenLyricsOpen ? <div className="mini-player-hover-zone no-drag" aria-hidden="true" /> : null}
              <MiniPlayer
                track={currentTrack}
                albums={albums}
                isPlaying={isPlaying}
                playbackTime={playbackTime}
                playbackDuration={playbackDuration || currentTrack.duration}
                onPlayPause={togglePlayback}
                onToggleFullscreenLyrics={toggleFullscreenLyrics}
                onSeek={seekTo}
              />
            </>
          ) : null}
          {importSyncState ? <ImportSyncCard state={importSyncState} onCancel={() => setImportSyncState(null)} /> : null}
        </main>
        {isLyricsSidebarOpen ? (
          <LyricsSidePanel
            track={currentTrack}
            albums={albums}
            playbackTime={playbackTime}
            isPlaying={isPlaying}
            onSeek={seekTo}
            onResizeStart={handleLyricsResizeStart}
          />
        ) : null}
        {isFullscreenLyricsOpen ? (
          <FullscreenLyricsPage track={currentTrack} albums={albums} playbackTime={playbackTime} isPlaying={isPlaying} onSeek={seekTo} />
        ) : null}
      </div>
    </div>
  )
}

function SidebarToggleIcon({ size = 24 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 5v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 8.5h.01M6 12h.01M6 15.5h.01" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

const Sidebar = React.memo(function Sidebar({
  snapshot,
  route,
  onNavigate,
  isCollapsed,
  onToggle,
  onResizeStart
}: {
  snapshot: HomeSnapshot
  route: AppRoute
  onNavigate: (route: AppRoute) => void
  isCollapsed: boolean
  onToggle: () => void
  onResizeStart: (event: React.PointerEvent) => void
}): React.ReactElement {
  const primaryPlaylist = snapshot.playlists[0]
  return (
    <aside className="sidebar glass-panel chrome-drag">
      <div className="sidebar-resize-handle no-drag" role="separator" aria-orientation="vertical" aria-label="调整侧边栏宽度" onPointerDown={onResizeStart} />
      <div className="sidebar-titlebar no-drag">
        <button className="sidebar-toggle" type="button" aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'} onClick={onToggle}>
          <SidebarToggleIcon size={24} />
        </button>
      </div>

      <div className="sidebar-main">
        <nav className="sidebar-nav no-drag">
          <button className={`nav-row ${route.name === 'home' ? 'active' : ''}`} type="button" onClick={() => onNavigate({ name: 'home' })}>
            <House size={20} />
            <span>主页</span>
          </button>
          <button className={`nav-row ${route.name === 'allTracks' ? 'active' : ''}`} type="button" onClick={() => onNavigate({ name: 'allTracks' })}>
            <ListMusic size={20} />
            <span>所有歌曲</span>
          </button>
        </nav>

        <section className="sidebar-section no-drag">
          <div className="sidebar-label">
            <span>播放列表</span>
            <button type="button" aria-label="新建播放列表">
              <Plus size={17} />
            </button>
          </div>
          <button
            className={`playlist-row ${route.name === 'playlistDetail' && route.id === primaryPlaylist?.id ? 'active' : ''}`}
            type="button"
            onClick={() =>
              primaryPlaylist
                ? onNavigate({ name: 'playlistDetail', id: primaryPlaylist.id, title: primaryPlaylist.name })
                : undefined
            }
          >
            <span className="playlist-icon">
              <Music2 size={18} />
            </span>
            <span>{primaryPlaylist?.name ?? '暂无播放列表'}</span>
          </button>
        </section>

        <section className="sidebar-section compact no-drag">
          <button className="sidebar-label as-button" type="button" onClick={() => onNavigate({ name: 'artistDetail', id: 'all-artists', title: '所有艺人' })}>
            <UserRound className="sidebar-label-icon" size={19} />
            <span>艺人</span>
          </button>
          <button className="sidebar-label as-button" type="button" onClick={() => onNavigate({ name: 'albumDetail', id: 'all-albums', title: '所有专辑' })}>
            <Disc3 className="sidebar-label-icon" size={19} />
            <span>专辑</span>
          </button>
        </section>
      </div>

      <div className="sidebar-footer no-drag">
        <div className="sidebar-source" role="tablist" aria-label="播放源">
          <button className="active" type="button">
            本地
          </button>
          <button type="button">Apple Music</button>
        </div>

        <div className="sidebar-bottom">
          <button className="round-control" type="button" aria-label="设置">
            <Settings size={18} />
          </button>
          <button className="round-control" type="button" aria-label="外观">
            <Sun size={18} />
          </button>
          <button className="round-control" type="button" aria-label="全屏">
            <Maximize2 size={17} />
          </button>
        </div>
      </div>
    </aside>
  )
})

const WindowControls = React.memo(function WindowControls(): React.ReactElement {
  return (
    <div className="window-controls no-drag">
      <button type="button" aria-label="最小化" onClick={() => window.kmgccc?.minimize()}>
        <Minus size={17} />
      </button>
      <button type="button" aria-label="最大化" onClick={() => window.kmgccc?.toggleMaximize()}>
        <Square size={14} />
      </button>
      <button className="close" type="button" aria-label="关闭" onClick={() => window.kmgccc?.close()}>
        <X size={17} />
      </button>
    </div>
  )
})

const ImportSyncCard = React.memo(function ImportSyncCard({
  state,
  onCancel
}: {
  state: ImportSyncState
  onCancel: () => void
}): React.ReactElement {
  const statusText = state.status === 'running' ? '进行中' : state.status === 'completed' ? '完成' : '失败'
  return (
    <div className="import-sync-backdrop no-drag">
      <div className="import-sync-card glass-panel" style={{ '--filter-url': 'url(#lg-home-liquid)' } as React.CSSProperties}>
        <div className="import-sync-head">
          <h2>{state.status === 'running' ? '正在补全导入信息' : state.status === 'completed' ? '导入信息补全完成' : '导入信息补全失败'}</h2>
          <span>
            {state.processedCount}/{state.totalCount}
          </span>
        </div>
        <div className="import-sync-progress" aria-hidden="true">
          <span style={{ width: `${Math.round(state.progress * 100)}%` }} />
        </div>
        <p>{state.detail}</p>
        <div className="import-sync-item">
          <span className={`import-sync-spinner ${state.status}`} />
          <div>
            <strong>
              {state.title}
              {state.artist ? ` - ${state.artist}` : ''}
            </strong>
            <small>
              补全信息 <b>{statusText}</b>
            </small>
            <em>{state.detail}</em>
          </div>
        </div>
        <button type="button" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  )
})

const Toolbar = React.memo(function Toolbar({
  onNavigateHome,
  onImportAudioFile,
  onToggleLyricsSidebar,
  isLyricsSidebarOpen
}: {
  onNavigateHome: () => void
  onImportAudioFile: () => void
  onToggleLyricsSidebar: () => void
  isLyricsSidebarOpen: boolean
}): React.ReactElement {
  return (
    <header className="toolbar chrome-drag">
      <div className="toolbar-left no-drag">
        <div className="toolbar-pill glass-panel" style={{ '--filter-url': 'url(#lg-toolbar-pill)' } as React.CSSProperties}>
          <button type="button" aria-label="返回主页" onClick={onNavigateHome}>
            <ChevronLeft size={23} />
          </button>
          <span className="toolbar-divider" />
          <button type="button" aria-label="前进">
            <ChevronRight size={23} />
          </button>
        </div>

        <button
          className="toolbar-circle toolbar-liquid-pad glass-panel"
          type="button"
          aria-label="排序"
          style={{ '--filter-url': 'url(#lg-circle)' } as React.CSSProperties}
        >
          <ArrowDownUp size={21} />
        </button>

        <div className="toolbar-pill toolbar-triple glass-panel" style={{ '--filter-url': 'url(#lg-toolbar-pill)' } as React.CSSProperties}>
          <button type="button" aria-label="选择">
            <CheckCircle2 size={20} />
          </button>
          <span className="toolbar-divider" />
          <button type="button" aria-label="播放">
            <Play size={20} fill="currentColor" />
          </button>
          <span className="toolbar-divider" />
          <button type="button" aria-label="导入单曲" onClick={onImportAudioFile}>
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="toolbar-right no-drag">
        <label className="search-field glass-panel" style={{ '--filter-url': 'url(#lg-search)' } as React.CSSProperties}>
          <Search size={18} />
          <input aria-label="搜索" placeholder="" />
          <CircleX size={17} className="search-clear" />
        </label>
        <button
          className={`toolbar-circle toolbar-liquid-pad glass-panel ${isLyricsSidebarOpen ? 'active' : ''}`}
          type="button"
          aria-label="歌词"
          aria-pressed={isLyricsSidebarOpen}
          onClick={onToggleLyricsSidebar}
          style={{ '--filter-url': 'url(#lg-circle)' } as React.CSSProperties}
        >
          <MessageSquareQuote size={20} />
        </button>
      </div>
    </header>
  )
})

const HOME_ARTIST_PREVIEW_LIMIT = 8
const HOME_ALBUM_PREVIEW_LIMIT = 8
const HOME_PLAYLIST_PREVIEW_LIMIT = 4
const HOME_RANKING_PREVIEW_LIMIT = 6

const HomePage = React.memo(function HomePage({
  snapshot,
  albums,
  onNavigate,
  onPlayTrack
}: {
  snapshot: HomeSnapshot
  albums: Map<string, HomeAlbumCard>
  onNavigate: (route: AppRoute) => void
  onPlayTrack: (trackId: string) => void
}): React.ReactElement {
  const homeScroll = useElasticScroll<HTMLElement>()
  const heroTrack = snapshot.heroTrack ?? snapshot.tracks[0] ?? null
  const previewArtists = React.useMemo(() => snapshot.artists.slice(0, HOME_ARTIST_PREVIEW_LIMIT), [snapshot.artists])
  const previewAlbums = React.useMemo(() => snapshot.albums.slice(0, HOME_ALBUM_PREVIEW_LIMIT), [snapshot.albums])
  const previewPlaylists = React.useMemo(() => snapshot.playlists.slice(0, HOME_PLAYLIST_PREVIEW_LIMIT), [snapshot.playlists])

  return (
    <section className={`home-page ${homeScroll.isScrolling ? 'is-scrolling' : ''}`} ref={homeScroll.scrollRef} onWheel={homeScroll.onWheel} onScroll={homeScroll.onScroll}>
      <div
        className={`home-scroll-content ${homeScroll.elasticOffset !== 0 ? 'elastic-active' : ''} ${
          homeScroll.isSettling ? 'settling' : ''
        }`}
        style={{ transform: `translate3d(0, ${homeScroll.elasticOffset}px, 0)` }}
      >
        {heroTrack ? <HomeHero track={heroTrack} albums={albums} onPlay={() => onPlayTrack(heroTrack.id)} /> : null}

        <HomeSectionBlock title="艺人" onShowAll={() => onNavigate({ name: 'artistDetail', id: 'all-artists', title: '所有艺人' })}>
          <div className="home-card-grid compact">
            {previewArtists.map((artist) => (
              <button
                className="home-person-card home-liquid-card glass-panel"
                key={artist.id}
                type="button"
                onClick={() => onNavigate({ name: 'artistDetail', id: artist.id, title: artist.name })}
              >
                {artist.artworkUrl ? (
                  <img src={artist.artworkUrl} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="artist-avatar">{artist.name}</span>
                )}
                <strong>{artist.name}</strong>
              </button>
            ))}
          </div>
        </HomeSectionBlock>

        <HomeSectionBlock title="专辑" onShowAll={() => onNavigate({ name: 'albumDetail', id: 'all-albums', title: '所有专辑' })}>
          <div className="home-card-grid">
            {previewAlbums.map((album) => (
              <button
                className="home-album-card home-liquid-card glass-panel"
                key={album.id}
                type="button"
                onClick={() => onNavigate({ name: 'albumDetail', id: album.id, title: album.title })}
              >
                <img src={albumArtworkFor(album)} alt="" loading="lazy" decoding="async" />
                <strong>{album.title}</strong>
                <span>{album.artist}</span>
              </button>
            ))}
          </div>
        </HomeSectionBlock>

        <HomeSectionBlock title="播放列表">
          <div className="home-playlist-grid">
            {previewPlaylists.map((playlist) => (
              <button
                className="home-playlist-card home-liquid-card glass-panel"
                key={playlist.id}
                type="button"
                onClick={() => onNavigate({ name: 'playlistDetail', id: playlist.id, title: playlist.name })}
              >
                <span className="playlist-icon large">
                  <Music2 size={28} />
                </span>
                <span>
                  <strong>{playlist.name}</strong>
                  <small>{playlist.trackCount} 首</small>
                </span>
              </button>
            ))}
          </div>
        </HomeSectionBlock>

        <HomeStatsSection stats={snapshot.stats} />
      </div>
    </section>
  )
})

const HomeHero = React.memo(function HomeHero({
  track,
  albums,
  onPlay
}: {
  track: HomeTrack
  albums: Map<string, HomeAlbumCard>
  onPlay: () => void
}): React.ReactElement {
  const artwork = trackArtwork(track, albums)
  return (
    <header className="home-hero">
      <img className="home-hero-bg" src={artwork} alt="" decoding="async" />
      <div className="home-hero-cover">
        <img src={artwork} alt="" decoding="async" />
      </div>
      <div className="home-hero-copy">
        <span>{track.artist}</span>
        <h1>{track.title}</h1>
        <p>{track.album}</p>
      </div>
      <div className="home-hero-actions">
        <button className="play-cta" type="button" onClick={onPlay}>
          <Play size={17} fill="currentColor" />
          播放
        </button>
        <button className="edit-button" type="button" aria-label="更多">
          •••
        </button>
        <button className="edit-button" type="button" aria-label="刷新精选">
          <Shuffle size={16} />
        </button>
      </div>
      <time>{formatDuration(track.duration)}</time>
    </header>
  )
})

const HomeSectionBlock = React.memo(function HomeSectionBlock({
  title,
  onShowAll,
  children
}: {
  title: string
  onShowAll?: () => void
  children: React.ReactNode
}): React.ReactElement {
  return (
    <section className="home-section-block">
      <div className="home-section-heading">
        <h2>{title}</h2>
        {onShowAll ? (
          <button type="button" onClick={onShowAll}>
            查看全部 <ChevronRight size={16} />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  )
})

const HomeStatsSection = React.memo(function HomeStatsSection({ stats }: { stats: HomeStats }): React.ReactElement {
  const previewRanking = React.useMemo(() => stats.ranking.slice(0, HOME_RANKING_PREVIEW_LIMIT), [stats.ranking])

  return (
    <section className="home-section-block home-stats-block">
      <div className="home-section-heading">
        <h2>音乐足迹</h2>
      </div>
      <div className="home-metrics-row">
        <div className="home-stat-grid">
          <HomeStatCard label="总歌曲" value={`${stats.totalTrackCount}`} suffix="首" />
          <HomeStatCard label="本周播放" value={`${stats.weeklyPlayCount}`} suffix="次" />
          <HomeStatCard label="本周时长" value={`${Math.round(stats.weeklyListeningSeconds / 60)}`} suffix="分钟" />
          <HomeStatCard label="本周常听" value={stats.favoriteArtistName ?? '-'} suffix={stats.favoriteArtistPlayCount ? `${stats.favoriteArtistPlayCount} 次播放` : ''} />
        </div>
        <div className="home-calendar-panel home-liquid-card glass-panel">
          <strong>听歌日历</strong>
          <div className="calendar-dots">
            {Array.from({ length: 35 }, (_entry, index) => {
              const day = index + 1
              const active = day === 5 || day === 6
              return <span className={active ? 'active' : ''} key={day}>{day <= 30 ? day : ''}</span>
            })}
          </div>
        </div>
      </div>
      <div className="home-insight-grid">
        <div className="home-rank-panel home-liquid-card glass-panel">
          {previewRanking.map((item, index) => (
            <div className="home-rank-row" key={item.trackId}>
              <span>{index + 1}</span>
              <img src={item.artworkUrl || albumArtwork} alt="" loading="lazy" decoding="async" />
              <strong>{item.title}</strong>
              <small>{item.artist}</small>
              <i style={{ width: `${Math.max(18, item.score * 120)}px` }} />
              <em>{item.playCount}</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

const HomeStatCard = React.memo(function HomeStatCard({
  label,
  value,
  suffix
}: {
  label: string
  value: string
  suffix: string
}): React.ReactElement {
  return (
    <div className="home-stat-card home-liquid-card glass-panel">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{suffix}</small>
    </div>
  )
})

type ParsedLyricLine = {
  id: string
  time: number | null
  text: string
}

function parseLyricTimestamp(rawTimestamp: string): number | null {
  const match = rawTimestamp.match(/^(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?$/)
  if (!match) return null
  const minutes = Number(match[1])
  const seconds = Number(match[2])
  const fraction = match[3] ? Number(`0.${match[3].padEnd(3, '0').slice(0, 3)}`) : 0
  return minutes * 60 + seconds + fraction
}

function parseLyrics(track: Track | null | undefined): ParsedLyricLine[] {
  const rawLyrics = track?.syncedLyrics || track?.lyricsText || ''
  const rawLines = rawLyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!rawLines.length) return []

  const parsed: ParsedLyricLine[] = []
  rawLines.forEach((line, lineIndex) => {
    const timestampMatches = [...line.matchAll(/\[([0-9]{1,2}:[0-9]{2}(?:[.:][0-9]{1,3})?)\]/g)]
    const text = line.replace(/\[[^\]]+\]/g, '').trim()
    if (!timestampMatches.length) {
      parsed.push({ id: `plain-${lineIndex}`, time: null, text: line })
      return
    }

    timestampMatches.forEach((match, timestampIndex) => {
      const time = parseLyricTimestamp(match[1])
      if (time === null) return
      parsed.push({
        id: `${lineIndex}-${timestampIndex}-${time}`,
        time,
        text: text || '♪'
      })
    })
  })

  return parsed.sort((a, b) => (a.time ?? Number.MAX_SAFE_INTEGER) - (b.time ?? Number.MAX_SAFE_INTEGER))
}

function activeLyricIndex(lines: ParsedLyricLine[], playbackTime: number): number {
  let activeIndex = -1
  lines.forEach((line, index) => {
    if (line.time !== null && line.time <= playbackTime + 0.18) {
      activeIndex = index
    }
  })
  return activeIndex
}

type LyricsSurfaceProps = {
  track: Track | null | undefined
  albums: Map<string, HomeAlbumCard>
  playbackTime: number
  isPlaying: boolean
  onSeek: (seconds: number) => void
}

const LyricsLineList = React.memo(function LyricsLineList({
  lines,
  currentLineIndex,
  onSeek,
  variant
}: {
  lines: ParsedLyricLine[]
  currentLineIndex: number
  onSeek: (seconds: number) => void
  variant: 'side' | 'fullscreen'
}): React.ReactElement {
  const activeLineRef = React.useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (currentLineIndex < 0) return
    activeLineRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentLineIndex])

  return (
    <div className={`lyrics-line-list ${variant}`}>
      {lines.map((line, index) => (
        <button
          className={`lyrics-line ${index === currentLineIndex ? 'active' : ''} ${line.time === null ? 'plain' : ''}`}
          key={line.id}
          ref={index === currentLineIndex ? activeLineRef : undefined}
          type="button"
          disabled={line.time === null}
          onClick={() => line.time !== null && onSeek(line.time)}
        >
          {line.text}
        </button>
      ))}
    </div>
  )
})

const LyricsSidePanel = React.memo(function LyricsSidePanel({
  track,
  albums,
  playbackTime,
  isPlaying,
  onSeek,
  onResizeStart
}: LyricsSurfaceProps & {
  onResizeStart: (event: React.PointerEvent) => void
}): React.ReactElement {
  const lines = React.useMemo(() => parseLyrics(track), [track])
  const currentLineIndex = React.useMemo(() => activeLyricIndex(lines, playbackTime), [lines, playbackTime])
  const artwork = trackArtwork(track, albums)
  const hasTimedLyrics = lines.some((line) => line.time !== null)

  return (
    <aside className="lyrics-side-panel glass-panel no-drag" style={{ '--filter-url': 'url(#lg-home-liquid)' } as React.CSSProperties}>
      <div className="lyrics-side-resize-handle" role="separator" aria-orientation="vertical" aria-label="调整歌词侧栏宽度" onPointerDown={onResizeStart} />
      <img className="lyrics-side-bg" src={artwork} alt="" decoding="async" />
      <div className="lyrics-side-head">
        <img src={artwork} alt="" decoding="async" />
        <div>
          <span>{isPlaying ? '正在播放' : '已暂停'}</span>
          <strong>{track?.title ?? '未选择歌曲'}</strong>
          <small>{track ? `${track.artist} · ${track.album}` : '选择一首歌曲后显示歌词'}</small>
        </div>
      </div>

      <div className="lyrics-panel-head">
        <div>
          <span>歌词</span>
          <strong>{hasTimedLyrics ? '同步歌词' : lines.length ? '文本歌词' : '暂无歌词'}</strong>
        </div>
        <time>{formatDuration(playbackTime)}</time>
      </div>

      {lines.length ? (
        <LyricsLineList lines={lines} currentLineIndex={currentLineIndex} onSeek={onSeek} variant="side" />
      ) : (
        <LyricsEmptyState />
      )}
    </aside>
  )
})

const FullscreenLyricsPage = React.memo(function FullscreenLyricsPage({
  track,
  albums,
  playbackTime,
  isPlaying,
  onSeek
}: LyricsSurfaceProps): React.ReactElement {
  const lines = React.useMemo(() => parseLyrics(track), [track])
  const currentLineIndex = React.useMemo(() => activeLyricIndex(lines, playbackTime), [lines, playbackTime])
  const artwork = trackArtwork(track, albums)

  return (
    <section className="fullscreen-lyrics-page no-drag">
      <img className="fullscreen-lyrics-bg" src={artwork} alt="" decoding="async" />
      <div className="fullscreen-lyrics-art">
        <img src={artwork} alt="" decoding="async" />
      </div>
      <div className="fullscreen-lyrics-copy">
        <span>{isPlaying ? '正在播放' : '已暂停'}</span>
        <strong>{track?.title ?? '未选择歌曲'}</strong>
        <small>{track ? `${track.artist} · ${track.album}` : '选择一首歌曲后显示歌词'}</small>
      </div>
      <div className="fullscreen-lyrics-lines">
        {lines.length ? (
          <LyricsLineList lines={lines} currentLineIndex={currentLineIndex} onSeek={onSeek} variant="fullscreen" />
        ) : (
          <LyricsEmptyState />
        )}
      </div>
    </section>
  )
})

const LyricsEmptyState = React.memo(function LyricsEmptyState(): React.ReactElement {
  return (
    <div className="lyrics-empty">
      <MessageSquareQuote size={38} />
      <strong>还没有歌词</strong>
      <span>导入歌曲后会自动尝试补全歌词；补全成功后会显示在这里。</span>
    </div>
  )
})

const LibraryDetailPage = React.memo(function LibraryDetailPage({
  route,
  snapshot,
  albums,
  currentId,
  onNavigate,
  onSelect
}: {
  route: DetailRoute
  snapshot: HomeSnapshot
  albums: Map<string, HomeAlbumCard>
  currentId: string
  onNavigate: (route: AppRoute) => void
  onSelect: (id: string) => void
}): React.ReactElement {
  const pageScroll = useElasticScroll<HTMLElement>()
  const tracks = React.useMemo(() => tracksForRoute(route, snapshot), [route, snapshot])
  const isArtistIndex = route.name === 'artistDetail' && route.id === 'all-artists'
  const isAlbumIndex = route.name === 'albumDetail' && route.id === 'all-albums'
  const artworkShape = route.name === 'artistDetail' && route.id !== 'all-artists' ? 'artist' : 'square'

  return (
    <section className="artist-page" ref={pageScroll.scrollRef} onWheel={pageScroll.onWheel}>
      <div
        className={`artist-scroll-content ${pageScroll.elasticOffset !== 0 ? 'elastic-active' : ''} ${
          pageScroll.isSettling ? 'settling' : ''
        }`}
        style={{ transform: `translate3d(0, ${pageScroll.elasticOffset}px, 0)` }}
      >
        <header className="artist-header">
          <div className={`artist-image-frame ${artworkShape === 'square' ? 'square-artwork' : ''}`}>
            <img src={detailArtwork(route, snapshot, albums)} alt="" decoding="async" />
          </div>
          <div className="artist-copy">
            <h1>{route.name === 'allTracks' ? '所有歌曲' : route.title}</h1>
            <p className="artist-meta">{detailSubtitle(route, snapshot, tracks)}</p>
            <p className="artist-description">这里已经走统一 route 和 ID 过滤接口；导入功能接入后只需要更新 HomeSnapshot 数据。</p>
          </div>
        </header>

        {isArtistIndex ? (
          <CollectionGrid
            artists={snapshot.artists}
            onArtist={(artist) => onNavigate({ name: 'artistDetail', id: artist.id, title: artist.name })}
          />
        ) : null}
        {isAlbumIndex ? (
          <CollectionGrid
            albums={snapshot.albums}
            onAlbum={(album) => onNavigate({ name: 'albumDetail', id: album.id, title: album.title })}
          />
        ) : null}
        {!isArtistIndex && !isAlbumIndex ? <TrackRows tracks={tracks} albums={albums} currentId={currentId} onSelect={onSelect} /> : null}
      </div>
    </section>
  )
})

const CollectionGrid = React.memo(function CollectionGrid({
  artists,
  albums,
  onArtist,
  onAlbum
}: {
  artists?: HomeArtistCard[]
  albums?: HomeAlbumCard[]
  onArtist?: (artist: HomeArtistCard) => void
  onAlbum?: (album: HomeAlbumCard) => void
}): React.ReactElement {
  return (
    <div className="collection-grid">
      {artists?.map((artist) => (
        <button className="home-person-card home-liquid-card glass-panel" key={artist.id} type="button" onClick={() => onArtist?.(artist)}>
          {artist.artworkUrl ? <img src={artist.artworkUrl} alt="" loading="lazy" decoding="async" /> : <span className="artist-avatar">{artist.name}</span>}
          <strong>{artist.name}</strong>
        </button>
      ))}
      {albums?.map((album) => (
        <button className="home-album-card home-liquid-card glass-panel" key={album.id} type="button" onClick={() => onAlbum?.(album)}>
          <img src={albumArtworkFor(album)} alt="" loading="lazy" decoding="async" />
          <strong>{album.title}</strong>
          <span>{album.artist}</span>
        </button>
      ))}
    </div>
  )
})

const TrackRows = React.memo(function TrackRows({
  tracks,
  albums,
  currentId,
  onSelect
}: {
  tracks: Track[]
  albums: Map<string, HomeAlbumCard>
  currentId: string
  onSelect: (id: string) => void
}): React.ReactElement {
  return (
    <div className="track-list">
      {tracks.map((track) => (
        <button
          className={`track-row ${track.id === currentId ? 'current' : ''}`}
          key={track.id}
          type="button"
          onClick={() => onSelect(track.id)}
        >
          <img className="track-art" src={trackArtwork(track, albums)} alt="" loading="lazy" decoding="async" />
          <span className="track-title">{track.title}</span>
          <span className="track-artist">{track.artist}</span>
          <span className="track-duration">{formatDuration(track.duration)}</span>
          <span className="track-more">•••</span>
        </button>
      ))}
    </div>
  )
})

const MiniPlayer = React.memo(function MiniPlayer({
  track,
  albums,
  isPlaying,
  playbackTime,
  playbackDuration,
  onPlayPause,
  onToggleFullscreenLyrics,
  onSeek
}: {
  track: Track
  albums: Map<string, HomeAlbumCard>
  isPlaying: boolean
  playbackTime: number
  playbackDuration: number
  onPlayPause: () => void
  onToggleFullscreenLyrics: () => void
  onSeek: (seconds: number) => void
}): React.ReactElement {
  const progress = playbackDuration > 0 ? Math.min(100, Math.max(0, (playbackTime / playbackDuration) * 100)) : 0

  return (
    <div className="mini-player glass-panel no-drag" style={{ '--filter-url': 'url(#lg-mini)' } as React.CSSProperties}>
      <div className="mini-progress-rail" style={{ '--mini-progress': progress } as React.CSSProperties}>
        <span className="mini-progress-base" aria-hidden="true" />
        <span className="mini-progress-fill" aria-hidden="true" />
        <input
          aria-label="播放进度"
          max={Math.max(1, playbackDuration)}
          min="0"
          step="0.1"
          type="range"
          value={Math.min(playbackTime, Math.max(1, playbackDuration))}
          onChange={(event) => onSeek(Number(event.currentTarget.value))}
        />
      </div>
      <button className="mini-track" type="button" aria-label="打开或关闭完整歌词界面" onClick={onToggleFullscreenLyrics}>
        <img src={trackArtwork(track, albums)} alt="" decoding="async" />
        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
      </button>
      <div className="mini-controls">
        <button type="button" aria-label="上一首">
          <SkipBack size={19} fill="currentColor" />
        </button>
        <button type="button" aria-label="播放暂停" onClick={onPlayPause}>
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        <button type="button" aria-label="下一首">
          <SkipForward size={19} fill="currentColor" />
        </button>
      </div>
      <button className="mode-button" type="button" aria-label="随机">
        <Shuffle size={18} />
      </button>
      <div className="mini-timeline">
        <div className="volume-track">
          <Volume2 size={16} />
          <div className="volume-bar">
            <span />
            <i />
          </div>
        </div>
      </div>
    </div>
  )
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
