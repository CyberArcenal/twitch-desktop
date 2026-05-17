// Twitch API - wrapper for Helix API calls

export interface FollowedChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  followed_at: string;
}

export interface Stream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
  type: string;
}

export interface ChannelInfo {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  game_id: string;
  game_name: string;
  title: string;
  delay: number;
}

export interface SearchChannel {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  offline_image_url: string;
  is_live: boolean;
}

class TwitchAPI {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<any> {
    try {
      if (!window.electronAPI?.getTwitchUser) {
        throw new Error("Electron API (twitch) not available");
      }
      return await window.electronAPI.getTwitchUser();
    } catch (error: any) {
      throw new Error(error.message || "Failed to get current user");
    }
  }

  /**
   * Get list of channels followed by a user
   * @param userId - Twitch user ID
   * @param after - Pagination cursor (optional)
   */
  async getFollowedChannels(
    userId: string,
    after?: string,
  ): Promise<{ data: FollowedChannel[]; pagination?: { cursor: string } }> {
    try {
      if (!window.electronAPI?.getFollowedChannels) {
        throw new Error("Electron API (twitch) not available");
      }
      return await window.electronAPI.getFollowedChannels(userId, after);
    } catch (error: any) {
      throw new Error(error.message || "Failed to get followed channels");
    }
  }

  /**
   * Get stream information for multiple user IDs
   * @param userIds - Array of Twitch user IDs
   */
  async getStreams(userIds: string[]): Promise<{ data: Stream[] }> {
    try {
      if (!window.electronAPI?.getStreams) {
        throw new Error("Electron API (twitch) not available");
      }
      return await window.electronAPI.getStreams(userIds);
    } catch (error: any) {
      throw new Error(error.message || "Failed to get streams");
    }
  }

  /**
   * Search for channels by name
   * @param query - Search term
   */
  async searchChannels(query: string): Promise<{ data: SearchChannel[] }> {
    try {
      if (!window.electronAPI?.searchChannels) {
        throw new Error("Electron API (twitch) not available");
      }
      return await window.electronAPI.searchChannels(query);
    } catch (error: any) {
      throw new Error(error.message || "Failed to search channels");
    }
  }

  /**
   * Get channel information (title, game, etc.)
   * @param broadcasterId - Twitch broadcaster ID
   */
  async getChannelInfo(
    broadcasterId: string,
  ): Promise<{ data: ChannelInfo[] }> {
    try {
      if (!window.electronAPI?.getChannelInfo) {
        throw new Error("Electron API (twitch) not available");
      }
      return await window.electronAPI.getChannelInfo(broadcasterId);
    } catch (error: any) {
      throw new Error(error.message || "Failed to get channel info");
    }
  }

  /**
   * Get followers count for a broadcaster
   * @param broadcasterId - Twitch user ID
   */
  async getUserFollowers(
    broadcasterId: string,
  ): Promise<{ total: number; data: any[] }> {
    try {
      if (!window.electronAPI?.getUserFollowers) {
        // Fallback: try to fetch via direct API if needed (but ideally implement in preload)
        console.warn("getUserFollowers not available in electronAPI");
        return { total: 0, data: [] };
      }
      return await window.electronAPI.getUserFollowers(broadcasterId);
    } catch (error: any) {
      throw new Error(error.message || "Failed to get followers");
    }
  }
}

const twitchAPI = new TwitchAPI();
export default twitchAPI;
