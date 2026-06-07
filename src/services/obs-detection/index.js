const { logger } = require('../../utils/logger');
const WebSocket = require('ws');

class OBSDetectionService {
  async isOBSRunning() {
    return new Promise((resolve) => {
      const ws = new WebSocket('ws://localhost:4455');
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 1000);
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      });
      ws.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }
}

const obsDetectionService = new OBSDetectionService();

module.exports = { obsDetectionService, OBSDetectionService };