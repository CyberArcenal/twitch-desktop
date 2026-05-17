const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimizeWindow: () => ipcRenderer.send("window:minimize"),
  maximizeWindow: () => ipcRenderer.send("window:maximize"),
  closeWindow: () => ipcRenderer.send("window:close"),
  getWindowState: () => ipcRenderer.invoke("window:getState"),
  onWindowMaximized: (cb) => { ipcRenderer.on("window:maximized", cb); return () => ipcRenderer.removeListener("window:maximized", cb); },
  onWindowRestored: (cb) => { ipcRenderer.on("window:restored", cb); return () => ipcRenderer.removeListener("window:restored", cb); },
  onWindowMinimized: (cb) => { ipcRenderer.on("window:minimized", cb); return () => ipcRenderer.removeListener("window:minimized", cb); },

  // Settings
  getSettings: () => ipcRenderer.invoke("settings:getAll"),
  setSetting: (k,v) => ipcRenderer.invoke("settings:set", k, v),
  addChatFilter: (w) => ipcRenderer.invoke("settings:addFilter", w),
  removeChatFilter: (w) => ipcRenderer.invoke("settings:removeFilter", w),

  // Auth
  login: () => ipcRenderer.invoke("auth:login"),
  logout: () => ipcRenderer.invoke("auth:logout"),
  isLoggedIn: () => ipcRenderer.invoke("auth:isLoggedIn"),
  getCurrentUser: () => ipcRenderer.invoke("auth:getUser"),

  // Twitch API
  getTwitchUser: () => ipcRenderer.invoke("twitch:getUser"),
  getFollowedChannels: (userId, after) => ipcRenderer.invoke("twitch:getFollowed", userId, after),
  getStreams: (userIds) => ipcRenderer.invoke("twitch:getStreams", userIds),
  searchChannels: (q) => ipcRenderer.invoke("twitch:searchChannels", q),
  getChannelInfo: (id) => ipcRenderer.invoke("twitch:getChannelInfo", id),

  // Chat
  connectChat: (ch) => ipcRenderer.invoke("chat:connect", ch),
  sendChatMessage: (msg) => ipcRenderer.invoke("chat:send", msg),
  disconnectChat: () => ipcRenderer.invoke("chat:disconnect"),

  // Events from main
  onChatMessage: (cb) => { ipcRenderer.on("chat:message", (_, d) => cb(d)); return () => ipcRenderer.removeAllListeners("chat:message"); },
  onChatConnected: (cb) => { ipcRenderer.on("chat:connected", (_, d) => cb(d)); return () => ipcRenderer.removeAllListeners("chat:connected"); },
  onUserJoined: (cb) => { ipcRenderer.on("chat:user-joined", (_, d) => cb(d)); return () => ipcRenderer.removeAllListeners("chat:user-joined"); },

  getUserFollowers: (broadcasterId) => ipcRenderer.invoke('get-user-followers', broadcasterId),

  notifyAppReady: () => ipcRenderer.send('app:renderer-ready'),
});