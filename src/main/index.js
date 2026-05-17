//@ts-check
// @ts-ignore
const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const url = require("url");

// ===================== Twitch services =====================
const { initChatService } = require("../services/twitch-chat.service");
const { registerAuthHandlers } = require("./ipc/auth");
const { registerTwitchHandlers } = require("./ipc/twitch");
const { registerChatHandlers } = require("./ipc/chat");
const { registerSettingsHandlers } = require("./ipc/settings");
const {
  initStreamMonitor,
  startStreamMonitor,
  stopStreamMonitor,
} = require("../services/stream-monitor.service");

// ===================== APP CONFIG =====================
const APP_CONFIG = {
  isDev: process.env.NODE_ENV === "development" || !app.isPackaged,
  appName: "Twitch Desktop",
  version: app.getVersion(),
  userDataPath: app.getPath("userData"),
};

// ===================== LOGGING =====================
const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
};

// @ts-ignore
async function log(level, message, data = null, writeToFile = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${APP_CONFIG.appName} ${level}] ${message}`;

  if (APP_CONFIG.isDev) {
    const colors = {
      [LogLevel.DEBUG]: "\x1b[36m",
      [LogLevel.INFO]: "\x1b[34m",
      [LogLevel.WARN]: "\x1b[33m",
      [LogLevel.ERROR]: "\x1b[31m",
      [LogLevel.SUCCESS]: "\x1b[32m",
    };
    console.log(`${colors[level] || ""}${logMessage}\x1b[0m`);
  } else {
    console.log(logMessage);
  }
  if (data) console.dir(data, { depth: 3, colors: APP_CONFIG.isDev });

  if (writeToFile && !APP_CONFIG.isDev) {
    try {
      const logDir = path.join(APP_CONFIG.userDataPath, "logs");
      await fs.mkdir(logDir, { recursive: true });
      const logFile = path.join(
        logDir,
        `Twitch-${new Date().toISOString().split("T")[0]}.log`,
      );
      const logEntry = `${logMessage}${data ? "\n" + JSON.stringify(data, null, 2) : ""}\n`;
      await fs.appendFile(logFile, logEntry);
    } catch (err) {
      console.error("Failed to write log file:", err);
    }
  }
}

// ===================== CUSTOM ERRORS =====================
// @ts-ignore
class WindowError extends Error {
  // @ts-ignore
  constructor(message, windowType) {
    super(message);
    this.name = "WindowError";
    this.windowType = windowType;
  }
}

// @ts-ignore
class StartupError extends Error {
  // @ts-ignore
  constructor(message, originalError) {
    super(message);
    this.name = "StartupError";
    this.originalError = originalError;
  }
}

// ===================== GLOBAL ERROR HANDLERS =====================
function setupGlobalErrorHandlers() {
  process.on("uncaughtException", (error) => {
    log(
      LogLevel.ERROR,
      "Uncaught Exception",
      // @ts-ignore
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
    // @ts-ignore
    log(LogLevel.ERROR, "Unhandled Rejection", { reason }, true);
  });

  // @ts-ignore
  app.on("renderer-process-crashed", (event, webContents, killed) => {
    log(
      LogLevel.ERROR,
      "Renderer crashed",
      // @ts-ignore
      { killed, webContentsId: webContents.id },
      true,
    );
  });
}

// ===================== GLOBALS =====================
/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {BrowserWindow | null} */
let splashWindow = null;

// ===================== ICON =====================
function getIconPath() {
  const platform = process.platform;
  const iconDir = APP_CONFIG.isDev
    ? path.resolve(__dirname, "..", "..", "build")
    : path.join(process.resourcesPath, "build");
  const iconMap = { win32: "icon.ico", darwin: "icon.icns", linux: "icon.png" };
  // @ts-ignore
  const iconFile = iconMap[platform] || "icon.png";
  const iconPath = path.join(iconDir, iconFile);
  return fsSync.existsSync(iconPath) ? iconPath : null;
}

// ===================== SPLASH WINDOW =====================
async function createSplashWindow() {
  log(LogLevel.INFO, "Creating splash window...");
  splashWindow = new BrowserWindow({
    width: 450,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const splashPath = path.join(__dirname, "splash.html");
  if (!fsSync.existsSync(splashPath)) {
    log(LogLevel.WARN, "splash.html not found – using simple HTML");
    await splashWindow.loadURL(`data:text/html;charset=utf-8,
      <html><body style="background:#9146ff; color:white; display:flex; align-items:center; justify-content:center;">
        <h2>Loading Twitch Desktop...</h2>
      </body></html>`);
  } else {
    await splashWindow.loadFile(splashPath);
  }
  splashWindow.show();
  log(LogLevel.SUCCESS, "Splash window shown");
  return splashWindow;
}

// ===================== MAIN WINDOW URL =====================
async function getAppUrl() {
  if (APP_CONFIG.isDev) {
    const devUrl = "http://localhost:3000";
    log(LogLevel.INFO, `Dev mode: ${devUrl}`);
    return devUrl;
  }

  const possiblePaths = [
    path.join(__dirname, "../../dist-renderer/index.html"),
    path.join(process.resourcesPath, "dist-renderer/index.html"),
    path.join(app.getAppPath(), "dist-renderer/index.html"),
  ];
  for (const filePath of possiblePaths) {
    try {
      await fs.access(filePath);
      const fileUrl = url.pathToFileURL(filePath).href;
      log(LogLevel.INFO, `Production build found at ${filePath}`);
      return fileUrl;
    } catch {
      /* continue */
    }
  }
  throw new Error(
    `No production build found. Checked: ${possiblePaths.join(", ")}`,
  );
}

// ===================== CREATE MAIN WINDOW =====================
async function createMainWindow() {
  log(LogLevel.INFO, "Creating main window...");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    frame: true,
    titleBarStyle: "default",
    // @ts-ignore
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setTitle(`${APP_CONFIG.appName} v${APP_CONFIG.version}`);

  // ---------- Ready-to-show + renderer-ready handshake ----------
  let isSplashClosed = false;
  const closeSplashAndShowMain = () => {
    if (isSplashClosed) return;
    isSplashClosed = true;
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
      log(LogLevel.SUCCESS, "Main window shown after renderer ready");
    }
  };

  mainWindow.once("ready-to-show", () => {
    log(
      LogLevel.INFO,
      "Main window ready-to-show, waiting for renderer-ready...",
    );
    const timeout = setTimeout(() => {
      log(LogLevel.WARN, "Renderer-ready timeout – closing splash anyway");
      closeSplashAndShowMain();
    }, 8000);

    ipcMain.once("app:renderer-ready", (event) => {
      // @ts-ignore
      if (event.sender === mainWindow.webContents) {
        log(LogLevel.INFO, "Received renderer-ready signal");
        clearTimeout(timeout);
        closeSplashAndShowMain();
      }
    });
  });

  const appUrl = await getAppUrl();
  await mainWindow.loadURL(appUrl);

  if (APP_CONFIG.isDev) mainWindow.webContents.openDevTools({ mode: "detach" });

  // Forward window state events
  mainWindow.on("maximize", () =>
    // @ts-ignore
    mainWindow.webContents.send("window:maximized"),
  );
  mainWindow.on("unmaximize", () =>
    // @ts-ignore
    mainWindow.webContents.send("window:restored"),
  );
  mainWindow.on("minimize", () =>
    // @ts-ignore
    mainWindow.webContents.send("window:minimized"),
  );
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Initialize Twitch services
  initChatService(mainWindow);
  initStreamMonitor(mainWindow);
  startStreamMonitor(60); // check every 60s

  // ===================== ATTACH UPDATER (important for auto-updates) =====================
  try {
    const updaterModule = require("./ipc/utils/updater/index.ipc.js");
    updaterModule.setMainWindow(mainWindow);
    log(LogLevel.INFO, "Updater handler attached to main window");
  } catch (e) {
    log(
      LogLevel.WARN,
      "Failed to attach updater module. Auto-updates may not work.",
      // @ts-ignore
      e,
    );
  }

  return mainWindow;
}

// ===================== ERROR PAGE =====================
// @ts-ignore
function showErrorPage(window, title, message, details = "") {
  const errorHTML = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${title}</title>
    <style>
      body { font-family: sans-serif; background: #0e0e10; color: #efeff1; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
      .container { max-width: 600px; background: #1f1f23; padding: 2rem; border-radius: 1rem; }
      button { background: #9146ff; border: none; padding: 0.5rem 1rem; margin: 0.5rem; border-radius: 0.5rem; color: white; cursor: pointer; }
    </style>
    </head>
    <body>
    <div class="container">
      <h1>⚠️ ${title}</h1>
      <p>${message}</p>
      ${details ? `<pre>${details}</pre>` : ""}
      <button onclick="location.reload()">Retry</button>
      <button onclick="window.close()">Close</button>
    </div>
    </body>
    </html>
  `;
  window.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`,
  );
}

// ===================== IPC HANDLERS (MODULAR) =====================
function registerIpcHandlers() {
  log(LogLevel.INFO, "Registering IPC handlers...");

  // Window controls
  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  ipcMain.on("window:maximize", () =>
    // @ts-ignore
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(),
  );
  ipcMain.on("window:close", () => mainWindow?.close());
  ipcMain.handle("window:getState", () => ({
    isMaximized: mainWindow?.isMaximized() || false,
    isMinimized: mainWindow?.isMinimized() || false,
  }));

  // App info
  ipcMain.handle("app:get-info", () => ({
    name: APP_CONFIG.appName,
    version: APP_CONFIG.version,
    isDev: APP_CONFIG.isDev,
    platform: process.platform,
  }));

  // Twitch‑specific handlers (your existing modular files)
  registerAuthHandlers();
  registerTwitchHandlers();
  registerChatHandlers();
  registerSettingsHandlers();

  log(LogLevel.SUCCESS, "All IPC handlers registered");
}

// ===================== STARTUP SEQUENCE =====================
async function startupSequence() {
  try {
    log(
      LogLevel.INFO,
      `🚀 Starting ${APP_CONFIG.appName} v${APP_CONFIG.version}`,
    );
    setupGlobalErrorHandlers();

    await createSplashWindow();
    registerIpcHandlers();
    await createMainWindow();

    log(LogLevel.SUCCESS, "✅ App started successfully");
  } catch (error) {
    // @ts-ignore
    log(LogLevel.ERROR, "Startup failed", error, true);
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();

    const errorWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
    });
    showErrorPage(
      errorWindow,
      "Startup Failed",
      "The application could not start.",
      // @ts-ignore
      error.message,
    );
    errorWindow.show();
  }
}

// ===================== APP EVENT HANDLERS =====================
app.whenReady().then(startupSequence);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) startupSequence();
});

app.on("before-quit", () => {
  log(LogLevel.INFO, "Shutting down...");
  if (mainWindow) mainWindow.removeAllListeners();
  stopStreamMonitor?.();
});
