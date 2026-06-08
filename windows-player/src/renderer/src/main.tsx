import React from 'react'
import ReactDOM from 'react-dom/client'
import { LyricPlayer } from '@applemusic-like-lyrics/react'
import type { LyricLine } from '@applemusic-like-lyrics/core'
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
  Sparkles,
  Sun,
  UserRound,
  Volume2,
  VolumeX,
  X
} from 'lucide-react'
import { LiquidGlassFilters } from './LiquidGlassFilter'
import '@applemusic-like-lyrics/core/style.css'
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
import bkBackground1 from './assets/bk-themes/backgrounds/bk1.png'
import bkBackground2 from './assets/bk-themes/backgrounds/bk2.png'
import bkPaintMaskSprite from './assets/bk-mask/paint-mask-sprite.png'
import artworkFrame1 from './assets/bk-themes/artwork-frame/artworkframe1.png'
import artworkFrame2 from './assets/bk-themes/artwork-frame/artworkframe2.png'
import artworkFrame3 from './assets/bk-themes/artwork-frame/artworkframe3.png'
import artworkFrame4 from './assets/bk-themes/artwork-frame/artworkframe4.png'
import tapeShell from './assets/xc-assets/tape.png'
import tapeDarkShell from './assets/xc-assets/tapedark.png'
import tapeGray from './assets/xc-assets/tapegray.png'
import tapePaper from './assets/xc-assets/tapepaper.png'
import tapeOutline from './assets/xc-assets/tapeoutline.png'
import tapeMask from './assets/xc-assets/tapemask.png'
import kmgLook from './assets/xc-assets/kmglook.png'
import './styles.css'

type Track = {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  duration: number
  discNumber?: number
  trackNumber?: number
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

const DEFAULT_SIDEBAR_WIDTH = 320
const COLLAPSED_SIDEBAR_WIDTH = 82

function mediaUrlForLocalPath(audioPath: string): string {
  const bytes = new TextEncoder().encode(audioPath)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  const encodedPath = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  return `kmgccc-media://audio/${encodedPath}`
}

function createCoverPixelStretchBackground(artworkUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.onload = () => {
      try {
        const canvasWidth = 1470
        const canvasHeight = 923
        const baseCanvas = document.createElement('canvas')
        baseCanvas.width = canvasWidth
        baseCanvas.height = canvasHeight
        const baseContext = baseCanvas.getContext('2d')
        const outputCanvas = document.createElement('canvas')
        outputCanvas.width = canvasWidth
        outputCanvas.height = canvasHeight
        const outputContext = outputCanvas.getContext('2d')
        if (!baseContext || !outputContext || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
          resolve(null)
          return
        }

        const scale = canvasHeight / image.naturalHeight
        const artworkWidth = image.naturalWidth * scale
        const artworkRightEdge = Math.min(canvasWidth, Math.max(1, artworkWidth))
        baseContext.imageSmoothingEnabled = true
        baseContext.imageSmoothingQuality = 'high'
        baseContext.drawImage(image, 0, 0, artworkWidth, canvasHeight)

        if (artworkRightEdge < canvasWidth) {
          const stripSourceWidth = Math.max(1, Math.ceil((4 / artworkWidth) * image.naturalWidth))
          const stripSourceX = Math.max(0, image.naturalWidth - stripSourceWidth)
          baseContext.imageSmoothingEnabled = false
          baseContext.drawImage(
            image,
            stripSourceX,
            0,
            stripSourceWidth,
            image.naturalHeight,
            artworkRightEdge,
            0,
            canvasWidth - artworkRightEdge,
            canvasHeight
          )
        }

        outputContext.drawImage(baseCanvas, 0, 0)

        const blurRadius = 200
        const blurStartRatioFromEdge = 0.48
        const overlayStartRatioFromEdge = 0.28
        const colorOverlayOpacity = 0.5
        const blurStartX = artworkRightEdge - artworkRightEdge * blurStartRatioFromEdge
        const blurEndX = Math.max(blurStartX + 1, canvasWidth - artworkRightEdge * 0.04)
        const segmentCount = 96

        for (let index = 0; index < segmentCount; index += 1) {
          const t0 = index / segmentCount
          const t1 = (index + 1) / segmentCount
          const x0 = blurStartX + (blurEndX - blurStartX) * t0
          const x1 = blurStartX + (blurEndX - blurStartX) * t1
          const mask = Math.min(1, 0.1 * t1 + 0.34 * t1 * t1 + 0.56 * t1 * t1 * t1)
          const radius = Math.min(blurRadius, blurRadius * mask)

          outputContext.save()
          outputContext.beginPath()
          outputContext.rect(x0 - 2, 0, x1 - x0 + 8, canvasHeight)
          outputContext.clip()
          outputContext.filter = `blur(${radius}px)`
          outputContext.drawImage(baseCanvas, 0, 0)
          outputContext.restore()
        }
        outputContext.filter = 'none'

        const sampleCanvas = document.createElement('canvas')
        sampleCanvas.width = 1
        sampleCanvas.height = 1
        const sampleContext = sampleCanvas.getContext('2d')
        let overlayRed = 38
        let overlayGreen = 38
        let overlayBlue = 38
        if (sampleContext) {
          sampleContext.drawImage(image, 0, 0, 1, 1)
          const [red, green, blue] = sampleContext.getImageData(0, 0, 1, 1).data
          overlayRed = red
          overlayGreen = green
          overlayBlue = blue
        }

        const overlayStartX = artworkRightEdge - artworkRightEdge * overlayStartRatioFromEdge
        const overlayGradient = outputContext.createLinearGradient(overlayStartX, 0, canvasWidth, 0)
        overlayGradient.addColorStop(0, `rgba(${overlayRed}, ${overlayGreen}, ${overlayBlue}, 0)`)
        overlayGradient.addColorStop(0.55, `rgba(${overlayRed}, ${overlayGreen}, ${overlayBlue}, ${colorOverlayOpacity * 0.08})`)
        overlayGradient.addColorStop(0.78, `rgba(${overlayRed}, ${overlayGreen}, ${overlayBlue}, ${colorOverlayOpacity * 0.28})`)
        overlayGradient.addColorStop(1, `rgba(${overlayRed}, ${overlayGreen}, ${overlayBlue}, ${colorOverlayOpacity})`)
        outputContext.fillStyle = overlayGradient
        outputContext.fillRect(overlayStartX, 0, canvasWidth - overlayStartX, canvasHeight)

        resolve(outputCanvas.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }
    image.onerror = () => resolve(null)
    image.src = artworkUrl
  })
}

const fallbackHomeSnapshot: HomeSnapshot = {
  heroTrack: null,
  tracks: [],
  artists: [],
  albums: [],
  playlists: [],
  stats: {
    totalTrackCount: 0,
    weeklyPlayCount: 0,
    weeklyListeningSeconds: 0,
    favoriteArtistName: undefined,
    favoriteArtistPlayCount: 0,
    ranking: [],
    dailyListeningMap: {}
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
  | { name: 'nowPlaying' }
  | { name: 'allTracks' }
  | { name: 'artistDetail'; id: string; title: string }
  | { name: 'albumDetail'; id: string; title: string }
  | { name: 'playlistDetail'; id: string; title: string }

type DetailRoute = Exclude<AppRoute, { name: 'home' } | { name: 'nowPlaying' }>
type SettingsCategoryKey = 'appearance' | 'nowPlaying' | 'fullscreen' | 'externalPlayback' | 'data' | 'about'
type NowPlayingSettingsTab = 'general' | 'lyrics' | 'led'
type NowPlayingSkinID = 'coverLed' | 'appleStyle' | 'rotatingCover' | 'kmgccc.cassette'
type VisualizerMode = 'off' | 'led' | 'spectrum'
type AppleMeshSpeed = 'slow' | 'standard' | 'fast'
type ContextMenuItem = {
  label: string
  danger?: boolean
  onSelect: () => void
}
type ContextMenuState = {
  x: number
  y: number
  items: ContextMenuItem[]
}
type LibraryDialogState =
  | { kind: 'editTrack'; track: HomeTrack }
  | { kind: 'editAlbum'; album: HomeAlbumCard }
  | { kind: 'editArtist'; artist: HomeArtistCard }
  | { kind: 'editPlaylist'; playlist: HomePlaylistCard }
  | { kind: 'createPlaylist'; track?: HomeTrack }
  | { kind: 'deleteTrack'; track: HomeTrack }
  | { kind: 'deleteAlbum'; album: HomeAlbumCard }
  | { kind: 'deleteArtist'; artist: HomeArtistCard }
  | { kind: 'deletePlaylist'; playlist: HomePlaylistCard }

const bkShapeAssets = [shape1, shape2, shape3, shape4, shape5, shape6, shape7, shape8, shape9, shape10, shape11]
const bkBackgroundAssets = [bkBackground1, bkBackground2]
const artworkFrameAssets = [artworkFrame1, artworkFrame2, artworkFrame3, artworkFrame4]

const nowPlayingSkinOptions: Array<{ id: NowPlayingSkinID; name: string; detail: string }> = [
  { id: 'coverLed', name: '经典封面', detail: '方形封面与 LED/频谱' },
  { id: 'appleStyle', name: 'Apple 风格', detail: 'AMLL Mesh 背景' },
  { id: 'rotatingCover', name: '旋转封面', detail: '黑胶/CD 旋转封面' },
  { id: 'kmgccc.cassette', name: 'kmgccc 磁带', detail: '磁带主体与 KMG 标识' }
]

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

function storedBoolean(key: string, fallback: boolean): boolean {
  try {
    const value = window.localStorage.getItem(key)
    if (value === 'true') return true
    if (value === 'false') return false
  } catch {
    return fallback
  }
  return fallback
}

function storedNumber(key: string, fallback: number): number {
  try {
    const value = Number(window.localStorage.getItem(key))
    return Number.isFinite(value) ? value : fallback
  } catch {
    return fallback
  }
}

function storedString<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const value = window.localStorage.getItem(key)
    if (allowed.includes(value as T)) return value as T
  } catch {
    return fallback
  }
  return fallback
}

function storedVisualizerMode(): 'off' | 'led' | 'spectrum' {
  return storedVisualizerModeForKey('skin.classicLED.visualizerMode', 'led')
}

function storedVisualizerModeForKey(key: string, fallback: VisualizerMode = 'off'): VisualizerMode {
  try {
    const value = window.localStorage.getItem(key)
    if (value === 'off' || value === 'led' || value === 'spectrum') return value
  } catch {
    return fallback
  }
  return fallback
}

function storedNowPlayingSkin(): NowPlayingSkinID {
  try {
    const value = window.localStorage.getItem('nowPlayingSkin')
    if (value === 'coverLed' || value === 'appleStyle' || value === 'rotatingCover' || value === 'kmgccc.cassette') return value
  } catch {
    return 'kmgccc.cassette'
  }
  return 'kmgccc.cassette'
}

function storedAppleMeshSpeed(): AppleMeshSpeed {
  try {
    const value = window.localStorage.getItem('skin.appleStyle.flowSpeed')
    if (value === 'slow' || value === 'standard' || value === 'fast') return value
  } catch {
    return 'standard'
  }
  return 'standard'
}

function persistSetting(key: string, value: string | boolean | number): void {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // Settings still work for the current session if localStorage is unavailable.
  }
}

function skinPreviewClassName(skin: NowPlayingSkinID): string {
  switch (skin) {
    case 'coverLed':
      return 'cover-led'
    case 'appleStyle':
      return 'apple-style'
    case 'rotatingCover':
      return 'rotating'
    case 'kmgccc.cassette':
      return 'kmgccc-cassette'
  }
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
      '--ambient-shape-3': 'rgba(82, 87, 94, 0.18)',
      '--bk-bg-tone-1': 'hsla(196, 42%, 80%, 0.98)',
      '--bk-bg-tone-2': 'hsla(265, 34%, 84%, 0.92)',
      '--bk-shape-tint-1': 'rgba(156, 168, 178, 0.88)',
      '--bk-shape-tint-2': 'rgba(112, 126, 138, 0.84)',
      '--bk-shape-tint-3': 'rgba(194, 200, 205, 0.78)',
      '--bk-dot-tint-1': 'rgba(232, 174, 150, 0.92)',
      '--bk-dot-tint-2': 'rgba(148, 203, 250, 0.88)',
      '--bk-dot-tint-3': 'rgba(220, 176, 245, 0.84)'
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
    '--ambient-shape-3': ambient3,
    '--bk-bg-tone-1': isAltArtwork ? 'hsla(88, 38%, 78%, 0.98)' : 'hsla(198, 44%, 78%, 0.98)',
    '--bk-bg-tone-2': isAltArtwork ? 'hsla(352, 38%, 82%, 0.92)' : 'hsla(338, 40%, 84%, 0.92)',
    '--bk-shape-tint-1': isAltArtwork ? 'rgba(142, 166, 116, 0.42)' : 'rgba(92, 166, 204, 0.42)',
    '--bk-shape-tint-2': isAltArtwork ? 'rgba(202, 146, 152, 0.36)' : 'rgba(210, 130, 152, 0.36)',
    '--bk-shape-tint-3': isAltArtwork ? 'rgba(204, 184, 98, 0.34)' : 'rgba(210, 188, 94, 0.34)',
    '--bk-dot-tint-1': isAltArtwork ? 'rgba(206, 156, 232, 0.92)' : 'rgba(244, 171, 112, 0.92)',
    '--bk-dot-tint-2': isAltArtwork ? 'rgba(116, 223, 216, 0.88)' : 'rgba(138, 240, 158, 0.88)',
    '--bk-dot-tint-3': isAltArtwork ? 'rgba(116, 168, 246, 0.84)' : 'rgba(244, 218, 102, 0.84)'
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

type RgbaColor = RgbColor & {
  a: number
}

const lyricsFontWeightOptions = [
  { label: '极细', value: 100 },
  { label: '细', value: 300 },
  { label: '常规', value: 400 },
  { label: '半粗', value: 600 },
  { label: '粗', value: 700 }
]

const lyricsFontFamilyOptions = [
  'PingFang SC',
  'Microsoft YaHei',
  'SF Pro Text',
  'Segoe UI Variable',
  'Arial',
  'Times New Roman'
]

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

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360
}

function hslCss(h: number, s: number, l: number, alpha: number): string {
  return `hsla(${Math.round(normalizeHue(h))}, ${Math.round(clampNumber(s, 0, 1) * 100)}%, ${Math.round(clampNumber(l, 0, 1) * 100)}%, ${alpha})`
}

function hsbToRgb(h: number, s: number, b: number): RgbColor {
  const hue = normalizeHue(h) / 60
  const saturation = clampNumber(s, 0, 1)
  const brightness = clampNumber(b, 0, 1)
  const chroma = brightness * saturation
  const x = chroma * (1 - Math.abs((hue % 2) - 1))
  const match = brightness - chroma
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

function hsbCss(h: number, s: number, b: number, alpha: number): string {
  return rgbaString(hsbToRgb(h, s, b), alpha)
}

function harmonizedShapeTints(colors: RgbColor[]): [string, string, string] {
  const firstHsl = rgbToHsl(colors[0])
  const secondHsl = rgbToHsl(colors[1] ?? colors[0])
  const thirdHsl = rgbToHsl(colors[2] ?? colors[1] ?? colors[0])
  const avgS = (firstHsl.s + secondHsl.s + thirdHsl.s) / 3
  const isNearGray = avgS < 0.18
  if (isNearGray) {
    return [
      hsbCss(8, 0.36, 0.96, 0.92),
      hsbCss(205, 0.31, 0.98, 0.88),
      hsbCss(292, 0.28, 0.96, 0.84)
    ]
  }

  const primaryHue = firstHsl.h
  const accentHue = Math.abs(normalizeHue(secondHsl.h - primaryHue)) > 26 ? secondHsl.h : normalizeHue(primaryHue + 58)
  const baseSaturation = clampNumber(Math.max(firstHsl.s, secondHsl.s, thirdHsl.s) * 0.44 + 0.28, 0.44, 0.72)
  return [
    hsbCss(primaryHue + 4, baseSaturation, 0.96, 0.92),
    hsbCss(accentHue - 3, clampNumber(baseSaturation + 0.03, 0, 0.76), 0.98, 0.88),
    hsbCss(thirdHsl.h + 6, clampNumber(baseSaturation * 0.84, 0.40, 0.68), 0.95, 0.84)
  ]
}

function harmonizedBKShapeTints(colors: RgbColor[]): [string, string, string] {
  const firstHsl = rgbToHsl(colors[0])
  const secondHsl = rgbToHsl(colors[1] ?? colors[0])
  const thirdHsl = rgbToHsl(colors[2] ?? colors[1] ?? colors[0])
  const avgS = (firstHsl.s + secondHsl.s + thirdHsl.s) / 3
  const isNearGray = avgS < 0.18
  if (isNearGray) {
    return [
      hsbCss(8, 0.24, 0.94, 0.82),
      hsbCss(205, 0.22, 0.96, 0.78),
      hsbCss(292, 0.2, 0.94, 0.74)
    ]
  }

  const primaryHue = firstHsl.h
  const accentHue = Math.abs(normalizeHue(secondHsl.h - primaryHue)) > 26 ? secondHsl.h : normalizeHue(primaryHue + 58)
  const baseSaturation = clampNumber(Math.max(firstHsl.s, secondHsl.s, thirdHsl.s) * 0.24 + 0.16, 0.22, 0.44)
  return [
    hsbCss(primaryHue + 4, baseSaturation, 0.95, 0.82),
    hsbCss(accentHue - 3, clampNumber(baseSaturation + 0.02, 0, 0.46), 0.96, 0.78),
    hsbCss(thirdHsl.h + 6, clampNumber(baseSaturation * 0.78, 0.20, 0.40), 0.94, 0.74)
  ]
}

function harmonizedDotTints(colors: RgbColor[]): [string, string, string] {
  const firstHsl = rgbToHsl(colors[0])
  const secondHsl = rgbToHsl(colors[1] ?? colors[0])
  const thirdHsl = rgbToHsl(colors[2] ?? colors[1] ?? colors[0])
  const avgS = (firstHsl.s + secondHsl.s + thirdHsl.s) / 3
  if (avgS < 0.18) {
    return [
      hsbCss(8, 0.35, 0.96, 0.92),
      hsbCss(205, 0.30, 0.98, 0.88),
      hsbCss(292, 0.27, 0.96, 0.84)
    ]
  }

  const baseSaturation = clampNumber(Math.max(firstHsl.s, secondHsl.s, thirdHsl.s) * 0.38 + 0.25, 0.40, 0.66)
  return [
    hsbCss(firstHsl.h + 180, baseSaturation, 0.98, 0.92),
    hsbCss(secondHsl.h + 184, clampNumber(baseSaturation + 0.02, 0, 0.70), 0.98, 0.88),
    hsbCss(thirdHsl.h + 176, clampNumber(baseSaturation * 0.86, 0.36, 0.62), 0.96, 0.84)
  ]
}

function rgbaString(color: RgbColor, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
}

function parseCssColor(value: string): RgbaColor | null {
  const trimmed = value.trim()
  const rgba = trimmed.match(/^rgba?\(([^)]+)\)$/i)
  if (rgba) {
    const parts = rgba[1].split(',').map((part) => part.trim())
    if (parts.length >= 3) {
      return {
        r: clampNumber(Number(parts[0]), 0, 255),
        g: clampNumber(Number(parts[1]), 0, 255),
        b: clampNumber(Number(parts[2]), 0, 255),
        a: parts[3] === undefined ? 1 : clampNumber(Number(parts[3]), 0, 1)
      }
    }
  }

  const hsla = trimmed.match(/^hsla?\(([^)]+)\)$/i)
  if (hsla) {
    const parts = hsla[1].split(',').map((part) => part.trim())
    if (parts.length >= 3) {
      const h = Number(parts[0])
      const s = Number(parts[1].replace('%', '')) / 100
      const l = Number(parts[2].replace('%', '')) / 100
      const rgb = hslToRgb({ h, s, l })
      return { ...rgb, a: parts[3] === undefined ? 1 : clampNumber(Number(parts[3]), 0, 1) }
    }
  }

  return null
}

function mixRgb(first: RgbColor, second: RgbColor, t: number): RgbColor {
  const p = clampNumber(t, 0, 1)
  return {
    r: Math.round(first.r + (second.r - first.r) * p),
    g: Math.round(first.g + (second.g - first.g) * p),
    b: Math.round(first.b + (second.b - first.b) * p)
  }
}

function saturateRgb(color: RgbColor, amount: number): RgbColor {
  const hsl = rgbToHsl(color)
  return hslToRgb({
    h: hsl.h,
    s: clampNumber(hsl.s * amount, 0, 1),
    l: hsl.l
  })
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
  const shapeTints = harmonizedShapeTints([first, second, third])
  const bkShapeTints = harmonizedBKShapeTints([first, second, third])
  const dotTints = harmonizedDotTints([first, second, third])
  const firstHsl = rgbToHsl(first)
  const secondHsl = rgbToHsl(second)
  const thirdHsl = rgbToHsl(third)
  const backgroundSaturation = clampNumber(Math.max(firstHsl.s, secondHsl.s) * 0.24 + 0.18, 0.22, 0.42)
  const overlaySaturation = clampNumber(Math.max(secondHsl.s, thirdHsl.s, firstHsl.s) * 0.28 + 0.20, 0.26, 0.48)

  return {
    ...fallback,
    '--cover-accent': rgbaString(first, 0.42),
    '--cover-accent-border': rgbaString(first, 0.28),
    '--cover-accent-text': hexString(boostThemeColor(first)),
    '--cover-accent-shadow': rgbaString(first, 0.1),
    '--ambient-shape-1': shapeTints[0],
    '--ambient-shape-2': shapeTints[1],
    '--ambient-shape-3': shapeTints[2],
    '--bk-bg-tone-1': hsbCss(firstHsl.h, backgroundSaturation, 0.99, 0.98),
    '--bk-bg-tone-2': hsbCss(secondHsl.h + 4, overlaySaturation, 0.98, 0.94),
    '--bk-bg-tone-3': hsbCss(thirdHsl.h - 5, clampNumber(overlaySaturation + 0.02, 0, 0.50), 0.96, 0.9),
    '--bk-shape-tint-1': bkShapeTints[0],
    '--bk-shape-tint-2': bkShapeTints[1],
    '--bk-shape-tint-3': bkShapeTints[2],
    '--bk-dot-tint-1': dotTints[0],
    '--bk-dot-tint-2': dotTints[1],
    '--bk-dot-tint-3': dotTints[2]
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
    return sortAlbumTracks(snapshot.tracks.filter((track) => track.albumId === route.id))
  case 'playlistDetail': {
    const playlist = snapshot.playlists.find((entry) => entry.id === route.id)
    if (!playlist) return []
    const trackIds = new Set(playlist.trackIds)
    return snapshot.tracks.filter((track) => trackIds.has(track.id))
  }
  }
}

function sortAlbumTracks(tracks: HomeTrack[]): HomeTrack[] {
  return tracks
    .map((track, index) => ({ track, index }))
    .sort((left, right) => {
      const leftDisc = left.track.discNumber ?? 1
      const rightDisc = right.track.discNumber ?? 1
      if (leftDisc !== rightDisc) return leftDisc - rightDisc

      const leftTrack = left.track.trackNumber ?? Number.MAX_SAFE_INTEGER
      const rightTrack = right.track.trackNumber ?? Number.MAX_SAFE_INTEGER
      if (leftTrack !== rightTrack) return leftTrack - rightTrack

      if (left.track.trackNumber === undefined && right.track.trackNumber === undefined) {
        return left.index - right.index
      }
      return left.track.title.localeCompare(right.track.title, 'zh-Hans-CN') || left.index - right.index
    })
    .map((entry) => entry.track)
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

function snapshotWithoutMissingQueueIds(snapshot: HomeSnapshot, queueIds: string[]): string[] {
  const validIds = new Set(snapshot.tracks.map((track) => track.id))
  return queueIds.filter((id) => validIds.has(id))
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
    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let scrollElement: HTMLElement | null = null
    let sidebarElement: HTMLElement | null = null
    let lyricsElement: HTMLElement | null = null
    let layoutMetrics: {
      width: number
      height: number
      dpr: number
      viewportHeight: number
      virtualHeight: number
      centerMinX: number
      centerMaxX: number
      fluidProgress: number
      fluidBoundaryScale: number
      shapeScale: number
    } | null = null
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
      const metrics = layoutMetrics
      if (!metrics) return
      const scrollTop = isActive ? (scrollElement?.scrollTop ?? 0) : 0

      context.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0)
      context.clearRect(0, 0, metrics.width, metrics.height)
      context.save()
      context.beginPath()
      context.rect(0, 0, metrics.width, metrics.height)
      context.clip()

      for (const spec of specs) {
        const isUltra = spec.tier === 'ultra'
        const side = clampNumber(spec.nominalSide * metrics.shapeScale, spec.tier === 'small' ? 54 : 96, isUltra ? 980 : 760)
        const boundary = spec.side === 'left' ? metrics.centerMinX : metrics.centerMaxX
        const boundaryOffset = isUltra
          ? spec.boundaryOffset * (0.82 + metrics.fluidProgress * 0.18)
          : spec.boundaryOffset * metrics.fluidBoundaryScale
        const baseX = clampNumber(
          boundary + boundaryOffset,
          -side * (isUltra ? 1.15 : 0.72),
          metrics.width + side * (isUltra ? 1.15 : 0.72)
        )
        const baseY = spec.baseYViewport * metrics.viewportHeight
        const scrollX = reducedMotion ? 0 : clampNumber(scrollTop * spec.parallaxX, -8, 8)
        const scrollY = reducedMotion ? 0 : clampNumber(-scrollTop * spec.parallax, -metrics.virtualHeight, metrics.virtualHeight)
        const rotation = reducedMotion
          ? spec.baseRotation
          : spec.baseRotation + clampNumber(scrollTop * spec.rotationPerPoint, -spec.rotationClamp, spec.rotationClamp)
        const image = tintedImage(spec.asset, resolveColor(spec.color))
        if (!image) continue
        const drawX = baseX + scrollX
        const drawY = baseY + scrollY
        if (drawX < -side || drawX > metrics.width + side || drawY < -side || drawY > metrics.height + side) continue

        context.save()
        context.globalAlpha = spec.opacity
        context.translate(drawX, drawY)
        context.rotate((rotation * Math.PI) / 180)
        context.drawImage(image, -side / 2, -side / 2, side, side)
        context.restore()
      }

      context.restore()
    }

    const requestApply = (): void => {
      if (frame) return
      frame = window.requestAnimationFrame(applyTransforms)
    }

    const updateLayoutMetrics = (): void => {
      const rootRect = root.getBoundingClientRect()
      if (rootRect.width <= 0 || rootRect.height <= 0) {
        layoutMetrics = null
        return
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1)
      const pixelWidth = Math.max(1, Math.round(rootRect.width * dpr))
      const pixelHeight = Math.max(1, Math.round(rootRect.height * dpr))
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
        canvas.style.width = `${rootRect.width}px`
        canvas.style.height = `${rootRect.height}px`
      }

      const sidebarRect = sidebarElement?.getBoundingClientRect()
      const lyricsRect = lyricsElement?.getBoundingClientRect()
      const viewportHeight = Math.max(rootRect.height, 680)
      const virtualHeight = Math.max(viewportHeight * 2.6, viewportHeight + 1400)
      const centerMinX = sidebarRect ? sidebarRect.right - rootRect.left : DEFAULT_SIDEBAR_WIDTH
      const centerMaxX = lyricsRect ? lyricsRect.left - rootRect.left : rootRect.width
      const centerWidth = Math.max(520, centerMaxX - centerMinX)
      const layoutProgress = clampNumber((centerWidth - 560) / 620, 0, 1)
      const fluidProgress = layoutProgress * layoutProgress * (3 - 2 * layoutProgress)

      layoutMetrics = {
        width: rootRect.width,
        height: rootRect.height,
        dpr,
        viewportHeight,
        virtualHeight,
        centerMinX,
        centerMaxX,
        fluidProgress,
        fluidBoundaryScale: 0.48 + fluidProgress * 0.52,
        shapeScale: 0.72 + fluidProgress * 0.28
      }
    }

    const invalidateLayout = (): void => {
      updateLayoutMetrics()
      requestApply()
    }

    const handleScroll = (): void => {
      requestApply()
    }

    const bindScrollElement = (): void => {
      scrollElement?.removeEventListener('scroll', handleScroll)
      scrollElement = isActive ? document.querySelector<HTMLElement>('.home-page') : null
      scrollElement?.addEventListener('scroll', handleScroll, { passive: true })
      requestApply()
    }

    const resizeObserver = new ResizeObserver(invalidateLayout)
    resizeObserver.observe(root)
    const layoutObserver = new ResizeObserver(invalidateLayout)
    const observeLayoutElements = (): void => {
      layoutObserver.disconnect()
      sidebarElement = document.querySelector<HTMLElement>('.sidebar')
      lyricsElement = document.querySelector<HTMLElement>('.lyrics-side-panel')
      document.querySelectorAll<HTMLElement>('.sidebar, .content-pane, .lyrics-side-panel').forEach((element) => layoutObserver.observe(element))
      invalidateLayout()
    }
    observeLayoutElements()
    const appShellObserver = new MutationObserver(() => {
      observeLayoutElements()
      requestApply()
    })
    const appShell = document.querySelector('.app-shell')
    if (appShell) appShellObserver.observe(appShell, { attributes: true, attributeFilter: ['class', 'style'], childList: true })
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
      if (frame) window.cancelAnimationFrame(frame)
      scrollElement?.removeEventListener('scroll', handleScroll)
      themeObserver.disconnect()
      appShellObserver.disconnect()
      layoutObserver.disconnect()
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
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_SIDEBAR_WIDTH)
  const [viewportWidth, setViewportWidth] = React.useState(() => window.innerWidth)
  const [route, setRoute] = React.useState<AppRoute>({ name: 'home' })
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [settingsCategory, setSettingsCategory] = React.useState<SettingsCategoryKey>('appearance')
  const [nowPlayingSettingsTab, setNowPlayingSettingsTab] = React.useState<NowPlayingSettingsTab>('general')
  const [selectedNowPlayingSkin, setSelectedNowPlayingSkin] = React.useState<NowPlayingSkinID>(() => storedNowPlayingSkin())
  const [isNowPlayingArtBackgroundEnabled, setIsNowPlayingArtBackgroundEnabled] = React.useState(() => storedBoolean('nowPlayingArtBackgroundEnabled', true))
  const [classicVisualizerMode, setClassicVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerMode())
  const [appleVisualizerMode, setAppleVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.appleStyle.visualizerMode', 'led'))
  const [rotatingVisualizerMode, setRotatingVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.rotatingCover.visualizerMode', 'off'))
  const [cassetteVisualizerMode, setCassetteVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.kmgcccCassette.visualizerMode', 'off'))
  const [isArtworkFrameMaskEnabled, setIsArtworkFrameMaskEnabled] = React.useState(() => storedBoolean('skin.classicLED.artworkFrameMaskEnabled', true))
  const [isRotatingCdMode, setIsRotatingCdMode] = React.useState(() => storedBoolean('skin.rotatingCover.cdMode', false))
  const [isAppleDynamicBackgroundEnabled, setIsAppleDynamicBackgroundEnabled] = React.useState(() => storedBoolean('skin.appleStyle.dynamicBackgroundEnabled', true))
  const [appleMeshSpeed, setAppleMeshSpeed] = React.useState<AppleMeshSpeed>(() => storedAppleMeshSpeed())
  const [isCassetteKmgLookEnabled, setIsCassetteKmgLookEnabled] = React.useState(() => storedBoolean('skin.kmgcccCassette.showKmgLook', false))
  const [lyricsRenderQuality, setLyricsRenderQuality] = React.useState<'performance' | 'balanced' | 'quality'>(() => storedString('amllLyricsRenderQuality', 'balanced', ['performance', 'balanced', 'quality']))
  const [isDiscreteWordHighlightEnabled, setIsDiscreteWordHighlightEnabled] = React.useState(() => storedBoolean('amllDiscreteWordHighlightEnabled', false))
  const [lyricsFontSize, setLyricsFontSize] = React.useState(() => clampNumber(storedNumber('lyricsFontSize', 26), 16, 48))
  const [lyricsTranslationFontSize, setLyricsTranslationFontSize] = React.useState(() => clampNumber(storedNumber('lyricsTranslationFontSize', 16), 12, 36))
  const [lyricsFontWeightLight, setLyricsFontWeightLight] = React.useState(() => clampNumber(storedNumber('lyricsFontWeightLight', 600), 100, 700))
  const [lyricsFontWeightDark, setLyricsFontWeightDark] = React.useState(() => clampNumber(storedNumber('lyricsFontWeightDark', 100), 100, 700))
  const [lyricsTranslationFontWeightLight, setLyricsTranslationFontWeightLight] = React.useState(() => clampNumber(storedNumber('lyricsTranslationFontWeightLight', 400), 100, 700))
  const [lyricsTranslationFontWeightDark, setLyricsTranslationFontWeightDark] = React.useState(() => clampNumber(storedNumber('lyricsTranslationFontWeightDark', 100), 100, 700))
  const [lyricsFontNameZh, setLyricsFontNameZh] = React.useState(() => storedString('lyricsFontNameZh', 'PingFang SC', lyricsFontFamilyOptions))
  const [lyricsFontNameEn, setLyricsFontNameEn] = React.useState(() => storedString('lyricsFontNameEn', 'SF Pro Text', lyricsFontFamilyOptions))
  const [lyricsTranslationFontName, setLyricsTranslationFontName] = React.useState(() => storedString('lyricsTranslationFontName', 'PingFang SC', lyricsFontFamilyOptions))
  const [lyricsLeadInMs, setLyricsLeadInMs] = React.useState(() => clampNumber(storedNumber('lyricsLeadInMs', 600), 0, 1200))
  const [lyricsNearSwitchGapMs, setLyricsNearSwitchGapMs] = React.useState(() => clampNumber(storedNumber('lyricsNearSwitchGapMs', 160), 0, 500))
  const [lyricsGlobalAdvanceMs, setLyricsGlobalAdvanceMs] = React.useState(() => clampNumber(storedNumber('lyricsGlobalAdvanceMs', 0), -1000, 1000))
  const [ledCount, setLedCount] = React.useState(() => storedNumber('ledCount', 11))
  const [ledBrightnessLevels, setLedBrightnessLevels] = React.useState(() => storedNumber('ledBrightnessLevels', 5))
  const [ledCutoffHz, setLedCutoffHz] = React.useState(() => storedNumber('ledCutoffHz', 1200))
  const [ledSpeed, setLedSpeed] = React.useState(() => storedNumber('ledSpeed', 1))
  const [artworkFrameIndex, setArtworkFrameIndex] = React.useState(0)
  const [isLyricsSidebarOpen, setIsLyricsSidebarOpen] = React.useState(false)
  const [lyricsSidebarWidth, setLyricsSidebarWidth] = React.useState(460)
  const [isFullscreenLyricsOpen, setIsFullscreenLyricsOpen] = React.useState(false)
  const [currentId, setCurrentId] = React.useState(fallbackHomeSnapshot.heroTrack?.id ?? fallbackHomeSnapshot.tracks[0]?.id ?? '')
  const [playbackQueueIds, setPlaybackQueueIds] = React.useState<string[]>(() => fallbackHomeSnapshot.tracks.map((track) => track.id))
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isShuffleEnabled, setIsShuffleEnabled] = React.useState(false)
  const [volume, setVolume] = React.useState(0.72)
  const [playbackTime, setPlaybackTime] = React.useState(0)
  const [playbackDuration, setPlaybackDuration] = React.useState(0)
  const [importSyncState, setImportSyncState] = React.useState<ImportSyncState | null>(null)
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(null)
  const [libraryDialog, setLibraryDialog] = React.useState<LibraryDialogState | null>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const lastPlaybackTimeRef = React.useRef(0)
  const loadedAudioTrackRef = React.useRef<string>('')
  const albums = React.useMemo(() => albumById(homeSnapshot), [homeSnapshot])
  const currentTrack = React.useMemo(
    () => homeSnapshot.tracks.find((track) => track.id === currentId) ?? homeSnapshot.heroTrack ?? homeSnapshot.tracks[0],
    [currentId, homeSnapshot]
  )
  const playbackQueue = React.useMemo(() => {
    const queueTracks = playbackQueueIds
      .map((id) => homeSnapshot.tracks.find((track) => track.id === id))
      .filter((track): track is HomeTrack => Boolean(track))
    return queueTracks.length ? queueTracks : homeSnapshot.tracks
  }, [homeSnapshot.tracks, playbackQueueIds])
  const fallbackCoverThemeStyle = React.useMemo(() => coverThemeFor(currentTrack, albums), [albums, currentTrack])
  const currentArtworkUrl = React.useMemo(() => currentTrack ? trackArtwork(currentTrack, albums) : '', [albums, currentTrack])
  const [coverThemeStyle, setCoverThemeStyle] = React.useState<React.CSSProperties>(fallbackCoverThemeStyle)
  const desktopStyle = React.useMemo(() => ({
    ...coverThemeStyle,
    '--lyrics-font-size': `${lyricsFontSize}px`,
    '--lyrics-translation-font-size': `${lyricsTranslationFontSize}px`,
    '--amll-quality-scale': lyricsRenderQuality === 'performance' ? 0.78 : lyricsRenderQuality === 'quality' ? 1.18 : 1
  }) as React.CSSProperties, [coverThemeStyle, lyricsFontSize, lyricsRenderQuality, lyricsTranslationFontSize])
  const selectedVisualizerMode = selectedNowPlayingSkin === 'coverLed'
    ? classicVisualizerMode
    : selectedNowPlayingSkin === 'appleStyle'
      ? appleVisualizerMode
      : selectedNowPlayingSkin === 'rotatingCover'
        ? rotatingVisualizerMode
        : cassetteVisualizerMode
  const effectiveLyricPlaybackTime = Math.max(0, playbackTime + lyricsGlobalAdvanceMs / 1000)
  const lyricsWidth = isLyricsSidebarOpen ? lyricsSidebarWidth : 0
  const adaptiveSidebarWidth = React.useMemo(() => {
    if (isSidebarCollapsed) return COLLAPSED_SIDEBAR_WIDTH
    const contentTargetWidth = isLyricsSidebarOpen ? 760 : 820
    const availableSidebarWidth = viewportWidth - lyricsWidth - contentTargetWidth
    if (availableSidebarWidth < 180) return COLLAPSED_SIDEBAR_WIDTH
    return clampNumber(Math.min(sidebarWidth, availableSidebarWidth), 180, sidebarWidth)
  }, [isLyricsSidebarOpen, isSidebarCollapsed, lyricsWidth, sidebarWidth, viewportWidth])
  const isSidebarVisuallyCollapsed = isSidebarCollapsed || adaptiveSidebarWidth <= 118
  const openContextMenu = React.useCallback((event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - 230),
      y: Math.min(event.clientY, window.innerHeight - 260),
      items
    })
  }, [])

  React.useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('blur', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('blur', close)
    }
  }, [contextMenu])

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
    if (!currentTrack?.id) return
    setArtworkFrameIndex(hashString(currentTrack.id) % artworkFrameAssets.length)
  }, [currentTrack?.id])

  React.useEffect(() => {
    persistSetting('nowPlayingArtBackgroundEnabled', isNowPlayingArtBackgroundEnabled)
  }, [isNowPlayingArtBackgroundEnabled])

  React.useEffect(() => {
    persistSetting('nowPlayingSkin', selectedNowPlayingSkin)
  }, [selectedNowPlayingSkin])

  React.useEffect(() => {
    persistSetting('skin.classicLED.visualizerMode', classicVisualizerMode)
  }, [classicVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.appleStyle.visualizerMode', appleVisualizerMode)
  }, [appleVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.rotatingCover.visualizerMode', rotatingVisualizerMode)
  }, [rotatingVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.kmgcccCassette.visualizerMode', cassetteVisualizerMode)
  }, [cassetteVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.classicLED.artworkFrameMaskEnabled', isArtworkFrameMaskEnabled)
  }, [isArtworkFrameMaskEnabled])

  React.useEffect(() => {
    persistSetting('skin.rotatingCover.cdMode', isRotatingCdMode)
  }, [isRotatingCdMode])

  React.useEffect(() => {
    persistSetting('skin.appleStyle.dynamicBackgroundEnabled', isAppleDynamicBackgroundEnabled)
  }, [isAppleDynamicBackgroundEnabled])

  React.useEffect(() => {
    persistSetting('skin.appleStyle.flowSpeed', appleMeshSpeed)
  }, [appleMeshSpeed])

  React.useEffect(() => {
    persistSetting('skin.kmgcccCassette.showKmgLook', isCassetteKmgLookEnabled)
  }, [isCassetteKmgLookEnabled])

  React.useEffect(() => {
    persistSetting('amllLyricsRenderQuality', lyricsRenderQuality)
  }, [lyricsRenderQuality])

  React.useEffect(() => {
    persistSetting('amllDiscreteWordHighlightEnabled', isDiscreteWordHighlightEnabled)
  }, [isDiscreteWordHighlightEnabled])

  React.useEffect(() => {
    persistSetting('lyricsFontSize', lyricsFontSize)
  }, [lyricsFontSize])

  React.useEffect(() => {
    persistSetting('lyricsTranslationFontSize', lyricsTranslationFontSize)
  }, [lyricsTranslationFontSize])

  React.useEffect(() => {
    persistSetting('lyricsFontWeightLight', lyricsFontWeightLight)
  }, [lyricsFontWeightLight])

  React.useEffect(() => {
    persistSetting('lyricsFontWeightDark', lyricsFontWeightDark)
  }, [lyricsFontWeightDark])

  React.useEffect(() => {
    persistSetting('lyricsTranslationFontWeightLight', lyricsTranslationFontWeightLight)
  }, [lyricsTranslationFontWeightLight])

  React.useEffect(() => {
    persistSetting('lyricsTranslationFontWeightDark', lyricsTranslationFontWeightDark)
  }, [lyricsTranslationFontWeightDark])

  React.useEffect(() => {
    persistSetting('lyricsFontNameZh', lyricsFontNameZh)
  }, [lyricsFontNameZh])

  React.useEffect(() => {
    persistSetting('lyricsFontNameEn', lyricsFontNameEn)
  }, [lyricsFontNameEn])

  React.useEffect(() => {
    persistSetting('lyricsTranslationFontName', lyricsTranslationFontName)
  }, [lyricsTranslationFontName])

  React.useEffect(() => {
    persistSetting('lyricsLeadInMs', lyricsLeadInMs)
  }, [lyricsLeadInMs])

  React.useEffect(() => {
    persistSetting('lyricsNearSwitchGapMs', lyricsNearSwitchGapMs)
  }, [lyricsNearSwitchGapMs])

  React.useEffect(() => {
    persistSetting('lyricsGlobalAdvanceMs', lyricsGlobalAdvanceMs)
  }, [lyricsGlobalAdvanceMs])

  React.useEffect(() => {
    persistSetting('ledCount', ledCount)
  }, [ledCount])

  React.useEffect(() => {
    persistSetting('ledBrightnessLevels', ledBrightnessLevels)
  }, [ledBrightnessLevels])

  React.useEffect(() => {
    persistSetting('ledCutoffHz', ledCutoffHz)
  }, [ledCutoffHz])

  React.useEffect(() => {
    persistSetting('ledSpeed', ledSpeed)
  }, [ledSpeed])

  React.useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)
    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [currentTrack?.sourceUrl])

  const applyHomeSnapshot = React.useCallback((snapshot: HomeSnapshot, preferredTrackId?: string) => {
    setHomeSnapshot(snapshot)
    setPlaybackQueueIds((ids) => {
      const nextIds = snapshotWithoutMissingQueueIds(snapshot, ids)
      return nextIds.length ? nextIds : snapshot.tracks.map((track) => track.id)
    })
    setCurrentId((value) => {
      const nextId = preferredTrackId || value
      if (nextId && snapshot.tracks.some((track) => track.id === nextId)) return nextId
      return snapshot.heroTrack?.id || snapshot.tracks[0]?.id || ''
    })
  }, [])

  React.useEffect(() => {
    let cancelled = false

    window.kmgccc
      ?.getHomeSnapshot()
      .then((snapshot) => {
        if (cancelled) return
        applyHomeSnapshot(snapshot)
      })
      .catch(() => {
        applyHomeSnapshot(fallbackHomeSnapshot)
      })

    return () => {
      cancelled = true
    }
  }, [applyHomeSnapshot])

  const seekTo = React.useCallback((seconds: number) => {
    if (!Number.isFinite(seconds)) return
    const nextTime = Math.max(0, seconds)
    const audio = audioRef.current
    if (audio && currentTrack?.sourceUrl) {
      try {
        audio.currentTime = nextTime
      } catch {
        // Keep the visual timeline responsive even if the media element cannot seek yet.
      }
    }
    lastPlaybackTimeRef.current = nextTime
    setPlaybackTime(nextTime)
  }, [currentTrack?.sourceUrl])
  const togglePlayback = React.useCallback(() => {
    setIsPlaying((value) => !value)
  }, [])
  const playTrackByIndex = React.useCallback((index: number) => {
    const tracks = playbackQueue
    if (!tracks.length) return
    const nextIndex = ((index % tracks.length) + tracks.length) % tracks.length
    setCurrentId(tracks[nextIndex].id)
    setPlaybackTime(0)
    setPlaybackDuration(0)
    setIsPlaying(true)
  }, [playbackQueue])
  const playPreviousTrack = React.useCallback(() => {
    const currentIndex = playbackQueue.findIndex((track) => track.id === currentId)
    if (currentIndex < 0) return
    if (playbackTime > 3) {
      seekTo(0)
      return
    }
    playTrackByIndex(currentIndex - 1)
  }, [currentId, playbackQueue, playTrackByIndex, playbackTime, seekTo])
  const playNextTrack = React.useCallback(() => {
    const tracks = playbackQueue
    if (!tracks.length) return
    const currentIndex = tracks.findIndex((track) => track.id === currentId)
    if (isShuffleEnabled && tracks.length > 1) {
      let nextIndex = Math.floor(Math.random() * tracks.length)
      if (nextIndex === currentIndex) nextIndex = (nextIndex + 1) % tracks.length
      playTrackByIndex(nextIndex)
      return
    }
    playTrackByIndex(currentIndex >= 0 ? currentIndex + 1 : 0)
  }, [currentId, playbackQueue, isShuffleEnabled, playTrackByIndex])
  const toggleShuffle = React.useCallback(() => {
    setIsShuffleEnabled((value) => !value)
  }, [])
  const changeVolume = React.useCallback((nextVolume: number) => {
    setVolume(clampNumber(nextVolume, 0, 1))
  }, [])
  const navigateHome = React.useCallback(() => {
    setRoute({ name: 'home' })
  }, [])
  const openNowPlaying = React.useCallback(() => {
    setRoute({ name: 'nowPlaying' })
    setIsSidebarCollapsed(true)
  }, [])
  const openSettings = React.useCallback(() => {
    setSettingsCategory('nowPlaying')
    setIsSettingsOpen(true)
  }, [])
  const changeNowPlayingSkin = React.useCallback((skin: NowPlayingSkinID) => {
    setSelectedNowPlayingSkin((previous) => {
      if (previous === skin) return previous
      if (skin === 'coverLed') {
        setClassicVisualizerMode('led')
      } else if (skin === 'appleStyle') {
        setAppleVisualizerMode('led')
      } else if (skin === 'rotatingCover') {
        setRotatingVisualizerMode('led')
        setIsRotatingCdMode(true)
      }
      return skin
    })
  }, [])
  const importAudioFile = React.useCallback(async () => {
    setImportSyncState({
      title: '准备导入',
      artist: '',
      detail: '选择文件后开始导入；支持一次选择多首，NCM 会先转换为本地可播放音频',
      status: 'running',
      progress: 0.06,
      processedCount: 0,
      totalCount: 1
    })

    let importedTracks: LocalAudioImport[] | null | undefined
    try {
      const result = await window.kmgccc?.importAudioFiles()
      importedTracks = result?.tracks
    } catch {
      setImportSyncState({
        title: '导入失败',
        artist: '',
        detail: 'NCM 转换或音频批量导入失败',
        status: 'failed',
        progress: 1,
        processedCount: 0,
        totalCount: 1
      })
      return
    }

    if (!importedTracks?.length) {
      setImportSyncState(null)
      return
    }

    const importedSnapshot = await window.kmgccc?.getHomeSnapshot()
    if (importedSnapshot) {
      applyHomeSnapshot(importedSnapshot, importedTracks[0].id)
      setPlaybackQueueIds(importedSnapshot.tracks.map((track) => track.id))
    } else {
      setHomeSnapshot((snapshot) => importedTracks.reduce(snapshotWithImportedTrack, snapshot))
    }
    setCurrentId(importedTracks[0].id)
    setRoute({ name: 'allTracks' })
    setPlaybackTime(0)
    setPlaybackDuration(0)
    setIsPlaying(false)

    let completedCount = 0
    try {
      for (const [index, importedTrack] of importedTracks.entries()) {
        setImportSyncState({
          title: importedTrack.title,
          artist: importedTrack.artist,
          detail: importedTrack.convertedFromNcm
            ? `NCM 已转换为 ${importedTrack.conversionFormat?.toUpperCase() ?? 'MP3'}，正在补全歌词、歌曲信息、歌手信息、专辑信息`
            : '正在补全歌词、歌曲信息、歌手信息、专辑信息',
          status: 'running',
          progress: (index + 0.24) / importedTracks.length,
          processedCount: index,
          totalCount: importedTracks.length
        })
        const result = await window.kmgccc?.syncTrackInfo(importedTrack)
        if (!result) throw new Error('sync unavailable')
        completedCount += 1
        setHomeSnapshot((snapshot) => snapshotWithSyncedTrack(snapshot, result))
        if (index === 0) setCurrentId(result.track.id)
      }
      const syncedSnapshot = await window.kmgccc?.getHomeSnapshot()
      if (syncedSnapshot) applyHomeSnapshot(syncedSnapshot, importedTracks[0].id)
      setImportSyncState({
        title: importedTracks.length === 1 ? importedTracks[0].title : `已导入 ${importedTracks.length} 首歌曲`,
        artist: importedTracks.length === 1 ? importedTracks[0].artist : '',
        detail: '已补全可用的歌曲信息、专辑信息与歌词',
        status: 'completed',
        progress: 1,
        processedCount: completedCount,
        totalCount: importedTracks.length
      })
      window.setTimeout(() => setImportSyncState(null), 1400)
    } catch {
      setImportSyncState({
        title: importedTracks.length === 1 ? importedTracks[0].title : '批量导入',
        artist: importedTracks.length === 1 ? importedTracks[0].artist : '',
        detail: '补全失败，已保留本地导入信息',
        status: 'failed',
        progress: 1,
        processedCount: completedCount,
        totalCount: importedTracks.length
      })
    }
  }, [applyHomeSnapshot])
  const toggleSidebar = React.useCallback(() => {
    setIsSidebarCollapsed((value) => {
      const next = !value
      if (!next && sidebarWidth < 220) {
        setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)
      }
      return next
    })
  }, [sidebarWidth])
  const selectTrack = React.useCallback((id: string) => {
    setPlaybackQueueIds((ids) => ids.length ? ids : homeSnapshot.tracks.map((track) => track.id))
    setCurrentId(id)
    setIsPlaying(true)
  }, [homeSnapshot.tracks])
  const playTracksAsQueue = React.useCallback((tracks: HomeTrack[], preferredTrackId?: string) => {
    if (!tracks.length) return
    const firstId = preferredTrackId && tracks.some((track) => track.id === preferredTrackId) ? preferredTrackId : tracks[0].id
    setPlaybackQueueIds(tracks.map((track) => track.id))
    setCurrentId(firstId)
    setPlaybackTime(0)
    setPlaybackDuration(0)
    setIsPlaying(true)
  }, [])
  const playRouteTracks = React.useCallback((targetRoute: DetailRoute, preferredTrackId?: string) => {
    playTracksAsQueue(tracksForRoute(targetRoute, homeSnapshot), preferredTrackId)
  }, [homeSnapshot, playTracksAsQueue])
  const playHomeTrack = React.useCallback((trackId: string) => {
    setPlaybackQueueIds(homeSnapshot.tracks.map((track) => track.id))
    setCurrentId(trackId)
    setIsPlaying(true)
  }, [homeSnapshot.tracks])
  const refreshLibrarySnapshot = React.useCallback(async (preferredTrackId?: string) => {
    const snapshot = await window.kmgccc?.getHomeSnapshot()
    if (snapshot) applyHomeSnapshot(snapshot, preferredTrackId)
  }, [applyHomeSnapshot])
  const editTrack = React.useCallback((track: HomeTrack) => setLibraryDialog({ kind: 'editTrack', track }), [])
  const deleteTrack = React.useCallback((track: HomeTrack) => setLibraryDialog({ kind: 'deleteTrack', track }), [])
  const editAlbum = React.useCallback((album: HomeAlbumCard) => setLibraryDialog({ kind: 'editAlbum', album }), [])
  const deleteAlbum = React.useCallback((album: HomeAlbumCard) => setLibraryDialog({ kind: 'deleteAlbum', album }), [])
  const editArtist = React.useCallback((artist: HomeArtistCard) => setLibraryDialog({ kind: 'editArtist', artist }), [])
  const deleteArtist = React.useCallback((artist: HomeArtistCard) => setLibraryDialog({ kind: 'deleteArtist', artist }), [])
  const createPlaylist = React.useCallback(() => setLibraryDialog({ kind: 'createPlaylist' }), [])
  const editPlaylist = React.useCallback((playlist: HomePlaylistCard) => {
    if (playlist.id !== 'playlist-library') setLibraryDialog({ kind: 'editPlaylist', playlist })
  }, [])
  const deletePlaylist = React.useCallback((playlist: HomePlaylistCard) => {
    if (playlist.id !== 'playlist-library') setLibraryDialog({ kind: 'deletePlaylist', playlist })
  }, [])
  const removeTrackFromCurrentPlaylist = React.useCallback(async (track: HomeTrack) => {
    if (route.name !== 'playlistDetail' || route.id === 'playlist-library') return
    const snapshot = await window.kmgccc?.removeTrackFromPlaylist(route.id, track.id)
    if (snapshot) applyHomeSnapshot(snapshot)
  }, [applyHomeSnapshot, route])
  const addTrackToPlaylist = React.useCallback(async (playlistId: string, track: HomeTrack) => {
    const snapshot = await window.kmgccc?.addTrackToPlaylist(playlistId, track.id)
    if (snapshot) applyHomeSnapshot(snapshot, track.id)
  }, [applyHomeSnapshot])
  const createPlaylistWithTrack = React.useCallback((track: HomeTrack) => {
    setLibraryDialog({ kind: 'createPlaylist', track })
  }, [])
  const submitLibraryDialog = React.useCallback(async (values: Record<string, string>) => {
    const dialog = libraryDialog
    if (!dialog) return
    let snapshot: HomeSnapshot | undefined | null
    let preferredTrackId: string | undefined

    if (dialog.kind === 'editTrack') {
      preferredTrackId = dialog.track.id
      snapshot = await window.kmgccc?.updateTrack({
        ...dialog.track,
        title: values.title?.trim() || dialog.track.title,
        artist: values.artist?.trim() || dialog.track.artist,
        album: values.album?.trim() || dialog.track.album,
        discNumber: values.discNumber ? Number(values.discNumber) : undefined,
        trackNumber: values.trackNumber ? Number(values.trackNumber) : undefined,
        lyricsText: values.lyricsText
      } as LocalAudioImport)
    } else if (dialog.kind === 'editAlbum') {
      snapshot = await window.kmgccc?.updateAlbum(
        dialog.album.id,
        values.title?.trim() || dialog.album.title,
        values.artist?.trim() || dialog.album.artist
      )
    } else if (dialog.kind === 'editArtist') {
      snapshot = await window.kmgccc?.updateArtist(dialog.artist.id, values.name?.trim() || dialog.artist.name)
    } else if (dialog.kind === 'editPlaylist') {
      snapshot = await window.kmgccc?.updatePlaylist(dialog.playlist.id, values.name?.trim() || dialog.playlist.name)
    } else if (dialog.kind === 'createPlaylist') {
      const name = values.name?.trim() || '新建播放列表'
      snapshot = await window.kmgccc?.createPlaylist(name)
      const playlist = snapshot?.playlists.find((entry) => entry.name === name)
      if (dialog.track && playlist) {
        preferredTrackId = dialog.track.id
        snapshot = await window.kmgccc?.addTrackToPlaylist(playlist.id, dialog.track.id)
      }
    } else if (dialog.kind === 'deleteTrack') {
      snapshot = await window.kmgccc?.deleteTrack(dialog.track.id)
    } else if (dialog.kind === 'deleteAlbum') {
      snapshot = await window.kmgccc?.deleteAlbum(dialog.album.id)
    } else if (dialog.kind === 'deleteArtist') {
      snapshot = await window.kmgccc?.deleteArtist(dialog.artist.id)
    } else if (dialog.kind === 'deletePlaylist') {
      snapshot = await window.kmgccc?.deletePlaylist(dialog.playlist.id)
    }

    if (snapshot) applyHomeSnapshot(snapshot, preferredTrackId)
    setLibraryDialog(null)
  }, [applyHomeSnapshot, libraryDialog])
  const toggleLyricsSidebar = React.useCallback(() => {
    setIsLyricsSidebarOpen((value) => !value)
  }, [])
  const toggleFullscreenLyrics = React.useCallback(() => {
    setIsFullscreenLyricsOpen((value) => !value)
  }, [])

  React.useEffect(() => {
    if (isFullscreenLyricsOpen) setIsSidebarCollapsed(true)
  }, [isFullscreenLyricsOpen])

  React.useEffect(() => {
    if (!isFullscreenLyricsOpen) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsFullscreenLyricsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreenLyricsOpen])
  const handleSidebarResizeStart = React.useCallback((event: React.PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = isSidebarVisuallyCollapsed ? COLLAPSED_SIDEBAR_WIDTH : sidebarWidth
    const minWidth = COLLAPSED_SIDEBAR_WIDTH
    const maxWidth = 500
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
  }, [isSidebarVisuallyCollapsed, sidebarWidth])
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

    const audioIdentity = `${currentTrack.id}:${currentTrack.sourceUrl}`
    if (loadedAudioTrackRef.current !== audioIdentity) {
      audio.src = currentTrack.sourceUrl
      audio.load()
      loadedAudioTrackRef.current = audioIdentity
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

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

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
    if (homeSnapshot.tracks.length > 1) {
      playNextTrack()
      return
    }
    setIsPlaying(false)
    setPlaybackTime(0)
  }, [homeSnapshot.tracks.length, playNextTrack])

  return (
    <div className={`desktop-root ${isFullscreenLyricsOpen ? 'fullscreen-lyrics-open' : ''}`} style={desktopStyle}>
      <audio ref={audioRef} onLoadedMetadata={updateAudioMetadata} onTimeUpdate={updateAudioTime} onEnded={handleAudioEnded} />
      <LiquidGlassFilters />
      <div
        className={`app-shell ${isSidebarVisuallyCollapsed ? 'sidebar-collapsed' : ''} ${isLyricsSidebarOpen ? 'lyrics-sidebar-visible' : ''} ${route.name === 'nowPlaying' ? 'now-playing-route' : ''}`}
        style={
          {
            '--sidebar-width': `${isSidebarVisuallyCollapsed ? COLLAPSED_SIDEBAR_WIDTH : adaptiveSidebarWidth}px`,
            '--lyrics-width': `${lyricsWidth}px`
          } as React.CSSProperties
        }
      >
        <HomeAmbientShapesLayer isActive={route.name === 'home'} />
        <Sidebar
          snapshot={homeSnapshot}
          route={route}
          onNavigate={setRoute}
          isCollapsed={isSidebarVisuallyCollapsed}
          onToggle={toggleSidebar}
          onResizeStart={handleSidebarResizeStart}
          onToggleFullscreenLyrics={toggleFullscreenLyrics}
          onOpenSettings={openSettings}
          onCreatePlaylist={createPlaylist}
          onEditPlaylist={editPlaylist}
          onDeletePlaylist={deletePlaylist}
          onEditArtist={editArtist}
          onDeleteArtist={deleteArtist}
          onEditAlbum={editAlbum}
          onDeleteAlbum={deleteAlbum}
          onPlayRoute={playRouteTracks}
          onOpenContextMenu={openContextMenu}
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
          ) : route.name === 'nowPlaying' ? (
            <NowPlayingPage
              track={currentTrack}
              albums={albums}
              bkThemeStyle={coverThemeStyle}
              isPlaying={isPlaying}
              volume={volume}
              ledCount={ledCount}
              ledBrightnessLevels={ledBrightnessLevels}
              ledSpeed={ledSpeed}
              skinID={selectedNowPlayingSkin}
              visualizerMode={selectedVisualizerMode}
              artBackgroundEnabled={isNowPlayingArtBackgroundEnabled}
              artworkFrameMaskEnabled={isArtworkFrameMaskEnabled}
              artworkFrameIndex={artworkFrameIndex}
              rotatingCdMode={isRotatingCdMode}
              appleDynamicBackgroundEnabled={isAppleDynamicBackgroundEnabled}
              appleMeshSpeed={appleMeshSpeed}
              cassetteKmgLookEnabled={isCassetteKmgLookEnabled}
              onArtworkFrameAdvance={() => setArtworkFrameIndex((value) => (value + 1) % artworkFrameAssets.length)}
            />
          ) : (
            <LibraryDetailPage
              route={route}
              snapshot={homeSnapshot}
              albums={albums}
              currentId={currentId}
              onNavigate={setRoute}
              onSelect={selectTrack}
              onPlayRoute={playRouteTracks}
              onEditTrack={editTrack}
              onDeleteTrack={deleteTrack}
              onRemoveTrackFromPlaylist={removeTrackFromCurrentPlaylist}
              onAddTrackToPlaylist={addTrackToPlaylist}
              onCreatePlaylistWithTrack={createPlaylistWithTrack}
              onEditArtist={editArtist}
              onDeleteArtist={deleteArtist}
              onEditAlbum={editAlbum}
              onDeleteAlbum={deleteAlbum}
              onEditPlaylist={editPlaylist}
              onDeletePlaylist={deletePlaylist}
              onOpenContextMenu={openContextMenu}
            />
          )}

          {currentTrack ? (
            <>
              {isFullscreenLyricsOpen ? <div className="mini-player-hover-zone no-drag" aria-hidden="true" /> : null}
              <MiniPlayer
                track={currentTrack}
                tracks={playbackQueue}
                albums={albums}
                currentId={currentId}
                isPlaying={isPlaying}
                isShuffleEnabled={isShuffleEnabled}
                volume={volume}
                playbackTime={effectiveLyricPlaybackTime}
                playbackDuration={playbackDuration || currentTrack.duration}
                onPlayPause={togglePlayback}
                onPrevious={playPreviousTrack}
                onNext={playNextTrack}
                onToggleShuffle={toggleShuffle}
                onVolumeChange={changeVolume}
                onSelectTrack={selectTrack}
                onOpenNowPlaying={openNowPlaying}
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
            playbackTime={effectiveLyricPlaybackTime}
            isPlaying={isPlaying}
            onSeek={seekTo}
            onResizeStart={handleLyricsResizeStart}
          />
        ) : null}
        {isSettingsOpen ? (
          <SettingsPanel
            selectedCategory={settingsCategory}
            onSelectCategory={setSettingsCategory}
            onClose={() => setIsSettingsOpen(false)}
            selectedNowPlayingTab={nowPlayingSettingsTab}
            onSelectNowPlayingTab={setNowPlayingSettingsTab}
            selectedNowPlayingSkin={selectedNowPlayingSkin}
            onSelectedNowPlayingSkinChange={changeNowPlayingSkin}
            artBackgroundEnabled={isNowPlayingArtBackgroundEnabled}
            onArtBackgroundEnabledChange={setIsNowPlayingArtBackgroundEnabled}
            classicVisualizerMode={classicVisualizerMode}
            onClassicVisualizerModeChange={setClassicVisualizerMode}
            appleVisualizerMode={appleVisualizerMode}
            onAppleVisualizerModeChange={setAppleVisualizerMode}
            rotatingVisualizerMode={rotatingVisualizerMode}
            onRotatingVisualizerModeChange={setRotatingVisualizerMode}
            cassetteVisualizerMode={cassetteVisualizerMode}
            onCassetteVisualizerModeChange={setCassetteVisualizerMode}
            artworkFrameMaskEnabled={isArtworkFrameMaskEnabled}
            onArtworkFrameMaskEnabledChange={setIsArtworkFrameMaskEnabled}
            rotatingCdMode={isRotatingCdMode}
            onRotatingCdModeChange={setIsRotatingCdMode}
            appleDynamicBackgroundEnabled={isAppleDynamicBackgroundEnabled}
            onAppleDynamicBackgroundEnabledChange={setIsAppleDynamicBackgroundEnabled}
            appleMeshSpeed={appleMeshSpeed}
            onAppleMeshSpeedChange={setAppleMeshSpeed}
            cassetteKmgLookEnabled={isCassetteKmgLookEnabled}
            onCassetteKmgLookEnabledChange={setIsCassetteKmgLookEnabled}
            lyricsRenderQuality={lyricsRenderQuality}
            onLyricsRenderQualityChange={setLyricsRenderQuality}
            discreteWordHighlightEnabled={isDiscreteWordHighlightEnabled}
            onDiscreteWordHighlightEnabledChange={setIsDiscreteWordHighlightEnabled}
            lyricsFontSize={lyricsFontSize}
            onLyricsFontSizeChange={setLyricsFontSize}
            lyricsTranslationFontSize={lyricsTranslationFontSize}
            onLyricsTranslationFontSizeChange={setLyricsTranslationFontSize}
            lyricsFontWeightLight={lyricsFontWeightLight}
            onLyricsFontWeightLightChange={setLyricsFontWeightLight}
            lyricsFontWeightDark={lyricsFontWeightDark}
            onLyricsFontWeightDarkChange={setLyricsFontWeightDark}
            lyricsTranslationFontWeightLight={lyricsTranslationFontWeightLight}
            onLyricsTranslationFontWeightLightChange={setLyricsTranslationFontWeightLight}
            lyricsTranslationFontWeightDark={lyricsTranslationFontWeightDark}
            onLyricsTranslationFontWeightDarkChange={setLyricsTranslationFontWeightDark}
            lyricsFontNameZh={lyricsFontNameZh}
            onLyricsFontNameZhChange={setLyricsFontNameZh}
            lyricsFontNameEn={lyricsFontNameEn}
            onLyricsFontNameEnChange={setLyricsFontNameEn}
            lyricsTranslationFontName={lyricsTranslationFontName}
            onLyricsTranslationFontNameChange={setLyricsTranslationFontName}
            lyricsLeadInMs={lyricsLeadInMs}
            onLyricsLeadInMsChange={setLyricsLeadInMs}
            lyricsNearSwitchGapMs={lyricsNearSwitchGapMs}
            onLyricsNearSwitchGapMsChange={setLyricsNearSwitchGapMs}
            lyricsGlobalAdvanceMs={lyricsGlobalAdvanceMs}
            onLyricsGlobalAdvanceMsChange={setLyricsGlobalAdvanceMs}
            ledCount={ledCount}
            onLedCountChange={setLedCount}
            ledBrightnessLevels={ledBrightnessLevels}
            onLedBrightnessLevelsChange={setLedBrightnessLevels}
            ledCutoffHz={ledCutoffHz}
            onLedCutoffHzChange={setLedCutoffHz}
            ledSpeed={ledSpeed}
            onLedSpeedChange={setLedSpeed}
          />
        ) : null}
        {isFullscreenLyricsOpen ? (
          <FullscreenLyricsPage track={currentTrack} albums={albums} playbackTime={effectiveLyricPlaybackTime} isPlaying={isPlaying} onSeek={seekTo} />
        ) : null}
        {libraryDialog ? (
          <LibraryDialog state={libraryDialog} onClose={() => setLibraryDialog(null)} onSubmit={submitLibraryDialog} />
        ) : null}
        {contextMenu ? <ContextMenu state={contextMenu} onClose={() => setContextMenu(null)} /> : null}
      </div>
    </div>
  )
}

const ContextMenu = React.memo(function ContextMenu({ state, onClose }: { state: ContextMenuState; onClose: () => void }): React.ReactElement {
  return (
    <div className="context-menu no-drag" style={{ left: state.x, top: state.y }}>
      {state.items.map((item, index) => item.label === '-'
        ? <span className="context-menu-separator" key={`separator-${index}`} />
        : (
          <button
            className={item.danger ? 'danger' : ''}
            key={`${item.label}-${index}`}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onClose()
              item.onSelect()
            }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  )
})

const LibraryDialog = React.memo(function LibraryDialog({
  state,
  onClose,
  onSubmit
}: {
  state: LibraryDialogState
  onClose: () => void
  onSubmit: (values: Record<string, string>) => void
}): React.ReactElement {
  const isDelete = state.kind.startsWith('delete')
  const initialValues = React.useMemo<Record<string, string>>(() => {
    if (state.kind === 'editTrack') {
      return {
        title: state.track.title,
        artist: state.track.artist,
        album: state.track.album,
        discNumber: state.track.discNumber ? String(state.track.discNumber) : '',
        trackNumber: state.track.trackNumber ? String(state.track.trackNumber) : '',
        lyricsText: state.track.lyricsText ?? ''
      } as Record<string, string>
    }
    if (state.kind === 'editAlbum') return { title: state.album.title, artist: state.album.artist } as Record<string, string>
    if (state.kind === 'editArtist') return { name: state.artist.name } as Record<string, string>
    if (state.kind === 'editPlaylist') return { name: state.playlist.name } as Record<string, string>
    if (state.kind === 'createPlaylist') return { name: '新建播放列表' } as Record<string, string>
    return {}
  }, [state])
  const [values, setValues] = React.useState<Record<string, string>>(initialValues)
  React.useEffect(() => setValues(initialValues), [initialValues])
  const update = React.useCallback((key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
  }, [])

  const title =
    state.kind === 'editTrack' ? '编辑歌曲信息'
      : state.kind === 'editAlbum' ? '编辑专辑'
        : state.kind === 'editArtist' ? '编辑艺人'
          : state.kind === 'editPlaylist' ? '编辑播放列表'
            : state.kind === 'createPlaylist' ? '新建播放列表'
              : '确认删除'
  const detail =
    state.kind === 'deleteTrack' ? `从资料库删除“${state.track.title}”？`
      : state.kind === 'deleteAlbum' ? `删除专辑“${state.album.title}”及其中 ${state.album.trackCount} 首歌曲？`
        : state.kind === 'deleteArtist' ? `删除艺人“${state.artist.name}”及其中 ${state.artist.trackCount} 首歌曲？`
          : state.kind === 'deletePlaylist' ? `删除播放列表“${state.playlist.name}”？`
            : ''

  return (
    <div className="library-dialog-backdrop no-drag" role="presentation" onMouseDown={onClose}>
      <section className={`library-dialog ${isDelete ? 'danger' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <strong>{title}</strong>
          <button type="button" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {isDelete ? (
          <p className="library-dialog-message">{detail}</p>
        ) : state.kind === 'editTrack' ? (
          <div className="library-dialog-form">
            <LibraryDialogField label="标题" value={values.title ?? ''} onChange={(value) => update('title', value)} />
            <LibraryDialogField label="艺人" value={values.artist ?? ''} onChange={(value) => update('artist', value)} />
            <LibraryDialogField label="专辑" value={values.album ?? ''} onChange={(value) => update('album', value)} />
            <div className="library-dialog-grid">
              <LibraryDialogField label="碟号" type="number" value={values.discNumber ?? ''} onChange={(value) => update('discNumber', value)} />
              <LibraryDialogField label="曲号" type="number" value={values.trackNumber ?? ''} onChange={(value) => update('trackNumber', value)} />
            </div>
            <label className="library-dialog-field">
              <span>歌词文本</span>
              <textarea value={values.lyricsText ?? ''} onChange={(event) => update('lyricsText', event.currentTarget.value)} />
            </label>
          </div>
        ) : state.kind === 'editAlbum' ? (
          <div className="library-dialog-form">
            <LibraryDialogField label="专辑名称" value={values.title ?? ''} onChange={(value) => update('title', value)} />
            <LibraryDialogField label="专辑艺人" value={values.artist ?? ''} onChange={(value) => update('artist', value)} />
          </div>
        ) : state.kind === 'editArtist' ? (
          <div className="library-dialog-form">
            <LibraryDialogField label="艺人名称" value={values.name ?? ''} onChange={(value) => update('name', value)} />
          </div>
        ) : (
          <div className="library-dialog-form">
            <LibraryDialogField label="播放列表名称" value={values.name ?? ''} onChange={(value) => update('name', value)} />
          </div>
        )}

        <footer>
          <button type="button" onClick={onClose}>取消</button>
          <button className={isDelete ? 'danger' : 'primary'} type="button" onClick={() => onSubmit(values)}>
            {isDelete ? '删除' : '保存'}
          </button>
        </footer>
      </section>
    </div>
  )
})

function LibraryDialogField({
  label,
  value,
  type = 'text',
  onChange
}: {
  label: string
  value: string
  type?: 'text' | 'number'
  onChange: (value: string) => void
}): React.ReactElement {
  return (
    <label className="library-dialog-field">
      <span>{label}</span>
      <input type={type} min={type === 'number' ? 1 : undefined} step={type === 'number' ? 1 : undefined} value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </label>
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
  onResizeStart,
  onToggleFullscreenLyrics,
  onOpenSettings,
  onCreatePlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  onEditArtist,
  onDeleteArtist,
  onEditAlbum,
  onDeleteAlbum,
  onPlayRoute,
  onOpenContextMenu
}: {
  snapshot: HomeSnapshot
  route: AppRoute
  onNavigate: (route: AppRoute) => void
  isCollapsed: boolean
  onToggle: () => void
  onResizeStart: (event: React.PointerEvent) => void
  onToggleFullscreenLyrics: () => void
  onOpenSettings: () => void
  onCreatePlaylist: () => void
  onEditPlaylist: (playlist: HomePlaylistCard) => void
  onDeletePlaylist: (playlist: HomePlaylistCard) => void
  onEditArtist: (artist: HomeArtistCard) => void
  onDeleteArtist: (artist: HomeArtistCard) => void
  onEditAlbum: (album: HomeAlbumCard) => void
  onDeleteAlbum: (album: HomeAlbumCard) => void
  onPlayRoute: (route: DetailRoute, preferredTrackId?: string) => void
  onOpenContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
}): React.ReactElement {
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
            <button type="button" aria-label="新建播放列表" onClick={onCreatePlaylist}>
              <Plus size={17} />
            </button>
          </div>
          {snapshot.playlists.length ? snapshot.playlists.map((playlist) => (
            <button
              className={`playlist-row ${route.name === 'playlistDetail' && route.id === playlist.id ? 'active' : ''}`}
              key={playlist.id}
              type="button"
              onClick={() => onNavigate({ name: 'playlistDetail', id: playlist.id, title: playlist.name })}
              onContextMenu={(event) => onOpenContextMenu(event, [
                { label: '播放', onSelect: () => onPlayRoute({ name: 'playlistDetail', id: playlist.id, title: playlist.name }) },
                ...(playlist.id === 'playlist-library' ? [] : [
                  { label: '编辑播放列表', onSelect: () => onEditPlaylist(playlist) },
                  { label: '-', onSelect: () => {} },
                  { label: '删除播放列表', danger: true, onSelect: () => onDeletePlaylist(playlist) }
                ])
              ])}
            >
              <span className="playlist-icon">
                <Music2 size={18} />
              </span>
              <span>{playlist.name}</span>
            </button>
          )) : (
            <button className="playlist-row muted" type="button" onClick={onCreatePlaylist}>
              <span className="playlist-icon"><Music2 size={18} /></span>
              <span>新建播放列表</span>
            </button>
          )}
        </section>

        <section className="sidebar-section compact no-drag">
          <button className="sidebar-label as-button" type="button" onClick={() => onNavigate({ name: 'artistDetail', id: 'all-artists', title: '所有艺人' })}>
            <UserRound className="sidebar-label-icon" size={19} />
            <span>艺人</span>
          </button>
          {snapshot.artists.slice(0, 8).map((artist) => (
            <button
              className={`playlist-row compact-item ${route.name === 'artistDetail' && route.id === artist.id ? 'active' : ''}`}
              key={artist.id}
              type="button"
              onClick={() => onNavigate({ name: 'artistDetail', id: artist.id, title: artist.name })}
              onContextMenu={(event) => onOpenContextMenu(event, [
                { label: '播放艺人', onSelect: () => onPlayRoute({ name: 'artistDetail', id: artist.id, title: artist.name }) },
                { label: '编辑艺人', onSelect: () => onEditArtist(artist) },
                { label: '-', onSelect: () => {} },
                { label: '删除艺人', danger: true, onSelect: () => onDeleteArtist(artist) }
              ])}
            >
              <span>{artist.name}</span>
            </button>
          ))}
          <button className="sidebar-label as-button" type="button" onClick={() => onNavigate({ name: 'albumDetail', id: 'all-albums', title: '所有专辑' })}>
            <Disc3 className="sidebar-label-icon" size={19} />
            <span>专辑</span>
          </button>
          {snapshot.albums.slice(0, 8).map((album) => (
            <button
              className={`playlist-row compact-item ${route.name === 'albumDetail' && route.id === album.id ? 'active' : ''}`}
              key={album.id}
              type="button"
              onClick={() => onNavigate({ name: 'albumDetail', id: album.id, title: album.title })}
              onContextMenu={(event) => onOpenContextMenu(event, [
                { label: '播放专辑', onSelect: () => onPlayRoute({ name: 'albumDetail', id: album.id, title: album.title }) },
                { label: '编辑专辑', onSelect: () => onEditAlbum(album) },
                { label: '-', onSelect: () => {} },
                { label: '删除专辑', danger: true, onSelect: () => onDeleteAlbum(album) }
              ])}
            >
              <span>{album.title}</span>
            </button>
          ))}
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
          <button className="round-control" type="button" aria-label="设置" onClick={onOpenSettings}>
            <Settings size={18} />
          </button>
          <button className="round-control" type="button" aria-label="外观">
            <Sun size={18} />
          </button>
          <button className="round-control" type="button" aria-label="全屏" onClick={onToggleFullscreenLyrics}>
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
      <div className="import-sync-card">
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
          <button type="button" aria-label="导入歌曲" onClick={onImportAudioFile}>
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
          className={`toolbar-circle toolbar-liquid-pad toolbar-lyrics-button glass-panel ${isLyricsSidebarOpen ? 'active' : ''}`}
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
            {snapshot.artists.map((artist) => (
              <button
                className="home-person-card home-liquid-card glass-panel"
                key={artist.id}
                type="button"
                onClick={() => onNavigate({ name: 'artistDetail', id: artist.id, title: artist.name })}
              >
                {artist.artworkUrl ? (
                  <img src={artist.artworkUrl} alt="" decoding="async" />
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
            {snapshot.albums.map((album) => (
              <button
                className="home-album-card home-liquid-card glass-panel"
                key={album.id}
                type="button"
                onClick={() => onNavigate({ name: 'albumDetail', id: album.id, title: album.title })}
              >
                <img src={albumArtworkFor(album)} alt="" decoding="async" />
                <strong>{album.title}</strong>
                <span>{album.artist}</span>
              </button>
            ))}
          </div>
        </HomeSectionBlock>

        <HomeSectionBlock title="播放列表">
          <div className="home-playlist-grid">
            {snapshot.playlists.map((playlist) => (
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
          {stats.ranking.map((item, index) => (
            <div className="home-rank-row" key={item.trackId}>
              <span>{index + 1}</span>
              <img src={item.artworkUrl || albumArtwork} alt="" decoding="async" />
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

function amllLyricLinesFromParsed(lines: ParsedLyricLine[], trackDuration: number): LyricLine[] {
  const timedLines = lines.filter((line): line is ParsedLyricLine & { time: number } => line.time !== null)
  const durationMs = trackDuration > 0 ? Math.round(trackDuration * 1000) : null

  return timedLines.map((line, index) => {
    const startTime = Math.max(0, Math.round(line.time * 1000))
    const nextStartTime = timedLines[index + 1] ? Math.round(timedLines[index + 1].time * 1000) : null
    const inferredEndTime = nextStartTime !== null ? nextStartTime - 80 : durationMs ?? startTime + 4200
    const endTime = Math.max(startTime + 1200, Math.min(inferredEndTime, startTime + 8200))

    return {
      words: [{ startTime, endTime, word: line.text }],
      translatedLyric: '',
      romanLyric: '',
      startTime,
      endTime,
      isBG: false,
      isDuet: false
    }
  })
}

type LyricsSurfaceProps = {
  track: Track | null | undefined
  albums: Map<string, HomeAlbumCard>
  playbackTime: number
  isPlaying: boolean
  onSeek: (seconds: number) => void
}

type FullscreenLyricHitTarget = {
  index: number
  text: string
  startTime: number
  top: number
  left: number
  width: number
  height: number
}

const AMLLLyricsSurface = React.memo(function AMLLLyricsSurface({
  lines,
  track,
  playbackTime,
  isPlaying,
  onSeek,
  variant
}: {
  lines: ParsedLyricLine[]
  track: Track | null | undefined
  playbackTime: number
  isPlaying: boolean
  onSeek: (seconds: number) => void
  variant: 'side' | 'fullscreen'
}): React.ReactElement {
  const amllLines = React.useMemo(() => amllLyricLinesFromParsed(lines, track?.duration ?? 0), [lines, track?.duration])
  const currentLineIndex = React.useMemo(() => activeLyricIndex(lines, playbackTime), [lines, playbackTime])
  const amllShellRef = React.useRef<HTMLDivElement | null>(null)
  const [amllHitTargets, setAmllHitTargets] = React.useState<FullscreenLyricHitTarget[]>([])
  const amllOptimizeOptions = React.useMemo(() => ({ resetLineTimestamps: false }), [])
  const amllBottomLine = React.useMemo(
    () => variant === 'fullscreen' ? <span className="fullscreen-amll-bottom">{track ? `${track.artist} · ${track.album}` : ''}</span> : undefined,
    [track, variant]
  )

  React.useLayoutEffect(() => {
    const shell = amllShellRef.current
    if (!shell) return
    let frameId = 0
    const timeoutIds: number[] = []

    const measureLyricRows = (): void => {
      const shellRect = shell.getBoundingClientRect()
      const lineElements = Array.from(shell.querySelectorAll<HTMLElement>('[class*="_lyricLine"]'))
        .filter((element) => {
          const classNames = Array.from(element.classList)
          return (
            classNames.some((className) => className.includes('_lyricLine')) &&
            !classNames.some((className) => className.includes('_lyricLineWrapper') || className.includes('_bottomLine'))
          )
        })
        .slice(0, amllLines.length)

      const nextTargets = lineElements
        .map((element, index): FullscreenLyricHitTarget | null => {
          const line = amllLines[index]
          if (!line) return null
          const rect = element.getBoundingClientRect()
          if (rect.width <= 0 || rect.height <= 0) return null
          return {
            index,
            text: line.words.map((word) => word.word).join(''),
            startTime: line.startTime,
            top: Math.max(0, rect.top - shellRect.top - 10),
            left: Math.max(0, rect.left - shellRect.left - 12),
            width: Math.min(shellRect.width, rect.width + 24),
            height: Math.min(shellRect.height, rect.height + 20)
          }
        })
        .filter((target): target is FullscreenLyricHitTarget => target !== null)

      setAmllHitTargets(nextTargets)
    }

    const scheduleMeasure = (): void => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(measureLyricRows)
    }

    scheduleMeasure()
    ;[80, 240, 720].forEach((delay) => {
      timeoutIds.push(window.setTimeout(scheduleMeasure, delay))
    })
    const mutationObserver = new MutationObserver(scheduleMeasure)
    mutationObserver.observe(shell, { childList: true, subtree: true })
    window.addEventListener('resize', scheduleMeasure)

    return () => {
      window.cancelAnimationFrame(frameId)
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
      mutationObserver.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [amllLines, currentLineIndex, track?.id])

  return (
    <div className={`amll-lyrics-surface ${variant === 'fullscreen' ? 'fullscreen-amll-shell' : 'side-amll-shell'} ${variant}`} ref={amllShellRef}>
      <LyricPlayer
        key={`${variant}-${track?.id ?? 'empty'}`}
        className={`fullscreen-amll-player amll-lyrics-player ${variant}`}
        data-lyric-count={amllLines.length}
        lyricLines={amllLines}
        currentTime={Math.max(0, Math.round(playbackTime * 1000))}
        playing={isPlaying}
        alignAnchor="center"
        alignPosition={0.18}
        enableBlur
        enableScale
        enableSpring
        wordFadeWidth={0.5}
        optimizeOptions={amllOptimizeOptions}
        bottomLine={amllBottomLine}
      />
      <div className="fullscreen-amll-hit-layer" aria-hidden={!amllHitTargets.length}>
        {amllHitTargets.map((target) => (
          <button
            key={`${target.index}-${target.startTime}`}
            className="fullscreen-amll-hit-row"
            type="button"
            aria-label={`跳转到 ${target.text}`}
            data-seek-time={target.startTime / 1000}
            style={{
              top: target.top,
              left: target.left,
              width: target.width,
              height: target.height
            }}
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onSeek(target.startTime / 1000)
            }}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            {target.text}
          </button>
        ))}
      </div>
    </div>
  )
})

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
    <aside className="lyrics-side-panel glass-panel no-drag" style={{ '--filter-url': 'url(#lg-sidebar)' } as React.CSSProperties}>
      <div className="lyrics-side-resize-handle" role="separator" aria-orientation="vertical" aria-label="调整歌词侧栏宽度" onPointerDown={onResizeStart} />
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
        hasTimedLyrics ? (
          <AMLLLyricsSurface lines={lines} track={track} playbackTime={playbackTime} isPlaying={isPlaying} onSeek={onSeek} variant="side" />
        ) : (
          <LyricsLineList lines={lines} currentLineIndex={currentLineIndex} onSeek={onSeek} variant="side" />
        )
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
  const hasTimedLyrics = lines.some((line) => line.time !== null)
  const artwork = trackArtwork(track, albums)
  const [pixelStretchBackground, setPixelStretchBackground] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setPixelStretchBackground(null)
    if (!artwork) return
    createCoverPixelStretchBackground(artwork).then((dataUrl) => {
      if (!cancelled) setPixelStretchBackground(dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [artwork])

  return (
    <section className="fullscreen-lyrics-page no-drag">
      <div className="fullscreen-lyrics-mesh" aria-hidden="true" />
      {pixelStretchBackground ? <img className="fullscreen-lyrics-stretch-bg" src={pixelStretchBackground} alt="" decoding="async" /> : null}
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
        {hasTimedLyrics ? (
          <AMLLLyricsSurface lines={lines} track={track} playbackTime={playbackTime} isPlaying={isPlaying} onSeek={onSeek} variant="fullscreen" />
        ) : lines.length ? (
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

const NowPlayingPage = React.memo(function NowPlayingPage({
  track,
  albums,
  bkThemeStyle,
  isPlaying,
  volume,
  ledCount,
  ledBrightnessLevels,
  ledSpeed,
  skinID,
  visualizerMode,
  artBackgroundEnabled,
  artworkFrameMaskEnabled,
  artworkFrameIndex,
  rotatingCdMode,
  appleDynamicBackgroundEnabled,
  appleMeshSpeed,
  cassetteKmgLookEnabled,
  onArtworkFrameAdvance
}: {
  track: Track | null | undefined
  albums: Map<string, HomeAlbumCard>
  bkThemeStyle: React.CSSProperties
  isPlaying: boolean
  volume: number
  ledCount: number
  ledBrightnessLevels: number
  ledSpeed: number
  skinID: NowPlayingSkinID
  visualizerMode: VisualizerMode
  artBackgroundEnabled: boolean
  artworkFrameMaskEnabled: boolean
  artworkFrameIndex: number
  rotatingCdMode: boolean
  appleDynamicBackgroundEnabled: boolean
  appleMeshSpeed: AppleMeshSpeed
  cassetteKmgLookEnabled: boolean
  onArtworkFrameAdvance: () => void
}): React.ReactElement {
  const artwork = trackArtwork(track, albums)
  const artworkFrame = artworkFrameAssets[artworkFrameIndex % artworkFrameAssets.length]
  const showBKBackground = artBackgroundEnabled && skinID !== 'appleStyle'
  return (
    <section className={`now-playing-page skin-${skinID.replace('.', '-')} ${isPlaying ? 'is-playing' : 'is-paused'} no-drag`}>
      {skinID === 'appleStyle' ? (
        <AppleNowPlayingBackground track={track} isPlaying={isPlaying} dynamicEnabled={appleDynamicBackgroundEnabled} speed={appleMeshSpeed} />
      ) : showBKBackground ? (
        <BKArtBackground track={track} isPlaying={isPlaying} themeStyle={bkThemeStyle} />
      ) : (
        <UnifiedMeshBackground />
      )}
      <div className="now-playing-artwork-stage">
        {skinID === 'coverLed' ? (
          <ClassicCoverNowPlaying artwork={artwork} artworkFrame={artworkFrame} masked={artworkFrameMaskEnabled} onArtworkFrameAdvance={onArtworkFrameAdvance} />
        ) : skinID === 'appleStyle' ? (
          <AppleStyleNowPlayingArtwork artwork={artwork} />
        ) : skinID === 'rotatingCover' ? (
          <RotatingCoverNowPlaying artwork={artwork} isPlaying={isPlaying} cdMode={rotatingCdMode} />
        ) : (
          <CassetteNowPlayingArtwork artwork={artwork} showKmgLook={cassetteKmgLookEnabled} />
        )}
        {visualizerMode === 'led' ? <NowPlayingVolumeLed volume={volume} isPlaying={isPlaying} ledCount={ledCount} brightnessLevels={ledBrightnessLevels} ledSpeed={ledSpeed} /> : null}
        {visualizerMode === 'spectrum' ? <NowPlayingSpectrum isPlaying={isPlaying} /> : null}
      </div>
      <div className="now-playing-track-copy">
        <strong>{track?.title ?? '未选择歌曲'}</strong>
        <span>{track ? `${track.artist} · ${track.album}` : '选择一首歌曲后显示窗口播放'}</span>
      </div>
    </section>
  )
})

const UnifiedMeshBackground = React.memo(function UnifiedMeshBackground(): React.ReactElement {
  return <div className="now-playing-unified-mesh" aria-hidden="true" />
})

const AppleNowPlayingBackground = React.memo(function AppleNowPlayingBackground({
  track,
  isPlaying,
  dynamicEnabled,
  speed
}: {
  track: Track | null | undefined
  isPlaying: boolean
  dynamicEnabled: boolean
  speed: AppleMeshSpeed
}): React.ReactElement {
  return (
    <div className={`apple-now-playing-background ${dynamicEnabled && isPlaying ? 'running' : 'frozen'} speed-${speed}`} aria-hidden="true">
      <div className="apple-mesh-blob blob-a" />
      <div className="apple-mesh-blob blob-b" />
      <div className="apple-mesh-blob blob-c" />
      <img src={track?.artworkUrl ?? altArtwork} alt="" decoding="async" />
    </div>
  )
})

const ClassicCoverNowPlaying = React.memo(function ClassicCoverNowPlaying({
  artwork,
  artworkFrame,
  masked,
  onArtworkFrameAdvance
}: {
  artwork: string
  artworkFrame: string
  masked: boolean
  onArtworkFrameAdvance: () => void
}): React.ReactElement {
  return (
    <button
      className={`now-playing-cover ${masked ? 'masked' : ''}`}
      type="button"
      aria-label="切换艺术化封面边缘"
      onClick={onArtworkFrameAdvance}
    >
      <img
        className="now-playing-cover-image"
        src={artwork}
        alt=""
        decoding="async"
        style={
          masked
            ? {
                WebkitMaskImage: `url(${artworkFrame})`,
                maskImage: `url(${artworkFrame})`
              }
            : undefined
        }
      />
      {masked ? (
        <span
          className="now-playing-cover-mask-edge"
          style={
            {
              WebkitMaskImage: `url(${artworkFrame})`,
              maskImage: `url(${artworkFrame})`
            } as React.CSSProperties
          }
        />
      ) : null}
    </button>
  )
})

const AppleStyleNowPlayingArtwork = React.memo(function AppleStyleNowPlayingArtwork({ artwork }: { artwork: string }): React.ReactElement {
  return (
    <div className="apple-style-cover">
      <img className="apple-style-cover-blur" src={artwork} alt="" decoding="async" />
      <img className="apple-style-cover-main" src={artwork} alt="" decoding="async" />
    </div>
  )
})

const RotatingCoverNowPlaying = React.memo(function RotatingCoverNowPlaying({
  artwork,
  isPlaying,
  cdMode
}: {
  artwork: string
  isPlaying: boolean
  cdMode: boolean
}): React.ReactElement {
  return (
    <div className={`rotating-cover ${isPlaying ? 'spinning' : ''} ${cdMode ? 'cd-mode' : 'vinyl-mode'}`}>
      <div className="rotating-disc">
        <img src={artwork} alt="" decoding="async" />
        <span className="rotating-disc-hole" />
      </div>
    </div>
  )
})

const CassetteNowPlayingArtwork = React.memo(function CassetteNowPlayingArtwork({
  artwork,
  showKmgLook
}: {
  artwork: string
  showKmgLook: boolean
}): React.ReactElement {
  return (
    <div className="cassette-artwork">
      <img className="cassette-layer cassette-shell" src={tapeShell} alt="" decoding="async" />
      <img
        className="cassette-art"
        src={artwork}
        alt=""
        decoding="async"
        style={
          {
            WebkitMaskImage: `url(${tapeMask})`,
            maskImage: `url(${tapeMask})`
          } as React.CSSProperties
        }
      />
      <img className="cassette-layer cassette-gray" src={tapeGray} alt="" decoding="async" />
      <img className="cassette-layer cassette-paper" src={tapePaper} alt="" decoding="async" />
      <img className="cassette-layer cassette-outline" src={tapeOutline} alt="" decoding="async" />
      {showKmgLook ? <img className="cassette-kmglook" src={kmgLook} alt="" decoding="async" /> : null}
    </div>
  )
})

const BKArtBackground = React.memo(function BKArtBackground({
  track,
  isPlaying,
  themeStyle
}: {
  track: Track | null | undefined
  isPlaying: boolean
  themeStyle: React.CSSProperties
}): React.ReactElement {
  const trackSeed = React.useMemo(() => hashString(track?.id ?? 'kmgccc-now-playing'), [track?.id])
  const transitionSeedRef = React.useRef(0)
  const themeStyleRef = React.useRef(themeStyle)
  themeStyleRef.current = themeStyle
  const initialSurface = React.useMemo(() => makeBKSurfaceState(trackSeed, 0, null, themeStyle), [themeStyle, trackSeed])
  const [currentSurface, setCurrentSurface] = React.useState(initialSurface)
  const [previousSurface, setPreviousSurface] = React.useState<BKSurfaceState | null>(null)
  const [isDotExiting, setIsDotExiting] = React.useState(false)
  const [isRevealing, setIsRevealing] = React.useState(false)
  const currentSurfaceRef = React.useRef(currentSurface)
  currentSurfaceRef.current = currentSurface
  const lastTrackSeedRef = React.useRef(trackSeed)
  const didMountRef = React.useRef(false)

  React.useEffect(() => {
    const image = new Image()
    image.decoding = 'async'
    image.src = bkPaintMaskSprite
    void image.decode?.().catch(() => undefined)
  }, [])

  React.useLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      lastTrackSeedRef.current = trackSeed
      setCurrentSurface(makeBKSurfaceState(trackSeed, 0, 'image', themeStyleRef.current))
      setPreviousSurface(null)
      setIsRevealing(false)
      return
    }
    transitionSeedRef.current = 0
    setIsDotExiting(false)
    setPreviousSurface(freezeBKSurfaceForTransition(currentSurfaceRef.current))
    setCurrentSurface(makeBKSurfaceState(trackSeed, 0, 'image', themeStyleRef.current))
    setIsRevealing(true)
    lastTrackSeedRef.current = trackSeed
  }, [trackSeed])

  React.useLayoutEffect(() => {
    if (lastTrackSeedRef.current !== trackSeed) return
    setCurrentSurface((surface) => ({ ...surface, themeStyle }))
  }, [themeStyle, trackSeed])

  React.useEffect(() => {
    if (!isPlaying) return
    if (isDotExiting) return
    if (isBKDotStyle(currentSurface.style)) return
    const delay = 15000
    const timer = window.setTimeout(() => {
      transitionSeedRef.current += 1
      setPreviousSurface(freezeBKSurfaceForTransition(currentSurface))
      setCurrentSurface(makeBKSurfaceState(trackSeed, transitionSeedRef.current, nextBKSurfaceStyle(currentSurface.style, transitionSeedRef.current), themeStyleRef.current))
      setIsRevealing(true)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [currentSurface, isDotExiting, isPlaying, trackSeed])

  React.useEffect(() => {
    if (!isDotExiting) return
    const timer = window.setTimeout(() => {
      transitionSeedRef.current += 1
      setPreviousSurface(freezeBKSurfaceForTransition(currentSurface))
      setCurrentSurface(makeBKSurfaceState(trackSeed, transitionSeedRef.current, nextBKSurfaceStyle(currentSurface.style, transitionSeedRef.current), themeStyleRef.current))
      setIsDotExiting(false)
      setIsRevealing(true)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [currentSurface, isDotExiting, trackSeed])

  const handleRevealEnd = React.useCallback(() => {
    setPreviousSurface(null)
    setIsRevealing(false)
  }, [])
  const handleDotComplete = React.useCallback(() => {
    transitionSeedRef.current += 1
    setPreviousSurface(freezeBKSurfaceForTransition(currentSurface))
    setCurrentSurface(makeBKSurfaceState(trackSeed, transitionSeedRef.current, nextBKSurfaceStyle(currentSurface.style, transitionSeedRef.current), themeStyleRef.current))
    setIsDotExiting(false)
    setIsRevealing(true)
  }, [currentSurface, trackSeed])

  return (
    <div className={`bk-art-background ${isPlaying ? 'running' : 'frozen'} ${previousSurface !== null ? 'transitioning' : ''}`} aria-hidden="true">
      {previousSurface ? <BKArtSurface key={`previous-${bkSurfaceKey(previousSurface)}`} surface={previousSurface} className={`previous ${isBKDotStyle(previousSurface.style) && currentSurface.style === 'image' ? 'dot-exited' : ''}`} isRunning={false} /> : null}
      <BKArtSurface key={`current-${bkSurfaceKey(currentSurface)}`} surface={currentSurface} className={previousSurface !== null ? 'current entering' : `current ${isDotExiting ? 'dot-exiting' : ''}`} isRunning={isPlaying && !isDotExiting && !isRevealing} onRevealEnd={previousSurface ? handleRevealEnd : undefined} onDotComplete={isBKDotStyle(currentSurface.style) && !isDotExiting ? handleDotComplete : undefined} />
    </div>
  )
})

type BKSurfaceStyle = 'image' | 'dot-a' | 'dot-b'

type BKSurfaceState = {
  seed: number
  shapeSeed: number
  style: BKSurfaceStyle
  phaseOffset: number
  themeStyle: React.CSSProperties
  createdAtMs: number
  frozenImagePhase?: 'a' | 'b'
}

function bkSurfaceKey(surface: BKSurfaceState): string {
  return `${surface.style}-${surface.seed}-${surface.shapeSeed}-${surface.phaseOffset}`
}

function makeBKSurfaceState(trackSeed: number, transitionIndex: number, forcedStyle: BKSurfaceStyle | null, themeStyle: React.CSSProperties): BKSurfaceState {
  const seed = (trackSeed ^ Math.imul(transitionIndex + 1, 0x9e3779b9)) >>> 0
  const style = forcedStyle ?? 'image'
  return {
    seed,
    shapeSeed: trackSeed,
    style,
    phaseOffset: transitionIndex % bkBackgroundAssets.length,
    themeStyle,
    createdAtMs: performance.now()
  }
}

function currentBKImagePhase(surface: BKSurfaceState): 'a' | 'b' {
  const elapsed = Math.max(0, performance.now() - surface.createdAtMs)
  return Math.floor(elapsed / 1000) % 2 === 0 ? 'a' : 'b'
}

function freezeBKSurfaceForTransition(surface: BKSurfaceState): BKSurfaceState {
  if (surface.style !== 'image') return surface
  return {
    ...surface,
    frozenImagePhase: currentBKImagePhase(surface)
  }
}

function isBKDotStyle(style: BKSurfaceStyle): boolean {
  return style === 'dot-a' || style === 'dot-b'
}

function nextBKSurfaceStyle(currentStyle: BKSurfaceStyle, transitionIndex: number): BKSurfaceStyle {
  if (currentStyle === 'image') return 'dot-a'
  if (currentStyle === 'dot-a') return 'dot-b'
  return 'image'
}

const BKArtSurface = React.memo(function BKArtSurface({
  surface,
  className,
  isRunning,
  onRevealEnd,
  onDotComplete
}: {
  surface: BKSurfaceState
  className: string
  isRunning: boolean
  onRevealEnd?: () => void
  onDotComplete?: () => void
}): React.ReactElement {
  const shapes = React.useMemo(() => makeBKShapePlan(surface.shapeSeed), [surface.shapeSeed])
  const phaseA = bkBackgroundAssets[(surface.phaseOffset + surface.seed) % bkBackgroundAssets.length]
  const phaseB = bkBackgroundAssets[(surface.phaseOffset + surface.seed + 1) % bkBackgroundAssets.length]
  const frozenPhaseClass = surface.frozenImagePhase ? `frozen-image-phase phase-${surface.frozenImagePhase}-visible` : ''
  const toneOne = bkThemeCssValue(surface.themeStyle, '--bk-bg-tone-1')
  const toneTwo = bkThemeCssValue(surface.themeStyle, '--bk-bg-tone-2')
  return (
    <div
      className={`bk-art-surface ${className} style-${surface.style} ${frozenPhaseClass}`}
      style={{ ...surface.themeStyle, '--bk-paint-mask-sprite': `url(${bkPaintMaskSprite})` } as React.CSSProperties}
      onAnimationEnd={(event) => {
        if (event.animationName === 'bkPaintReveal') onRevealEnd?.()
      }}
    >
      <div className="bk-image-surface">
        <BKImagePhase source={phaseA} className="phase-a" toneOne={toneOne} toneTwo={toneTwo} />
        <BKImagePhase source={phaseB} className="phase-b" toneOne={toneOne} toneTwo={toneTwo} />
      </div>
      {isBKDotStyle(surface.style) ? (
        <>
          <div className="bk-dot-surface">
            <div className="bk-dot-gradient" />
            <BKDotSurface seed={surface.seed} direction={surface.style === 'dot-b' ? 'reverse' : 'forward'} isRunning={isRunning} onComplete={onDotComplete} />
          </div>
          <div className="bk-shape-root">
            {shapes.map((shape) => (
              <span
                key={shape.id}
                className={`bk-shape ${shape.edgePinned ? 'edge-pinned' : ''}`}
                style={
                  {
                    '--shape-x': `${shape.x}%`,
                    '--shape-y': `${shape.y}%`,
                    '--shape-size': `${shape.size}px`,
                    '--shape-rotation': `${shape.rotation}deg`,
                    '--shape-drift-x': `${shape.driftX}px`,
                    '--shape-drift-y': `${shape.driftY}px`,
                    '--shape-duration': `${shape.duration}s`,
                    '--shape-delay': `${shape.delay}s`,
                    '--shape-tint': shape.tint,
                    WebkitMaskImage: `url(${bkShapeAssets[shape.assetIndex]})`,
                    maskImage: `url(${bkShapeAssets[shape.assetIndex]})`
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
})

const tintedBKCache = new Map<string, string>()

function bkThemeCssValue(themeStyle: React.CSSProperties, key: string): string {
  const value = (themeStyle as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : ''
}

function bkImagePhaseCacheKey(source: string, toneOne: string, toneTwo: string): string {
  return `${source}|${toneOne}|${toneTwo}`
}

function cubicBezierPoint(t: number, slot: BKDotPlan): { x: number; y: number } {
  const p = clampNumber(t, 0, 1)
  const oneMinusT = 1 - p
  const oneMinusT2 = oneMinusT * oneMinusT
  const oneMinusT3 = oneMinusT2 * oneMinusT
  const t2 = p * p
  const t3 = t2 * p
  return {
    x: oneMinusT3 * slot.startX + 3 * oneMinusT2 * p * slot.cp1X + 3 * oneMinusT * t2 * slot.cp2X + t3 * slot.endX,
    y: oneMinusT3 * slot.startY + 3 * oneMinusT2 * p * slot.cp1Y + 3 * oneMinusT * t2 * slot.cp2Y + t3 * slot.endY
  }
}

function easeOutQuint(value: number): number {
  return 1 - Math.pow(1 - clampNumber(value, 0, 1), 5)
}

function easeInQuint(value: number): number {
  const p = clampNumber(value, 0, 1)
  return p * p * p * p * p
}

function dotScaleAt(t: number): number {
  if (t < 0.25) return 0.6 + 0.4 * easeOutQuint(t / 0.25)
  if (t > 0.8) return 1 - 0.4 * easeInQuint((t - 0.8) / 0.2)
  return 1
}

type BKDotDirection = 'forward' | 'reverse'

function makeBKDotRuntimeSlot(seed: number, index: number, direction: BKDotDirection, initialIdleDelay?: number, overlapT?: number): BKDotRuntimeSlot {
  const plan = makeBKDotPlan(seed ^ Math.imul(index + 1, 0xdeadbeef), direction)[0]
  return {
    ...plan,
    id: `dot-window-${index}-${seed}`,
    delay: 0,
    leadIn: overlapT ?? plan.leadIn,
    motion: 'idle',
    idleRemaining: initialIdleDelay ?? plan.delay,
    t: 0,
    spawnedNext: false
  }
}

const BKDotSurface = React.memo(function BKDotSurface({
  seed,
  direction,
  isRunning,
  onComplete
}: {
  seed: number
  direction: BKDotDirection
  isRunning: boolean
  onComplete?: () => void
}): React.ReactElement {
  const maxSlotCount = 2
  const slotCounterRef = React.useRef(1)
  const completedRef = React.useRef(false)
  const [slots, setSlots] = React.useState<BKDotRuntimeSlot[]>(() => [makeBKDotRuntimeSlot(seed, 0, direction, 0, 0.88)])

  React.useEffect(() => {
    slotCounterRef.current = 1
    completedRef.current = false
    setSlots([makeBKDotRuntimeSlot(seed, 0, direction, 0, 0.88)])
  }, [direction, seed])

  React.useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(() => {
      setSlots((currentSlots) => {
        let shouldSpawnNext = false
        let spawnSeed = seed
        const nextSlots = currentSlots
          .map((slot, index) => {
            if (slot.motion === 'idle') {
              const idleRemaining = slot.idleRemaining - 1 / 15
              return idleRemaining <= 0 ? { ...slot, motion: 'moving' as const, idleRemaining: 0 } : { ...slot, idleRemaining }
            }

            const nextT = slot.t + (1 / 15) / slot.duration
            if (index === currentSlots.length - 1 && !slot.spawnedNext && nextT >= slot.leadIn && currentSlots.length < 2 && slotCounterRef.current < maxSlotCount) {
              shouldSpawnNext = true
              spawnSeed = hashString(`${slot.endX}:${slot.endY}:${seed}`)
            }
            return {
              ...slot,
              t: Math.min(1, nextT),
              spawnedNext: slot.spawnedNext || shouldSpawnNext
            }
          })
          .filter((slot) => slot.t < 1)

        if (shouldSpawnNext) {
          const nextIndex = slotCounterRef.current
          slotCounterRef.current += 1
          nextSlots.push(makeBKDotRuntimeSlot(spawnSeed, nextIndex, direction))
        }

        if (!nextSlots.length) {
          if (!completedRef.current) {
            completedRef.current = true
            window.setTimeout(() => onComplete?.(), 0)
          }
        }
        return nextSlots
      })
    }, 1000 / 15)
    return () => window.clearInterval(interval)
  }, [direction, isRunning, onComplete, seed])

  return (
    <>
      {slots.map((slot) => {
        const point = cubicBezierPoint(slot.t, slot)
        const scale = dotScaleAt(slot.t)
        const opacity = slot.motion === 'idle' ? 0 : slot.t > 0.92 ? clampNumber((1 - slot.t) / 0.08, 0, 1) * 0.92 : 0.92
        return (
          <span
            key={slot.id}
            className="bk-dot-window"
            style={
              {
                '--dot-x': `${point.x}%`,
                '--dot-y': `${point.y}%`,
                '--dot-radius': `${slot.radius}vmax`,
                '--dot-inner-radius': `${slot.radius * 0.75}vmax`,
                '--dot-radius-scaled': `${slot.radius * scale}vmax`,
                '--dot-inner-radius-scaled': `${slot.radius * 0.75 * scale}vmax`,
                '--dot-big': `${slot.bigDot}px`,
                '--dot-small': `${slot.smallDot}px`,
                '--dot-scale': scale,
                '--dot-opacity': opacity,
                '--dot-tint': slot.tint
              } as React.CSSProperties
            }
          >
            <span className="bk-dot-grid big" />
            <span className="bk-dot-grid small" />
          </span>
        )
      })}
    </>
  )
})

const BKImagePhase = React.memo(function BKImagePhase({
  source,
  className,
  toneOne,
  toneTwo
}: {
  source: string
  className: string
  toneOne: string
  toneTwo: string
}): React.ReactElement {
  const cacheKey = React.useMemo(() => bkImagePhaseCacheKey(source, toneOne, toneTwo), [source, toneOne, toneTwo])
  const [tintedUrl, setTintedUrl] = React.useState<string | null>(() => tintedBKCache.get(cacheKey) ?? null)

  React.useEffect(() => {
    const firstTone = parseCssColor(toneOne)
    const secondTone = parseCssColor(toneTwo)
    if (!firstTone || !secondTone) {
      setTintedUrl(null)
      return
    }

    const cached = tintedBKCache.get(cacheKey)
    if (cached) {
      setTintedUrl(cached)
      return
    }

    let cancelled = false
    loadImageElement(source)
      .then((image) => {
        if (cancelled) return
        const maxSide = 1280
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height))
        const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale))
        const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) return
        context.drawImage(image, 0, 0, width, height)
        const data = context.getImageData(0, 0, width, height)
        const pixels = data.data
        for (let index = 0; index < pixels.length; index += 4) {
          const r = pixels[index]
          const g = pixels[index + 1]
          const b = pixels[index + 2]
          const a = pixels[index + 3]
          const luma = clampNumber(((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 - 0.5) * 1.08 + 0.5, 0, 1)
          const mapped = mixRgb(firstTone, secondTone, luma)
          const originalSoft = saturateRgb({ r, g, b }, 0.12)
          const composed = mixRgb(originalSoft, mapped, 0.84)
          const boosted = saturateRgb(composed, 0.96)
          pixels[index] = boosted.r
          pixels[index + 1] = boosted.g
          pixels[index + 2] = boosted.b
          pixels[index + 3] = a
        }
        context.putImageData(data, 0, 0)
        const output = canvas.toDataURL('image/webp', 0.9)
        tintedBKCache.set(cacheKey, output)
        if (!cancelled) setTintedUrl(output)
      })
      .catch(() => {
        if (!cancelled) setTintedUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [cacheKey, source, toneOne, toneTwo])

  return <div className={`bk-image-phase ${className} ${tintedUrl ? 'ready' : 'loading'}`} style={{ backgroundImage: tintedUrl ? `url(${tintedUrl})` : 'none' }} />
})

type BKShapePlan = {
  id: string
  assetIndex: number
  x: number
  y: number
  size: number
  rotation: number
  driftX: number
  driftY: number
  duration: number
  delay: number
  tint: string
  edgePinned: boolean
}

type BKDotPlan = {
  id: string
  startX: number
  startY: number
  cp1X: number
  cp1Y: number
  cp2X: number
  cp2Y: number
  endX: number
  endY: number
  radius: number
  bigDot: number
  smallDot: number
  duration: number
  delay: number
  leadIn: number
  tint: string
}

type BKDotRuntimeSlot = BKDotPlan & {
  motion: 'idle' | 'moving'
  idleRemaining: number
  t: number
  spawnedNext: boolean
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let next = state
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

function makeBKShapePlan(seed: number): BKShapePlan[] {
  const random = mulberry32(seed ^ 0xa54f66d1)
  const count = 10 + Math.floor(random() * 7)
  const durationBands = [4.2, 6.8, 10.4, 15.6, 22.5, 8.4, 18.2]
  const tints = [
    'var(--bk-shape-tint-1)',
    'var(--bk-shape-tint-2)',
    'var(--bk-shape-tint-3)',
    'color-mix(in srgb, var(--bk-shape-tint-1) 66%, var(--bk-shape-tint-2))'
  ]
  return Array.from({ length: count }, (_, index) => {
    const edge = random()
    const x = edge < 0.25 ? 7 + random() * 12 : edge < 0.5 ? 81 + random() * 12 : 16 + random() * 68
    const y = edge >= 0.5 && edge < 0.75 ? 8 + random() * 14 : edge >= 0.75 ? 78 + random() * 14 : 12 + random() * 76
    const specialScale = index === 9 ? 3 : index === 10 ? 2 : 1
    const baseDuration = durationBands[index % durationBands.length]
    const duration = (baseDuration + random() * baseDuration * 0.32) * (specialScale > 1 ? 1.18 : 1)
    return {
      id: `shape-${index}`,
      assetIndex: index % bkShapeAssets.length,
      x,
      y,
      size: Math.round((96 + random() * 210) * specialScale),
      rotation: Math.round(random() * 360),
      driftX: index === 9 ? 0 : Math.round(-12 + random() * 24),
      driftY: index === 9 ? 0 : Math.round(-16 + random() * 32),
      duration,
      delay: -random() * duration,
      tint: tints[index % tints.length],
      edgePinned: index === 9
    }
  })
}

function makeBKDotPlan(seed: number, direction: BKDotDirection): BKDotPlan[] {
  const random = mulberry32(seed ^ 0x7a6c2e43)
  const tints = [
    'var(--bk-dot-tint-1, var(--bk-shape-tint-1))',
    'var(--bk-dot-tint-2, var(--bk-shape-tint-2))',
    'var(--bk-dot-tint-3, var(--bk-shape-tint-3))'
  ]
  const randomOffscreenPoint = (marginMul: number): { x: number; y: number } => {
    const radius = 30
    const margin = radius * marginMul
    const side = Math.floor(random() * 4)
    if (side === 0) return { x: -margin + random() * (100 + margin * 2), y: 100 + margin }
    if (side === 1) return { x: -margin + random() * (100 + margin * 2), y: -margin }
    if (side === 2) return { x: -margin, y: -margin + random() * (100 + margin * 2) }
    return { x: 100 + margin, y: -margin + random() * (100 + margin * 2) }
  }
  const randomControlPoint = (): { x: number; y: number } => ({
    x: random() * 100,
    y: random() * 100
  })
  let cumulativeDelay = 0
  return Array.from({ length: 2 }, (_, index) => {
    const angle = random() * Math.PI * 2
    const center = { x: 34 + random() * 32, y: 34 + random() * 32 }
    const travel = 118
    const dx = Math.cos(angle) * travel
    const dy = Math.sin(angle) * travel
    const start = { x: center.x - dx, y: center.y - dy }
    const end = { x: center.x + dx, y: center.y + dy }
    const cp1 = { x: start.x + (end.x - start.x) / 3, y: start.y + (end.y - start.y) / 3 }
    const cp2 = { x: start.x + (end.x - start.x) * 2 / 3, y: start.y + (end.y - start.y) * 2 / 3 }
    const directedStart = direction === 'reverse' ? end : start
    const directedEnd = direction === 'reverse' ? start : end
    const directedCp1 = direction === 'reverse' ? cp2 : cp1
    const directedCp2 = direction === 'reverse' ? cp1 : cp2
    const duration = 12 + random() * 5
    const leadIn = index === 0 ? 0.88 : 0.55 + random() * 0.2
    const idleDelay = 0.1 + random() * 0.35
    const delay = cumulativeDelay + idleDelay
    cumulativeDelay = delay + duration * leadIn
    return {
      id: `dot-window-${index}`,
      startX: directedStart.x,
      startY: directedStart.y,
      cp1X: directedCp1.x,
      cp1Y: directedCp1.y,
      cp2X: directedCp2.x,
      cp2Y: directedCp2.y,
      endX: directedEnd.x,
      endY: directedEnd.y,
      radius: 26 + random() * 8,
      bigDot: 5 + random() * 1.2,
      smallDot: 3 + random(),
      duration,
      delay,
      leadIn,
      tint: tints[index % tints.length]
    }
  })
}

const NowPlayingVolumeLed = React.memo(function NowPlayingVolumeLed({
  volume,
  isPlaying,
  ledCount = 11,
  brightnessLevels = 5,
  ledSpeed = 1
}: {
  volume: number
  isPlaying: boolean
  ledCount?: number
  brightnessLevels?: number
  ledSpeed?: number
}): React.ReactElement {
  const safeLedCount = Math.max(3, Math.round(ledCount))
  const safeBrightnessLevels = Math.max(2, Math.round(brightnessLevels))
  const center = Math.floor(safeLedCount / 2)
  const totalSlots = (center + 1) * safeBrightnessLevels
  const currentSlot = clampNumber(volume, 0, 1) * totalSlots
  return (
    <div
      className={`now-playing-led-pill glass-panel ${isPlaying ? 'playing' : ''}`}
      style={{ '--filter-url': 'url(#lg-mini)', '--led-speed': clampNumber(ledSpeed, 0.5, 2) } as React.CSSProperties}
    >
      <span className="now-playing-status-led" />
      <span className="now-playing-led-divider" />
      {Array.from({ length: safeLedCount }, (_, index) => {
        const distance = Math.abs(index - center)
        const ledStartSlot = distance * safeBrightnessLevels
        const state = currentSlot < ledStartSlot ? 0 : currentSlot >= ledStartSlot + safeBrightnessLevels ? safeBrightnessLevels - 1 : Math.floor(currentSlot - ledStartSlot)
        const brightness = state / (safeBrightnessLevels - 1)
        return (
          <span
            key={index}
            className="now-playing-led-dot"
            style={
              {
                '--led-brightness': brightness,
                '--led-state': state
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
})

const NowPlayingSpectrum = React.memo(function NowPlayingSpectrum({ isPlaying }: { isPlaying: boolean }): React.ReactElement {
  return (
    <div className={`now-playing-spectrum-pill glass-panel ${isPlaying ? 'playing' : ''}`} style={{ '--filter-url': 'url(#lg-mini)' } as React.CSSProperties}>
      {Array.from({ length: 9 }, (_, index) => <span key={index} style={{ '--bar-index': index } as React.CSSProperties} />)}
    </div>
  )
})

const settingsCategories: Array<{ key: SettingsCategoryKey; title: string; detail: string }> = [
  { key: 'appearance', title: '外观', detail: '主题、玻璃与窗口' },
  { key: 'nowPlaying', title: '窗口播放', detail: '皮肤、歌词、LED' },
  { key: 'fullscreen', title: '全屏播放', detail: '待翻译' },
  { key: 'externalPlayback', title: '外部播放', detail: '待翻译' },
  { key: 'data', title: '数据', detail: '待翻译' },
  { key: 'about', title: '关于', detail: '待翻译' }
]

const SettingsPanel = React.memo(function SettingsPanel({
  selectedCategory,
  onSelectCategory,
  onClose,
  selectedNowPlayingTab,
  onSelectNowPlayingTab,
  selectedNowPlayingSkin,
  onSelectedNowPlayingSkinChange,
  artBackgroundEnabled,
  onArtBackgroundEnabledChange,
  classicVisualizerMode,
  onClassicVisualizerModeChange,
  appleVisualizerMode,
  onAppleVisualizerModeChange,
  rotatingVisualizerMode,
  onRotatingVisualizerModeChange,
  cassetteVisualizerMode,
  onCassetteVisualizerModeChange,
  artworkFrameMaskEnabled,
  onArtworkFrameMaskEnabledChange,
  rotatingCdMode,
  onRotatingCdModeChange,
  appleDynamicBackgroundEnabled,
  onAppleDynamicBackgroundEnabledChange,
  appleMeshSpeed,
  onAppleMeshSpeedChange,
  cassetteKmgLookEnabled,
  onCassetteKmgLookEnabledChange,
  lyricsRenderQuality,
  onLyricsRenderQualityChange,
  discreteWordHighlightEnabled,
  onDiscreteWordHighlightEnabledChange,
  lyricsFontSize,
  onLyricsFontSizeChange,
  lyricsTranslationFontSize,
  onLyricsTranslationFontSizeChange,
  lyricsFontWeightLight,
  onLyricsFontWeightLightChange,
  lyricsFontWeightDark,
  onLyricsFontWeightDarkChange,
  lyricsTranslationFontWeightLight,
  onLyricsTranslationFontWeightLightChange,
  lyricsTranslationFontWeightDark,
  onLyricsTranslationFontWeightDarkChange,
  lyricsFontNameZh,
  onLyricsFontNameZhChange,
  lyricsFontNameEn,
  onLyricsFontNameEnChange,
  lyricsTranslationFontName,
  onLyricsTranslationFontNameChange,
  lyricsLeadInMs,
  onLyricsLeadInMsChange,
  lyricsNearSwitchGapMs,
  onLyricsNearSwitchGapMsChange,
  lyricsGlobalAdvanceMs,
  onLyricsGlobalAdvanceMsChange,
  ledCount,
  onLedCountChange,
  ledBrightnessLevels,
  onLedBrightnessLevelsChange,
  ledCutoffHz,
  onLedCutoffHzChange,
  ledSpeed,
  onLedSpeedChange
}: {
  selectedCategory: SettingsCategoryKey
  onSelectCategory: (category: SettingsCategoryKey) => void
  onClose: () => void
  selectedNowPlayingTab: NowPlayingSettingsTab
  onSelectNowPlayingTab: (tab: NowPlayingSettingsTab) => void
  selectedNowPlayingSkin: NowPlayingSkinID
  onSelectedNowPlayingSkinChange: (skin: NowPlayingSkinID) => void
  artBackgroundEnabled: boolean
  onArtBackgroundEnabledChange: (enabled: boolean) => void
  classicVisualizerMode: VisualizerMode
  onClassicVisualizerModeChange: (mode: VisualizerMode) => void
  appleVisualizerMode: VisualizerMode
  onAppleVisualizerModeChange: (mode: VisualizerMode) => void
  rotatingVisualizerMode: VisualizerMode
  onRotatingVisualizerModeChange: (mode: VisualizerMode) => void
  cassetteVisualizerMode: VisualizerMode
  onCassetteVisualizerModeChange: (mode: VisualizerMode) => void
  artworkFrameMaskEnabled: boolean
  onArtworkFrameMaskEnabledChange: (enabled: boolean) => void
  rotatingCdMode: boolean
  onRotatingCdModeChange: (enabled: boolean) => void
  appleDynamicBackgroundEnabled: boolean
  onAppleDynamicBackgroundEnabledChange: (enabled: boolean) => void
  appleMeshSpeed: AppleMeshSpeed
  onAppleMeshSpeedChange: (speed: AppleMeshSpeed) => void
  cassetteKmgLookEnabled: boolean
  onCassetteKmgLookEnabledChange: (enabled: boolean) => void
  lyricsRenderQuality: 'performance' | 'balanced' | 'quality'
  onLyricsRenderQualityChange: (quality: 'performance' | 'balanced' | 'quality') => void
  discreteWordHighlightEnabled: boolean
  onDiscreteWordHighlightEnabledChange: (enabled: boolean) => void
  lyricsFontSize: number
  onLyricsFontSizeChange: (value: number) => void
  lyricsTranslationFontSize: number
  onLyricsTranslationFontSizeChange: (value: number) => void
  lyricsFontWeightLight: number
  onLyricsFontWeightLightChange: (value: number) => void
  lyricsFontWeightDark: number
  onLyricsFontWeightDarkChange: (value: number) => void
  lyricsTranslationFontWeightLight: number
  onLyricsTranslationFontWeightLightChange: (value: number) => void
  lyricsTranslationFontWeightDark: number
  onLyricsTranslationFontWeightDarkChange: (value: number) => void
  lyricsFontNameZh: string
  onLyricsFontNameZhChange: (value: string) => void
  lyricsFontNameEn: string
  onLyricsFontNameEnChange: (value: string) => void
  lyricsTranslationFontName: string
  onLyricsTranslationFontNameChange: (value: string) => void
  lyricsLeadInMs: number
  onLyricsLeadInMsChange: (value: number) => void
  lyricsNearSwitchGapMs: number
  onLyricsNearSwitchGapMsChange: (value: number) => void
  lyricsGlobalAdvanceMs: number
  onLyricsGlobalAdvanceMsChange: (value: number) => void
  ledCount: number
  onLedCountChange: (value: number) => void
  ledBrightnessLevels: number
  onLedBrightnessLevelsChange: (value: number) => void
  ledCutoffHz: number
  onLedCutoffHzChange: (value: number) => void
  ledSpeed: number
  onLedSpeedChange: (value: number) => void
}): React.ReactElement {
  return (
    <div className="settings-overlay no-drag">
      <div className="settings-window">
        <aside className="settings-sidebar">
          {settingsCategories.map((category) => (
            <button
              key={category.key}
              className={category.key === selectedCategory ? 'active' : ''}
              type="button"
              onClick={() => onSelectCategory(category.key)}
            >
              <strong>{category.title}</strong>
              <span>{category.detail}</span>
            </button>
          ))}
        </aside>
        <section className="settings-detail">
          <button className="settings-close" type="button" aria-label="关闭设置" onClick={onClose}>
            <X size={17} />
          </button>
          {selectedCategory === 'nowPlaying' ? (
            <NowPlayingSettingsContent
              selectedTab={selectedNowPlayingTab}
              onSelectTab={onSelectNowPlayingTab}
              selectedSkin={selectedNowPlayingSkin}
              onSelectedSkinChange={onSelectedNowPlayingSkinChange}
              artBackgroundEnabled={artBackgroundEnabled}
              onArtBackgroundEnabledChange={onArtBackgroundEnabledChange}
              classicVisualizerMode={classicVisualizerMode}
              onClassicVisualizerModeChange={onClassicVisualizerModeChange}
              appleVisualizerMode={appleVisualizerMode}
              onAppleVisualizerModeChange={onAppleVisualizerModeChange}
              rotatingVisualizerMode={rotatingVisualizerMode}
              onRotatingVisualizerModeChange={onRotatingVisualizerModeChange}
              cassetteVisualizerMode={cassetteVisualizerMode}
              onCassetteVisualizerModeChange={onCassetteVisualizerModeChange}
              artworkFrameMaskEnabled={artworkFrameMaskEnabled}
              onArtworkFrameMaskEnabledChange={onArtworkFrameMaskEnabledChange}
              rotatingCdMode={rotatingCdMode}
              onRotatingCdModeChange={onRotatingCdModeChange}
              appleDynamicBackgroundEnabled={appleDynamicBackgroundEnabled}
              onAppleDynamicBackgroundEnabledChange={onAppleDynamicBackgroundEnabledChange}
              appleMeshSpeed={appleMeshSpeed}
              onAppleMeshSpeedChange={onAppleMeshSpeedChange}
              cassetteKmgLookEnabled={cassetteKmgLookEnabled}
              onCassetteKmgLookEnabledChange={onCassetteKmgLookEnabledChange}
              lyricsRenderQuality={lyricsRenderQuality}
              onLyricsRenderQualityChange={onLyricsRenderQualityChange}
              discreteWordHighlightEnabled={discreteWordHighlightEnabled}
              onDiscreteWordHighlightEnabledChange={onDiscreteWordHighlightEnabledChange}
              lyricsFontSize={lyricsFontSize}
              onLyricsFontSizeChange={onLyricsFontSizeChange}
              lyricsTranslationFontSize={lyricsTranslationFontSize}
              onLyricsTranslationFontSizeChange={onLyricsTranslationFontSizeChange}
              lyricsFontWeightLight={lyricsFontWeightLight}
              onLyricsFontWeightLightChange={onLyricsFontWeightLightChange}
              lyricsFontWeightDark={lyricsFontWeightDark}
              onLyricsFontWeightDarkChange={onLyricsFontWeightDarkChange}
              lyricsTranslationFontWeightLight={lyricsTranslationFontWeightLight}
              onLyricsTranslationFontWeightLightChange={onLyricsTranslationFontWeightLightChange}
              lyricsTranslationFontWeightDark={lyricsTranslationFontWeightDark}
              onLyricsTranslationFontWeightDarkChange={onLyricsTranslationFontWeightDarkChange}
              lyricsFontNameZh={lyricsFontNameZh}
              onLyricsFontNameZhChange={onLyricsFontNameZhChange}
              lyricsFontNameEn={lyricsFontNameEn}
              onLyricsFontNameEnChange={onLyricsFontNameEnChange}
              lyricsTranslationFontName={lyricsTranslationFontName}
              onLyricsTranslationFontNameChange={onLyricsTranslationFontNameChange}
              lyricsLeadInMs={lyricsLeadInMs}
              onLyricsLeadInMsChange={onLyricsLeadInMsChange}
              lyricsNearSwitchGapMs={lyricsNearSwitchGapMs}
              onLyricsNearSwitchGapMsChange={onLyricsNearSwitchGapMsChange}
              lyricsGlobalAdvanceMs={lyricsGlobalAdvanceMs}
              onLyricsGlobalAdvanceMsChange={onLyricsGlobalAdvanceMsChange}
              ledCount={ledCount}
              onLedCountChange={onLedCountChange}
              ledBrightnessLevels={ledBrightnessLevels}
              onLedBrightnessLevelsChange={onLedBrightnessLevelsChange}
              ledCutoffHz={ledCutoffHz}
              onLedCutoffHzChange={onLedCutoffHzChange}
              ledSpeed={ledSpeed}
              onLedSpeedChange={onLedSpeedChange}
            />
          ) : (
            <div className="settings-empty">
              <strong>{settingsCategories.find((category) => category.key === selectedCategory)?.title}</strong>
              <span>这个大板块之后再按 Swift 继续翻译。</span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
})

const NowPlayingSettingsContent = React.memo(function NowPlayingSettingsContent({
  selectedTab,
  onSelectTab,
  selectedSkin,
  onSelectedSkinChange,
  artBackgroundEnabled,
  onArtBackgroundEnabledChange,
  classicVisualizerMode,
  onClassicVisualizerModeChange,
  appleVisualizerMode,
  onAppleVisualizerModeChange,
  rotatingVisualizerMode,
  onRotatingVisualizerModeChange,
  cassetteVisualizerMode,
  onCassetteVisualizerModeChange,
  artworkFrameMaskEnabled,
  onArtworkFrameMaskEnabledChange,
  rotatingCdMode,
  onRotatingCdModeChange,
  appleDynamicBackgroundEnabled,
  onAppleDynamicBackgroundEnabledChange,
  appleMeshSpeed,
  onAppleMeshSpeedChange,
  cassetteKmgLookEnabled,
  onCassetteKmgLookEnabledChange,
  lyricsRenderQuality,
  onLyricsRenderQualityChange,
  discreteWordHighlightEnabled,
  onDiscreteWordHighlightEnabledChange,
  lyricsFontSize,
  onLyricsFontSizeChange,
  lyricsTranslationFontSize,
  onLyricsTranslationFontSizeChange,
  lyricsFontWeightLight,
  onLyricsFontWeightLightChange,
  lyricsFontWeightDark,
  onLyricsFontWeightDarkChange,
  lyricsTranslationFontWeightLight,
  onLyricsTranslationFontWeightLightChange,
  lyricsTranslationFontWeightDark,
  onLyricsTranslationFontWeightDarkChange,
  lyricsFontNameZh,
  onLyricsFontNameZhChange,
  lyricsFontNameEn,
  onLyricsFontNameEnChange,
  lyricsTranslationFontName,
  onLyricsTranslationFontNameChange,
  lyricsLeadInMs,
  onLyricsLeadInMsChange,
  lyricsNearSwitchGapMs,
  onLyricsNearSwitchGapMsChange,
  lyricsGlobalAdvanceMs,
  onLyricsGlobalAdvanceMsChange,
  ledCount,
  onLedCountChange,
  ledBrightnessLevels,
  onLedBrightnessLevelsChange,
  ledCutoffHz,
  onLedCutoffHzChange,
  ledSpeed,
  onLedSpeedChange
}: {
  selectedTab: NowPlayingSettingsTab
  onSelectTab: (tab: NowPlayingSettingsTab) => void
  selectedSkin: NowPlayingSkinID
  onSelectedSkinChange: (skin: NowPlayingSkinID) => void
  artBackgroundEnabled: boolean
  onArtBackgroundEnabledChange: (enabled: boolean) => void
  classicVisualizerMode: VisualizerMode
  onClassicVisualizerModeChange: (mode: VisualizerMode) => void
  appleVisualizerMode: VisualizerMode
  onAppleVisualizerModeChange: (mode: VisualizerMode) => void
  rotatingVisualizerMode: VisualizerMode
  onRotatingVisualizerModeChange: (mode: VisualizerMode) => void
  cassetteVisualizerMode: VisualizerMode
  onCassetteVisualizerModeChange: (mode: VisualizerMode) => void
  artworkFrameMaskEnabled: boolean
  onArtworkFrameMaskEnabledChange: (enabled: boolean) => void
  rotatingCdMode: boolean
  onRotatingCdModeChange: (enabled: boolean) => void
  appleDynamicBackgroundEnabled: boolean
  onAppleDynamicBackgroundEnabledChange: (enabled: boolean) => void
  appleMeshSpeed: AppleMeshSpeed
  onAppleMeshSpeedChange: (speed: AppleMeshSpeed) => void
  cassetteKmgLookEnabled: boolean
  onCassetteKmgLookEnabledChange: (enabled: boolean) => void
  lyricsRenderQuality: 'performance' | 'balanced' | 'quality'
  onLyricsRenderQualityChange: (quality: 'performance' | 'balanced' | 'quality') => void
  discreteWordHighlightEnabled: boolean
  onDiscreteWordHighlightEnabledChange: (enabled: boolean) => void
  lyricsFontSize: number
  onLyricsFontSizeChange: (value: number) => void
  lyricsTranslationFontSize: number
  onLyricsTranslationFontSizeChange: (value: number) => void
  lyricsFontWeightLight: number
  onLyricsFontWeightLightChange: (value: number) => void
  lyricsFontWeightDark: number
  onLyricsFontWeightDarkChange: (value: number) => void
  lyricsTranslationFontWeightLight: number
  onLyricsTranslationFontWeightLightChange: (value: number) => void
  lyricsTranslationFontWeightDark: number
  onLyricsTranslationFontWeightDarkChange: (value: number) => void
  lyricsFontNameZh: string
  onLyricsFontNameZhChange: (value: string) => void
  lyricsFontNameEn: string
  onLyricsFontNameEnChange: (value: string) => void
  lyricsTranslationFontName: string
  onLyricsTranslationFontNameChange: (value: string) => void
  lyricsLeadInMs: number
  onLyricsLeadInMsChange: (value: number) => void
  lyricsNearSwitchGapMs: number
  onLyricsNearSwitchGapMsChange: (value: number) => void
  lyricsGlobalAdvanceMs: number
  onLyricsGlobalAdvanceMsChange: (value: number) => void
  ledCount: number
  onLedCountChange: (value: number) => void
  ledBrightnessLevels: number
  onLedBrightnessLevelsChange: (value: number) => void
  ledCutoffHz: number
  onLedCutoffHzChange: (value: number) => void
  ledSpeed: number
  onLedSpeedChange: (value: number) => void
}): React.ReactElement {
  const selectedSkinOption = nowPlayingSkinOptions.find((skin) => skin.id === selectedSkin) ?? nowPlayingSkinOptions[0]
  return (
    <div className="settings-now-playing">
      <header className="settings-header-label">
        <Sparkles size={18} />
        <strong>窗口播放</strong>
      </header>
      <div className="settings-tabs">
        {[
          ['general', '常规'],
          ['lyrics', '歌词'],
          ['led', 'LED']
        ].map(([key, title]) => (
          <button key={key} className={selectedTab === key ? 'active' : ''} type="button" onClick={() => onSelectTab(key as NowPlayingSettingsTab)}>
            {title}
          </button>
        ))}
      </div>
      {selectedTab === 'general' ? (
        <div className="settings-section-stack">
          <SettingsSwitch title="启用艺术背景" detail="遇到性能问题时，可以关闭此选项" checked={artBackgroundEnabled} onChange={onArtBackgroundEnabledChange} />
          <div className="settings-card-section">
            <strong>选择皮肤</strong>
            <div className="settings-skin-row">
              {nowPlayingSkinOptions.map((skin) => (
                <button
                  key={skin.id}
                  className={selectedSkin === skin.id ? 'active' : ''}
                  type="button"
                  onClick={() => onSelectedSkinChange(skin.id)}
                >
                  <span className={`skin-thumb ${skinPreviewClassName(skin.id)}`} />
                  <strong>{skin.name}</strong>
                  <small>{skin.detail}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="settings-card-section">
            <strong>{selectedSkinOption.name} 选项</strong>
            {selectedSkin === 'coverLed' ? (
              <>
                <SettingsSwitch title="艺术化封面边缘" checked={artworkFrameMaskEnabled} onChange={onArtworkFrameMaskEnabledChange} />
                <SettingsSwitch title="LED 电平表" checked={classicVisualizerMode === 'led'} onChange={(checked) => onClassicVisualizerModeChange(checked ? 'led' : 'off')} />
                <SettingsSwitch title="频谱动画" checked={classicVisualizerMode === 'spectrum'} onChange={(checked) => onClassicVisualizerModeChange(checked ? 'spectrum' : 'off')} />
              </>
            ) : selectedSkin === 'appleStyle' ? (
              <>
                <SettingsSwitch title="动态背景" checked={appleDynamicBackgroundEnabled} onChange={onAppleDynamicBackgroundEnabledChange} />
                <SettingsSegment title="流体速度" values={['slow', 'standard', 'fast']} labels={['慢', '标准', '快']} selected={appleMeshSpeed} onSelect={(value) => onAppleMeshSpeedChange(value as AppleMeshSpeed)} />
                <SettingsSwitch title="LED 电平表" checked={appleVisualizerMode === 'led'} onChange={(checked) => onAppleVisualizerModeChange(checked ? 'led' : 'off')} />
                <SettingsSwitch title="频谱动画" checked={appleVisualizerMode === 'spectrum'} onChange={(checked) => onAppleVisualizerModeChange(checked ? 'spectrum' : 'off')} />
              </>
            ) : selectedSkin === 'rotatingCover' ? (
              <>
                <SettingsSwitch title="CD 模式" checked={rotatingCdMode} onChange={onRotatingCdModeChange} />
                <SettingsSwitch title="LED 电平表" checked={rotatingVisualizerMode === 'led'} onChange={(checked) => onRotatingVisualizerModeChange(checked ? 'led' : 'off')} />
                <SettingsSwitch title="频谱动画" checked={rotatingVisualizerMode === 'spectrum'} onChange={(checked) => onRotatingVisualizerModeChange(checked ? 'spectrum' : 'off')} />
              </>
            ) : (
              <>
                <SettingsSwitch title="LED 电平表" checked={cassetteVisualizerMode === 'led'} onChange={(checked) => onCassetteVisualizerModeChange(checked ? 'led' : 'off')} />
                <SettingsSwitch title="显示 KMG 标识" checked={cassetteKmgLookEnabled} onChange={onCassetteKmgLookEnabledChange} />
              </>
            )}
          </div>
        </div>
      ) : selectedTab === 'lyrics' ? (
        <div className="settings-section-stack">
          <SettingsSection title="外观">
            <SettingsSegment
              title="歌词渲染质量"
              values={['performance', 'balanced', 'quality']}
              labels={['低', '中', '高']}
              selected={lyricsRenderQuality}
              onSelect={(value) => onLyricsRenderQualityChange(value as 'performance' | 'balanced' | 'quality')}
            />
            <SettingsSwitch title="减弱高亮(beta)" detail="开启后可能减少高亮移动干扰" checked={discreteWordHighlightEnabled} onChange={onDiscreteWordHighlightEnabledChange} />
          </SettingsSection>
          <SettingsSection title="字体">
            <SettingsRange title="字体大小" valueText={`${Math.round(lyricsFontSize)} px`} value={lyricsFontSize} min={16} max={48} step={1} onChange={onLyricsFontSizeChange} />
            <SettingsSelect title="浅色模式字重" value={String(lyricsFontWeightLight)} options={lyricsFontWeightOptions.map((option) => ({ label: option.label, value: String(option.value) }))} onChange={(value) => onLyricsFontWeightLightChange(Number(value))} />
            <SettingsSelect title="深色模式字重" value={String(lyricsFontWeightDark)} options={lyricsFontWeightOptions.map((option) => ({ label: option.label, value: String(option.value) }))} onChange={(value) => onLyricsFontWeightDarkChange(Number(value))} />
            <div className="settings-divider" />
            <SettingsRange title="翻译大小" valueText={`${Math.round(lyricsTranslationFontSize)} px`} value={lyricsTranslationFontSize} min={12} max={36} step={1} onChange={onLyricsTranslationFontSizeChange} />
            <SettingsSelect title="翻译浅色字重" value={String(lyricsTranslationFontWeightLight)} options={lyricsFontWeightOptions.map((option) => ({ label: option.label, value: String(option.value) }))} onChange={(value) => onLyricsTranslationFontWeightLightChange(Number(value))} />
            <SettingsSelect title="翻译深色字重" value={String(lyricsTranslationFontWeightDark)} options={lyricsFontWeightOptions.map((option) => ({ label: option.label, value: String(option.value) }))} onChange={(value) => onLyricsTranslationFontWeightDarkChange(Number(value))} />
            <div className="settings-divider" />
            <SettingsSelect title="中文字体" value={lyricsFontNameZh} options={lyricsFontFamilyOptions.map((font) => ({ label: font, value: font }))} onChange={onLyricsFontNameZhChange} wide />
            <SettingsSelect title="英文字体" value={lyricsFontNameEn} options={lyricsFontFamilyOptions.map((font) => ({ label: font, value: font }))} onChange={onLyricsFontNameEnChange} wide />
            <SettingsSelect title="翻译字体" value={lyricsTranslationFontName} options={lyricsFontFamilyOptions.map((font) => ({ label: font, value: font }))} onChange={onLyricsTranslationFontNameChange} wide />
          </SettingsSection>
          <SettingsSection title="预览">
            <div className="lyrics-settings-preview light">
              <small>浅色模式预览</small>
              <b style={{ fontSize: lyricsFontSize, fontWeight: lyricsFontWeightLight, fontFamily: `"${lyricsFontNameZh}", "${lyricsFontNameEn}", sans-serif` }}>雪把世界删改成更少的字</b>
              <b className="preview-english" style={{ fontSize: lyricsFontSize, fontWeight: lyricsFontWeightLight, fontFamily: `"${lyricsFontNameEn}", sans-serif` }}>Snow edits the world into fewer words</b>
              <span style={{ fontSize: lyricsTranslationFontSize, fontWeight: lyricsTranslationFontWeightLight, fontFamily: `"${lyricsTranslationFontName}", sans-serif` }}>时光像河流入海</span>
            </div>
            <div className="lyrics-settings-preview dark">
              <small>深色模式预览</small>
              <b style={{ fontSize: lyricsFontSize, fontWeight: lyricsFontWeightDark, fontFamily: `"${lyricsFontNameZh}", "${lyricsFontNameEn}", sans-serif` }}>雪把世界删改成更少的字</b>
              <b className="preview-english" style={{ fontSize: lyricsFontSize, fontWeight: lyricsFontWeightDark, fontFamily: `"${lyricsFontNameEn}", sans-serif` }}>Snow edits the world into fewer words</b>
              <span style={{ fontSize: lyricsTranslationFontSize, fontWeight: lyricsTranslationFontWeightDark, fontFamily: `"${lyricsTranslationFontName}", sans-serif` }}>时光像河流入海</span>
            </div>
          </SettingsSection>
          <SettingsSection
            title="时间轴"
            action={
              <button className="settings-text-action" type="button" onClick={() => {
                onLyricsLeadInMsChange(600)
                onLyricsNearSwitchGapMsChange(160)
                onLyricsGlobalAdvanceMsChange(0)
              }}>恢复默认值</button>
            }
          >
            <small className="settings-description">参数仅供调试，正常使用无需调整</small>
            <SettingsRange title="提前量" detail="调整歌词行首和行尾单词的出现时机。" valueText={`${Math.round(lyricsLeadInMs)} ms`} value={lyricsLeadInMs} min={0} max={1200} step={20} onChange={onLyricsLeadInMsChange} />
            <div className="settings-divider" />
            <SettingsRange title="紧邻切行阈值" detail="当下一句开始时间与当前句结束时间间隔小于该值时，会在提前量剩余时提前切到下一句，并让当前句快速隐退。" valueText={`${Math.round(lyricsNearSwitchGapMs)} ms`} value={lyricsNearSwitchGapMs} min={0} max={500} step={5} onChange={onLyricsNearSwitchGapMsChange} />
            <div className="settings-divider" />
            <SettingsRange title="歌词整体提前量" detail="全曲统一提前（正值=更早显示，负值=更晚显示）。会与单曲时间偏移共同作用。" valueText={`${Math.round(lyricsGlobalAdvanceMs)} ms`} value={lyricsGlobalAdvanceMs} min={-1000} max={1000} step={10} onChange={onLyricsGlobalAdvanceMsChange} />
          </SettingsSection>
        </div>
      ) : (
        <div className="settings-section-stack">
          <div className="settings-card-section">
            <strong>实时预览</strong>
            <NowPlayingVolumeLed volume={0.72} isPlaying ledCount={ledCount} brightnessLevels={ledBrightnessLevels} ledSpeed={ledSpeed} />
          </div>
          <div className="settings-card-section">
            <strong>视觉配置</strong>
            <SettingsSegment title="LED 数量" values={['9', '11', '13', '15']} selected={String(Math.round(ledCount))} onSelect={(value) => onLedCountChange(Number(value))} />
            <SettingsSegment title="亮度等级" values={['3', '5', '7']} selected={String(Math.round(ledBrightnessLevels))} onSelect={(value) => onLedBrightnessLevelsChange(Number(value))} />
          </div>
          <div className="settings-card-section">
            <SettingsRange title="频率" valueText={`${Math.round(ledCutoffHz)} Hz`} value={ledCutoffHz} min={200} max={6000} step={100} onChange={onLedCutoffHzChange} />
            <SettingsRange title="速度" valueText={`${ledSpeed.toFixed(2)}x`} value={ledSpeed} min={0.5} max={2} step={0.05} onChange={onLedSpeedChange} />
          </div>
        </div>
      )}
    </div>
  )
})

const SettingsSwitch = React.memo(function SettingsSwitch({
  title,
  detail,
  checked,
  onChange
}: {
  title: string
  detail?: string
  checked: boolean
  onChange: (checked: boolean) => void
}): React.ReactElement {
  return (
    <label className="settings-switch-row">
      <span>
        <strong>{title}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
      <i aria-hidden="true" />
    </label>
  )
})

const SettingsSection = React.memo(function SettingsSection({
  title,
  action,
  children
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}): React.ReactElement {
  return (
    <section className="settings-section">
      <header>
        <strong>{title}</strong>
        {action}
      </header>
      <div className="settings-card-section">{children}</div>
    </section>
  )
})

const LiquidGlassSlider = React.memo(function LiquidGlassSlider({
  ariaLabel,
  className = '',
  value,
  min,
  max,
  step,
  onChange
}: {
  ariaLabel: string
  className?: string
  value: number
  min: number
  max: number
  step: number | string
  onChange: (value: number) => void
}): React.ReactElement {
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <span
      className={`liquid-slider ${className}`}
      style={
        {
          '--liquid-slider-progress': `${clampedProgress}%`,
          '--liquid-slider-progress-ratio': clampedProgress / 100
        } as React.CSSProperties
      }
    >
      <span className="liquid-slider-track" aria-hidden="true">
        <span className="liquid-slider-fill" />
      </span>
      <span className="liquid-slider-thumb" aria-hidden="true" />
      <input
        aria-label={ariaLabel}
        className="liquid-slider-input"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onInput={(event) => onChange(Number(event.currentTarget.value))}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </span>
  )
})

const SettingsRange = React.memo(function SettingsRange({
  title,
  detail,
  valueText,
  value,
  min,
  max,
  step = 1,
  onChange
}: {
  title: string
  detail?: string
  valueText: string
  value: number
  min: number
  max: number
  step?: number
  onChange?: (value: number) => void
}): React.ReactElement {
  return (
    <label className="settings-range-row">
      <span>
        <strong>{title}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      <em>{valueText}</em>
      <LiquidGlassSlider ariaLabel={title} className="settings-liquid-slider" value={value} min={min} max={max} step={step} onChange={(nextValue) => onChange?.(nextValue)} />
    </label>
  )
})

const SettingsSelect = React.memo(function SettingsSelect({
  title,
  value,
  options,
  wide = false,
  onChange
}: {
  title: string
  value: string
  options: Array<{ label: string; value: string }>
  wide?: boolean
  onChange?: (value: string) => void
}): React.ReactElement {
  return (
    <label className={`settings-select-row ${wide ? 'wide' : ''}`}>
      <strong>{title}</strong>
      <select value={value} onChange={(event) => onChange?.(event.currentTarget.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
})

const SettingsSegment = React.memo(function SettingsSegment({
  title,
  values,
  labels,
  selected,
  onSelect
}: {
  title: string
  values: string[]
  labels?: string[]
  selected: string
  onSelect?: (value: string) => void
}): React.ReactElement {
  return (
    <div className="settings-segment-row">
      <strong>{title}</strong>
      <div>
        {values.map((value, index) => (
          <button key={value} className={value === selected ? 'active' : ''} type="button" onClick={() => onSelect?.(value)}>
            {labels?.[index] ?? value}
          </button>
        ))}
      </div>
    </div>
  )
})

const LibraryDetailPage = React.memo(function LibraryDetailPage({
  route,
  snapshot,
  albums,
  currentId,
  onNavigate,
  onSelect,
  onPlayRoute,
  onEditTrack,
  onDeleteTrack,
  onRemoveTrackFromPlaylist,
  onAddTrackToPlaylist,
  onCreatePlaylistWithTrack,
  onEditArtist,
  onDeleteArtist,
  onEditAlbum,
  onDeleteAlbum,
  onEditPlaylist,
  onDeletePlaylist,
  onOpenContextMenu
}: {
  route: DetailRoute
  snapshot: HomeSnapshot
  albums: Map<string, HomeAlbumCard>
  currentId: string
  onNavigate: (route: AppRoute) => void
  onSelect: (id: string) => void
  onPlayRoute: (route: DetailRoute, preferredTrackId?: string) => void
  onEditTrack: (track: HomeTrack) => void
  onDeleteTrack: (track: HomeTrack) => void
  onRemoveTrackFromPlaylist: (track: HomeTrack) => void
  onAddTrackToPlaylist: (playlistId: string, track: HomeTrack) => void
  onCreatePlaylistWithTrack: (track: HomeTrack) => void
  onEditArtist: (artist: HomeArtistCard) => void
  onDeleteArtist: (artist: HomeArtistCard) => void
  onEditAlbum: (album: HomeAlbumCard) => void
  onDeleteAlbum: (album: HomeAlbumCard) => void
  onEditPlaylist: (playlist: HomePlaylistCard) => void
  onDeletePlaylist: (playlist: HomePlaylistCard) => void
  onOpenContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
}): React.ReactElement {
  const pageScroll = useElasticScroll<HTMLElement>()
  const tracks = React.useMemo(() => tracksForRoute(route, snapshot), [route, snapshot])
  const isArtistIndex = route.name === 'artistDetail' && route.id === 'all-artists'
  const isAlbumIndex = route.name === 'albumDetail' && route.id === 'all-albums'
  const artworkShape = route.name === 'artistDetail' && route.id !== 'all-artists' ? 'artist' : 'square'
  const headerContextItems = React.useMemo((): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [
      { label: '播放', onSelect: () => onPlayRoute(route) }
    ]
    if (route.name === 'artistDetail' && route.id !== 'all-artists') {
      const artist = snapshot.artists.find((entry) => entry.id === route.id)
      if (artist) items.push({ label: '编辑艺人', onSelect: () => onEditArtist(artist) }, { label: '-', onSelect: () => {} }, { label: '删除艺人', danger: true, onSelect: () => onDeleteArtist(artist) })
    } else if (route.name === 'albumDetail' && route.id !== 'all-albums') {
      const album = snapshot.albums.find((entry) => entry.id === route.id)
      if (album) items.push({ label: '编辑专辑', onSelect: () => onEditAlbum(album) }, { label: '-', onSelect: () => {} }, { label: '删除专辑', danger: true, onSelect: () => onDeleteAlbum(album) })
    } else if (route.name === 'playlistDetail' && route.id !== 'playlist-library') {
      const playlist = snapshot.playlists.find((entry) => entry.id === route.id)
      if (playlist) items.push({ label: '编辑播放列表', onSelect: () => onEditPlaylist(playlist) }, { label: '-', onSelect: () => {} }, { label: '删除播放列表', danger: true, onSelect: () => onDeletePlaylist(playlist) })
    }
    return items
  }, [onDeleteAlbum, onDeleteArtist, onDeletePlaylist, onEditAlbum, onEditArtist, onEditPlaylist, onPlayRoute, route, snapshot.albums, snapshot.artists, snapshot.playlists])

  return (
    <section className="artist-page" ref={pageScroll.scrollRef} onWheel={pageScroll.onWheel}>
      <div
        className={`artist-scroll-content ${pageScroll.elasticOffset !== 0 ? 'elastic-active' : ''} ${
          pageScroll.isSettling ? 'settling' : ''
        }`}
        style={{ transform: `translate3d(0, ${pageScroll.elasticOffset}px, 0)` }}
      >
        <header className="artist-header" onContextMenu={(event) => onOpenContextMenu(event, headerContextItems)}>
          <div className={`artist-image-frame ${artworkShape === 'square' ? 'square-artwork' : ''}`}>
            <img src={detailArtwork(route, snapshot, albums)} alt="" decoding="async" />
          </div>
          <div className="artist-copy">
            <h1>{route.name === 'allTracks' ? '所有歌曲' : route.title}</h1>
            <p className="artist-meta">{detailSubtitle(route, snapshot, tracks)}</p>
            <div className="detail-actions">
              <button className="play-cta" type="button" disabled={!tracks.length} onClick={() => onPlayRoute(route)}>
                <Play size={16} fill="currentColor" />
                播放
              </button>
              {route.name === 'artistDetail' && route.id !== 'all-artists' ? (
                <button className="edit-button" type="button" onClick={() => {
                  const artist = snapshot.artists.find((entry) => entry.id === route.id)
                  if (artist) onEditArtist(artist)
                }}>编辑艺人</button>
              ) : null}
              {route.name === 'albumDetail' && route.id !== 'all-albums' ? (
                <button className="edit-button" type="button" onClick={() => {
                  const album = snapshot.albums.find((entry) => entry.id === route.id)
                  if (album) onEditAlbum(album)
                }}>编辑专辑</button>
              ) : null}
              {route.name === 'playlistDetail' && route.id !== 'playlist-library' ? (
                <button className="edit-button" type="button" onClick={() => {
                  const playlist = snapshot.playlists.find((entry) => entry.id === route.id)
                  if (playlist) onEditPlaylist(playlist)
                }}>编辑歌单</button>
              ) : null}
            </div>
          </div>
        </header>

        {isArtistIndex ? (
          <CollectionGrid
            artists={snapshot.artists}
            onArtist={(artist) => onNavigate({ name: 'artistDetail', id: artist.id, title: artist.name })}
            onPlayArtist={(artist) => onPlayRoute({ name: 'artistDetail', id: artist.id, title: artist.name })}
            onEditArtist={onEditArtist}
            onDeleteArtist={onDeleteArtist}
            onOpenContextMenu={onOpenContextMenu}
          />
        ) : null}
        {isAlbumIndex ? (
          <CollectionGrid
            albums={snapshot.albums}
            onAlbum={(album) => onNavigate({ name: 'albumDetail', id: album.id, title: album.title })}
            onPlayAlbum={(album) => onPlayRoute({ name: 'albumDetail', id: album.id, title: album.title })}
            onEditAlbum={onEditAlbum}
            onDeleteAlbum={onDeleteAlbum}
            onOpenContextMenu={onOpenContextMenu}
          />
        ) : null}
        {!isArtistIndex && !isAlbumIndex ? (
          <TrackRows
            tracks={tracks}
            albums={albums}
            currentId={currentId}
            onSelect={(id) => {
              onPlayRoute(route, id)
              onSelect(id)
            }}
            onPlay={(track) => onPlayRoute(route, track.id)}
            onEdit={onEditTrack}
            onDelete={onDeleteTrack}
            onRemoveFromPlaylist={route.name === 'playlistDetail' && route.id !== 'playlist-library' ? onRemoveTrackFromPlaylist : undefined}
            playlists={snapshot.playlists.filter((playlist) => playlist.id !== 'playlist-library' && (route.name !== 'playlistDetail' || playlist.id !== route.id))}
            onAddToPlaylist={onAddTrackToPlaylist}
            onCreatePlaylistWithTrack={onCreatePlaylistWithTrack}
            onViewArtist={(track) => onNavigate({ name: 'artistDetail', id: track.artistId, title: track.artist })}
            onViewAlbum={(track) => onNavigate({ name: 'albumDetail', id: track.albumId, title: track.album })}
            onOpenContextMenu={onOpenContextMenu}
          />
        ) : null}
      </div>
    </section>
  )
})

const CollectionGrid = React.memo(function CollectionGrid({
  artists,
  albums,
  onArtist,
  onAlbum,
  onPlayArtist,
  onEditArtist,
  onDeleteArtist,
  onPlayAlbum,
  onEditAlbum,
  onDeleteAlbum,
  onOpenContextMenu
}: {
  artists?: HomeArtistCard[]
  albums?: HomeAlbumCard[]
  onArtist?: (artist: HomeArtistCard) => void
  onAlbum?: (album: HomeAlbumCard) => void
  onPlayArtist?: (artist: HomeArtistCard) => void
  onEditArtist?: (artist: HomeArtistCard) => void
  onDeleteArtist?: (artist: HomeArtistCard) => void
  onPlayAlbum?: (album: HomeAlbumCard) => void
  onEditAlbum?: (album: HomeAlbumCard) => void
  onDeleteAlbum?: (album: HomeAlbumCard) => void
  onOpenContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
}): React.ReactElement {
  return (
    <div className="collection-grid">
      {artists?.map((artist) => (
        <button
          className="home-person-card home-liquid-card glass-panel"
          key={artist.id}
          type="button"
          onClick={() => onArtist?.(artist)}
          onContextMenu={(event) => onOpenContextMenu(event, [
            { label: '播放艺人', onSelect: () => onPlayArtist?.(artist) },
            { label: '编辑艺人', onSelect: () => onEditArtist?.(artist) },
            { label: '-', onSelect: () => {} },
            { label: '删除艺人', danger: true, onSelect: () => onDeleteArtist?.(artist) }
          ])}
        >
          {artist.artworkUrl ? <img src={artist.artworkUrl} alt="" loading="lazy" decoding="async" /> : <span className="artist-avatar">{artist.name}</span>}
          <strong>{artist.name}</strong>
        </button>
      ))}
      {albums?.map((album) => (
        <button
          className="home-album-card home-liquid-card glass-panel"
          key={album.id}
          type="button"
          onClick={() => onAlbum?.(album)}
          onContextMenu={(event) => onOpenContextMenu(event, [
            { label: '播放专辑', onSelect: () => onPlayAlbum?.(album) },
            { label: '编辑专辑', onSelect: () => onEditAlbum?.(album) },
            { label: '-', onSelect: () => {} },
            { label: '删除专辑', danger: true, onSelect: () => onDeleteAlbum?.(album) }
          ])}
        >
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
  onSelect,
  onPlay,
  onEdit,
  onDelete,
  onRemoveFromPlaylist,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistWithTrack,
  onViewArtist,
  onViewAlbum,
  onOpenContextMenu
}: {
  tracks: Track[]
  albums: Map<string, HomeAlbumCard>
  currentId: string
  onSelect: (id: string) => void
  onPlay: (track: Track) => void
  onEdit: (track: Track) => void
  onDelete: (track: Track) => void
  onRemoveFromPlaylist?: (track: Track) => void
  playlists: HomePlaylistCard[]
  onAddToPlaylist: (playlistId: string, track: Track) => void
  onCreatePlaylistWithTrack: (track: Track) => void
  onViewArtist: (track: Track) => void
  onViewAlbum: (track: Track) => void
  onOpenContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
}): React.ReactElement {
  return (
    <div className="track-list">
      {tracks.map((track) => (
        <button
          className={`track-row ${track.id === currentId ? 'current' : ''}`}
          key={track.id}
          type="button"
          onClick={() => onSelect(track.id)}
          onContextMenu={(event) => onOpenContextMenu(event, [
            { label: '播放', onSelect: () => onPlay(track) },
            { label: '-', onSelect: () => {} },
            ...playlists.map((playlist) => ({
              label: `添加到：${playlist.name}`,
              onSelect: () => onAddToPlaylist(playlist.id, track)
            })),
            { label: '新建播放列表并添加', onSelect: () => onCreatePlaylistWithTrack(track) },
            ...(onRemoveFromPlaylist ? [{ label: '从当前播放列表移除', onSelect: () => onRemoveFromPlaylist(track) }] : []),
            { label: '-', onSelect: () => {} },
            { label: '编辑歌曲信息', onSelect: () => onEdit(track) },
            { label: '查看艺人', onSelect: () => onViewArtist(track) },
            { label: '查看专辑', onSelect: () => onViewAlbum(track) },
            { label: '-', onSelect: () => {} },
            { label: '从资料库删除', danger: true, onSelect: () => onDelete(track) }
          ])}
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
  tracks,
  albums,
  currentId,
  isPlaying,
  isShuffleEnabled,
  volume,
  playbackTime,
  playbackDuration,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleShuffle,
  onVolumeChange,
  onSelectTrack,
  onOpenNowPlaying,
  onSeek
}: {
  track: Track
  tracks: Track[]
  albums: Map<string, HomeAlbumCard>
  currentId: string
  isPlaying: boolean
  isShuffleEnabled: boolean
  volume: number
  playbackTime: number
  playbackDuration: number
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onToggleShuffle: () => void
  onVolumeChange: (volume: number) => void
  onSelectTrack: (id: string) => void
  onOpenNowPlaying: () => void
  onSeek: (seconds: number) => void
}): React.ReactElement {
  const [isQueueOpen, setIsQueueOpen] = React.useState(false)
  const progressRailRef = React.useRef<HTMLDivElement | null>(null)
  const isProgressPressedRef = React.useRef(false)
  const queueTracks = tracks.length ? tracks : [track]
  const safePlaybackDuration = Math.max(1, playbackDuration)
  const progress = playbackDuration > 0 ? Math.min(100, Math.max(0, (playbackTime / playbackDuration) * 100)) : 0
  const seekFromProgressClientX = React.useCallback((clientX: number) => {
    const rail = progressRailRef.current
    if (!rail) return
    const rect = rail.getBoundingClientRect()
    const ratio = rect.width > 0 ? clampNumber((clientX - rect.left) / rect.width, 0, 1) : 0
    onSeek(ratio * safePlaybackDuration)
  }, [onSeek, safePlaybackDuration])
  const handleProgressPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    isProgressPressedRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])
  const handleProgressPointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isProgressPressedRef.current) return
    event.preventDefault()
    event.stopPropagation()
    isProgressPressedRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    seekFromProgressClientX(event.clientX)
  }, [seekFromProgressClientX])
  const handleProgressPointerCancel = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isProgressPressedRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  return (
    <div className={`mini-player glass-panel no-drag ${isPlaying ? 'playing' : ''}`} style={{ '--filter-url': 'url(#lg-mini)', '--mini-player-progress': `${progress}%` } as React.CSSProperties}>
      <div
        className="mini-progress-rail"
        ref={progressRailRef}
        role="slider"
        aria-label="播放进度"
        aria-valuemax={safePlaybackDuration}
        aria-valuemin={0}
        aria-valuenow={Math.min(playbackTime, safePlaybackDuration)}
        tabIndex={0}
        onPointerDown={handleProgressPointerDown}
        onPointerUp={handleProgressPointerUp}
        onPointerCancel={handleProgressPointerCancel}
      >
        <span className="mini-progress-line" aria-hidden="true" />
      </div>
      <button className="mini-track" type="button" aria-label="打开窗口播放" onClick={onOpenNowPlaying}>
        <img src={trackArtwork(track, albums)} alt="" decoding="async" />
        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
      </button>
      <button className={`mini-queue-button ${isQueueOpen ? 'active' : ''}`} type="button" aria-label="播放列表" aria-expanded={isQueueOpen} onClick={() => setIsQueueOpen((value) => !value)}>
        <ListMusic size={18} />
      </button>
      {isQueueOpen ? (
        <div className="mini-queue-popover glass-panel" style={{ '--filter-url': 'url(#lg-sidebar)' } as React.CSSProperties}>
          <div className="mini-queue-head">
            <span>播放列表</span>
            <strong>{queueTracks.length} 首</strong>
          </div>
          <div className="mini-queue-list">
            {queueTracks.map((queueTrack) => (
              <button
                className={`mini-queue-row ${queueTrack.id === currentId ? 'current' : ''}`}
                key={queueTrack.id}
                type="button"
                onClick={() => {
                  onSelectTrack(queueTrack.id)
                  setIsQueueOpen(false)
                }}
              >
                <img src={trackArtwork(queueTrack, albums)} alt="" loading="lazy" decoding="async" />
                <span>
                  <strong>{queueTrack.title}</strong>
                  <small>{queueTrack.artist}</small>
                </span>
                <time>{formatDuration(queueTrack.duration)}</time>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mini-controls">
        <button type="button" aria-label="上一首" onClick={onPrevious}>
          <SkipBack size={19} fill="currentColor" />
        </button>
        <button type="button" aria-label="播放暂停" onClick={onPlayPause}>
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        <button type="button" aria-label="下一首" onClick={onNext}>
          <SkipForward size={19} fill="currentColor" />
        </button>
      </div>
      <button className={`mode-button ${isShuffleEnabled ? 'active' : ''}`} type="button" aria-pressed={isShuffleEnabled} aria-label="随机" onClick={onToggleShuffle}>
        <Shuffle size={18} />
      </button>
      <div className="mini-timeline">
        <label className="volume-track">
          {volume <= 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <LiquidGlassSlider
            ariaLabel="音量"
            className="volume-liquid-slider"
            max={1}
            min={0}
            step="0.01"
            value={volume}
            onChange={onVolumeChange}
          />
        </label>
      </div>
    </div>
  )
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
