// Auth API - wrapper for Twitch authentication

export interface AuthResponse {
  accessToken: string;
  userId: string;
  login: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email?: string;
  profile_image_url?: string;
}

class AuthAPI {
  /**
   * Login to Twitch via OAuth
   * @returns Promise with accessToken, userId, login
   */
  async login(): Promise<AuthResponse> {
    try {
      if (!window.electronAPI?.login) {
        throw new Error("Electron API (auth) not available");
      }
      const result = await window.electronAPI.login();
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  }

  /**
   * Logout - clear stored tokens
   */
  async logout(): Promise<void> {
    try {
      if (!window.electronAPI?.logout) {
        throw new Error("Electron API (auth) not available");
      }
      await window.electronAPI.logout();
    } catch (error: any) {
      throw new Error(error.message || "Logout failed");
    }
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      if (!window.electronAPI?.isLoggedIn) {
        return false;
      }
      return await window.electronAPI.isLoggedIn();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current logged-in user info
   */
  async getCurrentUser(): Promise<TwitchUser | null> {
    try {
      if (!window.electronAPI?.getCurrentUser) {
        throw new Error("Electron API (auth) not available");
      }
      return await window.electronAPI.getCurrentUser();
    } catch (error: any) {
      throw new Error(error.message || "Failed to get user info");
    }
  }
}

const authAPI = new AuthAPI();
export default authAPI;