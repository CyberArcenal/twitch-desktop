const path = require("path");
const fs = require("fs");
const { app } = require("electron");

// --- Determine .env file location ---
let envPath;
if (app.isPackaged) {
  // In production (packaged app), the .env file is copied to the resources folder
  envPath = path.join(process.resourcesPath, ".env");
} else {
  // In development, load from project root
  envPath = path.resolve(process.cwd(), ".env");
}

// Load .env file if it exists
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else if (!app.isPackaged) {
  console.warn("[Config] .env file not found at:", envPath);
}

// --- Configuration constants ---
const IS_DEV = process.env.NODE_ENV === "development" || !app.isPackaged;
const API_BASE = "https://api.twitch.tv/helix";

const CLIENT_ID =
  process.env.TWITCH_CLIENT_ID || process.env.VITE_TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

if (!CLIENT_ID && !IS_DEV) {
  console.error("[Config] Missing TWITCH_CLIENT_ID environment variable");
}

const REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || "http://localhost";

const SCOPES = [
  // Legacy chat (IRC)
  "chat:read",
  "chat:edit",

  // User Info
  "user:read:email",
  "user:read:follows",
  "user:edit:follows",

  // Modern Chat (Helix Chat API)
  "user:read:chat",
  "user:write:chat",
  "channel:moderate",
  "user:bot",

  // Whispers
  "user:manage:whispers",

  // Clips
  "clips:edit",
  "channel:manage:clips",

  // Channel Management
  "channel:read:subscriptions",
  "channel:manage:moderators",
  "channel:read:stream_key",
  "channel:manage:broadcast",
  "channel:manage:predictions",
  "channel:read:predictions",
  "channel:manage:raids",
  "channel:edit:commercial",
  "channel:manage:schedule",
  "channel:manage:vips",
  "channel:manage:videos",

  // Followers & Moderation
  "moderator:read:followers",
  "moderation:read",
  "moderator:manage:banned_users",
  "moderator:manage:automod",
  "moderator:manage:announcements",

  // Bits & Monetization
  "bits:read",
  "channel:read:goals",
  "channel:read:hype_train",
  "channel:read:charity",

  // Channel Points
  "channel:read:redemptions",
  "channel:manage:redemptions",
  "channel:read:polls",
  "channel:manage:polls",

  // Editors
  "channel:read:editors",

  // Blocked users
  "user:read:blocked_users",
  "user:manage:blocked_users",

  // Analytics
  "analytics:read:extensions",
  "analytics:read:games",
].join(" ");

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const REVOKE_URL = "https://id.twitch.tv/oauth2/revoke";

module.exports = {
  IS_DEV,
  API_BASE,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  SCOPES,
  TOKEN_URL,
  REVOKE_URL,
};