import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('kmgccc', {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  getHomeSnapshot: () => ipcRenderer.invoke('library:get-home-snapshot'),
  importAudioFile: () => ipcRenderer.invoke('library:import-audio-file'),
  importAudioFiles: () => ipcRenderer.invoke('library:import-audio-files'),
  importAudioFilesFromPaths: (filePaths: string[]) => ipcRenderer.invoke('library:import-audio-files-from-paths', filePaths),
  syncTrackInfo: (track: unknown) => ipcRenderer.invoke('library:sync-track-info', track),
  clearLibrary: () => ipcRenderer.invoke('library:clear'),
  updateTrack: (track: unknown) => ipcRenderer.invoke('library:update-track', track),
  deleteTrack: (trackId: string) => ipcRenderer.invoke('library:delete-track', trackId),
  updateAlbum: (albumId: string, title: string, artist: string) => ipcRenderer.invoke('library:update-album', albumId, title, artist),
  deleteAlbum: (albumId: string) => ipcRenderer.invoke('library:delete-album', albumId),
  updateArtist: (artistId: string, name: string) => ipcRenderer.invoke('library:update-artist', artistId, name),
  deleteArtist: (artistId: string) => ipcRenderer.invoke('library:delete-artist', artistId),
  createPlaylist: (name: string) => ipcRenderer.invoke('library:create-playlist', name),
  updatePlaylist: (playlistId: string, name: string) => ipcRenderer.invoke('library:update-playlist', playlistId, name),
  deletePlaylist: (playlistId: string) => ipcRenderer.invoke('library:delete-playlist', playlistId),
  addTrackToPlaylist: (playlistId: string, trackId: string) => ipcRenderer.invoke('library:add-track-to-playlist', playlistId, trackId),
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => ipcRenderer.invoke('library:remove-track-from-playlist', playlistId, trackId),
  getWallpaperTint: () => ipcRenderer.invoke('system:get-wallpaper-tint')
})
