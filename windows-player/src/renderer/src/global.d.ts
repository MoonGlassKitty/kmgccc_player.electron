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
    sourcePath?: string
    sourceUrl?: string
    lyricsText?: string
    syncedLyrics?: string
    metadataSource?: string
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
    wallpaperDataUrl?: string
  }

  type LocalAudioImport = HomeTrack & {
    sourcePath: string
    sourceUrl: string
    originalSourcePath?: string
    convertedFromNcm?: boolean
    conversionOutputPath?: string
    conversionFormat?: string
  }

  type TrackMetadataSyncResult = {
    track: LocalAudioImport
    album: {
      id: string
      title: string
      artist: string
      artistId: string
      artworkUrl?: string
    }
    statuses: {
      track: 'completed' | 'noResults' | 'failed'
      lyrics: 'completed' | 'noResults' | 'failed'
      album: 'completed' | 'noResults' | 'failed'
    }
  }

  interface Window {
    kmgccc?: {
      minimize: () => void
      toggleMaximize: () => void
      close: () => void
      getHomeSnapshot: () => Promise<HomeSnapshot>
      importAudioFile: () => Promise<LocalAudioImport | null>
      importAudioFiles: () => Promise<{ tracks: LocalAudioImport[] } | null>
      importAudioFilesFromPaths: (filePaths: string[]) => Promise<{ tracks: LocalAudioImport[] }>
      syncTrackInfo: (track: LocalAudioImport) => Promise<TrackMetadataSyncResult>
      clearLibrary: () => Promise<HomeSnapshot>
      updateTrack: (track: LocalAudioImport) => Promise<HomeSnapshot>
      deleteTrack: (trackId: string) => Promise<HomeSnapshot>
      updateAlbum: (albumId: string, title: string, artist: string) => Promise<HomeSnapshot>
      deleteAlbum: (albumId: string) => Promise<HomeSnapshot>
      updateArtist: (artistId: string, name: string) => Promise<HomeSnapshot>
      deleteArtist: (artistId: string) => Promise<HomeSnapshot>
      createPlaylist: (name: string) => Promise<HomeSnapshot>
      updatePlaylist: (playlistId: string, name: string) => Promise<HomeSnapshot>
      deletePlaylist: (playlistId: string) => Promise<HomeSnapshot>
      addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<HomeSnapshot>
      removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<HomeSnapshot>
      getWallpaperTint: () => Promise<WallpaperTint>
    }
  }
}
