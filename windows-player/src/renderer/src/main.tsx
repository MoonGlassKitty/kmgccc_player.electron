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
  artistId: string
  album: string
  albumId: string
  duration: number
  artworkUrl?: string
}

const albumArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/15/a4/a4/15a4a47c-62db-07c3-d14f-e78c3c8dec85/artwork.jpg/600x600bb.jpg'

const altArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e9/c4/38/e9c43893-e743-269a-6a47-c11120717177/artwork.jpg/600x600bb.jpg'

const fallbackHomeSnapshot: HomeSnapshot = {
  heroTrack: { id: 'myth', title: 'Myth', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: 'Myth', albumId: 'album-myth', duration: 241 },
  tracks: [
    { id: 'renascence', title: '!renascence!', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 113 },
    { id: 'basin', title: 'Basin', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 320 },
    { id: 'bones', title: 'Bones', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 232 },
    { id: 'float', title: 'Float', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: "This Won't Be The Last...", albumId: 'album-last', duration: 270 },
    { id: 'myth', title: 'Myth', artist: 'acloudyskye', artistId: 'artist-acloudyskye', album: 'Myth', albumId: 'album-myth', duration: 241 },
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
  onWheel: (event: React.WheelEvent<T>) => void
} {
  const scrollRef = React.useRef<T>(null)
  const onWheel = React.useCallback((_event: React.WheelEvent<T>) => {}, [])

  return { scrollRef, elasticOffset: 0, isSettling: false, onWheel }
}

type AppRoute =
  | { name: 'home' }
  | { name: 'allTracks' }
  | { name: 'artistDetail'; id: string; title: string }
  | { name: 'albumDetail'; id: string; title: string }
  | { name: 'playlistDetail'; id: string; title: string }

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

function tracksForRoute(route: Exclude<AppRoute, { name: 'home' }>, snapshot: HomeSnapshot): HomeTrack[] {
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

function detailArtwork(route: Exclude<AppRoute, { name: 'home' }>, snapshot: HomeSnapshot, albums: Map<string, HomeAlbumCard>): string {
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

function detailSubtitle(route: Exclude<AppRoute, { name: 'home' }>, snapshot: HomeSnapshot, tracks: HomeTrack[]): string {
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

function App(): React.ReactElement {
  const [homeSnapshot, setHomeSnapshot] = React.useState<HomeSnapshot>(fallbackHomeSnapshot)
  const [route, setRoute] = React.useState<AppRoute>({ name: 'home' })
  const [currentId, setCurrentId] = React.useState(fallbackHomeSnapshot.heroTrack?.id ?? fallbackHomeSnapshot.tracks[0]?.id ?? '')
  const [isPlaying, setIsPlaying] = React.useState(true)
  const albums = React.useMemo(() => albumById(homeSnapshot), [homeSnapshot])
  const currentTrack = React.useMemo(
    () => homeSnapshot.tracks.find((track) => track.id === currentId) ?? homeSnapshot.heroTrack ?? homeSnapshot.tracks[0],
    [currentId, homeSnapshot]
  )

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
  const selectTrack = React.useCallback((id: string) => {
    setCurrentId(id)
    setIsPlaying(true)
  }, [])
  const playHomeTrack = React.useCallback((trackId: string) => {
    setCurrentId(trackId)
    setIsPlaying(true)
  }, [])

  return (
    <div className="desktop-root">
      <LiquidGlassFilters />
      <div className="app-shell">
        <Sidebar snapshot={homeSnapshot} route={route} onNavigate={setRoute} />
        <WindowControls />
        <div className="titlebar-drag-region chrome-drag" aria-hidden="true" />

        <main className="content-pane">
          <Toolbar onNavigateHome={() => setRoute({ name: 'home' })} />
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

          {currentTrack ? <MiniPlayer track={currentTrack} albums={albums} isPlaying={isPlaying} onPlayPause={togglePlayback} /> : null}
        </main>
      </div>
    </div>
  )
}

const Sidebar = React.memo(function Sidebar({
  snapshot,
  route,
  onNavigate
}: {
  snapshot: HomeSnapshot
  route: AppRoute
  onNavigate: (route: AppRoute) => void
}): React.ReactElement {
  const primaryPlaylist = snapshot.playlists[0]
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
          艺人
        </button>
        <button className="sidebar-label as-button" type="button" onClick={() => onNavigate({ name: 'albumDetail', id: 'all-albums', title: '所有专辑' })}>
          专辑
        </button>
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

const Toolbar = React.memo(function Toolbar({ onNavigateHome }: { onNavigateHome: () => void }): React.ReactElement {
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
          className="toolbar-circle toolbar-liquid-pad glass-panel"
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
    <section className="home-page" ref={homeScroll.scrollRef} onWheel={homeScroll.onWheel}>
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
                className="home-person-card"
                key={artist.id}
                type="button"
                onClick={() => onNavigate({ name: 'artistDetail', id: artist.id, title: artist.name })}
              >
                {artist.artworkUrl ? (
                  <img src={artist.artworkUrl} alt="" />
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
                className="home-album-card"
                key={album.id}
                type="button"
                onClick={() => onNavigate({ name: 'albumDetail', id: album.id, title: album.title })}
              >
                <img src={albumArtworkFor(album)} alt="" />
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
                className="home-playlist-card"
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
      <img className="home-hero-bg" src={artwork} alt="" />
      <div className="home-hero-cover">
        <img src={artwork} alt="" />
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
    <section className="home-section-block">
      <div className="home-section-heading">
        <h2>音乐足迹</h2>
      </div>
      <div className="home-stat-grid">
        <HomeStatCard label="总歌曲" value={`${stats.totalTrackCount}`} suffix="首" />
        <HomeStatCard label="本周播放" value={`${stats.weeklyPlayCount}`} suffix="次" />
        <HomeStatCard label="本周时长" value={`${Math.round(stats.weeklyListeningSeconds / 60)}`} suffix="分钟" />
        <HomeStatCard label="本周常听" value={stats.favoriteArtistName ?? '-'} suffix={stats.favoriteArtistPlayCount ? `${stats.favoriteArtistPlayCount} 次播放` : ''} />
      </div>
      <div className="home-insight-grid">
        <div className="home-rank-panel">
          {stats.ranking.map((item, index) => (
            <div className="home-rank-row" key={item.trackId}>
              <span>{index + 1}</span>
              <img src={item.artworkUrl || albumArtwork} alt="" />
              <strong>{item.title}</strong>
              <small>{item.artist}</small>
              <i style={{ width: `${Math.max(18, item.score * 120)}px` }} />
              <em>{item.playCount}</em>
            </div>
          ))}
        </div>
        <div className="home-calendar-panel">
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
    <div className="home-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{suffix}</small>
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
  route: Exclude<AppRoute, { name: 'home' }>
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
            <img src={detailArtwork(route, snapshot, albums)} alt="" />
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
        <button className="home-person-card" key={artist.id} type="button" onClick={() => onArtist?.(artist)}>
          {artist.artworkUrl ? <img src={artist.artworkUrl} alt="" /> : <span className="artist-avatar">{artist.name}</span>}
          <strong>{artist.name}</strong>
        </button>
      ))}
      {albums?.map((album) => (
        <button className="home-album-card" key={album.id} type="button" onClick={() => onAlbum?.(album)}>
          <img src={albumArtworkFor(album)} alt="" />
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
          <img className="track-art" src={trackArtwork(track, albums)} alt="" />
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
  onPlayPause
}: {
  track: Track
  albums: Map<string, HomeAlbumCard>
  isPlaying: boolean
  onPlayPause: () => void
}): React.ReactElement {
  return (
    <div className="mini-player glass-panel no-drag" style={{ '--filter-url': 'url(#lg-mini)' } as React.CSSProperties}>
      <div className="mini-track">
        <img src={trackArtwork(track, albums)} alt="" />
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
      <div className="mini-timeline">
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
    </div>
  )
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
