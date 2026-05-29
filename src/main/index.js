// src/main/index.js – Twitch Desktop (aligned with Collectly structure)
//@ts-check
/**
 * @file Main entry point for Twitch Desktop
 * @version 1.0.0
 * @author CyberArcenal
 * @description Electron main process with Twitch integration, React + Vite frontend
 */

// ===================== CORE IMPORTS =====================
const { app, ipcMain, screen, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const url = require("url");

// ===================== SERVICES =====================
const { notificationService } = require("../services/notification.service");
const { playerService } = require("../services/player.service");
// @ts-ignore
const { settingsService } = require("../services/settings.service");
const { twitchAuthService } = require("../services/twitch-auth.service");
const { twitchApiService } = require("../services/twitch-api.service");
const { streamMonitorService } = require("../services/stream-monitor.service");
const { twitchChatService } = require("../services/twitch-chat.service");
const { followsService } = require("../services/follows.service");
const { eventSubService } = require("../services/eventsub.service");
const { pipService } = require("../services/picture-in-picture.service");

// ===================== CONFIGURATION =====================
const IS_DEV = process.env.NODE_ENV === "development" || !app.isPackaged;
const APP_NAME = "Twitch Desktop";
const APP_VERSION = app.getVersion();
const APP_USER_DATA = app.getPath("userData");

const APP_CONFIG = {
  isDev: IS_DEV,
  appName: APP_NAME,
  version: APP_VERSION,
  userDataPath: APP_USER_DATA,
};

// ===================== GLOBAL STATE =====================
/** @type {BrowserWindow | null} */
let mainWindow = null;

/** @type {BrowserWindow | null} */
let splashWindow = null;

/** @type {boolean} */
let isQuitting = false;

// ===================== LOGGING SERVICE =====================
const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
};

/**
 * Enhanced logging utility
 * @param {string} level - Log level (use LogLevel constants)
 * @param {string} message - Log message
 * @param {any} [data] - Optional data
 * @param {boolean} [writeToFile=false] - Write to log file (production only)
 */
async function log(level, message, data = null, writeToFile = false) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${APP_CONFIG.appName} ${level}]`;
  const logMessage = `${prefix} ${message}`;

  // Console output with colors for dev
  if (APP_CONFIG.isDev) {
    const colors = {
      [LogLevel.DEBUG]: "\x1b[36m", // Cyan
      [LogLevel.INFO]: "\x1b[34m", // Blue
      [LogLevel.WARN]: "\x1b[33m", // Yellow
      [LogLevel.ERROR]: "\x1b[31m", // Red
      [LogLevel.SUCCESS]: "\x1b[32m", // Green
    };
    console.log(`${colors[level] || ""}${logMessage}\x1b[0m`);
  } else {
    console.log(logMessage);
  }

  if (data) {
    console.dir(data, { depth: 2, colors: APP_CONFIG.isDev });
  }

  // Write to log file in production if requested
  if (writeToFile && !APP_CONFIG.isDev) {
    try {
      const logDir = path.join(APP_CONFIG.userDataPath, "logs");
      await fs.mkdir(logDir, { recursive: true });
      const logFile = path.join(
        logDir,
        `twitch-${new Date().toISOString().split("T")[0]}.log`,
      );
      const logEntry = `${logMessage}${data ? "\n" + JSON.stringify(data, null, 2) : ""}\n`;
      await fs.appendFile(logFile, logEntry);
    } catch (err) {
      console.error("Failed to write log to file:", err);
    }
  }
}

// ===================== ERROR HANDLING =====================
function setupGlobalErrorHandlers() {
  process.on("uncaughtException", (error) => {
    log(
      LogLevel.ERROR,
      "Uncaught Exception:",
      { message: error.message, stack: error.stack },
      true,
    );
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("app:error", {
        type: "uncaughtException",
        message: error.message,
      });
    }
  });

  process.on("unhandledRejection", (reason) => {
    log(LogLevel.ERROR, "Unhandled Rejection:", reason, true);
  });

  // @ts-ignore
  app.on("renderer-process-crashed", (event, webContents, killed) => {
    log(
      LogLevel.ERROR,
      "Renderer process crashed:",
      { killed, webContentsId: webContents.id },
      true,
    );
  });
}

// ===================== WINDOW MANAGEMENT =====================
/**
 * Get icon path based on platform
 */
function getIconPath() {
  const platform = process.platform;
  const iconFile = {
    win32: 'icon.ico',
    darwin: 'icon.icns',
    linux: 'icon.png'
  }[platform] || 'icon.png';

  // Listahan ng mga posibleng lokasyon (sa order)
  const possiblePaths = [
    // Development mode
    path.resolve(__dirname, '..', '..', 'build', iconFile),
    path.resolve(__dirname, '..', '..', 'resources', 'build', iconFile),
    // Production (packaged)
    path.join(process.resourcesPath, 'build', iconFile),
    path.join(process.resourcesPath, 'icon.ico'), // kung direktang nasa resources
    path.join(process.resourcesPath, '..', 'app.asar.unpacked', 'build', iconFile),
    path.join(app.getAppPath(), 'build', iconFile),
    path.join(app.getAppPath(), 'icon.ico'),
    // Fallback: kung nasa root ng app
    path.join(path.dirname(app.getPath('exe')), iconFile),
  ];

  for (const iconPath of possiblePaths) {
    if (fsSync.existsSync(iconPath)) {
      console.log(`[Icon] Found at: ${iconPath}`);
      return iconPath;
    }
  }

  console.warn('[Icon] No icon file found, using default Electron icon');
  return null;
}

/**
 * Create splash window
 */
async function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500, // was 400
    height: 400, // was 300
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const splashPath = path.join(__dirname, "splash.html");
  if (fsSync.existsSync(splashPath)) {
    await splashWindow.loadFile(splashPath);
  } else {
    await splashWindow.loadURL(`data:text/html,
      <!DOCTYPE html>
      <html>
      <head><style>body{background:#6441a5;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:white;font-family:sans-serif;}</style></head>
      <body><h1>${APP_NAME}</h1><p>Loading...</p></body>
      </html>
    `);
  }
  splashWindow.show();
  log(LogLevel.INFO, "Splash window created");
}

/**
 * Get main window URL (dev server or production file)
 */
async function getMainWindowUrl() {
  if (APP_CONFIG.isDev) return "http://localhost:5173";
  const indexPath = path.join(
    __dirname,
    "..",
    "..",
    "dist-renderer",
    "index.html",
  );
  if (!fsSync.existsSync(indexPath))
    throw new Error(`Renderer build not found at ${indexPath}`);
  return url.pathToFileURL(indexPath).href;
}

/**
 * Create main application window
 */
async function createMainWindow() {
  log(LogLevel.INFO, "Creating main window...");

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;
  const windowWidth = Math.min(1280, screenWidth - 100);
  const windowHeight = Math.min(768, screenHeight - 100);
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    frame: true,
    titleBarStyle: "default",
    backgroundColor: "#0e0e10",
    // @ts-ignore
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      sandbox: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setTitle(`${APP_NAME} v${APP_VERSION}`);

  const appUrl = await getMainWindowUrl();
  await mainWindow.loadURL(appUrl);

  // Show only after renderer signals ready
  mainWindow.once("ready-to-show", () => {
    const timeoutId = setTimeout(() => {
      log(LogLevel.WARN, "Renderer-ready timeout – showing main window anyway");
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      // @ts-ignore
      mainWindow.show();
    }, 8000);

    ipcMain.once("app:renderer-ready", (event) => {
      // @ts-ignore
      if (event.sender === mainWindow.webContents) {
        log(LogLevel.INFO, "Received renderer-ready signal");
        clearTimeout(timeoutId);
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        // @ts-ignore
        mainWindow.show();
      }
    });
  });

  if (APP_CONFIG.isDev) mainWindow.webContents.openDevTools({ mode: "detach" });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  log(LogLevel.SUCCESS, "Main window created");
  return mainWindow;
}

// ===================== SERVICE INITIALIZATION =====================
async function initializeServices() {
  log(LogLevel.INFO, "Initializing services...");
  // @ts-ignore
  notificationService.initialize(mainWindow);
  streamMonitorService.initStreamMonitor(mainWindow);
  twitchChatService.initChatService(mainWindow);
  followsService.initialize(mainWindow);
  playerService.initialize(mainWindow);
  eventSubService.initialize(mainWindow);
  pipService.initialize(mainWindow);

  // Attach updater handler (if needed)
  try {
    const updaterModule = require("./ipc/utils/updater/index.ipc.js");
    updaterModule.setMainWindow(mainWindow);
  } catch (err) {
    log(LogLevel.WARN, "Updater module not loaded", err);
  }

  // Check stored token validity
  if (twitchAuthService.isLoggedIn()) {
    try {
      await twitchApiService.getCurrentUser();
      log(LogLevel.INFO, "User already logged in – starting stream monitor");
      streamMonitorService.startStreamMonitor(60);
    } catch (err) {
      log(
        LogLevel.WARN,
        "Stored token invalid – clearing and requiring re-login",
      );
      await twitchAuthService.logout();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("auth:invalid", {});
      }
    }
  }
  log(LogLevel.SUCCESS, "All services initialized");
}

// ===================== IPC HANDLERS =====================
function registerIpcHandlers() {
  log(LogLevel.INFO, "Registering IPC handlers...");

  // Basic window controls
  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  // @ts-ignore
  ipcMain.on("window:maximize", () =>
    // @ts-ignore
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(),
  );
  ipcMain.on("window:close", () => mainWindow?.close());
  ipcMain.on("window:reload", () => mainWindow?.reload());
  ipcMain.on("window:toggle-devtools", () =>
    mainWindow?.webContents.toggleDevTools(),
  );

  ipcMain.handle("app:get-info", () => ({
    name: APP_NAME,
    version: APP_VERSION,
    isDev: APP_CONFIG.isDev,
    platform: process.platform,
    arch: process.arch,
  }));

  // @ts-ignore
  ipcMain.on("app:open-external", (event, url) => {
    if (typeof url === "string" && url.startsWith("http")) {
      shell.openExternal(url).catch(console.error);
    }
  });

  // Load modular IPC handlers (all core modules)
  const ipcModules = [
    "./ipc/utils/updater/index.ipc.js",
    "./ipc/core/player/index.ipc.js",
    "./ipc/core/notification/index.ipc.js",
    "./ipc/core/settings/index.ipc.js",
    "./ipc/core/twitch-auth/index.ipc.js",
    "./ipc/core/twitch-chat/index.ipc.js",
    "./ipc/core/stream-monitor/index.ipc.js",
    "./ipc/core/follows/index.ipc.js",
    "./ipc/core/games/index.ipc.js",
    "./ipc/core/user/index.ipc.js",
    "./ipc/core/clips/index.ipc.js",
    "./ipc/core/eventsub/index.ipc.js",
    "./ipc/core/history/index.ipc.js",
    "./ipc/core/shortcut/index.ipc.js",
    "./ipc/core/themes/index.ipc.js",
    "./ipc/core/ad-block/index.ipc.js",
    "./ipc/core/pip/index.ipc.js",
    "./ipc/core/download/index.ipc.js",
    "./ipc/core/predictions/index.ipc.js",
    "./ipc/core/search/index.ipc.js",
    "./ipc/core/streams/index.ipc.js",
    "./ipc/core/watch-later/index.ipc.js",
    "./ipc/core/whisper/index.ipc.js",
    "./ipc/core/notification-store/index.ipc.js",
    "./ipc/core/stream-settings/index.ipc.js",
  ];

  for (const modulePath of ipcModules) {
    const fullPath = path.join(__dirname, modulePath);
    if (fsSync.existsSync(fullPath)) {
      try {
        require(fullPath);
        log(LogLevel.DEBUG, `Loaded IPC module: ${modulePath}`);
      } catch (err) {
        log(LogLevel.ERROR, `Failed to load IPC module ${modulePath}:`, err);
      }
    } else {
      log(LogLevel.WARN, `IPC module not found: ${modulePath}`);
    }
  }

  log(LogLevel.SUCCESS, "IPC handlers registered");
}

// ===================== APP LIFECYCLE =====================
async function startup() {
  log(
    LogLevel.INFO,
    `Starting ${APP_NAME} v${APP_VERSION} (${APP_CONFIG.isDev ? "Development" : "Production"})`,
  );
  setupGlobalErrorHandlers();
  await createSplashWindow();
  registerIpcHandlers();
  await createMainWindow();
  await initializeServices();
  log(LogLevel.SUCCESS, `${APP_NAME} started successfully`);
}

app.on("ready", startup);

app.on("window-all-closed", () => {
  log(LogLevel.INFO, "All windows closed");
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) await startup();
});

// @ts-ignore
app.on("before-quit", (event) => {
  if (isQuitting) return;
  isQuitting = true;
  streamMonitorService.stopStreamMonitor();
  twitchChatService.disconnectChat().catch(console.error);
  twitchAuthService.logout().catch(console.error);
});

// Uncaught errors (already handled by global handlers, but fallback)
process.on("uncaughtException", (err) =>
  log(LogLevel.ERROR, "Uncaught Exception (fallback)", err),
);
process.on("unhandledRejection", (reason) =>
  log(LogLevel.ERROR, "Unhandled Rejection (fallback)", reason),
);

// ===================== EXPORTS (for testing) =====================
if (APP_CONFIG.isDev) {
  module.exports = { createMainWindow, initializeServices, getIconPath };
}
