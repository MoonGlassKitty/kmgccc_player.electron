export {}

declare global {
  type HomeTrack = {
    id: string
    title: string
    artist: string
    artistId: string
    album: string
    albumId: string
    duration: number
    artworkUrl?: string
  }

  type HomeArtistCard = {
    id: string
    name: string
    artworkUrl?: string
    trackCount: number
    albumCount: number
  }

  type HomeAlbumCard = {
    id: string
    title: string
    artist: string
    artistId: string
    artworkUrl?: string
    trackCount: number
  }

  type HomePlaylistCard = {
    id: string
    name: string
    artworkUrl?: string
    trackCount: number
    trackIds: string[]
  }

  type HomeRankItem = {
    trackId: string
    title: string
    artist: string
    artworkUrl?: string
    playCount: number
    score: number
  }

  type HomeStats = {
    totalTrackCount: number
    weeklyPlayCount: number
    weeklyListeningSeconds: number
    favoriteArtistName?: string
    favoriteArtistPlayCount?: number
    ranking: HomeRankItem[]
    dailyListeningMap: Record<string, number>
  }

  type HomeSnapshot = {
    heroTrack: HomeTrack | null
    tracks: HomeTrack[]
    artists: HomeArtistCard[]
    albums: HomeAlbumCard[]
    playlists: HomePlaylistCard[]
    stats: HomeStats
  }

  type WallpaperTint = {
    source: 'macos' | 'windows' | 'linux' | 'fallback'
    primary: string
    secondary: string
    wallpaperPath?: string
  }

  interface Window {
    kmgccc?: {
      minimize: () => void
      toggleMaximize: () => void
      close: () => void
      getHomeSnapshot: () => Promise<HomeSnapshot>
      getWallpaperTint: () => Promise<WallpaperTint>
    }
  }
}
