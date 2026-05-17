// src/renderer/api/chat.ts
// Chat API - wrapper for Twitch chat (IRC)

export interface ChatMessage {
  channel: string;
  user: string;
  message: string;
  badges?: Record<string, string>;
  emotes?: Record<string, string[]>;
  timestamp: string;
}

export interface ChatConnectionData {
  channel: string;
}

class ChatAPI {
  private messageHandler: ((data: ChatMessage) => void) | null = null;
  private connectedHandler: ((data: ChatConnectionData) => void) | null = null;
  private userJoinedHandler: ((data: { channel: string; user: string }) => void) | null = null;

  // Cleanup functions returned by preload event listeners
  private messageCleanup: (() => void) | null = null;
  private connectedCleanup: (() => void) | null = null;
  private userJoinedCleanup: (() => void) | null = null;

  /**
   * Connect to a Twitch channel's chat
   * @param channel - Channel name (without #)
   */
  async connect(channel: string): Promise<void> {
    try {
      if (!window.electronAPI?.connectChat) {
        throw new Error("Electron API (chat) not available");
      }
      await window.electronAPI.connectChat(channel);
    } catch (error: any) {
      throw new Error(error.message || "Failed to connect to chat");
    }
  }

  /**
   * Send a message to the currently connected channel
   * @param message - Message text
   */
  async sendMessage(message: string): Promise<void> {
    try {
      if (!window.electronAPI?.sendChatMessage) {
        throw new Error("Electron API (chat) not available");
      }
      await window.electronAPI.sendChatMessage(message);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send message");
    }
  }

  /**
   * Disconnect from current chat
   */
  async disconnect(): Promise<void> {
    try {
      if (!window.electronAPI?.disconnectChat) {
        throw new Error("Electron API (chat) not available");
      }
      await window.electronAPI.disconnectChat();
      this.removeAllListeners();
    } catch (error: any) {
      throw new Error(error.message || "Failed to disconnect chat");
    }
  }

  /**
   * Register callback for incoming chat messages
   * @param callback - Function to handle messages
   * @returns Cleanup function
   */
  onMessage(callback: (data: ChatMessage) => void): () => void {
    // Remove previous listener if any
    if (this.messageCleanup) {
      this.messageCleanup();
      this.messageCleanup = null;
    }
    this.messageHandler = callback;
    if (window.electronAPI?.onChatMessage) {
      this.messageCleanup = window.electronAPI.onChatMessage((data: ChatMessage) => {
        if (this.messageHandler) this.messageHandler(data);
      });
      return this.messageCleanup;
    }
    return () => {};
  }

  /**
   * Register callback for successful chat connection
   * @param callback - Function to handle connection event
   * @returns Cleanup function
   */
  onConnected(callback: (data: ChatConnectionData) => void): () => void {
    if (this.connectedCleanup) {
      this.connectedCleanup();
      this.connectedCleanup = null;
    }
    this.connectedHandler = callback;
    if (window.electronAPI?.onChatConnected) {
      this.connectedCleanup = window.electronAPI.onChatConnected((data: ChatConnectionData) => {
        if (this.connectedHandler) this.connectedHandler(data);
      });
      return this.connectedCleanup;
    }
    return () => {};
  }

  /**
   * Register callback for user join events
   * @param callback - Function to handle user joins
   * @returns Cleanup function
   */
  onUserJoined(callback: (data: { channel: string; user: string }) => void): () => void {
    if (this.userJoinedCleanup) {
      this.userJoinedCleanup();
      this.userJoinedCleanup = null;
    }
    this.userJoinedHandler = callback;
    if (window.electronAPI?.onUserJoined) {
      this.userJoinedCleanup = window.electronAPI.onUserJoined((data: { channel: string; user: string }) => {
        if (this.userJoinedHandler) this.userJoinedHandler(data);
      });
      return this.userJoinedCleanup;
    }
    return () => {};
  }

  /**
   * Remove all internal listeners and clean up (call when component unmounts)
   */
  removeAllListeners(): void {
    if (this.messageCleanup) {
      this.messageCleanup();
      this.messageCleanup = null;
    }
    if (this.connectedCleanup) {
      this.connectedCleanup();
      this.connectedCleanup = null;
    }
    if (this.userJoinedCleanup) {
      this.userJoinedCleanup();
      this.userJoinedCleanup = null;
    }
    this.messageHandler = null;
    this.connectedHandler = null;
    this.userJoinedHandler = null;
  }
}

const chatAPI = new ChatAPI();
export default chatAPI;