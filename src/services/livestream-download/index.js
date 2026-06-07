const { spawn } = require('child_process');
const { dialog } = require('electron');
const path = require('path');
const { sendToRenderers } = require('../../utils/ipc-sender');
const { logger } = require('../../utils/logger');

class LivestreamDownloadService {
  constructor() {
    this.downloadProcess = null;
    this.currentDownload = null;
  }

  async selectOutputFolder() {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select folder to save VOD'
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  }

  async downloadVod(vodUrl, options = {}) {
    if (this.downloadProcess) throw new Error('Download already in progress');

    let outputDir = options.outputDir;
    if (!outputDir) {
      outputDir = await this.selectOutputFolder();
      if (!outputDir) return false;
    }

    const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s');

    this.downloadProcess = spawn('yt-dlp', [
      '-o', outputTemplate,
      '--progress',
      '--newline',
      vodUrl
    ]);

    this.currentDownload = { url: vodUrl, outputDir, startTime: Date.now() };

    this.downloadProcess.stdout.on('data', (data) => {
      const text = data.toString();
      const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);
      if (percentMatch) {
        const percent = parseFloat(percentMatch[1]);
        sendToRenderers('download:progress', { percent, text });
      } else {
        sendToRenderers('download:info', { text });
      }
    });

    this.downloadProcess.stderr.on('data', (data) => {
      logger.error(`[yt-dlp stderr] ${data}`);
      sendToRenderers('download:error', { message: data.toString() });
    });

    this.downloadProcess.on('close', (code) => {
      this.downloadProcess = null;
      if (code === 0) {
        sendToRenderers('download:complete', { url: vodUrl, outputDir });
      } else {
        sendToRenderers('download:error', { message: `Process exited with code ${code}` });
      }
      this.currentDownload = null;
    });
  }

  cancelDownload() {
    if (this.downloadProcess) {
      this.downloadProcess.kill();
      this.downloadProcess = null;
      this.currentDownload = null;
      sendToRenderers('download:cancelled', {});
    }
  }
}

const downloadService = new LivestreamDownloadService();
module.exports = { downloadService, LivestreamDownloadService };