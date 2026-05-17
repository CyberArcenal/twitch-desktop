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
  IS_DEV,
  API_BASE,
} = require("../shared/config");

/**
 * @type {string | number | NodeJS.Timeout | null | undefined}
 */
let refreshTimer = null;

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * @param {crypto.BinaryLike} verifier
 */
function generateCodeChallenge(verifier) {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return hash.toString("base64url");
}

/**
 * @param {string} code
 * @param {string} codeVerifier
 */
async function exchangeCodeForTokens(code, codeVerifier) {
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
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
  if (!response.ok) throw new Error(data.message || "Token exchange failed");
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * @param {string} refreshToken
 */
async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Token refresh failed");
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * @param {string} token
 */
async function revokeToken(token) {
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("token", token);
  await fetch(REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  }).catch(() => {});
}

/**
 * @param {number} expiresInSeconds
 */
function scheduleTokenRefresh(expiresInSeconds) {
  if (refreshTimer) clearTimeout(refreshTimer);
  const refreshMs = (expiresInSeconds - 300) * 1000;
  if (refreshMs <= 0) return;
  refreshTimer = setTimeout(async () => {
    try {
      const storedRefreshToken = settingsService.get("twitch").refreshToken;
      if (storedRefreshToken) {
        const { accessToken, refreshToken, expiresIn } =
          await refreshAccessToken(storedRefreshToken);
        settingsService.setTwitchTokens(
          accessToken,
          refreshToken,
          settingsService.get("twitch").userId,
          settingsService.get("twitch").login,
        );
        console.log("[Auth] Token refreshed successfully");
        scheduleTokenRefresh(expiresIn);
      }
    } catch (err) {
      console.error("[Auth] Token refresh failed:", err);
      // Force logout without circular reference
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = null;
      settingsService.clearTwitchTokens();
    }
  }, refreshMs);
}

const twitchAuthService = {
  async login() {
    if (IS_DEV) {
      // Mock login
      const fakeUser = {
        id: "123456789",
        login: "testuser",
        accessToken: "fake_token",
      };
      settingsService.setTwitchTokens(
        "fake_token",
        "fake_refresh",
        fakeUser.id,
        fakeUser.login,
      );
      return fakeUser;
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      // @ts-ignore
      parent: null,
      modal: true,
      webPreferences: { nodeIntegration: false },
    });

    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPES}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    await authWindow.loadURL(authUrl);

    return new Promise((resolve, reject) => {
      const handleRedirect = async (
        /** @type {any} */ _,
        /** @type {string | URL} */ url,
      ) => {
        // @ts-ignore
        if (url.startsWith(REDIRECT_URI)) {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get("code");
          if (code) {
            authWindow.close();
            try {
              const { accessToken, refreshToken, expiresIn } =
                await exchangeCodeForTokens(code, codeVerifier);
              const user = await twitchAuthService.getUserInfo(accessToken);
              settingsService.setTwitchTokens(
                accessToken,
                refreshToken,
                user.id,
                user.login,
              );
              scheduleTokenRefresh(expiresIn);
              resolve({ accessToken, userId: user.id, login: user.login });
            } catch (err) {
              reject(err);
            }
          } else {
            const error = urlObj.searchParams.get("error");
            reject(new Error(error || "Authorization failed"));
          }
        }
      };
      authWindow.webContents.on("will-redirect", handleRedirect);
      authWindow.webContents.on("did-navigate", handleRedirect);
      authWindow.on("closed", () => reject(new Error("Auth window closed")));
    });
  },

  /**
   * @param {any} accessToken
   */
  async getUserInfo(accessToken) {
    const url = `${API_BASE}/users`;
    const headers = {};
    if (!IS_DEV) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      headers["Client-Id"] = CLIENT_ID;
    }
    const response = await fetch(url, { headers });
    const data = await response.json();
    if (!data.data || data.data.length === 0) throw new Error("No user data");
    return data.data[0];
  },

  getAccessToken() {
    return settingsService.get("twitch").accessToken;
  },

  getRefreshToken() {
    return settingsService.get("twitch").refreshToken;
  },

  isLoggedIn() {
    return !!this.getAccessToken();
  },

  async refreshTokenIfNeeded() {
    const refresh = this.getRefreshToken();
    if (!refresh) return false;
    try {
      const { accessToken, refreshToken, expiresIn } =
        await refreshAccessToken(refresh);
      settingsService.setTwitchTokens(
        accessToken,
        refreshToken,
        settingsService.get("twitch").userId,
        settingsService.get("twitch").login,
      );
      scheduleTokenRefresh(expiresIn);
      return true;
    } catch (err) {
      console.error("[Auth] Manual refresh failed:", err);
      return false;
    }
  },

  async logout() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (accessToken) await revokeToken(accessToken);
    if (refreshToken) await revokeToken(refreshToken);
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    settingsService.clearTwitchTokens();
  },
};

module.exports = { twitchAuthService };
