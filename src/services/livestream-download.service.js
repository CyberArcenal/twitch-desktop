// src/main/services/livestream-download.service.js
//@ts-check
const { spawn } = require('child_process');
const { BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

class LivestreamDownloadService {
  constructor() {
    this.downloadProcess = null;
    this.currentDownload = null;
  }

  /**
   * @param {string} channel
   * @param {{ percent?: number; text?: any; message?: any; url?: any; outputDir?: any; }} data
   */
  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn('[DownloadService] send error:', err);
    }
  }

  async selectOutputFolder() {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select folder to save VOD'
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  }

  /**
   * @param {string} vodUrl
   */
  async downloadVod(vodUrl, options = {}) {
    if (this.downloadProcess) {
      throw new Error('Download already in progress');
    }

    // @ts-ignore
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

    let lastProgress = '';
    this.downloadProcess.stdout.on('data', (data) => {
      const text = data.toString();
      // Parse progress [download] ...%
      const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);
      if (percentMatch) {
        const percent = parseFloat(percentMatch[1]);
        this._sendToRenderers('download:progress', { percent, text });
      } else {
        // Other info
        this._sendToRenderers('download:info', { text });
      }
    });

    this.downloadProcess.stderr.on('data', (data) => {
      console.error(`[yt-dlp stderr] ${data}`);
      this._sendToRenderers('download:error', { message: data.toString() });
    });

    this.downloadProcess.on('close', (code) => {
      this.downloadProcess = null;
      if (code === 0) {
        this._sendToRenderers('download:complete', { url: vodUrl, outputDir });
      } else {
        this._sendToRenderers('download:error', { message: `Process exited with code ${code}` });
      }
      this.currentDownload = null;
    });
  }

  cancelDownload() {
    if (this.downloadProcess) {
      this.downloadProcess.kill();
      this.downloadProcess = null;
      this.currentDownload = null;
      this._sendToRenderers('download:cancelled', {});
    }
  }
}

const downloadService = new LivestreamDownloadService();
module.exports = { downloadService, LivestreamDownloadService };