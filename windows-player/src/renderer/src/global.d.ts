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
    discNumber?: number
    trackNumber?: number
    artworkUrl?: string
    sourcePath?: string
    sourceUrl?: string
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

  type HomeArtistCard = {
    id: string
    name: string
    artworkUrl?: string
    trackCount: number
    albumCount: number
    description?: string
    genreTags?: string[]
    region?: string
    foreignName?: string
    qqMusicSingerMid?: string
    metadataSource?: string
    metadataFetchedAt?: string
    metadataConfidence?: number
    customArtworkUrl?: string
  }

  type HomeAlbumCard = {
    id: string
    title: string
    artist: string
    artistId: string
    artworkUrl?: string
    trackCount: number
    description?: string
    releaseYear?: number
    releaseDate?: string
    albumType?: string
    genreTags?: string[]
    language?: string
    labelOrCompany?: string
    qqMusicAlbumMid?: string
    metadataSource?: string
    metadataFetchedAt?: string
    metadataConfidence?: number
    customArtworkUrl?: string
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

  type LibraryLocationInfo = {
    currentPath: string
    isDefault: boolean
  }

  type ExternalPlaybackSourceMode = 'thirdParty' | 'other' | 'auto'

  type ExternalPlaybackSnapshot = {
    available: boolean
    sourceMode: ExternalPlaybackSourceMode
    connectionState: 'unavailable' | 'disconnected' | 'connectedNoMetadata' | 'runningHasData'
    sourceAppUserModelId?: string
    title: string
    artist: string
    album?: string
    duration: number
    currentTime: number
    isPlaying: boolean
    playbackRate: number
    canControlPlayback: boolean
    canSkip: boolean
    canSeek: boolean
    updatedAt: number
    artworkUrl?: string
    audioSourceUrl?: string
    neteaseSongId?: number
    lyricsText?: string
    syncedLyrics?: string
    error?: string
  }

  type ExternalPlaybackVolumeSnapshot = {
    available: boolean
    volume: number
    muted: boolean
    processName?: string
    sessionCount?: number
    error?: string
  }

  type TapeDevicePresenceSnapshot = {
    connected: boolean
    names: string[]
    instanceIds: string[]
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
      artist: 'completed' | 'noResults' | 'failed'
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
      lookupAlbumMetadata: (values: Record<string, unknown>) => Promise<Record<string, unknown> | null>
      lookupArtistMetadata: (values: Record<string, unknown>) => Promise<Record<string, unknown> | null>
      lookupLyrics: (values: Record<string, unknown>) => Promise<{ lyricsText?: string; syncedLyrics?: string; neteaseSongId?: number; qqMusicSongId?: string } | null>
      lookupCover: (values: Record<string, unknown>) => Promise<Array<{ artworkUrl: string; source: string; label?: string }>>
      clearLibrary: () => Promise<HomeSnapshot>
      updateTrack: (track: LocalAudioImport) => Promise<HomeSnapshot>
      deleteTrack: (trackId: string) => Promise<HomeSnapshot>
      updateAlbum: (albumId: string, values: Record<string, unknown>) => Promise<HomeSnapshot>
      deleteAlbum: (albumId: string) => Promise<HomeSnapshot>
      updateArtist: (artistId: string, values: Record<string, unknown>) => Promise<HomeSnapshot>
      deleteArtist: (artistId: string) => Promise<HomeSnapshot>
      createPlaylist: (name: string) => Promise<HomeSnapshot>
      updatePlaylist: (playlistId: string, name: string) => Promise<HomeSnapshot>
      deletePlaylist: (playlistId: string) => Promise<HomeSnapshot>
      addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<HomeSnapshot>
      removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<HomeSnapshot>
      getLibraryLocation: () => Promise<LibraryLocationInfo>
      chooseLibraryLocation: () => Promise<LibraryLocationInfo>
      showLibraryLocation: () => Promise<LibraryLocationInfo>
      resetLibraryLocation: () => Promise<LibraryLocationInfo>
      clearIndexCache: () => Promise<HomeSnapshot>
      clearExternalPlaybackCache: () => Promise<boolean>
      completeLibraryMetadata: () => Promise<{ completed: number; snapshot: HomeSnapshot }>
      getExternalPlaybackSnapshot: (mode?: ExternalPlaybackSourceMode) => Promise<ExternalPlaybackSnapshot>
      setExternalPlaybackSourceMode: (mode: ExternalPlaybackSourceMode) => Promise<ExternalPlaybackSnapshot>
      sendExternalPlaybackCommand: (command: string, value?: number) => Promise<boolean>
      getExternalPlaybackVolume: () => Promise<ExternalPlaybackVolumeSnapshot>
      setExternalPlaybackVolume: (volume: number) => Promise<ExternalPlaybackVolumeSnapshot>
      getSystemPlatform: () => Promise<NodeJS.Platform>
      getTapeDevicePresence: () => Promise<TapeDevicePresenceSnapshot>
      sampleWindowColor: (rect: { x: number; y: number; width: number; height: number }) => Promise<{ r: number; g: number; b: number } | null>
      getWallpaperTint: () => Promise<WallpaperTint>
    }
  }
}
