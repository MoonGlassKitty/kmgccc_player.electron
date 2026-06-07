import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('kmgccc', {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  getHomeSnapshot: () => ipcRenderer.invoke('library:get-home-snapshot'),
  importAudioFile: () => ipcRenderer.invoke('library:import-audio-file'),
  syncTrackInfo: (track: unknown) => ipcRenderer.invoke('library:sync-track-info', track),
  getWallpaperTint: () => ipcRenderer.invoke('system:get-wallpaper-tint')
})
