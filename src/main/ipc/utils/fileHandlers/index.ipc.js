// electron-app/main/ipc/handlers/fileHandler.js
// @ts-check
const { ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");

class FileHandler {
  constructor() {
    // Initialize IPC handlers
    this._registerHandlers();
  }

  /**
   * Register all IPC handlers
   */
  _registerHandlers() {
    // Open file in default application
    // @ts-ignore
    ipcMain.handle("openFile", async (event, filePath) => {
      return await this.openFile(filePath);
    });

    // Show file in folder (explorer/finder)
    // @ts-ignore
    ipcMain.handle("showItemInFolder", async (event, filePath) => {
      return await this.showItemInFolder(filePath);
    });

    // Get file information
    // @ts-ignore
    ipcMain.handle("getFileInfo", async (event, filePath) => {
      return await this.getFileInfo(filePath);
    });

    // Check if file exists
    // @ts-ignore
    ipcMain.handle("fileExists", async (event, filePath) => {
      return await this.fileExists(filePath);
    });

    // Open directory in file explorer
    // @ts-ignore
    ipcMain.handle("openDirectory", async (event, dirPath) => {
      return await this.openDirectory(dirPath);
    });
  }

  /**
   * Open file in default application
   * @param {string} filePath Full path to the file
   */
  async openFile(filePath) {
    try {
      // Validate file path
      if (!filePath || typeof filePath !== "string") {
        throw new Error("Invalid file path");
      }

      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Open file with default application
      await shell.openPath(filePath);

      return {
        status: true,
        message: `File opened successfully: ${path.basename(filePath)}`,
        data: { filePath },
      };
    } catch (error) {
      console.error("Failed to open file:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to open file: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Show file in file explorer (Windows/Mac/Linux)
   * @param {string} filePath Full path to the file
   */
  async showItemInFolder(filePath) {
    try {
      // Validate file path
      if (!filePath || typeof filePath !== "string") {
        throw new Error("Invalid file path");
      }

      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Show file in folder
      shell.showItemInFolder(filePath);

      return {
        status: true,
        message: `File location shown: ${path.basename(filePath)}`,
        data: { filePath },
      };
    } catch (error) {
      console.error("Failed to show file in folder:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to show file in folder: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Open directory in file explorer
   * @param {string} dirPath Directory path
   */
  async openDirectory(dirPath) {
    try {
      // Validate directory path
      if (!dirPath || typeof dirPath !== "string") {
        throw new Error("Invalid directory path");
      }

      // Check if directory exists
      const exists = await this.directoryExists(dirPath);
      if (!exists) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      // Open directory in file explorer
      shell.openPath(dirPath);

      return {
        status: true,
        message: `Directory opened: ${path.basename(dirPath)}`,
        data: { dirPath },
      };
    } catch (error) {
      console.error("Failed to open directory:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to open directory: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Get file information
   * @param {string} filePath Full path to the file
   */
  async getFileInfo(filePath) {
    try {
      // Validate file path
      if (!filePath || typeof filePath !== "string") {
        throw new Error("Invalid file path");
      }

      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();

      // Determine file type based on extension
      const fileTypes = {
        ".csv": "CSV Document",
        ".xlsx": "Excel Spreadsheet",
        ".xls": "Excel Spreadsheet",
        ".pdf": "PDF Document",
        ".txt": "Text File",
        ".json": "JSON File",
        ".xml": "XML File",
      };

      // @ts-ignore
      const fileType = fileTypes[ext] || "Unknown File Type";

      return {
        status: true,
        message: "File information retrieved",
        data: {
          filename: path.basename(filePath),
          filePath: filePath,
          fileSize: this._formatFileSize(stats.size),
          created: stats.birthtime,
          modified: stats.mtime,
          accessed: stats.atime,
          isDirectory: stats.isDirectory(),
          extension: ext,
          fileType: fileType,
          mimeType: this._getMimeType(ext),
        },
      };
    } catch (error) {
      console.error("Failed to get file info:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to get file information: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath Full path to the file
   */
  async fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      console.error("Error checking file existence:", error);
      return false;
    }
  }

  /**
   * Check if directory exists
   * @param {string} dirPath Directory path
   */
  async directoryExists(dirPath) {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch (error) {
      console.error("Error checking directory existence:", error);
      return false;
    }
  }

  /**
   * Format file size
   * @param {number} bytes
   * @private
   */
  _formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Get MIME type from extension
   * @param {string} extension
   * @private
   */
  _getMimeType(extension) {
    const mimeTypes = {
      ".csv": "text/csv",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".xls": "application/vnd.ms-excel",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".json": "application/json",
      ".xml": "application/xml",
      ".html": "text/html",
      ".htm": "text/html",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    // @ts-ignore
    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
  }

  /**
   * Get all files in a directory
   * @param {string} dirPath Directory path
   * @param {string[]} extensions Optional filter by extensions
   */
  async getFilesInDirectory(dirPath, extensions = []) {
    try {
      // Validate directory path
      if (!dirPath || typeof dirPath !== "string") {
        throw new Error("Invalid directory path");
      }

      // Check if directory exists
      const exists = await this.directoryExists(dirPath);
      if (!exists) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      // Read directory
      const files = fs.readdirSync(dirPath);
      const fileList = [];

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        // Skip directories
        if (stats.isDirectory()) {
          continue;
        }

        const ext = path.extname(file).toLowerCase();

        // Filter by extensions if provided
        if (extensions.length > 0 && !extensions.includes(ext)) {
          continue;
        }

        fileList.push({
          name: file,
          path: filePath,
          size: this._formatFileSize(stats.size),
          modified: stats.mtime,
          extension: ext,
        });
      }

      // Sort by modified date (newest first)
      // @ts-ignore
      fileList.sort((a, b) => b.modified - a.modified);

      return {
        status: true,
        message: `Found ${fileList.length} file(s)`,
        data: fileList,
      };
    } catch (error) {
      console.error("Failed to get files in directory:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to get files in directory: ${error.message}`,
        data: [],
      };
    }
  }

  /**
   * Get recent export files
   * @param {string} exportDir Export directory path
   * @param {number} limit Maximum number of files to return
   */
  async getRecentExports(exportDir, limit = 10) {
    try {
      const result = await this.getFilesInDirectory(exportDir, [
        ".csv",
        ".xlsx",
        ".pdf",
      ]);

      if (result.status) {
        // Limit the results
        result.data = result.data.slice(0, limit);
      }

      return result;
    } catch (error) {
      console.error("Failed to get recent exports:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to get recent exports: ${error.message}`,
        data: [],
      };
    }
  }

  /**
   * Delete file
   * @param {string} filePath Full path to the file
   */
  async deleteFile(filePath) {
    try {
      // Validate file path
      if (!filePath || typeof filePath !== "string") {
        throw new Error("Invalid file path");
      }

      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Delete file
      fs.unlinkSync(filePath);

      return {
        status: true,
        message: `File deleted: ${path.basename(filePath)}`,
        data: { filePath },
      };
    } catch (error) {
      console.error("Failed to delete file:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to delete file: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Copy file to clipboard
   * @param {string} filePath Full path to the file
   */
  async copyFileToClipboard(filePath) {
    try {
      // Validate file path
      if (!filePath || typeof filePath !== "string") {
        throw new Error("Invalid file path");
      }

      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Copy file to clipboard (as file reference)
      // Note: This copies the file path, not the file contents
      // For actual file copying, you might need a different approach
      const clipboard = require("electron").clipboard;
      clipboard.writeText(filePath);

      return {
        status: true,
        message: `File path copied to clipboard: ${path.basename(filePath)}`,
        data: { filePath },
      };
    } catch (error) {
      console.error("Failed to copy file to clipboard:", error);
      return {
        status: false,
        // @ts-ignore
        message: `Failed to copy file to clipboard: ${error.message}`,
        data: null,
      };
    }
  }
}

// Create and export handler instance
const fileHandler = new FileHandler();

// Export for use in other modules
module.exports = { FileHandler, fileHandler };
