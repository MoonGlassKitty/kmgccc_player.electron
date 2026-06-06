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
  Volume2,
  X
} from 'lucide-react'
import { LiquidGlassFilters } from './LiquidGlassFilter'
import './styles.css'

type Track = {
  id: string
  title: string
  artist: string
  duration: string
  artwork: string
}

const albumArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/15/a4/a4/15a4a47c-62db-07c3-d14f-e78c3c8dec85/artwork.jpg/600x600bb.jpg'

const altArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e9/c4/38/e9c43893-e743-269a-6a47-c11120717177/artwork.jpg/600x600bb.jpg'

const tracks: Track[] = [
  { id: 'renascence', title: '!renascence!', artist: 'acloudyskye', duration: '1:53', artwork: albumArtwork },
  { id: 'basin', title: 'Basin', artist: 'acloudyskye', duration: '5:20', artwork: albumArtwork },
  { id: 'bones', title: 'Bones', artist: 'acloudyskye', duration: '3:52', artwork: albumArtwork },
  { id: 'float', title: 'Float', artist: 'acloudyskye', duration: '4:30', artwork: albumArtwork },
  { id: 'home', title: 'Home', artist: 'acloudyskye', duration: '6:15', artwork: albumArtwork },
  { id: 'innards', title: 'Innards', artist: 'acloudyskye', duration: '6:39', artwork: albumArtwork },
  { id: 'myth', title: 'Myth', artist: 'acloudyskye', duration: '4:01', artwork: altArtwork },
  { id: 'spill', title: 'Spill', artist: 'acloudyskye', duration: '3:33', artwork: altArtwork },
  { id: 'shoots', title: 'Shoots', artist: 'acloudyskye', duration: '4:09', artwork: altArtwork }
]

const elasticScrollLimit = 42

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function useElasticScroll<T extends HTMLElement>(): {
  scrollRef: React.RefObject<T | null>
  elasticOffset: number
  isSettling: boolean
  onWheel: (event: React.WheelEvent<T>) => void
} {
  const scrollRef = React.useRef<T>(null)
  const settleTimerRef = React.useRef<number | null>(null)
  const offsetRef = React.useRef(0)
  const [elasticOffset, setElasticOffsetState] = React.useState(0)
  const [isSettling, setIsSettling] = React.useState(false)

  const setElasticOffset = React.useCallback((value: number) => {
    offsetRef.current = value
    setElasticOffsetState(value)
  }, [])

  const settle = React.useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
    }

    settleTimerRef.current = window.setTimeout(() => {
      setIsSettling(true)
      setElasticOffset(0)
    }, 80)
  }, [setElasticOffset])

  const onWheel = React.useCallback(
    (event: React.WheelEvent<T>) => {
      const node = event.currentTarget
      const atTop = node.scrollTop <= 0
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
      const pullsPastTop = event.deltaY < 0 && atTop
      const pullsPastBottom = event.deltaY > 0 && atBottom

      if (!pullsPastTop && !pullsPastBottom) {
        if (offsetRef.current !== 0) {
          setIsSettling(true)
          setElasticOffset(0)
        }
        return
      }

      event.preventDefault()
      setIsSettling(false)

      const pull = clamp(Math.abs(event.deltaY) * 0.18, 3, 18)
      const direction = pullsPastTop ? 1 : -1
      const nextOffset = clamp(offsetRef.current + direction * pull, -elasticScrollLimit, elasticScrollLimit)

      setElasticOffset(nextOffset)
      settle()
    },
    [setElasticOffset, settle]
  )

  React.useEffect(
    () => () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current)
      }
    },
    []
  )

  return { scrollRef, elasticOffset, isSettling, onWheel }
}

function App(): React.ReactElement {
  const [currentId, setCurrentId] = React.useState('myth')
  const [isPlaying, setIsPlaying] = React.useState(true)
  const artistScroll = useElasticScroll<HTMLElement>()
  const currentTrack = React.useMemo(() => tracks.find((track) => track.id === currentId) ?? tracks[0], [currentId])
  const togglePlayback = React.useCallback(() => {
    setIsPlaying((value) => !value)
  }, [])
  const selectTrack = React.useCallback((id: string) => {
    setCurrentId(id)
  }, [])

  return (
    <div className="desktop-root">
      <LiquidGlassFilters />
      <div className="app-shell">
        <Sidebar />
        <WindowControls />

        <main className="content-pane">
          <Toolbar />
          <section className="artist-page" ref={artistScroll.scrollRef} onWheel={artistScroll.onWheel}>
            <div
              className={`artist-scroll-content ${artistScroll.elasticOffset !== 0 ? 'elastic-active' : ''} ${
                artistScroll.isSettling ? 'settling' : ''
              }`}
              style={{ transform: `translate3d(0, ${artistScroll.elasticOffset}px, 0)` }}
            >
              <header className="artist-header">
                <div className="artist-image-frame">
                  <img src={albumArtwork} alt="" />
                </div>
                <div className="artist-copy">
                  <h1>acloudyskye</h1>
                  <p className="artist-meta">9 首歌曲 · 1 张专辑</p>
                  <p className="artist-description">acloudyskye，欧美音乐人，曾发表作品《What Do You Want!》。</p>
                  <div className="artist-actions">
                    <button className="play-cta" type="button" onClick={togglePlayback}>
                      {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                      {isPlaying ? '暂停' : '播放'}
                    </button>
                    <button className="edit-button" type="button" aria-label="编辑">
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              </header>

              <TrackRows currentId={currentId} onSelect={selectTrack} />
            </div>
          </section>

          <MiniPlayer track={currentTrack} isPlaying={isPlaying} onPlayPause={togglePlayback} />
        </main>
      </div>
    </div>
  )
}

const Sidebar = React.memo(function Sidebar(): React.ReactElement {
  return (
    <aside className="sidebar glass-panel chrome-drag" style={{ '--filter-url': 'url(#lg-sidebar)' } as React.CSSProperties}>
      <div className="sidebar-titlebar no-drag">
        <button className="sidebar-toggle" type="button" aria-label="侧边栏">
          <ListMusic size={20} />
        </button>
      </div>

      <div className="sidebar-source no-drag" role="tablist" aria-label="播放源">
        <button className="active" type="button">
          本地
        </button>
        <button type="button">Apple Music</button>
      </div>

      <nav className="sidebar-nav no-drag">
        <a className="nav-row active">
          <House size={20} />
          <span>主页</span>
        </a>
        <a className="nav-row">
          <ListMusic size={20} />
          <span>所有歌曲</span>
        </a>
      </nav>

      <section className="sidebar-section no-drag">
        <div className="sidebar-label">
          <span>播放列表</span>
          <button type="button" aria-label="新建播放列表">
            <Plus size={17} />
          </button>
        </div>
        <button className="playlist-row" type="button">
          <span className="playlist-icon">
            <Music2 size={18} />
          </span>
          <span>导入于 6月 5</span>
        </button>
      </section>

      <section className="sidebar-section compact no-drag">
        <div className="sidebar-label">艺人</div>
        <div className="sidebar-label">专辑</div>
      </section>

      <div className="sidebar-bottom no-drag">
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

const Toolbar = React.memo(function Toolbar(): React.ReactElement {
  return (
    <header className="toolbar chrome-drag">
      <div className="toolbar-left no-drag">
        <div className="toolbar-pill glass-panel" style={{ '--filter-url': 'url(#lg-toolbar-pill)' } as React.CSSProperties}>
          <button type="button" aria-label="返回">
            <ChevronLeft size={23} />
          </button>
          <span className="toolbar-divider" />
          <button type="button" aria-label="前进">
            <ChevronRight size={23} />
          </button>
        </div>

        <button
          className="toolbar-circle glass-panel"
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
          <button type="button" aria-label="导入">
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
          className="toolbar-circle glass-panel"
          type="button"
          aria-label="歌词"
          style={{ '--filter-url': 'url(#lg-circle)' } as React.CSSProperties}
        >
          <MessageSquareQuote size={20} />
        </button>
      </div>
    </header>
  )
})

const TrackRows = React.memo(function TrackRows({
  currentId,
  onSelect
}: {
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
          <img className="track-art" src={track.artwork} alt="" />
          <span className="track-title">{track.title}</span>
          <span className="track-artist">{track.artist}</span>
          <span className="track-duration">{track.duration}</span>
          <span className="track-more">•••</span>
        </button>
      ))}
    </div>
  )
})

const MiniPlayer = React.memo(function MiniPlayer({
  track,
  isPlaying,
  onPlayPause
}: {
  track: Track
  isPlaying: boolean
  onPlayPause: () => void
}): React.ReactElement {
  return (
    <div className="mini-player glass-panel no-drag" style={{ '--filter-url': 'url(#lg-mini)' } as React.CSSProperties}>
      <div className="mini-track">
        <img src={track.artwork} alt="" />
        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
      </div>
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
      <div className="progress-track" aria-hidden="true">
        <span />
      </div>
      <div className="volume-track">
        <Volume2 size={16} />
        <div className="volume-bar">
          <span />
          <i />
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
