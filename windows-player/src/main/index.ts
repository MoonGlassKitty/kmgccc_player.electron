import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'

const isDev = Boolean(process.env.ELECTRON_RENDERER_URL)

const albumArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/15/a4/a4/15a4a47c-62db-07c3-d14f-e78c3c8dec85/artwork.jpg/600x600bb.jpg'

const altArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e9/c4/38/e9c43893-e743-269a-6a47-c11120717177/artwork.jpg/600x600bb.jpg'

const demoTracks = [
  { id: 'renascence', title: '!renascence!', artist: 'acloudyskye', album: "This Won't Be The Last...", duration: 113, artworkUrl: albumArtwork },
  { id: 'basin', title: 'Basin', artist: 'acloudyskye', album: "This Won't Be The Last...", duration: 320, artworkUrl: albumArtwork },
  { id: 'bones', title: 'Bones', artist: 'acloudyskye', album: "This Won't Be The Last...", duration: 232, artworkUrl: albumArtwork },
  { id: 'float', title: 'Float', artist: 'acloudyskye', album: "This Won't Be The Last...", duration: 270, artworkUrl: albumArtwork },
  { id: 'myth', title: 'Myth', artist: 'acloudyskye', album: 'Myth', duration: 241, artworkUrl: altArtwork },
  { id: 'udong', title: '乌东', artist: 'MoonGlassKitty', album: '乌东', duration: 163, artworkUrl: altArtwork }
]

function getHomeSnapshot() {
  return {
    heroTrack: demoTracks[4],
    tracks: demoTracks,
    artists: [
      { id: 'artist-moonglasskitty', name: 'MoonGlassKitty', artworkUrl: undefined, trackCount: 1, albumCount: 1 },
      { id: 'artist-acloudyskye', name: 'acloudyskye', artworkUrl: albumArtwork, trackCount: 5, albumCount: 1 }
    ],
    albums: [
      { id: 'album-last', title: "This Won't Be The Last...", artist: 'acloudyskye', artworkUrl: albumArtwork, trackCount: 4 },
      { id: 'album-udong', title: '乌东', artist: 'MoonGlassKitty', artworkUrl: altArtwork, trackCount: 1 }
    ],
    playlists: [{ id: 'playlist-import-june-5', name: '导入于 6月 5', artworkUrl: undefined, trackCount: demoTracks.length }],
    stats: {
      totalTrackCount: demoTracks.length,
      weeklyPlayCount: 5,
      weeklyListeningSeconds: 8 * 60,
      favoriteArtistName: 'acloudyskye',
      favoriteArtistPlayCount: 3,
      ranking: [
        { trackId: 'myth', title: 'Myth', artist: 'acloudyskye', artworkUrl: altArtwork, playCount: 2, score: 0.92 },
        { trackId: 'udong', title: '乌东', artist: 'MoonGlassKitty', artworkUrl: altArtwork, playCount: 1, score: 0.76 },
        { trackId: 'bones', title: 'Bones', artist: 'acloudyskye', artworkUrl: albumArtwork, playCount: 1, score: 0.72 }
      ],
      dailyListeningMap: {
        '2026-06-05': 3,
        '2026-06-06': 2
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
