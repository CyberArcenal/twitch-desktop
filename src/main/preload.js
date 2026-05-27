// src/main/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("backendAPI", {
  // Window control
  windowControl: (payload) => ipcRenderer.invoke("window-control", payload),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  notifyAppReady: () => ipcRenderer.send("app:renderer-ready"),

  // Twitch modules
  auth: (payload) => ipcRenderer.invoke("twitch-auth", payload),
  chat: (payload) => ipcRenderer.invoke("twitch-chat", payload),
  streamMonitor: (payload) => ipcRenderer.invoke("stream-monitor", payload),
  follows: (payload) => ipcRenderer.invoke("follows", payload),
  notification: (payload) => ipcRenderer.invoke("notification", payload),
  settings: (payload) => ipcRenderer.invoke("settings", payload),
  player: (payload) => ipcRenderer.invoke("player", payload),

  games: (payload) => ipcRenderer.invoke("games", payload),
  user: (payload) => ipcRenderer.invoke("user", payload),
  clips: (payload) => ipcRenderer.invoke("clips", payload),
  eventsub: (payload) => ipcRenderer.invoke("eventsub", payload),
  history: (payload) => ipcRenderer.invoke("history", payload),
  shortcut: (payload) => ipcRenderer.invoke("shortcut", payload),

  themes: (payload) => ipcRenderer.invoke("themes", payload),
  adBlock: (payload) => ipcRenderer.invoke("ad-block", payload),
  pip: (payload) => ipcRenderer.invoke("pip", payload),
  download: (payload) => ipcRenderer.invoke("download", payload),
  predictions: (payload) => ipcRenderer.invoke("predictions", payload),
  search: (payload) => ipcRenderer.invoke("search", payload),
  streams: (payload) => ipcRenderer.invoke("streams", payload),
  watchLater: (payload) => ipcRenderer.invoke('watch-later', payload),
  whisper: (payload) => ipcRenderer.invoke('whisper', payload),
  notificationStore: (payload) => ipcRenderer.invoke('notification-store', payload),
  streamSettings: (payload) => ipcRenderer.invoke('stream-settings', payload),

  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  appInfo: () => ipcRenderer.invoke('app:get-info'),
  // Event listeners
  on: (channel, callback) => {
    const newCallback = (_, data) => callback(data);
    ipcRenderer.on(channel, newCallback);
    return () => ipcRenderer.removeListener(channel, newCallback);
  },
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback),
});
