import { app, BrowserWindow, dialog, ipcMain, nativeImage, net, protocol } from 'electron'
import { execFileSync } from 'node:child_process'
import { createDecipheriv, createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'

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

type LocalAudioImport = {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  duration: number
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
    lyrics: 'completed' | 'noResults' | 'failed'
    album: 'completed' | 'noResults' | 'failed'
  }
}

type AudioImportBatchResult = {
  tracks: LocalAudioImport[]
}

type ItunesSearchResult = {
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
  trackTimeMillis?: number
}

type LrcLibResult = {
  trackName?: string
  artistName?: string
  albumName?: string
  plainLyrics?: string | null
  syncedLyrics?: string | null
}

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
  return join(app.getPath('userData'), 'library-store.json')
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
  const albums = new Map<string, { id: string; title: string; artist: string; artistId: string; artworkUrl?: string; trackCount: number }>()
  tracks.forEach((track) => {
    const existing = albums.get(track.albumId)
    if (existing) {
      existing.trackCount += 1
      existing.artworkUrl ||= track.artworkUrl
      return
    }
    albums.set(track.albumId, {
      id: track.albumId,
      title: track.album,
      artist: track.artist,
      artistId: track.artistId,
      artworkUrl: track.artworkUrl,
      trackCount: 1
    })
  })
  return Array.from(albums.values())
}

function artistsForTracks(tracks: LocalAudioImport[]) {
  const artists = new Map<string, { id: string; name: string; artworkUrl?: string; trackCount: number; albumIds: Set<string> }>()
  tracks.forEach((track) => {
    const existing = artists.get(track.artistId)
    if (existing) {
      existing.trackCount += 1
      existing.albumIds.add(track.albumId)
      existing.artworkUrl ||= track.artworkUrl
      return
    }
    artists.set(track.artistId, {
      id: track.artistId,
      name: track.artist,
      artworkUrl: track.artworkUrl,
      trackCount: 1,
      albumIds: new Set([track.albumId])
    })
  })
  return Array.from(artists.values()).map((artist) => ({
    id: artist.id,
    name: artist.name,
    artworkUrl: artist.artworkUrl,
    trackCount: artist.trackCount,
    albumCount: artist.albumIds.size
  }))
}

function playlistsForTracks(tracks: LocalAudioImport[], persistedPlaylists: PersistedPlaylist[]) {
  const trackIds = new Set(tracks.map((track) => track.id))
  const libraryPlaylist = tracks.length
    ? [{
      id: 'playlist-library',
      name: '资料库',
      artworkUrl: tracks[0]?.artworkUrl,
      trackCount: tracks.length,
      trackIds: tracks.map((track) => track.id)
    }]
    : []
  const userPlaylists = persistedPlaylists
    .filter((playlist) => playlist.id !== 'playlist-library')
    .map((playlist) => {
      const validTrackIds = playlist.trackIds.filter((id) => trackIds.has(id))
      const firstTrack = tracks.find((track) => track.id === validTrackIds[0])
      return {
        ...playlist,
        artworkUrl: playlist.artworkUrl || firstTrack?.artworkUrl,
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
  let artworkUrl: string | undefined

  try {
    const { parseFile, selectCover } = await import('music-metadata')
    const metadata = await parseFile(audioPath)
    title = metadata.common.title?.trim() || title
    artist = metadata.common.artist?.trim() || artist
    album = metadata.common.album?.trim() || album
    duration = metadata.format.duration ? Math.round(metadata.format.duration) : 0
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

function scoreLyricsCandidate(track: LocalAudioImport, candidate: LrcLibResult): number {
  let score = 0
  if (candidate.trackName?.toLowerCase() === track.title.toLowerCase()) score += 4
  if (!isUnknown(track.artist) && candidate.artistName?.toLowerCase().includes(track.artist.toLowerCase())) score += 3
  if (!isUnknown(track.album) && candidate.albumName?.toLowerCase() === track.album.toLowerCase()) score += 2
  if (candidate.syncedLyrics) score += 1
  return score
}

async function fetchLyrics(track: LocalAudioImport): Promise<Pick<LocalAudioImport, 'lyricsText' | 'syncedLyrics'> | null> {
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
    syncedLyrics: selected.syncedLyrics ?? undefined
  }
}

async function syncTrackInfo(track: LocalAudioImport): Promise<TrackMetadataSyncResult> {
  let syncedTrack = { ...track }
  const statuses: TrackMetadataSyncResult['statuses'] = {
    track: track.convertedFromNcm ? 'completed' : 'noResults',
    lyrics: 'noResults',
    album: track.convertedFromNcm ? 'completed' : 'noResults'
  }
  const preserveNcmIdentity = track.convertedFromNcm && track.metadataSource === 'ncm'

  try {
    const metadata = await fetchItunesMetadata(syncedTrack)
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
      statuses.album = syncedTrack.artworkUrl ? 'completed' : 'noResults'
    }
  } catch {
    statuses.track = 'failed'
    statuses.album = 'failed'
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
      artworkUrl: syncedTrack.artworkUrl
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

ipcMain.handle('library:get-home-snapshot', () => getHomeSnapshot())
ipcMain.handle('system:get-wallpaper-tint', () => getWallpaperTint())
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
ipcMain.handle('library:update-album', (_event, albumId: string, title: string, artist: string) => {
  const library = loadPersistedLibrary()
  const tracks = library.tracks.map((track) => {
    if (track.albumId !== albumId) return track
    const nextArtist = artist.trim() || track.artist
    const nextAlbum = title.trim() || track.album
    const ids = idsForMetadata(nextArtist, nextAlbum)
    return { ...track, artist: nextArtist, artistId: ids.artistId, album: nextAlbum, albumId: ids.albumId }
  })
  savePersistedLibrary({ tracks, playlists: library.playlists })
  return getHomeSnapshot()
})
ipcMain.handle('library:update-artist', (_event, artistId: string, name: string) => {
  const library = loadPersistedLibrary()
  const tracks = library.tracks.map((track) => {
    if (track.artistId !== artistId) return track
    const nextArtist = name.trim() || track.artist
    const ids = idsForMetadata(nextArtist, track.album)
    return { ...track, artist: nextArtist, artistId: ids.artistId, albumId: ids.albumId }
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
