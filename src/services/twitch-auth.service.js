// src/main/services/twitch-auth.service.js
//@ts-check
const { BrowserWindow } = require("electron");
const { settingsService } = require("./settings.service");
const crypto = require("crypto");
const {
  CLIENT_ID,
  REDIRECT_URI,
  SCOPES,
  TOKEN_URL,
  REVOKE_URL,
  API_BASE,
  CLIENT_SECRET,
} = require("../shared/config"); // <-- added logger
const { logger } = require("../utils/logger");

class TwitchAuthService {
  constructor() {
    this.refreshTimer = null;
    logger.debug("[TwitchAuthService] Constructor called");
  }

  generateCodeVerifier() {
    const verifier = crypto.randomBytes(32).toString("base64url");
    // @ts-ignore
    logger.debug("[Auth] Generated code verifier (length)", verifier.length);
    return verifier;
  }

  // @ts-ignore
  generateCodeChallenge(verifier) {
    const hash = crypto.createHash("sha256").update(verifier).digest();
    const challenge = hash.toString("base64url");
    logger.debug("[Auth] Generated code challenge");
    return challenge;
  }

  // @ts-ignore
  async exchangeCodeForTokens(code, codeVerifier) {
    logger.info("[Auth] Exchanging code for tokens");
    const params = new URLSearchParams();
    // @ts-ignore
    params.append("client_id", CLIENT_ID);
    if (CLIENT_SECRET) params.append("client_secret", CLIENT_SECRET);
    params.append("code", code);
    params.append("code_verifier", codeVerifier);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", REDIRECT_URI);

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await response.json();
    if (!response.ok) {
      // @ts-ignore
      logger.error("[Auth] Token exchange failed", {
        status: response.status,
        message: data.message,
      });
      throw new Error(data.message || "Token exchange failed");
    }
    // @ts-ignore
    logger.success("[Auth] Tokens obtained successfully", {
      expiresIn: data.expires_in,
    });
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  // @ts-ignore
  async refreshAccessToken(refreshToken) {
    logger.info("[Auth] Refreshing access token");
    const params = new URLSearchParams();
    // @ts-ignore
    params.append("client_id", CLIENT_ID);
    if (CLIENT_SECRET) params.append("client_secret", CLIENT_SECRET);
    params.append("refresh_token", refreshToken);
    params.append("grant_type", "refresh_token");

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await response.json();
    if (!response.ok) {
      // @ts-ignore
      logger.error("[Auth] Token refresh failed", {
        status: response.status,
        message: data.message,
      });
      throw new Error(data.message || "Token refresh failed");
    }
    // @ts-ignore
    logger.success("[Auth] Token refreshed", { expiresIn: data.expires_in });
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  // @ts-ignore
  async revokeToken(token) {
    logger.info("[Auth] Revoking token");
    const params = new URLSearchParams();
    // @ts-ignore
    params.append("client_id", CLIENT_ID);
    params.append("token", token);
    await fetch(REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }).catch((err) => logger.warn("[Auth] Revoke request failed", err));
    logger.debug("[Auth] Token revoke request sent");
  }

  // @ts-ignore
  scheduleTokenRefresh(expiresInSeconds) {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const refreshMs = (expiresInSeconds - 300) * 1000;
    if (refreshMs <= 0) {
      logger.warn("[Auth] Token expires too soon, skipping refresh scheduling");
      return;
    }
    logger.debug(
      `[Auth] Scheduling token refresh in ${Math.round(refreshMs / 1000)} seconds`,
    );
    this.refreshTimer = setTimeout(async () => {
      try {
        const storedRefreshToken = settingsService.get("twitch").refreshToken;
        if (storedRefreshToken) {
          logger.info("[Auth] Auto‑refreshing token...");
          const { accessToken, refreshToken, expiresIn } =
            await this.refreshAccessToken(storedRefreshToken);
          settingsService.setTwitchTokens(
            accessToken,
            refreshToken,
            settingsService.get("twitch").userId,
            settingsService.get("twitch").login,
          );
          logger.success("[Auth] Token refreshed successfully");
          this.scheduleTokenRefresh(expiresIn);
        } else {
          logger.warn("[Auth] No stored refresh token – cannot auto‑refresh");
        }
      } catch (err) {
        // @ts-ignore
        logger.error("[Auth] Auto‑refresh failed", err);
        if (this.refreshTimer) clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
        settingsService.clearTwitchTokens();
      }
    }, refreshMs);
  }

  async login() {
    logger.info("[Auth] Starting login flow");
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    const authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      modal: true,
      webPreferences: { nodeIntegration: false },
      show: true,
    });
    logger.debug("[Auth] Auth window created");

   const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPES}&code_challenge_method=S256&code_challenge=${codeChallenge}&force_verify=true&prompt=consent`;

    let resolved = false;
    let rejectFunction = null;

    const cleanup = () => {
      if (authWindow && !authWindow.isDestroyed()) authWindow.close();
      resolved = true;
    };

    return new Promise((resolve, reject) => {
      rejectFunction = reject;

      const handleNavigation = (event, url) => {
        if (url.startsWith(REDIRECT_URI)) {
          event.preventDefault();
          logger.debug("[Auth] Redirect detected", { url });
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get("code");
          if (code) {
            cleanup();
            logger.info("[Auth] Authorization code received");
            this.exchangeCodeForTokens(code, codeVerifier)
              .then(async ({ accessToken, refreshToken, expiresIn }) => {
                const user = await this.getUserInfo(accessToken);
                settingsService.setTwitchTokens(
                  accessToken,
                  refreshToken,
                  user.id,
                  user.login,
                );
                this.scheduleTokenRefresh(expiresIn);
                logger.success("[Auth] Login successful", {
                  userId: user.id,
                  login: user.login,
                });
                resolve({ accessToken, userId: user.id, login: user.login });
              })
              .catch((err) => {
                logger.error("[Auth] Login failed after exchange", err);
                reject(err);
              });
          } else {
            const error = urlObj.searchParams.get("error");
            logger.error("[Auth] No code in redirect", { error });
            reject(new Error(error || "Authorization failed"));
          }
        }
      };

      authWindow.webContents.on("will-navigate", handleNavigation);
      authWindow.webContents.on("will-redirect", handleNavigation);
      authWindow.webContents.on(
        "did-fail-load",
        (event, errorCode, errorDesc, validatedURL) => {
          if (validatedURL && validatedURL.startsWith(REDIRECT_URI)) {
            event.preventDefault();
            // Redirect already handled, ignore error
          } else if (validatedURL === authUrl && !resolved) {
            logger.error("[Auth] Failed to load auth URL", {
              errorCode,
              errorDesc,
            });
            reject(new Error(`Failed to load Twitch auth page: ${errorDesc}`));
          }
        },
      );
      authWindow.on("closed", () => {
        if (!resolved && rejectFunction) {
          logger.warn("[Auth] Auth window closed by user");
          rejectFunction(new Error("Auth window closed"));
        }
      });

      // Load the URL – ignore rejection if already resolved/rejected
      authWindow.loadURL(authUrl).catch((err) => {
        if (!resolved) {
          logger.error("[Auth] loadURL failed", err);
          reject(err);
        }
      });
    });
  }

  // @ts-ignore
  async getUserInfo(accessToken) {
    logger.debug("[Auth] Fetching user info");
    const url = `${API_BASE}/users`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": CLIENT_ID,
    };
    // @ts-ignore
    const response = await fetch(url, { headers });
    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      logger.error("[Auth] No user data received", data);
      throw new Error("No user data");
    }
    // @ts-ignore
    logger.debug("[Auth] User info fetched", {
      id: data.data[0].id,
      login: data.data[0].login,
    });
    return data.data[0];
  }

  getAccessToken() {
    const token = settingsService.get("twitch").accessToken;
    // @ts-ignore
    logger.debug("[Auth] getAccessToken called", { hasToken: !!token });
    return token;
  }

  getRefreshToken() {
    const token = settingsService.get("twitch").refreshToken;
    // @ts-ignore
    logger.debug("[Auth] getRefreshToken called", { hasToken: !!token });
    return token;
  }

  isLoggedIn() {
    const logged = !!this.getAccessToken();
    logger.debug(`[Auth] isLoggedIn = ${logged}`);
    return logged;
  }

  async refreshTokenIfNeeded() {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      logger.debug("[Auth] No refresh token – cannot refresh");
      return false;
    }
    logger.info("[Auth] Manually refreshing token");
    try {
      const { accessToken, refreshToken, expiresIn } =
        await this.refreshAccessToken(refresh);
      settingsService.setTwitchTokens(
        accessToken,
        refreshToken,
        settingsService.get("twitch").userId,
        settingsService.get("twitch").login,
      );
      this.scheduleTokenRefresh(expiresIn);
      logger.success("[Auth] Manual refresh succeeded");
      return true;
    } catch (err) {
      // @ts-ignore
      logger.error("[Auth] Manual refresh failed – clearing tokens", err);
      await this.logout();
      const { BrowserWindow } = require("electron");
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) win.webContents.send("auth:invalid", {});
      });
      return false;
    }
  }

  async logout() {
    logger.info("[Auth] Logging out – revoking tokens");
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (accessToken) await this.revokeToken(accessToken);
    if (refreshToken) await this.revokeToken(refreshToken);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    settingsService.clearTwitchTokens();
    logger.success("[Auth] Logout completed");
  }
}

const twitchAuthService = new TwitchAuthService();
module.exports = { twitchAuthService, TwitchAuthService };
