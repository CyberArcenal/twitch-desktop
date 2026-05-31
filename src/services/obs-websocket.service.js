// src/main/services/obs-websocket.service.js
//@ts-check
const OBSWebSocket = require('obs-websocket-js').default;
const { logger } = require('../utils/logger');
const Store = require('electron-store');

const obsStore = new Store({ name: 'obs' });

class OBSWebSocketService {
 constructor() {
    this.obs = new OBSWebSocket();
    this.connected = false;
    this.reconnectInterval = null;
    this.currentPassword = '';
  }

 async connect(host = 'localhost', port = 4455, password = null) {
  if (this.connected) return true;
  
  // Determine password: if password is null, use stored; if empty string, use empty; if provided, use that.
  let effectivePassword = password;
  if (effectivePassword === null) {
    // @ts-ignore
    effectivePassword = obsStore.get('password', '');
  }
  
  try {
    const url = `ws://${host}:${port}`;
    // @ts-ignore
    await this.obs.connect(url, effectivePassword);
    // @ts-ignore
    this.currentPassword = effectivePassword;
    this.connected = true;
    if (effectivePassword) {
      obsStore.set('password', effectivePassword);
    } else {
      // Only clear if we explicitly succeeded with empty password (means no auth required)
      obsStore.delete('password');
    }
    logger.info('[OBS] Connected to OBS WebSocket');
    this.startHeartbeat();
    return true;
  } catch (err) {
    // @ts-ignore
    logger.warn('[OBS] Connection failed:', err.message);
    this.connected = false;
    // @ts-ignore
    if (err.message && err.message.includes('authentication')) {
      // Clear stored password if it failed (might be wrong)
      if (obsStore.get('password')) {
        obsStore.delete('password');
      }
      throw new Error('AUTH_REQUIRED');
    }
    // For other errors (e.g., connection refused), throw as is
    throw err;
  }
}

startHeartbeat() {
  if (this.reconnectInterval) clearInterval(this.reconnectInterval);
  this.reconnectInterval = setInterval(async () => {
    if (!this.connected) {
      try {
        await this.connect('localhost', 4455, null);
      } catch (err) {
        // @ts-ignore
        if (err.message === 'AUTH_REQUIRED') {
          // Stop auto-reconnect, user must manually reconnect
          if (this.reconnectInterval) clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
        // Other errors: keep trying
      }
    }
  }, 5000);
}

  // @ts-ignore
  async disconnect() {
    if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    if (this.connected) {
      await this.obs.disconnect();
      this.connected = false;
      logger.info('[OBS] Disconnected');
    }
  }

  // @ts-ignore
  async updatePassword(newPassword) {
    obsStore.set('password', newPassword);
    this.currentPassword = newPassword;
    // Attempt to reconnect if currently disconnected
    if (!this.connected) {
      await this.connect('localhost', 4455, newPassword);
    }
    return true;
  }

  async clearPassword() {
    obsStore.delete('password');
    this.currentPassword = '';
  }

  // @ts-ignore
  async disconnect() {
    if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    if (this.connected) {
      await this.obs.disconnect();
      this.connected = false;
      logger.info('[OBS] Disconnected');
    }
  }

  async getScenes() {
    if (!this.connected) throw new Error('OBS not connected');
    const { scenes } = await this.obs.call('GetSceneList');
    return scenes;
  }

  async getCurrentScene() {
    if (!this.connected) throw new Error('OBS not connected');
    const { currentProgramSceneName } = await this.obs.call('GetCurrentProgramScene');
    return currentProgramSceneName;
  }

  // @ts-ignore
  async setCurrentScene(sceneName) {
    if (!this.connected) throw new Error('OBS not connected');
    await this.obs.call('SetCurrentProgramScene', { sceneName });
    logger.info(`[OBS] Switched to scene: ${sceneName}`);
    return true;
  }

  getConnectionStatus() {
    return this.connected;
  }

  async getStreamStatus() {
    if (!this.connected) throw new Error('OBS not connected');
    const status = await this.obs.call('GetStreamStatus');
    return status;
  }

  async getStats() {
    if (!this.connected) throw new Error('OBS not connected');
    const stats = await this.obs.call('GetStats');
    return stats;
  }
}

const obsWebSocketService = new OBSWebSocketService();
module.exports = { obsWebSocketService };