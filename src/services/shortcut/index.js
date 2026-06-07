// src/main/services/shortcut.js
//@ts-check
const { globalShortcut, BrowserWindow } = require('electron');
const { logger } = require('../../utils/logger');

class ShortcutService {
  constructor() {
    this.registeredShortcuts = new Map(); // accelerator -> action
    this.mainWindow = null;
  }

  /**
   * @param {any} mainWindow
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    console.log('[ShortcutService] Initialized');
  }

  /**
   * @param {string} channel
   * @param {undefined} [data]
   */
  _sendToRenderers(channel, data) {
    try {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send(channel, data);
        }
      });
    } catch (error) {
      // If running outside Electron (e.g., tests), ignore
      logger.warn(
        "Failed to send IPC event (maybe not in Electron):",
        // @ts-ignore
        error.message,
      );
    }
  }

  /**
   * @param {any} action
   */
  _executeAction(action) {
    switch (action) {
      case 'playpause':
        this._sendToRenderers('shortcut:playpause');
        break;
      case 'play':
        this._sendToRenderers('shortcut:play');
        break;
      case 'pause':
        this._sendToRenderers('shortcut:pause');
        break;
      case 'nextChannel':
        this._sendToRenderers('shortcut:nextChannel');
        break;
      case 'previousChannel':
        this._sendToRenderers('shortcut:previousChannel');
        break;
      case 'mute':
        this._sendToRenderers('shortcut:mute');
        break;
      case 'volumeUp':
        this._sendToRenderers('shortcut:volumeUp');
        break;
      case 'volumeDown':
        this._sendToRenderers('shortcut:volumeDown');
        break;
      case 'fullscreen':
        this._sendToRenderers('shortcut:fullscreen');
        break;
      case 'closePlayer':
        this._sendToRenderers('shortcut:closePlayer');
        break;
      default:
        console.warn(`[ShortcutService] Unknown action: ${action}`);
    }
  }

  /**
   * Register shortcuts
   * @param {Object} shortcuts - Map of accelerator to action name
   */
  registerShortcuts(shortcuts) {
    for (const [accelerator, action] of Object.entries(shortcuts)) {
      if (globalShortcut.isRegistered(accelerator)) {
        globalShortcut.unregister(accelerator);
      }
      const success = globalShortcut.register(accelerator, () => {
        this._executeAction(action);
      });
      if (success) {
        this.registeredShortcuts.set(accelerator, action);
        console.log(`[ShortcutService] Registered: ${accelerator} -> ${action}`);
      } else {
        console.warn(`[ShortcutService] Failed to register: ${accelerator}`);
      }
    }
  }

  unregisterAll() {
    globalShortcut.unregisterAll();
    this.registeredShortcuts.clear();
    console.log('[ShortcutService] Unregistered all shortcuts');
  }

  /**
   * @param {any} accelerators
   */
  unregister(accelerators) {
    const accList = Array.isArray(accelerators) ? accelerators : [accelerators];
    for (const acc of accList) {
      if (globalShortcut.isRegistered(acc)) {
        globalShortcut.unregister(acc);
        this.registeredShortcuts.delete(acc);
      }
    }
  }

  /**
   * @param {string} accelerator
   */
  isRegistered(accelerator) {
    return globalShortcut.isRegistered(accelerator);
  }
}

const shortcutService = new ShortcutService();
module.exports = { shortcutService, ShortcutService };