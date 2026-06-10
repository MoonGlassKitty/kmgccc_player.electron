import React from 'react'
import ReactDOM from 'react-dom/client'
import { LyricPlayer } from '@applemusic-like-lyrics/react'
import type { LyricLine, LyricLineMouseEvent } from '@applemusic-like-lyrics/core'
import { guess } from 'web-audio-beat-detector'
import {
  ArrowDownUp,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Building2,
  Calendar,
  Disc3,
  ExternalLink,
  GripHorizontal,
  Hammer,
  House,
  ImageIcon,
  Info,
  Languages,
  ListMusic,
  Maximize2,
  MessageSquareQuote,
  Minus,
  Minimize2,
  Moon,
  Music2,
  Palette,
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
  Tags,
  TextQuote,
  Trash2,
  Upload,
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
import lightHole from './assets/xc-assets/lighthole.png'
import darkHole from './assets/xc-assets/darkhole.png'
import playlistCover1 from './assets/xc-assets/cov1.png'
import playlistCover2 from './assets/xc-assets/cov2.png'
import playlistCover3 from './assets/xc-assets/cov3.png'
import playlistCover4 from './assets/xc-assets/cov4.png'
import sfMusicNote from './assets/sf-symbols/music-note.png'
import sfPhoto from './assets/sf-symbols/photo.png'
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
  userDescription?: string
  genreTags?: string[]
  language?: string
  labelOrCompany?: string
  releaseDate?: string
  neteaseSongId?: number
  qqMusicSongId?: string
  qqMusicSongMid?: string
  metadataFetchedAt?: string
  metadataConfidence?: number
  lyricsTimeOffsetMs?: number
  artistDescription?: string
  artistGenreTags?: string[]
  artistRegion?: string
  artistForeignName?: string
  qqMusicSingerMid?: string
  artistMetadataSource?: string
  artistMetadataFetchedAt?: string
  artistMetadataConfidence?: number
  artistArtworkUrl?: string
  albumDescription?: string
  albumReleaseYear?: number
  albumReleaseDate?: string
  albumType?: string
  albumGenreTags?: string[]
  albumLanguage?: string
  albumLabelOrCompany?: string
  qqMusicAlbumMid?: string
  albumMetadataSource?: string
  albumMetadataFetchedAt?: string
  albumMetadataConfidence?: number
  albumArtworkUrl?: string
}

type PlaybackSourceKind = 'local' | 'external'

type ExternalLyricsCacheEntry = {
  lyricsText?: string
  syncedLyrics?: string
  metadataSongId?: number
  status: 'loading' | 'ready' | 'empty' | 'failed'
  updatedAt?: number
}

type ExternalArtworkCacheEntry = {
  artworkUrl?: string
  metadataArtworkUrl?: string
  status: 'loading' | 'ready' | 'empty' | 'failed'
  updatedAt?: number
}

type ExternalPlaybackClock = {
  key: string
  currentTime: number
  updatedAt: number
}

const EXTERNAL_PLAYBACK_FALLBACK_DURATION_SECONDS = 12 * 60
const EXTERNAL_PLAYBACK_CLOCK_SNAP_SECONDS = 1.5
const EXTERNAL_LYRICS_RETRY_DELAY_MS = 1000
const EXTERNAL_LYRICS_CACHE_STORAGE_KEY = 'externalPlayback.lyricsCache.v1'
const EXTERNAL_ARTWORK_CACHE_STORAGE_KEY = 'externalPlayback.artworkCache.v1'
const EXTERNAL_METADATA_CACHE_LIMIT = 160

function externalTrackKey(snapshot: ExternalPlaybackSnapshot | null): string {
  if (!snapshot) return ''
  return [
    snapshot.sourceAppUserModelId || snapshot.sourceMode,
    snapshot.title.trim(),
    snapshot.artist.trim()
  ].join('|')
}

type ArtworkBeat = {
  bpm: number
  offset: number
  approved?: boolean
}

type ManualBpmBoardState = {
  trackId: string
  title: string
  artist: string
  openedAtMs: number
  openedPlaybackTime: number
}

type ArtworkBeatSaveFeedback = {
  trackId: string
  bpm: number
  kind: 'approved' | 'manual' | 'waiting'
} | null

type ImportSyncState = {
  title: string
  artist: string
  detail: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  processedCount: number
  totalCount: number
  results?: {
    track?: 'completed' | 'noResults' | 'failed'
    artist?: 'completed' | 'noResults' | 'failed'
    lyrics?: 'completed' | 'noResults' | 'failed'
    album?: 'completed' | 'noResults' | 'failed'
  }
}

const albumArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/15/a4/a4/15a4a47c-62db-07c3-d14f-e78c3c8dec85/artwork.jpg/600x600bb.jpg'

const altArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e9/c4/38/e9c43893-e743-269a-6a47-c11120717177/artwork.jpg/600x600bb.jpg'

const DEFAULT_SIDEBAR_WIDTH = 320
const COLLAPSED_SIDEBAR_WIDTH = 82
const MAX_ARTWORK_THUMBNAIL_CACHE_SIZE = 240
const artworkThumbnailCache = new Map<string, Promise<string | null> | string | null>()

type ImportSyncFieldStatus = NonNullable<ImportSyncState['results']>[keyof NonNullable<ImportSyncState['results']>]

function mergeImportSyncStatus(current: ImportSyncFieldStatus | undefined, next: ImportSyncFieldStatus | undefined): ImportSyncFieldStatus | undefined {
  if (!next) return current
  if (!current) return next
  if (current === 'failed' || next === 'failed') return 'failed'
  if (current === 'completed' || next === 'completed') return 'completed'
  return 'noResults'
}

function importSyncResultSummary(results: NonNullable<ImportSyncState['results']>): string {
  const failed: string[] = []
  const missing: string[] = []
  const names: Record<keyof NonNullable<ImportSyncState['results']>, string> = {
    track: '歌曲信息',
    artist: '歌手信息',
    album: '专辑信息',
    lyrics: '歌词'
  }
  for (const key of Object.keys(names) as Array<keyof NonNullable<ImportSyncState['results']>>) {
    if (results[key] === 'failed') failed.push(names[key])
    if (results[key] === 'noResults') missing.push(names[key])
  }
  if (!failed.length && !missing.length) return '歌曲信息、歌手信息、专辑信息与歌词已补全'
  return [
    failed.length ? `${failed.join('、')}补全失败` : '',
    missing.length ? `${missing.join('、')}未找到` : ''
  ].filter(Boolean).join('；')
}

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

function createArtworkThumbnail(artworkUrl: string, maxSize: number): Promise<string | null> {
  const cacheKey = `${maxSize}:${artworkUrl}`
  const cached = artworkThumbnailCache.get(cacheKey)
  if (typeof cached === 'string' || cached === null) return Promise.resolve(cached)
  if (cached) return cached

  const promise = new Promise<string | null>((resolve) => {
    if (!artworkUrl || artworkUrl.startsWith('data:image/svg')) {
      resolve(null)
      return
    }
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.onload = () => {
      try {
        const sourceWidth = image.naturalWidth
        const sourceHeight = image.naturalHeight
        if (sourceWidth <= 0 || sourceHeight <= 0 || Math.max(sourceWidth, sourceHeight) <= maxSize) {
          resolve(null)
          return
        }
        const scale = maxSize / Math.max(sourceWidth, sourceHeight)
        const width = Math.max(1, Math.round(sourceWidth * scale))
        const height = Math.max(1, Math.round(sourceHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          resolve(null)
          return
        }
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'medium'
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      } catch {
        resolve(null)
      }
    }
    image.onerror = () => resolve(null)
    image.src = artworkUrl
  }).then((thumbnail) => {
    artworkThumbnailCache.set(cacheKey, thumbnail)
    if (artworkThumbnailCache.size > MAX_ARTWORK_THUMBNAIL_CACHE_SIZE) {
      for (const [key, value] of artworkThumbnailCache) {
        if (key === cacheKey || value instanceof Promise) continue
        artworkThumbnailCache.delete(key)
        if (artworkThumbnailCache.size <= MAX_ARTWORK_THUMBNAIL_CACHE_SIZE) break
      }
    }
    return thumbnail
  })
  artworkThumbnailCache.set(cacheKey, promise)
  return promise
}

function useArtworkThumbnail(artworkUrl: string, maxSize: number): string {
  const cacheKey = `${maxSize}:${artworkUrl}`
  const [thumbnailState, setThumbnailState] = React.useState<{ key: string; thumbnail: string | null }>(() => {
    const cached = artworkThumbnailCache.get(cacheKey)
    return {
      key: cacheKey,
      thumbnail: typeof cached === 'string' ? cached : null
    }
  })

  React.useEffect(() => {
    let cancelled = false
    const cached = artworkThumbnailCache.get(cacheKey)
    if (typeof cached === 'string') {
      setThumbnailState({ key: cacheKey, thumbnail: cached })
      return () => {
        cancelled = true
      }
    }
    setThumbnailState({ key: cacheKey, thumbnail: null })
    void createArtworkThumbnail(artworkUrl, maxSize).then((nextThumbnail) => {
      if (!cancelled) setThumbnailState({ key: cacheKey, thumbnail: nextThumbnail })
    })
    return () => {
      cancelled = true
    }
  }, [artworkUrl, cacheKey, maxSize])

  return thumbnailState.key === cacheKey && thumbnailState.thumbnail ? thumbnailState.thumbnail : artworkUrl
}

const ArtworkImage = React.memo(function ArtworkImage({
  src,
  maxSize,
  alt = '',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  maxSize: number
}): React.ReactElement {
  const displaySrc = useArtworkThumbnail(src, maxSize)
  return <img {...props} src={displaySrc} alt={alt} decoding={props.decoding ?? 'async'} />
})

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
  onScroll: (event: React.UIEvent<T>) => void
} {
  const scrollRef = React.useRef<T>(null)
  const scrollEndTimerRef = React.useRef<number | null>(null)
  const scrollingRef = React.useRef(false)
  const onWheel = React.useCallback((_event: React.WheelEvent<T>) => {}, [])
  const onScroll = React.useCallback((event: React.UIEvent<T>) => {
    const target = event.currentTarget
    if (!scrollingRef.current) {
      scrollingRef.current = true
      target.classList.add('is-scrolling')
    }

    if (scrollEndTimerRef.current !== null) {
      window.clearTimeout(scrollEndTimerRef.current)
    }
    scrollEndTimerRef.current = window.setTimeout(() => {
      scrollingRef.current = false
      scrollEndTimerRef.current = null
      target.classList.remove('is-scrolling')
    }, 140)
  }, [])

  React.useEffect(() => () => {
    if (scrollEndTimerRef.current !== null) {
      window.clearTimeout(scrollEndTimerRef.current)
    }
    scrollRef.current?.classList.remove('is-scrolling')
  }, [])

  return { scrollRef, elasticOffset: 0, isSettling: false, isScrolling: false, onWheel, onScroll }
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
type FullscreenSkinID = NowPlayingSkinID | 'fullscreen.coverGradientBlur'
type VisualizerMode = 'off' | 'led' | 'spectrum'
type AppleMeshSpeed = 'slow' | 'standard' | 'fast'
type CoverGradientEdgeFillMode = 'pixelStretch' | 'mirroredCover'
type LyricsBackgroundMode = 'clear' | 'sidebar'
type HomeCardMaterialMode = 'liquidGlass' | 'frostedGlass' | 'solid'
type HomeSectionID = 'featured' | 'artists' | 'albums' | 'playlists' | 'listeningFootprint'
type ManualAppearanceMode = 'light' | 'dark'
type LyricsRenderQuality = 'performance' | 'balanced' | 'quality'
type DetailSortKey = 'importedAt' | 'addedAt' | 'title' | 'artist' | 'duration' | 'playCount' | 'favorite' | 'albumOrder'
type SortDirection = 'asc' | 'desc'
type EntryRevealTarget = 'home' | 'nowPlaying' | 'fullscreen'
type EntryRevealState = {
  target: EntryRevealTarget
  phase: 'loading' | 'revealing'
} | null
type LibraryLocationInfo = {
  currentPath: string
  isDefault: boolean
}
type SettingsActionStatus = {
  label: string
  tone?: 'normal' | 'danger'
} | null
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
  | { kind: 'batchEditTracks'; tracks: HomeTrack[] }
  | { kind: 'createPlaylist'; track?: HomeTrack }
  | { kind: 'deleteTrack'; track: HomeTrack }
  | { kind: 'deleteAlbum'; album: HomeAlbumCard }
  | { kind: 'deleteArtist'; artist: HomeArtistCard }
  | { kind: 'deletePlaylist'; playlist: HomePlaylistCard }

const bkShapeAssets = [shape1, shape2, shape3, shape4, shape5, shape6, shape7, shape8, shape9, shape10, shape11]
const bkBackgroundAssets = [bkBackground1, bkBackground2]
const artworkFrameAssets = [artworkFrame1, artworkFrame2, artworkFrame3, artworkFrame4]
const ARTWORK_PULSE_VISUAL_ADVANCE_SECONDS = 0.1
const APPROVED_ARTWORK_BEATS_STORAGE_KEY = 'skin.classicLED.approvedArtworkBeats'
const ARTWORK_BPM_ACCEPTANCE_RANGE = 5

function normalizeArtworkPulseBpm(rawTempo: number): number {
  let bpm = rawTempo
  while (bpm > 90) bpm /= 2
  return clampNumber(Math.round(bpm), 45, 90)
}

function sanitizeArtworkBeat(value: unknown): ArtworkBeat | null {
  if (!value || typeof value !== 'object') return null
  const beat = value as Partial<ArtworkBeat>
  if (typeof beat.bpm !== 'number' || typeof beat.offset !== 'number') return null
  if (!Number.isFinite(beat.bpm) || !Number.isFinite(beat.offset)) return null
  return {
    bpm: clampNumber(Math.round(beat.bpm), 45, 90),
    offset: Math.max(0, beat.offset),
    approved: beat.approved === true
  }
}
const playlistCoverBases = [playlistCover1, playlistCover2, playlistCover3, playlistCover4]
const detailSortLabels: Record<DetailSortKey, string> = {
  importedAt: '导入时间',
  addedAt: '添加时间',
  title: '标题',
  artist: '艺人',
  duration: '时长',
  playCount: '播放次数',
  favorite: '偏好程度',
  albumOrder: '#'
}

const nowPlayingSkinOptions: Array<{ id: NowPlayingSkinID; name: string; detail: string }> = [
  { id: 'coverLed', name: '经典封面', detail: '方形封面与 LED/频谱' },
  { id: 'appleStyle', name: 'Apple 风格', detail: 'AMLL Mesh 背景' },
  { id: 'rotatingCover', name: '旋转封面', detail: '黑胶/CD 旋转封面' },
  { id: 'kmgccc.cassette', name: 'kmgccc 磁带', detail: '磁带主体与 KMG 标识' }
]
const fullscreenSkinOptions: Array<{ id: FullscreenSkinID; name: string; detail: string }> = [
  { id: 'fullscreen.coverGradientBlur', name: '封面渐变模糊', detail: '全屏封面延展背景' },
  ...nowPlayingSkinOptions
]

const homeSectionOptions: Array<{ id: HomeSectionID; title: string }> = [
  { id: 'featured', title: '精选' },
  { id: 'artists', title: '艺人' },
  { id: 'albums', title: '专辑' },
  { id: 'playlists', title: '播放列表' },
  { id: 'listeningFootprint', title: '音乐足迹' }
]
const defaultHomeSectionOrder: HomeSectionID[] = homeSectionOptions.map((section) => section.id)

function lyricRenderScaleForQuality(quality: LyricsRenderQuality): number {
  if (quality === 'quality') return 0.75
  if (quality === 'balanced') return 0.55
  return 0.45
}

function HomeSectionOrderIcon({ section }: { section: HomeSectionID }): React.ReactElement {
  if (section === 'featured') return <Sparkles size={18} />
  if (section === 'artists') return <Music2 size={18} />
  if (section === 'albums') return <Disc3 size={18} />
  if (section === 'playlists') return <ListMusic size={18} />
  return <Calendar size={18} />
}

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = safeSeconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

function parseCommaTags(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function normalizeArtistGradientColor(color: RgbColor): RgbColor {
  const hsv = rgbToHsv(color)
  return hsvToRgb({
    h: hsv.h,
    s: clampNumber(hsv.s, 0.24, 0.62),
    v: clampNumber(hsv.v, 0.34, 0.84)
  })
}

function deriveArtistGradientPair(color: RgbColor, artistName: string): RgbColor {
  const hsv = rgbToHsv(color)
  const hash = hashString(artistName)
  return hsvToRgb({
    h: (hsv.h + ((hash % 19) + 9)) % 360,
    s: clampNumber(hsv.s * 0.86, 0.20, 0.56),
    v: clampNumber(hsv.v * 1.12, 0.42, 0.90)
  })
}

function relativeLuminance(color: RgbColor): number {
  return (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255
}

function suggestedArtistFontSize(name: string, canvasWidth: number): number {
  const length = Array.from(name.trim()).length
  if (length <= 6) return canvasWidth * 0.15
  if (length <= 12) return canvasWidth * 0.12
  if (length <= 18) return canvasWidth * 0.10
  return canvasWidth * 0.08
}

function createArtistPlaceholderArtwork(artistName: string, palette: RgbColor[] = []): string {
  const name = artistName.trim() || '未知艺人'
  const hash = hashString(name)
  const startColor = palette[0]
    ? normalizeArtistGradientColor(palette[0])
    : hsvToRgb({ h: hash % 360, s: 0.34, v: 0.48 })
  const endColor = palette[1]
    ? normalizeArtistGradientColor(palette[1])
    : palette[0]
      ? deriveArtistGradientPair(startColor, name)
      : hsvToRgb({ h: ((hash % 360) + 36) % 360, s: 0.26, v: 0.72 })
  const blended = mixRgb(startColor, endColor, 0.5)
  const textColor = relativeLuminance(blended) > 0.56 ? 'rgba(26,26,26,.95)' : 'rgba(250,250,250,.98)'
  const angle = 20 + (hash % 55)
  const fontSize = suggestedArtistFontSize(name, 640)
  const escapedName = name
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)"><stop stop-color="${hexString(startColor)}"/><stop offset="1" stop-color="${hexString(endColor)}"/></linearGradient><radialGradient id="h" cx="15%" cy="8%" r="70%"><stop stop-color="rgba(255,255,255,.08)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="640" height="640" fill="url(#g)"/><ellipse cx="250" cy="115" rx="448" ry="448" fill="url(#h)"/><text x="320" y="330" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="${fontSize}" font-weight="650" letter-spacing="0">${escapedName}</text></svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
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

function playlistStableHash(value: string): number {
  let hash = 5381
  const bytes = new TextEncoder().encode(value)
  bytes.forEach((byte) => {
    hash = Math.imul(hash, 33) ^ byte
  })
  return hash >>> 0
}

const playlistLogoArtwork = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><path d="M142 186h240M142 286h240M142 386h164" fill="none" stroke="#1f85ad" stroke-width="46" stroke-linecap="round"/><path d="M448 174v250c0 45-40 78-91 78-43 0-76-24-76-58 0-38 40-64 89-64 15 0 29 3 42 7V198c0-17 11-31 27-36l102-28c19-5 38 9 38 29v45c0 17-11 31-27 36l-104 30" fill="none" stroke="#1f85ad" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/></svg>`
)))}`

function isImportedPlaylist(playlist?: Pick<HomePlaylistCard, 'id' | 'name'> | null): boolean {
  if (!playlist) return false
  return playlist.id === 'playlist-local-imports' || playlist.name.startsWith('导入于') || playlist.name === '本地导入'
}

function playlistArtworkFor(playlist?: Pick<HomePlaylistCard, 'id' | 'name' | 'artworkUrl'> | null): string {
  if (!isImportedPlaylist(playlist)) return playlistLogoArtwork
  const hash = playlistStableHash(playlist?.id ?? 'playlist-library')
  return playlistCoverBases[hash % playlistCoverBases.length]
}

function playlistArtworkStyle(playlist?: Pick<HomePlaylistCard, 'id' | 'name'> | null): React.CSSProperties | undefined {
  if (!isImportedPlaylist(playlist)) return undefined
  const hash = playlistStableHash(playlist?.id ?? 'playlist-local-imports')
  return {
    '--playlist-cover-hue': `${hash % 360}deg`,
    '--playlist-cover-saturation': `${1.65 + ((hash >>> 8) % 95) / 100}`,
    '--playlist-cover-brightness': `${0.94 + ((hash >>> 16) % 20) / 100}`,
    '--playlist-cover-contrast': `${1.04 + ((hash >>> 24) % 18) / 100}`
  } as React.CSSProperties
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

function storedHomeCardMaterialMode(): HomeCardMaterialMode {
  try {
    const migrated = window.localStorage.getItem('homeCardMaterialModeDefaultMigrated') === 'true'
    const value = window.localStorage.getItem('homeCardMaterialMode')
    if (!migrated && (!value || value === 'liquidGlass')) {
      window.localStorage.setItem('homeCardMaterialModeDefaultMigrated', 'true')
      window.localStorage.setItem('homeCardMaterialMode', 'frostedGlass')
      return 'frostedGlass'
    }
    if (value === 'liquidGlass' || value === 'frostedGlass' || value === 'solid') return value
  } catch {
    return 'frostedGlass'
  }
  return 'frostedGlass'
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

function storedHomeSectionOrder(): HomeSectionID[] {
  try {
    const rawValue = window.localStorage.getItem('homeSectionOrder')
    const parsed = rawValue ? JSON.parse(rawValue) : []
    if (!Array.isArray(parsed)) return defaultHomeSectionOrder
    const normalized = parsed
      .map((value) => (value === 'stats' ? 'listeningFootprint' : value))
      .filter((value): value is HomeSectionID => defaultHomeSectionOrder.includes(value as HomeSectionID))
    const missing = defaultHomeSectionOrder.filter((value) => !normalized.includes(value))
    return [...normalized, ...missing]
  } catch {
    return defaultHomeSectionOrder
  }
}

function storedApprovedArtworkBeats(): Record<string, ArtworkBeat> {
  try {
    const rawValue = window.localStorage.getItem(APPROVED_ARTWORK_BEATS_STORAGE_KEY)
    const parsed = rawValue ? JSON.parse(rawValue) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([trackId, value]) => [trackId, sanitizeArtworkBeat(value)] as const)
        .filter((entry): entry is readonly [string, ArtworkBeat] => Boolean(entry[0] && entry[1]))
    )
  } catch {
    return {}
  }
}

function latestExternalCacheEntries<T extends { updatedAt?: number }>(entries: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(entries)
      .sort(([, left], [, right]) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
      .slice(0, EXTERNAL_METADATA_CACHE_LIMIT)
  )
}

function sanitizeExternalLyricsCache(value: unknown): Record<string, ExternalLyricsCacheEntry> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value).reduce<Record<string, ExternalLyricsCacheEntry>>((cache, [key, rawEntry]) => {
    if (!key || !rawEntry || typeof rawEntry !== 'object' || Array.isArray(rawEntry)) return cache
    const entry = rawEntry as Partial<ExternalLyricsCacheEntry>
    const text = (entry.syncedLyrics || entry.lyricsText || '').trim()
    if (entry.status !== 'ready' || !text) return cache
    const metadataSongId = typeof entry.metadataSongId === 'number' && Number.isFinite(entry.metadataSongId) ? entry.metadataSongId : undefined
    const updatedAt = typeof entry.updatedAt === 'number' && Number.isFinite(entry.updatedAt) ? entry.updatedAt : undefined
    cache[key] = { status: 'ready', lyricsText: text, syncedLyrics: text, metadataSongId, updatedAt }
    return cache
  }, {})
  return latestExternalCacheEntries(entries)
}

function sanitizeExternalArtworkCache(value: unknown): Record<string, ExternalArtworkCacheEntry> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value).reduce<Record<string, ExternalArtworkCacheEntry>>((cache, [key, rawEntry]) => {
    if (!key || !rawEntry || typeof rawEntry !== 'object' || Array.isArray(rawEntry)) return cache
    const entry = rawEntry as Partial<ExternalArtworkCacheEntry>
    const artworkUrl = entry.artworkUrl?.trim()
    if (entry.status !== 'ready' || !artworkUrl) return cache
    const metadataArtworkUrl = entry.metadataArtworkUrl?.trim() || undefined
    const updatedAt = typeof entry.updatedAt === 'number' && Number.isFinite(entry.updatedAt) ? entry.updatedAt : undefined
    cache[key] = { status: 'ready', artworkUrl, metadataArtworkUrl, updatedAt }
    return cache
  }, {})
  return latestExternalCacheEntries(entries)
}

function storedExternalLyricsCache(): Record<string, ExternalLyricsCacheEntry> {
  try {
    const rawValue = window.localStorage.getItem(EXTERNAL_LYRICS_CACHE_STORAGE_KEY)
    return sanitizeExternalLyricsCache(rawValue ? JSON.parse(rawValue) : {})
  } catch {
    return {}
  }
}

function storedExternalArtworkCache(): Record<string, ExternalArtworkCacheEntry> {
  try {
    const rawValue = window.localStorage.getItem(EXTERNAL_ARTWORK_CACHE_STORAGE_KEY)
    return sanitizeExternalArtworkCache(rawValue ? JSON.parse(rawValue) : {})
  } catch {
    return {}
  }
}

function persistSetting(key: string, value: string | boolean | number): void {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // Settings still work for the current session if localStorage is unavailable.
  }
}

function persistJsonSetting(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Settings still work for the current session if localStorage is unavailable.
  }
}

function skinPreviewClassName(skin: FullscreenSkinID): string {
  switch (skin) {
    case 'fullscreen.coverGradientBlur':
      return 'cover-gradient-blur'
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

function skinPreviewSymbolStyle(skin: FullscreenSkinID): React.CSSProperties | undefined {
  if (skin === 'coverLed') return { '--skin-symbol': `url(${sfMusicNote})` } as React.CSSProperties
  if (skin === 'fullscreen.coverGradientBlur') return { '--skin-symbol': `url(${sfPhoto})` } as React.CSSProperties
  return undefined
}

function coverThemeFor(track: HomeTrack | Track | null | undefined, albums: Map<string, HomeAlbumCard>): React.CSSProperties {
  if (!track) {
    return {
      '--cover-accent': 'rgba(116, 124, 132, 0.28)',
      '--cover-accent-secondary': 'rgba(154, 158, 164, 0.26)',
      '--cover-accent-border': 'rgba(66, 72, 78, 0.18)',
      '--cover-accent-text': '#303840',
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
  const accent = isAltArtwork ? 'rgba(124, 143, 104, 0.34)' : 'rgba(88, 190, 229, 0.30)'
  const secondaryAccent = isAltArtwork ? 'rgba(224, 132, 142, 0.30)' : 'rgba(238, 106, 142, 0.30)'
  const border = isAltArtwork ? 'rgba(92, 110, 75, 0.24)' : 'rgba(38, 137, 174, 0.18)'
  const text = isAltArtwork ? '#354020' : '#075b80'
  const shadow = isAltArtwork ? 'rgba(92, 110, 75, 0.11)' : 'rgba(15, 85, 120, 0.09)'
  const ambient1 = isAltArtwork ? 'rgba(138, 176, 96, 0.5)' : 'rgba(66, 178, 235, 0.54)'
  const ambient2 = isAltArtwork ? 'rgba(224, 132, 142, 0.42)' : 'rgba(238, 106, 142, 0.45)'
  const ambient3 = isAltArtwork ? 'rgba(218, 188, 72, 0.42)' : 'rgba(232, 197, 70, 0.42)'

  return {
    '--cover-accent': accent,
    '--cover-accent-secondary': secondaryAccent,
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

type HsvColor = {
  h: number
  s: number
  v: number
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

function cssFontFamily(...families: string[]): string {
  const cleaned = families.map((family) => family.trim()).filter(Boolean)
  return [...cleaned.map((family) => JSON.stringify(family)), 'system-ui', 'sans-serif'].join(', ')
}

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

function rgbToHsv({ r, g, b }: RgbColor): HsvColor {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let hue = 0
  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green) hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }
  return {
    h: (hue + 360) % 360,
    s: max === 0 ? 0 : delta / max,
    v: max
  }
}

function hsvToRgb({ h, s, v }: HsvColor): RgbColor {
  const chroma = v * s
  const hue = h / 60
  const x = chroma * (1 - Math.abs((hue % 2) - 1))
  const match = v - chroma
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

function daytimeThemeColor(color: RgbColor, index = 0): RgbColor {
  const hsl = rgbToHsl(color)
  const hueOffset = index === 0 ? 0 : index === 1 ? 4 : -5
  return hslToRgb({
    h: hsl.h + hueOffset,
    s: clampNumber(hsl.s * 1.08 + 0.10, 0.34, 0.78),
    l: clampNumber(hsl.l * 0.72 + 0.25, 0.58, 0.74)
  })
}

function readableAccentTextColor(color: RgbColor): RgbColor {
  const hsl = rgbToHsl(color)
  return hslToRgb({
    h: hsl.h,
    s: clampNumber(hsl.s * 1.22 + 0.10, 0.18, 0.82),
    l: clampNumber(hsl.l * 0.52 + 0.02, 0.16, 0.42)
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

function parseCssRgbColor(value: unknown): RgbColor | null {
  if (typeof value !== 'string') return null
  const parsed = parseCssColor(value)
  return parsed ? { r: parsed.r, g: parsed.g, b: parsed.b } : null
}

function amllLyricToneSet(seed: RgbColor): {
  active: RgbColor
  inactive: RgbColor
  subActive: RgbColor
  subInactive: RgbColor
  wash: RgbColor
} {
  const hsl = rgbToHsl(seed)
  const isLightBackground = relativeLuminance(seed) >= 0.56
  const tunedSaturation = clampNumber(hsl.s * 1.06 + 0.10, 0.30, 0.78)
  const activeLightness = isLightBackground
    ? clampNumber(hsl.l * 0.34, 0.18, 0.38)
    : clampNumber(hsl.l * 0.44 + 0.34, 0.42, 0.66)
  const active = hslToRgb({ h: hsl.h, s: tunedSaturation, l: activeLightness })
  const subActive = hslToRgb({
    h: hsl.h,
    s: clampNumber(tunedSaturation * 0.82, 0.22, 0.62),
    l: isLightBackground ? clampNumber(activeLightness + 0.06, 0.24, 0.44) : clampNumber(activeLightness + 0.08, 0.46, 0.72)
  })
  const wash = hslToRgb({
    h: hsl.h,
    s: clampNumber(tunedSaturation * 0.84, 0.16, 0.58),
    l: isLightBackground ? clampNumber(activeLightness * 0.74, 0.24, 0.40) : clampNumber(activeLightness * 0.56, 0.16, 0.30)
  })
  return {
    active,
    inactive: isLightBackground ? { r: 92, g: 92, b: 92 } : { r: 164, g: 164, b: 164 },
    subActive,
    subInactive: isLightBackground ? { r: 112, g: 112, b: 112 } : { r: 178, g: 178, b: 178 },
    wash
  }
}

function fullscreenLyricColorStyleFromTheme(themeStyle: React.CSSProperties, toneBlend = 0, toneSeed?: RgbColor | null): React.CSSProperties {
  const toneOne = parseCssRgbColor(themeStyle['--bk-bg-tone-1' as keyof React.CSSProperties])
  const toneTwo = parseCssRgbColor(themeStyle['--bk-bg-tone-2' as keyof React.CSSProperties])
  const primarySeed = toneOne ?? parseCssRgbColor(themeStyle['--cover-accent' as keyof React.CSSProperties]) ?? { r: 22, g: 128, b: 173 }
  const secondarySeed = toneOne && toneTwo
    ? toneTwo
    :
    parseCssRgbColor(themeStyle['--cover-accent-secondary' as keyof React.CSSProperties]) ??
    parseCssRgbColor(themeStyle['--bk-bg-tone-2' as keyof React.CSSProperties]) ??
    primarySeed
  const currentSeed = toneSeed ?? mixRgb(primarySeed, secondarySeed, toneBlend)
  const primary = amllLyricToneSet(primarySeed)
  const secondary = amllLyricToneSet(secondarySeed)
  const blended = amllLyricToneSet(currentSeed)
  return {
    '--amll-fullscreen-active-color': rgbaString(blended.active, 1),
    '--amll-fullscreen-inactive-color': rgbaString(blended.inactive, 0.72),
    '--amll-fullscreen-sub-active-color': rgbaString(blended.subActive, 1),
    '--amll-fullscreen-sub-inactive-color': rgbaString(blended.subInactive, 0.64),
    '--amll-fullscreen-bg-color': rgbaString(blended.wash, 0.18),
    '--amll-fullscreen-glow-color': rgbaString(blended.wash, 0),
    '--amll-fullscreen-active-color-a': rgbaString(primary.active, 1),
    '--amll-fullscreen-inactive-color-a': rgbaString(primary.inactive, 0.72),
    '--amll-fullscreen-sub-active-color-a': rgbaString(primary.subActive, 1),
    '--amll-fullscreen-sub-inactive-color-a': rgbaString(primary.subInactive, 0.64),
    '--amll-fullscreen-bg-color-a': rgbaString(primary.wash, 0.18),
    '--amll-fullscreen-glow-color-a': rgbaString(primary.wash, 0),
    '--amll-fullscreen-active-color-b': rgbaString(secondary.active, 1),
    '--amll-fullscreen-inactive-color-b': rgbaString(secondary.inactive, 0.72),
    '--amll-fullscreen-sub-active-color-b': rgbaString(secondary.subActive, 1),
    '--amll-fullscreen-sub-inactive-color-b': rgbaString(secondary.subInactive, 0.64),
    '--amll-fullscreen-bg-color-b': rgbaString(secondary.wash, 0.18),
    '--amll-fullscreen-glow-color-b': rgbaString(secondary.wash, 0),
    '--amll-side-active-color': rgbaString(blended.active, 0.98),
    '--amll-side-inactive-color': rgbaString(blended.inactive, 0.78),
    '--amll-side-active-color-a': rgbaString(primary.active, 0.98),
    '--amll-side-inactive-color-a': rgbaString(primary.inactive, 0.78),
    '--amll-side-active-color-b': rgbaString(secondary.active, 0.96),
    '--amll-side-inactive-color-b': rgbaString(secondary.inactive, 0.72)
  } as React.CSSProperties
}

function fullscreenLyricColorStyleFromBKTheme(themeStyle: React.CSSProperties, toneBlend = 0, toneSeed?: RgbColor | null): React.CSSProperties {
  const toneOne = parseCssRgbColor(themeStyle['--bk-bg-tone-1' as keyof React.CSSProperties])
  const toneTwo = parseCssRgbColor(themeStyle['--bk-bg-tone-2' as keyof React.CSSProperties])
  if (!toneOne || !toneTwo) return fullscreenLyricColorStyleFromTheme(themeStyle, toneBlend, toneSeed)
  const backgroundSeed = toneOne
  const secondarySeed = toneTwo
  const primary = amllLyricToneSet(backgroundSeed)
  const secondary = amllLyricToneSet(secondarySeed)
  const blended = amllLyricToneSet(toneSeed ?? mixRgb(backgroundSeed, secondarySeed, toneBlend))
  return {
    ...fullscreenLyricColorStyleFromTheme(themeStyle, toneBlend, toneSeed),
    '--amll-fullscreen-active-color': rgbaString(blended.active, 1),
    '--amll-fullscreen-inactive-color': rgbaString(blended.inactive, 0.72),
    '--amll-fullscreen-sub-active-color': rgbaString(blended.subActive, 1),
    '--amll-fullscreen-sub-inactive-color': rgbaString(blended.subInactive, 0.64),
    '--amll-fullscreen-bg-color': rgbaString(blended.wash, 0.18),
    '--amll-fullscreen-glow-color': rgbaString(blended.wash, 0),
    '--amll-fullscreen-active-color-a': rgbaString(primary.active, 1),
    '--amll-fullscreen-inactive-color-a': rgbaString(primary.inactive, 0.72),
    '--amll-fullscreen-sub-active-color-a': rgbaString(primary.subActive, 1),
    '--amll-fullscreen-sub-inactive-color-a': rgbaString(primary.subInactive, 0.64),
    '--amll-fullscreen-bg-color-a': rgbaString(primary.wash, 0.18),
    '--amll-fullscreen-glow-color-a': rgbaString(primary.wash, 0),
    '--amll-fullscreen-active-color-b': rgbaString(secondary.active, 1),
    '--amll-fullscreen-inactive-color-b': rgbaString(secondary.inactive, 0.72),
    '--amll-fullscreen-sub-active-color-b': rgbaString(secondary.subActive, 1),
    '--amll-fullscreen-sub-inactive-color-b': rgbaString(secondary.subInactive, 0.64),
    '--amll-fullscreen-bg-color-b': rgbaString(secondary.wash, 0.18),
    '--amll-fullscreen-glow-color-b': rgbaString(secondary.wash, 0)
  } as React.CSSProperties
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
      hsbCss(8, 0.20, 0.93, 0.78),
      hsbCss(205, 0.18, 0.95, 0.74),
      hsbCss(292, 0.17, 0.93, 0.70)
    ]
  }

  const primaryHue = firstHsl.h
  const accentHue = Math.abs(normalizeHue(secondHsl.h - primaryHue)) > 26 ? secondHsl.h : normalizeHue(primaryHue + 58)
  const baseSaturation = clampNumber(Math.max(firstHsl.s, secondHsl.s, thirdHsl.s) * 0.18 + 0.13, 0.18, 0.34)
  return [
    hsbCss(primaryHue + 4, baseSaturation, 0.94, 0.78),
    hsbCss(accentHue - 3, clampNumber(baseSaturation + 0.015, 0, 0.36), 0.95, 0.74),
    hsbCss(thirdHsl.h + 6, clampNumber(baseSaturation * 0.76, 0.16, 0.30), 0.93, 0.70)
  ]
}

function harmonizedDotTints(colors: RgbColor[]): [string, string, string] {
  const firstHsl = rgbToHsl(colors[0])
  const secondHsl = rgbToHsl(colors[1] ?? colors[0])
  const thirdHsl = rgbToHsl(colors[2] ?? colors[1] ?? colors[0])
  const avgS = (firstHsl.s + secondHsl.s + thirdHsl.s) / 3
  if (avgS < 0.18) {
    return [
      hsbCss(200, 0.22, 0.97, 0.82),
      hsbCss(204, 0.19, 0.98, 0.78),
      hsbCss(196, 0.17, 0.96, 0.74)
    ]
  }

  const baseSaturation = clampNumber(firstHsl.s * 0.24 + 0.16, 0.24, 0.42)
  return [
    hsbCss(firstHsl.h + 2, baseSaturation, 0.98, 0.82),
    hsbCss(firstHsl.h + 7, clampNumber(baseSaturation * 0.92, 0.20, 0.38), 0.98, 0.78),
    hsbCss(firstHsl.h - 5, clampNumber(baseSaturation * 0.80, 0.18, 0.34), 0.96, 0.74)
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

function darkenRgb(color: RgbColor, amount: number): RgbColor {
  return mixRgb(color, { r: 0, g: 0, b: 0 }, amount)
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
  const rawFirst = colors[0]
  const rawSecond = colors[1] ?? colors[0]
  const rawThird = colors[2] ?? colors[1] ?? colors[0]
  if (!rawFirst || !rawSecond || !rawThird) return fallback
  const first = daytimeThemeColor(rawFirst, 0)
  const second = daytimeThemeColor(rawSecond, 1)
  const third = daytimeThemeColor(rawThird, 2)
  const shapeTints = harmonizedShapeTints([first, second, third])
  const bkShapeTints = harmonizedBKShapeTints([first, second, third])
  const dotTints = harmonizedDotTints([first, second, third])
  const firstHsl = rgbToHsl(first)
  const secondHsl = rgbToHsl(second)
  const thirdHsl = rgbToHsl(third)
  const backgroundSaturation = clampNumber(Math.max(firstHsl.s, secondHsl.s) * 0.20 + 0.16, 0.24, 0.34)
  const overlaySaturation = clampNumber(Math.max(secondHsl.s, thirdHsl.s, firstHsl.s) * 0.22 + 0.17, 0.28, 0.40)

  return {
    ...fallback,
    '--cover-accent': rgbaString(first, 0.34),
    '--cover-accent-secondary': rgbaString(second, 0.34),
    '--cover-accent-border': rgbaString(first, 0.22),
    '--cover-accent-text': hexString(readableAccentTextColor(first)),
    '--cover-accent-shadow': rgbaString(first, 0.1),
    '--ambient-shape-1': shapeTints[0],
    '--ambient-shape-2': shapeTints[1],
    '--ambient-shape-3': shapeTints[2],
    '--bk-bg-tone-1': hsbCss(firstHsl.h, backgroundSaturation, 0.99, 0.98),
    '--bk-bg-tone-2': hsbCss(secondHsl.h + 4, overlaySaturation, 0.98, 0.94),
    '--bk-bg-tone-3': hsbCss(thirdHsl.h - 5, clampNumber(overlaySaturation + 0.015, 0, 0.40), 0.95, 0.86),
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
        boundaryOffset: ambientRange(random, -560, -340),
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
        boundaryOffset: ambientRange(random, 90, 240),
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
        boundaryOffset: largeCount > 2 ? ambientRange(random, -460, -260) : ambientRange(random, -260, -80),
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
      ? ambientRange(random, tier === 'large' || isUltra ? -520 : -260, tier === 'large' || isUltra ? -260 : -80)
      : ambientRange(random, tier === 'large' || isUltra ? 80 : -40, tier === 'large' || isUltra ? 260 : 180))

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

function sortedDetailTracks(tracks: HomeTrack[], sortKey: DetailSortKey, direction: SortDirection, snapshot: HomeSnapshot): HomeTrack[] {
  const directionFactor = direction === 'asc' ? 1 : -1
  const rankingByTrackId = new Map(snapshot.stats.ranking.map((item) => [item.trackId, item]))
  return tracks
    .map((track, index) => ({ track, index }))
    .sort((left, right) => {
      if (sortKey === 'albumOrder') return (left.index - right.index) * directionFactor
      if (sortKey === 'title') return (left.track.title.localeCompare(right.track.title, 'zh-Hans-CN') || left.index - right.index) * directionFactor
      if (sortKey === 'artist') return (left.track.artist.localeCompare(right.track.artist, 'zh-Hans-CN') || left.track.title.localeCompare(right.track.title, 'zh-Hans-CN') || left.index - right.index) * directionFactor
      if (sortKey === 'duration') return ((left.track.duration || 0) - (right.track.duration || 0) || left.index - right.index) * directionFactor
      if (sortKey === 'playCount') {
        const leftCount = rankingByTrackId.get(left.track.id)?.playCount ?? 0
        const rightCount = rankingByTrackId.get(right.track.id)?.playCount ?? 0
        return (leftCount - rightCount || left.index - right.index) * directionFactor
      }
      if (sortKey === 'favorite') {
        const leftScore = rankingByTrackId.get(left.track.id)?.score ?? 0
        const rightScore = rankingByTrackId.get(right.track.id)?.score ?? 0
        return (leftScore - rightScore || left.index - right.index) * directionFactor
      }
      return (left.index - right.index) * directionFactor
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
    return playlistArtworkFor(playlist)
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
  const shapeRefs = React.useRef(new Map<number, HTMLDivElement>())
  const specs = React.useMemo(() => makeAmbientShapeSpecs(makeAmbientSeed()), [])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let frame = 0
    let scrollSamplingFrame = 0
    let scrollIdleTimer = 0
    let isScrollSampling = false
    let scrollElement: HTMLElement | null = null
    let sidebarElement: HTMLElement | null = null
    let lyricsElement: HTMLElement | null = null
    let layoutMetrics: {
      width: number
      height: number
      viewportHeight: number
      virtualHeight: number
      centerMinX: number
      centerMaxX: number
      fluidProgress: number
      fluidBoundaryScale: number
      shapeScale: number
    } | null = null
    let loadedImages = new Map<string, HTMLImageElement>()
    const tintedUrlCache = new Map<string, string>()
    const resolvedColorCache = new Map<string, string>()
    const shapeStyleCache = new Map<number, { visible: boolean; side: number; opacity: number; transform: string }>()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resolveColor = (color: string): string => {
      const cached = resolvedColorCache.get(color)
      if (cached) return cached
      const variableMatch = color.match(/^var\((--[^)]+)\)$/)
      const resolved = variableMatch ? getComputedStyle(root).getPropertyValue(variableMatch[1]).trim() || color : color
      resolvedColorCache.set(color, resolved)
      return resolved
    }

    const tintedUrl = (asset: AmbientShapeAsset, color: string): string | null => {
      const image = loadedImages.get(asset.name)
      if (!image) return null
      const cacheKey = `${asset.name}|${color}`
      const cached = tintedUrlCache.get(cacheKey)
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
      const url = tintCanvas.toDataURL('image/png')
      tintedUrlCache.set(cacheKey, url)
      return url
    }

    const syncShapeImages = (): void => {
      for (const spec of specs) {
        const element = shapeRefs.current.get(spec.id)
        if (!element) continue
        const url = tintedUrl(spec.asset, resolveColor(spec.color))
        if (url) element.style.backgroundImage = `url("${url}")`
      }
    }

    const applyTransforms = (): void => {
      frame = 0
      if (!loadedImages.size) return
      const metrics = layoutMetrics
      if (!metrics) return
      const scrollTop = isActive ? (scrollElement?.scrollTop ?? 0) : 0

      for (const spec of specs) {
        const element = shapeRefs.current.get(spec.id)
        if (!element) continue
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
        const drawX = baseX + scrollX
        const drawY = baseY + scrollY
        const cached = shapeStyleCache.get(spec.id)
        if (drawX < -side || drawX > metrics.width + side || drawY < -side || drawY > metrics.height + side) {
          if (!cached || cached.visible) {
            element.style.visibility = 'hidden'
            shapeStyleCache.set(spec.id, {
              visible: false,
              side: cached?.side ?? 0,
              opacity: cached?.opacity ?? 0,
              transform: cached?.transform ?? ''
            })
          }
          continue
        }

        const transform = `translate3d(${drawX - side / 2}px, ${drawY - side / 2}px, 0) rotate(${rotation}deg)`
        if (!cached || !cached.visible) element.style.visibility = 'visible'
        if (!cached || Math.abs(cached.side - side) > 0.5) {
          const sidePx = `${side}px`
          element.style.width = sidePx
          element.style.height = sidePx
        }
        if (!cached || cached.opacity !== spec.opacity) element.style.opacity = String(spec.opacity)
        if (!cached || cached.transform !== transform) element.style.transform = transform
        shapeStyleCache.set(spec.id, {
          visible: true,
          side,
          opacity: spec.opacity,
          transform
        })
      }
    }

    const requestApply = (): void => {
      if (frame) return
      frame = window.requestAnimationFrame(applyTransforms)
    }

    const stopScrollSampling = (): void => {
      isScrollSampling = false
      if (scrollSamplingFrame) {
        window.cancelAnimationFrame(scrollSamplingFrame)
        scrollSamplingFrame = 0
      }
    }

    const sampleScrollWhileActive = (): void => {
      scrollSamplingFrame = 0
      if (!isScrollSampling) return
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      applyTransforms()
      scrollSamplingFrame = window.requestAnimationFrame(sampleScrollWhileActive)
    }

    const startScrollSampling = (): void => {
      if (!isActive || reducedMotion) {
        requestApply()
        return
      }
      isScrollSampling = true
      if (!scrollSamplingFrame) {
        scrollSamplingFrame = window.requestAnimationFrame(sampleScrollWhileActive)
      }
    }

    const updateLayoutMetrics = (): void => {
      const rootRect = root.getBoundingClientRect()
      if (rootRect.width <= 0 || rootRect.height <= 0) {
        layoutMetrics = null
        return
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
      shapeStyleCache.clear()
      requestApply()
    }

    const handleScroll = (): void => {
      startScrollSampling()
      if (scrollIdleTimer) window.clearTimeout(scrollIdleTimer)
      scrollIdleTimer = window.setTimeout(() => {
        scrollIdleTimer = 0
        stopScrollSampling()
        requestApply()
      }, 160)
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
      tintedUrlCache.clear()
      resolvedColorCache.clear()
      shapeStyleCache.clear()
      syncShapeImages()
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
        loadedImages = new Map(entries)
        syncShapeImages()
        requestApply()
      })
      .catch(() => {
        loadedImages = new Map()
      })

    bindScrollElement()
    const bindTimer = window.setTimeout(bindScrollElement, 80)

    return () => {
      window.clearTimeout(bindTimer)
      if (scrollIdleTimer) window.clearTimeout(scrollIdleTimer)
      stopScrollSampling()
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
      {specs.map((spec) => (
        <div
          className="home-ambient-shape"
          key={spec.id}
          ref={(element) => {
            if (element) {
              shapeRefs.current.set(spec.id, element)
            } else {
              shapeRefs.current.delete(spec.id)
            }
          }}
        />
      ))}
    </div>
  )
})

function App(): React.ReactElement {
  const [homeSnapshot, setHomeSnapshot] = React.useState<HomeSnapshot>(fallbackHomeSnapshot)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_SIDEBAR_WIDTH)
  const [viewportWidth, setViewportWidth] = React.useState(() => window.innerWidth)
  const [route, setRoute] = React.useState<AppRoute>({ name: 'home' })
  const [homeAmbientEpoch, setHomeAmbientEpoch] = React.useState(0)
  const [entryReveal, setEntryReveal] = React.useState<EntryRevealState>(null)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [settingsCategory, setSettingsCategory] = React.useState<SettingsCategoryKey>('appearance')
  const [nowPlayingSettingsTab, setNowPlayingSettingsTab] = React.useState<NowPlayingSettingsTab>('general')
  const [fullscreenSettingsTab, setFullscreenSettingsTab] = React.useState<NowPlayingSettingsTab>('general')
  const [globalArtworkTintEnabled, setGlobalArtworkTintEnabled] = React.useState(() => storedBoolean('globalArtworkTintEnabled', true))
  const [dockProgressVisible, setDockProgressVisible] = React.useState(() => storedBoolean('dockProgressVisible', true))
  const [followSystemAppearance, setFollowSystemAppearance] = React.useState(() => storedBoolean('followSystemAppearance', true))
  const [manualAppearance, setManualAppearance] = React.useState<ManualAppearanceMode>(() => storedString('manualAppearance', 'dark', ['light', 'dark']))
  const [isSystemDarkAppearance, setIsSystemDarkAppearance] = React.useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  ))
  const [lyricsBackgroundMode, setLyricsBackgroundMode] = React.useState<LyricsBackgroundMode>(() => storedString('lyricsBackgroundMode', 'sidebar', ['clear', 'sidebar']))
  const [homeCardMaterialMode, setHomeCardMaterialMode] = React.useState<HomeCardMaterialMode>(() => storedHomeCardMaterialMode())
  const [homeSectionOrder, setHomeSectionOrder] = React.useState<HomeSectionID[]>(() => storedHomeSectionOrder())
  const [selectedNowPlayingSkin, setSelectedNowPlayingSkin] = React.useState<NowPlayingSkinID>(() => storedNowPlayingSkin())
  const [isNowPlayingArtBackgroundEnabled, setIsNowPlayingArtBackgroundEnabled] = React.useState(() => storedBoolean('nowPlayingArtBackgroundEnabled', true))
  const [classicVisualizerMode, setClassicVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerMode())
  const [appleVisualizerMode, setAppleVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.appleStyle.visualizerMode', 'led'))
  const [rotatingVisualizerMode, setRotatingVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.rotatingCover.visualizerMode', 'off'))
  const [cassetteVisualizerMode, setCassetteVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.kmgcccCassette.visualizerMode', 'off'))
  const [isArtworkFrameMaskEnabled, setIsArtworkFrameMaskEnabled] = React.useState(() => storedBoolean('skin.classicLED.artworkFrameMaskEnabled', true))
  const [isArtworkBpmPulseEnabled, setIsArtworkBpmPulseEnabled] = React.useState(false)
  const [isRotatingCdMode, setIsRotatingCdMode] = React.useState(() => storedBoolean('skin.rotatingCover.cdMode', false))
  const [isAppleDynamicBackgroundEnabled, setIsAppleDynamicBackgroundEnabled] = React.useState(() => storedBoolean('skin.appleStyle.dynamicBackgroundEnabled', true))
  const [appleMeshSpeed, setAppleMeshSpeed] = React.useState<AppleMeshSpeed>(() => storedAppleMeshSpeed())
  const [isCassetteKmgLookEnabled, setIsCassetteKmgLookEnabled] = React.useState(() => storedBoolean('skin.kmgcccCassette.showKmgLook', false))
  const [lyricsRenderQuality, setLyricsRenderQuality] = React.useState<LyricsRenderQuality>(() => storedString('amllLyricsRenderQuality', 'balanced', ['performance', 'balanced', 'quality']))
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
  const [ledCutoffHz, setLedCutoffHz] = React.useState(() => storedNumber('ledCutoffHz', 2400))
  const [ledSpeed, setLedSpeed] = React.useState(() => storedNumber('ledSpeed', 1.15))
  const [ledValues, setLedValues] = React.useState<number[]>([])
  const [selectedFullscreenSkin, setSelectedFullscreenSkin] = React.useState<FullscreenSkinID>(() => storedString('fullscreenSkin', 'kmgccc.cassette', ['fullscreen.coverGradientBlur', 'coverLed', 'appleStyle', 'rotatingCover', 'kmgccc.cassette']))
  const [isFullscreenArtBackgroundEnabled, setIsFullscreenArtBackgroundEnabled] = React.useState(() => storedBoolean('fullscreenArtBackgroundEnabled', true))
  const [fullscreenClassicVisualizerMode, setFullscreenClassicVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.classicLED.fullscreen.visualizerMode', 'led'))
  const [fullscreenAppleVisualizerMode, setFullscreenAppleVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.appleStyle.fullscreen.visualizerMode', 'led'))
  const [fullscreenRotatingVisualizerMode, setFullscreenRotatingVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.rotatingCover.fullscreen.visualizerMode', 'off'))
  const [fullscreenCassetteVisualizerMode, setFullscreenCassetteVisualizerMode] = React.useState<VisualizerMode>(() => storedVisualizerModeForKey('skin.kmgcccCassette.fullscreen.visualizerMode', 'off'))
  const [coverGradientEdgeFillMode, setCoverGradientEdgeFillMode] = React.useState<CoverGradientEdgeFillMode>(() => storedString('skin.coverGradientBlur.edgeFillMode', 'pixelStretch', ['pixelStretch', 'mirroredCover']))
  const [coverGradientBlurRadius, setCoverGradientBlurRadius] = React.useState(() => clampNumber(storedNumber('skin.coverGradientBlur.maxBlurRadius', 1600), 100, 2500))
  const [fullscreenLyricsRenderQuality, setFullscreenLyricsRenderQuality] = React.useState<LyricsRenderQuality>(() => storedString('fullscreen.amllLyricsRenderQuality', 'balanced', ['performance', 'balanced', 'quality']))
  const [fullscreenDiscreteWordHighlightEnabled, setFullscreenDiscreteWordHighlightEnabled] = React.useState(() => storedBoolean('fullscreen.amllDiscreteWordHighlightEnabled', false))
  const [fullscreenLyricsFontSize, setFullscreenLyricsFontSize] = React.useState(() => clampNumber(storedNumber('fullscreen.lyricsFontSize', 30), 16, 56))
  const [fullscreenLyricsTranslationFontSize, setFullscreenLyricsTranslationFontSize] = React.useState(() => clampNumber(storedNumber('fullscreen.lyricsTranslationFontSize', 18), 12, 40))
  const [fullscreenLyricsGlobalAdvanceMs, setFullscreenLyricsGlobalAdvanceMs] = React.useState(() => clampNumber(storedNumber('fullscreen.lyricsGlobalAdvanceMs', 0), -1000, 1000))
  const [lookaheadMs, setLookaheadMs] = React.useState(() => clampNumber(storedNumber('lookaheadMs', 200), 0, 200))
  const [deferImportEnrichment, setDeferImportEnrichment] = React.useState(() => storedBoolean('deferImportEnrichment', false))
  const [telemetryEnabled, setTelemetryEnabled] = React.useState(() => storedBoolean('telemetry.anonymousUsageEnabled', false))
  const [libraryLocationInfo, setLibraryLocationInfo] = React.useState<LibraryLocationInfo | null>(null)
  const [settingsActionStatus, setSettingsActionStatus] = React.useState<SettingsActionStatus>(null)
  const [detailSortKey, setDetailSortKey] = React.useState<DetailSortKey>('albumOrder')
  const [detailSortDirection, setDetailSortDirection] = React.useState<SortDirection>('asc')
  const [isMultiSelectMode, setIsMultiSelectMode] = React.useState(false)
  const [selectedTrackIds, setSelectedTrackIds] = React.useState<Set<string>>(() => new Set())
  const [artworkFrameIndex, setArtworkFrameIndex] = React.useState(0)
  const [trackBeatById, setTrackBeatById] = React.useState<Record<string, ArtworkBeat>>({})
  const [approvedArtworkBeatById, setApprovedArtworkBeatById] = React.useState<Record<string, ArtworkBeat>>(() => storedApprovedArtworkBeats())
  const [manualBpmBoard, setManualBpmBoard] = React.useState<ManualBpmBoardState | null>(null)
  const [artworkBeatSaveFeedback, setArtworkBeatSaveFeedback] = React.useState<ArtworkBeatSaveFeedback>(null)
  const [isLyricsSidebarOpen, setIsLyricsSidebarOpen] = React.useState(false)
  const [lyricsSidebarWidth, setLyricsSidebarWidth] = React.useState(460)
  const [isFullscreenLyricsOpen, setIsFullscreenLyricsOpen] = React.useState(false)
  const [lyricToneSeed, setLyricToneSeed] = React.useState<RgbColor | null>(null)
  const [currentId, setCurrentId] = React.useState(fallbackHomeSnapshot.heroTrack?.id ?? fallbackHomeSnapshot.tracks[0]?.id ?? '')
  const [playbackQueueIds, setPlaybackQueueIds] = React.useState<string[]>(() => fallbackHomeSnapshot.tracks.map((track) => track.id))
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [playbackSource, setPlaybackSource] = React.useState<PlaybackSourceKind>('local')
  const [externalPlaybackMode, setExternalPlaybackMode] = React.useState<ExternalPlaybackSourceMode>('thirdParty')
  const [externalPlaybackSnapshot, setExternalPlaybackSnapshot] = React.useState<ExternalPlaybackSnapshot | null>(null)
  const [externalLyricsByKey, setExternalLyricsByKey] = React.useState<Record<string, ExternalLyricsCacheEntry>>(() => storedExternalLyricsCache())
  const [externalArtworkByKey, setExternalArtworkByKey] = React.useState<Record<string, ExternalArtworkCacheEntry>>(() => storedExternalArtworkCache())
  const [systemPlatform, setSystemPlatform] = React.useState<NodeJS.Platform | null>(null)
  const [isShuffleEnabled, setIsShuffleEnabled] = React.useState(false)
  const [volume, setVolume] = React.useState(0.72)
  const [playbackTime, setPlaybackTime] = React.useState(0)
  const [playbackDuration, setPlaybackDuration] = React.useState(0)
  const [importSyncState, setImportSyncState] = React.useState<ImportSyncState | null>(null)
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(null)
  const [libraryDialog, setLibraryDialog] = React.useState<LibraryDialogState | null>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const audioSourceRef = React.useRef<MediaElementAudioSourceNode | null>(null)
  const audioAnalyserRef = React.useRef<AnalyserNode | null>(null)
  const beatCacheRef = React.useRef<Record<string, ArtworkBeat>>({})
  const artworkPulseFrameRef = React.useRef<number | null>(null)
  const artworkPulseLastBeatRef = React.useRef<number | null>(null)
  const ledAnimationFrameRef = React.useRef<number | null>(null)
  const smoothedLedValuesRef = React.useRef<number[]>([])
  const lastPlaybackTimeRef = React.useRef(0)
  const playbackTimeRef = React.useRef(0)
  const externalPlaybackClockRef = React.useRef<ExternalPlaybackClock>({ key: '', currentTime: 0, updatedAt: 0 })
  const tapeDeviceConnectedRef = React.useRef<boolean | null>(null)
  const selectedNowPlayingSkinRef = React.useRef<NowPlayingSkinID>(selectedNowPlayingSkin)
  const selectedFullscreenSkinRef = React.useRef<FullscreenSkinID>(selectedFullscreenSkin)
  const previousTapeNowPlayingSkinRef = React.useRef<NowPlayingSkinID | null>(null)
  const previousTapeFullscreenSkinRef = React.useRef<FullscreenSkinID | null>(null)
  const loadedAudioTrackRef = React.useRef<string>('')
  const previousRouteNameRef = React.useRef<AppRoute['name']>('home')
  const previousEntryTargetRef = React.useRef<EntryRevealTarget | 'other'>('home')
  const entryRevealTimersRef = React.useRef<number[]>([])
  const albums = React.useMemo(() => albumById(homeSnapshot), [homeSnapshot])
  const currentTrack = React.useMemo(
    () => homeSnapshot.tracks.find((track) => track.id === currentId) ?? homeSnapshot.heroTrack ?? homeSnapshot.tracks[0],
    [currentId, homeSnapshot]
  )
  const externalPlaybackKey = React.useMemo(() => externalTrackKey(externalPlaybackSnapshot), [externalPlaybackSnapshot])

  React.useEffect(() => {
    persistJsonSetting(EXTERNAL_LYRICS_CACHE_STORAGE_KEY, sanitizeExternalLyricsCache(externalLyricsByKey))
  }, [externalLyricsByKey])

  React.useEffect(() => {
    persistJsonSetting(EXTERNAL_ARTWORK_CACHE_STORAGE_KEY, sanitizeExternalArtworkCache(externalArtworkByKey))
  }, [externalArtworkByKey])

  React.useEffect(() => {
    selectedNowPlayingSkinRef.current = selectedNowPlayingSkin
  }, [selectedNowPlayingSkin])

  React.useEffect(() => {
    selectedFullscreenSkinRef.current = selectedFullscreenSkin
  }, [selectedFullscreenSkin])

  React.useEffect(() => {
    if (!window.kmgccc?.getTapeDevicePresence) return
    let cancelled = false
    let timeoutId: number | null = null
    const checkTapeDevice = async (): Promise<void> => {
      const snapshot = await window.kmgccc?.getTapeDevicePresence?.()
      if (cancelled || !snapshot) return
      const wasConnected = tapeDeviceConnectedRef.current
      tapeDeviceConnectedRef.current = snapshot.connected
      if (snapshot.connected && wasConnected !== true) {
        previousTapeNowPlayingSkinRef.current = selectedNowPlayingSkinRef.current
        previousTapeFullscreenSkinRef.current = selectedFullscreenSkinRef.current
        setSelectedNowPlayingSkin('kmgccc.cassette')
        setSelectedFullscreenSkin('kmgccc.cassette')
        return
      }
      if (!snapshot.connected && wasConnected === true) {
        if (previousTapeNowPlayingSkinRef.current) setSelectedNowPlayingSkin(previousTapeNowPlayingSkinRef.current)
        if (previousTapeFullscreenSkinRef.current) setSelectedFullscreenSkin(previousTapeFullscreenSkinRef.current)
        previousTapeNowPlayingSkinRef.current = null
        previousTapeFullscreenSkinRef.current = null
      }
      timeoutId = window.setTimeout(() => {
        void checkTapeDevice()
      }, snapshot.connected ? 4000 : 1000)
    }
    void checkTapeDevice()
    return () => {
      cancelled = true
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }
  }, [])

  const externalDisplayTrack = React.useMemo<Track | null>(() => {
    const snapshot = externalPlaybackSnapshot
    if (!snapshot) return null
    const artist = snapshot.artist.trim() || '未知艺人'
    const album = snapshot.album?.trim() || '外部播放'
    const ownerKey = snapshot.sourceAppUserModelId || snapshot.sourceMode
    const lyrics = externalLyricsByKey[externalPlaybackKey]
    const artwork = externalArtworkByKey[externalPlaybackKey]
    const title = snapshot.title.trim() || (() => {
      switch (snapshot.connectionState) {
        case 'connectedNoMetadata':
          return '等待媒体信息'
        case 'disconnected':
          return '未检测到外部播放'
        case 'unavailable':
          return '外部播放暂不可用'
        case 'runningHasData':
        default:
          return '外部播放'
      }
    })()
    const duration = snapshot.duration > 0 ? snapshot.duration : 12 * 60
    const artworkUrl = artwork?.artworkUrl || snapshot.artworkUrl
    return {
      id: externalPlaybackKey ? `external-${externalPlaybackKey}` : `external-${ownerKey}-${title}-${artist}`,
      title,
      artist,
      artistId: `external-artist-${artist}`,
      album,
      albumId: `external-album-${album}`,
      duration,
      artworkUrl,
      sourcePath: '',
      sourceUrl: snapshot.audioSourceUrl ?? '',
      lyricsText: lyrics?.lyricsText,
      syncedLyrics: lyrics?.syncedLyrics,
      metadataSource: 'externalPlayback'
    }
  }, [externalArtworkByKey, externalLyricsByKey, externalPlaybackKey, externalPlaybackSnapshot])
  const displayTrack = playbackSource === 'external' ? externalDisplayTrack : currentTrack
  const isExternalPlaybackSupported = systemPlatform === 'win32'
  const currentTrackHasTimedLyrics = React.useMemo(() => trackHasTimedLyrics(displayTrack), [displayTrack])
  React.useEffect(() => {
    if (!isMultiSelectMode) setSelectedTrackIds(new Set())
  }, [isMultiSelectMode])
  const playbackQueue = React.useMemo(() => {
    const queueTracks = playbackQueueIds
      .map((id) => homeSnapshot.tracks.find((track) => track.id === id))
      .filter((track): track is HomeTrack => Boolean(track))
    return queueTracks.length ? queueTracks : homeSnapshot.tracks
  }, [homeSnapshot.tracks, playbackQueueIds])
  const displayedPlaybackQueue = React.useMemo(() => (
    playbackSource === 'external' && displayTrack ? [displayTrack] : playbackQueue
  ), [displayTrack, playbackQueue, playbackSource])
  const fallbackCoverThemeStyle = React.useMemo(() => coverThemeFor(displayTrack, albums), [albums, displayTrack])
  const currentArtworkUrl = React.useMemo(() => displayTrack ? trackArtwork(displayTrack, albums) : '', [albums, displayTrack])
  const [coverThemeStyle, setCoverThemeStyle] = React.useState<React.CSSProperties>(fallbackCoverThemeStyle)
  const effectiveCoverThemeStyle = globalArtworkTintEnabled ? coverThemeStyle : coverThemeFor(null, albums)
  const effectiveAppearance = followSystemAppearance ? (isSystemDarkAppearance ? 'dark' : 'light') : manualAppearance
  const lyricColorStyle = React.useMemo(() => fullscreenLyricColorStyleFromTheme(effectiveCoverThemeStyle, 0, lyricToneSeed), [effectiveCoverThemeStyle, lyricToneSeed])
  const lyricFontStyle = React.useMemo(() => ({
    '--lyrics-main-font-family': cssFontFamily(lyricsFontNameZh, lyricsFontNameEn),
    '--lyrics-english-font-family': cssFontFamily(lyricsFontNameEn),
    '--lyrics-translation-font-family': cssFontFamily(lyricsTranslationFontName),
    '--lyrics-main-font-weight': String(effectiveAppearance === 'light' ? lyricsFontWeightLight : lyricsFontWeightDark),
    '--lyrics-translation-font-weight': String(effectiveAppearance === 'light' ? lyricsTranslationFontWeightLight : lyricsTranslationFontWeightDark)
  }) as React.CSSProperties, [effectiveAppearance, lyricsFontNameEn, lyricsFontNameZh, lyricsFontWeightDark, lyricsFontWeightLight, lyricsTranslationFontName, lyricsTranslationFontWeightDark, lyricsTranslationFontWeightLight])
  const desktopStyle = React.useMemo(() => ({
    ...effectiveCoverThemeStyle,
    ...lyricColorStyle,
    ...lyricFontStyle,
    '--lyrics-font-size': `${lyricsFontSize}px`,
    '--lyrics-translation-font-size': `${lyricsTranslationFontSize}px`,
    '--amll-render-scale': String(lyricRenderScaleForQuality(lyricsRenderQuality))
  }) as React.CSSProperties, [effectiveCoverThemeStyle, lyricColorStyle, lyricFontStyle, lyricsFontSize, lyricsRenderQuality, lyricsTranslationFontSize])
  const fullscreenCoverThemeStyle = React.useMemo(() => ({
    ...effectiveCoverThemeStyle,
    ...lyricColorStyle,
    ...lyricFontStyle,
    '--lyrics-font-size': `${fullscreenLyricsFontSize}px`,
    '--lyrics-translation-font-size': `${fullscreenLyricsTranslationFontSize}px`,
    '--amll-render-scale': String(lyricRenderScaleForQuality(fullscreenLyricsRenderQuality))
  }) as React.CSSProperties, [effectiveCoverThemeStyle, fullscreenLyricsFontSize, fullscreenLyricsRenderQuality, fullscreenLyricsTranslationFontSize, lyricColorStyle, lyricFontStyle])
  const selectedVisualizerMode = selectedNowPlayingSkin === 'coverLed'
    ? classicVisualizerMode
    : selectedNowPlayingSkin === 'appleStyle'
      ? appleVisualizerMode
      : selectedNowPlayingSkin === 'rotatingCover'
        ? rotatingVisualizerMode
        : cassetteVisualizerMode
  const selectedFullscreenVisualizerMode = selectedFullscreenSkin === 'coverLed'
    ? fullscreenClassicVisualizerMode
    : selectedFullscreenSkin === 'appleStyle'
      ? fullscreenAppleVisualizerMode
      : selectedFullscreenSkin === 'rotatingCover'
        ? fullscreenRotatingVisualizerMode
        : selectedFullscreenSkin === 'kmgccc.cassette'
          ? fullscreenCassetteVisualizerMode
          : 'off'
  const toolbarSortKey = detailSortKey === 'albumOrder' && !(route.name === 'albumDetail' && route.id !== 'all-albums') ? 'importedAt' : detailSortKey
  const ensureAudioAnalyser = React.useCallback((): AnalyserNode | null => {
    const audio = audioRef.current
    if (!audio) return null
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return null
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor()
    }
    const context = audioContextRef.current
    if (!audioAnalyserRef.current) {
      const analyser = context.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.62
      audioAnalyserRef.current = analyser
    }
    if (!audioSourceRef.current) {
      audioSourceRef.current = context.createMediaElementSource(audio)
      audioSourceRef.current.connect(audioAnalyserRef.current)
      audioAnalyserRef.current.connect(context.destination)
    }
    return audioAnalyserRef.current
  }, [])
  const analyzeArtworkBeat = React.useCallback(async (track: Track, approvedBeat?: ArtworkBeat, onCandidate?: (beat: ArtworkBeat) => void): Promise<ArtworkBeat> => {
    if (!track.sourceUrl) throw new Error('Track sourceUrl is empty')
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) throw new Error('AudioContext is not available')
    if (!audioContextRef.current) audioContextRef.current = new AudioContextCtor()
    const context = audioContextRef.current
    const response = await fetch(track.sourceUrl)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0))
    const durations = Array.from(new Set(
      [12, 20, 32, 48, Math.min(audioBuffer.duration, 72)]
        .filter((duration) => duration > 4 && duration <= audioBuffer.duration)
        .map((duration) => Math.round(duration * 10) / 10)
    ))
    if (!durations.length) durations.push(audioBuffer.duration)
    let bestBeat: ArtworkBeat | null = approvedBeat ?? null
    let previousBeat: ArtworkBeat | null = null
    let stableBeat: ArtworkBeat | null = null
    let stableCount = 0
    for (const duration of durations) {
      const result = await guess(audioBuffer, 0, duration, { minTempo: 45, maxTempo: 260 })
      const beat = {
        bpm: normalizeArtworkPulseBpm(result.bpm),
        offset: clampNumber(result.offset || 0, 0, Math.max(0, audioBuffer.duration))
      }
      if (approvedBeat && Math.abs(beat.bpm - approvedBeat.bpm) > ARTWORK_BPM_ACCEPTANCE_RANGE) {
        continue
      }
      bestBeat = beat
      if (!previousBeat) {
        onCandidate?.(beat)
        stableCount = 1
        previousBeat = beat
        continue
      }
      if (Math.abs(previousBeat.bpm - beat.bpm) <= 1) {
        stableCount += 1
        onCandidate?.(beat)
      } else {
        stableCount = 1
      }
      previousBeat = beat
      if (stableCount >= 2) {
        stableBeat = beat
        break
      }
    }
    return stableBeat ?? bestBeat ?? { bpm: 96, offset: 0 }
  }, [])
  const lyricPlaybackOffsetSeconds = (lyricsGlobalAdvanceMs + lookaheadMs) / 1000
  const effectiveLyricPlaybackTime = Math.max(0, playbackTime + lyricPlaybackOffsetSeconds)
  const lyricsWidth = isLyricsSidebarOpen ? lyricsSidebarWidth : 0
  const adaptiveSidebarWidth = React.useMemo(() => {
    if (isFullscreenLyricsOpen) return Math.max(sidebarWidth, DEFAULT_SIDEBAR_WIDTH)
    if (isSidebarCollapsed) return COLLAPSED_SIDEBAR_WIDTH
    const contentTargetWidth = isLyricsSidebarOpen ? 760 : 820
    const availableSidebarWidth = viewportWidth - lyricsWidth - contentTargetWidth
    if (availableSidebarWidth < 180) return COLLAPSED_SIDEBAR_WIDTH
    return clampNumber(Math.min(sidebarWidth, availableSidebarWidth), 180, sidebarWidth)
  }, [isFullscreenLyricsOpen, isLyricsSidebarOpen, isSidebarCollapsed, lyricsWidth, sidebarWidth, viewportWidth])
  const isSidebarVisuallyCollapsed = !isFullscreenLyricsOpen && (isSidebarCollapsed || adaptiveSidebarWidth <= 118)
  const openContextMenu = React.useCallback((event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - 230),
      y: Math.min(event.clientY, window.innerHeight - 260),
      items
    })
  }, [])
  const openSortMenu = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    const isAlbumDetail = route.name === 'albumDetail' && route.id !== 'all-albums'
    const currentSortKey = detailSortKey === 'albumOrder' && !isAlbumDetail ? 'importedAt' : detailSortKey
    const sortKeys: DetailSortKey[] = ['importedAt', 'addedAt', ...(isAlbumDetail ? ['albumOrder' as const] : []), 'title', 'artist', 'duration', 'playCount', 'favorite']
    const items: ContextMenuItem[] = [
      ...sortKeys.map((key) => ({
        label: `${currentSortKey === key ? '✓ ' : ''}${detailSortLabels[key]}`,
        onSelect: () => setDetailSortKey(key)
      })),
      { label: '-', onSelect: () => {} },
      { label: `${detailSortDirection === 'asc' ? '✓ ' : ''}升序`, onSelect: () => setDetailSortDirection('asc') },
      { label: `${detailSortDirection === 'desc' ? '✓ ' : ''}降序`, onSelect: () => setDetailSortDirection('desc') }
    ]
    setContextMenu({
      x: Math.min(rect.left, window.innerWidth - 230),
      y: Math.min(rect.bottom + 8, window.innerHeight - 260),
      items
    })
  }, [detailSortDirection, detailSortKey, route])

  React.useEffect(() => {
    playbackTimeRef.current = playbackTime
  }, [playbackTime])

  React.useEffect(() => {
    for (const source of artworkFrameAssets) {
      const image = new Image()
      image.decoding = 'async'
      image.src = source
      void image.decode?.().catch(() => undefined)
    }
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
    if (!displayTrack || !currentArtworkUrl) return

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
  }, [currentArtworkUrl, displayTrack, fallbackCoverThemeStyle])

  React.useEffect(() => {
    if (!isArtworkBpmPulseEnabled || !isPlaying || !displayTrack?.id) {
      return
    }
    const detectionTrackId = displayTrack.id
    if (beatCacheRef.current[detectionTrackId]) return
    const approvedBeat = approvedArtworkBeatById[detectionTrackId]
    if (!displayTrack.sourceUrl) {
      if (approvedBeat) {
        beatCacheRef.current = { ...beatCacheRef.current, [detectionTrackId]: approvedBeat }
        setTrackBeatById((previous) => ({ ...previous, [detectionTrackId]: approvedBeat }))
      }
      return
    }
    let cancelled = false
    void analyzeArtworkBeat(displayTrack, approvedBeat, (candidate) => {
      if (cancelled || beatCacheRef.current[detectionTrackId]) return
      setTrackBeatById((previous) => ({ ...previous, [detectionTrackId]: candidate }))
    })
      .then((beat) => {
        if (cancelled) return
        beatCacheRef.current = { ...beatCacheRef.current, [detectionTrackId]: beat }
        setTrackBeatById((previous) => ({ ...previous, [detectionTrackId]: beat }))
      })
      .catch(() => {
        if (cancelled) return
        const fallbackBeat = { bpm: 96, offset: audioRef.current?.currentTime ?? 0 }
        beatCacheRef.current = { ...beatCacheRef.current, [detectionTrackId]: fallbackBeat }
        setTrackBeatById((previous) => ({ ...previous, [detectionTrackId]: fallbackBeat }))
      })
    return () => {
      cancelled = true
    }
  }, [analyzeArtworkBeat, approvedArtworkBeatById, displayTrack, displayTrack?.id, displayTrack?.sourceUrl, isArtworkBpmPulseEnabled, isPlaying])

  React.useEffect(() => {
    const beat = displayTrack?.id ? trackBeatById[displayTrack.id] : null
    if (!isArtworkBpmPulseEnabled || !isPlaying || !beat) {
      artworkPulseLastBeatRef.current = null
      if (artworkPulseFrameRef.current !== null) {
        window.cancelAnimationFrame(artworkPulseFrameRef.current)
        artworkPulseFrameRef.current = null
      }
      return
    }
    const beatSeconds = 60 / beat.bpm
    const tick = (): void => {
      const baseTime = playbackSource === 'external'
        ? playbackTimeRef.current
        : audioRef.current?.currentTime ?? playbackTimeRef.current
      const time = baseTime + ARTWORK_PULSE_VISUAL_ADVANCE_SECONDS
      const beatIndex = Math.floor(Math.max(0, time - beat.offset) / beatSeconds)
      if (artworkPulseLastBeatRef.current !== beatIndex) {
        artworkPulseLastBeatRef.current = beatIndex
        setArtworkFrameIndex((value) => (value + 1) % artworkFrameAssets.length)
      }
      artworkPulseFrameRef.current = window.requestAnimationFrame(tick)
    }
    artworkPulseFrameRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (artworkPulseFrameRef.current !== null) {
        window.cancelAnimationFrame(artworkPulseFrameRef.current)
        artworkPulseFrameRef.current = null
      }
      artworkPulseLastBeatRef.current = null
    }
  }, [displayTrack?.id, isArtworkBpmPulseEnabled, isPlaying, playbackSource, trackBeatById])

  React.useEffect(() => {
    persistSetting('globalArtworkTintEnabled', globalArtworkTintEnabled)
  }, [globalArtworkTintEnabled])

  React.useEffect(() => {
    persistSetting('dockProgressVisible', dockProgressVisible)
  }, [dockProgressVisible])

  React.useEffect(() => {
    persistSetting('followSystemAppearance', followSystemAppearance)
  }, [followSystemAppearance])

  React.useEffect(() => {
    persistSetting('manualAppearance', manualAppearance)
  }, [manualAppearance])

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (): void => setIsSystemDarkAppearance(media.matches)
    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  React.useEffect(() => {
    persistSetting('lyricsBackgroundMode', lyricsBackgroundMode)
  }, [lyricsBackgroundMode])

  React.useEffect(() => {
    persistSetting('homeCardMaterialMode', homeCardMaterialMode)
  }, [homeCardMaterialMode])

  React.useEffect(() => {
    persistJsonSetting('homeSectionOrder', homeSectionOrder)
  }, [homeSectionOrder])

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
    persistSetting('fullscreenSkin', selectedFullscreenSkin)
  }, [selectedFullscreenSkin])

  React.useEffect(() => {
    persistSetting('fullscreenArtBackgroundEnabled', isFullscreenArtBackgroundEnabled)
  }, [isFullscreenArtBackgroundEnabled])

  React.useEffect(() => {
    persistSetting('skin.classicLED.fullscreen.visualizerMode', fullscreenClassicVisualizerMode)
  }, [fullscreenClassicVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.appleStyle.fullscreen.visualizerMode', fullscreenAppleVisualizerMode)
  }, [fullscreenAppleVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.rotatingCover.fullscreen.visualizerMode', fullscreenRotatingVisualizerMode)
  }, [fullscreenRotatingVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.kmgcccCassette.fullscreen.visualizerMode', fullscreenCassetteVisualizerMode)
  }, [fullscreenCassetteVisualizerMode])

  React.useEffect(() => {
    persistSetting('skin.coverGradientBlur.edgeFillMode', coverGradientEdgeFillMode)
  }, [coverGradientEdgeFillMode])

  React.useEffect(() => {
    persistSetting('skin.coverGradientBlur.maxBlurRadius', coverGradientBlurRadius)
  }, [coverGradientBlurRadius])

  React.useEffect(() => {
    persistSetting('fullscreen.amllLyricsRenderQuality', fullscreenLyricsRenderQuality)
  }, [fullscreenLyricsRenderQuality])

  React.useEffect(() => {
    persistSetting('fullscreen.amllDiscreteWordHighlightEnabled', fullscreenDiscreteWordHighlightEnabled)
  }, [fullscreenDiscreteWordHighlightEnabled])

  React.useEffect(() => {
    persistSetting('fullscreen.lyricsFontSize', fullscreenLyricsFontSize)
  }, [fullscreenLyricsFontSize])

  React.useEffect(() => {
    persistSetting('fullscreen.lyricsTranslationFontSize', fullscreenLyricsTranslationFontSize)
  }, [fullscreenLyricsTranslationFontSize])

  React.useEffect(() => {
    persistSetting('fullscreen.lyricsGlobalAdvanceMs', fullscreenLyricsGlobalAdvanceMs)
  }, [fullscreenLyricsGlobalAdvanceMs])

  React.useEffect(() => {
    persistSetting('lookaheadMs', lookaheadMs)
  }, [lookaheadMs])

  React.useEffect(() => {
    persistSetting('deferImportEnrichment', deferImportEnrichment)
  }, [deferImportEnrichment])

  React.useEffect(() => {
    persistSetting('telemetry.anonymousUsageEnabled', telemetryEnabled)
  }, [telemetryEnabled])

  React.useEffect(() => {
    window.kmgccc?.getLibraryLocation().then((info) => {
      if (info) setLibraryLocationInfo(info)
    }).catch(() => {})
  }, [])

  React.useEffect(() => {
    let cancelled = false
    window.kmgccc?.getSystemPlatform?.()
      .then((platform) => {
        if (!cancelled) setSystemPlatform(platform)
      })
      .catch(() => {
        if (!cancelled) setSystemPlatform(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (systemPlatform && systemPlatform !== 'win32' && playbackSource === 'external') {
      setPlaybackSource('local')
      setExternalPlaybackSnapshot(null)
      setIsPlaying(false)
    }
  }, [playbackSource, systemPlatform])

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

  const writeMiniProgressRatio = React.useCallback((seconds: number, duration: number) => {
    const ratio = duration > 0 ? clampNumber(seconds / duration, 0, 1) : 0
    const miniPlayer = document.querySelector<HTMLElement>('.mini-player')
    miniPlayer?.style.setProperty('--mini-player-progress-ratio', String(ratio))
    miniPlayer?.style.setProperty('--mini-player-progress-width', `${ratio * 100}%`)
  }, [])
  React.useEffect(() => {
    if (playbackSource !== 'external') return
    let cancelled = false
    const poll = async (): Promise<void> => {
      if (!window.kmgccc?.getExternalPlaybackSnapshot) return
      const snapshot = await window.kmgccc.getExternalPlaybackSnapshot(externalPlaybackMode)
      if (cancelled) return
      const key = externalTrackKey(snapshot)
      const now = Date.now()
      let currentTime = snapshot.currentTime
      let duration = snapshot.duration
      if (snapshot.available && key) {
        const previousClock = externalPlaybackClockRef.current
        const smtcTime = Number.isFinite(snapshot.currentTime) && snapshot.currentTime > 0 ? snapshot.currentTime : 0
        const hasTimelinePosition = snapshot.canSeek || smtcTime > 0
        const effectiveDuration = duration > 0 ? duration : EXTERNAL_PLAYBACK_FALLBACK_DURATION_SECONDS
        if (previousClock.key !== key) {
          externalPlaybackClockRef.current = { key, currentTime: hasTimelinePosition ? clampNumber(smtcTime, 0, effectiveDuration) : 0, updatedAt: now }
        } else if (snapshot.isPlaying) {
          const elapsedSeconds = Math.max(0, (now - previousClock.updatedAt) / 1000)
          const predictedTime = clampNumber(previousClock.currentTime + elapsedSeconds, 0, effectiveDuration)
          const driftSeconds = smtcTime - predictedTime
          const shouldSnapToSmtc = hasTimelinePosition && (
            Math.abs(driftSeconds) > EXTERNAL_PLAYBACK_CLOCK_SNAP_SECONDS ||
            (smtcTime < 1 && predictedTime > EXTERNAL_PLAYBACK_CLOCK_SNAP_SECONDS)
          )
          externalPlaybackClockRef.current = {
            key,
            currentTime: shouldSnapToSmtc ? clampNumber(smtcTime, 0, effectiveDuration) : predictedTime,
            updatedAt: now
          }
        } else {
          externalPlaybackClockRef.current = {
            key,
            currentTime: hasTimelinePosition ? clampNumber(smtcTime, 0, effectiveDuration) : previousClock.currentTime,
            updatedAt: now
          }
        }
        currentTime = externalPlaybackClockRef.current.currentTime
        duration = effectiveDuration
      } else {
        externalPlaybackClockRef.current = { key: '', currentTime: 0, updatedAt: now }
      }
      const normalizedSnapshot = { ...snapshot, currentTime, duration }
      setExternalPlaybackSnapshot(normalizedSnapshot)
      setIsPlaying(normalizedSnapshot.isPlaying)
      setPlaybackTime(normalizedSnapshot.currentTime)
      setPlaybackDuration(normalizedSnapshot.duration)
      writeMiniProgressRatio(normalizedSnapshot.currentTime, normalizedSnapshot.duration)
    }
    void poll()
    const interval = window.setInterval(() => { void poll() }, 700)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [externalPlaybackMode, playbackSource, writeMiniProgressRatio])

  React.useEffect(() => {
    if (playbackSource !== 'external') return
    let cancelled = false
    const poll = async (): Promise<void> => {
      const snapshot = await window.kmgccc?.getExternalPlaybackVolume?.()
      if (cancelled || !snapshot?.available) return
      setVolume(clampNumber(snapshot.muted ? 0 : snapshot.volume, 0, 1))
    }
    void poll()
    const interval = window.setInterval(() => { void poll() }, 2500)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [playbackSource, externalPlaybackMode])

  React.useEffect(() => {
    if (playbackSource !== 'external') return
    if (!externalPlaybackSnapshot?.available || !externalPlaybackSnapshot.isPlaying) return
    if (!currentTrackHasTimedLyrics || (!isLyricsSidebarOpen && !isFullscreenLyricsOpen)) return
    const key = externalPlaybackKey
    if (!key) return
    const duration = externalPlaybackSnapshot.duration > 0
      ? externalPlaybackSnapshot.duration
      : EXTERNAL_PLAYBACK_FALLBACK_DURATION_SECONDS
    const tick = (): void => {
      const previousClock = externalPlaybackClockRef.current
      if (previousClock.key !== key) return
      const now = Date.now()
      const elapsedSeconds = Math.max(0, (now - previousClock.updatedAt) / 1000)
      const currentTime = clampNumber(previousClock.currentTime + elapsedSeconds, 0, duration)
      externalPlaybackClockRef.current = { key, currentTime, updatedAt: now }
      setPlaybackTime(currentTime)
      writeMiniProgressRatio(currentTime, duration)
    }
    const interval = window.setInterval(tick, 250)
    tick()
    return () => {
      window.clearInterval(interval)
    }
  }, [currentTrackHasTimedLyrics, externalPlaybackKey, externalPlaybackSnapshot?.available, externalPlaybackSnapshot?.duration, externalPlaybackSnapshot?.isPlaying, isFullscreenLyricsOpen, isLyricsSidebarOpen, playbackSource, writeMiniProgressRatio])

  React.useEffect(() => {
    if (playbackSource !== 'external') return
    const snapshot = externalPlaybackSnapshot
    const key = externalPlaybackKey
    const title = snapshot?.title.trim() ?? ''
    const artist = snapshot?.artist.trim() ?? ''
    const album = snapshot?.album?.trim() || ''
    if (!key || !title || title === '外部播放' || !window.kmgccc?.lookupLyrics) return
    const existingLyrics = externalLyricsByKey[key]
    const metadataSongId = snapshot?.neteaseSongId
    const now = Date.now()
    const isRetryableStatus = existingLyrics?.status === 'empty' || existingLyrics?.status === 'failed' || existingLyrics?.status === 'loading'
    const isStaleLyricsLookup = Boolean(existingLyrics?.updatedAt && now - existingLyrics.updatedAt > EXTERNAL_LYRICS_RETRY_DELAY_MS)
    const shouldRetryWithMetadata = Boolean(metadataSongId && existingLyrics && existingLyrics.metadataSongId !== metadataSongId && (existingLyrics.status === 'empty' || existingLyrics.status === 'failed' || existingLyrics.status === 'loading'))
    const shouldRetryStaleLookup = Boolean(existingLyrics && isRetryableStatus && isStaleLyricsLookup)
    if (existingLyrics && !shouldRetryWithMetadata && !shouldRetryStaleLookup) return
    setExternalLyricsByKey((entries) => ({
      ...entries,
      [key]: { status: 'loading', metadataSongId, updatedAt: now }
    }))
    let cancelled = false
    window.kmgccc.lookupLyrics({
      title,
      artist,
      album,
      duration: snapshot?.duration && snapshot.duration < 12 * 60 ? snapshot.duration : 0,
      neteaseSongId: metadataSongId,
      mode: 'synced',
      includeTranslation: true,
      platform: 'auto'
    }).then((result) => {
      if (cancelled) return
      const text = result?.syncedLyrics || result?.lyricsText || ''
      setExternalLyricsByKey((entries) => ({
        ...entries,
        [key]: text.trim()
          ? { status: 'ready', lyricsText: text, syncedLyrics: text, metadataSongId, updatedAt: Date.now() }
          : { status: 'empty', metadataSongId, updatedAt: Date.now() }
      }))
    }).catch(() => {
      if (cancelled) return
      setExternalLyricsByKey((entries) => ({
        ...entries,
        [key]: { status: 'failed', metadataSongId, updatedAt: Date.now() }
      }))
    })
    return () => {
      cancelled = true
    }
  }, [externalLyricsByKey, externalPlaybackKey, externalPlaybackSnapshot, playbackSource])

  React.useEffect(() => {
    if (playbackSource !== 'external') return
    const snapshot = externalPlaybackSnapshot
    const key = externalPlaybackKey
    const title = snapshot?.title.trim() ?? ''
    const artist = snapshot?.artist.trim() ?? ''
    const album = snapshot?.album?.trim() || ''
    if (!key || !title || title === '外部播放' || !window.kmgccc?.lookupCover) return
    const existingArtwork = externalArtworkByKey[key]
    const metadataArtworkUrl = snapshot?.artworkUrl?.trim()
    const now = Date.now()
    const shouldRetryWithArtwork = Boolean(metadataArtworkUrl && existingArtwork && existingArtwork.metadataArtworkUrl !== metadataArtworkUrl && (existingArtwork.status === 'empty' || existingArtwork.status === 'failed'))
    if (existingArtwork && !shouldRetryWithArtwork) return
    setExternalArtworkByKey((entries) => ({
      ...entries,
      [key]: { status: 'loading', metadataArtworkUrl, updatedAt: now }
    }))
    let cancelled = false
    const lookup = async (): Promise<string> => {
      if (metadataArtworkUrl) return metadataArtworkUrl
      const albumCandidates = album
        ? await window.kmgccc!.lookupCover({
          kind: 'album',
          title,
          artist,
          album
        })
        : []
      const trackCandidates = albumCandidates.length ? [] : await window.kmgccc!.lookupCover({
        kind: 'track',
        title,
        artist,
        album
      })
      return (albumCandidates[0]?.artworkUrl || trackCandidates[0]?.artworkUrl || '').trim()
    }
    lookup().then((artworkUrl) => {
      if (cancelled) return
      setExternalArtworkByKey((entries) => ({
        ...entries,
        [key]: artworkUrl
          ? { status: 'ready', artworkUrl, metadataArtworkUrl, updatedAt: Date.now() }
          : { status: 'empty', metadataArtworkUrl, updatedAt: Date.now() }
      }))
    }).catch(() => {
      if (cancelled) return
      setExternalArtworkByKey((entries) => ({
        ...entries,
        [key]: { status: 'failed', metadataArtworkUrl, updatedAt: Date.now() }
      }))
    })
    return () => {
      cancelled = true
    }
  }, [externalArtworkByKey, externalPlaybackKey, externalPlaybackSnapshot, playbackSource])

  const seekTo = React.useCallback((seconds: number) => {
    if (!Number.isFinite(seconds)) return
    const nextTime = Math.max(0, seconds)
    if (playbackSource === 'external') {
      const snapshot = externalPlaybackSnapshot
      void window.kmgccc?.sendExternalPlaybackCommand?.('seek', nextTime).then((ok) => {
        if (!ok) return
        const key = externalTrackKey(snapshot)
        if (key) {
          externalPlaybackClockRef.current = {
            key,
            currentTime: nextTime,
            updatedAt: Date.now()
          }
        }
        writeMiniProgressRatio(nextTime, snapshot?.duration ?? playbackDuration)
        setPlaybackTime(nextTime)
      })
      return
    }
    const audio = audioRef.current
    const duration = Number.isFinite(audio?.duration) && audio && audio.duration > 0 ? audio.duration : currentTrack?.duration ?? 0
    if (audio && currentTrack?.sourceUrl) {
      try {
        audio.currentTime = nextTime
      } catch {
        // Keep the visual timeline responsive even if the media element cannot seek yet.
      }
    }
    writeMiniProgressRatio(nextTime, duration)
    lastPlaybackTimeRef.current = nextTime
    setPlaybackTime(nextTime)
  }, [currentTrack?.duration, currentTrack?.sourceUrl, externalPlaybackSnapshot, playbackDuration, playbackSource, writeMiniProgressRatio])
  const seekToLyricTime = React.useCallback((seconds: number) => {
    seekTo(Math.max(0, seconds - lyricPlaybackOffsetSeconds + 0.22))
  }, [lyricPlaybackOffsetSeconds, seekTo])
  const togglePlayback = React.useCallback(() => {
    if (playbackSource === 'external') {
      void window.kmgccc?.sendExternalPlaybackCommand?.('playPause')
      setIsPlaying((value) => !value)
      return
    }
    setIsPlaying((value) => !value)
  }, [playbackSource])
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.code !== 'Space' || event.repeat) return
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      const isEditableTarget = !!target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select' || tagName === 'button'
      if (isEditableTarget || (playbackSource === 'local' && !currentTrack?.sourceUrl)) return
      event.preventDefault()
      togglePlayback()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTrack?.sourceUrl, playbackSource, togglePlayback])
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
    if (playbackSource === 'external') {
      void window.kmgccc?.sendExternalPlaybackCommand?.('previous')
      return
    }
    const currentIndex = playbackQueue.findIndex((track) => track.id === currentId)
    if (currentIndex < 0) return
    if (playbackTime > 3) {
      seekTo(0)
      return
    }
    playTrackByIndex(currentIndex - 1)
  }, [currentId, playbackQueue, playTrackByIndex, playbackSource, playbackTime, seekTo])
  const playNextTrack = React.useCallback(() => {
    if (playbackSource === 'external') {
      void window.kmgccc?.sendExternalPlaybackCommand?.('next')
      return
    }
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
  }, [currentId, playbackQueue, isShuffleEnabled, playTrackByIndex, playbackSource])
  const toggleShuffle = React.useCallback(() => {
    setIsShuffleEnabled((value) => !value)
  }, [])
  const changeVolume = React.useCallback((nextVolume: number) => {
    const clampedVolume = clampNumber(nextVolume, 0, 1)
    setVolume(clampedVolume)
    if (playbackSource === 'external') {
      void window.kmgccc?.setExternalPlaybackVolume?.(clampedVolume).then((snapshot) => {
        if (!snapshot?.available) return
        setVolume(clampNumber(snapshot.muted ? 0 : snapshot.volume, 0, 1))
      })
    }
  }, [playbackSource])
  const selectPlaybackSource = React.useCallback(async (source: PlaybackSourceKind, mode: ExternalPlaybackSourceMode = externalPlaybackMode) => {
    if (source === 'external') {
      if (!isExternalPlaybackSupported) return
      audioRef.current?.pause()
      setPlaybackSource('external')
      setExternalPlaybackMode(mode)
      const snapshot = await window.kmgccc?.setExternalPlaybackSourceMode?.(mode)
      if (snapshot) {
        setExternalPlaybackSnapshot(snapshot)
        setIsPlaying(snapshot.isPlaying)
        setPlaybackTime(snapshot.currentTime)
        setPlaybackDuration(snapshot.duration)
        writeMiniProgressRatio(snapshot.currentTime, snapshot.duration)
      }
      return
    }
    setPlaybackSource('local')
    setIsPlaying(false)
    setPlaybackTime(audioRef.current?.currentTime ?? playbackTime)
    setPlaybackDuration(currentTrack?.duration ?? playbackDuration)
  }, [currentTrack?.duration, externalPlaybackMode, isExternalPlaybackSupported, playbackDuration, playbackTime, writeMiniProgressRatio])
  const navigateHome = React.useCallback(() => {
    setRoute({ name: 'home' })
  }, [])
  const openNowPlaying = React.useCallback(() => {
    setRoute({ name: 'nowPlaying' })
  }, [])
  const openSettings = React.useCallback(() => {
    setSettingsCategory('nowPlaying')
    setIsSettingsOpen(true)
  }, [])
  const openFullscreenSettings = React.useCallback(() => {
    setSettingsCategory('fullscreen')
    setIsSettingsOpen(true)
  }, [])
  const toggleAppearanceShortcut = React.useCallback(() => {
    setFollowSystemAppearance(false)
    setManualAppearance(effectiveAppearance === 'dark' ? 'light' : 'dark')
  }, [effectiveAppearance])
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

    if (deferImportEnrichment) {
      setImportSyncState({
        title: importedTracks.length === 1 ? importedTracks[0].title : `已导入 ${importedTracks.length} 首歌曲`,
        artist: importedTracks.length === 1 ? importedTracks[0].artist : '',
        detail: '已先保留到资料库，歌词、封面和元数据可在数据设置里手动补全',
        status: 'completed',
        progress: 1,
        processedCount: importedTracks.length,
        totalCount: importedTracks.length
      })
      window.setTimeout(() => setImportSyncState(null), 1400)
      return
    }

    let completedCount = 0
    const syncResults: NonNullable<ImportSyncState['results']> = {}
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
        syncResults.track = mergeImportSyncStatus(syncResults.track, result.statuses.track)
        syncResults.artist = mergeImportSyncStatus(syncResults.artist, result.statuses.artist)
        syncResults.lyrics = mergeImportSyncStatus(syncResults.lyrics, result.statuses.lyrics)
        syncResults.album = mergeImportSyncStatus(syncResults.album, result.statuses.album)
        setHomeSnapshot((snapshot) => snapshotWithSyncedTrack(snapshot, result))
        if (index === 0) setCurrentId(result.track.id)
      }
      const syncedSnapshot = await window.kmgccc?.getHomeSnapshot()
      if (syncedSnapshot) applyHomeSnapshot(syncedSnapshot, importedTracks[0].id)
      setImportSyncState({
        title: importedTracks.length === 1 ? importedTracks[0].title : `已导入 ${importedTracks.length} 首歌曲`,
        artist: importedTracks.length === 1 ? importedTracks[0].artist : '',
        detail: importSyncResultSummary(syncResults),
        status: 'completed',
        progress: 1,
        processedCount: completedCount,
        totalCount: importedTracks.length,
        results: syncResults
      })
      window.setTimeout(() => setImportSyncState(null), 1400)
    } catch {
      setImportSyncState({
        title: importedTracks.length === 1 ? importedTracks[0].title : '批量导入',
        artist: importedTracks.length === 1 ? importedTracks[0].artist : '',
        detail: completedCount > 0 ? `补全中断，已保留本地导入信息；${importSyncResultSummary(syncResults)}` : '补全失败，已保留本地导入信息',
        status: 'failed',
        progress: 1,
        processedCount: completedCount,
        totalCount: importedTracks.length,
        results: syncResults
      })
    }
  }, [applyHomeSnapshot, deferImportEnrichment])
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
    setPlaybackSource('local')
    setPlaybackQueueIds((ids) => ids.length ? ids : homeSnapshot.tracks.map((track) => track.id))
    setCurrentId(id)
    setIsPlaying(true)
  }, [homeSnapshot.tracks])
  const playTracksAsQueue = React.useCallback((tracks: HomeTrack[], preferredTrackId?: string) => {
    if (!tracks.length) return
    setPlaybackSource('local')
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
    setPlaybackSource('local')
    setPlaybackQueueIds(homeSnapshot.tracks.map((track) => track.id))
    setCurrentId(trackId)
    setIsPlaying(true)
  }, [homeSnapshot.tracks])
  const playCurrentView = React.useCallback(() => {
    if (route.name === 'home') {
      const track = homeSnapshot.heroTrack ?? homeSnapshot.tracks[0]
      if (track) playHomeTrack(track.id)
      return
    }
    if (route.name !== 'nowPlaying') playRouteTracks(route)
  }, [homeSnapshot.heroTrack, homeSnapshot.tracks, playHomeTrack, playRouteTracks, route])
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
  const batchAddTracksToPlaylist = React.useCallback(async (playlistId: string, trackIds: string[]) => {
    let snapshot: HomeSnapshot | undefined | null
    for (const trackId of trackIds) {
      snapshot = await window.kmgccc?.addTrackToPlaylist(playlistId, trackId)
    }
    if (snapshot) applyHomeSnapshot(snapshot, trackIds[0])
  }, [applyHomeSnapshot])
  const batchRemoveTracksFromCurrentPlaylist = React.useCallback(async (trackIds: string[]) => {
    if (route.name !== 'playlistDetail' || route.id === 'playlist-library') return
    let snapshot: HomeSnapshot | undefined | null
    for (const trackId of trackIds) {
      snapshot = await window.kmgccc?.removeTrackFromPlaylist(route.id, trackId)
    }
    if (snapshot) {
      applyHomeSnapshot(snapshot)
      setSelectedTrackIds(new Set())
    }
  }, [applyHomeSnapshot, route])
  const batchDeleteTracks = React.useCallback(async (trackIds: string[]) => {
    let snapshot: HomeSnapshot | undefined | null
    for (const trackId of trackIds) {
      snapshot = await window.kmgccc?.deleteTrack(trackId)
    }
    if (snapshot) {
      applyHomeSnapshot(snapshot)
      setSelectedTrackIds(new Set())
    }
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
        artworkUrl: values.artworkUrl ?? dialog.track.artworkUrl,
        discNumber: values.discNumber ? Number(values.discNumber) : undefined,
        trackNumber: values.trackNumber ? Number(values.trackNumber) : undefined,
        lyricsText: values.lyricsText,
        syncedLyrics: values.lyricsText,
        userDescription: values.description,
        genreTags: parseCommaTags(values.genreTags),
        language: values.language?.trim(),
        labelOrCompany: values.labelOrCompany?.trim(),
        releaseDate: values.releaseDate?.trim(),
        qqMusicSongMid: values.qqMusicSongMid?.trim(),
        metadataSource: values.metadataSource?.trim() || dialog.track.metadataSource,
        metadataFetchedAt: values.metadataFetchedAt?.trim() || dialog.track.metadataFetchedAt,
        metadataConfidence: values.metadataConfidence ? Number(values.metadataConfidence) : dialog.track.metadataConfidence,
        lyricsTimeOffsetMs: values.lyricsTimeOffsetMs ? Number(values.lyricsTimeOffsetMs) : dialog.track.lyricsTimeOffsetMs
      } as LocalAudioImport)
    } else if (dialog.kind === 'batchEditTracks') {
      preferredTrackId = dialog.tracks[0]?.id
      for (const track of dialog.tracks) {
        snapshot = await window.kmgccc?.updateTrack({
          ...track,
          artist: values.artist?.trim() || track.artist,
          album: values.album?.trim() || track.album,
          genreTags: values.genreTags?.trim() ? parseCommaTags(values.genreTags) : track.genreTags,
          language: values.language?.trim() || track.language,
          labelOrCompany: values.labelOrCompany?.trim() || track.labelOrCompany
        } as LocalAudioImport)
      }
    } else if (dialog.kind === 'editAlbum') {
      snapshot = await window.kmgccc?.updateAlbum(dialog.album.id, {
        title: values.title?.trim() || dialog.album.title,
        artist: values.artist?.trim() || dialog.album.artist,
        description: values.description ?? '',
        releaseYear: values.releaseYear ? Number(values.releaseYear) : undefined,
        releaseDate: values.releaseDate?.trim() || '',
        albumType: values.albumType?.trim() || '',
        genreTags: parseCommaTags(values.genreTags),
        language: values.language?.trim() || '',
        labelOrCompany: values.labelOrCompany?.trim() || '',
        qqMusicAlbumMid: values.qqMusicAlbumMid?.trim() || '',
        metadataSource: values.metadataSource?.trim() || dialog.album.metadataSource || '',
        metadataFetchedAt: values.metadataFetchedAt?.trim() || dialog.album.metadataFetchedAt || '',
        metadataConfidence: values.metadataConfidence ? Number(values.metadataConfidence) : dialog.album.metadataConfidence,
        artworkUrl: values.artworkUrl ?? dialog.album.customArtworkUrl ?? dialog.album.artworkUrl ?? ''
      })
    } else if (dialog.kind === 'editArtist') {
      snapshot = await window.kmgccc?.updateArtist(dialog.artist.id, {
        name: values.name?.trim() || dialog.artist.name,
        description: values.description ?? '',
        genreTags: parseCommaTags(values.genreTags),
        region: values.region?.trim() || '',
        foreignName: values.foreignName?.trim() || '',
        qqMusicSingerMid: values.qqMusicSingerMid?.trim() || '',
        metadataSource: values.metadataSource?.trim() || dialog.artist.metadataSource || '',
        metadataFetchedAt: values.metadataFetchedAt?.trim() || dialog.artist.metadataFetchedAt || '',
        metadataConfidence: values.metadataConfidence ? Number(values.metadataConfidence) : dialog.artist.metadataConfidence,
        artworkUrl: values.artworkUrl ?? dialog.artist.customArtworkUrl ?? dialog.artist.artworkUrl ?? ''
      })
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
    if (dialog.kind === 'batchEditTracks') setSelectedTrackIds(new Set())
    setLibraryDialog(null)
  }, [applyHomeSnapshot, libraryDialog])
  const toggleLyricsSidebar = React.useCallback(() => {
    setIsLyricsSidebarOpen((value) => !value)
  }, [])
  const toggleFullscreenLyrics = React.useCallback(() => {
    setIsFullscreenLyricsOpen((value) => !value)
  }, [])
  const toggleArtworkBpmPulse = React.useCallback(() => {
    const trackId = displayTrack?.id
    if (trackId && isArtworkBpmPulseEnabled) {
      const nextCache = { ...beatCacheRef.current }
      delete nextCache[trackId]
      beatCacheRef.current = nextCache
      setTrackBeatById((previous) => {
        if (!previous[trackId]) return previous
        const next = { ...previous }
        delete next[trackId]
        return next
      })
      setApprovedArtworkBeatById((previous) => {
        if (!previous[trackId]) return previous
        const next = { ...previous }
        delete next[trackId]
        persistJsonSetting(APPROVED_ARTWORK_BEATS_STORAGE_KEY, next)
        return next
      })
      setArtworkBeatSaveFeedback((feedback) => feedback?.trackId === trackId ? null : feedback)
    }
    artworkPulseLastBeatRef.current = null
    setIsArtworkBpmPulseEnabled((value) => !value)
  }, [displayTrack?.id, isArtworkBpmPulseEnabled])
  const openManualBpmBoard = React.useCallback(() => {
    if (!displayTrack?.id) return
    const openedPlaybackTime = playbackSource === 'external'
      ? playbackTimeRef.current
      : audioRef.current?.currentTime ?? playbackTime
    setManualBpmBoard({
      trackId: displayTrack.id,
      title: displayTrack.title,
      artist: displayTrack.artist,
      openedAtMs: window.performance.now(),
      openedPlaybackTime
    })
  }, [displayTrack, playbackSource, playbackTime])
  const approveCurrentArtworkBeat = React.useCallback(() => {
    const trackId = displayTrack?.id
    if (!trackId) return
    const beat = trackBeatById[trackId] ?? beatCacheRef.current[trackId]
    if (!beat) {
      setArtworkBeatSaveFeedback({ trackId, bpm: 0, kind: 'waiting' })
      window.setTimeout(() => {
        setArtworkBeatSaveFeedback((feedback) => feedback?.trackId === trackId && feedback.kind === 'waiting' ? null : feedback)
      }, 1200)
      return
    }
    const approvedBeat = { ...beat, approved: true }
    const nextApproved = { ...approvedArtworkBeatById, [trackId]: approvedBeat }
    setApprovedArtworkBeatById(nextApproved)
    persistJsonSetting(APPROVED_ARTWORK_BEATS_STORAGE_KEY, nextApproved)
    beatCacheRef.current = { ...beatCacheRef.current, [trackId]: approvedBeat }
    setTrackBeatById((previous) => ({ ...previous, [trackId]: approvedBeat }))
    setArtworkBeatSaveFeedback({ trackId, bpm: approvedBeat.bpm, kind: 'approved' })
    window.setTimeout(() => {
      setArtworkBeatSaveFeedback((feedback) => feedback?.trackId === trackId && feedback.kind === 'approved' ? null : feedback)
    }, 1400)
  }, [approvedArtworkBeatById, displayTrack?.id, trackBeatById])
  const confirmManualArtworkBeat = React.useCallback((beat: ArtworkBeat) => {
    const trackId = manualBpmBoard?.trackId
    if (!trackId) return
    const approvedBeat = { ...beat, bpm: normalizeArtworkPulseBpm(beat.bpm), offset: Math.max(0, beat.offset), approved: true }
    const nextApproved = { ...approvedArtworkBeatById, [trackId]: approvedBeat }
    setApprovedArtworkBeatById(nextApproved)
    persistJsonSetting(APPROVED_ARTWORK_BEATS_STORAGE_KEY, nextApproved)
    beatCacheRef.current = { ...beatCacheRef.current, [trackId]: approvedBeat }
    setTrackBeatById((previous) => ({ ...previous, [trackId]: approvedBeat }))
    setArtworkBeatSaveFeedback({ trackId, bpm: approvedBeat.bpm, kind: 'manual' })
    setManualBpmBoard(null)
    setIsArtworkBpmPulseEnabled(true)
    window.setTimeout(() => {
      setArtworkBeatSaveFeedback((feedback) => feedback?.trackId === trackId && feedback.kind === 'manual' ? null : feedback)
    }, 1400)
  }, [approvedArtworkBeatById, manualBpmBoard?.trackId])

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

    if (playbackSource === 'external') {
      audio.pause()
      return
    }

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
  }, [currentTrack, isPlaying, playbackSource])

  React.useEffect(() => {
    const audio = audioRef.current
    if (playbackSource === 'external') return
    if (!audio || !currentTrack?.sourceUrl) return

    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : currentTrack.duration
    writeMiniProgressRatio(audio.currentTime || 0, duration)
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [currentTrack?.duration, currentTrack?.sourceUrl, isPlaying, playbackSource, writeMiniProgressRatio])

  React.useEffect(() => {
    if (playbackSource === 'external') return
    if (!isPlaying) return
    const tick = () => {
      const audio = audioRef.current
      const duration = Number.isFinite(audio?.duration) && audio && audio.duration > 0 ? audio.duration : currentTrack?.duration ?? 0
      writeMiniProgressRatio(audio?.currentTime || 0, duration)
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [currentTrack?.duration, currentTrack?.sourceUrl, isPlaying, playbackSource, writeMiniProgressRatio])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  React.useEffect(() => {
    const shouldSampleLed = selectedVisualizerMode === 'led' || (isFullscreenLyricsOpen && selectedFullscreenVisualizerMode === 'led')
    if (playbackSource === 'external' || !isPlaying || !shouldSampleLed || !currentTrack?.sourceUrl) {
      if (ledAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(ledAnimationFrameRef.current)
        ledAnimationFrameRef.current = null
      }
      smoothedLedValuesRef.current = []
      setLedValues([])
      return
    }

    const analyser = ensureAudioAnalyser()
    const context = audioContextRef.current
    if (!analyser || !context) return
    void context.resume().catch(() => {})

    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    let lastPublish = 0
    let lastSample = 0
    const sample = (timestamp: number): void => {
      if (timestamp - lastSample < 1000 / 45) {
        ledAnimationFrameRef.current = window.requestAnimationFrame(sample)
        return
      }
      lastSample = timestamp
      analyser.getByteFrequencyData(frequencyData)
      const sampleRate = context.sampleRate || 44100
      const hzPerBin = sampleRate / analyser.fftSize
      const maxBin = clampNumber(Math.floor(ledCutoffHz / hzPerBin), 1, frequencyData.length - 1)
      const safeLedCount = Math.max(3, Math.round(ledCount))
      const center = Math.floor(safeLedCount / 2)
      const bands = center + 1
      const nextValues = Array.from({ length: safeLedCount }, (_entry, index) => {
        const distance = Math.abs(index - center)
        const start = Math.floor((distance / bands) * maxBin)
        const end = Math.max(start + 1, Math.floor(((distance + 1) / bands) * maxBin))
        let sum = 0
        for (let bin = start; bin < end; bin += 1) sum += frequencyData[bin] ?? 0
        const average = sum / Math.max(1, end - start) / 255
        return clampNumber(Math.pow(average, 0.72) * volume * 1.35, 0, 1)
      })
      const previous = smoothedLedValuesRef.current.length === safeLedCount ? smoothedLedValuesRef.current : Array.from({ length: safeLedCount }, () => 0)
      const alpha = clampNumber(0.18 * ledSpeed, 0.08, 0.42)
      const smoothed = nextValues.map((value, index) => previous[index] + (value - previous[index]) * alpha)
      smoothedLedValuesRef.current = smoothed
      if (timestamp - lastPublish >= 33) {
        lastPublish = timestamp
        setLedValues(smoothed)
      }
      ledAnimationFrameRef.current = window.requestAnimationFrame(sample)
    }
    ledAnimationFrameRef.current = window.requestAnimationFrame(sample)
    return () => {
      if (ledAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(ledAnimationFrameRef.current)
        ledAnimationFrameRef.current = null
      }
    }
  }, [currentTrack?.sourceUrl, ensureAudioAnalyser, isFullscreenLyricsOpen, isPlaying, ledCount, ledCutoffHz, ledSpeed, playbackSource, selectedFullscreenVisualizerMode, selectedVisualizerMode, volume])

  const updateAudioMetadata = React.useCallback(() => {
    if (playbackSource === 'external') return
    const audio = audioRef.current
    if (!audio || !currentTrack || !Number.isFinite(audio.duration)) return

    setPlaybackDuration(audio.duration)
    if (currentTrack.duration <= 0) {
      setHomeSnapshot((snapshot) => snapshotWithTrackDuration(snapshot, currentTrack.id, audio.duration))
    }
  }, [currentTrack, playbackSource])

  const updateAudioTime = React.useCallback(() => {
    if (playbackSource === 'external') return
    const audio = audioRef.current
    if (!audio) return
    const nextTime = audio.currentTime
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : currentTrack?.duration ?? 0
    const needsLiveLyricClock = currentTrackHasTimedLyrics && (isLyricsSidebarOpen || isFullscreenLyricsOpen)
    const refreshInterval = needsLiveLyricClock ? 0.25 : isLyricsSidebarOpen || isFullscreenLyricsOpen ? 2 : 30
    if (!audio.paused && Math.abs(nextTime - lastPlaybackTimeRef.current) < refreshInterval) return
    lastPlaybackTimeRef.current = nextTime
    setPlaybackTime(nextTime)
  }, [currentTrack?.duration, currentTrackHasTimedLyrics, isFullscreenLyricsOpen, isLyricsSidebarOpen, playbackSource, writeMiniProgressRatio])

  const handleAudioEnded = React.useCallback(() => {
    if (playbackSource === 'external') return
    if (homeSnapshot.tracks.length > 1) {
      playNextTrack()
      return
    }
    setIsPlaying(false)
    setPlaybackTime(0)
  }, [homeSnapshot.tracks.length, playNextTrack, playbackSource])

  React.useEffect(() => {
    if (route.name === 'home' && previousRouteNameRef.current !== 'home') {
      setHomeAmbientEpoch((value) => value + 1)
    }
    previousRouteNameRef.current = route.name
  }, [route.name])

  React.useEffect(() => {
    const nextTarget: EntryRevealTarget | 'other' = isFullscreenLyricsOpen
      ? 'fullscreen'
      : route.name === 'home' || route.name === 'nowPlaying'
        ? route.name
        : 'other'
    const previousTarget = previousEntryTargetRef.current
    previousEntryTargetRef.current = nextTarget
    if (nextTarget === 'other' || previousTarget === nextTarget) return

    for (const timer of entryRevealTimersRef.current) {
      window.clearTimeout(timer)
    }
    entryRevealTimersRef.current = []
    setEntryReveal({ target: nextTarget, phase: 'loading' })
    entryRevealTimersRef.current.push(window.setTimeout(() => {
      setEntryReveal({ target: nextTarget, phase: 'revealing' })
    }, 360))
    entryRevealTimersRef.current.push(window.setTimeout(() => {
      setEntryReveal((state) => state?.target === nextTarget ? null : state)
    }, 1160))
  }, [isFullscreenLyricsOpen, route.name])

  React.useEffect(() => () => {
    for (const timer of entryRevealTimersRef.current) {
      window.clearTimeout(timer)
    }
    if (artworkPulseFrameRef.current !== null) {
      window.cancelAnimationFrame(artworkPulseFrameRef.current)
    }
  }, [])

  return (
    <div
      className={`desktop-root ${isFullscreenLyricsOpen ? 'fullscreen-lyrics-open' : ''} lyrics-bg-${lyricsBackgroundMode} ${followSystemAppearance ? 'appearance-system' : 'appearance-manual'} appearance-${effectiveAppearance}`}
      style={desktopStyle}
    >
      <audio ref={audioRef} onLoadedMetadata={updateAudioMetadata} onTimeUpdate={updateAudioTime} onEnded={handleAudioEnded} />
      <LiquidGlassFilters />
      <div
        className={`app-shell ${isSidebarVisuallyCollapsed ? 'sidebar-collapsed' : ''} ${isLyricsSidebarOpen ? 'lyrics-sidebar-visible' : ''} ${route.name === 'nowPlaying' ? 'now-playing-route' : ''} ${dockProgressVisible ? 'dock-progress-visible' : 'dock-progress-hidden'} home-material-${homeCardMaterialMode} ${entryReveal ? `page-entry-${entryReveal.target} page-entry-${entryReveal.phase}` : ''}`}
        style={
          {
            '--sidebar-width': `${isSidebarVisuallyCollapsed ? COLLAPSED_SIDEBAR_WIDTH : adaptiveSidebarWidth}px`,
            '--lyrics-width': `${lyricsWidth}px`
          } as React.CSSProperties
        }
      >
        {route.name === 'home' ? <HomeAmbientShapesLayer key={homeAmbientEpoch} isActive /> : null}
        <Sidebar
          snapshot={homeSnapshot}
          route={route}
          onNavigate={setRoute}
          playbackSource={playbackSource}
          externalPlaybackMode={externalPlaybackMode}
          externalPlaybackSnapshot={externalPlaybackSnapshot}
          isExternalPlaybackSupported={isExternalPlaybackSupported}
          onSelectPlaybackSource={selectPlaybackSource}
          isCollapsed={isSidebarVisuallyCollapsed}
          onToggle={toggleSidebar}
          onResizeStart={handleSidebarResizeStart}
          onToggleFullscreenLyrics={toggleFullscreenLyrics}
          onOpenSettings={isFullscreenLyricsOpen ? openFullscreenSettings : openSettings}
          isDarkAppearance={effectiveAppearance === 'dark'}
          onToggleAppearance={toggleAppearanceShortcut}
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
        <div className="titlebar-drag-region" aria-hidden="true" />
        {entryReveal ? <RouteEntryLoader phase={entryReveal.phase} /> : null}

        <main className="content-pane">
          <Toolbar
            route={route}
            onNavigateHome={navigateHome}
            onImportAudioFile={importAudioFile}
            onPlayCurrentView={playCurrentView}
            onToggleLyricsSidebar={toggleLyricsSidebar}
            isLyricsSidebarOpen={isLyricsSidebarOpen}
            sortLabel={detailSortLabels[toolbarSortKey]}
            sortDirection={detailSortDirection}
            isMultiSelectMode={isMultiSelectMode}
            onOpenSortMenu={openSortMenu}
            onToggleMultiSelect={() => setIsMultiSelectMode((value) => !value)}
          />
          {route.name === 'home' ? (
            <HomePage
              snapshot={homeSnapshot}
              albums={albums}
              sectionOrder={homeSectionOrder}
              onNavigate={setRoute}
              onPlayTrack={playHomeTrack}
              onPlayRoute={playRouteTracks}
              onEditTrack={editTrack}
              onDeleteTrack={deleteTrack}
              onEditArtist={editArtist}
              onDeleteArtist={deleteArtist}
              onEditAlbum={editAlbum}
              onDeleteAlbum={deleteAlbum}
              onEditPlaylist={editPlaylist}
              onDeletePlaylist={deletePlaylist}
              onOpenContextMenu={openContextMenu}
            />
          ) : route.name === 'nowPlaying' ? (
            <NowPlayingPage
              track={displayTrack ?? currentTrack}
              albums={albums}
              bkThemeStyle={effectiveCoverThemeStyle}
              isPlaying={isPlaying}
              volume={volume}
              ledCount={ledCount}
              ledBrightnessLevels={ledBrightnessLevels}
              ledSpeed={ledSpeed}
              ledValues={ledValues}
              skinID={selectedNowPlayingSkin}
              visualizerMode={selectedVisualizerMode}
              artBackgroundEnabled={isNowPlayingArtBackgroundEnabled}
              artworkFrameMaskEnabled={isArtworkFrameMaskEnabled}
              artworkFrameIndex={artworkFrameIndex}
              rotatingCdMode={isRotatingCdMode}
              appleDynamicBackgroundEnabled={isAppleDynamicBackgroundEnabled}
              appleMeshSpeed={appleMeshSpeed}
              cassetteKmgLookEnabled={isCassetteKmgLookEnabled}
              isArtworkBpmPulseEnabled={isArtworkBpmPulseEnabled}
              onArtworkBpmPulseToggle={toggleArtworkBpmPulse}
              onArtworkManualBpmOpen={openManualBpmBoard}
              onArtworkBeatApprove={approveCurrentArtworkBeat}
              artworkBeatFeedback={playbackSource === 'local' && currentTrack?.id && artworkBeatSaveFeedback?.trackId === currentTrack.id ? artworkBeatSaveFeedback : null}
              onLyricToneSeedChange={setLyricToneSeed}
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
              sortKey={detailSortKey}
              sortDirection={detailSortDirection}
              isMultiSelectMode={isMultiSelectMode}
              selectedTrackIds={selectedTrackIds}
              onSelectedTrackIdsChange={setSelectedTrackIds}
              onBatchAddTracksToPlaylist={batchAddTracksToPlaylist}
              onBatchRemoveTracksFromPlaylist={batchRemoveTracksFromCurrentPlaylist}
              onBatchDeleteTracks={batchDeleteTracks}
              onBatchEditTracks={(tracks) => setLibraryDialog({ kind: 'batchEditTracks', tracks })}
            />
          )}

          {isFullscreenLyricsOpen ? (
            <FullscreenLyricsPage
              track={displayTrack ?? currentTrack}
              albums={albums}
              bkThemeStyle={fullscreenCoverThemeStyle}
              playbackTime={effectiveLyricPlaybackTime}
              isPlaying={isPlaying}
              volume={volume}
              ledCount={ledCount}
              ledBrightnessLevels={ledBrightnessLevels}
              ledSpeed={ledSpeed}
              ledValues={ledValues}
              skinID={selectedFullscreenSkin}
              visualizerMode={selectedFullscreenVisualizerMode}
              artBackgroundEnabled={isFullscreenArtBackgroundEnabled}
              artworkFrameMaskEnabled={isArtworkFrameMaskEnabled}
              artworkFrameIndex={artworkFrameIndex}
              rotatingCdMode={isRotatingCdMode}
              appleDynamicBackgroundEnabled={isAppleDynamicBackgroundEnabled}
              appleMeshSpeed={appleMeshSpeed}
              cassetteKmgLookEnabled={isCassetteKmgLookEnabled}
              onSeek={seekToLyricTime}
              isArtworkBpmPulseEnabled={isArtworkBpmPulseEnabled}
              onArtworkBpmPulseToggle={toggleArtworkBpmPulse}
              onArtworkManualBpmOpen={openManualBpmBoard}
              onArtworkBeatApprove={approveCurrentArtworkBeat}
              artworkBeatFeedback={playbackSource === 'local' && currentTrack?.id && artworkBeatSaveFeedback?.trackId === currentTrack.id ? artworkBeatSaveFeedback : null}
              renderQuality={fullscreenLyricsRenderQuality}
              reduceHighlight={fullscreenDiscreteWordHighlightEnabled}
              lyricToneSeed={lyricToneSeed}
              onLyricToneSeedChange={setLyricToneSeed}
            />
          ) : null}

          {displayTrack ? (
            <>
              {isFullscreenLyricsOpen ? <div className="mini-player-hover-zone no-drag" aria-hidden="true" /> : null}
              <MiniPlayer
                track={displayTrack}
                tracks={displayedPlaybackQueue}
                albums={albums}
                currentId={displayTrack.id}
                isPlaying={isPlaying}
                isShuffleEnabled={isShuffleEnabled}
                volume={volume}
                playbackTime={playbackTime}
                playbackDuration={playbackDuration || displayTrack.duration}
                onPlayPause={togglePlayback}
                onPrevious={playPreviousTrack}
                onNext={playNextTrack}
                onToggleShuffle={toggleShuffle}
                onVolumeChange={changeVolume}
                onSelectTrack={selectTrack}
                onOpenNowPlaying={openNowPlaying}
                showFullscreenActions={isFullscreenLyricsOpen}
                onOpenFullscreenSettings={openFullscreenSettings}
                onExitFullscreen={isFullscreenLyricsOpen ? toggleFullscreenLyrics : navigateHome}
                onSeek={seekTo}
              />
            </>
          ) : null}
          {importSyncState ? <ImportSyncCard state={importSyncState} onCancel={() => setImportSyncState(null)} /> : null}
        </main>
        {isLyricsSidebarOpen ? (
          <LyricsSidePanel
            track={displayTrack ?? currentTrack}
            albums={albums}
            playbackTime={effectiveLyricPlaybackTime}
            isPlaying={isPlaying}
            onSeek={seekToLyricTime}
            onResizeStart={handleLyricsResizeStart}
            renderQuality={lyricsRenderQuality}
            reduceHighlight={isDiscreteWordHighlightEnabled}
            leadInMs={lyricsLeadInMs}
            nearSwitchGapMs={lyricsNearSwitchGapMs}
            colorStyle={desktopStyle}
          />
        ) : null}
        {isSettingsOpen ? (
          <SettingsPanel
            selectedCategory={settingsCategory}
            onSelectCategory={setSettingsCategory}
            onClose={() => setIsSettingsOpen(false)}
            globalArtworkTintEnabled={globalArtworkTintEnabled}
            onGlobalArtworkTintEnabledChange={setGlobalArtworkTintEnabled}
            dockProgressVisible={dockProgressVisible}
            onDockProgressVisibleChange={setDockProgressVisible}
            followSystemAppearance={followSystemAppearance}
            onFollowSystemAppearanceChange={setFollowSystemAppearance}
            manualAppearance={manualAppearance}
            onManualAppearanceChange={setManualAppearance}
            lyricsBackgroundMode={lyricsBackgroundMode}
            onLyricsBackgroundModeChange={setLyricsBackgroundMode}
            homeCardMaterialMode={homeCardMaterialMode}
            onHomeCardMaterialModeChange={setHomeCardMaterialMode}
            homeSectionOrder={homeSectionOrder}
            onHomeSectionOrderChange={setHomeSectionOrder}
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
            selectedFullscreenTab={fullscreenSettingsTab}
            onSelectFullscreenTab={setFullscreenSettingsTab}
            selectedFullscreenSkin={selectedFullscreenSkin}
            onSelectedFullscreenSkinChange={setSelectedFullscreenSkin}
            fullscreenArtBackgroundEnabled={isFullscreenArtBackgroundEnabled}
            onFullscreenArtBackgroundEnabledChange={setIsFullscreenArtBackgroundEnabled}
            fullscreenClassicVisualizerMode={fullscreenClassicVisualizerMode}
            onFullscreenClassicVisualizerModeChange={setFullscreenClassicVisualizerMode}
            fullscreenAppleVisualizerMode={fullscreenAppleVisualizerMode}
            onFullscreenAppleVisualizerModeChange={setFullscreenAppleVisualizerMode}
            fullscreenRotatingVisualizerMode={fullscreenRotatingVisualizerMode}
            onFullscreenRotatingVisualizerModeChange={setFullscreenRotatingVisualizerMode}
            fullscreenCassetteVisualizerMode={fullscreenCassetteVisualizerMode}
            onFullscreenCassetteVisualizerModeChange={setFullscreenCassetteVisualizerMode}
            coverGradientEdgeFillMode={coverGradientEdgeFillMode}
            onCoverGradientEdgeFillModeChange={setCoverGradientEdgeFillMode}
            coverGradientBlurRadius={coverGradientBlurRadius}
            onCoverGradientBlurRadiusChange={setCoverGradientBlurRadius}
            fullscreenLyricsRenderQuality={fullscreenLyricsRenderQuality}
            onFullscreenLyricsRenderQualityChange={setFullscreenLyricsRenderQuality}
            fullscreenDiscreteWordHighlightEnabled={fullscreenDiscreteWordHighlightEnabled}
            onFullscreenDiscreteWordHighlightEnabledChange={setFullscreenDiscreteWordHighlightEnabled}
            fullscreenLyricsFontSize={fullscreenLyricsFontSize}
            onFullscreenLyricsFontSizeChange={setFullscreenLyricsFontSize}
            fullscreenLyricsTranslationFontSize={fullscreenLyricsTranslationFontSize}
            onFullscreenLyricsTranslationFontSizeChange={setFullscreenLyricsTranslationFontSize}
            fullscreenLyricsGlobalAdvanceMs={fullscreenLyricsGlobalAdvanceMs}
            onFullscreenLyricsGlobalAdvanceMsChange={setFullscreenLyricsGlobalAdvanceMs}
            lookaheadMs={lookaheadMs}
            onLookaheadMsChange={setLookaheadMs}
            deferImportEnrichment={deferImportEnrichment}
            onDeferImportEnrichmentChange={setDeferImportEnrichment}
            telemetryEnabled={telemetryEnabled}
            onTelemetryEnabledChange={setTelemetryEnabled}
            libraryLocationInfo={libraryLocationInfo}
            onLibraryLocationInfoChange={setLibraryLocationInfo}
            settingsActionStatus={settingsActionStatus}
            onSettingsActionStatusChange={setSettingsActionStatus}
            onRefreshLibrarySnapshot={refreshLibrarySnapshot}
          />
        ) : null}
        {libraryDialog ? (
          <LibraryDialog state={libraryDialog} snapshot={homeSnapshot} onClose={() => setLibraryDialog(null)} onSubmit={submitLibraryDialog} />
        ) : null}
        {manualBpmBoard ? (
          <ManualBpmBoard
            state={manualBpmBoard}
            onClose={() => setManualBpmBoard(null)}
            onConfirm={confirmManualArtworkBeat}
          />
        ) : null}
        {contextMenu ? <ContextMenu state={contextMenu} onClose={() => setContextMenu(null)} /> : null}
      </div>
    </div>
  )
}

const RouteEntryLoader = React.memo(function RouteEntryLoader({ phase }: { phase: 'loading' | 'revealing' }): React.ReactElement {
  return (
    <div className={`route-entry-loader ${phase}`} aria-hidden="true">
      <span />
    </div>
  )
})

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

const ManualBpmBoard = React.memo(function ManualBpmBoard({
  state,
  onClose,
  onConfirm
}: {
  state: ManualBpmBoardState
  onClose: () => void
  onConfirm: (beat: ArtworkBeat) => void
}): React.ReactElement {
  const [tapTimes, setTapTimes] = React.useState<number[]>([])
  const boardRef = React.useRef<HTMLButtonElement | null>(null)
  const intervals = React.useMemo(() => tapTimes.slice(1).map((time, index) => time - tapTimes[index]).filter((value) => value > 160 && value < 2200), [tapTimes])
  const bpm = React.useMemo(() => {
    if (!intervals.length) return null
    const sorted = [...intervals].sort((a, b) => a - b)
    const trimmed = sorted.length >= 4 ? sorted.slice(1, -1) : sorted
    const average = trimmed.reduce((sum, value) => sum + value, 0) / trimmed.length
    return normalizeArtworkPulseBpm(60000 / average)
  }, [intervals])
  const tapCount = tapTimes.length
  const canConfirm = bpm !== null && tapCount >= 3

  const addTap = React.useCallback(() => {
    const now = window.performance.now()
    setTapTimes((previous) => [...previous.filter((time) => now - time < 10000), now].slice(-16))
  }, [])

  const confirm = React.useCallback(() => {
    if (!canConfirm || bpm === null || !tapTimes.length) return
    const firstTapOffset = Math.max(0, state.openedPlaybackTime + (tapTimes[0] - state.openedAtMs) / 1000)
    onConfirm({ bpm, offset: firstTapOffset, approved: true })
  }, [bpm, canConfirm, onConfirm, state.openedAtMs, state.openedPlaybackTime, tapTimes])

  React.useEffect(() => {
    boardRef.current?.focus()
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        addTap()
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        confirm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addTap, confirm, onClose])

  return (
    <div className="manual-bpm-overlay no-drag" role="dialog" aria-modal="true" aria-label="自定义测速板">
      <div className="manual-bpm-board">
        <header>
          <span>自定义测速</span>
          <strong>{state.title}</strong>
          <small>{state.artist}</small>
        </header>
        <button ref={boardRef} className="manual-bpm-tap" type="button" onClick={addTap}>
          <span>{bpm ?? '--'}</span>
          <small>BPM</small>
        </button>
        <div className="manual-bpm-meter" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => <i key={index} className={index < Math.min(tapCount, 8) ? 'active' : ''} />)}
        </div>
        <p>{tapCount < 3 ? '跟着强拍敲击 3 次以上' : '继续敲击可提高稳定度'}</p>
        <footer>
          <button type="button" onClick={onClose}>取消</button>
          <button className="primary" type="button" disabled={!canConfirm} onClick={confirm}>确认节拍</button>
        </footer>
      </div>
    </div>
  )
})

const LibraryDialog = React.memo(function LibraryDialog({
  state,
  snapshot,
  onClose,
  onSubmit
}: {
  state: LibraryDialogState
  snapshot: HomeSnapshot
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
        description: state.track.userDescription ?? '',
        genreTags: state.track.genreTags?.join(', ') ?? '',
        language: state.track.language ?? '',
        labelOrCompany: state.track.labelOrCompany ?? '',
        releaseDate: state.track.releaseDate ?? '',
        qqMusicSongMid: state.track.qqMusicSongMid ?? '',
        metadataSource: state.track.metadataSource ?? '',
        metadataFetchedAt: state.track.metadataFetchedAt ?? '',
        metadataConfidence: state.track.metadataConfidence ? String(state.track.metadataConfidence) : '',
        artworkUrl: state.track.artworkUrl ?? '',
        discNumber: state.track.discNumber ? String(state.track.discNumber) : '',
        trackNumber: state.track.trackNumber ? String(state.track.trackNumber) : '',
        lyricsText: state.track.syncedLyrics ?? state.track.lyricsText ?? '',
        lyricsTimeOffsetMs: state.track.lyricsTimeOffsetMs ? String(state.track.lyricsTimeOffsetMs) : '0'
      } as Record<string, string>
    }
    if (state.kind === 'batchEditTracks') {
      return {
        artist: '',
        album: '',
        genreTags: '',
        language: '',
        labelOrCompany: ''
      } as Record<string, string>
    }
    if (state.kind === 'editAlbum') {
      return {
        title: state.album.title,
        artist: state.album.artist,
        description: state.album.description ?? '',
        releaseYear: state.album.releaseYear ? String(state.album.releaseYear) : '',
        releaseDate: state.album.releaseDate ?? '',
        albumType: state.album.albumType ?? '',
        genreTags: state.album.genreTags?.join(', ') ?? '',
        language: state.album.language ?? '',
        labelOrCompany: state.album.labelOrCompany ?? '',
        qqMusicAlbumMid: state.album.qqMusicAlbumMid ?? '',
        metadataSource: state.album.metadataSource ?? '',
        metadataFetchedAt: state.album.metadataFetchedAt ?? '',
        metadataConfidence: state.album.metadataConfidence ? String(state.album.metadataConfidence) : '',
        artworkUrl: state.album.customArtworkUrl ?? state.album.artworkUrl ?? ''
      } as Record<string, string>
    }
    if (state.kind === 'editArtist') {
      return {
        name: state.artist.name,
        description: state.artist.description ?? '',
        genreTags: state.artist.genreTags?.join(', ') ?? '',
        region: state.artist.region ?? '',
        foreignName: state.artist.foreignName ?? '',
        qqMusicSingerMid: state.artist.qqMusicSingerMid ?? '',
        metadataSource: state.artist.metadataSource ?? '',
        metadataFetchedAt: state.artist.metadataFetchedAt ?? '',
        metadataConfidence: state.artist.metadataConfidence ? String(state.artist.metadataConfidence) : '',
        artworkUrl: state.artist.customArtworkUrl ?? state.artist.artworkUrl ?? ''
      } as Record<string, string>
    }
    if (state.kind === 'editPlaylist') return { name: state.playlist.name } as Record<string, string>
    if (state.kind === 'createPlaylist') return { name: '新建播放列表' } as Record<string, string>
    return {}
  }, [state])
  const [values, setValues] = React.useState<Record<string, string>>(initialValues)
  const [metadataMessage, setMetadataMessage] = React.useState<string>('')
  const [isMetadataLookupInFlight, setIsMetadataLookupInFlight] = React.useState(false)
  React.useEffect(() => setValues(initialValues), [initialValues])
  const update = React.useCallback((key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
  }, [])
  const hasChanges = React.useMemo(() => {
    if (isDelete) return true
    const keys = new Set([...Object.keys(initialValues), ...Object.keys(values)])
    for (const key of keys) {
      if ((initialValues[key] ?? '') !== (values[key] ?? '')) return true
    }
    return state.kind === 'createPlaylist'
  }, [initialValues, isDelete, state.kind, values])
  const handleTrackMetadataLookup = React.useCallback(async () => {
    if (state.kind !== 'editTrack' || !window.kmgccc?.syncTrackInfo) return
    setIsMetadataLookupInFlight(true)
    setMetadataMessage('')
    try {
      const result = await window.kmgccc.syncTrackInfo({
        ...state.track,
        title: values.title?.trim() || state.track.title,
        artist: values.artist?.trim() || state.track.artist,
        album: values.album?.trim() || state.track.album,
        artworkUrl: values.artworkUrl || state.track.artworkUrl,
        lyricsText: values.lyricsText,
        syncedLyrics: values.lyricsText
      } as LocalAudioImport)
      const track = result.track
      setValues((current) => ({
        ...current,
        title: track.title || current.title,
        artist: track.artist || current.artist,
        album: track.album || current.album,
        artworkUrl: track.artworkUrl || current.artworkUrl,
        lyricsText: track.syncedLyrics || track.lyricsText || current.lyricsText,
        syncedLyrics: track.syncedLyrics || track.lyricsText || current.syncedLyrics,
        qqMusicSongId: track.qqMusicSongId || current.qqMusicSongId,
        metadataSource: track.metadataSource || current.metadataSource || 'metadata',
        metadataFetchedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        metadataConfidence: current.metadataConfidence || '0.86'
      }))
      setMetadataMessage(result.statuses.track === 'completed' || result.statuses.lyrics === 'completed' ? '已补全缺失字段' : '没有可补全字段')
    } catch {
      setMetadataMessage('暂未补全元数据')
    } finally {
      setIsMetadataLookupInFlight(false)
    }
  }, [state, values])
  const handleAlbumMetadataLookup = React.useCallback(async () => {
    if (state.kind !== 'editAlbum' || !window.kmgccc?.lookupAlbumMetadata) return
    setIsMetadataLookupInFlight(true)
    setMetadataMessage('')
    try {
      const result = await window.kmgccc.lookupAlbumMetadata({
        title: values.title,
        artist: values.artist
      })
      if (!result) {
        setMetadataMessage('没有可补全字段')
        return
      }
      setValues((current) => ({
        ...current,
        title: typeof result.title === 'string' ? result.title : current.title,
        artist: typeof result.artist === 'string' ? result.artist : current.artist,
        releaseYear: typeof result.releaseYear === 'number' ? String(result.releaseYear) : current.releaseYear,
        releaseDate: typeof result.releaseDate === 'string' ? result.releaseDate : current.releaseDate,
        albumType: typeof result.albumType === 'string' ? result.albumType : current.albumType,
        genreTags: Array.isArray(result.genreTags) ? result.genreTags.filter((tag): tag is string => typeof tag === 'string').join(', ') : current.genreTags,
        artworkUrl: typeof result.artworkUrl === 'string' ? result.artworkUrl : current.artworkUrl,
        metadataSource: typeof result.metadataSource === 'string' ? result.metadataSource : current.metadataSource,
        metadataFetchedAt: typeof result.metadataFetchedAt === 'string' ? result.metadataFetchedAt : current.metadataFetchedAt,
        metadataConfidence: typeof result.metadataConfidence === 'number' ? result.metadataConfidence.toFixed(2) : current.metadataConfidence
      }))
      setMetadataMessage('已补全缺失字段')
    } catch {
      setMetadataMessage('暂未补全元数据')
    } finally {
      setIsMetadataLookupInFlight(false)
    }
  }, [state, values])
  const handleArtistMetadataLookup = React.useCallback(async () => {
    if (state.kind !== 'editArtist' || !window.kmgccc?.lookupArtistMetadata) return
    setIsMetadataLookupInFlight(true)
    setMetadataMessage('')
    try {
      const result = await window.kmgccc.lookupArtistMetadata({ name: values.name })
      if (!result) {
        setMetadataMessage('没有可补全字段')
        return
      }
      setValues((current) => ({
        ...current,
        name: typeof result.name === 'string' ? result.name : current.name,
        genreTags: Array.isArray(result.genreTags) ? result.genreTags.filter((tag): tag is string => typeof tag === 'string').join(', ') : current.genreTags,
        metadataSource: typeof result.metadataSource === 'string' ? result.metadataSource : current.metadataSource,
        metadataFetchedAt: typeof result.metadataFetchedAt === 'string' ? result.metadataFetchedAt : current.metadataFetchedAt,
        metadataConfidence: typeof result.metadataConfidence === 'number' ? result.metadataConfidence.toFixed(2) : current.metadataConfidence
      }))
      setMetadataMessage('已补全缺失字段')
    } catch {
      setMetadataMessage('暂未补全元数据')
    } finally {
      setIsMetadataLookupInFlight(false)
    }
  }, [state, values])
  const lookupCover = React.useCallback(async (kind: 'track' | 'album' | 'artist') => {
    if (!window.kmgccc?.lookupCover) return []
    const candidates = await window.kmgccc.lookupCover({
      kind,
      title: values.title,
      artist: kind === 'artist' ? values.name : values.artist,
      album: kind === 'album' ? values.title : values.album,
      duration: state.kind === 'editTrack' ? state.track.duration : 0
    })
    return candidates.map((candidate) => candidate.artworkUrl).filter(Boolean)
  }, [state, values])
  const albumFallbackArtworkUrl = React.useMemo(() => {
    if (state.kind !== 'editAlbum') return ''
    const firstTrack = snapshot.tracks.find((track) => track.albumId === state.album.id && track.artworkUrl)
    return firstTrack?.artworkUrl || state.album.artworkUrl || ''
  }, [snapshot.tracks, state])
  const handleArtistArtworkGenerate = React.useCallback(async () => {
    if (state.kind !== 'editArtist') return
    const sources = snapshot.tracks
      .filter((track) => track.artistId === state.artist.id)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((track) => track.artworkUrl)
      .filter((url): url is string => Boolean(url))
    for (const source of sources.slice(0, 3)) {
      try {
        const palette = await extractArtworkThemeColors(source)
        if (palette.length) {
          update('artworkUrl', createArtistPlaceholderArtwork(values.name ?? state.artist.name, palette.slice(0, 3)))
          return
        }
      } catch {
        // Fall back to the stable Swift-style placeholder below.
      }
    }
    update('artworkUrl', createArtistPlaceholderArtwork(values.name ?? state.artist.name))
  }, [snapshot.tracks, state, update, values.name])

  const title =
    state.kind === 'editTrack' ? '编辑歌曲信息'
      : state.kind === 'editAlbum' ? '编辑专辑信息'
        : state.kind === 'editArtist' ? '编辑艺人信息'
          : state.kind === 'editPlaylist' ? '编辑播放列表'
            : state.kind === 'batchEditTracks' ? '批量编辑歌曲信息'
              : state.kind === 'createPlaylist' ? '新建播放列表'
                : '确认删除'
  const icon = state.kind === 'editTrack' ? <Music2 size={22} />
    : state.kind === 'editAlbum' ? <Disc3 size={24} />
      : state.kind === 'editArtist' ? <UserRound size={24} />
        : state.kind === 'batchEditTracks' ? <Music2 size={22} />
        : <ListMusic size={22} />
  const detail =
    state.kind === 'deleteTrack' ? `从资料库删除“${state.track.title}”？`
      : state.kind === 'deleteAlbum' ? `删除专辑“${state.album.title}”及其中 ${state.album.trackCount} 首歌曲？`
        : state.kind === 'deleteArtist' ? `删除艺人“${state.artist.name}”及其中 ${state.artist.trackCount} 首歌曲？`
          : state.kind === 'deletePlaylist' ? `删除播放列表“${state.playlist.name}”？`
            : ''

  return (
    <div className="library-dialog-backdrop no-drag" role="presentation" onMouseDown={onClose}>
      <section className={`library-dialog metadata-sheet ${state.kind === 'editTrack' ? 'track-sheet' : ''} ${isDelete ? 'danger' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="metadata-sheet-header">
          <strong>{icon}{title}</strong>
          <button className="metadata-sheet-close" type="button" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {isDelete ? (
          <p className="library-dialog-message">{detail}</p>
        ) : state.kind === 'editTrack' ? (
          <div className="library-dialog-form metadata-sheet-body">
            <MetadataArtworkSection title="插图" artworkUrl={values.artworkUrl} hasArtwork={Boolean(values.artworkUrl)} removeLabel="移除插图" onArtworkChange={(url) => update('artworkUrl', url)} onSearchArtwork={() => lookupCover('track')} />
            <span className="metadata-divider" />
            <MetadataSectionTitle icon={<Info size={16} />} title="元数据" />
            <LibraryDialogField label="歌曲标题" value={values.title ?? ''} onChange={(value) => update('title', value)} />
            <LibraryDialogField label="艺人" value={values.artist ?? ''} onChange={(value) => update('artist', value)} />
            <LibraryDialogField label="专辑" value={values.album ?? ''} onChange={(value) => update('album', value)} />
            <LibraryDialogField label="简介" multiline placeholder="添加歌曲介绍..." value={values.description ?? ''} onChange={(value) => update('description', value)} />
            <AlbumDescriptionFallback text={state.track.albumDescription} />
            <button className="metadata-pill-button metadata-lookup" type="button" disabled={isMetadataLookupInFlight} onClick={handleTrackMetadataLookup}>
              <Search size={15} />{isMetadataLookupInFlight ? '查找中...' : '查找元数据'}
            </button>
            {metadataMessage ? <span className="metadata-lookup-message">{metadataMessage}</span> : null}
            <MetadataDetails values={values} update={update} />
            <span className="metadata-divider" />
            <TrackLyricsEditor values={values} update={update} />
          </div>
        ) : state.kind === 'editAlbum' ? (
          <div className="library-dialog-form metadata-sheet-body">
            <MetadataArtworkSection title="封面" artworkUrl={values.artworkUrl} hasArtwork={Boolean(values.artworkUrl)} generateLabel="使用歌曲封面" fallbackArtworkUrl={albumFallbackArtworkUrl} onArtworkChange={(url) => update('artworkUrl', url)} onSearchArtwork={() => lookupCover('album')} />
            <span className="metadata-divider" />
            <LibraryDialogField label="专辑名称" value={values.title ?? ''} onChange={(value) => update('title', value)} />
            <LibraryDialogField label="介绍" multiline placeholder="添加专辑介绍..." value={values.description ?? ''} onChange={(value) => update('description', value)} />
            <LibraryDialogField label="发行年份" value={values.releaseYear ?? ''} onChange={(value) => update('releaseYear', value)} />
            <LibraryDialogField label="发行日期" value={values.releaseDate ?? ''} onChange={(value) => update('releaseDate', value)} />
            <LibraryDialogField label="专辑类型" value={values.albumType ?? ''} onChange={(value) => update('albumType', value)} />
            <LibraryDialogField label="流派 / 标签" placeholder="用逗号分隔" value={values.genreTags ?? ''} onChange={(value) => update('genreTags', value)} />
            <LibraryDialogField label="语言" value={values.language ?? ''} onChange={(value) => update('language', value)} />
            <LibraryDialogField label="厂牌 / 公司" value={values.labelOrCompany ?? ''} onChange={(value) => update('labelOrCompany', value)} />
            <button className="metadata-pill-button metadata-lookup" type="button" disabled={isMetadataLookupInFlight} onClick={handleAlbumMetadataLookup}>
              <Search size={15} />{isMetadataLookupInFlight ? '查找中...' : '查找元数据'}
            </button>
            {metadataMessage ? <span className="metadata-lookup-message">{metadataMessage}</span> : null}
            <ReadonlyMetadataBlock rows={[
              ['QQMusic Album MID', values.qqMusicAlbumMid ?? ''],
              ['来源', values.metadataSource ?? ''],
              ['获取时间', values.metadataFetchedAt ?? ''],
              ['置信度', values.metadataConfidence ?? '']
            ]} />
          </div>
        ) : state.kind === 'editArtist' ? (
          <div className="library-dialog-form metadata-sheet-body">
            <MetadataArtworkSection title="封面" artworkUrl={values.artworkUrl} hasArtwork={Boolean(values.artworkUrl)} generateLabel="生成封面" fallbackArtworkUrl={state.artist.artworkUrl} onArtworkChange={(url) => update('artworkUrl', url)} onSearchArtwork={() => lookupCover('artist')} onGenerateArtwork={handleArtistArtworkGenerate} />
            <span className="metadata-divider" />
            <LibraryDialogField label="艺人名称" value={values.name ?? ''} onChange={(value) => update('name', value)} />
            <LibraryDialogField label="介绍" multiline value={values.description ?? ''} onChange={(value) => update('description', value)} />
            <LibraryDialogField label="流派 / 标签" placeholder="用逗号分隔" value={values.genreTags ?? ''} onChange={(value) => update('genreTags', value)} />
            <LibraryDialogField label="地区" value={values.region ?? ''} onChange={(value) => update('region', value)} />
            <LibraryDialogField label="外文名" value={values.foreignName ?? ''} onChange={(value) => update('foreignName', value)} />
            <button className="metadata-pill-button metadata-lookup" type="button" disabled={isMetadataLookupInFlight} onClick={handleArtistMetadataLookup}>
              <Search size={15} />{isMetadataLookupInFlight ? '查找中...' : '查找元数据'}
            </button>
            {metadataMessage ? <span className="metadata-lookup-message">{metadataMessage}</span> : null}
            <ReadonlyMetadataBlock rows={[
              ['QQMusic Singer MID', values.qqMusicSingerMid ?? ''],
              ['来源', values.metadataSource ?? ''],
              ['获取时间', values.metadataFetchedAt ?? ''],
              ['置信度', values.metadataConfidence ?? '']
            ]} />
          </div>
        ) : state.kind === 'batchEditTracks' ? (
          <div className="library-dialog-form metadata-sheet-body">
            <p className="library-dialog-message">已选择 {state.tracks.length} 首歌曲。只会批量写入下面非空字段，留空的字段保持原值。</p>
            <LibraryDialogField label="艺人" value={values.artist ?? ''} onChange={(value) => update('artist', value)} />
            <LibraryDialogField label="专辑" value={values.album ?? ''} onChange={(value) => update('album', value)} />
            <LibraryDialogField label="流派 / 标签" placeholder="用逗号分隔" value={values.genreTags ?? ''} onChange={(value) => update('genreTags', value)} />
            <LibraryDialogField label="语言" value={values.language ?? ''} onChange={(value) => update('language', value)} />
            <LibraryDialogField label="厂牌 / 公司" value={values.labelOrCompany ?? ''} onChange={(value) => update('labelOrCompany', value)} />
          </div>
        ) : (
          <div className="library-dialog-form">
            <LibraryDialogField label="播放列表名称" value={values.name ?? ''} onChange={(value) => update('name', value)} />
          </div>
        )}

        <footer>
          <button type="button" onClick={onClose}>取消</button>
          <button className={isDelete ? 'danger' : 'primary'} type="button" disabled={!hasChanges} onClick={() => onSubmit(values)}>
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
  placeholder,
  multiline = false,
  onChange
}: {
  label: string
  value: string
  type?: 'text' | 'number'
  placeholder?: string
  multiline?: boolean
  onChange: (value: string) => void
}): React.ReactElement {
  return (
    <label className="library-dialog-field">
      <span>{label}</span>
      {multiline
        ? <textarea placeholder={placeholder} value={value} onChange={(event) => onChange(event.currentTarget.value)} />
        : <input placeholder={placeholder} type={type} min={type === 'number' ? 1 : undefined} step={type === 'number' ? 1 : undefined} value={value} onChange={(event) => onChange(event.currentTarget.value)} />}
    </label>
  )
}

function MetadataSectionTitle({ icon, title }: { icon: React.ReactNode; title: string }): React.ReactElement {
  return <div className="metadata-section-title">{icon}<strong>{title}</strong></div>
}

function MetadataArtworkSection({
  title,
  artworkUrl,
  hasArtwork,
  generateLabel,
  removeLabel,
  fallbackArtworkUrl,
  onArtworkChange,
  onSearchArtwork,
  onGenerateArtwork
}: {
  title: string
  artworkUrl?: string
  hasArtwork: boolean
  generateLabel?: string
  removeLabel?: string
  fallbackArtworkUrl?: string
  onArtworkChange: (url: string) => void
  onSearchArtwork?: () => Promise<string[]>
  onGenerateArtwork?: () => void | Promise<void>
}): React.ReactElement {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [candidates, setCandidates] = React.useState<string[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const handleFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') onArtworkChange(reader.result)
    })
    reader.readAsDataURL(file)
    event.currentTarget.value = ''
  }, [onArtworkChange])
  const handleSearch = React.useCallback(async () => {
    if (!onSearchArtwork) return
    setIsSearching(true)
    setMessage('')
    try {
      const nextCandidates = await onSearchArtwork()
      setCandidates(nextCandidates)
      if (nextCandidates[0]) onArtworkChange(nextCandidates[0])
      setMessage(nextCandidates.length ? '' : '没有找到可用封面')
    } catch {
      setMessage('封面查找失败')
    } finally {
      setIsSearching(false)
    }
  }, [onArtworkChange, onSearchArtwork])
  const handleGenerate = React.useCallback(() => {
    if (onGenerateArtwork) {
      void onGenerateArtwork()
      return
    }
    onArtworkChange(fallbackArtworkUrl || '')
  }, [fallbackArtworkUrl, onArtworkChange, onGenerateArtwork])

  return (
    <section className="metadata-artwork-section">
      <MetadataSectionTitle icon={<ImageIcon size={17} />} title={title} />
      <div className="metadata-artwork-row">
        <div className="metadata-artwork-preview">
          {artworkUrl ? <ArtworkImage src={artworkUrl} maxSize={220} alt="" /> : <ImageIcon size={36} />}
        </div>
        <div className="metadata-artwork-actions">
          <input ref={inputRef} className="metadata-artwork-file" type="file" accept="image/*" onChange={handleFileChange} />
          <button className="metadata-pill-button" type="button" onClick={() => inputRef.current?.click()}><Upload size={14} />选择图片</button>
          <button className="metadata-pill-button" type="button" disabled={isSearching || !onSearchArtwork} onClick={() => { void handleSearch() }}><Search size={14} />{isSearching ? '查找中...' : '查找封面'}</button>
          {generateLabel ? <button className="metadata-pill-button" type="button" disabled={!fallbackArtworkUrl && !onGenerateArtwork} onClick={handleGenerate}><Sparkles size={14} />{generateLabel}</button> : null}
          {hasArtwork && removeLabel ? <button className="metadata-pill-button" type="button" onClick={() => onArtworkChange('')}><Trash2 size={14} />{removeLabel}</button> : null}
          {message ? <span className="metadata-artwork-message">{message}</span> : null}
        </div>
        {candidates.length ? (
          <div className="metadata-cover-candidates">
            {candidates.map((candidate) => (
              <button className={candidate === artworkUrl ? 'active' : ''} key={candidate} type="button" onClick={() => onArtworkChange(candidate)}>
                <ArtworkImage src={candidate} maxSize={96} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function ReadonlyMetadataBlock({ rows }: { rows: Array<[string, string]> }): React.ReactElement {
  return (
    <section className="metadata-readonly">
      <strong>来源信息</strong>
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <code>{value.trim() ? value : '未记录'}</code>
        </div>
      ))}
    </section>
  )
}

function MetadataDetails({ values, update }: { values: Record<string, string>; update: (key: string, value: string) => void }): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false)
  return (
    <section className="metadata-details">
      <button className="metadata-disclosure" type="button" onClick={() => setExpanded((value) => !value)}>
        <ChevronRight size={16} className={expanded ? 'open' : ''} />
        <ListMusic size={16} />
        <strong>更多详细元数据</strong>
      </button>
      {expanded ? (
        <div className="metadata-details-body">
          <LibraryDialogField label="流派 / 标签" placeholder="用逗号分隔" value={values.genreTags ?? ''} onChange={(value) => update('genreTags', value)} />
          <LibraryDialogField label="语言" value={values.language ?? ''} onChange={(value) => update('language', value)} />
          <LibraryDialogField label="厂牌 / 公司" value={values.labelOrCompany ?? ''} onChange={(value) => update('labelOrCompany', value)} />
          <LibraryDialogField label="发行日期" placeholder="YYYY-MM-DD" value={values.releaseDate ?? ''} onChange={(value) => update('releaseDate', value)} />
          <ReadonlyMetadataBlock rows={[
            ['QQMusic Song MID', values.qqMusicSongMid ?? ''],
            ['来源', values.metadataSource ?? ''],
            ['获取时间', values.metadataFetchedAt ?? ''],
            ['置信度', values.metadataConfidence ?? '']
          ]} />
        </div>
      ) : null}
    </section>
  )
}

function AlbumDescriptionFallback({ text }: { text?: string }): React.ReactElement | null {
  if (!text?.trim()) return null
  return (
    <div className="metadata-description-fallback">
      <span>来自专辑介绍</span>
      <p>{text}</p>
    </div>
  )
}

function TrackLyricsEditor({ values, update }: { values: Record<string, string>; update: (key: string, value: string) => void }): React.ReactElement {
  const offset = Number(values.lyricsTimeOffsetMs || 0)
  const [searchMessage, setSearchMessage] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [lyricsMode, setLyricsMode] = React.useState<'line' | 'word'>('word')
  const [includeTranslation, setIncludeTranslation] = React.useState(true)
  const [lyricsPlatform, setLyricsPlatform] = React.useState<'amll' | 'qq' | 'kugou' | 'netease'>('amll')
  const lyricsInputRef = React.useRef<HTMLInputElement | null>(null)
  const handleLyricsFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') update('lyricsText', reader.result)
    })
    reader.readAsText(file)
    event.currentTarget.value = ''
  }, [update])
  const handleLyricsSearch = React.useCallback(async () => {
    if (!window.kmgccc?.lookupLyrics) return
    setIsSearching(true)
    setSearchMessage('')
    try {
      const result = await window.kmgccc.lookupLyrics({
        title: values.title,
        artist: values.artist,
        album: values.album,
        duration: Number(values.duration || 0),
        neteaseSongId: values.neteaseSongId,
        qqMusicSongId: values.qqMusicSongId,
        mode: lyricsMode,
        includeTranslation,
        platform: lyricsPlatform
      })
      const text = result?.syncedLyrics || result?.lyricsText || ''
      if (text.trim()) {
        update('lyricsText', text)
        update('syncedLyrics', text)
        if (result?.neteaseSongId) update('neteaseSongId', String(result.neteaseSongId))
        if (result?.qqMusicSongId) update('qqMusicSongId', result.qqMusicSongId)
        setSearchMessage('已应用歌词')
      } else {
        setSearchMessage('暂未找到歌词')
      }
    } catch {
      setSearchMessage('歌词搜索失败')
    } finally {
      setIsSearching(false)
    }
  }, [includeTranslation, lyricsMode, lyricsPlatform, update, values.album, values.artist, values.duration, values.neteaseSongId, values.qqMusicSongId, values.title])
  return (
    <section className="metadata-lyrics-editor">
      <div className="metadata-lyrics-head">
        <MetadataSectionTitle icon={<TextQuote size={16} />} title="歌词 (TTML)" />
        <a className="metadata-pill-button" href="https://github.com/amll-dev/amll-ttml-db" target="_blank" rel="noreferrer"><ExternalLink size={14} />AMLL DB</a>
        <a className="metadata-pill-button" href="https://amll-ttml-tool.stevexmh.net/" target="_blank" rel="noreferrer"><Hammer size={14} />TTML Tool</a>
        <input ref={lyricsInputRef} className="metadata-artwork-file" type="file" accept=".ttml,.xml,.txt,.lrc,text/plain,text/xml,application/xml" onChange={handleLyricsFileChange} />
        <button className="metadata-pill-button" type="button" onClick={() => lyricsInputRef.current?.click()}><Upload size={14} />导入...</button>
        <button className="metadata-pill-button" type="button" onClick={() => update('lyricsText', '')}>清除歌词</button>
      </div>
      <p>AMLL DB 歌词库中的 TTML 专为 AMLL 组件设计，支持对唱歌词、背景歌词等高级特性，来自网络的转换歌词仅为歌词缺失情况下的备选。您也可以使用 AMLL TTML Tool 自己制作歌词使用或贡献到 AMLL DB。</p>
      <textarea className="metadata-lyrics-textarea" value={values.lyricsText ?? ''} onChange={(event) => update('lyricsText', event.currentTarget.value)} />
      <span className="metadata-lyrics-note">仅支持 TTML 歌词。LRC / TXT / 普通文本请通过歌词搜索或导入流程自动转换。</span>
      <div className="metadata-offset">
        <div>
          <span>歌词时间偏移</span>
          <output>{`${offset >= 0 ? '+' : ''}${(offset / 1000).toFixed(2)} s`}</output>
          <button className="metadata-pill-button" type="button" onClick={() => update('lyricsTimeOffsetMs', '0')}>重置</button>
        </div>
        <input type="range" min="-5000" max="5000" step="100" value={values.lyricsTimeOffsetMs ?? '0'} onChange={(event) => update('lyricsTimeOffsetMs', event.currentTarget.value)} />
        <small>将所有歌词时间轴提前或延后。</small>
      </div>
      <section className="metadata-lyrics-search">
        <MetadataSectionTitle icon={<Search size={16} />} title="歌词搜索" />
        <div className="metadata-search-grid">
          <LibraryDialogField label="歌曲名" value={values.title ?? ''} onChange={(value) => update('title', value)} />
          <LibraryDialogField label="艺人" value={values.artist ?? ''} onChange={(value) => update('artist', value)} />
        </div>
        <div className="metadata-token-row">
          <span>模式</span>
          <button className={lyricsMode === 'line' ? 'active' : ''} type="button" onClick={() => setLyricsMode('line')}>逐行</button>
          <button className={lyricsMode === 'word' ? 'active' : ''} type="button" onClick={() => setLyricsMode('word')}>逐词</button>
          <span>翻译</span>
          <button className={includeTranslation ? 'active' : ''} type="button" onClick={() => setIncludeTranslation(true)}>开</button>
          <button className={!includeTranslation ? 'active' : ''} type="button" onClick={() => setIncludeTranslation(false)}>关</button>
        </div>
        <div className="metadata-token-row">
          <span>平台</span>
          <button className={lyricsPlatform === 'amll' ? 'active' : ''} type="button" onClick={() => setLyricsPlatform('amll')}>AMLL DB</button>
          <button className={lyricsPlatform === 'qq' ? 'active' : ''} type="button" onClick={() => setLyricsPlatform('qq')}>QQ 音乐</button>
          <button className={lyricsPlatform === 'kugou' ? 'active' : ''} type="button" onClick={() => setLyricsPlatform('kugou')}>酷狗</button>
          <button className={lyricsPlatform === 'netease' ? 'active' : ''} type="button" onClick={() => setLyricsPlatform('netease')}>网易云</button>
          <button className="search" type="button" disabled={isSearching} onClick={handleLyricsSearch}><Search size={14} />{isSearching ? '搜索中...' : '搜索'}</button>
        </div>
        {searchMessage ? <span className="metadata-lookup-message">{searchMessage}</span> : null}
      </section>
    </section>
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
  playbackSource,
  externalPlaybackMode,
  externalPlaybackSnapshot,
  isExternalPlaybackSupported,
  onSelectPlaybackSource,
  isCollapsed,
  onToggle,
  onResizeStart,
  onToggleFullscreenLyrics,
  onOpenSettings,
  isDarkAppearance,
  onToggleAppearance,
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
  playbackSource: PlaybackSourceKind
  externalPlaybackMode: ExternalPlaybackSourceMode
  externalPlaybackSnapshot: ExternalPlaybackSnapshot | null
  isExternalPlaybackSupported: boolean
  onSelectPlaybackSource: (source: PlaybackSourceKind, mode?: ExternalPlaybackSourceMode) => void
  isCollapsed: boolean
  onToggle: () => void
  onResizeStart: (event: React.PointerEvent) => void
  onToggleFullscreenLyrics: () => void
  onOpenSettings: () => void
  isDarkAppearance: boolean
  onToggleAppearance: () => void
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
  const [isArtistsExpanded, setIsArtistsExpanded] = React.useState(false)
  const [isAlbumsExpanded, setIsAlbumsExpanded] = React.useState(false)
  const [isSourceMenuOpen, setIsSourceMenuOpen] = React.useState(false)
  const externalModeLabels: Record<ExternalPlaybackSourceMode, string> = {
    thirdParty: '第三方音乐软件',
    other: '其他源',
    auto: '自动检测'
  }
  const externalSourceDetail = React.useMemo(() => {
    if (!isExternalPlaybackSupported) return '仅 Windows 可用'
    if (playbackSource !== 'external') return '未连接'
    if (!externalPlaybackSnapshot?.available) return '不可用'
    if (externalPlaybackSnapshot.connectionState === 'disconnected') return '未检测到'
    if (externalPlaybackSnapshot.connectionState === 'connectedNoMetadata') return '等待媒体信息'
    return externalPlaybackSnapshot.sourceAppUserModelId || externalModeLabels[externalPlaybackMode]
  }, [externalPlaybackMode, externalPlaybackSnapshot, isExternalPlaybackSupported, playbackSource])
  const chooseExternalMode = React.useCallback((mode: ExternalPlaybackSourceMode) => {
    if (!isExternalPlaybackSupported) return
    setIsSourceMenuOpen(false)
    onSelectPlaybackSource('external', mode)
  }, [isExternalPlaybackSupported, onSelectPlaybackSource])
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
              <ArtworkImage className={`playlist-cover ${isImportedPlaylist(playlist) ? 'generated' : 'logo'}`} src={playlistArtworkFor(playlist)} maxSize={72} style={playlistArtworkStyle(playlist)} alt="" />
              <span>{playlist.name}</span>
            </button>
          )) : (
            <button className="playlist-row muted" type="button" onClick={onCreatePlaylist}>
              <ArtworkImage className="playlist-cover logo" src={playlistArtworkFor(null)} maxSize={72} alt="" />
              <span>新建播放列表</span>
            </button>
          )}
        </section>

        <section className="sidebar-section compact no-drag">
          <button className="sidebar-label as-button disclosure" type="button" aria-expanded={isArtistsExpanded} onClick={() => setIsArtistsExpanded((value) => !value)}>
            <span>艺人</span>
            <ChevronRight className={`sidebar-disclosure-chevron ${isArtistsExpanded ? 'open' : ''}`} size={14} />
          </button>
          {isArtistsExpanded ? (
            <>
              <button className={`playlist-row compact-item all-entry ${route.name === 'artistDetail' && route.id === 'all-artists' ? 'active' : ''}`} type="button" onClick={() => onNavigate({ name: 'artistDetail', id: 'all-artists', title: '所有艺人' })}>
                <UserRound size={16} />
                <span>查看全部艺人</span>
              </button>
              {snapshot.artists.slice(0, 8).map((artist) => (
                <button
                  className={`playlist-row compact-item child-entry ${route.name === 'artistDetail' && route.id === artist.id ? 'active' : ''}`}
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
            </>
          ) : null}
          <button className="sidebar-label as-button disclosure" type="button" aria-expanded={isAlbumsExpanded} onClick={() => setIsAlbumsExpanded((value) => !value)}>
            <span>专辑</span>
            <ChevronRight className={`sidebar-disclosure-chevron ${isAlbumsExpanded ? 'open' : ''}`} size={14} />
          </button>
          {isAlbumsExpanded ? (
            <>
              <button className={`playlist-row compact-item all-entry ${route.name === 'albumDetail' && route.id === 'all-albums' ? 'active' : ''}`} type="button" onClick={() => onNavigate({ name: 'albumDetail', id: 'all-albums', title: '所有专辑' })}>
                <Disc3 size={16} />
                <span>查看全部专辑</span>
              </button>
              {snapshot.albums.slice(0, 8).map((album) => (
                <button
                  className={`playlist-row compact-item child-entry ${route.name === 'albumDetail' && route.id === album.id ? 'active' : ''}`}
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
            </>
          ) : null}
        </section>
      </div>

      <div className="sidebar-footer no-drag">
        <div className="sidebar-source" role="tablist" aria-label="播放源">
          <button className={playbackSource === 'local' ? 'active' : ''} type="button" onClick={() => onSelectPlaybackSource('local')}>
            本地
          </button>
          <div className={`sidebar-external-source ${playbackSource === 'external' ? 'active' : ''} ${!isExternalPlaybackSupported ? 'disabled' : ''}`}>
            <button type="button" disabled={!isExternalPlaybackSupported} onClick={() => onSelectPlaybackSource('external', externalPlaybackMode)}>
              <span>{externalModeLabels[externalPlaybackMode]}</span>
            </button>
            <button
              className="source-menu-trigger"
              type="button"
              aria-label="选择外部播放源"
              aria-expanded={isSourceMenuOpen}
              disabled={!isExternalPlaybackSupported}
              onClick={(event) => {
                event.stopPropagation()
                if (!isExternalPlaybackSupported) return
                setIsSourceMenuOpen((value) => !value)
              }}
            >
              <ChevronDown size={14} />
            </button>
            {isSourceMenuOpen ? (
              <div className="source-menu glass-panel" style={{ '--filter-url': 'url(#lg-sidebar)' } as React.CSSProperties}>
                <button className={externalPlaybackMode === 'thirdParty' ? 'selected' : ''} type="button" disabled={!isExternalPlaybackSupported} onClick={() => chooseExternalMode('thirdParty')}>
                  第三方音乐软件
                </button>
                <button className={externalPlaybackMode === 'other' ? 'selected' : ''} type="button" disabled={!isExternalPlaybackSupported} onClick={() => chooseExternalMode('other')}>
                  其他源
                </button>
                <button className={externalPlaybackMode === 'auto' ? 'selected' : ''} type="button" disabled={!isExternalPlaybackSupported} onClick={() => chooseExternalMode('auto')}>
                  自动检测
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className={`sidebar-source-detail ${playbackSource === 'external' ? 'active' : ''}`}>{externalSourceDetail}</div>

        <div className="sidebar-bottom">
          <button className="round-control" type="button" aria-label="设置" onClick={onOpenSettings}>
            <Settings size={18} />
          </button>
          <button className={`round-control appearance-control ${isDarkAppearance ? 'is-dark' : 'is-light'}`} type="button" aria-label={isDarkAppearance ? '切换到浅色模式' : '切换到深色模式'} onClick={onToggleAppearance}>
            {isDarkAppearance ? <Moon className="appearance-icon moon" key="moon" size={18} /> : <Sun className="appearance-icon sun" key="sun" size={18} />}
          </button>
          <button className="round-control" type="button" aria-label="全屏播放" onClick={onToggleFullscreenLyrics}>
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
  const resultItems = [
    ['歌曲信息', state.results?.track],
    ['歌手信息', state.results?.artist],
    ['专辑信息', state.results?.album],
    ['歌词', state.results?.lyrics]
  ] as const
  const labelForResult = (status: ImportSyncFieldStatus | undefined): string => {
    if (state.status === 'running' && !status) return '等待'
    if (status === 'completed') return '已补全'
    if (status === 'failed') return '失败'
    if (status === 'noResults') return '未找到'
    return '未返回'
  }
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
        {state.results || state.status !== 'running' ? (
          <div className="import-sync-results">
            {resultItems.map(([label, result]) => (
              <span key={label} className={`import-sync-result ${result ?? 'pending'}`}>
                <b>{label}</b>
                {labelForResult(result)}
              </span>
            ))}
          </div>
        ) : null}
        <button type="button" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  )
})

const Toolbar = React.memo(function Toolbar({
  route,
  onNavigateHome,
  onImportAudioFile,
  onPlayCurrentView,
  onToggleLyricsSidebar,
  isLyricsSidebarOpen,
  sortLabel,
  sortDirection,
  isMultiSelectMode,
  onOpenSortMenu,
  onToggleMultiSelect
}: {
  route: AppRoute
  onNavigateHome: () => void
  onImportAudioFile: () => void
  onPlayCurrentView: () => void
  onToggleLyricsSidebar: () => void
  isLyricsSidebarOpen: boolean
  sortLabel: string
  sortDirection: SortDirection
  isMultiSelectMode: boolean
  onOpenSortMenu: (event: React.MouseEvent<HTMLElement>) => void
  onToggleMultiSelect: () => void
}): React.ReactElement {
  const isHome = route.name === 'home'
  return (
    <header className="toolbar chrome-drag">
      <div className="toolbar-left no-drag">
        {isHome ? (
          <div className="toolbar-pill glass-panel" style={{ '--filter-url': 'url(#lg-toolbar-pill)' } as React.CSSProperties}>
            <button type="button" aria-label="返回主页" onClick={onNavigateHome}>
              <ChevronLeft size={23} />
            </button>
            <span className="toolbar-divider" />
            <button type="button" aria-label="前进">
              <ChevronRight size={23} />
            </button>
          </div>
        ) : (
          <>
            <button
              className="toolbar-circle toolbar-liquid-pad glass-panel"
              type="button"
              aria-label={`排序：${sortLabel}，${sortDirection === 'asc' ? '升序' : '降序'}`}
              onClick={onOpenSortMenu}
              style={{ '--filter-url': 'url(#lg-circle)' } as React.CSSProperties}
            >
              <ArrowDownUp size={21} />
            </button>
            <button
              className={`toolbar-circle toolbar-liquid-pad glass-panel ${isMultiSelectMode ? 'active' : ''}`}
              type="button"
              aria-label="多选"
              aria-pressed={isMultiSelectMode}
              onClick={onToggleMultiSelect}
              style={{ '--filter-url': 'url(#lg-circle)' } as React.CSSProperties}
            >
              <CheckCircle2 size={21} />
            </button>
          </>
        )}

        <div className="toolbar-pill toolbar-play-add glass-panel" style={{ '--filter-url': 'url(#lg-toolbar-pill)' } as React.CSSProperties}>
          <button type="button" aria-label="播放" onClick={onPlayCurrentView}>
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
  sectionOrder,
  onNavigate,
  onPlayTrack,
  onPlayRoute,
  onEditTrack,
  onDeleteTrack,
  onEditArtist,
  onDeleteArtist,
  onEditAlbum,
  onDeleteAlbum,
  onEditPlaylist,
  onDeletePlaylist,
  onOpenContextMenu
}: {
  snapshot: HomeSnapshot
  albums: Map<string, HomeAlbumCard>
  sectionOrder: HomeSectionID[]
  onNavigate: (route: AppRoute) => void
  onPlayTrack: (trackId: string) => void
  onPlayRoute: (route: DetailRoute, preferredTrackId?: string) => void
  onEditTrack: (track: HomeTrack) => void
  onDeleteTrack: (track: HomeTrack) => void
  onEditArtist: (artist: HomeArtistCard) => void
  onDeleteArtist: (artist: HomeArtistCard) => void
  onEditAlbum: (album: HomeAlbumCard) => void
  onDeleteAlbum: (album: HomeAlbumCard) => void
  onEditPlaylist: (playlist: HomePlaylistCard) => void
  onDeletePlaylist: (playlist: HomePlaylistCard) => void
  onOpenContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
}): React.ReactElement {
  const homeScroll = useElasticScroll<HTMLElement>()
  const heroTrack = snapshot.heroTrack ?? snapshot.tracks[0] ?? null
  const renderSection = (section: HomeSectionID): React.ReactNode => {
    if (section === 'featured') {
      return heroTrack ? <HomeHero key={section} track={heroTrack} albums={albums} onPlay={() => onPlayTrack(heroTrack.id)} onEdit={onEditTrack} onDelete={onDeleteTrack} onOpenContextMenu={onOpenContextMenu} /> : null
    }
    if (section === 'artists') {
      return (
        <HomeSectionBlock key={section} title="艺人" variant="clipCarousel" onShowAll={() => onNavigate({ name: 'artistDetail', id: 'all-artists', title: '所有艺人' })}>
          <div className="home-card-grid compact">
            {snapshot.artists.map((artist) => (
              <button
                className="home-person-card home-liquid-card glass-panel"
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
                {artist.artworkUrl ? (
                  <ArtworkImage src={artist.artworkUrl} maxSize={220} alt="" loading="eager" />
                ) : (
                  <span className="artist-avatar">{artist.name}</span>
                )}
                <strong>{artist.name}</strong>
              </button>
            ))}
          </div>
        </HomeSectionBlock>
      )
    }
    if (section === 'albums') {
      return (
        <HomeSectionBlock key={section} title="专辑" variant="clipCarousel" onShowAll={() => onNavigate({ name: 'albumDetail', id: 'all-albums', title: '所有专辑' })}>
          <div className="home-card-grid">
            {snapshot.albums.map((album) => (
              <button
                className="home-album-card home-liquid-card glass-panel"
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
                <ArtworkImage src={albumArtworkFor(album)} maxSize={260} alt="" loading="eager" />
                <strong>{album.title}</strong>
                <span>{album.artist}</span>
              </button>
            ))}
          </div>
        </HomeSectionBlock>
      )
    }
    if (section === 'playlists') {
      return (
        <HomeSectionBlock key={section} title="播放列表">
          <div className="home-playlist-grid">
            {snapshot.playlists.map((playlist) => (
              <button
                className="home-playlist-card home-liquid-card glass-panel"
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
                <ArtworkImage className={`home-playlist-artwork ${isImportedPlaylist(playlist) ? 'generated' : 'logo'}`} src={playlistArtworkFor(playlist)} maxSize={96} style={playlistArtworkStyle(playlist)} alt="" loading="eager" />
                <span>
                  <strong>{playlist.name}</strong>
                  <small>{playlist.trackCount} 首</small>
                </span>
              </button>
            ))}
          </div>
        </HomeSectionBlock>
      )
    }
    return <HomeStatsSection key={section} stats={snapshot.stats} />
  }

  return (
    <section className={`home-page ${homeScroll.isScrolling ? 'is-scrolling' : ''}`} ref={homeScroll.scrollRef} onWheel={homeScroll.onWheel} onScroll={homeScroll.onScroll}>
      <div
        className={`home-scroll-content ${homeScroll.elasticOffset !== 0 ? 'elastic-active' : ''} ${
          homeScroll.isSettling ? 'settling' : ''
        }`}
        style={homeScroll.elasticOffset !== 0 ? { transform: `translate3d(0, ${homeScroll.elasticOffset}px, 0)` } : undefined}
      >
        {sectionOrder.map(renderSection)}
      </div>
    </section>
  )
})

const HomeHero = React.memo(function HomeHero({
  track,
  albums,
  onPlay,
  onEdit,
  onDelete,
  onOpenContextMenu
}: {
  track: HomeTrack
  albums: Map<string, HomeAlbumCard>
  onPlay: () => void
  onEdit: (track: HomeTrack) => void
  onDelete: (track: HomeTrack) => void
  onOpenContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void
}): React.ReactElement {
  const artwork = trackArtwork(track, albums)
  return (
    <header
      className="home-hero"
      onContextMenu={(event) => onOpenContextMenu(event, [
        { label: '播放', onSelect: onPlay },
        { label: '编辑歌曲信息', onSelect: () => onEdit(track) },
        { label: '-', onSelect: () => {} },
        { label: '删除歌曲', danger: true, onSelect: () => onDelete(track) }
      ])}
    >
      <ArtworkImage className="home-hero-bg" src={artwork} maxSize={420} alt="" />
      <div className="home-hero-cover">
        <ArtworkImage src={artwork} maxSize={320} alt="" />
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
  variant,
  onShowAll,
  children
}: {
  title: string
  variant?: 'clipCarousel'
  onShowAll?: () => void
  children: React.ReactNode
}): React.ReactElement {
  return (
    <section className={`home-section-block ${variant === 'clipCarousel' ? 'home-clip-carousel-section' : ''}`}>
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
              <ArtworkImage src={item.artworkUrl || albumArtwork} maxSize={64} alt="" />
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
  translation?: string
  words?: ParsedLyricWord[]
}

type ParsedLyricWord = {
  startTime: number
  endTime: number
  word: string
}

function parseLyricTimestamp(rawTimestamp: string): number | null {
  const trimmed = rawTimestamp.trim()
  const unitMatch = trimmed.match(/^(\d+(?:\.\d+)?)(ms|s)$/i)
  if (unitMatch) {
    const value = Number(unitMatch[1])
    return unitMatch[2].toLowerCase() === 'ms' ? value / 1000 : value
  }
  const parts = trimmed.split(':')
  if (parts.length < 2 || parts.length > 3) return null
  const secondsMatch = parts[parts.length - 1].match(/^(\d{2})(?:[.:](\d{1,3}))?$/)
  if (!secondsMatch) return null
  const seconds = Number(secondsMatch[1])
  const fraction = secondsMatch[2] ? Number(`0.${secondsMatch[2].padEnd(3, '0').slice(0, 3)}`) : 0
  const minutes = Number(parts[parts.length - 2])
  const hours = parts.length === 3 ? Number(parts[0]) : 0
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
  return hours * 3600 + minutes * 60 + seconds + fraction
}

function escapeLyricText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function parseInlineWordTimings(rawText: string, lineStartMs: number, fallbackEndMs: number): ParsedLyricWord[] {
  const matches = [...rawText.matchAll(/<((?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.:]\d{1,3})?|\d+(?:\.\d+)?(?:ms|s))>/gi)]
    .map((match) => {
      const time = parseLyricTimestamp(match[1])
      if (time === null) return null
      return { index: match.index ?? 0, length: match[0].length, time }
    })
    .filter((entry): entry is { index: number; length: number; time: number } => entry !== null)
  if (!matches.length) return []

  const words: ParsedLyricWord[] = []
  matches.forEach((entry, index) => {
    const segmentStart = entry.index + entry.length
    const segmentEnd = matches[index + 1]?.index ?? rawText.length
    const word = rawText.slice(segmentStart, segmentEnd)
    const cleaned = word.replace(/<[^>]+>/g, '')
    if (!cleaned.trim()) return
    const startTime = Math.max(lineStartMs, Math.round(entry.time * 1000))
    const nextStartTime = matches[index + 1] ? Math.round(matches[index + 1].time * 1000) : fallbackEndMs
    const endTime = Math.max(startTime + 80, Math.min(nextStartTime - 20, fallbackEndMs))
    words.push({ startTime, endTime, word: cleaned })
  })
  return words
}

function parseTTMLLyrics(rawLyrics: string): ParsedLyricLine[] {
  if (!/<(?:tt|p|span)\b/i.test(rawLyrics)) return []
  const document = new DOMParser().parseFromString(rawLyrics, 'text/xml')
  if (document.querySelector('parsererror')) return []
  const paragraphs = Array.from(document.getElementsByTagName('p'))
  const parsed: ParsedLyricLine[] = []
  paragraphs.forEach((paragraph, index) => {
    const begin = parseLyricTimestamp(paragraph.getAttribute('begin') ?? '')
    const end = parseLyricTimestamp(paragraph.getAttribute('end') ?? '')
    const spans = Array.from(paragraph.getElementsByTagName('span'))
    const translation = spans
      .find((span) => span.getAttribute('ttm:role') === 'x-translation' || span.getAttribute('role') === 'x-translation')
      ?.textContent?.trim()
    const wordSpans = spans.filter((span) => span.getAttribute('ttm:role') !== 'x-translation' && span.getAttribute('role') !== 'x-translation')
    const words = wordSpans
      .map((span) => {
        const start = parseLyricTimestamp(span.getAttribute('begin') ?? '')
        const finish = parseLyricTimestamp(span.getAttribute('end') ?? '')
        const word = span.textContent ?? ''
        if (start === null || finish === null || !word.trim()) return null
        return {
          startTime: Math.round(start * 1000),
          endTime: Math.max(Math.round(start * 1000) + 80, Math.round(finish * 1000)),
          word
        } satisfies ParsedLyricWord
      })
      .filter((word): word is ParsedLyricWord => word !== null)
    const text = escapeLyricText(wordSpans.map((span) => span.textContent ?? '').join(''))
    if (!text) return
    const lineStartMs = begin !== null ? Math.round(begin * 1000) : words[0]?.startTime
    const lineEndMs = end !== null ? Math.round(end * 1000) : words[words.length - 1]?.endTime
    if (lineStartMs === undefined) {
      parsed.push({ id: `ttml-plain-${index}`, time: null, text })
      return
    }
    parsed.push({
      id: `ttml-${index}-${lineStartMs}`,
      time: lineStartMs / 1000,
      text,
      translation,
      words: words.length ? words.map((word, wordIndex) => ({
        ...word,
        endTime: Math.min(word.endTime, lineEndMs ?? word.endTime + 1200),
        word: wordIndex === words.length - 1 ? word.word.trimEnd() : word.word
      })) : undefined
    })
  })
  return parsed.sort((a, b) => (a.time ?? Number.MAX_SAFE_INTEGER) - (b.time ?? Number.MAX_SAFE_INTEGER))
}

function parseLyrics(track: Track | null | undefined): ParsedLyricLine[] {
  const rawLyrics = track?.syncedLyrics || track?.lyricsText || ''
  const ttmlLines = parseTTMLLyrics(rawLyrics)
  if (ttmlLines.length) return ttmlLines
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
      const nextLine = rawLines[lineIndex + 1]
      const nextLineTimestamp = nextLine ? [...nextLine.matchAll(/\[([0-9]{1,2}:[0-9]{2}(?:[.:][0-9]{1,3})?)\]/g)].map((nextMatch) => parseLyricTimestamp(nextMatch[1])).find((value): value is number => value !== null) : null
      const lineStartMs = Math.round(time * 1000)
      const fallbackEndMs = Math.max(lineStartMs + 1200, Math.round((nextLineTimestamp ?? time + 4.2) * 1000) - 80)
      const words = parseInlineWordTimings(text, lineStartMs, fallbackEndMs)
      parsed.push({
        id: `${lineIndex}-${timestampIndex}-${time}`,
        time,
        text: escapeLyricText(text.replace(/<[^>]+>/g, '')) || '♪',
        words: words.length ? words : undefined
      })
    })
  })

  return parsed.sort((a, b) => (a.time ?? Number.MAX_SAFE_INTEGER) - (b.time ?? Number.MAX_SAFE_INTEGER))
}

function trackHasTimedLyrics(track: Track | null | undefined): boolean {
  const rawLyrics = track?.syncedLyrics || track?.lyricsText || ''
  return /\[[0-9]{1,2}:[0-9]{2}(?:[.:][0-9]{1,3})?\]/.test(rawLyrics) || /<(?:tt|p|span)\b/i.test(rawLyrics)
}

function activeLyricIndex(lines: ParsedLyricLine[], playbackTime: number, leadInMs = 180): number {
  const leadInSeconds = Math.max(0, leadInMs) / 1000
  let activeIndex = -1
  lines.forEach((line, index) => {
    if (line.time !== null && line.time <= playbackTime + leadInSeconds) {
      activeIndex = index
    }
  })
  return activeIndex
}

function amllLyricLinesFromParsed(lines: ParsedLyricLine[], trackDuration: number, leadInMs = 0, nearSwitchGapMs = 0): LyricLine[] {
  const timedLines = lines.filter((line): line is ParsedLyricLine & { time: number } => line.time !== null)
  const durationMs = trackDuration > 0 ? Math.round(trackDuration * 1000) : null
  const visualLeadInMs = Math.max(0, leadInMs)
  const visualNearSwitchGapMs = Math.max(0, nearSwitchGapMs)

  return timedLines.map((line, index) => {
    const rawStartTime = Math.max(0, Math.round(line.time * 1000))
    const rawNextStartTime = timedLines[index + 1] ? Math.round(timedLines[index + 1].time * 1000) : null
    const startTime = Math.max(0, rawStartTime - visualLeadInMs)
    const nextStartTime = rawNextStartTime !== null ? Math.max(0, rawNextStartTime - visualLeadInMs) : null
    const inferredEndTime = nextStartTime !== null ? nextStartTime - 80 : durationMs ?? startTime + 4200
    const rawEndTime = Math.max(startTime + 1200, Math.min(inferredEndTime, startTime + 8200))
    const shouldCompressLineEnd = rawNextStartTime !== null && line.words?.length && rawNextStartTime - (line.words.at(-1)?.endTime ?? rawStartTime) <= visualNearSwitchGapMs
    const endTime = shouldCompressLineEnd && nextStartTime !== null
      ? Math.max(startTime + 320, Math.min(rawEndTime, nextStartTime - 40))
      : rawEndTime
    const words = line.words?.length
      ? line.words.map((word) => ({
        ...word,
        startTime: Math.max(startTime, word.startTime - visualLeadInMs),
        endTime: Math.min(Math.max(word.startTime - visualLeadInMs + 80, word.endTime - visualLeadInMs), endTime)
      }))
      : [{ startTime, endTime, word: line.text }]

    return {
      words,
      translatedLyric: line.translation ?? '',
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
  renderQuality?: LyricsRenderQuality
  reduceHighlight?: boolean
}

const AMLLLyricsSurface = React.memo(function AMLLLyricsSurface({
  lines,
  track,
  playbackTime,
  isPlaying,
  onSeek,
  variant,
  renderQuality = 'balanced',
  reduceHighlight = false,
  leadInMs = 0,
  nearSwitchGapMs = 0,
  colorStyle
}: {
  lines: ParsedLyricLine[]
  track: Track | null | undefined
  playbackTime: number
  isPlaying: boolean
  onSeek: (seconds: number) => void
  variant: 'side' | 'fullscreen'
  renderQuality?: LyricsRenderQuality
  reduceHighlight?: boolean
  leadInMs?: number
  nearSwitchGapMs?: number
  colorStyle?: React.CSSProperties
}): React.ReactElement {
  const amllLines = React.useMemo(() => amllLyricLinesFromParsed(lines, track?.duration ?? 0, leadInMs, nearSwitchGapMs), [leadInMs, lines, nearSwitchGapMs, track?.duration])
  const amllShellRef = React.useRef<HTMLDivElement | null>(null)
  const [isLyricHovering, setIsLyricHovering] = React.useState(false)
  const isLyricHoveringRef = React.useRef(false)
  const [isSeekingLyric, setIsSeekingLyric] = React.useState(false)
  const seekingTimerRef = React.useRef<number | null>(null)
  const isExternalPlaybackTrack = track?.metadataSource === 'externalPlayback'
  const amllOptimizeOptions = React.useMemo(() => ({ resetLineTimestamps: false }), [])
  const amllBottomLine = React.useMemo(
    () => variant === 'fullscreen' ? <span className="fullscreen-amll-bottom">{track ? `${track.artist} · ${track.album}` : ''}</span> : undefined,
    [track?.album, track?.artist, variant]
  )

  React.useEffect(() => () => {
    if (seekingTimerRef.current !== null) window.clearTimeout(seekingTimerRef.current)
  }, [])

  const handleLyricLineClick = React.useCallback((event: LyricLineMouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    const line = amllLines[event.lineIndex]
    if (!line) return
    setIsSeekingLyric(true)
    if (seekingTimerRef.current !== null) window.clearTimeout(seekingTimerRef.current)
    seekingTimerRef.current = window.setTimeout(() => {
      setIsSeekingLyric(false)
      seekingTimerRef.current = null
    }, 320)
    onSeek(line.startTime / 1000)
  }, [amllLines, onSeek])

  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>): void => {
    const target = event.target instanceof HTMLElement ? event.target : null
    const lyricLine = target?.closest<HTMLElement>('[class*="_lyricLine"]')
    const isMainLyricLine = !!lyricLine && !Array.from(lyricLine.classList).some((className) => (
      className.includes('_lyricLineWrapper') || className.includes('_bottomLine')
    ))
    if (isLyricHoveringRef.current !== isMainLyricLine) {
      isLyricHoveringRef.current = isMainLyricLine
      setIsLyricHovering(isMainLyricLine)
    }
  }, [])

  const handlePointerLeave = React.useCallback((): void => {
    isLyricHoveringRef.current = false
    setIsLyricHovering(false)
  }, [])

  return (
    <div
      className={`amll-lyrics-surface ${variant === 'fullscreen' ? 'fullscreen-amll-shell' : 'side-amll-shell'} ${variant} quality-${renderQuality} ${reduceHighlight ? 'reduce-highlight' : ''}`}
      ref={amllShellRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="amll-quality-frame">
        <LyricPlayer
          key={`${variant}-${track?.id ?? 'empty'}`}
          className={`fullscreen-amll-player amll-lyrics-player ${variant}`}
          style={colorStyle}
          data-lyric-count={amllLines.length}
          lyricLines={amllLines}
          currentTime={Math.max(0, Math.round(playbackTime * 1000))}
          isSeeking={isSeekingLyric}
          playing={isPlaying}
          alignAnchor="center"
          alignPosition={variant === 'fullscreen' ? 0.38 : 0.18}
          enableBlur={renderQuality !== 'performance' && !isLyricHovering}
          enableScale={renderQuality !== 'performance'}
          enableSpring={renderQuality === 'quality' && !isExternalPlaybackTrack}
          wordFadeWidth={0.5}
          optimizeOptions={amllOptimizeOptions}
          bottomLine={amllBottomLine}
          onLyricLineClick={handleLyricLineClick}
        />
      </div>
    </div>
  )
})

const LyricsLineList = React.memo(function LyricsLineList({
  lines,
  currentLineIndex,
  onSeek,
  variant,
  reduceHighlight = false
}: {
  lines: ParsedLyricLine[]
  currentLineIndex: number
  onSeek: (seconds: number) => void
  variant: 'side' | 'fullscreen'
  reduceHighlight?: boolean
}): React.ReactElement {
  const activeLineRef = React.useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (currentLineIndex < 0) return
    activeLineRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentLineIndex])

  return (
    <div className={`lyrics-line-list ${variant} ${reduceHighlight ? 'reduce-highlight' : ''}`}>
      {lines.map((line, index) => (
        <button
          className={`lyrics-line ${index === currentLineIndex ? 'active' : ''} ${line.time === null ? 'plain' : ''}`}
          key={line.id}
          ref={index === currentLineIndex ? activeLineRef : undefined}
          type="button"
          disabled={line.time === null}
          onPointerDown={(event) => {
            if (line.time === null) return
            event.preventDefault()
            event.stopPropagation()
            onSeek(line.time)
          }}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
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
  onResizeStart,
  renderQuality = 'balanced',
  reduceHighlight = false,
  leadInMs = 180,
  nearSwitchGapMs = 0,
  colorStyle
}: LyricsSurfaceProps & {
  onResizeStart: (event: React.PointerEvent) => void
  leadInMs?: number
  nearSwitchGapMs?: number
  colorStyle?: React.CSSProperties
}): React.ReactElement {
  const lines = React.useMemo(() => parseLyrics(track), [track?.lyricsText, track?.syncedLyrics])
  const currentLineIndex = React.useMemo(() => activeLyricIndex(lines, playbackTime, leadInMs), [leadInMs, lines, playbackTime])
  const artwork = trackArtwork(track, albums)
  const hasTimedLyrics = lines.some((line) => line.time !== null)

  return (
    <aside className="lyrics-side-panel glass-panel no-drag">
      <div className="lyrics-side-resize-handle" role="separator" aria-orientation="vertical" aria-label="调整歌词侧栏宽度" onPointerDown={onResizeStart} />
      <div className="lyrics-side-head">
        <ArtworkImage src={artwork} maxSize={96} alt="" />
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
          <AMLLLyricsSurface lines={lines} track={track} playbackTime={playbackTime} isPlaying={isPlaying} onSeek={onSeek} variant="side" renderQuality={renderQuality} reduceHighlight={reduceHighlight} leadInMs={leadInMs} nearSwitchGapMs={nearSwitchGapMs} colorStyle={colorStyle} />
        ) : (
          <LyricsLineList lines={lines} currentLineIndex={currentLineIndex} onSeek={onSeek} variant="side" reduceHighlight={reduceHighlight} />
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
  bkThemeStyle,
  playbackTime,
  isPlaying,
  volume,
  ledCount,
  ledBrightnessLevels,
  ledSpeed,
  ledValues,
  skinID,
  visualizerMode,
  artBackgroundEnabled,
  artworkFrameMaskEnabled,
  artworkFrameIndex,
  rotatingCdMode,
  appleDynamicBackgroundEnabled,
  appleMeshSpeed,
  cassetteKmgLookEnabled,
  onSeek,
  isArtworkBpmPulseEnabled,
  onArtworkBpmPulseToggle,
  onArtworkManualBpmOpen,
  onArtworkBeatApprove,
  artworkBeatFeedback,
  renderQuality = 'balanced',
  reduceHighlight = false,
  lyricToneSeed,
  onLyricToneSeedChange
}: LyricsSurfaceProps & {
  bkThemeStyle: React.CSSProperties
  volume: number
  ledCount: number
  ledBrightnessLevels: number
  ledSpeed: number
  ledValues: number[]
  skinID: FullscreenSkinID
  visualizerMode: VisualizerMode
  artBackgroundEnabled: boolean
  artworkFrameMaskEnabled: boolean
  artworkFrameIndex: number
  rotatingCdMode: boolean
  appleDynamicBackgroundEnabled: boolean
  appleMeshSpeed: AppleMeshSpeed
  cassetteKmgLookEnabled: boolean
  isArtworkBpmPulseEnabled: boolean
  onArtworkBpmPulseToggle: () => void
  onArtworkManualBpmOpen: () => void
  onArtworkBeatApprove: () => void
  artworkBeatFeedback: ArtworkBeatSaveFeedback
  lyricToneSeed: RgbColor | null
  onLyricToneSeedChange: (seed: RgbColor) => void
}): React.ReactElement {
  const lines = React.useMemo(() => parseLyrics(track), [track?.lyricsText, track?.syncedLyrics])
  const currentLineIndex = React.useMemo(() => activeLyricIndex(lines, playbackTime), [lines, playbackTime])
  const hasTimedLyrics = lines.some((line) => line.time !== null)
  const artwork = trackArtwork(track, albums)
  const artworkFrame = artworkFrameAssets[artworkFrameIndex % artworkFrameAssets.length]
  const pageRef = React.useRef<HTMLElement | null>(null)
  const isSamplingBackgroundRef = React.useRef(false)
  const hasSampledFullscreenBackgroundRef = React.useRef(false)
  const publishedFullscreenToneTrackRef = React.useRef<string | null>(null)
  const [pixelStretchBackground, setPixelStretchBackground] = React.useState<string | null>(null)
  const [amllColorPhase, setAmllColorPhase] = React.useState(0)
  const [activeBKThemeStyle, setActiveBKThemeStyle] = React.useState<React.CSSProperties>(bkThemeStyle)
  const useCoverGradientBlur = skinID === 'fullscreen.coverGradientBlur'
  const nowPlayingSkinID: NowPlayingSkinID = skinID === 'fullscreen.coverGradientBlur' ? 'coverLed' : skinID
  const showBKBackground = artBackgroundEnabled && !useCoverGradientBlur && nowPlayingSkinID !== 'appleStyle'
  const fullscreenPageStyle = React.useMemo(
    () => ({
      ...bkThemeStyle,
      ...fullscreenLyricColorStyleFromBKTheme(activeBKThemeStyle, 0, lyricToneSeed)
    }) as React.CSSProperties,
    [activeBKThemeStyle, bkThemeStyle, lyricToneSeed]
  )

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

  React.useEffect(() => {
    setAmllColorPhase(0)
    setActiveBKThemeStyle(bkThemeStyle)
    hasSampledFullscreenBackgroundRef.current = false
    publishedFullscreenToneTrackRef.current = null
  }, [bkThemeStyle, track?.id])

  const sampleFullscreenBackgroundColor = React.useCallback(async (): Promise<void> => {
    const page = pageRef.current
    if (!page || !window.kmgccc?.sampleWindowColor) return
    if (isSamplingBackgroundRef.current) return
    if (hasSampledFullscreenBackgroundRef.current) return
    hasSampledFullscreenBackgroundRef.current = true
    isSamplingBackgroundRef.current = true
    const rect = page.getBoundingClientRect()
    try {
      const sample = await window.kmgccc.sampleWindowColor({
        x: rect.left + rect.width * 0.66,
        y: rect.top + rect.height * 0.10,
        width: rect.width * 0.22,
        height: rect.height * 0.18
      })
      if (sample) onLyricToneSeedChange(sample)
    } finally {
      window.setTimeout(() => {
        isSamplingBackgroundRef.current = false
      }, 3200)
    }
  }, [onLyricToneSeedChange])

  React.useEffect(() => {
    if (!showBKBackground) return
    const timer = window.setTimeout(() => {
      void sampleFullscreenBackgroundColor()
    }, 520)
    return () => window.clearTimeout(timer)
  }, [sampleFullscreenBackgroundColor, showBKBackground, track?.id])

  const publishInitialFullscreenToneSeed = React.useCallback((seed: RgbColor): void => {
    const toneTrackKey = track?.id ?? 'kmgccc-empty-track'
    if (publishedFullscreenToneTrackRef.current === toneTrackKey) return
    publishedFullscreenToneTrackRef.current = toneTrackKey
    onLyricToneSeedChange(seed)
  }, [onLyricToneSeedChange, track?.id])

  return (
    <section ref={pageRef} className={`fullscreen-lyrics-page skin-${skinID.replace('.', '-')} ${isPlaying ? 'is-playing' : 'is-paused'} amll-color-phase-${amllColorPhase % 2} no-drag`} style={fullscreenPageStyle}>
      {useCoverGradientBlur ? (
        <>
          {pixelStretchBackground ? <img className="fullscreen-lyrics-stretch-bg" src={pixelStretchBackground} alt="" decoding="async" /> : null}
          <img className="fullscreen-lyrics-bg" src={artwork} alt="" decoding="async" />
        </>
      ) : nowPlayingSkinID === 'appleStyle' ? (
        <AppleNowPlayingBackground track={track} isPlaying={isPlaying} dynamicEnabled={appleDynamicBackgroundEnabled} speed={appleMeshSpeed} />
      ) : showBKBackground ? (
        <BKArtBackground track={track} isPlaying={isPlaying} themeStyle={bkThemeStyle} mode="fullscreenDotOnly" onColorPhaseChange={setAmllColorPhase} onColorThemeChange={setActiveBKThemeStyle} onToneSeedChange={publishInitialFullscreenToneSeed} />
      ) : (
        <UnifiedMeshBackground />
      )}
      {!useCoverGradientBlur ? (
        <div className="fullscreen-lyrics-artwork-stage">
          {nowPlayingSkinID === 'coverLed' ? (
            <ClassicCoverNowPlaying artwork={artwork} artworkFrame={artworkFrame} masked={artworkFrameMaskEnabled} isBpmPulseEnabled={isArtworkBpmPulseEnabled} feedback={artworkBeatFeedback} onBpmPulseToggle={onArtworkBpmPulseToggle} onManualBpmOpen={onArtworkManualBpmOpen} onBeatApprove={onArtworkBeatApprove} />
          ) : nowPlayingSkinID === 'appleStyle' ? (
            <AppleStyleNowPlayingArtwork artwork={artwork} />
          ) : nowPlayingSkinID === 'rotatingCover' ? (
            <RotatingCoverNowPlaying artwork={artwork} isPlaying={isPlaying} cdMode={rotatingCdMode} />
          ) : (
            <CassetteNowPlayingArtwork artwork={artwork} isPlaying={isPlaying} ledValues={ledValues} showKmgLook={cassetteKmgLookEnabled} />
          )}
          {visualizerMode === 'led' ? <NowPlayingVolumeLed volume={volume} isPlaying={isPlaying} ledCount={ledCount} brightnessLevels={ledBrightnessLevels} ledSpeed={ledSpeed} ledValues={ledValues} /> : null}
          {visualizerMode === 'spectrum' ? <NowPlayingSpectrum isPlaying={isPlaying} /> : null}
        </div>
      ) : null}
      <div className="fullscreen-lyrics-copy">
        <span>{isPlaying ? '正在播放' : '已暂停'}</span>
        <strong>{track?.title ?? '未选择歌曲'}</strong>
        <small>{track ? `${track.artist} · ${track.album}` : '选择一首歌曲后显示歌词'}</small>
      </div>
      <div className="fullscreen-lyrics-lines">
        {hasTimedLyrics ? (
              <AMLLLyricsSurface lines={lines} track={track} playbackTime={playbackTime} isPlaying={isPlaying} onSeek={onSeek} variant="fullscreen" renderQuality={renderQuality} reduceHighlight={reduceHighlight} colorStyle={fullscreenPageStyle} />
        ) : lines.length ? (
          <LyricsLineList lines={lines} currentLineIndex={currentLineIndex} onSeek={onSeek} variant="fullscreen" reduceHighlight={reduceHighlight} />
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
  ledValues,
  skinID,
  visualizerMode,
  artBackgroundEnabled,
  artworkFrameMaskEnabled,
  artworkFrameIndex,
  rotatingCdMode,
  appleDynamicBackgroundEnabled,
  appleMeshSpeed,
  cassetteKmgLookEnabled,
  isArtworkBpmPulseEnabled,
  onArtworkBpmPulseToggle,
  onArtworkManualBpmOpen,
  onArtworkBeatApprove,
  artworkBeatFeedback,
  onLyricToneSeedChange
}: {
  track: Track | null | undefined
  albums: Map<string, HomeAlbumCard>
  bkThemeStyle: React.CSSProperties
  isPlaying: boolean
  volume: number
  ledCount: number
  ledBrightnessLevels: number
  ledSpeed: number
  ledValues: number[]
  skinID: NowPlayingSkinID
  visualizerMode: VisualizerMode
  artBackgroundEnabled: boolean
  artworkFrameMaskEnabled: boolean
  artworkFrameIndex: number
  rotatingCdMode: boolean
  appleDynamicBackgroundEnabled: boolean
  appleMeshSpeed: AppleMeshSpeed
  cassetteKmgLookEnabled: boolean
  isArtworkBpmPulseEnabled: boolean
  onArtworkBpmPulseToggle: () => void
  onArtworkManualBpmOpen: () => void
  onArtworkBeatApprove: () => void
  artworkBeatFeedback: ArtworkBeatSaveFeedback
  onLyricToneSeedChange: (seed: RgbColor) => void
}): React.ReactElement {
  const pageRef = React.useRef<HTMLElement | null>(null)
  const isSamplingBackgroundRef = React.useRef(false)
  const artwork = trackArtwork(track, albums)
  const artworkFrame = artworkFrameAssets[artworkFrameIndex % artworkFrameAssets.length]
  const showBKBackground = artBackgroundEnabled && skinID !== 'appleStyle'
  const sampleNowPlayingBackgroundColor = React.useCallback(async (): Promise<void> => {
    const page = pageRef.current
    if (!page || !window.kmgccc?.sampleWindowColor) return
    if (isSamplingBackgroundRef.current) return
    isSamplingBackgroundRef.current = true
    const rect = page.getBoundingClientRect()
    try {
      const sample = await window.kmgccc.sampleWindowColor({
        x: rect.left + rect.width * 0.60,
        y: rect.top + rect.height * 0.12,
        width: rect.width * 0.24,
        height: rect.height * 0.18
      })
      if (sample) onLyricToneSeedChange(sample)
    } finally {
      window.setTimeout(() => {
        isSamplingBackgroundRef.current = false
      }, 3200)
    }
  }, [onLyricToneSeedChange])

  React.useEffect(() => {
    if (!showBKBackground) return
    const timer = window.setTimeout(() => {
      void sampleNowPlayingBackgroundColor()
    }, 520)
    return () => window.clearTimeout(timer)
  }, [sampleNowPlayingBackgroundColor, showBKBackground, track?.id])

  return (
    <section ref={pageRef} className={`now-playing-page skin-${skinID.replace('.', '-')} ${isPlaying ? 'is-playing' : 'is-paused'} no-drag`}>
      {skinID === 'appleStyle' ? (
        <AppleNowPlayingBackground track={track} isPlaying={isPlaying} dynamicEnabled={appleDynamicBackgroundEnabled} speed={appleMeshSpeed} />
      ) : showBKBackground ? (
        <BKArtBackground track={track} isPlaying={isPlaying} themeStyle={bkThemeStyle} onToneSeedChange={onLyricToneSeedChange} onPaintRevealComplete={sampleNowPlayingBackgroundColor} />
      ) : (
        <UnifiedMeshBackground />
      )}
      <div className="now-playing-artwork-stage">
        {skinID === 'coverLed' ? (
          <ClassicCoverNowPlaying artwork={artwork} artworkFrame={artworkFrame} masked={artworkFrameMaskEnabled} isBpmPulseEnabled={isArtworkBpmPulseEnabled} feedback={artworkBeatFeedback} onBpmPulseToggle={onArtworkBpmPulseToggle} onManualBpmOpen={onArtworkManualBpmOpen} onBeatApprove={onArtworkBeatApprove} />
        ) : skinID === 'appleStyle' ? (
          <AppleStyleNowPlayingArtwork artwork={artwork} />
        ) : skinID === 'rotatingCover' ? (
          <RotatingCoverNowPlaying artwork={artwork} isPlaying={isPlaying} cdMode={rotatingCdMode} />
        ) : (
          <CassetteNowPlayingArtwork artwork={artwork} isPlaying={isPlaying} ledValues={ledValues} showKmgLook={cassetteKmgLookEnabled} />
        )}
        {visualizerMode === 'led' ? <NowPlayingVolumeLed volume={volume} isPlaying={isPlaying} ledCount={ledCount} brightnessLevels={ledBrightnessLevels} ledSpeed={ledSpeed} ledValues={ledValues} /> : null}
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
  isBpmPulseEnabled,
  feedback,
  onBpmPulseToggle,
  onManualBpmOpen,
  onBeatApprove
}: {
  artwork: string
  artworkFrame: string
  masked: boolean
  isBpmPulseEnabled: boolean
  feedback: ArtworkBeatSaveFeedback
  onBpmPulseToggle: () => void
  onManualBpmOpen: () => void
  onBeatApprove: () => void
}): React.ReactElement {
  const activeFrameIndex = Math.max(0, artworkFrameAssets.indexOf(artworkFrame))
  const clickTimerRef = React.useRef<number | null>(null)
  const longPressTimerRef = React.useRef<number | null>(null)
  const lastClickAtRef = React.useRef(0)
  const longPressHandledRef = React.useRef(false)

  React.useEffect(() => () => {
    if (clickTimerRef.current !== null) window.clearTimeout(clickTimerRef.current)
    if (longPressTimerRef.current !== null) window.clearTimeout(longPressTimerRef.current)
  }, [])

  const clearLongPressTimer = React.useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    longPressHandledRef.current = false
    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(() => {
      longPressHandledRef.current = true
      onBeatApprove()
    }, 650)
  }, [clearLongPressTimer, onBeatApprove])

  const handlePointerUp = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    clearLongPressTimer()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (longPressHandledRef.current) return

    const now = window.performance.now()
    if (now - lastClickAtRef.current <= 260) {
      lastClickAtRef.current = 0
      if (clickTimerRef.current !== null) {
        window.clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
      }
      onManualBpmOpen()
      return
    }

    lastClickAtRef.current = now
    if (clickTimerRef.current !== null) window.clearTimeout(clickTimerRef.current)
    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null
      lastClickAtRef.current = 0
      onBpmPulseToggle()
    }, 285)
  }, [clearLongPressTimer, onBpmPulseToggle, onManualBpmOpen])

  const handlePointerCancel = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    clearLongPressTimer()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [clearLongPressTimer])

  return (
    <button
      className={`now-playing-cover ${masked ? 'masked' : ''} ${isBpmPulseEnabled ? 'bpm-pulse-enabled' : ''}`}
      type="button"
      aria-label={isBpmPulseEnabled ? '关闭封面节奏律动' : '开启封面节奏律动'}
      aria-pressed={isBpmPulseEnabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
    >
      {masked ? (
        <>
          {artworkFrameAssets.map((frame, index) => (
            <img
              className={`now-playing-cover-image frame-layer ${index === activeFrameIndex ? 'active' : ''}`}
              key={frame}
              src={artwork}
              alt=""
              decoding="async"
              style={
                {
                  WebkitMaskImage: `url(${frame})`,
                  maskImage: `url(${frame})`
                } as React.CSSProperties
              }
            />
          ))}
          {artworkFrameAssets.map((frame, index) => (
            <span
              className={`now-playing-cover-mask-edge frame-layer ${index === activeFrameIndex ? 'active' : ''}`}
              key={`edge-${frame}`}
              style={
                {
                  WebkitMaskImage: `url(${frame})`,
                  maskImage: `url(${frame})`
                } as React.CSSProperties
              }
            />
          ))}
        </>
      ) : (
        <img className="now-playing-cover-image" src={artwork} alt="" decoding="async" />
      )}
      {feedback ? (
        <span className={`now-playing-beat-feedback ${feedback.kind}`}>
          {feedback.kind === 'waiting' ? '等待测速' : `${feedback.bpm} BPM`}
        </span>
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

function bkThemeColor(themeStyle: React.CSSProperties, key: string): RgbColor | null {
  const value = (themeStyle as Record<string, unknown>)[key]
  return typeof value === 'string' ? parseCssColor(value) : null
}

function shouldDrySameAlbumPaint(
  previousTrack: Track | null | undefined,
  nextTrack: Track | null | undefined,
  previousThemeStyle: React.CSSProperties,
  nextThemeStyle: React.CSSProperties
): boolean {
  if (!previousTrack || !nextTrack) return false
  if (previousTrack.id === nextTrack.id) return false
  if (!previousTrack.albumId || previousTrack.albumId !== nextTrack.albumId) return false

  const previousPrimary = bkThemeColor(previousThemeStyle, '--bk-bg-tone-1')
  const nextPrimary = bkThemeColor(nextThemeStyle, '--bk-bg-tone-1')
  const previousSecondary = bkThemeColor(previousThemeStyle, '--bk-bg-tone-2') ?? previousPrimary
  const nextSecondary = bkThemeColor(nextThemeStyle, '--bk-bg-tone-2') ?? nextPrimary
  if (!previousPrimary || !nextPrimary || !previousSecondary || !nextSecondary) return false

  const primaryDistance = colorDistance(previousPrimary, nextPrimary)
  const secondaryDistance = colorDistance(previousSecondary, nextSecondary)
  const primaryHueDistance = hueDistance(previousPrimary, nextPrimary)
  return primaryDistance < 34 && secondaryDistance < 42 && primaryHueDistance < 18
}

function dryBKPaintColor(value: string, amount: number): string {
  const parsed = parseCssColor(value)
  if (!parsed) return value
  const darkened = darkenRgb(parsed, amount)
  return rgbaString(darkened, parsed.a)
}

function dryBKPaintThemeStyle(themeStyle: React.CSSProperties, variantSeed: number): React.CSSProperties {
  const toneOne = bkThemeCssValue(themeStyle, '--bk-bg-tone-1')
  const toneTwo = bkThemeCssValue(themeStyle, '--bk-bg-tone-2')
  const toneThree = bkThemeCssValue(themeStyle, '--bk-bg-tone-3')
  const useSecondToneBrush = (variantSeed & 1) === 1 && Boolean(toneTwo)
  return {
    ...themeStyle,
    ...(toneOne ? { '--bk-bg-tone-1': dryBKPaintColor(useSecondToneBrush ? toneTwo : toneOne, useSecondToneBrush ? 0.13 : 0.16) } : null),
    ...(toneTwo ? { '--bk-bg-tone-2': dryBKPaintColor(useSecondToneBrush ? toneOne : toneTwo, useSecondToneBrush ? 0.12 : 0.14) } : null),
    ...(toneThree ? { '--bk-bg-tone-3': dryBKPaintColor(toneThree, 0.12) } : null)
  } as React.CSSProperties
}

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
  isPlaying,
  ledValues,
  showKmgLook
}: {
  artwork: string
  isPlaying: boolean
  ledValues: number[]
  showKmgLook: boolean
}): React.ReactElement {
  const capsuleValues = React.useMemo(() => {
    const source = ledValues.length ? ledValues : [0.18, 0.42, 0.28, 0.55, 0.82, 0.34, 0.48, 0.62, 0.40]
    return Array.from({ length: 9 }, (_, index) => {
      const value = source[index % source.length] ?? 0
      return isPlaying ? clampNumber(value, 0.12, 1) : 0.08
    })
  }, [isPlaying, ledValues])

  return (
    <div className="cassette-artwork">
      <img className="cassette-layer cassette-shell cassette-shell-light" src={tapeShell} alt="" decoding="async" />
      <img className="cassette-layer cassette-shell cassette-shell-dark" src={tapeDarkShell} alt="" decoding="async" />
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
      <div className={`cassette-holes ${isPlaying ? 'spinning' : ''}`}>
        <span className="cassette-hole cassette-hole-left">
          <img className="cassette-hole-image cassette-hole-light" src={lightHole} alt="" decoding="async" />
          <img className="cassette-hole-image cassette-hole-dark" src={darkHole} alt="" decoding="async" />
        </span>
        <span className="cassette-hole cassette-hole-right">
          <img className="cassette-hole-image cassette-hole-light" src={lightHole} alt="" decoding="async" />
          <img className="cassette-hole-image cassette-hole-dark" src={darkHole} alt="" decoding="async" />
        </span>
      </div>
      <div className="cassette-waveform" aria-hidden="true">
        {capsuleValues.map((value, index) => (
          <span
            key={index}
            className="cassette-waveform-bar"
            style={
              {
                '--cassette-wave-height': `${Math.max(7.2, value * 100)}%`,
                '--cassette-wave-primary': `${100 - index * 6}%`,
                '--cassette-wave-secondary': `${index * 6}%`
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      {showKmgLook ? <img className="cassette-kmglook" src={kmgLook} alt="" decoding="async" /> : null}
    </div>
  )
})

const BKArtBackground = React.memo(function BKArtBackground({
  track,
  isPlaying,
  themeStyle,
  mode = 'default',
  onColorPhaseChange,
  onColorThemeChange,
  onToneSeedChange,
  onPaintRevealComplete
}: {
  track: Track | null | undefined
  isPlaying: boolean
  themeStyle: React.CSSProperties
  mode?: 'default' | 'fullscreenDotOnly'
  onColorPhaseChange?: (phase: number) => void
  onColorThemeChange?: (themeStyle: React.CSSProperties) => void
  onToneSeedChange?: (seed: RgbColor) => void
  onPaintRevealComplete?: () => void
}): React.ReactElement {
  const isFullscreenDotOnly = mode === 'fullscreenDotOnly'
  const trackSeed = React.useMemo(() => hashString(track?.id ?? 'kmgccc-now-playing'), [track?.id])
  const transitionSeedRef = React.useRef(0)
  const themeStyleRef = React.useRef(themeStyle)
  const shouldDrySameAlbumPaintRef = React.useRef(false)
  themeStyleRef.current = shouldDrySameAlbumPaintRef.current ? dryBKPaintThemeStyle(themeStyle, trackSeed) : themeStyle
  const initialSurface = React.useMemo(() => makeBKSurfaceState(trackSeed, 0, isFullscreenDotOnly ? fullscreenBKDotStyle(trackSeed, 0) : null, themeStyle), [isFullscreenDotOnly, themeStyle, trackSeed])
  const [currentSurface, setCurrentSurface] = React.useState(initialSurface)
  const [previousSurface, setPreviousSurface] = React.useState<BKSurfaceState | null>(null)
  const [isDotExiting, setIsDotExiting] = React.useState(false)
  const [isRevealing, setIsRevealing] = React.useState(false)
  const currentSurfaceRef = React.useRef(currentSurface)
  currentSurfaceRef.current = currentSurface
  const lyricToneSeedRef = React.useRef<RgbColor | null>(null)
  const publishToneSeedRef = React.useRef<() => void>(() => undefined)
  const lastTrackSeedRef = React.useRef(trackSeed)
  const previousTrackRef = React.useRef<Track | null | undefined>(track)
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
      previousTrackRef.current = track
      shouldDrySameAlbumPaintRef.current = false
      setCurrentSurface(makeBKSurfaceState(trackSeed, 0, isFullscreenDotOnly ? fullscreenBKDotStyle(trackSeed, 0) : 'image', themeStyleRef.current))
      setPreviousSurface(null)
      setIsRevealing(false)
      return
    }
    const previousTrack = previousTrackRef.current
    shouldDrySameAlbumPaintRef.current = !isFullscreenDotOnly && shouldDrySameAlbumPaint(previousTrack, track, currentSurfaceRef.current.themeStyle, themeStyle)
    themeStyleRef.current = shouldDrySameAlbumPaintRef.current ? dryBKPaintThemeStyle(themeStyle, trackSeed) : themeStyle
    transitionSeedRef.current = 0
    setIsDotExiting(false)
    if (isFullscreenDotOnly) {
      setPreviousSurface(null)
      setCurrentSurface(makeBKSurfaceState(trackSeed, 0, fullscreenBKDotStyle(trackSeed, 0), themeStyleRef.current))
      setIsRevealing(false)
      window.requestAnimationFrame(() => {
        onPaintRevealComplete?.()
        publishToneSeedRef.current()
      })
    } else {
      setPreviousSurface(freezeBKSurfaceForTransition(currentSurfaceRef.current))
      setCurrentSurface(makeBKSurfaceState(trackSeed, 0, initialBKSurfaceStyle(trackSeed), themeStyleRef.current))
      setIsRevealing(true)
    }
    lastTrackSeedRef.current = trackSeed
    previousTrackRef.current = track
  }, [isFullscreenDotOnly, onPaintRevealComplete, trackSeed])

  React.useLayoutEffect(() => {
    if (lastTrackSeedRef.current !== trackSeed) return
    const nextThemeStyle = shouldDrySameAlbumPaintRef.current ? dryBKPaintThemeStyle(themeStyle, trackSeed) : themeStyle
    themeStyleRef.current = nextThemeStyle
    setCurrentSurface((surface) => ({ ...surface, themeStyle: nextThemeStyle }))
  }, [themeStyle, trackSeed])

  React.useEffect(() => {
    if (!isPlaying) return
    if (isFullscreenDotOnly) return
    if (isDotExiting) return
    if (isBKDotStyle(currentSurface.style)) return
    const delay = 15000
    const timer = window.setTimeout(() => {
      transitionSeedRef.current += 1
      setPreviousSurface(freezeBKSurfaceForTransition(currentSurface))
      setCurrentSurface(makeBKSurfaceState(trackSeed, transitionSeedRef.current, nextBKSurfaceStyle(currentSurface.style, transitionSeedRef.current, trackSeed), themeStyleRef.current))
      setIsRevealing(true)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [currentSurface, isDotExiting, isFullscreenDotOnly, isPlaying, trackSeed])

  React.useEffect(() => {
    if (!isDotExiting) return
    if (isFullscreenDotOnly) return
    const timer = window.setTimeout(() => {
      transitionSeedRef.current += 1
      setPreviousSurface(freezeBKSurfaceForTransition(currentSurface))
      setCurrentSurface(makeBKSurfaceState(trackSeed, transitionSeedRef.current, nextBKSurfaceStyle(currentSurface.style, transitionSeedRef.current, trackSeed), themeStyleRef.current))
      setIsDotExiting(false)
      setIsRevealing(true)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [currentSurface, isDotExiting, isFullscreenDotOnly, trackSeed])

  const handleRevealEnd = React.useCallback(() => {
    setPreviousSurface(null)
    setIsRevealing(false)
    window.requestAnimationFrame(() => {
      onPaintRevealComplete?.()
      publishToneSeedRef.current()
    })
  }, [onPaintRevealComplete])
  const handleDotComplete = React.useCallback(() => {
    transitionSeedRef.current += 1
    const nextStyle = isFullscreenDotOnly
      ? fullscreenBKDotStyle(trackSeed, transitionSeedRef.current)
      : nextBKSurfaceStyle(currentSurface.style, transitionSeedRef.current, trackSeed)
    setPreviousSurface(isFullscreenDotOnly ? null : freezeBKSurfaceForTransition(currentSurface))
    setCurrentSurface(makeBKSurfaceState(trackSeed, transitionSeedRef.current, nextStyle, themeStyleRef.current))
    setIsDotExiting(false)
    setIsRevealing(!isFullscreenDotOnly)
    if (isFullscreenDotOnly) {
      window.requestAnimationFrame(() => {
        onPaintRevealComplete?.()
        publishToneSeedRef.current()
      })
    }
  }, [currentSurface, isFullscreenDotOnly, onPaintRevealComplete, trackSeed])

  React.useEffect(() => {
    onColorPhaseChange?.(currentSurface.phaseOffset)
    onColorThemeChange?.(currentSurface.themeStyle)
  }, [currentSurface.phaseOffset, currentSurface.themeStyle, onColorPhaseChange, onColorThemeChange])

  React.useEffect(() => {
    if (!onToneSeedChange) return
    const publishSample = (): void => {
      const currentSeed = bkSurfaceLyricSeed(currentSurface)
      const previousPublished = lyricToneSeedRef.current
      if (!previousPublished || colorDistance(previousPublished, currentSeed) >= 3) {
        lyricToneSeedRef.current = currentSeed
        onToneSeedChange(currentSeed)
      }
    }
    publishToneSeedRef.current = publishSample
    if (previousSurface) return
    publishSample()
  }, [currentSurface, onToneSeedChange, previousSurface])

  return (
    <div className={`bk-art-background mode-${mode} ${isPlaying ? 'running' : 'frozen'} ${previousSurface !== null ? 'transitioning' : ''}`} aria-hidden="true">
      {previousSurface ? <BKArtSurface key={`previous-${bkSurfaceKey(previousSurface)}`} surface={previousSurface} className={`previous ${isBKDotStyle(previousSurface.style) && currentSurface.style === 'image' ? 'dot-exited' : ''}`} isRunning={false} /> : null}
      <BKArtSurface key={`current-${bkSurfaceKey(currentSurface)}`} surface={currentSurface} className={previousSurface !== null ? `current entering ${previousSurface.style === 'image' && currentSurface.style === 'image' ? 'paint-only' : ''}` : `current ${isDotExiting ? 'dot-exiting' : ''}`} isRunning={isPlaying && !isDotExiting && !isRevealing} onRevealEnd={previousSurface ? handleRevealEnd : undefined} onDotComplete={isBKDotStyle(currentSurface.style) && !isDotExiting ? handleDotComplete : undefined} />
    </div>
  )
})

type BKSurfaceStyle = 'image' | 'dot-a' | 'dot-b' | 'dot-c' | 'dot-d' | 'dot-e'

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

function bkSurfaceLyricSeed(surface: BKSurfaceState): RgbColor {
  const toneOne = parseCssRgbColor(surface.themeStyle['--bk-bg-tone-1' as keyof React.CSSProperties]) ?? { r: 132, g: 199, b: 221 }
  const toneTwo = parseCssRgbColor(surface.themeStyle['--bk-bg-tone-2' as keyof React.CSSProperties]) ?? toneOne
  if (surface.style === 'image') {
    const phase = surface.frozenImagePhase ?? currentBKImagePhase(surface)
    const toneOneValue = bkThemeCssValue(surface.themeStyle, '--bk-bg-tone-1')
    const toneTwoValue = bkThemeCssValue(surface.themeStyle, '--bk-bg-tone-2')
    const source = bkBackgroundAssets[(surface.phaseOffset + surface.seed + (phase === 'a' ? 0 : 1)) % bkBackgroundAssets.length]
    const sampled = tintedBKAverageCache.get(bkImagePhaseCacheKey(source, toneOneValue, toneTwoValue))
    if (sampled) return sampled
    const firstPaintTone = darkenRgb(toneOne, 0.18)
    return mixRgb(firstPaintTone, toneTwo, phase === 'a' ? 0.38 : 0.68)
  }
  const dotBlendByStyle: Record<BKSurfaceStyle, number> = {
    image: 0.48,
    'dot-a': 0.08,
    'dot-b': 0.24,
    'dot-c': 0.12,
    'dot-d': 0.30,
    'dot-e': 0.16
  }
  return mixRgb(toneOne, toneTwo, dotBlendByStyle[surface.style])
}

function isBKDotStyle(style: BKSurfaceStyle): boolean {
  return style !== 'image'
}

function nextBKSurfaceStyle(currentStyle: BKSurfaceStyle, transitionIndex: number, trackSeed: number): BKSurfaceStyle {
  const proposed = seededBKSurfaceStyle(trackSeed, transitionIndex)
  if (proposed !== currentStyle) return proposed
  if (proposed === 'image') return 'dot-a'
  const dotIndex = bkDotStyles.indexOf(proposed)
  return bkDotStyles[(dotIndex + 1) % bkDotStyles.length]
}

function initialBKSurfaceStyle(trackSeed: number): BKSurfaceStyle {
  return seededBKSurfaceStyle(trackSeed, 0)
}

const bkDotStyles: BKSurfaceStyle[] = ['dot-a', 'dot-b', 'dot-c', 'dot-d', 'dot-e']

function fullscreenBKDotStyle(trackSeed: number, transitionIndex: number): BKSurfaceStyle {
  const slot = (trackSeed + transitionIndex) % bkDotStyles.length
  return bkDotStyles[slot]
}

function seededBKSurfaceStyle(trackSeed: number, transitionIndex: number): BKSurfaceStyle {
  const mixed = (trackSeed ^ Math.imul(transitionIndex + 1, 0x85ebca6b) ^ (trackSeed >>> 13)) >>> 0
  const slot = mixed % 6
  return slot === 0 ? 'image' : bkDotStyles[slot - 1]
}

function bkDotDirection(style: BKSurfaceStyle): BKDotDirection {
  return style === 'dot-b' || style === 'dot-d' ? 'reverse' : 'forward'
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
            <BKDotSurface seed={surface.seed} direction={bkDotDirection(surface.style)} isRunning={isRunning} onComplete={onDotComplete} />
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
                    '--shape-drift-duration': `${shape.driftDuration}s`,
                    '--shape-spin-duration': `${shape.spinDuration}s`,
                    '--shape-spin-delay': `${shape.spinDelay}s`,
                    '--shape-spin-turn': shape.spinClockwise ? '360deg' : '-360deg',
                    '--shape-delay': `${shape.delay}s`,
                    '--shape-tint': shape.tint,
                    '--shape-mask-url': `url(${bkShapeAssets[shape.assetIndex]})`
                  } as React.CSSProperties
                }
              >
                <span className="bk-shape-mark" />
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
})

const tintedBKCache = new Map<string, string>()
const tintedBKAverageCache = new Map<string, RgbColor>()

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

function bkDotWindowStyle(slot: BKDotRuntimeSlot): React.CSSProperties {
  const point = cubicBezierPoint(slot.t, slot)
  const scale = dotScaleAt(slot.t)
  const opacity = slot.motion === 'idle' ? 0 : slot.t > 0.92 ? clampNumber((1 - slot.t) / 0.08, 0, 1) * 0.92 : 0.92
  return {
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

function applyBKDotWindowStyle(element: HTMLElement, slot: BKDotRuntimeSlot): void {
  const point = cubicBezierPoint(slot.t, slot)
  const scale = dotScaleAt(slot.t)
  const opacity = slot.motion === 'idle' ? 0 : slot.t > 0.92 ? clampNumber((1 - slot.t) / 0.08, 0, 1) * 0.92 : 0.92
  element.style.setProperty('--dot-x', `${point.x}%`)
  element.style.setProperty('--dot-y', `${point.y}%`)
  element.style.setProperty('--dot-radius-scaled', `${slot.radius * scale}vmax`)
  element.style.setProperty('--dot-inner-radius-scaled', `${slot.radius * 0.75 * scale}vmax`)
  element.style.setProperty('--dot-scale', String(scale))
  element.style.setProperty('--dot-opacity', String(opacity))
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
  const initialSlots = React.useMemo(() => [makeBKDotRuntimeSlot(seed, 0, direction, 0, 0.88)], [direction, seed])
  const slotsRef = React.useRef<BKDotRuntimeSlot[]>(initialSlots)
  const slotElementsRef = React.useRef(new Map<string, HTMLSpanElement>())
  const onCompleteRef = React.useRef(onComplete)
  onCompleteRef.current = onComplete
  const [slots, setSlots] = React.useState<BKDotRuntimeSlot[]>(initialSlots)

  React.useEffect(() => {
    const nextSlots = [makeBKDotRuntimeSlot(seed, 0, direction, 0, 0.88)]
    slotCounterRef.current = 1
    completedRef.current = false
    slotsRef.current = nextSlots
    slotElementsRef.current.clear()
    setSlots(nextSlots)
  }, [direction, seed])

  React.useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(() => {
      const currentSlots = slotsRef.current
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

      const structureChanged = nextSlots.length !== currentSlots.length || nextSlots.some((slot, index) => slot.id !== currentSlots[index]?.id)
      slotsRef.current = nextSlots
      for (const slot of nextSlots) {
        const element = slotElementsRef.current.get(slot.id)
        if (element) applyBKDotWindowStyle(element, slot)
      }
      if (structureChanged) setSlots(nextSlots)

      if (!nextSlots.length && !completedRef.current) {
        completedRef.current = true
        window.setTimeout(() => onCompleteRef.current?.(), 0)
      }
    }, 1000 / 15)
    return () => window.clearInterval(interval)
  }, [direction, isRunning, seed])

  return (
    <>
      {slots.map((slot) => {
        return (
          <span
            key={slot.id}
            className="bk-dot-window"
            ref={(element) => {
              if (element) {
                slotElementsRef.current.set(slot.id, element)
                applyBKDotWindowStyle(element, slot)
              } else {
                slotElementsRef.current.delete(slot.id)
              }
            }}
            style={bkDotWindowStyle(slot)}
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
        const firstPaintTone = darkenRgb(firstTone, 0.18)
        const secondPaintTone = secondTone
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
        let sampledRed = 0
        let sampledGreen = 0
        let sampledBlue = 0
        let sampledCount = 0
        for (let index = 0; index < pixels.length; index += 4) {
          const r = pixels[index]
          const g = pixels[index + 1]
          const b = pixels[index + 2]
          const a = pixels[index + 3]
          const luma = clampNumber(((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 - 0.5) * 1.08 + 0.5, 0, 1)
          const mapped = mixRgb(firstPaintTone, secondPaintTone, luma)
          const originalSoft = saturateRgb({ r, g, b }, 0.08)
          const composed = mixRgb(originalSoft, mapped, 0.78)
          const boosted = saturateRgb(composed, 0.82)
          pixels[index] = boosted.r
          pixels[index + 1] = boosted.g
          pixels[index + 2] = boosted.b
          pixels[index + 3] = a
          if (a > 16 && index % 16 === 0) {
            sampledRed += boosted.r
            sampledGreen += boosted.g
            sampledBlue += boosted.b
            sampledCount += 1
          }
        }
        if (sampledCount > 0) {
          tintedBKAverageCache.set(cacheKey, {
            r: Math.round(sampledRed / sampledCount),
            g: Math.round(sampledGreen / sampledCount),
            b: Math.round(sampledBlue / sampledCount)
          })
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
  driftDuration: number
  spinDuration: number
  spinDelay: number
  spinClockwise: boolean
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
  const placed: Array<{ x: number; y: number; size: number }> = []
  const randomPosition = (index: number): { x: number; y: number } => {
    const edge = (index + Math.floor(random() * 2)) % 4
    if (edge === 0) return { x: 6 + random() * 15, y: 12 + random() * 76 }
    if (edge === 1) return { x: 79 + random() * 15, y: 12 + random() * 76 }
    if (edge === 2) return { x: 16 + random() * 68, y: 7 + random() * 15 }
    return { x: 16 + random() * 68, y: 78 + random() * 15 }
  }
  const pickPosition = (index: number, size: number): { x: number; y: number } => {
    let best = randomPosition(index)
    let bestScore = -Infinity
    const attempts = 28
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const candidate = randomPosition(index + attempt)
      const nearestDistance = placed.reduce((nearest, item) => {
        const distance = Math.hypot(candidate.x - item.x, candidate.y - item.y)
        const sizePenalty = clampNumber((size + item.size) / 34, 10, 30)
        return Math.min(nearest, distance - sizePenalty)
      }, 100)
      const centerBias = -Math.abs(candidate.x - 50) * 0.015 - Math.abs(candidate.y - 50) * 0.012
      const score = nearestDistance + centerBias + random() * 1.8
      if (score > bestScore) {
        best = candidate
        bestScore = score
      }
    }
    return best
  }
  return Array.from({ length: count }, (_, index) => {
    const specialScale = index === 9 ? 3 : index === 10 ? 2 : 1
    const size = Math.round((96 + random() * 210) * specialScale)
    const { x, y } = pickPosition(index, size)
    placed.push({ x, y, size })
    const baseDuration = durationBands[index % durationBands.length]
    const driftDuration = (baseDuration + random() * baseDuration * 0.32) * (specialScale > 1 ? 1.18 : 1)
    const spinDuration = (28.8 + random() * 76.8) * (specialScale > 1 ? 1.18 : 1)
    return {
      id: `shape-${index}`,
      assetIndex: index % bkShapeAssets.length,
      x,
      y,
      size,
      rotation: Math.round(random() * 360),
      driftX: index === 9 ? 0 : Math.round(-12 + random() * 24),
      driftY: index === 9 ? 0 : Math.round(-16 + random() * 32),
      driftDuration,
      spinDuration,
      spinDelay: -random() * spinDuration,
      spinClockwise: random() > 0.5,
      delay: -random() * driftDuration,
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
    const travel = 104
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
    const duration = 14 + random() * 6
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
      radius: 24 + random() * 7,
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
  ledSpeed = 1,
  ledValues
}: {
  volume: number
  isPlaying: boolean
  ledCount?: number
  brightnessLevels?: number
  ledSpeed?: number
  ledValues?: number[]
}): React.ReactElement {
  const safeLedCount = Math.max(3, Math.round(ledCount))
  const safeBrightnessLevels = Math.max(2, Math.round(brightnessLevels))
  const center = Math.floor(safeLedCount / 2)
  const totalSlots = (center + 1) * safeBrightnessLevels
  const currentSlot = (isPlaying ? clampNumber(volume, 0, 1) : 0) * totalSlots
  const hasLedValues = Array.isArray(ledValues) && ledValues.length === safeLedCount
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
        const state = hasLedValues
          ? Math.min(safeBrightnessLevels - 1, Math.round(clampNumber(ledValues[index] ?? 0, 0, 1) * (safeBrightnessLevels - 1)))
          : currentSlot < ledStartSlot ? 0 : currentSlot >= ledStartSlot + safeBrightnessLevels ? safeBrightnessLevels - 1 : Math.floor(currentSlot - ledStartSlot)
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
  { key: 'fullscreen', title: '全屏播放', detail: '皮肤、歌词、LED' },
  { key: 'externalPlayback', title: '音频', detail: '延迟与补偿' },
  { key: 'data', title: '数据', detail: '资料库、导入与缓存' },
  { key: 'about', title: '关于', detail: '待翻译' }
]

const SettingsPanel = React.memo(function SettingsPanel({
  selectedCategory,
  onSelectCategory,
  onClose,
  globalArtworkTintEnabled,
  onGlobalArtworkTintEnabledChange,
  dockProgressVisible,
  onDockProgressVisibleChange,
  followSystemAppearance,
  onFollowSystemAppearanceChange,
  manualAppearance,
  onManualAppearanceChange,
  lyricsBackgroundMode,
  onLyricsBackgroundModeChange,
  homeCardMaterialMode,
  onHomeCardMaterialModeChange,
  homeSectionOrder,
  onHomeSectionOrderChange,
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
  onLedSpeedChange,
  selectedFullscreenTab,
  onSelectFullscreenTab,
  selectedFullscreenSkin,
  onSelectedFullscreenSkinChange,
  fullscreenArtBackgroundEnabled,
  onFullscreenArtBackgroundEnabledChange,
  fullscreenClassicVisualizerMode,
  onFullscreenClassicVisualizerModeChange,
  fullscreenAppleVisualizerMode,
  onFullscreenAppleVisualizerModeChange,
  fullscreenRotatingVisualizerMode,
  onFullscreenRotatingVisualizerModeChange,
  fullscreenCassetteVisualizerMode,
  onFullscreenCassetteVisualizerModeChange,
  coverGradientEdgeFillMode,
  onCoverGradientEdgeFillModeChange,
  coverGradientBlurRadius,
  onCoverGradientBlurRadiusChange,
  fullscreenLyricsRenderQuality,
  onFullscreenLyricsRenderQualityChange,
  fullscreenDiscreteWordHighlightEnabled,
  onFullscreenDiscreteWordHighlightEnabledChange,
  fullscreenLyricsFontSize,
  onFullscreenLyricsFontSizeChange,
  fullscreenLyricsTranslationFontSize,
  onFullscreenLyricsTranslationFontSizeChange,
  fullscreenLyricsGlobalAdvanceMs,
  onFullscreenLyricsGlobalAdvanceMsChange,
  lookaheadMs,
  onLookaheadMsChange,
  deferImportEnrichment,
  onDeferImportEnrichmentChange,
  telemetryEnabled,
  onTelemetryEnabledChange,
  libraryLocationInfo,
  onLibraryLocationInfoChange,
  settingsActionStatus,
  onSettingsActionStatusChange,
  onRefreshLibrarySnapshot
}: {
  selectedCategory: SettingsCategoryKey
  onSelectCategory: (category: SettingsCategoryKey) => void
  onClose: () => void
  globalArtworkTintEnabled: boolean
  onGlobalArtworkTintEnabledChange: (enabled: boolean) => void
  dockProgressVisible: boolean
  onDockProgressVisibleChange: (enabled: boolean) => void
  followSystemAppearance: boolean
  onFollowSystemAppearanceChange: (enabled: boolean) => void
  manualAppearance: ManualAppearanceMode
  onManualAppearanceChange: (mode: ManualAppearanceMode) => void
  lyricsBackgroundMode: LyricsBackgroundMode
  onLyricsBackgroundModeChange: (mode: LyricsBackgroundMode) => void
  homeCardMaterialMode: HomeCardMaterialMode
  onHomeCardMaterialModeChange: (mode: HomeCardMaterialMode) => void
  homeSectionOrder: HomeSectionID[]
  onHomeSectionOrderChange: (order: HomeSectionID[]) => void
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
  selectedFullscreenTab: NowPlayingSettingsTab
  onSelectFullscreenTab: (tab: NowPlayingSettingsTab) => void
  selectedFullscreenSkin: FullscreenSkinID
  onSelectedFullscreenSkinChange: (skin: FullscreenSkinID) => void
  fullscreenArtBackgroundEnabled: boolean
  onFullscreenArtBackgroundEnabledChange: (enabled: boolean) => void
  fullscreenClassicVisualizerMode: VisualizerMode
  onFullscreenClassicVisualizerModeChange: (mode: VisualizerMode) => void
  fullscreenAppleVisualizerMode: VisualizerMode
  onFullscreenAppleVisualizerModeChange: (mode: VisualizerMode) => void
  fullscreenRotatingVisualizerMode: VisualizerMode
  onFullscreenRotatingVisualizerModeChange: (mode: VisualizerMode) => void
  fullscreenCassetteVisualizerMode: VisualizerMode
  onFullscreenCassetteVisualizerModeChange: (mode: VisualizerMode) => void
  coverGradientEdgeFillMode: CoverGradientEdgeFillMode
  onCoverGradientEdgeFillModeChange: (mode: CoverGradientEdgeFillMode) => void
  coverGradientBlurRadius: number
  onCoverGradientBlurRadiusChange: (value: number) => void
  fullscreenLyricsRenderQuality: 'performance' | 'balanced' | 'quality'
  onFullscreenLyricsRenderQualityChange: (quality: 'performance' | 'balanced' | 'quality') => void
  fullscreenDiscreteWordHighlightEnabled: boolean
  onFullscreenDiscreteWordHighlightEnabledChange: (enabled: boolean) => void
  fullscreenLyricsFontSize: number
  onFullscreenLyricsFontSizeChange: (value: number) => void
  fullscreenLyricsTranslationFontSize: number
  onFullscreenLyricsTranslationFontSizeChange: (value: number) => void
  fullscreenLyricsGlobalAdvanceMs: number
  onFullscreenLyricsGlobalAdvanceMsChange: (value: number) => void
  lookaheadMs: number
  onLookaheadMsChange: (value: number) => void
  deferImportEnrichment: boolean
  onDeferImportEnrichmentChange: (enabled: boolean) => void
  telemetryEnabled: boolean
  onTelemetryEnabledChange: (enabled: boolean) => void
  libraryLocationInfo: LibraryLocationInfo | null
  onLibraryLocationInfoChange: (info: LibraryLocationInfo | null) => void
  settingsActionStatus: SettingsActionStatus
  onSettingsActionStatusChange: (status: SettingsActionStatus) => void
  onRefreshLibrarySnapshot: () => Promise<void>
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
          {selectedCategory === 'appearance' ? (
            <AppearanceSettingsContent
              globalArtworkTintEnabled={globalArtworkTintEnabled}
              onGlobalArtworkTintEnabledChange={onGlobalArtworkTintEnabledChange}
              dockProgressVisible={dockProgressVisible}
              onDockProgressVisibleChange={onDockProgressVisibleChange}
              followSystemAppearance={followSystemAppearance}
              onFollowSystemAppearanceChange={onFollowSystemAppearanceChange}
              manualAppearance={manualAppearance}
              onManualAppearanceChange={onManualAppearanceChange}
              lyricsBackgroundMode={lyricsBackgroundMode}
              onLyricsBackgroundModeChange={onLyricsBackgroundModeChange}
              homeCardMaterialMode={homeCardMaterialMode}
              onHomeCardMaterialModeChange={onHomeCardMaterialModeChange}
              homeSectionOrder={homeSectionOrder}
              onHomeSectionOrderChange={onHomeSectionOrderChange}
            />
          ) : selectedCategory === 'nowPlaying' ? (
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
          ) : selectedCategory === 'fullscreen' ? (
            <FullscreenSettingsContent
              selectedTab={selectedFullscreenTab}
              onSelectTab={onSelectFullscreenTab}
              selectedSkin={selectedFullscreenSkin}
              onSelectedSkinChange={onSelectedFullscreenSkinChange}
              artBackgroundEnabled={fullscreenArtBackgroundEnabled}
              onArtBackgroundEnabledChange={onFullscreenArtBackgroundEnabledChange}
              classicVisualizerMode={fullscreenClassicVisualizerMode}
              onClassicVisualizerModeChange={onFullscreenClassicVisualizerModeChange}
              appleVisualizerMode={fullscreenAppleVisualizerMode}
              onAppleVisualizerModeChange={onFullscreenAppleVisualizerModeChange}
              rotatingVisualizerMode={fullscreenRotatingVisualizerMode}
              onRotatingVisualizerModeChange={onFullscreenRotatingVisualizerModeChange}
              cassetteVisualizerMode={fullscreenCassetteVisualizerMode}
              onCassetteVisualizerModeChange={onFullscreenCassetteVisualizerModeChange}
              coverGradientEdgeFillMode={coverGradientEdgeFillMode}
              onCoverGradientEdgeFillModeChange={onCoverGradientEdgeFillModeChange}
              coverGradientBlurRadius={coverGradientBlurRadius}
              onCoverGradientBlurRadiusChange={onCoverGradientBlurRadiusChange}
              lyricsRenderQuality={fullscreenLyricsRenderQuality}
              onLyricsRenderQualityChange={onFullscreenLyricsRenderQualityChange}
              discreteWordHighlightEnabled={fullscreenDiscreteWordHighlightEnabled}
              onDiscreteWordHighlightEnabledChange={onFullscreenDiscreteWordHighlightEnabledChange}
              lyricsFontSize={fullscreenLyricsFontSize}
              onLyricsFontSizeChange={onFullscreenLyricsFontSizeChange}
              lyricsTranslationFontSize={fullscreenLyricsTranslationFontSize}
              onLyricsTranslationFontSizeChange={onFullscreenLyricsTranslationFontSizeChange}
              lyricsGlobalAdvanceMs={fullscreenLyricsGlobalAdvanceMs}
              onLyricsGlobalAdvanceMsChange={onFullscreenLyricsGlobalAdvanceMsChange}
              ledCount={ledCount}
              onLedCountChange={onLedCountChange}
              ledBrightnessLevels={ledBrightnessLevels}
              onLedBrightnessLevelsChange={onLedBrightnessLevelsChange}
              ledCutoffHz={ledCutoffHz}
              onLedCutoffHzChange={onLedCutoffHzChange}
              ledSpeed={ledSpeed}
              onLedSpeedChange={onLedSpeedChange}
            />
          ) : selectedCategory === 'externalPlayback' ? (
            <AudioSettingsContent lookaheadMs={lookaheadMs} onLookaheadMsChange={onLookaheadMsChange} />
          ) : selectedCategory === 'data' ? (
            <DataSettingsContent
              libraryLocationInfo={libraryLocationInfo}
              onLibraryLocationInfoChange={onLibraryLocationInfoChange}
              deferImportEnrichment={deferImportEnrichment}
              onDeferImportEnrichmentChange={onDeferImportEnrichmentChange}
              telemetryEnabled={telemetryEnabled}
              onTelemetryEnabledChange={onTelemetryEnabledChange}
              settingsActionStatus={settingsActionStatus}
              onSettingsActionStatusChange={onSettingsActionStatusChange}
              onRefreshLibrarySnapshot={onRefreshLibrarySnapshot}
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

const AppearanceSettingsContent = React.memo(function AppearanceSettingsContent({
  globalArtworkTintEnabled,
  onGlobalArtworkTintEnabledChange,
  dockProgressVisible,
  onDockProgressVisibleChange,
  followSystemAppearance,
  onFollowSystemAppearanceChange,
  manualAppearance,
  onManualAppearanceChange,
  lyricsBackgroundMode,
  onLyricsBackgroundModeChange,
  homeCardMaterialMode,
  onHomeCardMaterialModeChange,
  homeSectionOrder,
  onHomeSectionOrderChange
}: {
  globalArtworkTintEnabled: boolean
  onGlobalArtworkTintEnabledChange: (enabled: boolean) => void
  dockProgressVisible: boolean
  onDockProgressVisibleChange: (enabled: boolean) => void
  followSystemAppearance: boolean
  onFollowSystemAppearanceChange: (enabled: boolean) => void
  manualAppearance: ManualAppearanceMode
  onManualAppearanceChange: (mode: ManualAppearanceMode) => void
  lyricsBackgroundMode: LyricsBackgroundMode
  onLyricsBackgroundModeChange: (mode: LyricsBackgroundMode) => void
  homeCardMaterialMode: HomeCardMaterialMode
  onHomeCardMaterialModeChange: (mode: HomeCardMaterialMode) => void
  homeSectionOrder: HomeSectionID[]
  onHomeSectionOrderChange: (order: HomeSectionID[]) => void
}): React.ReactElement {
  const orderRef = React.useRef(homeSectionOrder)
  const dragStartIndexRef = React.useRef(0)
  const dragLastTargetIndexRef = React.useRef(0)
  const dragStartXRef = React.useRef(0)
  const dragStartYRef = React.useRef(0)
  const [draggingSection, setDraggingSection] = React.useState<HomeSectionID | null>(null)
  const [dragFloatingX, setDragFloatingX] = React.useState(0)
  const [dragFloatingY, setDragFloatingY] = React.useState(0)
  const homeRowHeight = 64
  const homeRowSpacing = 14
  const homeRowStride = homeRowHeight + homeRowSpacing

  React.useEffect(() => {
    orderRef.current = homeSectionOrder
  }, [homeSectionOrder])

  const beginSectionDrag = (event: React.PointerEvent, section: HomeSectionID): void => {
    event.preventDefault()
    event.stopPropagation()
    const startIndex = orderRef.current.indexOf(section)
    if (startIndex < 0) return
    dragStartIndexRef.current = startIndex
    dragLastTargetIndexRef.current = startIndex
    dragStartXRef.current = event.clientX
    dragStartYRef.current = event.clientY
    setDraggingSection(section)
    setDragFloatingX(0)
    setDragFloatingY(startIndex * homeRowStride)

    const handleMove = (moveEvent: PointerEvent): void => {
      const translationX = moveEvent.clientX - dragStartXRef.current
      const translationY = moveEvent.clientY - dragStartYRef.current
      const nextFloatingY = dragStartIndexRef.current * homeRowStride + translationY
      const nextFloatingX = clampNumber(translationX * 0.45, -28, 28)
      setDragFloatingY(nextFloatingY)
      setDragFloatingX(nextFloatingX)

      const centerY = nextFloatingY + homeRowHeight / 2
      const target = clampNumber(Math.floor(centerY / homeRowStride), 0, orderRef.current.length - 1)
      if (target === dragLastTargetIndexRef.current) return
      dragLastTargetIndexRef.current = target

      const current = orderRef.current.indexOf(section)
      if (current < 0 || current === target) return
      const nextOrder = [...orderRef.current]
      const [item] = nextOrder.splice(current, 1)
      nextOrder.splice(target > current ? target : target, 0, item)
      orderRef.current = nextOrder
      onHomeSectionOrderChange(nextOrder)
    }

    const handleUp = (): void => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      const finalIndex = orderRef.current.indexOf(section)
      setDragFloatingX(0)
      setDragFloatingY((finalIndex >= 0 ? finalIndex : dragStartIndexRef.current) * homeRowStride)
      window.setTimeout(() => {
        setDraggingSection(null)
        setDragFloatingX(0)
      }, 160)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <div className="settings-now-playing">
      <header className="settings-header-label">
        <Sparkles size={18} />
        <strong>外观</strong>
      </header>
      <div className="settings-section-stack">
        <SettingsSection title="常规">
          <SettingsSwitch title="全局取色" detail="开启后重点色跟随当前歌曲封面，关闭后使用默认主题色。" checked={globalArtworkTintEnabled} onChange={onGlobalArtworkTintEnabledChange} />
          <SettingsSwitch title="Dock 播放进度" detail="开启后底部状态栏显示当前歌曲进度垫层。" checked={dockProgressVisible} onChange={onDockProgressVisibleChange} />
          <SettingsSwitch title="深色/浅色跟随系统" detail="开启后跟随系统深浅色；关闭后保留当前手动外观状态。" checked={followSystemAppearance} onChange={onFollowSystemAppearanceChange} />
          <SettingsSegment title="手动外观" values={['light', 'dark']} labels={['浅色', '深色']} selected={manualAppearance} onSelect={(value) => {
            onFollowSystemAppearanceChange(false)
            onManualAppearanceChange(value as ManualAppearanceMode)
          }} />
          <div className="settings-divider" />
          <SettingsSegment title="歌词卡片背景" values={['clear', 'sidebar']} labels={['磨砂玻璃', '液态玻璃']} selected={lyricsBackgroundMode} onSelect={(value) => onLyricsBackgroundModeChange(value as LyricsBackgroundMode)} />
          <SettingsSegment title="主页卡片材质" values={['liquidGlass', 'frostedGlass', 'solid']} labels={['液态玻璃（试验品）', '磨砂玻璃', '普通']} selected={homeCardMaterialMode} onSelect={(value) => onHomeCardMaterialModeChange(value as HomeCardMaterialMode)} />
        </SettingsSection>
        <SettingsSection
          title="主页板块顺序"
          action={<button className="settings-text-action" type="button" onClick={() => onHomeSectionOrderChange(defaultHomeSectionOrder)}>恢复默认顺序</button>}
        >
          <small className="settings-description">按照 Swift 的 HomeSection 顺序保存；调整后主页立即按新顺序排布。</small>
          <div className="settings-order-list" style={{ '--settings-order-row-height': `${homeRowHeight}px`, '--settings-order-row-spacing': `${homeRowSpacing}px` } as React.CSSProperties}>
            {homeSectionOrder.map((section) => (
              <div className={`settings-order-row ${draggingSection === section ? 'dragging' : ''}`} key={section}>
                <HomeSectionOrderRowContent section={section} onDragStart={(event) => beginSectionDrag(event, section)} />
              </div>
            ))}
            {draggingSection ? (
              <div
                className="settings-order-row floating"
                style={{ transform: `translate3d(${dragFloatingX}px, ${dragFloatingY}px, 0)` }}
              >
                <HomeSectionOrderRowContent section={draggingSection} />
              </div>
            ) : null}
          </div>
        </SettingsSection>
      </div>
    </div>
  )
})

const HomeSectionOrderRowContent = React.memo(function HomeSectionOrderRowContent({
  section,
  onDragStart
}: {
  section: HomeSectionID
  onDragStart?: (event: React.PointerEvent) => void
}): React.ReactElement {
  const option = homeSectionOptions.find((item) => item.id === section)
  return (
    <>
      <span className="settings-order-icon">
        <HomeSectionOrderIcon section={section} />
      </span>
      <strong>{option?.title ?? section}</strong>
      <button type="button" aria-label="拖动调整顺序" onPointerDown={onDragStart}>
        <GripHorizontal size={25} />
      </button>
    </>
  )
})

const FullscreenSettingsContent = React.memo(function FullscreenSettingsContent({
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
  coverGradientEdgeFillMode,
  onCoverGradientEdgeFillModeChange,
  coverGradientBlurRadius,
  onCoverGradientBlurRadiusChange,
  lyricsRenderQuality,
  onLyricsRenderQualityChange,
  discreteWordHighlightEnabled,
  onDiscreteWordHighlightEnabledChange,
  lyricsFontSize,
  onLyricsFontSizeChange,
  lyricsTranslationFontSize,
  onLyricsTranslationFontSizeChange,
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
  selectedSkin: FullscreenSkinID
  onSelectedSkinChange: (skin: FullscreenSkinID) => void
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
  coverGradientEdgeFillMode: CoverGradientEdgeFillMode
  onCoverGradientEdgeFillModeChange: (mode: CoverGradientEdgeFillMode) => void
  coverGradientBlurRadius: number
  onCoverGradientBlurRadiusChange: (value: number) => void
  lyricsRenderQuality: 'performance' | 'balanced' | 'quality'
  onLyricsRenderQualityChange: (quality: 'performance' | 'balanced' | 'quality') => void
  discreteWordHighlightEnabled: boolean
  onDiscreteWordHighlightEnabledChange: (enabled: boolean) => void
  lyricsFontSize: number
  onLyricsFontSizeChange: (value: number) => void
  lyricsTranslationFontSize: number
  onLyricsTranslationFontSizeChange: (value: number) => void
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
  const selectedSkinOption = fullscreenSkinOptions.find((skin) => skin.id === selectedSkin) ?? fullscreenSkinOptions[0]
  const visualizerMode = selectedSkin === 'coverLed'
    ? classicVisualizerMode
    : selectedSkin === 'appleStyle'
      ? appleVisualizerMode
      : selectedSkin === 'rotatingCover'
        ? rotatingVisualizerMode
        : cassetteVisualizerMode
  const setVisualizerMode = (mode: VisualizerMode): void => {
    if (selectedSkin === 'coverLed') onClassicVisualizerModeChange(mode)
    else if (selectedSkin === 'appleStyle') onAppleVisualizerModeChange(mode)
    else if (selectedSkin === 'rotatingCover') onRotatingVisualizerModeChange(mode)
    else onCassetteVisualizerModeChange(mode)
  }

  return (
    <div className="settings-now-playing">
      <header className="settings-header-label">
        <Maximize2 size={18} />
        <strong>全屏播放</strong>
      </header>
      <div className="settings-tabs">
        {[
          ['general', '皮肤'],
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
          <SettingsSwitch title="启用艺术背景" detail="对应 Swift 的 fullscreenArtBackgroundEnabled。" checked={artBackgroundEnabled} onChange={onArtBackgroundEnabledChange} />
          <div className="settings-card-section">
            <strong>选择皮肤</strong>
            <div className="settings-skin-row">
              {fullscreenSkinOptions.map((skin) => (
                <button key={skin.id} className={selectedSkin === skin.id ? 'active' : ''} type="button" onClick={() => onSelectedSkinChange(skin.id)}>
                  <span className={`skin-thumb ${skinPreviewClassName(skin.id)}`} style={skinPreviewSymbolStyle(skin.id)} />
                  <strong>{skin.name}</strong>
                  <small>{skin.detail}</small>
                </button>
              ))}
            </div>
          </div>
          <SettingsSection title={`${selectedSkinOption.name} 选项`}>
            {selectedSkin === 'fullscreen.coverGradientBlur' ? (
              <>
                <SettingsSegment title="右侧填充" values={['pixelStretch', 'mirroredCover']} labels={['像素拉伸', '镜像封面']} selected={coverGradientEdgeFillMode} onSelect={(value) => onCoverGradientEdgeFillModeChange(value as CoverGradientEdgeFillMode)} />
                <SettingsRange title="模糊半径" valueText={`${Math.round(coverGradientBlurRadius)}`} value={coverGradientBlurRadius} min={100} max={2500} step={100} onChange={onCoverGradientBlurRadiusChange} />
              </>
            ) : (
              <SettingsSegment title="可视化" values={['off', 'led', 'spectrum']} labels={['关闭', 'LED', '频谱']} selected={visualizerMode} onSelect={(value) => setVisualizerMode(value as VisualizerMode)} />
            )}
          </SettingsSection>
        </div>
      ) : selectedTab === 'lyrics' ? (
        <div className="settings-section-stack">
          <SettingsSection title="全屏歌词">
            <SettingsSegment title="歌词渲染质量" values={['performance', 'balanced', 'quality']} labels={['低', '中', '高']} selected={lyricsRenderQuality} onSelect={(value) => onLyricsRenderQualityChange(value as 'performance' | 'balanced' | 'quality')} />
            <SettingsSwitch title="减弱高亮(beta)" checked={discreteWordHighlightEnabled} onChange={onDiscreteWordHighlightEnabledChange} />
            <SettingsRange title="字体大小" valueText={`${Math.round(lyricsFontSize)} px`} value={lyricsFontSize} min={16} max={56} step={1} onChange={onLyricsFontSizeChange} />
            <SettingsRange title="翻译大小" valueText={`${Math.round(lyricsTranslationFontSize)} px`} value={lyricsTranslationFontSize} min={12} max={40} step={1} onChange={onLyricsTranslationFontSizeChange} />
            <SettingsRange title="歌词整体提前量" detail="全屏歌词独立补偿；会叠加音频 Lookahead。" valueText={`${Math.round(lyricsGlobalAdvanceMs)} ms`} value={lyricsGlobalAdvanceMs} min={-1000} max={1000} step={10} onChange={onLyricsGlobalAdvanceMsChange} />
          </SettingsSection>
          <SettingsSection title="预览">
            <div className="lyrics-settings-preview dark">
              <small>全屏歌词预览</small>
              <b style={{ fontSize: lyricsFontSize, fontWeight: 500 }}>雪把世界删改成更少的字</b>
              <span style={{ fontSize: lyricsTranslationFontSize }}>时光像河流入海</span>
            </div>
          </SettingsSection>
        </div>
      ) : (
        <div className="settings-section-stack">
          <div className="settings-card-section">
            <strong>实时预览</strong>
            <NowPlayingVolumeLed volume={0.72} isPlaying ledCount={ledCount} brightnessLevels={ledBrightnessLevels} ledSpeed={ledSpeed} />
          </div>
          <SettingsSection
            title="视觉配置"
            action={<button className="settings-text-action" type="button" onClick={() => {
              onLedCountChange(11)
              onLedBrightnessLevelsChange(5)
              onLedCutoffHzChange(2400)
              onLedSpeedChange(1.15)
            }}>恢复默认值</button>}
          >
            <SettingsSegment title="LED 数量" values={['9', '11', '13', '15']} selected={String(Math.round(ledCount))} onSelect={(value) => onLedCountChange(Number(value))} />
            <SettingsSegment title="亮度等级" values={['3', '5', '7']} selected={String(Math.round(ledBrightnessLevels))} onSelect={(value) => onLedBrightnessLevelsChange(Number(value))} />
            <SettingsRange title="频率" valueText={`${Math.round(ledCutoffHz)} Hz`} value={ledCutoffHz} min={200} max={6000} step={100} onChange={onLedCutoffHzChange} />
            <SettingsRange title="速度" valueText={`${ledSpeed.toFixed(2)}x`} value={ledSpeed} min={0.5} max={2} step={0.05} onChange={onLedSpeedChange} />
          </SettingsSection>
        </div>
      )}
    </div>
  )
})

const AudioSettingsContent = React.memo(function AudioSettingsContent({
  lookaheadMs,
  onLookaheadMsChange
}: {
  lookaheadMs: number
  onLookaheadMsChange: (value: number) => void
}): React.ReactElement {
  return (
    <div className="settings-now-playing">
      <header className="settings-header-label">
        <Volume2 size={18} />
        <strong>音频</strong>
      </header>
      <div className="settings-section-stack">
        <SettingsSection
          title="延迟补偿"
          action={<button className="settings-text-action" type="button" onClick={() => onLookaheadMsChange(200)}>恢复默认值</button>}
        >
          <small className="settings-description">Swift 通过 AVAudioUnitDelay 延后音频输出，使 LED/歌词视觉提前。Windows 版当前将同一个值用于视觉时钟补偿。</small>
          <SettingsRange title="Lookahead" detail="数值越大，歌词和视觉相对声音越早。" valueText={`${Math.round(lookaheadMs)} ms`} value={lookaheadMs} min={0} max={200} step={5} onChange={onLookaheadMsChange} />
        </SettingsSection>
      </div>
    </div>
  )
})

const DataSettingsContent = React.memo(function DataSettingsContent({
  libraryLocationInfo,
  onLibraryLocationInfoChange,
  deferImportEnrichment,
  onDeferImportEnrichmentChange,
  telemetryEnabled,
  onTelemetryEnabledChange,
  settingsActionStatus,
  onSettingsActionStatusChange,
  onRefreshLibrarySnapshot
}: {
  libraryLocationInfo: LibraryLocationInfo | null
  onLibraryLocationInfoChange: (info: LibraryLocationInfo | null) => void
  deferImportEnrichment: boolean
  onDeferImportEnrichmentChange: (enabled: boolean) => void
  telemetryEnabled: boolean
  onTelemetryEnabledChange: (enabled: boolean) => void
  settingsActionStatus: SettingsActionStatus
  onSettingsActionStatusChange: (status: SettingsActionStatus) => void
  onRefreshLibrarySnapshot: () => Promise<void>
}): React.ReactElement {
  const runAction = async (label: string, action: () => Promise<void>, tone: 'normal' | 'danger' = 'normal'): Promise<void> => {
    onSettingsActionStatusChange({ label: `${label}...`, tone })
    try {
      await action()
      onSettingsActionStatusChange({ label: `${label}完成`, tone })
      window.setTimeout(() => onSettingsActionStatusChange(null), 1600)
    } catch {
      onSettingsActionStatusChange({ label: `${label}失败`, tone: 'danger' })
    }
  }
  const requireKmgccc = (): NonNullable<Window['kmgccc']> => {
    if (!window.kmgccc) throw new Error('Electron IPC unavailable')
    return window.kmgccc
  }
  return (
    <div className="settings-now-playing">
      <header className="settings-header-label">
        <DatabaseIcon />
        <strong>数据</strong>
      </header>
      <div className="settings-section-stack">
        <SettingsSection title="音乐资料库位置">
          <code className="settings-path-label">{libraryLocationInfo?.currentPath ?? '正在读取资料库位置'}</code>
          <div className="settings-button-row">
            <button type="button" onClick={() => runAction('更改位置', async () => {
              const info = await requireKmgccc().chooseLibraryLocation()
              onLibraryLocationInfoChange(info)
              await onRefreshLibrarySnapshot()
            })}>更改位置</button>
            <button type="button" onClick={() => runAction('打开资料库', async () => {
              await requireKmgccc().showLibraryLocation()
            })}>在文件管理器中显示</button>
            <button type="button" onClick={() => runAction('重新扫描资料库', async () => {
              requireKmgccc()
              await onRefreshLibrarySnapshot()
            })}>重新扫描资料库</button>
            <button type="button" disabled={libraryLocationInfo?.isDefault} onClick={() => runAction('恢复默认位置', async () => {
              const info = await requireKmgccc().resetLibraryLocation()
              onLibraryLocationInfoChange(info)
              await onRefreshLibrarySnapshot()
            })}>恢复默认位置</button>
          </div>
        </SettingsSection>
        <SettingsSection title="导入">
          <SettingsSwitch title="导入时延后补全歌词与封面" detail="开启后导入会先完成文件写入，再由手动补全任务联网补全信息。" checked={deferImportEnrichment} onChange={onDeferImportEnrichmentChange} />
        </SettingsSection>
        <SettingsSection title="补全与缓存">
          <div className="settings-button-row">
            <button type="button" onClick={() => runAction('补全所有歌曲信息', async () => {
              await requireKmgccc().completeLibraryMetadata()
              await onRefreshLibrarySnapshot()
            })}>补全所有歌曲信息</button>
            <button type="button" onClick={() => runAction('清除索引缓存', async () => {
              await requireKmgccc().clearIndexCache()
              await onRefreshLibrarySnapshot()
            })}>清除索引缓存</button>
            <button type="button" onClick={() => runAction('清除取色缓存', async () => {
              artworkThemeCache.clear()
            })}>清除取色缓存</button>
            <button type="button" onClick={() => runAction('清理外部播放缓存', async () => {
              await requireKmgccc().clearExternalPlaybackCache()
            })}>清理外部播放元数据缓存</button>
          </div>
        </SettingsSection>
        <SettingsSection title="重置">
          <div className="settings-button-row">
            <button className="danger" type="button" onClick={() => runAction('初始化应用设置', async () => {
              const keepTelemetry = window.localStorage.getItem('telemetry.anonymousUsageEnabled')
              const keepLibrary = window.localStorage.getItem('deferImportEnrichment')
              window.localStorage.clear()
              if (keepTelemetry !== null) window.localStorage.setItem('telemetry.anonymousUsageEnabled', keepTelemetry)
              if (keepLibrary !== null) window.localStorage.setItem('deferImportEnrichment', keepLibrary)
              window.setTimeout(() => window.location.reload(), 300)
            }, 'danger')}>初始化应用设置</button>
            <button className="danger" type="button" onClick={() => runAction('重置音乐播放数据', async () => {
              window.localStorage.removeItem('playbackOrderMode')
              window.localStorage.removeItem('shuffleEnabled')
              window.localStorage.removeItem('repeatMode')
              window.localStorage.removeItem('stopAfterTrack')
            }, 'danger')}>重置音乐播放数据</button>
          </div>
        </SettingsSection>
        <SettingsSection title="数据共享">
          <SettingsSwitch title="帮助改进 kmgccc_player" detail="仅保存匿名统计开关；Windows 版当前不会上传歌曲名、歌词内容、本地路径或账号信息。" checked={telemetryEnabled} onChange={onTelemetryEnabledChange} />
        </SettingsSection>
        {settingsActionStatus ? <div className={`settings-action-status ${settingsActionStatus.tone === 'danger' ? 'danger' : ''}`}>{settingsActionStatus.label}</div> : null}
      </div>
    </div>
  )
})

function DatabaseIcon(): React.ReactElement {
  return <ArrowDownUp size={18} />
}

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
                  <span className={`skin-thumb ${skinPreviewClassName(skin.id)}`} style={skinPreviewSymbolStyle(skin.id)} />
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
            <button className="settings-text-action inline" type="button" onClick={() => {
              onLedCountChange(11)
              onLedBrightnessLevelsChange(5)
              onLedCutoffHzChange(2400)
              onLedSpeedChange(1.15)
            }}>恢复默认值</button>
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
  onOpenContextMenu,
  sortKey,
  sortDirection,
  isMultiSelectMode,
  selectedTrackIds,
  onSelectedTrackIdsChange,
  onBatchAddTracksToPlaylist,
  onBatchRemoveTracksFromPlaylist,
  onBatchDeleteTracks,
  onBatchEditTracks
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
  sortKey: DetailSortKey
  sortDirection: SortDirection
  isMultiSelectMode: boolean
  selectedTrackIds: Set<string>
  onSelectedTrackIdsChange: React.Dispatch<React.SetStateAction<Set<string>>>
  onBatchAddTracksToPlaylist: (playlistId: string, trackIds: string[]) => void
  onBatchRemoveTracksFromPlaylist: (trackIds: string[]) => void
  onBatchDeleteTracks: (trackIds: string[]) => void
  onBatchEditTracks: (tracks: HomeTrack[]) => void
}): React.ReactElement {
  const pageScroll = useElasticScroll<HTMLElement>()
  const baseTracks = React.useMemo(() => tracksForRoute(route, snapshot), [route, snapshot])
  const tracks = React.useMemo(() => sortedDetailTracks(baseTracks, sortKey, sortDirection, snapshot), [baseTracks, snapshot, sortDirection, sortKey])
  const isArtistIndex = route.name === 'artistDetail' && route.id === 'all-artists'
  const isAlbumIndex = route.name === 'albumDetail' && route.id === 'all-albums'
  const artworkShape = route.name === 'artistDetail' && route.id !== 'all-artists' ? 'artist' : 'square'
  const headerPlaylist = route.name === 'playlistDetail' ? snapshot.playlists.find((entry) => entry.id === route.id) : undefined
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
        style={pageScroll.elasticOffset !== 0 ? { transform: `translate3d(0, ${pageScroll.elasticOffset}px, 0)` } : undefined}
      >
        <header className="artist-header" onContextMenu={(event) => onOpenContextMenu(event, headerContextItems)}>
          <div className={`artist-image-frame ${artworkShape === 'square' ? 'square-artwork' : ''}`}>
            <ArtworkImage
              className={headerPlaylist && isImportedPlaylist(headerPlaylist) ? 'playlist-generated-artwork' : ''}
              src={detailArtwork(route, snapshot, albums)}
              maxSize={420}
              style={playlistArtworkStyle(headerPlaylist)}
              alt=""
            />
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
            isMultiSelectMode={isMultiSelectMode}
            selectedTrackIds={selectedTrackIds}
            onSelectedTrackIdsChange={onSelectedTrackIdsChange}
            onBatchAddTracksToPlaylist={onBatchAddTracksToPlaylist}
            onBatchRemoveTracksFromPlaylist={onBatchRemoveTracksFromPlaylist}
            onBatchDeleteTracks={onBatchDeleteTracks}
            onBatchEditTracks={onBatchEditTracks}
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
          {artist.artworkUrl ? <ArtworkImage src={artist.artworkUrl} maxSize={220} alt="" loading="lazy" /> : <span className="artist-avatar">{artist.name}</span>}
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
          <ArtworkImage src={albumArtworkFor(album)} maxSize={260} alt="" loading="lazy" />
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
  onOpenContextMenu,
  isMultiSelectMode = false,
  selectedTrackIds,
  onSelectedTrackIdsChange,
  onBatchAddTracksToPlaylist,
  onBatchRemoveTracksFromPlaylist,
  onBatchDeleteTracks,
  onBatchEditTracks
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
  isMultiSelectMode?: boolean
  selectedTrackIds?: Set<string>
  onSelectedTrackIdsChange?: React.Dispatch<React.SetStateAction<Set<string>>>
  onBatchAddTracksToPlaylist?: (playlistId: string, trackIds: string[]) => void
  onBatchRemoveTracksFromPlaylist?: (trackIds: string[]) => void
  onBatchDeleteTracks?: (trackIds: string[]) => void
  onBatchEditTracks?: (tracks: Track[]) => void
}): React.ReactElement {
  const selectedIds = selectedTrackIds ?? new Set<string>()
  const selectedTracks = tracks.filter((track) => selectedIds.has(track.id))
  const toggleSelected = React.useCallback((trackId: string) => {
    onSelectedTrackIdsChange?.((previous) => {
      const next = new Set(previous)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }, [onSelectedTrackIdsChange])
  const batchContextItems = React.useCallback((contextTrack: Track): ContextMenuItem[] => {
    const activeTracks = selectedIds.has(contextTrack.id) ? selectedTracks : [contextTrack]
    const activeIds = activeTracks.map((track) => track.id)
    return [
      { label: `已选择 ${activeTracks.length} 首歌曲`, onSelect: () => {} },
      { label: '-', onSelect: () => {} },
      { label: '批量编辑歌曲信息...', onSelect: () => onBatchEditTracks?.(activeTracks) },
      { label: '-', onSelect: () => {} },
      ...playlists.map((playlist) => ({
        label: `添加到播放列表：${playlist.name}`,
        onSelect: () => onBatchAddTracksToPlaylist?.(playlist.id, activeIds)
      })),
      ...(onRemoveFromPlaylist ? [{ label: '从当前播放列表移除', onSelect: () => onBatchRemoveTracksFromPlaylist?.(activeIds) }] : []),
      { label: '-', onSelect: () => {} },
      { label: '从资料库删除', danger: true, onSelect: () => onBatchDeleteTracks?.(activeIds) }
    ]
  }, [onBatchAddTracksToPlaylist, onBatchDeleteTracks, onBatchEditTracks, onBatchRemoveTracksFromPlaylist, onRemoveFromPlaylist, playlists, selectedIds, selectedTracks])
  return (
    <div className="track-list">
      {tracks.map((track) => (
        <button
          className={`track-row ${track.id === currentId ? 'current' : ''} ${isMultiSelectMode && selectedIds.has(track.id) ? 'selected' : ''}`}
          key={track.id}
          type="button"
          onClick={() => {
            if (isMultiSelectMode) {
              toggleSelected(track.id)
              return
            }
            onSelect(track.id)
          }}
          onContextMenu={(event) => {
            if (isMultiSelectMode) {
              if (!selectedIds.has(track.id)) {
                onSelectedTrackIdsChange?.(() => new Set([track.id]))
              }
              onOpenContextMenu(event, batchContextItems(track))
              return
            }
            onOpenContextMenu(event, [
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
            ])
          }}
        >
          <ArtworkImage className="track-art" src={trackArtwork(track, albums)} maxSize={64} alt="" loading="lazy" />
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
  showFullscreenActions,
  onOpenFullscreenSettings,
  onExitFullscreen,
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
  showFullscreenActions: boolean
  onOpenFullscreenSettings: () => void
  onExitFullscreen: () => void
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
    seekFromProgressClientX(event.clientX)
  }, [seekFromProgressClientX])
  const handleProgressPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isProgressPressedRef.current) return
    event.preventDefault()
    event.stopPropagation()
    seekFromProgressClientX(event.clientX)
  }, [seekFromProgressClientX])
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

  const progressRatio = progress / 100
  const trackSubtitle = track.metadataSource === 'externalPlayback' && track.album && track.album !== '外部播放'
    ? `${track.artist} · ${track.album}`
    : track.artist
  const miniPlayerStyle = {
    '--filter-url': 'url(#lg-mini)',
    '--mini-player-progress-ratio': progressRatio,
    '--mini-player-progress-width': `${progress}%`
  } as React.CSSProperties

  return (
    <>
      <div
        className={`mini-timeline-layer no-drag ${isPlaying ? 'playing' : ''}`}
        ref={progressRailRef}
        role="slider"
        aria-label="播放进度"
        aria-valuemax={safePlaybackDuration}
        aria-valuemin={0}
        aria-valuenow={Math.min(playbackTime, safePlaybackDuration)}
        tabIndex={0}
        onPointerDown={handleProgressPointerDown}
        onPointerMove={handleProgressPointerMove}
        onPointerUp={handleProgressPointerUp}
        onPointerCancel={handleProgressPointerCancel}
      >
        <span className="mini-progress-line" aria-hidden="true" />
      </div>
      {showFullscreenActions ? (
        <div className="mini-fullscreen-actions glass-panel no-drag" style={miniPlayerStyle}>
          <button type="button" aria-label="缩小到主界面" onClick={onExitFullscreen}>
            <Minimize2 size={22} />
          </button>
          <button type="button" aria-label="全屏播放设置" onClick={onOpenFullscreenSettings}>
            <Palette size={22} />
          </button>
        </div>
      ) : null}
      <div className={`mini-player glass-panel no-drag ${isPlaying ? 'playing' : ''}`} style={miniPlayerStyle}>
        <button className="mini-track" type="button" aria-label="打开窗口播放" onClick={onOpenNowPlaying}>
          <ArtworkImage src={trackArtwork(track, albums)} maxSize={72} alt="" />
          <div>
            <strong>{track.title}</strong>
            <span>{trackSubtitle}</span>
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
                  <ArtworkImage src={trackArtwork(queueTrack, albums)} maxSize={56} alt="" loading="lazy" />
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
    </>
  )
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
