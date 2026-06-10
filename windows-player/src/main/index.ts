import { app, BrowserWindow, dialog, ipcMain, nativeImage, net, protocol, shell } from 'electron'
import { execFile, execFileSync } from 'node:child_process'
import { createDecipheriv, createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { decryptQrcHex, parseQrc, type LyricLine as AmllParsedLyricLine } from '@applemusic-like-lyrics/lyric'

const isDev = Boolean(process.env.ELECTRON_RENDERER_URL)

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'kmgccc-media',
    privileges: {
      standard: true,
      stream: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

const altArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e9/c4/38/e9c43893-e743-269a-6a47-c11120717177/artwork.jpg/600x600bb.jpg'

type WallpaperTint = {
  source: 'macos' | 'windows' | 'linux' | 'fallback'
  primary: string
  secondary: string
  wallpaperPath?: string
  wallpaperDataUrl?: string
}

type WindowColorSampleRect = {
  x: number
  y: number
  width: number
  height: number
}

type WindowColorSample = {
  r: number
  g: number
  b: number
}

type LocalAudioImport = {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  duration: number
  discNumber?: number
  trackNumber?: number
  sourcePath: string
  sourceUrl: string
  originalSourcePath?: string
  convertedFromNcm?: boolean
  conversionOutputPath?: string
  conversionFormat?: string
  artworkUrl?: string
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

type PersistedLibrary = {
  version: 2
  tracks: LocalAudioImport[]
  playlists: PersistedPlaylist[]
}

type PersistedPlaylist = {
  id: string
  name: string
  artworkUrl?: string
  trackIds: string[]
}

type NcmMetadata = {
  musicName?: string
  artist?: Array<[string, number]>
  album?: string
  albumPic?: string
  albumPicDocId?: string
  format?: string
  duration?: number
  musicId?: number
}

type NcmConversionResult = {
  audioPath: string
  originalPath: string
  format: string
  metadata: NcmMetadata | null
  artworkUrl?: string
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

type AudioImportBatchResult = {
  tracks: LocalAudioImport[]
}

type LyricsLookupPlatform = 'auto' | 'amll' | 'qq' | 'kugou' | 'netease'

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
  artworkUrl?: string
  lyricsText?: string
  syncedLyrics?: string
  updatedAt: number
  error?: string
}

type MediaRemotePayload = {
  bundleIdentifier?: string
  parentApplicationBundleIdentifier?: string
  clientBundleIdentifier?: string
  ownerBundleIdentifier?: string
  applicationBundleIdentifier?: string
  processIdentifier?: number
  pid?: number
  playing?: boolean
  title?: string
  artist?: string
  album?: string
  duration?: number
  elapsedTime?: number
  elapsedTimeNow?: number
  timestamp?: string
  playbackRate?: number
  artworkMimeType?: string
  artworkData?: string
  repeatMode?: number
  shuffleMode?: number
  uniqueIdentifier?: string
  contentItemIdentifier?: string
}

type MediaRemoteEnvelope = {
  type?: string
  diff?: boolean
  payload?: MediaRemotePayload | null
}

type MediaRemoteAdapterPaths = {
  script: string
  framework: string
  testClient?: string
}

type ItunesSearchResult = {
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
  trackTimeMillis?: number
}

type ItunesAlbumSearchResult = {
  collectionName?: string
  artistName?: string
  artworkUrl100?: string
  releaseDate?: string
  primaryGenreName?: string
  collectionType?: string
}

type ItunesArtistSearchResult = {
  artistName?: string
  primaryGenreName?: string
  artistLinkUrl?: string
}

type NetEaseArtistSearchResult = {
  name?: string
  id?: number
  picUrl?: string
  img1v1Url?: string
}

type CoverLookupCandidate = {
  artworkUrl: string
  source: string
  label?: string
}

type RawCoverLookupCandidate = CoverLookupCandidate & {
  confidence?: number
  matchedTitle?: string
  matchedArtist?: string
  matchedAlbum?: string
}

type MetadataArtworkSyncCache = {
  albumArtworkByKey: Map<string, Promise<CoverLookupCandidate | null>>
  artistArtworkByKey: Map<string, Promise<CoverLookupCandidate | null>>
}

type NetEaseSongSearchResult = {
  name?: string
  id?: number
  duration?: number
  artists?: Array<{ name?: string; id?: number }>
  album?: {
    name?: string
    id?: number
    picUrl?: string
  }
}

type NetEaseAlbumSearchResult = {
  id?: number
  name?: string
  picUrl?: string
  artists?: Array<{ name?: string; id?: number }>
  artist?: { name?: string; id?: number }
}

type QQMusicSearchType = 'song' | 'singer' | 'album'

type QQMusicSongSearchItem = {
  id?: number | string
  title?: string
  name?: string
  mid?: string
  interval?: number
  singer?: Array<{ name?: string; mid?: string; singerMid?: string; singerMID?: string }>
  album?: {
    name?: string
    title?: string
    mid?: string
    albumMid?: string
    albumMID?: string
  }
}

type QQMusicAlbumSearchItem = {
  title?: string
  name?: string
  albumName?: string
  albumname?: string
  mid?: string
  albumMid?: string
  albumMID?: string
  singer?: Array<{ name?: string }>
  singerName?: string
  singer_name?: string
  artist?: string
  artistName?: string
  picURL?: string
  picUrl?: string
  albumPic?: string
  image?: string
}

type QQMusicSingerSearchItem = {
  title?: string
  name?: string
  singerName?: string
  mid?: string
  singerMid?: string
  singerMID?: string
  singerPic?: string
  pic?: string
  picURL?: string
  picUrl?: string
  image?: string
}

type MetadataCandidate = {
  title?: string
  artist?: string
  album?: string
  duration?: number
  artworkUrl?: string
  neteaseSongId?: number
  source: string
  score: number
}

type LrcLibResult = {
  trackName?: string
  artistName?: string
  albumName?: string
  plainLyrics?: string | null
  syncedLyrics?: string | null
}

type QQMusicLyricCandidate = {
  songId: string
  title?: string
  artist?: string
  album?: string
  score: number
}

type AmllDbSearchResult = {
  title?: string
  titles?: string[]
  artist?: string
  artists?: string[]
  album?: string | string[]
  albums?: string[]
  ncmIds?: Array<string | number>
  file?: string
  id?: string
  score?: number
}

type LddcSource = 'QM' | 'KG' | 'NE'

type LddcCandidate = {
  source: LddcSource | 'AMLLDB' | string
  id: string
  score: number
  title: string
  artist?: string
  album?: string
  duration_ms?: number
  extra?: Record<string, string>
}

type LddcSearchResponse = {
  results?: LddcCandidate[]
  errors?: string[]
}

type LddcFetchSeparateResponse = {
  lrc_orig?: string
  lrc_trans?: string
  error?: string
}

type NetEaseLyricPayload = {
  code?: number
  lrc?: { lyric?: string }
  tlyric?: { lyric?: string }
  yrc?: { lyric?: string }
}

type LyricsLookupResult = Pick<LocalAudioImport, 'lyricsText' | 'syncedLyrics' | 'neteaseSongId' | 'qqMusicSongId'>

function mediaUrlForPath(audioPath: string): string {
  const encodedPath = Buffer.from(audioPath, 'utf8').toString('base64url')
  return `kmgccc-media://audio/${encodedPath}`
}

function stableIdForPath(audioPath: string): string {
  return createHash('sha256').update(audioPath).digest('hex').slice(0, 24)
}

function mimeTypeForAudioPath(audioPath: string): string {
  switch (extname(audioPath).toLowerCase()) {
    case '.flac':
      return 'audio/flac'
    case '.m4a':
    case '.mp4':
      return 'audio/mp4'
    case '.ogg':
    case '.oga':
      return 'audio/ogg'
    case '.wav':
      return 'audio/wav'
    case '.mp3':
    default:
      return 'audio/mpeg'
  }
}

function libraryStorePath(): string {
  return join(activeLibraryRootPath(), 'library-store.json')
}

function libraryLocationConfigPath(): string {
  return join(app.getPath('userData'), 'library-location.json')
}

function defaultLibraryRootPath(): string {
  return app.getPath('userData')
}

function activeLibraryRootPath(): string {
  try {
    const raw = readFileSync(libraryLocationConfigPath(), 'utf8')
    const parsed = JSON.parse(raw) as { rootPath?: unknown }
    if (typeof parsed.rootPath === 'string' && parsed.rootPath.trim()) return parsed.rootPath
  } catch {
    return defaultLibraryRootPath()
  }
  return defaultLibraryRootPath()
}

function saveLibraryRootPath(rootPath: string): void {
  const configPath = libraryLocationConfigPath()
  mkdirSync(dirname(configPath), { recursive: true })
  writeFileSync(configPath, JSON.stringify({ rootPath }, null, 2), 'utf8')
}

function libraryLocationInfo(): { currentPath: string; isDefault: boolean } {
  const currentPath = activeLibraryRootPath()
  return {
    currentPath,
    isDefault: currentPath === defaultLibraryRootPath()
  }
}

function resolvedLibraryRootFromSelection(selectedPath: string): string {
  if (basename(selectedPath) === 'kmgccc_player Library') return selectedPath
  return join(selectedPath, 'kmgccc_player Library')
}

function isPersistableTrack(value: unknown): value is LocalAudioImport {
  if (!value || typeof value !== 'object') return false
  const track = value as Partial<LocalAudioImport>
  return Boolean(track.id && track.title && track.artist && track.album && track.sourcePath && track.sourceUrl)
}

function isPersistedPlaylist(value: unknown): value is PersistedPlaylist {
  if (!value || typeof value !== 'object') return false
  const playlist = value as Partial<PersistedPlaylist>
  return Boolean(playlist.id && playlist.name && Array.isArray(playlist.trackIds))
}

function loadPersistedLibrary(): PersistedLibrary {
  try {
    const raw = readFileSync(libraryStorePath(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<PersistedLibrary>
    return {
      version: 2,
      tracks: Array.isArray(parsed.tracks) ? parsed.tracks.filter(isPersistableTrack) : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists.filter(isPersistedPlaylist) : []
    }
  } catch {
    return { version: 2, tracks: [], playlists: [] }
  }
}

function loadPersistedTracks(): LocalAudioImport[] {
  return loadPersistedLibrary().tracks
}

function persistenceKeyForTrack(track: LocalAudioImport): string {
  return track.originalSourcePath || track.sourcePath || track.sourceUrl || track.id
}

function mergeTrackList(tracks: LocalAudioImport[]): LocalAudioImport[] {
  const merged: LocalAudioImport[] = []
  const indexByKey = new Map<string, number>()

  tracks.forEach((track) => {
    const key = persistenceKeyForTrack(track)
    const existingIndex = indexByKey.get(key)
    if (existingIndex === undefined) {
      indexByKey.set(key, merged.length)
      merged.push(track)
      return
    }
    merged[existingIndex] = track
  })

  return merged
}

function savePersistedLibrary(library: Pick<PersistedLibrary, 'tracks' | 'playlists'>): void {
  const storePath = libraryStorePath()
  mkdirSync(dirname(storePath), { recursive: true })
  const tracks = mergeTrackList(library.tracks)
  const trackIds = new Set(tracks.map((track) => track.id))
  const payload: PersistedLibrary = {
    version: 2,
    tracks,
    playlists: library.playlists
      .filter(isPersistedPlaylist)
      .map((playlist) => ({
        ...playlist,
        trackIds: playlist.trackIds.filter((id, index, ids) => trackIds.has(id) && ids.indexOf(id) === index)
      }))
      .filter((playlist) => playlist.id !== 'playlist-library')
  }
  writeFileSync(storePath, JSON.stringify(payload, null, 2), 'utf8')
}

function savePersistedTracks(tracks: LocalAudioImport[]): void {
  const library = loadPersistedLibrary()
  savePersistedLibrary({ tracks, playlists: library.playlists })
}

function upsertPersistedTrack(track: LocalAudioImport): void {
  savePersistedTracks(mergeTrackList([...loadPersistedTracks(), track]))
}

function upsertPersistedTracks(tracks: LocalAudioImport[]): void {
  savePersistedTracks(mergeTrackList([...loadPersistedTracks(), ...tracks]))
}

function tracksForHomeSnapshot(): LocalAudioImport[] {
  return mergeTrackList(loadPersistedTracks())
}

async function importAudioFilesFromPaths(filePaths: string[]): Promise<AudioImportBatchResult> {
  const tracks: LocalAudioImport[] = []
  for (const filePath of filePaths) {
    tracks.push(await localAudioImportFromPath(filePath))
  }
  upsertPersistedTracks(tracks)
  return { tracks }
}

function albumsForTracks(tracks: LocalAudioImport[]) {
  const albums = new Map<string, {
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
  }>()
  tracks.forEach((track) => {
    const existing = albums.get(track.albumId)
    if (existing) {
      existing.trackCount += 1
      existing.artworkUrl ||= track.albumArtworkUrl || track.artworkUrl
      return
    }
    albums.set(track.albumId, {
      id: track.albumId,
      title: track.album,
      artist: track.artist,
      artistId: track.artistId,
      artworkUrl: track.albumArtworkUrl || track.artworkUrl,
      trackCount: 1,
      description: track.albumDescription,
      releaseYear: track.albumReleaseYear,
      releaseDate: track.albumReleaseDate,
      albumType: track.albumType,
      genreTags: track.albumGenreTags,
      language: track.albumLanguage,
      labelOrCompany: track.albumLabelOrCompany,
      qqMusicAlbumMid: track.qqMusicAlbumMid,
      metadataSource: track.albumMetadataSource,
      metadataFetchedAt: track.albumMetadataFetchedAt,
      metadataConfidence: track.albumMetadataConfidence,
      customArtworkUrl: track.albumArtworkUrl
    })
  })
  return Array.from(albums.values())
}

function artistsForTracks(tracks: LocalAudioImport[]) {
  const artists = new Map<string, {
    id: string
    name: string
    artworkUrl?: string
    trackCount: number
    albumIds: Set<string>
    description?: string
    genreTags?: string[]
    region?: string
    foreignName?: string
    qqMusicSingerMid?: string
    metadataSource?: string
    metadataFetchedAt?: string
    metadataConfidence?: number
    customArtworkUrl?: string
  }>()
  tracks.forEach((track) => {
    const existing = artists.get(track.artistId)
    if (existing) {
      existing.trackCount += 1
      existing.albumIds.add(track.albumId)
      existing.artworkUrl ||= track.artistArtworkUrl || track.artworkUrl
      return
    }
    artists.set(track.artistId, {
      id: track.artistId,
      name: track.artist,
      artworkUrl: track.artistArtworkUrl || track.artworkUrl,
      trackCount: 1,
      albumIds: new Set([track.albumId]),
      description: track.artistDescription,
      genreTags: track.artistGenreTags,
      region: track.artistRegion,
      foreignName: track.artistForeignName,
      qqMusicSingerMid: track.qqMusicSingerMid,
      metadataSource: track.artistMetadataSource,
      metadataFetchedAt: track.artistMetadataFetchedAt,
      metadataConfidence: track.artistMetadataConfidence,
      customArtworkUrl: track.artistArtworkUrl
    })
  })
  return Array.from(artists.values()).map((artist) => ({
    id: artist.id,
    name: artist.name,
    artworkUrl: artist.artworkUrl,
    trackCount: artist.trackCount,
    albumCount: artist.albumIds.size,
    description: artist.description,
    genreTags: artist.genreTags,
    region: artist.region,
    foreignName: artist.foreignName,
    qqMusicSingerMid: artist.qqMusicSingerMid,
    metadataSource: artist.metadataSource,
    metadataFetchedAt: artist.metadataFetchedAt,
    metadataConfidence: artist.metadataConfidence,
    customArtworkUrl: artist.customArtworkUrl
  }))
}

function playlistsForTracks(tracks: LocalAudioImport[], persistedPlaylists: PersistedPlaylist[]) {
  const trackIds = new Set(tracks.map((track) => track.id))
  const libraryPlaylist = tracks.length
    ? [{
      id: 'playlist-library',
      name: '资料库',
      trackCount: tracks.length,
      trackIds: tracks.map((track) => track.id)
    }]
    : []
  const userPlaylists = persistedPlaylists
    .filter((playlist) => playlist.id !== 'playlist-library')
    .map((playlist) => {
      const validTrackIds = playlist.trackIds.filter((id) => trackIds.has(id))
      return {
        ...playlist,
        trackCount: validTrackIds.length,
        trackIds: validTrackIds
      }
    })
  return [...libraryPlaylist, ...userPlaylists]
}

function updateTracksForEditedTrack(updatedTrack: LocalAudioImport): LocalAudioImport[] {
  const ids = idsForMetadata(updatedTrack.artist, updatedTrack.album)
  const normalizedTrack = {
    ...updatedTrack,
    artistId: ids.artistId,
    albumId: ids.albumId,
    sourceUrl: mediaUrlForPath(updatedTrack.sourcePath)
  }
  return mergeTrackList(loadPersistedTracks().map((track) => (track.id === normalizedTrack.id ? normalizedTrack : track)))
}

function deleteTracksByPredicate(predicate: (track: LocalAudioImport) => boolean): void {
  const library = loadPersistedLibrary()
  const nextTracks = library.tracks.filter((track) => !predicate(track))
  savePersistedLibrary({ tracks: nextTracks, playlists: library.playlists })
}

function createPlaylist(name: string): PersistedPlaylist {
  const library = loadPersistedLibrary()
  const id = `playlist-${normalizedSlug(name, 'playlist')}-${Date.now().toString(36)}`
  const playlist = { id, name, trackIds: [] }
  savePersistedLibrary({ tracks: library.tracks, playlists: [playlist, ...library.playlists] })
  return playlist
}

function dataUrlForImage(data: Uint8Array, mimeType = 'image/jpeg'): string {
  return `data:${mimeType};base64,${Buffer.from(data).toString('base64')}`
}

function mimeTypeForImageResponse(response: Response, data: Uint8Array): string {
  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim()
  if (contentType?.startsWith('image/')) return contentType
  if (data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg'
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'image/png'
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return 'image/gif'
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46) return 'image/webp'
  return 'image/jpeg'
}

async function dataUrlForRemoteImage(imageUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://y.qq.com/',
        'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0'
      },
      signal: AbortSignal.timeout(12000)
    })
    if (!response.ok) return undefined
    const data = new Uint8Array(await response.arrayBuffer())
    if (data.length < 256) return undefined
    return dataUrlForImage(data, mimeTypeForImageResponse(response, data))
  } catch {
    return undefined
  }
}

function normalizedSlug(value: string, fallback: string): string {
  const normalized = value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || fallback
}

function idsForMetadata(artist: string, album: string): { artistId: string; albumId: string } {
  const artistSlug = normalizedSlug(artist, 'unknown-artist')
  const albumSlug = normalizedSlug(`${artist}-${album}`, 'unknown-album')
  return {
    artistId: `artist-${artistSlug}`,
    albumId: `album-${albumSlug}`
  }
}

function parseTitleArtistFromFilename(audioPath: string): { title: string; artist: string } {
  const baseName = basename(audioPath, extname(audioPath)).trim()
  const [first, second] = baseName.split(/\s+-\s+/).map((part) => part.trim())
  if (first && second) {
    return { title: first, artist: second }
  }
  return { title: baseName || '未命名单曲', artist: '未知艺人' }
}

function decryptAes128Ecb(key: string, payload: Buffer): Buffer {
  const decipher = createDecipheriv('aes-128-ecb', Buffer.from(key, 'utf8'), null)
  decipher.setAutoPadding(true)
  return Buffer.concat([decipher.update(payload), decipher.final()])
}

function createNcmKeyBox(key: Buffer): Uint8Array {
  const keyBox = new Uint8Array(256)
  for (let index = 0; index < keyBox.length; index += 1) {
    keyBox[index] = index
  }

  let lastByte = 0
  let keyOffset = 0
  for (let index = 0; index < keyBox.length; index += 1) {
    const swap = keyBox[index]
    lastByte = (lastByte + swap + key[keyOffset]) & 0xff
    keyOffset = (keyOffset + 1) % key.length
    keyBox[index] = keyBox[lastByte]
    keyBox[lastByte] = swap
  }

  return keyBox
}

function decryptNcmAudioPayload(payload: Buffer, keyBox: Uint8Array): Buffer {
  const output = Buffer.from(payload)
  for (let index = 0; index < output.length; index += 1) {
    const j = (index + 1) & 0xff
    output[index] ^= keyBox[(keyBox[j] + keyBox[(keyBox[j] + j) & 0xff]) & 0xff]
  }
  return output
}

function safeNcmOutputName(sourcePath: string, metadata: NcmMetadata | null, format: string): string {
  const filenameMetadata = parseTitleArtistFromFilename(sourcePath)
  const title = metadata?.musicName?.trim() || filenameMetadata.title
  const artist = metadata?.artist?.map((entry) => entry[0]).filter(Boolean).join(', ') || filenameMetadata.artist
  const stableId = stableIdForPath(sourcePath).slice(0, 18)
  return `${normalizedSlug(`${artist}-${title}`, 'netease-track')}-${stableId}.${format}`
}

function parseNcmMetadata(rawMetadata: Buffer): NcmMetadata | null {
  try {
    const xored = Buffer.from(rawMetadata.map((byte) => byte ^ 0x63)).toString('utf8')
    const encoded = xored.replace(/^163 key\(Don't modify\):/, '')
    const decrypted = decryptAes128Ecb('#14ljk_!\\]&0U<\'(', Buffer.from(encoded, 'base64')).toString('utf8')
    return JSON.parse(decrypted.replace(/^music:/, '')) as NcmMetadata
  } catch {
    return null
  }
}

function convertNcmToLocalAudio(sourcePath: string): NcmConversionResult {
  const payload = readFileSync(sourcePath)
  if (payload.subarray(0, 8).toString('utf8') !== 'CTENFDAM') {
    throw new Error('Invalid NCM header')
  }

  let offset = 10
  const keyLength = payload.readUInt32LE(offset)
  offset += 4
  const encryptedKey = Buffer.from(payload.subarray(offset, offset + keyLength).map((byte) => byte ^ 0x64))
  offset += keyLength
  const decryptedKey = decryptAes128Ecb('hzHRAmso5kInbaxW', encryptedKey)
  const musicKey = decryptedKey.subarray(17)
  const keyBox = createNcmKeyBox(musicKey)

  const metadataLength = payload.readUInt32LE(offset)
  offset += 4
  const metadata = parseNcmMetadata(payload.subarray(offset, offset + metadataLength))
  offset += metadataLength

  offset += 4
  offset += 5
  const imageLength = payload.readUInt32LE(offset)
  offset += 4
  const imageData = payload.subarray(offset, offset + imageLength)
  offset += imageLength

  const format = (metadata?.format || 'mp3').toLowerCase() === 'flac' ? 'flac' : 'mp3'
  const audioData = decryptNcmAudioPayload(payload.subarray(offset), keyBox)
  const outputDir = join(app.getPath('userData'), 'converted-ncm')
  mkdirSync(outputDir, { recursive: true })
  const audioPath = join(outputDir, safeNcmOutputName(sourcePath, metadata, format))
  writeFileSync(audioPath, audioData)

  return {
    audioPath,
    originalPath: sourcePath,
    format,
    metadata,
    artworkUrl: imageData.length > 0 ? dataUrlForImage(imageData) : undefined
  }
}

function installLocalMediaProtocol(): void {
  protocol.handle('kmgccc-media', (request) => {
    const url = new URL(request.url)
    if (url.hostname !== 'audio') {
      return new Response('Unsupported media host', { status: 404 })
    }

    const encodedPath = decodeURIComponent(url.pathname.replace(/^\//, ''))
    const audioPath = Buffer.from(encodedPath, 'base64url').toString('utf8')

    if (!existsSync(audioPath)) {
      return new Response('Media file not found', { status: 404 })
    }

    const stats = statSync(audioPath)
    const fileSize = stats.size
    const mimeType = mimeTypeForAudioPath(audioPath)
    const rangeHeader = request.headers.get('range')
    if (!rangeHeader) {
      return new Response(Readable.toWeb(createReadStream(audioPath)) as BodyInit, {
        status: 200,
        headers: {
          'Accept-Ranges': 'bytes',
          'Content-Length': String(fileSize),
          'Content-Type': mimeType
        }
      })
    }

    const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/)
    if (!match) {
      return new Response('Invalid range', {
        status: 416,
        headers: {
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes */${fileSize}`
        }
      })
    }

    const requestedStart = match[1] ? Number(match[1]) : 0
    const requestedEnd = match[2] ? Number(match[2]) : fileSize - 1
    const start = Math.max(0, Math.min(requestedStart, fileSize - 1))
    const end = Math.max(start, Math.min(requestedEnd, fileSize - 1))
    const chunkSize = end - start + 1

    return new Response(Readable.toWeb(createReadStream(audioPath, { start, end })) as BodyInit, {
      status: 206,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Type': mimeType
      }
    })
  })
}

async function localAudioImportFromPath(audioPath: string): Promise<LocalAudioImport> {
  const extension = extname(audioPath)
  if (extension.toLowerCase() === '.ncm') {
    const converted = convertNcmToLocalAudio(audioPath)
    const imported = await localAudioImportFromPath(converted.audioPath)
    const convertedTitle = converted.metadata?.musicName?.trim()
    const convertedArtist = converted.metadata?.artist?.map((entry) => entry[0]).filter(Boolean).join(', ')
    const convertedAlbum = converted.metadata?.album?.trim()
    const duration = converted.metadata?.duration ? Math.round(converted.metadata.duration / 1000) : imported.duration
    const ids = idsForMetadata(convertedArtist || imported.artist, convertedAlbum || imported.album)

    return {
      ...imported,
      title: convertedTitle || imported.title,
      artist: convertedArtist || imported.artist,
      artistId: ids.artistId,
      album: convertedAlbum || imported.album,
      albumId: ids.albumId,
      duration,
      neteaseSongId: positiveInteger(converted.metadata?.musicId),
      artworkUrl: converted.artworkUrl || imported.artworkUrl,
      originalSourcePath: converted.originalPath,
      convertedFromNcm: true,
      conversionOutputPath: converted.audioPath,
      conversionFormat: converted.format,
      metadataSource: imported.metadataSource ?? 'ncm'
    }
  }

  const filenameMetadata = parseTitleArtistFromFilename(audioPath)
  const stableId = stableIdForPath(audioPath)
  let title = filenameMetadata.title
  let artist = filenameMetadata.artist
  let album = '未知专辑'
  let duration = 0
  let discNumber: number | undefined
  let trackNumber: number | undefined
  let artworkUrl: string | undefined

  try {
    const { parseFile, selectCover } = await import('music-metadata')
    const metadata = await parseFile(audioPath)
    title = metadata.common.title?.trim() || title
    artist = metadata.common.artist?.trim() || artist
    album = metadata.common.album?.trim() || album
    duration = metadata.format.duration ? Math.round(metadata.format.duration) : 0
    discNumber = positiveInteger(metadata.common.disk.no)
    trackNumber = positiveInteger(metadata.common.track.no)
    const picture = selectCover(metadata.common.picture)
    if (picture) {
      artworkUrl = dataUrlForImage(picture.data, picture.format)
    }
  } catch {
    // Audio tag parsing is best-effort; Chromium playback remains the source of truth for duration.
  }

  const ids = idsForMetadata(artist, album)

  return {
    id: `local-track-${stableId}`,
    title,
    artist,
    artistId: ids.artistId,
    album,
    albumId: ids.albumId,
    duration,
    discNumber,
    trackNumber,
    sourcePath: audioPath,
    sourceUrl: mediaUrlForPath(audioPath),
    artworkUrl
  }
}

function isUnknown(value: string): boolean {
  return /^未知/.test(value.trim())
}

function upgradeArtworkUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined
  return rawUrl.replace(/\/\d+x\d+bb\./, '/1000x1000bb.')
}

function positiveInteger(value: unknown): number | undefined {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue) || numberValue <= 0) return undefined
  return Math.round(numberValue)
}

function upgradeNetEaseArtworkUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined
  const trimmed = rawUrl.trim()
  if (!trimmed) return undefined
  const httpsUrl = trimmed.startsWith('http://') ? `https://${trimmed.slice(7)}` : trimmed
  return httpsUrl.includes('?') ? `${httpsUrl}&param=1200y1200` : `${httpsUrl}?param=1200y1200`
}

function sanitizeQQMusicImageUrl(rawUrl?: string): string | undefined {
  const trimmed = rawUrl?.trim()
  if (!trimmed) return undefined
  return trimmed.startsWith('http://') ? `https://${trimmed.slice(7)}` : trimmed
}

function qqMusicAlbumCoverUrl(albumMid?: string): string | undefined {
  const mid = albumMid?.trim()
  if (!mid) return undefined
  return `https://y.gtimg.cn/music/photo_new/T002R1200x1200M000${mid}.jpg`
}

function qqMusicSingerCoverUrl(singerMid?: string): string | undefined {
  const mid = singerMid?.trim()
  if (!mid) return undefined
  return `https://y.gtimg.cn/music/photo_new/T001R1200x1200M000${mid}.jpg`
}

function normalizeSearchText(value?: string): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[（(].*?[)）]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim()
}

function textSimilarityScore(query: string, candidate?: string): number {
  const normalizedQuery = normalizeSearchText(query)
  const normalizedCandidate = normalizeSearchText(candidate)
  if (!normalizedQuery || !normalizedCandidate) return 0
  if (normalizedQuery === normalizedCandidate) return 1
  if (normalizedCandidate.includes(normalizedQuery) || normalizedQuery.includes(normalizedCandidate)) return 0.62
  return 0
}

function qqMusicSearchId(): string {
  const e = Math.floor(Math.random() * 20) + 1
  const t = e * 18014398509481984
  const n = Math.floor(Math.random() * 4194305) * 4294967296
  const r = Date.now() % (24 * 60 * 60 * 1000)
  return String(Math.round(t + n + r))
}

function qqMusicSearchTypeValue(type: QQMusicSearchType): number {
  if (type === 'singer') return 1
  if (type === 'album') return 2
  return 0
}

function qqMusicSearchResultKey(type: QQMusicSearchType): string {
  if (type === 'singer') return 'singer'
  if (type === 'album') return 'item_album'
  return 'item_song'
}

async function searchQQMusicByType<T>(keyword: string, type: QQMusicSearchType, limit = 8): Promise<T[]> {
  const query = keyword.trim()
  if (!query) return []
  const response = await fetch('https://u.y.qq.com/cgi-bin/musicu.fcg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://y.qq.com/',
      'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0'
    },
    body: JSON.stringify({
      comm: {
        ct: '11',
        cv: 13020508,
        v: 13020508,
        tmeAppID: 'qqmusic',
        uid: '3931641530',
        format: 'json',
        inCharset: 'utf-8',
        outCharset: 'utf-8'
      },
      request: {
        module: 'music.search.SearchCgiService',
        method: 'DoSearchForQQMusicMobile',
        param: {
          searchid: qqMusicSearchId(),
          query,
          search_type: qqMusicSearchTypeValue(type),
          num_per_page: Math.max(1, Math.min(limit, 10)),
          page_num: 1,
          highlight: 0,
          grp: 1
        }
      }
    }),
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return []
  const payload = (await response.json()) as { request?: { data?: { body?: Record<string, unknown> } } }
  const items = payload.request?.data?.body?.[qqMusicSearchResultKey(type)]
  return Array.isArray(items) ? items.filter((item): item is T => Boolean(item) && typeof item === 'object') : []
}

function qqMusicSingersText(item: { singer?: Array<{ name?: string }>; singerName?: string; singer_name?: string; artist?: string; artistName?: string }): string {
  const singers = Array.isArray(item.singer) ? item.singer.map((entry) => entry.name).filter(Boolean).join(', ') : ''
  return singers || item.singerName || item.singer_name || item.artist || item.artistName || ''
}

function qqMusicAlbumMidFromSong(item: QQMusicSongSearchItem): string | undefined {
  return item.album?.mid || item.album?.albumMid || item.album?.albumMID
}

function qqMusicAlbumNameFromSong(item: QQMusicSongSearchItem): string | undefined {
  return item.album?.name || item.album?.title
}

async function fetchQQMusicCoverCandidates(track: LocalAudioImport, kind: 'track' | 'album' | 'artist'): Promise<RawCoverLookupCandidate[]> {
  if (kind === 'artist') {
    const term = isUnknown(track.artist) ? track.title : track.artist
    const items = await searchQQMusicByType<QQMusicSingerSearchItem>(term, 'singer', 8)
    return items.map((item, index) => {
      const singerMid = item.singerMid || item.singerMID || item.mid
      const imageUrl = sanitizeQQMusicImageUrl(item.singerPic || item.pic || item.picURL || item.picUrl || item.image) || qqMusicSingerCoverUrl(singerMid)
      return {
        artworkUrl: imageUrl || '',
        source: 'qqmusic',
        label: item.singerName || item.name || item.title || term,
        matchedArtist: item.singerName || item.name || item.title,
        confidence: Math.max(0.5, 0.86 - index * 0.04)
      }
    }).filter((candidate) => candidate.artworkUrl)
  }

  if (kind === 'album') {
    const query = [track.album, isUnknown(track.artist) ? '' : track.artist].filter(Boolean).join(' ')
    const items = await searchQQMusicByType<QQMusicAlbumSearchItem>(query, 'album', 8)
    return items.map((item, index) => {
      const albumMid = item.albumMid || item.albumMID || item.mid
      const imageUrl = sanitizeQQMusicImageUrl(item.picURL || item.picUrl || item.albumPic || item.image) || qqMusicAlbumCoverUrl(albumMid)
      const albumName = item.albumName || item.albumname || item.name || item.title
      const artistName = qqMusicSingersText(item)
      const score = textSimilarityScore(track.album, albumName) * 0.58 + textSimilarityScore(track.artist, artistName) * 0.32 + (0.86 - index * 0.04) * 0.10
      return {
        artworkUrl: imageUrl || '',
        source: 'qqmusic',
        label: albumName || track.album,
        matchedAlbum: albumName,
        matchedArtist: artistName,
        confidence: score
      }
    }).filter((candidate) => candidate.artworkUrl && (candidate.confidence ?? 0) >= 0.32)
  }

  const query = [track.title, isUnknown(track.artist) ? '' : track.artist, isUnknown(track.album) ? '' : track.album].filter(Boolean).join(' ')
  const items = await searchQQMusicByType<QQMusicSongSearchItem>(query, 'song', 8)
  return items.map((item, index) => {
    const albumMid = qqMusicAlbumMidFromSong(item)
    const imageUrl = qqMusicAlbumCoverUrl(albumMid)
    const title = item.title || item.name
    const artist = qqMusicSingersText(item)
    const album = qqMusicAlbumNameFromSong(item)
    const duration = typeof item.interval === 'number' ? item.interval : undefined
    let score = textSimilarityScore(track.title, title) * 0.46 + textSimilarityScore(track.artist, artist) * 0.28 + textSimilarityScore(track.album, album) * 0.08 + (0.86 - index * 0.04) * 0.04
    if (track.duration > 0 && duration) {
      const delta = Math.abs(track.duration - duration)
      score += delta <= 3 ? 0.14 : delta <= 12 ? 0.08 : delta > 45 ? -0.2 : 0
    }
    return {
      artworkUrl: imageUrl || '',
      source: 'qqmusic',
      label: title || track.title,
      matchedTitle: title,
      matchedArtist: artist,
      matchedAlbum: album,
      confidence: score
    }
  }).filter((candidate) => candidate.artworkUrl && (candidate.confidence ?? 0) >= 0.38)
}

function scoreItunesCandidate(track: LocalAudioImport, candidate: ItunesSearchResult): number {
  const title = track.title.toLowerCase()
  const artist = track.artist.toLowerCase()
  const album = track.album.toLowerCase()
  let score = 0

  if (candidate.trackName?.toLowerCase() === title) score += 5
  else if (candidate.trackName?.toLowerCase().includes(title) || title.includes(candidate.trackName?.toLowerCase() ?? '')) score += 2

  if (!isUnknown(track.artist)) {
    if (candidate.artistName?.toLowerCase() === artist) score += 4
    else if (candidate.artistName?.toLowerCase().includes(artist) || artist.includes(candidate.artistName?.toLowerCase() ?? '')) score += 2
  }

  if (!isUnknown(track.album)) {
    if (candidate.collectionName?.toLowerCase() === album) score += 3
    else if (candidate.collectionName?.toLowerCase().includes(album) || album.includes(candidate.collectionName?.toLowerCase() ?? '')) score += 1
  }

  if (track.duration > 0 && candidate.trackTimeMillis) {
    const delta = Math.abs(track.duration - Math.round(candidate.trackTimeMillis / 1000))
    if (delta <= 3) score += 3
    else if (delta <= 12) score += 1
  }

  return score
}

function scoreMetadataCandidate(track: LocalAudioImport, candidate: Omit<MetadataCandidate, 'score' | 'source'>): number {
  let score = 0
  score += textSimilarityScore(track.title, candidate.title) * 5

  if (!isUnknown(track.artist)) {
    score += textSimilarityScore(track.artist, candidate.artist) * 4
  } else if (candidate.artist) {
    score += 1
  }

  if (!isUnknown(track.album)) {
    score += textSimilarityScore(track.album, candidate.album) * 3
  } else if (candidate.album) {
    score += 1
  }

  if (track.duration > 0 && candidate.duration) {
    const delta = Math.abs(track.duration - candidate.duration)
    if (delta <= 3) score += 3
    else if (delta <= 12) score += 1
    else if (delta > 45) score -= 2
  }

  if (candidate.artworkUrl) score += 1
  return score
}

function hasMetadataConflict(track: LocalAudioImport, candidate: Omit<MetadataCandidate, 'score' | 'source'>): boolean {
  if (textSimilarityScore(track.title, candidate.title) < 0.62) return true
  if (!isUnknown(track.artist) && textSimilarityScore(track.artist, candidate.artist) < 0.50) return true
  if (!isUnknown(track.album) && candidate.album && textSimilarityScore(track.album, candidate.album) < 0.62) return true
  if (track.duration > 0 && candidate.duration && Math.abs(track.duration - candidate.duration) > 45) return true
  return false
}

async function fetchNetEaseSongMetadata(track: LocalAudioImport): Promise<MetadataCandidate | null> {
  const queryParts = [track.title, isUnknown(track.artist) ? '' : track.artist, isUnknown(track.album) ? '' : track.album]
  const term = queryParts.join(' ').trim()
  if (!term) return null

  const url = new URL('https://music.163.com/api/search/get/web')
  url.searchParams.set('type', '1')
  url.searchParams.set('s', term)
  url.searchParams.set('limit', '10')

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0'
    },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return null

  const payload = (await response.json()) as { result?: { songs?: NetEaseSongSearchResult[] } }
  const candidates = payload.result?.songs ?? []
  if (!candidates.length) return null

  return candidates
    .map((song) => {
      const candidate = {
        title: song.name?.trim(),
        artist: song.artists?.map((artist) => artist.name).filter(Boolean).join(', '),
        album: song.album?.name?.trim(),
        duration: song.duration ? Math.round(song.duration / 1000) : undefined,
        artworkUrl: upgradeNetEaseArtworkUrl(song.album?.picUrl),
        neteaseSongId: positiveInteger(song.id)
      }
      return {
        ...candidate,
        source: 'netease',
        score: scoreMetadataCandidate(track, candidate)
      }
    })
    .filter((candidate) => candidate.score >= 6 && !hasMetadataConflict(track, candidate))
    .sort((a, b) => b.score - a.score)[0] ?? null
}

async function fetchNetEaseAlbumArtwork(track: LocalAudioImport): Promise<string | undefined> {
  return (await fetchNetEaseAlbumArtworkCandidates(track))[0]?.artworkUrl
}

async function fetchNetEaseAlbumArtworkCandidates(track: LocalAudioImport): Promise<RawCoverLookupCandidate[]> {
  const queryParts = [isUnknown(track.artist) ? '' : track.artist, isUnknown(track.album) ? '' : track.album]
  const term = queryParts.join(' ').trim()
  if (!term) return []

  const url = new URL('https://music.163.com/api/search/get/web')
  url.searchParams.set('type', '10')
  url.searchParams.set('s', term)
  url.searchParams.set('limit', '5')

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0'
    },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return []

  const payload = (await response.json()) as { result?: { albums?: NetEaseAlbumSearchResult[] } }
  const albums = payload.result?.albums ?? []
  const candidates: RawCoverLookupCandidate[] = []
  for (const album of albums) {
    const artworkUrl = upgradeNetEaseArtworkUrl(album.picUrl)
    const artist = album.artists?.map((item) => item.name).filter(Boolean).join(', ') || album.artist?.name
    const confidence = scoreMetadataCandidate(track, {
      album: album.name,
      artist
    })
    if (artworkUrl && confidence >= 2) {
      candidates.push({
        artworkUrl,
        source: 'netease',
        label: album.name || track.album,
        matchedAlbum: album.name,
        matchedArtist: artist,
        confidence
      })
    }
  }
  return candidates.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
}

async function fetchNetEaseArtistArtworkCandidates(term: string): Promise<RawCoverLookupCandidate[]> {
  const query = term.trim()
  if (!query) return []

  const url = new URL('https://music.163.com/api/search/get/web')
  url.searchParams.set('type', '100')
  url.searchParams.set('s', query)
  url.searchParams.set('limit', '8')
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0' },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return []

  const payload = (await response.json()) as { result?: { artists?: NetEaseArtistSearchResult[] } }
  return (payload.result?.artists ?? [])
    .map((item, index) => ({
      artworkUrl: upgradeNetEaseArtworkUrl(item.picUrl || item.img1v1Url) || '',
      source: 'netease',
      label: item.name,
      matchedArtist: item.name,
      confidence: textSimilarityScore(query, item.name) + Math.max(0, 0.18 - index * 0.02)
    }))
    .filter((candidate) => candidate.artworkUrl && (candidate.confidence ?? 0) >= 0.55)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
}

async function fetchItunesMetadata(track: LocalAudioImport): Promise<ItunesSearchResult | null> {
  const queryParts = [track.title, isUnknown(track.artist) ? '' : track.artist, isUnknown(track.album) ? '' : track.album]
  const term = queryParts.join(' ').trim()
  if (!term) return null

  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', term)
  url.searchParams.set('media', 'music')
  url.searchParams.set('entity', 'song')
  url.searchParams.set('limit', '10')

  const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) return null
  const payload = (await response.json()) as { results?: ItunesSearchResult[] }
  const candidates = payload.results ?? []
  if (!candidates.length) return null
  return candidates
    .map((candidate) => ({ candidate, score: scoreItunesCandidate(track, candidate) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate ?? null
}

async function lookupAlbumMetadata(values: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const title = typeof values.title === 'string' ? values.title.trim() : ''
  const artist = typeof values.artist === 'string' ? values.artist.trim() : ''
  const term = [artist, title].filter(Boolean).join(' ')
  if (!term) return null

  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', term)
  url.searchParams.set('media', 'music')
  url.searchParams.set('entity', 'album')
  url.searchParams.set('limit', '8')

  const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) return null
  const payload = (await response.json()) as { results?: ItunesAlbumSearchResult[] }
  const selected = (payload.results ?? [])
    .map((candidate) => ({
      candidate,
      score: textSimilarityScore(title, candidate.collectionName) * 5 + textSimilarityScore(artist, candidate.artistName) * 4
    }))
    .sort((a, b) => b.score - a.score)[0]
  if (!selected || selected.score < 2.5) return null

  const releaseDate = selected.candidate.releaseDate?.slice(0, 10) || ''
  const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : undefined
  return {
    title: selected.candidate.collectionName,
    artist: selected.candidate.artistName,
    releaseDate,
    releaseYear,
    albumType: selected.candidate.collectionType || '专辑',
    genreTags: selected.candidate.primaryGenreName ? [selected.candidate.primaryGenreName] : [],
    artworkUrl: upgradeArtworkUrl(selected.candidate.artworkUrl100),
    metadataSource: 'itunes',
    metadataFetchedAt: new Date().toISOString(),
    metadataConfidence: Math.min(0.92, Math.max(0.62, selected.score / 9))
  }
}

async function lookupArtistMetadata(values: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const name = typeof values.name === 'string' ? values.name.trim() : ''
  if (!name) return null

  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', name)
  url.searchParams.set('media', 'music')
  url.searchParams.set('entity', 'musicArtist')
  url.searchParams.set('limit', '8')

  const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) return null
  const payload = (await response.json()) as { results?: ItunesArtistSearchResult[] }
  const selected = (payload.results ?? [])
    .map((candidate) => ({ candidate, score: textSimilarityScore(name, candidate.artistName) }))
    .sort((a, b) => b.score - a.score)[0]
  if (!selected || selected.score < 0.55) return null

  return {
    name: selected.candidate.artistName,
    genreTags: selected.candidate.primaryGenreName ? [selected.candidate.primaryGenreName] : [],
    metadataSource: 'itunes',
    metadataFetchedAt: new Date().toISOString(),
    metadataConfidence: Math.min(0.9, Math.max(0.62, selected.score))
  }
}

function uniqueCoverCandidates<T extends CoverLookupCandidate>(candidates: T[]): T[] {
  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    if (!candidate.artworkUrl || seen.has(candidate.artworkUrl)) return false
    seen.add(candidate.artworkUrl)
    return true
  })
}

async function materializeCoverCandidates(candidates: RawCoverLookupCandidate[]): Promise<CoverLookupCandidate[]> {
  const unique = uniqueCoverCandidates(candidates)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, 8)
  const materialized: CoverLookupCandidate[] = []
  for (const candidate of unique) {
    const artworkUrl = candidate.artworkUrl.startsWith('data:')
      ? candidate.artworkUrl
      : await dataUrlForRemoteImage(candidate.artworkUrl)
    if (!artworkUrl) continue
    materialized.push({
      artworkUrl,
      source: candidate.source,
      label: candidate.label
    })
  }
  return uniqueCoverCandidates(materialized)
}

const metadataArtworkSyncCache: MetadataArtworkSyncCache = {
  albumArtworkByKey: new Map(),
  artistArtworkByKey: new Map()
}

function metadataArtworkKey(...values: Array<string | undefined>): string {
  return values
    .map((value) => value?.trim().toLowerCase().replace(/\s+/g, ' ') || '')
    .join('|')
}

async function lookupSyncedAlbumArtwork(track: LocalAudioImport, cache = metadataArtworkSyncCache): Promise<CoverLookupCandidate | null> {
  if (isUnknown(track.album) && isUnknown(track.title)) return null
  const key = metadataArtworkKey(track.artist, track.album || track.title)
  const existing = cache.albumArtworkByKey.get(key)
  if (existing) return existing

  const lookup = (async () => {
    const candidates: RawCoverLookupCandidate[] = []
    const [albumCandidates, songMetadata] = await Promise.allSettled([
      fetchNetEaseAlbumArtworkCandidates(track),
      fetchNetEaseSongMetadata(track)
    ])
    if (albumCandidates.status === 'fulfilled') candidates.push(...albumCandidates.value)
    if (songMetadata.status === 'fulfilled' && songMetadata.value?.artworkUrl) {
      candidates.push({
        artworkUrl: songMetadata.value.artworkUrl,
        source: 'netease',
        label: songMetadata.value.album || songMetadata.value.title || track.album || track.title,
        matchedTitle: songMetadata.value.title,
        matchedArtist: songMetadata.value.artist,
        matchedAlbum: songMetadata.value.album,
        confidence: songMetadata.value.score
      })
    }
    return (await materializeCoverCandidates(candidates))[0] ?? null
  })()
  cache.albumArtworkByKey.set(key, lookup)
  return lookup
}

async function lookupSyncedArtistArtwork(track: LocalAudioImport, cache = metadataArtworkSyncCache): Promise<CoverLookupCandidate | null> {
  if (isUnknown(track.artist)) return null
  const key = metadataArtworkKey(track.artist)
  const existing = cache.artistArtworkByKey.get(key)
  if (existing) return existing

  const lookup = (async () => (await materializeCoverCandidates(await fetchNetEaseArtistArtworkCandidates(track.artist)))[0] ?? null)()
  cache.artistArtworkByKey.set(key, lookup)
  return lookup
}

async function lookupCoverCandidates(values: Record<string, unknown>): Promise<CoverLookupCandidate[]> {
  const kind = typeof values.kind === 'string' ? values.kind : 'track'
  const title = typeof values.title === 'string' ? values.title.trim() : ''
  const artist = typeof values.artist === 'string' ? values.artist.trim() : ''
  const album = typeof values.album === 'string' ? values.album.trim() : ''
  const duration = typeof values.duration === 'number' && Number.isFinite(values.duration) ? values.duration : 0
  const ids = idsForMetadata(artist || '未知艺人', album || '未知专辑')
  const track: LocalAudioImport = {
    id: `cover-${createHash('sha1').update(`${kind}|${title}|${artist}|${album}|${duration}`).digest('hex').slice(0, 12)}`,
    title: title || album || artist || '未知歌曲',
    artist: artist || '未知艺人',
    artistId: ids.artistId,
    album: album || '未知专辑',
    albumId: ids.albumId,
    duration,
    sourcePath: '',
    sourceUrl: ''
  }
  const candidates: RawCoverLookupCandidate[] = []

  if (kind === 'artist') {
    const term = artist || title
    if (!term) return []
    const [qqmusicArtists, neteaseArtists] = await Promise.allSettled([
      fetchQQMusicCoverCandidates(track, 'artist'),
      fetchNetEaseArtistArtworkCandidates(term)
    ])
    if (qqmusicArtists.status === 'fulfilled') candidates.push(...qqmusicArtists.value)
    if (neteaseArtists.status === 'fulfilled') {
      for (const candidate of neteaseArtists.value) {
        candidates.push({ ...candidate, confidence: (candidate.confidence ?? 0) * 0.82 })
      }
    }
    return materializeCoverCandidates(candidates)
  }

  const [qqmusic, neteaseAlbum, neteaseSong] = await Promise.allSettled([
    fetchQQMusicCoverCandidates(track, kind === 'album' ? 'album' : 'track'),
    fetchNetEaseAlbumArtworkCandidates(track),
    kind === 'track' ? fetchNetEaseSongMetadata(track) : Promise.resolve(null)
  ])
  if (qqmusic.status === 'fulfilled') candidates.push(...qqmusic.value)
  if (neteaseAlbum.status === 'fulfilled') candidates.push(...neteaseAlbum.value.map((candidate) => ({ ...candidate, confidence: (candidate.confidence ?? 0) * 0.12 })))
  if (neteaseSong.status === 'fulfilled' && neteaseSong.value?.artworkUrl) {
    candidates.push({
      artworkUrl: neteaseSong.value.artworkUrl,
      source: 'netease',
      label: neteaseSong.value.title || title,
      matchedTitle: neteaseSong.value.title,
      matchedArtist: neteaseSong.value.artist,
      matchedAlbum: neteaseSong.value.album,
      confidence: neteaseSong.value.score * 0.12
    })
  }

  let itunesArtwork: string | undefined
  if (kind === 'album') {
    const itunesAlbum = await lookupAlbumMetadata({ title: album, artist })
    itunesArtwork = typeof itunesAlbum?.artworkUrl === 'string' ? itunesAlbum.artworkUrl : undefined
  } else {
    const itunesTrack = await fetchItunesMetadata(track)
    itunesArtwork = upgradeArtworkUrl(itunesTrack?.artworkUrl100)
  }
  if (itunesArtwork) candidates.push({ artworkUrl: itunesArtwork, source: 'itunes', label: kind === 'album' ? album : title, confidence: 0.25 })

  return materializeCoverCandidates(candidates)
}

function scoreLyricsCandidate(track: LocalAudioImport, candidate: LrcLibResult): number {
  let score = 0
  if (candidate.trackName?.toLowerCase() === track.title.toLowerCase()) score += 4
  if (!isUnknown(track.artist) && candidate.artistName?.toLowerCase().includes(track.artist.toLowerCase())) score += 3
  if (!isUnknown(track.album) && candidate.albumName?.toLowerCase() === track.album.toLowerCase()) score += 2
  if (candidate.syncedLyrics) score += 1
  return score
}

function decodeQQMusicXmlText(value?: string): string {
  if (!value) return ''
  const withSpaces = value.replace(/\+/g, ' ')
  try {
    return decodeURIComponent(withSpaces)
  } catch {
    return withSpaces
  }
}

function xmlEntityDecode(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function parseQQMusicLyricSearchXml(track: LocalAudioImport, xml: string): QQMusicLyricCandidate[] {
  const songMatches = [...xml.matchAll(/<songinfo\b([^>]*)>([\s\S]*?)<\/songinfo>/gi)]
  const candidates: QQMusicLyricCandidate[] = []
  songMatches.forEach((match, index) => {
    const attrs = match[1]
    const body = match[2]
    const songId = attrs.match(/\bid="([^"]+)"/i)?.[1]?.trim()
    if (!songId) return
    const readTag = (tag: string): string => {
      const value = body.match(new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i'))?.[1]
      return decodeQQMusicXmlText(value)
    }
    const title = readTag('name')
    const artist = readTag('singername')
    const album = readTag('albumname')
    let score = textSimilarityScore(track.title, title) * 7
    if (!isUnknown(track.artist)) score += textSimilarityScore(track.artist, artist) * 5
    if (!isUnknown(track.album)) score += textSimilarityScore(track.album, album) * 2
    score += Math.max(0, 0.8 - index * 0.08)
    candidates.push({ songId, title, artist, album, score })
  })
  return candidates
}

async function searchQQMusicLyrics(track: LocalAudioImport): Promise<QQMusicLyricCandidate[]> {
  const url = new URL('https://c.y.qq.com/lyric/fcgi-bin/fcg_search_pc_lrc.fcg')
  url.searchParams.set('SONGNAME', track.title)
  if (!isUnknown(track.artist)) url.searchParams.set('SINGERNAME', track.artist)
  url.searchParams.set('TYPE', '2')
  url.searchParams.set('RANGE_MIN', '1')
  url.searchParams.set('RANGE_MAX', '20')

  const response = await fetch(url, {
    headers: {
      'Referer': 'https://y.qq.com/',
      'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0'
    },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return []
  return parseQQMusicLyricSearchXml(track, await response.text())
    .filter((candidate) => candidate.score >= 6.6 && textSimilarityScore(track.title, candidate.title) >= 0.72)
    .sort((a, b) => b.score - a.score)
}

function qrcXmlContent(xml: string, tag: string): string {
  return xml.match(new RegExp(`<${tag}\\b[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i'))?.[1]?.trim() ?? ''
}

async function downloadQQMusicQrc(songId: string): Promise<{ origHex: string; translationText: string; romanText: string } | null> {
  const url = new URL('https://c.y.qq.com/qqmusic/fcgi-bin/lyric_download.fcg')
  url.searchParams.set('version', '15')
  url.searchParams.set('miniversion', '82')
  url.searchParams.set('lrctype', '4')
  url.searchParams.set('musicid', songId)

  const response = await fetch(url, {
    headers: {
      'Referer': 'https://y.qq.com/',
      'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0'
    },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return null
  const text = (await response.text()).replace(/<!--/g, '').replace(/-->/g, '')
  const origHex = qrcXmlContent(text, 'content')
  if (!origHex) return null
  return {
    origHex,
    translationText: qrcXmlContent(text, 'contentts'),
    romanText: qrcXmlContent(text, 'contentroma')
  }
}

function extractQrcLyricContent(decrypted: string): string {
  const lyricContent = decrypted.match(/<Lyric_1\b[^>]*\bLyricContent="([\s\S]*?)"\/>/i)?.[1]
  return lyricContent ? xmlEntityDecode(lyricContent) : decrypted
}

function amllLyricLinesToInlineLrc(lines: AmllParsedLyricLine[]): string {
  return lines
    .filter((line) => Number.isFinite(line.startTime) && line.words.length)
    .map((line) => {
      const words = line.words
        .filter((word) => word.word)
        .map((word) => `<${formatLyricTimestampFromMs(word.startTime)}>${word.word}`)
        .join('')
      return words ? `[${formatLyricTimestampFromMs(line.startTime)}]${words}` : ''
    })
    .filter(Boolean)
    .join('\n')
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function parseLrcTimestampMs(timestamp: string): number | null {
  const match = timestamp.match(/^(\d+):(\d{2})(?:[.:](\d{1,3}))?$/)
  if (!match) return null
  const minutes = Number(match[1])
  const seconds = Number(match[2])
  const fraction = match[3] ? Number(match[3].padEnd(3, '0').slice(0, 3)) : 0
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || !Number.isFinite(fraction)) return null
  return minutes * 60000 + seconds * 1000 + fraction
}

function parseTranslationLrc(translationText: string): Array<{ timeMs: number; text: string }> {
  return translationText
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\[([0-9]+:[0-9]{2}(?:[.:][0-9]{1,3})?)\](.*)$/)
      if (!match) return null
      const timeMs = parseLrcTimestampMs(match[1])
      const text = match[2]?.trim()
      if (timeMs === null || !text || text === '//') return null
      return { timeMs, text }
    })
    .filter((entry): entry is { timeMs: number; text: string } => entry !== null)
}

function translationForQrcLine(lineStartMs: number, translations: Array<{ timeMs: number; text: string }>): string {
  let selected = ''
  let selectedDistance = Number.POSITIVE_INFINITY
  for (const translation of translations) {
    const distance = Math.abs(translation.timeMs - lineStartMs)
    if (distance <= 650 && distance < selectedDistance) {
      selected = translation.text
      selectedDistance = distance
    }
  }
  return selected
}

type ParsedLrcLineForTtml = {
  startMs: number
  endMs?: number
  text: string
  words: Array<{ startMs: number; endMs: number; text: string }>
}

function parseLddcLrcForTtml(lyrics: string): ParsedLrcLineForTtml[] {
  const lines: ParsedLrcLineForTtml[] = []
  for (const rawLine of lyrics.split(/\r?\n/)) {
    const timestampMatches = [...rawLine.matchAll(/\[([0-9]+:[0-9]{2}(?:[.:][0-9]{1,3})?)\]/g)]
    if (!timestampMatches.length) continue
    const lineBody = rawLine.replace(/\[[^\]]+\]/g, '').trim()
    if (!lineBody || lineBody === '//') continue
    const trimmedLine = rawLine.trim()
    const firstMatch = timestampMatches[0]
    const lastMatch = timestampMatches[timestampMatches.length - 1]
    const hasLeadingTimestamp = firstMatch.index === 0
    const hasTrailingEndTimestamp = timestampMatches.length > 1 && lastMatch.index !== undefined && lastMatch.index + lastMatch[0].length === trimmedLine.length
    const lineEndMs = hasTrailingEndTimestamp ? parseLrcTimestampMs(lastMatch[1]) ?? undefined : undefined
    const effectiveTimestampMatches = hasLeadingTimestamp
      ? [firstMatch]
      : timestampMatches.filter((match) => !(hasTrailingEndTimestamp && match === lastMatch))

    for (const match of effectiveTimestampMatches) {
      const startMs = parseLrcTimestampMs(match[1])
      if (startMs === null) continue
      const timedWords = [...lineBody.matchAll(/<([0-9]+:[0-9]{2}(?:[.:][0-9]{1,3})?)>([^<]*)/g)]
        .map((wordMatch) => {
          const wordStartMs = parseLrcTimestampMs(wordMatch[1])
          const text = wordMatch[2] ?? ''
          if (wordStartMs === null || !text) return null
          return { startMs: wordStartMs, text }
        })
        .filter((word): word is { startMs: number; text: string } => word !== null)

      const cleanText = lineBody.replace(/<[^>]+>/g, '').trim()
      const words = timedWords.map((word, index) => ({
        startMs: word.startMs,
        endMs: Math.max(word.startMs + 80, timedWords[index + 1]?.startMs ?? word.startMs + 520),
        text: word.text
      }))
      lines.push({ startMs, endMs: lineEndMs && lineEndMs > startMs ? lineEndMs : undefined, text: cleanText || lineBody, words })
    }
  }

  const sorted = lines.sort((a, b) => a.startMs - b.startMs)
  return sorted.map((line, index) => {
    const nextStartMs = sorted[index + 1]?.startMs
    const fallbackEndMs = Math.max(line.startMs + 1200, (nextStartMs ?? line.startMs + 4200) - 80)
    const endMs = line.endMs ?? fallbackEndMs
    return {
      ...line,
      words: line.words.map((word, wordIndex) => ({
        ...word,
        endMs: Math.min(Math.max(word.endMs, word.startMs + 80), line.words[wordIndex + 1]?.startMs ?? endMs)
      }))
    }
  })
}

function lrcLyricsToTtml(origLyrics: string, transLyrics?: string): string {
  const lines = parseLddcLrcForTtml(origLyrics)
  const translations = transLyrics ? parseTranslationLrc(transLyrics) : []
  const bodyBegin = lines[0]?.startMs ?? 0
  const lastLine = lines[lines.length - 1]
  const bodyEnd = Math.max(bodyBegin + 1000, lastLine?.endMs ?? (lastLine ? lastLine.startMs + 4200 : 0))
  const paragraphs = lines.map((line, index) => {
    const nextStartMs = lines[index + 1]?.startMs
    const endMs = Math.max(line.startMs + 800, line.endMs ?? ((nextStartMs ?? line.startMs + 4200) - 80))
    const spans = line.words.length
      ? line.words.map((word) => `<span begin="${formatLyricTimestampFromMs(word.startMs)}" end="${formatLyricTimestampFromMs(Math.min(word.endMs, endMs))}">${escapeXml(word.text)}</span>`).join('')
      : `<span begin="${formatLyricTimestampFromMs(line.startMs)}" end="${formatLyricTimestampFromMs(endMs)}">${escapeXml(line.text)}</span>`
    const lineTranslation = translations.length ? translationForQrcLine(line.startMs, translations) : ''
    const translationSpan = lineTranslation ? `<span ttm:role="x-translation" xml:lang="zh-CN">${escapeXml(lineTranslation)}</span>` : ''
    return `<p begin="${formatLyricTimestampFromMs(line.startMs)}" end="${formatLyricTimestampFromMs(endMs)}" ttm:agent="v1" itunes:key="L${index + 1}">${spans}${translationSpan}</p>`
  }).join('')

  return `<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:amll="http://www.example.com/ns/amll" xmlns:itunes="http://music.apple.com/lyric-ttml-internal"><head><metadata><ttm:agent type="person" xml:id="v1" /></metadata></head><body dur="${formatLyricTimestampFromMs(bodyEnd)}"><div begin="${formatLyricTimestampFromMs(bodyBegin)}" end="${formatLyricTimestampFromMs(bodyEnd)}">${paragraphs}</div></body></tt>`
}

function amllLyricLinesToTtml(lines: AmllParsedLyricLine[], translationText: string): string {
  const translations = parseTranslationLrc(translationText)
  const timedLines = lines.filter((line) => Number.isFinite(line.startTime) && Number.isFinite(line.endTime) && line.words.length)
  const bodyBegin = timedLines[0]?.startTime ?? 0
  const bodyEnd = timedLines[timedLines.length - 1]?.endTime ?? Math.max(bodyBegin + 1000, 0)
  const paragraphs = timedLines.map((line, index) => {
    const lineTranslation = translationForQrcLine(line.startTime, translations)
    const spans = line.words
      .filter((word) => word.word)
      .map((word) => `<span begin="${formatLyricTimestampFromMs(word.startTime)}" end="${formatLyricTimestampFromMs(word.endTime)}">${escapeXml(word.word)}</span>`)
      .join('')
    const translationSpan = lineTranslation ? `<span ttm:role="x-translation" xml:lang="zh-CN">${escapeXml(lineTranslation)}</span>` : ''
    return `<p begin="${formatLyricTimestampFromMs(line.startTime)}" end="${formatLyricTimestampFromMs(line.endTime)}" ttm:agent="v1" itunes:key="L${index + 1}">${spans}${translationSpan}</p>`
  }).join('')

  return `<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:amll="http://www.example.com/ns/amll" xmlns:itunes="http://music.apple.com/lyric-ttml-internal"><head><metadata><ttm:agent type="person" xml:id="v1" /></metadata></head><body dur="${formatLyricTimestampFromMs(bodyEnd)}"><div begin="${formatLyricTimestampFromMs(bodyBegin)}" end="${formatLyricTimestampFromMs(bodyEnd)}">${paragraphs}</div></body></tt>`
}

async function fetchQQMusicLyrics(track: LocalAudioImport): Promise<LyricsLookupResult | null> {
  const candidates = track.qqMusicSongId
    ? [{ songId: track.qqMusicSongId, title: track.title, artist: track.artist, album: track.album, score: 100 }]
    : await searchQQMusicLyrics(track)

  for (const candidate of candidates.slice(0, 5)) {
    try {
      const payload = await downloadQQMusicQrc(candidate.songId)
      if (!payload?.origHex) continue
      const qrcLyrics = extractQrcLyricContent(decryptQrcHex(payload.origHex))
      const lines = parseQrc(qrcLyrics)
      const syncedLyrics = payload.translationText
        ? amllLyricLinesToTtml(lines, payload.translationText)
        : amllLyricLinesToInlineLrc(lines)
      if (!syncedLyrics.trim() || !lines.some((line) => line.words.length > 1)) continue
      return {
        syncedLyrics,
        qqMusicSongId: candidate.songId
      }
    } catch {
      continue
    }
  }
  return null
}

function amllTtmlUrlsForNetEaseSong(songId: number): string[] {
  return [
    `https://amll-ttml-db.stevexmh.net/ncm/${songId}`,
    `https://raw.githubusercontent.com/amll-dev/amll-ttml-db/main/ncm-lyrics/${songId}.ttml`,
    `https://amlldb.bikonoo.com/ncm-lyrics/${songId}.ttml`,
    `https://amll.mirror.dimeta.top/api/db/ncm-lyrics/${songId}.ttml`
  ]
}

function looksLikeTtmlLyrics(text: string): boolean {
  return text.length > 120 && /<tt[\s>]/i.test(text) && /<p[\s>]/i.test(text) && /<span[\s>]/i.test(text)
}

async function fetchAmllTtmlLyrics(track: LocalAudioImport): Promise<LyricsLookupResult | null> {
  const metadata = track.neteaseSongId ? null : await fetchNetEaseSongMetadata(track).catch(() => null)
  const neteaseSongId = positiveInteger(track.neteaseSongId ?? metadata?.neteaseSongId)
  if (!neteaseSongId) return null

  for (const url of amllTtmlUrlsForNetEaseSong(neteaseSongId)) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/xml,text/xml,text/plain,*/*',
          'User-Agent': 'kmgccc-player-electron/0.1.0'
        },
        signal: AbortSignal.timeout(12000)
      })
      if (!response.ok) continue
      const text = await response.text()
      if (looksLikeTtmlLyrics(text)) {
        return {
          syncedLyrics: text,
          neteaseSongId
        }
      }
    } catch {
      continue
    }
  }

  return null
}

function amllSearchAlbumName(result: AmllDbSearchResult): string | undefined {
  if (Array.isArray(result.albums)) return result.albums.filter(Boolean).join(' / ')
  if (Array.isArray(result.album)) return result.album.filter(Boolean).join(' / ')
  return result.album
}

function scoreAmllDbLyricsCandidate(track: LocalAudioImport, result: AmllDbSearchResult): number {
  const titleValues = [result.title, ...(result.titles ?? [])].filter((value): value is string => Boolean(value?.trim()))
  const artistValues = [result.artist, ...(result.artists ?? [])].filter((value): value is string => Boolean(value?.trim()))
  const album = amllSearchAlbumName(result)
  let score = 0

  if (titleValues.length) score += Math.max(...titleValues.map((title) => textSimilarityScore(track.title, title))) * 7
  if (!isUnknown(track.artist) && artistValues.length) {
    score += Math.max(...artistValues.map((artist) => textSimilarityScore(track.artist, artist))) * 5
  }
  if (!isUnknown(track.album) && album) score += textSimilarityScore(track.album, album) * 2
  if (track.neteaseSongId && result.ncmIds?.some((id) => positiveInteger(id) === track.neteaseSongId)) score += 6
  if (result.score && result.score > 0) score += Math.min(1.5, result.score / 1000)
  return score
}

function isStrongAmllLyricsMatch(track: LocalAudioImport, result: AmllDbSearchResult, score: number): boolean {
  if (track.neteaseSongId && result.ncmIds?.some((id) => positiveInteger(id) === track.neteaseSongId)) return true
  if (score < 6.2) return false
  const titleValues = [result.title, ...(result.titles ?? [])].filter((value): value is string => Boolean(value?.trim()))
  if (titleValues.length && Math.max(...titleValues.map((title) => textSimilarityScore(track.title, title))) < 0.72) return false
  const artistValues = [result.artist, ...(result.artists ?? [])].filter((value): value is string => Boolean(value?.trim()))
  if (!isUnknown(track.artist) && artistValues.length && Math.max(...artistValues.map((artist) => textSimilarityScore(track.artist, artist))) < 0.45) return false
  return true
}

async function searchAmllDbLyrics(track: LocalAudioImport, query: string, type: 'all' | 'title' | 'artist' | 'album' | 'id' | 'lyric'): Promise<AmllDbSearchResult[]> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []
  const response = await fetch('https://amlldb.bikonoo.com/api/search-lyrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'kmgccc-player-electron/0.1.0'
    },
    body: JSON.stringify({ query: trimmedQuery, type }),
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return []
  const payload = (await response.json()) as unknown
  if (!Array.isArray(payload)) return []
  return payload
    .filter((item): item is AmllDbSearchResult => Boolean(item && typeof item === 'object'))
    .filter((item) => Boolean((item.file || item.id)?.trim()))
    .map((item) => ({
      ...item,
      score: scoreAmllDbLyricsCandidate(track, item)
    }))
}

async function fetchAmllDbSearchLyrics(track: LocalAudioImport): Promise<LyricsLookupResult | null> {
  const queries: Array<{ query: string; type: 'all' | 'title' | 'artist' | 'album' | 'id' | 'lyric' }> = []
  if (track.neteaseSongId) queries.push({ query: String(track.neteaseSongId), type: 'id' })
  queries.push({ query: track.title, type: 'title' })
  const artistTitle = [track.title, isUnknown(track.artist) ? '' : track.artist].filter(Boolean).join(' ')
  if (artistTitle && artistTitle !== track.title) queries.push({ query: artistTitle, type: 'all' })

  const deduped = new Map<string, AmllDbSearchResult>()
  for (const entry of queries) {
    const results = await searchAmllDbLyrics(track, entry.query, entry.type).catch(() => [])
    for (const result of results) {
      const file = result.file || result.id
      if (!file) continue
      const current = deduped.get(file)
      if (!current || (result.score ?? 0) > (current.score ?? 0)) deduped.set(file, result)
    }
  }

  const selected = [...deduped.values()]
    .filter((result) => isStrongAmllLyricsMatch(track, result, result.score ?? 0))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
  const file = selected?.file || selected?.id
  if (!file) return null

  const response = await fetch(`https://amlldb.bikonoo.com/raw-lyrics/${encodeURIComponent(file)}`, {
    headers: {
      'Accept': 'application/xml,text/xml,text/plain,*/*',
      'User-Agent': 'kmgccc-player-electron/0.1.0'
    },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return null
  const text = await response.text()
  if (!looksLikeTtmlLyrics(text)) return null
  return {
    syncedLyrics: text,
    neteaseSongId: track.neteaseSongId ?? selected.ncmIds?.map(positiveInteger).find((id): id is number => Boolean(id))
  }
}

function lddcServerUrls(): string[] {
  const configured = process.env.LDDC_SERVER_URL?.trim()
  const urls = new Set<string>()
  if (configured) urls.add(configured.replace(/\/+$/, ''))
  urls.add('http://127.0.0.1:8765')
  for (let port = 9000; port <= 9015; port += 1) urls.add(`http://127.0.0.1:${port}`)
  return [...urls]
}

async function postLddcJson<T>(baseUrl: string, endpoint: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'kmgccc-player-electron/0.1.0'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4500)
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function lddcSourcesForPlatform(platform: LyricsLookupPlatform): LddcSource[] {
  if (platform === 'qq') return ['QM']
  if (platform === 'kugou') return ['KG']
  if (platform === 'netease') return ['NE']
  return ['QM', 'KG', 'NE']
}

function scoreLddcCandidate(track: LocalAudioImport, candidate: LddcCandidate): number {
  let score = Math.max(0, Math.min(100, Number(candidate.score) || 0))
  if (candidate.title) score += textSimilarityScore(track.title, candidate.title) * 18
  if (!isUnknown(track.artist) && candidate.artist) score += textSimilarityScore(track.artist, candidate.artist) * 12
  if (!isUnknown(track.album) && candidate.album) score += textSimilarityScore(track.album, candidate.album) * 5
  if (track.duration > 0 && candidate.duration_ms) {
    const diff = Math.abs(candidate.duration_ms / 1000 - track.duration)
    if (diff <= 3) score += 6
    else if (diff <= 10) score += 2
  }
  return score
}

async function fetchLddcLyrics(track: LocalAudioImport, sources: LddcSource[] = ['QM', 'KG', 'NE']): Promise<LyricsLookupResult | null> {
  for (const baseUrl of lddcServerUrls()) {
    const search = await postLddcJson<LddcSearchResponse>(baseUrl, 'search', {
      title: track.title,
      artist: isUnknown(track.artist) ? undefined : track.artist,
      sources,
      limit_per_source: 5,
      mode: 'verbatim',
      translation: 'provider'
    })
    const candidates = (search?.results ?? [])
      .filter((candidate) => candidate.id && sources.includes(candidate.source as LddcSource))
      .map((candidate) => ({ candidate, score: scoreLddcCandidate(track, candidate) }))
      .sort((a, b) => b.score - a.score)

    for (const { candidate, score } of candidates.slice(0, 6)) {
      if (score < 62) continue
      const fetched = await postLddcJson<LddcFetchSeparateResponse>(baseUrl, 'fetch_by_id_separate', {
        source: candidate.source,
        id: candidate.id,
        mode: 'verbatim',
        translation: 'provider',
        offset_ms: 0,
        title: candidate.title,
        artist: candidate.artist,
        album: candidate.album,
        duration_ms: candidate.duration_ms,
        extra: candidate.extra
      })
      const orig = fetched?.lrc_orig?.trim()
      if (!orig || fetched?.error) continue
      const syncedLyrics = lrcLyricsToTtml(orig, fetched?.lrc_trans)
      if (!looksLikeTtmlLyrics(syncedLyrics)) continue
      return {
        syncedLyrics,
        neteaseSongId: track.neteaseSongId,
        qqMusicSongId: track.qqMusicSongId
      }
    }
  }
  return null
}

function formatLyricTimestampFromMs(milliseconds: number): string {
  const safeMs = Math.max(0, Math.round(milliseconds))
  const minutes = Math.floor(safeMs / 60000)
  const seconds = Math.floor((safeMs % 60000) / 1000)
  const ms = safeMs % 1000
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

function netEaseLyricCreditLineToLrc(line: string): string {
  const credit = [...line.matchAll(/"tx"\s*:\s*"([^"]*)"/g)].map((match) => match[1]).join('')
  if (!credit.trim()) return ''
  const time = Number(line.match(/"t"\s*:\s*(\d+)/)?.[1] ?? 0)
  return `[${formatLyricTimestampFromMs(time)}]${credit}`
}

function normalizeNetEaseLrc(lyrics: string): string {
  return lyrics
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed.startsWith('{')) return line
      return netEaseLyricCreditLineToLrc(trimmed)
    })
    .filter((line) => line.trim())
    .join('\n')
}

function netEaseYrcToInlineLrc(yrcLyrics: string): string {
  return yrcLyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const lyricMatch = line.match(/^\[(\d+),(\d+)\](.*)$/)
      if (!lyricMatch) {
        return netEaseLyricCreditLineToLrc(line)
      }
      const lineStartMs = Number(lyricMatch[1])
      const words = [...lyricMatch[3].matchAll(/\((\d+),(\d+),\d+\)([^()]*)/g)]
        .map((match) => {
          const wordStartMs = Number(match[1])
          const word = match[3]
          if (!word) return ''
          return `<${formatLyricTimestampFromMs(wordStartMs)}>${word}`
        })
        .join('')
      return words ? `[${formatLyricTimestampFromMs(lineStartMs)}]${words}` : ''
    })
    .filter(Boolean)
    .join('\n')
}

async function fetchNetEaseLyrics(track: LocalAudioImport): Promise<LyricsLookupResult | null> {
  const metadata = track.neteaseSongId ? null : await fetchNetEaseSongMetadata(track).catch(() => null)
  const neteaseSongId = positiveInteger(track.neteaseSongId ?? metadata?.neteaseSongId)
  if (!neteaseSongId) return null

  const url = new URL('https://music.163.com/api/song/lyric/v1')
  url.searchParams.set('id', String(neteaseSongId))
  url.searchParams.set('lv', '1')
  url.searchParams.set('kv', '1')
  url.searchParams.set('tv', '-1')
  url.searchParams.set('yv', '1')
  url.searchParams.set('ytv', '1')

  const response = await fetch(url, {
    headers: {
      'Referer': 'https://music.163.com/',
      'User-Agent': 'Mozilla/5.0 kmgccc-player-electron/0.1.0'
    },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return null
  const payload = (await response.json()) as NetEaseLyricPayload
  if (payload.yrc?.lyric?.trim()) {
    const syncedLyrics = netEaseYrcToInlineLrc(payload.yrc.lyric)
    if (syncedLyrics.trim()) {
      return {
        lyricsText: payload.lrc?.lyric ? normalizeNetEaseLrc(payload.lrc.lyric) : payload.tlyric?.lyric || undefined,
        syncedLyrics,
        neteaseSongId
      }
    }
  }
  const lrcLyrics = payload.lrc?.lyric?.trim()
  if (lrcLyrics) {
    return {
      lyricsText: payload.tlyric?.lyric || undefined,
      syncedLyrics: normalizeNetEaseLrc(lrcLyrics),
      neteaseSongId
    }
  }
  return null
}

function localLyricsCacheKey(value?: string): string {
  return (value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function fetchLocalCachedLyrics(track: LocalAudioImport): LyricsLookupResult | null {
  const titleKey = localLyricsCacheKey(track.title)
  if (!titleKey) return null
  const artistKey = localLyricsCacheKey(track.artist)
  const albumKey = localLyricsCacheKey(track.album)
  const tracks = loadPersistedLibrary().tracks
  const scored = tracks
    .filter((candidate) => candidate.syncedLyrics?.trim() || candidate.lyricsText?.trim())
    .map((candidate) => {
      let score = 0
      if (localLyricsCacheKey(candidate.title) === titleKey) score += 8
      if (artistKey && !isUnknown(track.artist) && localLyricsCacheKey(candidate.artist) === artistKey) score += 4
      if (albumKey && !isUnknown(track.album) && localLyricsCacheKey(candidate.album) === albumKey) score += 2
      if (track.duration > 0 && candidate.duration > 0 && Math.abs(track.duration - candidate.duration) <= 3) score += 2
      return { candidate, score }
    })
    .filter(({ score }) => score >= 8)
    .sort((a, b) => b.score - a.score)
  const cached = scored[0]?.candidate
  if (!cached) return null
  return {
    lyricsText: cached.lyricsText,
    syncedLyrics: cached.syncedLyrics || cached.lyricsText,
    neteaseSongId: cached.neteaseSongId,
    qqMusicSongId: cached.qqMusicSongId
  }
}

async function fetchLyrics(track: LocalAudioImport): Promise<LyricsLookupResult | null> {
  const netEaseLyrics = await fetchNetEaseLyrics(track).catch(() => null)
  if (netEaseLyrics) return netEaseLyrics

  const qqMusicLyrics = await fetchQQMusicLyrics(track).catch(() => null)
  if (qqMusicLyrics) return qqMusicLyrics

  const localCachedLyrics = fetchLocalCachedLyrics(track)
  if (localCachedLyrics) return localCachedLyrics

  const amllLyrics = await fetchAmllTtmlLyrics(track).catch(() => null)
  if (amllLyrics) return amllLyrics

  const amllSearchLyrics = await fetchAmllDbSearchLyrics(track).catch(() => null)
  if (amllSearchLyrics) return amllSearchLyrics

  const lddcLyrics = await fetchLddcLyrics(track).catch(() => null)
  if (lddcLyrics) return lddcLyrics

  const url = new URL('https://lrclib.net/api/search')
  url.searchParams.set('track_name', track.title)
  if (!isUnknown(track.artist)) url.searchParams.set('artist_name', track.artist)
  if (!isUnknown(track.album)) url.searchParams.set('album_name', track.album)

  const response = await fetch(url, {
    headers: { 'User-Agent': 'kmgccc-player-electron/0.1.0' },
    signal: AbortSignal.timeout(12000)
  })
  if (!response.ok) return null
  const candidates = (await response.json()) as LrcLibResult[]
  const selected = candidates
    .filter((candidate) => candidate.plainLyrics || candidate.syncedLyrics)
    .map((candidate) => ({ candidate, score: scoreLyricsCandidate(track, candidate) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate

  if (!selected) return null
  return {
    lyricsText: selected.plainLyrics ?? undefined,
    syncedLyrics: selected.syncedLyrics ?? undefined,
    neteaseSongId: track.neteaseSongId,
    qqMusicSongId: track.qqMusicSongId
  }
}

async function fetchLyricsForPlatform(track: LocalAudioImport, platform: LyricsLookupPlatform): Promise<LyricsLookupResult | null> {
  if (platform === 'auto') return fetchLyrics(track)
  if (platform === 'amll') {
    return (await fetchAmllTtmlLyrics(track).catch(() => null)) ?? (await fetchAmllDbSearchLyrics(track).catch(() => null))
  }
  if (platform === 'qq') {
    const qqMusicLyrics = await fetchQQMusicLyrics(track).catch(() => null)
    if (!qqMusicLyrics) {
      return fetchLddcLyrics(track, lddcSourcesForPlatform(platform)).catch(() => null)
    }
    const netEaseLyrics = await fetchNetEaseLyrics(track).catch(() => null)
    return { ...netEaseLyrics, ...qqMusicLyrics }
  }
  if (platform === 'netease') {
    return (
      (await fetchAmllTtmlLyrics(track).catch(() => null)) ??
      (await fetchAmllDbSearchLyrics(track).catch(() => null)) ??
      (await fetchNetEaseLyrics(track).catch(() => null)) ??
      (await fetchLddcLyrics(track, lddcSourcesForPlatform(platform)).catch(() => null))
    )
  }
  if (platform === 'kugou') {
    return fetchLddcLyrics(track, lddcSourcesForPlatform(platform)).catch(() => null)
  }
  return null
}

async function syncTrackInfo(track: LocalAudioImport, artworkCache = metadataArtworkSyncCache): Promise<TrackMetadataSyncResult> {
  let syncedTrack = { ...track }
  const statuses: TrackMetadataSyncResult['statuses'] = {
    track: track.convertedFromNcm ? 'completed' : 'noResults',
    artist: 'noResults',
    lyrics: 'noResults',
    album: track.convertedFromNcm ? 'completed' : 'noResults'
  }
  const preserveNcmIdentity = track.convertedFromNcm && track.metadataSource === 'ncm'

  try {
    const metadata = await fetchNetEaseSongMetadata(syncedTrack)
    if (metadata) {
      syncedTrack = preserveNcmIdentity
        ? {
          ...syncedTrack,
          duration: syncedTrack.duration || metadata.duration || syncedTrack.duration,
          artworkUrl: syncedTrack.artworkUrl || metadata.artworkUrl,
          neteaseSongId: syncedTrack.neteaseSongId ?? metadata.neteaseSongId
        }
        : {
          ...syncedTrack,
          title: metadata.title?.trim() || syncedTrack.title,
          artist: metadata.artist?.trim() || syncedTrack.artist,
          album: metadata.album?.trim() || syncedTrack.album,
          duration: metadata.duration || syncedTrack.duration,
          artworkUrl: metadata.artworkUrl || syncedTrack.artworkUrl,
          neteaseSongId: metadata.neteaseSongId ?? syncedTrack.neteaseSongId,
          metadataSource: metadata.source
        }
      const ids = idsForMetadata(syncedTrack.artist, syncedTrack.album)
      syncedTrack.artistId = ids.artistId
      syncedTrack.albumId = ids.albumId
      statuses.track = 'completed'
      statuses.artist = syncedTrack.artist ? 'completed' : 'noResults'
      statuses.album = syncedTrack.artworkUrl ? 'completed' : 'noResults'
    } else if (!syncedTrack.artworkUrl) {
      const artworkUrl = await fetchNetEaseAlbumArtwork(syncedTrack)
      if (artworkUrl) {
        syncedTrack = {
          ...syncedTrack,
          artworkUrl,
          metadataSource: preserveNcmIdentity ? syncedTrack.metadataSource : 'netease'
        }
        statuses.album = 'completed'
      }
    }
  } catch {
    statuses.track = statuses.track === 'completed' ? statuses.track : 'failed'
    statuses.artist = statuses.artist === 'completed' ? statuses.artist : 'failed'
    statuses.album = statuses.album === 'completed' ? statuses.album : 'failed'
  }

  try {
    const metadata = statuses.track === 'completed' ? null : await fetchItunesMetadata(syncedTrack)
    if (metadata) {
      syncedTrack = preserveNcmIdentity
        ? {
          ...syncedTrack,
          duration: syncedTrack.duration || (metadata.trackTimeMillis ? Math.round(metadata.trackTimeMillis / 1000) : syncedTrack.duration),
          artworkUrl: syncedTrack.artworkUrl || upgradeArtworkUrl(metadata.artworkUrl100)
        }
        : {
          ...syncedTrack,
          title: metadata.trackName?.trim() || syncedTrack.title,
          artist: metadata.artistName?.trim() || syncedTrack.artist,
          album: metadata.collectionName?.trim() || syncedTrack.album,
          duration: metadata.trackTimeMillis ? Math.round(metadata.trackTimeMillis / 1000) : syncedTrack.duration,
          artworkUrl: upgradeArtworkUrl(metadata.artworkUrl100) || syncedTrack.artworkUrl,
          metadataSource: 'itunes'
        }
      const ids = idsForMetadata(syncedTrack.artist, syncedTrack.album)
      syncedTrack.artistId = ids.artistId
      syncedTrack.albumId = ids.albumId
      statuses.track = 'completed'
      statuses.artist = syncedTrack.artist ? 'completed' : 'noResults'
      statuses.album = syncedTrack.artworkUrl ? 'completed' : 'noResults'
    }
  } catch {
    statuses.track = 'failed'
    statuses.artist = 'failed'
    statuses.album = 'failed'
  }

  try {
    const artistMetadata = await lookupArtistMetadata({ name: syncedTrack.artist })
    if (artistMetadata) {
      syncedTrack = {
        ...syncedTrack,
        artist: typeof artistMetadata.name === 'string' && artistMetadata.name.trim() ? artistMetadata.name.trim() : syncedTrack.artist,
        artistGenreTags: Array.isArray(artistMetadata.genreTags) ? artistMetadata.genreTags.filter((tag): tag is string => typeof tag === 'string') : syncedTrack.artistGenreTags,
        artistMetadataSource: typeof artistMetadata.metadataSource === 'string' ? artistMetadata.metadataSource : syncedTrack.artistMetadataSource,
        artistMetadataFetchedAt: typeof artistMetadata.metadataFetchedAt === 'string' ? artistMetadata.metadataFetchedAt : syncedTrack.artistMetadataFetchedAt,
        artistMetadataConfidence: typeof artistMetadata.metadataConfidence === 'number' ? artistMetadata.metadataConfidence : syncedTrack.artistMetadataConfidence
      }
      const ids = idsForMetadata(syncedTrack.artist, syncedTrack.album)
      syncedTrack.artistId = ids.artistId
      syncedTrack.albumId = ids.albumId
      statuses.artist = 'completed'
    } else if (statuses.artist !== 'completed') {
      statuses.artist = 'noResults'
    }
  } catch {
    statuses.artist = statuses.artist === 'completed' ? statuses.artist : 'failed'
  }

  try {
    if (!syncedTrack.albumArtworkUrl && !syncedTrack.artworkUrl) {
      const albumArtwork = await lookupSyncedAlbumArtwork(syncedTrack, artworkCache)
      if (albumArtwork) {
        syncedTrack = {
          ...syncedTrack,
          artworkUrl: albumArtwork.artworkUrl,
          albumArtworkUrl: albumArtwork.artworkUrl,
          albumMetadataSource: albumArtwork.source,
          albumMetadataFetchedAt: new Date().toISOString(),
          albumMetadataConfidence: syncedTrack.albumMetadataConfidence ?? 0.78
        }
        statuses.album = 'completed'
      } else if (statuses.album !== 'completed') {
        statuses.album = 'noResults'
      }
    } else if (syncedTrack.artworkUrl && !syncedTrack.albumArtworkUrl) {
      syncedTrack = {
        ...syncedTrack,
        albumArtworkUrl: syncedTrack.artworkUrl
      }
      statuses.album = 'completed'
    }
  } catch {
    statuses.album = statuses.album === 'completed' ? statuses.album : 'failed'
  }

  try {
    if (!syncedTrack.artistArtworkUrl) {
      const artistArtwork = await lookupSyncedArtistArtwork(syncedTrack, artworkCache)
      if (artistArtwork) {
        syncedTrack = {
          ...syncedTrack,
          artistArtworkUrl: artistArtwork.artworkUrl,
          artistMetadataSource: artistArtwork.source,
          artistMetadataFetchedAt: new Date().toISOString(),
          artistMetadataConfidence: syncedTrack.artistMetadataConfidence ?? 0.78
        }
        statuses.artist = 'completed'
      } else if (statuses.artist !== 'completed') {
        statuses.artist = 'noResults'
      }
    }
  } catch {
    statuses.artist = statuses.artist === 'completed' ? statuses.artist : 'failed'
  }

  try {
    const lyrics = await fetchLyrics(syncedTrack)
    if (lyrics) {
      syncedTrack = { ...syncedTrack, ...lyrics }
      statuses.lyrics = 'completed'
    }
  } catch {
    statuses.lyrics = 'failed'
  }

  return {
    track: syncedTrack,
    album: {
      id: syncedTrack.albumId,
      title: syncedTrack.album,
      artist: syncedTrack.artist,
      artistId: syncedTrack.artistId,
      artworkUrl: syncedTrack.albumArtworkUrl || syncedTrack.artworkUrl
    },
    statuses
  }
}

function runCommand(command: string, args: string[]): string {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

function normalizeWallpaperPath(wallpaperPath: string): string {
  if (wallpaperPath.startsWith('~/')) {
    return join(homedir(), wallpaperPath.slice(2))
  }
  return wallpaperPath
}

function resolveWallpaperPath(): { source: WallpaperTint['source']; wallpaperPath?: string } {
  if (process.platform === 'darwin') {
    const systemEventsPath = runCommand('osascript', ['-e', 'tell application "System Events" to tell current desktop to get picture'])
    if (systemEventsPath && systemEventsPath !== 'missing value') {
      return { source: 'macos', wallpaperPath: normalizeWallpaperPath(systemEventsPath) }
    }

    const dockDatabasePath = join(homedir(), 'Library/Application Support/Dock/desktoppicture.db')
    const dockPath = runCommand('sqlite3', [dockDatabasePath, 'select value from data where value is not null and value != "" order by rowid desc limit 1;'])
    return { source: 'macos', wallpaperPath: dockPath ? normalizeWallpaperPath(dockPath) : undefined }
  }

  if (process.platform === 'win32') {
    const wallpaperPath = runCommand('powershell.exe', [
      '-NoProfile',
      '-Command',
      "(Get-ItemProperty 'HKCU:\\Control Panel\\Desktop').WallPaper"
    ])
    return { source: 'windows', wallpaperPath: wallpaperPath ? normalizeWallpaperPath(wallpaperPath) : undefined }
  }

  if (process.platform === 'linux') {
    const rawUri = runCommand('gsettings', ['get', 'org.gnome.desktop.background', 'picture-uri']).replace(/^'|'$/g, '')
    const wallpaperPath = rawUri.startsWith('file://') ? fileURLToPath(rawUri) : rawUri
    return { source: 'linux', wallpaperPath: wallpaperPath ? normalizeWallpaperPath(wallpaperPath) : undefined }
  }

  return { source: 'fallback' }
}

function colorChannel(value: number, toward: number, amount: number): number {
  return Math.round(value + (toward - value) * amount)
}

function tintFromRgb(red: number, green: number, blue: number, source: WallpaperTint['source'], wallpaperPath?: string): WallpaperTint {
  const softRed = colorChannel(red, 255, 0.34)
  const softGreen = colorChannel(green, 255, 0.34)
  const softBlue = colorChannel(blue, 255, 0.34)
  const coolRed = colorChannel(red, 245, 0.2)
  const coolGreen = colorChannel(green, 252, 0.2)
  const coolBlue = colorChannel(blue, 255, 0.2)

  return {
    source,
    primary: `rgba(${softRed}, ${softGreen}, ${softBlue}, 0.46)`,
    secondary: `rgba(${coolRed}, ${coolGreen}, ${coolBlue}, 0.34)`,
    wallpaperPath
  }
}

function wallpaperDataUrlFromImage(image: Electron.NativeImage): string | undefined {
  if (image.isEmpty()) return undefined
  const resized = image.resize({ width: 2200, quality: 'good' })
  return resized.isEmpty() ? undefined : resized.toDataURL()
}

function loadWallpaperImage(wallpaperPath: string): Electron.NativeImage {
  const image = nativeImage.createFromPath(wallpaperPath)
  if (!image.isEmpty() || process.platform !== 'darwin') return image

  const convertedPath = join(app.getPath('temp'), 'kmgccc-wallpaper-preview.jpg')
  runCommand('sips', ['-s', 'format', 'jpeg', wallpaperPath, '--out', convertedPath])
  try {
    return nativeImage.createFromBuffer(readFileSync(convertedPath))
  } catch {
    return nativeImage.createFromPath(convertedPath)
  }
}

function getWallpaperTint(): WallpaperTint {
  const { source, wallpaperPath } = resolveWallpaperPath()

  if (!wallpaperPath || !existsSync(wallpaperPath)) {
    return tintFromRgb(132, 199, 221, 'fallback')
  }

  const image = loadWallpaperImage(wallpaperPath)
  if (image.isEmpty()) return tintFromRgb(132, 199, 221, source)
  const wallpaperDataUrl = wallpaperDataUrlFromImage(image)

  const bitmap = image.resize({ width: 64, height: 64, quality: 'good' }).getBitmap()
  let red = 0
  let green = 0
  let blue = 0
  let count = 0

  for (let index = 0; index < bitmap.length; index += 4) {
    const alpha = bitmap[index + 3] ?? 255
    if (alpha < 16) continue
    blue += bitmap[index] ?? 0
    green += bitmap[index + 1] ?? 0
    red += bitmap[index + 2] ?? 0
    count += 1
  }

  if (count === 0) return { ...tintFromRgb(132, 199, 221, source, wallpaperPath), wallpaperDataUrl }

  return {
    ...tintFromRgb(Math.round(red / count), Math.round(green / count), Math.round(blue / count), source, wallpaperPath),
    wallpaperDataUrl
  }
}

async function sampleWindowColor(owner: BrowserWindow, rect: WindowColorSampleRect): Promise<WindowColorSample | null> {
  const bounds = owner.getContentBounds()
  const sampleRect = {
    x: Math.max(0, Math.floor(rect.x)),
    y: Math.max(0, Math.floor(rect.y)),
    width: Math.max(1, Math.min(bounds.width, Math.floor(rect.width))),
    height: Math.max(1, Math.min(bounds.height, Math.floor(rect.height)))
  }
  sampleRect.width = Math.max(1, Math.min(sampleRect.width, bounds.width - sampleRect.x))
  sampleRect.height = Math.max(1, Math.min(sampleRect.height, bounds.height - sampleRect.y))
  const image = await owner.capturePage(sampleRect)
  if (image.isEmpty()) return null
  const bitmap = image.getBitmap()
  let red = 0
  let green = 0
  let blue = 0
  let count = 0
  for (let index = 0; index < bitmap.length; index += 16) {
    const alpha = bitmap[index + 3] ?? 255
    if (alpha < 16) continue
    blue += bitmap[index] ?? 0
    green += bitmap[index + 1] ?? 0
    red += bitmap[index + 2] ?? 0
    count += 1
  }
  if (!count) return null
  return {
    r: Math.round(red / count),
    g: Math.round(green / count),
    b: Math.round(blue / count)
  }
}

let externalPlaybackSourceMode: ExternalPlaybackSourceMode = 'auto'
let mediaRemoteAdapterPaths: MediaRemoteAdapterPaths | null | undefined
const externalArtworkByIdentity = new Map<string, string | null>()
const pendingExternalArtworkIdentities = new Set<string>()

const browserMediaOwners = [
  'com.apple.safari',
  'com.google.chrome',
  'com.microsoft.edgemac',
  'org.mozilla.firefox',
  'com.brave.browser',
  'com.operasoftware.opera',
  'chrome',
  'msedge',
  'firefox',
  'brave',
  'opera',
  'vivaldi',
  'browser',
  'safari'
]

function externalUnavailableSnapshot(mode: ExternalPlaybackSourceMode, error?: string): ExternalPlaybackSnapshot {
  return {
    available: false,
    sourceMode: mode,
    connectionState: 'unavailable',
    title: '',
    artist: '',
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    playbackRate: 0,
    canControlPlayback: false,
    canSkip: false,
    canSeek: false,
    updatedAt: Date.now(),
    error
  }
}

function mediaRemoteAdapterCandidates(): string[] {
  const candidates = [
    join(process.resourcesPath, 'mediaremote-adapter'),
    join(process.resourcesPath, 'resources', 'mediaremote-adapter'),
    join(app.getAppPath(), 'resources', 'mediaremote-adapter'),
    join(process.cwd(), 'resources', 'mediaremote-adapter'),
    join(__dirname, '../../resources/mediaremote-adapter'),
    join(__dirname, '../resources/mediaremote-adapter')
  ]
  return [...new Set(candidates)]
}

function resolveMediaRemoteAdapterPaths(): MediaRemoteAdapterPaths | null {
  if (mediaRemoteAdapterPaths !== undefined) return mediaRemoteAdapterPaths
  for (const root of mediaRemoteAdapterCandidates()) {
    const script = join(root, 'bin', 'mediaremote-adapter.pl')
    const framework = join(root, 'build', 'MediaRemoteAdapter.framework')
    const testClient = join(root, 'build', 'MediaRemoteAdapterTestClient')
    if (existsSync(script) && existsSync(framework)) {
      mediaRemoteAdapterPaths = {
        script,
        framework,
        testClient: existsSync(testClient) ? testClient : undefined
      }
      return mediaRemoteAdapterPaths
    }
  }
  mediaRemoteAdapterPaths = null
  return mediaRemoteAdapterPaths
}

function runMediaRemoteJson<T>(args: string[], timeoutMs = 5000, maxBuffer = 1024 * 1024): Promise<T | null> {
  if (process.platform !== 'darwin') return Promise.resolve(null)
  const paths = resolveMediaRemoteAdapterPaths()
  if (!paths) return Promise.resolve(null)
  return new Promise((resolve) => {
    execFile(
      '/usr/bin/perl',
      [paths.script, paths.framework, ...args],
      { timeout: timeoutMs, maxBuffer },
      (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve(null)
          return
        }
        try {
          resolve(JSON.parse(stdout) as T)
        } catch {
          resolve(null)
        }
      }
    )
  })
}

function runMediaRemoteCommand(args: string[], timeoutMs = 2500): Promise<boolean> {
  if (process.platform !== 'darwin') return Promise.resolve(false)
  const paths = resolveMediaRemoteAdapterPaths()
  if (!paths) return Promise.resolve(false)
  return new Promise((resolve) => {
    execFile(
      '/usr/bin/perl',
      [paths.script, paths.framework, ...args],
      { timeout: timeoutMs, maxBuffer: 256 * 1024 },
      (error) => resolve(!error)
    )
  })
}

function mediaRemotePayloadFromJson(value: MediaRemotePayload | MediaRemoteEnvelope | null): MediaRemotePayload | null {
  if (!value) return null
  const envelope = value as MediaRemoteEnvelope
  if (envelope.payload !== undefined) return envelope.payload ?? null
  return value as MediaRemotePayload
}

function ownerBundleCandidates(payload: MediaRemotePayload): string[] {
  return [
    payload.bundleIdentifier,
    payload.parentApplicationBundleIdentifier,
    payload.clientBundleIdentifier,
    payload.ownerBundleIdentifier,
    payload.applicationBundleIdentifier
  ]
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value))
}

function externalOwnerKind(sourceAppUserModelId?: string): 'thirdParty' | 'other' {
  const owner = (sourceAppUserModelId ?? '').toLowerCase()
  return browserMediaOwners.some((part) => owner.includes(part)) ? 'other' : 'thirdParty'
}

function payloadMatchesExternalMode(payload: MediaRemotePayload, mode: ExternalPlaybackSourceMode): boolean {
  if (mode === 'auto') return true
  const owner = ownerBundleCandidates(payload)[0] ?? ''
  return externalOwnerKind(owner) === mode
}

function finiteSeconds(value: unknown): number {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0
}

function externalPayloadIdentity(payload: Pick<MediaRemotePayload, 'bundleIdentifier' | 'parentApplicationBundleIdentifier' | 'clientBundleIdentifier' | 'ownerBundleIdentifier' | 'applicationBundleIdentifier' | 'title' | 'artist' | 'album' | 'duration'>): string {
  return [
    ownerBundleCandidates(payload as MediaRemotePayload)[0] ?? 'unknown',
    (payload.title ?? '').trim().toLowerCase(),
    (payload.artist ?? '').trim().toLowerCase(),
    (payload.album ?? '').trim().toLowerCase(),
    Math.round(finiteSeconds(payload.duration))
  ].join('|')
}

function mediaRemoteArtworkDataUrl(payload: MediaRemotePayload): string | undefined {
  const artworkData = payload.artworkData?.trim()
  if (!artworkData) return undefined
  const mimeType = payload.artworkMimeType?.trim() || 'image/jpeg'
  return `data:${mimeType};base64,${artworkData}`
}

function ensureExternalArtwork(identity: string, mode: ExternalPlaybackSourceMode): void {
  if (externalArtworkByIdentity.has(identity) || pendingExternalArtworkIdentities.has(identity)) return
  pendingExternalArtworkIdentities.add(identity)
  void runMediaRemoteJson<MediaRemotePayload | MediaRemoteEnvelope>(['get', '--now'], 5000, 8 * 1024 * 1024)
    .then((raw) => {
      const payload = mediaRemotePayloadFromJson(raw)
      if (!payload || !payloadMatchesExternalMode(payload, mode) || externalPayloadIdentity(payload) !== identity) {
        externalArtworkByIdentity.set(identity, null)
        return
      }
      externalArtworkByIdentity.set(identity, mediaRemoteArtworkDataUrl(payload) ?? null)
    })
    .catch(() => {
      externalArtworkByIdentity.set(identity, null)
    })
    .finally(() => {
      pendingExternalArtworkIdentities.delete(identity)
    })
}

function estimatedMediaRemotePosition(payload: MediaRemotePayload): number {
  const duration = finiteSeconds(payload.duration)
  let position = finiteSeconds(payload.elapsedTimeNow ?? payload.elapsedTime)
  if (payload.elapsedTimeNow === undefined && payload.elapsedTime !== undefined && payload.timestamp && payload.playing) {
    const timestampMs = Date.parse(payload.timestamp)
    const rate = Number(payload.playbackRate ?? 1)
    if (Number.isFinite(timestampMs) && Number.isFinite(rate)) {
      position += ((Date.now() - timestampMs) / 1000) * Math.max(0, rate)
    }
  }
  if (duration > 0) return Math.min(Math.max(position, 0), duration)
  return Math.max(position, 0)
}

function mediaRemoteSnapshotFromPayload(payload: MediaRemotePayload, mode: ExternalPlaybackSourceMode): ExternalPlaybackSnapshot {
  const title = (payload.title ?? '').trim()
  const artist = (payload.artist ?? '').trim()
  const duration = finiteSeconds(payload.duration)
  const playbackRate = Number(payload.playbackRate ?? (payload.playing ? 1 : 0))
  const identity = externalPayloadIdentity(payload)
  const artworkUrl = mediaRemoteArtworkDataUrl(payload) ?? externalArtworkByIdentity.get(identity) ?? undefined
  if (title && !artworkUrl) ensureExternalArtwork(identity, mode)
  return {
    available: true,
    sourceMode: mode,
    connectionState: title ? 'runningHasData' : 'connectedNoMetadata',
    sourceAppUserModelId: ownerBundleCandidates(payload)[0],
    title,
    artist,
    album: payload.album?.trim() || undefined,
    duration,
    currentTime: estimatedMediaRemotePosition(payload),
    isPlaying: payload.playing === true || playbackRate > 0,
    playbackRate: Number.isFinite(playbackRate) ? playbackRate : 0,
    canControlPlayback: true,
    canSkip: true,
    canSeek: duration > 0,
    artworkUrl,
    updatedAt: Date.now()
  }
}

async function getExternalPlaybackSnapshot(mode = externalPlaybackSourceMode): Promise<ExternalPlaybackSnapshot> {
  if (process.platform !== 'darwin') {
    return externalUnavailableSnapshot(mode, 'macOS MediaRemote is only available on macOS.')
  }
  if (!resolveMediaRemoteAdapterPaths()) {
    return externalUnavailableSnapshot(mode, 'MediaRemote adapter resources are missing.')
  }
  const raw = await runMediaRemoteJson<MediaRemotePayload | MediaRemoteEnvelope>(['get', '--no-artwork', '--now'])
  const payload = mediaRemotePayloadFromJson(raw)
  if (!payload) {
    return {
      available: true,
      sourceMode: mode,
      connectionState: 'disconnected',
      title: '',
      artist: '',
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      playbackRate: 0,
      canControlPlayback: false,
      canSkip: false,
      canSeek: false,
      updatedAt: Date.now()
    }
  }
  if (!payloadMatchesExternalMode(payload, mode)) {
    return {
      available: true,
      sourceMode: mode,
      connectionState: 'disconnected',
      title: '',
      artist: '',
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      playbackRate: 0,
      canControlPlayback: false,
      canSkip: false,
      canSeek: false,
      updatedAt: Date.now()
    }
  }
  return mediaRemoteSnapshotFromPayload(payload, mode)
}

async function runExternalPlaybackCommand(command: string, value?: number): Promise<boolean> {
  switch (command) {
    case 'playPause':
      return runMediaRemoteCommand(['send', '2'])
    case 'play':
      return runMediaRemoteCommand(['send', '0'])
    case 'pause':
      return runMediaRemoteCommand(['send', '1'])
    case 'next':
      return runMediaRemoteCommand(['send', '4'])
    case 'previous':
      return runMediaRemoteCommand(['send', '5'])
    case 'seek': {
      const seconds = Number(value ?? 0)
      if (!Number.isFinite(seconds) || seconds < 0) return false
      return runMediaRemoteCommand(['seek', String(Math.round(seconds * 1_000_000))], 3500)
    }
    default:
      return false
  }
}

function getHomeSnapshot() {
  const library = loadPersistedLibrary()
  const tracks = mergeTrackList(library.tracks)
  const heroTrack = tracks[0] ?? null
  const rankingTracks = tracks.slice(0, 5)

  return {
    heroTrack,
    tracks,
    artists: artistsForTracks(tracks),
    albums: albumsForTracks(tracks),
    playlists: playlistsForTracks(tracks, library.playlists),
    stats: {
      totalTrackCount: tracks.length,
      weeklyPlayCount: tracks.length,
      weeklyListeningSeconds: tracks.reduce((total, track) => total + Math.max(0, track.duration || 0), 0),
      favoriteArtistName: heroTrack?.artist,
      favoriteArtistPlayCount: heroTrack ? tracks.filter((track) => track.artistId === heroTrack.artistId).length : 0,
      ranking: rankingTracks.map((track, index) => ({
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        artworkUrl: track.artworkUrl,
        playCount: Math.max(1, rankingTracks.length - index),
        score: Math.max(0.5, 0.92 - index * 0.06)
      })),
      dailyListeningMap: {
        '2026-06-08': tracks.length
      }
    }
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1720,
    height: 960,
    minWidth: 1180,
    minHeight: 720,
    frame: false,
    transparent: false,
    backgroundColor: '#eef7fb',
    show: false,
    title: 'kmgccc_player',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  installLocalMediaProtocol()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const windowDragSessions = new Map<number, { pointerX: number; pointerY: number; windowX: number; windowY: number }>()

ipcMain.on('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.on('window:toggle-maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window) return
  if (window.isMaximized()) {
    window.unmaximize()
  } else {
    window.maximize()
  }
})

ipcMain.on('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})

ipcMain.on('window:drag-start', (event, point: { x: number; y: number }) => {
  const owner = BrowserWindow.fromWebContents(event.sender)
  if (!owner || owner.isDestroyed()) return
  const [windowX, windowY] = owner.getPosition()
  windowDragSessions.set(event.sender.id, {
    pointerX: Number.isFinite(point?.x) ? point.x : 0,
    pointerY: Number.isFinite(point?.y) ? point.y : 0,
    windowX,
    windowY
  })
})

ipcMain.on('window:drag-move', (event, point: { x: number; y: number }) => {
  const owner = BrowserWindow.fromWebContents(event.sender)
  const session = windowDragSessions.get(event.sender.id)
  if (!owner || owner.isDestroyed() || !session) return
  const pointerX = Number.isFinite(point?.x) ? point.x : session.pointerX
  const pointerY = Number.isFinite(point?.y) ? point.y : session.pointerY
  owner.setPosition(
    Math.round(session.windowX + pointerX - session.pointerX),
    Math.round(session.windowY + pointerY - session.pointerY),
    false
  )
})

ipcMain.on('window:drag-end', (event) => {
  windowDragSessions.delete(event.sender.id)
})

ipcMain.handle('library:get-home-snapshot', () => getHomeSnapshot())
ipcMain.handle('system:get-wallpaper-tint', () => getWallpaperTint())
ipcMain.handle('window:sample-color', async (event, rect: WindowColorSampleRect) => {
  const owner = BrowserWindow.fromWebContents(event.sender)
  if (!owner) return null
  return sampleWindowColor(owner, rect)
})
ipcMain.handle('external-playback:get-snapshot', async (_event, mode?: ExternalPlaybackSourceMode) => {
  const nextMode: ExternalPlaybackSourceMode = mode === 'thirdParty' || mode === 'other' || mode === 'auto' ? mode : externalPlaybackSourceMode
  externalPlaybackSourceMode = nextMode
  return getExternalPlaybackSnapshot(nextMode)
})
ipcMain.handle('external-playback:set-source-mode', async (_event, mode: ExternalPlaybackSourceMode) => {
  externalPlaybackSourceMode = mode === 'thirdParty' || mode === 'other' || mode === 'auto' ? mode : 'auto'
  return getExternalPlaybackSnapshot(externalPlaybackSourceMode)
})
ipcMain.handle('external-playback:command', async (_event, command: string, value?: number) => runExternalPlaybackCommand(command, value))

ipcMain.handle('system:get-platform', () => process.platform)
ipcMain.handle('settings:get-library-location', () => libraryLocationInfo())
ipcMain.handle('settings:choose-library-location', async (event) => {
  const owner = BrowserWindow.fromWebContents(event.sender)
  const options: Electron.OpenDialogOptions = {
    title: '选择音乐资料库的存放位置',
    properties: ['openDirectory', 'createDirectory']
  }
  const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options)
  if (result.canceled || !result.filePaths[0]) return libraryLocationInfo()
  const nextRoot = resolvedLibraryRootFromSelection(result.filePaths[0])
  mkdirSync(nextRoot, { recursive: true })
  saveLibraryRootPath(nextRoot)
  return libraryLocationInfo()
})
ipcMain.handle('settings:show-library-location', async () => {
  const rootPath = activeLibraryRootPath()
  mkdirSync(rootPath, { recursive: true })
  await shell.openPath(rootPath)
  return libraryLocationInfo()
})
ipcMain.handle('settings:reset-library-location', () => {
  saveLibraryRootPath(defaultLibraryRootPath())
  return libraryLocationInfo()
})
ipcMain.handle('settings:clear-index-cache', () => getHomeSnapshot())
ipcMain.handle('settings:clear-external-playback-cache', () => true)
ipcMain.handle('settings:complete-library-metadata', async (): Promise<{ completed: number; snapshot: ReturnType<typeof getHomeSnapshot> }> => {
  const library = loadPersistedLibrary()
  const artworkCache: MetadataArtworkSyncCache = {
    albumArtworkByKey: new Map(),
    artistArtworkByKey: new Map()
  }
  let completed = 0
  for (const track of library.tracks) {
    try {
      const result = await syncTrackInfo(track, artworkCache)
      upsertPersistedTrack(result.track)
      completed += 1
    } catch {
      // Keep the batch going; the settings action mirrors Swift's best-effort completion.
    }
  }
  return { completed, snapshot: getHomeSnapshot() }
})
ipcMain.handle('library:import-audio-file', async (event): Promise<LocalAudioImport | null> => {
  const owner = BrowserWindow.fromWebContents(event.sender)
  const options: Electron.OpenDialogOptions = {
    title: '导入单曲',
    properties: ['openFile'],
    filters: [
      { name: '音频文件', extensions: ['mp3', 'm4a', 'aac', 'wav', 'flac', 'ogg', 'opus', 'ncm'] },
      { name: '网易云音乐 NCM', extensions: ['ncm'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  }
  const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options)

  if (result.canceled || !result.filePaths[0]) return null
  const importedTrack = await localAudioImportFromPath(result.filePaths[0])
  upsertPersistedTrack(importedTrack)
  return importedTrack
})
ipcMain.handle('library:import-audio-files', async (event): Promise<AudioImportBatchResult | null> => {
  const owner = BrowserWindow.fromWebContents(event.sender)
  const options: Electron.OpenDialogOptions = {
    title: '批量导入歌曲',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '音频文件', extensions: ['mp3', 'm4a', 'aac', 'wav', 'flac', 'ogg', 'opus', 'ncm'] },
      { name: '网易云音乐 NCM', extensions: ['ncm'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  }
  const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options)
  if (result.canceled || result.filePaths.length === 0) return null
  return importAudioFilesFromPaths(result.filePaths)
})
ipcMain.handle('library:import-audio-files-from-paths', async (_event, filePaths: string[]): Promise<AudioImportBatchResult> => {
  return importAudioFilesFromPaths(filePaths.filter((filePath) => typeof filePath === 'string' && filePath.length > 0))
})
ipcMain.handle('library:sync-track-info', async (_event, track: LocalAudioImport): Promise<TrackMetadataSyncResult> => {
  const result = await syncTrackInfo(track)
  upsertPersistedTrack(result.track)
  return result
})
ipcMain.handle('library:lookup-album-metadata', async (_event, values: Record<string, unknown>) => {
  return lookupAlbumMetadata(values)
})
ipcMain.handle('library:lookup-artist-metadata', async (_event, values: Record<string, unknown>) => {
  return lookupArtistMetadata(values)
})
ipcMain.handle('library:lookup-lyrics', async (_event, values: Record<string, unknown>) => {
  const title = typeof values.title === 'string' ? values.title.trim() : ''
  const artist = typeof values.artist === 'string' ? values.artist.trim() : ''
  const album = typeof values.album === 'string' ? values.album.trim() : ''
  const duration = typeof values.duration === 'number' && Number.isFinite(values.duration) ? values.duration : 0
  const neteaseSongId = positiveInteger(values.neteaseSongId)
  const qqMusicSongId = typeof values.qqMusicSongId === 'string' ? values.qqMusicSongId.trim() : undefined
  const platformValue = typeof values.platform === 'string' ? values.platform : 'auto'
  const platform: LyricsLookupPlatform = ['amll', 'qq', 'kugou', 'netease'].includes(platformValue) ? platformValue as LyricsLookupPlatform : 'auto'
  if (!title) return null
  const ids = idsForMetadata(artist || '未知艺人', album || '未知专辑')
  return fetchLyricsForPlatform({
    id: `lookup-${createHash('sha1').update(`${title}|${artist}|${album}|${duration}`).digest('hex').slice(0, 12)}`,
    title,
    artist: artist || '未知艺人',
    artistId: ids.artistId,
    album: album || '未知专辑',
    albumId: ids.albumId,
    duration,
    neteaseSongId,
    qqMusicSongId,
    sourcePath: '',
    sourceUrl: ''
  }, platform)
})
ipcMain.handle('library:lookup-cover', async (_event, values: Record<string, unknown>) => {
  return lookupCoverCandidates(values)
})
ipcMain.handle('library:clear', () => {
  rmSync(libraryStorePath(), { force: true })
  return getHomeSnapshot()
})
ipcMain.handle('library:update-track', (_event, track: LocalAudioImport) => {
  const library = loadPersistedLibrary()
  savePersistedLibrary({ tracks: updateTracksForEditedTrack(track), playlists: library.playlists })
  return getHomeSnapshot()
})
ipcMain.handle('library:delete-track', (_event, trackId: string) => {
  deleteTracksByPredicate((track) => track.id === trackId)
  return getHomeSnapshot()
})
ipcMain.handle('library:delete-album', (_event, albumId: string) => {
  deleteTracksByPredicate((track) => track.albumId === albumId)
  return getHomeSnapshot()
})
ipcMain.handle('library:delete-artist', (_event, artistId: string) => {
  deleteTracksByPredicate((track) => track.artistId === artistId)
  return getHomeSnapshot()
})
ipcMain.handle('library:update-album', (_event, albumId: string, values: Record<string, unknown>) => {
  const library = loadPersistedLibrary()
  const tracks = library.tracks.map((track) => {
    if (track.albumId !== albumId) return track
    const nextArtist = typeof values.artist === 'string' && values.artist.trim() ? values.artist.trim() : track.artist
    const nextAlbum = typeof values.title === 'string' && values.title.trim() ? values.title.trim() : track.album
    const ids = idsForMetadata(nextArtist, nextAlbum)
    return {
      ...track,
      artist: nextArtist,
      artistId: ids.artistId,
      album: nextAlbum,
      albumId: ids.albumId,
      albumDescription: typeof values.description === 'string' ? values.description : track.albumDescription,
      albumReleaseYear: typeof values.releaseYear === 'number' && Number.isFinite(values.releaseYear) ? values.releaseYear : undefined,
      albumReleaseDate: typeof values.releaseDate === 'string' ? values.releaseDate.trim() : track.albumReleaseDate,
      albumType: typeof values.albumType === 'string' ? values.albumType.trim() : track.albumType,
      albumGenreTags: Array.isArray(values.genreTags) ? values.genreTags.filter((tag): tag is string => typeof tag === 'string') : track.albumGenreTags,
      albumLanguage: typeof values.language === 'string' ? values.language.trim() : track.albumLanguage,
      albumLabelOrCompany: typeof values.labelOrCompany === 'string' ? values.labelOrCompany.trim() : track.albumLabelOrCompany,
      qqMusicAlbumMid: typeof values.qqMusicAlbumMid === 'string' ? values.qqMusicAlbumMid.trim() : track.qqMusicAlbumMid,
      albumMetadataSource: typeof values.metadataSource === 'string' ? values.metadataSource.trim() : track.albumMetadataSource,
      albumMetadataFetchedAt: typeof values.metadataFetchedAt === 'string' ? values.metadataFetchedAt.trim() : track.albumMetadataFetchedAt,
      albumMetadataConfidence: typeof values.metadataConfidence === 'number' && Number.isFinite(values.metadataConfidence) ? values.metadataConfidence : track.albumMetadataConfidence,
      albumArtworkUrl: typeof values.artworkUrl === 'string' ? values.artworkUrl : track.albumArtworkUrl
    }
  })
  savePersistedLibrary({ tracks, playlists: library.playlists })
  return getHomeSnapshot()
})
ipcMain.handle('library:update-artist', (_event, artistId: string, values: Record<string, unknown>) => {
  const library = loadPersistedLibrary()
  const tracks = library.tracks.map((track) => {
    if (track.artistId !== artistId) return track
    const nextArtist = typeof values.name === 'string' && values.name.trim() ? values.name.trim() : track.artist
    const ids = idsForMetadata(nextArtist, track.album)
    return {
      ...track,
      artist: nextArtist,
      artistId: ids.artistId,
      albumId: ids.albumId,
      artistDescription: typeof values.description === 'string' ? values.description : track.artistDescription,
      artistGenreTags: Array.isArray(values.genreTags) ? values.genreTags.filter((tag): tag is string => typeof tag === 'string') : track.artistGenreTags,
      artistRegion: typeof values.region === 'string' ? values.region.trim() : track.artistRegion,
      artistForeignName: typeof values.foreignName === 'string' ? values.foreignName.trim() : track.artistForeignName,
      qqMusicSingerMid: typeof values.qqMusicSingerMid === 'string' ? values.qqMusicSingerMid.trim() : track.qqMusicSingerMid,
      artistMetadataSource: typeof values.metadataSource === 'string' ? values.metadataSource.trim() : track.artistMetadataSource,
      artistMetadataFetchedAt: typeof values.metadataFetchedAt === 'string' ? values.metadataFetchedAt.trim() : track.artistMetadataFetchedAt,
      artistMetadataConfidence: typeof values.metadataConfidence === 'number' && Number.isFinite(values.metadataConfidence) ? values.metadataConfidence : track.artistMetadataConfidence,
      artistArtworkUrl: typeof values.artworkUrl === 'string' ? values.artworkUrl : track.artistArtworkUrl
    }
  })
  savePersistedLibrary({ tracks, playlists: library.playlists })
  return getHomeSnapshot()
})
ipcMain.handle('library:create-playlist', (_event, name: string) => {
  createPlaylist(name.trim() || '新建播放列表')
  return getHomeSnapshot()
})
ipcMain.handle('library:update-playlist', (_event, playlistId: string, name: string) => {
  const library = loadPersistedLibrary()
  savePersistedLibrary({
    tracks: library.tracks,
    playlists: library.playlists.map((playlist) => (playlist.id === playlistId ? { ...playlist, name: name.trim() || playlist.name } : playlist))
  })
  return getHomeSnapshot()
})
ipcMain.handle('library:delete-playlist', (_event, playlistId: string) => {
  const library = loadPersistedLibrary()
  savePersistedLibrary({ tracks: library.tracks, playlists: library.playlists.filter((playlist) => playlist.id !== playlistId) })
  return getHomeSnapshot()
})
ipcMain.handle('library:add-track-to-playlist', (_event, playlistId: string, trackId: string) => {
  const library = loadPersistedLibrary()
  savePersistedLibrary({
    tracks: library.tracks,
    playlists: library.playlists.map((playlist) =>
      playlist.id === playlistId
        ? { ...playlist, trackIds: [trackId, ...playlist.trackIds.filter((id) => id !== trackId)] }
        : playlist
    )
  })
  return getHomeSnapshot()
})
ipcMain.handle('library:remove-track-from-playlist', (_event, playlistId: string, trackId: string) => {
  const library = loadPersistedLibrary()
  savePersistedLibrary({
    tracks: library.tracks,
    playlists: library.playlists.map((playlist) =>
      playlist.id === playlistId ? { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== trackId) } : playlist
    )
  })
  return getHomeSnapshot()
})
